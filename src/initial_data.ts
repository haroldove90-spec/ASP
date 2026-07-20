// Tipos de datos para el simulador de ASP/EcH&S
export interface Rol {
  id_rol: string;
  nombre: string;
  descripcion: string;
  creado_en: string;
}

export interface Permiso {
  id_permiso: string;
  modulo: string;
  accion: string;
  descripcion: string;
}

export interface Usuario {
  id_usuario: string;
  nombre_completo: string;
  email: string;
  id_rol: string;
  puesto: string;
  firma_electronica_fingerprint: string;
  esta_activo: boolean;
  ultimo_acceso: string;
}

export interface Instrumento {
  id_instrumento: string;
  codigo_interno: string;
  nombre: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  ubicacion: string;
  intervalo_calibracion_meses: number;
  estado_operativo: 'Operativo' | 'Fuera de Servicio' | 'En Calibración' | 'Baja';
}

export interface CertificadoCalibracion {
  id_certificado: string;
  id_instrumento: string;
  numero_certificado: string;
  laboratorio_emisor: string;
  fecha_calibracion: string;
  fecha_vencimiento: string;
  url_documento: string;
  archivo_hash_sha256: string;
  estado_aprobacion: 'Pendiente' | 'Aprobado' | 'Rechazado';
  aprobado_por?: string;
  fecha_aprobacion?: string;
  justificacion_aprobacion?: string;
  sello_digital_nom151?: string;
}

export interface AuditLog {
  id_log: number;
  id_usuario: string;
  usuario_nombre: string;
  usuario_rol: string;
  tabla_afectada: string;
  registro_id: string;
  accion: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'SIGN';
  valor_anterior: string | null; // JSON String
  valor_nuevo: string | null;    // JSON String
  justificacion_tecnica: string;
  hash_integridad: string;
  ip_origen: string;
  timestamp: string;
}

// Roles Predefinidos
export const INITIAL_ROLES: Rol[] = [
  {
    id_rol: "DIR_OP",
    nombre: "Director de Operaciones",
    descripcion: "Roberto Fernández. Supervisión global de cumplimiento, aprobación de contingencias de calibración y visualización del Audit Trail.",
    creado_en: "2026-01-10T08:00:00Z"
  },
  {
    id_rol: "SYS_ADMIN",
    nombre: "Administrador de Sistemas",
    descripcion: "Gestión de usuarios, asignación estricta de roles, auditoría de seguridad informática y mantenimiento del sistema.",
    creado_en: "2026-01-10T08:00:00Z"
  },
  {
    id_rol: "LAB_SUP",
    nombre: "Supervisor de Laboratorio / H&S",
    descripcion: "Aprobación de certificados de calibración, liberación operativa de equipos, gestión técnica y asignación de tareas de medición.",
    creado_en: "2026-01-10T08:00:00Z"
  },
  {
    id_rol: "LAB_TECH",
    nombre: "Analista / Técnico de Laboratorio",
    descripcion: "Registro de instrumentos, carga preliminar de certificados de calibración emitidos por la EMA, y operación ordinaria de mediciones.",
    creado_en: "2026-01-10T08:00:00Z"
  }
];

// Permisos Predefinidos
export const INITIAL_PERMISOS: Permiso[] = [
  { id_permiso: "equipos:leer", modulo: "equipos", accion: "leer", descripcion: "Consultar inventario de instrumentos" },
  { id_permiso: "equipos:crear", modulo: "equipos", accion: "crear", descripcion: "Registrar nuevos equipos de medición" },
  { id_permiso: "equipos:editar", modulo: "equipos", accion: "editar", descripcion: "Modificar especificaciones de equipos" },
  { id_permiso: "equipos:eliminar", modulo: "equipos", accion: "eliminar", descripcion: "Dar de baja definitiva un equipo (restringido)" },
  
  { id_permiso: "calibracion:leer", modulo: "calibracion", accion: "leer", descripcion: "Consultar historial de calibración" },
  { id_permiso: "calibracion:crear", modulo: "calibracion", accion: "crear", descripcion: "Cargar nuevo certificado de calibración" },
  { id_permiso: "calibracion:aprobar", modulo: "calibracion", accion: "aprobar", descripcion: "Firmar digitalmente aprobación de certificado" },
  
  { id_permiso: "usuarios:leer", modulo: "usuarios", accion: "leer", descripcion: "Ver listado de personal y accesos" },
  { id_permiso: "usuarios:editar", modulo: "usuarios", accion: "editar", descripcion: "Modificar perfiles o estados de usuarios" },
  
  { id_permiso: "auditoria:leer", modulo: "auditoria", accion: "leer", descripcion: "Consultar Bitácora de Sucesos (Inalterable)" }
];

