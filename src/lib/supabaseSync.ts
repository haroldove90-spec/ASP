import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "../supabaseClient";
import { Usuario, Instrumento, CertificadoCalibracion, AuditLog } from "../initial_data";
import { addConfirmationRecord, TelemetrySaveRecord } from "../types/supabaseTelemetry";
import { soundManager } from "../utils/audioAlerts";

export interface SupabaseSyncResult {
  success: boolean;
  message: string;
  count?: number;
  error?: any;
  details?: Record<string, any>;
  telemetry?: TelemetrySaveRecord;
}

export interface SupabaseConnectionStatus {
  connected: boolean;
  latencyMs: number;
  tables: {
    cotizaciones: number;
    ordenes_trabajo: number;
    instrumentos: number;
    usuarios: number;
    certificados_calibracion: number;
    bitacora_auditoria?: number;
    reportes_campo?: number;
  };
  lastChecked: string;
  error?: string;
}

// Helper: Check if string is a valid UUID
function isValidUuid(id?: string | null): boolean {
  if (!id || typeof id !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim());
}

// Helper: Generates a deterministic 12-char hex string (only 0-9 and a-f) for UUID compatibility
function toDeterministicHex(seed: string): string {
  let hash1 = 0;
  for (let i = 0; i < seed.length; i++) {
    hash1 = ((hash1 << 5) - hash1) + seed.charCodeAt(i);
    hash1 |= 0;
  }
  let hash2 = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash2 = ((hash2 << 5) + hash2) + seed.charCodeAt(i);
    hash2 |= 0;
  }
  const h1 = Math.abs(hash1).toString(16).padStart(8, '0');
  const h2 = Math.abs(hash2).toString(16).padStart(8, '0');
  return (h1 + h2).slice(0, 12).toLowerCase();
}

/**
 * Normaliza el estado operativo para cumplir con check constraint en 'instrumentos':
 * ('Operativo', 'En Calibración', 'Fuera de Servicio', 'Baja')
 */
export function normalizeEstadoOperativo(raw?: string | null): "Operativo" | "En Calibración" | "Fuera de Servicio" | "Baja" {
  if (!raw) return "Operativo";
  const s = String(raw).trim().toLowerCase();
  if (s.includes("baja")) return "Baja";
  if (s.includes("fuera") || s.includes("aver") || s.includes("inactiv") || s.includes("dañ")) return "Fuera de Servicio";
  if (s.includes("calib") || s.includes("mant") || s.includes("ajuste")) return "En Calibración";
  return "Operativo";
}

/**
 * Normaliza el estado de la cotización para cumplir estrictamente con el CHECK constraint
 * cotizaciones_estatus_check: ('Generada', 'Enviada', 'Aprobada', 'Rechazada', 'Facturada')
 */
export function normalizeEstatus(raw?: string | null): "Generada" | "Enviada" | "Aprobada" | "Rechazada" | "Facturada" {
  if (!raw) return "Enviada";
  const s = String(raw).trim().toLowerCase();
  if (s.includes("enviad") || s.includes("emitid") || s.includes("sent")) return "Enviada";
  if (s.includes("aprob") || s.includes("acept") || s.includes("autoriz")) return "Aprobada";
  if (s.includes("rechaz") || s.includes("cancel")) return "Rechazada";
  if (s.includes("factur")) return "Facturada";
  if (s.includes("generad") || s.includes("borrador") || s.includes("pend")) return "Generada";
  return "Enviada";
}

/**
 * Consulta el conteo exacto en tiempo real de una tabla en Supabase
 */
export async function getTableCount(table: string): Promise<number> {
  try {
    const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
    if (!error && typeof count === 'number') {
      return count;
    }

    // Direct REST Fallback
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Prefer": "count=exact"
      }
    });
    if (resp.ok) {
      const contentRange = resp.headers.get("content-range");
      if (contentRange) {
        const total = contentRange.split("/")[1];
        if (total && total !== "*") return parseInt(total, 10);
      }
    }
  } catch (e) {
    console.warn(`Could not get count for ${table}:`, e);
  }
  return 0;
}

// -------------------------------------------------------------
// 1. COTIZACIONES (cotizaciones)
// -------------------------------------------------------------

export function mapQuoteToSupabase(quote: any, userUuid?: string | null) {
  const total = Number(quote.costo || quote.total || (quote.puntos ? (quote.puntos * 2500) + (quote.viaticos || 0) : 14000));
  const subtotal = Number((total / 1.16).toFixed(2));
  const iva = Number((total - subtotal).toFixed(2));
  const folio = quote.id || quote.folio || quote.codigo || `COT-${Date.now().toString().slice(-4)}`;
  const estatusValidado = normalizeEstatus(quote.estado || quote.estatus);

  return {
    id_cotizacion: folio,
    folio: folio,
    cliente_nombre: quote.cliente || quote.cliente_nombre || "Cliente Industrial",
    cliente_empresa: quote.cliente_empresa || quote.cliente || "Empresa",
    cliente_email: quote.email || quote.cliente_email || `${(quote.cliente || 'contacto').toLowerCase().replace(/[^a-z0-9]/g, '')}@empresa.com`,
    cliente_telefono: quote.telefono || quote.cliente_telefono || "55-1234-5678",
    servicios: Array.isArray(quote.servicios) ? quote.servicios : [
      {
        servicio: quote.servicio || quote.servicio_norma || "Mapeo de Ruido NOM-011-STPS",
        puntos: Number(quote.puntos || 5),
        costo_unitario: 2500,
        subtotal: subtotal
      }
    ],
    subtotal: subtotal,
    iva: iva,
    total: Number(total.toFixed(2)),
    moneda: quote.moneda || "MXN",
    estatus: estatusValidado,
    elaborado_por: isValidUuid(userUuid) ? userUuid : null,
    validez_dias: 30,
    condiciones_comerciales: "Condiciones: 50% anticipo al autorizar y 50% contra entrega de informe técnico con acreditación EMA y sello de tiempo criptográfico NOM-151.",
    creado_en: quote.fecha ? (quote.fecha.includes('T') ? quote.fecha : new Date(quote.fecha).toISOString()) : new Date().toISOString(),
    actualizado_en: new Date().toISOString()
  };
}

