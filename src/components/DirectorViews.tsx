import React, { useState } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Sliders, 
  ShieldCheck, 
  Lock, 
  Key, 
  Hash, 
  FileSignature, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Plus, 
  Edit3, 
  UserCheck, 
  Shield, 
  FileText,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { Usuario, Instrumento, CertificadoCalibracion, AuditLog } from '../initial_data';

interface DirectorViewsProps {
  activePersona: Usuario;
  stats: {
    total: number;
    vigentes: number;
    vencenPronto: number;
    vencidos: number;
    fueraServicio: number;
  };
  financials: {
    totalCotizado: number;
    totalFacturado: number;
    totalRecaudado: number;
    totalPendiente: number;
    totalVencido: number;
  };
  instruments: Instrumento[];
  certificates: CertificadoCalibracion[];
  usuarios: Usuario[];
  auditLogs: AuditLog[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
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
  handleApproveCertificate: (cert: CertificadoCalibracion) => void;
  currentPersonaId: string;
  setCurrentPersonaId: (id: string) => void;
  rbacSimAction: string;
  setRbacSimAction: (a: string) => void;
  rbacSimResult: any;
  setRbacSimResult: (r: any) => void;
  handleTestRbac: (actionId: string) => void;
  checkPermission: (personaId: string, permission: string) => boolean;
  INITIAL_ROLES: any[];
  INITIAL_PERMISOS: any[];
  ROLE_PERMISSIONS_MAP: Record<string, string[]>;
  DB_SCHEMA_SQL: string;
}

export default function DirectorViews(props: DirectorViewsProps) {
  const {
    activePersona,
    stats,
    financials,
    instruments,
    certificates,
    usuarios,
    auditLogs,
    activeTab,
    setActiveTab,
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
    handleApproveCertificate,
    currentPersonaId,
    setCurrentPersonaId,
    rbacSimAction,
    setRbacSimAction,
    rbacSimResult,
    setRbacSimResult,
    handleTestRbac,
    checkPermission,
    INITIAL_ROLES,
    INITIAL_PERMISOS,
    ROLE_PERMISSIONS_MAP,
    DB_SCHEMA_SQL
  } = props;

  const [activeFinTab, setActiveFinTab] = useState<'quotes' | 'invoices'>('invoices');

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

        {/* FORMULARIO DE ALTA (SOLO COORDINADOR) */}
        {mode === 'coordinator' && isAddEquipOpen && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Registrar Nuevo Activo Metrológico (NMX-17025)</h3>
            <form onSubmit={handleAddEquipment} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="new-equip-code" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Código Interno *</label>
                <input
                  id="new-equip-code"
                  type="text"
                  placeholder="e.g. ASP-SON-07"
                  required
                  value={newEquip.codigo_interno}
                  onChange={(e) => setNewEquip({ ...newEquip, codigo_interno: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 font-mono"
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
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
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
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
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
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
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
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 font-mono"
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
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                />
              </div>
              <div>
                <label htmlFor="new-equip-interval" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Intervalo de Calibración</label>
                <select
                  id="new-equip-interval"
                  value={newEquip.intervalo_calibracion_meses}
                  onChange={(e) => setNewEquip({ ...newEquip, intervalo_calibracion_meses: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
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
        {mode === 'coordinator' && selectedEquipForCalibration && (
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
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 font-mono"
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
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Fecha Calibración *</label>
                <input
                  type="date"
                  required
                  value={newCertificate.fecha_calibracion}
                  onChange={(e) => setNewCertificate({ ...newCertificate, fecha_calibracion: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Vencimiento *</label>
                <input
                  type="date"
                  required
                  value={newCertificate.fecha_vencimiento}
                  onChange={(e) => setNewCertificate({ ...newCertificate, fecha_vencimiento: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
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
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                />
              </div>
              <div className="md:col-span-3 flex justify-end gap-2 border-t border-emerald-100 pt-3">
                <button type="submit" className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded text-xs">Guardar Certificado</button>
                <button type="button" onClick={() => setSelectedEquipForCalibration(null)} className="px-3 py-1.5 bg-slate-200 rounded text-xs">Cerrar</button>
              </div>
            </form>
          </div>
        )}

        {/* MODIFICACIÓN METROLÓGICA CRÍTICA (SOLO COORDINADOR) */}
        {mode === 'coordinator' && selectedEquipForEdit && (
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
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Ubicación Física</label>
                  <input
                    type="text"
                    value={editFormFields.ubicacion}
                    onChange={(e) => setEditFormFields({ ...editFormFields, ubicacion: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Estado Operativo *</label>
                  <select
                    value={editFormFields.estado_operativo}
                    onChange={(e) => setEditFormFields({ ...editFormFields, estado_operativo: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                  >
                    <option value="Operativo">Operativo</option>
                    <option value="Fuera de Servicio">Fuera de Servicio</option>
                    <option value="En Calibración">En Calibración</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Frecuencia (Meses)</label>
                  <select
                    value={editFormFields.intervalo_calibracion_meses}
                    onChange={(e) => setEditFormFields({ ...editFormFields, intervalo_calibracion_meses: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                  >
                    <option value={6}>6 Meses</option>
                    <option value={12}>12 Meses</option>
                    <option value={24}>24 Meses</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Justificación Técnica Obligatoria *</label>
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
                  {mode === 'coordinator' && <th className="px-4 py-3 text-right">Acciones</th>}
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
                          <span className={`inline-flex items-center justify-center gap-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full border ${alertColor} w-fit`}>
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
                      {mode === 'coordinator' && (
                        <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
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
                            className="p-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 rounded"
                          >
                            <FileSignature className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (!checkPermission(activePersona.id_usuario, "equipos:editar")) {
                                alert("No tienes permiso.");
                                return;
                              }
                              startEditInstrument(inst);
                              setSelectedEquipForCalibration(null);
                            }}
                            title="Modificar Especificaciones"
                            className="p-1 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white border border-amber-200 rounded"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* HISTORIAL Y FIRMAS */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
            <span>Control de Custodia de Certificados (NOM-151 & e.firma)</span>
            <span className="text-[10px] text-slate-400 font-mono">Trazabilidad Total</span>
          </h3>
          <div className="space-y-3">
            {certificates.map(cert => {
              const inst = instruments.find(i => i.id_instrumento === cert.id_instrumento);
              const isApproved = cert.estado_aprobacion === 'Aprobado';
              const approverUser = usuarios.find(u => u.id_usuario === cert.aprobado_por);

              return (
                <div key={cert.id_certificado} className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">{cert.numero_certificado}</span>
                      <span className="text-[9px] font-mono bg-slate-100 px-1.5 py-0.2 rounded border text-slate-500 uppercase">{inst ? inst.codigo_interno : "Desconocido"}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                        isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>{cert.estado_aprobacion}</span>
                    </div>
                    <p className="text-xs text-slate-700">Laboratorio Emisor: {cert.laboratorio_emisor}</p>
                    <div className="text-[10px] text-slate-500 font-mono flex flex-wrap gap-x-4">
                      <span>Calibrado: {cert.fecha_calibracion}</span>
                      <span className="font-semibold text-slate-700">Vencimiento: {cert.fecha_vencimiento}</span>
                    </div>
                    <div className="text-[9px] font-mono text-slate-400">
                      SHA256 PDF: <span className="text-slate-600">{cert.archivo_hash_sha256}</span>
                    </div>
                  </div>

                  <div className="text-left md:text-right flex flex-col justify-between items-start md:items-end border-t md:border-t-0 border-slate-100 pt-2 md:pt-0">
                    {isApproved ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold font-mono">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>FIRMADO ELECTRÓNICAMENTE</span>
                        </div>
                        <div className="text-[9px] text-slate-500">Por: {approverUser ? approverUser.nombre_completo : "Director Ejecutivo"}</div>
                        <div className="text-[8px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 border rounded">{cert.sello_digital_nom151}</div>
                      </div>
                    ) : (
                      <div className="space-y-1 w-full md:w-auto">
                        <div className="text-[9px] text-amber-600 font-semibold font-mono">⚠️ PENDIENTE DE VALIDACIÓN Y FIRMA</div>
                        {mode === 'director' ? (
                          <button
                            onClick={() => handleApproveCertificate(cert)}
                            className="w-full md:w-auto px-3 py-1 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded text-[10px] transition-colors"
                          >
                            Firmar como Director (Roberto Fernández)
                          </button>
                        ) : (
                          <div className="text-[10px] text-slate-400 italic">Esperando firma del Director Roberto Fernández</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderRbacSection = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {INITIAL_ROLES.map(rol => {
            const permissionsCount = ROLE_PERMISSIONS_MAP[rol.id_rol]?.length || 0;
            return (
              <div key={rol.id_rol} className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-white rounded border border-slate-200 text-slate-700">{rol.id_rol}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Key className="w-3 h-3 text-emerald-500" />
                      {permissionsCount} perms
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-950 mb-1">{rol.nombre}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-light">{rol.descripcion}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Personal y Credenciales Digitales (LFPDPPP)</h3>
            <div className="space-y-3">
              {usuarios.map(user => (
                <div 
                  key={user.id_usuario} 
                  onClick={() => {
                    setCurrentPersonaId(user.id_usuario);
                    setRbacSimResult(null);
                  }}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    currentPersonaId === user.id_usuario 
                      ? 'bg-white border-emerald-500 shadow' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${currentPersonaId === user.id_usuario ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{user.nombre_completo}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{user.email}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-mono font-bold bg-slate-100 px-1 py-0.2 border rounded text-slate-600">{user.id_rol}</span>
                        <span className="text-[9px] font-mono text-slate-400">{user.puesto}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-600 font-mono block font-medium">e.firma SAT</span>
                    <span className="text-[8px] text-slate-400 font-mono block">{user.firma_electronica_fingerprint.substring(0, 16)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-900 text-white rounded-xl p-4 flex flex-col justify-between border border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Simulador de Privilegios Relacionales</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed font-light">
                Evalúe cómo el motor de base de datos SQL procesará las peticiones según el rol asignado al usuario activo. Cambie de usuario a la izquierda para probar privilegios.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Acción a Testear:</label>
                  <select
                    value={rbacSimAction}
                    onChange={(e) => {
                      setRbacSimAction(e.target.value);
                      setRbacSimResult(null);
                    }}
                    className="w-full bg-slate-950 text-xs text-white border border-slate-700 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {INITIAL_PERMISOS.map(perm => (
                      <option key={perm.id_permiso} value={perm.id_permiso}>
                        [{perm.modulo.toUpperCase()}] - {perm.accion.toUpperCase()} ({perm.descripcion})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => handleTestRbac(rbacSimAction)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors shadow flex items-center justify-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Probar Privilegios Relacionales</span>
                </button>
              </div>
            </div>

            {rbacSimResult && (
              <div className={`mt-4 p-3 rounded-lg border font-mono text-xs ${
                rbacSimResult.permitido 
                  ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300' 
                  : 'bg-red-950/80 border-red-500/30 text-red-300'
              }`}>
                <div className="font-bold flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                  {rbacSimResult.permitido ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>ACCESO PERMITIDO (GRANT)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-red-400" />
                      <span>ACCESO DENEGADO (DENY)</span>
                    </>
                  )}
                </div>
                <div className="text-[10px] mt-1 space-y-1 border-t border-white/10 pt-1.5">
                  <div>Usuario: {rbacSimResult.usuario}</div>
                  <div>Rol: {rbacSimResult.rol}</div>
                  <div>Permiso: {rbacSimResult.permiso}</div>
                  <div className="italic text-slate-400 mt-1">{rbacSimResult.motivo}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAuditSection = () => {
    return (
      <div className="space-y-4">
        <div className="bg-slate-900 text-slate-200 p-4 rounded-xl border border-slate-800 flex gap-3">
          <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Garantía Relacional de No Manipulación (Trigger SQL)</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              El motor PostgreSQL implementa el trigger <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-[10px] text-emerald-300">tg_proteger_bitacora</code>. Cualquier intento manual de ejecutar <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-[10px] text-amber-400">UPDATE</code> o <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-[10px] text-red-400">DELETE</code> abortará la transacción con una excepción técnica ineludible.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {auditLogs.map(log => (
            <div key={log.id_log} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500">LOG-#{log.id_log}</span>
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                    log.accion === 'INSERT' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    log.accion === 'UPDATE' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    log.accion === 'SIGN' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                    'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}>
                    {log.accion}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{log.usuario_nombre}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({log.usuario_rol})</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">{log.timestamp}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-[9px] font-mono uppercase font-bold text-slate-400">Tabla: {log.tabla_afectada} (ID: {log.registro_id})</span>
                  <div className="text-[10px] text-slate-700 mt-1 font-semibold">Acción: {log.justificacion_tecnica}</div>
                </div>
                <div className="bg-slate-950 text-emerald-400 p-2.5 rounded font-mono text-[9px] overflow-x-auto">
                  <div className="text-slate-500">// FIRMA NOM-151 COMPACTADA</div>
                  <div className="truncate text-emerald-300">Hash: {log.hash_integridad}</div>
                  <div className="truncate text-slate-400">IP: {log.ip_origen}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {activeTab === 'dir_dashboard' && (
        <motion.div
          key="dir_dashboard"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {renderWelcomeBanner("Director General de Operaciones")}

          {/* MONITORES CLAVE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* ALERTAS CRÍTICAS DE CALIBRACIÓN VENCIDA */}
            <div className="lg:col-span-6 bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="text-red-500 w-4 h-4" />
                  Alertas Críticas de Calibración
                </h3>
                <span className="text-[10px] bg-red-100 text-red-800 font-mono font-bold px-2 py-0.5 rounded-full">
                  NMX-EC-17025
                </span>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {instruments.filter(i => {
                  const certs = certificates.filter(c => c.id_instrumento === i.id_instrumento && c.estado_aprobacion === 'Aprobado');
                  if (certs.length === 0) return true;
                  const expiry = new Date(certs[0].fecha_vencimiento);
                  return expiry.getTime() < new Date().getTime();
                }).map(inst => (
                  <div key={inst.id_instrumento} className="bg-red-50/50 border border-red-100 rounded-lg p-3 flex justify-between items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-red-900">{inst.codigo_interno}</span>
                        <span className="text-[10px] text-red-700">{inst.nombre}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Serie: {inst.numero_serie} • Ubicación: {inst.ubicacion}</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('dir_calibration')}
                      className="text-[10px] font-bold text-red-700 hover:underline shrink-0"
                    >
                      Verificar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* MÉTRICAS FINANCIERAS */}
            <div className="lg:col-span-6 bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="text-emerald-500 w-4 h-4" />
                  Métricas de Operación Financiera
                </h3>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setActiveFinTab('invoices')}
                    className={`px-2 py-0.5 text-[9px] font-bold rounded ${activeFinTab === 'invoices' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Facturado
                  </button>
                  <button 
                    onClick={() => setActiveFinTab('quotes')}
                    className={`px-2 py-0.5 text-[9px] font-bold rounded ${activeFinTab === 'quotes' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Cotizado
                  </button>
                </div>
              </div>

              {activeFinTab === 'invoices' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Total Facturado</span>
                    <div className="text-xl font-bold font-mono text-slate-900 mt-1">${financials.totalFacturado.toLocaleString()} MXN</div>
                  </div>
                  <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                    <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wide">Total Recaudado</span>
                    <div className="text-xl font-bold font-mono text-emerald-700 mt-1">${financials.totalRecaudado.toLocaleString()} MXN</div>
                  </div>
                  <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100 col-span-2">
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wide text-amber-800">
                      <span>Pendiente / Vencido</span>
                      <span className="font-mono text-[8px]">{Math.round((financials.totalPendiente / financials.totalFacturado) * 100) || 0}% de cartera</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-amber-700 mt-1">
                      ${financials.totalPendiente.toLocaleString()} / ${financials.totalVencido.toLocaleString()} MXN
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Total Propuestas Cotizadas</span>
                    <div className="text-2xl font-bold font-mono text-slate-900 mt-1">${financials.totalCotizado.toLocaleString()} MXN</div>
                    <p className="text-[10px] text-slate-400 mt-2">Monto cotizado acumulado en leads y prospectos CRM.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      )}

      {activeTab === 'dir_calibration' && (
        <motion.div
          key="dir_calibration"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <Activity className="text-emerald-600 w-4.5 h-4.5" />
              Monitor de Calibración e Integridad de Equipos
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Supervisión en tiempo real de trazabilidad, validaciones y aprobación metrológica de instrumentos bajo NMX-EC-17025.</p>
          </div>
          {renderMetrologyControl('director')}
        </motion.div>
      )}

      {activeTab === 'dir_config' && (
        <motion.div
          key="dir_config"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <Sliders className="text-emerald-600 w-4.5 h-4.5" />
              Configuración Maestra del Sistema
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Gestión global de identidades RBAC, simulación de privilegios y consulta del Audit Trail inalterable (NOM-151).</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Controles de Identidad y Privilegios (RBAC)</h4>
              {renderRbacSection()}
            </div>

            <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 font-mono">Bitácora de Sucesos de Calidad (Audit Trail)</h4>
              {renderAuditSection()}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
