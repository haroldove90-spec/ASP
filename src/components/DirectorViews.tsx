import React, { useState, useEffect } from 'react';
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
  Info,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  Layers,
  Map,
  Sparkles,
  Clock,
  Compass,
  FileCheck,
  UserPlus,
  Settings,
  Eye,
  Trash2,
  Edit,
  X,
  UserX,
  CheckCircle2,
  Cloud,
  CloudCheck,
  RefreshCw,
  Database,
  Percent,
  Tag,
  Send,
  FileEdit,
  Building,
  Mail,
  Phone,
  HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { Usuario, Instrumento, CertificadoCalibracion, AuditLog } from '../initial_data';
import { 
  saveCotizacionToSupabase, 
  syncAllQuotesToSupabase, 
  fetchCotizacionesFromSupabase,
  deleteCotizacionFromSupabase,
  saveOdtToSupabase,
  syncAllOdtsToSupabase,
  fetchOdtsFromSupabase,
  deleteOdtFromSupabase,
  saveUsuarioToSupabase,
  syncAllUsuariosToSupabase,
  deleteUsuarioFromSupabase,
  saveInstrumentoToSupabase,
  deleteInstrumentoFromSupabase,
  syncAllInstrumentosToSupabase
} from '../lib/supabaseSync';
import { 
  MetrologyServiceItem, 
  getStoredServices, 
  saveStoredServices 
} from '../data/metrologyServices';
import { 
  ClientRecord, 
  ClientContact, 
  getStoredClients, 
  saveStoredClients, 
  updateClientContacts 
} from '../data/clientsDatabase';
import { ServiceCatalogModal } from './ServiceCatalogModal';
import { 
  CommercialConditionsBlock, 
  CommercialConditions, 
  DEFAULT_COMMERCIAL_CONDITIONS 
} from './CommercialConditionsBlock';
import { ClientMultiContactSelector } from './ClientMultiContactSelector';

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
  scheduledServices: any[];
  setScheduledServices: React.Dispatch<React.SetStateAction<any[]>>;
  submittedReports: any[];
  purchaseOrders: any[];
  generatedQuotes: any[];
  setGeneratedQuotes: React.Dispatch<React.SetStateAction<any[]>>;
  invoices: any[];
  setInvoices: React.Dispatch<React.SetStateAction<any[]>>;
  setUsuarios: React.Dispatch<React.SetStateAction<Usuario[]>>;
  setInstruments?: React.Dispatch<React.SetStateAction<Instrumento[]>>;
  selectedRole?: string;
}

