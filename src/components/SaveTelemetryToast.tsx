import React, { useState, useEffect } from "react";
import { TelemetrySaveRecord } from "../types/supabaseTelemetry";
import { CheckCircle2, AlertTriangle, Database, Zap, Clock, Volume2, VolumeX, X, ArrowRight, ExternalLink } from "lucide-react";
import { soundManager } from "../utils/audioAlerts";

interface SaveTelemetryToastProps {
  onOpenSupabaseModal?: () => void;
}

export function SaveTelemetryToast({ onOpenSupabaseModal }: SaveTelemetryToastProps) {
  const [toasts, setToasts] = useState<TelemetrySaveRecord[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => soundManager.isEnabled());

  useEffect(() => {
    const handleTelemetryEvent = (event: Event) => {
      const customEvent = event as CustomEvent<TelemetrySaveRecord>;
      if (customEvent.detail) {
        const record = customEvent.detail;
        setToasts(prev => [record, ...prev.slice(0, 2)]); // Keep at most 3 active visible toasts
      }
    };

    window.addEventListener('aspechs:telemetry_save', handleTelemetryEvent);
    return () => {
      window.removeEventListener('aspechs:telemetry_save', handleTelemetryEvent);
    };
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setEnabled(next);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <aside aria-label="Notificaciones de telemetría" className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-3 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.status === 'success';
        const countDiff = toast.countAfter - toast.countBefore;
        const diffSign = countDiff > 0 ? `+${countDiff}` : countDiff < 0 ? `${countDiff}` : '0';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl p-4 shadow-2xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 animate-slide-up ${
              isSuccess
                ? 'bg-slate-900/95 border-emerald-500/40 text-white'
                : 'bg-slate-900/95 border-red-500/40 text-white'
            }`}
          >
            {/* Header / Badges */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-2.5 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isSuccess ? 'bg-emerald-400' : 'bg-red-400'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isSuccess ? 'bg-emerald-500' : 'bg-red-500'
                  }`}></span>
                </span>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" />
                  {isSuccess ? 'Persistencia Confirmada' : 'Error de Persistencia'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Latency badge */}
                <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 rounded-md text-[10px] font-mono font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  {toast.latencyMs} ms
                </span>

                {/* Sound toggle button */}
                <button
                  type="button"
                  onClick={toggleSound}
                  title={soundEnabled ? "Silenciar audio" : "Activar sonido de telemetría"}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>

                {/* Dismiss */}
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5 font-mono">
                    <span className="px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded text-[10px] font-bold border border-slate-700">
                      {toast.recordId}
                    </span>
                    <span className="text-[11px] text-slate-300 truncate max-w-[220px]">
                      {toast.table}
                    </span>
                  </div>
                  {toast.recordTitle && (
                    <p className="text-[11px] text-slate-300 mt-1 font-light leading-snug">
                      {toast.recordTitle}
                    </p>
                  )}
                </div>
                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded font-mono ${
                  toast.action === 'INSERT' ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700/50' :
                  toast.action === 'UPDATE' ? 'bg-blue-900/60 text-blue-200 border border-blue-700/50' :
                  toast.action === 'DELETE' ? 'bg-red-900/60 text-red-200 border border-red-700/50' :
                  toast.action === 'ACCESS_LOG' ? 'bg-purple-900/60 text-purple-200 border border-purple-700/50' :
                  'bg-amber-900/60 text-amber-200 border border-amber-700/50'
                }`}>
                  {toast.action}
                </span>
              </div>

              {/* Count Audit: Previo vs Posterior */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2 flex items-center justify-between text-[11px] font-mono">
                <div className="text-slate-400">
                  <span>Conteo de Tabla:</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-slate-400">{toast.countBefore}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="text-emerald-400">{toast.countAfter}</span>
                  <span className={`text-[10px] px-1 rounded ${
                    countDiff > 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    countDiff < 0 ? 'bg-red-950 text-red-400 border border-red-800' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    ({diffSign})
                  </span>
                </div>
              </div>

              {/* Timestamp & Full Date */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {toast.formattedFullDate}
                </span>
                {onOpenSupabaseModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenSupabaseModal();
                      removeToast(toast.id);
                    }}
                    className="text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <span>Ver Historial</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </aside>
  );
}
