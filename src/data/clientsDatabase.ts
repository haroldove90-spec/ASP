export interface ClientContact {
  id: string;
  nombre: string;
  puesto: string; // ej: "Gerente de EHS", "Jefe de Compras", "Director de Planta", "Contabilidad"
  email: string;
  telefono: string;
  es_principal?: boolean;
  incluir_en_envio?: boolean; // toggle en cotización
  enviar_cotizacion?: boolean; // alias para compatibilidad
}

export interface ClientRecord {
  id: string; // "CLI-001"
  numero_cliente: number; // 1
  razon_social: string;
  rfc: string;
  direccion: string;
  calle?: string;
  numero?: string;
  colonia?: string;
  cp?: string;
  municipio?: string;
  estado_republica?: string;
  sector: string;
  estado: 'Activo' | 'Prospecto' | 'Inactivo';
  pipeline_stage?: 'lead' | 'contacted' | 'quoted' | 'negotiation' | 'won' | 'lost';
  fecha_registro: string;
  contactos: ClientContact[];
  contacto_nombre?: string;
  contacto_email?: string;
  contacto_telefono?: string;
  notas?: string;
}

export const INITIAL_CLIENTS_DATABASE: ClientRecord[] = [
  {
    id: "CLI-001",
    numero_cliente: 1,
    razon_social: "Aceros de México S.A. de C.V.",
    rfc: "AME840315TQ2",
    direccion: "Av. Churubusco 450, Col. Fierro, C.P. 64590, Monterrey, N.L.",
    calle: "Av. Churubusco",
    numero: "450",
    colonia: "Fierro",
    cp: "64590",
    municipio: "Monterrey",
    estado_republica: "Nuevo León",
    sector: "Siderúrgico / Metalmecánico",
    estado: "Activo",
    pipeline_stage: "won",
    fecha_registro: "2026-01-15",
    contactos: [
      {
        id: "cnt-001-1",
        nombre: "Ing. Juan Gómez Garza",
        puesto: "Gerente de Seguridad e Higiene (EHS)",
        email: "jgomez@acerosdemexico.com.mx",
        telefono: "811-555-0199",
        es_principal: true,
        incluir_en_envio: true
      },
      {
        id: "cnt-001-2",
        nombre: "Lic. Maricela Cárdenas",
        puesto: "Jefa de Compras y Licitaciones",
        email: "compras@acerosdemexico.com.mx",
        telefono: "811-555-0120",
        es_principal: false,
        incluir_en_envio: true
      },
      {
        id: "cnt-001-3",
        nombre: "Ing. Roberto Cavazos",
        puesto: "Superintendente de Mantenimiento y Planta",
        email: "rcavazos@acerosdemexico.com.mx",
        telefono: "811-555-0145",
        es_principal: false,
        incluir_en_envio: false
      }
    ]
  },
  {
    id: "CLI-002",
    numero_cliente: 2,
    razon_social: "Farmacéutica del Norte S.A. de C.V.",
    rfc: "FNO920711PL9",
    direccion: "Parque Industrial Stiva 102, C.P. 66600, Apodaca, N.L.",
    calle: "Parque Industrial Stiva",
    numero: "102",
    colonia: "Parque Stiva",
    cp: "66600",
    municipio: "Apodaca",
    estado_republica: "Nuevo León",
    sector: "Farmacéutico / Cuartos Limpios",
    estado: "Activo",
    pipeline_stage: "quoted",
    fecha_registro: "2026-02-20",
    contactos: [
      {
        id: "cnt-002-1",
        nombre: "Dra. Laura Ortega Mendoza",
        puesto: "Directora de Aseguramiento de Calidad",
        email: "lortega@farmadelnorte.mx",
        telefono: "818-444-2233",
        es_principal: true,
        incluir_en_envio: true
      },
      {
        id: "cnt-002-2",
        nombre: "C.P. Fernando Saldaña",
        puesto: "Coordinador de Cuentas por Pagar y Facturación",
        email: "pagos@farmadelnorte.mx",
        telefono: "818-444-2288",
        es_principal: false,
        incluir_en_envio: true
      }
    ]
  },
  {
    id: "CLI-003",
    numero_cliente: 3,
    razon_social: "Alimentos Procesados Bajío S.A.",
    rfc: "APB100220UY3",
    direccion: "Blvd. Adolfo López Mateos 15, C.P. 37000, León, Gto.",
    calle: "Blvd. Adolfo López Mateos",
    numero: "15",
    colonia: "Centro Industrial",
    cp: "37000",
    municipio: "León",
    estado_republica: "Guanajuato",
    sector: "Alimentos y Bebidas",
    estado: "Prospecto",
    pipeline_stage: "lead",
    fecha_registro: "2026-04-10",
    contactos: [
      {
        id: "cnt-003-1",
        nombre: "Lic. Pedro Torres Valdés",
        puesto: "Gerente de Operaciones y EHS",
        email: "ptorres@alimentosbajio.mx",
        telefono: "477-987-6543",
        es_principal: true,
        incluir_en_envio: true
      },
      {
        id: "cnt-003-2",
        nombre: "Ing. Claudia Mireles",
        puesto: "Coordinadora de Seguridad y Medio Ambiente",
        email: "cmireles@alimentosbajio.mx",
        telefono: "477-987-6510",
        es_principal: false,
        incluir_en_envio: true
      }
    ]
  },
  {
    id: "CLI-004",
    numero_cliente: 4,
    razon_social: "Refinería Tuxpan S.A. de C.V.",
    rfc: "RTU750403KL8",
    direccion: "Zona Industrial Lote 4, C.P. 92800, Tuxpan, Ver.",
    calle: "Zona Industrial",
    numero: "Lote 4",
    colonia: "Puerto Industrial",
    cp: "92800",
    municipio: "Tuxpan",
    estado_republica: "Veracruz",
    sector: "Petroquímico y Energía",
    estado: "Activo",
    pipeline_stage: "won",
    fecha_registro: "2026-05-02",
    contactos: [
      {
        id: "cnt-004-1",
        nombre: "Ing. Carlos Ruiz Alarcón",
        puesto: "Superintendente de Seguridad de Procesos",
        email: "cruiz@refineriatuxpan.com",
        telefono: "783-111-2233",
        es_principal: true,
        incluir_en_envio: true
      },
      {
        id: "cnt-004-2",
        nombre: "Lic. Patricia Navarrete",
        puesto: "Gerente de Contratos y Adquisiciones",
        email: "pnavarrete@refineriatuxpan.com",
        telefono: "783-111-2299",
        es_principal: false,
        incluir_en_envio: true
      }
    ]
  },
  {
    id: "CLI-005",
    numero_cliente: 5,
    razon_social: "Vidriera del Norte S.A. de C.V.",
    rfc: "VNO880912JK1",
    direccion: "Av. Los Ángeles 1200, San Nicolás de los Garza, N.L.",
    calle: "Av. Los Ángeles",
    numero: "1200",
    colonia: "Industrial San Nicolás",
    cp: "66400",
    municipio: "San Nicolás de los Garza",
    estado_republica: "Nuevo León",
    sector: "Vidrio y Empaque",
    estado: "Activo",
    pipeline_stage: "won",
    fecha_registro: "2026-06-01",
    contactos: [
      {
        id: "cnt-005-1",
        nombre: "Ing. Sergio Elizondo",
        puesto: "Gerente de Planta y Mantenimiento",
        email: "selizondo@vidrieranorte.com",
        telefono: "818-333-5500",
        es_principal: true,
        incluir_en_envio: true
      },
      {
        id: "cnt-005-2",
        nombre: "Lic. Gabriela Montemayor",
        puesto: "Jefa de Seguridad Industrial",
        email: "gmontemayor@vidrieranorte.com",
        telefono: "818-333-5522",
        es_principal: false,
        incluir_en_envio: true
      }
    ]
  }
];

