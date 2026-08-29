export interface MetrologyServiceItem {
  id: string;
  nombre: string;
  norma: string;
  costo_base_punto: number;
  unidad_medida: string; // "Punto de medición", "Muestra", "Estudio integral", "Jornada"
  categoria: 'Higiene Industrial' | 'Medio Ambiente' | 'Seguridad Eléctrica' | 'Laboratorio y Calibración' | 'Especializado';
  descripcion?: string;
  es_personalizado?: boolean;
}

export const INITIAL_METROLOGY_SERVICES: MetrologyServiceItem[] = [
  {
    id: "srv-001",
    nombre: "NOM-011-STPS-2001 (Ruido Industrial - Nivel Sonoro Continuo A)",
    norma: "NOM-011-STPS-2001 / NMX-EC-17025",
    costo_base_punto: 1800,
    unidad_medida: "Punto de medición",
    categoria: "Higiene Industrial",
    descripcion: "Evaluación del nivel sonoro continuo equivalente (NSCE) en áreas de producción y mapeo acústico."
  },
  {
    id: "srv-002",
    nombre: "NOM-025-STPS-2008 (Iluminación y Luxes en Centros de Trabajo)",
    norma: "NOM-025-STPS-2008 / NMX-EC-17025",
    costo_base_punto: 1500,
    unidad_medida: "Punto de medición",
    categoria: "Higiene Industrial",
    descripcion: "Medición de niveles de iluminación (luxes), factor de reflexión y confort visual en puestos de trabajo."
  },
  {
    id: "srv-003",
    nombre: "NOM-015-STPS-2001 (Condiciones Térmicas Elevadas o Abatidas)",
    norma: "NOM-015-STPS-2001",
    costo_base_punto: 2200,
    unidad_medida: "Punto de medición",
    categoria: "Higiene Industrial",
    descripcion: "Evaluación de índice de temperatura de globo y bulbo húmedo (TGBH) y régimen de trabajo-descanso."
  },
  {
    id: "srv-004",
    nombre: "NOM-081-SEMARNAT-1994 (Ruido Perimetral en Fuentes Fijas)",
    norma: "NOM-081-SEMARNAT-1994",
    costo_base_punto: 2800,
    unidad_medida: "Punto perimetral",
    categoria: "Medio Ambiente",
    descripcion: "Medición en linderos del predio industrial en horario diurno y nocturno con patrones acreditados."
  },
  {
    id: "srv-005",
    nombre: "NOM-022-STPS-2015 (Electricidad Estática y Tierras Físicas)",
    norma: "NOM-022-STPS-2015",
    costo_base_punto: 1950,
    unidad_medida: "Electrodo / Punto",
    categoria: "Seguridad Eléctrica",
    descripcion: "Medición de resistencia a tierra física, continuidad de electrodos y verificación de pararrayos."
  },
  {
    id: "srv-006",
    nombre: "NOM-010-STPS-2014 (Agentes Químicos Contaminantes del Medio Ambiente)",
    norma: "NOM-010-STPS-2014",
    costo_base_punto: 3200,
    unidad_medida: "Muestra / Bomba",
    categoria: "Higiene Industrial",
    descripcion: "Muestreo de polvos, humos metálicos, COVs y partículas suspendidas mediante tren de muestreo."
  },
  {
    id: "srv-007",
    nombre: "NOM-024-STPS-2001 (Vibraciones en Cuerpo Entero / Mano-Brazo)",
    norma: "NOM-024-STPS-2001",
    costo_base_punto: 2600,
    unidad_medida: "Puesto de trabajo",
    categoria: "Higiene Industrial",
    descripcion: "Evaluación de aceleración ponderada y exposición a vibraciones en operadores y maquinaria pesada."
  },
  {
    id: "srv-008",
    nombre: "NOM-004-STPS-1999 (Sistemas de Protección en Maquinaria y Equipo)",
    norma: "NOM-004-STPS-1999",
    costo_base_punto: 3500,
    unidad_medida: "Estudio integral",
    categoria: "Especializado",
    descripcion: "Determinación de riesgos potenciales y guardas de seguridad en líneas automatizadas."
  },
  {
    id: "srv-009",
    nombre: "Estudio Especializado de Tierras Físicas y Resistencia a Tierra",
    norma: "NOM-022-STPS-2015 / IEEE 81",
    costo_base_punto: 2100,
    unidad_medida: "Punto de prueba",
    categoria: "Seguridad Eléctrica",
    descripcion: "Pruebas de caída de potencial y resistividad del terreno con telurómetro calibrado."
  },
  {
    id: "srv-010",
    nombre: "Estudio de Calidad de Energía y Análisis de Armónicos",
    norma: "Código de Red 2.0 / IEEE 519",
    costo_base_punto: 4500,
    unidad_medida: "Punto de acometida",
    categoria: "Seguridad Eléctrica",
    descripcion: "Monitoreo de distorsión armónica total (THD), factor de potencia y transitorios eléctricos."
  }
];

const STORAGE_KEY = 'aspechs_services_catalog_v2';

export function getStoredServices(): MetrologyServiceItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading services from localStorage:", e);
  }
  return INITIAL_METROLOGY_SERVICES;
}

export function saveStoredServices(services: MetrologyServiceItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  } catch (e) {
    console.error("Error saving services to localStorage:", e);
  }
}

export function addServiceToCatalog(newSrv: Omit<MetrologyServiceItem, 'id'> & { id?: string }): MetrologyServiceItem[] {
  const current = getStoredServices();
  const serviceWithId: MetrologyServiceItem = {
    ...newSrv,
    id: newSrv.id || `srv-custom-${Date.now()}`,
    es_personalizado: true
  };
  const updated = [serviceWithId, ...current];
  saveStoredServices(updated);
  return updated;
}
