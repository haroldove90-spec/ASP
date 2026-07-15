import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "asp_ech_s_secured_jwt_secret_key_2026";

// Extend Express Request to include decoded user details
export interface AuthenticatedRequest extends Request {
  user?: {
    id_usuario: string;
    nombre_completo: string;
    email: string;
    id_rol: string;
    puesto: string;
  };
}

/**
 * Middleware to authenticate requests via JWT.
 * Extracts token from 'Authorization: Bearer <token>' header,
 * verifies it using the JWT secret, and injects user info into 'req.user'.
 */
export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "No autorizado: No se proporcionó el token de acceso JWT o el formato del encabezado de autorización es incorrecto (use 'Bearer <TOKEN>')."
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id_usuario: string;
      nombre_completo: string;
      email: string;
      id_rol: string;
      puesto: string;
    };

    req.user = decoded;
    next();
  } catch (error: any) {
    console.error("JWT Verification Failed:", error.message);
    return res.status(401).json({
      error: "Acceso denegado: El token de seguridad JWT es inválido, ha expirado o está corrompido.",
      details: error.message
    });
  }
};