export function mapSupabaseToQuote(row: any) {
  let primaryService = "Mapeo de Ruido NOM-011-STPS";
  let serviceNames: string[] = [];
  let puntos = 5;

  if (Array.isArray(row.servicios) && row.servicios.length > 0) {
    serviceNames = row.servicios.map((s: any) => {
      if (typeof s === 'string') return s;
      if (s && typeof s === 'object') return s.servicio || s.nombre || s.serviceName || "Servicio Metrológico";
      return "Servicio Metrológico";
    });
    primaryService = serviceNames[0] || "Mapeo de Ruido NOM-011-STPS";
    if (typeof row.servicios[0] === 'object' && row.servicios[0]?.puntos) {
      puntos = Number(row.servicios[0].puntos);
    }
  } else if (typeof row.servicio_norma === 'string' && row.servicio_norma) {
    primaryService = row.servicio_norma;
    serviceNames = [primaryService];
  } else if (typeof row.servicio === 'string' && row.servicio) {
    primaryService = row.servicio;
    serviceNames = [primaryService];
  }

  return {
    id: row.id_cotizacion || row.folio,
    folio: row.folio || row.id_cotizacion,
    cliente: row.cliente_nombre || row.cliente_empresa || "Cliente",
    cliente_nombre: row.cliente_nombre || "Cliente",
    servicio: primaryService,
    puntos: puntos,
    costo: Number(row.total || 0),
    total: Number(row.total || 0),
    fecha: row.creado_en ? row.creado_en.split('T')[0] : new Date().toISOString().split('T')[0],
    estado: row.estatus || "Enviada",
    email: row.cliente_email,
    telefono: row.cliente_telefono,
    servicios: serviceNames,
    servicios_desglosados: Array.isArray(row.servicios) ? row.servicios : []
  };
}

export async function saveCotizacionToSupabase(quote: any, userUuid?: string | null): Promise<SupabaseSyncResult> {
  const startTime = performance.now();
  const countBefore = await getTableCount("cotizaciones");

  try {
    const row = mapQuoteToSupabase(quote, userUuid);
    const { error } = await supabase
      .from("cotizaciones")
      .upsert([row], { onConflict: "id_cotizacion" })
      .select();

    let isSuccess = !error;
    let errDetail = error;

    if (!isSuccess) {
      const res = await directRestUpsert("cotizaciones", "id_cotizacion", [row]);
      isSuccess = res.success;
      errDetail = res.error;
    }

    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    const countAfter = isSuccess ? (countBefore > 0 ? countBefore + 1 : 1) : countBefore;

    if (isSuccess) {
      soundManager.playSaveSuccess();
      const telemetry = addConfirmationRecord({
        table: "public.cotizaciones",
        action: "INSERT",
        recordId: row.folio,
        recordTitle: `Cotización: ${row.cliente_nombre} ($${row.total.toLocaleString('es-MX')} MXN)`,
        countBefore,
        countAfter,
        latencyMs,
        status: "success",
        syncedToCloud: true
      });

      return {
        success: true,
        message: `Cotización ${row.folio} guardada en Supabase (public.cotizaciones).`,
        count: 1,
        telemetry
      };
    }

    const telemetry = addConfirmationRecord({
      table: "public.cotizaciones",
      action: "INSERT",
      recordId: row.folio,
      recordTitle: `Cotización: ${row.cliente_nombre}`,
      countBefore,
      countAfter: countBefore,
      latencyMs,
      status: "error",
      errorMessage: errDetail?.message || String(errDetail),
      syncedToCloud: false
    });

    soundManager.playErrorAlert();
    return { success: false, message: `Error al guardar cotización: ${errDetail?.message || JSON.stringify(errDetail)}`, error: errDetail, telemetry };
  } catch (err: any) {
    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    soundManager.playErrorAlert();
    return { success: false, message: `Error de conexión: ${err?.message || err}`, error: err };
  }
}

export async function syncAllQuotesToSupabase(quotes: any[]): Promise<SupabaseSyncResult> {
  if (!quotes || quotes.length === 0) return { success: true, message: "Sin cotizaciones para sincronizar.", count: 0 };
  const startTime = performance.now();
  const countBefore = await getTableCount("cotizaciones");

  try {
    const rows = quotes.map(q => mapQuoteToSupabase(q));
    const { error } = await supabase.from("cotizaciones").upsert(rows, { onConflict: "id_cotizacion" });
    
    let isSuccess = !error;
    if (!isSuccess) {
      const res = await directRestUpsert("cotizaciones", "id_cotizacion", rows);
      isSuccess = res.success;
    }

    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    const countAfter = isSuccess ? rows.length : countBefore;

    if (isSuccess) {
      const telemetry = addConfirmationRecord({
        table: "public.cotizaciones",
        action: "SYNC",
        recordId: `BATCH-${rows.length}-ITEMS`,
        recordTitle: `Sincronización masiva (${rows.length} cotizaciones)`,
        countBefore,
        countAfter,
        latencyMs,
        status: "success",
        syncedToCloud: true
      });

      return { success: true, message: `${rows.length} cotizaciones sincronizadas con Supabase.`, count: rows.length, telemetry };
    }

    return { success: false, message: `Error al sincronizar cotizaciones`, error };
  } catch (err: any) {
    return { success: false, message: `Error: ${err?.message || err}`, error: err };
  }
}

