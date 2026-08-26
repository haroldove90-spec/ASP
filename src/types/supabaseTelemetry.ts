export type TelemetryAction = 'INSERT' | 'UPDATE' | 'DELETE' | 'SYNC' | 'ACCESS_LOG';

export interface TelemetrySaveRecord {
  id: string;
  timestamp: string; // ISO String
  formattedFullDate: string; // e.g. "Miércoles, 26/08/2026 - 14:15:33"
  dayName: string; // e.g. "Miércoles"
  dateStr: string; // e.g. "26/08/2026"
  timeStr: string; // e.g. "14:15:33"
  table: string; // "public.cotizaciones", "public.ordenes_trabajo", "public.instrumentos", "public.usuarios", "public.bitacora_auditoria", "public.reportes_campo"
  action: TelemetryAction;
  recordId: string; // e.g. "COT-2026-004", "SERV-101", "INS-002", etc.
  recordTitle?: string;
  countBefore: number;
  countAfter: number;
  latencyMs: number;
  status: 'success' | 'error';
  errorMessage?: string;
  syncedToCloud: boolean;
}

export interface SupabaseHeartbeatMetrics {
  connected: boolean;
  latencyMs: number;
  lastCheckedISO: string;
  lastCheckedFormatted: string;
  heartbeatCount: number;
  tables: {
    cotizaciones: number;
    ordenes_trabajo: number;
    instrumentos: number;
    usuarios: number;
    bitacora_auditoria: number;
    reportes_campo: number;
    certificados_calibracion: number;
  };
  error?: string;
}

const STORAGE_KEY = 'aspechs_telemetry_confirmations_v1';
const MAX_CONFIRMATIONS = 30;

/**
 * Format a Date object into Spanish day, date and time string
 */
export function formatFullTimestamp(date: Date = new Date()): {
  formattedFullDate: string;
  dayName: string;
  dateStr: string;
  timeStr: string;
} {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dayName = days[date.getDay()];
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  const dateStr = `${dd}/${mm}/${yyyy}`;
  const timeStr = `${hh}:${min}:${ss}`;
  const formattedFullDate = `${dayName}, ${dateStr} - ${timeStr}`;

  return { formattedFullDate, dayName, dateStr, timeStr };
}

/**
 * Retrieves the last 30 confirmation records from localStorage
 */
export function getConfirmationHistory(): TelemetrySaveRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Error reading confirmation history:", err);
    return [];
  }
}

/**
 * Adds a new confirmation record to the top of the history (capped at 30 items)
 */
export function addConfirmationRecord(record: Omit<TelemetrySaveRecord, 'id' | 'timestamp' | 'formattedFullDate' | 'dayName' | 'dateStr' | 'timeStr'>): TelemetrySaveRecord {
  const now = new Date();
  const dateInfo = formatFullTimestamp(now);
  
  const fullRecord: TelemetrySaveRecord = {
    id: `CONF-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now.toISOString(),
    ...dateInfo,
    ...record
  };

  try {
    const current = getConfirmationHistory();
    const updated = [fullRecord, ...current].slice(0, MAX_CONFIRMATIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Dispatch custom event for subscribers / Toast components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aspechs:telemetry_save', { detail: fullRecord }));
    }
  } catch (err) {
    console.error("Error saving confirmation record:", err);
  }

  return fullRecord;
}

/**
 * Clear confirmation history
 */
export function clearConfirmationHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aspechs:telemetry_clear'));
    }
  } catch {}
}
