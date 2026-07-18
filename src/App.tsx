import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, 
  ShieldCheck, 
  Activity, 
  HelpCircle, 
  Copy, 
  Check, 
  Info, 
  AlertTriangle, 
  AlertCircle, 
  RefreshCw, 
  UserCheck, 
  Plus, 
  Shield, 
  Search, 
  FileText, 
  ChevronRight, 
  Lock, 
  Key, 
  Hash, 
  FileSignature, 
  Sliders, 
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  Download,
  Edit3,
  Home,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Calculator,
  ArrowRight,
  MapPin,
  UserPlus,
  FileCheck,
  ChevronDown,
  Users,
  Wrench,
  Microscope,
  ClipboardList,
  Settings,
  Package,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import our schema and pre-defined data
import { DB_SCHEMA_SQL, EXPLICACION_NORMATIVA } from './db_schema_sql';
import { 
  INITIAL_ROLES, 
  INITIAL_PERMISOS, 
  ROLE_PERMISSIONS_MAP, 
  INITIAL_USUARIOS, 
  INITIAL_INSTRUMENTOS, 
  INITIAL_CERTIFICADOS, 
  INITIAL_AUDIT_LOGS,
  generarHashIntegridad,
  Usuario,
  Instrumento,
  CertificadoCalibracion,
  AuditLog
} from './initial_data';

import DirectorViews from './components/DirectorViews';
import CoordinatorViews from './components/CoordinatorViews';
import TechnicianViews from './components/TechnicianViews';
import AdminViews from './components/AdminViews';
import HomeSelection from './components/HomeSelection';

