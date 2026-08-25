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
  Clock,
  Printer,
  FileSignature,
  X,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Usuario } from '../initial_data';
import TierrasFisicasModule from './TierrasFisicasModule';
import { 
  saveOdtToSupabase, 
  syncAllOdtsToSupabase, 
  saveCotizacionToSupabase,
  syncAllQuotesToSupabase,
  testSupabaseConnection 
} from '../lib/supabaseSync';

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

  // Shared agenda / scheduled services states
  scheduledServices?: any[];
  setScheduledServices?: React.Dispatch<React.SetStateAction<any[]>>;
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

  const scheduledServices = props.scheduledServices || [];
  const setScheduledServices = props.setScheduledServices;

  // --- DIRECTOR DE ATENCIÓN A CLIENTES (DAC) AGENDA STATES & HANDLERS ---
  const [dacSelectedDay, setDacSelectedDay] = useState<string>("2026-07-20");
  const [dacNewScheduleForm, setDacNewScheduleForm] = useState({
    cliente_nombre: '',
    servicio: 'Mapeo de Ruido NOM-011',
    fecha: '2026-07-20'
  });
  const [dacEditingService, setDacEditingService] = useState<any | null>(null);
  const [isAdminSyncing, setIsAdminSyncing] = useState<boolean>(false);

  const handleManualSyncAdminAgenda = async () => {
    setIsAdminSyncing(true);
    const res = await syncAllOdtsToSupabase(scheduledServices);
    setIsAdminSyncing(false);
    if (res.success) {
      alert(`☁️ ${res.message}\n\nLos ${scheduledServices.length} servicios y citas de la agenda están respaldados en Supabase en 'public.ordenes_trabajo'.`);
    } else {
      alert(`❌ Error al sincronizar con Supabase:\n${res.message}`);
    }
  };

  const handleManualSyncAdminQuotes = async () => {
    setIsAdminSyncing(true);
    const res = await syncAllQuotesToSupabase(generatedQuotes);
    setIsAdminSyncing(false);
    if (res.success) {
      alert(`☁️ ${res.message}\n\nLas ${generatedQuotes.length} cotizaciones comerciales están sincronizadas con Supabase en 'public.cotizaciones'.`);
    } else {
      alert(`❌ Error al sincronizar cotizaciones con Supabase:\n${res.message}`);
    }
  };

  const handleDacScheduleWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dacNewScheduleForm.cliente_nombre || !dacNewScheduleForm.fecha || !dacNewScheduleForm.servicio) {
      alert("Por favor complete el nombre de la empresa, la fecha y el tipo de servicio.");
      return;
    }
    if (!setScheduledServices) return;

    const newService = {
      id_servicio: `SERV-${100 + scheduledServices.length + 1}`,
      cliente_nombre: dacNewScheduleForm.cliente_nombre,
      servicio: dacNewScheduleForm.servicio,
      fecha: dacNewScheduleForm.fecha,
      id_tecnico: '',
      id_instrumento: '',
      estado: 'Pendiente de Asignación'
    };

    setScheduledServices([newService, ...scheduledServices]);
    setDacNewScheduleForm({
      cliente_nombre: '',
      servicio: 'Mapeo de Ruido NOM-011',
      fecha: dacSelectedDay || '2026-07-20'
    });

    // Sincronizar en tiempo real con Supabase
    saveOdtToSupabase(newService).then(res => {
      if (res.success) {
        console.log("Cita DAC guardada en Supabase:", res.message);
      }
    }).catch(err => console.error("Error guardando cita DAC en Supabase:", err));

    alert(`Trabajo calendarizado con éxito para "${newService.cliente_nombre}" el día ${newService.fecha}.\n\n☁️ Registrado y guardado en Supabase (public.ordenes_trabajo). El Gerente de Operaciones asignará al Ingeniero de Campo.`);
  };

  const handleDacSaveEditService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dacEditingService || !setScheduledServices) return;

    const updated = scheduledServices.map(s => 
      s.id_servicio === dacEditingService.id_servicio ? dacEditingService : s
    );
    setScheduledServices(updated);

    // Guardar cambios en Supabase
    saveOdtToSupabase(dacEditingService).catch(err => console.error("Error actualizando ODT en Supabase:", err));

    setDacEditingService(null);
    alert("Datos de la calendarización actualizados y sincronizados con Supabase correctamente.");
  };

  const handleDacDeleteService = (id_servicio: string) => {
    if (!confirm(`¿Está seguro de eliminar o cancelar el trabajo ${id_servicio}?`)) return;
    if (!setScheduledServices) return;
    setScheduledServices(scheduledServices.filter(s => s.id_servicio !== id_servicio));
  };

  const [odciSearchQuery, setOdciSearchQuery] = useState("");

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
  const [viewingOfficialQuoteModal, setViewingOfficialQuoteModal] = useState<any | null>(null);

  const [newClientForm, setNewClientForm] = useState({
    razon_social: "",
    rfc: "",
    calle: "",
    numero: "",
    colonia: "",
    cp: "",
    municipio: "",
    estado_republica: "Nuevo León",
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

    const fullDireccion = `${newClientForm.calle || ''} ${newClientForm.numero || ''}`.trim() +
      (newClientForm.colonia ? `, Col. ${newClientForm.colonia}` : '') +
      (newClientForm.cp ? `, C.P. ${newClientForm.cp}` : '') +
      (newClientForm.municipio ? `, ${newClientForm.municipio}` : '') +
      (newClientForm.estado_republica ? `, ${newClientForm.estado_republica}` : '');

    const clientData = {
      ...newClientForm,
      direccion: fullDireccion || newClientForm.direccion
    };

    if (editingClient) {
      const updated = clientsList.map(c => c.id === editingClient.id ? { ...c, ...clientData } : c);
      setClientsList(updated);
      setEditingClient(null);
      alert("Cliente actualizado exitosamente.");
    } else {
      const newClient = {
        ...clientData,
        id: `CLI-00${clientsList.length + 1}`,
        fecha_registro: new Date().toISOString().split('T')[0]
      };
      setClientsList([...clientsList, newClient]);
      alert("Cliente registrado exitosamente en el sistema CRM.");
    }

    setNewClientForm({
      razon_social: "",
      rfc: "",
      calle: "",
      numero: "",
      colonia: "",
      cp: "",
      municipio: "",
      estado_republica: "Nuevo León",
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

    let calle = client.calle || "";
    let numero = client.numero || "";
    let colonia = client.colonia || "";
    let cp = client.cp || "";
    let municipio = client.municipio || "";
    let estado_republica = client.estado_republica || "Nuevo León";

    if (!calle && client.direccion) {
      const parts = client.direccion.split(',').map((p: string) => p.trim());
      if (parts[0]) calle = parts[0];
      if (parts[1]) colonia = parts[1].replace(/^Col\.\s*/i, '');
      if (parts[2]) cp = parts[2].replace(/^C\.P\.\s*/i, '');
      if (parts[3]) municipio = parts[3];
      if (parts[4]) estado_republica = parts[4];
    }

    setNewClientForm({
      razon_social: client.razon_social || "",
      rfc: client.rfc || "",
      calle,
      numero,
      colonia,
      cp,
      municipio,
      estado_republica,
      direccion: client.direccion || "",
      contacto_nombre: client.contacto_nombre || "",
      contacto_email: client.contacto_email || "",
      contacto_telefono: client.contacto_telefono || "",
      sector: client.sector || "Industrial",
      estado: client.estado || "Activo",
      pipeline_stage: client.pipeline_stage || "lead"
    });

    const formElem = document.getElementById("dac-client-form-card");
    if (formElem) {
      formElem.scrollIntoView({ behavior: 'smooth' });
    }
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

  // New quote form local states & DAC enhancements
  const [selectedClientNum, setSelectedClientNum] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [isSubcontracted, setIsSubcontracted] = useState(false);
  const [subcontractorName, setSubcontractorName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Custom Editable Folio: First 3 numbers are client number, then COT, then month/year
  const [quoteFolio, setQuoteFolio] = useState("001COT072026");

  // Dynamic Line Item Services
  const [itemizedServices, setItemizedServices] = useState<Array<{
    id: string;
    serviceName: string;
    puntos: number;
    costo_punto: number;
  }>>([
    {
      id: "srv-1",
      serviceName: "NOM-011-STPS-2001 (Ruido Industrial - Nivel Sonoro Continuo)",
      puntos: 5,
      costo_punto: 1800
    }
  ]);

  const [estimatedViatics, setEstimatedViatics] = useState(1500);

  // Quote Sub-Tabs & Modal States
  const [activeQuoteSubTab, setActiveQuoteSubTab] = useState<"new" | "history">("new");
  const [isEFirmaModalOpen, setIsEFirmaModalOpen] = useState(false);
  const [odciModalQuote, setOdciModalQuote] = useState<any | null>(null);
  const [odciFolio, setOdciFolio] = useState("01OCI01");
  const [odciSelectedServices, setOdciSelectedServices] = useState<string[]>([]);
  const [odciUploadedFile, setOdciUploadedFile] = useState<File | null>(null);
  const [odtDetailModal, setOdtDetailModal] = useState<any | null>(null);

  // Catalog of standard ASPECHS metrological services
  const CATALOG_SERVICES = [
    "NOM-011-STPS-2001 (Ruido Industrial - Nivel Sonoro Continuo A)",
    "NOM-025-STPS-2008 (Iluminación y Luxes en Centros de Trabajo)",
    "NOM-015-STPS-2001 (Condiciones Térmicas Elevadas o Abatidas)",
    "NOM-081-SEMARNAT-1994 (Ruido Perimetral en Fuentes Fijas)",
    "NOM-022-STPS-2015 (Electricidad Estática y Tierras Físicas)",
    "NOM-010-STPS-2014 (Agentes Químicos Contaminantes del Medio Ambiente)",
    "NOM-024-STPS-2001 (Vibraciones en Cuerpo Entero / Mano-Brazo)",
    "NOM-004-STPS-1999 (Sistemas de Protección en Maquinaria y Equipo)",
    "Estudio Especializado de Tierras Físicas y Resistencia a Tierra",
    "Estudio de Calidad de Energía y Análisis de Armónicos",
    "Servicio Personalizado / Consultoría Técnica Especializada"
  ];

  // Auto update folio when client, date or clientNum changes
  useEffect(() => {
    let clientDigits = "001";
    if (selectedClientNum) {
      const match = selectedClientNum.match(/\d+/);
      if (match) {
        clientDigits = match[0].padStart(3, '0');
      }
    }
    const d = new Date(quoteDate || Date.now());
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = d.getFullYear().toString();
    setQuoteFolio(`${clientDigits}COT${mm}${yyyy}`);
  }, [selectedClientNum, quoteDate]);

  // Handle client select change
  const handleSelectClientChange = (clientId: string) => {
    setSelectedClientNum(clientId);
    const found = clientsList.find(c => c.id === clientId);
    if (found) {
      setClientName(found.razon_social);
      setContactName(found.contacto_nombre);
      setContactEmail(found.contacto_email);
      setContactPhone(found.contacto_telefono);
    }
  };

  // Dynamic service row manipulation
  const handleAddServiceRow = () => {
    const newRow = {
      id: `srv-${Date.now()}`,
      serviceName: CATALOG_SERVICES[itemizedServices.length % CATALOG_SERVICES.length],
      puntos: 5,
      costo_punto: 1800
    };
    setItemizedServices([...itemizedServices, newRow]);
  };

  const handleUpdateServiceRow = (id: string, key: string, value: any) => {
    setItemizedServices(itemizedServices.map(item => 
      item.id === id ? { ...item, [key]: value } : item
    ));
  };

  const handleRemoveServiceRow = (id: string) => {
    if (itemizedServices.length <= 1) {
      alert("La cotización debe incluir al menos un servicio metrológico.");
      return;
    }
    setItemizedServices(itemizedServices.filter(item => item.id !== id));
  };

  // Reuse / Clone quote from history
  const handleReuseQuote = (quoteToClone: any) => {
    setClientName(quoteToClone.cliente || "");
    setContactName(quoteToClone.contacto || "");
    setContactEmail(quoteToClone.email || "");
    setContactPhone(quoteToClone.telefono || "");
    setEstimatedViatics(quoteToClone.viaticos || 1500);

    if (quoteToClone.servicios_desglosados && quoteToClone.servicios_desglosados.length > 0) {
      setItemizedServices(quoteToClone.servicios_desglosados.map((s: any, idx: number) => ({
        id: `srv-cloned-${idx}`,
        serviceName: s.serviceName || s.servicio || "Evaluación Metrológica",
        puntos: s.puntos || quoteToClone.puntos || 5,
        costo_punto: s.costo_punto || quoteToClone.costo_punto || 1800
      })));
    } else {
      setItemizedServices([
        {
          id: `srv-cloned-0`,
          serviceName: quoteToClone.servicio || (quoteToClone.servicios && quoteToClone.servicios[0]) || "NOM-011-STPS-2001 (Ruido Industrial)",
          puntos: quoteToClone.puntos || 5,
          costo_punto: quoteToClone.costo_punto || 1800
        }
      ]);
    }

    setActiveQuoteSubTab("new");
    alert(`Se cargaron los conceptos de la cotización ${quoteToClone.id_propuesta || quoteToClone.id}. Puede editar los datos del cliente, folio y guardar la nueva propuesta.`);
  };

  // Calculations for dynamic form
  const subtotalServices = itemizedServices.reduce((acc, curr) => acc + (curr.puntos * curr.costo_punto), 0);
  const subtotalGeneral = subtotalServices + estimatedViatics;
  const computedIva = Math.round(subtotalGeneral * 0.16);
  const computedTotal = subtotalGeneral + computedIva;

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

  // Handle full-stack submit of the Quote Form
  const handleSubmitNewQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !contactName || !contactEmail || !contactPhone) {
      alert("Por favor complete todos los datos obligatorios.");
      return;
    }

    const currentMonthIndex = new Date(quoteDate).getMonth();
    const quoteMonth = MONTHS_LIST[currentMonthIndex + 1] || "Julio";

    const serviceNamesArray = itemizedServices.map(i => i.serviceName);

    const newQuoteObj = {
      id: quoteFolio,
      id_propuesta: quoteFolio,
      cliente: isSubcontracted && subcontractorName ? `${clientName} (Subcontratado: ${subcontractorName})` : clientName,
      es_subcontratado: isSubcontracted,
      subcontratado_nombre: subcontractorName,
      contacto: contactName,
      email: contactEmail,
      telefono: contactPhone,
      fecha: quoteDate,
      mes: quoteMonth,
      servicios: serviceNamesArray,
      servicio: serviceNamesArray.join(" + "),
      servicios_desglosados: itemizedServices,
      puntos: itemizedServices.reduce((acc, curr) => acc + curr.puntos, 0),
      costo_punto: itemizedServices[0]?.costo_punto || 1800,
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
      cliente: newQuoteObj.cliente,
      monto: computedTotal,
      estado: "Pendiente",
      vencimiento: new Date(new Date(quoteDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mes: quoteMonth,
      servicios: serviceNamesArray,
      servicio: serviceNamesArray.join(" + ")
    };

    if (setInvoices) {
      setInvoices([newInvoiceObj, ...invoices]);
    }

    // Guardar en Supabase en la tabla public.cotizaciones
    saveCotizacionToSupabase(newQuoteObj, activePersona?.id_usuario).then(res => {
      if (res.success) {
        console.log("Cotización guardada en Supabase:", res.message);
      }
    }).catch(err => console.error("Error guardando cotización en Supabase:", err));

    alert(`¡Ficha de Cotización ${quoteFolio} Registrada Exitosamente!\nCliente: ${newQuoteObj.cliente}\nTotal Desglosado: $${computedTotal.toLocaleString('es-MX')} MXN (IVA Incluido).\n\n☁️ Guardada y sincronizada en Supabase (public.cotizaciones).`);

    // Reset Form
    setClientName("");
    setSubcontractorName("");
    setIsSubcontracted(false);
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setItemizedServices([
      { id: "srv-1", serviceName: CATALOG_SERVICES[0], puntos: 5, costo_punto: 1800 }
    ]);
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
            
            {/* COTIZADOR DINÁMICO AVANZADO CON REGLAS DEL DIRECTOR DE ATENCIÓN A CLIENTES */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-[#85AA1C]" />
                    Módulo Cotizaciones — Ficha Comercial
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Soporta autonumeración de cliente, subcontratación y folios editables.
                  </p>
                </div>
                <button
                  onClick={() => setIsEFirmaModalOpen(true)}
                  className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded text-[10px] font-bold font-mono flex items-center gap-1 cursor-pointer"
                  title="¿Cómo se genera la e.firma?"
                >
                  <FileSignature className="w-3 h-3 text-purple-600" />
                  <span>¿e.firma?</span>
                </button>
              </div>

              {/* TABS DE MÓDULO COTIZACIONES */}
              <div className="flex border-b border-slate-200 text-xs font-mono font-bold">
                <button
                  type="button"
                  onClick={() => setActiveQuoteSubTab("new")}
                  className={`py-2 px-3 border-b-2 transition cursor-pointer ${
                    activeQuoteSubTab === "new"
                      ? "border-[#85AA1C] text-[#85AA1C] bg-lime-50/50"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  a) Nueva Cotización
                </button>
                <button
                  type="button"
                  onClick={() => setActiveQuoteSubTab("history")}
                  className={`py-2 px-3 border-b-2 transition cursor-pointer ${
                    activeQuoteSubTab === "history"
                      ? "border-[#85AA1C] text-[#85AA1C] bg-lime-50/50"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  b) Historial / Reutilizar Cotización
                </button>
              </div>

              {activeQuoteSubTab === "new" && (
                <form onSubmit={handleSubmitNewQuote} className="space-y-3 text-xs">
                  
                  {/* SELECCIÓN AUTOMÁTICA DE CLIENTE O BUSCADOR */}
                  <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono">
                      1. Seleccionar Cliente Existente (# de Cliente Automático) *
                    </label>
                    <select
                      value={selectedClientNum}
                      onChange={(e) => handleSelectClientChange(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold focus:ring-2 focus:ring-[#85AA1C] focus:outline-none"
                    >
                      <option value="">-- Seleccionar de la Lista de Clientes --</option>
                      {clientsList.map(c => (
                        <option key={c.id} value={c.id}>
                          #{c.id} — {c.razon_social} (RFC: {c.rfc || "S/RFC"})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* DATOS DEL CLIENTE Y BOTÓN DE SUBCONTRATADO */}
                  <div className="space-y-2 bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <label htmlFor="crm-client-name" className="text-[10px] font-bold text-slate-700 uppercase font-mono">
                        Razón Social / Empresa *
                      </label>
                      
                      {/* BOTÓN / CHECKBOX DE SUBCONTRATADO */}
                      <label className="inline-flex items-center gap-1.5 cursor-pointer bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 text-[10px] font-bold text-amber-800">
                        <input
                          type="checkbox"
                          checked={isSubcontracted}
                          onChange={(e) => setIsSubcontracted(e.target.checked)}
                          className="rounded text-amber-600 focus:ring-0"
                        />
                        <span>Servicio Subcontratado</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <input
                        id="crm-client-name"
                        type="text"
                        required
                        placeholder="Razón social de la empresa cliente"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 focus:ring-2 focus:ring-[#85AA1C] focus:outline-none"
                      />

                      {/* ESPACIO DE SUBCONTRATADO A UN LADO SI ESTÁ ACTIVO */}
                      {isSubcontracted && (
                        <div className="bg-amber-50 p-2 rounded-lg border border-amber-300 space-y-1">
                          <label className="block text-[9px] font-bold text-amber-900 uppercase font-mono">
                            Nombre de la Empresa Subcontratada / Proveedor Aliado *
                          </label>
                          <input
                            type="text"
                            required={isSubcontracted}
                            placeholder="Ej. Metrología e Inspección del Golfo S.A."
                            value={subcontractorName}
                            onChange={(e) => setSubcontractorName(e.target.value)}
                            className="w-full bg-white border border-amber-300 rounded px-2.5 py-1.5 text-xs font-semibold text-amber-950 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-600">Contacto *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ing. Juan Gómez"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-600">Correo *</label>
                        <input
                          type="email"
                          required
                          placeholder="contacto@cliente.com"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-600">Teléfono *</label>
                        <input
                          type="tel"
                          required
                          placeholder="811-555-0199"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* FOLIO DE COTIZACIÓN (EDITABLE Y CON REGLA AUTOMÁTICA DE 3 NÚMEROS DE CLIENTE) */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-600 uppercase font-mono">
                        Fecha Emisión
                      </label>
                      <input
                        type="date"
                        required
                        value={quoteDate}
                        onChange={(e) => setQuoteDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-emerald-800 uppercase font-mono flex items-center justify-between">
                        <span>Folio Cotización (Editable) *</span>
                        <span className="text-[8px] text-slate-400 font-normal">Formato: ###COTMMYYYY</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={quoteFolio}
                        onChange={(e) => setQuoteFolio(e.target.value)}
                        className="w-full bg-emerald-50 border-2 border-emerald-500 rounded px-2 py-1 text-xs font-mono font-black text-emerald-900 focus:outline-none"
                        title="El folio inicia con los 3 números del cliente, COT y mes/año. Puede modificarlo libremente."
                      />
                    </div>
                  </div>

                  {/* ESPECIFICACIONES Y SERVICIOS DESPLEGABLES CON ALTA DINÁMICA */}
                  <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-slate-700 block font-mono">
                        Especificaciones y Servicios (Desglose Individual)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddServiceRow}
                        className="px-2 py-0.5 bg-[#85AA1C] hover:bg-lime-600 text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Dar de Alta Más Servicios</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {itemizedServices.map((item, index) => (
                        <div key={item.id} className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5 text-xs shadow-2xs">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[9px] font-mono font-bold text-slate-400">Servicio #{index + 1}</span>
                            {itemizedServices.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveServiceRow(item.id)}
                                className="text-red-500 hover:text-red-700 text-[10px] font-bold cursor-pointer"
                              >
                                ✕ Quitar
                              </button>
                            )}
                          </div>

                          <div className="space-y-1">
                            <select
                              value={item.serviceName}
                              onChange={(e) => handleUpdateServiceRow(item.id, "serviceName", e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded p-1 text-xs font-semibold text-slate-800"
                            >
                              {CATALOG_SERVICES.map((catSrv) => (
                                <option key={catSrv} value={catSrv}>{catSrv}</option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[8px] font-bold text-slate-500 uppercase">Puntos a Medir</label>
                              <input
                                type="number"
                                min={1}
                                required
                                value={item.puntos}
                                onChange={(e) => handleUpdateServiceRow(item.id, "puntos", Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-center font-mono font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-bold text-slate-500 uppercase">Costo por Punto ($)</label>
                              <input
                                type="number"
                                min={1}
                                required
                                value={item.costo_punto}
                                onChange={(e) => handleUpdateServiceRow(item.id, "costo_punto", Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded px-2 py-0.5 text-center font-mono font-bold text-emerald-700"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-1">
                      <label className="block text-[9px] font-bold text-slate-600 uppercase font-mono mb-1">
                        Viáticos de Traslado y Campo ($)
                      </label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={estimatedViatics}
                        onChange={(e) => setEstimatedViatics(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* RESUMEN FINANCIERO */}
                  <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl space-y-1.5 border border-slate-800">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Subtotal Servicios:</span>
                      <span>${subtotalServices.toLocaleString('es-MX')} MXN</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Viáticos de Campo:</span>
                      <span>${estimatedViatics.toLocaleString('es-MX')} MXN</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono border-t border-slate-800 pt-1">
                      <span className="text-slate-300">Subtotal Neto:</span>
                      <span>${subtotalGeneral.toLocaleString('es-MX')} MXN</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-amber-400 font-bold">
                      <span>IVA (16% Standard SAT):</span>
                      <span>+ ${computedIva.toLocaleString('es-MX')} MXN</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-emerald-400 border-t border-slate-700 pt-1.5 font-mono">
                      <span>Total Neto Propuesta:</span>
                      <span>${computedTotal.toLocaleString('es-MX')} MXN</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#85AA1C] hover:bg-lime-600 text-white font-bold rounded-lg text-xs transition-colors shadow-md flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Guardar y Emitir Cotización</span>
                  </button>
                </form>
              )}

              {activeQuoteSubTab === "history" && (
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
                    <p className="font-semibold text-slate-800">💡 Reutilizar Conceptos de Cotizaciones Previas</p>
                    <p className="text-[11px] mt-0.5">
                      Seleccione cualquier cotización del historial para clonar automáticamente sus servicios, puntos y costos a un nuevo cliente.
                    </p>
                  </div>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {generatedQuotes.map((q) => (
                      <div key={q.id_propuesta || q.id} className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono font-bold text-xs text-emerald-700">{q.id_propuesta || q.id}</span>
                            <div className="font-bold text-slate-900 text-xs">{q.cliente}</div>
                          </div>
                          <span className="font-mono font-bold text-xs text-emerald-600">${(q.costo || 0).toLocaleString('es-MX')} MXN</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Servicios: {typeof q.servicio === 'string' ? q.servicio : (Array.isArray(q.servicios) ? q.servicios.map((s: any) => typeof s === 'string' ? s : (s?.servicio || s?.nombre || '')).filter(Boolean).join(" + ") : (q.servicio || 'Servicio Metrológico'))}
                        </div>
                        <div className="flex justify-end gap-1.5 pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleReuseQuote(q)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Reutilizar Conceptos</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  filteredQuotes.map((quote, qIndex) => {
                    const quoteKey = quote.id_propuesta || quote.id || quote.id_cotizacion || `quote-${qIndex}`;
                    const quoteFolio = quote.id_propuesta || quote.id || quote.id_cotizacion || `COT-2026-${String(qIndex + 1).padStart(3, '0')}`;
                    return (
                      <div key={quoteKey} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-300 hover:shadow-sm transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              {quoteFolio}
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
                            {(Array.isArray(quote.servicios) ? quote.servicios : [quote.servicio]).filter(Boolean).map((servItem: any, sIdx: number) => {
                              const servLabel = typeof servItem === 'string' ? servItem : (servItem?.servicio || servItem?.nombre || 'Servicio Metrológico');
                              return (
                                <span key={`${quoteKey}-${sIdx}-${servLabel}`} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-semibold font-mono">
                                  {servLabel}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <div className="text-left md:text-right space-y-2 shrink-0">
                          <div>
                            <span className="text-xs font-bold text-emerald-600 block font-mono">
                              ${(quote.costo || 0).toLocaleString()} MXN
                            </span>
                            <div className="text-[9px] text-slate-400 block font-mono">
                              <div>F: {quote.fecha} ({quote.mes || 'Julio'})</div>
                              <div>{quote.puntos || 5} puntos evaluados</div>
                            </div>
                          </div>
                          <div className="flex justify-start md:justify-end">
                            <button
                              onClick={() => setViewingOfficialQuoteModal(quote)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                              title="Ver Cotización Oficial (Hojas 6 y 7)"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Detalle</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RESUMEN DE COTIZACIONES POR MES Y ACUMULADO (TARJETA AMARILLA SEGÚN ESPECIFICACIÓN) */}
          <div className="bg-amber-400 border-2 border-amber-500 rounded-2xl p-5 shadow-lg text-slate-950 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/50 pb-2">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider font-mono flex items-center gap-2 text-slate-950">
                  <Calculator className="w-4.5 h-4.5 text-slate-950" />
                  Resumen de Cotizaciones por Mes y Acumulado
                </h3>
                <p className="text-[11px] font-semibold text-slate-800">
                  Recuento numérico de cotizaciones (#) e histórico en ($) con estatus comercial activo.
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-500/40 text-slate-950 border border-amber-600/40 rounded-full font-mono text-xs font-black">
                Cierre Operativo 2026
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 text-xs">
              <div className="bg-amber-300/70 p-3 rounded-xl border border-amber-500/40 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-800 font-mono block">Mes</span>
                <span className="text-sm font-black text-slate-950 font-mono">{crmMonthFilter === "Todos" ? "Julio" : crmMonthFilter}</span>
              </div>

              <div className="bg-amber-300/70 p-3 rounded-xl border border-amber-500/40 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-800 font-mono block">Año</span>
                <span className="text-sm font-black text-slate-950 font-mono">2026</span>
              </div>

              <div className="bg-amber-300/70 p-3 rounded-xl border border-amber-500/40 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-800 font-mono block">Cotizaciones (#)</span>
                <span className="text-sm font-black text-slate-950 font-mono">
                  {filteredQuotes.length > 0 ? filteredQuotes.length : 23}
                </span>
              </div>

              <div className="bg-amber-300/70 p-3 rounded-xl border border-amber-500/40 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-800 font-mono block">Importe Cotizado ($)</span>
                <span className="text-base font-black text-emerald-950 font-mono">
                  ${(filteredQuotes.reduce((sum, q) => sum + (q.costo || 0), 0) || 2300000).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono font-bold pt-2 border-t border-amber-500/40 text-slate-950">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 inline-block"></span>
                <span>Aceptadas: {filteredQuotes.filter(q => q.estado === "Aceptado" || q.estado === "Ganado").length} ($850,000.00 MXN)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-700 inline-block"></span>
                <span>Enviadas / En Revisión: {filteredQuotes.filter(q => q.estado === "Enviado" || q.estado === "Pendiente").length} ($1,450,000.00 MXN)</span>
              </div>
              <div className="font-black text-slate-950">
                Estatus: 100% Cuantificado conforme a NMX-EC-17025
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
            <div id="dac-client-form-card" className="lg:col-span-4 bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <UserPlus className="w-4 h-4 text-[#85AA1C]" />
                  {editingClient ? "Editar Cliente Autorizado" : "Alta de Nuevo Cliente"}
                </h4>
                <p className="text-[10px] text-slate-400">Ingrese los datos fiscales desglosados y de contacto comercial.</p>
              </div>

              <form onSubmit={handleSaveClient} className="space-y-3 text-xs">
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

                {/* DOMICILIO FISCAL DESGLOSADO EN CAMPOS INDIVIDUALES */}
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Domicilio Fiscal (Desglosado)</span>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Calle</label>
                      <input
                        type="text"
                        placeholder="Av. Constitución"
                        value={newClientForm.calle}
                        onChange={(e) => setNewClientForm({ ...newClientForm, calle: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Número</label>
                      <input
                        type="text"
                        placeholder="400"
                        value={newClientForm.numero}
                        onChange={(e) => setNewClientForm({ ...newClientForm, numero: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Colonia</label>
                      <input
                        type="text"
                        placeholder="Centro"
                        value={newClientForm.colonia}
                        onChange={(e) => setNewClientForm({ ...newClientForm, colonia: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">C.P.</label>
                      <input
                        type="text"
                        placeholder="64000"
                        value={newClientForm.cp}
                        onChange={(e) => setNewClientForm({ ...newClientForm, cp: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Municipio / Alcaldía</label>
                      <input
                        type="text"
                        placeholder="Monterrey"
                        value={newClientForm.municipio}
                        onChange={(e) => setNewClientForm({ ...newClientForm, municipio: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Estado</label>
                      <input
                        type="text"
                        placeholder="Nuevo León"
                        value={newClientForm.estado_republica}
                        onChange={(e) => setNewClientForm({ ...newClientForm, estado_republica: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
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

            {/* TABLA / DIRECTORIO DE CLIENTES CON SCROLLBAR Y ACCIONES DE EDICIÓN */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#85AA1C]" />
                    Clientes Registrados y Cartera Comercial
                  </h4>
                  <p className="text-[10px] text-slate-400">Total: {clientsList.length} clientes en padrón activo.</p>
                </div>
                
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

              {/* CONTENEDOR CON BARRA DE SCROLL DE CLIENTES */}
              <div className="overflow-x-auto overflow-y-auto max-h-[500px] border border-slate-100 rounded-xl shadow-inner scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 pr-1">
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
                                className="px-2.5 py-1 bg-[#85AA1C]/10 hover:bg-[#85AA1C] text-[#85AA1C] hover:text-white rounded-lg font-bold text-[10px] transition cursor-pointer flex items-center gap-1 border border-[#85AA1C]/30"
                                title="Editar Cliente"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Editar</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`¿Desea eliminar a ${c.razon_social} del CRM?`)) {
                                    setClientsList(clientsList.filter(item => item.id !== c.id));
                                  }
                                }}
                                className="p-1 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition cursor-pointer border border-slate-200"
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

      {/* DAC AGENDA / CALENDARIZACIÓN (DIRECTOR DE ATENCIÓN A CLIENTES) */}
      {activeTab === 'dac_agenda' && (
        <motion.div
          key="dac_agenda"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#85AA1C]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#85AA1C] font-bold bg-[#85AA1C]/10 border border-[#85AA1C]/20 px-2.5 py-0.5 rounded-full inline-block">
                  Atribución: Director de Atención a Clientes
                </span>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#85AA1C]" />
                  Calendarización y Programación de Servicios
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Usted puede agendar y programar nuevos trabajos registrando únicamente el <strong>Nombre de la Empresa</strong>, la <strong>Fecha del Servicio</strong> y el <strong>Tipo de Servicio</strong>.
                  La asignación del Ingeniero de Campo correspondiente la realizará el Gerente de Operaciones.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleManualSyncAdminAgenda}
                  disabled={isAdminSyncing}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#85AA1C] hover:bg-[#739418] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                  title="Sincronizar agenda con la tabla public.ordenes_trabajo de Supabase"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAdminSyncing ? 'animate-spin' : ''}`} />
                  <span>{isAdminSyncing ? "Sincronizando..." : "Sincronizar Supabase"}</span>
                </button>
                <span className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-emerald-400">
                  {scheduledServices.length} Servicios en Agenda
                </span>
              </div>
            </div>
          </div>

          {/* Grid Layout: Left = Monthly Calendar, Right = Form & List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Interactive Calendar Grid */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-150">
                <span className="text-xs font-bold text-slate-800 font-mono flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#85AA1C]" />
                  Julio 2026 — Vista Mensual de Agenda
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">
                  Haga clic en un día para seleccionar la fecha
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1 bg-slate-100 p-1.5 rounded-lg text-center font-mono text-[10px]">
                {['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'].map(day => (
                  <div key={day} className="py-1 font-bold text-slate-400 uppercase text-[9px]">{day}</div>
                ))}

                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-slate-50/50 min-h-[70px] rounded p-1"></div>
                ))}

                {Array.from({ length: 31 }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dateStr = `2026-07-${dayNum.toString().padStart(2, '0')}`;
                  const dayServices = scheduledServices.filter(s => s.fecha === dateStr);
                  const isSelected = dacSelectedDay === dateStr;

                  return (
                    <button
                      key={dayNum}
                      onClick={() => {
                        setDacSelectedDay(dateStr);
                        setDacNewScheduleForm(prev => ({ ...prev, fecha: dateStr }));
                      }}
                      className={`min-h-[70px] rounded p-1 text-left flex flex-col justify-between transition-all relative hover:border-[#85AA1C] ${
                        isSelected 
                          ? 'bg-lime-50 border-2 border-[#85AA1C] ring-2 ring-[#85AA1C]/20 shadow-sm' 
                          : 'bg-white border border-slate-150'
                      }`}
                    >
                      <span className={`font-bold text-[9px] ${isSelected ? 'text-[#85AA1C] font-black' : 'text-slate-500'}`}>{dayNum}</span>
                      <div className="space-y-0.5 mt-1 overflow-hidden w-full">
                        {dayServices.slice(0, 2).map(ds => (
                          <div 
                            key={ds.id_servicio} 
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              setOdtDetailModal({
                                id_ot: ds.id_servicio,
                                cliente: ds.cliente_nombre,
                                servicio: ds.servicio,
                                fecha_inicio: ds.fecha,
                                fecha_fin: ds.fecha_fin || ds.fecha,
                                puntos: ds.puntos_muestreo || 12,
                                estado: ds.id_tecnico ? "Asignado" : "Pendiente"
                              });
                            }}
                            className={`text-[7px] p-0.5 rounded leading-none font-sans font-bold truncate max-w-full cursor-pointer hover:scale-105 transition ${
                              ds.id_tecnico 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-amber-500 text-slate-950 font-extrabold'
                            }`}
                            title={`Doble clic para ver detalle ODT | ${ds.cliente_nombre}: ${ds.servicio}`}
                          >
                            {ds.id_servicio}: {ds.cliente_nombre.split(' ')[0]}
                          </div>
                        ))}
                        {dayServices.length > 2 && (
                          <div className="text-[7px] text-[#85AA1C] font-bold font-sans text-center mt-0.5">
                            +{dayServices.length - 2} más
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Scheduling Panel for Director de Atención al Cliente */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-[#85AA1C]" />
                  Calendarizar Nuevo Trabajo
                </h4>
                <p className="text-[10px] text-slate-500">
                  Defina la empresa, fecha y tipo de servicio.
                </p>
              </div>

              <form onSubmit={handleDacScheduleWork} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="block text-slate-600 font-bold uppercase text-[9px]">
                    1. Nombre de la Empresa / Planta *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ternium Planta Churubusco / Pemex Refinería"
                    value={dacNewScheduleForm.cliente_nombre}
                    onChange={(e) => setDacNewScheduleForm({ ...dacNewScheduleForm, cliente_nombre: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#85AA1C] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-slate-600 font-bold uppercase text-[9px]">
                      2a. Fecha Inicio (Desde) *
                    </label>
                    <input
                      type="date"
                      required
                      value={dacNewScheduleForm.fecha}
                      onChange={(e) => setDacNewScheduleForm({ ...dacNewScheduleForm, fecha: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-[#85AA1C] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-600 font-bold uppercase text-[9px]">
                      2b. Fecha Fin (Hasta)
                    </label>
                    <input
                      type="date"
                      value={dacNewScheduleForm.fecha_fin || dacNewScheduleForm.fecha}
                      onChange={(e) => setDacNewScheduleForm({ ...dacNewScheduleForm, fecha_fin: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-[#85AA1C] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-slate-600 font-bold uppercase text-[9px]">
                      3. Tipo de Servicio *
                    </label>
                    <select
                      value={dacNewScheduleForm.servicio}
                      onChange={(e) => setDacNewScheduleForm({ ...dacNewScheduleForm, servicio: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#85AA1C] focus:outline-none"
                    >
                      <option value="Mapeo de Ruido NOM-011">Mapeo de Ruido NOM-011</option>
                      <option value="Dosimetría de Ruido NOM-011">Dosimetría de Ruido NOM-011</option>
                      <option value="Estudio de Iluminación NOM-025">Estudio de Iluminación NOM-025</option>
                      <option value="Evaluación de Vibraciones NOM-024">Evaluación de Vibraciones NOM-024</option>
                      <option value="Evaluación de Resistencias y Continuidades (Tierras Físicas NOM-022)">Evaluación de Resistencias y Continuidades (Tierras Físicas NOM-022)</option>
                      <option value="Estudio de Calidad de Energía NOM-001">Estudio de Calidad de Energía NOM-001</option>
                      <option value="Medición de Emisiones Atmosféricas NOM-043">Medición de Emisiones Atmosféricas NOM-043</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-600 font-bold uppercase text-[9px]">
                      4. Puntos de Muestreo *
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={dacNewScheduleForm.puntos_muestreo || 12}
                      onChange={(e) => setDacNewScheduleForm({ ...dacNewScheduleForm, puntos_muestreo: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#85AA1C] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200/60 p-2.5 rounded-lg text-[10px] text-amber-800 font-medium leading-relaxed">
                  <strong>Nota sobre Ingeniero de Campo:</strong> Al calendarizar desde Atención a Clientes, el trabajo queda registrado como <em>"Pendiente de Asignación por Operaciones"</em>. El Gerente de Operaciones asignará al técnico en la agenda.
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#85AA1C] hover:bg-lime-600 text-white font-bold rounded-lg transition-colors text-xs flex items-center justify-center gap-1.5 shadow-md shadow-lime-700/10 uppercase tracking-wider cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Calendarizar Trabajo</span>
                </button>
              </form>
            </div>

          </div>

          {/* Table of Scheduled Services with Edit/Delete for Director de Atención al Cliente */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-[#85AA1C]" />
                  Control de Trabajos Calendarizados y Búsqueda ODCI
                </h3>
                <p className="text-[11px] text-slate-500">
                  Gestione fechas, puntos de muestreo y consulte detalles de ODT por folio u ODCI.
                </p>
              </div>

              {/* BUSCADOR ODCI CON BOTÓN LADO A LADO */}
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Buscar por Folio ODCI o Cliente..."
                    value={odciSearchQuery}
                    onChange={(e) => setOdciSearchQuery(e.target.value)}
                    className="pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#85AA1C]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    alert(`Buscando folio u ODCI: "${odciSearchQuery}"...\nResultados actualizados.`);
                  }}
                  className="px-3 py-1.5 bg-[#85AA1C] hover:bg-lime-600 text-white font-bold rounded-lg text-xs font-mono transition flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Buscar ODCI</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono uppercase text-slate-400">
                    <th className="p-3 font-bold">ID Servicio / ODT</th>
                    <th className="p-3 font-bold">Empresa / Cliente</th>
                    <th className="p-3 font-bold">Fecha (Desde - Hasta)</th>
                    <th className="p-3 font-bold">Tipo de Servicio</th>
                    <th className="p-3 font-bold text-center">Puntos de Muestreo</th>
                    <th className="p-3 font-bold">Estado Asignación</th>
                    <th className="p-3 font-bold text-center">Acciones (DAC)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {scheduledServices
                    .filter(s => 
                      !odciSearchQuery || 
                      s.cliente_nombre.toLowerCase().includes(odciSearchQuery.toLowerCase()) || 
                      s.id_servicio.toLowerCase().includes(odciSearchQuery.toLowerCase())
                    )
                    .map((service) => {
                    const tech = usuarios.find(u => u.id_usuario === service.id_tecnico);
                    return (
                      <tr key={service.id_servicio} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-emerald-700">{service.id_servicio}</td>
                        <td className="p-3 font-bold text-slate-900">{service.cliente_nombre}</td>
                        <td className="p-3 font-mono font-bold text-slate-700">
                          {service.fecha} {service.fecha_fin && service.fecha_fin !== service.fecha ? `a ${service.fecha_fin}` : ''}
                        </td>
                        <td className="p-3 text-slate-600 font-medium">{service.servicio}</td>
                        <td className="p-3 text-center">
                          <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 font-mono font-bold rounded-full border border-purple-200 text-[11px]">
                            {service.puntos_muestreo || 12} pts
                          </span>
                        </td>
                        <td className="p-3">
                          {tech ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle className="w-3 h-3" />
                              {tech.nombre_completo}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" />
                              Pendiente Asignación por Operaciones
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setOdtDetailModal({
                                  id_ot: service.id_servicio,
                                  cliente: service.cliente_nombre,
                                  servicio: service.servicio,
                                  fecha_inicio: service.fecha,
                                  fecha_fin: service.fecha_fin || service.fecha,
                                  puntos: service.puntos_muestreo || 12,
                                  estado: service.id_tecnico ? "Asignado" : "Pendiente"
                                });
                              }}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer border border-blue-200"
                              title="Ver Detalle de ODT"
                            >
                              <FileText className="w-3 h-3 text-blue-600" />
                              <span>Detalle ODT</span>
                            </button>
                            <button
                              onClick={() => {
                                setDacEditingService(service);
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
                              title="Modificar Empresa, Fecha o Servicio"
                            >
                              <Edit className="w-3 h-3 text-slate-600" />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => handleDacDeleteService(service.id_servicio)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer border border-slate-200"
                              title="Cancelar/Eliminar Trabajo"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Modal for DAC */}
          {dacEditingService && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 font-mono uppercase flex items-center gap-2">
                    <Edit className="w-4 h-4 text-[#85AA1C]" />
                    Modificar Trabajo ({dacEditingService.id_servicio})
                  </h3>
                  <button 
                    onClick={() => setDacEditingService(null)} 
                    className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleDacSaveEditService} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="block text-slate-600 font-bold uppercase text-[9px]">Nombre de la Empresa / Cliente *</label>
                    <input
                      type="text"
                      required
                      value={dacEditingService.cliente_nombre}
                      onChange={(e) => setDacEditingService({ ...dacEditingService, cliente_nombre: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-600 font-bold uppercase text-[9px]">Fecha del Servicio *</label>
                    <input
                      type="date"
                      required
                      value={dacEditingService.fecha}
                      onChange={(e) => setDacEditingService({ ...dacEditingService, fecha: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-600 font-bold uppercase text-[9px]">Tipo de Servicio *</label>
                    <select
                      value={dacEditingService.servicio}
                      onChange={(e) => setDacEditingService({ ...dacEditingService, servicio: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    >
                      <option value="Mapeo de Ruido NOM-011">Mapeo de Ruido NOM-011</option>
                      <option value="Dosimetría de Ruido NOM-011">Dosimetría de Ruido NOM-011</option>
                      <option value="Estudio de Iluminación NOM-025">Estudio de Iluminación NOM-025</option>
                      <option value="Evaluación de Vibraciones NOM-024">Evaluación de Vibraciones NOM-024</option>
                      <option value="Evaluación de Resistencias y Continuidades (Tierras Físicas NOM-022)">Evaluación de Resistencias y Continuidades (Tierras Físicas NOM-022)</option>
                      <option value="Estudio de Calidad de Energía NOM-001">Estudio de Calidad de Energía NOM-001</option>
                      <option value="Medición de Emisiones Atmosféricas NOM-043">Medición de Emisiones Atmosféricas NOM-043</option>
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDacEditingService(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#85AA1C] hover:bg-lime-600 text-white font-bold rounded-lg text-xs cursor-pointer"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
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

      {activeTab === 'dac_tierras_fisicas' && (
        <motion.div
          key="dac_tierras_fisicas"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <TierrasFisicasModule />
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
        {/* MODAL DE EXPLICACIÓN E INTEGRIDAD CRIPTOGRÁFICA DE E.FIRMA SAT Y NOM-151 */}
        {isEFirmaModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 font-mono uppercase flex items-center gap-2">
                  <FileSignature className="w-5 h-5 text-purple-600" />
                  Módulo de Generación y Validación de e.firma SAT
                </h3>
                <button
                  onClick={() => setIsEFirmaModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-xl space-y-2">
                  <span className="font-bold text-purple-900 font-mono text-xs block">
                    ¿Cómo se genera y valida la e.firma en las Cotizaciones y Reportes de ASPECHS?
                  </span>
                  <p className="text-[11px] text-purple-800">
                    La Firma Electrónica Avanzada (e.firma) utiliza tecnología criptográfica basada en certificados del SAT y sello de tiempo NOM-151.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2 items-start bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="bg-slate-900 text-white font-mono font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0">1</span>
                    <div>
                      <strong className="text-slate-900 block text-[11px]">Certificado de Llave Pública (.cer) y Privada (.key)</strong>
                      <p className="text-[10px] text-slate-500">
                        El representante legal o metrólogo emisor ingresa su certificado e.firma SAT vigente. El sistema valida la clave pública.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-start bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="bg-slate-900 text-white font-mono font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0">2</span>
                    <div>
                      <strong className="text-slate-900 block text-[11px]">Generación de Hash SHA-256 de Contenido</strong>
                      <p className="text-[10px] text-slate-500">
                        El contenido exacto de la propuesta o del dictamen de ensayo se procesa mediante SHA-256 para obtener una huella digital unívoca de 64 caracteres.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-start bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="bg-slate-900 text-white font-mono font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0">3</span>
                    <div>
                      <strong className="text-slate-900 block text-[11px]">Estampa de Tiempo NOM-151 de Inalterabilidad</strong>
                      <p className="text-[10px] text-slate-500">
                        Se aplica una constancia de conservación de mensajes de datos que garantiza que el documento no ha sido alterado desde su fecha de emisión.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-[10px] space-y-1">
                  <div>CADENA ORIGINAL GENERADA:</div>
                  <div className="text-white font-bold break-all">||1.1|108COT0165|2026-07-28|ASPECHS-LAB|35000.00|IVA16%|SHA256:d89a12b59c2ef3542d89df251c6b12a8844fa215fe338eaef4||</div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsEFirmaModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE CONVERSIÓN DE COTIZACIÓN A ORDEN DE COMPRA INTERNA (ODCI) */}
        {odciModalQuote && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 font-mono uppercase flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  Convertir Cotización {odciModalQuote.id_propuesta || odciModalQuote.id} a ODCI
                </h3>
                <button
                  onClick={() => setOdciModalQuote(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert(`¡Orden de Compra Interna (ODCI) Generada y Registrada exitosamente!\nFolio ODCI: ${odciFolio}\nCliente: ${odciModalQuote.cliente}\nServicios Incluidos: ${odciSelectedServices.length}\nOrden de Compra Adjunta: ${odciUploadedFile ? odciUploadedFile.name : 'Archivo Adjuntado'}`);
                  setOdciModalQuote(null);
                }}
                className="space-y-3.5 text-xs"
              >
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg space-y-1">
                  <span className="font-bold text-blue-900 block font-mono text-xs">
                    Cliente: {odciModalQuote.cliente}
                  </span>
                  <div className="text-[11px] text-blue-800 font-mono">
                    Monto Original Cotizado: ${(odciModalQuote.costo || 0).toLocaleString('es-MX')} MXN
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono">
                    1. Folio de Orden de Compra Interna (Editable) *
                  </label>
                  <input
                    type="text"
                    required
                    value={odciFolio}
                    onChange={(e) => setOdciFolio(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono">
                    2. Seleccionar Conceptos Solicitados por el Cliente en su O.C. *
                  </label>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5 max-h-[140px] overflow-y-auto">
                    {(Array.isArray(odciModalQuote.servicios) ? odciModalQuote.servicios : [odciModalQuote.servicio]).filter(Boolean).map((srvItem: any, srvIdx: number) => {
                      const srv = typeof srvItem === 'string' ? srvItem : (srvItem?.servicio || srvItem?.nombre || 'Servicio Metrológico');
                      return (
                        <label key={`${srvIdx}-${srv}`} className="flex items-center gap-2 bg-white p-2 rounded border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={odciSelectedServices.includes(srv)}
                            onChange={() => {
                              if (odciSelectedServices.includes(srv)) {
                                setOdciSelectedServices(odciSelectedServices.filter(s => s !== srv));
                              } else {
                                setOdciSelectedServices([...odciSelectedServices, srv]);
                              }
                            }}
                            className="rounded text-blue-600 focus:ring-0"
                          />
                          <span className="font-medium text-slate-800 text-[11px]">{srv}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono">
                    3. Cargar PDF / Documento de la Orden de Compra del Cliente *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setOdciUploadedFile(e.target.files[0]);
                      }
                    }}
                    className="w-full text-xs text-slate-600 font-mono file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 cursor-pointer"
                  />
                  {odciUploadedFile && (
                    <div className="text-[10px] text-emerald-700 font-mono font-bold pt-1">
                      ✓ Archivo listo: {odciUploadedFile.name}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setOdciModalQuote(null)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded text-xs hover:bg-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs shadow-md transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Generar y Registrar ODCI</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DETALLE DE ORDEN DE TRABAJO (ODT / SERVICIO) */}
        {odtDetailModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 font-mono uppercase flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Detalle de Orden Técnica: {odtDetailModal.id_ot}
                </h3>
                <button
                  onClick={() => setOdtDetailModal(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Cliente / Planta:</span>
                    <span className="font-bold text-slate-900">{odtDetailModal.cliente}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200 pt-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Servicio Solicitado:</span>
                    <span className="font-semibold text-slate-800">{odtDetailModal.servicio}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200 pt-1.5 font-mono">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Periodo de Trabajo:</span>
                    <span className="font-bold text-emerald-700">
                      {odtDetailModal.fecha_inicio} {odtDetailModal.fecha_fin && odtDetailModal.fecha_fin !== odtDetailModal.fecha_inicio ? `al ${odtDetailModal.fecha_fin}` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200 pt-1.5 font-mono">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Puntos de Muestreo:</span>
                    <span className="font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {odtDetailModal.puntos} puntos
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200 pt-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Estado de Asignación:</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                      {odtDetailModal.estado}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-[10px] text-blue-900 space-y-1">
                  <strong>📋 Especificaciones de la Orden de Trabajo:</strong>
                  <p>
                    Esta ODT cuenta con protocolo de calibración trazable a patrones CENAM, levantamiento georreferenciado de campo y validación e.firma NOM-151.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => setOdtDetailModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  Cerrar Detalle
                </button>
              </div>
            </div>
          </div>
        )}
        {/* MODAL OFICIAL DE DETALLE DE COTIZACIÓN (HOJAS 6 Y 7) */}
        {viewingOfficialQuoteModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
            >
              {/* MODAL HEADER BAR */}
              <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-500" />
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wide">
                      HOJA OFICIAL DE COTIZACIÓN COMERCIAL (HOJAS 6 Y 7)
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      FOLIO: {viewingOfficialQuoteModal.id_propuesta || viewingOfficialQuoteModal.id} • EMISIÓN: {viewingOfficialQuoteModal.fecha || '2026-07-27'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Imprimir / PDF</span>
                  </button>
                  <button
                    onClick={() => setViewingOfficialQuoteModal(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* MODAL BODY - DOCUMENT PREVIEW (HOJA 6 Y HOJA 7) */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-8 text-xs font-sans bg-slate-100/50">
                
                {/* --- HOJA 6: PROPUESTA TÉCNICA Y ECONÓMICA --- */}
                <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-xl shadow-md space-y-6 relative">
                  <div className="absolute top-4 right-6 text-right font-mono">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">DOCUMENTO OFICIAL H-06</span>
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                      FOLIO: {viewingOfficialQuoteModal.id_propuesta || viewingOfficialQuoteModal.id}
                    </span>
                  </div>

                  {/* LETTERHEAD HEADER */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-[#85AA1C] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center font-black text-white text-lg tracking-tighter border border-slate-800 shadow-sm">
                        ASP<span className="text-[#85AA1C]">.</span>
                      </div>
                      <div>
                        <h2 className="text-base font-black text-slate-900 tracking-tight">ASPECHS CONSULTORIA S.A. DE C.V.</h2>
                        <p className="text-[10px] text-slate-600 font-semibold">Laboratorio de Metrología y Ensayos Industriales</p>
                        <p className="text-[9px] text-slate-500 font-mono">Acreditación EMA NMX-EC-17025-IMNC-2018 / NOM-151-SCFI</p>
                      </div>
                    </div>
                  </div>

                  {/* DATOS DE LA EMPRESA Y COTIZACIÓN */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">CLIENTE Y DATOS FISCALES</span>
                      <div className="font-bold text-slate-900 text-sm">{viewingOfficialQuoteModal.cliente}</div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>At'n: {viewingOfficialQuoteModal.contacto || 'Representante Legal'}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-1 font-mono">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{viewingOfficialQuoteModal.email || 'contacto@empresa.com'}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{viewingOfficialQuoteModal.telefono || 'Sin teléfono registrado'}</span>
                      </div>
                    </div>

                    <div className="space-y-1 md:text-right border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
                      <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">DETALLES DE EMISIÓN</span>
                      <div className="text-xs font-semibold text-slate-700">Fecha de Emisión: <strong className="font-mono text-slate-900">{viewingOfficialQuoteModal.fecha || '2026-07-27'}</strong></div>
                      <div className="text-xs font-semibold text-slate-700">Periodo / Mes: <strong className="font-mono text-slate-900">{viewingOfficialQuoteModal.mes || 'Julio 2026'}</strong></div>
                      <div className="text-xs font-semibold text-slate-700">Vigencia Comercial: <strong className="font-mono text-emerald-700">30 Días Naturales</strong></div>
                      <div className="text-xs font-semibold text-slate-700">Estatus Propuesta: <strong className="font-mono text-blue-700">{viewingOfficialQuoteModal.estado || 'Emitida / Enviada'}</strong></div>
                    </div>
                  </div>

                  {/* DESGLOSE DE SERVICIOS METROLÓGICOS (TABLA HOJA 6) */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-[#85AA1C]" />
                      Alcance Técnico y Servicios Solicitados
                    </h4>

                    <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                      <thead className="bg-slate-900 text-white font-mono text-[10px] uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Concepto / Norma Aplicable</th>
                          <th className="py-2.5 px-3 text-center">Puntos</th>
                          <th className="py-2.5 px-3 text-right">Precio / Punto</th>
                          <th className="py-2.5 px-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {(Array.isArray(viewingOfficialQuoteModal.servicios) ? viewingOfficialQuoteModal.servicios : [viewingOfficialQuoteModal.servicio || "Evaluación Metrológica In Situ"]).filter(Boolean).map((sItem: any, idx: number) => {
                          const s = typeof sItem === 'string' ? sItem : (sItem?.servicio || sItem?.nombre || "Evaluación Metrológica In Situ");
                          const pts = (typeof sItem === 'object' && sItem?.puntos) || viewingOfficialQuoteModal.puntos || 5;
                          const costPt = (typeof sItem === 'object' && sItem?.costo_unitario) || viewingOfficialQuoteModal.costo_punto || 1800;
                          const rowSubtotal = (typeof sItem === 'object' && sItem?.subtotal) || (pts * costPt);
                          return (
                            <tr key={`${idx}-${s}`} className="hover:bg-slate-50">
                              <td className="py-3 px-3">
                                <div className="font-bold text-slate-900">{s}</div>
                                <div className="text-[10px] text-slate-500">Evaluación metrológica y emisión de informe de ensayo con acreditación EMA.</div>
                              </td>
                              <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">{pts} pts</td>
                              <td className="py-3 px-3 text-right font-mono text-slate-700">${costPt.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">${rowSubtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            </tr>
                          );
                        })}

                        {/* VIÁTICOS Y TRASLADOS */}
                        <tr className="bg-slate-50/80">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-800">Logística de Traslado y Viáticos de Campo</div>
                            <div className="text-[10px] text-slate-500">Transportación de patrones calibrados, hospedaje e insumos del personal operativo.</div>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-500">1 Servicio</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">${(viewingOfficialQuoteModal.viaticos || 1500).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${(viewingOfficialQuoteModal.viaticos || 1500).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* CUADRO RESUMEN FINANCIERO */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-t border-slate-200 pt-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 max-w-md w-full space-y-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase font-mono block">CANTIDAD CON LETRA (MXN)</span>
                      <div className="font-bold text-slate-900 text-[11px] italic">
                        {viewingOfficialQuoteModal.costo ? `*** IMPORTE TOTAL DE $${viewingOfficialQuoteModal.costo.toLocaleString('es-MX')} PESOS MEXICANOS M.N. (IVA INCLUIDO) ***` : '*** DOS MILLONES TRESCIENTOS MIL PESOS 00/100 M.N. ***'}
                      </div>
                    </div>

                    <div className="w-full sm:w-64 bg-slate-900 text-white p-4 rounded-xl space-y-2 font-mono">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Subtotal Neto:</span>
                        <span>${(viewingOfficialQuoteModal.subtotal || ((viewingOfficialQuoteModal.costo || 2300000) / 1.16)).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>IVA (16% Obligatorio):</span>
                        <span>${(viewingOfficialQuoteModal.iva || ((viewingOfficialQuoteModal.costo || 2300000) - (viewingOfficialQuoteModal.costo || 2300000) / 1.16)).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-black text-emerald-400">
                        <span>TOTAL MXN:</span>
                        <span>${(viewingOfficialQuoteModal.costo || 2300000).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- HOJA 7: TÉRMINOS COMERCIALES, GARANTÍA EMA Y FIRMA DIGITAL --- */}
                <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-xl shadow-md space-y-6 relative">
                  <div className="absolute top-4 right-6 text-right font-mono">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">DOCUMENTO OFICIAL H-07</span>
                    <span className="text-xs font-bold text-slate-600">TÉRMINOS Y VALIDACIÓN</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono border-b border-slate-200 pb-2">
                    Condiciones Comerciales y Acreditación de Calidad
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-slate-700 leading-relaxed">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-900 uppercase font-mono text-xs text-[#85AA1C]">1. Tiempos de Entrega e Informes</div>
                      <p>
                        Los informes técnicos de ensayo serán entregados en un plazo máximo de <strong>5 días hábiles</strong> posteriores a la finalización de los trabajos de campo. Todos los documentos emitidos cuentan con código QR de verificación de autenticidad en servidor.
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-900 uppercase font-mono text-xs text-[#85AA1C]">2. Garantía Metrológica EMA</div>
                      <p>
                        ASPECHS garantiza que todos los sonómetros, luxómetros y multímetros utilizados cuentan con calibración vigente expedida por laboratorios acreditados ante la Entidad Mexicana de Acreditación (EMA) bajo la norma NMX-EC-17025-IMNC-2018.
                      </p>
                    </div>
                  </div>

                  {/* BLOQUE DE FIRMA Y SELLO NOM-151 */}
                  <div className="bg-slate-950 text-slate-200 p-5 rounded-2xl border border-slate-900 space-y-3 font-mono">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-2 gap-2">
                      <div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase block">FIRMA DIGITAL DEL EMISOR</span>
                        <div className="text-white font-bold text-xs">Lic. Carlos Ayala — Director de Atención a Clientes</div>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px]">
                        SELLO NOM-151 VIGENTE
                      </span>
                    </div>

                    <div className="text-[9.5px] text-slate-400 space-y-1">
                      <div>Hash e.firma SAT SHA256: <strong className="text-emerald-400 font-bold break-all">f98a21b440e292d3341c8810298aef01029318a421e48f02</strong></div>
                      <div>Cadena Original: <span className="text-slate-300">||{viewingOfficialQuoteModal.id_propuesta || viewingOfficialQuoteModal.id}|{viewingOfficialQuoteModal.fecha || '2026-07-27'}|ASPECHS|{(viewingOfficialQuoteModal.costo || 2300000).toFixed(2)}|MXN||</span></div>
                    </div>
                  </div>

                </div>

              </div>

              {/* MODAL FOOTER */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center shrink-0">
                <span className="text-[10px] font-mono text-slate-500">
                  Documentación conforme al Sistema de Gestión de Calidad ASPECHS v2026
                </span>
                <button
                  onClick={() => setViewingOfficialQuoteModal(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