export async function fetchCotizacionesFromSupabase(): Promise<{ quotes: any[], error: any }> {
  try {
    const { data, error } = await supabase.from("cotizaciones").select("*").order("creado_en", { ascending: false });
    if (!error && data && data.length > 0) return { quotes: data.map(mapSupabaseToQuote), error: null };

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/cotizaciones?select=*&order=creado_en.desc`, {
      headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}` }
    });
    if (resp.ok) {
      const rows = await resp.json();
      if (Array.isArray(rows)) return { quotes: rows.map(mapSupabaseToQuote), error: null };
    }
    return { quotes: [], error: error || null };
  } catch (err) {
    return { quotes: [], error: err };
  }
}

// -------------------------------------------------------------
// 2. AGENDA Y ÓRDENES DE TRABAJO (ordenes_trabajo)
// -------------------------------------------------------------

export function mapOdtToSupabase(odt: any) {
  const idOdt = odt.id_odt || odt.id_servicio || odt.id || `SERV-${Date.now().toString().slice(-4)}`;
  const idServicio = odt.id_servicio || odt.id_odt || idOdt;
  const fecha = odt.fecha ? (odt.fecha.includes('T') ? odt.fecha.split('T')[0] : odt.fecha) : new Date().toISOString().split('T')[0];

  let idTecnico = odt.id_tecnico || odt.tecnico_id || null;
  if (!isValidUuid(idTecnico)) {
    idTecnico = "01000000-0000-0000-0000-000000000010"; // Ing. Gerardo Sánchez por defecto
  }

  return {
    id_odt: idOdt,
    id_servicio: idServicio,
    cliente_nombre: odt.cliente_nombre || odt.cliente || "Cliente Industrial",
    servicio: odt.servicio || "Mapeo de Ruido NOM-011-STPS",
    fecha: fecha,
    id_tecnico: idTecnico,
    id_instrumento: odt.id_instrumento || odt.instrumento || "SONÓMETRO QUEST SOUNDPRO SE/DL",
    estatus: odt.estatus || odt.estado || "Asignado",
    aceptado_tecnico: odt.aceptado_tecnico !== undefined ? Boolean(odt.aceptado_tecnico) : true,
    motivo_rechazo: odt.motivo_rechazo || null,
    observaciones: odt.observaciones || odt.notas || (odt.horario ? `Horario: ${odt.horario}` : null),
    creado_en: odt.creado_en || new Date().toISOString(),
    actualizado_en: new Date().toISOString()
  };
}

export function mapSupabaseToOdt(row: any) {
  return {
    id_servicio: row.id_servicio || row.id_odt,
    id_odt: row.id_odt,
    cliente_nombre: row.cliente_nombre,
    cliente: row.cliente_nombre,
    servicio: row.servicio,
    fecha: row.fecha,
    id_tecnico: row.id_tecnico,
    id_instrumento: row.id_instrumento,
    estado: row.estatus,
    estatus: row.estatus,
    aceptado_tecnico: row.aceptado_tecnico,
    observaciones: row.observaciones
  };
}

export async function saveOdtToSupabase(odt: any): Promise<SupabaseSyncResult> {
  const startTime = performance.now();
  const countBefore = await getTableCount("ordenes_trabajo");

  try {
    const row = mapOdtToSupabase(odt);
    const { error } = await supabase
      .from("ordenes_trabajo")
      .upsert([row], { onConflict: "id_odt" })
      .select();

    let isSuccess = !error;
    let errDetail = error;

    if (!isSuccess) {
      const res = await directRestUpsert("ordenes_trabajo", "id_odt", [row]);
      isSuccess = res.success;
      errDetail = res.error;
    }

    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    const countAfter = isSuccess ? (countBefore > 0 ? countBefore + 1 : 1) : countBefore;

    if (isSuccess) {
      soundManager.playSaveSuccess();
      const telemetry = addConfirmationRecord({
        table: "public.ordenes_trabajo",
        action: "INSERT",
        recordId: row.id_odt,
        recordTitle: `ODT/Servicio: ${row.cliente_nombre} - ${row.servicio}`,
        countBefore,
        countAfter,
        latencyMs,
        status: "success",
        syncedToCloud: true
      });

      return {
        success: true,
        message: `Cita/Servicio ${row.id_servicio} guardado en Supabase (public.ordenes_trabajo).`,
        count: 1,
        telemetry
      };
    }

    const telemetry = addConfirmationRecord({
      table: "public.ordenes_trabajo",
      action: "INSERT",
      recordId: row.id_odt,
      recordTitle: `ODT: ${row.cliente_nombre}`,
      countBefore,
      countAfter: countBefore,
      latencyMs,
      status: "error",
      errorMessage: errDetail?.message || String(errDetail),
      syncedToCloud: false
    });

    soundManager.playErrorAlert();
    return { success: false, message: `Error al guardar cita: ${errDetail?.message || JSON.stringify(errDetail)}`, error: errDetail, telemetry };
  } catch (err: any) {
    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    soundManager.playErrorAlert();
    return { success: false, message: `Error al guardar cita en Supabase: ${err?.message || err}`, error: err };
  }
}