const CLIENTS_STORAGE_KEY = 'aspechs_clients_list_v2';

export function getStoredClients(): ClientRecord[] {
  try {
    const saved = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure every client has contacts array
        return parsed.map((c: any, index: number) => {
          let contactos = c.contactos;
          if (!contactos || !Array.isArray(contactos) || contactos.length === 0) {
            contactos = [
              {
                id: `cnt-${c.id || index}-1`,
                nombre: c.contacto_nombre || "Contacto Principal",
                puesto: "Representante Comercial",
                email: c.contacto_email || "contacto@cliente.com",
                telefono: c.contacto_telefono || "811-000-0000",
                es_principal: true,
                incluir_en_envio: true
              },
              {
                id: `cnt-${c.id || index}-2`,
                nombre: "Departamento de Compras",
                puesto: "Adquisiciones",
                email: c.contacto_email ? `compras.${c.contacto_email}` : "compras@cliente.com",
                telefono: c.contacto_telefono || "811-000-0000",
                es_principal: false,
                incluir_en_envio: true
              }
            ];
          }
          return {
            ...c,
            numero_cliente: c.numero_cliente || (index + 1),
            contactos
          };
        });
      }
    }
  } catch (e) {
    console.error("Error loading clients from localStorage:", e);
  }
  return INITIAL_CLIENTS_DATABASE;
}

export function saveStoredClients(clients: ClientRecord[]): void {
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
  } catch (e) {
    console.error("Error saving clients to localStorage:", e);
  }
}

export function updateClientContacts(clientIdOrNum: string, updatedContacts: ClientContact[]): ClientRecord[] {
  const current = getStoredClients();
  const updated = current.map(c => {
    const isMatch = c.id === clientIdOrNum || 
                    String(c.numero_cliente) === String(clientIdOrNum) || 
                    c.razon_social.toLowerCase().includes(clientIdOrNum.toLowerCase());
    if (isMatch) {
      return {
        ...c,
        contactos: updatedContacts,
        contacto_nombre: updatedContacts[0]?.nombre || c.contacto_nombre,
        contacto_email: updatedContacts[0]?.email || c.contacto_email,
        contacto_telefono: updatedContacts[0]?.telefono || c.contacto_telefono
      };
    }
    return c;
  });
  saveStoredClients(updated);
  return updated;
}