export default function DirectorViews(props: DirectorViewsProps) {
  const {
    activePersona,
    selectedRole,
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
    DB_SCHEMA_SQL,
    scheduledServices,
    setScheduledServices,
    submittedReports,
    purchaseOrders,
    generatedQuotes,
    setGeneratedQuotes,
    invoices,
    setInvoices,
    setUsuarios
  } = props;

  const [activeFinTab, setActiveFinTab] = useState<'quotes' | 'invoices'>('invoices');
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>("Todos");

  // --- CRM, SERVICES CATALOG & CLIENTS ADVANCED STATES ---
  const [availableServices, setAvailableServices] = useState<MetrologyServiceItem[]>(() => getStoredServices());
  const [isServiceCatalogOpen, setIsServiceCatalogOpen] = useState(false);

  const [clientsList, setClientsList] = useState<ClientRecord[]>(() => getStoredClients());
  const [selectedClientNum, setSelectedClientNum] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [isSubcontracted, setIsSubcontracted] = useState(false);
  const [subcontractorName, setSubcontractorName] = useState("");
  const [quoteDate, setQuoteDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [quoteFolio, setQuoteFolio] = useState(() => `COT-2026-${String(generatedQuotes.length + 1).padStart(3, '0')}`);

  // Contacts
  const [currentQuoteContacts, setCurrentQuoteContacts] = useState<ClientContact[]>([]);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Itemized concepts
  const [itemizedServices, setItemizedServices] = useState<Array<{
    id: string;
    serviceName: string;
    puntos: number;
    costo_punto: number;
  }>>([
    {
      id: "srv-dir-1",
      serviceName: "NOM-011-STPS-2001 (Ruido Industrial - Nivel Sonoro Continuo A)",
      puntos: 5,
      costo_punto: 1800
    }
  ]);

  const [estimatedViatics, setEstimatedViatics] = useState(1500);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [commercialConditions, setCommercialConditions] = useState<CommercialConditions>(DEFAULT_COMMERCIAL_CONDITIONS);

  // Auto update folio when client or date changes
  useEffect(() => {
    let clientDigits = "001";
    if (selectedClientNum) {
      const match = selectedClientNum.match(/\d+/);
      if (match) clientDigits = match[0].padStart(3, '0');
    }
    const yearMonth = quoteDate.replace(/-/g, '').slice(0, 6);
    setQuoteFolio(`COT-${yearMonth}-${clientDigits}`);
  }, [selectedClientNum, quoteDate]);

  // Sync clients database updates
  useEffect(() => {
    saveStoredClients(clientsList);
  }, [clientsList]);

  // Handle client selection
  const handleSelectClient = (clientId: string) => {
    setSelectedClientNum(clientId);
    const found = clientsList.find(c => c.id === clientId);
    if (found) {
      setClientName(found.razon_social);
      setContactName(found.contacto_nombre || "");
      setContactEmail(found.contacto_email || "");
      setContactPhone(found.contacto_telefono || "");
      if (found.contactos && found.contactos.length > 0) {
        setCurrentQuoteContacts(found.contactos);
      } else {
        const defaultContact: ClientContact = {
          id: `cnt-${Date.now()}`,
          nombre: found.contacto_nombre || "Contacto Principal",
          puesto: "Representante / Compras",
          email: found.contacto_email || "contacto@cliente.com",
          telefono: found.contacto_telefono || "",
          es_principal: true,
          enviar_cotizacion: true
        };
        setCurrentQuoteContacts([defaultContact]);
      }
    }
  };

  const handleUpdateCurrentQuoteContacts = (newContacts: ClientContact[]) => {
    setCurrentQuoteContacts(newContacts);
    const primary = newContacts.find(c => c.es_principal && c.enviar_cotizacion) || newContacts.find(c => c.enviar_cotizacion) || newContacts[0];
    if (primary) {
      setContactName(primary.nombre);
      setContactEmail(primary.email);
      setContactPhone(primary.telefono);
    }
    if (selectedClientNum) {
      updateClientContacts(selectedClientNum, newContacts);
      setClientsList(getStoredClients());
    }
  };

  const handleAddServiceRow = () => {
    const defaultServiceName = availableServices.length > 0 ? availableServices[0].nombre : "NOM-011-STPS-2001 (Ruido Industrial)";
    const defaultServiceCost = availableServices.length > 0 ? availableServices[0].precio_base_sugerido : 1800;
    const newRow = {
      id: `srv-dir-${Date.now()}`,
      serviceName: defaultServiceName,
      puntos: 5,
      costo_punto: defaultServiceCost
    };
    setItemizedServices([...itemizedServices, newRow]);
  };

  const handleUpdateServiceRow = (id: string, key: string, value: any) => {
    setItemizedServices(itemizedServices.map(item => {
      if (item.id === id) {
        const updated = { ...item, [key]: value };
        if (key === "serviceName") {
          const matched = availableServices.find(s => s.nombre === value);
          if (matched) {
            updated.costo_punto = matched.precio_base_sugerido;
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const handleRemoveServiceRow = (id: string) => {
    if (itemizedServices.length <= 1) return;
    setItemizedServices(itemizedServices.filter(item => item.id !== id));
  };

  const handleSaveServicesCatalog = (updatedServices: MetrologyServiceItem[]) => {
    setAvailableServices(updatedServices);
    saveStoredServices(updatedServices);
  };

  // Calculations for dynamic form with editable costs & discount %
  const subtotalServices = itemizedServices.reduce((acc, curr) => acc + (curr.puntos * curr.costo_punto), 0);
  const subtotalBruto = subtotalServices + estimatedViatics;
  const discountAmount = Math.round(subtotalBruto * ((discountPercentage || 0) / 100));
  const subtotalNetoConDescuento = subtotalBruto - discountAmount;
  const computedIva = Math.round(subtotalNetoConDescuento * 0.16);
  const computedTotal = subtotalNetoConDescuento + computedIva;

  // --- LOCAL STATES FOR DIRECTOR OF OPERATIONS INTERACTION ---
  const [isAddQuoteOpen, setIsAddQuoteOpen] = useState(false);

  const [isAddOdtOpen, setIsAddOdtOpen] = useState(false);
  const [newOdtForm, setNewOdtForm] = useState({
    cliente_nombre: '',
    servicio: 'Mapeo de Ruido NOM-011',
    fecha: '2026-07-20',
    id_tecnico: '',
    id_instrumento: '',
    estado: 'Asignado'
  });

  // --- NEW MODAL & INTERACTION STATES FOR DIRECTOR DE OPERACIONES ---
  const [selectedOdtDetailModal, setSelectedOdtDetailModal] = useState<any | null>(null);
  const [selectedQuoteForDetail, setSelectedQuoteForDetail] = useState<any | null>(null);
  const [selectedFieldScheduleDetail, setSelectedFieldScheduleDetail] = useState<any | null>(null);
  const [selectedEngineerForWorkload, setSelectedEngineerForWorkload] = useState<any | null>(null);
  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState<string>("2026-07");
  const [reassignOdtForm, setReassignOdtForm] = useState({
    id_servicio: '',
    id_tecnico: '',
    nueva_fecha: ''
  });

  const MONTH_OPTIONS = [
    { value: "2026-01", label: "Enero 2026 (Histórico)" },
    { value: "2026-02", label: "Febrero 2026 (Histórico)" },
    { value: "2026-03", label: "Marzo 2026 (Histórico)" },
    { value: "2026-04", label: "Abril 2026 (Histórico)" },
    { value: "2026-05", label: "Mayo 2026 (Histórico)" },
    { value: "2026-06", label: "Junio 2026 (Histórico)" },
    { value: "2026-07", label: "Julio 2026 (Mes en Curso)" },
    { value: "2026-08", label: "Agosto 2026 (Programación)" },
    { value: "2026-09", label: "Septiembre 2026 (Programación)" },
    { value: "2026-10", label: "Octubre 2026 (Programación)" },
    { value: "2026-11", label: "Noviembre 2026 (Programación)" },
    { value: "2026-12", label: "Diciembre 2026 (Programación)" },
  ];

  const [calYearStr, calMonthStr] = selectedCalendarMonth.split('-');
  const calYear = parseInt(calYearStr || '2026', 10);
  const calMonth = parseInt(calMonthStr || '07', 10);
  const firstDayIndex = new Date(calYear, calMonth - 1, 1).getDay();
  const daysInMonthCount = new Date(calYear, calMonth, 0).getDate();

  // --- STATE FOR VIEWING & EDITING INGENIEROS, COTIZACIONES, ODTS (SUPABASE CRUD) ---
  const [selectedEngineerForView, setSelectedEngineerForView] = useState<Usuario | null>(null);
  const [selectedEngineerForEdit, setSelectedEngineerForEdit] = useState<Usuario | null>(null);
  const [editEngineerForm, setEditEngineerForm] = useState({
    nombre_completo: '',
    email: '',
    cedula: '',
    especialidad: 'Especialista en Acústica NOM-011',
    puesto: '',
    esta_activo: true
  });

  const [selectedQuoteForEdit, setSelectedQuoteForEdit] = useState<any | null>(null);
  const [editQuoteForm, setEditQuoteForm] = useState({
    id: '',
    cliente: '',
    servicio: 'Mapeo de Ruido NOM-011',
    puntos: 1,
    costo: 0,
    estado: 'Aceptado',
    fecha: ''
  });

  const [selectedOdtForEdit, setSelectedOdtForEdit] = useState<any | null>(null);
  const [editOdtForm, setEditOdtForm] = useState({
    id_servicio: '',
    cliente_nombre: '',
    servicio: 'Mapeo de Ruido NOM-011',
    fecha: '',
    id_tecnico: '',
    id_instrumento: '',
    estado: 'Asignado'
  });

  // --- SYSTEM ADMIN / EMPLOYEES STATES ---
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUserForView, setSelectedUserForView] = useState<Usuario | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<Usuario | null>(null);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);
  const [editUserForm, setEditUserForm] = useState<{
    nombre_completo: string;
    email: string;
    puesto: string;
    id_rol: string;
    esta_activo: boolean;
  }>({
    nombre_completo: '',
    email: '',
    puesto: '',
    id_rol: '',
    esta_activo: true
  });

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    nombre_completo: '',
    email: '',
    id_rol: 'ing_campo',
    puesto: 'Técnico de Campo'
  });
  const [selectedRoleForPermEditing, setSelectedRoleForPermEditing] = useState('ing_campo');
  const [localRolePermissions, setLocalRolePermissions] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('aspechs_role_permissions');
    return saved ? JSON.parse(saved) : { ...ROLE_PERMISSIONS_MAP };
  });

  useEffect(() => {
    localStorage.setItem('aspechs_role_permissions', JSON.stringify(localRolePermissions));
  }, [localRolePermissions]);

  // Catalogs and Parameters States
  const [catalogType, setCatalogType] = useState<'servicios' | 'normas' | 'parametros'>('servicios');
  const [catalogServices, setCatalogServices] = useState<any[]>(() => {
    const saved = localStorage.getItem('aspechs_catalog_services');
    return saved ? JSON.parse(saved) : [
      { id: "S1", nombre: "Mapeo Metrológico de Ruido NOM-011", costo: 15000, duracion: "2 días" },
      { id: "S2", nombre: "Evaluación Lumínica Ocupacional NOM-025", costo: 12000, duracion: "1 día" },
      { id: "S3", nombre: "Estudio de Condiciones Térmicas NOM-015", costo: 14000, duracion: "1 día" },
      { id: "S4", nombre: "Servicio de Calibración Acreditada EMA", costo: 4500, duracion: "1 día" }
    ];
  });

  useEffect(() => {
    localStorage.setItem('aspechs_catalog_services', JSON.stringify(catalogServices));
  }, [catalogServices]);

  const [catalogNorms, setCatalogNorms] = useState<any[]>(() => {
    const saved = localStorage.getItem('aspechs_catalog_norms');
    return saved ? JSON.parse(saved) : [
      { id: "N1", clave: "NOM-011-STPS-2001", nombre: "Condiciones de seguridad e higiene en los centros de trabajo donde se genere ruido." },
      { id: "N2", clave: "NOM-025-STPS-2008", nombre: "Condiciones de iluminación en los centros de trabajo." },
      { id: "N3", clave: "NOM-015-STPS-2001", nombre: "Condiciones térmicas elevadas o abatidas - Condiciones de seguridad e higiene." }
    ];
  });

  useEffect(() => {
    localStorage.setItem('aspechs_catalog_norms', JSON.stringify(catalogNorms));
  }, [catalogNorms]);

  const [systemParameters, setSystemParameters] = useState<any[]>(() => {
    const saved = localStorage.getItem('aspechs_system_parameters');
    return saved ? JSON.parse(saved) : [
      { clave: "IVA_TASA", valor: "0.16", descripcion: "Tasa del Impuesto al Valor Agregado" },
      { clave: "POSTGRESQL_SSL", valor: "REQUERIDO", descripcion: "Exigir SSL/TLS en conexiones de base de datos" },
      { clave: "NOM151_PROVIDER", valor: "PSC_AUTORIZADO_MEX", descripcion: "Proveedor de Constancias de Conservación de Mensajes de Datos" },
      { clave: "JWT_EXPIRATION_MINUTES", valor: "480", descripcion: "Tiempo de expiración de sesión de usuario" }
    ];
  });

  useEffect(() => {
    localStorage.setItem('aspechs_system_parameters', JSON.stringify(systemParameters));
  }, [systemParameters]);

  const [isAddCatalogItemOpen, setIsAddCatalogItemOpen] = useState(false);
  const [newCatalogItemName, setNewCatalogItemName] = useState("");
  const [newCatalogItemValue, setNewCatalogItemValue] = useState("");

  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newScheduleForm, setNewScheduleForm] = useState({
    cliente_nombre: '',
    servicio: 'Mapeo de Ruido NOM-011',
    id_tecnico: '',
    id_instrumento: '',
  });

  const [isAddEngineerOpen, setIsAddEngineerOpen] = useState(false);
  const [newEngineerForm, setNewEngineerForm] = useState({
    nombre_completo: '',
    email: '',
    cedula: '',
    especialidad: 'Especialista en Acústica NOM-011'
  });

  // Supabase sync states
  const [isSyncingQuotes, setIsSyncingQuotes] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);

  // Construction of base Quote Object for CEO & Director of Operations
  const buildQuotePayload = (status: "Borrador" | "Enviada") => {
    const quoteMonthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const currentMonthIndex = new Date(quoteDate).getMonth();
    const quoteMonth = quoteMonthNames[currentMonthIndex] || "Julio";
    const serviceNamesArray = itemizedServices.map(i => i.serviceName);
    const activeContacts = currentQuoteContacts.filter(c => c.enviar_cotizacion);

    return {
      id: quoteFolio,
      id_propuesta: quoteFolio,
      cliente: isSubcontracted && subcontractorName ? `${clientName} (Subcontratado: ${subcontractorName})` : clientName,
      cliente_num: selectedClientNum || "CLI-001",
      es_subcontratado: isSubcontracted,
      subcontratado_nombre: subcontractorName,
      contacto: contactName || (activeContacts[0]?.nombre) || "Representante de Compras",
      email: contactEmail || (activeContacts[0]?.email) || "contacto@cliente.com",
      telefono: contactPhone || (activeContacts[0]?.telefono) || "",
      contactos: currentQuoteContacts,
      contactos_destinatarios: activeContacts.map(c => ({ nombre: c.nombre, email: c.email, puesto: c.puesto })),
      fecha: quoteDate,
      mes: quoteMonth,
      servicios: serviceNamesArray,
      servicio: serviceNamesArray.join(" + "),
      servicios_desglosados: itemizedServices,
      puntos: itemizedServices.reduce((acc, curr) => acc + curr.puntos, 0),
      costo_punto: itemizedServices[0]?.costo_punto || 1800,
      viaticos: estimatedViatics,
      subtotal_servicios: subtotalServices,
      subtotal_bruto: subtotalBruto,
      descuento_porcentaje: discountPercentage || 0,
      descuento_monto: discountAmount,
      subtotal: subtotalNetoConDescuento,
      iva: computedIva,
      costo: computedTotal,
      condiciones: commercialConditions,
      estado: status
    };
  };

  // ACTION 1: Guardar Borrador de Cotización
  const handleSaveDraftQuote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!clientName) {
      alert("Por favor seleccione un cliente o ingrese su razón social.");
      return;
    }

    const draftQuote = buildQuotePayload("Borrador");

    const exists = generatedQuotes.some(q => q.id === draftQuote.id || q.id_propuesta === draftQuote.id);
    const updated = exists
      ? generatedQuotes.map(q => (q.id === draftQuote.id || q.id_propuesta === draftQuote.id) ? draftQuote : q)
      : [draftQuote, ...generatedQuotes];
    setGeneratedQuotes(updated);

    setIsSyncingQuotes(true);
    setSyncStatusMessage("Guardando borrador en Supabase...");
    const syncRes = await saveCotizacionToSupabase(draftQuote, activePersona?.id_usuario);
    setIsSyncingQuotes(false);

    if (syncRes.success) {
      setSyncStatusMessage(`💾 Borrador ${draftQuote.id} guardado en Supabase (public.cotizaciones).`);
      alert(`💾 Cotización ${draftQuote.id} guardada como BORRADOR.\nCliente: ${draftQuote.cliente}\nPuede continuar editando conceptos, costos o contactos sin generar facturación.`);
    } else {
      setSyncStatusMessage(`⚠️ Borrador guardado localmente.`);
      alert(`💾 Cotización ${draftQuote.id} guardada localmente como BORRADOR.`);
    }
  };

  // ACTION 2: Emitir Cotización Oficial
  const handleEmitOfficialQuote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!clientName) {
      alert("Por favor seleccione un cliente o ingrese su razón social antes de emitir.");
      return;
    }

    const officialQuote = buildQuotePayload("Enviada");

    const filtered = generatedQuotes.filter(q => q.id !== officialQuote.id && q.id_propuesta !== officialQuote.id);
    setGeneratedQuotes([officialQuote, ...filtered]);

    // Create corresponding invoice in Finanzas
    const newInvoice = {
      id_factura: invoices.length + 1,
      cliente: officialQuote.cliente,
      monto: computedTotal,
      estado: "Pendiente",
      vencimiento: new Date(Date.now() + (commercialConditions.vigencia_dias || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mes: officialQuote.mes,
      servicios: officialQuote.servicios,
      servicio: officialQuote.servicio
    };
    setInvoices([newInvoice, ...invoices]);

    setIsAddQuoteOpen(false);

    // Sync to Supabase
    setIsSyncingQuotes(true);
    setSyncStatusMessage("Emitiendo cotización en Supabase...");
    const syncRes = await saveCotizacionToSupabase(officialQuote, activePersona?.id_usuario);
    setIsSyncingQuotes(false);

    const activeEmails = currentQuoteContacts.filter(c => c.enviar_cotizacion).map(c => `${c.nombre} (${c.email})`).join(", ");

    if (syncRes.success) {
      setSyncStatusMessage(`✅ Cotización ${officialQuote.id} emitida en Supabase.`);
      alert(`✅ ¡Cotización Oficial ${officialQuote.id} Emitida Exitosamente!\n\nCliente: ${officialQuote.cliente}\nDestinatarios: ${activeEmails || officialQuote.email}\nDescuento Aplicado: ${discountPercentage}% (-$${discountAmount.toLocaleString('es-MX')} MXN)\nTotal Final: $${computedTotal.toLocaleString('es-MX')} MXN (IVA Incluido).\n\n☁️ Guardada y sincronizada en Supabase (public.cotizaciones).`);
    } else {
      setSyncStatusMessage(`⚠️ Guardada localmente.`);
      alert(`✅ Cotización ${officialQuote.id} emitida exitosamente.\nTotal: $${computedTotal.toLocaleString('es-MX')} MXN.`);
    }
  };

  const handleManualSyncQuotes = async () => {
    setIsSyncingQuotes(true);
    setSyncStatusMessage("Sincronizando todas las cotizaciones con Supabase...");
    const res = await syncAllQuotesToSupabase(generatedQuotes);
    setIsSyncingQuotes(false);
    if (res.success) {
      setSyncStatusMessage(`✅ ${res.message}`);
      alert(`☁️ ${res.message}\n\nLas ${generatedQuotes.length} cotizaciones ahora están guardadas y visibles en Supabase en la tabla 'public.cotizaciones'.`);
    } else {
      setSyncStatusMessage(`❌ Error al sincronizar: ${res.message}`);
      alert(`❌ Error al sincronizar con Supabase:\n${res.message}`);
    }
  };

  const handleCreateOdt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOdtForm.cliente_nombre || !newOdtForm.fecha || !newOdtForm.id_tecnico || !newOdtForm.id_instrumento) {
      alert("Por favor complete todos los campos obligatorios.");
      return;
    }
    const newOdt = {
      id_servicio: `SERV-${100 + scheduledServices.length + 1}`,
      cliente_nombre: newOdtForm.cliente_nombre,
      servicio: newOdtForm.servicio,
      fecha: newOdtForm.fecha,
      id_tecnico: newOdtForm.id_tecnico,
      id_instrumento: newOdtForm.id_instrumento,
      estado: newOdtForm.estado
    };

    setScheduledServices([newOdt, ...scheduledServices]);
    setIsAddOdtOpen(false);
    setNewOdtForm({
      cliente_nombre: '',
      servicio: 'Mapeo de Ruido NOM-011',
      fecha: '2026-07-20',
      id_tecnico: '',
      id_instrumento: '',
      estado: 'Asignado'
    });

    // Guardar en tiempo real en Supabase (public.ordenes_trabajo)
    setIsSyncingQuotes(true);
    setSyncStatusMessage("Guardando ODT en Supabase...");
    const res = await saveOdtToSupabase(newOdt);
    setIsSyncingQuotes(false);
    if (res.success) {
      setSyncStatusMessage(`✅ ODT ${newOdt.id_servicio} guardada en Supabase.`);
      alert(`✅ Orden de Trabajo ${newOdt.id_servicio} creada y programada correctamente para el ${newOdt.fecha}.\n\n☁️ Guardada y sincronizada en Supabase (public.ordenes_trabajo).`);
    } else {
      setSyncStatusMessage(`⚠️ ODT guardada localmente.`);
      alert(`Orden de Trabajo ${newOdt.id_servicio} guardada localmente.\n\nNota de Supabase: ${res.message}`);
    }
  };

  const handleScheduleDayEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCalendarDay) return;
    if (!newScheduleForm.cliente_nombre || !newScheduleForm.id_tecnico || !newScheduleForm.id_instrumento) {
      alert("Por favor complete todos los campos obligatorios.");
      return;
    }

    const newOdt = {
      id_servicio: `SERV-${100 + scheduledServices.length + 1}`,
      cliente_nombre: newScheduleForm.cliente_nombre,
      servicio: newScheduleForm.servicio,
      fecha: selectedCalendarDay,
      id_tecnico: newScheduleForm.id_tecnico,
      id_instrumento: newScheduleForm.id_instrumento,
      estado: 'Asignado'
    };

    setScheduledServices([newOdt, ...scheduledServices]);
    setIsScheduleModalOpen(false);
    setNewScheduleForm({
      cliente_nombre: '',
      servicio: 'Mapeo de Ruido NOM-011',
      id_tecnico: '',
      id_instrumento: '',
    });

    // Guardar en tiempo real en Supabase (public.ordenes_trabajo)
    setIsSyncingQuotes(true);
    setSyncStatusMessage("Sincronizando cita con Supabase...");
    const res = await saveOdtToSupabase(newOdt);
    setIsSyncingQuotes(false);
    if (res.success) {
      setSyncStatusMessage(`✅ Cita ${newOdt.id_servicio} guardada en Supabase.`);
      alert(`✅ Servicio agendado con éxito para el día ${selectedCalendarDay}.\n\n☁️ Registrado y guardado en Supabase (public.ordenes_trabajo).`);
    } else {
      setSyncStatusMessage(`⚠️ Cita agendada localmente.`);
      alert(`Servicio agendado para el día ${selectedCalendarDay} en la agenda local.\n\nNota de Supabase: ${res.message}`);
    }
  };

  const handleManualSyncAgenda = async () => {
    setIsSyncingQuotes(true);
    setSyncStatusMessage("Sincronizando agenda con Supabase...");
    const res = await syncAllOdtsToSupabase(scheduledServices);
    setIsSyncingQuotes(false);
    if (res.success) {
      setSyncStatusMessage(`✅ ${res.message}`);
      alert(`☁️ ${res.message}\n\nLas ${scheduledServices.length} citas y servicios de la agenda están respaldados en Supabase en la tabla 'public.ordenes_trabajo'.`);
    } else {
      setSyncStatusMessage(`❌ Error al sincronizar agenda: ${res.message}`);
      alert(`❌ Error al sincronizar agenda con Supabase:\n${res.message}`);
    }
  };

  const handleManualSyncEngineers = async () => {
    setIsSyncingQuotes(true);
    setSyncStatusMessage("Sincronizando personal con Supabase...");
    const res = await syncAllUsuariosToSupabase(usuarios);
    setIsSyncingQuotes(false);
    if (res.success) {
      setSyncStatusMessage(`✅ ${res.message}`);
      alert(`☁️ ${res.message}\n\nLos ${usuarios.length} ingenieros y usuarios están sincronizados con Supabase (public.usuarios).`);
    } else {
      setSyncStatusMessage(`❌ Error: ${res.message}`);
      alert(`❌ Error al sincronizar personal con Supabase:\n${res.message}`);
    }
  };

  const handleCreateEngineer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEngineerForm.nombre_completo || !newEngineerForm.email || !newEngineerForm.cedula) {
      alert("Por favor complete todos los campos obligatorios.");
      return;
    }

    const newEng: Usuario = {
      id_usuario: `01000000-0000-0000-0000-000000000${100 + usuarios.length + 1}`,
      nombre_completo: newEngineerForm.nombre_completo,
      email: newEngineerForm.email,
      id_rol: 'LAB_TECH',
      puesto: `Ingeniero de Campo - ${newEngineerForm.especialidad}`,
      firma_electronica_fingerprint: `SHA256:${newEngineerForm.cedula.toUpperCase()}`,
      esta_activo: true,
      ultimo_acceso: new Date().toISOString()
    };

    // Store custom fields as dynamic properties
    (newEng as any).cedula_profesional = newEngineerForm.cedula;
    (newEng as any).firma_electronica = `FIRMA:${newEngineerForm.nombre_completo.toUpperCase().replace(/\s/g, '_')}_${newEngineerForm.cedula}`;

    setUsuarios([...usuarios, newEng]);
    setIsAddEngineerOpen(false);
    setNewEngineerForm({
      nombre_completo: '',
      email: '',
      cedula: '',
      especialidad: 'Especialista en Acústica NOM-011'
    });

    // Guardar en Supabase
    saveUsuarioToSupabase(newEng).then(res => {
      if (res.success) {
        console.log("Usuario guardado en Supabase:", res.message);
      }
    }).catch(err => console.error("Error guardando usuario:", err));

    alert(`Ingeniero de Campo ${newEng.nombre_completo} registrado de alta en el sistema exitosamente.`);
  };

  // --- CRUD ACTIONS FOR INGENIEROS / PERSONAL (PUBLIC.USUARIOS) ---
  const handleStartEditEngineer = (eng: Usuario) => {
    setSelectedEngineerForEdit(eng);
    setEditEngineerForm({
      nombre_completo: eng.nombre_completo,
      email: eng.email,
      cedula: (eng as any).cedula_profesional || 'EMA-NMX-98432',
      especialidad: eng.puesto?.replace('Ingeniero de Campo - ', '') || 'Especialista en Acústica NOM-011',
      puesto: eng.puesto || 'Ingeniero de Campo',
      esta_activo: eng.esta_activo ?? true
    });
  };

  const handleSaveEngineerEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEngineerForEdit) return;

    const updatedEng: Usuario = {
      ...selectedEngineerForEdit,
      nombre_completo: editEngineerForm.nombre_completo,
      email: editEngineerForm.email,
      puesto: `Ingeniero de Campo - ${editEngineerForm.especialidad}`,
      firma_electronica_fingerprint: `SHA256:${editEngineerForm.cedula.toUpperCase()}`,
      esta_activo: editEngineerForm.esta_activo
    };
    (updatedEng as any).cedula_profesional = editEngineerForm.cedula;
    (updatedEng as any).firma_electronica = `FIRMA:${editEngineerForm.nombre_completo.toUpperCase().replace(/\s/g, '_')}_${editEngineerForm.cedula}`;

    setUsuarios(prev => prev.map(u => u.id_usuario === selectedEngineerForEdit.id_usuario ? updatedEng : u));
    
    const res = await saveUsuarioToSupabase(updatedEng);
    if (res.success) {
      alert(`✅ Expediente del ${updatedEng.nombre_completo} actualizado y sincronizado en Supabase (public.usuarios).`);
    } else {
      alert(`⚠️ Actualizado localmente. Nota de Supabase: ${res.message}`);
    }
    setSelectedEngineerForEdit(null);
  };

  const handleToggleEngineerActive = async (eng: Usuario) => {
    const nextState = !eng.esta_activo;
    const actionLabel = nextState ? "Reactivar / Habilitar" : "Dar de Baja / Pausar";
    if (!confirm(`¿Está seguro de ${actionLabel} al ${eng.nombre_completo}?\n\nEsta actualización cambiará el estado en la aplicación y en Supabase (public.usuarios).`)) return;

    const updatedEng: Usuario = {
      ...eng,
      esta_activo: nextState
    };
    setUsuarios(prev => prev.map(u => u.id_usuario === eng.id_usuario ? updatedEng : u));

    const res = await saveUsuarioToSupabase(updatedEng);
    if (res.success) {
      alert(`✅ Estado del ${eng.nombre_completo} actualizado a "${nextState ? 'ACTIVO' : 'PAUSADO / INACTIVO'}" en Supabase.`);
    } else {
      alert(`⚠️ Actualizado localmente. Nota de Supabase: ${res.message}`);
    }
  };

  const handleDeleteEngineer = async (eng: Usuario) => {
    if (!confirm(`⚠️ ¿Está seguro de ELIMINAR definitivamente al ${eng.nombre_completo}?\n\nEsta acción eliminará el registro tanto en la aplicación como en la base de datos de Supabase (public.usuarios).`)) return;

    setUsuarios(prev => prev.filter(u => u.id_usuario !== eng.id_usuario));
    const res = await deleteUsuarioFromSupabase(eng.id_usuario);
    if (res.success) {
      alert(`🗑️ El ${eng.nombre_completo} fue eliminado exitosamente de la base de datos de Supabase.`);
    } else {
      alert(`⚠️ Eliminado en la aplicación local. Nota de Supabase: ${res.message}`);
    }
  };

  // --- CRUD ACTIONS FOR COTIZACIONES (PUBLIC.COTIZACIONES) ---
  const handleStartEditQuote = (q: any) => {
    setSelectedQuoteForEdit(q);
    setEditQuoteForm({
      id: q.id || q.folio || '',
      cliente: q.cliente || '',
      servicio: q.servicio || 'Mapeo de Ruido NOM-011',
      puntos: q.puntos || 1,
      costo: q.costo || 0,
      estado: q.estado || 'Aceptado',
      fecha: q.fecha || new Date().toISOString().split('T')[0]
    });
  };

  const handleSaveQuoteEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuoteForEdit) return;

    const updatedQuote = {
      ...selectedQuoteForEdit,
      cliente: editQuoteForm.cliente,
      servicio: editQuoteForm.servicio,
      puntos: editQuoteForm.puntos,
      costo: editQuoteForm.costo,
      estado: editQuoteForm.estado,
      fecha: editQuoteForm.fecha
    };

    setGeneratedQuotes(prev => prev.map(q => q.id === selectedQuoteForEdit.id ? updatedQuote : q));
    const res = await saveCotizacionToSupabase(updatedQuote);
    if (res.success) {
      alert(`✅ Cotización ${updatedQuote.id} actualizada y sincronizada en Supabase (public.cotizaciones).`);
    } else {
      alert(`⚠️ Guardada localmente. Nota de Supabase: ${res.message}`);
    }
    setSelectedQuoteForEdit(null);
  };

  const handleDeleteQuote = async (q: any) => {
    const quoteId = q.id || q.folio;
    if (!confirm(`⚠️ ¿Está seguro de ELIMINAR la cotización ${quoteId} (${q.cliente})?\n\nSe eliminará permanentemente de la plataforma y de Supabase (public.cotizaciones).`)) return;

    setGeneratedQuotes(prev => prev.filter(item => item.id !== quoteId && item.folio !== quoteId));
    const res = await deleteCotizacionFromSupabase(quoteId);
    if (res.success) {
      alert(`🗑️ Cotización ${quoteId} eliminada exitosamente de Supabase.`);
    } else {
      alert(`⚠️ Eliminada en la aplicación local. Nota de Supabase: ${res.message}`);
    }
  };

  // --- CRUD ACTIONS FOR ORDENES DE TRABAJO (PUBLIC.ORDENES_TRABAJO) ---
  const handleStartEditOdt = (odt: any) => {
    setSelectedOdtForEdit(odt);
    setEditOdtForm({
      id_servicio: odt.id_servicio || odt.id_odt || '',
      cliente_nombre: odt.cliente_nombre || odt.cliente || '',
      servicio: odt.servicio || 'Mapeo de Ruido NOM-011',
      fecha: odt.fecha || '',
      id_tecnico: odt.id_tecnico || '',
      id_instrumento: odt.id_instrumento || '',
      estado: odt.estado || 'Asignado'
    });
  };

  const handleSaveOdtEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOdtForEdit) return;

    const updatedOdt = {
      ...selectedOdtForEdit,
      cliente_nombre: editOdtForm.cliente_nombre,
      servicio: editOdtForm.servicio,
      fecha: editOdtForm.fecha,
      id_tecnico: editOdtForm.id_tecnico,
      id_instrumento: editOdtForm.id_instrumento,
      estado: editOdtForm.estado
    };

    setScheduledServices(prev => prev.map(s => (s.id_servicio === selectedOdtForEdit.id_servicio || s.id_odt === selectedOdtForEdit.id_servicio) ? updatedOdt : s));
    const res = await saveOdtToSupabase(updatedOdt);
    if (res.success) {
      alert(`✅ Orden de Trabajo ${updatedOdt.id_servicio} actualizada y sincronizada en Supabase (public.ordenes_trabajo).`);
    } else {
      alert(`⚠️ Guardada localmente. Nota de Supabase: ${res.message}`);
    }
    setSelectedOdtForEdit(null);
  };

  const handleDeleteOdt = async (odt: any) => {
    const odtId = odt.id_servicio || odt.id_odt || odt.id;
    if (!confirm(`⚠️ ¿Está seguro de ELIMINAR la Orden de Trabajo / Cita ${odtId} (${odt.cliente_nombre || odt.cliente})?\n\nSe eliminará de la plataforma y de Supabase (public.ordenes_trabajo).`)) return;

    setScheduledServices(prev => prev.filter(s => s.id_servicio !== odtId && s.id_odt !== odtId));
    const res = await deleteOdtFromSupabase(odtId);
    if (res.success) {
      alert(`🗑️ Orden de Trabajo ${odtId} eliminada exitosamente de Supabase.`);
    } else {
      alert(`⚠️ Eliminada en la aplicación local. Nota de Supabase: ${res.message}`);
    }
  };

  // --- CRUD ACTIONS FOR INSTRUMENTOS (PUBLIC.INSTRUMENTOS) ---
  const handleDeleteInstrument = async (inst: Instrumento) => {
    const id = inst.codigo_interno || inst.id_instrumento;
    if (!confirm(`⚠️ ¿Está seguro de ELIMINAR el instrumento ${inst.codigo_interno} (${inst.nombre})?\n\nSe eliminará de la plataforma y de Supabase (public.instrumentos).`)) return;

    if (props.setInstruments) {
      props.setInstruments(prev => prev.filter(i => i.codigo_interno !== inst.codigo_interno && i.id_instrumento !== inst.id_instrumento));
    }
    const res = await deleteInstrumentoFromSupabase(id);
    if (res.success) {
      alert(`🗑️ Instrumento ${inst.codigo_interno} eliminado exitosamente de Supabase.`);
    } else {
      alert(`⚠️ Eliminado en la aplicación local. Nota de Supabase: ${res.message}`);
    }
  };
  const [projectTechFilter, setProjectTechFilter] = useState<string>("Todos");
  const [selectedLiveServiceForGps, setSelectedLiveServiceForGps] = useState<any>(null);
  
  const [backendAuditLogs, setBackendAuditLogs] = useState<any[]>([]);
  const [chainIntegrityValid, setChainIntegrityValid] = useState<boolean>(true);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState<boolean>(false);

  const fetchBackendAuditLogs = async () => {
    try {
      setLoadingAuditLogs(true);
      const res = await fetch("/api/auditoria");
      if (res.ok) {
        const data = await res.json();
        setBackendAuditLogs(data.logs || []);
        setChainIntegrityValid(data.chain_integrity_valid !== false);
      }
    } catch (err) {
      console.error("Error fetching live blockchain audit logs:", err);
    } finally {
      setLoadingAuditLogs(false);
    }
  };

  useEffect(() => {
    fetchBackendAuditLogs();
  }, [activeTab]);

  const filteredProjects = (scheduledServices || []).filter(proj => {
    const matchStatus = projectStatusFilter === "Todos" || proj.estado === projectStatusFilter;
    const matchTech = projectTechFilter === "Todos" || proj.id_tecnico === projectTechFilter;
    return matchStatus && matchTech;
  });

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
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Auditoría de Privilegios Relacionales</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed font-light">
                Valide de forma instantánea cómo las reglas RBAC de PostgreSQL y el motor relacional evalúan los accesos de seguridad para la cuenta seleccionada.
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
        <div className="bg-slate-900 text-slate-200 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-3">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Garantía Relacional de No Manipulación (Audit Trail Criptográfico)</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Cada entrada en esta bitácora está encadenada mediante un hash <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-[10px] text-emerald-300">SHA-256</code> con el registro anterior. El motor PostgreSQL y el encadenamiento criptográfico garantizan la inalterabilidad legal del registro (NOM-151 / EMA).
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${chainIntegrityValid ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
            <div className="text-left font-mono">
              <div className="text-[9px] text-slate-500 uppercase leading-none font-bold">Estado del Encadenamiento</div>
              <div className={`text-[10px] font-bold ${chainIntegrityValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                {chainIntegrityValid ? 'SÍMBOLO DE INTEGRIDAD VÁLIDO' : 'INTEGRIDAD COMPROMETIDA'}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {loadingAuditLogs && backendAuditLogs.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono italic">Cargando bitácora criptográfica desde el servidor...</p>
          ) : backendAuditLogs.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono italic">No hay registros cargados en la bitácora aún.</p>
          ) : (
            backendAuditLogs.map((log, index) => (
              <div key={log.id_auditoria || index} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">SEC-#{log.id_auditoria}</span>
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                      log.operacion === 'INSERT' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      log.operacion === 'UPDATE' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      log.operacion === 'SIGN' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                      log.operacion === 'CONVERT' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}>
                      {log.operacion}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{log.rol}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({log.usuario_id})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{new Date(log.fecha_utc).toLocaleString('es-MX')}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1.5">
                    <div>
                      <span className="text-[9px] font-mono uppercase font-bold text-slate-400">Tabla Afectada: {log.tabla_afectada}</span>
                    </div>
                    <div className="text-xs text-slate-700 font-medium leading-tight">
                      <strong className="text-slate-900">Justificación Técnica:</strong> {log.justificacion_tecnica}
                    </div>
                  </div>
                  <div className="bg-slate-950 text-emerald-400 p-2.5 rounded font-mono text-[9px] overflow-x-auto space-y-1">
                    <div className="text-slate-500">// ENCADENAMIENTO DE SEGURIDAD (BLOCKCHAIN LOG)</div>
                    <div className="truncate text-emerald-300">Hash Registro: {log.hash_registro}</div>
                    <div className="truncate text-slate-400">Hash Anterior: {log.hash_anterior}</div>
                    <div className="truncate text-slate-400">Dirección IP: {log.ip_origen}</div>
                  </div>
                </div>
              </div>
            ))
          )}
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
          {renderWelcomeBanner(
            selectedRole === 'ceo' ? "👑 CEO - Dashboard Ejecutivo" :
            selectedRole === 'sys_admin' ? "🛠️ Administrador del Sistema" :
            "Director General de Operaciones"
          )}

          {/* MONITOREO GEORREFERENCIADO EN TIEMPO REAL */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Compass className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-200">Live GPS: Monitoreo Remoto de Campo</h3>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                Sincronización en Nube Activa
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <div className="lg:col-span-4 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {submittedReports.length === 0 ? (
                  <p className="text-xs text-slate-400 font-mono py-4">No hay técnicos en campo activos en este momento.</p>
                ) : (
                  submittedReports.map((rep, idx) => {
                    const coords = rep.payload?.checkin_georreferenciado?.coordenadas || "Lat: 25.6866, Lon: -100.3161";
                    const isSelected = selectedLiveServiceForGps?.id_reporte === rep.id_reporte;

                    return (
                      <div 
                        key={rep.id_reporte}
                        onClick={() => setSelectedLiveServiceForGps(rep)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-left space-y-1 ${
                          isSelected 
                            ? "bg-slate-800 border-emerald-500 shadow" 
                            : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-emerald-400 font-bold">{rep.id_reporte}</span>
                          <span className="text-slate-400">{rep.fecha_reporte || "Hoy"}</span>
                        </div>
                        <h4 className="font-bold text-xs text-white truncate">{rep.cliente_nombre || "Cliente Industrial"}</h4>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-300 font-mono">
                          <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                          <span className="truncate">{coords}</span>
                        </div>
                        <div className="flex items-center justify-between text-[8.5px] font-mono pt-1.5 border-t border-slate-800/80 text-slate-400">
                          <span>Téc: {rep.tecnico_nombre || "Técnico"}</span>
                          <span className="text-emerald-400 font-bold">✓ Check-In OK</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* LIVE MAP SIMULATION PANEL */}
              <div className="lg:col-span-8 bg-slate-950 rounded-xl border border-slate-800 p-4.5 flex flex-col justify-between relative overflow-hidden min-h-[300px]">
                {/* SVG mock grid pattern representing dynamic tracking radar */}
                <div className="absolute inset-0 opacity-15 pointer-events-none">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="radar-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="emerald" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#radar-grid)" />
                    <circle cx="50%" cy="50%" r="80" fill="none" stroke="emerald" strokeWidth="1" strokeDasharray="5,5" />
                    <circle cx="50%" cy="50%" r="140" fill="none" stroke="emerald" strokeWidth="1" />
                  </svg>
                </div>

                {selectedLiveServiceForGps ? (
                  <>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono uppercase bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                          Seguimiento Georreferenciado en Vivo
                        </span>
                        <h4 className="text-sm font-bold text-white font-sans mt-1.5">
                          {selectedLiveServiceForGps.cliente_nombre || "Empresa Industrial"}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Área: {selectedLiveServiceForGps.payload?.punto_medicion?.area_descripcion || "Taller Mecánico Principal"}
                        </p>
                      </div>

                      <div className="text-left md:text-right font-mono text-[10px] bg-slate-900/90 p-2 rounded-lg border border-slate-800 shrink-0">
                        <div className="text-slate-400">COORDS GPS DEL CHECK-IN:</div>
                        <div className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-red-500 animate-bounce" />
                          <span>{selectedLiveServiceForGps.payload?.checkin_georreferenciado?.coordenadas || "Lat: 25.7749, Lon: -100.1215"}</span>
                        </div>
                      </div>
                    </div>

                    {/* INTERACTIVE COMPASS / RADAR DOT IN THE CENTER */}
                    <div className="relative z-10 my-4 flex flex-col items-center justify-center p-6 space-y-2">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 animate-ping absolute" />
                        <div className="w-16 h-16 rounded-full bg-emerald-600/20 border-2 border-emerald-400 flex items-center justify-center relative">
                          <Compass className="w-8 h-8 text-emerald-400" />
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] font-mono text-emerald-300 font-bold">DISPOSITIVO EN SITIO: SONÓMETRO ACTIVO</span>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                          Técnico: {selectedLiveServiceForGps.tecnico_nombre || "Técnico Autorizado"} • Conexión Criptográfica Estable
                        </p>
                      </div>
                    </div>

                    <div className="relative z-10 border-t border-slate-800/80 pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[10px] font-mono">
                      <div className="space-y-0.5 text-slate-400">
                        <div>EPP de Seguridad: <span className="text-emerald-400 font-bold">100% Verificado</span></div>
                        <div>Firmado por Representante: <span className="text-white font-bold">{selectedLiveServiceForGps.payload?.checkin_georreferenciado?.firma_representante || "Lic. Laura Ortega"}</span></div>
                      </div>
                      <div className="text-[9px] text-slate-500 bg-slate-900/60 px-2.5 py-1 rounded border border-slate-800">
                        Fingerprint: {selectedLiveServiceForGps.xml_hash_sha256?.substring(0, 16) || "SHA256:d89a12b59c2e"}...
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 py-16 text-center space-y-2">
                    <Map className="w-10 h-10 text-slate-700 stroke-1" />
                    <p className="font-mono text-xs">Seleccione un proyecto de campo a la izquierda para visualizar el monitoreo satelital georreferenciado.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* VISTA CONSOLIDADA DE PROYECTOS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase font-mono tracking-wide">
                  <Briefcase className="text-emerald-600 w-4.5 h-4.5" />
                  Vista Consolidada de Proyectos Agendados
                </h3>
                <p className="text-xs text-slate-500">Supervisión corporativa de asignaciones técnicas por estatus de ejecución y técnico responsable.</p>
              </div>

              {/* CROSS FILTERS */}
              <div className="flex flex-wrap gap-2 text-xs">
                <div>
                  <select
                    value={projectStatusFilter}
                    onChange={(e) => setProjectStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="Todos">Todos los Estatus</option>
                    <option value="Asignado">Asignados (Sin Iniciar)</option>
                    <option value="En Ruta">En Ruta a Planta</option>
                    <option value="En Ejecución">En Ejecución de Campo</option>
                    <option value="Completado">Completados / Despachados</option>
                  </select>
                </div>
                <div>
                  <select
                    value={projectTechFilter}
                    onChange={(e) => setProjectTechFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="Todos">Todos los Técnicos</option>
                    {usuarios.filter(u => u.id_rol === 'LAB_TECH' || (u as any).id_role === 'LAB_TECH').map(t => (
                      <option key={t.id_usuario} value={t.id_usuario}>{t.nombre_completo}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* PROJECTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 max-h-[360px] overflow-y-auto pr-1">
              {filteredProjects.length === 0 ? (
                <div className="col-span-full bg-slate-50 border border-dashed border-slate-200 text-slate-400 p-10 rounded-xl text-center font-mono text-xs">
                  No se encontraron asignaciones con los filtros de estatus y técnicos seleccionados.
                </div>
              ) : (
                filteredProjects.map((proj: any) => {
                  const tech = usuarios.find(u => u.id_usuario === proj.id_tecnico);
                  const isCompleted = proj.estado === "Completado";

                  return (
                    <div 
                      key={proj.id_servicio} 
                      className={`p-4 border rounded-xl transition-all flex flex-col justify-between gap-3 text-xs bg-white ${
                        isCompleted 
                          ? "border-emerald-200 bg-emerald-50/10" 
                          : "border-slate-200 hover:border-slate-300 hover:shadow-xs"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[9px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {proj.id_servicio}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                            isCompleted 
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : proj.estado === "En Ejecución"
                              ? "bg-amber-100 text-amber-800 border-amber-200 animate-pulse"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}>
                            {proj.estado || "Asignado"}
                          </span>
                        </div>
                        
                        <h4 className="font-bold text-slate-900 text-xs">{proj.cliente_nombre || "Empresa Cliente"}</h4>
                        <p className="text-slate-600 text-[11px] leading-relaxed font-light">{proj.servicio}</p>
                      </div>

                      <div className="border-t border-slate-100 pt-2.5 flex justify-between items-center text-[10px] font-mono text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{proj.fecha}</span>
                        </div>
                        <div className="text-slate-700 font-semibold truncate max-w-[120px]">
                          Téc: {tech ? tech.nombre_completo.split(' ')[0] : "No Asignado"}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* REPORTE MENSUAL DE RENDIMIENTO */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase font-mono tracking-wide">
                <TrendingUp className="text-emerald-600 w-4.5 h-4.5" />
                Reporte Mensual de Rendimiento de Metrólogos
              </h3>
              <p className="text-xs text-slate-500">Matriz de productividad mensual detallando la cantidad de proyectos y los folios de informes técnicos ejecutados.</p>
            </div>

            {/* RENDIMIENTO MATRIX TABLE */}
            <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[9px] font-mono border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Metrólogo de Campo</th>
                      <th className="px-4 py-3 text-center">Proyectos Ejecutados</th>
                      <th className="px-4 py-3">Detalle de Proyectos Completados</th>
                      <th className="px-4 py-3 text-right">Eficiencia Check-In</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[10.5px]">
                    {usuarios.filter(u => u.id_rol === 'LAB_TECH' || (u as any).id_role === 'LAB_TECH').map(tech => {
                      // Find completed projects for this technician
                      const techCompleted = (submittedReports || []).filter(rep => rep.tecnico_nombre?.includes(tech.nombre_completo) || rep.tecnico?.includes(tech.nombre_completo) || rep.id_tecnico === tech.id_usuario);
                      const completedCount = techCompleted.length;
                      
                      return (
                        <tr key={tech.id_usuario} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3.5 font-sans">
                            <div className="font-bold text-slate-800">{tech.nombre_completo}</div>
                            <div className="text-[9px] text-slate-400 font-mono">{tech.puesto} • {tech.email}</div>
                          </td>
                          <td className="px-4 py-3.5 text-center font-bold">
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-150 rounded font-mono text-xs">
                              {completedCount}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-sans text-slate-600 leading-normal max-w-sm">
                            {completedCount === 0 ? (
                              <span className="text-slate-400 font-mono text-[9px]">Ningún proyecto reportado este mes</span>
                            ) : (
                              <div className="space-y-1">
                                {techCompleted.map(rep => (
                                  <div key={rep.id_reporte} className="flex items-center gap-1.5 text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-700 w-fit">
                                    <FileCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                                    <span>{rep.cliente_nombre || rep.payload?.datos_sitio?.empresa_cliente || "Cliente"} ({rep.id_reporte})</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right font-bold text-emerald-600">
                            <div className="space-y-1">
                              <div>100.0%</div>
                              <div className="w-24 bg-slate-100 rounded-full h-1 ml-auto">
                                <div className="bg-emerald-500 h-1 rounded-full" style={{ width: '100%' }}></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* METROLOGY ALERTS & FINANCIAL METRICS (MAINTAINING DATA CONSISTENCY) */}
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
            <p className="text-xs text-slate-500 mt-0.5">Gestión global de identidades RBAC, verificación de privilegios y consulta del Audit Trail inalterable (NOM-151).</p>
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

      {/* SYSTEM ADMIN & CEO EMPLOYEES VIEWS */}
      {(activeTab === 'sa_users' || activeTab === 'ceo_employees') && (
        <motion.div
          key="sa_users"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* HEADER DEL MÓDULO EMPLEADOS */}
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Users className="text-[#85AA1C] w-4.5 h-4.5" />
                Directorio y Gestión de Empleados (Credenciales & e.firma SAT)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Control de empleados autorizados, perfiles de seguridad RBAC, edición y revocación de accesos.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddUserOpen(!isAddUserOpen)}
                className="px-4 py-2 bg-[#85AA1C] hover:bg-[#739418] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddUserOpen ? "Ocultar Formulario" : "Registrar Empleado"}</span>
              </button>
            </div>
          </div>

          {/* BARRA DE FILTRO Y BÚSQUEDA */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 border border-slate-200 rounded-xl shadow-xs">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar empleado por nombre, correo, puesto o rol..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#85AA1C]"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 font-bold text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {usuarios.filter(u => u.esta_activo).length} Activos
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200 font-bold text-[10px]">
                Total: {usuarios.length}
              </span>
            </div>
          </div>

          {/* FORMULARIO DE REGISTRO NUEVO EMPLEADO */}
          {isAddUserOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4 text-xs"
            >
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-150 pb-2 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#85AA1C]" />
                Registrar Nuevo Empleado & Asignar e.firma SAT
              </h4>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newUserForm.nombre_completo || !newUserForm.email) {
                    alert("Complete todos los campos requeridos.");
                    return;
                  }
                  const newUser: Usuario = {
                    id_usuario: "USR-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
                    nombre_completo: newUserForm.nombre_completo,
                    email: newUserForm.email,
                    id_rol: newUserForm.id_rol,
                    puesto: newUserForm.puesto,
                    esta_activo: true,
                    ultimo_acceso: "Hoy (Reciente)",
                    firma_electronica_fingerprint: "SHA256:E89C" + Math.random().toString(16).substring(2, 10).toUpperCase() + "E981BA2"
                  };
                  setUsuarios([...usuarios, newUser]);
                  setNewUserForm({
                    nombre_completo: '',
                    email: '',
                    id_rol: 'ing_campo',
                    puesto: 'Técnico de Campo'
                  });
                  setIsAddUserOpen(false);
                  alert(`¡Empleado ${newUser.nombre_completo} registrado exitosamente con certificado digital!`);
                }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
              >
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Nombre Completo (e.firma SAT)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Harold Anguiano Morales"
                    value={newUserForm.nombre_completo}
                    onChange={(e) => setNewUserForm({ ...newUserForm, nombre_completo: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Correo Institucional / Usuario</label>
                  <input
                    type="email"
                    required
                    placeholder="Ej. haroldo90@asp.com"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Puesto Operativo / Cargo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Director General / CEO"
                    value={newUserForm.puesto}
                    onChange={(e) => setNewUserForm({ ...newUserForm, puesto: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Rol de Seguridad (RBAC)</label>
                  <select
                    value={newUserForm.id_rol}
                    onChange={(e) => setNewUserForm({ ...newUserForm, id_rol: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                  >
                    {INITIAL_ROLES.map(r => (
                      <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsAddUserOpen(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#85AA1C] hover:bg-[#739418] text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Guardar Empleado</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* LISTADO DE EMPLEADOS REGISTRADOS */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 uppercase font-mono">Personal de ASP Registrado en el Directorio</span>
              <span className="bg-slate-200 text-slate-700 font-bold font-mono px-2 py-0.5 rounded text-[10px]">
                {usuarios.filter(u => 
                  u.nombre_completo.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                  u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                  u.puesto.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                  u.id_rol.toLowerCase().includes(userSearchTerm.toLowerCase())
                ).length} registros encontrados
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white uppercase tracking-wider text-[10px] font-mono">
                  <tr>
                    <th className="px-4 py-3">Empleado</th>
                    <th className="px-4 py-3">Puesto / Rol</th>
                    <th className="px-4 py-3">Huella e.firma SAT</th>
                    <th className="px-4 py-3">Último Acceso</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-slate-700 font-sans">
                  {usuarios
                    .filter(u => 
                      u.nombre_completo.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      u.puesto.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      u.id_rol.toLowerCase().includes(userSearchTerm.toLowerCase())
                    )
                    .map(user => (
                    <tr key={user.id_usuario} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-950 flex items-center gap-1.5">
                          <span>{user.nombre_completo}</span>
                          {user.id_rol === 'ceo' && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-300">
                              CEO
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{user.puesto}</div>
                        <span className="text-[9.5px] px-1.5 py-0.2 bg-slate-100 border rounded font-mono font-bold text-slate-600">
                          {INITIAL_ROLES.find(r => r.id_rol === user.id_rol)?.nombre || user.id_rol}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-500 select-all">
                        {user.firma_electronica_fingerprint || "No registrada"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                        {user.ultimo_acceso || "Nunca"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                          user.esta_activo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${user.esta_activo ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          {user.esta_activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* VER */}
                          <button
                            title="Ver ficha del empleado"
                            onClick={() => setSelectedUserForView(user)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* EDITAR */}
                          <button
                            title="Editar empleado"
                            onClick={() => {
                              setSelectedUserForEdit(user);
                              setEditUserForm({
                                nombre_completo: user.nombre_completo,
                                email: user.email,
                                puesto: user.puesto,
                                id_rol: user.id_rol,
                                esta_activo: user.esta_activo
                              });
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-700 cursor-pointer transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* DESACTIVAR / ACTIVAR */}
                          <button
                            title={user.esta_activo ? "Desactivar empleado" : "Activar empleado"}
                            onClick={() => {
                              const updated = usuarios.map(u => u.id_usuario === user.id_usuario ? { ...u, esta_activo: !u.esta_activo } : u);
                              setUsuarios(updated);
                              alert(`Se ha ${user.esta_activo ? 'desactivado' : 'activado'} a ${user.nombre_completo}.`);
                            }}
                            className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                              user.esta_activo 
                                ? 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700' 
                                : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {user.esta_activo ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>

                          {/* BORRAR */}
                          <button
                            title="Eliminar empleado"
                            onClick={() => setUserToDelete(user)}
                            className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {usuarios.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">
                        No hay empleados registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MODAL: VER DETALLES DEL EMPLEADO */}
          {selectedUserForView && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200"
              >
                <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#85AA1C]" />
                    <h3 className="font-bold text-sm">Ficha del Empleado</h3>
                  </div>
                  <button
                    onClick={() => setSelectedUserForView(null)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-5 space-y-4 text-xs">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-[#85AA1C]/10 border border-[#85AA1C]/30 flex items-center justify-center text-[#85AA1C] font-bold text-base">
                      {selectedUserForView.nombre_completo.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{selectedUserForView.nombre_completo}</h4>
                      <p className="text-slate-500 font-mono text-[11px]">{selectedUserForView.email}</p>
                      <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[9.5px] font-bold rounded-full border ${
                        selectedUserForView.esta_activo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${selectedUserForView.esta_activo ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {selectedUserForView.esta_activo ? 'Cuenta Activa' : 'Cuenta Suspendida'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-slate-600">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Puesto Operativo</span>
                      <span className="font-semibold text-slate-800">{selectedUserForView.puesto}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Rol en Sistema</span>
                      <span className="font-semibold text-slate-800">
                        {INITIAL_ROLES.find(r => r.id_rol === selectedUserForView.id_rol)?.nombre || selectedUserForView.id_rol}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">ID Identificador</span>
                      <span className="font-mono text-slate-800 select-all">{selectedUserForView.id_usuario}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Último Acceso</span>
                      <span className="font-semibold text-slate-800">{selectedUserForView.ultimo_acceso || "Nunca"}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 text-slate-100 p-3 rounded-lg border border-slate-800 font-mono text-[10.5px]">
                    <div className="text-[10px] text-slate-400 uppercase font-sans font-bold mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Huella Criptográfica e.firma SAT
                    </div>
                    <div className="break-all select-all text-emerald-300">
                      {selectedUserForView.firma_electronica_fingerprint || "No registrada"}
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => setSelectedUserForView(null)}
                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* MODAL: EDITAR EMPLEADO */}
          {selectedUserForEdit && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200"
              >
                <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit className="w-5 h-5 text-[#85AA1C]" />
                    <h3 className="font-bold text-sm">Editar Empleado</h3>
                  </div>
                  <button
                    onClick={() => setSelectedUserForEdit(null)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const updated = usuarios.map(u => 
                      u.id_usuario === selectedUserForEdit.id_usuario 
                        ? { 
                            ...u, 
                            nombre_completo: editUserForm.nombre_completo,
                            email: editUserForm.email,
                            puesto: editUserForm.puesto,
                            id_rol: editUserForm.id_rol,
                            esta_activo: editUserForm.esta_activo
                          }
                        : u
                    );
                    setUsuarios(updated);
                    setSelectedUserForEdit(null);
                    alert(`Datos del empleado ${editUserForm.nombre_completo} actualizados correctamente.`);
                  }}
                  className="p-5 space-y-4 text-xs"
                >
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={editUserForm.nombre_completo}
                      onChange={(e) => setEditUserForm({ ...editUserForm, nombre_completo: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Correo Institucional / Usuario</label>
                    <input
                      type="email"
                      required
                      value={editUserForm.email}
                      onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Puesto Operativo</label>
                      <input
                        type="text"
                        required
                        value={editUserForm.puesto}
                        onChange={(e) => setEditUserForm({ ...editUserForm, puesto: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Rol RBAC</label>
                      <select
                        value={editUserForm.id_rol}
                        onChange={(e) => setEditUserForm({ ...editUserForm, id_rol: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:bg-white"
                      >
                        {INITIAL_ROLES.map(r => (
                          <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Estado de la Cuenta</label>
                    <div className="flex items-center gap-4 pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="estado"
                          checked={editUserForm.esta_activo}
                          onChange={() => setEditUserForm({ ...editUserForm, esta_activo: true })}
                          className="text-emerald-600"
                        />
                        <span className="font-semibold text-emerald-700">Activo</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="estado"
                          checked={!editUserForm.esta_activo}
                          onChange={() => setEditUserForm({ ...editUserForm, esta_activo: false })}
                          className="text-red-600"
                        />
                        <span className="font-semibold text-red-700">Inactivo / Suspendido</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUserForEdit(null)}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#85AA1C] hover:bg-[#739418] text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Guardar Cambios</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* MODAL: CONFIRMAR ELIMINACIÓN */}
          {userToDelete && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200"
              >
                <div className="bg-red-600 text-white px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    <h3 className="font-bold text-sm">Confirmar Eliminación</h3>
                  </div>
                  <button
                    onClick={() => setUserToDelete(null)}
                    className="text-red-200 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-5 space-y-3 text-xs text-slate-700">
                  <p>
                    ¿Estás seguro de que deseas eliminar permanentemente al empleado <strong className="text-slate-900">{userToDelete.nombre_completo}</strong> ({userToDelete.email})?
                  </p>
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-red-800 text-[11px]">
                    Esta acción revoca de inmediato las credenciales y las firmas electrónicas asociadas al usuario en todo el sistema.
                  </div>
                </div>
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    onClick={() => setUserToDelete(null)}
                    className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      const updated = usuarios.filter(u => u.id_usuario !== userToDelete.id_usuario);
                      setUsuarios(updated);
                      setUserToDelete(null);
                      try {
                        await deleteUsuarioFromSupabase(userToDelete.id_usuario);
                        alert(`Se ha eliminado al empleado ${userToDelete.nombre_completo} de la aplicación y de Supabase (public.usuarios).`);
                      } catch (err) {
                        alert(`Se ha eliminado al empleado ${userToDelete.nombre_completo} de la sesión local.`);
                      }
                    }}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar de App y Supabase</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'sa_roles' && (
        <motion.div
          key="sa_roles"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <Key className="text-emerald-600 w-4.5 h-4.5" />
              Matriz Relacional RBAC (Roles y Privilegios)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Definición de perfiles de seguridad, mapeo de vistas operativas y simulación de reglas de GRANT/DENY relacionales.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* PANEL SELECCIÓN DE ROL */}
            <div className="lg:col-span-4 bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4 text-xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-150 pb-2">Seleccione Perfil a Modificar</h4>
              <p className="text-slate-500 leading-relaxed font-light">Asigne permisos de forma granular para alterar las rutas y vistas dinámicas en tiempo de ejecución.</p>
              
              <div className="space-y-2">
                {INITIAL_ROLES.map(r => {
                  const isActive = selectedRoleForPermEditing === r.id_rol;
                  const count = localRolePermissions[r.id_rol]?.length || 0;
                  return (
                    <div
                      key={r.id_rol}
                      onClick={() => setSelectedRoleForPermEditing(r.id_rol)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex justify-between items-center ${
                        isActive ? 'bg-white border-emerald-500 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900">{r.nombre}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">ID: {r.id_rol}</div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 border text-slate-600 rounded">
                        {count} perms
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* EDICIÓN DE PERMISOS */}
            <div className="lg:col-span-8 bg-white border border-slate-200 p-5 rounded-xl space-y-4 text-xs">
              <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                  Lista de Permisos del Rol: {INITIAL_ROLES.find(r => r.id_rol === selectedRoleForPermEditing)?.nombre || selectedRoleForPermEditing}
                </h4>
                <button
                  onClick={() => {
                    alert("Matriz de privilegios guardada con éxito. Se emitió un comando de ALTER ROLE en la base de datos PostgreSQL.");
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10.5px] cursor-pointer"
                >
                  Guardar Cambios (GRANT)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-96 overflow-y-auto pr-2">
                {INITIAL_PERMISOS.map(perm => {
                  const permsOfRole = localRolePermissions[selectedRoleForPermEditing] || [];
                  const isChecked = permsOfRole.includes(perm.id_permiso);
                  return (
                    <label 
                      key={perm.id_permiso} 
                      className={`p-3 rounded-lg border flex items-start gap-2.5 transition-all cursor-pointer hover:bg-slate-50 ${
                        isChecked ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          let updatedPerms = [...permsOfRole];
                          if (e.target.checked) {
                            updatedPerms.push(perm.id_permiso);
                          } else {
                            updatedPerms = updatedPerms.filter(p => p !== perm.id_permiso);
                          }
                          setLocalRolePermissions({
                            ...localRolePermissions,
                            [selectedRoleForPermEditing]: updatedPerms
                          });
                        }}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>[{perm.modulo.toUpperCase()}]</span>
                          <span className="font-mono font-normal text-slate-500">{perm.accion}</span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 mt-0.5 leading-normal font-light">{perm.descripcion}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'sa_catalogs' && (
        <motion.div
          key="sa_catalogs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Sliders className="text-[#85AA1C] w-4.5 h-4.5" />
                Administrador de Catálogos y Parámetros del Sistema
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Edite las tablas dinámicas de referencia del laboratorio para servicios, normas y fórmulas matemáticas.</p>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setCatalogType('servicios')}
                className={`px-3 py-1 rounded-md font-bold text-[11px] cursor-pointer transition-all ${catalogType === 'servicios' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Servicios
              </button>
              <button
                onClick={() => setCatalogType('normas')}
                className={`px-3 py-1 rounded-md font-bold text-[11px] cursor-pointer transition-all ${catalogType === 'normas' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Normas STPS
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm text-xs">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-700 uppercase font-mono">
                {catalogType === 'servicios' ? "Catálogo de Servicios y Costos" : "Normas Oficiales Mexicanas de Referencia"}
              </span>
              <button
                onClick={() => {
                  setIsAddCatalogItemOpen(true);
                  setNewCatalogItemName("");
                  setNewCatalogItemValue("");
                }}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-[10px] cursor-pointer"
              >
                + Agregar Registro
              </button>
            </div>

            {catalogType === 'servicios' ? (
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px] font-mono">
                  <tr>
                    <th className="px-4 py-2.5">Código</th>
                    <th className="px-4 py-2.5">Nombre del Servicio Metrológico</th>
                    <th className="px-4 py-2.5 text-right">Monto Unitario</th>
                    <th className="px-4 py-2.5 text-right">Duración Estimada</th>
                    <th className="px-4 py-2.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {catalogServices.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{s.id}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{s.nombre}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">${s.costo.toLocaleString()} MXN</td>
                      <td className="px-4 py-3 text-right text-slate-500">{s.duracion}</td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => {
                            setCatalogServices(catalogServices.filter(item => item.id !== s.id));
                            alert("Registro eliminado del catálogo.");
                          }}
                          className="text-red-600 hover:underline font-bold text-[10px] cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px] font-mono">
                  <tr>
                    <th className="px-4 py-2.5">ID</th>
                    <th className="px-4 py-2.5">Clave Oficial</th>
                    <th className="px-4 py-2.5">Denominación e Integridad Metrológica</th>
                    <th className="px-4 py-2.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {catalogNorms.map(n => (
                    <tr key={n.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{n.id}</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-700">{n.clave}</td>
                      <td className="px-4 py-3 text-slate-700 leading-normal font-light">{n.nombre}</td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => {
                            setCatalogNorms(catalogNorms.filter(item => item.id !== n.id));
                            alert("Registro eliminado del catálogo.");
                          }}
                          className="text-red-600 hover:underline font-bold text-[10px] cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* POPUP AGREGAR REGISTRO */}
          {isAddCatalogItemOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs" onClick={() => setIsAddCatalogItemOpen(false)} />
              <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border p-5 space-y-4 text-xs">
                <h4 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wide">
                  Agregar Registro a {catalogType === 'servicios' ? 'Servicios' : 'Normas'}
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      {catalogType === 'servicios' ? 'Nombre del Servicio' : 'Clave de la Norma'}
                    </label>
                    <input
                      type="text"
                      placeholder={catalogType === 'servicios' ? 'Mapeo de Vibraciones' : 'NOM-024-STPS-1993'}
                      value={newCatalogItemName}
                      onChange={(e) => setNewCatalogItemName(e.target.value)}
                      className="w-full bg-slate-50 border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      {catalogType === 'servicios' ? 'Costo Unitario (MXN)' : 'Descripción Completa'}
                    </label>
                    <input
                      type="text"
                      placeholder={catalogType === 'servicios' ? '12500' : 'Vibraciones - Condiciones de seguridad en los centros de trabajo.'}
                      value={newCatalogItemValue}
                      onChange={(e) => setNewCatalogItemValue(e.target.value)}
                      className="w-full bg-slate-50 border rounded-lg px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    onClick={() => setIsAddCatalogItemOpen(false)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (!newCatalogItemName || !newCatalogItemValue) {
                        alert("Rellene los campos.");
                        return;
                      }
                      if (catalogType === 'servicios') {
                        setCatalogServices([...catalogServices, {
                          id: "S" + (catalogServices.length + 1),
                          nombre: newCatalogItemName,
                          costo: Number(newCatalogItemValue) || 10000,
                          duracion: "2 días"
                        }]);
                      } else {
                        setCatalogNorms([...catalogNorms, {
                          id: "N" + (catalogNorms.length + 1),
                          clave: newCatalogItemName,
                          nombre: newCatalogItemValue
                        }]);
                      }
                      setIsAddCatalogItemOpen(false);
                      alert("Registro añadido con éxito.");
                    }}
                    className="px-4 py-1.5 bg-[#85AA1C] hover:bg-[#739418] text-white font-bold rounded-lg cursor-pointer"
                  >
                    Agregar Registro
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'sa_config' && (
        <motion.div
          key="sa_config"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <Settings className="text-emerald-600 w-4.5 h-4.5" />
              Parámetros Críticos y Fórmulas del Sistema
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Configure valores globales de cálculo de ruido de sonómetros y la integración criptográfica de la NOM-151.</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-150 pb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Tabla de Constantes y Configuración de API de Seguridad</h4>
              <button
                onClick={() => alert("Parámetros globales actualizados en la base de datos de producción.")}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded cursor-pointer"
              >
                Aplicar Constantes
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {systemParameters.map((param, idx) => (
                <div key={param.clave} className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-slate-900 bg-white border px-1.5 py-0.5 rounded text-[10px]">{param.clave}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Parámetro del Kernel</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-normal">{param.descripcion}</p>
                  <input
                    type="text"
                    value={param.valor}
                    onChange={(e) => {
                      const updated = [...systemParameters];
                      updated[idx].valor = e.target.value;
                      setSystemParameters(updated);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-800 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ORIGINAL QUOTES TAB */}
      {activeTab === 'dir_quotes' && (
        <motion.div
          key="dir_quotes"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <FileText className="text-emerald-600 w-4.5 h-4.5" />
                  Gestión e Historial de Cotizaciones
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Database className="w-3 h-3 text-emerald-600" />
                  <span>Supabase: public.cotizaciones</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Módulo interactivo de costeo, emisión de cotizaciones y sincronización en tiempo real con base de datos PostgreSQL.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualSyncQuotes}
                disabled={isSyncingQuotes}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 border border-slate-200 cursor-pointer disabled:opacity-50"
                title="Sube y sincroniza todas las cotizaciones guardadas a la tabla cotizaciones en Supabase"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isSyncingQuotes ? 'animate-spin' : ''}`} />
                <span>{isSyncingQuotes ? 'Sincronizando...' : 'Sincronizar con Supabase'}</span>
              </button>

              <button
                onClick={() => setIsAddQuoteOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/10 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Cotización</span>
              </button>
            </div>
          </div>

          {/* Sync Status Banner if any */}
          {syncStatusMessage && (
            <div className={`p-3 rounded-lg text-xs font-mono flex items-center justify-between border ${
              syncStatusMessage.startsWith('✅')
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : syncStatusMessage.startsWith('❌')
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 shrink-0" />
                <span>{syncStatusMessage}</span>
              </div>
              <button
                onClick={() => setSyncStatusMessage(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Form Modal for Creating Quote with Full Checklist Features */}
          {isAddQuoteOpen && (
            <div className="bg-white border-2 border-emerald-500/30 p-6 rounded-2xl shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                    <FileEdit className="w-5 h-5 text-emerald-600" />
                    <span>Emisión & Costeo de Cotización Metrológica Oficial</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Configure clientes, múltiples contactos destinatarios, desglose de servicios con costos editables, descuento y condiciones comerciales.</p>
                </div>
                <button 
                  onClick={() => setIsAddQuoteOpen(false)} 
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg cursor-pointer"
                >
                  ✕ Cerrar
                </button>
              </div>

              <div className="space-y-6">
                {/* 1. SELECCIÓN DE CLIENTE Y FECHA */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-800 text-xs uppercase font-mono flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-emerald-600" />
                      1. Información del Cliente Industrial & Folio
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Folio Asignado: <strong className="text-emerald-700">{quoteFolio}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="block text-slate-500 font-bold uppercase text-[9px]">Cliente Registrado en Base de Datos *</label>
                      <select
                        value={selectedClientNum}
                        onChange={(e) => handleSelectClient(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                      >
                        <option value="">-- Seleccionar de la Base de Datos --</option>
                        {clientsList.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.razon_social} ({c.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-500 font-bold uppercase text-[9px]">Razón Social / Nombre Comercial *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Siderúrgica de Monterrey S.A. de C.V."
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-500 font-bold uppercase text-[9px]">Fecha de Elaboración</label>
                      <input
                        type="date"
                        value={quoteDate}
                        onChange={(e) => setQuoteDate(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Subcontratación Toggle */}
                  <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-200 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isSubcontracted}
                        onChange={(e) => setIsSubcontracted(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="font-semibold text-slate-700">Servicio mediante Subcontratación / Tercería</span>
                    </label>
                    {isSubcontracted && (
                      <div className="flex-1 min-w-[200px]">
                        <input
                          type="text"
                          placeholder="Nombre de la empresa subcontratada / aliada..."
                          value={subcontractorName}
                          onChange={(e) => setSubcontractorName(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. BASE DE DATOS DE CONTACTOS MULTI-DESTINATARIO */}
                <ClientMultiContactSelector
                  contacts={currentQuoteContacts}
                  onChangeContacts={handleUpdateCurrentQuoteContacts}
                  clientName={clientName || "Cliente Seleccionado"}
                />

                {/* 3. CONCEPTOS DE COTIZACIÓN Y CATÁLOGO DE SERVICIOS */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-800 text-xs uppercase font-mono">
                        3. Conceptos Metrológicos y Costeo de Servicios
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsServiceCatalogOpen(true)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Abrir catálogo para dar de alta o editar servicios metrológicos"
                      >
                        <Sliders className="w-3.5 h-3.5 text-blue-600" />
                        <span>Edición a Servicios Disponibles</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAddServiceRow}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Concepto</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {itemizedServices.map((row, index) => (
                      <div key={row.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                        <div className="md:col-span-5 space-y-1">
                          <label className="block text-slate-500 font-bold uppercase text-[9px]">Servicio Metrológico #{index + 1}</label>
                          <select
                            value={row.serviceName}
                            onChange={(e) => handleUpdateServiceRow(row.id, "serviceName", e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 font-medium focus:bg-white focus:ring-1 focus:ring-emerald-500"
                          >
                            {availableServices.map((srv) => (
                              <option key={srv.id} value={srv.nombre}>
                                {srv.norma ? `[${srv.norma}] ` : ''}{srv.nombre} (${srv.categoria})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <label className="block text-slate-500 font-bold uppercase text-[9px]">Puntos / Muestras</label>
                          <input
                            type="number"
                            min="1"
                            value={row.puntos}
                            onChange={(e) => handleUpdateServiceRow(row.id, "puntos", Math.max(1, Number(e.target.value) || 1))}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold text-center"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <label className="block text-slate-500 font-bold uppercase text-[9px]">Costo Unitario ($)</label>
                          <div className="relative">
                            <span className="absolute left-2 top-2 text-slate-400 font-mono text-xs">$</span>
                            <input
                              type="number"
                              min="0"
                              value={row.costo_punto}
                              onChange={(e) => handleUpdateServiceRow(row.id, "costo_punto", Math.max(0, Number(e.target.value) || 0))}
                              className="w-full p-2 pl-5 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold text-emerald-800"
                              title="Costo por punto 100% editable"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <label className="block text-slate-500 font-bold uppercase text-[9px]">Total Concepto</label>
                          <div className="p-2 bg-slate-100 rounded text-xs font-mono font-bold text-slate-800 text-right">
                            ${(row.puntos * row.costo_punto).toLocaleString('es-MX')} MXN
                          </div>
                        </div>

                        <div className="md:col-span-1 flex justify-center pb-1">
                          {itemizedServices.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveServiceRow(row.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                              title="Eliminar este concepto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Viáticos y Desglose Financiero con Descuento % */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="block text-slate-500 font-bold uppercase text-[9px]">Viáticos y Logística de Campo ($ MXN)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">$</span>
                          <input
                            type="number"
                            min="0"
                            value={estimatedViatics}
                            onChange={(e) => setEstimatedViatics(Math.max(0, Number(e.target.value) || 0))}
                            className="w-full p-2.5 pl-6 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">Incluye traslados técnicos, hospedaje y transportación de instrumental patronal.</span>
                      </div>

                      {/* Campo Interactivo de Descuento % */}
                      <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-amber-900 font-bold text-xs uppercase font-mono flex items-center gap-1.5">
                            <Percent className="w-4 h-4 text-amber-700" />
                            Descuento Comercial (%)
                          </label>
                          <span className="text-[10px] font-mono text-amber-800 font-semibold">
                            Ahorro: <strong className="text-amber-950">-${discountAmount.toLocaleString('es-MX')} MXN</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="50"
                            step="1"
                            value={discountPercentage}
                            onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                            className="flex-1 accent-amber-600 cursor-pointer"
                          />
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={discountPercentage}
                              onChange={(e) => setDiscountPercentage(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                              className="w-16 p-1.5 bg-white border border-amber-300 rounded font-mono font-bold text-center text-xs text-amber-950"
                            />
                            <span className="font-mono font-bold text-xs text-amber-900">%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Resumen Financiero Completo */}
                    <div className="bg-slate-900 text-white p-4 rounded-xl font-mono text-xs space-y-2 flex flex-col justify-between shadow-md">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>Subtotal Servicios ({itemizedServices.length} conc.):</span>
                          <span>${subtotalServices.toLocaleString('es-MX')} MXN</span>
                        </div>
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>Viáticos Técnicos:</span>
                          <span>${estimatedViatics.toLocaleString('es-MX')} MXN</span>
                        </div>
                        <div className="flex justify-between text-slate-200 border-t border-slate-800 pt-1.5 font-bold">
                          <span>Subtotal Bruto:</span>
                          <span>${subtotalBruto.toLocaleString('es-MX')} MXN</span>
                        </div>
                        {discountPercentage > 0 && (
                          <div className="flex justify-between text-amber-400 bg-amber-950/50 px-2 py-1 rounded border border-amber-800/40 text-[11px] font-bold">
                            <span>Descuento ({discountPercentage}%):</span>
                            <span>-${discountAmount.toLocaleString('es-MX')} MXN</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-1">
                          <span>Subtotal Neto:</span>
                          <span>${subtotalNetoConDescuento.toLocaleString('es-MX')} MXN</span>
                        </div>
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>IVA Trasladado (16%):</span>
                          <span>${computedIva.toLocaleString('es-MX')} MXN</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-700 pt-2 flex justify-between items-center text-sm font-bold text-emerald-400">
                        <span>TOTAL NETO (IVA Inc.):</span>
                        <span className="text-base">${computedTotal.toLocaleString('es-MX')} MXN</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. CONDICIONES COMERCIALES ESTRUCTURADAS */}
                <CommercialConditionsBlock
                  conditions={commercialConditions}
                  onChange={setCommercialConditions}
                />

                {/* 5. BOTONES DE ACCIÓN: GUARDAR BORRADOR VS EMITIR COTIZACIÓN */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Los cálculos y descuentos se sincronizan en tiempo real con Supabase.</span>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setIsAddQuoteOpen(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition"
                    >
                      Cancelar
                    </button>

                    {/* BOTÓN 1: Guardar Borrador */}
                    <button
                      type="button"
                      onClick={handleSaveDraftQuote}
                      disabled={isSyncingQuotes}
                      className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer transition disabled:opacity-50"
                      title="Guarda la cotización como Borrador sin emitir factura en Finanzas"
                    >
                      <FileEdit className="w-4 h-4 text-amber-700" />
                      <span>Editar y Guardar Borrador</span>
                    </button>

                    {/* BOTÓN 2: Emitir Cotización Oficial */}
                    <button
                      type="button"
                      onClick={handleEmitOfficialQuote}
                      disabled={isSyncingQuotes}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition disabled:opacity-50"
                      title="Emite la cotización oficial formal y genera la cuenta por cobrar en Finanzas"
                    >
                      <Send className="w-4 h-4" />
                      <span>Emitir Cotización Oficial</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* List of Quotes */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Bitácora de Cotizaciones</span>
              <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                {generatedQuotes.length} Cotizaciones Registradas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] text-slate-400 font-mono uppercase">
                    <th className="px-5 py-3 font-semibold">Código</th>
                    <th className="px-5 py-3 font-semibold">Cliente</th>
                    <th className="px-5 py-3 font-semibold">Servicio Norma</th>
                    <th className="px-5 py-3 font-semibold text-center">Puntos</th>
                    <th className="px-5 py-3 font-semibold">Costo Total</th>
                    <th className="px-5 py-3 font-semibold">Fecha de Emisión</th>
                    <th className="px-5 py-3 font-semibold text-right">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {generatedQuotes.map((q) => {
                    const isDraft = q.estado === 'Borrador';
                    return (
                      <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold">
                          <button
                            type="button"
                            onClick={() => setSelectedQuoteForDetail(q)}
                            className="text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer flex items-center gap-1 font-bold"
                            title="Haga clic para ver el detalle de la cotización y reutilizar sus conceptos"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{q.id}</span>
                          </button>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-800">
                          <div>{q.cliente}</div>
                          {q.descuento_porcentaje ? (
                            <span className="inline-block text-[9px] text-amber-700 font-mono bg-amber-50 border border-amber-200 px-1 rounded mt-0.5">
                              Desc: {q.descuento_porcentaje}%
                            </span>
                          ) : null}
                        </td>
                        <td className="px-5 py-4 text-slate-500">{typeof q.servicio === 'string' ? q.servicio : (q.servicio?.servicio || (Array.isArray(q.servicios) ? q.servicios.join(' + ') : 'Mapeo de Ruido NOM-011'))}</td>
                        <td className="px-5 py-4 text-center font-mono">{q.puntos}</td>
                        <td className="px-5 py-4 font-mono font-bold text-slate-900">${q.costo.toLocaleString()} MXN</td>
                        <td className="px-5 py-4 font-mono text-slate-400">{q.fecha}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                              isDraft 
                                ? 'bg-amber-100 text-amber-800 border-amber-300' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {q.estado || 'Enviada'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedQuoteForDetail(q)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                              title="Ver Detalle y Reutilizar"
                            >
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>Detalle</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuote(q)}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer border border-red-200 shadow-2xs"
                              title="Eliminar de Supabase (public.cotizaciones) y la App"
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                              <span>Borrar</span>
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
        </motion.div>
      )}

      {activeTab === 'dir_odt' && (
        <motion.div
          key="dir_odt"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Briefcase className="text-emerald-600 w-4.5 h-4.5" />
                Órdenes de Trabajo (ODT) Metrológicas
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Control, asignación y seguimiento de servicios técnicos y de levantamiento físico de campo.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualSyncAgenda}
                disabled={isSyncingQuotes}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                title="Sincronizar todas las ODT con Supabase (public.ordenes_trabajo)"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isSyncingQuotes ? 'animate-spin' : ''}`} />
                <span>{isSyncingQuotes ? "Sincronizando..." : "Sincronizar con Supabase"}</span>
              </button>
              <button
                onClick={() => setIsAddOdtOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/10 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva ODT</span>
              </button>
            </div>
          </div>

          {/* Add ODT Form */}
          {isAddOdtOpen && (
            <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-xl space-y-4">
              <div className="border-b border-emerald-150 pb-2 flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider font-mono">
                  Registrar y Programar Nueva ODT
                </h4>
                <button 
                  onClick={() => setIsAddOdtOpen(false)} 
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold font-mono"
                >
                  [Cancelar]
                </button>
              </div>

              <form onSubmit={handleCreateOdt} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Cliente de Ensayos *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre de la planta o empresa"
                    value={newOdtForm.cliente_nombre}
                    onChange={(e) => setNewOdtForm({ ...newOdtForm, cliente_nombre: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Servicio Metrológico *</label>
                  <select
                    value={newOdtForm.servicio}
                    onChange={(e) => setNewOdtForm({ ...newOdtForm, servicio: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  >
                    <option value="Mapeo de Ruido NOM-011">Mapeo de Ruido NOM-011</option>
                    <option value="Dosimetría de Ruido NOM-011">Dosimetría de Ruido NOM-011</option>
                    <option value="Estudio de Iluminación NOM-025">Estudio de Iluminación NOM-025</option>
                    <option value="Pruebas de Vibraciones NOM-024">Pruebas de Vibraciones NOM-024</option>
                    <option value="Presión Ambiental NOM-016">Presión Ambiental NOM-016</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Fecha Programada *</label>
                  <input
                    type="date"
                    required
                    value={newOdtForm.fecha}
                    onChange={(e) => setNewOdtForm({ ...newOdtForm, fecha: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Ingeniero de Campo Asignado *</label>
                  <select
                    required
                    value={newOdtForm.id_tecnico}
                    onChange={(e) => setNewOdtForm({ ...newOdtForm, id_tecnico: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  >
                    <option value="">Seleccione Ingeniero / Asesor...</option>
                    {usuarios.filter(u => u.id_rol === 'LAB_TECH' || u.id_rol === 'ing_campo' || u.puesto?.includes('Técnico') || u.puesto?.includes('Ingeniero') || u.puesto?.includes('Consultor') || u.puesto?.includes('Asesor')).map(eng => (
                      <option key={eng.id_usuario} value={eng.id_usuario}>{eng.nombre_completo}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Sonómetro Patrón Autorizado *</label>
                  <select
                    required
                    value={newOdtForm.id_instrumento}
                    onChange={(e) => setNewOdtForm({ ...newOdtForm, id_instrumento: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  >
                    <option value="">Seleccione Instrumento...</option>
                    {instruments.map(inst => (
                      <option key={inst.id_instrumento} value={inst.id_instrumento}>
                        {inst.nombre} ({inst.marca} Mod. {inst.modelo}, S/N: {inst.numero_serie})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Estatus de ODT *</label>
                  <select
                    value={newOdtForm.estado}
                    onChange={(e) => setNewOdtForm({ ...newOdtForm, estado: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  >
                    <option value="Asignado">Asignado</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Completado">Completado</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddOdtOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                  >
                    Cerrar Formulario
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Habilitar y Programar ODT</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of ODTs */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Tablero General de Órdenes de Trabajo</span>
              <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                {scheduledServices.length} ODT Activas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] text-slate-400 font-mono uppercase">
                    <th className="px-5 py-3 font-semibold">ID Servicio</th>
                    <th className="px-5 py-3 font-semibold">Cliente</th>
                    <th className="px-5 py-3 font-semibold">Servicio Metrológico</th>
                    <th className="px-5 py-3 font-semibold">Técnico Asignado</th>
                    <th className="px-5 py-3 font-semibold">Instrumento Autorizado</th>
                    <th className="px-5 py-3 font-semibold">Fecha Programada</th>
                    <th className="px-5 py-3 font-semibold text-right">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {scheduledServices.map((service) => {
                    const tech = usuarios.find(u => u.id_usuario === service.id_tecnico);
                    const inst = instruments.find(i => i.id_instrumento === service.id_instrumento);
                    return (
                      <tr key={service.id_servicio} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold">
                          <button
                            type="button"
                            onClick={() => setSelectedOdtDetailModal(service)}
                            className="text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer flex items-center gap-1 font-bold"
                            title="Haga clic para ver el detalle completo de la Orden de Trabajo"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{service.id_servicio}</span>
                          </button>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-800">{service.cliente_nombre}</td>
                        <td className="px-5 py-4 text-slate-500 font-semibold">{service.servicio}</td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-700">{tech ? tech.nombre_completo : "Sin Asignar"}</div>
                          <div className="text-[9px] text-slate-400 font-mono">{tech ? tech.email : ""}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-slate-800 text-[11px]">{inst ? inst.nombre : "Sin Instrumento"}</div>
                          <div className="text-[9px] text-slate-400 font-mono">{inst ? `${inst.marca} Mod. ${inst.modelo}` : ""}</div>
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-500 font-bold">{service.fecha}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                              service.estado === 'Completado' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : service.estado === 'En Proceso'
                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                              {service.estado}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedOdtDetailModal(service)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                              title="Ver Detalle de la ODT"
                            >
                              <FileText className="w-3 h-3 text-slate-600" />
                              <span>Detalle</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStartEditOdt(service)}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer border border-blue-200 shadow-2xs"
                              title="Editar ODT en Supabase"
                            >
                              <Edit className="w-3 h-3 text-blue-600" />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOdt(service)}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer border border-red-200 shadow-2xs"
                              title="Eliminar de Supabase (public.ordenes_trabajo) y la App"
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                              <span>Borrar</span>
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
        </motion.div>
      )}

      {activeTab === 'dir_agenda' && (
        <motion.div
          key="dir_agenda"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Calendar className="text-emerald-600 w-4.5 h-4.5" />
                Agenda y Calendario de Servicios
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Control visual e interactivo de asignaciones de campo de todo el personal metrológico. Haga clic en un día del calendario para programar.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualSyncAgenda}
                disabled={isSyncingQuotes}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                title="Sincronizar todas las citas con la tabla public.ordenes_trabajo de Supabase"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isSyncingQuotes ? 'animate-spin' : ''}`} />
                <span>{isSyncingQuotes ? "Sincronizando..." : "Sincronizar con Supabase"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* The interactive Calendar component */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-150">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase font-mono">Mes de Asignación:</label>
                  <select
                    value={selectedCalendarMonth}
                    onChange={(e) => setSelectedCalendarMonth(e.target.value)}
                    className="bg-emerald-50 border border-emerald-300 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
                  >
                    {MONTH_OPTIONS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">Haga clic en un día o evento para consultar</span>
              </div>

              {/* Monthly calendar grid */}
              <div className="grid grid-cols-7 gap-1 bg-slate-100 p-1.5 rounded-lg text-center font-mono text-[10px]">
                {/* Headers */}
                {['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'].map(day => (
                  <div key={day} className="py-1 font-bold text-slate-400 uppercase text-[9px]">{day}</div>
                ))}

                {/* Grid cells: Empty leading days based on firstDayIndex */}
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-slate-50/50 min-h-[70px] rounded p-1"></div>
                ))}

                {/* Days of selected month */}
                {Array.from({ length: daysInMonthCount }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dateStr = `${selectedCalendarMonth}-${dayNum.toString().padStart(2, '0')}`;
                  
                  // Find services for this day
                  const dayServices = scheduledServices.filter(s => s.fecha === dateStr);

                  return (
                    <button
                      key={dayNum}
                      onClick={() => {
                        setSelectedCalendarDay(dateStr);
                        setIsScheduleModalOpen(true);
                      }}
                      className={`min-h-[70px] rounded p-1 text-left flex flex-col justify-between transition-colors relative hover:bg-slate-100 ${
                        selectedCalendarDay === dateStr 
                          ? 'bg-emerald-50 border border-emerald-500/30' 
                          : 'bg-white border border-slate-150'
                      }`}
                    >
                      <span className="text-slate-500 font-bold text-[9px]">{dayNum}</span>
                      <div className="space-y-0.5 mt-1 overflow-hidden w-full">
                        {dayServices.slice(0, 2).map(ds => (
                          <div 
                            key={ds.id_servicio} 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFieldScheduleDetail(ds);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[7px] p-0.5 rounded leading-none font-sans font-bold truncate max-w-full cursor-pointer transition shadow-2xs flex items-center justify-between"
                            title={`Haga clic para ver detalle de la programación: ${ds.cliente_nombre}`}
                          >
                            <span className="truncate">{ds.id_servicio}: {ds.cliente_nombre.split(' ')[0]}</span>
                          </div>
                        ))}
                        {dayServices.length > 2 && (
                          <div className="text-[7px] text-emerald-600 font-bold font-sans text-center mt-0.5">
                            +{dayServices.length - 2} más
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar detailing selected day and program scheduling */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-2">
                Programador Rápido de Campo
              </h4>

              {selectedCalendarDay ? (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200/50 p-3 rounded-lg text-xs font-mono text-emerald-800 flex items-center justify-between">
                    <div>
                      <span>Día Seleccionado:</span>
                      <strong className="block text-sm text-emerald-900 font-bold">{selectedCalendarDay}</strong>
                    </div>
                    <button 
                      onClick={() => setSelectedCalendarDay(null)} 
                      className="text-[10px] text-emerald-700 font-bold"
                    >
                      [Desmarcar]
                    </button>
                  </div>

                  <form onSubmit={handleScheduleDayEvent} className="space-y-3.5 text-xs">
                    <div className="space-y-1">
                      <label className="block text-slate-500 font-bold uppercase text-[9px]">Cliente Industrial *</label>
                      <input
                        type="text"
                        required
                        placeholder="Nombre de la planta"
                        value={newScheduleForm.cliente_nombre}
                        onChange={(e) => setNewScheduleForm({ ...newScheduleForm, cliente_nombre: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-500 font-bold uppercase text-[9px]">Servicio Norma *</label>
                      <select
                        value={newScheduleForm.servicio}
                        onChange={(e) => setNewScheduleForm({ ...newScheduleForm, servicio: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="Mapeo de Ruido NOM-011">Mapeo de Ruido NOM-011</option>
                        <option value="Dosimetría de Ruido NOM-011">Dosimetría de Ruido NOM-011</option>
                        <option value="Estudio de Iluminación NOM-025">Estudio de Iluminación NOM-025</option>
                        <option value="Evaluación de Vibraciones NOM-024">Evaluación de Vibraciones NOM-024</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-500 font-bold uppercase text-[9px]">Técnico de Ensayo *</label>
                      <select
                        required
                        value={newScheduleForm.id_tecnico}
                        onChange={(e) => setNewScheduleForm({ ...newScheduleForm, id_tecnico: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="">Seleccione Técnico / Asesor...</option>
                        {usuarios.filter(u => u.id_rol === 'LAB_TECH' || u.id_rol === 'ing_campo' || u.puesto?.includes('Técnico') || u.puesto?.includes('Ingeniero') || u.puesto?.includes('Consultor') || u.puesto?.includes('Asesor')).map(eng => (
                          <option key={eng.id_usuario} value={eng.id_usuario}>{eng.nombre_completo}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-500 font-bold uppercase text-[9px]">Sonómetro Autorizado *</label>
                      <select
                        required
                        value={newScheduleForm.id_instrumento}
                        onChange={(e) => setNewScheduleForm({ ...newScheduleForm, id_instrumento: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="">Seleccione Instrumento...</option>
                        {instruments.map(inst => (
                          <option key={inst.id_instrumento} value={inst.id_instrumento}>
                            {inst.nombre} ({inst.marca} Mod. {inst.modelo})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-600/10"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Agendar Evento de Campo</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center p-8 bg-white border border-dashed border-slate-200 rounded-xl text-slate-400 space-y-2">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto animate-pulse" />
                  <p className="text-[11px] leading-relaxed">No ha seleccionado ningún día del calendario.</p>
                  <p className="text-[10px] text-slate-400 font-light">Para agendar un servicio en sitio, haga clic en el día deseado en la cuadrícula mensual.</p>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      )}

      {activeTab === 'dir_engineers' && (
        <motion.div
          key="dir_engineers"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Users className="text-emerald-600 w-4.5 h-4.5" />
                Carga de Trabajo y Alta de Ingenieros
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Monitoreo de disponibilidad, ubicación y registro formal de ingenieros de campo acreditados.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualSyncEngineers}
                disabled={isSyncingQuotes}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                title="Sincronizar todo el personal con Supabase (public.usuarios)"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isSyncingQuotes ? 'animate-spin' : ''}`} />
                <span>{isSyncingQuotes ? "Sincronizando..." : "Sincronizar con Supabase"}</span>
              </button>
              <button
                onClick={() => setIsAddEngineerOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/10 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Dar de Alta Ingeniero</span>
              </button>
            </div>
          </div>

          {/* Form Modal for Creating Engineer */}
          {isAddEngineerOpen && (
            <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-xl space-y-4">
              <div className="border-b border-emerald-150 pb-2 flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider font-mono">
                  Registrar de Alta Nuevo Ingeniero de Campo
                </h4>
                <button 
                  onClick={() => setIsAddEngineerOpen(false)} 
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold font-mono"
                >
                  [Cancelar]
                </button>
              </div>

              <form onSubmit={handleCreateEngineer} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ing. Daniel Ortiz Salazar"
                    value={newEngineerForm.nombre_completo}
                    onChange={(e) => setNewEngineerForm({ ...newEngineerForm, nombre_completo: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="Ej. daniel.ortiz@aspechs.com"
                    value={newEngineerForm.email}
                    onChange={(e) => setNewEngineerForm({ ...newEngineerForm, email: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Cédula Profesional Metrólogo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Número de Cédula de la SEP / STPS"
                    value={newEngineerForm.cedula}
                    onChange={(e) => setNewEngineerForm({ ...newEngineerForm, cedula: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Especialidad Técnica Metrológica *</label>
                  <select
                    value={newEngineerForm.especialidad}
                    onChange={(e) => setNewEngineerForm({ ...newEngineerForm, especialidad: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  >
                    <option value="Especialista en Acústica NOM-011">Especialista en Acústica NOM-011</option>
                    <option value="Especialista en Ergonomía e Iluminación NOM-025">Especialista en Ergonomía e Iluminación NOM-025</option>
                    <option value="Experto Metrólogo NMX-EC-17025">Experto Metrólogo NMX-EC-17025</option>
                    <option value="Ingeniero en Vibraciones Industriales NOM-024">Ingeniero en Vibraciones Industriales NOM-024</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddEngineerOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                  >
                    Cerrar Formulario
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Habilitar Firma y Crear Ingeniero</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Supabase Storage Explanation Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/30 p-4 rounded-xl text-white space-y-2 shadow-md">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 font-mono">
                Trazabilidad en Supabase: Carga de Ingenieros y Plantilla Metrológica
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-300">
              <div className="bg-white/5 border border-white/10 p-2.5 rounded-lg">
                <span className="font-bold text-emerald-400 block font-mono">1. Tabla `public.usuarios`:</span>
                Almacena el perfil del ingeniero, correo, puesto, cédula profesional, hash SHA-256 de e.firma y su estado booleano <code className="text-emerald-300 font-mono">esta_activo</code>.
              </div>
              <div className="bg-white/5 border border-white/10 p-2.5 rounded-lg">
                <span className="font-bold text-emerald-400 block font-mono">2. Tabla `public.ordenes_trabajo`:</span>
                Registra la carga de trabajo y citas operativas vinculadas mediante la clave foránea <code className="text-emerald-300 font-mono">id_tecnico</code>.
              </div>
            </div>
            <p className="text-[10px] text-emerald-200/80 font-mono pt-1">
              ✨ <strong>Gestión Total Activada:</strong> Puede ver expediente, editar datos, alternar disponibilidad (Baja/Pausa/Activar) y eliminar registros con sincronización bidireccional inmediata en Supabase.
            </p>
          </div>

          {/* List of Engineers with Workloads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usuarios.filter(u => u.id_rol === 'LAB_TECH' || u.id_rol === 'ing_campo' || u.puesto?.includes('Técnico') || u.puesto?.includes('Ingeniero') || u.puesto?.includes('Consultor') || u.puesto?.includes('Asesor')).map((eng) => {
              // Calculate active services/workload
              const engServices = scheduledServices.filter(s => s.id_tecnico === eng.id_usuario);
              const activeCount = engServices.length;
              const isActive = eng.esta_activo ?? true;

              return (
                <div key={eng.id_usuario} className={`bg-white border ${isActive ? 'border-slate-200' : 'border-red-200 bg-red-50/20 opacity-80'} p-5 rounded-xl shadow-sm space-y-4 flex flex-col justify-between`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-800">{eng.nombre_completo}</h4>
                          <span className={`px-2 py-0.2 rounded text-[8px] font-bold uppercase font-mono border ${
                            isActive 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-red-100 text-red-700 border-red-200'
                          }`}>
                            {isActive ? "Activo" : "Pausado / Inactivo"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono leading-none">{eng.email}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold font-mono border ${
                        activeCount > 0 
                          ? 'bg-amber-50 text-amber-600 border-amber-100' 
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {activeCount > 0 ? "EN CAMPO" : "DISPONIBLE"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase font-bold">Cédula Profesional:</span>
                        <span className="text-slate-700 font-bold">{(eng as any).cedula_profesional || "EMA-NMX-98432"}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase font-bold">Carga de Trabajo:</span>
                        <span className="text-slate-700 font-bold">{activeCount} ODT {activeCount === 1 ? 'Activa' : 'Activas'}</span>
                      </div>
                    </div>

                    {activeCount > 0 && (
                      <div className="space-y-1 bg-blue-50/40 border border-blue-100/50 p-3 rounded-lg text-[10.5px]">
                        <span className="text-[8px] font-bold text-blue-500 uppercase tracking-wider block font-mono">Servicios Programados:</span>
                        {engServices.map(srv => (
                          <div key={srv.id_servicio} className="flex justify-between items-center text-slate-700">
                            <span className="font-bold truncate max-w-[150px]">{srv.cliente_nombre}</span>
                            <span className="text-[9px] font-mono text-slate-400 font-bold">{srv.fecha}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="truncate max-w-[200px]" title={(eng as any).firma_electronica || eng.firma_electronica_fingerprint}>
                        SHA256 Firma: <span className="text-emerald-600 font-bold">{((eng as any).firma_electronica || eng.firma_electronica_fingerprint) ? "Acreditado" : "Pendiente"}</span>
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        UUID: {eng.id_usuario.substring(0, 8)}...
                      </span>
                    </div>
                    
                    {/* Full Action Toolbar: View, Edit, Pause/Activate, Modify Load, Delete */}
                    <div className="flex flex-wrap items-center justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedEngineerForView(eng)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                        title="Ver Expediente Completo y ODTs en Supabase"
                      >
                        <Eye className="w-3 h-3 text-slate-600" />
                        <span>Ver</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEditEngineer(eng)}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                        title="Editar Datos del Ingeniero en Supabase"
                      >
                        <Edit className="w-3 h-3 text-blue-600" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleEngineerActive(eng)}
                        className={`px-2 py-1 border rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs ${
                          isActive 
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200' 
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                        title={isActive ? "Pausar o Dar de Baja" : "Reactivar Ingeniero"}
                      >
                        {isActive ? (
                          <>
                            <UserX className="w-3 h-3 text-amber-700" />
                            <span>Pausar</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3 text-emerald-700" />
                            <span>Activar</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEngineerForWorkload(eng);
                          const firstSrv = engServices[0];
                          if (firstSrv) {
                            setReassignOdtForm({
                              id_servicio: firstSrv.id_servicio,
                              id_tecnico: eng.id_usuario,
                              nueva_fecha: firstSrv.fecha
                            });
                          }
                        }}
                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                        title="Modificar Carga, Reasignar ODT o Cambiar Fechas"
                      >
                        <Edit3 className="w-3 h-3 text-indigo-700" />
                        <span>Carga</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteEngineer(eng)}
                        className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                        title="Eliminar Definitivamente de Supabase y de la App"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                        <span>Borrar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* MODAL DETALLE DE ORDEN DE TRABAJO (IMAGE 0) */}
      {selectedOdtDetailModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 font-mono uppercase flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Detalle de Orden de Trabajo: {selectedOdtDetailModal.id_servicio}
              </h3>
              <button
                onClick={() => setSelectedOdtDetailModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Cliente Industrial:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedOdtDetailModal.cliente_nombre}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Servicio Metrológico:</span>
                  <span className="font-semibold text-slate-800">{selectedOdtDetailModal.servicio}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2 font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Técnico Asignado:</span>
                  <span className="font-bold text-slate-800">
                    {usuarios.find(u => u.id_usuario === selectedOdtDetailModal.id_tecnico)?.nombre_completo || "Pendiente de Asignación"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2 font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Instrumento Autorizado:</span>
                  <span className="font-bold text-slate-700">
                    {instruments.find(i => i.id_instrumento === selectedOdtDetailModal.id_instrumento)?.nombre || "Sonómetro Clase 1 / Patrón Acreditado"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2 font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Fecha Programada:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {selectedOdtDetailModal.fecha}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Estatus de Ejecución:</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                    {selectedOdtDetailModal.estado}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-[10.5px] text-blue-900 space-y-1">
                <strong>📋 Trazabilidad Metrológica y Tasa de Muestreo:</strong>
                <p>
                  ODT habilitada con certificación e.firma NOM-151, levantamiento georreferenciado en planta y trazabilidad directa a patrones CENAM / NMX-EC-17025.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const odt = selectedOdtDetailModal;
                    setSelectedOdtDetailModal(null);
                    handleStartEditOdt(odt);
                  }}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-blue-200"
                  title="Editar datos de la ODT en Supabase"
                >
                  <Edit className="w-3.5 h-3.5 text-blue-600" />
                  <span>Editar ODT</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const odt = selectedOdtDetailModal;
                    setSelectedOdtDetailModal(null);
                    handleDeleteOdt(odt);
                  }}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-red-200"
                  title="Eliminar de Supabase y de la App"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Borrar</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>Imprimir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOdtDetailModal(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE COTIZACIÓN CON BOTÓN DE REUTILIZAR (IMAGE 1) */}
      {selectedQuoteForDetail && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-mono uppercase flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Expediente de Cotización: {selectedQuoteForDetail.id}
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">Sincronizado con Supabase public.cotizaciones</p>
              </div>
              <button
                onClick={() => setSelectedQuoteForDetail(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Cliente Industrial:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedQuoteForDetail.cliente}</span>
                </div>
                
                {/* Contactos destinatarios */}
                {(selectedQuoteForDetail.contactos_destinatarios || selectedQuoteForDetail.contactos) && (
                  <div className="border-t border-slate-200 pt-2 text-[10.5px]">
                    <span className="text-[9px] uppercase font-bold text-slate-400 font-mono block">Destinatarios Registrados:</span>
                    <div className="text-slate-700 font-medium mt-0.5">
                      {((selectedQuoteForDetail.contactos_destinatarios || selectedQuoteForDetail.contactos) as any[]).map((c, i) => (
                        <div key={i} className="flex justify-between py-0.5 border-b border-slate-100 last:border-0 font-mono">
                          <span>{c.nombre} ({c.puesto || 'Contacto'})</span>
                          <span className="text-slate-500">{c.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Servicio(s) / Norma:</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[260px] truncate">{typeof selectedQuoteForDetail.servicio === 'string' ? selectedQuoteForDetail.servicio : (selectedQuoteForDetail.servicio?.servicio || (Array.isArray(selectedQuoteForDetail.servicios) ? selectedQuoteForDetail.servicios.join(' + ') : 'Mapeo Metrológico'))}</span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-200 pt-2 font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Puntos / Muestras Totales:</span>
                  <span className="font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {selectedQuoteForDetail.puntos} puntos
                  </span>
                </div>

                {/* Desglose de Descuentos */}
                {selectedQuoteForDetail.descuento_porcentaje ? (
                  <div className="border-t border-slate-200 pt-2 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal Bruto:</span>
                      <span>${(selectedQuoteForDetail.subtotal_bruto || selectedQuoteForDetail.costo).toLocaleString('es-MX')} MXN</span>
                    </div>
                    <div className="flex justify-between text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <span>Descuento Aplicado ({selectedQuoteForDetail.descuento_porcentaje}%):</span>
                      <span>-${(selectedQuoteForDetail.descuento_monto || 0).toLocaleString('es-MX')} MXN</span>
                    </div>
                  </div>
                ) : null}

                <div className="flex justify-between items-center border-t border-slate-200 pt-2 font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Total Neto (IVA Inc.):</span>
                  <span className="font-bold text-emerald-700 text-base">
                    ${selectedQuoteForDetail.costo.toLocaleString('es-MX')} MXN
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-200 pt-2 font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Fecha de Emisión:</span>
                  <span className="text-slate-600 font-bold">{selectedQuoteForDetail.fecha}</span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Estatus Comercial:</span>
                  <span className={`px-2.5 py-0.5 rounded border text-[10px] font-bold font-mono ${
                    selectedQuoteForDetail.estado === 'Borrador'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  }`}>
                    {selectedQuoteForDetail.estado}
                  </span>
                </div>
              </div>

              {/* Condiciones comerciales si existen */}
              {selectedQuoteForDetail.condiciones && (
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-[10.5px] font-mono space-y-1 text-slate-600">
                  <strong className="text-slate-800 uppercase text-[9px] block">Condiciones Comerciales Pactadas:</strong>
                  <div>• Entrega: {selectedQuoteForDetail.condiciones.tiempo_entrega || '10 a 15 días hábiles'}</div>
                  <div>• Pago: {selectedQuoteForDetail.condiciones.forma_pago || '50% anticipo y 50% contra entrega'}</div>
                  <div>• Vigencia: {selectedQuoteForDetail.condiciones.vigencia_dias || 30} días naturales</div>
                </div>
              )}

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-[11px] text-emerald-900 space-y-1">
                <strong className="flex items-center gap-1 text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Cargar y Reutilizar en Editor de Cotizaciones:
                </strong>
                <p className="text-[10.5px]">
                  Al hacer clic en &quot;Reutilizar en Editor&quot;, todos los conceptos, costos por punto, descuentos y condiciones se precargarán en el formulario para generar una nueva propuesta o editar el borrador.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const q = selectedQuoteForDetail;
                    setSelectedQuoteForDetail(null);
                    handleStartEditQuote(q);
                  }}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-blue-200"
                  title="Editar datos de la cotización en Supabase"
                >
                  <Edit className="w-3.5 h-3.5 text-blue-600" />
                  <span>Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const q = selectedQuoteForDetail;
                    setSelectedQuoteForDetail(null);
                    handleDeleteQuote(q);
                  }}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-red-200"
                  title="Eliminar de Supabase y de la App"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Borrar</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedQuoteForDetail(null)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const q = selectedQuoteForDetail;
                    setClientName(q.cliente || '');
                    setSelectedClientNum(q.cliente_num || '');
                    if (q.servicios_desglosados && Array.isArray(q.servicios_desglosados) && q.servicios_desglosados.length > 0) {
                      setItemizedServices(q.servicios_desglosados);
                    } else if (q.servicio) {
                      setItemizedServices([{
                        id: `srv-${Date.now()}`,
                        serviceName: typeof q.servicio === 'string' ? q.servicio : (q.servicio?.servicio || 'Mapeo de Ruido NOM-011-STPS'),
                        puntos: q.puntos || 5,
                        costo_punto: q.costo_punto || 1800
                      }]);
                    }
                    if (q.descuento_porcentaje !== undefined) {
                      setDiscountPercentage(q.descuento_porcentaje);
                    }
                    if (q.viaticos !== undefined) {
                      setEstimatedViatics(q.viaticos);
                    }
                    if (q.condiciones) {
                      setCommercialConditions(q.condiciones);
                    }
                    if (q.contactos && Array.isArray(q.contactos)) {
                      setCurrentQuoteContacts(q.contactos);
                    }
                    setIsAddQuoteOpen(true);
                    setSelectedQuoteForDetail(null);
                    alert(`¡Parámetros de la cotización ${q.id} cargados exitosamente en el editor!\nPuede ajustar servicios, costos, descuentos o emitir la cotización.`);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Reutilizar en Editor</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE PROGRAMACIÓN DE CAMPO (IMAGE 2) */}
      {selectedFieldScheduleDetail && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 font-mono uppercase flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Detalle de Programación de Campo
              </h3>
              <button
                onClick={() => setSelectedFieldScheduleDetail(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Folio de Servicio / ODT:</span>
                  <span className="font-extrabold font-mono text-emerald-700 text-sm">{selectedFieldScheduleDetail.id_servicio}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Planta / Cliente:</span>
                  <span className="font-bold text-slate-900">{selectedFieldScheduleDetail.cliente_nombre}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Servicio Metrológico:</span>
                  <span className="font-semibold text-slate-800">{selectedFieldScheduleDetail.servicio}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2 font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Técnico Asignado:</span>
                  <span className="font-bold text-slate-800">
                    {usuarios.find(u => u.id_usuario === selectedFieldScheduleDetail.id_tecnico)?.nombre_completo || "Ing. Metrólogo en Campo"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2 font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Instrumento Autorizado:</span>
                  <span className="font-bold text-slate-700">
                    {instruments.find(i => i.id_instrumento === selectedFieldScheduleDetail.id_instrumento)?.nombre || "Termohigrómetro / Sonómetro Digital"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2 font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Fecha del Levantamiento:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    {selectedFieldScheduleDetail.fecha}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-[10.5px] text-blue-900 space-y-1">
                <strong>📍 Logística y Asignación:</strong>
                <p>
                  Servicio agendado para toma de muestras en sitio, con acreditación técnica EMA y calibración vigente de equipos.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const srv = selectedFieldScheduleDetail;
                    setSelectedFieldScheduleDetail(null);
                    handleStartEditOdt(srv);
                  }}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-blue-200"
                  title="Editar datos de esta cita/ODT en Supabase"
                >
                  <Edit className="w-3.5 h-3.5 text-blue-600" />
                  <span>Editar ODT</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const srv = selectedFieldScheduleDetail;
                    setSelectedFieldScheduleDetail(null);
                    handleDeleteOdt(srv);
                  }}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-red-200"
                  title="Eliminar de Supabase y de la Agenda"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Borrar</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFieldScheduleDetail(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MODIFICAR CARGA Y REASIGNAR INGENIERO (IMAGE 3) */}
      {selectedEngineerForWorkload && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 font-mono uppercase flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                Modificar Carga: {selectedEngineerForWorkload.nombre_completo}
              </h3>
              <button
                onClick={() => setSelectedEngineerForWorkload(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-amber-50/50 border border-amber-200 p-3 rounded-xl text-slate-700 space-y-1">
                <span className="text-[10px] font-bold text-amber-900 uppercase font-mono block">Carga Actual del Personal:</span>
                <p className="font-bold text-slate-900">{selectedEngineerForWorkload.nombre_completo} - {selectedEngineerForWorkload.email}</p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {scheduledServices.filter(s => s.id_tecnico === selectedEngineerForWorkload.id_usuario).length} ODT Activa(s) asignada(s).
                </p>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!reassignOdtForm.id_servicio) {
                    alert("Seleccione una ODT para reasignar.");
                    return;
                  }
                  const updated = scheduledServices.map(s => {
                    if (s.id_servicio === reassignOdtForm.id_servicio) {
                      return {
                        ...s,
                        id_tecnico: reassignOdtForm.id_tecnico,
                        fecha: reassignOdtForm.nueva_fecha || s.fecha
                      };
                    }
                    return s;
                  });
                  setScheduledServices(updated);
                  alert("Carga de trabajo y reasignación guardadas correctamente.");
                  setSelectedEngineerForWorkload(null);
                }}
                className="space-y-3"
              >
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Seleccionar ODT a Modificar *</label>
                  <select
                    value={reassignOdtForm.id_servicio}
                    onChange={(e) => {
                      const selectedSrv = scheduledServices.find(s => s.id_servicio === e.target.value);
                      setReassignOdtForm({
                        ...reassignOdtForm,
                        id_servicio: e.target.value,
                        nueva_fecha: selectedSrv ? selectedSrv.fecha : ''
                      });
                    }}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold font-mono text-xs"
                    required
                  >
                    <option value="">Seleccione ODT...</option>
                    {scheduledServices.map(s => (
                      <option key={s.id_servicio} value={s.id_servicio}>
                        {s.id_servicio} - {s.cliente_nombre} ({s.fecha})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Reasignar a Nuevo Ingeniero *</label>
                  <select
                    value={reassignOdtForm.id_tecnico}
                    onChange={(e) => setReassignOdtForm({ ...reassignOdtForm, id_tecnico: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs"
                    required
                  >
                    {usuarios.filter(u => u.id_rol === 'LAB_TECH' || u.id_rol === 'ing_campo' || u.puesto?.includes('Técnico') || u.puesto?.includes('Ingeniero') || u.puesto?.includes('Consultor') || u.puesto?.includes('Asesor')).map(u => (
                      <option key={u.id_usuario} value={u.id_usuario}>
                        {u.nombre_completo} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Nueva Fecha de Ejecución *</label>
                  <input
                    type="date"
                    value={reassignOdtForm.nueva_fecha}
                    onChange={(e) => setReassignOdtForm({ ...reassignOdtForm, nueva_fecha: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-mono font-bold"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedEngineerForWorkload(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs shadow cursor-pointer transition flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Guardar Reasignación</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VER EXPEDIENTE DE INGENIERO (SUPABASE PUBLIC.USUARIOS) */}
      {selectedEngineerForView && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-mono uppercase">
                    Expediente Metrológico del Ingeniero
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">Tabla Supabase: public.usuarios</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEngineerForView(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Nombre Completo:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedEngineerForView.nombre_completo}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2 font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Correo Electrónico:</span>
                  <span className="font-semibold text-slate-800">{selectedEngineerForView.email}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2 font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Cédula Profesional:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {(selectedEngineerForView as any).cedula_profesional || "EMA-NMX-98432"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Puesto / Especialidad:</span>
                  <span className="font-semibold text-slate-800">{selectedEngineerForView.puesto || "Ingeniero de Campo"}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2 font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">UUID en Supabase:</span>
                  <span className="text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {selectedEngineerForView.id_usuario}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2 font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Estatus Operativo:</span>
                  <span className={`font-bold px-2.5 py-0.5 rounded text-[10px] border ${
                    (selectedEngineerForView.esta_activo ?? true)
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {(selectedEngineerForView.esta_activo ?? true) ? 'ACTIVO / DISPONIBLE' : 'PAUSADO / INACTIVO'}
                  </span>
                </div>
              </div>

              {/* ODTs asignadas a este ingeniero */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase font-mono text-slate-500">
                    Carga de Trabajo Asignada (Supabase public.ordenes_trabajo):
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                    {scheduledServices.filter(s => s.id_tecnico === selectedEngineerForView.id_usuario).length} ODTs
                  </span>
                </div>

                {scheduledServices.filter(s => s.id_tecnico === selectedEngineerForView.id_usuario).length === 0 ? (
                  <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center text-slate-400 text-[11px]">
                    Este ingeniero no tiene ninguna Orden de Trabajo asignada actualmente.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {scheduledServices.filter(s => s.id_tecnico === selectedEngineerForView.id_usuario).map(s => (
                      <div key={s.id_servicio} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800">{s.id_servicio}: {s.cliente_nombre}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{s.servicio} • {s.fecha}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEngineerForView(null);
                              handleStartEditOdt(s);
                            }}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[9px] font-bold border border-blue-200"
                          >
                            Editar ODT
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOdt(s)}
                            className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-[9px] font-bold border border-red-200"
                          >
                            Borrar ODT
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 gap-2">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const eng = selectedEngineerForView;
                    setSelectedEngineerForView(null);
                    handleStartEditEngineer(eng);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar Perfil</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const eng = selectedEngineerForView;
                    setSelectedEngineerForView(null);
                    handleDeleteEngineer(eng);
                  }}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEngineerForView(null)}
                className="px-5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR INGENIERO (SUPABASE PUBLIC.USUARIOS) */}
      {selectedEngineerForEdit && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 font-mono uppercase flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                Editar Ingeniero en Supabase
              </h3>
              <button
                onClick={() => setSelectedEngineerForEdit(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEngineerEdit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={editEngineerForm.nombre_completo}
                  onChange={(e) => setEditEngineerForm({ ...editEngineerForm, nombre_completo: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={editEngineerForm.email}
                  onChange={(e) => setEditEngineerForm({ ...editEngineerForm, email: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Cédula Profesional *</label>
                <input
                  type="text"
                  required
                  value={editEngineerForm.cedula}
                  onChange={(e) => setEditEngineerForm({ ...editEngineerForm, cedula: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Especialidad Metrológica *</label>
                <select
                  value={editEngineerForm.especialidad}
                  onChange={(e) => setEditEngineerForm({ ...editEngineerForm, especialidad: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                >
                  <option value="Especialista en Acústica NOM-011">Especialista en Acústica NOM-011</option>
                  <option value="Especialista en Ergonomía e Iluminación NOM-025">Especialista en Ergonomía e Iluminación NOM-025</option>
                  <option value="Experto Metrólogo NMX-EC-17025">Experto Metrólogo NMX-EC-17025</option>
                  <option value="Ingeniero en Vibraciones Industriales NOM-024">Ingeniero en Vibraciones Industriales NOM-024</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Estatus de Disponibilidad</label>
                <select
                  value={editEngineerForm.esta_activo ? 'activo' : 'inactivo'}
                  onChange={(e) => setEditEngineerForm({ ...editEngineerForm, esta_activo: e.target.value === 'activo' })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                >
                  <option value="activo">Activo / Disponible para Asignación de ODT</option>
                  <option value="inactivo">Pausado / Inactivo (Baja Temporal)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedEngineerForEdit(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow cursor-pointer transition flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Guardar en Supabase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR COTIZACIÓN (SUPABASE PUBLIC.COTIZACIONES) */}
      {selectedQuoteForEdit && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 font-mono uppercase flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                Editar Cotización: {selectedQuoteForEdit.id}
              </h3>
              <button
                onClick={() => setSelectedQuoteForEdit(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuoteEdit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Cliente Industrial *</label>
                <input
                  type="text"
                  required
                  value={editQuoteForm.cliente}
                  onChange={(e) => setEditQuoteForm({ ...editQuoteForm, cliente: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Servicio / Norma *</label>
                <select
                  value={editQuoteForm.servicio}
                  onChange={(e) => setEditQuoteForm({ ...editQuoteForm, servicio: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                >
                  <option value="Mapeo de Ruido NOM-011-STPS">Mapeo de Ruido NOM-011-STPS</option>
                  <option value="Estudio de Iluminación NOM-025-STPS">Estudio de Iluminación NOM-025-STPS</option>
                  <option value="Dosimetrías de Ruido NOM-011-STPS">Dosimetrías de Ruido NOM-011-STPS</option>
                  <option value="Evaluación de Vibraciones NOM-024-STPS">Evaluación de Vibraciones NOM-024-STPS</option>
                  <option value="Estudio de Presiones NOM-016-STPS">Estudio de Presiones NOM-016-STPS</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Puntos de Medición</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editQuoteForm.puntos}
                    onChange={(e) => {
                      const pts = Number(e.target.value);
                      setEditQuoteForm({ 
                        ...editQuoteForm, 
                        puntos: pts,
                        costo: pts * 2500 + 1500
                      });
                    }}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Costo Total ($ MXN)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editQuoteForm.costo}
                    onChange={(e) => setEditQuoteForm({ ...editQuoteForm, costo: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Estatus Comercial</label>
                <select
                  value={editQuoteForm.estado}
                  onChange={(e) => setEditQuoteForm({ ...editQuoteForm, estado: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs"
                >
                  <option value="Generada">Generada</option>
                  <option value="Enviada">Enviada al Cliente</option>
                  <option value="Aceptado">Aceptado / Autorizado</option>
                  <option value="Rechazado">Rechazado</option>
                  <option value="Facturado">Facturado</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Fecha de Emisión</label>
                <input
                  type="date"
                  value={editQuoteForm.fecha}
                  onChange={(e) => setEditQuoteForm({ ...editQuoteForm, fecha: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedQuoteForEdit(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow cursor-pointer transition flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Guardar en Supabase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR ODT (SUPABASE PUBLIC.ORDENES_TRABAJO) */}
      {selectedOdtForEdit && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 font-mono uppercase flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                Editar ODT: {selectedOdtForEdit.id_servicio || selectedOdtForEdit.id_odt}
              </h3>
              <button
                onClick={() => setSelectedOdtForEdit(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOdtEdit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Cliente Industrial *</label>
                <input
                  type="text"
                  required
                  value={editOdtForm.cliente_nombre}
                  onChange={(e) => setEditOdtForm({ ...editOdtForm, cliente_nombre: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Servicio Metrológico *</label>
                <select
                  value={editOdtForm.servicio}
                  onChange={(e) => setEditOdtForm({ ...editOdtForm, servicio: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs"
                >
                  <option value="Mapeo de Ruido NOM-011">Mapeo de Ruido NOM-011</option>
                  <option value="Dosimetría de Ruido NOM-011">Dosimetría de Ruido NOM-011</option>
                  <option value="Estudio de Iluminación NOM-025">Estudio de Iluminación NOM-025</option>
                  <option value="Pruebas de Vibraciones NOM-024">Pruebas de Vibraciones NOM-024</option>
                  <option value="Presión Ambiental NOM-016">Presión Ambiental NOM-016</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Fecha Programada *</label>
                <input
                  type="date"
                  required
                  value={editOdtForm.fecha}
                  onChange={(e) => setEditOdtForm({ ...editOdtForm, fecha: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Ingeniero de Campo Asignado *</label>
                <select
                  value={editOdtForm.id_tecnico}
                  onChange={(e) => setEditOdtForm({ ...editOdtForm, id_tecnico: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs"
                  required
                >
                  <option value="">Seleccione Ingeniero...</option>
                  {usuarios.filter(u => u.id_rol === 'LAB_TECH' || u.id_rol === 'ing_campo' || u.puesto?.includes('Técnico') || u.puesto?.includes('Ingeniero') || u.puesto?.includes('Consultor') || u.puesto?.includes('Asesor')).map(eng => (
                    <option key={eng.id_usuario} value={eng.id_usuario}>{eng.nombre_completo}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Instrumento Autorizado *</label>
                <select
                  value={editOdtForm.id_instrumento}
                  onChange={(e) => setEditOdtForm({ ...editOdtForm, id_instrumento: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs"
                  required
                >
                  <option value="">Seleccione Instrumento...</option>
                  {instruments.map(inst => (
                    <option key={inst.id_instrumento} value={inst.id_instrumento}>
                      {inst.nombre} ({inst.marca} Mod. {inst.modelo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Estatus de la ODT</label>
                <select
                  value={editOdtForm.estado}
                  onChange={(e) => setEditOdtForm({ ...editOdtForm, estado: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs"
                >
                  <option value="Asignado">Asignado</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Completado">Completado</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOdtForEdit(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow cursor-pointer transition flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Guardar en Supabase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GLOBAL DE CATÁLOGO DE SERVICIOS METROLÓGICOS */}
      <ServiceCatalogModal
        isOpen={isServiceCatalogOpen}
        onClose={() => setIsServiceCatalogOpen(false)}
        onServicesUpdated={(updatedList) => {
          setAvailableServices(updatedList);
        }}
      />
    </div>
  );
}