// Asignación de Permisos a Roles (Matriz RBAC)
export const ROLE_PERMISSIONS_MAP: Record<string, string[]> = {
  "DIR_OP": ["equipos:leer", "calibracion:leer", "usuarios:leer", "auditoria:leer", "calibracion:aprobar"],
  "SYS_ADMIN": ["equipos:leer", "calibracion:leer", "usuarios:leer", "usuarios:editar", "auditoria:leer"],
  "LAB_SUP": ["equipos:leer", "equipos:crear", "equipos:editar", "calibracion:leer", "calibracion:crear", "calibracion:aprobar"],
  "LAB_TECH": ["equipos:leer", "equipos:crear", "equipos:editar", "calibracion:leer", "calibracion:crear"],
  "ceo": ["equipos:leer", "calibracion:leer", "usuarios:leer", "auditoria:leer"],
  "dir_op": ["equipos:leer", "calibracion:leer", "usuarios:leer", "auditoria:leer", "calibracion:aprobar"],
  "dir_at_cl": ["equipos:leer", "usuarios:leer"],
  "ger_tec": ["equipos:leer", "equipos:crear", "equipos:editar", "calibracion:leer", "calibracion:crear", "calibracion:aprobar"],
  "ger_cal": ["equipos:leer", "calibracion:leer", "calibracion:aprobar"],
  "jefe_rep": ["equipos:leer", "calibracion:leer"],
  "jefe_alm": ["equipos:leer"],
  "coord_lab": ["equipos:leer", "equipos:crear", "equipos:editar", "calibracion:leer", "calibracion:crear", "calibracion:aprobar"],
  "jefe_op": ["equipos:leer", "calibracion:leer", "calibracion:aprobar"],
  "ing_campo": ["equipos:leer", "calibracion:leer", "calibracion:crear"],
  "sys_admin": ["equipos:leer", "calibracion:leer", "usuarios:leer", "usuarios:editar", "auditoria:leer"]
};

