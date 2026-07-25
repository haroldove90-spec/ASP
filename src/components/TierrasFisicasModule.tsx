import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Edit3,
  Eye,
  FileText,
  Download,
  Search,
  ArrowLeft,
  ArrowRight,
  Save,
  ShieldCheck,
  ClipboardList,
  Building,
  Cpu,
  Activity,
  Database,
  Copy,
  Check,
  X,
  Printer,
  Calendar,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export interface FuenteGeneradora {
  id: string;
  categoria: string;
  cantidad: number;
  listado_fuentes: string;
}

export interface EquipoMuestreo {
  codigo_interno: string;
  marca: string;
  modelo: string;
  no_serie: string;
}

export interface VerificacionPatron {
  id: string;
  fecha: string;
  resistencia_referencia_5: number;
  resistencia_referencia_25: number;
  valor_obtenido_inicial_5: number;
  valor_obtenido_final_5: number;
  valor_obtenido_inicial_25: number;
  valor_obtenido_final_25: number;
  estado_5: 'ok' | 'rechazado';
  estado_25: 'ok' | 'rechazado';
}

export interface PuntoMedicionTierras {
  id: string;
  no_punto: number;
  tipo_conexion: 'Conexión a Tierra' | 'Pararrayos';
  fuente: string;
  es_area_cerrada: boolean;
  humedad_relativa: string;
  ubicacion_punto: string;
  desconexion_equipo_desenergizado: boolean;
  verificar_bateria_suficiente: boolean;
  estado_conexiones: {
    libre_oxido_pintura: boolean;
    conductor_mal_estado: boolean;
    observan_danos_mecanicos: boolean;
    presenta_oxido_grasa_falta_manto: boolean;
  };
  ubicacion_electrodo_c2: string;
  lecturas_p1: {
    m1: number;
    m4: number;
    m7: number;
    m10: number;
    m13: number;
    m16: number;
    m19: number;
  };
  caida_tension_calculada: number;
  pararrayos_datos?: {
    altura_m: string;
    angulo_proteccion: string;
    material_fabricacion: string;
    tipo_sistema: string;
  };
  existe_continuidad: boolean;
}

export interface TierrasFisicasEvaluation {
  id: string;
  no_proyecto: string;
  fecha_informe: string;
  fechas_evaluacion: string;
  
  // Etapa 1
  razon_social: string;
  nombre_comercial: string;
  giro: string;
  domicilio_fiscal: string;
  domicilio_fisico: string;
  telefono: string;
  reportar_a: string;
  puesto_contacto: string;
  rfc: string;
  descripcion_proceso: string;
  
  layout_empresa: string;
  programa_mantenimiento: 'Sí' | 'No';
  trabajo_condiciones_normales: 'Sí' | 'No';
  horario_jornadas: string;
  descripcion_epp: string;
  controles_tecnicos: string;
  observaciones_cliente: string;
  
  // Etapa 2
  fuentes_generadoras: FuenteGeneradora[];
  
  // Etapa 3
  no_puntos_evaluar: number;
  conexiones_tierra_count: number;
  pararrayos_count: number;
  areas_cerradas_humedad: string;
  areas_quimicas_peligrosas: string;
  medidor_tierra: EquipoMuestreo;
  multimetro: EquipoMuestreo;
  higrometro: EquipoMuestreo;
  verificacion_patrones: VerificacionPatron[];
  
  // Etapa 4
  realizado_por_1: string;
  realizado_por_2: string;
  superviso_por: string;
  
  // Etapa 5
  puntos_evaluacion: PuntoMedicionTierras[];
  
  // Meta
  estado: 'Borrador' | 'Completado' | 'Aprobado';
  creado_por: string;
  creado_en: string;
  actualizado_en: string;
  hash_integridad?: string;
}

