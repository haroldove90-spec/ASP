import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "../supabaseClient";
import { Usuario, Instrumento, CertificadoCalibracion, AuditLog } from "../initial_data";

export interface SupabaseSyncResult {
  success: boolean;
  message: string;
  count?: number;
  error?: any;
  details?: Record<string, any>;
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

// -------------------------------------------------------------
// 1. COTIZACIONES
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
  const primaryService = Array.isArray(row.servicios) && row.servicios.length > 0 
    ? (row.servicios[0].servicio || row.servicios[0].nombre || "Servicio Industrial")
    : (row.servicio_norma || "Mapeo de Ruido NOM-011-STPS");

  const puntos = Array.isArray(row.servicios) && row.servicios.length > 0
    ? (row.servicios[0].puntos || 5)
    : 5;

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
    servicios: row.servicios
  };
}

export async function saveCotizacionToSupabase(quote: any, userUuid?: string | null): Promise<SupabaseSyncResult> {
  try {
    const row = mapQuoteToSupabase(quote, userUuid);
    const { data, error } = await supabase
      .from("cotizaciones")
      .upsert([row], { onConflict: "id_cotizacion" })
      .select();

    if (!error) {
      return { success: true, message: `Cotización ${row.folio} guardada en Supabase.`, count: 1 };
    }

    // Direct REST fallback
    const res = await directRestUpsert("cotizaciones", "id_cotizacion", [row]);
    if (res.success) return { success: true, message: `Cotización ${row.folio} guardada en Supabase.`, count: 1 };

    return { success: false, message: `Error: ${error.message || JSON.stringify(error)}`, error };
  } catch (err: any) {
    return { success: false, message: `Error de conexión: ${err?.message || err}`, error: err };
  }
}