// Usuarios Predefinidos (Con e.firma)
export const INITIAL_USUARIOS: Usuario[] = [
  {
    id_usuario: "01000000-0000-0000-0000-000000000002",
    nombre_completo: "Lic. Carlos Ayala",
    email: "carlos.ayala@aspechs.com.mx",
    id_rol: "dir_at_cl",
    puesto: "Director de Atención a Clientes",
    firma_electronica_fingerprint: "SHA256:DAC_CA_22910B (e.firma SAT)",
    esta_activo: true,
    ultimo_acceso: "2026-07-20T12:00:00Z"
  },
  {
    id_usuario: "e88b48f9-4d6d-478a-aef4-4f40d12ea661",
    nombre_completo: "Lic. Roberto Fernández Alanís",
    email: "roberto.fernandez@aspechs.com.mx",
    id_rol: "dir_op",
    puesto: "Director de Operaciones",
    firma_electronica_fingerprint: "SHA256:f16b23...88ca4192 (e.firma SAT)",
    esta_activo: true,
    ultimo_acceso: "2026-07-14T12:05:12Z"
  },
  {
    id_usuario: "01000000-0000-0000-0000-000000000004",
    nombre_completo: "Ing. Adalberto Ledezma",
    email: "adalberto.ledezma@aspechs.com.mx",
    id_rol: "ger_tec",
    puesto: "Gerente Técnico",
    firma_electronica_fingerprint: "SHA256:GT_AL_91032C (e.firma SAT)",
    esta_activo: true,
    ultimo_acceso: "2026-07-20T12:00:00Z"
  },
  {
    id_usuario: "01000000-0000-0000-0000-000000000005",
    nombre_completo: "Bio. Isela Ramos Lozano",
    email: "isela.ramos@aspechs.com.mx",
    id_rol: "ger_cal",
    puesto: "Gerente de Calidad",
    firma_electronica_fingerprint: "SHA256:GC_IR_10293D (e.firma SAT)",
    esta_activo: true,
    ultimo_acceso: "2026-07-20T12:00:00Z"
  },
  {
    id_usuario: "01000000-0000-0000-0000-000000000006",
    nombre_completo: "Ing. Jasiel Navarro",
    email: "jasiel.navarro@aspechs.com.mx",
    id_rol: "jefe_rep",
    puesto: "Gerente de Reportes",
    firma_electronica_fingerprint: "SHA256:JR_JN_40210E (e.firma SAT)",
    esta_activo: true,
    ultimo_acceso: "2026-07-20T12:00:00Z"
  },
  {
    id_usuario: "01000000-0000-0000-0000-000000000007",
    nombre_completo: "Abraham Navarro",
    email: "abraham.navarro@aspechs.com.mx",
    id_rol: "jefe_alm",
    puesto: "Jefe de Almacén",
    firma_electronica_fingerprint: "SHA256:JA_AN_50321F (e.firma SAT)",
    esta_activo: true,
    ultimo_acceso: "2026-07-20T12:00:00Z"
  },
  {
    id_usuario: "01000000-0000-0000-0000-000000000008",
    nombre_completo: "Ing. Mauricio Iván Córdoba",
    email: "mauricio.cordoba@aspechs.com.mx",
    id_rol: "coord_lab",
    puesto: "Coordinador de Laboratorio",
    firma_electronica_fingerprint: "SHA256:CL_MC_60432A (e.firma SAT)",
    esta_activo: true,
    ultimo_acceso: "2026-07-20T12:00:00Z"
  },
  {
    id_usuario: "01000000-0000-0000-0000-000000000009",
    nombre_completo: "Ing. Juan José Gallegos",
    email: "juan.gallegos@aspechs.com.mx",
    id_rol: "jefe_op",
    puesto: "Gerente de Operaciones",
    firma_electronica_fingerprint: "SHA256:JO_JG_70543B (e.firma SAT)",
    esta_activo: true,
    ultimo_acceso: "2026-07-20T12:00:00Z"
  },
  {
    id_usuario: "01000000-0000-0000-0000-000000000010",
    nombre_completo: "Ing. Gerardo Daniel Sánchez",
    email: "gerardo.sanchez@aspechs.com.mx",
    id_rol: "ing_campo",
    puesto: "Ingeniero en Fuentes Fijas",
    firma_electronica_fingerprint: "SHA256:IC_GS_80654C (e.firma SAT)",
    esta_activo: true,
    ultimo_acceso: "2026-07-20T12:00:00Z"
  },
  {
    id_usuario: "01000000-0000-0000-0000-000000000011",
    nombre_completo: "Ing. Andrés Manuel Gómez",
    email: "andres.gomez@aspechs.com.mx",
    id_rol: "ing_campo",
    puesto: "Ingeniero en Fuentes Fijas",
    firma_electronica_fingerprint: "SHA256:IC_AG_90765D (e.firma SAT)",
    esta_activo: true,
    ultimo_acceso: "2026-07-20T12:00:00Z"
  },
  {
    id_usuario: "01000000-0000-0000-0000-000000000012",
    nombre_completo: "Ing. Carlos Sánchez Leal",
    email: "carlos.sanchez@aspechs.com.mx",
    id_rol: "ing_campo",
    puesto: "Ingeniero en Fuentes Fijas",
    firma_electronica_fingerprint: "SHA256:IC_CS_10876E (e.firma SAT)",
    esta_activo: true,
    ultimo_acceso: "2026-07-20T12:00:00Z"
  },
  {
    id_usuario: "01000000-0000-0000-0000-000000000013",
    nombre_completo: "Ing. Roberto Paulino Hdz",
    email: "roberto.paulino@aspechs.com.mx",
    id_rol: "ing_campo",
    puesto: "Ingeniero en Ambiente Laboral",
    firma_electronica_fingerprint: "SHA256:IC_RP_20987F (e.firma SAT)",
    esta_activo: true,
    ultimo_acceso: "2026-07-20T12:00:00Z"
  },
  {
    id_usuario: "01000000-0000-0000-0000-000000000014",
    nombre_completo: "Ing. Francisco Cupil",
    email: "francisco.cupil@aspechs.com.mx",
    id_rol: "ing_campo",
    puesto: "Ingeniero en Termo y OSP",
    firma_electronica_fingerprint: "SHA256:IC_FC_31098A (e.firma SAT)",
    esta_activo: true,
    ultimo_acceso: "2026-07-20T12:00:00Z"
  },
  {
    id_usuario: "01000000-0000-0000-0000-000000000015",
    nombre_completo: "Ing. Misael Baltasar",
    email: "misael.baltasar@aspechs.com.mx",
    id_rol: "ing_campo",
    puesto: "Ingeniero en Termo y OSP",
    firma_electronica_fingerprint: "SHA256:IC_MB_42109B (e.firma SAT)",
    esta_activo: true,
    ultimo_acceso: "2026-07-20T12:00:00Z"
  },
  {
    id_usuario: "01000000-0000-0000-0000-000000000016",
    nombre_completo: "Ing. Natalia Alfaro",
    email: "natalia.alfaro@aspechs.com.mx",
    id_rol: "ing_campo",
    puesto: "Ingeniero en Termo y OSP",
    firma_electronica_fingerprint: "SHA256:IC_NA_53210C (e.firma SAT)",
    esta_activo: true,
    ultimo_acceso: "2026-07-20T12:00:00Z"
  },
  {
    id_usuario: "01000000-0000-0000-0000-000000000017",
    nombre_completo: "Ing. Baltazar",
    email: "baltazar.hdz@aspechs.com.mx",
    id_rol: "ing_campo",
    puesto: "Ingeniero en Ambiente Laboral",
    firma_electronica_fingerprint: "SHA256:IC_IB_64321D (e.firma SAT)",
    esta_activo: true,
    ultimo_acceso: "2026-07-20T12:00:00Z"
  },
  {
    id_usuario: "91d1c8ea-c774-4b92-ba78-2dfa938c5f59",
    nombre_completo: "Alejandro Torres",
    email: "alejandro.torres@aspechs.com.mx",
    id_rol: "sys_admin",
    puesto: "Coordinador de Ciberseguridad y TI",
    firma_electronica_fingerprint: "SHA256:d89a12...931cb921 (e.firma SAT)",
    esta_activo: true,
    ultimo_acceso: "2026-07-14T13:10:45Z"
  },
  {
    id_usuario: "a6c8b931-e129-450a-8bf8-d30c50d4f128",
    nombre_completo: "Ing. Carlos Slim Jr.",
    email: "carlos.slim@aspechs.com.mx",
    id_rol: "ger_tec",
    puesto: "Responsable Técnico del Laboratorio",
    firma_electronica_fingerprint: "SHA256:a215fe...338eaef4 (e.firma SAT)",
    esta_activo: true,
    ultimo_acceso: "2026-07-14T11:45:00Z"
  },
  {
    id_usuario: "3cd40182-ef35-42d8-9df2-51c6b12a8844",
    nombre_completo: "Lucía Juárez",
    email: "lucia.juarez@aspechs.com.mx",
    id_rol: "ing_campo",
    puesto: "Analista Metrólogo Senior",
    firma_electronica_fingerprint: "SHA256:9cb812...0df63a29 (e.firma SAT)",
    esta_activo: true,
    ultimo_acceso: "2026-07-14T09:15:30Z"
  }
];

