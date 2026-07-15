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
  Check
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
}

export default function CoordinatorViews(props: CoordinatorViewsProps) {
  const {
    activePersona,
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

  const [coordinatorJustifications, setCoordinatorJustifications] = useState<Record<string, string>>({});
  const [linkingPoServiceId, setLinkingPoServiceId] = useState<string | null>(null);
  const [poInputCode, setPoInputCode] = useState("");
  const [poInputCost, setPoInputCost] = useState(0);
  const [poInputDate, setPoInputDate] = useState("");

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
          {renderWelcomeBanner("Coordinador de Servicios y Metrología")}

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
    </div>
  );
}