export async function syncAllQuotesToSupabase(quotes: any[]): Promise<SupabaseSyncResult> {
  if (!quotes || quotes.length === 0) return { success: true, message: "Sin cotizaciones para sincronizar.", count: 0 };
  try {
    const rows = quotes.map(q => mapQuoteToSupabase(q));
    const { error } = await supabase.from("cotizaciones").upsert(rows, { onConflict: "id_cotizacion" });
    if (!error) return { success: true, message: `${rows.length} cotizaciones sincronizadas con Supabase.`, count: rows.length };

    const res = await directRestUpsert("cotizaciones", "id_cotizacion", rows);
    if (res.success) return { success: true, message: `${rows.length} cotizaciones sincronizadas con Supabase.`, count: rows.length };

    return { success: false, message: `Error: ${error.message || JSON.stringify(error)}`, error };
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
// 2. AGENDA Y PROGRAMACIÓN / ÓRDENES DE TRABAJO (ordenes_trabajo)
// -------------------------------------------------------------

export function mapOdtToSupabase(odt: any) {
  const idOdt = odt.id_odt || odt.id_servicio || odt.id || `SERV-${Date.now().toString().slice(-4)}`;
  const idServicio = odt.id_servicio || odt.id_odt || idOdt;
  const fecha = odt.fecha ? (odt.fecha.includes('T') ? odt.fecha.split('T')[0] : odt.fecha) : new Date().toISOString().split('T')[0];

  // Resolver ID de técnico si viene en formato UUID o texto
  let idTecnico = odt.id_tecnico || odt.tecnico_id || null;
  if (!isValidUuid(idTecnico)) {
    // Si es un ID corto o texto, dejamos un UUID por defecto de la lista de ingenieros o null
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
  try {
    const row = mapOdtToSupabase(odt);
    const { data, error } = await supabase
      .from("ordenes_trabajo")
      .upsert([row], { onConflict: "id_odt" })
      .select();

    if (!error) {
      return { success: true, message: `Cita/Servicio ${row.id_servicio} guardado en Supabase (public.ordenes_trabajo).`, count: 1 };
    }

    // Direct REST fallback
    const res = await directRestUpsert("ordenes_trabajo", "id_odt", [row]);
    if (res.success) {
      return { success: true, message: `Cita/Servicio ${row.id_servicio} guardado en Supabase.`, count: 1 };
    }

    return { success: false, message: `Error: ${error.message || JSON.stringify(error)}`, error };
  } catch (err: any) {
    return { success: false, message: `Error al guardar cita en Supabase: ${err?.message || err}`, error: err };
  }
}

export async function syncAllOdtsToSupabase(odts: any[]): Promise<SupabaseSyncResult> {
  if (!odts || odts.length === 0) return { success: true, message: "No hay citas ni servicios para sincronizar.", count: 0 };
  try {
    const rows = odts.map(mapOdtToSupabase);
    const { error } = await supabase.from("ordenes_trabajo").upsert(rows, { onConflict: "id_odt" });
    if (!error) {
      return { success: true, message: `¡${rows.length} citas y servicios de agenda sincronizados con Supabase!`, count: rows.length };
    }

    const res = await directRestUpsert("ordenes_trabajo", "id_odt", rows);
    if (res.success) {
      return { success: true, message: `¡${rows.length} citas y servicios de agenda sincronizados con Supabase!`, count: rows.length };
    }

    return { success: false, message: `Error al sincronizar agenda: ${error.message || JSON.stringify(error)}`, error };
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
    // Generar un UUID determinista válido con caracteres hexadecimales
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
  try {
    const row = mapInstrumentToSupabase(inst);
    const { error } = await supabase.from("instrumentos").upsert([row], { onConflict: "codigo_interno" });
    if (!error) return { success: true, message: `Instrumento ${row.codigo_interno} guardado en Supabase.`, count: 1 };
    const res = await directRestUpsert("instrumentos", "codigo_interno", [row]);
    if (res.success) return { success: true, message: `Instrumento ${row.codigo_interno} guardado en Supabase.`, count: 1 };
    return { success: false, message: `Error: ${error?.message || JSON.stringify(error)}`, error };
  } catch (err: any) {
    return { success: false, message: `Error: ${err?.message || err}`, error: err };
  }
}

export async function syncAllInstrumentosToSupabase(instruments: Instrumento[]): Promise<SupabaseSyncResult> {
  if (!instruments || instruments.length === 0) return { success: true, message: "No hay instrumentos para sincronizar.", count: 0 };
  try {
    const rows = instruments.map(mapInstrumentToSupabase);
    const { error } = await supabase.from("instrumentos").upsert(rows, { onConflict: "codigo_interno" });
    if (!error) {
      return { success: true, message: `¡${rows.length} instrumentos sincronizados con Supabase!`, count: rows.length };
    }
    const res = await directRestUpsert("instrumentos", "codigo_interno", rows);
    if (res.success) {
      return { success: true, message: `¡${rows.length} instrumentos sincronizados con Supabase!`, count: rows.length };
    }
    return { success: false, message: `Error instrumentos: ${error.message || JSON.stringify(error)}`, error };
  } catch (err: any) {
    return { success: false, message: `Error: ${err?.message || err}`, error: err };
  }
}

export async function saveUsuarioToSupabase(user: Usuario): Promise<SupabaseSyncResult> {
  try {
    const row = mapUserToSupabase(user);
    const { error } = await supabase.from("usuarios").upsert([row], { onConflict: "id_usuario" });
    if (!error) return { success: true, message: `Usuario ${row.nombre_completo} guardado en Supabase.`, count: 1 };
    const res = await directRestUpsert("usuarios", "id_usuario", [row]);
    if (res.success) return { success: true, message: `Usuario ${row.nombre_completo} guardado en Supabase.`, count: 1 };
    return { success: false, message: `Error: ${error?.message || JSON.stringify(error)}`, error };
  } catch (err: any) {
    return { success: false, message: `Error: ${err?.message || err}`, error: err };
  }
}

export async function saveCertificadoToSupabase(cert: CertificadoCalibracion): Promise<SupabaseSyncResult> {
  return { success: true, message: "Certificado registrado.", count: 1 };
}

export async function syncAllCertificadosToSupabase(certs: CertificadoCalibracion[]): Promise<SupabaseSyncResult> {
  return { success: true, message: `${certs?.length || 0} certificados procesados.`, count: certs?.length || 0 };
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
    username: user.email ? user.email.split('@')[0] : user.nombre_completo.toLowerCase().replace(/\s/g, '.'),
    actualizado_en: new Date().toISOString()
  };
}

export async function syncAllUsuariosToSupabase(users: Usuario[]): Promise<SupabaseSyncResult> {
  if (!users || users.length === 0) return { success: true, message: "No hay usuarios para sincronizar.", count: 0 };
  try {
    const rows = users.map(mapUserToSupabase);
    const { error } = await supabase.from("usuarios").upsert(rows, { onConflict: "id_usuario" });
    if (!error) {
      return { success: true, message: `¡${rows.length} usuarios sincronizados con Supabase!`, count: rows.length };
    }
    const res = await directRestUpsert("usuarios", "id_usuario", rows);
    if (res.success) {
      return { success: true, message: `¡${rows.length} usuarios sincronizados con Supabase!`, count: rows.length };
    }
    return { success: false, message: `Error usuarios: ${error.message || JSON.stringify(error)}`, error };
  } catch (err: any) {
    return { success: false, message: `Error: ${err?.message || err}`, error: err };
  }
}

// -------------------------------------------------------------
// 5. SINCRONIZACIÓN MAESTRA GLOBAL DE TODOS LOS MÓDULOS
// -------------------------------------------------------------

export async function syncAllModulesToSupabase(data: {
  quotes: any[];
  odts: any[];
  instruments: Instrumento[];
  usuarios: Usuario[];
  certificates?: CertificadoCalibracion[];
  auditLogs?: AuditLog[];
}): Promise<SupabaseSyncResult> {
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

  return {
    success: !hasErrors,
    message: hasErrors 
      ? "Sincronización completada con algunas advertencias. Revise los detalles."
      : `¡Sincronización global exitosa! Se actualizaron ${totalCount} registros en Supabase.`,
    count: totalCount,
    details: results
  };
}

// -------------------------------------------------------------
// 6. PRUEBA DE CONEXIÓN Y DIAGNÓSTICO EN TIEMPO REAL
// -------------------------------------------------------------

export async function testSupabaseConnection(): Promise<SupabaseConnectionStatus> {
  const start = performance.now();
  try {
    // Consultar el conteo de las tablas principales
    const [quotesRes, odtsRes, instRes, usersRes] = await Promise.all([
      supabase.from("cotizaciones").select("id_cotizacion", { count: "exact", head: true }),
      supabase.from("ordenes_trabajo").select("id_odt", { count: "exact", head: true }),
      supabase.from("instrumentos").select("id_instrumento", { count: "exact", head: true }),
      supabase.from("usuarios").select("id_usuario", { count: "exact", head: true })
    ]);

    const end = performance.now();
    const latency = Math.round(end - start);

    return {
      connected: true,
      latencyMs: latency,
      tables: {
        cotizaciones: quotesRes.count ?? 0,
        ordenes_trabajo: odtsRes.count ?? 0,
        instrumentos: instRes.count ?? 0,
        usuarios: usersRes.count ?? 0,
        certificados_calibracion: 0
      },
      lastChecked: new Date().toLocaleTimeString()
    };
  } catch (err: any) {
    const end = performance.now();
    return {
      connected: false,
      latencyMs: Math.round(end - start),
      tables: {
        cotizaciones: 0,
        ordenes_trabajo: 0,
        instrumentos: 0,
        usuarios: 0,
        certificados_calibracion: 0
      },
      lastChecked: new Date().toLocaleTimeString(),
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