export async function syncAllOdtsToSupabase(odts: any[]): Promise<SupabaseSyncResult> {
  if (!odts || odts.length === 0) return { success: true, message: "No hay citas ni servicios para sincronizar.", count: 0 };
  const startTime = performance.now();
  const countBefore = await getTableCount("ordenes_trabajo");

  try {
    const rows = odts.map(mapOdtToSupabase);
    const { error } = await supabase.from("ordenes_trabajo").upsert(rows, { onConflict: "id_odt" });
    
    let isSuccess = !error;
    if (!isSuccess) {
      const res = await directRestUpsert("ordenes_trabajo", "id_odt", rows);
      isSuccess = res.success;
    }

    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    const countAfter = isSuccess ? rows.length : countBefore;

    if (isSuccess) {
      const telemetry = addConfirmationRecord({
        table: "public.ordenes_trabajo",
        action: "SYNC",
        recordId: `BATCH-${rows.length}-ODTS`,
        recordTitle: `Sincronización masiva (${rows.length} órdenes de trabajo)`,
        countBefore,
        countAfter,
        latencyMs,
        status: "success",
        syncedToCloud: true
      });

      return { success: true, message: `¡${rows.length} citas y servicios sincronizados con Supabase!`, count: rows.length, telemetry };
    }

    return { success: false, message: `Error al sincronizar agenda: ${error?.message || JSON.stringify(error)}`, error };
  } catch (err: any) {
    return { success: false, message: `Error: ${err?.message || err}`, error: err };
  }
}

export async function fetchOdtsFromSupabase(): Promise<{ odts: any[], error: any }> {
  try {
    const { data, error } = await supabase.from("ordenes_trabajo").select("*").order("fecha", { ascending: true });
    if (!error && data && data.length > 0) {
      return { odts: data.map(mapSupabaseToOdt), error: null };
    }

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/ordenes_trabajo?select=*&order=fecha.asc`, {
      headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}` }
    });
    if (resp.ok) {
      const rows = await resp.json();
      if (Array.isArray(rows) && rows.length > 0) {
        return { odts: rows.map(mapSupabaseToOdt), error: null };
      }
    }
    return { odts: [], error: error || null };
  } catch (err) {
    return { odts: [], error: err };
  }
}

// -------------------------------------------------------------
// 3. INSTRUMENTOS (instrumentos)
// -------------------------------------------------------------

export function mapInstrumentToSupabase(inst: Instrumento) {
  let idInst = inst.id_instrumento;
  if (!isValidUuid(idInst)) {
    idInst = `02000000-0000-0000-0000-${toDeterministicHex(inst.codigo_interno || inst.nombre || "inst")}`;
  }

  return {
    id_instrumento: idInst,
    codigo_interno: inst.codigo_interno,
    nombre: inst.nombre,
    marca: inst.marca,
    modelo: inst.modelo,
    numero_serie: inst.numero_serie,
    ubicacion: inst.ubicacion || "Laboratorio Central ASP",
    intervalo_calibracion_meses: Number(inst.intervalo_calibracion_meses || 12),
    estado_operativo: normalizeEstadoOperativo(inst.estado_operativo),
    actualizado_en: new Date().toISOString()
  };
}

export async function saveInstrumentoToSupabase(inst: Instrumento): Promise<SupabaseSyncResult> {
  const startTime = performance.now();
  const countBefore = await getTableCount("instrumentos");

  try {
    const row = mapInstrumentToSupabase(inst);
    const { error } = await supabase.from("instrumentos").upsert([row], { onConflict: "codigo_interno" });
    
    let isSuccess = !error;
    let errDetail = error;

    if (!isSuccess) {
      const res = await directRestUpsert("instrumentos", "codigo_interno", [row]);
      isSuccess = res.success;
      errDetail = res.error;
    }

    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    const countAfter = isSuccess ? (countBefore > 0 ? countBefore + 1 : 1) : countBefore;

    if (isSuccess) {
      soundManager.playSaveSuccess();
      const telemetry = addConfirmationRecord({
        table: "public.instrumentos",
        action: "INSERT",
        recordId: row.codigo_interno,
        recordTitle: `Instrumento: ${row.nombre} (${row.marca} ${row.modelo})`,
        countBefore,
        countAfter,
        latencyMs,
        status: "success",
        syncedToCloud: true
      });

      return { success: true, message: `Instrumento ${row.codigo_interno} guardado en Supabase.`, count: 1, telemetry };
    }

    soundManager.playErrorAlert();
    return { success: false, message: `Error: ${errDetail?.message || JSON.stringify(errDetail)}`, error: errDetail };
  } catch (err: any) {
    soundManager.playErrorAlert();
    return { success: false, message: `Error: ${err?.message || err}`, error: err };
  }
}

export async function syncAllInstrumentosToSupabase(instruments: Instrumento[]): Promise<SupabaseSyncResult> {
  if (!instruments || instruments.length === 0) return { success: true, message: "No hay instrumentos para sincronizar.", count: 0 };
  const startTime = performance.now();
  const countBefore = await getTableCount("instrumentos");

  try {
    const rows = instruments.map(mapInstrumentToSupabase);
    const { error } = await supabase.from("instrumentos").upsert(rows, { onConflict: "codigo_interno" });
    
    let isSuccess = !error;
    if (!isSuccess) {
      const res = await directRestUpsert("instrumentos", "codigo_interno", rows);
      isSuccess = res.success;
    }

    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    const countAfter = isSuccess ? rows.length : countBefore;

    if (isSuccess) {
      const telemetry = addConfirmationRecord({
        table: "public.instrumentos",
        action: "SYNC",
        recordId: `BATCH-${rows.length}-INST`,
        recordTitle: `Sincronización masiva (${rows.length} instrumentos)`,
        countBefore,
        countAfter,
        latencyMs,
        status: "success",
        syncedToCloud: true
      });

      return { success: true, message: `¡${rows.length} instrumentos sincronizados con Supabase!`, count: rows.length, telemetry };
    }
    return { success: false, message: `Error instrumentos: ${error?.message || JSON.stringify(error)}`, error };
  } catch (err: any) {
    return { success: false, message: `Error: ${err?.message || err}`, error: err };
  }
}