const DEFAULT_SAMPLE_EVALUATION: TierrasFisicasEvaluation = {
  id: 'TF-2026-001',
  no_proyecto: 'AL022-000/0426',
  fecha_informe: '2026-03-06',
  fechas_evaluacion: '07, 09, 10, 11, 12, 13, 25, 30 y 31 de marzo de 2026',
  
  razon_social: 'Galvasid S.A. de C.V.',
  nombre_comercial: 'Galvasid S.A. de C.V.',
  giro: 'Metalúrgico',
  domicilio_fiscal: 'Carlos Salinas de Gortari Km. 10',
  domicilio_fisico: 'Carlos Salinas de Gortari Km. 10',
  telefono: '(81) 8133 0000',
  reportar_a: 'Oscar Manuel Rodríguez',
  puesto_contacto: 'Jefe de EHS',
  rfc: 'GAL030220KKS',
  descripcion_proceso: 'Laminación de rollos de metal.',
  
  layout_empresa: 'Realizar uno en hoja 5 si no se lo proporcionan',
  programa_mantenimiento: 'No',
  trabajo_condiciones_normales: 'Sí',
  horario_jornadas: '06:00 a 18:00 ~ 14:30 a 22:30 ~ 22:30 a 06:00',
  descripcion_epp: 'Zapatones, lentes, casco y guantes.',
  controles_tecnicos: 'Señalamientos.',
  observaciones_cliente: 'Ninguno.',
  
  fuentes_generadoras: [
    {
      id: 'f1',
      categoria: 'Maquinaria y equipo accionado por motores o que utilicen electricidad',
      cantidad: 192,
      listado_fuentes: 'Laminadoras, Motores trifásicos, Polipastos, Grúas viajeras'
    },
    {
      id: 'f2',
      categoria: 'Recipientes Sujetos a Presión',
      cantidad: 0,
      listado_fuentes: '---'
    },
    {
      id: 'f3',
      categoria: 'Pararrayos',
      cantidad: 7,
      listado_fuentes: 'Sistemas Punta Faraday en Naves 1 a 4'
    },
    {
      id: 'f4',
      categoria: 'Estructuras metálicas de un almacén de residuos peligrosos o disolventes orgánicos',
      cantidad: 0,
      listado_fuentes: '---'
    },
    {
      id: 'f5',
      categoria: 'Subestación eléctrica',
      cantidad: 3,
      listado_fuentes: 'Subestación Principal A, B y C'
    },
    {
      id: 'f6',
      categoria: 'Tableros y/o Centros de Carga',
      cantidad: 12,
      listado_fuentes: 'CCM Naves de producción'
    },
    {
      id: 'f7',
      categoria: 'Tanques de almacenamiento de sustancias químicas inflamables, combustibles o explosivas',
      cantidad: 0,
      listado_fuentes: '---'
    },
    {
      id: 'f8',
      categoria: 'Actividades de trasvase o descarga de sustancias inflamables, combustibles o explosivas',
      cantidad: 0,
      listado_fuentes: '---'
    },
    {
      id: 'f9',
      categoria: 'Otros (Describirlos)',
      cantidad: 0,
      listado_fuentes: '---'
    }
  ],
  
  no_puntos_evaluar: 195,
  conexiones_tierra_count: 188,
  pararrayos_count: 7,
  areas_cerradas_humedad: 'No ---',
  areas_quimicas_peligrosas: 'No ---',
  
  medidor_tierra: {
    codigo_interno: 'MTF-4 (MTF-1)',
    marca: 'AECM Instruments',
    modelo: '4610',
    no_serie: '219207GFDV'
  },
  multimetro: {
    codigo_interno: 'MUL-1',
    marca: 'UNI-T',
    modelo: 'UT202A',
    no_serie: 'C192648722'
  },
  higrometro: {
    codigo_interno: 'MMH-1',
    marca: 'Kestrel',
    modelo: '3000',
    no_serie: '2294496'
  },
  
  verificacion_patrones: [
    { id: 'v1', fecha: '05 de marzo de 2026', resistencia_referencia_5: 5, resistencia_referencia_25: 25, valor_obtenido_inicial_5: 5.0, valor_obtenido_final_5: 5.0, valor_obtenido_inicial_25: 25.0, valor_obtenido_final_25: 25.0, estado_5: 'ok', estado_25: 'ok' },
    { id: 'v2', fecha: '06 de marzo de 2026', resistencia_referencia_5: 5, resistencia_referencia_25: 25, valor_obtenido_inicial_5: 5.0, valor_obtenido_final_5: 5.0, valor_obtenido_inicial_25: 25.0, valor_obtenido_final_25: 25.0, estado_5: 'ok', estado_25: 'ok' },
    { id: 'v3', fecha: '09 de marzo de 2026', resistencia_referencia_5: 5, resistencia_referencia_25: 25, valor_obtenido_inicial_5: 5.0, valor_obtenido_final_5: 5.0, valor_obtenido_inicial_25: 25.0, valor_obtenido_final_25: 25.0, estado_5: 'ok', estado_25: 'ok' },
    { id: 'v4', fecha: '10 de marzo de 2026', resistencia_referencia_5: 5, resistencia_referencia_25: 25, valor_obtenido_inicial_5: 5.0, valor_obtenido_final_5: 5.0, valor_obtenido_inicial_25: 25.0, valor_obtenido_final_25: 25.0, estado_5: 'ok', estado_25: 'ok' },
    { id: 'v5', fecha: '11 de marzo de 2026', resistencia_referencia_5: 5, resistencia_referencia_25: 25, valor_obtenido_inicial_5: 5.0, valor_obtenido_final_5: 5.0, valor_obtenido_inicial_25: 25.0, valor_obtenido_final_25: 25.0, estado_5: 'ok', estado_25: 'ok' },
    { id: 'v6', fecha: '12 de marzo de 2026', resistencia_referencia_5: 5, resistencia_referencia_25: 25, valor_obtenido_inicial_5: 5.0, valor_obtenido_final_5: 5.0, valor_obtenido_inicial_25: 25.0, valor_obtenido_final_25: 25.0, estado_5: 'ok', estado_25: 'ok' },
    { id: 'v7', fecha: '13 de marzo de 2026', resistencia_referencia_5: 5, resistencia_referencia_25: 25, valor_obtenido_inicial_5: 5.0, valor_obtenido_final_5: 5.0, valor_obtenido_inicial_25: 25.0, valor_obtenido_final_25: 25.0, estado_5: 'ok', estado_25: 'ok' },
    { id: 'v8', fecha: '25 de marzo de 2026', resistencia_referencia_5: 5, resistencia_referencia_25: 25, valor_obtenido_inicial_5: 5.0, valor_obtenido_final_5: 5.0, valor_obtenido_inicial_25: 25.0, valor_obtenido_final_25: 25.0, estado_5: 'ok', estado_25: 'ok' },
    { id: 'v9', fecha: '30 de marzo de 2026', resistencia_referencia_5: 5, resistencia_referencia_25: 25, valor_obtenido_inicial_5: 5.0, valor_obtenido_final_5: 5.0, valor_obtenido_inicial_25: 25.0, valor_obtenido_final_25: 25.0, estado_5: 'ok', estado_25: 'ok' },
    { id: 'v10', fecha: '31 de marzo de 2026', resistencia_referencia_5: 5, resistencia_referencia_25: 25, valor_obtenido_inicial_5: 5.0, valor_obtenido_final_5: 5.0, valor_obtenido_inicial_25: 25.0, valor_obtenido_final_25: 25.0, estado_5: 'ok', estado_25: 'ok' }
  ],
  
  realizado_por_1: 'JASIEL ANTONIO NAVARRO LÁZARO',
  realizado_por_2: 'JOSÉ FRANCISCO ALEJANDRO',
  superviso_por: 'DITR',
  
  puntos_evaluacion: [
    {
      id: 'p1',
      no_punto: 1,
      tipo_conexion: 'Conexión a Tierra',
      fuente: 'Estructura Metálica',
      es_area_cerrada: false,
      humedad_relativa: '48%',
      ubicacion_punto: 'Oficina 2',
      desconexion_equipo_desenergizado: true,
      verificar_bateria_suficiente: true,
      estado_conexiones: {
        libre_oxido_pintura: true,
        conductor_mal_estado: false,
        observan_danos_mecanicos: false,
        presenta_oxido_grasa_falta_manto: false
      },
      ubicacion_electrodo_c2: '20m',
      lecturas_p1: {
        m1: 0.15,
        m4: 0.16,
        m7: 0.18,
        m10: 0.18,
        m13: 0.22,
        m16: 0.27,
        m19: 0.28
      },
      caida_tension_calculada: 0.18,
      existe_continuidad: true
    },
    {
      id: 'p2',
      no_punto: 2,
      tipo_conexion: 'Pararrayos',
      fuente: 'Pararrayos Punta Faraday Nave 1',
      es_area_cerrada: false,
      humedad_relativa: '42%',
      ubicacion_punto: 'Azotea Nave Principal',
      desconexion_equipo_desenergizado: true,
      verificar_bateria_suficiente: true,
      estado_conexiones: {
        libre_oxido_pintura: true,
        conductor_mal_estado: false,
        observan_danos_mecanicos: false,
        presenta_oxido_grasa_falta_manto: false
      },
      ubicacion_electrodo_c2: '25m',
      lecturas_p1: {
        m1: 0.21,
        m4: 0.23,
        m7: 0.25,
        m10: 0.26,
        m13: 0.30,
        m16: 0.32,
        m19: 0.35
      },
      caida_tension_calculada: 0.26,
      pararrayos_datos: {
        altura_m: '18m',
        angulo_proteccion: '45°',
        material_fabricacion: 'Cobre C11000',
        tipo_sistema: 'Faraday Dipolo'
      },
      existe_continuidad: true
    }
  ],
  
  estado: 'Aprobado',
  creado_por: 'Lic. Carlos Ayala (Director Atención a Clientes)',
  creado_en: '2026-03-06T10:00:00.000Z',
  actualizado_en: '2026-03-31T18:30:00.000Z',
  hash_integridad: 'SHA256:TF_881920_AL022_000_0426_APPROVED'
};

const SUPABASE_SQL_SCRIPT = `-- =====================================================================
-- TABLA Y ESTRUCTURA DE BASE DE DATOS SUPABASE / POSTGRESQL
-- RECONOCIMIENTO Y EVALUACIÓN DE RESISTENCIAS Y CONTINUIDADES (TIERRAS FÍSICAS)
-- FORMATO OFICIAL: F1PAL22-01 / F1PAL22-03 (REVISIÓN 2022-04-14 / 2026-04-30)
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS tierras_fisicas_evaluaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    no_proyecto VARCHAR(100) NOT NULL,
    fecha_informe DATE,
    fechas_evaluacion TEXT,
    
    -- Etapa 1: Datos Generales
    razon_social VARCHAR(255) NOT NULL,
    nombre_comercial VARCHAR(255),
    giro VARCHAR(150),
    domicilio_fiscal TEXT,
    domicilio_fisico TEXT,
    telefono VARCHAR(50),
    reportar_a VARCHAR(255),
    puesto_contacto VARCHAR(150),
    rfc VARCHAR(20),
    descripcion_proceso TEXT,
    
    -- Etapa 1: Solicitudes al Cliente
    layout_empresa VARCHAR(100),
    programa_mantenimiento VARCHAR(100),
    trabajo_condiciones_normales VARCHAR(50),
    horario_jornadas TEXT,
    descripcion_epp TEXT,
    controles_tecnicos TEXT,
    observaciones_cliente TEXT,
    
    -- Etapa 2: Fuentes Generadoras de Electricidad Estática (JSONB)
    fuentes_generadoras JSONB DEFAULT '[]'::jsonb,
    
    -- Etapa 3: Información del Proyecto y Equipos de Muestreo
    no_puntos_evaluar INT DEFAULT 0,
    conexiones_tierra_count INT DEFAULT 0,
    pararrayos_count INT DEFAULT 0,
    areas_cerradas_humedad TEXT,
    areas_quimicas_peligrosas TEXT,
    
    -- Equipos de Muestreo (JSONB)
    medidor_tierra JSONB DEFAULT '{}'::jsonb,
    multimetro JSONB DEFAULT '{}'::jsonb,
    higrometro JSONB DEFAULT '{}'::jsonb,
    
    -- Etapa 3 y 4: Verificación de Equipos y Patrones (JSONB)
    verificacion_patrones JSONB DEFAULT '[]'::jsonb,
    realizado_por_1 VARCHAR(255),
    realizado_por_2 VARCHAR(255),
    superviso_por VARCHAR(255),
    
    -- Etapa 5: Puntos de Evaluación de Resistencia y Continuidad (JSONB)
    puntos_evaluacion JSONB DEFAULT '[]'::jsonb,
    
    -- Estado y Trazabilidad NMX-EC-17025
    estado VARCHAR(50) DEFAULT 'Completado',
    creado_por VARCHAR(255),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    hash_integridad VARCHAR(128)
);

-- ÍNDICES DE BÚSQUEDA RÁPIDA
CREATE INDEX IF NOT EXISTS idx_tierras_fisicas_proyecto ON tierras_fisicas_evaluaciones(no_proyecto);
CREATE INDEX IF NOT EXISTS idx_tierras_fisicas_cliente ON tierras_fisicas_evaluaciones(razon_social);
CREATE INDEX IF NOT EXISTS idx_tierras_fisicas_fecha ON tierras_fisicas_evaluaciones(fecha_informe);

-- REGISTRO INICIAL DE PRUEBA (AL022-000/0426 - GALVASID)
INSERT INTO tierras_fisicas_evaluaciones (
    no_proyecto, fecha_informe, fechas_evaluacion,
    razon_social, nombre_comercial, giro, domicilio_fiscal, domicilio_fisico,
    telefono, reportar_a, puesto_contacto, rfc, descripcion_proceso,
    layout_empresa, programa_mantenimiento, trabajo_condiciones_normales,
    horario_jornadas, descripcion_epp, controles_tecnicos, observaciones_cliente,
    no_puntos_evaluar, conexiones_tierra_count, pararrayos_count,
    realizado_por_1, realizado_por_2, superviso_por, estado
) VALUES (
    'AL022-000/0426', '2026-03-06', '07, 09, 10, 11, 12, 13, 25, 30 y 31 de marzo de 2026',
    'Galvasid S.A. de C.V.', 'Galvasid S.A. de C.V.', 'Metalúrgico', 'Carlos Salinas de Gortari Km. 10', 'Carlos Salinas de Gortari Km. 10',
    '(81) 8133 0000', 'Oscar Manuel Rodríguez', 'Jefe de EHS', 'GAL030220KKS', 'Laminación de rollos de metal.',
    'Realizar uno en hoja 5 si no se lo proporcionan', 'No', 'Sí',
    '06:00 a 18:00 ~ 14:30 a 22:30 ~ 22:30 a 06:00', 'Zapatones, lentes, casco y guantes.', 'Señalamientos.', 'Ninguno.',
    195, 188, 7,
    'JASIEL ANTONIO NAVARRO LÁZARO', 'JOSÉ FRANCISCO ALEJANDRO', 'DITR', 'Aprobado'
) ON CONFLICT DO NOTHING;
`;