// Instrumentos Iniciales
export const INITIAL_INSTRUMENTOS: Instrumento[] = [
  {
    id_instrumento: "inst-001",
    codigo_interno: "EQ-TERM-102",
    nombre: "Termohigrómetro Digital",
    marca: "Fluke Calibration",
    modelo: "DewK 1620A",
    numero_serie: "FK-99281726",
    ubicacion: "Laboratorio de Pesas y Medidas - Sala A",
    intervalo_calibracion_meses: 12,
    estado_operativo: "Operativo"
  },
  {
    id_instrumento: "inst-002",
    codigo_interno: "EQ-BAL-500",
    nombre: "Balanza Analítica de Precisión",
    marca: "Mettler Toledo",
    modelo: "XPR205",
    numero_serie: "MT-88371625",
    ubicacion: "Cabina Climatizada - Microanálisis",
    intervalo_calibracion_meses: 12,
    estado_operativo: "Operativo"
  },
  {
    id_instrumento: "inst-003",
    codigo_interno: "EQ-ESPEC-088",
    nombre: "Espectrofotómetro UV-Vis",
    marca: "Thermo Scientific",
    modelo: "Evolution 220",
    numero_serie: "TS-77382910",
    ubicacion: "Laboratorio Químico de Ensayos",
    intervalo_calibracion_meses: 6,
    estado_operativo: "En Calibración"
  },
  {
    id_instrumento: "inst-004",
    codigo_interno: "EQ-PH-201",
    nombre: "Potenciómetro / pH-metro",
    marca: "Ohaus",
    modelo: "Starter 3100",
    numero_serie: "OH-66112233",
    ubicacion: "Estación de Muestreo de H&S",
    intervalo_calibracion_meses: 6,
    estado_operativo: "Fuera de Servicio"
  },
  {
    id_instrumento: "inst-005",
    codigo_interno: "EQ-SON-055",
    nombre: "Sonómetro Integrador Clase 1",
    marca: "Quest Technologies",
    modelo: "SoundPro SE",
    numero_serie: "QP-10928374",
    ubicacion: "Almacén de Equipos de Higiene",
    intervalo_calibracion_meses: 12,
    estado_operativo: "Operativo"
  },
  {
    id_instrumento: "inst-006",
    codigo_interno: "EQ-SON-091",
    nombre: "Sonómetro Integrador Clase 2",
    marca: "Larson Davis",
    modelo: "LxT LXT1",
    numero_serie: "LD-55291",
    ubicacion: "Módulo de Seguridad Industrial",
    intervalo_calibracion_meses: 12,
    estado_operativo: "Operativo"
  }
];

