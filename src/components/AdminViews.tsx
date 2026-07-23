import React, { useState, useEffect, useMemo } from 'react';
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
  Settings,
  Users,
  Building2,
  Search,
  Plus,
  Trash,
  MessageSquare,
  Edit,
  Briefcase,
  Clock
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
  selectedRole?: string;
}

export default function AdminViews(props: AdminViewsProps) {
  const {
    activePersona,
    selectedRole,
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

  // --- BOOKKEEPING / ACCOUNTING STATES ---
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [newInvoiceClient, setNewInvoiceClient] = useState("");
  const [newInvoiceService, setNewInvoiceService] = useState("Mapeo NOM-011-STPS");
  const [newInvoiceAmount, setNewInvoiceAmount] = useState(0);
  const [newInvoiceDueDate, setNewInvoiceDueDate] = useState("");
  const [collectionReminders, setCollectionReminders] = useState<{ [id: number]: number }>({});
  const [collectionNotes, setCollectionNotes] = useState<{ [id: number]: string }>({
    2: "El cliente solicita prórroga de 15 días por cierre de año fiscal.",
    3: "Factura enviada a revisión con el departamento de cuentas por pagar."
  });
  const [editingCollectionNoteId, setEditingCollectionNoteId] = useState<number | null>(null);
  const [tempCollectionNote, setTempCollectionNote] = useState("");
  const [selectedInvoiceForReminder, setSelectedInvoiceForReminder] = useState<any | null>(null);

  const [selectedQuoteForPo, setSelectedQuoteForPo] = useState<any | null>(null);
  const [poFinalCost, setPoFinalCost] = useState<number>(0);
  const [poCommitmentDate, setPoCommitmentDate] = useState("");
  const [poClientStatus, setPoClientStatus] = useState("Firmada por Compras");
  const [poFile, setPoFile] = useState<any>(null);

  const [selectedReportToFeed, setSelectedReportToFeed] = useState<any | null>(null);
  const [compiledDossier, setCompiledDossier] = useState<any | null>(null);
  const [serverDossier, setServerDossier] = useState<any | null>(null);

  // --- CRM & CLIENTS ADVANCED STATES ---
  const [clientsList, setClientsList] = useState<any[]>(() => {
    const saved = localStorage.getItem('aspechs_clients_list');
    return saved ? JSON.parse(saved) : [
      {
        id: "CLI-001",
        razon_social: "Aceros de México S.A. de C.V.",
        rfc: "AME841012TS9",
        direccion: "Av. Constitución 400, Monterrey, NL",
        contacto_nombre: "Ing. Juan Gómez",
        contacto_email: "compras@acerosmex.com",
        contacto_telefono: "811-555-0199",
        sector: "Metalúrgico",
        estado: "Activo",
        pipeline_stage: "negotiation",
        fecha_registro: "2026-01-15"
      },
      {
        id: "CLI-002",
        razon_social: "Farmacéutica del Norte S.A. de C.V.",
        rfc: "FNO981105RE4",
        direccion: "Paseo de la Reforma 1200, Ciudad de México",
        contacto_nombre: "Dra. Sofía Méndez",
        contacto_email: "s.mendez@farnorte.com",
        contacto_telefono: "555-123-4567",
        sector: "Farmacéutico",
        estado: "Activo",
        pipeline_stage: "quoted",
        fecha_registro: "2026-02-20"
      },
      {
        id: "CLI-003",
        razon_social: "Alimentos Procesados Bajío S.A.",
        rfc: "APB100220UY3",
        direccion: "Blvd. Adolfo López Mateos 15, León, Gto",
        contacto_nombre: "Lic. Pedro Torres",
        contacto_email: "ptorres@alimentosbajio.mx",
        contacto_telefono: "477-987-6543",
        sector: "Alimentos",
        estado: "Prospecto",
        pipeline_stage: "lead",
        fecha_registro: "2026-04-10"
      },
      {
        id: "CLI-004",
        razon_social: "Refinería Tuxpan S.A. de C.V.",
        rfc: "RTU750403KL8",
        direccion: "Zona Industrial Lote 4, Tuxpan, Ver",
        contacto_nombre: "Ing. Carlos Ruiz",
        contacto_email: "cruiz@refineriatuxpan.com",
        contacto_telefono: "783-111-2233",
        sector: "Petroquímico",
        estado: "Activo",
        pipeline_stage: "won",
        fecha_registro: "2026-05-02"
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('aspechs_clients_list', JSON.stringify(clientsList));
  }, [clientsList]);

  const [clientsSearchQuery, setClientsSearchQuery] = useState("");
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [newClientForm, setNewClientForm] = useState({
    razon_social: "",
    rfc: "",
    direccion: "",
    contacto_nombre: "",
    contacto_email: "",
    contacto_telefono: "",
    sector: "Industrial",
    estado: "Activo",
    pipeline_stage: "lead"
  });

  const [trackingNotes, setTrackingNotes] = useState<any[]>(() => {
    const saved = localStorage.getItem('aspechs_tracking_notes');
    return saved ? JSON.parse(saved) : [
      {
        id: "TRK-001",
        cliente_id: "CLI-001",
        cliente_nombre: "Aceros de México S.A. de C.V.",
        fecha: "2026-07-10T14:30:00Z",
        tipo: "Llamada",
        comentario: "Se contactó al Ing. Gómez para revisar la cotización de ruido de la NOM-011. Comenta que el departamento de compras está revisando el presupuesto final.",
        usuario: "Sofía Méndez"
      },
      {
        id: "TRK-002",
        cliente_id: "CLI-002",
        cliente_nombre: "Farmacéutica del Norte S.A. de C.V.",
        fecha: "2026-07-12T11:00:00Z",
        tipo: "Reunión",
        comentario: "Reunión técnica virtual de alineación sobre los puntos de medición de la NOM-025. Se validó que el laboratorio de metrología cuenta con calibración vigente de luxómetros ante EMA.",
        usuario: "Sofía Méndez"
      },
      {
        id: "TRK-003",
        cliente_id: "CLI-003",
        cliente_nombre: "Alimentos Procesados Bajío S.A.",
        fecha: "2026-07-15T09:45:00Z",
        tipo: "Correo",
        comentario: "Se envió la cotización formal con el desglose de IVA y viáticos estimados. Quedaron de enviar comentarios antes del fin de semana.",
        usuario: "Sofía Méndez"
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('aspechs_tracking_notes', JSON.stringify(trackingNotes));
  }, [trackingNotes]);

  const [selectedClientForTracking, setSelectedClientForTracking] = useState<string>("all");
  const [newTrackingNote, setNewTrackingNote] = useState({
    cliente_id: "",
    tipo: "Llamada",
    comentario: ""
  });

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientForm.razon_social.trim() || !newClientForm.contacto_nombre.trim()) {
      alert("Por favor, rellene los campos obligatorios.");
      return;
    }

    if (editingClient) {
      const updated = clientsList.map(c => c.id === editingClient.id ? { ...c, ...newClientForm } : c);
      setClientsList(updated);
      setEditingClient(null);
      alert("Cliente actualizado exitosamente.");
    } else {
      const newClient = {
        ...newClientForm,
        id: `CLI-00${clientsList.length + 1}`,
        fecha_registro: new Date().toISOString().split('T')[0]
      };
      setClientsList([...clientsList, newClient]);
      alert("Cliente registrado exitosamente en el sistema CRM.");
    }

    setNewClientForm({
      razon_social: "",
      rfc: "",
      direccion: "",
      contacto_nombre: "",
      contacto_email: "",
      contacto_telefono: "",
      sector: "Industrial",
      estado: "Activo",
      pipeline_stage: "lead"
    });
  };

  const handleStartEditClient = (client: any) => {
    setEditingClient(client);
    setNewClientForm({
      razon_social: client.razon_social,
      rfc: client.rfc,
      direccion: client.direccion,
      contacto_nombre: client.contacto_nombre,
      contacto_email: client.contacto_email,
      contacto_telefono: client.contacto_telefono,
      sector: client.sector,
      estado: client.estado,
      pipeline_stage: client.pipeline_stage || "lead"
    });
  };

  const handleAddTrackingNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackingNote.cliente_id) {
      alert("Por favor, seleccione un cliente.");
      return;
    }
    if (!newTrackingNote.comentario.trim()) {
      alert("Por favor, escriba un comentario.");
      return;
    }

    const targetClient = clientsList.find(c => c.id === newTrackingNote.cliente_id);
    const newNote = {
      id: `TRK-00${trackingNotes.length + 1}`,
      cliente_id: newTrackingNote.cliente_id,
      cliente_nombre: targetClient ? targetClient.razon_social : "Cliente",
      fecha: new Date().toISOString(),
      tipo: newTrackingNote.tipo,
      comentario: newTrackingNote.comentario,
      usuario: activePersona.nombre_completo
    };

    setTrackingNotes([newNote, ...trackingNotes]);
    setNewTrackingNote({
      cliente_id: "",
      tipo: "Llamada",
      comentario: ""
    });
    alert("Nota de seguimiento registrada correctamente.");
  };

  const handleMovePipelineStage = (clientId: string, nextStage: string) => {
    setClientsList(prev => prev.map(c => c.id === clientId ? { ...c, pipeline_stage: nextStage } : c));
  };

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
      console.warn("API de conversión local activa.", err);
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
      console.warn("Fallo al conectar con el backend. Utilizando motor local integrado.", err);
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

  const [extraInvoices, setExtraInvoices] = useState<any[]>([]);
  const allInvoices = useMemo(() => {
    return [...(invoices || []), ...extraInvoices];
  }, [invoices, extraInvoices]);

  // Dynamic filter lists
  const availableClientsList = useMemo(() => {
    const clients = new Set<string>();
    generatedQuotes.forEach(q => clients.add(q.cliente));
    allInvoices.forEach(i => clients.add(i.cliente));
    return Array.from(clients);
  }, [generatedQuotes, allInvoices]);

  // Filter Invoices list and compute dynamic metrics on the fly!
  const filteredInvoices = useMemo(() => {
    return allInvoices.filter(inv => {
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
  }, [allInvoices, finMonthFilter, finClientFilter, finServiceFilter]);

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

  const getAdminRoleLabel = (roleId?: string) => {
    switch (roleId) {
      case 'dir_at_cl': return "Director de Atención a Clientes";
      case 'contabilidad': return "Ejecutivo de Finanzas y Contabilidad";
      case 'jefe_rep': return "Jefe de Reportes y Validación";
      default: return "Ejecutivo de Ventas y Administración";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {renderWelcomeBanner(getAdminRoleLabel(selectedRole))}

      {(activeTab === 'admin_crm' || activeTab === 'dac_quotes') && (
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

      {/* TABS ESPECIALES PARA EL ROL DIRECTOR DE ATENCIÓN A CLIENTES (DAC) */}
      {activeTab === 'dac_clients' && (
        <motion.div
          key="dac_clients"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Users className="text-[#85AA1C] w-4.5 h-4.5" />
                Directorio y Registro de Clientes
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Registre nuevas razones sociales, asigne contactos principales y edite perfiles de clientes para propuestas comerciales.</p>
            </div>
            {editingClient && (
              <button
                onClick={() => {
                  setEditingClient(null);
                  setNewClientForm({
                    razon_social: "",
                    rfc: "",
                    direccion: "",
                    contacto_nombre: "",
                    contacto_email: "",
                    contacto_telefono: "",
                    sector: "Industrial",
                    estado: "Activo",
                    pipeline_stage: "lead"
                  });
                }}
                className="text-xs px-3 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                Cancelar Edición
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* FORMULARIO: ALTA / EDICIÓN */}
            <div className="lg:col-span-4 bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <UserPlus className="w-4 h-4 text-[#85AA1C]" />
                  {editingClient ? "Editar Cliente Autorizado" : "Alta de Nuevo Cliente"}
                </h4>
                <p className="text-[10px] text-slate-400">Ingrese los datos fiscales y de contacto comercial.</p>
              </div>

              <form onSubmit={handleSaveClient} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Razón Social *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aceros de México S.A. de C.V."
                    value={newClientForm.razon_social}
                    onChange={(e) => setNewClientForm({ ...newClientForm, razon_social: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">RFC (SAT)</label>
                    <input
                      type="text"
                      placeholder="e.g. AME841012TS9"
                      value={newClientForm.rfc}
                      onChange={(e) => setNewClientForm({ ...newClientForm, rfc: e.target.value.toUpperCase() })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Sector Industrial</label>
                    <select
                      value={newClientForm.sector}
                      onChange={(e) => setNewClientForm({ ...newClientForm, sector: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] text-xs"
                    >
                      <option value="Industrial">Industrial</option>
                      <option value="Metalúrgico">Metalúrgico</option>
                      <option value="Farmacéutico">Farmacéutico</option>
                      <option value="Alimentos">Alimentos</option>
                      <option value="Petroquímico">Petroquímico</option>
                      <option value="Automotriz">Automotriz</option>
                      <option value="Químico">Químico</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Domicilio Fiscal</label>
                  <input
                    type="text"
                    placeholder="Calle, Número, Colonia, CP, Ciudad"
                    value={newClientForm.direccion}
                    onChange={(e) => setNewClientForm({ ...newClientForm, direccion: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] text-xs"
                  />
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-3.5">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Contacto Principal</span>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Nombre del Contacto *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ing. Juan Gómez"
                      value={newClientForm.contacto_nombre}
                      onChange={(e) => setNewClientForm({ ...newClientForm, contacto_nombre: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="ejemplo@cliente.com"
                        value={newClientForm.contacto_email}
                        onChange={(e) => setNewClientForm({ ...newClientForm, contacto_email: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Teléfono Móvil</label>
                      <input
                        type="tel"
                        placeholder="811-555-0199"
                        value={newClientForm.contacto_telefono}
                        onChange={(e) => setNewClientForm({ ...newClientForm, contacto_telefono: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Estado de Relación</label>
                    <select
                      value={newClientForm.estado}
                      onChange={(e) => setNewClientForm({ ...newClientForm, estado: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] text-xs"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Prospecto">Prospecto / Lead</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Fase del Pipeline</label>
                    <select
                      value={newClientForm.pipeline_stage}
                      onChange={(e) => setNewClientForm({ ...newClientForm, pipeline_stage: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] text-xs"
                    >
                      <option value="lead">Prospecto (Lead)</option>
                      <option value="quoted">Cotizado</option>
                      <option value="negotiation">Negociación</option>
                      <option value="won">Ganado / Cerrado</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#85AA1C] hover:bg-[#739418] text-white font-bold rounded-xl text-xs transition duration-200 shadow-sm flex items-center justify-center gap-1.5 mt-3 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{editingClient ? "Guardar Cambios" : "Registrar Cliente"}</span>
                </button>
              </form>
            </div>

            {/* TABLA / DIRECTORIO DE CLIENTES */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  Clientes Registrados y Cartera Comercial
                </h4>
                
                {/* Buscador */}
                <div className="relative w-full sm:w-64 text-xs">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar por Razón Social o RFC..."
                    value={clientsSearchQuery}
                    onChange={(e) => setClientsSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50/50 focus:outline-none focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-mono text-[10px] uppercase">
                      <th className="py-2.5 px-3">Cliente / RFC</th>
                      <th className="py-2.5 px-3">Sector</th>
                      <th className="py-2.5 px-3">Contacto Principal</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(() => {
                      const filtered = clientsList.filter(c => 
                        c.razon_social.toLowerCase().includes(clientsSearchQuery.toLowerCase()) ||
                        c.rfc.toLowerCase().includes(clientsSearchQuery.toLowerCase()) ||
                        c.contacto_nombre.toLowerCase().includes(clientsSearchQuery.toLowerCase())
                      );
                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400">
                              No se encontraron clientes que coincidan con la búsqueda.
                            </td>
                          </tr>
                        );
                      }
                      return filtered.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/60 transition duration-150">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-800">{c.razon_social}</div>
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                              <span>ID: {c.id}</span>
                              <span className="text-slate-300">|</span>
                              <span>RFC: {c.rfc || "N/A"}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded-full text-[10px]">
                              {c.sector}
                            </span>
                          </td>
                          <td className="py-3 px-3 space-y-0.5">
                            <div className="font-medium text-slate-700 flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              {c.contacto_nombre}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono flex flex-col gap-0.5">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-300" /> {c.contacto_email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-300" /> {c.contacto_telefono}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 font-bold rounded-full text-[9px] uppercase font-mono ${
                              c.estado === "Activo" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                              c.estado === "Prospecto" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                              "bg-slate-100 text-slate-600"
                            }`}>
                              {c.estado}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleStartEditClient(c)}
                                className="p-1.5 bg-slate-100 hover:bg-[#85AA1C]/10 text-slate-600 hover:text-[#85AA1C] rounded-lg transition cursor-pointer"
                                title="Editar Perfil"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`¿Desea eliminar a ${c.razon_social} del CRM?`)) {
                                    setClientsList(clientsList.filter(item => item.id !== c.id));
                                  }
                                }}
                                className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg transition cursor-pointer"
                                title="Eliminar Cliente"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </motion.div>
      )}

      {activeTab === 'dac_tracking' && (
        <motion.div
          key="dac_tracking"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <Briefcase className="text-[#85AA1C] w-4.5 h-4.5" />
              Seguimiento de Ventas, Pipeline y Bitácora de Interacciones
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Gestione el progreso de prospectos a través del embudo de ventas y registre minutas de llamadas, correos y acuerdos comerciales.</p>
          </div>

          {/* PIPELINE / EMBADO INTERACTIVO (BENTO STYLE) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#85AA1C]" />
              Embudo de Ventas Comercial (Sales Pipeline)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* COL 1: LEAD */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200/85 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">1. Prospecto / Lead</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                    {clientsList.filter(c => c.pipeline_stage === "lead").length}
                  </span>
                </div>
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {clientsList.filter(c => c.pipeline_stage === "lead").map(c => (
                    <div key={c.id} className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm space-y-2 text-xs">
                      <div className="font-bold text-slate-800 leading-tight">{c.razon_social}</div>
                      <div className="text-[10px] text-slate-500 font-medium">Contacto: {c.contacto_nombre}</div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                        <span className="text-[9px] text-slate-400 font-mono">{c.id}</span>
                        <button
                          onClick={() => handleMovePipelineStage(c.id, "quoted")}
                          className="px-2 py-1 bg-[#85AA1C]/10 text-[#85AA1C] hover:bg-[#85AA1C] hover:text-white font-bold rounded text-[9px] transition flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Cotizar</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {clientsList.filter(c => c.pipeline_stage === "lead").length === 0 && (
                    <div className="text-center py-4 text-[11px] text-slate-400 italic">Sin prospectos activos</div>
                  )}
                </div>
              </div>

              {/* COL 2: QUOTED */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200/85 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">2. Propuesta Enviada</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                    {clientsList.filter(c => c.pipeline_stage === "quoted").length}
                  </span>
                </div>
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {clientsList.filter(c => c.pipeline_stage === "quoted").map(c => (
                    <div key={c.id} className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm space-y-2 text-xs">
                      <div className="font-bold text-slate-800 leading-tight">{c.razon_social}</div>
                      <div className="text-[10px] text-slate-500 font-medium">Contacto: {c.contacto_nombre}</div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                        <button
                          onClick={() => handleMovePipelineStage(c.id, "lead")}
                          className="text-[9px] text-slate-400 hover:text-slate-600 underline font-medium cursor-pointer"
                        >
                          Regresar
                        </button>
                        <button
                          onClick={() => handleMovePipelineStage(c.id, "negotiation")}
                          className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold rounded text-[9px] transition flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Negociar</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {clientsList.filter(c => c.pipeline_stage === "quoted").length === 0 && (
                    <div className="text-center py-4 text-[11px] text-slate-400 italic">Ninguna propuesta enviada</div>
                  )}
                </div>
              </div>

              {/* COL 3: NEGOTIATION */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200/85 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 font-mono">3. Negociación / PO</span>
                  <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                    {clientsList.filter(c => c.pipeline_stage === "negotiation").length}
                  </span>
                </div>
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {clientsList.filter(c => c.pipeline_stage === "negotiation").map(c => (
                    <div key={c.id} className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm space-y-2 text-xs">
                      <div className="font-bold text-slate-800 leading-tight">{c.razon_social}</div>
                      <div className="text-[10px] text-slate-500 font-medium">Contacto: {c.contacto_nombre}</div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                        <button
                          onClick={() => handleMovePipelineStage(c.id, "quoted")}
                          className="text-[9px] text-slate-400 hover:text-slate-600 underline font-medium cursor-pointer"
                        >
                          Regresar
                        </button>
                        <button
                          onClick={() => handleMovePipelineStage(c.id, "won")}
                          className="px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded text-[9px] transition flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Cerrar Ganada</span>
                          <Check className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {clientsList.filter(c => c.pipeline_stage === "negotiation").length === 0 && (
                    <div className="text-center py-4 text-[11px] text-slate-400 italic">Sin negociaciones de PO</div>
                  )}
                </div>
              </div>

              {/* COL 4: WON */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 space-y-3">
                <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 font-mono">4. Ganada (Cerrada)</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                    {clientsList.filter(c => c.pipeline_stage === "won").length}
                  </span>
                </div>
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {clientsList.filter(c => c.pipeline_stage === "won").map(c => (
                    <div key={c.id} className="bg-white p-3 border border-emerald-200 rounded-lg shadow-sm space-y-2 text-xs">
                      <div className="font-bold text-slate-800 leading-tight flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{c.razon_social}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">Contacto: {c.contacto_nombre}</div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                        <span className="text-[9px] text-emerald-600 font-bold uppercase font-mono">Venta Cerrada</span>
                        <button
                          onClick={() => handleMovePipelineStage(c.id, "negotiation")}
                          className="text-[9px] text-slate-400 hover:text-slate-600 underline font-medium cursor-pointer"
                        >
                          Reabrir
                        </button>
                      </div>
                    </div>
                  ))}
                  {clientsList.filter(c => c.pipeline_stage === "won").length === 0 && (
                    <div className="text-center py-4 text-[11px] text-slate-400 italic">Ninguna cuenta ganada aún</div>
                  )}
                </div>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
            
            {/* AGREGAR INTERACCIÓN */}
            <div className="lg:col-span-4 bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <MessageSquare className="w-4 h-4 text-[#85AA1C]" />
                  Registrar Bitácora de Minuta
                </h4>
                <p className="text-[10px] text-slate-400">Agregue notas de reuniones telefónicas o acuerdos técnicos con el cliente.</p>
              </div>

              <form onSubmit={handleAddTrackingNote} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Seleccionar Cliente Comercial *</label>
                  <select
                    required
                    value={newTrackingNote.cliente_id}
                    onChange={(e) => setNewTrackingNote({ ...newTrackingNote, cliente_id: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] text-xs cursor-pointer"
                  >
                    <option value="">-- Elija un cliente --</option>
                    {clientsList.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.razon_social} ({c.contacto_nombre})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Vía de Interacción *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Llamada", "Correo", "Reunión"].map(tipo => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => setNewTrackingNote({ ...newTrackingNote, tipo })}
                        className={`py-1.5 border rounded-lg text-xs font-bold transition duration-150 cursor-pointer text-center ${
                          newTrackingNote.tipo === tipo
                            ? "bg-[#85AA1C] text-white border-[#85AA1C]"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {tipo}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Minuta / Acuerdo Detallado *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Escriba los comentarios del cliente, necesidades del servicio, fecha de propuesta o fecha pactada para llamada técnica posterior..."
                    value={newTrackingNote.comentario}
                    onChange={(e) => setNewTrackingNote({ ...newTrackingNote, comentario: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#85AA1C] hover:bg-[#739418] text-white font-bold rounded-xl text-xs transition duration-200 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Guardar Nota en Bitácora</span>
                </button>
              </form>
            </div>

            {/* HISTORIAL / TIMELINE */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Historial Cronológico de Interacciones
                </h4>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span>Filtrar por Cliente:</span>
                  <select
                    value={selectedClientForTracking}
                    onChange={(e) => setSelectedClientForTracking(e.target.value)}
                    className="border border-slate-200 rounded bg-slate-50 px-2 py-1 text-xs"
                  >
                    <option value="all">Todos los Clientes</option>
                    {clientsList.map(c => (
                      <option key={c.id} value={c.id}>{c.razon_social}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative border-l border-slate-200 pl-4 ml-2.5 space-y-5 py-2 text-xs">
                {(() => {
                  const filtered = trackingNotes.filter(n => selectedClientForTracking === "all" || n.cliente_id === selectedClientForTracking);
                  if (filtered.length === 0) {
                    return <p className="text-xs text-slate-400 italic py-4">No hay notas de seguimiento registradas para este cliente.</p>;
                  }
                  return filtered.map(n => (
                    <div key={n.id} className="relative text-xs">
                      {/* Timeline Dot with Color Tag */}
                      <span className={`absolute -left-[24.5px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                        n.tipo === "Llamada" ? "bg-amber-500" :
                        n.tipo === "Correo" ? "bg-blue-500" :
                        "bg-purple-500"
                      }`} />
                      
                      <div className="space-y-1 bg-slate-50/60 hover:bg-slate-50 border border-slate-100 rounded-xl p-3 transition duration-150">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-slate-400 text-[10px]">
                          <span className="font-bold text-slate-700 text-xs font-sans">
                            {n.cliente_nombre}
                          </span>
                          <span className="font-mono">
                            {new Date(n.fecha).toLocaleString("es-MX")}
                          </span>
                        </div>
                        
                        <p className="text-[11px] text-slate-600 leading-relaxed py-1">
                          {n.comentario}
                        </p>

                        <div className="flex items-center gap-2 text-[9px] uppercase font-bold tracking-wider font-mono pt-1 text-slate-400 border-t border-slate-200/50">
                          <span className={`px-1.5 py-0.5 rounded ${
                            n.tipo === "Llamada" ? "bg-amber-50 text-amber-700" :
                            n.tipo === "Correo" ? "bg-blue-50 text-blue-700" :
                            "bg-purple-50 text-purple-700"
                          }`}>
                            {n.tipo}
                          </span>
                          <span>•</span>
                          <span>Registrado por: {n.usuario}</span>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
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

      {/* ROL CONTABILIDAD - TABS */}
      {activeTab === 'cont_billing' && (
        <motion.div
          key="cont_billing"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <FileSpreadsheet className="text-[#85AA1C] w-4.5 h-4.5" />
                Facturación Electrónica y Timbrado Fiscal (CFDI 4.0)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Emisión, validación y timbrado de comprobantes fiscales digitales por internet bajo los lineamientos del SAT.</p>
            </div>
            <button
              onClick={() => {
                setIsAddInvoiceOpen(!isAddInvoiceOpen);
                setNewInvoiceClient("");
                setNewInvoiceAmount(0);
                setNewInvoiceDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
              }}
              className="px-4 py-2 bg-[#85AA1C] hover:bg-[#739418] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddInvoiceOpen ? "Ocultar Formulario" : "Emitir Nueva Factura (CFDI)"}</span>
            </button>
          </div>

          {/* FORMULARIO PARA AGREGAR NUEVA FACTURA */}
          {isAddInvoiceOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4"
            >
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Datos de Facturación del Emisor y Concepto</h4>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newInvoiceClient || newInvoiceAmount <= 0) {
                    alert("Por favor ingrese el cliente y un monto válido.");
                    return;
                  }
                  const newInv = {
                    id_factura: allInvoices.length + 1,
                    cliente: newInvoiceClient,
                    servicio: newInvoiceService,
                    monto: Number(newInvoiceAmount),
                    estado: "Pendiente",
                    mes: "Julio",
                    fecha_emision: new Date().toISOString().split('T')[0],
                    fecha_vencimiento: newInvoiceDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    uuid_sat: "3E" + Math.random().toString(36).substring(2, 10).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-40CF-8F12-E5FA26D81C10"
                  };
                  if (setInvoices) {
                    setInvoices([...invoices, newInv]);
                  } else {
                    setExtraInvoices([...extraInvoices, newInv]);
                  }
                  setIsAddInvoiceOpen(false);
                  alert(`¡Factura CFDI emitida con éxito! Timbrada ante el SAT con UUID: ${newInv.uuid_sat}`);
                }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs"
              >
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Razón Social del Cliente</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Aceros de México S.A."
                    value={newInvoiceClient}
                    onChange={(e) => setNewInvoiceClient(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#85AA1C]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Concepto / Servicio</label>
                  <select
                    value={newInvoiceService}
                    onChange={(e) => setNewInvoiceService(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="Mapeo NOM-011-STPS (Ruido)">Mapeo NOM-011-STPS (Ruido)</option>
                    <option value="Evaluación NOM-025-STPS (Iluminación)">Evaluación NOM-025-STPS (Iluminación)</option>
                    <option value="Estudio NOM-015-STPS (Térmicas)">Estudio NOM-015-STPS (Térmicas)</option>
                    <option value="Calibración Metrológica de Sonómetros">Calibración Metrológica de Sonómetros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Monto Neto (MXN)</label>
                  <input
                    type="number"
                    required
                    placeholder="Ej. 18500"
                    value={newInvoiceAmount || ''}
                    onChange={(e) => setNewInvoiceAmount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    required
                    value={newInvoiceDueDate}
                    onChange={(e) => setNewInvoiceDueDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono focus:outline-none"
                  />
                </div>
                <div className="md:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsAddInvoiceOpen(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Sellar & Timbrar CFDI</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* TABLA PRINCIPAL DE COMPROBANTES FISCALES */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 uppercase font-mono">Bandeja de Facturación Activa (CFDI 4.0)</span>
              <span className="bg-[#85AA1C]/10 text-[#85AA1C] font-bold font-mono px-2 py-0.5 rounded text-[10px]">{allInvoices.length} facturas registradas</span>
            </div>
            
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase tracking-wider text-[10px] font-mono">
                <tr>
                  <th className="px-4 py-3">ID Factura / UUID SAT</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Concepto</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                  <th className="px-4 py-3 text-right">IVA (16%)</th>
                  <th className="px-4 py-3 text-right">Monto Total</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allInvoices.map((inv) => {
                  const sub = inv.monto;
                  const iva = sub * 0.16;
                  const total = sub + iva;
                  return (
                    <tr key={inv.id_factura} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono">
                        <div className="font-bold text-slate-900">FAC-2026-00{inv.id_factura}</div>
                        <div className="text-[9px] text-slate-400 select-all font-light tracking-tight">{inv.uuid_sat || "5F4A87B1-40A2-4BC2-91EA-A3926BF9D13C"}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-semibold">{inv.cliente}</td>
                      <td className="px-4 py-3">
                        <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[9.5px] font-sans font-medium">
                          {inv.servicio || inv.Concepto || "Mapeo NOM-011-STPS"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">${sub.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">${iva.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-950">${total.toLocaleString(undefined, {minimumFractionDigits: 2})} MXN</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9.5px] font-bold rounded-full border ${
                          inv.estado === 'Pagado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          inv.estado === 'Vencido' ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${inv.estado === 'Pagado' ? 'bg-emerald-500' : inv.estado === 'Vencido' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                          {inv.estado === 'Pagado' ? 'Efectuada' : inv.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                        {inv.estado !== 'Pagado' && (
                          <button
                            onClick={() => {
                              handleToggleInvoiceStatus(inv.id_factura);
                              alert("Se ha registrado el Complemento de Pago (REP) en el SAT y conciliado la factura.");
                            }}
                            className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 rounded font-bold text-[9.5px] cursor-pointer"
                          >
                            Cobrar
                          </button>
                        )}
                        <button
                          onClick={() => alert(`Descargando archivo XML CFDI para la factura FAC-2026-00${inv.id_factura}`)}
                          className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[9.5px] text-slate-600 cursor-pointer"
                          title="Descargar XML Original"
                        >
                          XML
                        </button>
                        <button
                          onClick={() => alert(`Imprimiendo representación PDF bajo el estándar fiscal del SAT para FAC-2026-00${inv.id_factura}`)}
                          className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[9.5px] text-slate-600 cursor-pointer"
                          title="Descargar PDF"
                        >
                          PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'cont_collection' && (
        <motion.div
          key="cont_collection"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <DollarSign className="text-emerald-600 w-4.5 h-4.5" />
              Gestión de Cobranza, Cartera y Conciliación Relacional
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Control de cuentas por cobrar, antigüedad de saldos, seguimiento de promesas de pago y envío automatizado de requerimientos.</p>
          </div>

          {/* DYNAMIC KPI BLOCKS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Cartera Total por Cobrar</span>
              <div className="text-lg font-bold font-mono text-slate-900 mt-2">
                ${allInvoices.filter(i => i.estado !== 'Pagado').reduce((acc, i) => acc + i.monto, 0).toLocaleString()} MXN
              </div>
              <p className="text-[9.5px] text-slate-400 mt-1">Total de saldos pendientes de liquidación.</p>
            </div>
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-red-800 uppercase font-mono">Mora Crítica (Vencido)</span>
              <div className="text-lg font-bold font-mono text-red-700 mt-2">
                ${allInvoices.filter(i => i.estado === 'Vencido').reduce((acc, i) => acc + i.monto, 0).toLocaleString()} MXN
              </div>
              <p className="text-[9.5px] text-red-600 mt-1">Facturas con plazo de pago comercial excedido.</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase font-mono">Recaudado este Mes</span>
              <div className="text-lg font-bold font-mono text-emerald-700 mt-2">
                ${allInvoices.filter(i => i.estado === 'Pagado').reduce((acc, i) => acc + i.monto, 0).toLocaleString()} MXN
              </div>
              <p className="text-[9.5px] text-emerald-600 mt-1">Ingresos conciliados en cuenta de banco.</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-blue-800 uppercase font-mono">Gestiones Realizadas</span>
              <div className="text-lg font-bold font-mono text-blue-700 mt-2">
                {(Object.values(collectionReminders) as number[]).reduce((acc, curr) => acc + curr, 0)} Alertas
              </div>
              <p className="text-[9.5px] text-blue-600 mt-1">Exhortos de pago timbrados y enviados.</p>
            </div>
          </div>

          {/* ANTIGÜEDAD DE SALDOS */}
          <div className="bg-white border border-slate-200 p-4.5 rounded-xl shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Distribución Temporal de la Cartera (Antigüedad de Saldos)</h4>
            <div className="w-full bg-slate-100 h-6 rounded-lg overflow-hidden flex font-mono text-[10px] text-white font-bold text-center">
              <div className="bg-emerald-500 flex items-center justify-center transition-all" style={{ width: '55%' }}>Corriente: 55%</div>
              <div className="bg-amber-500 flex items-center justify-center transition-all" style={{ width: '25%' }}>31-60 Días: 25%</div>
              <div className="bg-red-500 flex items-center justify-center transition-all" style={{ width: '20%' }}>61+ Días: 20%</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span> Al corriente (Plazo ordinario de crédito)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-sm"></span> Retraso leve (Bajo gestión extrajudicial preventiva)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500 rounded-sm"></span> Mora crítica (Enviado a requerimiento formal)</div>
            </div>
          </div>

          {/* LISTADO DE SEGUIMIENTO A LA CARTERA */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 uppercase font-mono">Bandeja de Cobranza y Bitácora de Compromisos</span>
              <span className="text-slate-400 font-mono text-[10px]">Filtrado automático de saldos pendientes</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase tracking-wider text-[10px] font-mono">
                <tr>
                  <th className="px-4 py-3">Factura</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3 text-right">Saldo Insoluto</th>
                  <th className="px-4 py-3">Vencimiento</th>
                  <th className="px-4 py-3">Estatus Mora</th>
                  <th className="px-4 py-3">Comentarios / Compromisos de Pago</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allInvoices.filter(inv => inv.estado !== 'Pagado').map((inv) => {
                  const remindersCount = collectionReminders[inv.id_factura] || 0;
                  const currentNote = collectionNotes[inv.id_factura] || "Sin observaciones de cobranza registradas.";
                  return (
                    <tr key={inv.id_factura} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">FAC-2026-00{inv.id_factura}</td>
                      <td className="px-4 py-3 text-slate-700 font-semibold">{inv.cliente}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">${(inv.monto * 1.16).toLocaleString(undefined, {minimumFractionDigits:2})} MXN</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{inv.fecha_vencimiento}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full ${
                          inv.estado === 'Vencido' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.estado === 'Vencido' ? 'VENCIDA (Peligro)' : 'CORRIENTE'}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs text-slate-600 italic">
                        {editingCollectionNoteId === inv.id_factura ? (
                          <div className="flex gap-1.5 items-center">
                            <input
                              type="text"
                              value={tempCollectionNote}
                              onChange={(e) => setTempCollectionNote(e.target.value)}
                              className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-800 w-full"
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                setCollectionNotes({ ...collectionNotes, [inv.id_factura]: tempCollectionNote });
                                setEditingCollectionNoteId(null);
                              }}
                              className="px-1.5 py-0.5 bg-emerald-600 text-white rounded font-bold text-[9.5px] cursor-pointer"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingCollectionNoteId(null)}
                              className="px-1.5 py-0.5 bg-slate-300 text-slate-700 rounded font-bold text-[9.5px] cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center gap-2 group">
                            <span>{currentNote}</span>
                            <button
                              onClick={() => {
                                setEditingCollectionNoteId(inv.id_factura);
                                setTempCollectionNote(currentNote);
                              }}
                              className="text-[#85AA1C] hover:underline font-bold text-[9.5px] cursor-pointer"
                            >
                              Editar
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedInvoiceForReminder(inv);
                          }}
                          className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-200 rounded font-bold text-[9.5px] flex inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Requerir Pago {remindersCount > 0 ? `(${remindersCount})` : ''}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* SIMULACIÓN DE DETALLE DE RECORDATORIO DE PAGO */}
          {selectedInvoiceForReminder && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 text-white border border-slate-800 p-5 rounded-xl space-y-4 shadow-lg"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Mail className="text-blue-400 w-4 h-4" />
                  Redacción de Exhorto Oficial y Recordatorio de Pago CFDI
                </h4>
                <button
                  onClick={() => setSelectedInvoiceForReminder(null)}
                  className="text-slate-400 hover:text-white font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">Para:</span>
                  <span className="text-slate-200 font-semibold">{selectedInvoiceForReminder.cliente} (compras@contacto.com)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">Asunto:</span>
                  <span className="text-slate-200 font-semibold">Exhorto Preventivo de Pago - Factura FAC-2026-00{selectedInvoiceForReminder.id_factura} - ASP Metrología</span>
                </div>
                <div className="bg-slate-950 p-4 rounded border border-slate-800 font-mono text-[10.5px] text-slate-300 whitespace-pre-wrap leading-relaxed">
{`Estimado Cliente,

Le contactamos del departamento de Cobranza y Cartera de ASP/ECH&S Metrología.
Hacemos de su conocimiento que al día de hoy registramos un saldo insoluto pendiente de pago por concepto de servicios de evaluación y mapeo de NOM-STPS.

Detalle del Comprobante Fiscal:
• Número de Factura: FAC-2026-00${selectedInvoiceForReminder.id_factura}
• UUID SAT: ${selectedInvoiceForReminder.uuid_sat || "5F4A87B1-40A2-4BC2-91EA-A3926BF9D13C"}
• Concepto: ${selectedInvoiceForReminder.servicio || "Mapeo Metrológico NOM-011-STPS"}
• Monto Neto: $${selectedInvoiceForReminder.monto.toLocaleString(undefined, {minimumFractionDigits: 2})} MXN
• Total con IVA (16%): $${(selectedInvoiceForReminder.monto * 1.16).toLocaleString(undefined, {minimumFractionDigits: 2})} MXN
• Fecha Límite de Pago: ${selectedInvoiceForReminder.fecha_vencimiento}

Le solicitamos de la manera más atenta hacernos llegar la ficha de depósito o clave de transferencia (SPEI) para proceder con el timbrado de su complemento de pago correspondiente bajo el esquema CFDI 4.0.

Atentamente,
ASP METROLOGÍA S.A. DE C.V.`}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSelectedInvoiceForReminder(null)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg cursor-pointer"
                  >
                    Cerrar Vista
                  </button>
                  <button
                    onClick={() => {
                      const id = selectedInvoiceForReminder.id_factura;
                      setCollectionReminders({ ...collectionReminders, [id]: (collectionReminders[id] || 0) + 1 });
                      setSelectedInvoiceForReminder(null);
                      alert("¡Correo electrónico enviado con éxito a la cuenta del cliente! Se registró la bitácora de cobranza.");
                    }}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Enviar Exhorto por Mail</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {activeTab === 'cont_reports' && (
        <motion.div
          key="cont_reports"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Calculator className="text-[#85AA1C] w-4.5 h-4.5" />
                Reportes Financieros, EBITDA y Retenciones Tributarias
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Indicadores clave de rendimiento financiero, impuestos retenidos e históricos consolidados del ejercicio fiscal.</p>
            </div>
            <button
              onClick={() => alert("Generando balance contable completo consolidado en formato de hoja de cálculo XML certificado por e.firma SAT...")}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Reporte Excel</span>
            </button>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block">Ingresos Acumulados (YTD)</span>
              <div className="text-2xl font-bold font-mono text-slate-950">
                ${allInvoices.filter(i => i.estado === 'Pagado').reduce((acc, i) => acc + i.monto * 1.16, 0).toLocaleString(undefined, {maximumFractionDigits:0})} MXN
              </div>
              <p className="text-[10px] text-slate-400">Total acumulado cobrado con IVA incluido.</p>
            </div>
            <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block">Retenciones de IVA y ISR (SAT)</span>
              <div className="text-2xl font-bold font-mono text-emerald-600">
                ${allInvoices.filter(i => i.estado === 'Pagado').reduce((acc, i) => acc + i.monto * 0.16, 0).toLocaleString(undefined, {maximumFractionDigits:0})} MXN
              </div>
              <p className="text-[10px] text-slate-400">IVA acreditable y retenciones fiscales calculadas.</p>
            </div>
            <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block">EBITDA / Beneficio Operativo Est.</span>
              <div className="text-2xl font-bold font-mono text-blue-600">
                ${(allInvoices.filter(i => i.estado === 'Pagado').reduce((acc, i) => acc + i.monto, 0) * 0.82).toLocaleString(undefined, {maximumFractionDigits:0})} MXN
              </div>
              <p className="text-[10px] text-slate-400">Margen neto operativo estimado en 82% por servicios.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
            {/* GRÁFICO SVG DE FACTURACIÓN MENSUAL */}
            <div className="lg:col-span-7 bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Historial de Facturación Mensual - Ejercicio 2026</h4>
              <div className="h-44 flex items-end justify-between px-4 border-b border-slate-200 pb-1 pt-6">
                {[
                  { mes: 'Ene', monto: 140000 },
                  { mes: 'Feb', monto: 165000 },
                  { mes: 'Mar', monto: 120000 },
                  { mes: 'Abr', monto: 195000 },
                  { mes: 'May', monto: 220000 },
                  { mes: 'Jun', monto: 180000 },
                  { mes: 'Jul', monto: 245000 },
                ].map((item, idx) => {
                  const maxMonto = 250000;
                  const heightPercent = `${(item.monto / maxMonto) * 100}%`;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5 w-8">
                      <span className="text-[8px] font-mono font-bold text-slate-500">${(item.monto / 1000).toFixed(0)}k</span>
                      <div className="w-full bg-slate-100 hover:bg-[#85AA1C]/20 rounded-t transition-all relative group cursor-pointer" style={{ height: '120px' }}>
                        <div className="absolute bottom-0 left-0 right-0 bg-[#85AA1C] hover:bg-[#739418] rounded-t transition-all" style={{ height: heightPercent }}></div>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400">{item.mes}</span>
                    </div>
                  );
                })}
              </div>
              <div className="text-[10.5px] text-slate-500 text-center font-light leading-relaxed">
                El gráfico muestra la facturación total facturada por mes. El mes de **Julio** reporta un incremento del **36.1%** gracias al aumento de ODTs asignadas al sector manufacturero.
              </div>
            </div>

            {/* INGRESOS POR NORMATIVA */}
            <div className="lg:col-span-5 bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Participación de Ingresos por Tipo de Norma</h4>
              
              <div className="space-y-3.5">
                {[
                  { name: "NOM-011-STPS (Ruido Ambiental e Laboral)", percent: 45, color: "bg-blue-600", amount: 154000 },
                  { name: "NOM-025-STPS (Iluminación de Áreas)", percent: 30, color: "bg-emerald-600", amount: 102000 },
                  { name: "NOM-015-STPS (Condiciones Térmicas)", percent: 15, color: "bg-amber-600", amount: 51000 },
                  { name: "Calibración Metrológica Autorizada (EMA)", percent: 10, color: "bg-purple-600", amount: 34000 }
                ].map((norm, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-semibold text-slate-700">{norm.name}</span>
                      <span className="font-mono font-bold text-slate-900">{norm.percent}% (${(norm.amount / 1000).toFixed(0)}k)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`${norm.color} h-full rounded-full`} style={{ width: `${norm.percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 flex gap-2">
                <Info className="w-4 h-4 text-[#85AA1C] shrink-0 mt-0.5" />
                <p className="text-[9.5px] text-slate-500 leading-normal">
                  Los estudios asociados a la **NOM-011-STPS** representan la principal fuente de ingresos del laboratorio, seguidos por auditorías de iluminación NOM-025.
                </p>
              </div>
            </div>
          </div>
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
                setServerDossier(null);
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
                    setServerDossier(null);
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

                {/* Live serverDossier preview if available */}
                {serverDossier && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2 text-left font-mono text-[9px] text-emerald-400 mt-4">
                    <div className="flex justify-between items-center text-[10px] text-white border-b border-slate-800 pb-1.5 font-sans font-bold">
                      <span className="flex items-center gap-1">🛡️ EXPEDIENTE DIGITAL CONSOLIDADO (JSON DE DESPACHO)</span>
                      <span className="text-emerald-400 text-[8.5px] font-mono">ESTADO: COMPILADO Y SELLADO</span>
                    </div>
                    <pre className="overflow-x-auto p-2 bg-slate-950 text-emerald-300 rounded max-h-[160px] leading-relaxed select-all">
                      {JSON.stringify(serverDossier, null, 2)}
                    </pre>
                    <div className="text-[8.5px] text-slate-400 font-sans leading-normal">
                      Este paquete digital consolida el informe de ensayo inyectado ("El Cascarón"), las firmas de conformidad georreferenciadas con sello NOM-151, y la trazabilidad metrológica del sonómetro de patrón con acreditación vigente.
                    </div>
                  </div>
                )}
              </div>

              {/* ACTIONS */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap gap-2 justify-between items-center shrink-0">
                <div className="flex gap-2">
                  {/* Real Live Endpoint 1: Ver Reporte Oficial in New Tab */}
                  <button
                    type="button"
                    onClick={() => {
                      const otId = selectedReportToFeed.payload?.id_ot || "OT-2026-001";
                      window.open(`/api/reportes/generar/${otId}`, "_blank");
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                    title="Inyectar datos de campo en plantilla base HTML"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-300" />
                    <span>Ver Reporte ("Cascarón")</span>
                  </button>

                  {/* Real Live Endpoint 2: Exportar Hoja de Campo CSV */}
                  <button
                    type="button"
                    onClick={() => {
                      const otId = selectedReportToFeed.payload?.id_ot || "OT-2026-001";
                      window.open(`/api/hojas-campo/exportar/${otId}`, "_blank");
                    }}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                    title="Descargar raw data tabular en formato CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-200" />
                    <span>Exportar CSV</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCompiledDossier(null);
                      setSelectedReportToFeed(null);
                      setServerDossier(null);
                    }}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors text-[11px]"
                  >
                    Cerrar
                  </button>

                  {/* Real Live Endpoint 3: Consolidar & Despachar Expediente */}
                  <button
                    onClick={async () => {
                      const otId = selectedReportToFeed.payload?.id_ot || "OT-2026-001";
                      try {
                        const response = await fetch(`/api/expedientes/despacho/${otId}`);
                        if (!response.ok) {
                          alert("Error al consolidar el expediente digital.");
                          return;
                        }
                        const data = await response.json();
                        setServerDossier(data);
                        alert(`¡Expediente consolidado con éxito! Se ha generado e integrado la trazabilidad de instrumentos, firmas criptográficas y el reporte técnico final en un único paquete oficial.`);
                      } catch (err) {
                        console.error(err);
                        alert("Fallo al conectar con el servidor de despacho.");
                      }
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1 text-[11px] shadow-sm font-sans"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Consolidar Expediente</span>
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
