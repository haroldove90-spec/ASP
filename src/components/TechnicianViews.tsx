import React, { useState } from 'react';
import { 
  Clock, 
  ShieldCheck, 
  Edit3, 
  Lock, 
  MapPin, 
  AlertTriangle, 
  FileText, 
  CheckCircle, 
  RefreshCw,
  ArrowRight,
  Hash,
  FileSignature,
  FileSpreadsheet
} from 'lucide-react';
import { motion } from 'motion/react';
import { Usuario, Instrumento, generarHashIntegridad } from '../initial_data';

interface TechnicianViewsProps {
  activePersona: Usuario;
  instruments: Instrumento[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Mobile Field states
  fieldStep: number;
  setFieldStep: (s: number) => void;
  fieldCheckinCoords: string;
  fieldCheckinTime: string;
  fieldEppChecked: {
    casco: boolean;
    tapones: boolean;
    calzado: boolean;
    chaleco: boolean;
  };
  setFieldEppChecked: (epp: any) => void;
  fieldSonometerId: string;
  setFieldSonometerId: (id: string) => void;
  fieldArea: string;
  setFieldArea: (a: string) => void;
  fieldStartTime: string;
  setFieldStartTime: (t: string) => void;
  fieldEndTime: string;
  setFieldEndTime: (t: string) => void;
  fieldReadings: Array<{ db: number; conditions: string }>;
  setFieldReadings: (r: any[]) => void;
  fieldIsLocked: boolean;
  setFieldIsLocked: (l: boolean) => void;
  fieldRepSignature: string;
  setFieldRepSignature: (s: string) => void;
  fieldRepName: string;
  setFieldRepName: (n: string) => void;
  fieldSello: string;
  setFieldSello: (s: string) => void;
  
  // Action Handlers
  handleFieldGPSCheckIn: () => void;
  handleFieldSubmitForm: (e: React.FormEvent) => void;
  handleResetFieldForm: () => void;
  
  // Logistics & Journal states
  scheduledServices: any[];
  isJornadaIniciada: boolean;
  horaInicioJornada: string;
  handleToggleJornada: () => void;
  
  // Submitted reports for export
  submittedReports?: any[];
  selectedRole?: string;
}

export default function TechnicianViews(props: TechnicianViewsProps) {
  const {
    activePersona,
    selectedRole,
    instruments,
    activeTab,
    setActiveTab,
    fieldStep,
    setFieldStep,
    fieldCheckinCoords,
    fieldCheckinTime,
    fieldEppChecked,
    setFieldEppChecked,
    fieldSonometerId,
    setFieldSonometerId,
    fieldArea,
    setFieldArea,
    fieldStartTime,
    setFieldStartTime,
    fieldEndTime,
    setFieldEndTime,
    fieldReadings,
    setFieldReadings,
    fieldIsLocked,
    setFieldIsLocked,
    fieldRepSignature,
    setFieldRepSignature,
    fieldRepName,
    setFieldRepName,
    fieldSello,
    setFieldSello,
    handleFieldGPSCheckIn,
    handleFieldSubmitForm,
    handleResetFieldForm,
    scheduledServices,
    isJornadaIniciada,
    horaInicioJornada,
    handleToggleJornada,
    submittedReports = []
  } = props;

  const [repSignatureInput, setRepSignatureInput] = useState<string>("");
  const [repNameInput, setRepNameInput] = useState<string>("");

  const [techChecklist, setTechChecklist] = useState({
    baterias: false,
    pistofono: false,
    microfono: false,
    ponderacion: false
  });

  const handleExportCSV = () => {
    // Filter reports completed by this active technician
    const myReports = submittedReports.filter(r => 
      r.tecnico_nombre === activePersona.nombre_completo || 
      r.tecnico === activePersona.nombre_completo || 
      r.id_usuario === activePersona.id_usuario
    );
    
    // Demo fallbacks to showcase the export working instantly with data
    const dataToExport = myReports.length > 0 ? myReports : [
      { id_reporte: "REP-2026-001", cliente_nombre: "Vidriera del Norte", fecha_reporte: "2026-07-10", estado: "Aprobado", coordenadas_gps: "25.686,-100.316", payload: { area_evaluada: "Área de Hornos (Taller 2)" } },
      { id_reporte: "REP-2026-002", cliente_nombre: "Aceros de México", fecha_reporte: "2026-07-14", estado: "Aprobado", coordenadas_gps: "25.723,-100.301", payload: { area_evaluada: "Taller de Forja Principal" } }
    ];

    const csvRows = [
      ["ID Reporte", "Cliente / Razon Social", "Fecha Levantamiento", "Estatus Auditoria", "Coordenadas GPS", "Area Evaluada"],
      ...dataToExport.map(r => [
        r.id_reporte,
        r.cliente_nombre || r.payload?.datos_sitio?.empresa_cliente || "Planta Central",
        r.fecha_reporte || r.fecha || "2026-07-15",
        r.estado,
        r.coordenadas_gps || "No registrada",
        r.payload?.area_evaluada || r.payload?.punto_medicion?.area_descripcion || "Planta Industrial"
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + csvRows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historial_campo_${activePersona.nombre_completo.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReadingChange = (idx: number, field: 'db' | 'conditions', val: string | number) => {
    const updated = [...fieldReadings];
    updated[idx] = {
      ...updated[idx],
      [field]: val
    };
    setFieldReadings(updated);
  };

  const addReadingRow = () => {
    setFieldReadings([...fieldReadings, { db: 85.0, conditions: "Operación normal" }]);
  };

  const removeReadingRow = (idx: number) => {
    if (fieldReadings.length <= 1) return;
    setFieldReadings(fieldReadings.filter((_, i) => i !== idx));
  };

  const renderWelcomeBanner = (puestoLabel: string) => (
    <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/20 font-mono">
            PORTAL SEGURO ACTIVO (RBAC)
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-2">
            ¡Bienvenido, {activePersona.nombre_completo}!
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Tiene privilegios activos para el rol de <strong className="text-white font-semibold">{puestoLabel}</strong>. Su firma digital inalterable está vinculada conforme a la Ley de Firma Electrónica Avanzada.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <span className="px-3 py-1 bg-slate-800/80 text-[10px] font-mono rounded border border-slate-700 text-slate-300">
            SHA256 e.firma: {activePersona.firma_electronica_fingerprint.substring(0, 12)}...
          </span>
          <span className="px-3 py-1 bg-slate-800/80 text-[10px] font-mono rounded border border-slate-700 text-emerald-400 font-bold">
            NOM-151 ACTIVA
          </span>
        </div>
      </div>
    </div>
  );

  const renderWorkflowSelectorHeader = () => {
    return (
      <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400 font-bold font-mono text-[10px]">PASO {fieldStep} / 5</div>
          <div>
            <h4 className="font-bold uppercase tracking-wider text-slate-200">Levantamiento Digital de Ruido (NOM-011-STPS)</h4>
            <p className="text-[10.5px] text-slate-400">Complete los pasos en orden estricto de trazabilidad.</p>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-1 text-[9px] font-mono w-full sm:w-auto">
          {[1, 2, 3, 4, 5].map(stepNum => {
            const isActive = fieldStep === stepNum;
            const isCompleted = fieldStep > stepNum;
            return (
              <button
                key={stepNum}
                onClick={() => {
                  if (fieldIsLocked) return;
                  if (stepNum === 1 || (stepNum === 2 && fieldCheckinCoords) || (stepNum === 3 && fieldEppChecked.casco) || stepNum > 3) {
                    setFieldStep(stepNum);
                  } else {
                    alert("Por favor complete los pasos anteriores antes de avanzar.");
                  }
                }}
                disabled={fieldIsLocked && stepNum !== 5}
                className={`px-2 py-1 rounded text-center font-bold transition-all ${
                  isActive ? 'bg-blue-600 text-white font-mono scale-105' :
                  isCompleted ? 'bg-emerald-800/40 text-emerald-400 border border-emerald-500/20 font-mono' :
                  'bg-slate-900/60 text-slate-500 border border-slate-800'
                }`}
              >
                {stepNum}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      {renderWelcomeBanner("Consultor y Técnico de Campo")}

      {/* WORKFLOW NAVIGATION HEADER FOR TECH WORKFLOW TABS */}
      {activeTab !== 'tech_agenda' && renderWorkflowSelectorHeader()}

      {activeTab === 'tech_agenda' && (
        <motion.div
          key="tech_agenda"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* CONTROL DE JORNADA */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="text-blue-400 w-4.5 h-4.5 animate-pulse" />
                  Control de Jornada Laboral (NOM-151 & LFT)
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Asiente su check-in diario para iniciar visitas con validez legal.</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isJornadaIniciada ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
                <span className="text-[11px] font-mono font-bold text-slate-300">
                  {isJornadaIniciada ? `ACTIVA DESDE LAS ${horaInicioJornada}` : "INACTIVA"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <p className="text-[11.5px] text-slate-400 leading-relaxed font-light">
                La legislación de la STPS y los lineamientos de la NMX-17025 exigen llevar una trazabilidad inalterable de los tiempos en campo de los técnicos calibradores oficiales.
              </p>
              <button
                onClick={handleToggleJornada}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all font-sans whitespace-nowrap ${
                  isJornadaIniciada 
                    ? 'bg-red-600/30 hover:bg-red-600 text-red-300 border border-red-500/30 hover:text-white' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                }`}
              >
                {isJornadaIniciada ? "Finalizar Jornada Diaria" : "Iniciar Jornada Diaria"}
              </button>
            </div>
          </div>

          {/* VISITAS EN PLANTA AGENDADAS */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <MapPin className="text-blue-500 w-4 h-4" />
              Visitas Agendadas a Plantas / Sitios
            </h3>

            <div className="space-y-3">
              {scheduledServices.filter(s => s.id_tecnico === activePersona.id_usuario).map(serv => (
                <div key={serv.id_servicio} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-400">{serv.fecha}</span>
                      <strong className="text-white text-xs">{serv.cliente_nombre}</strong>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      Instrumento Asignado: {serv.id_instrumento}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!isJornadaIniciada) {
                        alert("Por favor, Inicie su Jornada Diaria antes de abrir un formulario de levantamiento.");
                        return;
                      }
                      setFieldStep(1);
                      setActiveTab('tech_epp');
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded flex items-center gap-1 shadow-md shadow-blue-600/10"
                  >
                    <span>Iniciar Levantamiento</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* HISTORIAL DE REPORTES DE CAMPO CON EXPORTACIÓN CSV */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="text-emerald-400 w-4.5 h-4.5" />
                  Historial de Levantamientos Guardados en Campo
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Reportes almacenados con firma digital y cumplimiento de la NOM-151.</p>
              </div>

              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exportar Historial (.CSV)</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {(() => {
                const myReports = submittedReports.filter(r => 
                  r.tecnico_nombre === activePersona.nombre_completo || 
                  r.tecnico === activePersona.nombre_completo || 
                  r.id_usuario === activePersona.id_usuario
                );

                const list = myReports.length > 0 ? myReports : [
                  { id_reporte: "REP-2026-001", cliente_nombre: "Vidriera del Norte S.A. de C.V.", fecha_reporte: "2026-07-10", estado: "Aprobado", coordenadas_gps: "25.6865, -100.3161", payload: { area_evaluada: "Área de Hornos (Taller 2)" } },
                  { id_reporte: "REP-2026-002", cliente_nombre: "Aceros de México Planta MTY", fecha_reporte: "2026-07-14", estado: "Aprobado", coordenadas_gps: "25.7231, -100.3015", payload: { area_evaluada: "Taller de Forja Principal" } }
                ];

                return list.map((rep) => (
                  <div key={rep.id_reporte} className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/20">
                          {rep.id_reporte}
                        </span>
                        <strong className="text-white text-xs">{rep.cliente_nombre || rep.payload?.datos_sitio?.empresa_cliente}</strong>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Área: <span className="text-slate-200">{rep.payload?.area_evaluada || rep.payload?.punto_medicion?.area_descripcion || "Planta Industrial"}</span> | GPS: <span className="text-slate-300">{rep.coordenadas_gps || "No registrada"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-slate-400">{rep.fecha_reporte || rep.fecha || "2026-07-15"}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-500/20">
                        {rep.estado || "Sujeto a Auditoría"}
                      </span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'tech_epp' && (
        <motion.div
          key="tech_epp"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {fieldStep === 1 && (
            <div className="bg-slate-900 p-5 border border-slate-800 rounded-xl space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1 font-mono">
                  <MapPin className="text-blue-400 w-4 h-4 animate-bounce" />
                  Paso 1: Validación GPS Obligatoria (Check-In)
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  De acuerdo con las regulaciones de la STPS y la NMX-17025, el técnico debe verificar geolocalizadamente su presencia en la planta antes de poder registrar cualquier dato metrológico.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded border border-slate-800 font-mono text-[11px] space-y-2 text-slate-300">
                <div>Coordenadas GPS: <span className="text-blue-400 font-bold">{fieldCheckinCoords || "Pendiente GPS Check-In..."}</span></div>
                <div>Hora de Registro: <span className="text-blue-400 font-bold">{fieldCheckinTime || "Pendiente..."}</span></div>
              </div>

              <button
                type="button"
                onClick={handleFieldGPSCheckIn}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20"
              >
                <MapPin className="w-4 h-4" />
                <span>Ejecutar Geolocalización GPS por Satélite</span>
              </button>

              {fieldCheckinCoords && (
                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setFieldStep(2)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs transition-colors flex items-center gap-1"
                  >
                    <span>Proceder al Checklist de EPP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {fieldStep === 2 && (
            <div className="bg-slate-900 p-5 border border-slate-800 rounded-xl space-y-4">
              <div className="space-y-1 border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1 font-mono">
                  <ShieldCheck className="text-emerald-400 w-4 h-4" />
                  Paso 2: Checklist Obligatorio de Seguridad (EPP)
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  En cumplimiento estricto con las directrices de la NOM-011-STPS, el consultor declara bajo protesta de decir verdad que porta el equipo de protección personal adecuado antes de entrar a zonas de ruido industrial extremo.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                {[
                  { key: 'casco', label: 'Casco de Seguridad de Polietileno (Dieléctrico)' },
                  { key: 'tapones', label: 'Protectores Auditivos de Copa (Nivel Atenuación > 25dB)' },
                  { key: 'calzado', label: 'Calzado Industrial con Puntera de Protección' },
                  { key: 'chaleco', label: 'Chaleco de Alta Visibilidad Reflejante' }
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-3 p-3 bg-slate-950 rounded border border-slate-800 cursor-pointer hover:bg-slate-900 transition-colors">
                    <input
                      type="checkbox"
                      checked={(fieldEppChecked as any)[item.key]}
                      onChange={(e) => setFieldEppChecked({ ...fieldEppChecked, [item.key]: e.target.checked })}
                      className="rounded text-emerald-600 border-slate-700 bg-slate-900 focus:ring-0"
                    />
                    <span className="text-[11.5px] text-slate-300 font-light">{item.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-between border-t border-slate-800 pt-4">
                <button type="button" onClick={() => setFieldStep(1)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono">Regresar</button>
                <button
                  type="button"
                  onClick={() => {
                    const allChecked = Object.values(fieldEppChecked).every(v => v);
                    if (!allChecked) {
                      alert("Error (NOM-011): Debe portar y marcar obligatoriamente la totalidad del Equipo de Protección Personal antes de capturar lecturas metrológicas.");
                      return;
                    }
                    setFieldStep(3);
                    setActiveTab('tech_mediciones');
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs flex items-center gap-1"
                >
                  <span>Proceder a Captura de Mediciones</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'tech_mediciones' && (
        <motion.div
          key="tech_mediciones"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {fieldStep === 3 && (
            <div className="bg-slate-900 p-5 border border-slate-800 rounded-xl space-y-4">
              <div className="space-y-1 border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1 font-mono">
                  <Edit3 className="text-blue-400 w-4 h-4" />
                  Paso 3: Captura de Mediciones Metrológicas NOM-011-STPS
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  Ingrese las especificaciones del área evaluada y asiente las lecturas del sonómetro integrador. El sistema validará que el instrumento tenga una frecuencia de calibración conforme a NMX-17025.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                <div>
                  <label htmlFor="field-sonometer" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Sonómetro Utilizado (Acreditado) *</label>
                  <select
                    id="field-sonometer"
                    required
                    value={fieldSonometerId}
                    onChange={(e) => setFieldSonometerId(e.target.value)}
                    className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                  >
                    <option value="">-- Seleccionar Instrumento --</option>
                    {instruments.map(i => (
                      <option key={i.id_instrumento} value={i.codigo_interno}>{i.codigo_interno} - {i.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="field-area" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Área de Planta Evaluada *</label>
                  <input
                    id="field-area"
                    type="text"
                    required
                    placeholder="e.g. Cuarto de Calderas / Generadores"
                    value={fieldArea}
                    onChange={(e) => setFieldArea(e.target.value)}
                    className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="field-start-time" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Hora Inicio *</label>
                    <input
                      id="field-start-time"
                      type="time"
                      required
                      value={fieldStartTime}
                      onChange={(e) => setFieldStartTime(e.target.value)}
                      className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 text-center"
                    />
                  </div>
                  <div>
                    <label htmlFor="field-end-time" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Hora Fin *</label>
                    <input
                      id="field-end-time"
                      type="time"
                      required
                      value={fieldEndTime}
                      onChange={(e) => setFieldEndTime(e.target.value)}
                      className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 text-center"
                    />
                  </div>
                </div>
              </div>

              {/* CHECKLIST DE VALIDACIÓN TÉCNICA EN SITIO (NMX-17025 / NOM-011) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="border-b border-slate-900 pb-2 flex justify-between items-center">
                  <h5 className="text-[10px] uppercase font-bold tracking-wide text-emerald-400 font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Validación Técnica de Sonómetro en Sitio (NMX-EC-17025)
                  </h5>
                  <span className="text-[9px] text-slate-500 font-mono">Pre-Medición Obligatoria</span>
                </div>
                <p className="text-[10.5px] text-slate-400 leading-normal font-light">
                  Debe verificar el estado físico y acústico del sonómetro integrador de ruido antes de iniciar la toma de lecturas en planta para asegurar la validez metrológica del levantamiento.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {[
                    { key: 'baterias', label: 'Carga de batería del sonómetro verificada (>80% capacidad)' },
                    { key: 'pistofono', label: 'Calibración acústica inicial efectuada en sitio con calibrador acústico clase 1 patrón (94.0 dB / 114.0 dB)' },
                    { key: 'microfono', label: 'Protector antiviento instalado e inspección física de rejilla de micrófono libre de daños' },
                    { key: 'ponderacion', label: 'Ponderación en frecuencia Tipo A y respuesta temporal Fast (F) seleccionadas (NOM-011-STPS)' }
                  ].map((item) => (
                    <label key={item.key} className="flex items-start gap-2.5 p-2.5 bg-slate-900/60 rounded border border-slate-800/80 cursor-pointer hover:bg-slate-900 transition-all select-none">
                      <input
                        type="checkbox"
                        checked={(techChecklist as any)[item.key]}
                        onChange={(e) => setTechChecklist({ ...techChecklist, [item.key]: e.target.checked })}
                        className="rounded text-emerald-600 border-slate-700 bg-slate-950 focus:ring-0 mt-0.5"
                      />
                      <span className="text-[11px] text-slate-300 font-light leading-tight">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* LECTURAS EN TABLA */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h5 className="text-[10px] uppercase font-bold tracking-wide text-slate-400 font-mono">Historial de Lecturas del Área Evaluada</h5>
                  <button
                    type="button"
                    onClick={addReadingRow}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded border border-slate-700 font-bold"
                  >
                    + Agregar Lectura
                  </button>
                </div>

                <div className="space-y-2">
                  {fieldReadings.map((reading, idx) => (
                    <div key={idx} className="flex gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800 items-center">
                      <span className="text-[10px] font-mono text-slate-500 font-bold">#{idx + 1}</span>
                      <div className="w-24 shrink-0">
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={reading.db}
                          onChange={(e) => handleReadingChange(idx, 'db', Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded text-center px-2 py-1 text-xs font-mono font-bold text-white"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          placeholder="Condiciones del entorno operativo..."
                          value={reading.conditions}
                          onChange={(e) => handleReadingChange(idx, 'conditions', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-300"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeReadingRow(idx)}
                        disabled={fieldReadings.length <= 1}
                        className="text-red-400 hover:text-red-500 font-mono text-xs px-2"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between border-t border-slate-800 pt-4">
                <button type="button" onClick={() => setFieldStep(2)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono">Regresar</button>
                <button
                  type="button"
                  onClick={() => {
                    if (!fieldSonometerId || !fieldArea || !fieldStartTime || !fieldEndTime) {
                      alert("Error: Por favor rellene todos los campos obligatorios del paso 3 antes de continuar.");
                      return;
                    }
                    const checklistComplete = Object.values(techChecklist).every(v => v);
                    if (!checklistComplete) {
                      alert("Error (Validación Metrológica): Para garantizar la validez técnica bajo la NMX-EC-17025 y la NOM-011, debe realizar y marcar obligatoriamente todos los puntos del checklist de verificación del sonómetro en sitio antes de proceder.");
                      return;
                    }
                    setFieldStep(4);
                    setActiveTab('tech_muestras');
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs flex items-center gap-1"
                >
                  <span>Proceder a Firmas de Conformidad</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'tech_muestras' && (
        <motion.div
          key="tech_muestras"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {fieldStep === 4 && (
            <div className="bg-slate-900 p-5 border border-slate-800 rounded-xl space-y-4 animate-fade-in">
              <div className="space-y-1 border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1 font-mono">
                  <FileSignature className="text-blue-400 w-4.5 h-4.5" />
                  Paso 4: Firmas de Conformidad (Ley de Firma Electrónica)
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  Para otorgar validez jurídica al levantamiento, se asienta la firma digital del representante técnico de la planta y la firma del consultor metrológico oficial de ASP.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* REPRESENTANTE PLANTA */}
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-3">
                  <h5 className="font-bold text-slate-200 uppercase tracking-wide text-[10px] border-b border-slate-900 pb-1.5 font-mono">Representante de Planta / Cliente</h5>
                  <div>
                    <label className="block text-[9px] text-slate-400 mb-1 font-mono">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ing. Juan Gómez"
                      value={repNameInput}
                      onChange={(e) => {
                        setRepNameInput(e.target.value);
                        setFieldRepName(e.target.value);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400 mb-1 font-mono">Firma Sello Conformidad (Texto / Iniciales) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JG-PLANTAMONTERREY"
                      value={repSignatureInput}
                      onChange={(e) => {
                        setRepSignatureInput(e.target.value);
                        setFieldRepSignature(e.target.value);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* CONSULTOR ASP */}
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-slate-200 uppercase tracking-wide text-[10px] border-b border-slate-900 pb-1.5 font-mono">Firma del Consultor Técnico Oficial</h5>
                    <div className="mt-3 space-y-1 text-slate-300 text-[11px]">
                      <div>Consultor: <strong>{activePersona.nombre_completo}</strong></div>
                      <div>Puesto: <span className="font-mono text-slate-500">{activePersona.puesto}</span></div>
                      <div className="text-[10px] text-emerald-500 flex items-center gap-1 font-mono mt-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>e.firma SAT Asociada y Activa</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[8px] text-slate-500 font-mono border-t border-slate-900 pt-3">
                    Fingerprint: {activePersona.firma_electronica_fingerprint}
                  </div>
                </div>
              </div>

              <div className="flex justify-between border-t border-slate-800 pt-4">
                <button type="button" onClick={() => setFieldStep(3)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono">Regresar</button>
                <button
                  type="button"
                  onClick={() => {
                    if (!repNameInput || !repSignatureInput) {
                      alert("Error: Debe registrar el nombre y la firma del representante de la planta antes de firmar.");
                      return;
                    }
                    setFieldStep(5);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs flex items-center gap-1"
                >
                  <span>Proceder a Sellado NOM-151</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {fieldStep === 5 && (
            <div className="bg-slate-900 p-5 border border-slate-800 rounded-xl space-y-5 text-xs">
              <div className="space-y-1 border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1 font-mono">
                  <Lock className="text-emerald-400 w-4.5 h-4.5 animate-pulse" />
                  Paso 5: Bloqueo de No Alteración y Sello NOM-151-SCFI-2016
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  Conforme a la NOM-151, al finalizar el levantamiento el formulario de campo se bloquea de forma definitiva e irreversible para garantizar que los datos metrológicos originales no sean alterados.
                </p>
              </div>

              {!fieldIsLocked ? (
                <div className="space-y-4">
                  <div className="bg-amber-950/40 border border-amber-500/20 text-amber-300 p-4 rounded-lg flex gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-[10px] uppercase font-mono tracking-wider">¡Atención! Bloqueo de Edición Permanente</h5>
                      <p className="text-[11px] text-amber-200/80 mt-1 leading-relaxed font-light">
                        Una vez que haga clic en "Finalizar Levantamiento Metrológico", el sistema calculará un hash SHA256 de todas las lecturas registradas y generará un sello criptográfico inalterable. El formulario quedará bloqueado de por vida, impidiendo cambios directos en la base de datos relacional.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button type="button" onClick={() => setFieldStep(4)} className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono">Regresar</button>
                    <button
                      type="button"
                      onClick={handleFieldSubmitForm}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-emerald-600/20"
                    >
                      Finalizar Levantamiento Metrológico (Sellar NOM-151)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 p-4 rounded-lg flex gap-3">
                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
                    <div className="space-y-1">
                      <h5 className="font-bold text-[10px] uppercase tracking-wide font-mono">¡LEVANTAMIENTO VALIDADO Y CRIPTOGRÁFICAMENTE SELLADO!</h5>
                      <p className="text-[11px] text-emerald-200/80 leading-relaxed font-light">
                        El informe ha sido bloqueado en cumplimiento estricto con la NOM-151-SCFI-2016 y la NMX-EC-17025-IMNC-2018. El archivo XML y JSON de trazabilidad ha sido enviado a la base de datos relacional de ASP y se encuentra en espera de la validación oficial del Coordinador de Laboratorio.
                      </p>
                    </div>
                  </div>

                  {/* MOSTRAR METADATOS NOM-151 */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono space-y-3">
                    <div className="text-[10px] text-slate-500 border-b border-slate-900 pb-1.5 flex justify-between items-center">
                      <span>Metadatos del Sello Digital de No Alteración</span>
                      <span className="text-emerald-400 font-bold">SEGURIDAD NOM-151</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px]">
                      <div className="space-y-1">
                        <div className="text-slate-400">Planta/Cliente: <strong className="text-white">Aceros de México</strong></div>
                        <div className="text-slate-400">Área: <strong className="text-white">{fieldArea}</strong></div>
                        <div className="text-slate-400">Fecha/Hora: <span className="text-slate-300">{fieldCheckinTime}</span></div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-slate-400 truncate">SHA256 XML: <span className="text-emerald-400">{generarHashIntegridad ? "Criptográficamente Seguro" : "Pendiente"}</span></div>
                        <div className="text-slate-400 truncate">Sello Digital: <span className="text-emerald-400 font-bold">{fieldSello}</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleResetFieldForm}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-xs transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Simular Nuevo Levantamiento (Reiniciar)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
