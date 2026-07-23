export const DB_SCHEMA_SQL = `-- =====================================================================
-- SISTEMA INTEGRAL "ASP/EcH&S" - SCRIPT DE BASE DE DATOS POSTGRESQL (SUPABASE/POSTGRES)
-- CONFORMIDAD CON: NMX-EC-17025, NOM-151, LEY DE FIRMA ELECTRÓNICA Y LFPDPPP
-- DICTADO PARA: ROBERTO FERNÁNDEZ, DIRECTOR DE OPERACIONES / ING. HAROLD ANGUIANO
-- =====================================================================

-- Habilitar extensión para generación de UUID v4 si es requerido
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. CONTROL DE ACCESOS (RBAC)
-- ==========================================

-- Tabla de Roles
CREATE TABLE IF NOT EXISTS roles (
    id_rol VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Permisos
CREATE TABLE IF NOT EXISTS permisos (
    id_permiso VARCHAR(100) PRIMARY KEY,
    modulo VARCHAR(50) NOT NULL, -- e.g., 'equipos', 'calibracion', 'auditoria', 'usuarios'
    accion VARCHAR(50) NOT NULL, -- e.g., 'leer', 'crear', 'editar', 'eliminar', 'aprobar'
    descripcion TEXT NOT NULL
);

-- Tabla Relacional de Roles y Permisos (Muchos a Muchos)
CREATE TABLE IF NOT EXISTS roles_permisos (
    id_rol VARCHAR(50) REFERENCES roles(id_rol) ON DELETE CASCADE,
    id_permiso VARCHAR(100) REFERENCES permisos(id_permiso) ON DELETE CASCADE,
    PRIMARY KEY (id_rol, id_permiso)
);

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Almacenado bajo estrictas medidas de seguridad (LFPDPPP)
    id_rol VARCHAR(50) NOT NULL REFERENCES roles(id_rol),
    puesto VARCHAR(100),
    firma_electronica_fingerprint VARCHAR(128), -- Huella digital de la e.firma (Ley de Firma Electrónica)
    esta_activo BOOLEAN DEFAULT TRUE NOT NULL,
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. TRAZABILIDAD (AUDIT TRAIL - NMX-17025)
-- ==========================================

-- Tabla de Sucesos de Auditoría (Bitácora de Sucesos)
CREATE TABLE IF NOT EXISTS bitacora_auditoria (
    id_log BIGSERIAL PRIMARY KEY,
    id_usuario UUID NOT NULL REFERENCES usuarios(id_usuario),
    tabla_afectada VARCHAR(100) NOT NULL,
    registro_id VARCHAR(100) NOT NULL,
    accion VARCHAR(20) NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'SIGN')),
    valor_anterior JSONB,
    valor_nuevo JSONB,
    justificacion_tecnica TEXT NOT NULL,
    hash_integridad VARCHAR(64) NOT NULL,
    ip_origen VARCHAR(45) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices de auditoría si no existen
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla_registro ON bitacora_auditoria(tabla_afectada, registro_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON bitacora_auditoria(id_usuario);
CREATE INDEX IF NOT EXISTS idx_auditoria_timestamp ON bitacora_auditoria(timestamp);

-- Bloqueo de Modificaciones a la Bitácora de Auditoría
CREATE OR REPLACE FUNCTION proteger_bitacora_auditoria()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'La bitácora de auditoría es inalterable. No se permiten actualizaciones ni eliminaciones bajo la norma NMX-EC-17025 y NOM-151.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tg_proteger_bitacora ON bitacora_auditoria;
CREATE TRIGGER tg_proteger_bitacora
BEFORE UPDATE OR DELETE ON bitacora_auditoria
FOR EACH ROW
EXECUTE FUNCTION proteger_bitacora_auditoria();


-- ==========================================
-- 3. GESTIÓN DE EQUIPOS Y CALIBRACIÓN
-- ==========================================

-- Tabla de Instrumentos de Medición
CREATE TABLE IF NOT EXISTS instrumentos (
    id_instrumento UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_interno VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    numero_serie VARCHAR(100) UNIQUE NOT NULL,
    ubicacion VARCHAR(150) NOT NULL,
    intervalo_calibracion_meses INT NOT NULL DEFAULT 12 CHECK (intervalo_calibracion_meses > 0),
    estado_operativo VARCHAR(50) NOT NULL DEFAULT 'Operativo' CHECK (estado_operativo IN ('Operativo', 'Fuera de Servicio', 'En Calibración', 'Baja')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Certificados de Calibración
CREATE TABLE IF NOT EXISTS certificados_calibracion (
    id_certificado UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_instrumento UUID NOT NULL REFERENCES instrumentos(id_instrumento) ON DELETE RESTRICT,
    numero_certificado VARCHAR(100) UNIQUE NOT NULL,
    laboratorio_emisor VARCHAR(255) NOT NULL,
    fecha_calibracion DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    url_documento VARCHAR(512),
    archivo_hash_sha256 VARCHAR(64) NOT NULL,
    estado_aprobacion VARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (estado_aprobacion IN ('Pendiente', 'Aprobado', 'Rechazado')),
    aprobado_por UUID REFERENCES usuarios(id_usuario),
    fecha_aprobacion TIMESTAMP WITH TIME ZONE,
    justificacion_aprobacion TEXT,
    sello_digital_nom151 VARCHAR(512),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_fechas_calibracion CHECK (fecha_vencimiento > fecha_calibracion)
);

-- Tabla de Reportes y Hojas de Campo
CREATE TABLE IF NOT EXISTS reportes_campo (
    id_reporte UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folio_odt VARCHAR(100) NOT NULL,
    cliente_nombre VARCHAR(255) NOT NULL,
    tecnico_id UUID REFERENCES usuarios(id_usuario),
    tipo_norma VARCHAR(100) NOT NULL,
    puntos_medicion INT NOT NULL DEFAULT 1,
    datos_medicion JSONB,
    estado VARCHAR(30) NOT NULL DEFAULT 'Borrador' CHECK (estado IN ('Borrador', 'Enviado', 'Aprobado', 'Rechazado')),
    hash_nom151 VARCHAR(64),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar la búsqueda de certificados y alertas
CREATE INDEX IF NOT EXISTS idx_certificados_instrumento ON certificados_calibracion(id_instrumento);
CREATE INDEX IF NOT EXISTS idx_certificados_vencimiento ON certificados_calibracion(fecha_vencimiento);

-- Vista de Alertas de Calibración
CREATE OR REPLACE VIEW vista_alertas_calibracion AS
SELECT 
    i.id_instrumento,
    i.codigo_interno,
    i.nombre AS instrumento_nombre,
    i.marca,
    i.modelo,
    i.estado_operativo,
    c.id_certificado,
    c.numero_certificado,
    c.laboratorio_emisor,
    c.fecha_calibracion,
    c.fecha_vencimiento,
    (c.fecha_vencimiento - CURRENT_DATE) AS dias_para_vencer,
    CASE 
        WHEN i.estado_operativo = 'Fuera de Servicio' THEN 'Fuera de Servicio'
        WHEN c.id_certificado IS NULL THEN 'Sin Calibración'
        WHEN CURRENT_DATE > c.fecha_vencimiento THEN 'Vencido'
        WHEN (c.fecha_vencimiento - CURRENT_DATE) <= 30 THEN 'Vence Pronto (Menos de 30 días)'
        ELSE 'Vigente'
    END AS semaforo_estado
FROM instrumentos i
LEFT JOIN LATERAL (
    SELECT * 
    FROM certificados_calibracion 
    WHERE id_instrumento = i.id_instrumento AND estado_aprobacion = 'Aprobado'
    ORDER BY fecha_vencimiento DESC 
    LIMIT 1
) c ON TRUE;

-- ==========================================
-- 4. INSERT DE ROLES Y USUARIOS INICIALES (IDEMPOTENTES)
-- ==========================================

INSERT INTO roles (id_rol, nombre, descripcion) VALUES
('ceo', 'CEO / Alta Dirección', 'Director General. Consulta estratégica de indicadores clave de rendimiento, firma legal de contratos de calibración.'),
('dir_op', 'Director de Operaciones', 'Supervisión global de cumplimiento, aprobación de calibraciones y visualización del Audit Trail.'),
('dir_at_cl', 'Director de Atención a Clientes', 'Gestión comercial de cotizaciones, seguimiento a clientes oficiales.'),
('ger_tec', 'Gerente Técnico / Responsable Técnico', 'Aprobación técnica de calibraciones, auditorías de calibración de equipos.'),
('ger_cal', 'Gerente de Calidad', 'Supervisión de cumplimiento de normativas de acreditación y certificación (ISO/IEC 17025).'),
('jefe_rep', 'Gerente de Reportes', 'Emisión y revisión de informes técnicos finales.'),
('jefe_alm', 'Jefe de Almacén', 'Control logístico de entrega y recepción de instrumentos y materiales.'),
('coord_lab', 'Coordinador de Laboratorio', 'Programación de servicios, calibraciones internas, validación de bitácoras de laboratorio.'),
('jefe_op', 'Gerente de Operaciones', 'Monitoreo de avances en ODT, asignación de ingenieros a servicios.'),
('ing_campo', 'Ingeniero de Campo', 'Levantamiento físico de mediciones, captura de hojas de campo y calibraciones in situ.'),
('sys_admin', 'Administrador de Sistemas', 'Gestión de usuarios, asignación estricta de roles, auditoría de seguridad informática.')
ON CONFLICT (id_rol) DO UPDATE SET nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion;

INSERT INTO usuarios (id_usuario, nombre_completo, email, password_hash, id_rol, puesto, firma_electronica_fingerprint, esta_activo) VALUES
('01000000-0000-0000-0000-000000000001', 'Ing. Daniel Treviño Reyes', 'daniel.trevino@aspechs.com.mx', 'DanielT2026!', 'ceo', 'CEO', 'SHA256:CEO_DT_88129A (e.firma SAT)', true),
('01000000-0000-0000-0000-000000000002', 'Lic. Carlos Ayala', 'carlos.ayala@aspechs.com.mx', 'CarlosA2026!', 'dir_at_cl', 'Director de Atención a Clientes', 'SHA256:DAC_CA_22910B (e.firma SAT)', true),
('e88b48f9-4d6d-478a-aef4-4f40d12ea661', 'Lic. Roberto Fernández Alanís', 'roberto.fernandez@aspechs.com.mx', 'RobertoF2026!', 'dir_op', 'Director de Operaciones', 'SHA256:f16b23087a3296acb03c834a3179df1432f59c8b931e129450ad89a12a', true),
('01000000-0000-0000-0000-000000000004', 'Ing. Adalberto Ledezma', 'adalberto.ledezma@aspechs.com.mx', 'AdalbertoL2026!', 'ger_tec', 'Gerente Técnico', 'SHA256:GT_AL_91032C (e.firma SAT)', true),
('01000000-0000-0000-0000-000000000005', 'Bio. Isela Ramos Lozano', 'isela.ramos@aspechs.com.mx', 'IselaR2026!', 'ger_cal', 'Gerente de Calidad', 'SHA256:GC_IR_10293D (e.firma SAT)', true),
('01000000-0000-0000-0000-000000000006', 'Ing. Jasiel Navarro', 'jasiel.navarro@aspechs.com.mx', 'JasielN2026!', 'jefe_rep', 'Gerente de Reportes', 'SHA256:JR_JN_40210E (e.firma SAT)', true),
('01000000-0000-0000-0000-000000000007', 'Abraham Navarro', 'abraham.navarro@aspechs.com.mx', 'AbrahamN2026!', 'jefe_alm', 'Jefe de Almacén', 'SHA256:JA_AN_50321F (e.firma SAT)', true),
('01000000-0000-0000-0000-000000000008', 'Ing. Mauricio Iván Córdoba', 'mauricio.cordoba@aspechs.com.mx', 'MauricioC2026!', 'coord_lab', 'Coordinador de Laboratorio', 'SHA256:CL_MC_60432A (e.firma SAT)', true),
('01000000-0000-0000-0000-000000000009', 'Ing. Juan José Gallegos', 'juan.gallegos@aspechs.com.mx', 'JuanG2026!', 'jefe_op', 'Gerente de Operaciones', 'SHA256:JO_JG_70543B (e.firma SAT)', true),
('01000000-0000-0000-0000-000000000010', 'Ing. Gerardo Daniel Sánchez', 'gerardo.sanchez@aspechs.com.mx', 'GerardoS2026!', 'ing_campo', 'Ingeniero en Fuentes Fijas', 'SHA256:IC_GS_80654C (e.firma SAT)', true),
('01000000-0000-0000-0000-000000000011', 'Ing. Andrés Manuel Gómez', 'andres.gomez@aspechs.com.mx', 'AndresG2026!', 'ing_campo', 'Ingeniero en Fuentes Fijas', 'SHA256:IC_AG_90765D (e.firma SAT)', true),
('01000000-0000-0000-0000-000000000012', 'Ing. Carlos Sánchez Leal', 'carlos.sanchez@aspechs.com.mx', 'CarlosS2026!', 'ing_campo', 'Ingeniero en Fuentes Fijas', 'SHA256:IC_CS_10876E (e.firma SAT)', true),
('01000000-0000-0000-0000-000000000013', 'Ing. Roberto Paulino Hdz', 'roberto.paulino@aspechs.com.mx', 'RobertoP2026!', 'ing_campo', 'Ingeniero en Ambiente Laboral', 'SHA256:IC_RP_20987F (e.firma SAT)', true),
('01000000-0000-0000-0000-000000000014', 'Ing. Francisco Cupil', 'francisco.cupil@aspechs.com.mx', 'FranciscoC2026!', 'ing_campo', 'Ingeniero en Termo y OSP', 'SHA256:IC_FC_31098A (e.firma SAT)', true),
('01000000-0000-0000-0000-000000000015', 'Ing. Misael Baltasar', 'misael.baltasar@aspechs.com.mx', 'MisaelB2026!', 'ing_campo', 'Ingeniero en Termo y OSP', 'SHA256:IC_MB_42109B (e.firma SAT)', true),
('01000000-0000-0000-0000-000000000016', 'Ing. Natalia Alfaro', 'natalia.alfaro@aspechs.com.mx', 'NataliaA2026!', 'ing_campo', 'Ingeniero en Termo y OSP', 'SHA256:IC_NA_53210C (e.firma SAT)', true),
('01000000-0000-0000-0000-000000000017', 'Ing. Baltazar', 'baltazar.hdz@aspechs.com.mx', 'BaltazarH2026!', 'ing_campo', 'Ingeniero en Ambiente Laboral', 'SHA256:IC_IB_64321D (e.firma SAT)', true),
('91d1c8ea-c774-4b92-ba78-2dfa938c5f59', 'Alejandro Torres', 'alejandro.torres@aspechs.com.mx', 'ASPPass2026!', 'sys_admin', 'Coordinador de Ciberseguridad y TI', 'SHA256:d89a12a3296acb03c834a3179df1432f59c8b931e129450ad89a12a215fe', true),
('77000000-0000-0000-0000-000000000099', 'Ing. Harold Anguiano', 'harold.anguiano@aspechs.com.mx', 'Chevropar#1970', 'sys_admin', 'Administrador del Sistema (sys_admin)', 'SHA256:HA_99810A_ADMIN (e.firma SAT)', true)
ON CONFLICT (email) DO UPDATE SET 
  id_usuario = EXCLUDED.id_usuario,
  nombre_completo = EXCLUDED.nombre_completo,
  password_hash = EXCLUDED.password_hash,
  id_rol = EXCLUDED.id_rol,
  puesto = EXCLUDED.puesto,
  firma_electronica_fingerprint = EXCLUDED.firma_electronica_fingerprint,
  esta_activo = EXCLUDED.esta_activo;
`;