// Certificados Iniciales
export const INITIAL_CERTIFICADOS: CertificadoCalibracion[] = [
  {
    id_certificado: "cert-001",
    id_instrumento: "inst-001",
    numero_certificado: "EMA-FLUKE-2025-4491",
    laboratorio_emisor: "Metrología Acreditada S.A. de C.V. (Acreditación EMA M-98)",
    fecha_calibracion: "2025-08-15",
    fecha_vencimiento: "2026-08-15", // Vence pronto! (julio 2026)
    url_documento: "https://certificados.aspechs.com/EMA-FLUKE-2025-4491.pdf",
    archivo_hash_sha256: "3f786850e387550fdab836ed7e6dc881de23001b3296acb03c834a3179df1433",
    estado_aprobacion: "Aprobado",
    aprobado_por: "a6c8b931-e129-450a-8bf8-d30c50d4f128", // Carlos Slim Jr.
    fecha_aprobacion: "2025-08-17T10:00:00Z",
    justificacion_aprobacion: "Cumple con las desviaciones estándar admisibles y calibración trazable a patrón primario de CNM.",
    sello_digital_nom151: "NOM151:CONSTANCIA-2025-08-17-PSC-0921"
  },
  {
    id_certificado: "cert-002",
    id_instrumento: "inst-002",
    numero_certificado: "EMA-METTLER-2025-1029",
    laboratorio_emisor: "Patrones Nacionales de México S.A. (Acreditación EMA M-12)",
    fecha_calibracion: "2026-02-10",
    fecha_vencimiento: "2027-02-10", // Vigente y lejano
    url_documento: "https://certificados.aspechs.com/EMA-METTLER-2025-1029.pdf",
    archivo_hash_sha256: "8e21a20bf102f4ccdd92ea689ff891df92e23a4b0870f7a93412be1d9bf1ef87",
    estado_aprobacion: "Aprobado",
    aprobado_por: "e88b48f9-4d6d-478a-aef4-4f40d12ea661", // Roberto Fernández
    fecha_aprobacion: "2026-02-12T14:30:00Z",
    justificacion_aprobacion: "Aprobación ejecutiva para inicio de operaciones en línea de fármacos. Se validó trazabilidad de pesas patrón.",
    sello_digital_nom151: "NOM151:CONSTANCIA-2026-02-12-PSC-3312"
  },
  {
    id_certificado: "cert-003",
    id_instrumento: "inst-003",
    numero_certificado: "EMA-THERMO-2024-8112",
    laboratorio_emisor: "Calibraciones del Norte S.A. de C.V. (Acreditación EMA M-45)",
    fecha_calibracion: "2024-05-10",
    fecha_vencimiento: "2024-11-10", // Vencido hace mucho
    url_documento: "https://certificados.aspechs.com/EMA-THERMO-2024-8112.pdf",
    archivo_hash_sha256: "ef931cb921938ac5f59c8b931e129450ad89a12a215fe338eaef47c8b931e129",
    estado_aprobacion: "Aprobado",
    aprobado_por: "a6c8b931-e129-450a-8bf8-d30c50d4f128",
    fecha_aprobacion: "2024-05-12T11:00:00Z",
    justificacion_aprobacion: "Historial de deriva térmica correcto. Certificado anterior aprobado.",
    sello_digital_nom151: "NOM151:CONSTANCIA-2024-05-12-PSC-8112"
  },
  {
    id_certificado: "cert-004",
    id_instrumento: "inst-004",
    numero_certificado: "EMA-OHAUS-2024-0012",
    laboratorio_emisor: "Patrones Nacionales de México S.A. (Acreditación EMA M-12)",
    fecha_calibracion: "2024-01-05",
    fecha_vencimiento: "2024-07-05", // Vencido
    url_documento: "https://certificados.aspechs.com/EMA-OHAUS-2024-0012.pdf",
    archivo_hash_sha256: "df938c5f59e88b48f94d6d478aaef44f40d12ea66191d1c8eac7744b92ba782d",
    estado_aprobacion: "Aprobado",
    aprobado_por: "a6c8b931-e129-450a-8bf8-d30c50d4f128",
    fecha_aprobacion: "2024-01-08T09:20:00Z",
    justificacion_aprobacion: "Liberado para mediciones de pH en efluentes industriales. Se requiere recertificación.",
    sello_digital_nom151: "NOM151:CONSTANCIA-2024-01-08-PSC-0012"
  },
  {
    id_certificado: "cert-005",
    id_instrumento: "inst-005",
    numero_certificado: "EMA-QUEST-2026-0922",
    laboratorio_emisor: "Acústica y Vibraciones de México (Acreditación EMA M-77)",
    fecha_calibracion: "2026-01-15",
    fecha_vencimiento: "2027-01-15", // Vigente!
    url_documento: "https://certificados.aspechs.com/EMA-QUEST-2026-0922.pdf",
    archivo_hash_sha256: "fa4b6850e387550fdab836ed7e6dc881de23001b3296acb03c834a3179dfa999",
    estado_aprobacion: "Aprobado",
    aprobado_por: "a6c8b931-e129-450a-8bf8-d30c50d4f128",
    fecha_aprobacion: "2026-01-17T11:00:00Z",
    justificacion_aprobacion: "Calibración aprobada para sonómetro de levantamiento en sitio (NOM-011-STPS). Desviación menor a 0.2 dB.",
    sello_digital_nom151: "NOM151:CONSTANCIA-2026-01-17-PSC-0922"
  },
  {
    id_certificado: "cert-006",
    id_instrumento: "inst-006",
    numero_certificado: "EMA-LARSON-2024-4421",
    laboratorio_emisor: "Acústica y Vibraciones de México (Acreditación EMA M-77)",
    fecha_calibracion: "2024-03-01",
    fecha_vencimiento: "2025-03-01", // Vencido!
    url_documento: "https://certificados.aspechs.com/EMA-LARSON-2024-4421.pdf",
    archivo_hash_sha256: "bc991cb921938ac5f59c8b931e129450ad89a12a215fe338eaef47c8b931e211",
    estado_aprobacion: "Aprobado",
    aprobado_por: "a6c8b931-e129-450a-8bf8-d30c50d4f128",
    fecha_aprobacion: "2024-03-04T12:00:00Z",
    justificacion_aprobacion: "Certificación anterior del sonómetro secundario. Requiere calibración urgente para uso en campo.",
    sello_digital_nom151: "NOM151:CONSTANCIA-2024-03-04-PSC-4421"
  }
];

