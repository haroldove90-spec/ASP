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
  Edit3
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
  const [activeTab, setActiveTab] = useState<'schema' | 'rbac' | 'audit' | 'equipment' | 'regulation'>('schema');

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

  // Reset local storage to default initial data
  const handleResetData = () => {
    if (confirm("¿Estás seguro de que deseas restablecer los datos originales de la simulación? Se perderán los registros que hayas agregado.")) {
      localStorage.removeItem('aspechs_usuarios');
      localStorage.removeItem('aspechs_instruments');
      localStorage.removeItem('aspechs_certificates');
      localStorage.removeItem('aspechs_audit_logs');
      setUsuarios(INITIAL_USUARIOS);
      setInstruments(INITIAL_INSTRUMENTOS);
      setCertificates(INITIAL_CERTIFICADOS);
      setAuditLogs(INITIAL_AUDIT_LOGS);
      setRbacSimResult(null);
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
                {activeTab === 'schema' && "Panel de Control - Esquema de Base de Datos"}
                {activeTab === 'equipment' && "Gestión de Equipos y Vigencias"}
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
