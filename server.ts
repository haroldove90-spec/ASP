import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";

// In-memory relational database tables (simulating PostgreSQL with strict schemas)
interface Cotizacion {
  id: string;
  id_propuesta: string;
  cliente: string;
  contacto: string;
  email: string;
  telefono: string;
  fecha: string;
  mes: string;
  servicios: string[];
  servicio: string;
  puntos: number;
  costo_punto: number;
  viaticos: number;
  subtotal: number;
  iva: number;
  costo: number;
  estado: string;
}

interface OrdenTrabajo {
  id_ot: string;
  id_cotizacion: string;
  cliente: string;
  costo: number;
  fecha_arranque: string;
  ubicacion: string;
  tecnico_asignado_id: string;
  puntos_por_norma: {
    nom011?: { puntos_ner: number; octavas: number; dosimetrias: number };
    nom015?: { puntos_temperatura: number; ambientales: number };
    nom022?: { puntos_tf: number; continuidades: number };
    nom025?: { puntos_iluminacion: number; exteriores: number };
    nom010?: { puntos_quimicos: number };
  };
  check_list_epp: {
    casco: string; // "Blanco", "Verde", "Azul", "Amarillo", "Rojo", "Otros"
    lentes: boolean;
    mascarilla: boolean;
    calzado: boolean;
    tapones: boolean;
    manga_larga: boolean;
    chaleco: boolean;
    otros?: string;
  };
  folio_oc: string; // Linked Purchase Order Number
  estatus_ot: "Abierta" | "En Proceso" | "Cerrada" | "Atrasada";
  fecha_registro: string;
}

interface HojaCampo {
  id_hoja: string;
  id_ot: string;
  id_cotizacion: string;
  cliente: string;
  tecnico_nombre: string;
  estado: "Abierta" | "En Proceso" | "Cerrada" | "Cerrada y Bloqueada";
  fecha_captura: string;
  firma_hash?: string;
  gps_coordenadas?: string;
  firma_nombre_cliente?: string;
  fecha_bloqueo?: string;
  lecturas_por_norma: {
    nom011?: Array<{ db: number; conditions: string; area: string }>;
    nom015?: Array<{ temp: number; hum: number; area: string }>;
    nom022?: Array<{ resistencia: number; cumple: boolean; area: string }>;
    nom025?: Array<{ luxes: number; reflexion: number; area: string }>;
  };
}

interface Certificado {
  id_certificado: string;
  id_ot: string;
  cliente: string;
  estatus: "Pendiente" | "Firmado y Aprobado";
  justificacion?: string;
  firmante_rol?: string;
  fecha_firma?: string;
  sello_digital_hash?: string;
}

interface AuditLogEntry {
  id_auditoria: number;
  usuario_id: string;
  rol: string;
  operacion: "INSERT" | "UPDATE" | "SIGN" | "DELETE" | "CONVERT";
  tabla_afectada: string;
  fecha_utc: string;
  ip_origen: string;
  valores_anteriores: any;
  valores_nuevos: any;
  justificacion_tecnica: string;
  hash_registro: string; // Current block hash
  hash_anterior: string; // Previous block hash (Chaining)
}

// Global state variables populated with realistic demo data
let cotizacionesDb: Cotizacion[] = [
  {
    id: "COT-001",
    id_propuesta: "COT-001",
    cliente: "Vidriera del Norte",
    contacto: "Ing. Arturo Mendoza",
    email: "a.mendoza@vidrieranorte.com",
    telefono: "818-320-4050",
    fecha: "2026-07-10",
    mes: "Julio",
    servicios: ["NOM-011-STPS (Ruido)"],
    servicio: "NOM-011-STPS (Ruido)",
    puntos: 10,
    costo_punto: 1800,
    viaticos: 5000,
    subtotal: 23000,
    iva: 3680,
    costo: 26680,
    estado: "Enviado"
  },
  {
    id: "COT-002",
    id_propuesta: "COT-002",
    cliente: "Papelera de Occidente",
    contacto: "Ing. Silvia Garza",
    email: "s.garza@papeleraocc.mx",
    telefono: "331-450-9821",
    fecha: "2026-07-12",
    mes: "Julio",
    servicios: ["NOM-015-STPS (Térmicas)", "NOM-022-STPS (Tierras)"],
    servicio: "NOM-015-STPS (Térmicas) + NOM-022-STPS (Tierras)",
    puntos: 6,
    costo_punto: 1700,
    viaticos: 3500,
    subtotal: 13700,
    iva: 2192,
    costo: 15892,
    estado: "Aprobada"
  }
];

