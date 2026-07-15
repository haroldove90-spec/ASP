import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authMiddleware";

// Define the hierarchy weight for roles to allow automatic ladder access if desired
const ROLE_HIERARCHY: Record<string, number> = {
  "LAB_TECH": 1,    // Operaciones en Campo
  "LAB_SUP": 3,     // Supervisión Operativa, Calidad, Gestión Técnica
  "DIR_OP": 4,      // Alta Gestión / Director de Operaciones (Aprobación final)
  "SYS_ADMIN": 5    // Alta Gestión / CEO / Administrador de Ciberseguridad y TI
};

/**
 * Middleware to restrict access by checking if the user's role is in the allowed list.
 * Usage: checkRole(['SYS_ADMIN', 'DIR_OP'])
 */
export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "No autorizado: Autenticación requerida antes de verificar privilegios."
      });
    }

    const userRole = req.user.id_rol;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Acceso prohibido (403): Tu perfil actual no cuenta con la autorización requerida.",
        required_roles: allowedRoles,
        user_role: userRole,
        message: `El rol '${userRole}' no tiene permiso para ejecutar esta acción.`
      });
    }

    next();
  };
};

/**
 * Middleware to restrict access based on a minimum role hierarchy level.
 * Usage: checkMinRoleLevel('LAB_SUP') - Allows 'LAB_SUP', 'DIR_OP', 'SYS_ADMIN'
 */
export const checkMinRoleLevel = (minRole: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "No autorizado: Autenticación requerida antes de verificar jerarquía."
      });
    }

    const userRole = req.user.id_rol;
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const minRequiredLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userLevel < minRequiredLevel) {
      return res.status(403).json({
        error: "Acceso prohibido (403): Nivel de jerarquía insuficiente.",
        user_role: userRole,
        min_required: minRole,
        message: `Se requiere nivel jerárquico '${minRole}' o superior. El rol '${userRole}' no cumple con este umbral.`
      });
    }

    next();
  };
};
