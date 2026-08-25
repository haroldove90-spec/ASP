import { supabase } from "../supabaseClient";

export interface SupabaseSyncResult {
  success: boolean;
  message: string;
  count?: number;
  error?: any;
}

export function mapQuoteToSupabase(quote: any, userUuid?: string | null) {
  const total = Number(quote.costo || quote.total || (quote.puntos ? (quote.puntos * 2500) + (quote.viaticos || 0) : 14000));
  const subtotal = Math.round(total / 1.16);
  const iva = Math.round(total - subtotal);
  const folio = quote.id || quote.folio || quote.codigo || `COT-${Date.now().toString().slice(-4)}`;

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
    total: total,
    moneda: quote.moneda || "MXN",
    estatus: quote.estado || quote.estatus || "Enviado",
    validez_dias: 30,
    condiciones_comerciales: "Condiciones: 50% anticipo al autorizar y 50% contra entrega de informe técnico con acreditación EMA y sello de tiempo criptográfico NOM-151.",
    creado_en: quote.fecha ? new Date(quote.fecha).toISOString() : new Date().toISOString(),
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
 * Guarda o actualiza una cotización individual en la tabla 'cotizaciones' de Supabase
 */
export async function saveCotizacionToSupabase(quote: any, userUuid?: string | null): Promise<SupabaseSyncResult> {
  try {
    const row = mapQuoteToSupabase(quote, userUuid);
    
    // Intentar upsert en la tabla 'cotizaciones'
    const { data, error } = await supabase
      .from("cotizaciones")
      .upsert([row], { onConflict: "id_cotizacion" })
      .select();

    if (error) {
      console.error("Error al guardar cotización en Supabase:", error);
      return {
        success: false,
        message: `Error de Supabase: ${error.message || error.details || JSON.stringify(error)}`,
        error
      };
    }

    console.log("Cotización guardada exitosamente en Supabase:", data);
    return {
      success: true,
      message: `Cotización ${row.folio} guardada correctamente en Supabase (public.cotizaciones).`,
      count: 1
    };
  } catch (err: any) {
    console.error("Excepción al comunicarse con Supabase:", err);
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
    const { data, error } = await supabase
      .from("cotizaciones")
      .upsert(rows, { onConflict: "id_cotizacion" })
      .select();

    if (error) {
      console.error("Error en upsert masivo a Supabase:", error);
      return {
        success: false,
        message: `Error al sincronizar cotizaciones: ${error.message}`,
        error
      };
    }

    return {
      success: true,
      message: `¡${rows.length} cotizaciones sincronizadas exitosamente con Supabase!`,
      count: rows.length
    };
  } catch (err: any) {
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

    if (error) {
      console.warn("No se pudieron cargar cotizaciones desde Supabase:", error.message);
      return { quotes: [], error };
    }

    if (data && data.length > 0) {
      const mapped = data.map(mapSupabaseToQuote);
      return { quotes: mapped, error: null };
    }

    return { quotes: [], error: null };
  } catch (err) {
    console.warn("Excepción al consultar Supabase:", err);
    return { quotes: [], error: err };
  }
}