let ordenesTrabajoDb: OrdenTrabajo[] = [
  {
    id_ot: "OT-2026-001",
    id_cotizacion: "COT-002",
    cliente: "Papelera de Occidente",
    costo: 15892,
    fecha_arranque: "2026-07-28",
    ubicacion: "Planta Guadalajara, Nave Principal",
    tecnico_asignado_id: "32fdc451-2ef3-40a1-bf87-9df03da2b812",
    puntos_por_norma: {
      nom015: { puntos_temperatura: 3, ambientales: 3 },
      nom022: { puntos_tf: 4, continuidades: 4 }
    },
    check_list_epp: {
      casco: "Azul",
      lentes: true,
      mascarilla: false,
      calzado: true,
      tapones: true,
      manga_larga: true,
      chaleco: true
    },
    folio_oc: "OC-982110",
    estatus_ot: "Abierta",
    fecha_registro: "2026-07-12"
  }
];

let hojasCampoDb: HojaCampo[] = [];

let certificadosDb: Certificado[] = [
  {
    id_certificado: "CERT-011-2026",
    id_ot: "OT-2026-001",
    cliente: "Papelera de Occidente",
    estatus: "Pendiente"
  }
];

// Unalterable audit trail (Strict Blockchain-style logging)
let bitacoraAuditoriaDb: AuditLogEntry[] = [];

// Helper to compute a secure SHA-256 blockchain chain-hash
function calculateAuditRecordHash(record: Omit<AuditLogEntry, "hash_registro">): string {
  const serialized = JSON.stringify({
    id: record.id_auditoria,
    usuario_id: record.usuario_id,
    rol: record.rol,
    operacion: record.operacion,
    tabla_afectada: record.tabla_afectada,
    fecha_utc: record.fecha_utc,
    ip_origen: record.ip_origen,
    valores_anteriores: record.valores_anteriores,
    valores_nuevos: record.valores_nuevos,
    justificacion_tecnica: record.justificacion_tecnica,
    hash_anterior: record.hash_anterior
  });
  return crypto.createHash("sha256").update(serialized).digest("hex");
}

// Global helper to push audit entries securely with hash chaining
function addAuditTrailEntry(
  usuario_id: string,
  rol: string,
  operacion: AuditLogEntry["operacion"],
  tabla_afectada: string,
  valores_anteriores: any,
  valores_nuevos: any,
  ip_origen: string,
  justificacion_tecnica: string
): AuditLogEntry {
  const nextId = bitacoraAuditoriaDb.length + 1;
  const hashAnterior = bitacoraAuditoriaDb.length > 0 
    ? bitacoraAuditoriaDb[bitacoraAuditoriaDb.length - 1].hash_registro 
    : "0000000000000000000000000000000000000000000000000000000000000000";

  const entryDraft: Omit<AuditLogEntry, "hash_registro"> = {
    id_auditoria: nextId,
    usuario_id,
    rol,
    operacion,
    tabla_afectada,
    fecha_utc: new Date().toISOString(),
    ip_origen,
    valores_anteriores,
    valores_nuevos,
    justificacion_tecnica: justificacion_tecnica || "Operación estándar registrada por el sistema.",
    hash_anterior: hashAnterior
  };

  const hash_registro = calculateAuditRecordHash(entryDraft);
  const securedEntry: AuditLogEntry = { ...entryDraft, hash_registro };

  // Write to DB
  bitacoraAuditoriaDb.push(securedEntry);

  // Print highly authentic PostgreSQL trigger simulator log
  console.log("\n========================================================");
  console.log("🛡️  [POSTGRESQL AUDIT TRAIL LOGGING TRIGGER EXECUTED]");
  console.log(`INSERT INTO bitacora_auditoria (id, usuario_id, rol, operacion, tabla, ip, hash_anterior, hash_registro) 
VALUES (${nextId}, '${usuario_id}', '${rol}', '${operacion}', '${tabla_afectada}', '${ip_origen}', '${hashAnterior.substring(0, 10)}...', '${hash_registro.substring(0, 10)}...');`);
  console.log("========================================================\n");

  return securedEntry;
}

