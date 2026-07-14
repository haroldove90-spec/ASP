import React, { useState } from 'react';
import { 
  UserPlus, 
  DollarSign, 
  Database, 
  Calculator, 
  ArrowRight, 
  FileText, 
  CheckCircle, 
  Lock, 
  Copy, 
  Check, 
  Info 
} from 'lucide-react';
import { motion } from 'motion/react';
import { Usuario } from '../initial_data';

interface AdminViewsProps {
  activePersona: Usuario;
  activeTab: string;
  usuarios: Usuario[];
  
  // CRM states & actions
  leadFormData: any;
  setLeadFormData: (d: any) => void;
  generatedQuotes: any[];
  handleGenerateQuote: (e: React.FormEvent) => void;
  
  // Financials states & actions
  invoices: any[];
  handleToggleInvoiceStatus: (id: number) => void;
  financials: any;
  
  // DB SQL
  DB_SCHEMA_SQL: string;
}

export default function AdminViews(props: AdminViewsProps) {
  const {
    activePersona,
    activeTab,
    usuarios,
    leadFormData,
    setLeadFormData,
    generatedQuotes,
    handleGenerateQuote,
    invoices,
    handleToggleInvoiceStatus,
    financials,
    DB_SCHEMA_SQL
  } = props;

  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(DB_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      {renderWelcomeBanner("Ejecutivo de Ventas y Administración")}

      {activeTab === 'admin_crm' && (
        <motion.div
          key="admin_crm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <UserPlus className="text-emerald-600 w-4.5 h-4.5" />
              CRM y Generador Automático de Propuestas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Gestione prospectos de clientes y genere cotizaciones automáticas para servicios metrológicos.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* NUEVO LEAD */}
            <div className="lg:col-span-5 bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Calculator className="w-4 h-4 text-emerald-600" />
                Nueva Propuesta de Servicio
              </h4>

              <form onSubmit={handleGenerateQuote} className="space-y-3 text-xs">
                <div>
                  <label htmlFor="crm-client" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Nombre de la Empresa *</label>
                  <input
                    id="crm-client"
                    type="text"
                    required
                    placeholder="e.g. Cemex S.A.B. de C.V."
                    value={leadFormData.cliente}
                    onChange={(e) => setLeadFormData({ ...leadFormData, cliente: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="crm-email" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Email de Contacto *</label>
                  <input
                    id="crm-email"
                    type="email"
                    required
                    placeholder="e.g. compras@cemex.com"
                    value={leadFormData.contacto}
                    onChange={(e) => setLeadFormData({ ...leadFormData, contacto: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="crm-points" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Puntos a Medir *</label>
                    <input
                      id="crm-points"
                      type="number"
                      required
                      min={1}
                      value={leadFormData.puntos_medicion}
                      onChange={(e) => setLeadFormData({ ...leadFormData, puntos_medicion: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-center"
                    />
                  </div>
                  <div>
                    <label htmlFor="crm-viatics" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Viáticos Estimados ($) *</label>
                    <input
                      id="crm-viatics"
                      type="number"
                      required
                      min={0}
                      value={leadFormData.viaticos_estimados}
                      onChange={(e) => setLeadFormData({ ...leadFormData, viaticos_estimados: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-center"
                    />
                  </div>
                </div>

                <button
                  id="submit-generate-quote-btn"
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Calcular y Guardar Cotización</span>
                </button>
              </form>
            </div>

            {/* PROPUESTAS COTIZADAS */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Propuestas Recientes Generadas</h4>
              
              <div className="space-y-3 max-h-[360px] overflow-y-auto">
                {generatedQuotes.map((quote) => (
                  <div key={quote.id_propuesta} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-300 transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-400">PROP-{quote.id_propuesta}</span>
                        <strong className="text-slate-900 text-xs">{quote.cliente}</strong>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{quote.contacto} • {quote.puntos} puntos de medición</p>
                    </div>

                    <div className="text-left md:text-right">
                      <span className="text-xs font-bold text-emerald-600 block font-mono">${quote.costo.toLocaleString()} MXN</span>
                      <span className="text-[9px] text-slate-400 block font-mono">Cotizado el: {quote.fecha}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'admin_finance' && (
        <motion.div
          key="admin_finance"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <DollarSign className="text-emerald-600 w-4.5 h-4.5" />
              Finanzas y Control de Cobranza de Cuentas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Monitoreo de facturas, conciliación e historial de recaudación conforme a normativas impositivas mexicanas.</p>
          </div>

          {/* TOTALES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">Total Facturado</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">${financials.totalFacturado.toLocaleString()} MXN</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl shadow-sm">
              <span className="text-[9px] font-bold text-emerald-800 uppercase font-mono">Total Recaudado (Cobrado)</span>
              <div className="text-xl font-bold font-mono text-emerald-700 mt-1">${financials.totalRecaudado.toLocaleString()} MXN</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm">
              <span className="text-[9px] font-bold text-amber-800 uppercase font-mono">Pendiente por Cobrar</span>
              <div className="text-xl font-bold font-mono text-amber-700 mt-1">${financials.totalPendiente.toLocaleString()} MXN</div>
            </div>
          </div>

          {/* LISTADO DE FACTURAS */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase tracking-wider text-[10px] font-mono">
                <tr>
                  <th className="px-4 py-3">ID Factura</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3 text-right">Monto</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id_factura} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">FAC-2026-00{inv.id_factura}</td>
                    <td className="px-4 py-3 text-slate-700 font-semibold">{inv.cliente}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">${inv.monto.toLocaleString()} MXN</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                        inv.estado === 'Pagado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        inv.estado === 'Vencido' ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${inv.estado === 'Pagado' ? 'bg-emerald-500' : inv.estado === 'Vencido' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                        {inv.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggleInvoiceStatus(inv.id_factura)}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                      >
                        Cambiar Estado
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'admin_results' && (
        <motion.div
          key="admin_results"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Database className="text-emerald-600 w-4.5 h-4.5" />
                DDL de Base de Datos e Integridad Estructural
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Inspeccione el diseño del esquema de la base de datos relacional de ASP/ECH&S conforme a NMX-17025 y NOM-151.</p>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 self-start"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Script SQL DDL</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wide font-mono mb-1">Prioridad 1: Privilegios RBAC</h4>
              <p className="text-xs text-sky-700 leading-relaxed font-light">Estructura estricta que vincula cada inicio de sesión con e.firma certificada.</p>
            </div>
            <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wide font-mono mb-1">Prioridad 2: Trazabilidad GPS</h4>
              <p className="text-xs text-sky-700 leading-relaxed font-light">Obligación de almacenar fecha, hora, ubicación GPS certificada y firmas en sitio.</p>
            </div>
            <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wide font-mono mb-1">Prioridad 3: Inalterabilidad</h4>
              <p className="text-xs text-sky-700 leading-relaxed font-light">Resguardos de hash SHA256 criptográficos inalterables en cada registro.</p>
            </div>
          </div>

          {/* VISOR DE CODIGO */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-slate-950">
            <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-xs text-slate-400 font-mono ml-2">aspechs_ddl_schema.sql</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                PostgreSQL
              </span>
            </div>
            <pre className="p-4 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-[420px] leading-relaxed">
              <code>{DB_SCHEMA_SQL}</code>
            </pre>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5 font-mono">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              Nota de Ejecución del Administrador
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              Este script es 100% compatible con PostgreSQL v12 a v16. Asegúrese de restringir al usuario de la aplicación para que no posea privilegios de alteración de tablas en la tabla de bitácora, complementando las restricciones del trigger de integridad.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
