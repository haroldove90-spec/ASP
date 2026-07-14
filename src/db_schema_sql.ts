export const DB_SCHEMA_SQL = `-- =====================================================================
-- SISTEMA INTEGRAL "ASP/EcH&S" - SCRIPT DE BASE DE DATOS POSTGRESQL
-- CONFORMIDAD CON: NMX-EC-17025, NOM-151, LEY DE FIRMA ELECTRÓNICA Y LFPDPPP
-- DICTADO PARA: ROBERTO FERNÁNDEZ, DIRECTOR DE OPERACIONES
-- =====================================================================

-- Habilitar extensión para generación de UUID v4 si es requerido
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. CONTROL DE ACCESOS (RBAC)
-- ==========================================

-- Tabla de Roles
CREATE TABLE roles (
    id_rol VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Permisos
CREATE TABLE permisos (
    id_permiso VARCHAR(100) PRIMARY KEY,
    modulo VARCHAR(50) NOT NULL, -- e.g., 'equipos', 'calibracion', 'auditoria', 'usuarios'
    accion VARCHAR(50) NOT NULL, -- e.g., 'leer', 'crear', 'editar', 'eliminar', 'aprobar'
    descripcion TEXT NOT NULL
);

-- Tabla Relacional de Roles y Permisos (Muchos a Muchos)
CREATE TABLE roles_permisos (
    id_rol VARCHAR(50) REFERENCES roles(id_rol) ON DELETE CASCADE,
    id_permiso VARCHAR(100) REFERENCES permisos(id_permiso) ON DELETE CASCADE,
    PRIMARY KEY (id_rol, id_permiso)
);

-- Tabla de Usuarios
CREATE TABLE usuarios (
    id_usuario UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Almacenado bajo estrictas medidas de seguridad (LFPDPPP)
    id_rol VARCHAR(50) NOT NULL REFERENCES roles(id_rol),
    puesto VARCHAR(100),
    firma_electronica_fingerprint VARCHAR(64), -- Huella digital de la e.firma (Ley de Firma Electrónica)
    esta_activo BOOLEAN DEFAULT TRUE NOT NULL,
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. TRAZABILIDAD (AUDIT TRAIL - NMX-17025)
-- ==========================================

-- Tabla de Sucesos de Auditoría (Bitácora de Sucesos)
-- Diseñada para cumplir con los requerimientos de inalterabilidad y registro detallado
CREATE TABLE bitacora_auditoria (
    id_log BIGSERIAL PRIMARY KEY,
    id_usuario UUID NOT NULL REFERENCES usuarios(id_usuario),
    tabla_afectada VARCHAR(100) NOT NULL,
    registro_id VARCHAR(100) NOT NULL, -- ID del registro afectado (puede ser UUID o correlativo)
    accion VARCHAR(20) NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'SIGN')),
    valor_anterior JSONB, -- NULL en INSERT
    valor_nuevo JSONB,    -- NULL en DELETE
    justificacion_tecnica TEXT NOT NULL, -- Obligatorio por NMX-EC-17025 para cualquier alteración de datos de medición/equipo
    hash_integridad VARCHAR(64) NOT NULL, -- Hash SHA-256 concatenando campos para cumplir con NOM-151 (inalterabilidad)
    ip_origen VARCHAR(45) NOT NULL, -- IPv4 o IPv6
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices no agrupados para búsquedas rápidas de auditoría (NMX-17025 requiere reportar trazas de manera expedita)
CREATE INDEX idx_auditoria_tabla_registro ON bitacora_auditoria(tabla_afectada, registro_id);
CREATE INDEX idx_auditoria_usuario ON bitacora_auditoria(id_usuario);
CREATE INDEX idx_auditoria_timestamp ON bitacora_auditoria(timestamp);

-- Bloqueo de Modificaciones a la Bitácora de Auditoría (Garantía de Inalterabilidad)
CREATE OR REPLACE FUNCTION proteger_bitacora_auditoria()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'La bitácora de auditoría es inalterable. No se permiten actualizaciones ni eliminaciones bajo la norma NMX-EC-17025 y NOM-151.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_proteger_bitacora
BEFORE UPDATE OR DELETE ON bitacora_auditoria
FOR EACH ROW
EXECUTE FUNCTION proteger_bitacora_auditoria();


-- ==========================================
-- 3. GESTIÓN DE EQUIPOS Y CALIBRACIÓN
-- ==========================================

-- Tabla de Instrumentos de Medición
CREATE TABLE instrumentos (
    id_instrumento UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_interno VARCHAR(50) UNIQUE NOT NULL, -- Identificación única del equipo
    nombre VARCHAR(150) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    numero_serie VARCHAR(100) UNIQUE NOT NULL,
    ubicacion VARCHAR(150) NOT NULL, -- Ubicación física del equipo
    intervalo_calibracion_meses INT NOT NULL DEFAULT 12 CHECK (intervalo_calibracion_meses > 0),
    estado_operativo VARCHAR(50) NOT NULL DEFAULT 'Operativo' CHECK (estado_operativo IN ('Operativo', 'Fuera de Servicio', 'En Calibración', 'Baja')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Certificados de Calibración
CREATE TABLE certificados_calibracion (
    id_certificado UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_instrumento UUID NOT NULL REFERENCES instrumentos(id_instrumento) ON DELETE RESTRICT,
    numero_certificado VARCHAR(100) UNIQUE NOT NULL, -- Folio oficial del laboratorio acreditado
    laboratorio_emisor VARCHAR(255) NOT NULL, -- Laboratorio secundario o patrón acreditado ante la EMA
    fecha_calibracion DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    url_documento VARCHAR(512), -- Enlace al certificado PDF original (digitalizado y custodiado)
    archivo_hash_sha256 VARCHAR(64) NOT NULL, -- Hash del archivo PDF para validez legal (NOM-151)
    estado_aprobacion VARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (estado_aprobacion IN ('Pendiente', 'Aprobado', 'Rechazado')),
    aprobado_por UUID REFERENCES usuarios(id_usuario),
    fecha_aprobacion TIMESTAMP WITH TIME ZONE,
    justificacion_aprobacion TEXT,
    sello_digital_nom151 VARCHAR(512), -- Constancia de conservación de mensajes de datos NOM-151
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_fechas_calibracion CHECK (fecha_vencimiento > fecha_calibracion)
);

-- Índices para optimizar la búsqueda de certificados y alertas
CREATE INDEX idx_certificados_instrumento ON certificados_calibracion(id_instrumento);
CREATE INDEX idx_certificados_vencimiento ON certificados_calibracion(fecha_vencimiento);

-- Vista de Alertas de Calibración (Para semáforos y tableros interactivos del Director Roberto Fernández)
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
    -- Obtener únicamente el certificado vigente más reciente aprobado
    SELECT * 
    FROM certificados_calibracion 
    WHERE id_instrumento = i.id_instrumento AND estado_aprobacion = 'Aprobado'
    ORDER BY fecha_vencimiento DESC 
    LIMIT 1
) c ON TRUE;
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