export default function App() {
  // Session / Active Role state for dynamic landing page
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<string>('dir_dashboard');

  const getRoleCategory = (roleId: string | null) => {
    if (!roleId) return 'director';
    if (['ceo', 'dir_op', 'sys_admin'].includes(roleId)) {
      return 'director';
    }
    if (['ger_tec', 'ger_cal', 'coord_lab', 'ger_lab', 'jefe_op', 'jefe_alm'].includes(roleId)) {
      return 'coordinator';
    }
    if (['ing_campo'].includes(roleId)) {
      return 'technician';
    }
    if (['dir_at_cl', 'contabilidad', 'jefe_rep'].includes(roleId)) {
      return 'admin';
    }
    return 'director';
  };

  const mapActiveTabToInternal = (roleId: string | null, tabId: string): string => {
    if (!roleId) return tabId;
    if ([
      'dir_dashboard', 'dir_calibration', 'dir_config',
      'coord_agenda', 'coord_inventory', 'coord_validation',
      'tech_agenda', 'tech_epp', 'tech_mediciones', 'tech_muestras',
      'admin_crm', 'admin_finance', 'admin_results'
    ].includes(tabId)) {
      return tabId;
    }

    switch (roleId) {
      case 'ceo':
        if (tabId === 'ceo_dashboard') return 'dir_dashboard';
        if (tabId === 'ceo_reports') return 'dir_calibration';
        if (tabId === 'ceo_admin') return 'dir_config';
        break;
      case 'dir_op':
        if (tabId === 'dir_dashboard') return 'dir_dashboard';
        if (tabId === 'dir_quotes' || tabId === 'dir_odt') return 'dir_calibration';
        if (tabId === 'dir_agenda' || tabId === 'dir_engineers') return 'dir_dashboard';
        break;
      case 'dir_at_cl':
        if (tabId === 'dac_clients' || tabId === 'dac_quotes' || tabId === 'dac_tracking') return 'admin_crm';
        break;
      case 'ger_tec':
        if (tabId === 'gt_services' || tabId === 'gt_norms') return 'coord_inventory';
        if (tabId === 'gt_odt' || tabId === 'gt_hojas_campo') return 'coord_validation';
        break;
      case 'ger_cal':
        if (tabId === 'gc_hojas_campo' || tabId === 'gc_reports') return 'coord_validation';
        break;
      case 'coord_lab':
        if (tabId === 'cl_agenda') return 'coord_agenda';
        if (tabId === 'cl_hojas_campo') return 'coord_validation';
        if (tabId === 'cl_lab') return 'coord_inventory';
        break;
      case 'ger_lab':
        if (tabId === 'gl_lab') return 'coord_inventory';
        if (tabId === 'gl_hojas_campo' || tabId === 'gl_estudios') return 'coord_validation';
        break;
      case 'contabilidad':
        if (tabId === 'cont_billing' || tabId === 'cont_collection' || tabId === 'cont_reports') return 'admin_finance';
        break;
      case 'jefe_rep':
        if (tabId === 'jr_reports') return 'admin_results';
        break;
      case 'jefe_op':
        if (tabId === 'jo_odt') return 'coord_validation';
        if (tabId === 'jo_agenda' || tabId === 'jo_engineers' || tabId === 'jo_tracking') return 'coord_agenda';
        break;
      case 'jefe_alm':
        if (tabId === 'ja_inventory' || tabId === 'ja_equip') return 'coord_inventory';
        break;
      case 'ing_campo':
        if (tabId === 'ic_agenda' || tabId === 'ic_odt') return 'tech_agenda';
        if (tabId === 'ic_hoja_campo') return 'tech_mediciones';
        if (tabId === 'ic_history') return 'tech_muestras';
        break;
      case 'sys_admin':
        if (tabId === 'sa_users' || tabId === 'sa_roles' || tabId === 'sa_catalogs' || tabId === 'sa_config') return 'dir_config';
        break;
    }
    return tabId;
  };

  const getSidebarItems = (roleId: string | null) => {
    if (!roleId) return [];
    switch (roleId) {
      case 'ceo':
        return [
          { id: 'ceo_dashboard', label: 'Dashboard Ejecutivo', icon: TrendingUp },
          { id: 'ceo_reports', label: 'Reportes Globales', icon: ClipboardList },
          { id: 'ceo_admin', label: 'Administración (Consulta)', icon: Sliders },
        ];
      case 'dir_op':
        return [
          { id: 'dir_dashboard', label: 'Dashboard de Control', icon: TrendingUp },
          { id: 'dir_quotes', label: 'Cotizaciones', icon: FileText },
          { id: 'dir_odt', label: 'Órdenes de Trabajo (ODT)', icon: Activity },
          { id: 'dir_agenda', label: 'Agenda y Programación', icon: Calendar },
          { id: 'dir_engineers', label: 'Carga de Ingenieros', icon: Users },
        ];
      case 'dir_at_cl':
        return [
          { id: 'dac_clients', label: 'Clientes (Alta/Edición)', icon: Users },
          { id: 'dac_quotes', label: 'Cotizaciones', icon: FileText },
          { id: 'dac_tracking', label: 'Seguimiento y Historial', icon: HelpCircle },
        ];
      case 'ger_tec':
        return [
          { id: 'gt_services', label: 'Catálogo de Servicios', icon: Wrench },
          { id: 'gt_norms', label: 'Normativas', icon: Sliders },
          { id: 'gt_odt', label: 'Revisión Técnica de ODT', icon: Activity },
          { id: 'gt_hojas_campo', label: 'Revisión Hojas de Campo', icon: FileText },
        ];
      case 'ger_cal':
        return [
          { id: 'gc_hojas_campo', label: 'Validación Hojas de Campo', icon: FileCheck },
          { id: 'gc_reports', label: 'Reportes de Calidad', icon: ClipboardList },
        ];
      case 'coord_lab':
        return [
          { id: 'cl_agenda', label: 'Asignar Ingenieros (Agenda)', icon: Calendar },
          { id: 'cl_hojas_campo', label: 'Supervisar Hojas de Campo', icon: FileText },
          { id: 'cl_lab', label: 'Estudios y Muestras', icon: Microscope },
        ];
      case 'ger_lab':
        return [
          { id: 'gl_lab', label: 'Supervisión General Lab', icon: Microscope },
          { id: 'gl_hojas_campo', label: 'Consulta Hojas de Campo', icon: FileText },
          { id: 'gl_estudios', label: 'Validar Resultados', icon: Activity },
        ];
      case 'contabilidad':
        return [
          { id: 'cont_billing', label: 'Facturación', icon: FileSpreadsheet },
          { id: 'cont_collection', label: 'Cobranza y Cartera', icon: DollarSign },
          { id: 'cont_reports', label: 'Reportes Financieros', icon: ClipboardList },
        ];
      case 'jefe_rep':
        return [
          { id: 'jr_reports', label: 'Reportes Generales', icon: ClipboardList },
        ];
      case 'jefe_op':
        return [
          { id: 'jo_odt', label: 'Gestión de ODT', icon: Activity },
          { id: 'jo_agenda', label: 'Programación de Servicios', icon: Calendar },
          { id: 'jo_engineers', label: 'Asignación a Ingenieros', icon: Users },
          { id: 'jo_tracking', label: 'Monitoreo de Avances', icon: Clock },
        ];
      case 'jefe_alm':
        return [
          { id: 'ja_inventory', label: 'Inventario de Materiales', icon: Package },
          { id: 'ja_equip', label: 'Equipos y Devoluciones', icon: Cpu },
        ];
      case 'ing_campo':
        return [
          { id: 'ic_agenda', label: 'Ver Servicios Asignados', icon: Clock },
          { id: 'ic_odt', label: 'Consultar ODT', icon: Activity },
          { id: 'ic_hoja_campo', label: 'Captura Hoja de Campo', icon: Edit3 },
          { id: 'ic_history', label: 'Historial Realizado', icon: FileCheck },
        ];
      case 'sys_admin':
        return [
          { id: 'sa_users', label: 'Usuarios y Accesos', icon: Users },
          { id: 'sa_roles', label: 'Roles y Permisos', icon: Key },
          { id: 'sa_catalogs', label: 'Administrar Catálogos', icon: Sliders },
          { id: 'sa_config', label: 'Parámetros del Sistema', icon: Settings },
        ];
      default:
        return [];
    }
  };

  // NOM-011-STPS Field Capture States
  const [fieldStep, setFieldStep] = useState<number>(1);
  const [fieldCheckinCoords, setFieldCheckinCoords] = useState<string>("");
  const [fieldCheckinTime, setFieldCheckinTime] = useState<string>("");
  const [fieldEppChecked, setFieldEppChecked] = useState({
    casco: false,
    tapones: false,
    calzado: false,
    chaleco: false
  });
  const [fieldSonometerId, setFieldSonometerId] = useState<string>("");
  const [fieldArea, setFieldArea] = useState<string>("");
  const [fieldStartTime, setFieldStartTime] = useState<string>("");
  const [fieldEndTime, setFieldEndTime] = useState<string>("");
  const [fieldReadings, setFieldReadings] = useState<Array<{ db: number; conditions: string }>>([
    { db: 84.5, conditions: "Operación de calderas baja, viento de 1.2 m/s" },
    { db: 87.2, conditions: "Operación de calderas media, ventilación activa" }
  ]);
  const [fieldRepName, setFieldRepName] = useState<string>("");
  const [fieldRepPuesto, setFieldRepPuesto] = useState<string>("");
  const [fieldIsLocked, setFieldIsLocked] = useState<boolean>(false);
  const [fieldHash, setFieldHash] = useState<string>("");
  const [fieldConstanciaNOM151, setFieldConstanciaNOM151] = useState<string>("");

  // Submitted reports for the coordinator validation queue
  const [submittedReports, setSubmittedReports] = useState<any[]>(() => {
    const saved = localStorage.getItem('aspechs_submitted_reports');
    if (saved) return JSON.parse(saved);

    // Initial pre-populated records for the interactive demo
    return [
      {
        id_reporte: "REP-NOM011-2026-001",
        tecnico: "Lucía Juárez",
        fecha: "2026-07-13",
        estado: "Aprobado",
        aprobado_por: "Carlos Slim Jr.",
        justificacion_coordinador: "Se aprueba el reporte tras verificar calibración vigente del sonómetro y firmas digitales completas.",
        timestamp_revision: "2026-07-13T16:40:00Z",
        payload: {
          id_reporte: "REP-NOM011-2026-001",
          datos_sitio: {
            empresa_cliente: "Metalúrgica del Norte S.A.",
            ubicacion_planta: "Planta Apodaca, Nave 3",
            coordenadas_gps: "25.7785, -100.1873",
            fecha_medicion: "2026-07-13",
            checkin_hora: "10:15:30"
          },
          epp_verificado: {
            casco: true,
            tapones_auditivos_orejeras: true,
            calzado_seguridad: true,
            chaleco_reflejante: true,
            timestamp_epp_check: "2026-07-13T10:18:22Z"
          },
          instrumento_utilizado: {
            id_instrumento: "inst-005",
            codigo_interno: "EQ-SON-055",
            nombre: "Sonómetro Integrador Clase 1",
            marca: "Quest Technologies",
            modelo: "SoundPro SE",
            certificado_calibracion_vigente: "EMA-QUEST-2026-0922",
            fecha_vencimiento_calibracion: "2027-01-15"
          },
          punto_medicion: {
            id_punto: "P-01",
            area_descripcion: "Taller de Torno y Fresado",
            hora_inicio: "10:20:00",
            hora_fin: "11:00:00"
          },
          lecturas: [
            { db: 86.4, conditions: "Torno operando a máxima carga. Temp 28°C" },
            { db: 85.9, conditions: "Torno operando a carga media. Temp 28.2°C" }
          ],
          firmas_conformidad: {
            firma_tecnico: "Lucía Juárez (LAB_TECH)",
            huella_digital_tecnico: "e.firma:SHA256:9cb812...0df63a29",
            firma_representante_planta: "Ing. Roberto Cantú",
            puesto_representante: "Coordinador de Higiene Industrial",
            timestamp_firmas: "2026-07-13T11:05:12Z"
          },
          nom151_integridad: {
            hash_documento_sha256: "SHA256:39a1b12b59c2ef3542d89df251c6b12a8844fa215fe338eaef4",
            constancia_psc: "NOM151:CONSTANCIA-2026-07-13-FIELD-0012",
            esta_bloqueado: true
          }
        }
      },
      {
        id_reporte: "REP-NOM011-2026-002",
        tecnico: "Lucía Juárez",
        fecha: "2026-07-14",
        estado: "Pendiente",
        payload: {
          id_reporte: "REP-NOM011-2026-002",
          datos_sitio: {
            empresa_cliente: "Cervecería de Querétaro S.A.",
            ubicacion_planta: "Área de Embotellado Línea 4",
            coordenadas_gps: "20.5888, -100.3899",
            fecha_medicion: "2026-07-14",
            checkin_hora: "08:45:00"
          },
          epp_verificado: {
            casco: true,
            tapones_auditivos_orejeras: true,
            calzado_seguridad: true,
            chaleco_reflejante: true,
            timestamp_epp_check: "2026-07-14T08:48:10Z"
          },
          instrumento_utilizado: {
            id_instrumento: "inst-005",
            codigo_interno: "EQ-SON-055",
            nombre: "Sonómetro Integrador Clase 1",
            marca: "Quest Technologies",
            modelo: "SoundPro SE",
            certificado_calibracion_vigente: "EMA-QUEST-2026-0922",
            fecha_vencimiento_calibracion: "2027-01-15"
          },
          punto_medicion: {
            id_punto: "P-02",
            area_descripcion: "Embotellado y Empaque",
            hora_inicio: "08:50:00",
            hora_fin: "09:30:00"
          },
          lecturas: [
            { db: 91.2, conditions: "Línea de envasado a velocidad nominal. Temp 21°C" },
            { db: 92.0, conditions: "Fallas menores en transportador, ruido de fricción elevado" }
          ],
          firmas_conformidad: {
            firma_tecnico: "Lucía Juárez (LAB_TECH)",
            huella_digital_tecnico: "e.firma:SHA256:9cb812...0df63a29",
            firma_representante_planta: "Lic. Laura Ortega",
            puesto_representante: "Supervisora de Seguridad",
            timestamp_firmas: "2026-07-14T09:35:15Z"
          },
          nom151_integridad: {
            hash_documento_sha256: "SHA256:f16b23087a3296acb03c834a3179df1432f59c8b931e129450ad89a12a",
            constancia_psc: "NOM151:CONSTANCIA-2026-07-14-FIELD-0982",
            esta_bloqueado: true
          }
        }
      }
    ];
  });

  // Dynamic Home/Dashboard States
  const [jornadaIniciada, setJornadaIniciada] = useState<boolean>(false);
  const [jornadaStartTime, setJornadaStartTime] = useState<string>("");
  const [_jornadaGPS, setJornadaGPS] = useState<string>("");

  // Cotizador States for Admin/Ventas
  const [generatedQuotes, setGeneratedQuotes] = useState<any[]>([
    { id: "COT-001", cliente: "Vidriera del Norte", servicio: "NOM-011-STPS (Ruido)", puntos: 10, costo: 24500, fecha: "2026-07-10", estado: "Enviado" },
    { id: "COT-002", cliente: "Papelera de Occidente", servicio: "NOM-015-STPS (Térmicas)", puntos: 4, costo: 15200, fecha: "2026-07-12", estado: "Aceptado" },
  ]);

  // Invoice control state for Admin/Ventas and Director
  const [invoices, setInvoices] = useState<any[]>([
    { id_factura: 1, cliente: "Vidriera del Norte", monto: 24500, estado: "Pendiente", vencimiento: "2026-08-10" },
    { id_factura: 2, cliente: "Papelera de Occidente", monto: 15200, estado: "Pagado", vencimiento: "2026-07-30" },
    { id_factura: 3, cliente: "Cementos de Hidalgo", monto: 45000, estado: "Pagado", vencimiento: "2026-06-15" },
    { id_factura: 4, cliente: "Metales de Saltillo", monto: 18900, estado: "Vencido", vencimiento: "2026-07-01" },
  ]);

  // Service Calendar Tasks for Coordinador
  const [scheduledServices, setScheduledServices] = useState<any[]>([
    { id_servicio: "SERV-101", cliente_nombre: "Arneses del Eje S.A.", servicio: "Mapeo de Ruido NOM-011", fecha: "2026-07-15", id_tecnico: "32fdc451-2ef3-40a1-bf87-9df03da2b812", id_instrumento: "inst-005", estado: "Asignado" },
    { id_servicio: "SERV-102", cliente_nombre: "Química de Coahuila S.A.", servicio: "Mapeo de Ruido NOM-011", fecha: "2026-07-16", id_tecnico: "32fdc451-2ef3-40a1-bf87-9df03da2b812", id_instrumento: "inst-005", estado: "Asignado" },
  ]);

  // Mobile Sidebar State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Simulator Persona State (Roberto Fernández is selected by default as the Director)
  const [currentPersonaId, setCurrentPersonaId] = useState<string>("e88b48f9-4d6d-478a-aef4-4f40d12ea661");
  
  // App Data States (with LocalStorage fallback or initialization)
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    const saved = localStorage.getItem('aspechs_usuarios');
    return saved ? JSON.parse(saved) : INITIAL_USUARIOS;
  });

  const [instruments, setInstruments] = useState<Instrumento[]>(() => {
    const saved = localStorage.getItem('aspechs_instruments');
    return saved ? JSON.parse(saved) : INITIAL_INSTRUMENTOS;
  });

  const [certificates, setCertificates] = useState<CertificadoCalibracion[]>(() => {
    const saved = localStorage.getItem('aspechs_certificates');
    return saved ? JSON.parse(saved) : INITIAL_CERTIFICADOS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('aspechs_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<any[]>(() => {
    const saved = localStorage.getItem('aspechs_purchase_orders');
    return saved ? JSON.parse(saved) : [
      {
        id_po: "PO-982110",
        id_cotizacion: "COT-002",
        cliente: "Papelera de Occidente",
        costo_final: 15200,
        fecha_compromiso: "2026-07-28",
        estatus_cliente: "Firmada por Compras",
        archivo_po: "PO-Occidente-Firmado.pdf",
        fecha_registro: "2026-07-12"
      }
    ];
  });

  const [reportTemplates, setReportTemplates] = useState<any[]>(() => {
    const saved = localStorage.getItem('aspechs_report_templates');
    return saved ? JSON.parse(saved) : [
      {
        id_plantilla: 'temp-011',
        nombre: 'Cascarón Oficial NOM-011-STPS 2026 (Ruido)',
        codigo_documento: 'FOR-MET-011-REV4',
        descripcion: 'Estructura oficial para informes técnicos de medición de ruido y dosimetrías bajo la norma oficial mexicana de la STPS.',
        estructura: {
          encabezado: 'LABORATORIO DE METROLOGÍA AMBIENTAL Y OCUPACIONAL ASP S.A. DE C.V.',
          seccion_cliente: 'Cliente de Ensayo: {{CLIENTE}} | Ubicación Georreferenciada: {{COORDENADAS}} | Hora de Check-In: {{CHECKIN}}',
          seccion_instrumentos: 'Sonómetro de Precisión Integrador: {{SONOMETRO}} | Certificado de Trazabilidad Nacional EMA: {{CERTIFICADO}}',
          seccion_firmas: 'Responsable Técnico: {{FIRMAS}} | Firma de Conformidad de Planta: Autorizado en Sitio | Sello de Tiempo Criptográfico NOM-151: {{NOM151_HASH}} / Constancia: {{CONSTANCIA_NOM151}}'
        }
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('aspechs_purchase_orders', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('aspechs_report_templates', JSON.stringify(reportTemplates));
  }, [reportTemplates]);

  const [searchQuery, setSearchQuery] = useState("");

  // New Equipment Modal / State
  const [isAddEquipOpen, setIsAddEquipOpen] = useState(false);
  const [newEquip, setNewEquip] = useState({
    codigo_interno: '',
    nombre: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    ubicacion: '',
    intervalo_calibracion_meses: 12,
    estado_operativo: 'Operativo' as any
  });

  // Edit / Calibrate State
  const [selectedEquipForCalibration, setSelectedEquipForCalibration] = useState<Instrumento | null>(null);
  const [newCertificate, setNewCertificate] = useState({
    numero_certificado: '',
    laboratorio_emisor: '',
    fecha_calibracion: '',
    fecha_vencimiento: '',
    justificacion_tecnica: '',
    requiere_aprobacion_inmediata: true
  });

  // Modification Simulator (Forces justification)
  const [selectedEquipForEdit, setSelectedEquipForEdit] = useState<Instrumento | null>(null);
  const [editJustification, setEditJustification] = useState("");
  const [editFormFields, setEditFormFields] = useState({
    nombre: '',
    ubicacion: '',
    estado_operativo: 'Operativo' as any,
    intervalo_calibracion_meses: 12
  });

  // Get current persona details
  const activePersona = useMemo(() => {
    return usuarios.find(u => u.id_usuario === currentPersonaId) || usuarios[0];
  }, [usuarios, currentPersonaId]);

  // Keep active tab synced with persona authorization
  useEffect(() => {
    const role = activePersona.id_role || activePersona.id_rol;
    const items = getSidebarItems(role);
    const isAuthorized = items.some(item => item.id === activeTab);
    
    if (!isAuthorized && items.length > 0) {
      // Auto-route to the first authorized tab of the new role
      setActiveTab(items[0].id);
    }
  }, [activePersona, activeTab]);

  // Persist State Helper
  const saveStateToLocalStorage = (newUsuarios?: Usuario[], newInsts?: Instrumento[], newCerts?: CertificadoCalibracion[], newLogs?: AuditLog[]) => {
    if (newUsuarios) {
      localStorage.setItem('aspechs_usuarios', JSON.stringify(newUsuarios));
      setUsuarios(newUsuarios);
    }
    if (newInsts) {
      localStorage.setItem('aspechs_instruments', JSON.stringify(newInsts));
      setInstruments(newInsts);
    }
    if (newCerts) {
      localStorage.setItem('aspechs_certificates', JSON.stringify(newCerts));
      setCertificates(newCerts);
    }
    if (newLogs) {
      localStorage.setItem('aspechs_audit_logs', JSON.stringify(newLogs));
      setAuditLogs(newLogs);
    }
  };

  // Check RBAC Permissions
  const checkPermission = (userId: string, permissionId: string): boolean => {
    const user = usuarios.find(u => u.id_usuario === userId);
    if (!user) return false;
    const role = user.id_role || user.id_rol;
    const allowedPermissions = ROLE_PERMISSIONS_MAP[role] || [];
    return allowedPermissions.includes(permissionId);
  };

  // Add New Equipment
  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkPermission(currentPersonaId, "equipos:crear")) {
      alert("No tienes permisos suficientes para registrar equipos. Por favor cambia tu Rol a Supervisor o Analista.");
      return;
    }

    if (!newEquip.codigo_interno || !newEquip.nombre || !newEquip.numero_serie) {
      alert("Por favor completa los campos obligatorios (*).");
      return;
    }

    const newInstrument: Instrumento = {
      id_instrumento: `inst-${Date.now()}`,
      codigo_interno: newEquip.codigo_interno.toUpperCase(),
      nombre: newEquip.nombre,
      marca: newEquip.marca,
      modelo: newEquip.modelo,
      numero_serie: newEquip.numero_serie,
      ubicacion: newEquip.ubicacion,
      intervalo_calibracion_meses: Number(newEquip.intervalo_calibracion_meses),
      estado_operativo: newEquip.estado_operativo
    };

    const updatedInsts = [...instruments, newInstrument];
    saveStateToLocalStorage(undefined, updatedInsts, undefined, undefined);
    
    // Log creation
    const newLog: AuditLog = {
      id_log: auditLogs.length + 1,
      id_usuario: activePersona.id_usuario,
      usuario_nombre: activePersona.nombre_completo,
      usuario_rol: activePersona.id_role || activePersona.id_rol,
      tabla_afectada: "instrumentos",
      registro_id: newInstrument.id_instrumento,
      accion: "INSERT",
      valor_anterior: null,
      valor_nuevo: JSON.stringify(newInstrument),
      justificacion_tecnica: `Alta inicial en inventario de metrología del equipo ${newInstrument.nombre} con número de serie ${newInstrument.numero_serie} para cumplimiento del control general de H&S.`,
      hash_integridad: generarHashIntegridad(
        activePersona.id_usuario,
        "instrumentos",
        newInstrument.id_instrumento,
        "INSERT",
        null,
        JSON.stringify(newInstrument),
        "Alta inicial en inventario"
      ),
      ip_origen: "192.168.10.88",
      timestamp: new Date().toISOString()
    };

    saveStateToLocalStorage(undefined, undefined, undefined, [newLog, ...auditLogs]);
    alert(`Instrumento ${newInstrument.codigo_interno} registrado correctamente en inventario.`);
    setIsAddEquipOpen(false);
    setNewEquip({
      codigo_interno: '',
      nombre: '',
      marca: '',
      modelo: '',
      numero_serie: '',
      ubicacion: '',
      intervalo_calibracion_meses: 12,
      estado_operativo: 'Operativo'
    });
  };

  const handleRegisterCalibration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipForCalibration) return;
    if (!newCertificate.numero_certificado || !newCertificate.laboratorio_emisor || !newCertificate.fecha_calibracion || !newCertificate.fecha_vencimiento) {
      alert("Por favor llene todos los campos obligatorios del certificado.");
      return;
    }

    const newCert: CertificadoCalibracion = {
      id_certificado: `cert-${Date.now()}`,
      id_instrumento: selectedEquipForCalibration.id_instrumento,
      numero_certificado: newCertificate.numero_certificado,
      laboratorio_emisor: newCertificate.laboratorio_emisor,
      fecha_calibracion: newCertificate.fecha_calibracion,
      fecha_vencimiento: newCertificate.fecha_vencimiento,
      url_documento: "",
      archivo_hash_sha256: "",
      estado_aprobacion: 'Pendiente',
      justificacion_aprobacion: newCertificate.justificacion_tecnica || "Calibración reglamentaria periódica.",
      aprobado_por: "",
      fecha_aprobacion: ""
    };

    const updatedCerts = [newCert, ...certificates];
    saveStateToLocalStorage(undefined, undefined, updatedCerts, undefined);

    // Audit Log Entry
    const newLog: AuditLog = {
      id_log: auditLogs.length + 1,
      id_usuario: activePersona.id_usuario,
      usuario_nombre: activePersona.nombre_completo,
      usuario_rol: activePersona.id_role || activePersona.id_rol,
      tabla_afectada: "certificados_calibracion",
      registro_id: newCert.id_certificado,
      accion: "INSERT",
      valor_anterior: null,
      valor_nuevo: JSON.stringify(newCert),
      justificacion_tecnica: `Registro de certificado de calibración ${newCert.numero_certificado} para el equipo ${selectedEquipForCalibration.codigo_interno}. En espera de validación del Director.`,
      hash_integridad: generarHashIntegridad(activePersona.id_usuario, "certificados_calibracion", newCert.id_certificado, "INSERT", null, JSON.stringify(newCert), newCert.justificacion_aprobacion || ""),
      ip_origen: "192.168.10.15",
      timestamp: new Date().toISOString()
    };
    saveStateToLocalStorage(undefined, undefined, undefined, [newLog, ...auditLogs]);

    alert(`Certificado registrado con éxito en estado PENDIENTE. Pendiente de firma y aprobación por el Director.`);
    setSelectedEquipForCalibration(null);
    setNewCertificate({
      numero_certificado: '',
      laboratorio_emisor: '',
      fecha_calibracion: '',
      fecha_vencimiento: '',
      justificacion_tecnica: '',
      requiere_aprobacion_inmediata: true
    });
  };

  const handleSaveInstrumentEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipForEdit) return;
    if (!editJustification || editJustification.trim().length < 5) {
      alert("Error (NMX-17025): Debe proporcionar una Justificación Técnica científica obligatoria de al menos 5 caracteres para auditar este cambio.");
      return;
    }

    const previousValue = { ...selectedEquipForEdit };
    const updatedInstrument: Instrumento = {
      ...selectedEquipForEdit,
      nombre: editFormFields.nombre,
      ubicacion: editFormFields.ubicacion,
      estado_operativo: editFormFields.estado_operativo,
      intervalo_calibracion_meses: editFormFields.intervalo_calibracion_meses
    };

    const updatedInsts = instruments.map(i => i.id_instrumento === selectedEquipForEdit.id_instrumento ? updatedInstrument : i);
    saveStateToLocalStorage(undefined, updatedInsts, undefined, undefined);

    // Audit Log Entry
    const newLog: AuditLog = {
      id_log: auditLogs.length + 1,
      id_usuario: activePersona.id_usuario,
      usuario_nombre: activePersona.nombre_completo,
      usuario_rol: activePersona.id_role || activePersona.id_rol,
      tabla_afectada: "instrumentos",
      registro_id: updatedInstrument.id_instrumento,
      accion: "UPDATE",
      valor_anterior: JSON.stringify(previousValue),
      valor_nuevo: JSON.stringify(updatedInstrument),
      justificacion_tecnica: editJustification,
      hash_integridad: generarHashIntegridad(
        activePersona.id_usuario,
        "instrumentos",
        updatedInstrument.id_instrumento,
        "UPDATE",
        JSON.stringify(previousValue),
        JSON.stringify(updatedInstrument),
        editJustification
      ),
      ip_origen: "192.168.10.15",
      timestamp: new Date().toISOString()
    };
    saveStateToLocalStorage(undefined, undefined, undefined, [newLog, ...auditLogs]);

    alert("Modificación guardada exitosamente y registrada en el Audit Trail.");
    setSelectedEquipForEdit(null);
    setEditJustification("");
  };

  const startEditInstrument = (inst: Instrumento) => {
    setSelectedEquipForEdit(inst);
    setEditFormFields({
      nombre: inst.nombre,
      ubicacion: inst.ubicacion,
      estado_operativo: inst.estado_operativo,
      intervalo_calibracion_meses: inst.intervalo_calibracion_meses
    });
    setEditJustification("");
  };

  // Coordinated CRM & Logistics Adapter States
  const [leadFormData, setLeadFormData] = useState({
    cliente: '',
    contacto: '',
    puntos_medicion: 5,
    viaticos_estimados: 1000
  });

  const [newServiceAssignment, setNewServiceAssignment] = useState({
    cliente_nombre: '',
    fecha: '',
    id_tecnico: '',
    id_instrumento: ''
  });

  const handleAdminGenerateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadFormData.cliente || !leadFormData.contacto) {
      alert("Por favor rellene todos los campos obligatorios.");
      return;
    }

    const base = 3500;
    const pricePerPoint = 1800;
    const subtotal = base + (pricePerPoint * leadFormData.puntos_medicion) + leadFormData.viaticos_estimados;
    const costTotal = Math.round(subtotal * 1.16);

    const newQuote = {
      id: `COT-00${generatedQuotes.length + 1}`,
      cliente: leadFormData.cliente,
      servicio: "NOM-011-STPS (Ruido)",
      puntos: leadFormData.puntos_medicion,
      costo: costTotal,
      fecha: new Date().toISOString().split('T')[0],
      contacto: leadFormData.contacto,
      estado: "Enviado"
    };

    setGeneratedQuotes([newQuote, ...generatedQuotes]);

    const newInvoice = {
      id_factura: invoices.length + 1,
      cliente: leadFormData.cliente,
      monto: costTotal,
      estado: "Pendiente",
      vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    setInvoices([newInvoice, ...invoices]);

    alert(`Cotización generada correctamente para ${leadFormData.cliente} por $${costTotal.toLocaleString()}. Se ha registrado automáticamente una factura en estado Pendiente.`);
    setLeadFormData({
      cliente: '',
      contacto: '',
      puntos_medicion: 5,
      viaticos_estimados: 1000
    });
  };

  const handleCoordinatorAssignService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceAssignment.cliente_nombre || !newServiceAssignment.fecha || !newServiceAssignment.id_tecnico || !newServiceAssignment.id_instrumento) {
      alert("Por favor complete todos los campos obligatorios.");
      return;
    }

    const selectedInst = instruments.find(i => i.id_instrumento === newServiceAssignment.id_instrumento);
    const approvedCerts = certificates.filter(c => c.id_instrumento === newServiceAssignment.id_instrumento && c.estado_aprobacion === 'Aprobado');
    const hasVigente = approvedCerts.some(c => new Date(c.fecha_vencimiento) > new Date());
    
    if (!hasVigente) {
      alert("ERROR DE CONFIGURACIÓN NMX-17025: El equipo seleccionado no cuenta con calibración vigente aprobado ante la EMA. No puede operar.");
      return;
    }

    const techUser = usuarios.find(u => u.id_usuario === newServiceAssignment.id_tecnico);
    if (!techUser) return;

    const newService = {
      id_servicio: `SERV-${Date.now()}`,
      cliente_nombre: newServiceAssignment.cliente_nombre,
      servicio: "Mapeo de Ruido NOM-011",
      fecha: newServiceAssignment.fecha,
      id_tecnico: newServiceAssignment.id_tecnico,
      id_instrumento: selectedInst?.id_instrumento || "",
      tecnico: techUser.nombre_completo,
      instrumento: selectedInst?.codigo_interno || "",
      estado: "Asignado"
    };

    setScheduledServices([newService, ...scheduledServices]);

    // Audit Log Entry
    const newLog: AuditLog = {
      id_log: auditLogs.length + 1,
      id_usuario: activePersona.id_usuario,
      usuario_nombre: activePersona.nombre_completo,
      usuario_rol: activePersona.id_role || activePersona.id_rol,
      tabla_afectada: "asignacion_servicios",
      registro_id: newService.id_servicio,
      accion: "INSERT",
      valor_anterior: null,
      valor_nuevo: JSON.stringify(newService),
      justificacion_tecnica: `Asignación de instrumento calibrado (${selectedInst?.codigo_interno}) y técnico homologado (${techUser.nombre_completo}) conforme a procedimientos de calidad ISO 17025.`,
      hash_integridad: generarHashIntegridad(activePersona.id_usuario, "asignacion_servicios", newService.id_servicio, "INSERT", null, JSON.stringify(newService), "Asignacion"),
      ip_origen: "192.168.10.15",
      timestamp: new Date().toISOString()
    };
    saveStateToLocalStorage(undefined, undefined, undefined, [newLog, ...auditLogs]);

    alert(`Asignación exitosa: Equipo ${selectedInst?.codigo_interno} asignado al técnico ${techUser.nombre_completo} para el servicio.`);
    setNewServiceAssignment({
      cliente_nombre: '',
      fecha: '',
      id_tecnico: '',
      id_instrumento: ''
    });
  };

  // Filter instruments based on search
  const filteredInstruments = useMemo(() => {
    return instruments.filter(inst => {
      const q = searchQuery.toLowerCase();
      return inst.nombre.toLowerCase().includes(q) || 
             inst.codigo_interno.toLowerCase().includes(q) || 
             inst.marca.toLowerCase().includes(q) || 
             inst.modelo.toLowerCase().includes(q) ||
             inst.numero_serie.toLowerCase().includes(q);
    });
  }, [instruments, searchQuery]);

  // Calculate status summaries
  const stats = useMemo(() => {
    const today = new Date();
    let total = instruments.length;
    let vigentes = 0;
    let vencenPronto = 0;
    let vencidos = 0;
    let fueraServicio = 0;

    instruments.forEach(i => {
      if (i.estado_operativo === 'Fuera de Servicio') {
        fueraServicio++;
        return;
      }

      // Get latest approved cert
      const activeCert = certificates
        .filter(c => c.id_instrumento === i.id_instrumento && c.estado_aprobacion === 'Aprobado')
        .sort((a, b) => new Date(b.fecha_vencimiento).getTime() - new Date(a.fecha_vencimiento).getTime())[0];

      if (!activeCert) {
        vencidos++;
        return;
      }

      const expiryDate = new Date(activeCert.fecha_vencimiento);
      const timeDiff = expiryDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysDiff < 0) {
        vencidos++;
      } else if (daysDiff <= 30) {
        vencenPronto++;
      } else {
        vigentes++;
      }
    });

    return { total, vigentes, vencenPronto, vencidos, fueraServicio };
  }, [instruments, certificates]);

  // Dynamic financial computations for Director and Sales
  const financials = useMemo(() => {
    const totalCotizado = generatedQuotes.reduce((acc, q) => acc + q.costo, 0);
    const totalFacturado = invoices.reduce((acc, inv) => acc + inv.monto, 0);
    const totalRecaudado = invoices.filter(inv => inv.estado === 'Pagado').reduce((acc, inv) => acc + inv.monto, 0);
    const totalPendiente = invoices.filter(inv => inv.estado === 'Pendiente').reduce((acc, inv) => acc + inv.monto, 0);
    const totalVencido = invoices.filter(inv => inv.estado === 'Vencido').reduce((acc, inv) => acc + inv.monto, 0);
    return { totalCotizado, totalFacturado, totalRecaudado, totalPendiente, totalVencido };
  }, [generatedQuotes, invoices]);

  const handleToggleJornada = () => {
    if (!jornadaIniciada) {
      setJornadaIniciada(true);
      setJornadaStartTime(new Date().toLocaleTimeString('es-MX'));
      setJornadaGPS("25.4382, -100.9734 (Zona Industrial Saltillo)");
    } else {
      setJornadaIniciada(false);
      setJornadaStartTime("");
      setJornadaGPS("");
    }
  };

  // Director-Specific States and Handlers
  const [rbacSimAction, setRbacSimAction] = useState<string>("calibracion:aprobar");
  const [rbacSimResult, setRbacSimResult] = useState<any>(null);

  const handleTestRbac = (actionId: string) => {
    const hasPerm = checkPermission(currentPersonaId, actionId);
    setRbacSimResult({
      checkedPersona: activePersona.nombre_completo,
      role: activePersona.id_role || activePersona.id_rol,
      permissionTested: actionId,
      granted: hasPerm,
      timestamp: new Date().toLocaleTimeString('es-MX')
    });
  };

  const handleApproveCertificate = async (cert: CertificadoCalibracion) => {
    const justif = prompt("Especifique la Justificación Técnica de Aprobación para este Certificado (Mínimo 5 caracteres):");
    if (!justif || justif.trim().length < 5) {
      alert("Error (NMX-17025): Justificación obligatoria requerida de al menos 5 caracteres.");
      return;
    }

    try {
      const response = await fetch(`/api/certificados/aprobar/${cert.id_certificado}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          justificacion: justif,
          firmante_id: activePersona.id_usuario,
          firmante_rol: activePersona.id_role || activePersona.id_rol
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        alert(`Error del Servidor: ${errData.error || "Fallo en la firma digital."}`);
        return;
      }

      const resData = await response.json();
      const serverSello = resData.sello_digital;

      const updatedCerts = certificates.map(c => {
        if (c.id_certificado === cert.id_certificado) {
          return {
            ...c,
            estado_aprobacion: 'Aprobado' as const,
            aprobado_por: activePersona.nombre_completo,
            fecha_aprobacion: new Date().toISOString().split('T')[0],
            justificacion_aprobacion: justif,
            sello_digital_nom151: serverSello || `NOM151:SELLO-${Date.now()}`
          };
        }
        return c;
      });

      const updatedInsts = instruments.map(i => 
        i.id_instrumento === cert.id_instrumento ? { ...i, estado_operativo: "Operativo" as const } : i
      );

      const newLog: AuditLog = {
        id_log: auditLogs.length + 1,
        id_usuario: activePersona.id_usuario,
        usuario_nombre: activePersona.nombre_completo,
        usuario_rol: activePersona.id_role || activePersona.id_rol,
        tabla_afectada: "certificados_calibracion",
        registro_id: cert.id_certificado,
        accion: "SIGN",
        valor_anterior: JSON.stringify(cert),
        valor_nuevo: JSON.stringify(updatedCerts.find(c => c.id_certificado === cert.id_certificado)),
        justificacion_tecnica: `Firma y aprobación del certificado de calibración ${cert.numero_certificado} por el Director. Justificación: ${justif}`,
        hash_integridad: serverSello,
        ip_origen: "192.168.10.15",
        timestamp: new Date().toISOString()
      };

      saveStateToLocalStorage(undefined, updatedInsts, updatedCerts, [newLog, ...auditLogs]);
      alert("Certificado firmado digitalmente y aprobado bajo NOM-151-SCFI-2016 en el servidor seguro.");
    } catch (err) {
      console.error(err);
      alert("Fallo de conexión con el servidor de firmas criptográficas.");
    }
  };

  const handleToggleInvoiceStatus = (id: number) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id_factura === id) {
        const nextStatus = inv.estado === 'Pendiente' ? 'Pagado' : inv.estado === 'Pagado' ? 'Vencido' : 'Pendiente';
        return { ...inv, estado: nextStatus };
      }
      return inv;
    }));
  };

  const handleCoordinatorReviewReport = (reportId: string, approve: boolean, technicalJustification: string) => {
    if (!technicalJustification || technicalJustification.trim().length < 5) {
      alert("Error (NMX-17025): Debe proporcionar una Justificación Técnica científica obligatoria de al menos 5 caracteres para auditar este cambio.");
      return;
    }

    const report = submittedReports.find(r => r.id_reporte === reportId);
    if (!report) return;

    const previousStatus = report.estado;
    const nextStatus = approve ? "Aprobado" : "Rechazado";

    const updatedReports = submittedReports.map(r => {
      if (r.id_reporte === reportId) {
        return {
          ...r,
          estado: nextStatus,
          aprobado_por: activePersona.nombre_completo,
          justificacion_coordinador: technicalJustification,
          timestamp_revision: new Date().toISOString()
        };
      }
      return r;
    });

    localStorage.setItem('aspechs_submitted_reports', JSON.stringify(updatedReports));
    setSubmittedReports(updatedReports);

    // Create detailed Audit Trail JSON Payload (Point 3)
    const auditValueAnterior = { id_reporte: reportId, estado: previousStatus };
    const auditValueNuevo = { 
      id_reporte: reportId, 
      estado: nextStatus, 
      revisado_por: activePersona.nombre_completo, 
      rol: activePersona.id_role || activePersona.id_rol,
      justificacion_tecnica: technicalJustification 
    };

    const hash = generarHashIntegridad(
      activePersona.id_usuario,
      "reportes_campo",
      reportId,
      "UPDATE",
      JSON.stringify(auditValueAnterior),
      JSON.stringify(auditValueNuevo),
      technicalJustification
    );

    const newLog: AuditLog = {
      id_log: auditLogs.length + 1,
      id_usuario: activePersona.id_usuario,
      usuario_nombre: activePersona.nombre_completo,
      usuario_rol: activePersona.id_role || activePersona.id_rol,
      tabla_afectada: "reportes_campo",
      registro_id: reportId,
      accion: "UPDATE",
      valor_anterior: JSON.stringify(auditValueAnterior),
      valor_nuevo: JSON.stringify(auditValueNuevo),
      justificacion_tecnica: technicalJustification,
      hash_integridad: hash,
      ip_origen: "192.168.10.12",
      timestamp: new Date().toISOString()
    };

    saveStateToLocalStorage(undefined, undefined, undefined, [newLog, ...auditLogs]);
    alert(`Reporte ${approve ? 'Aprobado' : 'Rechazado'} correctamente. Se ha generado un registro inalterable de auditoría (NMX-17025).`);
  };

  const handleResetData = () => {
    if (confirm("¿Estás seguro de que deseas restablecer los datos originales de la simulación? Se perderán los registros que hayas agregado.")) {
      localStorage.removeItem('aspechs_usuarios');
      localStorage.removeItem('aspechs_instruments');
      localStorage.removeItem('aspechs_certificates');
      localStorage.removeItem('aspechs_audit_logs');
      localStorage.removeItem('aspechs_submitted_reports');
      setUsuarios(INITIAL_USUARIOS);
      setInstruments(INITIAL_INSTRUMENTOS);
      setCertificates(INITIAL_CERTIFICADOS);
      setAuditLogs(INITIAL_AUDIT_LOGS);
      handleResetFieldForm();
    }
  };

  const handleResetFieldForm = () => {
    setFieldStep(1);
    setFieldCheckinCoords("");
    setFieldCheckinTime("");
    setFieldEppChecked({
      casco: false,
      tapones: false,
      calzado: false,
      chaleco: false
    });
    setFieldSonometerId("");
    setFieldArea("");
    setFieldStartTime("");
    setFieldEndTime("");
    setFieldReadings([
      { db: 84.5, conditions: "Operación de calderas baja, viento de 1.2 m/s" },
      { db: 87.2, conditions: "Operación de calderas media, ventilación activa" }
    ]);
    setFieldRepName("");
    setFieldRepPuesto("");
    setFieldIsLocked(false);
    setFieldHash("");
    setFieldConstanciaNOM151("");
  };

  const handleFieldGPSCheckIn = () => {
    const mockLat = (25.7785 + Math.random() * 0.01).toFixed(6);
    const mockLng = (-100.1873 - Math.random() * 0.01).toFixed(6);
    setFieldCheckinCoords(`${mockLat}, ${mockLng}`);
    setFieldCheckinTime(new Date().toLocaleTimeString('es-MX'));
    setFieldStep(2); // Auto proceed to PPE Checklist
  };

  const handleFieldSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldCheckinCoords) {
      alert("Error: Es obligatorio realizar el Check-in geolocalizado antes de capturar el formulario (NOM-151/Trazabilidad).");
      return;
    }

    if (!fieldEppChecked.casco || !fieldEppChecked.tapones || !fieldEppChecked.calzado || !fieldEppChecked.chaleco) {
      alert("Error: Debe confirmar el uso de todo el Equipo de Protección Personal (EPP) obligatorio antes de registrar lecturas.");
      return;
    }

    if (!fieldSonometerId) {
      alert("Error: Seleccione el sonómetro utilizado para la medición.");
      return;
    }

    // Validate if selected sonometer has an active approved calibration certificate
    const sonoInst = instruments.find(i => i.id_instrumento === fieldSonometerId || i.codigo_interno === fieldSonometerId);
    const resolvedId = sonoInst?.id_instrumento || fieldSonometerId;
    const approvedCerts = certificates.filter(c => c.id_instrumento === resolvedId && c.estado_aprobacion === 'Aprobado');
    const hasVigente = approvedCerts.some(c => new Date(c.fecha_vencimiento) > new Date());

    if (!hasVigente) {
      alert(`Error Metrológico (NMX-17025): El sonómetro seleccionado (${sonoInst?.codigo_interno || fieldSonometerId}) NO cuenta con un certificado de calibración vigente aprobado ante la EMA. No es posible guardar un registro inválido legalmente ante la STPS.`);
      return;
    }

    if (!fieldArea || !fieldStartTime || !fieldEndTime) {
      alert("Error: Complete los datos del punto de medición.");
      return;
    }

    if (fieldReadings.length === 0) {
      alert("Error: Debe agregar al menos una lectura de nivel de ruido.");
      return;
    }

    // All checks pass! Construct final payload
    const reportId = `REP-NOM011-2026-00${submittedReports.length + 1}`;
    const activeCert = approvedCerts.find(c => new Date(c.fecha_vencimiento) > new Date());

    const finalPayload = {
      id_reporte: reportId,
      datos_sitio: {
        empresa_cliente: "Industrias Unidas Mexicanas S.A.",
        ubicacion_planta: "Planta Toluca, Edificio de Prensas",
        coordenadas_gps: fieldCheckinCoords,
        fecha_medicion: new Date().toISOString().split('T')[0],
        checkin_hora: fieldCheckinTime
      },
      epp_verificado: {
        casco: fieldEppChecked.casco,
        tapones_auditivos_orejeras: fieldEppChecked.tapones,
        calzado_seguridad: fieldEppChecked.calzado,
        chaleco_reflejante: fieldEppChecked.chaleco,
        timestamp_epp_check: new Date().toISOString()
      },
      instrumento_utilizado: {
        id_instrumento: resolvedId,
        codigo_interno: sonoInst?.codigo_interno,
        nombre: sonoInst?.nombre,
        marca: sonoInst?.marca,
        modelo: sonoInst?.modelo,
        certificado_calibracion_vigente: activeCert?.numero_certificado,
        fecha_vencimiento_calibracion: activeCert?.fecha_vencimiento
      },
      punto_medicion: {
        id_punto: "P-FIELD",
        area_descripcion: fieldArea,
        hora_inicio: fieldStartTime,
        hora_fin: fieldEndTime
      },
      lecturas: fieldReadings.map((r, index) => ({
        numero: index + 1,
        hora: new Date().toLocaleTimeString('es-MX'),
        decibelios_db_a: Number(r.db),
        conditions: r.conditions
      })),
      firmas_conformidad: {
        firma_tecnico: `${activePersona.nombre_completo} (LAB_TECH)`,
        huella_digital_tecnico: `e.firma:${generarHashIntegridad(activePersona.nombre_completo, "campo", reportId, "SIGN", null, null, "Tecnico").substring(0, 32)}`,
        firma_representante_planta: fieldRepName,
        puesto_representante: fieldRepPuesto || "Supervisor de Planta",
        timestamp_firmas: new Date().toISOString()
      },
      nom151_integridad: {
        hash_documento_sha256: "", // will fill below
        constancia_psc: `NOM151:CONSTANCIA-${new Date().getFullYear()}-FIELD-${Math.floor(Math.random() * 89999) + 10000}`,
        esta_bloqueado: true
      }
    };

    // Generate SHA-256 equivalent for whole document
    const payloadString = JSON.stringify(finalPayload);
    const hash = generarHashIntegridad(activePersona.nombre_completo, "reportes_campo", reportId, "INSERT", null, payloadString, "Cierre de Levantamiento");
    finalPayload.nom151_integridad.hash_documento_sha256 = hash;

    const newReportRecord = {
      id_reporte: reportId,
      tecnico: activePersona.nombre_completo,
      fecha: finalPayload.datos_sitio.fecha_medicion,
      estado: "Pendiente",
      payload: finalPayload
    };

    const updatedReports = [newReportRecord, ...submittedReports];
    localStorage.setItem('aspechs_submitted_reports', JSON.stringify(updatedReports));
    setSubmittedReports(updatedReports);

    // Lock local form
    setFieldIsLocked(true);
    setFieldHash(hash);
    setFieldConstanciaNOM151(finalPayload.nom151_integridad.constancia_psc);
    setFieldStep(5); // Show completed step

    // Call real server API for NOM-151 digital signature of field sheet!
    fetch(`/api/hojas-campo/firmar/${reportId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gps_coordenadas: fieldCheckinCoords,
        firma_nombre_cliente: fieldRepName,
        lecturas_por_norma: {
          nom011: fieldReadings.map(r => ({ db: Number(r.db), conditions: r.conditions, area: fieldArea }))
        }
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log("NOM-151 Digital Sello generated by secure server:", data.firma_hash);
      if (data.firma_hash) {
        setFieldHash(data.firma_hash);
      }
    })
    .catch(err => console.error("Error signing field sheet via API:", err));

    // Audit Log Entry
    const newLog: AuditLog = {
      id_log: auditLogs.length + 1,
      id_usuario: activePersona.id_usuario,
      usuario_nombre: activePersona.nombre_completo,
      usuario_rol: activePersona.id_role || activePersona.id_rol,
      tabla_afectada: "reportes_campo",
      registro_id: reportId,
      accion: "INSERT",
      valor_anterior: null,
      valor_nuevo: JSON.stringify(finalPayload),
      justificacion_tecnica: `Levantamiento en sitio NOM-011-STPS finalizado y bloqueado criptográficamente bajo NOM-151-SCFI-2016 por el técnico de campo.`,
      hash_integridad: hash,
      ip_origen: "192.168.43.12", // mobile hotspot
      timestamp: new Date().toISOString()
    };

    saveStateToLocalStorage(undefined, undefined, undefined, [newLog, ...auditLogs]);
    alert("¡Levantamiento Finalizado con Éxito! El formulario ha sido bloqueado para edición (NOM-151) y enviado a revisión del Coordinador.");
  };

  const sidebarItems = useMemo(() => {
    return getSidebarItems(selectedRole);
  }, [selectedRole]);

  if (selectedRole === null) {
    return <HomeSelection onSelectRole={(roleId, personaId) => { 
      setSelectedRole(roleId); 
      setCurrentPersonaId(personaId); 
      const items = getSidebarItems(roleId);
      if (items.length > 0) {
        setActiveTab(items[0].id);
      }
    }} />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-100 text-slate-800 overflow-hidden font-sans">
      
      {/* DESKTOP SIDEBAR WITH CORPORATE BRANDING BG #85AA1C */}
      <aside 
        className="w-64 text-white hidden md:flex flex-col border-r border-slate-200 shrink-0 shadow-lg justify-between"
        style={{ backgroundColor: '#85AA1C' }}
      >
        <div className="p-6">
          <div className="flex flex-col items-center gap-2 mb-8 border-b border-white/20 pb-6">
            <img 
              src="https://appdesignproyectos.com//asplogo.jpg" 
              alt="Logo ASP" 
              className="h-16 w-auto object-contain rounded-xl shadow-md border border-white/10"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-sm font-bold tracking-wider text-white font-mono uppercase mt-1">ASP / ECH&S</h1>
          </div>
          
          <nav className="space-y-1">
            {sidebarItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-left text-xs font-semibold ${
                    isActive
                      ? 'text-[#85AA1C] bg-white font-bold shadow-md'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          
          <div className="mt-6 pt-6 border-t border-white/20">
            <button
              onClick={() => setSelectedRole(null)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-left text-xs font-bold text-white hover:bg-white/10 hover:text-red-100 cursor-pointer"
            >
              <Home className="w-4.5 h-4.5 shrink-0 text-red-100" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
        
        {/* Footnotes / Certification indicators */}
        <div className="p-6 border-t border-white/15 space-y-4 bg-black/10">
          <div>
            <div className="text-[10px] uppercase font-bold text-white/80 font-mono tracking-wider">Acreditación EMA</div>
            <p className="text-[10.5px] text-white/75 leading-relaxed font-light mt-0.5">
              Laboratorio de Metrología autorizado conforme a NMX-EC-17025-IMNC.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="px-2 py-0.5 bg-black/20 text-[9px] rounded border border-white/10 font-mono text-white">NMX-17025</span>
            <span className="px-2 py-0.5 bg-black/20 text-[9px] rounded border border-white/10 font-mono text-white">NOM-151</span>
          </div>
        </div>
      </aside>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />
            <aside 
              className="relative w-64 text-white flex flex-col p-6 h-full justify-between"
              style={{ backgroundColor: '#85AA1C' }}
            >
              <div>
                <div className="flex items-center justify-between mb-8 border-b border-white/20 pb-4">
                  <div className="flex items-center gap-2">
                    <img 
                      src="https://appdesignproyectos.com//asplogo.jpg" 
                      alt="Logo ASP" 
                      className="h-10 w-auto object-contain rounded"
                      referrerPolicy="no-referrer"
                    />
                    <h1 className="text-xs font-bold tracking-wider text-white font-mono uppercase">ASP / ECH&S</h1>
                  </div>
                  <button onClick={() => setIsMobileSidebarOpen(false)} className="text-white text-lg font-bold p-1">×</button>
                </div>
                
                <nav className="space-y-1">
                  {sidebarItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setIsMobileSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-left text-xs font-semibold ${
                          isActive
                            ? 'text-[#85AA1C] bg-white font-bold shadow-md'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <button
                    onClick={() => { setSelectedRole(null); setIsMobileSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-left text-xs font-bold text-white hover:bg-white/10 hover:text-red-100 cursor-pointer"
                  >
                    <Home className="w-4.5 h-4.5 shrink-0 text-red-100" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-white/15 pt-4 space-y-2 bg-black/5 p-4 rounded-lg">
                <span className="text-[10px] font-bold text-white uppercase font-mono">Conformidad Legal</span>
                <p className="text-[10px] text-white/80">Sello digital inalterable activo para {activePersona.nombre_completo}.</p>
              </div>
            </aside>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOP HEADER COMPONENT & ROLE SIMULATOR SANDBOX */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200 md:hidden transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5 uppercase font-mono">
                ASP/ECH&S
              </h2>
              <p className="text-[11px] text-slate-500 font-light">Portal de Aseguramiento de Calidad y Trazabilidad Metrológica</p>
            </div>
          </div>

          {/* SIMULADOR DE PERSONA / CAMBIO DE ROL */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-stretch sm:self-auto">
            {/* Volver a Selección de Roles / Cerrar Sesión */}
            <button
              onClick={() => setSelectedRole(null)}
              className="flex items-center justify-center gap-2 px-3.5 py-1.5 bg-[#85AA1C] hover:bg-[#739418] text-white rounded-xl text-xs font-bold transition-all duration-200 shadow-sm shrink-0 cursor-pointer hover:shadow-md"
              title="Volver a la Pantalla de Inicio de Roles"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Cambiar de Rol</span>
            </button>

            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <div className="text-left">
                  <div className="text-[10px] font-mono uppercase font-bold text-slate-400 leading-none">Simulador de Roles (RBAC)</div>
                  <div className="text-[11px] font-semibold text-slate-800 leading-tight">{activePersona.nombre_completo}</div>
                </div>
              </div>

              <div className="relative flex items-center">
                <select
                  id="role-switcher-select"
                  value={currentPersonaId}
                  onChange={(e) => setCurrentPersonaId(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 px-3 py-1 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-[#85AA1C] cursor-pointer font-sans"
                >
                  {usuarios.map(u => {
                    let roleLabel = "Director";
                    if (u.id_role === 'LAB_SUP' || u.id_rol === 'LAB_SUP') roleLabel = "Coordinador";
                    if (u.id_role === 'LAB_TECH' || u.id_rol === 'LAB_TECH') roleLabel = "Técnico";
                    if (u.id_role === 'SYS_ADMIN' || u.id_rol === 'SYS_ADMIN') roleLabel = "Ventas/Admin";
                    return (
                      <option key={u.id_usuario} value={u.id_usuario}>
                        {roleLabel}: {u.nombre_completo.split(' ')[0]}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2 pointer-events-none" />
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE SCREEN RENDERING AREA */}
        <div className="p-6 md:p-8 max-w-7xl w-full mx-auto flex-1">
          <AnimatePresence mode="wait">
            
            {/* DIRECTOR VIEWS CONTAINER */}
            {getRoleCategory(selectedRole) === 'director' && (
              <DirectorViews
                activePersona={activePersona}
                selectedRole={selectedRole || undefined}
                stats={stats}
                financials={financials}
                instruments={instruments}
                certificates={certificates}
                usuarios={usuarios}
                auditLogs={auditLogs}
                activeTab={mapActiveTabToInternal(selectedRole, activeTab)}
                setActiveTab={setActiveTab}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filteredInstruments={filteredInstruments}
                isAddEquipOpen={isAddEquipOpen}
                setIsAddEquipOpen={setIsAddEquipOpen}
                newEquip={newEquip}
                setNewEquip={setNewEquip}
                handleAddEquipment={handleAddEquipment}
                selectedEquipForCalibration={selectedEquipForCalibration}
                setSelectedEquipForCalibration={setSelectedEquipForCalibration}
                newCertificate={newCertificate}
                setNewCertificate={setNewCertificate}
                handleRegisterCalibration={handleRegisterCalibration}
                selectedEquipForEdit={selectedEquipForEdit}
                setSelectedEquipForEdit={setSelectedEquipForEdit}
                editFormFields={editFormFields}
                setEditFormFields={setEditFormFields}
                editJustification={editJustification}
                setEditJustification={setEditJustification}
                handleSaveInstrumentEdits={handleSaveInstrumentEdits}
                startEditInstrument={startEditInstrument}
                handleApproveCertificate={handleApproveCertificate}
                currentPersonaId={currentPersonaId}
                setCurrentPersonaId={setCurrentPersonaId}
                rbacSimAction={rbacSimAction}
                setRbacSimAction={setRbacSimAction}
                rbacSimResult={rbacSimResult}
                setRbacSimResult={setRbacSimResult}
                handleTestRbac={handleTestRbac}
                checkPermission={checkPermission}
                INITIAL_ROLES={INITIAL_ROLES}
                INITIAL_PERMISOS={INITIAL_PERMISOS}
                ROLE_PERMISSIONS_MAP={ROLE_PERMISSIONS_MAP}
                DB_SCHEMA_SQL={DB_SCHEMA_SQL}
                scheduledServices={scheduledServices}
                submittedReports={submittedReports}
                purchaseOrders={purchaseOrders}
              />
            )}

            {/* COORDINATOR VIEWS CONTAINER */}
            {getRoleCategory(selectedRole) === 'coordinator' && (
              <CoordinatorViews
                activePersona={activePersona}
                selectedRole={selectedRole || undefined}
                instruments={instruments}
                certificates={certificates}
                usuarios={usuarios}
                activeTab={mapActiveTabToInternal(selectedRole, activeTab)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filteredInstruments={filteredInstruments}
                isAddEquipOpen={isAddEquipOpen}
                setIsAddEquipOpen={setIsAddEquipOpen}
                newEquip={newEquip}
                setNewEquip={setNewEquip}
                handleAddEquipment={handleAddEquipment}
                selectedEquipForCalibration={selectedEquipForCalibration}
                setSelectedEquipForCalibration={setSelectedEquipForCalibration}
                newCertificate={newCertificate}
                setNewCertificate={setNewCertificate}
                handleRegisterCalibration={handleRegisterCalibration}
                selectedEquipForEdit={selectedEquipForEdit}
                setSelectedEquipForEdit={setSelectedEquipForEdit}
                editFormFields={editFormFields}
                setEditFormFields={setEditFormFields}
                editJustification={editJustification}
                setEditJustification={setEditJustification}
                handleSaveInstrumentEdits={handleSaveInstrumentEdits}
                startEditInstrument={startEditInstrument}
                checkPermission={checkPermission}
                
                scheduledServices={scheduledServices}
                setScheduledServices={setScheduledServices}
                newServiceAssignment={newServiceAssignment}
                setNewServiceAssignment={setNewServiceAssignment}
                handleAssignService={handleCoordinatorAssignService}
                
                submittedReports={submittedReports}
                handleCoordinatorReviewReport={handleCoordinatorReviewReport}
                purchaseOrders={purchaseOrders}
                setPurchaseOrders={setPurchaseOrders}
              />
            )}

            {/* TECHNICIAN VIEWS CONTAINER */}
            {getRoleCategory(selectedRole) === 'technician' && (
              <TechnicianViews
                activePersona={activePersona}
                selectedRole={selectedRole || undefined}
                instruments={instruments}
                activeTab={mapActiveTabToInternal(selectedRole, activeTab)}
                setActiveTab={setActiveTab}
                fieldStep={fieldStep}
                setFieldStep={setFieldStep}
                fieldCheckinCoords={fieldCheckinCoords}
                fieldCheckinTime={fieldCheckinTime}
                fieldEppChecked={fieldEppChecked}
                setFieldEppChecked={setFieldEppChecked}
                fieldSonometerId={fieldSonometerId}
                setFieldSonometerId={setFieldSonometerId}
                fieldArea={fieldArea}
                setFieldArea={setFieldArea}
                fieldStartTime={fieldStartTime}
                setFieldStartTime={setFieldStartTime}
                fieldEndTime={fieldEndTime}
                setFieldEndTime={setFieldEndTime}
                fieldReadings={fieldReadings}
                setFieldReadings={setFieldReadings}
                fieldIsLocked={fieldIsLocked}
                setFieldIsLocked={setFieldIsLocked}
                fieldRepSignature={fieldRepName}
                setFieldRepSignature={setFieldRepName}
                fieldRepName={fieldRepName}
                setFieldRepName={setFieldRepName}
                fieldSello={fieldConstanciaNOM151}
                setFieldSello={setFieldConstanciaNOM151}
                
                handleFieldGPSCheckIn={handleFieldGPSCheckIn}
                handleFieldSubmitForm={handleFieldSubmitForm}
                handleResetFieldForm={handleResetFieldForm}
                
                scheduledServices={scheduledServices}
                isJornadaIniciada={jornadaIniciada}
                horaInicioJornada={jornadaStartTime}
                handleToggleJornada={handleToggleJornada}
                submittedReports={submittedReports}
              />
            )}

            {/* ADMIN VIEWS CONTAINER */}
            {getRoleCategory(selectedRole) === 'admin' && (
              <AdminViews
                activePersona={activePersona}
                selectedRole={selectedRole || undefined}
                activeTab={mapActiveTabToInternal(selectedRole, activeTab)}
                usuarios={usuarios}
                leadFormData={leadFormData}
                setLeadFormData={setLeadFormData}
                generatedQuotes={generatedQuotes}
                handleGenerateQuote={handleAdminGenerateQuote}
                invoices={invoices}
                handleToggleInvoiceStatus={handleToggleInvoiceStatus}
                financials={financials}
                DB_SCHEMA_SQL={DB_SCHEMA_SQL}
                purchaseOrders={purchaseOrders}
                setPurchaseOrders={setPurchaseOrders}
                reportTemplates={reportTemplates}
                setReportTemplates={setReportTemplates}
                submittedReports={submittedReports}
              />
            )}

          </AnimatePresence>
        </div>

        {/* COMPREHENSIVE FOOTER */}
        <footer className="py-8 text-center text-[10.5px] text-slate-400 border-t border-slate-200 mt-12 space-y-1 select-none">
          <p className="font-semibold text-slate-600">ASP/EcH&S Portal de Operaciones v1.0</p>
          <p>Diseñado para cumplimiento riguroso bajo las normativas vigentes de la STPS y la EMA.</p>
          <p className="font-mono text-[9px] text-slate-400 uppercase tracking-wider">CONFORMIDAD • NMX-EC-17025 • NOM-151-SCFI-2016 • LEY DE FIRMA ELECTRÓNICA AVANZADA • LFPDPPP</p>
        </footer>

      </main>

    </div>
  );
}