export default function TierrasFisicasModule() {
  const [evaluations, setEvaluations] = useState<TierrasFisicasEvaluation[]>(() => {
    try {
      const saved = localStorage.getItem('aspechs_tierras_fisicas_evaluaciones');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [DEFAULT_SAMPLE_EVALUATION];
  });

  const [activeView, setActiveView] = useState<'list' | 'form' | 'detail'>('list');
  const [selectedEval, setSelectedEval] = useState<TierrasFisicasEvaluation | null>(DEFAULT_SAMPLE_EVALUATION);
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Form State
  const [formData, setFormData] = useState<TierrasFisicasEvaluation>(DEFAULT_SAMPLE_EVALUATION);

  // Save list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aspechs_tierras_fisicas_evaluaciones', JSON.stringify(evaluations));
    } catch (e) {
      console.error(e);
    }
  }, [evaluations]);

  const handleCreateNew = () => {
    const newId = `TF-2026-00${evaluations.length + 1}`;
    const newEval: TierrasFisicasEvaluation = {
      ...DEFAULT_SAMPLE_EVALUATION,
      id: newId,
      no_proyecto: `AL022-000/${Math.floor(1000 + Math.random() * 9000)}`,
      fecha_informe: new Date().toISOString().split('T')[0],
      fechas_evaluacion: 'Por determinar',
      razon_social: '',
      nombre_comercial: '',
      giro: '',
      domicilio_fiscal: '',
      domicilio_fisico: '',
      telefono: '',
      reportar_a: '',
      puesto_contacto: '',
      rfc: '',
      descripcion_proceso: '',
      puntos_evaluacion: [
        {
          id: 'p1',
          no_punto: 1,
          tipo_conexion: 'Conexión a Tierra',
          fuente: 'Estructura Metálica',
          es_area_cerrada: false,
          humedad_relativa: '45%',
          ubicacion_punto: 'Planta Principal',
          desconexion_equipo_desenergizado: true,
          verificar_bateria_suficiente: true,
          estado_conexiones: {
            libre_oxido_pintura: true,
            conductor_mal_estado: false,
            observan_danos_mecanicos: false,
            presenta_oxido_grasa_falta_manto: false
          },
          ubicacion_electrodo_c2: '20m',
          lecturas_p1: { m1: 0, m4: 0, m7: 0, m10: 0, m13: 0, m16: 0, m19: 0 },
          caida_tension_calculada: 0,
          existe_continuidad: true
        }
      ],
      estado: 'Borrador',
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString()
    };
    setFormData(newEval);
    setCurrentStage(1);
    setActiveView('form');
  };

  const handleEdit = (evalItem: TierrasFisicasEvaluation) => {
    setFormData({ ...evalItem });
    setCurrentStage(1);
    setActiveView('form');
  };

  const handleViewDetail = (evalItem: TierrasFisicasEvaluation) => {
    setSelectedEval(evalItem);
    setActiveView('detail');
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar esta evaluación de Tierras Físicas?')) {
      setEvaluations(prev => prev.filter(e => e.id !== id));
      if (selectedEval?.id === id) {
        setSelectedEval(null);
        setActiveView('list');
      }
    }
  };

  const handleSaveForm = (isFinal: boolean = false) => {
    const updated: TierrasFisicasEvaluation = {
      ...formData,
      estado: isFinal ? 'Completado' : formData.estado,
      actualizado_en: new Date().toISOString(),
      hash_integridad: `SHA256:TF_${Date.now()}_${formData.no_proyecto.replace(/[^a-zA-Z0-9]/g, '_')}`
    };

    setEvaluations(prev => {
      const idx = prev.findIndex(e => e.id === updated.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });

    setSelectedEval(updated);
    alert(isFinal ? '¡Formulario de Tierras Físicas completado y guardado con éxito en el historial!' : 'Borrador guardado correctamente.');
    setActiveView('detail');
  };

  // Helper to copy SQL
  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const filteredEvaluations = evaluations.filter(e =>
    e.razon_social.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.no_proyecto.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER PRINCIPAL DEL MÓDULO */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-5 shadow-lg border border-slate-700/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-400 shadow-inner">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  F1PAL22-01 / F1PAL22-03
                </span>
                <span className="text-[10px] text-slate-400 font-mono">NOM-022-STPS / NMX-EC-17025</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Reconocimiento y Evaluación de Resistencias y Continuidades (Tierras Físicas)
              </h2>
              <p className="text-xs text-slate-300">
                Modulo de Captura Metrológica de 5 Etapas e Historial Digital de Inspecciones en Campo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowSqlModal(true)}
              className="px-3 py-2 bg-slate-800/90 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Database className="w-3.5 h-3.5" />
              <span>SQL para Supabase</span>
            </button>

            {activeView !== 'list' && (
              <button
                onClick={() => setActiveView('list')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al Historial</span>
              </button>
            )}

            {activeView === 'list' && (
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition duration-200 shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Evaluación (5 Etapas)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VISTA 1: HISTORIAL DE EVALUACIONES */}
      {activeView === 'list' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* BARRA DE BÚSQUEDA Y ESTADÍSTICAS */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por cliente, No. de Proyecto (ej. AL022-000/0426) o Folio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm"
              />
            </div>
            
            <div className="md:col-span-4 flex items-center justify-end gap-3 text-xs text-slate-600 font-mono">
              <span className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                Total Registros: <strong className="text-slate-900">{evaluations.length}</strong>
              </span>
            </div>
          </div>

          {/* TABLA DEL HISTORIAL */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-mono">
                  <tr>
                    <th className="p-3.5">Folio / Proyecto</th>
                    <th className="p-3.5">Cliente (Empresa)</th>
                    <th className="p-3.5">Fechas Muestreo</th>
                    <th className="p-3.5">Puntos Evaluados</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredEvaluations.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition duration-150">
                      <td className="p-3.5 font-mono">
                        <div className="font-bold text-slate-900">{item.id}</div>
                        <div className="text-[10px] text-slate-500">{item.no_proyecto}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{item.razon_social || 'Sin nombre'}</div>
                        <div className="text-[10px] text-slate-400">RFC: {item.rfc || 'N/A'}</div>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{item.fecha_informe}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                          {item.fechas_evaluacion}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-800">{item.no_puntos_evaluar} pts</span>
                        <span className="text-[10px] text-slate-500 block">
                          ({item.conexiones_tierra_count} Tierras, {item.pararrayos_count} Pararrayos)
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          item.estado === 'Aprobado' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          item.estado === 'Completado' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          <CheckCircle2 className="w-3 h-3" />
                          {item.estado}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewDetail(item)}
                            title="Ver Expediente Oficial"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            title="Editar Formulario"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            title="Eliminar"
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredEvaluations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 italic">
                        No se encontraron registros de evaluación de Tierras Físicas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* VISTA 2: CAPTURA EN 5 ETAPAS */}
      {activeView === 'form' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* NAVEGADOR DE LAS 5 ETAPAS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                Flujo de Registro - Etapa {currentStage} de 5
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Folio: <strong>{formData.id}</strong> | Proyecto: <strong>{formData.no_proyecto || 'Sin asignar'}</strong>
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[
                { stage: 1, label: '1. Datos Generales & Proceso' },
                { stage: 2, label: '2. Clasificación de Fuentes' },
                { stage: 3, label: '3. Muestreo y Equipos' },
                { stage: 4, label: '4. Firmas y Trazabilidad' },
                { stage: 5, label: '5. Nivel de Resistencia por Punto' }
              ].map(item => (
                <button
                  key={item.stage}
                  onClick={() => setCurrentStage(item.stage)}
                  className={`p-2.5 rounded-xl border text-left transition duration-150 cursor-pointer ${
                    currentStage === item.stage
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : currentStage > item.stage
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider font-mono opacity-80">
                    Etapa 0{item.stage}
                  </div>
                  <div className="text-xs font-bold truncate leading-tight mt-0.5">
                    {item.label.split('. ')[1]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* CONTENIDO DE LAS ETAPAS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            {/* ETAPA 1 */}
            {currentStage === 1 && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                      <Building className="w-4 h-4 text-emerald-600" />
                      ETAPA 1: Reconocimiento y Descripción General de las Condiciones del Proceso
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Formato F1PAL22-03 (Pág. 1 de 5) - Datos del Informe y la Empresa</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">No. de Proyecto *</label>
                    <input
                      type="text"
                      value={formData.no_proyecto}
                      onChange={e => setFormData({ ...formData, no_proyecto: e.target.value })}
                      placeholder="ej. AL022-000/0426"
                      className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Fecha de Informe *</label>
                    <input
                      type="date"
                      value={formData.fecha_informe}
                      onChange={e => setFormData({ ...formData, fecha_informe: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Fecha(s) de Muestreo / Ejecución *</label>
                    <input
                      type="text"
                      value={formData.fechas_evaluacion}
                      onChange={e => setFormData({ ...formData, fechas_evaluacion: e.target.value })}
                      placeholder="ej. 07, 09, 10, 11, 12, 13, 25, 30 y 31 de marzo de 2026"
                      className="w-full border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">I. DATOS GENERALES DE LA EMPRESA</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Razón Social *</label>
                      <input
                        type="text"
                        value={formData.razon_social}
                        onChange={e => setFormData({ ...formData, razon_social: e.target.value })}
                        placeholder="ej. Galvasid S.A. de C.V."
                        className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nombre Comercial</label>
                      <input
                        type="text"
                        value={formData.nombre_comercial}
                        onChange={e => setFormData({ ...formData, nombre_comercial: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Giro de la Empresa</label>
                      <input
                        type="text"
                        value={formData.giro}
                        onChange={e => setFormData({ ...formData, giro: e.target.value })}
                        placeholder="ej. Metalúrgico"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">RFC</label>
                      <input
                        type="text"
                        value={formData.rfc}
                        onChange={e => setFormData({ ...formData, rfc: e.target.value })}
                        placeholder="ej. GAL030220KKS"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Domicilio Fiscal</label>
                      <input
                        type="text"
                        value={formData.domicilio_fiscal}
                        onChange={e => setFormData({ ...formData, domicilio_fiscal: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Domicilio Físico (Planta)</label>
                      <input
                        type="text"
                        value={formData.domicilio_fisico}
                        onChange={e => setFormData({ ...formData, domicilio_fisico: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Teléfono</label>
                      <input
                        type="text"
                        value={formData.telefono}
                        onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Reportar a / Atención a</label>
                      <input
                        type="text"
                        value={formData.reportar_a}
                        onChange={e => setFormData({ ...formData, reportar_a: e.target.value })}
                        placeholder="ej. Oscar Manuel Rodríguez"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Puesto del Contacto</label>
                      <input
                        type="text"
                        value={formData.puesto_contacto}
                        onChange={e => setFormData({ ...formData, puesto_contacto: e.target.value })}
                        placeholder="ej. Jefe de EHS"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider font-mono">II. CARACTERÍSTICAS DE LA EMPRESA & PROCESO</h4>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Descripción general del proceso (Actividad Principal)</label>
                    <textarea
                      rows={3}
                      value={formData.descripcion_proceso}
                      onChange={e => setFormData({ ...formData, descripcion_proceso: e.target.value })}
                      placeholder="ej. Laminación de rollos de metal."
                      className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider font-mono">III. SOLICITAR AL CLIENTE</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">1. Lay Out de la empresa</label>
                      <input
                        type="text"
                        value={formData.layout_empresa}
                        onChange={e => setFormData({ ...formData, layout_empresa: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">2. Programa de mantenimiento</label>
                      <select
                        value={formData.programa_mantenimiento}
                        onChange={e => setFormData({ ...formData, programa_mantenimiento: e.target.value as 'Sí' | 'No' })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      >
                        <option value="No">No</option>
                        <option value="Sí">Sí</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">3. ¿Trabaja en condiciones normales de operación?</label>
                      <select
                        value={formData.trabajo_condiciones_normales}
                        onChange={e => setFormData({ ...formData, trabajo_condiciones_normales: e.target.value as 'Sí' | 'No' })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      >
                        <option value="Sí">Sí</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">4. Horario de jornadas laborales</label>
                      <input
                        type="text"
                        value={formData.horario_jornadas}
                        onChange={e => setFormData({ ...formData, horario_jornadas: e.target.value })}
                        placeholder="ej. 06:00 a 18:00 ~ 14:30 a 22:30 ~ 22:30 a 06:00"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">5. Descripción del Equipo de Protección Personal (EPP)</label>
                      <input
                        type="text"
                        value={formData.descripcion_epp}
                        onChange={e => setFormData({ ...formData, descripcion_epp: e.target.value })}
                        placeholder="ej. Zapatones, lentes, casco y guantes."
                        className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">6. Controles Técnicos Administrativos</label>
                      <input
                        type="text"
                        value={formData.controles_tecnicos}
                        onChange={e => setFormData({ ...formData, controles_tecnicos: e.target.value })}
                        placeholder="ej. Señalamientos."
                        className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">7. Observaciones, comentarios y/o condiciones especiales</label>
                    <input
                      type="text"
                      value={formData.observaciones_cliente}
                      onChange={e => setFormData({ ...formData, observaciones_cliente: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 2 */}
            {currentStage === 2 && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-600" />
                    ETAPA 2: Clasificación y Cuantificación de Fuentes Generadoras de Electricidad Estática
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Formato F1PAL22-01 (Pág. 2 de 5) - Desglose de Fuentes y Equipamiento en Planta</p>
                </div>

                <div className="space-y-3">
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[10px] uppercase text-slate-500">
                        <tr>
                          <th className="p-3 w-1/2">TIPO DE FUENTE GENERADORA</th>
                          <th className="p-3 w-24 text-center">CANTIDAD</th>
                          <th className="p-3">LISTADO DE FUENTES / DETALLE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {formData.fuentes_generadoras.map((fuente, idx) => (
                          <tr key={fuente.id} className="hover:bg-slate-50">
                            <td className="p-3 font-semibold text-slate-800">
                              {idx + 1}. {fuente.categoria}
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min={0}
                                value={fuente.cantidad}
                                onChange={e => {
                                  const val = parseInt(e.target.value) || 0;
                                  const updatedFuentes = [...formData.fuentes_generadoras];
                                  updatedFuentes[idx].cantidad = val;
                                  setFormData({ ...formData, fuentes_generadoras: updatedFuentes });
                                }}
                                className="w-16 text-center border border-slate-200 rounded p-1 font-mono font-bold"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={fuente.listado_fuentes}
                                onChange={e => {
                                  const updatedFuentes = [...formData.fuentes_generadoras];
                                  updatedFuentes[idx].listado_fuentes = e.target.value;
                                  setFormData({ ...formData, fuentes_generadoras: updatedFuentes });
                                }}
                                placeholder="Describa el equipo o ingrese --- si no aplica"
                                className="w-full border border-slate-200 rounded p-1"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 3 */}
            {currentStage === 3 && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    ETAPA 3: Información del Proyecto, Equipos de Muestreo y Verificación Metrológica
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Formato F1PAL22-01 (Pág. 3 de 5) - Puntos a Evaluar, Patrones y Control Diario</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider font-mono">V. INFORMACIÓN DEL PROYECTO</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">1. No. De puntos a evaluar</label>
                      <input
                        type="number"
                        value={formData.no_puntos_evaluar}
                        onChange={e => setFormData({ ...formData, no_puntos_evaluar: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Conexiones a Tierra</label>
                      <input
                        type="number"
                        value={formData.conexiones_tierra_count}
                        onChange={e => setFormData({ ...formData, conexiones_tierra_count: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Pararrayos</label>
                      <input
                        type="number"
                        value={formData.pararrayos_count}
                        onChange={e => setFormData({ ...formData, pararrayos_count: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono font-bold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">2. ¿Existen áreas cerradas con humedad relativa acumulante?</label>
                      <input
                        type="text"
                        value={formData.areas_cerradas_humedad}
                        onChange={e => setFormData({ ...formData, areas_cerradas_humedad: e.target.value })}
                        placeholder="ej. No ---"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">3. ¿Existen áreas con sustancias químicas peligrosas?</label>
                      <input
                        type="text"
                        value={formData.areas_quimicas_peligrosas}
                        onChange={e => setFormData({ ...formData, areas_quimicas_peligrosas: e.target.value })}
                        placeholder="ej. No ---"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider font-mono">VI. EQUIPO(S) DE MUESTREO Y PATRONES UTILIZADOS</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* MEDIDOR TIERRA */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                      <div className="font-bold text-slate-800">1. Medidor de Resistencia a Tierra</div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Código Interno:</span>
                        <input
                          type="text"
                          value={formData.medidor_tierra.codigo_interno}
                          onChange={e => setFormData({ ...formData, medidor_tierra: { ...formData.medidor_tierra, codigo_interno: e.target.value } })}
                          className="w-full bg-white border rounded p-1 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Marca:</span>
                        <input
                          type="text"
                          value={formData.medidor_tierra.marca}
                          onChange={e => setFormData({ ...formData, medidor_tierra: { ...formData.medidor_tierra, marca: e.target.value } })}
                          className="w-full bg-white border rounded p-1 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Modelo:</span>
                        <input
                          type="text"
                          value={formData.medidor_tierra.modelo}
                          onChange={e => setFormData({ ...formData, medidor_tierra: { ...formData.medidor_tierra, modelo: e.target.value } })}
                          className="w-full bg-white border rounded p-1 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">No. Serie:</span>
                        <input
                          type="text"
                          value={formData.medidor_tierra.no_serie}
                          onChange={e => setFormData({ ...formData, medidor_tierra: { ...formData.medidor_tierra, no_serie: e.target.value } })}
                          className="w-full bg-white border rounded p-1 text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* MULTÍMETRO */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                      <div className="font-bold text-slate-800">2. Multímetro Digital</div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Código Interno:</span>
                        <input
                          type="text"
                          value={formData.multimetro.codigo_interno}
                          onChange={e => setFormData({ ...formData, multimetro: { ...formData.multimetro, codigo_interno: e.target.value } })}
                          className="w-full bg-white border rounded p-1 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Marca:</span>
                        <input
                          type="text"
                          value={formData.multimetro.marca}
                          onChange={e => setFormData({ ...formData, multimetro: { ...formData.multimetro, marca: e.target.value } })}
                          className="w-full bg-white border rounded p-1 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Modelo:</span>
                        <input
                          type="text"
                          value={formData.multimetro.modelo}
                          onChange={e => setFormData({ ...formData, multimetro: { ...formData.multimetro, modelo: e.target.value } })}
                          className="w-full bg-white border rounded p-1 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">No. Serie:</span>
                        <input
                          type="text"
                          value={formData.multimetro.no_serie}
                          onChange={e => setFormData({ ...formData, multimetro: { ...formData.multimetro, no_serie: e.target.value } })}
                          className="w-full bg-white border rounded p-1 text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* HIGRÓMETRO */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                      <div className="font-bold text-slate-800">3. Higrómetro Ambientalista</div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Código Interno:</span>
                        <input
                          type="text"
                          value={formData.higrometro.codigo_interno}
                          onChange={e => setFormData({ ...formData, higrometro: { ...formData.higrometro, codigo_interno: e.target.value } })}
                          className="w-full bg-white border rounded p-1 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Marca:</span>
                        <input
                          type="text"
                          value={formData.higrometro.marca}
                          onChange={e => setFormData({ ...formData, higrometro: { ...formData.higrometro, marca: e.target.value } })}
                          className="w-full bg-white border rounded p-1 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Modelo:</span>
                        <input
                          type="text"
                          value={formData.higrometro.modelo}
                          onChange={e => setFormData({ ...formData, higrometro: { ...formData.higrometro, modelo: e.target.value } })}
                          className="w-full bg-white border rounded p-1 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">No. Serie:</span>
                        <input
                          type="text"
                          value={formData.higrometro.no_serie}
                          onChange={e => setFormData({ ...formData, higrometro: { ...formData.higrometro, no_serie: e.target.value } })}
                          className="w-full bg-white border rounded p-1 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* VII. VERIFICACIÓN DIARIA DE PATRONES */}
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-700 uppercase tracking-wider font-mono">VII. VERIFICACIÓN DIARIA DE EQUIPO (RESISTENCIA REF. 5 Ω & 25 Ω)</h4>
                    <button
                      type="button"
                      onClick={() => {
                        const newVerif: VerificacionPatron = {
                          id: `v_${Date.now()}`,
                          fecha: '01 de abril de 2026',
                          resistencia_referencia_5: 5,
                          resistencia_referencia_25: 25,
                          valor_obtenido_inicial_5: 5.0,
                          valor_obtenido_final_5: 5.0,
                          valor_obtenido_inicial_25: 25.0,
                          valor_obtenido_final_25: 25.0,
                          estado_5: 'ok',
                          estado_25: 'ok'
                        };
                        setFormData({ ...formData, verificacion_patrones: [...formData.verificacion_patrones, newVerif] });
                      }}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Agregar Día de Verificación</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-mono">
                        <tr>
                          <th className="p-2.5">Fecha</th>
                          <th className="p-2.5">Resistencia Ref Ω</th>
                          <th className="p-2.5">Valor Inicial Ω</th>
                          <th className="p-2.5">Valor Final Ω</th>
                          <th className="p-2.5">Aceptado / Rechazado</th>
                          <th className="p-2.5 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {formData.verificacion_patrones.map((vp, vIdx) => (
                          <React.Fragment key={vp.id}>
                            <tr className="bg-slate-50/50">
                              <td rowSpan={2} className="p-2.5 border-r border-slate-200">
                                <input
                                  type="text"
                                  value={vp.fecha}
                                  onChange={e => {
                                    const copy = [...formData.verificacion_patrones];
                                    copy[vIdx].fecha = e.target.value;
                                    setFormData({ ...formData, verificacion_patrones: copy });
                                  }}
                                  className="w-full bg-white border border-slate-200 rounded p-1 font-semibold"
                                />
                              </td>
                              <td className="p-2.5 font-mono font-bold text-emerald-700">5 Ω</td>
                              <td className="p-2.5 font-mono">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={vp.valor_obtenido_inicial_5}
                                  onChange={e => {
                                    const copy = [...formData.verificacion_patrones];
                                    copy[vIdx].valor_obtenido_inicial_5 = parseFloat(e.target.value) || 0;
                                    setFormData({ ...formData, verificacion_patrones: copy });
                                  }}
                                  className="w-20 border rounded p-1"
                                />
                              </td>
                              <td className="p-2.5 font-mono">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={vp.valor_obtenido_final_5}
                                  onChange={e => {
                                    const copy = [...formData.verificacion_patrones];
                                    copy[vIdx].valor_obtenido_final_5 = parseFloat(e.target.value) || 0;
                                    setFormData({ ...formData, verificacion_patrones: copy });
                                  }}
                                  className="w-20 border rounded p-1"
                                />
                              </td>
                              <td className="p-2.5 font-mono">
                                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                  ok
                                </span>
                              </td>
                              <td rowSpan={2} className="p-2.5 text-right border-l border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const copy = formData.verificacion_patrones.filter(item => item.id !== vp.id);
                                    setFormData({ ...formData, verificacion_patrones: copy });
                                  }}
                                  className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                            <tr className="border-b border-slate-200">
                              <td className="p-2.5 font-mono font-bold text-emerald-700">25 Ω</td>
                              <td className="p-2.5 font-mono">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={vp.valor_obtenido_inicial_25}
                                  onChange={e => {
                                    const copy = [...formData.verificacion_patrones];
                                    copy[vIdx].valor_obtenido_inicial_25 = parseFloat(e.target.value) || 0;
                                    setFormData({ ...formData, verificacion_patrones: copy });
                                  }}
                                  className="w-20 border rounded p-1"
                                />
                              </td>
                              <td className="p-2.5 font-mono">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={vp.valor_obtenido_final_25}
                                  onChange={e => {
                                    const copy = [...formData.verificacion_patrones];
                                    copy[vIdx].valor_obtenido_final_25 = parseFloat(e.target.value) || 0;
                                    setFormData({ ...formData, verificacion_patrones: copy });
                                  }}
                                  className="w-20 border rounded p-1"
                                />
                              </td>
                              <td className="p-2.5 font-mono">
                                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                  ok
                                </span>
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 4 */}
            {currentStage === 4 && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    ETAPA 4: Firmas, Responsables de Muestreo y Certificación
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Formato F1PAL22-01 (Pág. 4 de 5) - Control de Personal Evaluador y Supervisor</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
                    <h4 className="font-bold text-slate-800 uppercase font-mono">REALIZADO POR (INGENIEROS DE CAMPO)</h4>
                    <div>
                      <label className="block text-slate-600 mb-1">Analista / Ingeniero 1:</label>
                      <input
                        type="text"
                        value={formData.realizado_por_1}
                        onChange={e => setFormData({ ...formData, realizado_por_1: e.target.value })}
                        placeholder="ej. JASIEL ANTONIO NAVARRO LÁZARO"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Analista / Ingeniero 2:</label>
                      <input
                        type="text"
                        value={formData.realizado_por_2}
                        onChange={e => setFormData({ ...formData, realizado_por_2: e.target.value })}
                        placeholder="ej. JOSÉ FRANCISCO ALEJANDRO"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
                    <h4 className="font-bold text-slate-800 uppercase font-mono">SUPERVISÓ (SUPERVISOR METROLÓGICO)</h4>
                    <div>
                      <label className="block text-slate-600 mb-1">Nombre / Clave de Supervisor:</label>
                      <input
                        type="text"
                        value={formData.superviso_por}
                        onChange={e => setFormData({ ...formData, superviso_por: e.target.value })}
                        placeholder="ej. DITR"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold"
                      />
                    </div>
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Validación NMX-EC-17025 Compliant</span>
                      </div>
                      <p>
                        Las mediciones se registran bajo custodia criptográfica vinculada a la e.firma del SAT de la empresa.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 5 */}
            {currentStage === 5 && (
              <div className="space-y-5">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-600" />
                      ETAPA 5: Evaluación del Nivel de Resistencia y Continuidad por Punto
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Formato F1PAL22-01 (Pág. 5 de 5) - Método de Caída de Potencial (Electrodos P1 y C2)</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newPunto: PuntoMedicionTierras = {
                        id: `p_${Date.now()}`,
                        no_punto: formData.puntos_evaluacion.length + 1,
                        tipo_conexion: 'Conexión a Tierra',
                        fuente: 'Estructura Metálica',
                        es_area_cerrada: false,
                        humedad_relativa: '45%',
                        ubicacion_punto: `Punto ${formData.puntos_evaluacion.length + 1}`,
                        desconexion_equipo_desenergizado: true,
                        verificar_bateria_suficiente: true,
                        estado_conexiones: {
                          libre_oxido_pintura: true,
                          conductor_mal_estado: false,
                          observan_danos_mecanicos: false,
                          presenta_oxido_grasa_falta_manto: false
                        },
                        ubicacion_electrodo_c2: '20m',
                        lecturas_p1: { m1: 0.15, m4: 0.16, m7: 0.18, m10: 0.18, m13: 0.22, m16: 0.27, m19: 0.28 },
                        caida_tension_calculada: 0.18,
                        existe_continuidad: true
                      };
                      setFormData({ ...formData, puntos_evaluacion: [...formData.puntos_evaluacion, newPunto] });
                    }}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Punto de Medición</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {formData.puntos_evaluacion.map((punto, pIdx) => (
                    <div key={punto.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-mono font-bold flex items-center justify-center text-xs">
                            {punto.no_punto}
                          </span>
                          <span className="font-bold text-slate-800 text-xs">
                            No. Punto: {punto.no_punto} - Ubicación: {punto.ubicacion_punto}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <select
                            value={punto.tipo_conexion}
                            onChange={e => {
                              const copy = [...formData.puntos_evaluacion];
                              copy[pIdx].tipo_conexion = e.target.value as 'Conexión a Tierra' | 'Pararrayos';
                              setFormData({ ...formData, puntos_evaluacion: copy });
                            }}
                            className="bg-white border border-slate-200 rounded p-1 text-xs font-bold text-emerald-800"
                          >
                            <option value="Conexión a Tierra">Conexión a Tierra</option>
                            <option value="Pararrayos">Pararrayos</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => {
                              const copy = formData.puntos_evaluacion.filter(p => p.id !== punto.id);
                              setFormData({ ...formData, puntos_evaluacion: copy });
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* DATOS DEL PUNTO */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-600 mb-1">Fuente Asociada:</label>
                          <input
                            type="text"
                            value={punto.fuente}
                            onChange={e => {
                              const copy = [...formData.puntos_evaluacion];
                              copy[pIdx].fuente = e.target.value;
                              setFormData({ ...formData, puntos_evaluacion: copy });
                            }}
                            placeholder="ej. Estructura Metálica"
                            className="w-full bg-white border border-slate-200 rounded p-1.5"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 mb-1">Ubicación del Punto:</label>
                          <input
                            type="text"
                            value={punto.ubicacion_punto}
                            onChange={e => {
                              const copy = [...formData.puntos_evaluacion];
                              copy[pIdx].ubicacion_punto = e.target.value;
                              setFormData({ ...formData, puntos_evaluacion: copy });
                            }}
                            placeholder="ej. Oficina 2"
                            className="w-full bg-white border border-slate-200 rounded p-1.5"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 mb-1">¿Área Cerrada?:</label>
                          <select
                            value={punto.es_area_cerrada ? 'Sí' : 'No'}
                            onChange={e => {
                              const copy = [...formData.puntos_evaluacion];
                              copy[pIdx].es_area_cerrada = e.target.value === 'Sí';
                              setFormData({ ...formData, puntos_evaluacion: copy });
                            }}
                            className="w-full bg-white border border-slate-200 rounded p-1.5"
                          >
                            <option value="No">No</option>
                            <option value="Sí">Sí</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-600 mb-1">% Humedad Relativa:</label>
                          <input
                            type="text"
                            value={punto.humedad_relativa}
                            onChange={e => {
                              const copy = [...formData.puntos_evaluacion];
                              copy[pIdx].humedad_relativa = e.target.value;
                              setFormData({ ...formData, puntos_evaluacion: copy });
                            }}
                            placeholder="ej. 45%"
                            className="w-full bg-white border border-slate-200 rounded p-1.5"
                          />
                        </div>
                      </div>

                      {/* LECTURAS Y RESISTENCIA */}
                      <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-3 text-xs">
                        <div className="flex justify-between items-center font-bold text-slate-700 border-b pb-1 font-mono">
                          <span>EVALUACIÓN DEL NIVEL DE RESISTENCIA (MÉTODO CAÍDA DE POTENCIAL)</span>
                          <span className="text-emerald-700">Ubicación Electrodo C2: {punto.ubicacion_electrodo_c2}</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                          {[
                            { key: 'm1', label: '1m' },
                            { key: 'm4', label: '4m' },
                            { key: 'm7', label: '7m' },
                            { key: 'm10', label: '10m' },
                            { key: 'm13', label: '13m' },
                            { key: 'm16', label: '16m' },
                            { key: 'm19', label: '19m' }
                          ].map(d => (
                            <div key={d.key} className="text-center bg-slate-50 p-2 rounded border border-slate-100">
                              <span className="text-[10px] text-slate-500 font-mono block">P1 @ {d.label}</span>
                              <input
                                type="number"
                                step="0.01"
                                value={punto.lecturas_p1[d.key as keyof typeof punto.lecturas_p1]}
                                onChange={e => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const copy = [...formData.puntos_evaluacion];
                                  copy[pIdx].lecturas_p1 = {
                                    ...copy[pIdx].lecturas_p1,
                                    [d.key]: val
                                  };
                                  setFormData({ ...formData, puntos_evaluacion: copy });
                                }}
                                className="w-full border border-slate-200 rounded text-center font-mono font-bold text-xs p-1 mt-1"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                          <span className="font-bold text-slate-700">Caída de Tensión / Resistencia Obtenida:</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.01"
                              value={punto.caida_tension_calculada}
                              onChange={e => {
                                const copy = [...formData.puntos_evaluacion];
                                copy[pIdx].caida_tension_calculada = parseFloat(e.target.value) || 0;
                                setFormData({ ...formData, puntos_evaluacion: copy });
                              }}
                              className="w-24 border border-emerald-300 rounded p-1 text-center font-mono font-bold text-emerald-800 bg-emerald-50"
                            />
                            <span className="font-bold text-slate-800">Ω</span>
                          </div>
                        </div>
                      </div>

                      {/* DATOS DE PARARRAYOS SI APLICA */}
                      {punto.tipo_conexion === 'Pararrayos' && (
                        <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2 text-xs">
                          <div className="font-bold text-amber-900 font-mono">DATOS DEL PARARRAYOS (EN CASO DE SER LA FUENTE)</div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div>
                              <span className="text-[10px] text-amber-800 block">Altura (m):</span>
                              <input
                                type="text"
                                value={punto.pararrayos_datos?.altura_m || '18m'}
                                onChange={e => {
                                  const copy = [...formData.puntos_evaluacion];
                                  copy[pIdx].pararrayos_datos = {
                                    ...(copy[pIdx].pararrayos_datos || { altura_m: '18m', angulo_proteccion: '45°', material_fabricacion: 'Cobre', tipo_sistema: 'Faraday' }),
                                    altura_m: e.target.value
                                  };
                                  setFormData({ ...formData, puntos_evaluacion: copy });
                                }}
                                className="w-full bg-white border border-amber-200 rounded p-1"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-amber-800 block">Ángulo de Protección:</span>
                              <input
                                type="text"
                                value={punto.pararrayos_datos?.angulo_proteccion || '45°'}
                                onChange={e => {
                                  const copy = [...formData.puntos_evaluacion];
                                  copy[pIdx].pararrayos_datos = {
                                    ...(copy[pIdx].pararrayos_datos || { altura_m: '18m', angulo_proteccion: '45°', material_fabricacion: 'Cobre', tipo_sistema: 'Faraday' }),
                                    angulo_proteccion: e.target.value
                                  };
                                  setFormData({ ...formData, puntos_evaluacion: copy });
                                }}
                                className="w-full bg-white border border-amber-200 rounded p-1"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-amber-800 block">Material de Fabricación:</span>
                              <input
                                type="text"
                                value={punto.pararrayos_datos?.material_fabricacion || 'Cobre C11000'}
                                onChange={e => {
                                  const copy = [...formData.puntos_evaluacion];
                                  copy[pIdx].pararrayos_datos = {
                                    ...(copy[pIdx].pararrayos_datos || { altura_m: '18m', angulo_proteccion: '45°', material_fabricacion: 'Cobre', tipo_sistema: 'Faraday' }),
                                    material_fabricacion: e.target.value
                                  };
                                  setFormData({ ...formData, puntos_evaluacion: copy });
                                }}
                                className="w-full bg-white border border-amber-200 rounded p-1"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-amber-800 block">Tipo de Sistema:</span>
                              <input
                                type="text"
                                value={punto.pararrayos_datos?.tipo_sistema || 'Faraday Dipolo'}
                                onChange={e => {
                                  const copy = [...formData.puntos_evaluacion];
                                  copy[pIdx].pararrayos_datos = {
                                    ...(copy[pIdx].pararrayos_datos || { altura_m: '18m', angulo_proteccion: '45°', material_fabricacion: 'Cobre', tipo_sistema: 'Faraday' }),
                                    tipo_sistema: e.target.value
                                  };
                                  setFormData({ ...formData, puntos_evaluacion: copy });
                                }}
                                className="w-full bg-white border border-amber-200 rounded p-1"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* EVALUACIÓN DE CONTINUIDAD */}
                      <div className="flex justify-between items-center bg-emerald-50/60 border border-emerald-200 p-2.5 rounded-xl text-xs">
                        <span className="font-bold text-emerald-900">¿Existe continuidad eléctrica en el sistema?</span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800">
                            <input
                              type="radio"
                              name={`cont_${punto.id}`}
                              checked={punto.existe_continuidad}
                              onChange={() => {
                                const copy = [...formData.puntos_evaluacion];
                                copy[pIdx].existe_continuidad = true;
                                setFormData({ ...formData, puntos_evaluacion: copy });
                              }}
                            />
                            <span>Sí (Cumple)</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer font-bold text-slate-800">
                            <input
                              type="radio"
                              name={`cont_${punto.id}`}
                              checked={!punto.existe_continuidad}
                              onChange={() => {
                                const copy = [...formData.puntos_evaluacion];
                                copy[pIdx].existe_continuidad = false;
                                setFormData({ ...formData, puntos_evaluacion: copy });
                              }}
                            />
                            <span>No (Falla)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BOTONES DE NAVEGACIÓN Y GUARDADO */}
            <div className="flex justify-between items-center border-t border-slate-100 pt-4">
              <button
                type="button"
                disabled={currentStage === 1}
                onClick={() => setCurrentStage(prev => Math.max(1, prev - 1))}
                className={`px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  currentStage === 1 ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400' : 'bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Etapa Anterior</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Borrador</span>
                </button>

                {currentStage < 5 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStage(prev => Math.min(5, prev + 1))}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Siguiente Etapa</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSaveForm(true)}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Finalizar y Guardar en Historial</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* VISTA 3: EXPEDIENTE OFICIAL DE REPORTE (F1PAL22-01 / F1PAL22-03) */}
      {activeView === 'detail' && selectedEval && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* BARRA DE ACCIONES DEL EXPEDIENTE */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2 text-xs">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Vista previa de Expediente Oficial: <strong>{selectedEval.id}</strong> ({selectedEval.no_proyecto})</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / Exportar PDF</span>
              </button>

              <button
                onClick={() => handleEdit(selectedEval)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Formulario</span>
              </button>
            </div>
          </div>

          {/* DOCUMENTO IMPRESO CON FORMATO EXACTO F1PAL22-01 / F1PAL22-03 */}
          <div className="bg-white border border-slate-300 rounded-xl p-8 shadow-xl space-y-6 text-slate-800 font-sans max-w-5xl mx-auto printable-area">
            {/* ENCABEZADO OFICIAL CON LOGOTIPO */}
            <div className="border-2 border-slate-800 text-xs">
              <div className="grid grid-cols-12 border-b-2 border-slate-800 items-center divide-x-2 divide-slate-800">
                <div className="col-span-3 p-3 text-center flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1 font-bold text-emerald-700 text-sm tracking-tighter">
                    <Zap className="w-5 h-5 text-emerald-600 fill-emerald-600" />
                    <span>ASP/EcH&S</span>
                  </div>
                  <span className="text-[8px] text-slate-500 uppercase leading-tight mt-0.5">Tecnología Ambiental Aplicada a la Industria, S.A. de C.V.</span>
                </div>
                <div className="col-span-6 p-2 text-center space-y-1">
                  <div className="font-bold text-sm tracking-tight uppercase">TECNOLOGÍA AMBIENTAL APLICADA A LA INDUSTRIA, S. A. DE C. V.</div>
                  <div className="font-bold text-xs text-slate-900 uppercase">
                    Título: Reconocimiento y Evaluación de resistencias y Continuidades (Tierras Físicas)
                  </div>
                </div>
                <div className="col-span-3 p-2 text-center space-y-1 bg-slate-50">
                  <div className="font-mono font-bold text-sm">F1PAL22-01</div>
                  <div className="text-[10px] text-slate-600 font-mono">Revisión: 2022-04-14</div>
                </div>
              </div>

              <div className="grid grid-cols-12 divide-x-2 divide-slate-800 bg-slate-100 font-mono text-xs border-b border-slate-800">
                <div className="col-span-3 p-2 font-bold">No de Proyecto:</div>
                <div className="col-span-3 p-2 font-bold text-emerald-900">{selectedEval.no_proyecto}</div>
                <div className="col-span-3 p-2 font-bold">Fecha de Muestreo:</div>
                <div className="col-span-3 p-2 font-bold text-slate-800">{selectedEval.fecha_informe}</div>
              </div>
            </div>

            {/* SECCIÓN I: DATOS GENERALES */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 font-mono text-sm border-b border-slate-400 pb-1 uppercase">
                I. DATOS GENERALES Y CARACTERÍSTICAS DE LA EMPRESA
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 bg-slate-50 p-3 border border-slate-200 rounded">
                <div><strong>Razón Social:</strong> {selectedEval.razon_social}</div>
                <div><strong>Nombre Comercial:</strong> {selectedEval.nombre_comercial}</div>
                <div><strong>Giro:</strong> {selectedEval.giro}</div>
                <div><strong>RFC:</strong> {selectedEval.rfc}</div>
                <div><strong>Domicilio Fiscal:</strong> {selectedEval.domicilio_fiscal}</div>
                <div><strong>Domicilio Físico:</strong> {selectedEval.domicilio_fisico}</div>
                <div><strong>Teléfono:</strong> {selectedEval.telefono}</div>
                <div><strong>Contacto:</strong> {selectedEval.reportar_a} ({selectedEval.puesto_contacto})</div>
                <div className="col-span-2 pt-1 border-t border-slate-200">
                  <strong>Descripción del Proceso:</strong> {selectedEval.descripcion_proceso}
                </div>
              </div>
            </div>

            {/* SECCIÓN II: FUENTES GENERADORAS DE ELECTRICIDAD ESTÁTICA */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 font-mono text-sm border-b border-slate-400 pb-1 uppercase">
                IV. CLASIFICACIÓN Y CUANTIFICACIÓN DE FUENTES GENERADORAS DE ELECTRICIDAD ESTÁTICA
              </div>
              <table className="w-full border-collapse border border-slate-800 text-[11px]">
                <thead className="bg-slate-200 font-mono text-slate-800">
                  <tr>
                    <th className="border border-slate-800 p-1.5 text-left">TIPO DE FUENTE GENERADORA</th>
                    <th className="border border-slate-800 p-1.5 text-center w-20">CANTIDAD</th>
                    <th className="border border-slate-800 p-1.5 text-left">LISTADO DE FUENTES</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEval.fuentes_generadoras.map((fg, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="border border-slate-800 p-1.5">{fg.categoria}</td>
                      <td className="border border-slate-800 p-1.5 text-center font-mono font-bold">{fg.cantidad}</td>
                      <td className="border border-slate-800 p-1.5 font-mono">{fg.listado_fuentes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SECCIÓN III: EQUIPOS DE MUESTREO Y VERIFICACIÓN METROLÓGICA */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 font-mono text-sm border-b border-slate-400 pb-1 uppercase">
                VI. EQUIPO(S) DE MUESTREO Y REGISTRO DE PATRONES
              </div>
              <div className="grid grid-cols-3 gap-3 text-[11px]">
                <div className="border border-slate-300 p-2 rounded bg-slate-50 space-y-0.5">
                  <div className="font-bold text-slate-900">Medidor de Resistencia a Tierra:</div>
                  <div>Código: <strong>{selectedEval.medidor_tierra.codigo_interno}</strong></div>
                  <div>Marca: {selectedEval.medidor_tierra.marca}</div>
                  <div>Modelo: {selectedEval.medidor_tierra.modelo} | Serie: {selectedEval.medidor_tierra.no_serie}</div>
                </div>
                <div className="border border-slate-300 p-2 rounded bg-slate-50 space-y-0.5">
                  <div className="font-bold text-slate-900">Multímetro:</div>
                  <div>Código: <strong>{selectedEval.multimetro.codigo_interno}</strong></div>
                  <div>Marca: {selectedEval.multimetro.marca}</div>
                  <div>Modelo: {selectedEval.multimetro.modelo} | Serie: {selectedEval.multimetro.no_serie}</div>
                </div>
                <div className="border border-slate-300 p-2 rounded bg-slate-50 space-y-0.5">
                  <div className="font-bold text-slate-900">Higrómetro:</div>
                  <div>Código: <strong>{selectedEval.higrometro.codigo_interno}</strong></div>
                  <div>Marca: {selectedEval.higrometro.marca}</div>
                  <div>Modelo: {selectedEval.higrometro.modelo} | Serie: {selectedEval.higrometro.no_serie}</div>
                </div>
              </div>
            </div>

            {/* SECCIÓN IV: EVALUACIÓN DE PUNTOS Y CONTINUIDAD */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 font-mono text-sm border-b border-slate-400 pb-1 uppercase">
                EVALUACIÓN DEL NIVEL DE RESISTENCIA Y CONTINUIDAD POR PUNTO
              </div>
              <table className="w-full border-collapse border border-slate-800 text-[10px]">
                <thead className="bg-slate-200 font-mono">
                  <tr>
                    <th className="border border-slate-800 p-1">Punto</th>
                    <th className="border border-slate-800 p-1">Tipo / Fuente</th>
                    <th className="border border-slate-800 p-1">Ubicación</th>
                    <th className="border border-slate-800 p-1">C2</th>
                    <th className="border border-slate-800 p-1">1m</th>
                    <th className="border border-slate-800 p-1">4m</th>
                    <th className="border border-slate-800 p-1">7m</th>
                    <th className="border border-slate-800 p-1">10m</th>
                    <th className="border border-slate-800 p-1">13m</th>
                    <th className="border border-slate-800 p-1">16m</th>
                    <th className="border border-slate-800 p-1">19m</th>
                    <th className="border border-slate-800 p-1">Resistencia (Ω)</th>
                    <th className="border border-slate-800 p-1">Continuidad</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEval.puntos_evaluacion.map((p, idx) => (
                    <tr key={idx} className="text-center font-mono">
                      <td className="border border-slate-800 p-1 font-bold">{p.no_punto}</td>
                      <td className="border border-slate-800 p-1 text-left font-sans">{p.tipo_conexion} ({p.fuente})</td>
                      <td className="border border-slate-800 p-1 text-left font-sans">{p.ubicacion_punto}</td>
                      <td className="border border-slate-800 p-1">{p.ubicacion_electrodo_c2}</td>
                      <td className="border border-slate-800 p-1">{p.lecturas_p1.m1}</td>
                      <td className="border border-slate-800 p-1">{p.lecturas_p1.m4}</td>
                      <td className="border border-slate-800 p-1">{p.lecturas_p1.m7}</td>
                      <td className="border border-slate-800 p-1">{p.lecturas_p1.m10}</td>
                      <td className="border border-slate-800 p-1">{p.lecturas_p1.m13}</td>
                      <td className="border border-slate-800 p-1">{p.lecturas_p1.m16}</td>
                      <td className="border border-slate-800 p-1">{p.lecturas_p1.m19}</td>
                      <td className="border border-slate-800 p-1 font-bold text-emerald-900 bg-emerald-50">{p.caida_tension_calculada} Ω</td>
                      <td className="border border-slate-800 p-1 font-bold text-emerald-800">
                        {p.existe_continuidad ? 'Sí (OK)' : 'No'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SECCIÓN DE FIRMAS DE RESPONSABILIDAD */}
            <div className="grid grid-cols-2 gap-8 pt-8 text-xs text-center font-mono">
              <div className="border-t border-slate-800 pt-2 space-y-1">
                <div className="font-bold">{selectedEval.realizado_por_1} / {selectedEval.realizado_por_2}</div>
                <div className="text-[10px] text-slate-500">REALIZADO POR (INGENIEROS DE CAMPO)</div>
              </div>
              <div className="border-t border-slate-800 pt-2 space-y-1">
                <div className="font-bold">{selectedEval.superviso_por}</div>
                <div className="text-[10px] text-slate-500">SUPERVISÓ (SUPERVISIÓN TÉCNICA Y CALIDAD)</div>
              </div>
            </div>

            {/* PIE DE PÁGINA DE SEGURIDAD NMX-17025 */}
            <div className="border-t border-slate-200 pt-3 text-[9px] text-slate-400 font-mono flex justify-between items-center">
              <span>Sello Digital: {selectedEval.hash_integridad || 'SHA256:AUTHENTICATED_REPORT'}</span>
              <span>Pág. 1 de 5 - F1PAL22-01</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* MODAL DE SCRIPT SQL PARA SUPABASE */}
      {showSqlModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-4 p-6"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                  Script SQL DDL para Supabase / PostgreSQL
                </h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Copie este script DDL y ejecútelo en el <strong>SQL Editor</strong> de Supabase para habilitar la tabla <code className="text-emerald-400 font-mono">tierras_fisicas_evaluaciones</code> con trazabilidad metrológica y el registro inicial de prueba.
            </p>

            <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-emerald-300 max-h-96 overflow-y-auto">
              <pre>{SUPABASE_SQL_SCRIPT}</pre>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-slate-400">
                Formato certificado para NOM-022-STPS / NMX-EC-17025
              </span>

              <button
                onClick={handleCopySql}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {copiedSql ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? '¡Copiado al Portapapeles!' : 'Copiar Código SQL'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
