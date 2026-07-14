import React, { useState, useMemo } from 'react';
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
  FileCheck
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

export default function App() {
  // Tab State
  const [activeTab, setActiveTab] = useState<'home' | 'schema' | 'rbac' | 'audit' | 'equipment' | 'regulation' | 'field_workflow'>('home');

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
  const [fieldTechName, setFieldTechName] = useState<string>("");
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

  const [coordinatorJustifications, setCoordinatorJustifications] = useState<Record<string, string>>({});

  // Dynamic Home/Dashboard States
  const [jornadaIniciada, setJornadaIniciada] = useState<boolean>(false);
  const [jornadaStartTime, setJornadaStartTime] = useState<string>("");
  const [jornadaGPS, setJornadaGPS] = useState<string>("");

  // Cotizador States for Admin/Ventas
  const [quoteType, setQuoteType] = useState<string>("NOM-011-STPS");
  const [quotePoints, setQuotePoints] = useState<number>(5);
  const [quoteDistance, setQuoteDistance] = useState<number>(20);
  const [quoteClient, setQuoteClient] = useState<string>("Arneses del Eje S.A.");
  const [generatedQuotes, setGeneratedQuotes] = useState<any[]>([
    { id: "COT-001", cliente: "Vidriera del Norte", servicio: "NOM-011-STPS (Ruido)", puntos: 10, costo: 24500, fecha: "2026-07-10", estado: "Enviado" },
    { id: "COT-002", cliente: "Papelera de Occidente", servicio: "NOM-015-STPS (Térmicas)", puntos: 4, costo: 15200, fecha: "2026-07-12", estado: "Aceptado" },
  ]);

  // Invoice control state for Admin/Ventas and Director
  const [invoices, setInvoices] = useState<any[]>([
    { id: "FAC-1002", cliente: "Vidriera del Norte", monto: 24500, estado: "Pendiente", vencimiento: "2026-08-10" },
    { id: "FAC-1001", cliente: "Papelera de Occidente", monto: 15200, estado: "Pagado", vencimiento: "2026-07-30" },
    { id: "FAC-1000", cliente: "Cementos de Hidalgo", monto: 45000, estado: "Pagado", vencimiento: "2026-06-15" },
    { id: "FAC-0999", cliente: "Metales de Saltillo", monto: 18900, estado: "Vencido", vencimiento: "2026-07-01" },
  ]);

  // Service Calendar Tasks for Coordinador
  const [scheduledServices, setScheduledServices] = useState<any[]>([
    { id: "SERV-101", cliente: "Arneses del Eje S.A.", servicio: "Mapeo de Ruido NOM-011", fecha: "2026-07-15", tecnico: "Lucía Juárez", instrumento: "SON-819", estado: "Asignado" },
    { id: "SERV-102", cliente: "Química de Coahuila S.A.", servicio: "Calibración de Flujo", fecha: "2026-07-16", tecnico: "Pendiente", instrumento: "Pendiente", estado: "Pendiente Asignación" },
    { id: "SERV-103", cliente: "Lácteos del Bajío S.A. de C.V.", servicio: "Estrés Térmico NOM-015", fecha: "2026-07-18", tecnico: "Pendiente", instrumento: "Pendiente", estado: "Pendiente Asignación" },
    { id: "SERV-104", cliente: "Refinería Monterrey S.A.", servicio: "Medición Perimetral NMX-R-046", fecha: "2026-07-20", tecnico: "Lucía Juárez", instrumento: "SON-819", estado: "Asignado" },
  ]);

  // Instrument assignments state
  const [selectedInstAssign, setSelectedInstAssign] = useState<string>("");
  const [selectedTechAssign, setSelectedTechAssign] = useState<string>("");
  const [selectedServAssign, setSelectedServAssign] = useState<string>("");

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

  // UI state variables
  const [sqlCopied, setSqlCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // RBAC Simulator States
  const [rbacSimAction, setRbacSimAction] = useState<string>("calibracion:aprobar");
  const [rbacSimResult, setRbacSimResult] = useState<{
    allowed: boolean;
    reason: string;
    details?: string;
  } | null>(null);

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
    const allowedPermissions = ROLE_PERMISSIONS_MAP[user.id_rol] || [];
    return allowedPermissions.includes(permissionId);
  };

  // Handle SQL copy
  const handleCopySql = () => {
    navigator.clipboard.writeText(DB_SCHEMA_SQL);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  // Download SQL as file
  const handleDownloadSql = () => {
    const element = document.createElement("a");
    const file = new Blob([DB_SCHEMA_SQL], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "asp_echs_schema.sql";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Execute RBAC Simulation test
  const handleTestRbac = (actionKey: string) => {
    const hasPerm = checkPermission(currentPersonaId, actionKey);
    const permDetail = INITIAL_PERMISOS.find(p => p.id_permiso === actionKey);
    
    if (hasPerm) {
      setRbacSimResult({
        allowed: true,
        reason: "ACCESO AUTORIZADO (Cumplimiento LFPDPPP & NMX-17025)",
        details: `El usuario ${activePersona.nombre_completo} posee el rol [${activePersona.id_rol}] el cual tiene asignado explícitamente el permiso '${actionKey}' (${permDetail?.descripcion || ""}).`
      });
      
      // Log successful security check to audit log
      const newLog: AuditLog = {
        id_log: auditLogs.length + 1,
        id_usuario: activePersona.id_usuario,
        usuario_nombre: activePersona.nombre_completo,
        usuario_rol: activePersona.id_rol,
        tabla_afectada: "seguridad_rbac",
        registro_id: actionKey,
        accion: "LOGIN",
        valor_anterior: null,
        valor_nuevo: JSON.stringify({ simulacion: "test_exitoso", permiso: actionKey }),
        justificacion_tecnica: `Validación rutinaria de privilegios de acceso para la acción '${actionKey}' realizada de forma correcta en el Portal de Operaciones.`,
        hash_integridad: generarHashIntegridad(
          activePersona.id_usuario,
          "seguridad_rbac",
          actionKey,
          "LOGIN",
          null,
          JSON.stringify({ simulacion: "test_exitoso", permiso: actionKey }),
          "Validación rutinaria de privilegios"
        ),
        ip_origen: "192.168.10.15",
        timestamp: new Date().toISOString()
      };
      saveStateToLocalStorage(undefined, undefined, undefined, [newLog, ...auditLogs]);
    } else {
      setRbacSimResult({
        allowed: false,
        reason: "ACCESO RESTRINGIDO (Brecha de Seguridad Prevenida - LFPDPPP)",
        details: `El usuario ${activePersona.nombre_completo} con rol [${activePersona.id_rol}] NO cuenta con el permiso '${actionKey}'. Esta acción requiere privilegios de seguridad que previenen fugas de información o alteraciones no trazables.`
      });

      // Log unauthorized attempt to audit log
      const newLog: AuditLog = {
        id_log: auditLogs.length + 1,
        id_usuario: activePersona.id_usuario,
        usuario_nombre: activePersona.nombre_completo,
        usuario_rol: activePersona.id_rol,
        tabla_afectada: "seguridad_rbac",
        registro_id: actionKey,
        accion: "LOGIN",
        valor_anterior: null,
        valor_nuevo: JSON.stringify({ simulacion: "intento_denegado", permiso: actionKey, riesgo: "alto" }),
        justificacion_tecnica: `ALERTA DE SEGURIDAD: Intento de ejecución no autorizado de la acción '${actionKey}' por el usuario con privilegios insuficientes.`,
        hash_integridad: generarHashIntegridad(
          activePersona.id_usuario,
          "seguridad_rbac",
          actionKey,
          "LOGIN",
          null,
          JSON.stringify({ simulacion: "intento_denegado", permiso: actionKey }),
          "Intento de ejecución no autorizado"
        ),
        ip_origen: "192.168.10.15",
        timestamp: new Date().toISOString()
      };
      saveStateToLocalStorage(undefined, undefined, undefined, [newLog, ...auditLogs]);
    }
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
    
    // Log creation
    const newLog: AuditLog = {
      id_log: auditLogs.length + 1,
      id_usuario: activePersona.id_usuario,
      usuario_nombre: activePersona.nombre_completo,
      usuario_rol: activePersona.id_rol,
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

    saveStateToLocalStorage(undefined, updatedInsts, undefined, [newLog, ...auditLogs]);
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

  // Load selected instrument into Edit Form
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

  // Save Instrument edits (Requires Technical Justification)
  const handleSaveInstrumentEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipForEdit) return;

    if (!checkPermission(currentPersonaId, "equipos:editar")) {
      alert("No tienes permisos suficientes para modificar especificaciones de equipos.");
      return;
    }

    if (!editJustification.trim()) {
      alert("ATENCIÓN (NMX-17025): Deberá registrar obligatoriamente la Justificación Técnica de este cambio metrológico.");
      return;
    }

    const previousData = { ...selectedEquipForEdit };
    const updatedInstrument: Instrumento = {
      ...selectedEquipForEdit,
      nombre: editFormFields.nombre,
      ubicacion: editFormFields.ubicacion,
      estado_operativo: editFormFields.estado_operativo,
      intervalo_calibracion_meses: Number(editFormFields.intervalo_calibracion_meses)
    };

    const updatedInsts = instruments.map(i => 
      i.id_instrumento === selectedEquipForEdit.id_instrumento ? updatedInstrument : i
    );

    // Write to audit trail
    const newLog: AuditLog = {
      id_log: auditLogs.length + 1,
      id_usuario: activePersona.id_usuario,
      usuario_nombre: activePersona.nombre_completo,
      usuario_rol: activePersona.id_rol,
      tabla_afectada: "instrumentos",
      registro_id: updatedInstrument.id_instrumento,
      accion: "UPDATE",
      valor_anterior: JSON.stringify(previousData),
      valor_nuevo: JSON.stringify(updatedInstrument),
      justificacion_tecnica: editJustification.trim(),
      hash_integridad: generarHashIntegridad(
        activePersona.id_usuario,
        "instrumentos",
        updatedInstrument.id_instrumento,
        "UPDATE",
        JSON.stringify(previousData),
        JSON.stringify(updatedInstrument),
        editJustification.trim()
      ),
      ip_origen: "192.168.10.99",
      timestamp: new Date().toISOString()
    };

    saveStateToLocalStorage(undefined, updatedInsts, undefined, [newLog, ...auditLogs]);
    setSelectedEquipForEdit(null);
    setEditJustification("");
  };

  // Submit calibration certificate (with simulated digital signatures and SHA256 integrity hashes)
  const handleRegisterCalibration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipForCalibration) return;

    if (!checkPermission(currentPersonaId, "calibracion:crear")) {
      alert("No tienes permisos suficientes para registrar certificados de calibración.");
      return;
    }

    if (!newCertificate.numero_certificado || !newCertificate.laboratorio_emisor || !newCertificate.fecha_calibracion || !newCertificate.fecha_vencimiento) {
      alert("Por favor completa todos los campos del certificado.");
      return;
    }

    if (new Date(newCertificate.fecha_vencimiento) <= new Date(newCertificate.fecha_calibracion)) {
      alert("Error en fechas: La fecha de vencimiento debe ser posterior a la fecha de calibración.");
      return;
    }

    const docHash = generarHashIntegridad(
      selectedEquipForCalibration.id_instrumento,
      "certificados_calibracion",
      newCertificate.numero_certificado,
      "INSERT",
      null,
      null,
      newCertificate.numero_certificado
    ).split(":")[1];

    const hasApprovePerm = checkPermission(currentPersonaId, "calibracion:aprobar");
    const autoApprove = newCertificate.requiere_aprobacion_inmediata && hasApprovePerm;

    const newCert: CertificadoCalibracion = {
      id_certificado: `cert-${Date.now()}`,
      id_instrumento: selectedEquipForCalibration.id_instrumento,
      numero_certificado: newCertificate.numero_certificado.toUpperCase(),
      laboratorio_emisor: newCertificate.laboratorio_emisor,
      fecha_calibracion: newCertificate.fecha_calibracion,
      fecha_vencimiento: newCertificate.fecha_vencimiento,
      url_documento: `https://certificados.aspechs.com/${newCertificate.numero_certificado}.pdf`,
      archivo_hash_sha256: docHash,
      estado_aprobacion: autoApprove ? "Aprobado" : "Pendiente",
      aprobado_por: autoApprove ? activePersona.id_usuario : undefined,
      fecha_aprobacion: autoApprove ? new Date().toISOString() : undefined,
      justificacion_aprobacion: autoApprove ? "Aprobación técnica instantánea efectuada por el usuario emisor autorizado." : undefined,
      sello_digital_nom151: autoApprove ? `NOM151:CONSTANCIA-${new Date().getFullYear()}-${newCertificate.numero_certificado}-PSC` : undefined
    };

    // Update state
    const updatedCerts = [newCert, ...certificates];

    // If approved immediately, we update instrument status to 'Operativo'
    let updatedInsts = [...instruments];
    if (autoApprove) {
      updatedInsts = instruments.map(i => 
        i.id_instrumento === selectedEquipForCalibration.id_instrumento ? { ...i, estado_operativo: "Operativo" } : i
      );
    }

    // Write to audit trail
    const newLog: AuditLog = {
      id_log: auditLogs.length + 1,
      id_usuario: activePersona.id_usuario,
      usuario_nombre: activePersona.nombre_completo,
      usuario_rol: activePersona.id_rol,
      tabla_afectada: "certificados_calibracion",
      registro_id: newCert.id_certificado,
      accion: autoApprove ? "SIGN" : "INSERT",
      valor_anterior: null,
      valor_nuevo: JSON.stringify(newCert),
      justificacion_tecnica: `Carga de certificado oficial de calibración ${newCert.numero_certificado} para instrumento ${selectedEquipForCalibration.codigo_interno}. Justificación técnica: ${newCertificate.justificacion_tecnica || "Registro periódico"}.`,
      hash_integridad: generarHashIntegridad(
        activePersona.id_usuario,
        "certificados_calibracion",
        newCert.id_certificado,
        autoApprove ? "SIGN" : "INSERT",
        null,
        JSON.stringify(newCert),
        newCertificate.justificacion_tecnica || "Ninguna especificada"
      ),
      ip_origen: "192.168.10.12",
      timestamp: new Date().toISOString()
    };

    saveStateToLocalStorage(undefined, updatedInsts, updatedCerts, [newLog, ...auditLogs]);
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

  // Approve a certificate that is pending
  const handleApproveCertificate = (cert: CertificadoCalibracion) => {
    if (!checkPermission(currentPersonaId, "calibracion:aprobar")) {
      alert("No tienes privilegios de aprobación técnica (Reservado para Directores y Supervisores).");
      return;
    }

    const justif = prompt("Escriba la justificación técnica de la aprobación para asentar firma electrónica SAT:");
    if (!justif) {
      alert("Aprobación cancelada. Se requiere la justificación técnica.");
      return;
    }

    const updatedCerts = certificates.map(c => {
      if (c.id_certificado === cert.id_certificado) {
        return {
          ...c,
          estado_aprobacion: "Aprobado" as const,
          aprobado_por: activePersona.id_usuario,
          fecha_aprobacion: new Date().toISOString(),
          justificacion_aprobacion: justif,
          sello_digital_nom151: `NOM151:CONSTANCIA-${new Date().getFullYear()}-PSC-${Math.floor(Math.random() * 90000) + 10000}`
        };
      }
      return c;
    });

    // Also set instrument back to Operativo
    const updatedInsts = instruments.map(i => 
      i.id_instrumento === cert.id_instrumento ? { ...i, estado_operativo: "Operativo" as const } : i
    );

    // Audit Log
    const newLog: AuditLog = {
      id_log: auditLogs.length + 1,
      id_usuario: activePersona.id_usuario,
      usuario_nombre: activePersona.nombre_completo,
      usuario_rol: activePersona.id_rol,
      tabla_afectada: "certificados_calibracion",
      registro_id: cert.id_certificado,
      accion: "SIGN",
      valor_anterior: JSON.stringify(cert),
      valor_nuevo: JSON.stringify(updatedCerts.find(c => c.id_certificado === cert.id_certificado)),
      justificacion_tecnica: `Firma y aprobación del certificado de calibración ${cert.numero_certificado} por el Director de Operaciones/Supervisor. Justificación: ${justif}`,
      hash_integridad: generarHashIntegridad(
        activePersona.id_usuario,
        "certificados_calibracion",
        cert.id_certificado,
        "SIGN",
        JSON.stringify(cert),
        JSON.stringify(updatedCerts.find(c => c.id_certificado === cert.id_certificado)),
        justif
      ),
      ip_origen: "192.168.10.15",
      timestamp: new Date().toISOString()
    };

    saveStateToLocalStorage(undefined, updatedInsts, updatedCerts, [newLog, ...auditLogs]);
  };

  // NEW: NOM-011 Field Workflow Helper Functions

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
    setFieldTechName("");
    setFieldRepName("");
    setFieldRepPuesto("");
    setFieldIsLocked(false);
    setFieldHash("");
    setFieldConstanciaNOM151("");
  };

  const handleFieldGPSCheckIn = () => {
    const mockLat = (19.4 + Math.random() * 0.2).toFixed(6);
    const mockLng = (-99.1 - Math.random() * 0.2).toFixed(6);
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
    const sonoInst = instruments.find(i => i.id_instrumento === fieldSonometerId);
    const approvedCerts = certificates.filter(c => c.id_instrumento === fieldSonometerId && c.estado_aprobacion === 'Aprobado');
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

    if (!fieldTechName || !fieldRepName || !fieldRepPuesto) {
      alert("Error: Se requieren las firmas de conformidad tanto del técnico como del representante de la planta en sitio.");
      return;
    }

    // All checks pass! Now construct the final JSON payload (Point 2)
    const reportId = `REP-NOM011-2026-00${submittedReports.length + 1}`;
    const targetInst = instruments.find(i => i.id_instrumento === fieldSonometerId);
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
        id_instrumento: fieldSonometerId,
        codigo_interno: targetInst?.codigo_interno,
        nombre: targetInst?.nombre,
        marca: targetInst?.marca,
        modelo: targetInst?.modelo,
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
        condiciones_ambientales: r.conditions
      })),
      firmas_conformidad: {
        firma_tecnico: `${fieldTechName} (LAB_TECH)`,
        huella_digital_tecnico: `e.firma:${generarHashIntegridad(fieldTechName, "campo", reportId, "SIGN", null, null, "Tecnico").substring(0, 32)}`,
        firma_representante_planta: fieldRepName,
        puesto_representante: fieldRepPuesto,
        timestamp_firmas: new Date().toISOString()
      },
      nom151_integridad: {
        hash_documento_sha256: "", // will fill below
        constancia_psc: `NOM151:CONSTANCIA-${new Date().getFullYear()}-FIELD-${Math.floor(Math.random() * 89999) + 10000}`,
        esta_bloqueado: true
      }
    };

    // Generate strict cryptographic SHA-256 equivalent for the whole document (NOM-151)
    const payloadString = JSON.stringify(finalPayload);
    const hash = generarHashIntegridad(fieldTechName, "reportes_campo", reportId, "INSERT", null, payloadString, "Cierre de Levantamiento");
    finalPayload.nom151_integridad.hash_documento_sha256 = hash;

    const newReportRecord = {
      id_reporte: reportId,
      tecnico: fieldTechName,
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

    // Create an Audit Log entry automatically to register this submission (trazabilidad ISO 17025)
    const newLog: AuditLog = {
      id_log: auditLogs.length + 1,
      id_usuario: activePersona.id_usuario,
      usuario_nombre: activePersona.nombre_completo,
      usuario_rol: activePersona.id_rol,
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
      rol: activePersona.id_rol,
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
      usuario_rol: activePersona.id_rol,
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

  // Reset local storage to default initial data
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
      setRbacSimResult(null);
      handleResetFieldForm();
    }
  };

  // Home Dashboard Handlers
  const handleAssignService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServAssign || !selectedTechAssign || !selectedInstAssign) {
      alert("Por favor seleccione todos los campos para realizar la asignación.");
      return;
    }
    // Check NMX-17025 calibration compliance
    const selectedInst = instruments.find(i => i.id_instrumento === selectedInstAssign);
    const approvedCerts = certificates.filter(c => c.id_instrumento === selectedInstAssign && c.estado_aprobacion === 'Aprobado');
    const hasVigente = approvedCerts.some(c => new Date(c.fecha_vencimiento) > new Date());
    
    if (!hasVigente) {
      alert("ERROR DE CONFIGURACIÓN NMX-17025: El equipo seleccionado no cuenta con calibración vigente aprobado ante la EMA. No puede operar.");
      return;
    }

    const techUser = usuarios.find(u => u.id_usuario === selectedTechAssign);
    if (!techUser) return;

    setScheduledServices(prev => prev.map(s => {
      if (s.id === selectedServAssign) {
        return {
          ...s,
          tecnico: techUser.nombre_completo,
          instrumento: selectedInst?.codigo_interno || "",
          estado: "Asignado"
        };
      }
      return s;
    }));

    // Log this assignment in the Audit Trail automatically
    const newLog: AuditLog = {
      id_log: auditLogs.length + 1,
      id_usuario: activePersona.id_usuario,
      usuario_nombre: activePersona.nombre_completo,
      usuario_rol: activePersona.id_rol,
      tabla_afectada: "asignacion_servicios",
      registro_id: selectedServAssign,
      accion: "UPDATE",
      valor_anterior: null,
      valor_nuevo: JSON.stringify({ tecnico: techUser.nombre_completo, instrumento: selectedInst?.codigo_interno, estado: "Asignado" }),
      justificacion_tecnica: `Asignación de instrumento calibrado (${selectedInst?.codigo_interno}) y técnico homologado (${techUser.nombre_completo}) conforme a procedimientos de calidad ISO 17025.`,
      hash_integridad: generarHashIntegridad(activePersona.id_usuario, "asignacion_servicios", selectedServAssign, "UPDATE", null, selectedInstAssign, "Asignacion"),
      ip_origen: "192.168.10.15",
      timestamp: new Date().toISOString()
    };
    saveStateToLocalStorage(undefined, undefined, undefined, [newLog, ...auditLogs]);

    alert(`Asignación exitosa: Equipo ${selectedInst?.codigo_interno} asignado al técnico ${techUser.nombre_completo} para el servicio.`);
    setSelectedServAssign("");
    setSelectedInstAssign("");
    setSelectedTechAssign("");
  };

  const handleGenerateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteClient) {
      alert("Por favor especifique el nombre del cliente.");
      return;
    }

    let base = 0;
    let pricePerPoint = 0;
    if (quoteType === "NOM-011-STPS") {
      base = 3500;
      pricePerPoint = 1800;
    } else if (quoteType === "NOM-015-STPS") {
      base = 4200;
      pricePerPoint = 2200;
    } else if (quoteType === "NOM-025-STPS") {
      base = 3000;
      pricePerPoint = 1500;
    } else {
      base = 5500;
      pricePerPoint = 0; // perimetral unique
    }

    const costPoints = pricePerPoint * quotePoints;
    const costViaticos = quoteDistance * 12.5;
    const subtotal = base + costPoints + costViaticos;
    const costTotal = Math.round(subtotal * 1.16);

    const newQuote = {
      id: `COT-00${generatedQuotes.length + 1}`,
      cliente: quoteClient,
      servicio: quoteType === "NOM-011-STPS" ? "NOM-011-STPS (Ruido)" : quoteType === "NOM-015-STPS" ? "NOM-015-STPS (Térmicas)" : quoteType === "NOM-025-STPS" ? "NOM-025-STPS (Iluminación)" : "NMX-R-046 (Perimetral)",
      puntos: quotePoints,
      costo: costTotal,
      fecha: new Date().toISOString().split('T')[0],
      estado: "Enviado"
    };

    setGeneratedQuotes([newQuote, ...generatedQuotes]);
    
    // Auto-create matching invoice in Pending state
    const newInvoice = {
      id: `FAC-100${invoices.length + 2}`,
      cliente: quoteClient,
      monto: costTotal,
      estado: "Pendiente",
      vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    setInvoices([newInvoice, ...invoices]);

    alert(`Cotización generada con éxito para ${quoteClient} por un total de ${costTotal.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}. Se ha registrado automáticamente una factura en estado Pendiente.`);
    setQuoteClient("");
  };

  const handleToggleInvoiceStatus = (invoiceId: string, newStatus: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return { ...inv, estado: newStatus };
      }
      return inv;
    }));
  };

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

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">ASP</div>
            <h1 className="text-xl font-bold tracking-tight text-white italic">EcH&S</h1>
          </div>
          
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-left text-xs sm:text-sm font-medium ${
                activeTab === 'home'
                  ? 'text-white bg-slate-800 font-bold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Home / Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('schema')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-left text-xs sm:text-sm font-medium ${
                activeTab === 'schema'
                  ? 'text-white bg-slate-800'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xs">{activeTab === 'schema' ? '●' : '○'}</span>
              <span>Dashboard / SQL</span>
            </button>

            <button
              onClick={() => setActiveTab('equipment')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-left text-xs sm:text-sm font-medium ${
                activeTab === 'equipment'
                  ? 'text-white bg-slate-800'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xs">{activeTab === 'equipment' ? '●' : '○'}</span>
              <span>Equipos / Calibración</span>
            </button>

            <button
              onClick={() => setActiveTab('field_workflow')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-left text-xs sm:text-sm font-medium ${
                activeTab === 'field_workflow'
                  ? 'text-white bg-slate-800'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xs">{activeTab === 'field_workflow' ? '●' : '○'}</span>
              <span className="flex items-center gap-1.5">
                <span>Flujo de Campo NOM-011</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-mono border border-emerald-500/30">NUEVO</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-left text-xs sm:text-sm font-medium ${
                activeTab === 'audit'
                  ? 'text-white bg-slate-800'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xs">{activeTab === 'audit' ? '●' : '○'}</span>
              <span>Auditoría (Audit Trail)</span>
            </button>

            <button
              onClick={() => setActiveTab('regulation')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-left text-xs sm:text-sm font-medium ${
                activeTab === 'regulation'
                  ? 'text-white bg-slate-800'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xs">{activeTab === 'regulation' ? '●' : '○'}</span>
              <span>Marco Regulatorio</span>
            </button>

            <button
              onClick={() => setActiveTab('rbac')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-left text-xs sm:text-sm font-medium ${
                activeTab === 'rbac'
                  ? 'text-white bg-slate-800'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xs">{activeTab === 'rbac' ? '●' : '○'}</span>
              <span>Usuarios / Roles (RBAC)</span>
            </button>
          </nav>
        </div>
        
        {/* Protection / Certifications Info */}
        <div className="mt-auto p-6 border-t border-slate-800 space-y-4">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Protección LFPDPPP</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Los datos de calibración y firmas están encriptados y auditados para Roberto Fernández.
            </p>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Certificaciones</div>
            <div className="flex gap-2 flex-wrap">
              <span className="px-2 py-1 bg-slate-800 text-[10px] rounded border border-slate-700 font-mono">NMX-17025</span>
              <span className="px-2 py-1 bg-slate-800 text-[10px] rounded border border-slate-700 font-mono">NOM-151</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />
          <aside className="relative w-64 bg-slate-900 text-slate-300 flex flex-col p-6 border-r border-slate-800 h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">ASP</div>
                <h1 className="text-xl font-bold tracking-tight text-white italic">EcH&S</h1>
              </div>
              <button onClick={() => setIsMobileSidebarOpen(false)} className="text-white text-xl p-1">×</button>
            </div>
            
            <nav className="space-y-1">
              <button
                onClick={() => { setActiveTab('home'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-left text-sm font-medium ${
                  activeTab === 'home' ? 'text-white bg-slate-800 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Home className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Home / Portal</span>
              </button>

              <button
                onClick={() => { setActiveTab('schema'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-left text-sm font-medium ${
                  activeTab === 'schema' ? 'text-white bg-slate-800' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-xs">{activeTab === 'schema' ? '●' : '○'}</span>
                <span>Dashboard / SQL</span>
              </button>

              <button
                onClick={() => { setActiveTab('equipment'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-left text-sm font-medium ${
                  activeTab === 'equipment' ? 'text-white bg-slate-800' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-xs">{activeTab === 'equipment' ? '●' : '○'}</span>
                <span>Equipos / Calibración</span>
              </button>

              <button
                onClick={() => { setActiveTab('field_workflow'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-left text-sm font-medium ${
                  activeTab === 'field_workflow' ? 'text-white bg-slate-800' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-xs">{activeTab === 'field_workflow' ? '●' : '○'}</span>
                <span className="flex items-center gap-1.5">
                  <span>Flujo de Campo NOM-011</span>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-mono border border-emerald-500/30">NUEVO</span>
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('audit'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-left text-sm font-medium ${
                  activeTab === 'audit' ? 'text-white bg-slate-800' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-xs">{activeTab === 'audit' ? '●' : '○'}</span>
                <span>Auditoría (Audit Trail)</span>
              </button>

              <button
                onClick={() => { setActiveTab('regulation'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-left text-sm font-medium ${
                  activeTab === 'regulation' ? 'text-white bg-slate-800' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-xs">{activeTab === 'regulation' ? '●' : '○'}</span>
                <span>Marco Regulatorio</span>
              </button>

              <button
                onClick={() => { setActiveTab('rbac'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-left text-sm font-medium ${
                  activeTab === 'rbac' ? 'text-white bg-slate-800' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-xs">{activeTab === 'rbac' ? '●' : '○'}</span>
                <span>Usuarios / Roles (RBAC)</span>
              </button>
            </nav>
            
            <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Certificaciones</div>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-2 py-1 bg-slate-800 text-[10px] rounded border border-slate-700">NMX-17025</span>
                  <span className="px-2 py-1 bg-slate-800 text-[10px] rounded border border-slate-700">NOM-151</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile */}
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500 hidden sm:inline">Sistema Integral de Operaciones</span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="font-semibold text-slate-800">
                {activeTab === 'home' && "Dashboard Principal / Portal Inteligente"}
                {activeTab === 'schema' && "Panel de Control - Esquema de Base de Datos"}
                {activeTab === 'equipment' && "Gestión de Equipos y Vigencias"}
                {activeTab === 'field_workflow' && "Levantamiento de Campo NOM-011-STPS"}
                {activeTab === 'audit' && "Bitácora de Auditoría (Audit Trail)"}
                {activeTab === 'regulation' && "Marco de Conformidad Legal"}
                {activeTab === 'rbac' && "Control de Acceso de Usuarios (RBAC)"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Persona Simulator Selector inside Header */}
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden lg:block">
                <div className="text-xs text-slate-400">Simulando Usuario:</div>
                <div className="text-sm font-bold text-slate-900">{activePersona.nombre_completo}</div>
                <div className="text-xs font-mono text-blue-600 font-semibold">{activePersona.puesto}</div>
              </div>
              
              <div className="relative">
                <label htmlFor="header-persona-select" className="sr-only">Seleccionar Persona</label>
                <select
                  id="header-persona-select"
                  value={currentPersonaId}
                  onChange={(e) => {
                    setCurrentPersonaId(e.target.value);
                    setRbacSimResult(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer"
                >
                  {usuarios.map(u => (
                    <option key={u.id_usuario} value={u.id_usuario}>
                      {u.nombre_completo.split(" ")[0]} ({u.id_rol})
                    </option>
                  ))}
                </select>
              </div>

              <button 
                id="reset-simulation-data-btn"
                onClick={handleResetData}
                title="Restablecer datos de simulación"
                className="p-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 border border-slate-200 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-700 text-xs shrink-0" title={`${activePersona.nombre_completo} (${activePersona.id_rol})`}>
              {activePersona.nombre_completo.split(" ").map(n => n[0]).join("").substring(0, 2)}
            </div>
          </div>
        </header>

        {/* Viewport content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-slate-50">
          
          {/* Top Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Instrumentos</div>
                <div className="text-2xl md:text-3xl font-bold text-slate-900 font-mono">{stats.total}</div>
              </div>
              <div className="mt-2 text-[10px] text-slate-500">
                <span>Registrados en inventario</span>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Equipos Calibrados</div>
                <div className="text-2xl md:text-3xl font-bold text-green-600 font-mono">{stats.vigentes}</div>
              </div>
              <div className="mt-2 flex items-center text-green-600 text-[10px] font-bold gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                <span>Operando conforme</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Vence Pronto</div>
                <div className="text-2xl md:text-3xl font-bold text-amber-500 font-mono">{stats.vencenPronto}</div>
              </div>
              <div className="mt-2 flex items-center text-amber-600 text-[10px] font-bold gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Menos de 30 días</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">No Calibrado / Vencido</div>
                <div className="text-2xl md:text-3xl font-bold text-red-600 font-mono">{stats.vencidos}</div>
              </div>
              <div className="mt-2 flex items-center text-red-600 text-[10px] font-bold gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <span>Atención requerida</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fuera de Servicio</div>
                <div className="text-2xl md:text-3xl font-bold text-slate-500 font-mono">{stats.fueraServicio}</div>
              </div>
              <div className="mt-2 flex items-center text-slate-500 text-[10px] font-semibold gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <span>Mantenimiento</span>
              </div>
            </div>
          </div>

          {/* MAIN TAB CONTENT CONTAINER */}
          <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm min-h-[500px]">
            <AnimatePresence mode="wait">
              
              {/* TAB 0: HOME / PORTAL PRINCIPAL */}
              {activeTab === 'home' && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Banner de Bienvenida con Contexto */}
                  <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-2xl text-white shadow-md border border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono border border-emerald-500/30 rounded">
                          SISTEMA ACTIVO (RBAC)
                        </span>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-xs text-slate-300 font-semibold font-mono">ASP/ECH&S v2.4</span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                        Bienvenido de vuelta, <span className="text-emerald-400">{activePersona.nombre_completo}</span>
                      </h2>
                      <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                        Estás simulando el perfil de <strong className="text-white">{activePersona.puesto}</strong>. El portal ha personalizado tus accesos rápidos y controles según tu rol <code className="bg-slate-800 text-emerald-400 px-1 py-0.5 rounded font-mono text-[10px]">{activePersona.id_rol}</code> conforme a la directiva de seguridad.
                      </p>
                    </div>
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 shrink-0 text-right min-w-[160px] hidden sm:block">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fecha de Operación</div>
                      <div className="text-sm font-bold text-white font-mono">{new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      <div className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center justify-end gap-1 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Zona Horaria: UTC-6 (MX)</span>
                      </div>
                    </div>
                  </div>

                  {/* ----------------- VISTA 1: DIRECTOR (DIR_OPER) ----------------- */}
                  {activePersona.id_rol === 'DIR_OPER' && (
                    <div className="space-y-6">
                      {/* Subtítulo Sección */}
                      <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                        <div>
                          <h3 className="text-md font-bold text-slate-800 flex items-center gap-1.5">
                            <TrendingUp className="text-emerald-600 w-4 h-4" />
                            Mando Directivo y Control Operativo Financiero
                          </h3>
                          <p className="text-xs text-slate-500">Métricas consolidadas de facturación, contratos y alertas críticas de calibraciones.</p>
                        </div>
                        <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-1 rounded-md font-mono font-bold border border-blue-200">
                          DIRECTOR PORTAL
                        </span>
                      </div>

                      {/* Tarjetas Financieras */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Cotizado (Mes)</div>
                            <div className="text-xl md:text-2xl font-bold text-slate-900 font-mono">
                              {financials.totalCotizado.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1">Servicios ambientales prospectados</div>
                          </div>
                          <div className="bg-blue-100 text-blue-700 p-3 rounded-lg">
                            <Calculator className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="bg-emerald-50/50 border border-emerald-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Total Facturado</div>
                            <div className="text-xl md:text-2xl font-bold text-emerald-800 font-mono">
                              {financials.totalFacturado.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </div>
                            <div className="text-[10px] text-emerald-600 mt-1">Emitido y registrado fiscalmente</div>
                          </div>
                          <div className="bg-emerald-100 text-emerald-700 p-3 rounded-lg">
                            <DollarSign className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="bg-green-50/50 border border-green-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-1">Recaudado / Cobrado</div>
                            <div className="text-xl md:text-2xl font-bold text-green-800 font-mono">
                              {financials.totalRecaudado.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </div>
                            <div className="text-[10px] text-green-600 mt-1">Liquidez en banco (Flujo activo)</div>
                          </div>
                          <div className="bg-green-100 text-green-700 p-3 rounded-lg">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="bg-amber-50/50 border border-amber-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Pendiente por Cobrar</div>
                            <div className="text-xl md:text-2xl font-bold text-amber-800 font-mono">
                              {financials.totalPendiente.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </div>
                            <div className="text-[10px] text-amber-600 mt-1">Cuentas por cobrar activas</div>
                          </div>
                          <div className="bg-amber-100 text-amber-700 p-3 rounded-lg">
                            <Clock className="w-5 h-5" />
                          </div>
                        </div>
                      </div>

                      {/* Fila Central: Gráfica Financiera Simulada y Alertas de Calibración */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Gráfica Financiera Simulada */}
                        <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Distribución del Flujo de Efectivo</h4>
                          
                          <div className="space-y-4 pt-2">
                            {/* Bar 1: Cotizado */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-600">Total Cotizado</span>
                                <span className="font-mono text-slate-800">{financials.totalCotizado.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                              </div>
                              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
                              </div>
                            </div>

                            {/* Bar 2: Facturado */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-600">Total Facturado</span>
                                <span className="font-mono text-slate-800">{financials.totalFacturado.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                              </div>
                              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (financials.totalFacturado / (financials.totalCotizado || 1)) * 100)}%` }}></div>
                              </div>
                            </div>

                            {/* Bar 3: Recaudado */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-600">Cobrado / Liquidado</span>
                                <span className="font-mono text-emerald-700">{financials.totalRecaudado.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                              </div>
                              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (financials.totalRecaudado / (financials.totalCotizado || 1)) * 100)}%` }}></div>
                              </div>
                            </div>

                            {/* Bar 4: Pendiente */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-600">Pendiente de Pago</span>
                                <span className="font-mono text-amber-700">{financials.totalPendiente.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
                              </div>
                              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (financials.totalPendiente / (financials.totalCotizado || 1)) * 100)}%` }}></div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-4">
                            <span>Eficiencia de Cobro: <strong>{Math.round((financials.totalRecaudado / (financials.totalFacturado || 1)) * 100)}%</strong></span>
                            <span>IVA Recaudado: <strong>{(financials.totalRecaudado * 0.16).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</strong></span>
                          </div>
                        </div>

                        {/* Alertas Críticas de Calibración */}
                        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex justify-between items-center">
                              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Alertas de Calibración</h4>
                              {stats.vencidos > 0 ? (
                                <span className="bg-red-100 text-red-800 text-[9px] font-bold px-1.5 py-0.5 rounded animate-pulse">
                                  CRÍTICO
                                </span>
                              ) : (
                                <span className="bg-green-100 text-green-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  OK
                                </span>
                              )}
                            </div>

                            {/* List of Expired or Expiring soon */}
                            <div className="mt-3 space-y-3 max-h-[180px] overflow-y-auto pr-1">
                              {instruments.filter(i => {
                                // check certificates
                                const latestCert = certificates.filter(c => c.id_instrumento === i.id_instrumento && c.estado_aprobacion === 'Aprobado')[0];
                                if (!latestCert) return true; // vencido / sin cert
                                return new Date(latestCert.fecha_vencimiento) < new Date();
                              }).map(i => (
                                <div key={i.id_instrumento} className="flex gap-2.5 p-2 bg-red-50 border border-red-100 rounded-lg text-xs">
                                  <AlertTriangle className="text-red-500 w-4 h-4 shrink-0 mt-0.5" />
                                  <div className="space-y-0.5">
                                    <div className="font-bold text-slate-900">{i.codigo_interno} — {i.nombre}</div>
                                    <div className="text-[10px] text-slate-500 font-semibold uppercase font-mono">Ubicación: {i.ubicacion}</div>
                                    <div className="text-[10px] text-red-700 font-bold">CALIBRACIÓN EXPIRADA / REQUERIDA</div>
                                  </div>
                                </div>
                              ))}

                              {instruments.filter(i => {
                                // check certificates
                                const latestCert = certificates.filter(c => c.id_instrumento === i.id_instrumento && c.estado_aprobacion === 'Aprobado')[0];
                                if (!latestCert) return false;
                                const diff = new Date(latestCert.fecha_vencimiento).getTime() - Date.now();
                                const days = Math.ceil(diff / (1000 * 3600 * 24));
                                return days >= 0 && days <= 30;
                              }).map(i => (
                                <div key={i.id_instrumento} className="flex gap-2.5 p-2 bg-amber-50 border border-amber-100 rounded-lg text-xs">
                                  <AlertCircle className="text-amber-500 w-4 h-4 shrink-0 mt-0.5" />
                                  <div className="space-y-0.5">
                                    <div className="font-bold text-slate-900">{i.codigo_interno} — {i.nombre}</div>
                                    <div className="text-[10px] text-slate-500 font-semibold font-mono">Vence en menos de 30 días</div>
                                    <div className="text-[10px] text-amber-700 font-semibold">Agendar calibración externa</div>
                                  </div>
                                </div>
                              ))}

                              {stats.vencidos === 0 && (
                                <div className="text-center py-8 text-xs text-slate-400 font-semibold space-y-2">
                                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                                  <p>No hay equipos con vigencias expiradas en el inventario.</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => setActiveTab('equipment')}
                            className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span>Ir a Gestión de Equipos</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ----------------- VISTA 2: COORDINADOR (COORD_OPER) ----------------- */}
                  {activePersona.id_rol === 'COORD_OPER' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Calendario y Programación */}
                      <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
                        <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                          <div>
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Planificación de Servicios (Julio 2026)</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">Visualización del calendario operativo de levantamientos y mediciones periciales.</p>
                          </div>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-mono font-bold border border-blue-200">
                            COORD PORTAL
                          </span>
                        </div>

                        {/* Calendario Grid Mockup */}
                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 pb-1">
                          <span>DO</span><span>LU</span><span>MA</span><span>MI</span><span>JU</span><span>VI</span><span>SA</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1.5">
                          {/* Blank days for start of month - July 2026 starts on Wednesday */}
                          <div className="aspect-video bg-slate-50/50 rounded flex items-center justify-center text-slate-300">28</div>
                          <div className="aspect-video bg-slate-50/50 rounded flex items-center justify-center text-slate-300">29</div>
                          <div className="aspect-video bg-slate-50/50 rounded flex items-center justify-center text-slate-300 font-semibold">30</div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>1</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>2</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>3</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>4</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>5</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>6</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>7</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>8</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>9</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>10</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mx-auto"></span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>11</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>12</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>13</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>14</span>
                          </div>
                          {/* Active current day (July 15) */}
                          <div className="aspect-video bg-blue-50 border border-blue-300 rounded flex flex-col justify-between p-1 text-blue-700 font-bold ring-2 ring-blue-500/20 text-[10px]">
                            <span>15</span>
                            <span className="bg-blue-500 text-[6.5px] leading-tight text-white px-1 rounded truncate">Vidriera</span>
                          </div>
                          {/* July 16 */}
                          <div className="aspect-video bg-emerald-50 border border-emerald-300 rounded flex flex-col justify-between p-1 text-slate-700 text-[10px]">
                            <span>16</span>
                            <span className={`text-[6.5px] leading-tight text-white px-1 rounded truncate ${
                              scheduledServices.find(s => s.id === "SERV-102")?.estado === "Asignado" ? "bg-blue-500" : "bg-amber-500"
                            }`}>
                              Química
                            </span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>17</span>
                          </div>
                          {/* July 18 */}
                          <div className="aspect-video bg-slate-50 border border-slate-200 rounded flex flex-col justify-between p-1 text-slate-700 text-[10px]">
                            <span>18</span>
                            <span className={`text-[6.5px] leading-tight text-white px-1 rounded truncate ${
                              scheduledServices.find(s => s.id === "SERV-103")?.estado === "Asignado" ? "bg-blue-500" : "bg-slate-400"
                            }`}>
                              Lácteos
                            </span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>19</span>
                          </div>
                          {/* July 20 */}
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 text-[10px]">
                            <span>20</span>
                            <span className="bg-blue-500 text-[6.5px] leading-tight text-white px-1 rounded truncate">Monterrey</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>21</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>22</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>23</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>24</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>25</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>26</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>27</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>28</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>29</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>30</span>
                          </div>
                          <div className="aspect-video bg-slate-50 border border-slate-100 rounded flex flex-col justify-between p-1 text-slate-700 font-semibold text-[10px]">
                            <span>31</span>
                          </div>
                        </div>

                        {/* List of Scheduled Services */}
                        <div className="space-y-2 pt-2">
                          <h5 className="text-[10px] font-bold text-slate-500 uppercase">Detalle del Estatus de Servicios</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {scheduledServices.map(s => (
                              <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col justify-between">
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="font-mono font-bold text-slate-500">{s.id}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                      s.estado === "Asignado" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-amber-100 text-amber-800 border border-amber-200 animate-pulse"
                                    }`}>
                                      {s.estado}
                                    </span>
                                  </div>
                                  <div className="font-bold text-slate-800">{s.cliente}</div>
                                  <div className="text-slate-500 text-[11px]">{s.servicio}</div>
                                </div>
                                <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500">
                                  <span>Fecha: <strong>{s.fecha}</strong></span>
                                  <span>Téc: <strong>{s.tecnico}</strong> ({s.instrumento})</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Panel de Asignación con Verificación NMX-17025 */}
                      <div className="space-y-6">
                        
                        {/* Asignador de Recursos */}
                        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Asignación Tecnológica NMX-17025</h4>
                          
                          <form onSubmit={handleAssignService} className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">1. Seleccionar Servicio</label>
                              <select 
                                value={selectedServAssign}
                                onChange={(e) => setSelectedServAssign(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                              >
                                <option value="">-- Seleccionar --</option>
                                {scheduledServices.filter(s => s.estado === "Pendiente Asignación").map(s => (
                                  <option key={s.id} value={s.id}>{s.id} - {s.cliente} ({s.servicio})</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">2. Técnico Laboratorista Homologado</label>
                              <select 
                                value={selectedTechAssign}
                                onChange={(e) => setSelectedTechAssign(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                              >
                                <option value="">-- Seleccionar --</option>
                                {usuarios.filter(u => u.id_rol === 'LAB_TECH').map(u => (
                                  <option key={u.id_usuario} value={u.id_usuario}>{u.nombre_completo}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">3. Instrumento Operativo</label>
                              <select 
                                value={selectedInstAssign}
                                onChange={(e) => setSelectedInstAssign(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                              >
                                <option value="">-- Seleccionar --</option>
                                {instruments.map(i => (
                                  <option key={i.id_instrumento} value={i.id_instrumento}>{i.codigo_interno} - {i.nombre} ({i.estado_operativo})</option>
                                ))}
                              </select>
                            </div>

                            {/* NMX-17025 Compliance Live Validation Check */}
                            {selectedInstAssign && (
                              <div className="p-3 rounded-lg text-xs border transition-colors">
                                {(() => {
                                  const selectedInst = instruments.find(i => i.id_instrumento === selectedInstAssign);
                                  const approvedCerts = certificates.filter(c => c.id_instrumento === selectedInstAssign && c.estado_aprobacion === 'Aprobado');
                                  const hasVigente = approvedCerts.some(c => new Date(c.fecha_vencimiento) > new Date());
                                  
                                  if (hasVigente) {
                                    return (
                                      <div className="space-y-1 text-emerald-800 bg-emerald-50/50 border-emerald-100">
                                        <div className="font-bold flex items-center gap-1">
                                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>NMX-17025 CONFORME</span>
                                        </div>
                                        <p className="text-[10px] text-emerald-600 leading-relaxed">
                                          El equipo seleccionado posee calibración vigente aprobada. Trazabilidad metrológica validada.
                                        </p>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div className="space-y-1 text-red-800 bg-red-50/50 border-red-100">
                                        <div className="font-bold flex items-center gap-1">
                                          <XCircle className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                                          <span>BLOQUEO DE CALIDAD</span>
                                        </div>
                                        <p className="text-[10px] text-red-600 leading-relaxed">
                                          <strong>BLOQUEO CRÍTICO:</strong> Este instrumento no tiene certificado de calibración vigente aprobado ante la EMA. No puede ser asignado a servicios oficiales.
                                        </p>
                                      </div>
                                    );
                                  }
                                })()}
                              </div>
                            )}

                            <button
                              type="submit"
                              disabled={(() => {
                                if (!selectedInstAssign || !selectedTechAssign || !selectedServAssign) return true;
                                const approvedCerts = certificates.filter(c => c.id_instrumento === selectedInstAssign && c.estado_aprobacion === 'Aprobado');
                                return !approvedCerts.some(c => new Date(c.fecha_vencimiento) > new Date());
                              })()}
                              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                            >
                              Confirmar y Asignar Recursos
                            </button>
                          </form>
                        </div>

                        {/* Reports Queue Alert */}
                        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl shadow-sm space-y-3 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                              <FileCheck className="w-4 h-4 text-emerald-600" />
                              Cola de Validación de Informes
                            </h4>
                            <p className="text-[11px] text-emerald-700 leading-relaxed">
                              Tienes <strong>{submittedReports.filter(r => r.estado === 'Pendiente').length} informes</strong> pendientes de firma y validación oficial en la bitácora de campo.
                            </p>
                          </div>
                          <button
                            onClick={() => setActiveTab('field_workflow')}
                            className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold text-center transition-colors"
                          >
                            Ir a Validación de Reportes
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ----------------- VISTA 3: TÉCNICO (LAB_TECH) ----------------- */}
                  {activePersona.id_rol === 'LAB_TECH' && (
                    <div className="flex justify-center">
                      {/* Ruggedized Mobile Interface Frame */}
                      <div className="w-full max-w-md bg-slate-900 text-slate-100 rounded-3xl p-5 border-4 border-slate-700 shadow-2xl relative overflow-hidden space-y-6">
                        
                        {/* Speaker & Sensor bar */}
                        <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full flex items-center justify-center gap-1">
                          <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
                          <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
                        </div>

                        {/* Mobile Screen Header */}
                        <div className="flex justify-between items-center pt-2 text-[10px] font-bold font-mono text-slate-400">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            <span>LTE / GPS ACTIVADO</span>
                          </div>
                          <div>{new Date().toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>

                        {/* Mobile Body Content */}
                        <div className="space-y-5">
                          
                          {/* Control de Jornada */}
                          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 space-y-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Control de Jornada Laboral</h4>
                                <p className="text-[10px] text-slate-500">Registro oficial de horas y geolocalización en sitio.</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                                jornadaIniciada ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                              }`}>
                                {jornadaIniciada ? "JORNADA ACTIVA" : "SIN INICIAR"}
                              </span>
                            </div>

                            {jornadaIniciada && (
                              <div className="bg-slate-950 p-3 rounded-lg text-[11px] font-mono border border-slate-800 space-y-1">
                                <div className="text-emerald-400 font-bold">● REGISTRO DE TRABAJO EN CAMPO</div>
                                <div className="text-slate-400">Hora de Inicio: <span className="text-white">{jornadaStartTime}</span></div>
                                <div className="text-slate-400">GPS: <span className="text-slate-300">{jornadaGPS}</span></div>
                                <div className="text-slate-400">Estado: <span className="text-emerald-400 animate-pulse">Transmitiendo telemetría en tiempo real</span></div>
                              </div>
                            )}

                            <button
                              onClick={handleToggleJornada}
                              className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                                jornadaIniciada 
                                  ? "bg-red-600 hover:bg-red-700 text-white" 
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white animate-bounce"
                              }`}
                            >
                              <Clock className="w-4 h-4 shrink-0" />
                              <span>{jornadaIniciada ? "Detener Jornada de Campo" : "Iniciar Jornada en Campo"}</span>
                            </button>
                          </div>

                          {/* Mis Visitas Programadas */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Mis Visitas Programadas</h4>
                            
                            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                              {scheduledServices.filter(s => s.tecnico === "Lucía Juárez").map(s => (
                                <div key={s.id} className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700 text-xs flex flex-col justify-between gap-3">
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center text-[10px] font-mono">
                                      <span className="text-emerald-400 font-bold">{s.id}</span>
                                      <span className="bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded uppercase font-semibold text-[8px]">{s.estado}</span>
                                    </div>
                                    <div className="font-bold text-white text-sm">{s.cliente}</div>
                                    <div className="text-slate-400 font-medium text-[11px]">{s.servicio}</div>
                                    <div className="text-slate-500 text-[10px] flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                                      <span>Inst: <strong>{s.instrumento}</strong></span>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => {
                                      if (!jornadaIniciada) {
                                        alert("Por favor, inicia tu jornada laboral primero con el botón de arriba.");
                                        return;
                                      }
                                      // pre-populate form states
                                      setFieldArea(`${s.cliente} - Área de Producción`);
                                      setFieldSonometerId(s.instrumento);
                                      setFieldTechName("Lucía Juárez");
                                      setFieldCheckinCoords("25.4382, -100.9734 (Saltillo)");
                                      setFieldCheckinTime(new Date().toLocaleTimeString('es-MX'));
                                      setFieldStep(2); // Jump to EPP check directly!
                                      setActiveTab('field_workflow');
                                    }}
                                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-bold rounded-xl text-center transition-colors text-[11px] flex items-center justify-center gap-1.5"
                                  >
                                    <span>Iniciar Levantamiento</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  )}

                  {/* ----------------- VISTA 4: ADMIN / VENTAS (ADMIN_VENTAS) ----------------- */}
                  {activePersona.id_rol === 'ADMIN_VENTAS' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Cotizador Automatizado */}
                      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
                        <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                          <div>
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cotizador Automatizado de Servicios</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">Calcula precios al instante basados en cantidad de puntos y distancia de traslado.</p>
                          </div>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-mono font-bold border border-blue-200">
                            SALES PORTAL
                          </span>
                        </div>

                        <form onSubmit={handleGenerateQuote} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Nombre del Cliente / Planta</label>
                            <input 
                              type="text" 
                              required
                              value={quoteClient}
                              onChange={(e) => setQuoteClient(e.target.value)}
                              placeholder="Ej. Vidriera Monterrey S.A."
                              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Norma Aplicable</label>
                              <select 
                                value={quoteType}
                                onChange={(e) => setQuoteType(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                              >
                                <option value="NOM-011-STPS">NOM-011-STPS (Ruido)</option>
                                <option value="NOM-015-STPS">NOM-015-STPS (Térmicas)</option>
                                <option value="NOM-025-STPS">NOM-025-STPS (Iluminación)</option>
                                <option value="NMX-R-046">NMX-R-046 (Perimetral)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Puntos de Medición</label>
                              <input 
                                type="number" 
                                min="1" 
                                max="100"
                                value={quotePoints}
                                onChange={(e) => setQuotePoints(Number(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-mono"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase flex justify-between">
                              <span>Distancia de Traslado (KM)</span>
                              <span className="font-mono text-emerald-600">{quoteDistance} km</span>
                            </label>
                            <input 
                              type="range" 
                              min="0" 
                              max="300" 
                              step="5"
                              value={quoteDistance}
                              onChange={(e) => setQuoteDistance(Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                            />
                          </div>

                          {/* Dynamic Calculator breakdown */}
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                            <div className="font-bold text-slate-700 uppercase text-[10px]">Desglose de Costo Estimado</div>
                            <div className="flex justify-between text-slate-500">
                              <span>Base del Servicio:</span>
                              <span className="font-mono">
                                {(quoteType === "NOM-011-STPS" ? 3500 : quoteType === "NOM-015-STPS" ? 4200 : quoteType === "NOM-025-STPS" ? 3000 : 5500).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}
                              </span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>Puntos ({quotePoints} x {(quoteType === "NOM-011-STPS" ? 1800 : quoteType === "NOM-015-STPS" ? 2200 : quoteType === "NOM-025-STPS" ? 1500 : 0)}):</span>
                              <span className="font-mono">
                                {((quoteType === "NOM-011-STPS" ? 1800 : quoteType === "NOM-015-STPS" ? 2200 : quoteType === "NOM-025-STPS" ? 1500 : 0) * quotePoints).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}
                              </span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>Viáticos de Traslado (KM x $12.50):</span>
                              <span className="font-mono">
                                {(quoteDistance * 12.5).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}
                              </span>
                            </div>
                            <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                              <span>Total con IVA (16%):</span>
                              <span className="font-mono text-emerald-600 font-bold">
                                {(() => {
                                  const base = quoteType === "NOM-011-STPS" ? 3500 : quoteType === "NOM-015-STPS" ? 4200 : quoteType === "NOM-025-STPS" ? 3000 : 5500;
                                  const points = (quoteType === "NOM-011-STPS" ? 1800 : quoteType === "NOM-015-STPS" ? 2200 : quoteType === "NOM-025-STPS" ? 1500 : 0) * quotePoints;
                                  const viaticos = quoteDistance * 12.5;
                                  return Math.round((base + points + viaticos) * 1.16).toLocaleString('es-MX', {style: 'currency', currency: 'MXN'});
                                })()}
                              </span>
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Registrar y Emitir Cotización</span>
                          </button>
                        </form>
                      </div>

                      {/* Control de Facturas Pendientes */}
                      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Control de Facturas Pendientes</h4>
                        
                        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                          {invoices.map(inv => (
                            <div key={inv.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-500">{inv.id}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                                    inv.estado === "Pagado" ? "bg-green-100 text-green-800 border border-green-200" : inv.estado === "Vencido" ? "bg-red-100 text-red-800 border border-red-200" : "bg-amber-100 text-amber-800 border border-amber-200"
                                  }`}>
                                    {inv.estado}
                                  </span>
                                </div>
                                <div className="font-bold text-slate-800">{inv.cliente}</div>
                                <div className="text-[10px] text-slate-400">Vencimiento: {inv.vencimiento}</div>
                              </div>

                              <div className="text-right space-y-2 shrink-0">
                                <div className="font-mono font-bold text-slate-900 text-sm">{inv.monto.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}</div>
                                <div className="flex gap-1">
                                  {inv.estado !== "Pagado" && (
                                    <button
                                      onClick={() => handleToggleInvoiceStatus(inv.id, "Pagado")}
                                      className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[9px] font-bold transition-colors"
                                    >
                                      Cobrar
                                    </button>
                                  )}
                                  {inv.estado === "Pendiente" && (
                                    <button
                                      onClick={() => handleToggleInvoiceStatus(inv.id, "Vencido")}
                                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[9px] font-bold transition-colors"
                                    >
                                      Vencer
                                    </button>
                                  )}
                                  {inv.estado === "Vencido" && (
                                    <button
                                      onClick={() => handleToggleInvoiceStatus(inv.id, "Pendiente")}
                                      className="px-2 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded text-[9px] font-bold transition-colors"
                                    >
                                      Prorrogar
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Leyenda y Políticas de Calidad */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="flex gap-2 text-xs text-slate-500">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-700">Trazabilidad de Procesos y Conectividad Homologada</p>
                        <p className="text-[11px] leading-relaxed">
                          La asignación de equipos de medición verifica automáticamente la calibración aprobada ante la EMA (NMX-17025-IMNC-2018), bloqueando levantamientos de campo no trazables.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 1: BASE DE DATOS (SQL) */}
              {activeTab === 'schema' && (
                <motion.div
                  key="schema"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Database className="text-emerald-600 w-5 h-5" />
                        Esquema Arquitectónico PostgreSQL
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Script de base de datos oficial diseñado estrictamente para cumplir las directrices de NMX-EC-17025 y la NOM-151.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        id="copy-sql-btn"
                        onClick={handleCopySql}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200 transition-colors"
                      >
                        {sqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{sqlCopied ? "Copiado" : "Copiar SQL"}</span>
                      </button>
                      <button
                        id="download-sql-btn"
                        onClick={handleDownloadSql}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar .sql</span>
                      </button>
                    </div>
                  </div>

                  {/* ANOTACIONES DE CUMPLIMIENTO */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex gap-3">
                      <div className="bg-emerald-100 text-emerald-800 p-1.5 rounded-lg shrink-0 h-fit">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Prioridad 1: RBAC de 4 Roles</h4>
                        <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                          Soporte nativo mediante tablas <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-[10px]">roles</code>, <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-[10px]">permisos</code>, y <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-[10px]">usuarios</code>, asegurando que solo el personal autorizado apruebe calibraciones de equipos.
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex gap-3">
                      <div className="bg-slate-200 text-slate-800 p-1.5 rounded-lg shrink-0 h-fit">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Prioridad 2: Trazabilidad NMX-17025</h4>
                        <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                          La tabla <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">bitacora_auditoria</code> registra <code className="font-mono text-[10px]">valor_anterior</code> y <code className="font-mono text-[10px]">valor_nuevo</code> en formato <code className="font-mono text-[10px]">JSONB</code>, exigiendo una justificación técnica obligatoria y bloqueando cambios directos vía trigger SQL.
                        </p>
                      </div>
                    </div>

                    <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl flex gap-3">
                      <div className="bg-sky-100 text-sky-800 p-1.5 rounded-lg shrink-0 h-fit">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wide">Prioridad 3: Equipos e Integridad</h4>
                        <p className="text-xs text-sky-700 mt-1 leading-relaxed">
                          Conexión íntegra entre instrumentos y certificados de calibración, calculando en tiempo real alertas y vigencias, respaldados con campos de huella criptográfica de archivos y firmas de NOM-151.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* VISOR DEL SCRIPT SQL */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner">
                    <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-xs text-slate-400 font-mono ml-2">aspechs_ddl_schema.sql</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        PostgreSQL
                      </span>
                    </div>
                    <pre className="p-4 bg-slate-950 text-emerald-300 font-mono text-xs overflow-x-auto max-h-[480px] leading-relaxed">
                      <code>{DB_SCHEMA_SQL}</code>
                    </pre>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-blue-500" />
                      Nota de Ejecución e Instalación
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Este script es totalmente compatible con versiones modernas de PostgreSQL (12 a 16). Asegúrese de otorgar al usuario del pool de conexiones únicamente permisos sobre los esquemas de negocio y restrinja el acceso de borrado en la tabla <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">bitacora_auditoria</code>, complementando el trigger del motor relacional.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: CONTROL DE ACCESOS (RBAC) */}
              {activeTab === 'rbac' && (
                <motion.div
                  key="rbac"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="text-emerald-600 w-5 h-5" />
                      Control de Accesos Basado en Roles (RBAC)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configuración estricta de usuarios, roles y sus correspondientes privilegios de seguridad de acuerdo a la Ley de Firma Electrónica Avanzada.
                    </p>
                  </div>

                  {/* CARDS DE ROLES CLAVE */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {INITIAL_ROLES.map(rol => {
                      const permissionsCount = ROLE_PERMISSIONS_MAP[rol.id_rol]?.length || 0;
                      return (
                        <div key={rol.id_rol} className="bg-white border border-slate-200 hover:border-slate-300 p-4 rounded-xl transition-all shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-700">
                                {rol.id_rol}
                              </span>
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Key className="w-3 h-3 text-emerald-500" />
                                {permissionsCount} perms
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-950 mb-1">{rol.nombre}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">{rol.descripcion}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* SECCIÓN DOBLE: LISTADO DE PERSONAL Y SIMULADOR DE PERMISOS */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* LISTA DE USUARIOS */}
                    <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
                        <span>Personal y Credenciales Digitales (LFPDPPP)</span>
                        <span className="text-[10px] text-emerald-600 font-mono uppercase bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
                          Firma Activa
                        </span>
                      </h3>
                      
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
                              <div className={`p-2 rounded-full ${
                                currentPersonaId === user.id_usuario ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                <UserCheck className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{user.nombre_completo}</h4>
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{user.email}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-[9px] font-mono font-bold bg-slate-100 px-1 py-0.2 border rounded text-slate-600">
                                    {user.id_rol}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-400">
                                    {user.puesto}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <span className="text-[10px] text-emerald-600 font-mono block font-medium">
                                e.firma SAT
                              </span>
                              <span className="text-[8px] text-slate-400 font-mono block">
                                {user.firma_electronica_fingerprint.substring(0, 16)}...
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SIMULADOR INTERACTIVO DE REGLAS DE SEGURIDAD */}
                    <div className="lg:col-span-5 bg-slate-900 text-white rounded-xl p-4 flex flex-col justify-between border border-slate-800">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            Simulador de Privilegios Relacionales
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                          Evalúa cómo el motor de base de datos SQL procesará las peticiones según el rol asignado al usuario activo. Cambia de usuario arriba para probar distintos escenarios de cumplimiento.
                        </p>

                        <div className="space-y-4">
                          {/* Seleccionar Acción a simular */}
                          <div>
                            <label htmlFor="sim-action-select" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                              Acción del Sistema a Testear:
                            </label>
                            <select
                              id="sim-action-select"
                              value={rbacSimAction}
                              onChange={(e) => {
                                setRbacSimAction(e.target.value);
                                setRbacSimResult(null);
                              }}
                              className="w-full bg-slate-950 text-xs text-white border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                            >
                              {INITIAL_PERMISOS.map(perm => (
                                <option key={perm.id_permiso} value={perm.id_permiso}>
                                  [{perm.modulo.toUpperCase()}] - {perm.accion.toUpperCase()} ({perm.descripcion})
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            id="execute-rbac-simulation-btn"
                            onClick={() => handleTestRbac(rbacSimAction)}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors shadow flex items-center justify-center gap-1.5"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>Probar Privilegios Relacionales</span>
                          </button>
                        </div>
                      </div>

                      {/* RESULTADO DEL SIMULADOR */}
                      {rbacSimResult && (
                        <div className={`mt-4 p-3 rounded-lg border text-xs leading-relaxed ${
                          rbacSimResult.allowed 
                            ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200' 
                            : 'bg-red-950/80 border-red-900 text-red-200'
                        }`}>
                          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] mb-1">
                            {rbacSimResult.allowed ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                            )}
                            <span>{rbacSimResult.reason}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-light leading-normal">{rbacSimResult.details}</p>
                          <span className="text-[9px] font-mono block mt-2 text-slate-400 border-t border-slate-800 pt-1.5">
                            * Auditoría automática registrada en bitacora_auditoria.
                          </span>
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}

              {/* TAB 3: EQUIPOS Y CALIBRACIÓN */}
              {activeTab === 'equipment' && (
                <motion.div
                  key="equipment"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Sliders className="text-emerald-600 w-5 h-5" />
                        Control Metrológico e Instrumentación
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Inventario y vigencia de certificados aprobados por laboratorios acreditados ante la EMA bajo el estándar ISO/IEC 17025.
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="relative">
                        <label htmlFor="search-equipment-input" className="sr-only">Buscar Equipo</label>
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          id="search-equipment-input"
                          type="text"
                          placeholder="Buscar por código, serie..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48 font-medium text-slate-800"
                        />
                      </div>
                      
                      <button
                        id="open-add-equipment-modal-btn"
                        onClick={() => {
                          if (!checkPermission(currentPersonaId, "equipos:crear")) {
                            alert("No posees el privilegio [equipos:crear]. Cambia tu usuario a un rol técnico o supervisor.");
                            return;
                          }
                          setIsAddEquipOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Nuevo Equipo</span>
                      </button>
                    </div>
                  </div>

                  {/* MODAL / FORMULARIO AGREGAR EQUIPO */}
                  {isAddEquipOpen && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative">
                      <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">
                        Registrar Nuevo Instrumento de Medición (ISO 17025)
                      </h3>
                      <form onSubmit={handleAddEquipment} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label htmlFor="new-equip-code" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                            Código Interno *
                          </label>
                          <input
                            id="new-equip-code"
                            type="text"
                            placeholder="e.g. EQ-BAL-202"
                            required
                            value={newEquip.codigo_interno}
                            onChange={(e) => setNewEquip({ ...newEquip, codigo_interno: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label htmlFor="new-equip-name" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                            Nombre del Equipo *
                          </label>
                          <input
                            id="new-equip-name"
                            type="text"
                            placeholder="e.g. Balanza Electrónica"
                            required
                            value={newEquip.nombre}
                            onChange={(e) => setNewEquip({ ...newEquip, nombre: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label htmlFor="new-equip-brand" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                            Marca
                          </label>
                          <input
                            id="new-equip-brand"
                            type="text"
                            placeholder="e.g. Sartorius"
                            value={newEquip.marca}
                            onChange={(e) => setNewEquip({ ...newEquip, marca: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label htmlFor="new-equip-model" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                            Modelo
                          </label>
                          <input
                            id="new-equip-model"
                            type="text"
                            placeholder="e.g. Secura 225D"
                            value={newEquip.modelo}
                            onChange={(e) => setNewEquip({ ...newEquip, modelo: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label htmlFor="new-equip-serial" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                            Número de Serie *
                          </label>
                          <input
                            id="new-equip-serial"
                            type="text"
                            placeholder="e.g. SN-8837162"
                            required
                            value={newEquip.numero_serie}
                            onChange={(e) => setNewEquip({ ...newEquip, numero_serie: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label htmlFor="new-equip-loc" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                            Ubicación Física
                          </label>
                          <input
                            id="new-equip-loc"
                            type="text"
                            placeholder="e.g. Área de Química"
                            value={newEquip.ubicacion}
                            onChange={(e) => setNewEquip({ ...newEquip, ubicacion: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label htmlFor="new-equip-interval" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                            Intervalo de Calibración
                          </label>
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

                  {/* FORMULARIO ASIGNAR CERTIFICADO DE CALIBRACIÓN */}
                  {selectedEquipForCalibration && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <h3 className="text-xs font-bold uppercase text-emerald-800 tracking-wider mb-1 flex items-center gap-1">
                        <FileSignature className="w-4 h-4" />
                        Registrar Certificado de Calibración para: {selectedEquipForCalibration.codigo_interno}
                      </h3>
                      <p className="text-[11px] text-emerald-700 mb-3 leading-relaxed">
                        Registre el folio oficial del certificado emitido por el laboratorio acreditado y asiente la justificación técnica correspondiente para la firma.
                      </p>

                      <form onSubmit={handleRegisterCalibration} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="new-cert-num" className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                            Número de Certificado (EMA/Acreditado) *
                          </label>
                          <input
                            id="new-cert-num"
                            type="text"
                            placeholder="e.g. EMA-M-4421-2026"
                            required
                            value={newCertificate.numero_certificado}
                            onChange={(e) => setNewCertificate({ ...newCertificate, numero_certificado: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 font-mono"
                          />
                        </div>
                        <div>
                          <label htmlFor="new-cert-issuer" className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                            Laboratorio Emisor Acreditado *
                          </label>
                          <input
                            id="new-cert-issuer"
                            type="text"
                            placeholder="e.g. Metrología del Centro S.A."
                            required
                            value={newCertificate.laboratorio_emisor}
                            onChange={(e) => setNewCertificate({ ...newCertificate, laboratorio_emisor: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label htmlFor="new-cert-cal-date" className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                            Fecha de Calibración *
                          </label>
                          <input
                            id="new-cert-cal-date"
                            type="date"
                            required
                            value={newCertificate.fecha_calibracion}
                            onChange={(e) => setNewCertificate({ ...newCertificate, fecha_calibracion: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label htmlFor="new-cert-exp-date" className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                            Fecha de Vencimiento *
                          </label>
                          <input
                            id="new-cert-exp-date"
                            type="date"
                            required
                            value={newCertificate.fecha_vencimiento}
                            onChange={(e) => setNewCertificate({ ...newCertificate, fecha_vencimiento: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label htmlFor="new-cert-justif" className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                            Justificación Técnica de Calibración & Desviación *
                          </label>
                          <input
                            id="new-cert-justif"
                            type="text"
                            placeholder="e.g. Desviación máx de 0.002g dentro de especificación de tolerancia."
                            required
                            value={newCertificate.justificacion_tecnica}
                            onChange={(e) => setNewCertificate({ ...newCertificate, justificacion_tecnica: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                          />
                        </div>

                        <div className="md:col-span-3 flex items-center justify-between border-t border-emerald-200 pt-3 mt-1">
                          <label className="flex items-center gap-2 text-xs text-emerald-800 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newCertificate.requiere_aprobacion_inmediata}
                              onChange={(e) => setNewCertificate({ ...newCertificate, requiere_aprobacion_inmediata: e.target.checked })}
                              className="rounded text-emerald-600 border-slate-300"
                            />
                            <span>Aprobar y firmar digitalmente al guardar (Aplica si tu rol activo tiene permisos)</span>
                          </label>
                          
                          <div className="flex gap-2">
                            <button
                              id="submit-calibration-cert-btn"
                              type="submit"
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs transition-colors shadow"
                            >
                              Guardar Certificado
                            </button>
                            <button
                              id="cancel-calibration-cert-btn"
                              type="button"
                              onClick={() => setSelectedEquipForCalibration(null)}
                              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded text-xs transition-colors"
                            >
                              Cerrar
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* FORMULARIO SIMULADOR DE MODIFICACIÓN METROLÓGICA CRÍTICA (NMX-17025) */}
                  {selectedEquipForEdit && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2 text-amber-800">
                        <AlertTriangle className="w-5 h-5" />
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider">
                            Modificación Crítica de Instrumento: {selectedEquipForEdit.codigo_interno}
                          </h3>
                          <p className="text-[11px] leading-relaxed">
                            Bajo la norma NMX-EC-17025, cualquier alteración del estatus, nombre o intervalo de calibración de un equipo requiere una Justificación Técnica científica obligatoria que se archivará en el log inalterable.
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleSaveInstrumentEdits} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label htmlFor="edit-equip-name" className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                              Nombre Instrumento
                            </label>
                            <input
                              id="edit-equip-name"
                              type="text"
                              value={editFormFields.nombre}
                              onChange={(e) => setEditFormFields({ ...editFormFields, nombre: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 font-medium"
                            />
                          </div>
                          <div>
                            <label htmlFor="edit-equip-loc" className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                              Ubicación Física
                            </label>
                            <input
                              id="edit-equip-loc"
                              type="text"
                              value={editFormFields.ubicacion}
                              onChange={(e) => setEditFormFields({ ...editFormFields, ubicacion: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                            />
                          </div>
                          <div>
                            <label htmlFor="edit-equip-status" className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                              Estado Operativo *
                            </label>
                            <select
                              id="edit-equip-status"
                              value={editFormFields.estado_operativo}
                              onChange={(e) => setEditFormFields({ ...editFormFields, estado_operativo: e.target.value as any })}
                              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                            >
                              <option value="Operativo">Operativo</option>
                              <option value="Fuera de Servicio">Fuera de Servicio</option>
                              <option value="En Calibración">En Calibración</option>
                              <option value="Baja">Baja</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="edit-equip-interval" className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                              Frecuencia Calibración (Meses)
                            </label>
                            <select
                              id="edit-equip-interval"
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
                          <label htmlFor="edit-justif-text" className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                            Justificación Técnica Obligatoria *
                          </label>
                          <textarea
                            id="edit-justif-text"
                            rows={2}
                            placeholder="Escriba los motivos técnicos detallados que fundamentan este cambio en el equipo..."
                            required
                            value={editJustification}
                            onChange={(e) => setEditJustification(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded p-2 text-xs text-slate-800"
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            id="submit-critical-edit-btn"
                            type="submit"
                            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-xs transition-colors shadow"
                          >
                            Registrar Cambio Metrológico
                          </button>
                          <button
                            id="cancel-critical-edit-btn"
                            type="button"
                            onClick={() => setSelectedEquipForEdit(null)}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded text-xs transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* TABLA DE EQUIPOS */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead className="bg-slate-900 text-white uppercase tracking-wider text-[10px] font-mono">
                          <tr>
                            <th className="px-4 py-3">Código</th>
                            <th className="px-4 py-3">Instrumento / Modelo</th>
                            <th className="px-4 py-3">Serie</th>
                            <th className="px-4 py-3">Ubicación</th>
                            <th className="px-4 py-3 text-center">Frecuencia</th>
                            <th className="px-4 py-3">Semaforización</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredInstruments.map(inst => {
                            // Get active approved certificate
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
                                alertColor = "bg-amber-100 text-amber-800 border-amber-200";
                                alertLabel = `Vence Pronto (${daysLeft} d)`;
                              } else {
                                alertColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
                                alertLabel = `Vigente (${daysLeft} d)`;
                              }
                            } else {
                              alertColor = "bg-red-100 text-red-800 border-red-200";
                              alertLabel = "Vencido / Requerido";
                            }

                            return (
                              <tr key={inst.id_instrumento} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3.5 font-mono font-bold text-slate-800">
                                  {inst.codigo_interno}
                                </td>
                                <td className="px-4 py-3.5">
                                  <div className="font-semibold text-slate-950">{inst.nombre}</div>
                                  <div className="text-[10px] text-slate-500 font-medium">
                                    {inst.marca} - {inst.modelo}
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 font-mono text-slate-600">
                                  {inst.numero_serie}
                                </td>
                                <td className="px-4 py-3.5 text-slate-700">
                                  {inst.ubicacion}
                                </td>
                                <td className="px-4 py-3.5 text-center text-slate-700 font-mono">
                                  {inst.intervalo_calibracion_meses} m
                                </td>
                                <td className="px-4 py-3.5">
                                  <div className="flex flex-col gap-1">
                                    <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full border ${alertColor} w-fit`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${
                                        alertLabel.includes('Vigente') ? 'bg-emerald-500' :
                                        alertLabel.includes('Vence Pronto') ? 'bg-amber-500' :
                                        alertLabel.includes('Fuera de Servicio') ? 'bg-slate-400' : 'bg-red-500'
                                      }`}></span>
                                      {alertLabel}
                                    </span>
                                    {pendingCert && (
                                      <span className="text-[9px] text-amber-600 font-mono animate-pulse block">
                                        ⚠️ Certificado Pendiente Firma
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 text-right space-x-1 whitespace-nowrap">
                                  <button
                                    id={`instrument-calib-btn-${inst.codigo_interno}`}
                                    onClick={() => {
                                      if (!checkPermission(currentPersonaId, "calibracion:crear")) {
                                        alert("No tienes permiso para cargar calibraciones.");
                                        return;
                                      }
                                      setSelectedEquipForCalibration(inst);
                                      setSelectedEquipForEdit(null);
                                    }}
                                    title="Registrar Certificado de Calibración"
                                    className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 rounded transition-colors"
                                  >
                                    <FileSignature className="w-3.5 h-3.5" />
                                  </button>
                                  
                                  <button
                                    id={`instrument-edit-btn-${inst.codigo_interno}`}
                                    onClick={() => {
                                      if (!checkPermission(currentPersonaId, "equipos:editar")) {
                                        alert("No tienes permiso para editar especificaciones de equipos.");
                                        return;
                                      }
                                      startEditInstrument(inst);
                                      setSelectedEquipForCalibration(null);
                                    }}
                                    title="Modificación Metrológica (NMX-17025)"
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

                  {/* TABLA HISTORIAL DE CERTIFICADOS CON FIRMAS DIGITALES */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
                      <span>Carga y Custodia Legal de Certificados (NOM-151 & e.firma)</span>
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
                                <span className="font-mono font-bold text-xs text-slate-900">
                                  {cert.numero_certificado}
                                </span>
                                <span className="text-[9px] font-mono bg-slate-100 px-1.5 py-0.2 rounded border text-slate-500 uppercase">
                                  {inst ? inst.codigo_interno : "Desconocido"}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                                  isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {cert.estado_aprobacion}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 font-medium">
                                Laboratorio: {cert.laboratorio_emisor}
                              </p>
                              <div className="text-[10px] text-slate-500 font-mono flex flex-wrap gap-x-4">
                                <span>Calibrado el: {cert.fecha_calibracion}</span>
                                <span className="font-semibold text-slate-700">Expira: {cert.fecha_vencimiento}</span>
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
                                  <div className="text-[9px] text-slate-500">
                                    Por: {approverUser ? approverUser.nombre_completo : "Director Ejecutivo"}
                                  </div>
                                  <div className="text-[8px] text-slate-400 font-mono bg-slate-100 px-1 py-0.5 border rounded">
                                    {cert.sello_digital_nom151}
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1 w-full md:w-auto">
                                  <div className="text-[9px] text-amber-600 font-semibold font-mono">
                                    ⚠️ PENDIENTE DE VALIDACIÓN Y FIRMA
                                  </div>
                                  <button
                                    id={`approve-cert-btn-${cert.numero_certificado}`}
                                    onClick={() => handleApproveCertificate(cert)}
                                    className="w-full md:w-auto px-3 py-1 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded text-[10px] transition-colors"
                                  >
                                    Asentar Firma Digital (Roberto Fernández/Supervisor)
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: BITÁCORA DE AUDITORÍA (TRAZABILIDAD NMX-17025) */}
              {activeTab === 'audit' && (
                <motion.div
                  key="audit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Activity className="text-emerald-600 w-5 h-5" />
                        Bitácora General de Auditoría e Inalterabilidad
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Trazabilidad obligatoria conforme a la norma NMX-EC-17025-IMNC-2018. Todos los registros son inalterables y están encadenados criptográficamente (NOM-151).
                      </p>
                    </div>

                    <div className="bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <Hash className="w-4.5 h-4.5 text-emerald-700 animate-spin" />
                      <div className="text-left">
                        <span className="text-[9px] font-bold text-emerald-800 uppercase block leading-none">INTEGRIDAD NOM-151</span>
                        <span className="text-[11px] font-mono text-emerald-700 font-bold block">CADENA ACTIVA Y SEGURA</span>
                      </div>
                    </div>
                  </div>

                  {/* MENSAJE DE ADVERTENCIA SOBRE INALTERABILIDAD */}
                  <div className="bg-slate-900 text-slate-200 p-4 rounded-xl border border-slate-800 flex gap-3">
                    <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Garantía Relacional de No Manipulación (Trigger SQL)
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        El motor de base de datos PostgreSQL implementa el trigger <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-[10px] text-emerald-300">tg_proteger_bitacora</code> sobre esta tabla. Si un administrador con privilegios de superusuario intenta ejecutar un comando <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-[10px] text-amber-400">UPDATE</code> o <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-[10px] text-red-400">DELETE</code> directo en consola, la base de datos abortará la transacción con una excepción técnica.
                      </p>
                    </div>
                  </div>

                  {/* VISUALIZACIÓN DE LOS REGISTROS DE AUDITORÍA */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                      Registros de Eventos Recientes (Inmutable Log)
                    </h3>

                    <div className="space-y-3">
                      {auditLogs.map(log => (
                        <div key={log.id_log} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono font-bold text-slate-500">
                                LOG-#{log.id_log}
                              </span>
                              
                              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                                log.accion === 'INSERT' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                log.accion === 'UPDATE' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                log.accion === 'SIGN' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                                'bg-slate-100 text-slate-800 border border-slate-200'
                              }`}>
                                {log.accion}
                              </span>

                              <span className="text-xs text-slate-700">
                                Tabla: <code className="bg-slate-100 font-mono text-[11px] px-1.5 py-0.5 rounded text-slate-900 font-bold">{log.tabla_afectada}</code>
                              </span>

                              <span className="text-xs text-slate-500">
                                ID Registro: <code className="font-mono text-[11px] text-slate-700">{log.registro_id}</code>
                              </span>
                            </div>

                            <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
                              <span>IP: {log.ip_origen}</span>
                              <span>•</span>
                              <span>{log.timestamp}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            
                            {/* Autor y Justificación */}
                            <div className="md:col-span-5 space-y-2">
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Autor Técnico:</span>
                                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                                  <span>{log.usuario_nombre}</span>
                                  <span className="text-[9px] font-mono bg-slate-100 px-1 py-0.2 border rounded text-slate-500">
                                    {log.usuario_rol}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Justificación Técnica (Exigencia ISO 17025):</span>
                                <p className="text-xs text-slate-800 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                                  "{log.justificacion_tecnica}"
                                </p>
                              </div>
                            </div>

                            {/* Detalle JSONB de datos anterior/nuevo */}
                            <div className="md:col-span-7 space-y-2">
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Consistencia JSONB:</span>
                              
                              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                                <div>
                                  <div className="bg-slate-100 px-2 py-0.5 border border-slate-200 rounded-t text-[9px] text-slate-500 font-bold uppercase">
                                    Valor Anterior
                                  </div>
                                  <pre className="p-2 bg-slate-950 text-slate-300 rounded-b max-h-[100px] overflow-y-auto">
                                    {log.valor_anterior 
                                      ? JSON.stringify(JSON.parse(log.valor_anterior), null, 2) 
                                      : "NULL (INSERT)"
                                    }
                                  </pre>
                                </div>

                                <div>
                                  <div className="bg-slate-100 px-2 py-0.5 border border-slate-200 rounded-t text-[9px] text-slate-500 font-bold uppercase">
                                    Valor Nuevo
                                  </div>
                                  <pre className="p-2 bg-slate-950 text-emerald-400 rounded-b max-h-[100px] overflow-y-auto">
                                    {log.valor_nuevo 
                                      ? JSON.stringify(JSON.parse(log.valor_nuevo), null, 2) 
                                      : "NULL (DELETE)"
                                    }
                                  </pre>
                                </div>
                              </div>
                            </div>

                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-500 gap-2">
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              Firma Digital de Sello de Auditoría Activa
                            </span>
                            <span className="font-mono bg-slate-50 px-2 py-0.5 border rounded text-slate-600 block truncate max-w-md">
                              Hash: {log.hash_integridad}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: MARCO REGULATORIO */}
              {activeTab === 'regulation' && (
                <motion.div
                  key="regulation"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <HelpCircle className="text-emerald-600 w-5 h-5" />
                      Marco Regulatorio del Sistema ASP/EcH&S
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Análisis detallado de cómo este diseño arquitectónico de base de datos se adhiere de forma estricta a las normativas de metrología, firma digital y protección de datos en México.
                    </p>
                  </div>

                  {/* CARDS DE NORMAS */}
                  <div className="space-y-4">
                    {EXPLICACION_NORMATIVA.map((norma, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all">
                        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
                          {norma.norma}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {norma.puntos.map((punto, pIdx) => (
                            <div key={pIdx} className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-1.5">
                              <h4 className="text-xs font-bold text-slate-950 flex items-center gap-1">
                                <Info className="w-3.5 h-3.5 text-emerald-600" />
                                {punto.titulo}
                              </h4>
                              <p className="text-xs text-slate-700 leading-relaxed font-light">
                                {punto.detalle}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* SEGURIDAD DE LA BASE DE DATOS E INSTRUCCIONES DE ENCRIPTACIÓN */}
                  <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                      Instrucciones de Despliegue de Seguridad (Recomendaciones del Auditor)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
                      <div className="space-y-2">
                        <h4 className="font-bold text-white flex items-center gap-1">
                          <Lock className="w-4 h-4 text-emerald-400" />
                          Encriptación en Reposo y Tránsito (LFPDPPP)
                        </h4>
                        <p>
                          1. Configure su base de datos PostgreSQL en Google Cloud Run / Cloud SQL para forzar conexiones TLS (SSL) v1.3 únicamente.
                        </p>
                        <p>
                          2. Habilite el cifrado de almacenamiento (AES-256) administrado por el cliente o por Google por defecto para salvaguardar todos los registros metrológicos e información de usuarios.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-bold text-white flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          Derechos ARCO (Acceso, Rectificación, Cancelación, Oposición)
                        </h4>
                        <p>
                          Debido a que la norma <strong className="text-emerald-400">NMX-EC-17025</strong> exige mantener la inalterabilidad de los registros históricos, si un usuario ejerce su derecho ARCO de cancelación, se debe proceder a la <strong className="text-white">Seudonimización</strong> o disociación de la identidad personal (removiendo nombres y correos de la tabla <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-[10px] text-emerald-300">usuarios</code>) pero manteniendo intactos los logs en <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-[10px] text-emerald-300">bitacora_auditoria</code> bajo el folio anonymized, balanceando ambas exigencias de ley.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB: FLUJO DE TRABAJO DE CAMPO (NOM-011-STPS) */}
              {activeTab === 'field_workflow' && (
                <motion.div
                  key="field_workflow"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 text-slate-800 animate-fade-in"
                >
                  <div className="border-b border-slate-200 pb-4">
                    <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                      <FileSignature className="text-emerald-600 w-5 h-5" />
                      Levantamiento de Ruido en Sitio (NOM-011-STPS) & Validación de Datos
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Flujo de trabajo integrado para Técnico de Campo (Check-in, EPP y cierre de formulario bajo NOM-151) y Coordinador (Validación y Auditoría bajo NMX-17025).
                    </p>
                  </div>

                  {/* ALERTA DE PERSONA ACTUAL */}
                  <div className="bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 flex items-center justify-between text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <span>Simulando como: <strong>{activePersona.nombre_completo}</strong> ({activePersona.id_rol})</span>
                    </div>
                    <span className="text-[10px] text-slate-500 italic">Cambie de usuario en el selector superior para interactuar con cada rol</span>
                  </div>

                  {/* GRID PRINCIPAL */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* COLUMNA IZQUIERDA: TERMINAL DEL TÉCNICO DE CAMPO (ROL 3) */}
                    <div className="lg:col-span-7 bg-slate-900 text-slate-200 rounded-2xl p-5 md:p-6 shadow-xl border border-slate-800 space-y-6">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Sliders className="w-4 h-4 text-emerald-400" />
                            Terminal de Campo (Consultor)
                          </h3>
                          <p className="text-[10px] text-slate-400">Digitalización de Mediciones en Sitio</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          fieldIsLocked ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {fieldIsLocked ? 'FORMULARIO BLOQUEADO (NOM-151)' : 'EDICIÓN ABIERTA'}
                        </span>
                      </div>

                      {/* PASO A PASO STEP INDICATOR */}
                      <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-mono">
                        {[
                          { step: 1, label: "Check-in" },
                          { step: 2, label: "EPP" },
                          { step: 3, label: "Lecturas" },
                          { step: 4, label: "Firmas" },
                          { step: 5, label: "NOM-151" }
                        ].map((s) => {
                          const isActive = fieldStep === s.step;
                          const isDone = fieldStep > s.step;
                          return (
                            <div key={s.step} className="flex flex-col items-center space-y-1">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                                isActive ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' :
                                isDone ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'
                              }`}>
                                {isDone ? '✓' : s.step}
                              </div>
                              <span className={`hidden sm:inline text-[9px] ${isActive ? 'text-white font-bold' : isDone ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {s.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* CONTENIDO DE LOS PASOS */}
                      <form onSubmit={fieldIsLocked ? (e) => e.preventDefault() : handleFieldSubmitForm} className="space-y-6">
                        
                        {/* PASO 1: CHECK-IN GEOLOCALIZADO */}
                        {fieldStep === 1 && !fieldIsLocked && (
                          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 space-y-4">
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Paso 1: Validación GPS Obligatoria</h4>
                              <p className="text-[11px] text-slate-400 leading-relaxed">
                                De acuerdo con las regulaciones de la STPS y la NMX-17025, el técnico debe verificar geolocalizadamente su presencia en la planta antes de poder registrar cualquier dato metrológico.
                              </p>
                            </div>

                            <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300">
                              <div>Coordenadas: <span className="text-blue-400">{fieldCheckinCoords || "Pendiente Check-In..."}</span></div>
                              <div>Hora Check-In: <span className="text-blue-400">{fieldCheckinTime || "Pendiente..."}</span></div>
                            </div>

                            <button
                              type="button"
                              onClick={handleFieldGPSCheckIn}
                              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20"
                            >
                              <Activity className="w-4 h-4 animate-pulse" />
                              <span>Registrar Check-In Geolocalizado</span>
                            </button>
                          </div>
                        )}

                        {/* PASO 2: CHECKLIST DE EPP */}
                        {fieldStep === 2 && !fieldIsLocked && (
                          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 space-y-4">
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Paso 2: Checklist de EPP Obligatorio</h4>
                              <p className="text-[11px] text-slate-400 leading-relaxed">
                                Verifique y confirme el uso obligatorio de todo el Equipo de Protección Personal antes de ingresar al área de ruido de acuerdo con la NOM-011-STPS.
                              </p>
                            </div>

                            <div className="space-y-2">
                              {[
                                { key: 'casco', label: 'Casco de protección industrial (Clase G o C)' },
                                { key: 'tapones', label: 'Tapones auditivos / Orejeras de alta atenuación (NOM-011)' },
                                { key: 'calzado', label: 'Calzado de seguridad industrial dieléctrico' },
                                { key: 'chaleco', label: 'Chaleco reflejante de alta visibilidad' }
                              ].map((item) => (
                                <label key={item.key} className="flex items-center gap-3 bg-slate-950/40 hover:bg-slate-950/80 p-2.5 rounded border border-slate-800 cursor-pointer transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={(fieldEppChecked as any)[item.key]}
                                    onChange={(e) => setFieldEppChecked({ ...fieldEppChecked, [item.key]: e.target.checked })}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                                  />
                                  <span className="text-xs text-slate-300">{item.label}</span>
                                </label>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setFieldStep(1)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                              >
                                Atrás
                              </button>
                              <button
                                type="button"
                                disabled={!fieldEppChecked.casco || !fieldEppChecked.tapones || !fieldEppChecked.calzado || !fieldEppChecked.chaleco}
                                onClick={() => setFieldStep(3)}
                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-lg text-xs transition-colors shadow-lg disabled:shadow-none"
                              >
                                Confirmar EPP y Continuar
                              </button>
                            </div>
                          </div>
                        )}

                        {/* PASO 3: FORMULARIO DE CAPTURA DE MEDIDAS */}
                        {fieldStep === 3 && !fieldIsLocked && (
                          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 space-y-4">
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Paso 3: Selección de Equipo & Captura NOM-011</h4>
                              <p className="text-[11px] text-slate-400">
                                Capture los niveles de presión sonora (dB) medidos en sitio en el punto determinado de la planta.
                              </p>
                            </div>

                            {/* SELECCIÓN DE SONÓMETRO */}
                            <div className="space-y-1.5">
                              <label htmlFor="sonometer-select" className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Sonómetro Utilizado *
                              </label>
                              <select
                                id="sonometer-select"
                                value={fieldSonometerId}
                                onChange={(e) => setFieldSonometerId(e.target.value)}
                                className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-lg text-xs px-3 py-2 focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="">-- Seleccione un Sonómetro --</option>
                                {instruments.map(i => (
                                  <option key={i.id_instrumento} value={i.id_instrumento}>
                                    {i.codigo_interno} ({i.nombre})
                                  </option>
                                ))}
                              </select>

                              {/* ALERTA DE METROLOGÍA DINÁMICA (VALIDACIÓN DE VIGENCIA) */}
                              {fieldSonometerId && (() => {
                                const selectedSono = instruments.find(i => i.id_instrumento === fieldSonometerId);
                                const approvedCerts = certificates.filter(c => c.id_instrumento === fieldSonometerId && c.estado_aprobacion === 'Aprobado');
                                const hasVigente = approvedCerts.some(c => new Date(c.fecha_vencimiento) > new Date());
                                const latestCert = approvedCerts[0];

                                if (hasVigente) {
                                  return (
                                    <div className="bg-emerald-950/40 border border-emerald-900/50 p-2.5 rounded text-[11px] text-emerald-300 space-y-1">
                                      <div className="font-semibold flex items-center gap-1">
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>EQUIPO APTO CONFORME A NMX-17025</span>
                                      </div>
                                      <p className="text-[10px] text-emerald-400/80">
                                        El instrumento posee el certificado de calibración vigente <strong>{latestCert?.numero_certificado}</strong> aprobado ante la EMA (Expira: {latestCert?.fecha_vencimiento}).
                                      </p>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div className="bg-red-950/40 border border-red-900/50 p-2.5 rounded text-[11px] text-red-300 space-y-1">
                                      <div className="font-semibold flex items-center gap-1">
                                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                                        <span>EQUIPO BLOQUEADO - CERTIFICADO VENCIDO</span>
                                      </div>
                                      <p className="text-[10px] text-red-400/80">
                                        {selectedSono?.codigo_interno} no posee ningún certificado de calibración aprobado vigente. No es posible generar registros válidos ante la STPS.
                                      </p>
                                    </div>
                                  );
                                }
                              })()}
                            </div>

                            {/* DATOS DEL PUNTO */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="md:col-span-1 space-y-1">
                                <label htmlFor="field-area" className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                  Área de la Planta *
                                </label>
                                <input
                                  id="field-area"
                                  type="text"
                                  value={fieldArea}
                                  onChange={(e) => setFieldArea(e.target.value)}
                                  placeholder="Ej. Taller de Prensas"
                                  className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-lg text-xs px-3 py-1.5 focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div className="space-y-1">
                                <label htmlFor="field-start-time" className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                  Hora Inicio *
                                </label>
                                <input
                                  id="field-start-time"
                                  type="time"
                                  value={fieldStartTime}
                                  onChange={(e) => setFieldStartTime(e.target.value)}
                                  className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-lg text-xs px-3 py-1.5 focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div className="space-y-1">
                                <label htmlFor="field-end-time" className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                  Hora Fin *
                                </label>
                                <input
                                  id="field-end-time"
                                  type="time"
                                  value={fieldEndTime}
                                  onChange={(e) => setFieldEndTime(e.target.value)}
                                  className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-lg text-xs px-3 py-1.5 focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </div>

                            {/* TABLA DE LECTURAS DINÁMICA */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nivel de Presión Sonora Continuo Equivalente</span>
                                <button
                                  type="button"
                                  onClick={() => setFieldReadings([...fieldReadings, { db: 85, conditions: "Operación estándar" }])}
                                  className="px-2 py-0.5 bg-blue-600/80 hover:bg-blue-600 text-white font-mono rounded text-[9px] flex items-center gap-1"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                  <span>Añadir Lectura</span>
                                </button>
                              </div>

                              <div className="space-y-2 max-h-[140px] overflow-y-auto">
                                {fieldReadings.map((reading, idx) => (
                                  <div key={idx} className="flex gap-2 items-center bg-slate-950/30 p-1.5 rounded border border-slate-800">
                                    <span className="text-[10px] font-mono text-slate-500 w-6 text-center">#{idx + 1}</span>
                                    
                                    <div className="w-24 flex items-center gap-1">
                                      <label htmlFor={`reading-db-${idx}`} className="sr-only">Nivel dB(A)</label>
                                      <input
                                        id={`reading-db-${idx}`}
                                        type="number"
                                        step="0.1"
                                        value={reading.db}
                                        onChange={(e) => {
                                          const newR = [...fieldReadings];
                                          newR[idx].db = Number(e.target.value);
                                          setFieldReadings(newR);
                                        }}
                                        className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded text-xs px-2 py-1 font-mono text-center"
                                      />
                                      <span className="text-[10px] text-slate-400 font-bold">dB</span>
                                    </div>

                                    <div className="flex-1">
                                      <label htmlFor={`reading-cond-${idx}`} className="sr-only">Condiciones Ambientales</label>
                                      <input
                                        id={`reading-cond-${idx}`}
                                        type="text"
                                        value={reading.conditions}
                                        onChange={(e) => {
                                          const newR = [...fieldReadings];
                                          newR[idx].conditions = e.target.value;
                                          setFieldReadings(newR);
                                        }}
                                        placeholder="Condiciones de la fuente de ruido..."
                                        className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded text-xs px-2 py-1"
                                      />
                                    </div>

                                    {fieldReadings.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => setFieldReadings(fieldReadings.filter((_, rIdx) => rIdx !== idx))}
                                        className="text-red-400 hover:text-red-300 p-1 font-mono text-[10px]"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-slate-800">
                              <button
                                type="button"
                                onClick={() => setFieldStep(2)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                              >
                                Atrás
                              </button>
                              <button
                                type="button"
                                onClick={() => setFieldStep(4)}
                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors"
                              >
                                Continuar a Firmas
                              </button>
                            </div>
                          </div>
                        )}

                        {/* PASO 4: FIRMAS DIGITALES DE CONFORMIDAD */}
                        {fieldStep === 4 && !fieldIsLocked && (
                          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 space-y-4">
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Paso 4: Firmas de Conformidad del Levantamiento</h4>
                              <p className="text-[11px] text-slate-400 leading-relaxed">
                                Para asentar validez legal ante la STPS y cumplir con la Ley de Firma Electrónica Avanzada, se requieren los datos de conformidad de las partes.
                              </p>
                            </div>

                            <div className="space-y-3">
                              <div className="space-y-1">
                                <label htmlFor="field-tech-name" className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                  Nombre del Técnico Laboratorista *
                                </label>
                                <input
                                  id="field-tech-name"
                                  type="text"
                                  value={fieldTechName}
                                  onChange={(e) => setFieldTechName(e.target.value)}
                                  placeholder="Ej. Lucía Juárez"
                                  className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-lg text-xs px-3 py-1.5 focus:ring-1 focus:ring-blue-500"
                                />
                                <span className="text-[9px] text-slate-500 block">La firma del técnico se asentará electrónicamente usando su e.firma certificada del laboratorio.</span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label htmlFor="field-rep-name" className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                    Representante de Planta *
                                  </label>
                                  <input
                                    id="field-rep-name"
                                    type="text"
                                    value={fieldRepName}
                                    onChange={(e) => setFieldRepName(e.target.value)}
                                    placeholder="Nombre de contacto en sitio"
                                    className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-lg text-xs px-3 py-1.5 focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label htmlFor="field-rep-puesto" className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                    Puesto del Representante *
                                  </label>
                                  <input
                                    id="field-rep-puesto"
                                    type="text"
                                    value={fieldRepPuesto}
                                    onChange={(e) => setFieldRepPuesto(e.target.value)}
                                    placeholder="Ej. Gerente de Seguridad"
                                    className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-lg text-xs px-3 py-1.5 focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-slate-800">
                              <button
                                type="button"
                                onClick={() => setFieldStep(3)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                              >
                                Atrás
                              </button>
                              <button
                                type="submit"
                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors shadow-lg shadow-emerald-600/20"
                              >
                                Finalizar Levantamiento (Sello Criptográfico NOM-151)
                              </button>
                            </div>
                          </div>
                        )}

                        {/* PASO 5: RESUMEN DE CONTRALORÍA Y BLOQUEO CRIPTOGRÁFICO */}
                        {(fieldStep === 5 || fieldIsLocked) && (
                          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 space-y-4 animate-fade-in">
                            <div className="text-center space-y-2 py-2">
                              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                                <Lock className="w-6 h-6" />
                              </div>
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">REGISTRO SELLADO BAJO NOM-151</h4>
                              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                                Para garantizar la no-alterabilidad exigida por la normatividad nacional, este formulario está cerrado. Los datos han sido enviados al Coordinador para revisión técnica.
                              </p>
                            </div>

                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[10px] space-y-2 text-slate-300">
                              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                <span className="text-slate-500">Folio Documento:</span>
                                <span className="text-blue-400 font-bold">REP-NOM011-2026-00{submittedReports.length}</span>
                              </div>
                              <div className="flex flex-col gap-0.5 border-b border-slate-900 pb-1.5">
                                <span className="text-slate-500">Constancia de Conservación PSC:</span>
                                <span className="text-emerald-400 break-all">{fieldConstanciaNOM151 || "NOM151:CONSTANCIA-2026-07-14-FIELD-0982"}</span>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-slate-500">Hash Integridad SHA256:</span>
                                <span className="text-amber-400 break-all font-bold">{fieldHash || "SHA256:f16b23087a3296acb03c834a3179df1432f59c8b931e129450ad89a12a"}</span>
                              </div>
                            </div>

                            {/* VER DETALLE JSON (PUNTO 2) */}
                            <div className="space-y-2">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estructura del Formulario Digital (JSON - NOM-011)</span>
                              <pre className="p-3 bg-slate-950 text-emerald-400 rounded-lg text-[9px] max-h-[160px] overflow-y-auto border border-slate-800">
                                {JSON.stringify(submittedReports[0]?.payload || {}, null, 2)}
                              </pre>
                            </div>

                            <button
                              type="button"
                              onClick={handleResetFieldForm}
                              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-xs transition-colors border border-slate-700"
                            >
                              Capturar Nuevo Levantamiento (Reiniciar Formulario)
                            </button>
                          </div>
                        )}
                        
                      </form>
                    </div>

                    {/* COLUMNA DERECHA: REVISIÓN DEL COORDINADOR (ROL 2) */}
                    <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm space-y-6">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          Bandeja del Coordinador
                        </h3>
                        <p className="text-[10px] text-slate-500">Validación Técnica y Registro de Auditoría</p>
                      </div>

                      {/* INFORMACIÓN DE APOYO AL REVISOR */}
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1 leading-relaxed">
                        <div className="font-bold flex items-center gap-1 text-[11px]">
                          <Info className="w-3.5 h-3.5" />
                          <span>Instrucciones de Validación (NMX-17025)</span>
                        </div>
                        <p className="text-[11px] font-light">
                          El Coordinador de Operaciones debe verificar el cumplimiento del checklist de EPP, el check-in satelital, y que el sonómetro tenga un certificado vigente antes de autorizar. El rechazo exige asentar la justificación científica en el Audit Trail.
                        </p>
                      </div>

                      {/* LISTA DE SOLICITUDES EN REVISIÓN */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cola de Reportes de Campo</h4>

                        {submittedReports.length === 0 ? (
                          <p className="text-xs text-slate-400 italic text-center py-6">No hay reportes enviados a revisión.</p>
                        ) : (
                          submittedReports.map((report) => {
                            const isPending = report.estado === 'Pendiente';
                            const isApproved = report.estado === 'Aprobado';
                            const isRejected = report.estado === 'Rechazado';
                            
                            const certCheck = report.payload?.instrumento_utilizado?.certificado_calibracion_vigente;
                            const gpsCheck = report.payload?.datos_sitio?.coordenadas_gps;
                            const readingsCount = report.payload?.lecturas?.length || 0;

                            return (
                              <div key={report.id_reporte} className={`border rounded-xl p-4 space-y-3.5 transition-all ${
                                isApproved ? 'border-emerald-200 bg-emerald-50/20' :
                                isRejected ? 'border-red-200 bg-red-50/20' : 'border-amber-200 bg-amber-50/10 shadow-sm'
                              }`}>
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                  <div>
                                    <span className="font-mono font-bold text-xs text-slate-900 block">{report.id_reporte}</span>
                                    <span className="text-[10px] text-slate-500 font-medium">Técnico: {report.tecnico}</span>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase ${
                                    isApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                    isRejected ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                                  }`}>
                                    {report.estado}
                                  </span>
                                </div>

                                {/* RESUMEN DE COMPROBACIÓN DE CAMPOS */}
                                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-600 bg-white p-2 rounded border border-slate-100">
                                  <div>GPS: <span className="text-emerald-600 font-bold">✓ {gpsCheck?.substring(0, 11)}...</span></div>
                                  <div>EPP Check: <span className="text-emerald-600 font-bold">✓ Completo</span></div>
                                  <div className="col-span-2">Sonómetro: <span className="font-sans text-slate-800 font-semibold">{report.payload?.instrumento_utilizado?.codigo_interno} ({certCheck ? 'Calibración Vigente' : 'Sin Calibración'})</span></div>
                                  <div className="col-span-2">Punto: <span className="font-sans text-slate-800">{report.payload?.punto_medicion?.area_descripcion} ({readingsCount} lecturas)</span></div>
                                </div>

                                {/* CASO REVISADO */}
                                {(isApproved || isRejected) && (
                                  <div className="bg-white p-2.5 rounded border border-slate-100 text-[11px] space-y-1">
                                    <div className="font-bold text-slate-900 flex items-center gap-1">
                                      <CheckCircle className={`w-3.5 h-3.5 ${isApproved ? 'text-emerald-600' : 'text-red-600'}`} />
                                      <span>Dictaminado por: {report.aprobado_por}</span>
                                    </div>
                                    <p className="text-slate-600 italic">"{report.justificacion_coordinador}"</p>
                                    <span className="text-[9px] text-slate-400 font-mono block">Fecha: {new Date(report.timestamp_revision).toLocaleString('es-MX')}</span>
                                  </div>
                                )}

                                {/* CASO PENDIENTE DE REVISIÓN */}
                                {isPending && (
                                  <div className="space-y-3.5">
                                    <div className="space-y-1">
                                      <label htmlFor={`justif-coord-${report.id_reporte}`} className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                        Justificación Técnica de Revisión * (NMX-17025)
                                      </label>
                                      <textarea
                                        id={`justif-coord-${report.id_reporte}`}
                                        rows={2}
                                        value={coordinatorJustifications[report.id_reporte] || ""}
                                        onChange={(e) => setCoordinatorJustifications({ ...coordinatorJustifications, [report.id_reporte]: e.target.value })}
                                        placeholder="Ej. Se valida que el levantamiento de ruido se realizó con el instrumento verificado, check-in conforme y EPP completo."
                                        className="w-full text-xs text-slate-800 p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50"
                                      />
                                    </div>

                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (!checkPermission(currentPersonaId, "calibracion:aprobar")) {
                                            alert("Error: Su rol simulado actual no cuenta con privilegios de aprobación técnica (Se requiere Coordinador, Supervisor o Director).");
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
                                          if (!checkPermission(currentPersonaId, "calibracion:aprobar")) {
                                            alert("Error: Su rol simulado actual no cuenta con privilegios de aprobación técnica (Se requiere Coordinador, Supervisor o Director).");
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
                                )}

                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* FOOTER */}
          <footer className="py-8 text-center text-[11px] text-slate-400 border-t border-slate-200/60 mt-12 space-y-1">
            <p className="font-semibold text-slate-600">ASP/EcH&S Portal de Operaciones v1.0</p>
            <p>Diseñado para el Director de Operaciones Roberto Fernández bajo las normativas nacionales vigentes.</p>
            <p className="font-mono text-[9px] text-slate-400 uppercase tracking-wider">CONFORMIDAD • NMX-EC-17025 • NOM-151-SCFI-2016 • LEY DE FIRMA ELECTRÓNICA AVANZADA • LFPDPPP</p>
          </footer>

        </div>
      </main>

    </div>
  );
}
