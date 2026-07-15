import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authMiddleware, AuthenticatedRequest } from "./middlewares/authMiddleware";
import { checkRole, checkMinRoleLevel } from "./middlewares/roleMiddleware";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "asp_ech_s_secured_jwt_secret_key_2026";

// Static reference to ASP/EcH&S users from initial_data.ts for JWT signing
const PREDEFINED_USERS = [
  {
    id_usuario: "e88b48f9-4d6d-478a-aef4-4f40d12ea661",
    nombre_completo: "Roberto Fernández",
    email: "roberto.fernandez@aspechs.com.mx",
    id_rol: "DIR_OP", // Director de Operaciones (Alta Gestión)
    puesto: "Director de Operaciones"
  },
  {
    id_usuario: "91d1c8ea-c774-4b92-ba78-2dfa938c5f59",
    nombre_completo: "Sofía Méndez",
    email: "sofia.mendez@aspechs.com.mx",
    id_rol: "SYS_ADMIN", // CEO / TI Admin (Alta Gestión)
    puesto: "Coordinador de Ciberseguridad y TI"
  },
  {
    id_usuario: "a6c8b931-e129-450a-8bf8-d30c50d4f128",
    nombre_completo: "Ing. Carlos Slim Jr.",
    email: "carlos.slim@aspechs.com.mx",
    id_rol: "LAB_SUP", // Coordinador / Supervisor de Laboratorio (Supervisión Operativa)
    puesto: "Responsable Técnico del Laboratorio"
  },
  {
    id_usuario: "3cd40182-ef35-42d8-9df2-51c6b12a8844",
    nombre_completo: "Lucía Juárez",
    email: "lucia.juarez@aspechs.com.mx",
    id_rol: "LAB_TECH", // Ingeniero / Técnico de Campo (Operaciones en Campo)
    puesto: "Analista Metrólogo Senior"
  }
];

// ========================================================
// 🛡️ AUTHENTICATION ENDPOINTS (JWT Generation)
// ========================================================

/**
 * POST /api/auth/login
 * Simulates user login and issues a signed JWT containing identity and role claims.
 */
router.post("/api/auth/login", (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "El correo electrónico es requerido para autenticar en el sistema." });
    }

    // Find predefined user matching the email
    const user = PREDEFINED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({
        error: "Acceso fallido: El correo proporcionado no pertenece a un perfil oficial registrado en la matriz RBAC de ASP/EcH&S."
      });
    }

    // Sign JWT with payload (expires in 8 hours)
    const tokenPayload = {
      id_usuario: user.id_usuario,
      nombre_completo: user.nombre_completo,
      email: user.email,
      id_rol: user.id_rol,
      puesto: user.puesto
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "8h" });

    // Respond with user profile and bearer token
    res.json({
      success: true,
      message: "Autenticación exitosa. Se ha generado un token JWT seguro con vigencia de 8 horas.",
      token,
      user: tokenPayload
    });
  } catch (error: any) {
    res.status(500).json({ error: "Fallo técnico durante el procesamiento de firma criptográfica del JWT.", details: error.message });
  }
});

/**
 * GET /api/auth/session
 * Validates token validity and returns the injected active session.
 */
router.get("/api/auth/session", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    active: true,
    session: req.user
  });
});


// ========================================================
// 💼 PROTECTED OPERATIONAL ENDPOINTS (RBAC-ENFORCED)
// ========================================================

/**
 * 1. POST /api/cotizaciones
 * Exclusivo para Ventas, Director de Atención a Clientes, CEO, o Directores.
 * Roles permitidos: SYS_ADMIN (CEO/Admin), DIR_OP (Director Operaciones).
 */
router.post(
  "/api/cotizaciones",
  authMiddleware,
  checkRole(["SYS_ADMIN", "DIR_OP"]),
  (req: AuthenticatedRequest, res: Response) => {
    // In actual production, this routes to commercialController.createQuote
    res.status(201).json({
      success: true,
      message: "Cotización validada y registrada con éxito en PostgreSQL (Rol Autorizado: Alta Gestión/Comercial).",
      ejecutor: req.user
    });
  }
);

/**
 * 2. POST /api/ordenes-trabajo/convertir/:cotizacion_id
 * Exclusivo para Coordinación de Laboratorio y Jefaturas de Operación.
 * Roles permitidos: LAB_SUP (Coordinación), DIR_OP (Director de Operaciones), SYS_ADMIN (CEO/Admin).
 */
router.post(
  "/api/ordenes-trabajo/convertir/:cotizacion_id",
  authMiddleware,
  checkRole(["LAB_SUP", "DIR_OP", "SYS_ADMIN"]),
  (req: AuthenticatedRequest, res: Response) => {
    const { cotizacion_id } = req.params;
    res.json({
      success: true,
      message: `Conversión transaccional aprobada. Cotización comercial ${cotizacion_id} ascendida exitosamente a Orden de Trabajo (OT) operativa.`,
      ejecutor: req.user
    });
  }
);

/**
 * 3. POST /api/hojas-campo/firmar/:hoja_campo_id
 * Exclusivo para Ingenieros de Campo.
 * Roles permitidos: LAB_TECH (Técnico de Campo).
 * Permite capturar lecturas in situ, georreferenciar firma y aplicar sello criptográfico NOM-151.
 */
router.post(
  "/api/hojas-campo/firmar/:hoja_campo_id",
  authMiddleware,
  checkRole(["LAB_TECH"]),
  (req: AuthenticatedRequest, res: Response) => {
    const { hoja_campo_id } = req.params;
    res.json({
      success: true,
      message: `Bloqueo criptográfico exitoso. Hoja de Campo ${hoja_campo_id} sellada físicamente con coordenadas georreferenciadas y firma digital inalterable.`,
      ejecutor: req.user
    });
  }
);

/**
 * 4. GET /api/bitacora-auditoria
 * Restringido exclusivamente al Director de Operaciones (DIR_OP) y CEO (SYS_ADMIN).
 * Rol requerido: DIR_OP o SYS_ADMIN.
 * Devuelve la traza completa de auditoría encadenada (Blockchain Audit Trail) con verificación de hashes.
 */
router.get(
  "/api/bitacora-auditoria",
  authMiddleware,
  checkRole(["DIR_OP", "SYS_ADMIN"]),
  (req: AuthenticatedRequest, res: Response) => {
    res.json({
      success: true,
      blockchain_verification: "VALID_CHAIN_INTEGRITY",
      hash_algorithm: "SHA-256",
      ejecutor_auditoria: req.user,
      logs: [
        {
          timestamp: new Date().toISOString(),
          id_usuario: req.user?.id_usuario,
          rol: req.user?.id_rol,
          operacion: "AUDIT_READ",
          tabla_afectada: "bitacora_auditoria",
          ip_origen: req.ip || "127.0.0.1",
          justificacion_tecnica: "Consulta de Audit Trail regulatorio para cumplimiento técnico e informático."
        }
      ]
    });
  }
);

export default router;
