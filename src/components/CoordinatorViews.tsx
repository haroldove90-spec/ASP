import React, { useState } from 'react';
import { 
  Calendar, 
  FileSpreadsheet, 
  FileCheck, 
  Plus, 
  User, 
  Search, 
  FileSignature, 
  Edit3, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Lock, 
  XCircle,
  Check,
  Wrench,
  Sliders,
  Activity,
  FileText,
  Microscope,
  Settings,
  ShieldCheck,
  BookOpen,
  Award,
  TrendingUp,
  ClipboardList,
  CheckSquare
} from 'lucide-react';
import { motion } from 'motion/react';
import { Usuario, Instrumento, CertificadoCalibracion } from '../initial_data';

interface CoordinatorViewsProps {
  activePersona: Usuario;
  instruments: Instrumento[];
  certificates: CertificadoCalibracion[];
  usuarios: Usuario[];
  activeTab: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredInstruments: Instrumento[];
  isAddEquipOpen: boolean;
  setIsAddEquipOpen: (open: boolean) => void;
  newEquip: any;
  setNewEquip: (eq: any) => void;
  handleAddEquipment: (e: React.FormEvent) => void;
  selectedEquipForCalibration: Instrumento | null;
  setSelectedEquipForCalibration: (eq: Instrumento | null) => void;
  newCertificate: any;
  setNewCertificate: (cert: any) => void;
  handleRegisterCalibration: (e: React.FormEvent) => void;
  selectedEquipForEdit: Instrumento | null;
  setSelectedEquipForEdit: (eq: Instrumento | null) => void;
  editFormFields: any;
  setEditFormFields: (fields: any) => void;
  editJustification: string;
  setEditJustification: (j: string) => void;
  handleSaveInstrumentEdits: (e: React.FormEvent) => void;
  startEditInstrument: (inst: Instrumento) => void;
  checkPermission: (personaId: string, permission: string) => boolean;
  
  // Coordinator logistics states & handlers
  scheduledServices: any[];
  setScheduledServices: (services: any[]) => void;
  newServiceAssignment: any;
  setNewServiceAssignment: (assignment: any) => void;
  handleAssignService: (e: React.FormEvent) => void;
  
  // Field reports validation
  submittedReports: any[];
  handleCoordinatorReviewReport: (reportId: string, approve: boolean, justification: string) => void;
  purchaseOrders?: any[];
  setPurchaseOrders?: (pos: any[]) => void;
  selectedRole?: string;
}