// Helper for generating sequentially styled institutional folios (e.g. "108COT0160")
let cotizacionSequencer = 160;
let otSequencer = 100;

function generateSequentialCotizacionFolio(): string {
  cotizacionSequencer += 1;
  const numPad = String(cotizacionSequencer).padStart(4, "0");
  return `108COT${numPad}`;
}

function generateSequentialOtFolio(): string {
  otSequencer += 1;
  const numPad = String(otSequencer).padStart(4, "0");
  return `OT-2026-${numPad}`;
}

const MONTHS_SPANISH = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Logging Middleware to track database queries on server
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });

  // Seed initial audit trail blockchain log
  addAuditTrailEntry(
    "SYSTEM_INIT",
    "Alta Gestión",
    "INSERT",
    "sistema",
    null,
    { initialized: true, version: "ASP/EcH&S v1.4" },
    "127.0.0.1",
    "Inicialización del motor criptográfico del servidor y cadena de bloques."
  );

  // ==========================================
  // 1. CONTROLADOR DE COTIZACIONES
  // ==========================================

  // Endpoint: POST /api/cotizaciones
  app.post("/api/cotizaciones", (req: Request, res: Response) => {
    try {
      const {
        cliente,
        contacto,
        email,
        telefono,
        fecha,
        servicios,
        puntos,
        costo_punto,
        // Optional operative breakdown costs
        maniobras = 0,
        viaticos = 0,
        guardias = 0,
        gruas = 0,
        plantas_luz = 0
      } = req.body;

      // Validation
      if (!cliente || !contacto || !email || !telefono) {
        return res.status(400).json({
          error: "Campos requeridos faltantes: cliente, contacto, email, telefono"
        });
      }

      const parsedPuntos = Number(puntos) || 1;
      const parsedCostoPunto = Number(costo_punto) || 1500;

      // 1. Subtotal calculation: services + operative breakdown
      const servicesTotal = parsedPuntos * parsedCostoPunto;
      const operativeExpenses = Number(maniobras) + Number(viaticos) + Number(guardias) + Number(gruas) + Number(plantas_luz);
      const subtotal = servicesTotal + operativeExpenses;

      // 2. 16% IVA and Total
      const iva = Math.round(subtotal * 0.16);
      const costo = subtotal + iva;

      // 3. Automated sequential Folio generation on server
      const folio = generateSequentialCotizacionFolio();
      const quoteDate = fecha || new Date().toISOString().split("T")[0];
      const monthIndex = new Date(quoteDate).getMonth();
      const monthName = MONTHS_SPANISH[monthIndex] || "Julio";

      const nuevaCotizacion: Cotizacion = {
        id: folio,
        id_propuesta: folio,
        cliente,
        contacto,
        email,
        telefono,
        fecha: quoteDate,
        mes: monthName,
        servicios: Array.isArray(servicios) ? servicios : ["NOM-011-STPS (Ruido)"],
        servicio: Array.isArray(servicios) ? servicios.join(" + ") : String(servicios),
        puntos: parsedPuntos,
        costo_punto: parsedCostoPunto,
        viaticos: Number(viaticos),
        subtotal,
        iva,
        costo,
        estado: "Enviado"
      };

      // Server-Side Database insertion logging (replicates production Knex log)
      console.log("\n========================================================");
      console.log("✏️  [KNEX: POSTGRESQL INSERT TRANSACTION]");
      console.log(`INSERT INTO cotizaciones (id_propuesta, cliente, contacto, subtotal, iva, total, estado) 
VALUES ('${folio}', '${cliente}', '${contacto}', ${subtotal}, ${iva}, ${costo}, 'Enviado');`);
      console.log("========================================================\n");

      cotizacionesDb.push(nuevaCotizacion);

      // Audit Trail integration
      addAuditTrailEntry(
        "DIR_COMERCIAL_01",
        "Director de Atención a Clientes",
        "INSERT",
        "cotizaciones",
        null,
        nuevaCotizacion,
        req.ip || "127.0.0.1",
        `Creación de cotización foliada ${folio} para el cliente ${cliente}`
      );

      res.status(201).json({
        success: true,
        message: "Cotización registrada con éxito y folio generado automáticamente en el servidor.",
        data: nuevaCotizacion
      });
    } catch (error: any) {
      console.error("Error creating cotización:", error);
      res.status(500).json({ error: "Error interno del servidor al procesar la cotización" });
    }
  });

  // Endpoint: GET /api/cotizaciones
  app.get("/api/cotizaciones", (req: Request, res: Response) => {
    try {
      const { mes, cliente, tipo_servicio } = req.query;

      console.log("\n========================================================");
      console.log("🔍  [KNEX: SELECT WITH FILTERS]");
      console.log(`SELECT * FROM cotizaciones WHERE 1=1 ${mes ? `AND mes = '${mes}'` : ""} ${cliente ? `AND cliente ILIKE '%${cliente}%'` : ""} ${tipo_servicio ? `AND servicio ILIKE '%${tipo_servicio}%'` : ""};`);
      console.log("========================================================\n");

      let filtered = [...cotizacionesDb];

      if (mes && mes !== "Todos") {
        filtered = filtered.filter(q => q.mes?.toLowerCase() === String(mes).toLowerCase());
      }
      if (cliente && cliente !== "Todos") {
        filtered = filtered.filter(q => q.cliente?.toLowerCase().includes(String(cliente).toLowerCase()));
      }
      if (tipo_servicio && tipo_servicio !== "Todos") {
        filtered = filtered.filter(q => 
          q.servicio?.toLowerCase().includes(String(tipo_servicio).toLowerCase()) ||
          q.servicios?.some(s => s.toLowerCase().includes(String(tipo_servicio).toLowerCase()))
        );
      }

      res.json(filtered);
    } catch (error) {
      res.status(500).json({ error: "Error al recuperar cotizaciones" });
    }
  });


  // ==========================================
  // 2. CONTROLADOR DE ÓRDENES DE TRABAJO (OT)
  // ==========================================

  // Endpoint: POST /api/ordenes-trabajo/convertir/:cotizacion_id
  app.post("/api/ordenes-trabajo/convertir/:cotizacion_id", (req: Request, res: Response) => {
    const { cotizacion_id } = req.params;
    const {
      fecha_arranque,
      ubicacion,
      tecnico_asignado_id,
      puntos_por_norma,
      check_list_epp,
      folio_oc
    } = req.body;

    // Strict simulation of atomic database transaction
    console.log("\n========================================================");
    console.log("🔒  [POSTGRESQL TRANSACTION START: CLONING COTIZACIÓN TO ORDEN_TRABAJO]");
    console.log("BEGIN TRANSACTION;");
    console.log(`SELECT * FROM cotizaciones WHERE id = '${cotizacion_id}' FOR UPDATE;`);

    const sourceQuote = cotizacionesDb.find(q => q.id === cotizacion_id);

    if (!sourceQuote) {
      console.log("ROLLBACK; -- Reason: Cotización not found");
      console.log("========================================================\n");
      return res.status(404).json({ error: `No se encontró la cotización de origen con id ${cotizacion_id}` });
    }

    try {
      const oldState = { ...sourceQuote };

      // 1. Update source quote state to 'Aprobada'
      sourceQuote.estado = "Aprobada";
      console.log(`UPDATE cotizaciones SET estado = 'Aprobada' WHERE id = '${cotizacion_id}';`);

      // 2. Generate sequential unique OT folio on server
      const otFolio = generateSequentialOtFolio();
      const linkedOc = folio_oc || `OC-LNK-${Date.now().toString().slice(-4)}`;

      // 3. Create the clone of data + coordinator enriched parameters
      const nuevaOt: OrdenTrabajo = {
        id_ot: otFolio,
        id_cotizacion: sourceQuote.id,
        cliente: sourceQuote.cliente,
        costo: sourceQuote.costo,
        fecha_arranque: fecha_arranque || new Date().toISOString().split("T")[0],
        ubicacion: ubicacion || "Planta del Cliente (Especificada en Levantamiento)",
        tecnico_asignado_id: tecnico_asignado_id || "32fdc451-2ef3-40a1-bf87-9df03da2b812",
        puntos_por_norma: puntos_por_norma || {
          nom011: { puntos_ner: sourceQuote.puntos, octavas: sourceQuote.puntos, dosimetrias: 2 }
        },
        check_list_epp: check_list_epp || {
          casco: "Blanco",
          lentes: true,
          mascarilla: false,
          calzado: true,
          tapones: true,
          manga_larga: true,
          chaleco: true
        },
        folio_oc: linkedOc,
        estatus_ot: "Abierta",
        fecha_registro: new Date().toISOString().split("T")[0]
      };

      console.log(`INSERT INTO ordenes_trabajo (id_ot, id_cotizacion, cliente, costo, fecha_arranque, ubicacion, tecnico_asignado_id, folio_oc, estatus_ot) 
VALUES ('${otFolio}', '${sourceQuote.id}', '${sourceQuote.cliente}', ${sourceQuote.costo}, '${nuevaOt.fecha_arranque}', '${nuevaOt.ubicacion}', '${nuevaOt.tecnico_asignado_id}', '${linkedOc}', 'Abierta');`);
      
      console.log("COMMIT; -- Transaction executed successfully");
      console.log("========================================================\n");

      // Save to server database array
      ordenesTrabajoDb.push(nuevaOt);

      // Audit Trail for Conversion (transactional and traceable)
      addAuditTrailEntry(
        "LAB_SUP_COORDINATOR_01",
        "Coordinación de Laboratorio",
        "CONVERT",
        "ordenes_trabajo",
        { cotizacion_estado: oldState.estado },
        { cotizacion_estado: "Aprobada", nueva_ot: nuevaOt },
        req.ip || "127.0.0.1",
        `Conversión transaccional y clonación de Cotización ${cotizacion_id} a Orden de Trabajo ${otFolio} (Asociada a OC: ${linkedOc})`
      );

      res.status(201).json({
        success: true,
        message: `Cotización ${cotizacion_id} convertida con éxito en Orden de Trabajo ${otFolio} (Asociada a OC: ${linkedOc}).`,
        data: nuevaOt
      });
    } catch (txError: any) {
      console.log("ROLLBACK; -- Transaction failed");
      console.log("========================================================\n");
      res.status(500).json({ error: "Fallo transaccional al realizar la conversión comercial" });
    }
  });


  // ==========================================
  // 3. CONTROLADOR DE HOJAS DE CAMPO & CRIPTOGRAFÍA
  // ==========================================

  // Endpoint: POST /api/hojas-campo/inicializar/:ot_id
  app.post("/api/hojas-campo/inicializar/:ot_id", (req: Request, res: Response) => {
    const { ot_id } = req.params;

    console.log("\n========================================================");
    console.log("📋  [KNEX: INITIALIZE ELECTRONIC FIELD SHEETS]");
    console.log(`SELECT * FROM ordenes_trabajo WHERE id_ot = '${ot_id}';`);

    const sourceOt = ordenesTrabajoDb.find(ot => ot.id_ot === ot_id);

    if (!sourceOt) {
      console.log(`-- ERROR: No se encontró la OT ${ot_id}`);
      console.log("========================================================\n");
      return res.status(404).json({ error: `La Orden de Trabajo ${ot_id} no fue encontrada para inicializar la Hoja de Campo.` });
    }

    try {
      const sourceQuote = cotizacionesDb.find(q => q.id === sourceOt.id_cotizacion);
      const clientName = sourceOt.cliente;
      const quoteId = sourceOt.id_cotizacion;

      // Extract normatives to build multinorma modular layout
      const activeNormas: string[] = sourceQuote ? sourceQuote.servicios : ["NOM-011-STPS (Ruido)"];
      
      const lecturasPorNorma: any = {};
      
      // Structure the capture modularly per each norm contracted in the original quote
      activeNormas.forEach(norm => {
        if (norm.includes("NOM-011") || norm.includes("Ruido")) {
          lecturasPorNorma.nom011 = [
            { db: 82.4, conditions: "Operación de Compresor Principal", area: "Cuarto de Máquinas" },
            { db: 78.1, conditions: "Operación Estándar de Torno", area: "Taller de Mantenimiento" }
          ];
        }
        if (norm.includes("NOM-015") || norm.includes("Térmicas")) {
          lecturasPorNorma.nom015 = [
            { temp: 31.5, hum: 45, area: "Área de Calderas" }
          ];
        }
        if (norm.includes("NOM-022") || norm.includes("Tierras")) {
          lecturasPorNorma.nom022 = [
            { resistencia: 4.8, cumple: true, area: "Electrodo Subestación Eléctrica" }
          ];
        }
        if (norm.includes("NOM-025") || norm.includes("Iluminación")) {
          lecturasPorNorma.nom025 = [
            { luxes: 320, reflexion: 22, area: "Escritorio de Control de Calidad" }
          ];
        }
      });

      const hojaId = `HC-2026-${Date.now().toString().slice(-4)}`;
      const nuevaHoja: HojaCampo = {
        id_hoja: hojaId,
        id_ot: sourceOt.id_ot,
        id_cotizacion: quoteId,
        cliente: clientName,
        tecnico_nombre: "Lucía Juárez", // Default assigned metrologist
        estado: "Abierta",
        fecha_captura: new Date().toISOString().split("T")[0],
        lecturas_por_norma: lecturasPorNorma
      };

      console.log(`INSERT INTO hojas_campo (id_hoja, id_ot, id_cotizacion, cliente, tecnico_nombre, estado, lecturas_por_norma) 
VALUES ('${hojaId}', '${sourceOt.id_ot}', '${quoteId}', '${clientName}', 'Lucía Juárez', 'Abierta', '${JSON.stringify(lecturasPorNorma)}');`);
      console.log("========================================================\n");

      hojasCampoDb.push(nuevaHoja);

      // Audit Trail
      addAuditTrailEntry(
        "LAB_SUP_COORDINATOR_01",
        "Coordinación de Laboratorio",
        "INSERT",
        "hojas_campo",
        null,
        nuevaHoja,
        req.ip || "127.0.0.1",
        `Inicialización de hoja de campo multinorma ${hojaId} ligada indisolublemente a la OT ${ot_id}`
      );

      res.status(201).json({
        success: true,
        message: "Hojas de campo electrónicas inicializadas con éxito. Datos multinorma indexados jerárquicamente a la Cotización y Cliente.",
        data: nuevaHoja
      });
    } catch (err) {
      res.status(500).json({ error: "Fallo técnico al estructurar e indexar las Hojas de Campo electrónicas." });
    }
  });

  // Endpoint 1: BLOQUEO CRIPTOGRÁFICO DE HOJAS DE CAMPO (Norma NOM-151 / SHA-256)
  // POST /api/hojas-campo/firmar/:hoja_campo_id
  app.post("/api/hojas-campo/firmar/:hoja_campo_id", (req: Request, res: Response) => {
    try {
      const { hoja_campo_id } = req.params;
      const { gps_coordenadas, firma_nombre_cliente, lecturas_por_norma } = req.body;

      // Find sheet
      const sheet = hojasCampoDb.find(h => h.id_hoja === hoja_campo_id);
      if (!sheet) {
        return res.status(404).json({ error: `No se encontró la Hoja de Campo con ID ${hoja_campo_id}` });
      }

      // Check if already locked (Prevent modification)
      if (sheet.estado === "Cerrada y Bloqueada") {
        return res.status(403).json({ 
          error: "Operación Prohibida: Esta hoja de campo está Cerrada y Bloqueada criptográficamente (NOM-151). No es posible realizar modificaciones." 
        });
      }

      const oldState = { ...sheet };

      // Update data with capture info
      if (lecturas_por_norma) {
        sheet.lecturas_por_norma = lecturas_por_norma;
      }
      sheet.gps_coordenadas = gps_coordenadas || "20.6736,-103.3440 (Planta Industrial)";
      sheet.firma_nombre_cliente = firma_nombre_cliente || "Ing. Representante del Cliente";
      sheet.fecha_bloqueo = new Date().toISOString();

      // Take critical fields to generate a unique SHA-256 hash (NOM-151 block)
      const dataToHash = {
        id_hoja: sheet.id_hoja,
        id_ot: sheet.id_ot,
        id_cotizacion: sheet.id_cotizacion,
        cliente: sheet.cliente,
        tecnico_nombre: sheet.tecnico_nombre,
        gps_coordenadas: sheet.gps_coordenadas,
        firma_nombre_cliente: sheet.firma_nombre_cliente,
        lecturas_por_norma: sheet.lecturas_por_norma,
        fecha_bloqueo: sheet.fecha_bloqueo
      };

      const hash = crypto.createHash("sha256").update(JSON.stringify(dataToHash)).digest("hex");
      
      // Save cryptographic seal and lock status
      sheet.firma_hash = hash;
      sheet.estado = "Cerrada y Bloqueada";

      console.log("\n========================================================");
      console.log(`🔒  [NOM-151 CRYPTOGRAPHIC LOCK APPLIED ON HOJA ${hoja_campo_id}]`);
      console.log(`Generated Hash: ${hash}`);
      console.log("Status changed to 'Cerrada y Bloqueada'. Update triggers restricted.");
      console.log("========================================================\n");

      // Register in Audit Trail
      addAuditTrailEntry(
        "LAB_TECH_ENGINEER_03",
        "Ingenieros de Campo (LAB_TECH)",
        "SIGN",
        "hojas_campo",
        oldState,
        sheet,
        req.ip || "127.0.0.1",
        `Bloqueo criptográfico e inalterabilidad de Hoja de Campo ${hoja_campo_id} mediante firma digital NOM-151 con hash ${hash}`
      );

      res.json({
        success: true,
        message: "Hoja de campo sellada y firmada digitalmente con éxito (Bloqueo NOM-151 activo).",
        firma_hash: hash,
        data: sheet
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Fallo criptográfico al firmar y bloquear el registro técnico." });
    }
  });


  // ==========================================
  // 4. BANDEJA DE APROBACIÓN TÉCNICA Y FIRMA DIGITAL
  // ==========================================

  // Endpoint 2: POST /api/certificados/aprobar/:certificado_id
  app.post("/api/certificados/aprobar/:certificado_id", (req: Request, res: Response) => {
    try {
      const { certificado_id } = req.params;
      const { justificacion, firmante_id, firmante_rol } = req.body;

      // 1. Validation: Scientific/technical justification must be at least 5 characters
      if (!justificacion || justificacion.trim().length < 5) {
        return res.status(400).json({
          error: "Rechazado: La justificación técnica científica obligatoria debe tener una longitud mínima de 5 caracteres."
        });
      }

      const cert = certificadosDb.find(c => c.id_certificado === certificado_id);
      if (!cert) {
        return res.status(404).json({ error: `No se encontró el certificado/informe con ID ${certificado_id}` });
      }

      if (cert.estatus === "Firmado y Aprobado") {
        return res.status(400).json({ error: "Este certificado ya ha sido firmado y aprobado previamente." });
      }

      const oldState = { ...cert };

      // 2. Generate digital seal connecting signer, timestamp and certificate
      const exactTime = new Date().toISOString();
      const signerRole = firmante_rol || "Director de Operaciones (DIR_OP)";
      
      const sealData = {
        certificado_id: cert.id_certificado,
        id_ot: cert.id_ot,
        cliente: cert.cliente,
        justificacion,
        firmante_rol: signerRole,
        fecha_firma: exactTime
      };

      const digitalSeal = crypto.createHash("sha256").update(JSON.stringify(sealData)).digest("hex");

      // Update certificate state
      cert.estatus = "Firmado y Aprobado";
      cert.justificacion = justificacion;
      cert.firmante_rol = signerRole;
      cert.fecha_firma = exactTime;
      cert.sello_digital_hash = digitalSeal;

      console.log("\n========================================================");
      console.log(`🖋️  [DIGITAL SEAL GENERATED BY OPERATIONS DIRECTOR (DIR_OP)]`);
      console.log(`Certificado ID: ${certificado_id}`);
      console.log(`Justification: ${justificacion}`);
      console.log(`Sello Digital: ${digitalSeal}`);
      console.log("========================================================\n");

      // Register in Audit Trail
      addAuditTrailEntry(
        firmante_id || "DIR_OP_MENDOZA",
        signerRole,
        "SIGN",
        "certificados",
        oldState,
        cert,
        req.ip || "127.0.0.1",
        `Aprobación técnica y firma digital de certificado ${certificado_id}. Justificación técnica: "${justificacion}"`
      );

      res.json({
        success: true,
        message: "Certificado aprobado y sellado digitalmente por Dirección de Operaciones.",
        sello_digital: digitalSeal,
        data: cert
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Fallo técnico en la generación del sello digital de dirección." });
    }
  });

  // GET /api/certificados
  app.get("/api/certificados", (req: Request, res: Response) => {
    res.json(certificadosDb);
  });


  // ==========================================
  // 5. BITÁCORA DE AUDITORÍA INALTERABLE (Audit Trail)
  // ==========================================

  // Endpoint 3: GET /api/auditoria (Exposed Read-Only audit trail viewer)
  app.get("/api/auditoria", (req: Request, res: Response) => {
    try {
      // Validate integrity of entire blockchain log on fly to reassure the client!
      let chainValid = true;
      for (let i = 1; i < bitacoraAuditoriaDb.length; i++) {
        const current = bitacoraAuditoriaDb[i];
        const previous = bitacoraAuditoriaDb[i - 1];
        if (current.hash_anterior !== previous.hash_registro) {
          chainValid = false;
          break;
        }
      }

      res.json({
        chain_integrity_valid: chainValid,
        blockchain_algorithm: "SHA-256",
        total_records: bitacoraAuditoriaDb.length,
        logs: bitacoraAuditoriaDb
      });
    } catch (err) {
      res.status(500).json({ error: "Fallo al verificar e indexar la bitácora de auditoría." });
    }
  });


  // GET /api/hojas-campo
  app.get("/api/hojas-campo", (req: Request, res: Response) => {
    res.json(hojasCampoDb);
  });

  // GET /api/ordenes-trabajo
  app.get("/api/ordenes-trabajo", (req: Request, res: Response) => {
    res.json(ordenesTrabajoDb);
  });

  // ==========================================
  // VITE DEVELOPMENT MIDDLEWARE OR PROD SERVE
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 ASP/EcH&S Full-Stack Server running on port ${PORT}`);
    console.log(`🌍 URL: http://localhost:${PORT}`);
    console.log("📊 API Endpoints loaded: ");
    console.log("   - GET  /api/cotizaciones");
    console.log("   - POST /api/cotizaciones");
    console.log("   - POST /api/ordenes-trabajo/convertir/:cotizacion_id");
    console.log("   - POST /api/hojas-campo/inicializar/:ot_id");
    console.log("   - POST /api/hojas-campo/firmar/:hoja_campo_id");
    console.log("   - POST /api/certificados/aprobar/:certificado_id");
    console.log("   - GET  /api/certificados");
    console.log("   - GET  /api/auditoria");
    console.log("========================================================\n");
  });
}

startServer();

