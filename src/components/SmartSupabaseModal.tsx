import React, { useState, useEffect } from "react";
import {
  Database,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  Check,
  Volume2,
  VolumeX,
  History,
  Shield,
  FileCode,
  Layers,
  ArrowRight,
  TrendingUp,
  Activity,
  Trash2,
  ExternalLink,
  X
} from "lucide-react";
import { DB_SCHEMA_SQL } from "../db_schema_sql";
import { soundManager } from "../utils/audioAlerts";
import {
  getConfirmationHistory,
  clearConfirmationHistory,
  TelemetrySaveRecord
} from "../types/supabaseTelemetry";
import {
  testSupabaseConnection,
  syncAllModulesToSupabase,
  syncAllAuditLogsToSupabase,
  SupabaseConnectionStatus
} from "../lib/supabaseSync";

interface SmartSupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  supabaseStatus: 'testing' | 'connected' | 'error';
  supabaseDiagnostics: SupabaseConnectionStatus | null;
  onCheckHealth: () => Promise<SupabaseConnectionStatus>;
  onSyncAll: () => Promise<any>;
  isSyncingGlobal: boolean;
  scheduledServicesCount: number;
  quotesCount: number;
  instrumentsCount: number;
  usuariosCount: number;
  auditLogs: any[];
}