// Logs Iniciales de la Bitácora
export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id_log: 1,
    id_usuario: "91d1c8ea-c774-4b92-ba78-2dfa938c5f59", // Sofía Méndez
    usuario_nombre: "Sofía Méndez",
    usuario_rol: "SYS_ADMIN",
    tabla_afectada: "roles_permisos",
    registro_id: "DIR_OP",
    accion: "INSERT",
    valor_anterior: null,
    valor_nuevo: '{"id_rol": "DIR_OP", "id_permiso": "auditoria:leer"}',
    justificacion_tecnica: "Inicialización del esquema de seguridad y asignación de privilegios de lectura de bitácora inalterable al Director de Operaciones.",
    hash_integridad: "6a9f116dc82a6cdbe81e053a47b19a12e848cb6c04fcf1f5b02324ca9df273a5",
    ip_origen: "192.168.10.45",
    timestamp: "2026-07-13T09:00:00Z"
  },
  {
    id_log: 2,
    id_usuario: "a6c8b931-e129-450a-8bf8-d30c50d4f128", // Carlos Slim Jr.
    usuario_nombre: "Ing. Carlos Slim Jr.",
    usuario_rol: "LAB_SUP",
    tabla_afectada: "instrumentos",
    registro_id: "inst-001",
    accion: "UPDATE",
    valor_anterior: '{"id_instrumento": "inst-001", "estado_operativo": "En Calibración"}',
    valor_nuevo: '{"id_instrumento": "inst-001", "estado_operativo": "Operativo"}',
    justificacion_tecnica: "Retorno del termohigrómetro a servicio operativo tras recibir y validar el certificado de calibración EMA-FLUKE-2025-4491 con derivas admisibles.",
    hash_integridad: "fb92043caee42e58a9cc2a3179df1433f16b23087a3296acb03c834a3179df14",
    ip_origen: "192.168.20.101",
    timestamp: "2026-07-13T10:15:22Z"
  },
  {
    id_log: 3,
    id_usuario: "e88b48f9-4d6d-478a-aef4-4f40d12ea661", // Roberto Fernández
    usuario_nombre: "Roberto Fernández",
    usuario_rol: "DIR_OP",
    tabla_afectada: "certificados_calibracion",
    registro_id: "cert-002",
    accion: "SIGN",
    valor_anterior: '{"id_certificado": "cert-002", "estado_aprobacion": "Pendiente"}',
    valor_nuevo: '{"id_certificado": "cert-002", "estado_aprobacion": "Aprobado", "aprobado_por": "Roberto Fernández"}',
    justificacion_tecnica: "Aprobación y firma digital del certificado de la balanza analítica para dar inicio a la auditoría de calidad NMX-17025 de fin de mes.",
    hash_integridad: "a215fe338eaef47c8b931e129450ad89a12a215fe338eaef4d89a12a215fe338",
    ip_origen: "200.74.99.182",
    timestamp: "2026-07-14T12:10:00Z"
  }
];

// Helper para simular generación de hash SHA-256 para integridad de la bitácora (representando NOM-151)
export function generarHashIntegridad(
  id_usuario: string,
  tabla: string,
  registro_id: string,
  accion: string,
  anterior: string | null,
  nuevo: string | null,
  justificacion: string
): string {
  const data = `${id_usuario}|${tabla}|${registro_id}|${accion}|${anterior || ""}|${nuevo || ""}|${justificacion}|${Date.now()}`;
  // Algoritmo de hash simple determinista (representativo de SHA-256)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0') + 
                Math.abs(hash * 31).toString(16).padStart(8, '0') +
                Math.abs(hash * 17).toString(16).padStart(8, '0') +
                "8e21a20bf1a3";
  return `SHA256:${hex.substring(0, 64)}`;
}
