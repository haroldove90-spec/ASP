import React from 'react';
import { ShieldCheck, Clock, CreditCard, Award, FileCheck2, Truck, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';

export interface CommercialConditions {
  tiempo_entrega: string;
  vigencia_cotizacion: string;
  condiciones_pago: string;
  acreditacion_ema: string;
  norma_151_validez: string;
  viaticos_facilidades: string;
  notas_especiales?: string;
}

export const DEFAULT_COMMERCIAL_CONDITIONS: CommercialConditions = {
  tiempo_entrega: "10 a 15 días hábiles posteriores al levantamiento metrológico en campo.",
  vigencia_cotizacion: "30 días naturales a partir de su emisión.",
  condiciones_pago: "50% de anticipo a la confirmación de la Orden de Compra (OC) y 50% contra entrega de informe técnico preliminar/definitivo.",
  acreditacion_ema: "Laboratorio acreditado ante la Entidad Mexicana de Acreditación (EMA) bajo la norma NMX-EC-17025-IMNC-2018.",
  norma_151_validez: "Informe digital certificado con constancia de conservación NOM-151-SCFI-2016 y sellado criptográfico SHA-256 inalterable.",
  viaticos_facilidades: "El cliente proporcionará acceso a instalaciones, acompañamiento de seguridad (EHS) y permisos de trabajo en caliente/alturas si aplica.",
  notas_especiales: "Precios en Moneda Nacional (MXN) más 16% de I.V.A."
};

interface CommercialConditionsBlockProps {
  conditions: CommercialConditions;
  onChange: (updated: CommercialConditions) => void;
  isEditable?: boolean;
  compact?: boolean;
}

export const CommercialConditionsBlock: React.FC<CommercialConditionsBlockProps> = ({
  conditions,
  onChange,
  isEditable = true,
  compact = false
}) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [isEditingCustom, setIsEditingCustom] = React.useState(false);

  const handlePresetSelect = (presetType: 'standard' | 'credit30' | 'government' | 'urgent') => {
    if (presetType === 'standard') {
      onChange(DEFAULT_COMMERCIAL_CONDITIONS);
    } else if (presetType === 'credit30') {
      onChange({
        ...conditions,
        condiciones_pago: "Crédito a 30 días naturales previa entrega de factura y recepción de orden de compra formal.",
        notas_especiales: "Aprobado por Dirección Comercial para cliente corporativo con convenio."
      });
    } else if (presetType === 'government') {
      onChange({
        ...conditions,
        tiempo_entrega: "5 a 8 días hábiles con entrega de carpeta técnica física foliada y digital NOM-151.",
        condiciones_pago: "100% contra entrega de informe técnico y fianza de cumplimiento si aplica.",
        vigencia_cotizacion: "60 días naturales para proceso de licitación pública."
      });
    } else if (presetType === 'urgent') {
      onChange({
        ...conditions,
        tiempo_entrega: "Entrega exprés en 48 a 72 horas hábiles tras medición en campo.",
        condiciones_pago: "100% anticipo para liberación inmediata de brigada técnica y calibración prioritaria."
      });
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
      {/* Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-slate-100 hover:bg-slate-200/70 transition flex items-center justify-between cursor-pointer border-b border-slate-200"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
            Condiciones Comerciales y Validez Oficial
          </span>
          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded">
            EMA & NOM-151
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-3.5 space-y-3 text-xs">
          {isEditable && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">Plantillas Rápidas:</span>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('standard')}
                  className="px-2 py-0.5 bg-white hover:bg-slate-50 border border-slate-300 rounded text-[10px] font-semibold text-slate-700 cursor-pointer"
                >
                  Estándar Industrial
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('credit30')}
                  className="px-2 py-0.5 bg-white hover:bg-slate-50 border border-slate-300 rounded text-[10px] font-semibold text-slate-700 cursor-pointer"
                >
                  Crédito 30 Días
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('urgent')}
                  className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded text-[10px] font-bold text-amber-800 cursor-pointer"
                >
                  Entrega Exprés
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingCustom(!isEditingCustom)}
                className="text-[10.5px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditingCustom ? 'Ver Resumen' : 'Personalizar Cláusulas'}</span>
              </button>
            </div>
          )}

          {isEditingCustom && isEditable ? (
            <div className="space-y-2.5 bg-white p-3 rounded-lg border border-slate-200">
              <div>
                <label className="block text-[9px] font-bold text-slate-600 uppercase font-mono">
                  1. Tiempo de Entrega de Informes
                </label>
                <input
                  type="text"
                  value={conditions.tiempo_entrega}
                  onChange={(e) => onChange({ ...conditions, tiempo_entrega: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-600 uppercase font-mono">
                    2. Vigencia de la Cotización
                  </label>
                  <input
                    type="text"
                    value={conditions.vigencia_cotizacion}
                    onChange={(e) => onChange({ ...conditions, vigencia_cotizacion: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-600 uppercase font-mono">
                    3. Condiciones de Pago
                  </label>
                  <input
                    type="text"
                    value={conditions.condiciones_pago}
                    onChange={(e) => onChange({ ...conditions, condiciones_pago: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-600 uppercase font-mono">
                  4. Acreditación EMA & Validez Legal
                </label>
                <input
                  type="text"
                  value={conditions.acreditacion_ema}
                  onChange={(e) => onChange({ ...conditions, acreditacion_ema: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-600 uppercase font-mono">
                  5. Notas Especiales / Observaciones
                </label>
                <textarea
                  rows={2}
                  value={conditions.notas_especiales || ''}
                  onChange={(e) => onChange({ ...conditions, notas_especiales: e.target.value })}
                  placeholder="Instrucciones de facturación, condiciones especiales de planta..."
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-[10px] text-slate-800 block">Tiempo de Entrega</span>
                  <p className="text-[11px] text-slate-600 font-light leading-relaxed">{conditions.tiempo_entrega}</p>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-[10px] text-slate-800 block">Forma y Términos de Pago</span>
                  <p className="text-[11px] text-slate-600 font-light leading-relaxed">{conditions.condiciones_pago}</p>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                <Award className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-[10px] text-slate-800 block">Acreditación y Vigencia</span>
                  <p className="text-[11px] text-slate-600 font-light leading-relaxed">
                    Vigencia: {conditions.vigencia_cotizacion} • {conditions.acreditacion_ema}
                  </p>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                <FileCheck2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-[10px] text-slate-800 block">Conservación NOM-151</span>
                  <p className="text-[11px] text-slate-600 font-light leading-relaxed">{conditions.norma_151_validez}</p>
                </div>
              </div>
            </div>
          )}

          {conditions.notas_especiales && !isEditingCustom && (
            <div className="bg-lime-50/70 border border-lime-200 p-2 rounded-lg text-[11px] text-lime-950 font-medium">
              <strong>Nota Especial:</strong> {conditions.notas_especiales}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