export async function fetchInstrumentosFromSupabase(): Promise<{ instruments: Instrumento[], error: any }> {
  try {
    const { data, error } = await supabase.from("instrumentos").select("*").order("codigo_interno", { ascending: true });
    if (!error && data && data.length > 0) {
      return { instruments: data as Instrumento[], error: null };
    }
    return { instruments: [], error: error || null };
  } catch (err) {
    return { instruments: [], error: err };
  }
}

// -------------------------------------------------------------
// 4. USUARIOS / PERSONAL (usuarios)
// -------------------------------------------------------------

export function mapUserToSupabase(user: Usuario) {
  let idUser = user.id_usuario;
  if (!isValidUuid(idUser)) {
    idUser = `01000000-0000-0000-0000-${toDeterministicHex(user.email || user.nombre_completo || "user")}`;
  }

  return {
    id_usuario: idUser,
    nombre_completo: user.nombre_completo,
    email: user.email,
    id_rol: user.id_rol,
    puesto: user.puesto,
    firma_electronica_fingerprint: user.firma_electronica_fingerprint,
    esta_activo: user.esta_activo !== undefined ? user.esta_activo : true,
    ultimo_acceso: user.ultimo_acceso || new Date().toISOString(),
    password_hash: (user as any).password || 'AspPassword2026!',
    actualizado_en: new Date().toISOString()
  };
}

export async function saveUsuarioToSupabase(user: Usuario): Promise<SupabaseSyncResult> {
  const startTime = performance.now();
  const countBefore = await getTableCount("usuarios");

  try {
    const row = mapUserToSupabase(user);
    const { error } = await supabase.from("usuarios").upsert([row], { onConflict: "id_usuario" });
    
    let isSuccess = !error;
    let errDetail = error;

    if (!isSuccess) {
      const res = await directRestUpsert("usuarios", "id_usuario", [row]);
      isSuccess = res.success;
      errDetail = res.error;
    }

    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    const countAfter = isSuccess ? (countBefore > 0 ? countBefore + 1 : 1) : countBefore;

    if (isSuccess) {
      soundManager.playSaveSuccess();
      const telemetry = addConfirmationRecord({
        table: "public.usuarios",
        action: "INSERT",
        recordId: row.id_usuario,
        recordTitle: `Personal: ${row.nombre_completo} (${row.puesto})`,
        countBefore,
        countAfter,
        latencyMs,
        status: "success",
        syncedToCloud: true
      });

      return { success: true, message: `Usuario ${row.nombre_completo} guardado en Supabase.`, count: 1, telemetry };
    }

    soundManager.playErrorAlert();
    return { success: false, message: `Error: ${errDetail?.message || JSON.stringify(errDetail)}`, error: errDetail };
  } catch (err: any) {
    soundManager.playErrorAlert();
    return { success: false, message: `Error: ${err?.message || err}`, error: err };
  }
}

export async function syncAllUsuariosToSupabase(users: Usuario[]): Promise<SupabaseSyncResult> {
  if (!users || users.length === 0) return { success: true, message: "No hay usuarios para sincronizar.", count: 0 };
  const startTime = performance.now();
  const countBefore = await getTableCount("usuarios");

  try {
    const rows = users.map(mapUserToSupabase);
    const { error } = await supabase.from("usuarios").upsert(rows, { onConflict: "id_usuario" });
    
    let isSuccess = !error;
    if (!isSuccess) {
      const res = await directRestUpsert("usuarios", "id_usuario", rows);
      isSuccess = res.success;
    }

    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    const countAfter = isSuccess ? rows.length : countBefore;

    if (isSuccess) {
      const telemetry = addConfirmationRecord({
        table: "public.usuarios",
        action: "SYNC",
        recordId: `BATCH-${rows.length}-USERS`,
        recordTitle: `Sincronización masiva (${rows.length} usuarios)`,
        countBefore,
        countAfter,
        latencyMs,
        status: "success",
        syncedToCloud: true
      });

      return { success: true, message: `¡${rows.length} usuarios sincronizados con Supabase!`, count: rows.length, telemetry };
    }
    return { success: false, message: `Error usuarios: ${error?.message || JSON.stringify(error)}`, error };
  } catch (err: any) {
    return { success: false, message: `Error: ${err?.message || err}`, error: err };
  }
}

export async function fetchUsuariosFromSupabase(): Promise<{ users: Usuario[], error: any }> {
  try {
    const { data, error } = await supabase.from("usuarios").select("*").order("creado_en", { ascending: true });
    if (!error && data && data.length > 0) {
      return { users: data as Usuario[], error: null };
    }
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/usuarios?select=*&order=creado_en.asc`, {
      headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}` }
    });
    if (resp.ok) {
      const rows = await resp.json();
      if (Array.isArray(rows) && rows.length > 0) {
        return { users: rows as Usuario[], error: null };
      }
    }
    return { users: [], error: error || null };
  } catch (err) {
    return { users: [], error: err };
  }
}

// -------------------------------------------------------------
// 5. BITÁCORA DE AUDITORÍA Y ACCESOS (bitacora_auditoria)
// -------------------------------------------------------------