export function SmartSupabaseModal({
  isOpen,
  onClose,
  supabaseStatus,
  supabaseDiagnostics,
  onCheckHealth,
  onSyncAll,
  isSyncingGlobal,
  scheduledServicesCount,
  quotesCount,
  instrumentsCount,
  usuariosCount,
  auditLogs
}: SmartSupabaseModalProps) {
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'history' | 'audit_sync' | 'sql_script'>('diagnosis');
  const [historyRecords, setHistoryRecords] = useState<TelemetrySaveRecord[]>([]);
  const [copiedSql, setCopiedSql] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => soundManager.isEnabled());
  const [isVerifyingNow, setIsVerifyingNow] = useState(false);
  const [isSyncingAudit, setIsSyncingAudit] = useState(false);
  const [auditSyncMessage, setAuditSyncMessage] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<string>('ALL');

  useEffect(() => {
    if (isOpen) {
      setHistoryRecords(getConfirmationHistory());
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    const handleNewRecord = () => {
      setHistoryRecords(getConfirmationHistory());
    };
    window.addEventListener('aspechs:telemetry_save', handleNewRecord);
    window.addEventListener('aspechs:telemetry_clear', handleNewRecord);
    return () => {
      window.removeEventListener('aspechs:telemetry_save', handleNewRecord);
      window.removeEventListener('aspechs:telemetry_clear', handleNewRecord);
    };
  }, []);

  if (!isOpen) return null;

  const handle1ClickVerify = async () => {
    setIsVerifyingNow(true);
    soundManager.playHeartbeatPing();
    try {
      await onCheckHealth();
      setHistoryRecords(getConfirmationHistory());
    } finally {
      setIsVerifyingNow(false);
    }
  };

  const handleSyncAuditAndAccess = async () => {
    setIsSyncingAudit(true);
    setAuditSyncMessage("Enviando bitácora y registros de acceso a Supabase (public.bitacora_auditoria)...");
    try {
      const res = await syncAllAuditLogsToSupabase(auditLogs);
      if (res.success) {
        setAuditSyncMessage(`¡Éxito! ${res.count || auditLogs.length} sucesos de bitácora y accesos sincronizados.`);
      } else {
        setAuditSyncMessage(`Aviso: ${res.message}`);
      }
      await onCheckHealth();
    } catch (e: any) {
      setAuditSyncMessage(`Error: ${e.message || e}`);
    } finally {
      setIsSyncingAudit(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(DB_SCHEMA_SQL);
    setCopiedSql(true);
    soundManager.playSaveSuccess();
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setEnabled(next);
  };

  const handleClearHistory = () => {
    if (confirm("¿Deseas vaciar el historial de las últimas confirmaciones?")) {
      clearConfirmationHistory();
      setHistoryRecords([]);
    }
  };

  const filteredHistory = filterAction === 'ALL'
    ? historyRecords
    : historyRecords.filter(r => r.action === filterAction || r.table.includes(filterAction));

  const latency = supabaseDiagnostics?.latencyMs ?? 0;
  const isConnected = supabaseStatus === 'connected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-base">Botón Inteligente & Centro Supabase</h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold rounded border border-emerald-500/40">
                  PostgreSQL Cloud
                </span>
              </div>
              <p className="text-xs text-slate-400 font-light">Trazabilidad en tiempo real, latencia milimétrica y persistencia NMX-17025</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className={`p-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
              title={soundEnabled ? "Audio de telemetría activo (clic para silenciar)" : "Activar sonido de telemetría"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? "Audio On" : "Mute"}</span>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2 gap-2 overflow-x-auto shrink-0 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('diagnosis')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'diagnosis'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Diagnóstico & Semáforo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-emerald-600" />
            <span>Historial Confirmaciones</span>
            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-mono font-bold">
              {historyRecords.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit_sync')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'audit_sync'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Bitácora & Accesos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sql_script')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'sql_script'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4 text-emerald-600" />
            <span>Script SQL Supabase</span>
          </button>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">

          {/* TAB 1: DIAGNÓSTICO EN VIVO */}
          {activeTab === 'diagnosis' && (
            <div className="space-y-5">
              {/* LIVE TRAFFIC LIGHT & LATENCY HERO */}
              <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 ${
                isConnected
                  ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-300 text-emerald-950'
                  : supabaseStatus === 'testing' || isVerifyingNow
                    ? 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-300 text-amber-950'
                    : 'bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border-red-300 text-red-950'
              }`}>
                <div className="flex items-center gap-4">
                  {/* Semáforo en vivo de 2 estados con pulso animado */}
                  <div className="relative flex items-center justify-center">
                    <span className={`absolute inline-flex h-8 w-8 rounded-full opacity-60 ${
                      isConnected
                        ? 'bg-emerald-400 animate-ping'
                        : supabaseStatus === 'testing' || isVerifyingNow
                          ? 'bg-amber-400 animate-ping'
                          : 'bg-red-400 animate-ping'
                    }`}></span>
                    <div className={`relative w-6 h-6 rounded-full shadow-md flex items-center justify-center text-white ${
                      isConnected
                        ? 'bg-emerald-500 ring-4 ring-emerald-200'
                        : supabaseStatus === 'testing' || isVerifyingNow
                          ? 'bg-amber-500 ring-4 ring-amber-200'
                          : 'bg-red-500 ring-4 ring-red-200'
                    }`}>
                      {isConnected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Zap className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base">
                        {isConnected
                          ? 'Base de Datos Conectada y Operativa'
                          : supabaseStatus === 'testing' || isVerifyingNow
                            ? 'Midiendo Latencia y Verificando Servidor...'
                            : 'Desconexión o Falla de Comunicación'}
                      </h4>
                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded ${
                        isConnected
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {isConnected ? '🟢 2-State: Conectado' : '🔴 2-State: Desconectado'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-1 flex items-center gap-3">
                      <span>Último Heartbeat: {supabaseDiagnostics?.lastChecked || new Date().toLocaleTimeString('es-MX')}</span>
                      <span className="text-slate-300">•</span>
                      <span>Monitoreo automático cada 25s</span>
                    </div>
                  </div>
                </div>

                {/* LATENCY METRIC CARD */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs shrink-0 text-right font-mono min-w-[130px]">
                  <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-end gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span>Latencia Ping</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-0.5">
                    {latency} <span className="text-xs font-normal text-slate-500">ms</span>
                  </div>
                  <div className="text-[10px] font-semibold text-emerald-600">
                    {latency > 0 && latency < 100 ? '⚡ Excelente (<100ms)' : latency < 250 ? '✅ Buena (<250ms)' : '⚠️ Lenta (>250ms)'}
                  </div>
                </div>
              </div>

              {/* 1-CLIK ACTION BAR */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Comprobación a Demanda en 1 Clic:</span> Ejecuta un diagnóstico inmediato enviando una petición ping ultraligera a Supabase REST.
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handle1ClickVerify}
                    disabled={isVerifyingNow || isSyncingGlobal}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingNow ? 'animate-spin' : ''}`} />
                    <span>{isVerifyingNow ? 'Verificando...' : 'Verificar Conexión Ahora'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onSyncAll}
                    disabled={isSyncingGlobal || isVerifyingNow}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGlobal ? 'animate-spin' : ''}`} />
                    <span>{isSyncingGlobal ? 'Sincronizando...' : 'Sincronizar Módulos'}</span>
                  </button>
                </div>
              </div>

              {/* TABLAS EN LA NUBE (LIVE COUNTS AUDIT) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Conteo de Registros en Supabase Cloud</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Actualizado con telemetría en vivo</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center transition hover:border-emerald-300">
                    <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">Cotizaciones</div>
                    <div className="text-xl font-mono font-bold text-emerald-700 mt-1">
                      {supabaseDiagnostics?.tables?.cotizaciones ?? quotesCount}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">public.cotizaciones</div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center transition hover:border-emerald-300">
                    <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">Agenda & ODTs</div>
                    <div className="text-xl font-mono font-bold text-emerald-700 mt-1">
                      {supabaseDiagnostics?.tables?.ordenes_trabajo ?? scheduledServicesCount}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">public.ordenes_trabajo</div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center transition hover:border-emerald-300">
                    <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">Instrumentos</div>
                    <div className="text-xl font-mono font-bold text-emerald-700 mt-1">
                      {supabaseDiagnostics?.tables?.instrumentos ?? instrumentsCount}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">public.instrumentos</div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center transition hover:border-emerald-300">
                    <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">Personal (RBAC)</div>
                    <div className="text-xl font-mono font-bold text-emerald-700 mt-1">
                      {supabaseDiagnostics?.tables?.usuarios ?? usuariosCount}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">public.usuarios</div>
                  </div>
                </div>
              </div>

              {/* ENDPOINT INFO */}
              <div className="bg-slate-900 text-slate-300 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">Supabase REST Endpoint:</span>
                  <span className="text-[10px] text-slate-400">Auth: Anon / Service Role</span>
                </div>
                <p className="text-white text-xs select-all break-all">https://xqmgkmxkqvnrakodlgjp.supabase.co</p>
                <div className="text-[11px] text-slate-400 pt-1.5 border-t border-slate-800 flex items-center justify-between">
                  <span>Heartbeat Activo: Intervalo 25,000 ms</span>
                  <span className="text-emerald-400 font-bold">● En Línea</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HISTORIAL DE CONFIRMACIONES (ÚLTIMAS 30 OPERACIONES) */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-600" />
                    <span>Visor Cronológico de Confirmaciones ({historyRecords.length}/30)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-light mt-0.5">
                    Registros con estampa de tiempo completa, conteo previo vs posterior y latencia milimétrica.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Action filter */}
                  <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="bg-white border border-slate-300 text-xs font-bold text-slate-700 rounded-lg px-2.5 py-1.5 cursor-pointer shadow-2xs font-mono"
                  >
                    <option value="ALL">Todas las Operaciones</option>
                    <option value="INSERT">INSERT</option>
                    <option value="UPDATE">UPDATE</option>
                    <option value="DELETE">DELETE</option>
                    <option value="SYNC">SYNC</option>
                    <option value="ACCESS_LOG">ACCESS_LOG</option>
                    <option value="cotizaciones">Cotizaciones</option>
                    <option value="ordenes_trabajo">ODTs</option>
                    <option value="instrumentos">Instrumentos</option>
                    <option value="usuarios">Usuarios</option>
                    <option value="bitacora_auditoria">Bitácora</option>
                  </select>

                  {historyRecords.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 border border-slate-200 transition cursor-pointer"
                      title="Limpiar historial de confirmaciones"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* LIST OF CONFIRMATIONS */}
              {filteredHistory.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center space-y-2">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">Aún no hay operaciones registradas en esta sesión.</p>
                  <p className="text-[11px] text-slate-400">Guarda una cotización, asigna una ODT o edita un equipo para ver la telemetría inmediata.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {filteredHistory.map((rec) => {
                    const isSuccess = rec.status === 'success';
                    const diff = rec.countAfter - rec.countBefore;
                    const diffText = diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '0';

                    return (
                      <div
                        key={rec.id}
                        className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`w-2 h-2 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {rec.recordId}
                            </span>
                            <span className="text-xs font-mono text-slate-600 font-semibold">
                              {rec.table}
                            </span>
                            <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase ${
                              rec.action === 'INSERT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              rec.action === 'UPDATE' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              rec.action === 'DELETE' ? 'bg-red-50 text-red-700 border border-red-200' :
                              rec.action === 'ACCESS_LOG' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {rec.action}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 font-mono text-xs">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-bold flex items-center gap-1">
                              <Zap className="w-3 h-3 text-amber-500" />
                              {rec.latencyMs} ms
                            </span>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px]">
                              {isSuccess ? 'Persistido en Nube' : 'Error'}
                            </span>
                          </div>
                        </div>

                        {rec.recordTitle && (
                          <div className="text-xs text-slate-700 font-light">
                            {rec.recordTitle}
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] font-mono text-slate-500">
                          {/* Conteo previo vs posterior */}
                          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
                            <span className="text-slate-400">Auditoría Conteo:</span>
                            <span className="font-bold text-slate-700">{rec.countBefore}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className="font-bold text-emerald-700">{rec.countAfter}</span>
                            <span className="text-[10px] font-bold text-emerald-600">({diffText})</span>
                          </div>

                          {/* Estampa completa: Día, Fecha y Hora */}
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-bold text-slate-800">{rec.formattedFullDate}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SINCRONIZACIÓN DE BITÁCORA Y ACCESOS */}
          {activeTab === 'audit_sync' && (
            <div className="space-y-4">
              <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-500/30">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">Sincronización Inteligente de Bitácora y Accesos</h4>
                    <p className="text-xs text-slate-400 font-light">Carga masiva hacia `public.bitacora_auditoria` con encadenamiento criptográfico NOM-151</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  Todos los registros generados en campo o caseta (inicios de sesión, check-ins GPS, firmas electrónicas y modificaciones técnicas de equipos) se almacenan localmente y pueden sincronizarse hacia la tabla inalterable de auditoría en Supabase.
                </p>

                <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-slate-400">Registros en Memoria:</span>{' '}
                    <span className="font-bold text-emerald-400">{auditLogs.length} eventos</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Normativa:</span>{' '}
                    <span className="font-bold text-amber-300">NMX-EC-17025 / NOM-151</span>
                  </div>
                </div>
              </div>

              {auditSyncMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-mono font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{auditSyncMessage}</span>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleSyncAuditAndAccess}
                  disabled={isSyncingAudit}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAudit ? 'animate-spin' : ''}`} />
                  <span>{isSyncingAudit ? "Cargando Bitácora..." : "Sincronizar Bitácora & Accesos a la Nube"}</span>
                </button>
              </div>

              {/* PREVIEW DE SUCESOS RECIENTES */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Eventos Recientes de Auditoría</div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {auditLogs.slice(0, 10).map((log: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-800">{log.usuario_nombre || 'Usuario'}</span>{' '}
                        <span className="text-slate-500">[{log.accion}] en {log.tabla_afectada}</span>
                        <div className="text-[10px] text-slate-400 truncate max-w-md mt-0.5">{log.justificacion_tecnica}</div>
                      </div>
                      <div className="text-[10px] text-slate-400 shrink-0 text-right">
                        <div>{log.timestamp ? new Date(log.timestamp).toLocaleTimeString('es-MX') : 'Reciente'}</div>
                        <div className="text-[9px] text-emerald-600 truncate max-w-[120px]">{log.hash_integridad ? `${log.hash_integridad.substring(0, 12)}...` : 'SHA256'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SCRIPT SQL SUPABASE */}
          {activeTab === 'sql_script' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-600" />
                    <span>Script SQL Completo para Supabase (PostgreSQL)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-light mt-0.5">
                    Ejecútalo en el SQL Editor de tu panel de Supabase para inicializar tablas, RLS y triggers.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopySql}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm ${
                    copiedSql
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-black text-white'
                  }`}
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? "¡SQL Copiado!" : "Copiar SQL en 1 Clic"}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-[380px] leading-relaxed select-all">
                  {DB_SCHEMA_SQL}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span>Supabase Cloud Engine v2.0 • Heartbeat 25s</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