export const EXPLICACION_NORMATIVA = [
  {
    norma: "NMX-EC-17025-IMNC-2018 (Requisitos Generales para la Competencia de Laboratorios)",
    puntos: [
      {
        titulo: "Trazabilidad Metrológica e Inalterabilidad",
        detalle: "Se establece la tabla 'bitacora_auditoria' con restricciones rígidas. El trigger 'tg_proteger_bitacora' impide cualquier UPDATE o DELETE sobre los registros de auditoría, garantizando que el historial de calibración y uso del equipo sea 100% inalterable y auditable frente a una evaluación externa."
      },
      {
        titulo: "Justificación Técnica Obligatoria",
        detalle: "Se exige el campo 'justificacion_tecnica' (NOT NULL) en cada registro de la bitacora de auditoría. Cualquier cambio en calibración, estado de instrumento o parámetros debe registrar el sustento científico o el motivo de la intervención, impidiendo 'silenciar' fallos o desajustes de medición."
      },
      {
        titulo: "Vigencia y Alertas Preventivas",
        detalle: "La vista 'vista_alertas_calibracion' calcula en tiempo real los días restantes de vigencia de los certificados ('dias_para_vencer'). El sistema clasifica el estado en semáforos (Vigente, Vence Pronto, Vencido, Fuera de Servicio) para asegurar que ningún equipo descalibrado sea utilizado en mediciones críticas."
      }
    ]
  },
  {
    norma: "NOM-151-SCFI-2016 (Requisitos sobre Conservación de Mensajes de Datos y Digitalización de Documentos)",
    puntos: [
      {
        titulo: "Integridad del Mensaje de Datos (Hash SHA-256)",
        detalle: "La tabla 'bitacora_auditoria' incluye el campo 'hash_integridad'. Cada registro contiene una huella SHA-256 calculada a partir de los datos concatenados del evento actual y el hash del registro anterior, creando un encadenamiento criptográfico local que demuestra que ningún registro ha sido insertado a posteriori o manipulado en crudo en la base de datos."
      },
      {
        titulo: "Conservación de Certificados Digitalizados",
        detalle: "La tabla 'certificados_calibracion' almacena 'archivo_hash_sha256' de los PDFs originales, protegiendo contra sustituciones de archivos, y el campo 'sello_digital_nom151', reservado para almacenar la constancia de conservación emitida por un Proveedor de Servicios de Certificación (PSC) autorizado en México."
      }
    ]
  },
  {
    norma: "Ley de Firma Electrónica Avanzada (LFEA)",
    puntos: [
      {
        titulo: "Vinculación de Usuarios y No Repudio",
        detalle: "La tabla 'usuarios' cuenta con el campo 'firma_electronica_fingerprint'. Cuando un supervisor aprueba una calibración o un analista registra una medición, el sistema puede vincular el certificado del usuario, permitiendo el no repudio de las firmas electrónicas sobre los documentos de calidad del laboratorio."
      }
    ]
  },
  {
    norma: "LFPDPPP (Protección de Datos Personales en Posesión de Particulares)",
    puntos: [
      {
        titulo: "Medidas de Seguridad Técnicas y Derechos ARCO",
        detalle: "Se implementa un RBAC (Control de Accesos Basado en Roles) estricto con las tablas 'roles', 'permisos' y 'roles_permisos' para asegurar el principio de minimización de datos. El analista no tiene acceso a configuraciones de seguridad, los emails y contraseñas van hasheados bajo algoritmos seguros (como bcrypt/Argon2) y la trazabilidad de accesos cumple con las políticas de auditoría de seguridad exigidas por el INAI."
      }
    ]
  }
];