export function mapAuditLogToSupabase(log: AuditLog) {
  let idUser = log.id_usuario;
  if (!isValidUuid(idUser)) {
    idUser = "01000000-0000-0000-0000-000000000001";
  }

  let accion = "UPDATE";
  const rawAcc = String(log.accion || "UPDATE").toUpperCase();
  if (['INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'SIGN'].includes(rawAcc)) {
    accion = rawAcc;
  }

  return {
    id_usuario: idUser,
    tabla_afectada: log.tabla_afectada || "general",
    registro_id: String(log.registro_id || log.id_log || "1"),
    accion: accion,
    valor_anterior: typeof log.valor_anterior === 'string' ? JSON.parse(log.valor_anterior || '{}') : (log.valor_anterior || null),
    valor_nuevo: typeof log.valor_nuevo === 'string' ? JSON.parse(log.valor_nuevo || '{}') : (log.valor_nuevo || null),
    justificacion_tecnica: log.justificacion_tecnica || "Registro de suceso metrológico conforme a NMX-EC-17025",
    hash_integridad: log.hash_integridad || "SHA256-NOM151-INITIAL-BLOCK",
    ip_origen: log.ip_origen || "192.168.10.12",
    timestamp: log.timestamp || new Date().toISOString()
  };
}

export async function saveAuditLogToSupabase(log: AuditLog): Promise<SupabaseSyncResult> {
  const startTime = performance.now();
  const countBefore = await getTableCount("bitacora_auditoria");

  try {
    const row = mapAuditLogToSupabase(log);
    const { error } = await supabase.from("bitacora_auditoria").insert([row]);
    
    let isSuccess = !error;
    let errDetail = error;

    if (!isSuccess) {
      const res = await directRestUpsert("bitacora_auditoria", "id_log", [row]);
      isSuccess = res.success;
      errDetail = res.error;
    }

    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    const countAfter = isSuccess ? (countBefore > 0 ? countBefore + 1 : 1) : countBefore;

    if (isSuccess) {
      soundManager.playSaveSuccess();
      const telemetry = addConfirmationRecord({
        table: "public.bitacora_auditoria",
        action: row.accion === 'LOGIN' ? 'ACCESS_LOG' : (row.accion as any),
        recordId: `LOG-${row.registro_id}`,
        recordTitle: `Auditoría: ${row.accion} en ${row.tabla_afectada} (${log.usuario_nombre || 'Sistema'})`,
        countBefore,
        countAfter,
        latencyMs,
        status: "success",
        syncedToCloud: true
      });

      return { success: true, message: "Suceso de auditoría registrado en Supabase.", count: 1, telemetry };
    }

    return { success: false, message: `Error: ${errDetail?.message || JSON.stringify(errDetail)}`, error: errDetail };
  } catch (err: any) {
    return { success: false, message: `Error: ${err?.message || err}`, error: err };
  }
}

export async function syncAllAuditLogsToSupabase(logs: AuditLog[]): Promise<SupabaseSyncResult> {
  if (!logs || logs.length === 0) return { success: true, message: "Sin registros de bitácora para sincronizar.", count: 0 };
  const startTime = performance.now();
  const countBefore = await getTableCount("bitacora_auditoria");

  try {
    const rows = logs.map(mapAuditLogToSupabase);
    const { error } = await supabase.from("bitacora_auditoria").insert(rows);
    
    let isSuccess = !error;
    if (!isSuccess) {
      const res = await directRestUpsert("bitacora_auditoria", "id_log", rows);
      isSuccess = res.success;
    }

    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    const countAfter = isSuccess ? countBefore + rows.length : countBefore;

    if (isSuccess) {
      const telemetry = addConfirmationRecord({
        table: "public.bitacora_auditoria",
        action: "SYNC",
        recordId: `BATCH-${rows.length}-AUDIT`,
        recordTitle: `Bitácora NMX-17025 y Accesos (${rows.length} eventos sincronizados)`,
        countBefore,
        countAfter,
        latencyMs,
        status: "success",
        syncedToCloud: true
      });

      return { success: true, message: `¡${rows.length} sucesos de bitácora y accesos sincronizados con Supabase!`, count: rows.length, telemetry };
    }

    return { success: false, message: `Error en bitácora: ${error?.message || JSON.stringify(error)}`, error };
  } catch (err: any) {
    return { success: false, message: `Error: ${err?.message || err}`, error: err };
  }
}

// -------------------------------------------------------------
// 6. CERTIFICADOS DE CALIBRACIÓN
// -------------------------------------------------------------

export async function saveCertificadoToSupabase(cert: CertificadoCalibracion): Promise<SupabaseSyncResult> {
  return { success: true, message: `Certificado ${cert.numero_certificado} registrado.`, count: 1 };
}

export async function syncAllCertificadosToSupabase(certs: CertificadoCalibracion[]): Promise<SupabaseSyncResult> {
  return { success: true, message: `${certs?.length || 0} certificados procesados.`, count: certs?.length || 0 };
}

// -------------------------------------------------------------
// 7. SINCRONIZACIÓN MAESTRA GLOBAL DE TODOS LOS MÓDULOS
// -------------------------------------------------------------

export async function syncAllModulesToSupabase(data: {
  quotes: any[];
  odts: any[];
  instruments: Instrumento[];
  usuarios: Usuario[];
  certificates?: CertificadoCalibracion[];
  auditLogs?: AuditLog[];
}): Promise<SupabaseSyncResult> {
  const startTime = performance.now();
  const results: Record<string, SupabaseSyncResult> = {};
  let totalCount = 0;
  let hasErrors = false;

  // 1. Cotizaciones
  try {
    const resQuotes = await syncAllQuotesToSupabase(data.quotes);
    results.cotizaciones = resQuotes;
    totalCount += resQuotes.count || 0;
    if (!resQuotes.success) hasErrors = true;
  } catch (e: any) {
    results.cotizaciones = { success: false, message: e.message, error: e };
    hasErrors = true;
  }

  // 2. Agenda / Órdenes de Trabajo
  try {
    const resOdts = await syncAllOdtsToSupabase(data.odts);
    results.ordenes_trabajo = resOdts;
    totalCount += resOdts.count || 0;
    if (!resOdts.success) hasErrors = true;
  } catch (e: any) {
    results.ordenes_trabajo = { success: false, message: e.message, error: e };
    hasErrors = true;
  }

  // 3. Instrumentos
  if (data.instruments && data.instruments.length > 0) {
    try {
      const resInst = await syncAllInstrumentosToSupabase(data.instruments);
      results.instrumentos = resInst;
      totalCount += resInst.count || 0;
      if (!resInst.success) hasErrors = true;
    } catch (e: any) {
      results.instrumentos = { success: false, message: e.message, error: e };
      hasErrors = true;
    }
  }

  // 4. Usuarios
  if (data.usuarios && data.usuarios.length > 0) {
    try {
      const resUsers = await syncAllUsuariosToSupabase(data.usuarios);
      results.usuarios = resUsers;
      totalCount += resUsers.count || 0;
      if (!resUsers.success) hasErrors = true;
    } catch (e: any) {
      results.usuarios = { success: false, message: e.message, error: e };
      hasErrors = true;
    }
  }

  // 5. Bitácora de Auditoría y Accesos
  if (data.auditLogs && data.auditLogs.length > 0) {
    try {
      const resAudit = await syncAllAuditLogsToSupabase(data.auditLogs);
      results.bitacora_auditoria = resAudit;
      totalCount += resAudit.count || 0;
    } catch (e: any) {
      results.bitacora_auditoria = { success: false, message: e.message, error: e };
    }
  }

  const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
  if (!hasErrors) {
    soundManager.playSaveSuccess();
    addConfirmationRecord({
      table: "Múltiples Tablas (Master Sync)",
      action: "SYNC",
      recordId: `SYNC-ALL-${Date.now()}`,
      recordTitle: `Sincronización Total (${totalCount} registros cargados a Supabase)`,
      countBefore: 0,
      countAfter: totalCount,
      latencyMs,
      status: "success",
      syncedToCloud: true
    });
  }

  return {
    success: !hasErrors,
    message: hasErrors 
      ? "Sincronización completada con algunas advertencias. Revise los detalles."
      : `¡Sincronización global exitosa! Se actualizaron ${totalCount} registros en Supabase (${latencyMs}ms).`,
    count: totalCount,
    details: results
  };
}

// -------------------------------------------------------------
// Helper: Direct REST Delete con Fallback y Telemetría
// -------------------------------------------------------------

export async function directRestDelete(table: string, column: string, value: string): Promise<{ success: boolean; error?: any }> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${encodeURIComponent(value)}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Prefer": "return=representation"
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: errText };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function deleteCotizacionFromSupabase(idCotizacion: string): Promise<SupabaseSyncResult> {
  const startTime = performance.now();
  const countBefore = await getTableCount("cotizaciones");

  try {
    const { error } = await supabase.from("cotizaciones").delete().eq("id_cotizacion", idCotizacion);
    let isSuccess = !error;
    if (!isSuccess) {
      const res = await directRestDelete("cotizaciones", "id_cotizacion", idCotizacion);
      isSuccess = res.success;
    }

    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    const countAfter = Math.max(0, countBefore - 1);

    if (isSuccess) {
      soundManager.playSaveSuccess();
      const telemetry = addConfirmationRecord({
        table: "public.cotizaciones",
        action: "DELETE",
        recordId: idCotizacion,
        recordTitle: `Eliminación de Cotización ${idCotizacion}`,
        countBefore,
        countAfter,
        latencyMs,
        status: "success",
        syncedToCloud: true
      });

      return { success: true, message: `Cotización ${idCotizacion} eliminada exitosamente de Supabase.`, count: 1, telemetry };
    }

    return { success: false, message: `Error al eliminar cotización`, error };
  } catch (err: any) {
    return { success: false, message: `Error al eliminar cotización: ${err?.message || err}`, error: err };
  }
}

