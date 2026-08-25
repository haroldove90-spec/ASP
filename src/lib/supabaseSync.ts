import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "../supabaseClient";

export interface SupabaseSyncResult {
  success: boolean;
  message: string;
  count?: number;
  error?: any;
}

// Check if string is a valid UUID
function isValidUuid(id?: string | null): boolean {
  if (!id || typeof id !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim());
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
    estado: row.estatus || "Enviado",
    email: row.cliente_email,
    telefono: row.cliente_telefono,
    servicios: row.servicios
  };
}

/**
 * Fallback direct REST request to Supabase to guarantee execution
 */
async function directRestUpsert(rows: any[]): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/cotizaciones?on_conflict=id_cotizacion`;
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

/**
 * Guarda o actualiza una cotización individual en la tabla 'cotizaciones' de Supabase
 */
export async function saveCotizacionToSupabase(quote: any, userUuid?: string | null): Promise<SupabaseSyncResult> {
  try {
    const row = mapQuoteToSupabase(quote, userUuid);
    
    // 1. Intentar mediante supabase-js SDK
    const { data, error } = await supabase
      .from("cotizaciones")
      .upsert([row], { onConflict: "id_cotizacion" })
      .select();

    if (!error) {
      console.log("Cotización guardada exitosamente en Supabase:", data);
      return {
        success: true,
        message: `Cotización ${row.folio} guardada correctamente en Supabase (public.cotizaciones).`,
        count: 1
      };
    }

    // 2. Si falló el SDK, intentar con REST directo
    console.warn("Reintentando con llamada REST directa a Supabase...", error);
    const restRes = await directRestUpsert([row]);
    if (restRes.success) {
      return {
        success: true,
        message: `Cotización ${row.folio} guardada correctamente en Supabase.`,
        count: 1
      };
    }

    return {
      success: false,
      message: `Error de Supabase: ${error.message || JSON.stringify(error)}`,
      error
    };
  } catch (err: any) {
    console.error("Excepción al comunicarse con Supabase:", err);
    // Intento final REST directo
    try {
      const row = mapQuoteToSupabase(quote, userUuid);
      const restRes = await directRestUpsert([row]);
      if (restRes.success) {
        return {
          success: true,
          message: `Cotización ${row.folio} guardada correctamente en Supabase.`,
          count: 1
        };
      }
    } catch (_) {}

    return {
      success: false,
      message: `Fallo de conexión con Supabase: ${err?.message || err}`,
      error: err
    };
  }
}

/**
 * Sincroniza todas las cotizaciones de la aplicación hacia Supabase
 */
export async function syncAllQuotesToSupabase(quotes: any[]): Promise<SupabaseSyncResult> {
  if (!quotes || quotes.length === 0) {
    return { success: true, message: "No hay cotizaciones para sincronizar.", count: 0 };
  }

  try {
    const rows = quotes.map(q => mapQuoteToSupabase(q));
    
    // 1. Intentar vía Supabase JS client
    const { data, error } = await supabase
      .from("cotizaciones")
      .upsert(rows, { onConflict: "id_cotizacion" })
      .select();

    if (!error) {
      return {
        success: true,
        message: `¡${rows.length} cotizaciones sincronizadas exitosamente con Supabase!`,
        count: rows.length
      };
    }

    // 2. Si falló, intentar con REST directo
    console.warn("Fallo SDK upsert masivo, intentando REST directo...", error);
    const restRes = await directRestUpsert(rows);
    if (restRes.success) {
      return {
        success: true,
        message: `¡${rows.length} cotizaciones sincronizadas exitosamente con Supabase!`,
        count: rows.length
      };
    }

    return {
      success: false,
      message: `Error al sincronizar cotizaciones: ${error.message || JSON.stringify(error)}`,
      error
    };
  } catch (err: any) {
    try {
      const rows = quotes.map(q => mapQuoteToSupabase(q));
      const restRes = await directRestUpsert(rows);
      if (restRes.success) {
        return {
          success: true,
          message: `¡${rows.length} cotizaciones sincronizadas exitosamente con Supabase!`,
          count: rows.length
        };
      }
    } catch (_) {}

    return {
      success: false,
      message: `Error de red con Supabase: ${err?.message || err}`,
      error: err
    };
  }
}

/**
 * Obtiene todas las cotizaciones desde Supabase
 */
export async function fetchCotizacionesFromSupabase(): Promise<{ quotes: any[], error: any }> {
  try {
    const { data, error } = await supabase
      .from("cotizaciones")
      .select("*")
      .order("creado_en", { ascending: false });

    if (!error && data && data.length > 0) {
      const mapped = data.map(mapSupabaseToQuote);
      return { quotes: mapped, error: null };
    }

    // Fallback REST GET
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/cotizaciones?select=*&order=creado_en.desc`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (resp.ok) {
      const rows = await resp.json();
      if (Array.isArray(rows)) {
        return { quotes: rows.map(mapSupabaseToQuote), error: null };
      }
    }

    return { quotes: [], error: error || null };
  } catch (err) {
    console.warn("Excepción al consultar Supabase:", err);
    return { quotes: [], error: err };
  }
}

