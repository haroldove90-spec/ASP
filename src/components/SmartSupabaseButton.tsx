import React from "react";
import { Database, RefreshCw, Zap, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { SupabaseConnectionStatus } from "../lib/supabaseSync";

interface SmartSupabaseButtonProps {
  status: 'testing' | 'connected' | 'error';
  diagnostics: SupabaseConnectionStatus | null;
  onOpenModal: () => void;
  onQuickVerify: (e: React.MouseEvent) => void;
  isVerifying?: boolean;
}

export function SmartSupabaseButton({
  status,
  diagnostics,
  onOpenModal,
  onQuickVerify,
  isVerifying
}: SmartSupabaseButtonProps) {
  const isConnected = status === 'connected';
  const isTesting = status === 'testing' || isVerifying;
  const latency = diagnostics?.latencyMs ?? 0;

  return (
    <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl p-1 shadow-xs">
      {/* 2-STATE LIVE TRAFFIC LIGHT BUTTON */}
      <button
        type="button"
        onClick={onOpenModal}
        title="Centro de Control Supabase: Clic para abrir diagnóstico, telemetría e historial"
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer select-none ${
          isConnected
            ? 'bg-slate-800/80 text-emerald-300 hover:bg-slate-800 hover:text-white border border-emerald-500/20'
            : isTesting
              ? 'bg-amber-950/60 text-amber-300 hover:bg-amber-900/80 border border-amber-500/30'
              : 'bg-red-950/80 text-red-300 hover:bg-red-900/90 border border-red-500/40'
        }`}
      >
        {/* Animated Traffic Light Dot */}
        <span className="relative flex h-2.5 w-2.5">
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isConnected
                ? 'bg-emerald-400 animate-ping'
                : isTesting
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-red-500 animate-ping'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isConnected
                ? 'bg-emerald-500'
                : isTesting
                  ? 'bg-amber-500'
                  : 'bg-red-500'
            }`}
          />
        </span>

        <span className="flex items-center gap-1">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Supabase</span>
        </span>

        {/* Live Latency badge */}
        {isConnected && latency > 0 && (
          <span className="px-1.5 py-0.2 bg-emerald-950/90 text-emerald-400 border border-emerald-500/30 rounded text-[10px] flex items-center gap-0.5">
            <Zap className="w-2.5 h-2.5 text-amber-400" />
            {latency}ms
          </span>
        )}

        {/* State label */}
        <span className={`text-[10px] hidden md:inline font-semibold ${
          isConnected ? 'text-emerald-400' : isTesting ? 'text-amber-400' : 'text-red-400'
        }`}>
          {isConnected ? 'En Línea' : isTesting ? 'Probando...' : 'Reconectar'}
        </span>
      </button>

      {/* 1-CLICK QUICK VERIFY BUTTON */}
      <button
        type="button"
        onClick={onQuickVerify}
        disabled={isTesting}
        title="1 Clic: Verificar conexión y latencia inmediatamente"
        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-amber-400' : ''}`} />
      </button>
    </div>
  );
}