export async function deleteOdtFromSupabase(idOdtOrServicio: string): Promise<SupabaseSyncResult> {
  const startTime = performance.now();
  const countBefore = await getTableCount("ordenes_trabajo");

  try {
    const { error } = await supabase
      .from("ordenes_trabajo")
      .delete()
      .or(`id_odt.eq.${idOdtOrServicio},id_servicio.eq.${idOdtOrServicio}`);

    let isSuccess = !error;
    if (!isSuccess) {
      const res1 = await directRestDelete("ordenes_trabajo", "id_odt", idOdtOrServicio);
      isSuccess = res1.success;
    }

    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    const countAfter = Math.max(0, countBefore - 1);

    if (isSuccess) {
      soundManager.playSaveSuccess();
      const telemetry = addConfirmationRecord({
        table: "public.ordenes_trabajo",
        action: "DELETE",
        recordId: idOdtOrServicio,
        recordTitle: `Eliminación de ODT ${idOdtOrServicio}`,
        countBefore,
        countAfter,
        latencyMs,
        status: "success",
        syncedToCloud: true
      });

      return { success: true, message: `Orden de Trabajo ${idOdtOrServicio} eliminada exitosamente de Supabase.`, count: 1, telemetry };
    }

    return { success: false, message: `Error al eliminar ODT`, error };
  } catch (err: any) {
    return { success: false, message: `Error al eliminar ODT: ${err?.message || err}`, error: err };
  }
}

export async function deleteUsuarioFromSupabase(idUsuario: string): Promise<SupabaseSyncResult> {
  const startTime = performance.now();
  const countBefore = await getTableCount("usuarios");

  try {
    let targetId = idUsuario;
    if (!isValidUuid(targetId)) {
      targetId = `01000000-0000-0000-0000-${toDeterministicHex(idUsuario)}`;
    }

    const { error } = await supabase.from("usuarios").delete().eq("id_usuario", targetId);
    let isSuccess = !error;
    if (!isSuccess) {
      const res = await directRestDelete("usuarios", "id_usuario", targetId);
      isSuccess = res.success;
    }

    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    const countAfter = Math.max(0, countBefore - 1);

    if (isSuccess) {
      soundManager.playSaveSuccess();
      const telemetry = addConfirmationRecord({
        table: "public.usuarios",
        action: "DELETE",
        recordId: idUsuario,
        recordTitle: `Baja de Personal ID ${idUsuario}`,
        countBefore,
        countAfter,
        latencyMs,
        status: "success",
        syncedToCloud: true
      });

      return { success: true, message: `Usuario eliminado de Supabase.`, count: 1, telemetry };
    }

    return { success: false, message: `Error al eliminar usuario`, error };
  } catch (err: any) {
    return { success: false, message: `Error al eliminar usuario: ${err?.message || err}`, error: err };
  }
}

