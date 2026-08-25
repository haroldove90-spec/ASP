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
const ALL_PERMS = [
  "equipos:leer", "equipos:crear", "equipos:editar", "equipos:eliminar",
  "calibracion:leer", "calibracion:crear", "calibracion:editar", "calibracion:eliminar", "calibracion:aprobar",
  "usuarios:leer", "usuarios:editar", "auditoria:leer"
];

export const ROLE_PERMISSIONS_MAP: Record<string, string[]> = {
  "DIR_OP": ALL_PERMS,
  "SYS_ADMIN": ALL_PERMS,
  "LAB_SUP": ALL_PERMS,
  "LAB_TECH": ALL_PERMS,
  "ceo": ALL_PERMS,
  "dir_op": ALL_PERMS,
  "dir_at_cl": ALL_PERMS,
  "ger_tec": ALL_PERMS,
  "ger_cal": ALL_PERMS,
  "ger_lab": ALL_PERMS,
  "jefe_rep": ALL_PERMS,
  "jefe_alm": ALL_PERMS,
  "coord_lab": ALL_PERMS,
  "jefe_op": ALL_PERMS,
  "ing_campo": ALL_PERMS,
  "sys_admin": ALL_PERMS
};

// Usuarios Predefinidos (Con e.firma)
export const INITIAL_USUARIOS: Usuario[] = [
  {
    id_usuario: "01000000-0000-0000-0000-000000000001",
    nombre_completo: "Harold Anguiano Morales",
    email: "haroldo90@aspechs.com.mx",
    id_rol: "ceo",
    puesto: "CEO",
    firma_electronica_fingerprint: "SHA256:CEO_HA_99810A (e.firma SAT)",
    esta_activo: true,
    ultimo_acceso: "2026-08-25T12:00:00Z"
  },
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
    firma_electronica_fingerprint: "SHA256:f16b23087a3296acb03c834a3179df1432f59c8b931e129450ad89a12a",
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
    firma_electronica_fingerprint: "SHA256:d89a12a3296acb03c834a3179df1432f59c8b931e129450ad89a12a215fe",
    esta_activo: true,
    ultimo_acceso: "2026-07-14T13:10:45Z"
  },
  {
    id_usuario: "01000000-0000-0000-0000-000000000099",
    nombre_completo: "Ing. Daniel Treviño Reyes",
    email: "daniel.trevino@aspechs.com.mx",
    id_rol: "ceo",
    puesto: "Dirección General",
    firma_electronica_fingerprint: "SHA256:CEO_DT_88129A (e.firma SAT)",
    esta_activo: true,
    ultimo_acceso: "2026-07-20T12:00:00Z"
  }
];

// Instrumentos Iniciales (Limpio para nuevos registros)
export const INITIAL_INSTRUMENTOS: Instrumento[] = [];

// Certificados Iniciales (Limpio para nuevos registros)
export const INITIAL_CERTIFICADOS: CertificadoCalibracion[] = [];

// Logs Iniciales de la Bitácora (Limpio)
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

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