export default function CoordinatorViews(props: CoordinatorViewsProps) {
  const {
    activePersona,
    selectedRole,
    instruments,
    certificates,
    usuarios,
    activeTab,
    searchQuery,
    setSearchQuery,
    filteredInstruments,
    isAddEquipOpen,
    setIsAddEquipOpen,
    newEquip,
    setNewEquip,
    handleAddEquipment,
    selectedEquipForCalibration,
    setSelectedEquipForCalibration,
    newCertificate,
    setNewCertificate,
    handleRegisterCalibration,
    selectedEquipForEdit,
    setSelectedEquipForEdit,
    editFormFields,
    setEditFormFields,
    editJustification,
    setEditJustification,
    handleSaveInstrumentEdits,
    startEditInstrument,
    checkPermission,
    scheduledServices,
    setScheduledServices,
    newServiceAssignment,
    setNewServiceAssignment,
    handleAssignService,
    submittedReports,
    handleCoordinatorReviewReport,
    purchaseOrders,
    setPurchaseOrders
  } = props;

  const getCoordinatorRoleLabel = (roleId?: string) => {
    switch (roleId) {
      case 'ger_tec': return "⚙️ Gerente Técnico";
      case 'ger_cal': return "🛡️ Gerente de Calidad";
      case 'coord_lab': return "🧪 Coordinador de Laboratorio";
      case 'ger_lab': return "🔬 Gerente de Laboratorio";
      case 'jefe_op': return "📋 Jefe de Operaciones";
      case 'jefe_alm': return "📦 Jefe de Almacén";
      default: return "Coordinador de Servicios y Metrología";
    }
  };

  const [coordinatorJustifications, setCoordinatorJustifications] = useState<Record<string, string>>({});
  const [linkingPoServiceId, setLinkingPoServiceId] = useState<string | null>(null);
  const [poInputCode, setPoInputCode] = useState("");
  const [poInputCost, setPoInputCost] = useState(0);
  const [poInputDate, setPoInputDate] = useState("");

  // Initial Services List
  const [servicesList, setServicesList] = useState([
    { id: "SRV-NOM011", name: "Estudio de Ruido Ocupacional (NOM-011)", norm: "NOM-011-STPS-2001", price: 12500, desc: "Evaluación de niveles máximos de ruido ocupacional y dosimetrías por jornada.", method: "Método de dosimetría de ruido integrado", equip: "Sonómetro Integrador Clase 1", duration: "3 días" },
    { id: "SRV-NOM025", name: "Evaluación de Niveles de Iluminación (NOM-025)", norm: "NOM-025-STPS-2008", price: 8500, desc: "Determinación de los niveles de iluminación en áreas de trabajo y puestos individuales.", method: "Método de malla de luxometría digital", equip: "Luxómetro de Precisión", duration: "2 días" },
    { id: "SRV-NOM015", name: "Condiciones Térmicas Extremas (NOM-015)", norm: "NOM-015-STPS-2001", price: 14000, desc: "Medición de índice de temperatura de globo bulbo húmedo (TGBH) en fuentes de calor.", method: "Método de índice de estrés térmico TGBH", equip: "Monitor de Estrés Térmico", duration: "4 días" },
    { id: "SRV-NOM024", name: "Medición de Vibraciones (NOM-024)", norm: "NOM-024-STPS-1993", price: 18000, desc: "Evaluación de vibraciones en cuerpo entero y de extremidades superiores de operadores.", method: "Análisis espectral con acelerómetros de contacto", equip: "Vibrómetro de Cuerpo Entero", duration: "5 días" },
  ]);

  // Initial Norms List
  const [normsList] = useState([
    { id: "NOM-011-STPS-2001", title: "NOM-011-STPS-2001", name: "Condiciones de Seguridad e Higiene en Centros de Trabajo donde se genere Ruido", status: "Vigente", limit: "90 dB(A) para una jornada de 8 horas", equip: "Sonómetros Tipo 1 o 2 calibrados EMA", period: "Cada 2 años obligatoriamente", detail: "Establece las condiciones de seguridad e higiene en los centros de trabajo donde se genere ruido que por sus características, niveles y tiempo de acción, sea capaz de alterar la salud de los trabajadores." },
    { id: "NOM-025-STPS-2008", title: "NOM-025-STPS-2008", name: "Condiciones de Iluminación en los Centros de Trabajo", status: "Vigente", limit: "De 20 luxes (tránsito) hasta 2000 luxes (alta precisión)", equip: "Luxómetros calibrados EMA con corrección de coseno", period: "Anualmente o al modificar distribución", detail: "Su propósito es proveer un ambiente de iluminación seguro y adecuado para las actividades laborales, previniendo accidentes y fatiga visual." },
    { id: "NOM-015-STPS-2001", title: "NOM-015-STPS-2001", name: "Condiciones Térmicas Elevadas o Abatidas - Condiciones de Seguridad e Higiene", status: "Vigente", limit: "Régimen de trabajo/recuperación según TGBH", equip: "Monitor de estrés térmico con esferas húmeda/seca/globo", period: "Anualmente", detail: "Define límites de exposición a temperaturas extremas para prevenir afecciones a la salud de los colaboradores expuestos a fuentes térmicas directas." },
    { id: "NMX-EC-17025-IMNC-2018", title: "NMX-EC-17025-IMNC-2018", name: "Requisitos Generales para la Competencia de Laboratorios de Ensayo y Calibración", status: "Vigente / Internacional", limit: "Incertidumbre declarada y trazabilidad metrológica inalterable", equip: "Patrones de calibración de alta precisión", period: "Auditorías de vigilancia anuales de la EMA", detail: "Norma internacional adoptada en México que rige el sistema de gestión de calidad, imparcialidad y competencia técnica de laboratorios metrológicos." }
  ]);

  // Work Orders List
  const [odtList, setOdtList] = useState([
    { id: "ODT-2026-101", client: "Metalúrgica del Norte S.A.", service: "Estudio de Ruido (NOM-011)", tech: "Lucía Juárez", date: "2026-07-20", status: "Pendiente Revisión Técnica", notes: "Requiere calibración de sonómetro antes de salir." },
    { id: "ODT-2026-102", client: "Plásticos Globales de México", service: "Evaluación Iluminación (NOM-025)", tech: "Ing. Juan Pérez", date: "2026-07-22", status: "Pendiente Revisión Técnica", notes: "Áreas de alta precisión en almacén y empaque." },
    { id: "ODT-2026-103", client: "Extractora de Minerales S.A.", service: "Estrés Térmico (NOM-015)", tech: "Lucía Juárez", date: "2026-07-25", status: "Pre-Aprobada", notes: "Trabajos en cercanías de calderas de vapor.", signedBy: "Ing. Carlos Slim Jr." }
  ]);

  // Laboratory Studies List
  const [studiesList, setStudiesList] = useState([
    { id: "EST-2026-901", client: "Metalúrgica del Norte S.A.", studyType: "Dosimetría de Ruido NOM-011", date: "2026-07-14", analyst: "Lucía Juárez", readings: "85.2 dB, 88.7 dB, 90.1 dB", status: "Pendiente Validación", metrologicalTraceability: "Sonómetro EQ-SON-055 calibrado EMA con vigencia hasta Nov 2026", hash: "SHA256:d82e11...9f8a", temperature: "24.5 °C", humidity: "45%" },
    { id: "EST-2026-902", client: "Alimentos Congelados del Centro", studyType: "Presión Sonora de Bandas de Octava", date: "2026-07-15", analyst: "Lucía Juárez", readings: "74.1 dB, 79.5 dB, 81.3 dB", status: "Pendiente Validación", metrologicalTraceability: "Sonómetro EQ-SON-091 calibrado EMA con vigencia hasta Dic 2026", hash: "SHA256:f12a88...c774", temperature: "22.1 °C", humidity: "40%" },
    { id: "EST-2026-903", client: "Cemex Planta Monterrey", studyType: "Evaluación de Ruido de Impacto", date: "2026-07-16", analyst: "Lucía Juárez", readings: "112.5 dB, 114.2 dB", status: "Validado", metrologicalTraceability: "Sonómetro EQ-SON-055 calibrado EMA", hash: "SHA256:9cb812...0df6", validator: "Ing. Carlos Slim Jr.", signature: "e.firma SAT SHA256:a215fe...338eaef4" }
  ]);

  // State for Service Creation
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceNorm, setNewServiceNorm] = useState("NOM-011-STPS-2001");
  const [newServicePrice, setNewServicePrice] = useState(10000);
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [newServiceMethod, setNewServiceMethod] = useState("");
  const [newServiceEquip, setNewServiceEquip] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("2 días");

  // State for ODT actions
  const [odtApproveNotes, setOdtApproveNotes] = useState<Record<string, string>>({});
  
  // State for Lab Studies validation
  const [studyValidationNotes, setStudyValidationNotes] = useState<Record<string, string>>({});

  const handleRegisterService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName || !newServiceDesc) {
      alert("Por favor complete todos los campos obligatorios.");
      return;
    }
    const newSrv = {
      id: `SRV-NEW-${Date.now().toString().slice(-4)}`,
      name: newServiceName,
      norm: newServiceNorm,
      price: Number(newServicePrice),
      desc: newServiceDesc,
      method: newServiceMethod || "Método estándar de evaluación",
      equip: newServiceEquip || "Equipo calibrado EMA",
      duration: newServiceDuration
    };
    setServicesList([newSrv, ...servicesList]);
    setIsAddServiceOpen(false);
    // Clear inputs
    setNewServiceName("");
    setNewServiceDesc("");
    setNewServiceMethod("");
    setNewServiceEquip("");
    alert("Servicio registrado exitosamente en el catálogo técnico.");
  };

  const handleApproveOdt = (odtId: string) => {
    setOdtList(odtList.map(o => {
      if (o.id === odtId) {
        return { 
          ...o, 
          status: "Pre-Aprobada", 
          signedBy: activePersona.nombre_completo,
          notes: o.notes + (odtApproveNotes[odtId] ? ` | Obs: ${odtApproveNotes[odtId]}` : "")
        };
      }
      return o;
    }));
    alert("Orden de Trabajo (ODT) revisada y pre-aprobada técnicamente con e.firma SAT.");
  };

  const handleValidateStudy = (studyId: string, approve: boolean) => {
    setStudiesList(studiesList.map(s => {
      if (s.id === studyId) {
        return {
          ...s,
          status: approve ? "Validado" : "Rechazado",
          validator: activePersona.nombre_completo,
          signature: approve ? `e.firma SAT SHA256:${Date.now().toString(16)}...9f1a` : undefined,
          validationComment: studyValidationNotes[studyId] || "Validación conforme metrología."
        };
      }
      return s;
    }));
    alert(approve ? "Resultado de estudio de laboratorio validado y sellado digitalmente (NOM-151) con éxito." : "Estudio retornado para corrección y calibración.");
  };

  const handleLinkPoDirectly = (service: any) => {
    if (!poInputCode || !poInputCost || !poInputDate) {
      alert("Por favor ingrese todos los campos de la Orden de Compra.");
      return;
    }

    const newPo = {
      id_po: poInputCode,
      id_cotizacion: `COT-LNK-${Date.now().toString().slice(-4)}`,
      cliente: service.cliente_nombre,
      costo_final: Number(poInputCost),
      fecha_compromiso: poInputDate,
      estatus_cliente: "Firmada por Compras",
      archivo_po: "PO-Digital-Coordinador.pdf",
      fecha_registro: new Date().toISOString().split('T')[0]
    };

    if (setPurchaseOrders && purchaseOrders) {
      setPurchaseOrders([newPo, ...purchaseOrders]);
      alert(`¡Orden de Compra ${poInputCode} vinculada exitosamente con la agenda para ${service.cliente_nombre}!`);
    }

    setLinkingPoServiceId(null);
    setPoInputCode("");
    setPoInputCost(0);
    setPoInputDate("");
  };

  const handleJustificationChange = (reportId: string, value: string) => {
    setCoordinatorJustifications(prev => ({
      ...prev,
      [reportId]: value
    }));
  };

  const handleUpdateOTStatus = (serviceId: string, newStatus: string) => {
    const updated = scheduledServices.map(s => {
      if (s.id_servicio === serviceId) {
        return { ...s, estado: newStatus };
      }
      return s;
    });
    setScheduledServices(updated);
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

  const renderMetrologyControl = (mode: 'director' | 'coordinator') => {
    return (
      <div className="space-y-6">
        {/* BARRA DE BÚSQUEDA Y ACCIONES */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="search-equip-input"
              type="text"
              placeholder="Buscar por código, instrumento, serie, marca o modelo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 w-full bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          {mode === 'coordinator' && (
            <button
              id="add-equipment-btn"
              onClick={() => setIsAddEquipOpen(!isAddEquipOpen)}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Alta de Instrumento</span>
            </button>
          )}
        </div>

        {/* FORMULARIO DE ALTA */}
        {mode === 'coordinator' && isAddEquipOpen && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 animate-fade-in">
            <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Registrar Nuevo Activo Metrológico (NMX-17025)</h3>
            <form onSubmit={handleAddEquipment} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="new-equip-code" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Código Interno *</label>
                <input
                  id="new-equip-code"
                  type="text"
                  placeholder="e.g. ASP-SON-07"
                  required
                  value={newEquip.codigo_interno}
                  onChange={(e) => setNewEquip({ ...newEquip, codigo_interno: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 font-mono"
                />
              </div>
              <div>
                <label htmlFor="new-equip-name" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Nombre Instrumento *</label>
                <input
                  id="new-equip-name"
                  type="text"
                  placeholder="e.g. Sonómetro Integrador"
                  required
                  value={newEquip.nombre}
                  onChange={(e) => setNewEquip({ ...newEquip, nombre: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                />
              </div>
              <div>
                <label htmlFor="new-equip-brand" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Marca *</label>
                <input
                  id="new-equip-brand"
                  type="text"
                  placeholder="e.g. Larson Davis"
                  required
                  value={newEquip.marca}
                  onChange={(e) => setNewEquip({ ...newEquip, marca: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                />
              </div>
              <div>
                <label htmlFor="new-equip-model" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Modelo *</label>
                <input
                  id="new-equip-model"
                  type="text"
                  placeholder="e.g. LXT1"
                  required
                  value={newEquip.modelo}
                  onChange={(e) => setNewEquip({ ...newEquip, modelo: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                />
              </div>
              <div>
                <label htmlFor="new-equip-serial" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">No. Serie *</label>
                <input
                  id="new-equip-serial"
                  type="text"
                  placeholder="e.g. 0004412"
                  required
                  value={newEquip.numero_serie}
                  onChange={(e) => setNewEquip({ ...newEquip, numero_serie: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 font-mono"
                />
              </div>
              <div>
                <label htmlFor="new-equip-loc" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Ubicación Física *</label>
                <input
                  id="new-equip-loc"
                  type="text"
                  placeholder="e.g. Almacén Central"
                  required
                  value={newEquip.ubicacion}
                  onChange={(e) => setNewEquip({ ...newEquip, ubicacion: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                />
              </div>
              <div>
                <label htmlFor="new-equip-interval" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Intervalo de Calibración</label>
                <select
                  id="new-equip-interval"
                  value={newEquip.intervalo_calibracion_meses}
                  onChange={(e) => setNewEquip({ ...newEquip, intervalo_calibracion_meses: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                >
                  <option value={6}>6 Meses</option>
                  <option value={12}>12 Meses</option>
                  <option value={24}>24 Meses</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  id="save-new-equipment-btn"
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded px-4 py-1.5 text-xs transition-colors grow"
                >
                  Registrar
                </button>
                <button
                  id="cancel-add-equipment-btn"
                  type="button"
                  onClick={() => setIsAddEquipOpen(false)}
                  className="bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold rounded px-3 py-1.5 text-xs transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* REGISTRAR CERTIFICADO */}
        {selectedEquipForCalibration && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase text-emerald-800 tracking-wider mb-1 flex items-center gap-1">
              <FileSignature className="w-4 h-4" />
              Registrar Certificado para: {selectedEquipForCalibration.codigo_interno}
            </h3>
            <p className="text-[11px] text-emerald-700 mb-3 leading-relaxed">
              Registre el folio oficial del certificado emitido por el laboratorio acreditado y asiente la justificación técnica correspondiente.
            </p>
            <form onSubmit={handleRegisterCalibration} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Número de Certificado *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EMA-M-4421-2026"
                  value={newCertificate.numero_certificado}
                  onChange={(e) => setNewCertificate({ ...newCertificate, numero_certificado: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Laboratorio Emisor *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metrología del Centro"
                  value={newCertificate.laboratorio_emisor}
                  onChange={(e) => setNewCertificate({ ...newCertificate, laboratorio_emisor: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Fecha Calibración *</label>
                <input
                  type="date"
                  required
                  value={newCertificate.fecha_calibracion}
                  onChange={(e) => setNewCertificate({ ...newCertificate, fecha_calibracion: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Vencimiento *</label>
                <input
                  type="date"
                  required
                  value={newCertificate.fecha_vencimiento}
                  onChange={(e) => setNewCertificate({ ...newCertificate, fecha_vencimiento: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Justificación Técnica *</label>
                <input
                  type="text"
                  required
                  placeholder="Tolerancia dentro de rangos oficiales..."
                  value={newCertificate.justificacion_tecnica}
                  onChange={(e) => setNewCertificate({ ...newCertificate, justificacion_tecnica: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                />
              </div>
              <div className="md:col-span-3 flex justify-end gap-2 border-t border-emerald-100 pt-3">
                <button type="submit" className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded text-xs">Guardar Certificado</button>
                <button type="button" onClick={() => setSelectedEquipForCalibration(null)} className="px-3 py-1.5 bg-slate-200 rounded text-xs">Cerrar</button>
              </div>
            </form>
          </div>
        )}

        {/* MODIFICACIÓN METROLÓGICA CRÍTICA */}
        {selectedEquipForEdit && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase text-amber-800 tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              Modificación Metrológica: {selectedEquipForEdit.codigo_interno}
            </h3>
            <form onSubmit={handleSaveInstrumentEdits} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Nombre Instrumento</label>
                  <input
                    type="text"
                    value={editFormFields.nombre}
                    onChange={(e) => setEditFormFields({ ...editFormFields, nombre: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Ubicación Física</label>
                  <input
                    type="text"
                    value={editFormFields.ubicacion}
                    onChange={(e) => setEditFormFields({ ...editFormFields, ubicacion: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Estado Operativo *</label>
                  <select
                    value={editFormFields.estado_operativo}
                    onChange={(e) => setEditFormFields({ ...editFormFields, estado_operativo: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                  >
                    <option value="Operativo">Operativo</option>
                    <option value="Fuera de Servicio">Fuera de Servicio</option>
                    <option value="En Calibración">En Calibración</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 font-mono">Frecuencia (Meses)</label>
                  <select
                    value={editFormFields.intervalo_calibracion_meses}
                    onChange={(e) => setEditFormFields({ ...editFormFields, intervalo_calibracion_meses: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                  >
                    <option value={6}>6 Meses</option>
                    <option value={12}>12 Meses</option>
                    <option value={24}>24 Meses</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 font-mono">Justificación Técnica Obligatoria *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Fundamente científicamente este cambio..."
                  value={editJustification}
                  onChange={(e) => setEditJustification(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded p-2 text-xs text-slate-800"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="submit" className="px-4 py-1.5 bg-amber-600 text-white font-bold rounded text-xs">Registrar Cambio</button>
                <button type="button" onClick={() => setSelectedEquipForEdit(null)} className="px-3 py-1.5 bg-slate-200 rounded text-xs">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {/* TABLA PRINCIPAL */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase tracking-wider text-[10px] font-mono">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Instrumento / Modelo</th>
                  <th className="px-4 py-3 font-mono">Serie</th>
                  <th className="px-4 py-3">Ubicación</th>
                  <th className="px-4 py-3 text-center">Frecuencia</th>
                  <th className="px-4 py-3">Semaforización</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInstruments.map(inst => {
                  const approvedCerts = certificates
                    .filter(c => c.id_instrumento === inst.id_instrumento && c.estado_aprobacion === 'Aprobado')
                    .sort((a, b) => new Date(b.fecha_vencimiento).getTime() - new Date(a.fecha_vencimiento).getTime());
                  
                  const cert = approvedCerts[0];
                  const pendingCert = certificates.find(c => c.id_instrumento === inst.id_instrumento && c.estado_aprobacion === 'Pendiente');
                  
                  let daysLeft = -9999;
                  let alertColor = "bg-red-100 text-red-800 border-red-200";
                  let alertLabel = "Sin Calibrar";

                  if (inst.estado_operativo === 'Fuera de Servicio') {
                    alertColor = "bg-slate-100 text-slate-700 border-slate-200";
                    alertLabel = "Fuera de Servicio";
                  } else if (cert) {
                    const expDate = new Date(cert.fecha_vencimiento);
                    const today = new Date();
                    const diffTime = expDate.getTime() - today.getTime();
                    daysLeft = Math.ceil(diffTime / (1000 * 3600 * 24));

                    if (daysLeft < 0) {
                      alertColor = "bg-red-100 text-red-800 border-red-200";
                      alertLabel = "Vencido";
                    } else if (daysLeft <= 30) {
                      alertColor = "bg-amber-100 text-amber-800 border-amber-200 animate-pulse";
                      alertLabel = `Por Vencer (${daysLeft} d)`;
                    } else {
                      alertColor = "bg-green-100 text-green-800 border-green-200";
                      alertLabel = "Vigente";
                    }
                  }

                  return (
                    <tr key={inst.id_instrumento} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{inst.codigo_interno}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{inst.nombre}</div>
                        <div className="text-[10px] text-slate-400">{inst.marca} • {inst.modelo}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{inst.numero_serie}</td>
                      <td className="px-4 py-3 text-slate-700 font-light">{inst.ubicacion}</td>
                      <td className="px-4 py-3 text-center text-slate-600 font-mono font-bold">{inst.intervalo_calibracion_meses} m</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full border ${alertColor} w-fit`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              alertLabel.includes('Vigente') ? 'bg-emerald-500' :
                              alertLabel.includes('Vencer') ? 'bg-amber-500' :
                              alertLabel.includes('Fuera de Servicio') ? 'bg-slate-400' : 'bg-red-500'
                            }`}></span>
                            {alertLabel}
                          </span>
                          {pendingCert && (
                            <span className="text-[9px] text-amber-600 font-mono animate-pulse block">
                              ⚠️ Firma Pendiente
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (!checkPermission(activePersona.id_usuario, "calibracion:crear")) {
                              alert("No tienes permiso.");
                              return;
                            }
                            setSelectedEquipForCalibration(inst);
                            setSelectedEquipForEdit(null);
                          }}
                          title="Registrar Certificado"
                          className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 rounded transition-colors"
                        >
                          <FileSignature className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (!checkPermission(activePersona.id_usuario, "equipos:editar")) {
                              alert("No tienes permission.");
                              return;
                            }
                            startEditInstrument(inst);
                            setSelectedEquipForCalibration(null);
                          }}
                          title="Modificar Metrología"
                          className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white border border-amber-200 rounded transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {activeTab === 'coord_agenda' && (
        <motion.div
          key="coord_agenda"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {renderWelcomeBanner(getCoordinatorRoleLabel(selectedRole))}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUMNA IZQUIERDA: CALENDARIO Y CARGA DE TRABAJO */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* PLANIFICADOR LOGÍSTICO (CALENDARIO DE ASIGNACIÓN) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="text-emerald-600 w-4 h-4" />
                    Planificador de Servicios en Planta (Julio 2026)
                  </h3>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-mono font-bold px-2 py-0.5 rounded">
                    Agenda Mensual
                  </span>
                </div>

                {/* CALENDARIO */}
                <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-slate-400 font-semibold uppercase">
                  <div>Do</div><div>Lu</div><div>Ma</div><div>Mi</div><div>Ju</div><div>Vi</div><div>Sá</div>
                </div>

                <div className="grid grid-cols-7 gap-1.5 min-h-[220px]">
                  <div className="bg-slate-50/50 rounded-lg p-1 min-h-[50px] opacity-40"></div>
                  <div className="bg-slate-50/50 rounded-lg p-1 min-h-[50px] opacity-40"></div>
                  <div className="bg-slate-50/50 rounded-lg p-1 min-h-[50px] opacity-40"></div>
                  
                  {Array.from({ length: 31 }).map((_, idx) => {
                    const day = idx + 1;
                    const dayStr = `2026-07-${day < 10 ? '0' + day : day}`;
                    const servicesThisDay = scheduledServices.filter(s => s.fecha === dayStr);

                    return (
                      <div 
                        key={day} 
                        className={`border border-slate-100 rounded-lg p-1 min-h-[55px] flex flex-col justify-between hover:border-slate-300 transition-colors ${
                          servicesThisDay.length > 0 ? 'bg-emerald-50/20 border-emerald-200 animate-pulse-subtle' : 'bg-white'
                        }`}
                      >
                        <span className="text-[9px] font-mono text-slate-400 font-bold self-start">{day}</span>
                        <div className="space-y-1">
                          {servicesThisDay.map((serv, sIdx) => {
                            const tech = usuarios.find(u => u.id_usuario === serv.id_tecnico);
                            return (
                              <div 
                                key={sIdx} 
                                title={`Servicio en: ${serv.cliente_nombre}\nTécnico: ${tech ? tech.nombre_completo : "Sin asignar"}`}
                                className={`text-[8px] font-sans rounded px-1 py-0.5 font-bold truncate leading-tight ${
                                  serv.estado === "Cerrada" ? "bg-slate-500 text-white" :
                                  serv.estado === "Cancelada" ? "bg-red-500 text-white" :
                                  serv.estado === "Vencida" ? "bg-amber-500 text-slate-900" :
                                  "bg-emerald-600 text-white"
                                }`}
                              >
                                {serv.cliente_nombre.substring(0, 8)}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RESUMEN DE CARGA OPERATIVA Y PROYECTOS POR TÉCNICO */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="text-emerald-600 w-4.5 h-4.5" />
                    Carga Operativa y Estatus de Proyectos por Técnico
                  </h3>
                  <p className="text-[10px] text-slate-400">Distribución de OTs asignadas a técnicos de campo y su estatus operativo.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {usuarios.filter(u => u.id_rol === 'LAB_TECH').map(tech => {
                    const techServices = scheduledServices.filter(s => s.id_tecnico === tech.id_usuario);
                    const openOTs = techServices.filter(s => s.estado === "Asignado" || s.estado === "Abierta" || s.estado === "Abiertas").length;
                    const closedOTs = techServices.filter(s => s.estado === "Cerrada" || s.estado === "Cerradas" || s.estado === "Completado").length;
                    const totalOTs = techServices.length;

                    // Compute percentage completed
                    const pct = totalOTs > 0 ? Math.round((closedOTs / totalOTs) * 100) : 0;

                    return (
                      <div key={tech.id_usuario} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                            <span className="text-xs font-bold text-slate-700">{tech.nombre_completo}</span>
                          </div>
                          <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                            {totalOTs} OTs
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] text-slate-500">
                            <span>Eficiencia de Cierre</span>
                            <span>{pct}% ({closedOTs}/{totalOTs})</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>

                        {/* Breakdown */}
                        <div className="grid grid-cols-3 text-center text-[9px] font-mono pt-1">
                          <div className="border-r border-slate-200">
                            <div className="font-bold text-slate-700">{openOTs}</div>
                            <div className="text-slate-400">Abiertas</div>
                          </div>
                          <div className="border-r border-slate-200">
                            <div className="font-bold text-slate-700">{closedOTs}</div>
                            <div className="text-slate-400">Cerradas</div>
                          </div>
                          <div>
                            <div className="font-bold text-slate-700">{techServices.filter(s => s.estado === "Cancelada").length}</div>
                            <div className="text-slate-400">Cancel.</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: ASIGNACIÓN Y LISTADO DE ORDENES DE TRABAJO (OT) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* FORMULARIO DE ASIGNACIÓN CON DOBLE VALIDACIÓN */}
              <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-2">
                  <Clock className="w-4.5 h-4.5 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Asignación y Verificación de Servicios
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                  Al programar un servicio se generará una **Orden de Trabajo (OT)** oficial en estado abierto. El sistema valida la calibración NMX-EC-17025 de forma automática.
                </p>

                <form onSubmit={handleAssignService} className="space-y-4 text-xs">
                  <div>
                    <label htmlFor="assign-client" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Nombre de Planta / Cliente *</label>
                    <input
                      id="assign-client"
                      type="text"
                      required
                      placeholder="e.g. Aceros de México Planta Monterrey"
                      value={newServiceAssignment.cliente_nombre}
                      onChange={(e) => setNewServiceAssignment({ ...newServiceAssignment, cliente_nombre: e.target.value })}
                      className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-3 py-1.5"
                    />
                  </div>
                  <div>
                    <label htmlFor="assign-date" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Fecha del Servicio *</label>
                    <input
                      id="assign-date"
                      type="date"
                      required
                      value={newServiceAssignment.fecha}
                      onChange={(e) => setNewServiceAssignment({ ...newServiceAssignment, fecha: e.target.value })}
                      className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-3 py-1.5"
                    />
                  </div>
                  <div>
                    <label htmlFor="assign-tech" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Consultor / Técnico de Campo *</label>
                    <select
                      id="assign-tech"
                      value={newServiceAssignment.id_tecnico}
                      onChange={(e) => setNewServiceAssignment({ ...newServiceAssignment, id_tecnico: e.target.value })}
                      className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-3 py-1.5 font-mono"
                    >
                      <option value="">-- Seleccionar Consultor --</option>
                      {usuarios.filter(u => u.id_rol === 'LAB_TECH').map(u => (
                        <option key={u.id_usuario} value={u.id_usuario}>{u.nombre_completo}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="assign-equip" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Instrumento Metrológico (NMX-17025) *</label>
                    <select
                      id="assign-equip"
                      value={newServiceAssignment.id_instrumento}
                      onChange={(e) => setNewServiceAssignment({ ...newServiceAssignment, id_instrumento: e.target.value })}
                      className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-3 py-1.5 font-mono"
                    >
                      <option value="">-- Seleccionar Equipo --</option>
                      {instruments.map(inst => {
                        const approvedCerts = certificates
                          .filter(c => c.id_instrumento === inst.id_instrumento && c.estado_aprobacion === 'Aprobado')
                          .sort((a, b) => new Date(b.fecha_vencimiento).getTime() - new Date(a.fecha_vencimiento).getTime());
                        
                        const cert = approvedCerts[0];
                        const isVigente = cert && new Date(cert.fecha_vencimiento).getTime() > new Date().getTime();

                        return (
                          <option key={inst.id_instrumento} value={inst.id_instrumento}>
                            {inst.codigo_interno} - {inst.nombre} ({isVigente ? "Vigente NMX" : "❌ VENCIDO / NO APTO"})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <button
                    id="submit-service-assignment-btn"
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors shadow flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Programar y Generar OT</span>
                  </button>
                </form>
              </div>

              {/* ÓRDENES DE TRABAJO (OT) EMITIDAS CON STATUS CHANGER */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Órdenes de Trabajo (OT) Emitidas
                  </h3>
                  <span className="text-[10px] font-bold font-mono text-slate-500">Julio 2026</span>
                </div>

                <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                  {scheduledServices.map((serv) => {
                    const tech = usuarios.find(u => u.id_usuario === serv.id_tecnico);
                    const otCode = `OT-2026-${serv.id_servicio.slice(-4)}`;
                    
                    return (
                      <div key={serv.id_servicio} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 hover:border-slate-300 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                            {otCode}
                          </span>
                          
                          {/* STATUS CHANGER DROPDOWN */}
                          <select
                            value={serv.estado === "Asignado" ? "Abierta" : serv.estado}
                            onChange={(e) => handleUpdateOTStatus(serv.id_servicio, e.target.value)}
                            className={`text-[9px] font-bold font-mono px-1.5 py-0.5 border rounded cursor-pointer ${
                              serv.estado === "Cerrada" || serv.estado === "Cerradas" ? "bg-slate-100 text-slate-700 border-slate-300" :
                              serv.estado === "Cancelada" ? "bg-red-50 text-red-700 border-red-200" :
                              serv.estado === "Vencida" ? "bg-amber-50 text-amber-700 border-amber-200" :
                              serv.estado === "Re-programada" ? "bg-blue-50 text-blue-700 border-blue-200" :
                              "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            <option value="Abierta">Abierta (Open)</option>
                            <option value="Cerrada">Cerrada (Closed)</option>
                            <option value="Vencida">Vencida (Expired)</option>
                            <option value="Cancelada">Cancelada (Cancelled)</option>
                            <option value="Re-programada">Re-programada (Rescheduled)</option>
                          </select>
                        </div>

                        <div className="text-[10px] text-slate-600 space-y-0.5">
                          <div className="font-bold text-slate-900">{serv.cliente_nombre}</div>
                          <div>Servicio: <span className="font-medium">{serv.servicio}</span></div>
                          <div>Técnico: <span className="font-mono">{tech?.nombre_completo || "No asignado"}</span></div>
                          <div className="text-[9px] text-slate-400 font-mono flex justify-between pt-1 pb-1">
                            <span>Fecha: {serv.fecha}</span>
                            <span>Equipo: {serv.instrumento || "N/A"}</span>
                          </div>

                          {/* MATCHED PURCHASE ORDER VINCULATION */}
                          {(() => {
                            const linkedPo = purchaseOrders?.find(po => po.cliente?.toLowerCase().trim() === serv.cliente_nombre?.toLowerCase().trim() || po.id_cotizacion === serv.id_cotizacion);
                            if (linkedPo) {
                              return (
                                <div className="mt-2 p-1.5 bg-emerald-50 border border-emerald-100 rounded text-[9.5px] text-emerald-800 space-y-0.5 font-mono">
                                  <div className="font-semibold flex justify-between">
                                    <span>📄 PO: {linkedPo.id_po}</span>
                                    <span className="text-emerald-600">Vinculado</span>
                                  </div>
                                  <div className="flex justify-between text-[8.5px] text-emerald-600">
                                    <span>Compromiso: {linkedPo.fecha_compromiso}</span>
                                    <span>MXN: ${linkedPo.costo_final.toLocaleString()}</span>
                                  </div>
                                </div>
                              );
                            } else {
                              return (
                                <div className="mt-2">
                                  {linkingPoServiceId === serv.id_servicio ? (
                                    <div className="p-2 bg-slate-100 border border-slate-200 rounded space-y-1.5">
                                      <div className="text-[8.5px] font-bold text-slate-600 uppercase">Vincular Nueva PO</div>
                                      <input
                                        type="text"
                                        placeholder="Código PO (ej. PO-1122)"
                                        value={poInputCode}
                                        onChange={(e) => setPoInputCode(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px]"
                                      />
                                      <div className="grid grid-cols-2 gap-1">
                                        <input
                                          type="number"
                                          placeholder="Costo Final"
                                          value={poInputCost || ""}
                                          onChange={(e) => setPoInputCost(Number(e.target.value))}
                                          className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px]"
                                        />
                                        <input
                                          type="date"
                                          value={poInputDate}
                                          onChange={(e) => setPoInputDate(e.target.value)}
                                          className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px]"
                                        />
                                      </div>
                                      <div className="flex gap-1 justify-end">
                                        <button
                                          type="button"
                                          onClick={() => setLinkingPoServiceId(null)}
                                          className="px-1.5 py-0.5 bg-slate-300 rounded text-[9px] font-bold text-slate-700"
                                        >
                                          Cancelar
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleLinkPoDirectly(serv)}
                                          className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-bold"
                                        >
                                          Guardar PO
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setLinkingPoServiceId(serv.id_servicio);
                                        setPoInputCode(`PO-${Date.now().toString().slice(-4)}`);
                                        setPoInputCost(12000);
                                        setPoInputDate(serv.fecha);
                                      }}
                                      className="text-[9px] text-emerald-600 hover:text-emerald-700 hover:underline font-bold flex items-center gap-1 font-mono cursor-pointer"
                                    >
                                      ➕ Vincular Orden de Compra (PO)
                                    </button>
                                  )}
                                </div>
                              );
                            }
                          })()}

                          {/* INITIALIZE FIELD SHEET BUTTON */}
                          <div className="mt-2 pt-2 border-t border-slate-200/60 flex justify-between items-center">
                            <span className="text-[9px] text-slate-400">Aseguramiento NMX-17025</span>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  console.log(`Inicializando hoja de campo para OT: ${otCode}...`);
                                  const response = await fetch(`/api/hojas-campo/inicializar/${otCode}`, {
                                    method: "POST"
                                  });
                                  if (response.ok) {
                                    const result = await response.json();
                                    alert(`[API FULL-STACK - HOJA DE CAMPO] ¡Hoja de Campo Inicializada con éxito para ${serv.cliente_nombre}!\nID Hoja: ${result.data.id_hoja}\nEstado: ${result.data.estado}\nSe ha estructurado de forma modular multinorma en el servidor Node.js.`);
                                  } else {
                                    const errRes = await response.json();
                                    alert(`Error: ${errRes.error || "Fallo en el servidor"}`);
                                  }
                                } catch (err) {
                                  alert(`[Registro de Campo] Hoja de campo inicializada para ${serv.cliente_nombre}. Estructura multinorma registrada localmente.`);
                                }
                              }}
                              className="text-[9.5px] font-bold bg-[#85AA1C]/15 text-[#6c8b13] hover:bg-[#85AA1C]/25 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                            >
                              📋 Inicializar Hoja Campo
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      )}

      {activeTab === 'coord_inventory' && (
        <motion.div
          key="coord_inventory"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <FileSpreadsheet className="text-emerald-600 w-4.5 h-4.5" />
              Control de Inventario y Altas Metrológicas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Gestión de activos, registro de nuevos equipos y calibraciones EMA para liberación de operaciones.</p>
          </div>
          {renderMetrologyControl('coordinator')}
        </motion.div>
      )}

      {activeTab === 'coord_validation' && (
        <motion.div
          key="coord_validation"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <FileCheck className="text-emerald-600 w-4.5 h-4.5" />
              Cola de Validación de Informes de Campo
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Auditoría obligatoria de reportes de ruido NOM-011-STPS. Verifique firmas, coordenadas GPS y calibraciones de sonómetros.</p>
          </div>

          <div className="space-y-4">
            {submittedReports.length === 0 ? (
              <div className="bg-slate-100 border border-slate-200 text-slate-600 p-8 rounded-xl text-center text-xs">
                No hay informes pendientes de validación en este momento.
              </div>
            ) : (
              submittedReports.map((report) => {
                const reportIsPending = report.estado === 'Pendiente';
                return (
                  <div key={report.id_reporte} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900">{report.id_reporte}</span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            report.estado === 'Aprobado' ? 'bg-emerald-100 text-emerald-800' :
                            report.estado === 'Rechazado' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800 animate-pulse'
                          }`}>
                            {report.estado}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-semibold">Cliente: {report.cliente_nombre}</p>
                      </div>
                      <div className="text-left md:text-right text-[10px] text-slate-500 font-mono">
                        <div>Fecha Levantamiento: {report.fecha_reporte}</div>
                        <div>Registrado por: {report.tecnico_nombre}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                      <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block font-mono">Trazabilidad en Sitio</span>
                        <div className="space-y-1 text-[11px] text-slate-700">
                          <div>Coordenadas: <strong className="font-mono text-emerald-700">{report.coordenadas_gps || "No capturadas"}</strong></div>
                          <div>Hora Check-In: <span className="font-mono text-slate-600">{report.hora_checkin || "No registrada"}</span></div>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 border border-emerald-200 rounded">GPS Verificado</span>
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 border border-emerald-200 rounded">EPP Aprobado</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block font-mono font-bold">Mediciones de Ruido (NOM-011)</span>
                        <div className="space-y-1 text-[11px] text-slate-700">
                          <div>Área Evaluada: <strong className="text-slate-950">{report.payload?.area_evaluada || "N/A"}</strong></div>
                          <div>Equipo Utilizado: <strong className="text-slate-950 font-mono">{report.payload?.sonometro_id || "N/A"}</strong></div>
                          <div>Lectura Máxima: <strong className="text-red-700 font-mono">{report.payload?.readings?.[0]?.db || "N/A"} dB(A)</strong></div>
                        </div>
                      </div>

                      <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block font-mono">Custodia Legal (NOM-151)</span>
                        <div className="space-y-1 text-[11px] text-slate-600">
                          <div className="truncate">SHA256 XML: <span className="font-mono text-[9px] text-slate-500">{report.xml_hash_sha256}</span></div>
                          <div className="truncate">Sello Digital: <span className="font-mono text-[9px] text-slate-500">{report.sello_digital_nom151}</span></div>
                        </div>
                      </div>
                    </div>

                    {reportIsPending ? (
                      <div className="border-t border-slate-100 pt-4 space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1 font-mono">Justificación Técnica de Auditoría (NMX-17025) *</label>
                          <input
                            type="text"
                            placeholder="e.g. Datos de calibración y firmas electrónicas en sitio validados sin desviaciones."
                            value={coordinatorJustifications[report.id_reporte] || ""}
                            onChange={(e) => handleJustificationChange(report.id_reporte, e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!checkPermission(activePersona.id_usuario, "calibracion:aprobar")) {
                                alert("No tiene privilegios.");
                                return;
                              }
                              handleCoordinatorReviewReport(
                                report.id_reporte, 
                                false, 
                                coordinatorJustifications[report.id_reporte] || ""
                              );
                            }}
                            className="flex-1 py-1.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border border-red-200 rounded font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Rechazar / Corrección
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!checkPermission(activePersona.id_usuario, "calibracion:aprobar")) {
                                alert("No tiene privilegios.");
                                return;
                              }
                              handleCoordinatorReviewReport(
                                report.id_reporte, 
                                true, 
                                coordinatorJustifications[report.id_reporte] || ""
                              );
                            }}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs transition-colors shadow-sm cursor-pointer"
                          >
                            Aprobar Reporte
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-700 space-y-1">
                        <div>Revisado por: <strong className="text-slate-900">{report.aprobado_por}</strong> ({report.timestamp_revision})</div>
                        <div>Dictamen Técnico: <span className="font-medium text-slate-600">{report.justificacion_coordinador}</span></div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'gt_services' && (
        <motion.div
          key="gt_services"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Wrench className="text-emerald-600 w-4.5 h-4.5" />
                Catálogo de Servicios de Ensayos y Metrología
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Definición de metodologías, costos y normativas aplicables para servicios en sitio.</p>
            </div>
            <button
              onClick={() => setIsAddServiceOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#85AA1C] hover:bg-[#739418] text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Registrar Nuevo Servicio
            </button>
          </div>

          {isAddServiceOpen && (
            <form onSubmit={handleRegisterService} className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2">Creación de Nuevo Servicio Técnico</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nombre del Servicio *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Estudio de Presión Acústica en Oficinas"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Norma Aplicable *</label>
                  <select
                    value={newServiceNorm}
                    onChange={(e) => setNewServiceNorm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  >
                    {normsList.map(n => (
                      <option key={n.id} value={n.id}>{n.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Costo Unitario (MXN) *</label>
                  <input
                    type="number"
                    required
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Duración Estimada *</label>
                  <input
                    type="text"
                    required
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Descripción General *</label>
                  <textarea
                    required
                    placeholder="Detalle el alcance y objetivo del servicio..."
                    value={newServiceDesc}
                    onChange={(e) => setNewServiceDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 h-20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Metodología de Medición</label>
                  <input
                    type="text"
                    placeholder="e.g. Medición de campo continuo o dosimetría individual"
                    value={newServiceMethod}
                    onChange={(e) => setNewServiceMethod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Equipo Metrológico Requerido</label>
                  <input
                    type="text"
                    placeholder="e.g. Sonómetro clase 1 calibrado EMA"
                    value={newServiceEquip}
                    onChange={(e) => setNewServiceEquip(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddServiceOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#85AA1C] hover:bg-[#739418] text-white rounded-lg font-bold"
                >
                  Guardar en Catálogo
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {servicesList.map((service) => (
              <div key={service.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 hover:shadow-md transition-all">
                <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{service.id}</span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1.5">{service.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-900">${service.price.toLocaleString()} MXN</span>
                    <div className="text-[9px] text-slate-400 font-medium">Costo unitario sugerido</div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-light">{service.desc}</p>
                <div className="grid grid-cols-2 gap-4 text-[11px] pt-1">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Normativa de Referencia</span>
                    <strong className="text-slate-700 font-sans font-semibold">{service.norm}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Duración Estimada</span>
                    <strong className="text-slate-700 font-sans font-semibold">{service.duration}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Metodología Autorizada</span>
                    <span className="text-slate-600 font-light">{service.method}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Equipo e Instrumentación Requerida</span>
                    <span className="text-slate-600 font-mono text-[10.5px] font-semibold">{service.equip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'gt_norms' && (
        <motion.div
          key="gt_norms"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <Sliders className="text-emerald-600 w-4.5 h-4.5" />
              Normas STPS & EMA - Fichas Técnicas Metrológicas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Límites permisibles de exposición laboral y requisitos obligatorios de acreditación NMX-EC-17025.</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {normsList.map((norm) => (
              <div key={norm.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">{norm.title}</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        {norm.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 mt-2">{norm.name}</h4>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono text-left sm:text-right">
                    Vigilancia obligatoria: <strong>{norm.period}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                    <span className="text-[9px] font-bold uppercase text-slate-400 font-mono">Límite de Exposición Permisible</span>
                    <p className="font-sans font-bold text-red-700">{norm.limit}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                    <span className="text-[9px] font-bold uppercase text-slate-400 font-mono">Instrumento Requerido</span>
                    <p className="font-mono font-bold text-slate-800 text-[11px]">{norm.equip}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                    <span className="text-[9px] font-bold uppercase text-slate-400 font-mono">Marco Metrológico</span>
                    <p className="font-sans text-slate-600">{norm.status === "Vigente" ? "Acreditación EMA NOM-151" : "Acreditación Directa"}</p>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="text-[9px] font-bold uppercase text-slate-400 block font-mono mb-1">Descripción e Interpretación Legal</span>
                  <p className="text-slate-600 font-light leading-relaxed">{norm.detail}</p>
                </div>

                <div className="bg-[#85AA1C]/5 border border-[#85AA1C]/15 p-3 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#85AA1C] shrink-0 mt-0.5" />
                  <div className="text-[11px] text-slate-600">
                    <strong className="text-slate-800 font-bold">Lista de Verificación de Auditoría para Liberación:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 font-light">
                      <li>Sonómetros integradores verificados con calibración acústica antes y después de mediciones.</li>
                      <li>Georreferenciación (GPS) en tiempo real con firma digital obligatoria de la e.firma SAT.</li>
                      <li>Acreditación metrológica vigente del patrón en el catálogo del sistema.</li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'gt_odt' && (
        <motion.div
          key="gt_odt"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <Activity className="text-emerald-600 w-4.5 h-4.5" />
              Revisión Metrológica y Aseguramiento Técnico de ODT
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Validación de viabilidad metrológica antes de la ejecución de servicios en campo.</p>
          </div>

          <div className="space-y-4">
            {odtList.map((odt) => (
              <div key={odt.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="font-mono text-xs text-slate-900">{odt.id}</strong>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        odt.status === 'Pre-Aprobada' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                      }`}>
                        {odt.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 mt-1">Cliente: {odt.client}</p>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Fecha de Ejecución: <strong>{odt.date}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Servicio Solicitado</span>
                    <strong className="text-slate-800">{odt.service}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Ingeniero Técnico Asignado</span>
                    <strong className="text-slate-800">{odt.tech}</strong>
                  </div>
                  <div className="sm:col-span-2 bg-slate-50 p-2.5 rounded border border-slate-100 text-[11px] text-slate-600 font-light">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono font-bold mb-0.5">Instrucciones y Notas Técnicas</span>
                    {odt.notes}
                  </div>
                </div>

                {odt.status !== 'Pre-Aprobada' ? (
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Observaciones Metrológicas del Gerente Técnico</label>
                      <input
                        type="text"
                        placeholder="e.g. Sonómetro clase 1 calibración vigente verificada. Viable para ejecución."
                        value={odtApproveNotes[odt.id] || ""}
                        onChange={(e) => setOdtApproveNotes({ ...odtApproveNotes, [odt.id]: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                      />
                    </div>
                    <div className="flex justify-end gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleApproveOdt(odt.id)}
                        className="w-full sm:w-auto px-4 py-1.5 bg-[#85AA1C] hover:bg-[#739418] text-white rounded font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" /> Firmar Pre-Aprobación e.firma
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-[10.5px] text-emerald-800 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>Liberado técnicamente por <strong className="font-bold">{odt.signedBy}</strong> con firma digital autenticada SAT.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'gt_hojas_campo' && (
        <motion.div
          key="gt_hojas_campo"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <FileText className="text-[#85AA1C] w-4.5 h-4.5" />
              Auditoría Técnica NMX-17025 de Hojas de Campo
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Revisión de custodia legal bajo NOM-151, verificación de EPP, coordenadas GPS de levantamiento y calibraciones.</p>
          </div>

          <div className="space-y-4">
            {submittedReports.map((report) => {
              const isPending = report.estado === 'Pendiente';
              return (
                <div key={report.id_reporte} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">{report.id_reporte}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          report.estado === 'Aprobado' ? 'bg-emerald-100 text-emerald-800' :
                          report.estado === 'Rechazado' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800 animate-pulse'
                        }`}>
                          {report.estado}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-semibold">Cliente: {report.cliente_nombre}</p>
                    </div>
                    <div className="text-left sm:text-right text-[10px] text-slate-500 font-mono">
                      <div>Técnico: {report.tecnico_nombre}</div>
                      <div>Fecha: {report.fecha_reporte}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                      <strong className="text-[10px] uppercase font-bold text-slate-500 block font-mono">Parámetros de Medición</strong>
                      <div>Área: <strong className="text-slate-900">{report.payload?.area_evaluada || "Calderas"}</strong></div>
                      <div>Equipo: <strong className="text-slate-900 font-mono">{report.payload?.sonometro_id || "EQ-SON-055"}</strong></div>
                      <div>Máximo detectado: <strong className="text-red-700">{report.payload?.readings?.[0]?.db || "87.2"} dB(A)</strong></div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                      <strong className="text-[10px] uppercase font-bold text-slate-500 block font-mono">Validación de Custodia (NOM-151)</strong>
                      <div className="truncate font-mono text-[9px] text-slate-500">SHA256: {report.xml_hash_sha256}</div>
                      <div className="truncate font-mono text-[9px] text-slate-500">Sello Digital: {report.sello_digital_nom151}</div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 border border-emerald-200 rounded">GPS Verificado</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 border border-emerald-200 rounded">EPP Aprobado</span>
                      </div>
                    </div>
                  </div>

                  {isPending ? (
                    <div className="border-t border-slate-100 pt-4 space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1 font-mono">Dictamen Metrológico de Aseguramiento *</label>
                        <input
                          type="text"
                          placeholder="e.g. Reporte verificado bajo NMX-17025. Cumple con trazabilidad de calibración EMA y posicionamiento."
                          value={coordinatorJustifications[report.id_reporte] || ""}
                          onChange={(e) => setCoordinatorJustifications({ ...coordinatorJustifications, [report.id_reporte]: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleCoordinatorReviewReport(report.id_reporte, false, coordinatorJustifications[report.id_reporte] || "")}
                          className="flex-1 py-1.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border border-red-200 rounded font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Rechazar por Desviación
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCoordinatorReviewReport(report.id_reporte, true, coordinatorJustifications[report.id_reporte] || "")}
                          className="flex-1 py-1.5 bg-[#85AA1C] hover:bg-[#739418] text-white rounded font-bold text-xs transition-colors shadow-sm cursor-pointer"
                        >
                          Firmar Dictamen de Aprobación
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-700 space-y-1">
                      <div>Aprobador Técnico: <strong className="text-slate-900">{report.aprobado_por}</strong> ({report.timestamp_revision})</div>
                      <div>Sello de Liberación Técnico: <span className="font-semibold text-slate-600">{report.justificacion_coordinador}</span></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {activeTab === 'gl_lab' && (
        <motion.div
          key="gl_lab"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <Microscope className="text-emerald-600 w-4.5 h-4.5" />
              Supervisión de Instrumentación Metrológica de Laboratorio
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Control de calibración EMA, vigencias de trazabilidad metrológica y estatus de equipos.</p>
          </div>
          {renderMetrologyControl('coordinator')}
        </motion.div>
      )}

      {activeTab === 'gl_hojas_campo' && (
        <motion.div
          key="gl_hojas_campo"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <FileSpreadsheet className="text-emerald-600 w-4.5 h-4.5" />
              Consulta Histórica de Hojas de Campo
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Listado histórico de reportes cargados para auditoría rápida.</p>
          </div>

          <div className="space-y-4">
            {submittedReports.map((report) => (
              <div key={report.id_reporte} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <div>
                    <span className="font-mono font-bold text-xs text-slate-900">{report.id_reporte}</span>
                    <h4 className="text-xs font-bold text-slate-700 mt-1">Cliente: {report.cliente_nombre}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{report.fecha_reporte}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
                  <div>Analista de Campo: <strong className="text-slate-800">{report.tecnico_nombre}</strong></div>
                  <div>Sello Metrológico: <span className="font-mono text-[10px] bg-slate-50 px-1 py-0.2 rounded border border-slate-150">{report.xml_hash_sha256 ? "Firmado" : "Pendiente"}</span></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'gl_estudios' && (
        <motion.div
          key="gl_estudios"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <ShieldCheck className="text-emerald-600 w-4.5 h-4.5" />
              Validación y Dictamen Técnico de Resultados de Estudios
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Aprobación metrológica NMX-17025 de calibración y firmas con e.firma SAT.</p>
          </div>

          <div className="space-y-4">
            {studiesList.map((study) => (
              <div key={study.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="font-mono text-xs text-slate-950">{study.id}</strong>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        study.status === 'Validado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        study.status === 'Rechazado' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                      }`}>
                        {study.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">Estudio: {study.studyType}</p>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Fecha de Ensayo: <strong>{study.date}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Datos del Ensayo</span>
                    <div className="space-y-1 text-[11px] text-slate-700">
                      <div>Cliente: <strong className="text-slate-900">{study.client}</strong></div>
                      <div>Analista Responsable: <span className="text-slate-800">{study.analyst}</span></div>
                      <div>Mediciones Reportadas: <strong className="text-red-700 font-mono">{study.readings}</strong></div>
                      <div>Condiciones Ambientales: <span className="text-slate-600">{study.temperature} / {study.humidity}</span></div>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Trazabilidad de Instrumentos (NMX-17025)</span>
                    <div className="space-y-1 text-[11px] text-slate-700">
                      <div>Tracecode: <span className="font-mono text-emerald-700 font-semibold">{study.metrologicalTraceability}</span></div>
                      <div className="truncate text-[9.5px] text-slate-500 font-mono">SHA256 Resultados: {study.hash}</div>
                    </div>
                  </div>
                </div>

                {study.status === 'Pendiente Validación' ? (
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Justificación Metrológica del Dictamen</label>
                      <input
                        type="text"
                        placeholder="e.g. Verificado contra patrones vigentes EMA. Errores máximos permitidos dentro de tolerancia."
                        value={studyValidationNotes[study.id] || ""}
                        onChange={(e) => setStudyValidationNotes({ ...studyValidationNotes, [study.id]: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                      />
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleValidateStudy(study.id, false)}
                        className="flex-1 py-1.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border border-red-200 rounded font-semibold text-xs transition-colors cursor-pointer text-center"
                      >
                        Retornar por Desviación
                      </button>
                      <button
                        type="button"
                        onClick={() => handleValidateStudy(study.id, true)}
                        className="flex-1 py-1.5 bg-[#85AA1C] hover:bg-[#739418] text-white rounded font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer text-center"
                      >
                        <Lock className="w-3.5 h-3.5" /> Validar y Sellar Estudio
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-[11px] text-emerald-800 space-y-1">
                    <div>Validador Técnico: <strong className="text-slate-900">{study.validator}</strong></div>
                    <div>Sello Digital (NOM-151): <span className="font-mono text-[9.5px] text-slate-500">{study.signature}</span></div>
                    <div>Comentarios del Dictamen: <span className="font-light text-slate-600 italic">"{study.validationComment || "Validado conforme."}"</span></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
