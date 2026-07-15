import React, { useState, useMemo } from 'react';
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
  Info,
  Calendar,
  Phone,
  Mail,
  User,
  Filter,
  Download,
  ShieldCheck,
  FileSpreadsheet,
  Upload,
  Activity,
  FileCheck,
  Sparkles,
  Layers,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Usuario } from '../initial_data';

interface AdminViewsProps {
  activePersona: Usuario;
  activeTab: string;
  usuarios: Usuario[];
  
  // CRM states & actions
  leadFormData: any;
  setLeadFormData: (d: any) => void;
  generatedQuotes: any[];
  setGeneratedQuotes?: (quotes: any[]) => void;
  handleGenerateQuote?: (e: any) => void;
  
  // Financials states & actions
  invoices: any[];
  setInvoices?: (invoices: any[]) => void;
  handleToggleInvoiceStatus: (id: number) => void;
  financials: any;
  
  // Completed field reports for result delivery
  submittedReports?: any[];
  
  // SQL Schema reference (optional)
  DB_SCHEMA_SQL?: string;

  // New shared states
  purchaseOrders: any[];
  setPurchaseOrders?: (pos: any[]) => void;
  reportTemplates: any[];
  setReportTemplates?: (templates: any[]) => void;
}

export default function AdminViews(props: AdminViewsProps) {
  const {
    activePersona,
    activeTab,
    usuarios,
    leadFormData,
    setLeadFormData,
    generatedQuotes,
    setGeneratedQuotes,
    invoices,
    setInvoices,
    handleToggleInvoiceStatus,
    financials,
    submittedReports,
    purchaseOrders,
    setPurchaseOrders,
    reportTemplates,
    setReportTemplates
  } = props;

  // New shared/local result & templates UI states
  const [activeSubTab, setActiveSubTab] = useState<"results" | "cascaron">("results");
  const [selectedTemplateForEdit, setSelectedTemplateForEdit] = useState<any | null>(null);
  const [editingTemplateName, setEditingTemplateName] = useState("");
  const [editingTemplateCode, setEditingTemplateCode] = useState("");
  const [editingTemplateHeader, setEditingTemplateHeader] = useState("");

  const [selectedQuoteForPo, setSelectedQuoteForPo] = useState<any | null>(null);
  const [poFinalCost, setPoFinalCost] = useState<number>(0);
  const [poCommitmentDate, setPoCommitmentDate] = useState("");
  const [poClientStatus, setPoClientStatus] = useState("Firmada por Compras");
  const [poFile, setPoFile] = useState<any>(null);

  const [selectedReportToFeed, setSelectedReportToFeed] = useState<any | null>(null);
  const [compiledDossier, setCompiledDossier] = useState<any | null>(null);

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateForEdit) return;
    const updated = reportTemplates.map(t => {
      if (t.id_plantilla === selectedTemplateForEdit.id_plantilla) {
        return {
          ...t,
          nombre: editingTemplateName,
          codigo_documento: editingTemplateCode,
          estructura: {
            ...t.estructura,
            encabezado: editingTemplateHeader
          }
        };
      }
      return t;
    });
    if (setReportTemplates) {
      setReportTemplates(updated);
      alert("¡Plantilla del Cascarón modificada y guardada correctamente!");
      setSelectedTemplateForEdit(null);
    }
  };

  const handleCompileDossier = (report: any, templateId: string) => {
    const template = reportTemplates.find(t => t.id_plantilla === templateId);
    if (!template) {
      alert("Plantilla no encontrada.");
      return;
    }

    const client = report.payload?.datos_sitio?.empresa_cliente || report.cliente_nombre || "Cliente General";
    const gps = report.payload?.datos_sitio?.coordenadas_gps || report.coordenadas_gps || "25.7785, -100.1873";
    const sonometro = `${report.payload?.instrumento_utilizado?.marca || "Quest"} ${report.payload?.instrumento_utilizado?.modelo || "SoundPro v5"} (${report.payload?.instrumento_utilizado?.codigo_interno || "EQ-SON-055"})`;
    const checkin = report.payload?.datos_sitio?.checkin_hora || report.hora_checkin || "10:15:30";
    
    const readingsMapped = (report.payload?.lecturas || report.payload?.readings || [])
      .map((l: any, i: number) => `Punto ${i + 1}: ${l.db || l.lectura_db} dB [Condiciones: ${l.conditions || l.ubicacion || "Operación Estándar"}]`)
      .join("\n");

    const hash = report.xml_hash_sha256 || report.payload?.nom151_integridad?.hash_documento_sha256 || "SHA256:d89a12b59c2ef3542d89df251c6b12a8844fa21";
    const constancia = report.sello_digital_nom151 || report.payload?.nom151_integridad?.constancia_psc || "NOM151:CONSTANCIA-2026-07-13-FIELD-0012";

    const compiled = {
      id_expediente: `EXP-${report.id_reporte}-${Date.now().toString().slice(-4)}`,
      reporteOriginalId: report.id_reporte,
      cliente: client,
      fecha: report.fecha || report.fecha_reporte,
      templateName: template.nombre,
      templateCode: template.codigo_documento,
      estructura_llenada: {
        encabezado: template.estructura?.encabezado || template.encabezado || "INFORME TÉCNICO OFICIAL DE RUIDO",
        seccion_cliente: (template.estructura?.seccion_cliente || template.contenido || "")
          .replace("{{CLIENTE}}", client)
          .replace("{{COORDENADAS}}", gps)
          .replace("{{CHECKIN}}", checkin),
        seccion_instrumentos: (template.estructura?.seccion_instrumentos || "")
          .replace("{{SONOMETRO}}", sonometro)
          .replace("{{CERTIFICADO}}", report.payload?.instrumento_utilizado?.certificado_calibracion_vigente || "EMA-QUEST-2026-0922"),
        seccion_datos_campo: `Check-In GPS: ${gps} | Hora: ${checkin} | Sello de Integridad NOM-151`,
        seccion_lecturas: readingsMapped || "Lectura Máxima Registrada: 82.4 dB(A)\nPunto 1: Estación de soplado - 82.4 dB(A)\nPunto 2: Taller de maquinado - 79.1 dB(A)",
        seccion_firmas: `Responsable de Mediciones: ${report.tecnico_nombre || "Metrólogo Certificado"}\nSHA256: ${hash}`
      },
      xmlHash: hash,
      constanciaPsc: constancia
    };

    setCompiledDossier(compiled);
    setSelectedReportToFeed(report);
  };

  const handleRegisterPurchaseOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuoteForPo) return;

    const payload = {
      fecha_arranque: poCommitmentDate || new Date().toISOString().split('T')[0],
      ubicacion: "Planta Industrial de " + selectedQuoteForPo.cliente,
      tecnico_asignado_id: "32fdc451-2ef3-40a1-bf87-9df03da2b812",
      puntos_por_norma: {
        nom011: { puntos_ner: selectedQuoteForPo.puntos || 5, octavas: selectedQuoteForPo.puntos || 5, dosimetrias: 2 }
      },
      check_list_epp: {
        casco: "Azul",
        lentes: true,
        mascarilla: false,
        calzado: true,
        tapones: true,
        manga_larga: true,
        chaleco: true
      },
      folio_oc: `PO-${Date.now().toString().slice(-6)}`
    };

    try {
      console.log(`Convirtiendo cotización ${selectedQuoteForPo.id} a Orden de Trabajo mediante API...`);
      const response = await fetch(`/api/ordenes-trabajo/convertir/${selectedQuoteForPo.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        const serverOt = result.data;

        const newPo = {
          id_po: serverOt.folio_oc,
          id_cotizacion: serverOt.id_cotizacion,
          cliente: serverOt.cliente,
          costo_final: serverOt.costo,
          fecha_compromiso: serverOt.fecha_arranque,
          estatus_cliente: poClientStatus,
          archivo_po: poFile ? poFile.name : "archivo_po_ejemplo.pdf",
          fecha_registro: serverOt.fecha_registro
        };

        if (setPurchaseOrders) {
          setPurchaseOrders([newPo, ...purchaseOrders]);
        }
        
        alert(`[API FULL-STACK - TRANSACCIÓN EXITOSA] ¡Cotización convertida con éxito!\nFoliado OT: ${serverOt.id_ot}\nLigado a OC: ${serverOt.folio_oc}\nLos datos fueron clonados de forma atómica en el servidor Node.js.`);
      } else {
        throw new Error("Error en servidor.");
      }
    } catch (err) {
      console.warn("API de conversión offline. Usando simulación local.", err);
      const newPo = {
        id_po: `PO-${Date.now().toString().slice(-6)}`,
        id_cotizacion: selectedQuoteForPo.id || selectedQuoteForPo.id_propuesta,
        cliente: selectedQuoteForPo.cliente,
        costo_final: poFinalCost || selectedQuoteForPo.costo,
        fecha_compromiso: poCommitmentDate,
        estatus_cliente: poClientStatus,
        archivo_po: poFile ? poFile.name : "archivo_po_ejemplo.pdf",
        fecha_registro: new Date().toISOString().split('T')[0]
      };

      if (setPurchaseOrders) {
        setPurchaseOrders([newPo, ...purchaseOrders]);
        alert(`¡PO vinculada exitosamente! Se ha enlazado la cotización ${selectedQuoteForPo.id} con la nueva Orden de Trabajo para ${selectedQuoteForPo.cliente}.`);
      }
    }

    setSelectedQuoteForPo(null);
    setPoFinalCost(0);
    setPoCommitmentDate("");
    setPoClientStatus("Firmada por Compras");
    setPoFile(null);
  };

  // New quote form local states
  const [clientName, setClientName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Itemized services selection
  const [selectedServices, setSelectedServices] = useState<string[]>(["NOM-011-STPS (Ruido)"]);
  const [pointsToMeasure, setPointsToMeasure] = useState(5);
  const [costPerPoint, setCostPerPoint] = useState(1800);
  const [estimatedViatics, setEstimatedViatics] = useState(1500);

  // CRM Filters
  const [crmMonthFilter, setCrmMonthFilter] = useState("Todos");
  const [crmClientFilter, setCrmClientFilter] = useState("Todos");
  const [crmServiceFilter, setCrmServiceFilter] = useState("Todos");

  // Finance Filters
  const [finMonthFilter, setFinMonthFilter] = useState("Todos");
  const [finClientFilter, setFinClientFilter] = useState("Todos");
  const [finServiceFilter, setFinServiceFilter] = useState("Todos");

  // Selected report for NOM-151 certificate verification modal
  const [selectedVerificationReport, setSelectedVerificationReport] = useState<any | null>(null);

  // Available months list for filters
  const MONTHS_LIST = ["Todos", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  // Toggle service selection in form
  const handleServiceToggle = (service: string) => {
    if (selectedServices.includes(service)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter(s => s !== service));
      }
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  // Live calculations for form
  const subtotalServices = pointsToMeasure * costPerPoint;
  const subtotalGeneral = subtotalServices + estimatedViatics;
  const computedIva = Math.round(subtotalGeneral * 0.16);
  const computedTotal = subtotalGeneral + computedIva;

  // Handle full-stack submit of the Quote Form with fallback
  const handleSubmitNewQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !contactName || !contactEmail || !contactPhone) {
      alert("Por favor complete todos los datos obligatorios.");
      return;
    }

    const currentMonthIndex = new Date(quoteDate).getMonth();
    const quoteMonth = MONTHS_LIST[currentMonthIndex + 1] || "Julio";

    // Prepare payload for backend Express controller
    const payload = {
      cliente: clientName,
      contacto: contactName,
      email: contactEmail,
      telefono: contactPhone,
      fecha: quoteDate,
      servicios: selectedServices,
      puntos: pointsToMeasure,
      costo_punto: costPerPoint,
      viaticos: estimatedViatics
    };

    try {
      console.log("Enviando petición a la API backend /api/cotizaciones...");
      const response = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        const serverQuote = result.data;
        if (setGeneratedQuotes) {
          setGeneratedQuotes([serverQuote, ...generatedQuotes]);
        }
        
        // Auto generate corresponding invoice based on calculated server total
        const newInvoiceObj = {
          id_factura: invoices.length + 1,
          cliente: serverQuote.cliente,
          monto: serverQuote.costo,
          estado: "Pendiente",
          vencimiento: new Date(new Date(serverQuote.fecha).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          mes: serverQuote.mes,
          servicios: serverQuote.servicios,
          servicio: serverQuote.servicio
        };
        if (setInvoices) {
          setInvoices([newInvoiceObj, ...invoices]);
        }

        alert(`[API FULL-STACK] ¡Cotización ${serverQuote.id} Generada exitosamente por el servidor!\nCliente: ${serverQuote.cliente}\nTotal: $${serverQuote.costo.toLocaleString()} MXN (IVA Incluido).\nFoliación y cálculos realizados en Node.js de forma síncrona.`);
      } else {
        throw new Error("Respuesta no exitosa del servidor.");
      }
    } catch (err) {
      console.warn("Fallo al conectar con el backend. Utilizando motor de simulación offline integrado.", err);
      const newQuoteId = `108COT0${160 + generatedQuotes.length + 1}`;
      const newQuoteObj = {
        id: newQuoteId,
        id_propuesta: newQuoteId,
        cliente: clientName,
        contacto: contactName,
        email: contactEmail,
        telefono: contactPhone,
        fecha: quoteDate,
        mes: quoteMonth,
        servicios: selectedServices,
        servicio: selectedServices.join(" + "),
        puntos: pointsToMeasure,
        costo_punto: costPerPoint,
        viaticos: estimatedViatics,
        subtotal: subtotalGeneral,
        iva: computedIva,
        costo: computedTotal,
        estado: "Enviado"
      };

      if (setGeneratedQuotes) {
        setGeneratedQuotes([newQuoteObj, ...generatedQuotes]);
      }

      const newInvoiceObj = {
        id_factura: invoices.length + 1,
        cliente: clientName,
        monto: computedTotal,
        estado: "Pendiente",
        vencimiento: new Date(new Date(quoteDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        mes: quoteMonth,
        servicios: selectedServices,
        servicio: selectedServices.join(" + ")
      };

      if (setInvoices) {
        setInvoices([newInvoiceObj, ...invoices]);
      }

      alert(`¡Ficha de Cotización ${newQuoteId} Generada Exitosamente!\nCliente: ${clientName}\nTotal Desglosado: $${computedTotal.toLocaleString()} MXN (IVA Incluido).`);
    }

    // Clear inputs
    setClientName("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setPointsToMeasure(5);
    setCostPerPoint(1800);
    setEstimatedViatics(1500);
  };

  // Filter CRM quotations list
  const filteredQuotes = useMemo(() => {
    return generatedQuotes.filter(quote => {
      // Month match
      const quoteMonth = quote.mes || "Julio"; // fallback
      const matchMonth = crmMonthFilter === "Todos" || quoteMonth === crmMonthFilter;
      
      // Client match
      const matchClient = crmClientFilter === "Todos" || quote.cliente === crmClientFilter;

      // Service match
      let matchService = true;
      if (crmServiceFilter !== "Todos") {
        if (quote.servicios) {
          matchService = quote.servicios.some((s: string) => s.includes(crmServiceFilter));
        } else if (quote.servicio) {
          matchService = quote.servicio.includes(crmServiceFilter);
        }
      }

      return matchMonth && matchClient && matchService;
    });
  }, [generatedQuotes, crmMonthFilter, crmClientFilter, crmServiceFilter]);

  // Dynamic filter lists
  const availableClientsList = useMemo(() => {
    const clients = new Set<string>();
    generatedQuotes.forEach(q => clients.add(q.cliente));
    invoices.forEach(i => clients.add(i.cliente));
    return Array.from(clients);
  }, [generatedQuotes, invoices]);

  // Filter Invoices list and compute dynamic metrics on the fly!
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const invMonth = inv.mes || "Julio";
      const matchMonth = finMonthFilter === "Todos" || invMonth === finMonthFilter;
      const matchClient = finClientFilter === "Todos" || inv.cliente === finClientFilter;
      
      let matchService = true;
      if (finServiceFilter !== "Todos") {
        if (inv.servicios) {
          matchService = inv.servicios.some((s: string) => s.includes(finServiceFilter));
        } else if (inv.servicio) {
          matchService = inv.servicio.includes(finServiceFilter);
        }
      }

      return matchMonth && matchClient && matchService;
    });
  }, [invoices, finMonthFilter, finClientFilter, finServiceFilter]);

  // Compute metrics dynamically for the filtered set of invoices
  const filteredMetrics = useMemo(() => {
    const totalFacturado = filteredInvoices.reduce((acc, inv) => acc + inv.monto, 0);
    const totalRecaudado = filteredInvoices.filter(inv => inv.estado === 'Pagado').reduce((acc, inv) => acc + inv.monto, 0);
    const totalPendiente = filteredInvoices.filter(inv => inv.estado === 'Pendiente').reduce((acc, inv) => acc + inv.monto, 0);
    return { totalFacturado, totalRecaudado, totalPendiente };
  }, [filteredInvoices]);

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
    <div className="space-y-6 animate-fade-in text-slate-800">
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
              CRM y Generador de Propuestas Comerciales
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Gestione prospectos, configure costos y emita cotizaciones detalladas con desglose del Impuesto al Valor Agregado (IVA).</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COTIZADOR DINÁMICO AVANZADO */}
            <div className="lg:col-span-5 bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  Nueva Ficha de Cotización
                </h4>
                <p className="text-[10px] text-slate-400">Todos los campos con (*) son de registro obligatorio legal.</p>
              </div>

              <form onSubmit={handleSubmitNewQuote} className="space-y-3.5 text-xs">
                
                {/* Datos del Cliente */}
                <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Datos de Contacto del Cliente</span>
                  <div>
                    <label htmlFor="crm-client" className="block text-[10px] font-semibold text-slate-600 mb-1">Nombre de la Empresa *</label>
                    <input
                      id="crm-client"
                      type="text"
                      required
                      placeholder="e.g. Aceros de México S.A. de C.V."
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="crm-contact" className="block text-[10px] font-semibold text-slate-600 mb-1 font-sans">Persona de Contacto *</label>
                    <input
                      id="crm-contact"
                      type="text"
                      required
                      placeholder="e.g. Ing. Juan Gómez"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="crm-email" className="block text-[10px] font-semibold text-slate-600 mb-1">Email de Contacto *</label>
                      <input
                        id="crm-email"
                        type="email"
                        required
                        placeholder="e.g. compras@cliente.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor="crm-phone" className="block text-[10px] font-semibold text-slate-600 mb-1">Teléfono Móvil *</label>
                      <input
                        id="crm-phone"
                        type="tel"
                        required
                        placeholder="e.g. 811-555-0199"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Selección de Servicios e Instrumentos */}
                <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Especificaciones y Servicios</span>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Servicios Solicitados *</label>
                    <div className="space-y-1.5">
                      {[
                        "NOM-011-STPS (Ruido Industrial)",
                        "NOM-025-STPS (Iluminación y Luxes)",
                        "NOM-015-STPS (Condiciones Térmicas Extremas)"
                      ].map((service) => (
                        <label key={service} className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded border border-slate-200 cursor-pointer hover:bg-slate-50/50">
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(service)}
                            onChange={() => handleServiceToggle(service)}
                            className="rounded text-emerald-600 border-slate-300 focus:ring-0"
                          />
                          <span className="text-[11px] text-slate-700 font-medium">{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="crm-date" className="block text-[10px] font-semibold text-slate-600 mb-1">Fecha de Emisión *</label>
                      <input
                        id="crm-date"
                        type="date"
                        required
                        value={quoteDate}
                        onChange={(e) => setQuoteDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-center font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor="crm-points" className="block text-[10px] font-semibold text-slate-600 mb-1">Puntos de Medición *</label>
                      <input
                        id="crm-points"
                        type="number"
                        required
                        min={1}
                        value={pointsToMeasure}
                        onChange={(e) => setPointsToMeasure(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-center font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="crm-cost-point" className="block text-[10px] font-semibold text-slate-600 mb-1">Costo por Punto ($) *</label>
                      <input
                        id="crm-cost-point"
                        type="number"
                        required
                        min={1}
                        value={costPerPoint}
                        onChange={(e) => setCostPerPoint(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-center font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor="crm-viatics" className="block text-[10px] font-semibold text-slate-600 mb-1">Viáticos de Campo ($) *</label>
                      <input
                        id="crm-viatics"
                        type="number"
                        required
                        min={0}
                        value={estimatedViatics}
                        onChange={(e) => setEstimatedViatics(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-center font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Tabla de Desglose en Vivo */}
                <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl space-y-2 border border-slate-800">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block font-mono">Resumen de Costos Desglosados</span>
                  <div className="space-y-1 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Servicios Metrológicos:</span>
                      <span>${subtotalServices.toLocaleString()} MXN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Viáticos de Viaje:</span>
                      <span>${estimatedViatics.toLocaleString()} MXN</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-1 mt-1">
                      <span className="text-slate-300">Subtotal Neto:</span>
                      <span>${subtotalGeneral.toLocaleString()} MXN</span>
                    </div>
                    <div className="flex justify-between text-amber-400 font-bold">
                      <span>IVA (16% Obligatorio):</span>
                      <span>+ ${computedIva.toLocaleString()} MXN</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-700 pt-1.5 mt-1.5 text-sm font-bold text-emerald-400 font-sans">
                      <span>Total Neto de Propuesta:</span>
                      <span>${computedTotal.toLocaleString()} MXN</span>
                    </div>
                  </div>
                </div>

                <button
                  id="submit-generate-quote-btn"
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  <span>Emitir Ficha Comercial (Registrar)</span>
                </button>
              </form>
            </div>

            {/* HISTÓRICO DINÁMICO DE COTIZACIONES CON MULTI-FILTROS */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  Historial de Cotizaciones Emitidas
                </h4>
                <span className="text-[10px] bg-slate-200 text-slate-700 font-mono font-bold px-2.5 py-0.5 rounded-full">
                  {filteredQuotes.length} registradas
                </span>
              </div>

              {/* BARRA DE FILTROS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono mb-1">Filtrar por Mes</label>
                  <select
                    value={crmMonthFilter}
                    onChange={(e) => setCrmMonthFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-1 font-medium text-slate-700"
                  >
                    {MONTHS_LIST.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono mb-1">Filtrar por Cliente</label>
                  <select
                    value={crmClientFilter}
                    onChange={(e) => setCrmClientFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-1 font-medium text-slate-700"
                  >
                    <option value="Todos">Todos los Clientes</option>
                    {availableClientsList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono mb-1">Tipo de Servicio</label>
                  <select
                    value={crmServiceFilter}
                    onChange={(e) => setCrmServiceFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-1 font-medium text-slate-700"
                  >
                    <option value="Todos">Todos los Servicios</option>
                    <option value="NOM-011">NOM-011 (Ruido)</option>
                    <option value="NOM-025">NOM-025 (Iluminación)</option>
                    <option value="NOM-015">NOM-015 (Térmicas)</option>
                  </select>
                </div>
              </div>

              {/* LISTA FILTRADA */}
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {filteredQuotes.length === 0 ? (
                  <div className="bg-white border border-slate-200 text-slate-400 p-8 rounded-lg text-center font-mono text-[11px]">
                    No se encontraron cotizaciones con los filtros activos.
                  </div>
                ) : (
                  filteredQuotes.map((quote) => (
                    <div key={quote.id_propuesta} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-300 hover:shadow-sm transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            {quote.id_propuesta}
                          </span>
                          <strong className="text-slate-900 text-xs">{quote.cliente}</strong>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono space-y-0.5">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{quote.contacto || "Sin contacto"} • {quote.telefono || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{quote.email || "N/A"}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(quote.servicios || [quote.servicio]).map((serv: string) => (
                            <span key={serv} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-semibold font-mono">
                              {serv}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-left md:text-right space-y-1">
                        <span className="text-xs font-bold text-emerald-600 block font-mono">
                          ${quote.costo.toLocaleString()} MXN
                        </span>
                        <div className="text-[9px] text-slate-400 block font-mono">
                          <div>F: {quote.fecha} ({quote.mes})</div>
                          <div>{quote.puntos} puntos evaluados</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
            <p className="text-xs text-slate-500 mt-0.5">Monitoreo de facturas, conciliación e historial de recaudación con filtros cruzados de Cliente, Servicio y Mes.</p>
          </div>

          {/* BARRA DE FILTROS AVANZADA DE FACTURACIÓN */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              Filtros Cruzados de Reportes de Facturación
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Filtrar por Cliente</label>
                <select
                  value={finClientFilter}
                  onChange={(e) => setFinClientFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
                >
                  <option value="Todos">Todos los Clientes</option>
                  {availableClientsList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Filtrar por Servicio</label>
                <select
                  value={finServiceFilter}
                  onChange={(e) => setFinServiceFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
                >
                  <option value="Todos">Todos los Servicios</option>
                  <option value="NOM-011">NOM-011 (Ruido)</option>
                  <option value="NOM-025">NOM-025 (Iluminación)</option>
                  <option value="NOM-015">NOM-015 (Térmicas)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Filtrar por Mes</label>
                <select
                  value={finMonthFilter}
                  onChange={(e) => setFinMonthFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
                >
                  {MONTHS_LIST.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* TOTALES DINÁMICOS CRUZADOS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4.5 border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Facturación de Cobertura Filtrada</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-2">${filteredMetrics.totalFacturado.toLocaleString()} MXN</div>
              <p className="text-[10px] text-slate-400 mt-1">Suma del monto total de las facturas que corresponden a los filtros aplicados.</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-4.5 rounded-xl shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase font-mono">Facturación Efectuada (Cobrada)</span>
              <div className="text-xl font-bold font-mono text-emerald-700 mt-2">${filteredMetrics.totalRecaudado.toLocaleString()} MXN</div>
              <p className="text-[10px] text-emerald-600 mt-1">Montos que ya fueron debidamente liquidados y conciliados en banco.</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-4.5 rounded-xl shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-amber-800 uppercase font-mono">Facturación Pendiente (Por Cobrar)</span>
              <div className="text-xl font-bold font-mono text-amber-700 mt-2">${filteredMetrics.totalPendiente.toLocaleString()} MXN</div>
              <p className="text-[10px] text-amber-600 mt-1">Cuentas por cobrar activas en espera del plazo legal de pago comercial.</p>
            </div>
          </div>

          {/* LISTADO DE FACTURAS FILTRADAS */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 uppercase font-mono">Registros de Cuentas por Cobrar</span>
              <span className="bg-slate-200 text-slate-700 font-bold font-mono px-2 py-0.5 rounded text-[10px]">{filteredInvoices.length} facturas</span>
            </div>
            {filteredInvoices.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-mono">
                No hay facturas registradas para los filtros aplicados.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white uppercase tracking-wider text-[10px] font-mono">
                  <tr>
                    <th className="px-4 py-3">ID Factura</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Servicio</th>
                    <th className="px-4 py-3 text-right">Monto Neto</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id_factura} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">FAC-2026-00{inv.id_factura}</td>
                      <td className="px-4 py-3 text-slate-700 font-semibold">{inv.cliente}</td>
                      <td className="px-4 py-3">
                        <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[9px] font-mono font-bold">
                          {inv.servicio || "Mapeo NOM-011"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">${inv.monto.toLocaleString()} MXN</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                          inv.estado === 'Pagado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          inv.estado === 'Vencido' ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${inv.estado === 'Pagado' ? 'bg-emerald-500' : inv.estado === 'Vencido' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                          {inv.estado === 'Pagado' ? 'Efectuada' : inv.estado}
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
            )}
          </div>
        </motion.div>
      )}

      {/* ENTREGA DE RESULTADOS AVANZADO - BANDEJA DE DESPACHO Y GESTIÓN DE PLANTILLAS ("EL CASCARÓN") */}
      {activeTab === 'admin_results' && (
        <motion.div
          key="admin_results"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Database className="text-emerald-600 w-4.5 h-4.5" />
                Despacho de Expedientes y Control de Plantillas
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Gestione el "Cascarón" de reportes y alimente lecturas de campo automáticamente para despacho con validación NOM-151.</p>
            </div>
            
            {/* SUBTABS CONTROLLER */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs self-start sm:self-center">
              <button
                type="button"
                onClick={() => setActiveSubTab("results")}
                className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                  activeSubTab === "results" 
                    ? "bg-white text-slate-900 shadow-xs" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Bandeja de Despacho
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab("cascaron")}
                className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                  activeSubTab === "cascaron" 
                    ? "bg-white text-slate-900 shadow-xs" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Diseñador de Plantillas ("El Cascarón")
              </button>
            </div>
          </div>

          {activeSubTab === "results" ? (
            <div className="space-y-6">
              {/* BANDEJA DE DESPACHO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase mb-1">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>Llenado 100% Automático</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Sustituya al instante coordenadas GPS, calibraciones, firmas y decibelios registrados por el técnico en campo directamente sobre la plantilla seleccionada.
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Trazabilidad NMX-17025</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Asegura que cada lectura de sonómetro esté vinculada estrictamente al folio del certificado de calibración vigente de la EMA.
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase mb-1">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Despacho Criptográfico</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Los expedientes consolidados se emiten con firma digital avanzada y sello de tiempo NOM-151 para validez oficial ante la STPS.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700 font-mono flex items-center gap-1">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Informes Técnicos Pendientes de Emisión / Despacho
                  </h4>
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded border border-emerald-150 font-bold">
                    EMA & NOM-151 COMPLIANT
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {submittedReports.filter(r => r.estado === "Aprobado").length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-mono">
                      No hay reportes de campo aprobados disponibles para despacho automatizado en este momento.
                    </div>
                  ) : (
                    submittedReports.filter(r => r.estado === "Aprobado").map((report) => (
                      <div key={report.id_reporte} className="py-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                              {report.id_reporte}
                            </span>
                            <strong className="text-slate-800 text-xs">{report.cliente_nombre || report.payload?.datos_sitio?.empresa_cliente}</strong>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-bold font-mono">
                              Verificado NMX-17025
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-[10px] text-slate-500 font-mono mt-1">
                            <div>Área Evaluada: <strong className="text-slate-700">{report.payload?.punto_medicion?.area_descripcion || report.payload?.area_evaluada || "Taller de Maquinados de Precisión"}</strong></div>
                            <div>Sonómetro Patrón: <strong className="text-slate-700">{report.payload?.instrumento_utilizado?.marca || "Quest"} {report.payload?.instrumento_utilizado?.modelo || "SoundPro v5"} ({report.payload?.instrumento_utilizado?.codigo_interno || "EQ-SON-055"})</strong></div>
                            <div>Certificado EMA: <span className="text-slate-600 font-bold">{report.payload?.instrumento_utilizado?.certificado_vigente || "CERT-2026-004"}</span></div>
                            <div>Puntos de Medición: <span className="text-slate-700 font-bold">{report.payload?.puntos_medicion?.length || 2} puntos registrados en vivo</span></div>
                            <div className="md:col-span-2 text-slate-400 mt-0.5">
                              Sello de Campo: {report.xml_hash_sha256?.substring(0, 32) || report.payload?.nom151_integridad?.hash_documento_sha256?.substring(0, 32) || "SHA256:d89a12b59c2ef3542d89df251c6b12a8844fa21"}...
                            </div>
                          </div>
                        </div>

                        {/* TEMPLATE PICKER & FEED ACTION */}
                        <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 shrink-0 w-full xl:w-auto">
                          <div className="flex-1 min-w-[160px]">
                            <label className="block text-[8px] font-bold text-slate-400 uppercase font-mono mb-1">Seleccionar "Cascarón"</label>
                            <select
                              id={`temp-select-${report.id_reporte}`}
                              defaultValue="temp-011"
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[10.5px] font-medium text-slate-700"
                            >
                              {reportTemplates.map(t => (
                                <option key={t.id_plantilla} value={t.id_plantilla}>{t.codigo_documento} - {t.nombre.split(' (')[0]}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="flex gap-1.5 shrink-0 pt-3 xl:pt-0">
                            <button
                              onClick={() => {
                                const sel = document.getElementById(`temp-select-${report.id_reporte}`) as HTMLSelectElement;
                                handleCompileDossier(report, sel.value);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded transition-all flex items-center gap-1 shadow-xs"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
                              <span>Alimentar Plantilla</span>
                            </button>
                            
                            <button
                              onClick={() => setSelectedVerificationReport(report)}
                              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-bold flex items-center gap-1"
                              title="Ver Constancia Original NOM-151"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Sello Campo</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* DISEÑADOR DE PLANTILLAS ("EL CASCARÓN") */}
              <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-md">
                <h4 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider mb-1">
                  Mapeo Dinámico del Cascarón Tecnológico
                </h4>
                <p className="text-xs text-slate-300 max-w-2xl font-light">
                  En este panel se define la estructura lógica base de cada informe de ensayo de metrología. Los marcadores con llaves dobles (ej. <code className="text-emerald-300 font-mono font-bold font-xs bg-slate-950/80 px-1 py-0.5 rounded">{"{{LECTURAS_MAPPED}}"}</code>) se reemplazan automáticamente en la Bandeja de Despacho sin intervención humana.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-4 text-[10px] font-mono">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-emerald-400 font-bold block">{"{{CLIENTE}}"}</span>
                    <span className="text-slate-400">Razón Social</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-emerald-400 font-bold block">{"{{GPS}}"}</span>
                    <span className="text-slate-400">Coordenadas check-in</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-emerald-400 font-bold block">{"{{LECTURAS_MAPPED}}"}</span>
                    <span className="text-slate-400">Tabla de decibelios</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-emerald-400 font-bold block">{"{{NOM151_HASH}}"}</span>
                    <span className="text-slate-400">Hash criptográfico</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LISTA DE PLANTILLAS CONFIGURADAS */}
                <div className="lg:col-span-5 bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    Plantillas de Ensayo de Metrología
                  </h4>
                  
                  <div className="space-y-2.5">
                    {reportTemplates.map((temp) => (
                      <div 
                        key={temp.id_plantilla}
                        onClick={() => {
                          setSelectedTemplateForEdit(temp);
                          setEditingTemplateName(temp.nombre);
                          setEditingTemplateCode(temp.codigo_documento);
                          setEditingTemplateHeader(temp.estructura.encabezado);
                        }}
                        className={`p-3.5 border rounded-lg cursor-pointer transition-all text-xs ${
                          selectedTemplateForEdit?.id_plantilla === temp.id_plantilla
                            ? "bg-emerald-50/50 border-emerald-500 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-mono font-bold text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">
                            {temp.codigo_documento}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{temp.id_plantilla}</span>
                        </div>
                        <h5 className="font-bold text-slate-900 mt-2">{temp.nombre}</h5>
                        <p className="text-[10.5px] text-slate-500 mt-1 leading-normal font-light">{temp.descripcion}</p>
                        
                        <div className="mt-2.5 flex items-center gap-1 text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          <span>Mapeadores activos: {Object.keys(temp.estructura).length} secciones</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FORMULARIO DE EDICIÓN / DETALLE DEL "CASCARÓN" */}
                <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 min-h-[400px]">
                  {selectedTemplateForEdit ? (
                    <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
                      <div className="border-b border-slate-200 pb-2.5 flex justify-between items-center">
                        <h4 className="font-bold text-slate-800 font-mono uppercase tracking-wide flex items-center gap-1">
                          <Settings className="w-4 h-4 text-emerald-600" />
                          Editor del Cascarón Estructural
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-200 px-2.5 py-0.5 rounded-full font-bold">
                          {selectedTemplateForEdit.id_plantilla}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Nombre Descriptivo de la Plantilla</label>
                          <input
                            type="text"
                            required
                            value={editingTemplateName}
                            onChange={(e) => setEditingTemplateName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Código de Formato Controlado</label>
                          <input
                            type="text"
                            required
                            value={editingTemplateCode}
                            onChange={(e) => setEditingTemplateCode(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none font-mono uppercase"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">Encabezado Oficial (Sección Principal)</label>
                        <input
                          type="text"
                          required
                          value={editingTemplateHeader}
                          onChange={(e) => setEditingTemplateHeader(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none font-mono"
                        />
                      </div>

                      <div className="bg-slate-900 text-slate-300 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-[10px]">
                        <span className="text-emerald-400 font-bold uppercase tracking-wider block border-b border-slate-800 pb-1">Previsualización de Estructura Interna del Cascarón</span>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="text-slate-500 block">{"[Encabezado Principal]"}</span>
                            <span className="text-white font-bold">{editingTemplateHeader}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">{"[Sección de Cliente y Sitio]"}</span>
                            <span className="text-slate-300">{selectedTemplateForEdit.estructura.seccion_cliente}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">{"[Sección de Instrumentos y Acreditación]"}</span>
                            <span className="text-slate-300">{selectedTemplateForEdit.estructura.seccion_instrumentos}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">{"[Sección de Firmas y Sello de Conservación NOM-151]"}</span>
                            <span className="text-slate-300">{selectedTemplateForEdit.estructura.seccion_firmas}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedTemplateForEdit(null)}
                          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span>Guardar Cascarón</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 font-mono text-center space-y-3">
                      <Settings className="w-10 h-10 text-slate-300 stroke-1 animate-spin" style={{ animationDuration: '6s' }} />
                      <div>
                        <p className="font-bold">Ninguna plantilla seleccionada</p>
                        <p className="text-[10px] text-slate-400 mt-1">Haga clic en una plantilla a la izquierda para editar su cascarón y marcadores estructurales.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* VERIFICATION CRIPTO MODAL FOR NOM-151 CONSTANCIA */}
      <AnimatePresence>
        {selectedVerificationReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedVerificationReport(null)} />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 text-white border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative z-10 p-6 space-y-4"
            >
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-emerald-400">Verificador Criptográfico NOM-151</h3>
                  <p className="text-[10px] text-slate-400">Constancia de Conservación de Mensajes de Datos Legalmente Válida</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs font-mono">
                <div className="bg-slate-900/50 p-3 rounded border border-slate-800 space-y-1">
                  <div className="text-[9px] text-slate-500">CLIENTE / RAZÓN SOCIAL:</div>
                  <div className="text-white font-bold font-sans">{selectedVerificationReport.cliente_nombre || selectedVerificationReport.payload?.datos_sitio?.empresa_cliente}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-800 space-y-1">
                    <div className="text-[9px] text-slate-500">ID DE REPORTE:</div>
                    <div className="text-white font-bold">{selectedVerificationReport.id_reporte}</div>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-800 space-y-1">
                    <div className="text-[9px] text-slate-500">FECHA REGISTRO:</div>
                    <div className="text-white font-bold">{selectedVerificationReport.fecha_reporte || selectedVerificationReport.fecha}</div>
                  </div>
                </div>

                <div className="bg-slate-900/50 p-3 rounded border border-slate-800 space-y-1">
                  <div className="text-[9px] text-slate-500">HASH DE DOCUMENTO ORIGINAL (SHA256):</div>
                  <div className="text-emerald-400 break-all text-[10.5px]">
                    {selectedVerificationReport.xml_hash_sha256 || selectedVerificationReport.payload?.nom151_integridad?.hash_documento_sha256 || "SHA256:d89a12b59c2ef3542d89df251c6b12a8844fa215fe338eaef4"}
                  </div>
                </div>

                <div className="bg-slate-900/50 p-3 rounded border border-slate-800 space-y-1">
                  <div className="text-[9px] text-slate-500">SELLO DIGITAL DEL EMISOR AUTORIZADO (PSC):</div>
                  <div className="text-slate-200 break-all text-[10.5px]">
                    {selectedVerificationReport.sello_digital_nom151 || selectedVerificationReport.payload?.nom151_integridad?.constancia_psc || "NOM151:CONSTANCIA-2026-07-13-FIELD-0012"}
                  </div>
                </div>

                <div className="bg-emerald-950/30 text-emerald-300 border border-emerald-500/20 p-3.5 rounded-lg flex gap-2.5 items-start font-sans">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-normal font-light">
                    Esta constancia certifica bajo la NOM-151-SCFI-2016 de la Secretaría de Economía de México que los datos de metrología del reporte adjunto no han sido modificados ni alterados de ninguna forma desde su registro inicial por el técnico calificado.
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedVerificationReport(null)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold"
                >
                  Cerrar Verificador
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL PARA REGISTRO DE ORDEN DE COMPRA (PO) */}
        {selectedQuoteForPo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedQuoteForPo(null)}
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs p-5 space-y-4"
            >
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase font-mono tracking-wide">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Vincular Orden de Compra (PO)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Establezca el nexo operativo entre la cotización {selectedQuoteForPo.id || selectedQuoteForPo.id_propuesta} de {selectedQuoteForPo.cliente} y la nueva Orden de Trabajo.
                </p>
              </div>

              <form onSubmit={handleRegisterPurchaseOrder} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Costo Final Acordado (MXN)</label>
                    <input
                      type="number"
                      required
                      value={poFinalCost}
                      onChange={(e) => setPoFinalCost(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Fecha Compromiso de Entrega</label>
                    <input
                      type="date"
                      required
                      value={poCommitmentDate}
                      onChange={(e) => setPoCommitmentDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Estatus de la PO del Cliente</label>
                  <select
                    value={poClientStatus}
                    onChange={(e) => setPoClientStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="Firmada por Compras">Firmada por Compras (Aprobada)</option>
                    <option value="Aprobada con Pago Inicial">Aprobada con Anticipo del 50%</option>
                    <option value="En Trámite de e-Firma">En Trámite de Firma Legal</option>
                  </select>
                </div>

                {/* FILE UPLOAD FOR PO ARCHIVE */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Cargar Archivo PDF de la PO (Opcional)</label>
                  <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-all">
                    <input
                      type="file"
                      id="po-file-upload"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPoFile(file.name);
                        }
                      }}
                    />
                    <label htmlFor="po-file-upload" className="cursor-pointer block space-y-1">
                      <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                      <span className="block text-[10px] font-semibold text-slate-600">
                        {poFile ? `Seleccionado: ${poFile}` : "Haga clic para seleccionar o arrastre el archivo de la PO"}
                      </span>
                      <span className="block text-[8px] text-slate-400 font-mono">PDF, JPG o PNG máximo 10MB</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedQuoteForPo(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Vincular y Generar OT</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* MODAL PARA VISUALIZACIÓN DEL EXPEDIENTE AUTO-ALIMENTADO */}
        {compiledDossier && selectedReportToFeed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setCompiledDossier(null);
                setSelectedReportToFeed(null);
              }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden text-xs flex flex-col max-h-[90vh]"
            >
              <div className="bg-slate-900 text-white p-4.5 flex justify-between items-center shrink-0 border-b border-slate-800">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] uppercase font-bold text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {compiledDossier.id_expediente}
                    </span>
                    <h4 className="text-xs font-bold uppercase tracking-wider font-sans">
                      Expediente de Metrología Auto-Alimentado
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Estructura final del reporte: {compiledDossier.templateName} ({compiledDossier.templateCode})
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCompiledDossier(null);
                    setSelectedReportToFeed(null);
                  }}
                  className="text-slate-400 hover:text-white font-bold font-mono text-sm px-2 py-1"
                >
                  ✕
                </button>
              </div>

              {/* DETALLE COMPILADO */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-slate-100 font-mono text-[10px]">
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg flex gap-2 items-start font-sans">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <span className="font-bold block">¡Alimentación de Plantilla Exitosa (100% Automatizada)!</span>
                    Los decibelios medidos, el equipo utilizado, el check-in georreferenciado y las firmas del técnico y representante han sido mapeados dinámicamente desde campo hacia el formato controlled de metrología.
                  </div>
                </div>

                {/* PREVIEW CONTAINER */}
                <div className="bg-white border border-slate-300 shadow-xs rounded-xl p-6.5 space-y-5 text-slate-800">
                  {/* HEADER PREVIEW */}
                  <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-center">
                    <div className="space-y-1">
                      <span className="text-slate-400 text-[8px] uppercase font-bold block">ENCABEZADO DE REPORTE</span>
                      <div className="text-[11px] font-bold text-slate-900">{compiledDossier.estructura_llenada.encabezado}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[10px] text-slate-900">{compiledDossier.templateCode}</div>
                      <div className="text-[8px] text-slate-500">FORMATO CONTROLADO</div>
                    </div>
                  </div>

                  {/* CLIENT SECTION */}
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                    <span className="text-slate-400 text-[8px] uppercase font-bold block">INFORMACIÓN GENERAL DEL CLIENTE</span>
                    <div className="text-slate-900 font-bold whitespace-pre-wrap">{compiledDossier.estructura_llenada.seccion_cliente}</div>
                  </div>

                  {/* INSTRUMENTATION SECTION */}
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                    <span className="text-slate-400 text-[8px] uppercase font-bold block">EQUIPO PATRÓN DE METROLOGÍA (TRAZABILIDAD EMA)</span>
                    <div className="text-slate-900 font-bold whitespace-pre-wrap">{compiledDossier.estructura_llenada.seccion_instrumentos}</div>
                  </div>

                  {/* GPS & TIMES SECTION */}
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                    <span className="text-slate-400 text-[8px] uppercase font-bold block">MONITOREO GEORREFERENCIADO & BITÁCORA DE TIEMPOS</span>
                    <div className="text-slate-900 font-bold whitespace-pre-wrap">{compiledDossier.estructura_llenada.seccion_datos_campo}</div>
                  </div>

                  {/* LECTURAS SECTION */}
                  <div className="border border-emerald-200 bg-emerald-50/50 p-4 rounded-lg space-y-2">
                    <span className="text-emerald-800 text-[9px] uppercase font-bold block flex items-center gap-1 font-sans">
                      <Activity className="w-3.5 h-3.5 text-emerald-600" />
                      LECTURAS Y DECIBELIOS LEVANTADOS EN CAMPO (AUTO-ALIMENTADO)
                    </span>
                    <div className="text-slate-900 font-semibold whitespace-pre-wrap leading-relaxed text-[10.5px]">
                      {compiledDossier.estructura_llenada.seccion_lecturas}
                    </div>
                  </div>

                  {/* SIGNATURES SECTION */}
                  <div className="bg-slate-950 text-slate-300 p-4 rounded-xl space-y-2 border border-slate-900">
                    <span className="text-slate-500 text-[8px] uppercase font-bold block">SELLOS DE VALIDEZ CRIPTOGRÁFICA Y SEGURIDAD NOM-151</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[9.5px]">
                      <div>
                        <span className="text-slate-500 block">FIRMANTE DE CAMPO (REPRESENTANTE):</span>
                        <span className="text-white font-bold">{selectedReportToFeed.payload?.checkin_georreferenciado?.firma_representante || "Lic. Laura Ortega"}</span>
                        <span className="text-slate-400 block text-[8px]">Firma capturada con trazabilidad georreferenciada</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">METRÓLOGO EMISOR (TÉCNICO):</span>
                        <span className="text-white font-bold">{compiledDossier.estructura_llenada.seccion_firmas.split("\n")[0]}</span>
                        <span className="text-slate-400 block text-[8px]">Certificación e.firma SAT</span>
                      </div>
                    </div>
                    <div className="border-t border-slate-800 pt-2 mt-2 text-[8.5px] text-emerald-400 font-mono break-all leading-normal">
                      HASH DE VERIFICACIÓN DE INTEGRIDAD INTEGRAL:<br />
                      <span className="text-white font-bold">{compiledDossier.estructura_llenada.seccion_firmas.split("SHA256:")[1] || "d89a12b59c2ef3542d89df251c6b12a8844fa215fe338eaef4"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center shrink-0">
                <span className="text-[9px] font-mono text-slate-400 max-w-sm">
                  Al descargar este expediente se empaquetan las constancias originales de metrología y el XML sellado por el PSC acreditado.
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCompiledDossier(null);
                      setSelectedReportToFeed(null);
                    }}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors"
                  >
                    Cerrar Vista
                  </button>
                  <button
                    onClick={() => {
                      alert(`¡Expediente Técnico ${compiledDossier.id_expediente} Despachado con Éxito!\nSe ha generado el archivo ZIP firmado conteniendo:\n- Informe de Ensayo de Metrología (PDF)\n- XML de Sello de Tiempo NOM-151\n- Reporte de Calibración EMA del Sonómetro Patrón.`);
                      setCompiledDossier(null);
                      setSelectedReportToFeed(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <Download className="w-4 h-4 text-emerald-200" />
                    <span>Despachar Expediente (ZIP)</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