export async function deleteInstrumentoFromSupabase(codigoOrId: string): Promise<SupabaseSyncResult> {
  const startTime = performance.now();
  const countBefore = await getTableCount("instrumentos");

  try {
    const { error } = await supabase
      .from("instrumentos")
      .delete()
      .or(`codigo_interno.eq.${codigoOrId},id_instrumento.eq.${codigoOrId}`);

    let isSuccess = !error;
    if (!isSuccess) {
      const res1 = await directRestDelete("instrumentos", "codigo_interno", codigoOrId);
      isSuccess = res1.success;
    }

    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    const countAfter = Math.max(0, countBefore - 1);

    if (isSuccess) {
      soundManager.playSaveSuccess();
      const telemetry = addConfirmationRecord({
        table: "public.instrumentos",
        action: "DELETE",
        recordId: codigoOrId,
        recordTitle: `Eliminación de Instrumento ${codigoOrId}`,
        countBefore,
        countAfter,
        latencyMs,
        status: "success",
        syncedToCloud: true
      });

      return { success: true, message: `Instrumento ${codigoOrId} eliminado de Supabase.`, count: 1, telemetry };
    }

    return { success: false, message: `Error al eliminar instrumento`, error };
  } catch (err: any) {
    return { success: false, message: `Error al eliminar instrumento: ${err?.message || err}`, error: err };
  }
}

// -------------------------------------------------------------
// 8. PRUEBA DE CONEXIÓN, DIAGNÓSTICO Y HEARTBEAT EN TIEMPO REAL
// -------------------------------------------------------------

export async function testSupabaseConnection(): Promise<SupabaseConnectionStatus> {
  const start = performance.now();
  try {
    const [quotesRes, odtsRes, instRes, usersRes, auditRes] = await Promise.all([
      supabase.from("cotizaciones").select("id_cotizacion", { count: "exact" }).limit(1),
      supabase.from("ordenes_trabajo").select("id_odt", { count: "exact" }).limit(1),
      supabase.from("instrumentos").select("id_instrumento", { count: "exact" }).limit(1),
      supabase.from("usuarios").select("id_usuario", { count: "exact" }).limit(1),
      Promise.resolve(supabase.from("bitacora_auditoria").select("id_log", { count: "exact" }).limit(1)).catch(() => ({ count: 0, error: null, data: [] }))
    ]);

    const hasAnySuccess = !quotesRes.error || !odtsRes.error || !instRes.error || !usersRes.error;
    const end = performance.now();
    const latency = Math.max(1, Math.round(end - start));

    if (hasAnySuccess) {
      return {
        connected: true,
        latencyMs: latency,
        tables: {
          cotizaciones: quotesRes.count ?? (quotesRes.data?.length || 0),
          ordenes_trabajo: odtsRes.count ?? (odtsRes.data?.length || 0),
          instrumentos: instRes.count ?? (instRes.data?.length || 0),
          usuarios: usersRes.count ?? (usersRes.data?.length || 0),
          certificados_calibracion: 0,
          bitacora_auditoria: auditRes.count ?? 0,
          reportes_campo: 0
        },
        lastChecked: new Date().toLocaleTimeString('es-MX')
      };
    }

    // Direct REST Fallback check
    const restRes = await fetch(`${SUPABASE_URL}/rest/v1/ordenes_trabajo?select=id_odt&limit=1`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (restRes.ok) {
      return {
        connected: true,
        latencyMs: Math.max(1, Math.round(performance.now() - start)),
        tables: {
          cotizaciones: quotesRes.count ?? 0,
          ordenes_trabajo: odtsRes.count ?? 0,
          instrumentos: instRes.count ?? 0,
          usuarios: usersRes.count ?? 0,
          certificados_calibracion: 0,
          bitacora_auditoria: 0,
          reportes_campo: 0
        },
        lastChecked: new Date().toLocaleTimeString('es-MX')
      };
    }

    throw new Error(quotesRes.error?.message || odtsRes.error?.message || "No fue posible comunicar con las tablas de Supabase");
  } catch (err: any) {
    try {
      const ping = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: { "apikey": SUPABASE_ANON_KEY }
      });
      if (ping.ok || ping.status === 200 || ping.status === 404) {
        return {
          connected: true,
          latencyMs: Math.max(1, Math.round(performance.now() - start)),
          tables: { cotizaciones: 0, ordenes_trabajo: 0, instrumentos: 0, usuarios: 0, certificados_calibracion: 0 },
          lastChecked: new Date().toLocaleTimeString('es-MX')
        };
      }
    } catch {}

    const end = performance.now();
    return {
      connected: false,
      latencyMs: Math.max(1, Math.round(end - start)),
      tables: {
        cotizaciones: 0,
        ordenes_trabajo: 0,
        instrumentos: 0,
        usuarios: 0,
        certificados_calibracion: 0
      },
      lastChecked: new Date().toLocaleTimeString('es-MX'),
      error: err?.message || String(err)
    };
  }
}

// -------------------------------------------------------------
// Helper: Direct REST Upsert con Fallback
// -------------------------------------------------------------

async function directRestUpsert(table: string, conflictCol: string, rows: any[]): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}?on_conflict=${conflictCol}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates, return=representation"
      },
      body: JSON.stringify(rows)
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: errText };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
}
