import React, { useState } from "react";
import { 
  Briefcase, 
  Cpu, 
  HeartHandshake, 
  Wrench, 
  ShieldCheck, 
  Layers, 
  Microscope, 
  DollarSign, 
  ClipboardList, 
  Settings, 
  Package, 
  HardHat,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Server,
  CloudLightning,
  AlertTriangle,
  CheckCircle2,
  Database,
  ArrowLeft,
  ChevronRight,
  Code,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../supabaseClient";
import { Usuario } from "../initial_data";

interface RoleConfig {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  personaId: string;
  defaultEmail: string;
  puesto: string;
}

const ROLES_LIST: RoleConfig[] = [
  {
    id: "ceo",
    name: "CEO / Alta Dirección",
    icon: Briefcase,
    personaId: "91d1c8ea-c774-4b92-ba78-2dfa938c5f59", // Sofía Méndez
    defaultEmail: "sofia.mendez@aspechs.com.mx",
    puesto: "Coordinador de Ciberseguridad y TI"
  },
  {
    id: "dir_op",
    name: "Director de Operaciones",
    icon: Cpu,
    personaId: "e88b48f9-4d6d-478a-aef4-4f40d12ea661", // Roberto Fernández
    defaultEmail: "roberto.fernandez@aspechs.com.mx",
    puesto: "Director de Operaciones"
  },
  {
    id: "dir_at_cl",
    name: "Director de Atención a Clientes",
    icon: HeartHandshake,
    personaId: "91d1c8ea-c774-4b92-ba78-2dfa938c5f59", // Sofía Méndez
    defaultEmail: "sofia.mendez@aspechs.com.mx",
    puesto: "Coordinador de Ciberseguridad y TI"
  },
  {
    id: "ger_tec",
    name: "Gerencia Técnica",
    icon: Wrench,
    personaId: "a6c8b931-e129-450a-8bf8-d30c50d4f128", // Carlos Slim Jr.
    defaultEmail: "carlos.slim@aspechs.com.mx",
    puesto: "Responsable Técnico del Laboratorio"
  },
  {
    id: "ger_cal",
    name: "Gerencia de Calidad",
    icon: ShieldCheck,
    personaId: "a6c8b931-e129-450a-8bf8-d30c50d4f128", // Carlos Slim Jr.
    defaultEmail: "carlos.slim@aspechs.com.mx",
    puesto: "Responsable Técnico del Laboratorio"
  },
  {
    id: "coord_lab",
    name: "Coordinación de Laboratorio",
    icon: Layers,
    personaId: "a6c8b931-e129-450a-8bf8-d30c50d4f128", // Carlos Slim Jr.
    defaultEmail: "carlos.slim@aspechs.com.mx",
    puesto: "Responsable Técnico del Laboratorio"
  },
  {
    id: "ger_lab",
    name: "Gerente Laboratorio",
    icon: Microscope,
    personaId: "a6c8b931-e129-450a-8bf8-d30c50d4f128", // Carlos Slim Jr.
    defaultEmail: "carlos.slim@aspechs.com.mx",
    puesto: "Responsable Técnico del Laboratorio"
  },
  {
    id: "contabilidad",
    name: "Contabilidad",
    icon: DollarSign,
    personaId: "91d1c8ea-c774-4b92-ba78-2dfa938c5f59", // Sofía Méndez
    defaultEmail: "sofia.mendez@aspechs.com.mx",
    puesto: "Coordinador de Ciberseguridad y TI"
  },
  {
    id: "jefe_rep",
    name: "Jefe de Reportes",
    icon: ClipboardList,
    personaId: "a6c8b931-e129-450a-8bf8-d30c50d4f128", // Carlos Slim Jr.
    defaultEmail: "carlos.slim@aspechs.com.mx",
    puesto: "Responsable Técnico del Laboratorio"
  },
  {
    id: "jefe_op",
    name: "Jefe de Operaciones",
    icon: Settings,
    personaId: "a6c8b931-e129-450a-8bf8-d30c50d4f128", // Carlos Slim Jr.
    defaultEmail: "carlos.slim@aspechs.com.mx",
    puesto: "Responsable Técnico del Laboratorio"
  },
  {
    id: "jefe_alm",
    name: "Jefe de Almacén",
    icon: Package,
    personaId: "a6c8b931-e129-450a-8bf8-d30c50d4f128", // Carlos Slim Jr.
    defaultEmail: "carlos.slim@aspechs.com.mx",
    puesto: "Responsable Técnico del Laboratorio"
  },
  {
    id: "ing_campo",
    name: "Ingeniero de Campo",
    icon: HardHat,
    personaId: "3cd40182-ef35-42d8-9df2-51c6b12a8844", // Lucía Juárez
    defaultEmail: "lucia.juarez@aspechs.com.mx",
    puesto: "Analista Metrólogo Senior"
  },
  {
    id: "sys_admin",
    name: "Administrador del Sistema",
    icon: Settings,
    personaId: "e88b48f9-4d6d-478a-aef4-4f40d12ea661", // Roberto Fernández
    defaultEmail: "roberto.fernandez@aspechs.com.mx",
    puesto: "Director de Operaciones"
  }
];

const PREDEFINED_USERS_MAPPING = [
  {
    id: "e88b48f9-4d6d-478a-aef4-4f40d12ea661",
    nombre: "Roberto Fernández",
    email: "roberto.fernandez@aspechs.com.mx",
    rol: "DIR_OP",
    puesto: "Director de Operaciones",
    firma: "SHA256:f16b23...88ca4192 (e.firma SAT)"
  },
  {
    id: "91d1c8ea-c774-4b92-ba78-2dfa938c5f59",
    nombre: "Sofía Méndez",
    email: "sofia.mendez@aspechs.com.mx",
    rol: "SYS_ADMIN",
    puesto: "Coordinador de Ciberseguridad y TI",
    firma: "SHA256:d89a12...931cb921 (e.firma SAT)"
  },
  {
    id: "a6c8b931-e129-450a-8bf8-d30c50d4f128",
    nombre: "Ing. Carlos Slim Jr.",
    email: "carlos.slim@aspechs.com.mx",
    rol: "LAB_SUP",
    puesto: "Responsable Técnico del Laboratorio",
    firma: "SHA256:a215fe...338eaef4 (e.firma SAT)"
  },
  {
    id: "3cd40182-ef35-42d8-9df2-51c6b12a8844",
    nombre: "Lucía Juárez",
    email: "lucia.juarez@aspechs.com.mx",
    rol: "LAB_TECH",
    puesto: "Analista Metrólogo Senior",
    firma: "SHA256:9cb812...0df63a29 (e.firma SAT)"
  }
];

interface HomeSelectionProps {
  onSelectRole: (roleId: string, personaId: string, loggedInUser?: Usuario) => void;
}

export default function HomeSelection({ onSelectRole }: HomeSelectionProps) {
  const [selectedRoleConfig, setSelectedRoleConfig] = useState<RoleConfig | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("ASPPass2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [connectionMode, setConnectionMode] = useState<"local" | "supabase">("local");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSqlViewer, setShowSqlViewer] = useState(false);

  const getSuggestedUserForRole = (roleId: string) => {
    if (["ceo", "sys_admin", "dir_at_cl", "contabilidad"].includes(roleId)) {
      return PREDEFINED_USERS_MAPPING.find(u => u.rol === "SYS_ADMIN");
    }
    if (roleId === "dir_op") {
      return PREDEFINED_USERS_MAPPING.find(u => u.rol === "DIR_OP");
    }
    if (roleId === "ing_campo") {
      return PREDEFINED_USERS_MAPPING.find(u => u.rol === "LAB_TECH");
    }
    // All other coordinators/managers
    return PREDEFINED_USERS_MAPPING.find(u => u.rol === "LAB_SUP");
  };

  const selectSuggestedUser = (u: typeof PREDEFINED_USERS_MAPPING[0]) => {
    setEmail(u.email);
    setPassword("ASPPass2026!");
    setErrorMessage(null);
  };

  const handleRoleClick = (role: RoleConfig) => {
    setSelectedRoleConfig(role);
    const suggested = getSuggestedUserForRole(role.id);
    if (suggested) {
      setEmail(suggested.email);
    } else {
      setEmail(role.defaultEmail);
    }
    setPassword("ASPPass2026!");
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage("Por favor, ingrese un correo electrónico.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. LOCAL CONNECTION MODE (Demo Simulation)
    if (connectionMode === "local") {
      setTimeout(() => {
        setIsLoading(false);
        const mappedUser = PREDEFINED_USERS_MAPPING.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
        
        if (mappedUser) {
          const matchedUsuario: Usuario = {
            id_usuario: mappedUser.id,
            nombre_completo: mappedUser.nombre,
            email: mappedUser.email,
            id_rol: mappedUser.rol,
            puesto: mappedUser.puesto,
            firma_electronica_fingerprint: mappedUser.firma,
            esta_activo: true,
            ultimo_acceso: new Date().toISOString()
          };

          setSuccessMessage(`¡Acceso local exitoso! Bienvenido ${mappedUser.nombre}.`);
          setTimeout(() => {
            onSelectRole(selectedRoleConfig?.id || matchedUsuario.id_rol, matchedUsuario.id_usuario, matchedUsuario);
          }, 800);
        } else {
          // Allow login as a generic user for testing convenience
          const customName = email.split("@")[0].replace(".", " ");
          const formattedName = customName.charAt(0).toUpperCase() + customName.slice(1);
          
          const guestUsuario: Usuario = {
            id_usuario: `usr-guest-${Date.now()}`,
            nombre_completo: formattedName || "Usuario Invitado",
            email: email.trim().toLowerCase(),
            id_rol: selectedRoleConfig?.id.toUpperCase() || "LAB_TECH",
            puesto: selectedRoleConfig?.puesto || "Consultor de Calidad",
            firma_electronica_fingerprint: `SHA256:GUEST_${Date.now().toString(16)}`,
            esta_activo: true,
            ultimo_acceso: new Date().toISOString()
          };

          setSuccessMessage(`¡Acceso local exitoso (Invitado)!`);
          setTimeout(() => {
            onSelectRole(selectedRoleConfig?.id || guestUsuario.id_rol, guestUsuario.id_usuario, guestUsuario);
          }, 800);
        }
      }, 600);
      return;
    }

    // 2. SUPABASE CLOUD CONNECTION MODE
    try {
      // Query the custom 'usuarios' table for the user profile
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", email.trim().toLowerCase());

      if (error) {
        // Handle case where table is missing or query failed
        if (error.code === "P0001" || error.message?.includes("relation") || error.message?.includes("does not exist")) {
          throw new Error("La tabla 'usuarios' no se encuentra en Supabase. Por favor, corre el script SQL de creación en Supabase SQL Editor para activarlo. Mientras tanto, puedes usar el Modo Local.");
        }
        throw error;
      }

      if (!data || data.length === 0) {
        // User not found in Supabase. Offer an option to insert them to bootstrap test!
        throw new Error("Este correo no está registrado en tu tabla 'usuarios' de Supabase. Asegúrate de correr la sección de inserción de datos (INSERT) en tu Supabase SQL Editor.");
      }

      const userRow = data[0];
      const loggedInUser: Usuario = {
        id_usuario: userRow.id_usuario || `usr-${Date.now()}`,
        nombre_completo: userRow.nombre_completo,
        email: userRow.email,
        id_rol: userRow.id_rol,
        puesto: userRow.puesto || "Usuario Supabase",
        firma_electronica_fingerprint: userRow.firma_electronica_fingerprint || `SHA256:SUPABASE_${Date.now().toString(16)}`,
        esta_activo: userRow.esta_activo !== false,
        ultimo_acceso: new Date().toISOString()
      };

      // Attempt to register/update 'ultimo_acceso' in Supabase silently
      try {
        await supabase
          .from("usuarios")
          .update({ ultimo_acceso: new Date().toISOString() })
          .eq("email", email.trim().toLowerCase());
      } catch (updErr) {
        console.warn("Silent update access timestamp failed:", updErr);
      }

      setSuccessMessage(`¡Autenticación con Supabase Exitosa! Cargando rol autorizado: ${loggedInUser.id_rol}`);
      setTimeout(() => {
        onSelectRole(selectedRoleConfig?.id || loggedInUser.id_rol, loggedInUser.id_usuario, loggedInUser);
      }, 1000);

    } catch (err: any) {
      console.error("Supabase sign in failed:", err);
      setErrorMessage(err.message || "Error desconocido al intentar conectar con la base de datos de Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to trigger database bootstrapping for the user right from the UI
  const handleBootstrapUserInSupabase = async () => {
    if (!email) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const suggested = PREDEFINED_USERS_MAPPING.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || {
        id: "e88b48f9-4d6d-478a-aef4-4f40d12ea661",
        nombre: "Roberto Fernández",
        email: "roberto.fernandez@aspechs.com.mx",
        rol: "DIR_OP",
        puesto: "Director de Operaciones",
        firma: "SHA256:f16b23...88ca4192 (e.firma SAT)"
      };

      // 1. Insert role if not exists
      const { error: rErr } = await supabase.from("roles").upsert({
        id_rol: suggested.rol,
        nombre: selectedRoleConfig?.name || suggested.puesto,
        descripcion: "Perfil autorizado en matriz RBAC de ASP/EcH&S."
      });

      // 2. Insert user profile
      const { error: uErr } = await supabase.from("usuarios").insert({
        id_usuario: suggested.id,
        nombre_completo: suggested.nombre,
        email: suggested.email,
        password_hash: "ASPPass2026!", // raw fallback
        id_rol: suggested.rol,
        puesto: suggested.puesto,
        firma_electronica_fingerprint: suggested.firma,
        esta_activo: true,
        ultimo_acceso: new Date().toISOString()
      });

      if (uErr) throw uErr;

      setSuccessMessage(`¡Se ha creado el usuario '${suggested.nombre}' en tu Supabase con éxito! Ya puedes iniciar sesión.`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`No se pudo crear: ${err.message}. Asegúrate de haber ejecutado la tabla 'roles' y 'usuarios' primero usando el script SQL.`);
    } finally {
      setIsLoading(false);
    }
  };

  const SQL_SCRIPT = `-- =====================================================================
-- SCRIPT DE BASE DE DATOS PARA CONFIGURAR SUPABASE - ASP/EcH&S
-- Copia este script y ejecútalo en la consola SQL Editor de Supabase
-- =====================================================================

-- 1. CREACIÓN DE LA TABLA DE ROLES
CREATE TABLE IF NOT EXISTS roles (
    id_rol VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CREACIÓN DE LA TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    id_rol VARCHAR(50) NOT NULL REFERENCES roles(id_rol),
    puesto VARCHAR(100),
    firma_electronica_fingerprint VARCHAR(128),
    esta_activo BOOLEAN DEFAULT TRUE NOT NULL,
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. SEED DE ROLES PREDEFINIDOS EN SUPABASE
INSERT INTO roles (id_rol, nombre, descripcion) VALUES
('DIR_OP', 'Director de Operaciones', 'Supervisión global de cumplimiento, aprobación de calibraciones y visualización del Audit Trail.')
ON CONFLICT (id_rol) DO UPDATE SET nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion;

INSERT INTO roles (id_rol, nombre, descripcion) VALUES
('SYS_ADMIN', 'Administrador de Sistemas', 'Gestión de usuarios, asignación estricta de roles, auditoría de seguridad informática.')
ON CONFLICT (id_rol) DO UPDATE SET nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion;

INSERT INTO roles (id_rol, nombre, descripcion) VALUES
('LAB_SUP', 'Supervisor de Laboratorio / H&S', 'Aprobación de certificados de calibración, liberación operativa de equipos.')
ON CONFLICT (id_rol) DO UPDATE SET nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion;

INSERT INTO roles (id_rol, nombre, descripcion) VALUES
('LAB_TECH', 'Analista / Técnico de Laboratorio', 'Registro de instrumentos, carga preliminar de certificados, levantamientos en campo.')
ON CONFLICT (id_rol) DO UPDATE SET nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion;

-- 4. SEED DE USUARIOS PREDEFINIDOS EN SUPABASE
INSERT INTO usuarios (id_usuario, nombre_completo, email, password_hash, id_rol, puesto, firma_electronica_fingerprint, esta_activo) VALUES
('e88b48f9-4d6d-478a-aef4-4f40d12ea661', 'Roberto Fernández', 'roberto.fernandez@aspechs.com.mx', 'ASPPass2026!', 'DIR_OP', 'Director de Operaciones', 'SHA256:f16b23087a3296acb03c834a3179df1432f59c8b931e129450ad89a12a', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO usuarios (id_usuario, nombre_completo, email, password_hash, id_rol, puesto, firma_electronica_fingerprint, esta_activo) VALUES
('91d1c8ea-c774-4b92-ba78-2dfa938c5f59', 'Sofía Méndez', 'sofia.mendez@aspechs.com.mx', 'ASPPass2026!', 'SYS_ADMIN', 'Coordinador de Ciberseguridad y TI', 'SHA256:d89a12a3296acb03c834a3179df1432f59c8b931e129450ad89a12a215fe', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO usuarios (id_usuario, nombre_completo, email, password_hash, id_rol, puesto, firma_electronica_fingerprint, esta_activo) VALUES
('a6c8b931-e129-450a-8bf8-d30c50d4f128', 'Ing. Carlos Slim Jr.', 'carlos.slim@aspechs.com.mx', 'ASPPass2026!', 'LAB_SUP', 'Responsable Técnico del Laboratorio', 'SHA256:a215fe338eaef47c8b931e129450ad89a12a215fe338eaef4d89a12a215fe', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO usuarios (id_usuario, nombre_completo, email, password_hash, id_rol, puesto, firma_electronica_fingerprint, esta_activo) VALUES
('3cd40182-ef35-42d8-9df2-51c6b12a8844', 'Lucía Juárez', 'lucia.juarez@aspechs.com.mx', 'ASPPass2026!', 'LAB_TECH', 'Analista Metrólogo Senior', 'SHA256:9cb812087a3296acb03c834a3179df1432f59c8b931e129450ad89a12a215fe', true)
ON CONFLICT (email) DO NOTHING;
`;

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6 md:p-12 relative overflow-y-auto">
      
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#85AA1C]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-200/40 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-6xl w-full flex flex-col items-center justify-center relative z-10 py-6">
        
        {/* Logo and header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center text-center mb-8 max-w-2xl"
        >
          <div className="mb-4 flex items-center justify-center">
            <img 
              src="https://appdesignproyectos.com//asplogo.jpg" 
              alt="Logo ASP" 
              className="h-16 md:h-20 w-auto object-contain rounded-xl shadow-sm"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight mb-1 uppercase font-mono">
            ASP/EcH&S
          </h1>
          <p className="text-[11px] md:text-xs text-slate-500 font-medium font-sans uppercase tracking-widest leading-relaxed">
            Análisis & Servicios Profesionales de Ecología, Consultoría, Higiene, & Seguridad Industrial
          </p>
          <div className="h-1 w-12 bg-[#85AA1C] mt-3 rounded-full" />
        </motion.div>

        <AnimatePresence mode="wait">
          {!selectedRoleConfig ? (
            // MAIN VIEW: ROLES MATRIX SELECTOR
            <motion.div 
              key="roles-selector"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center"
            >
              <div className="text-center mb-6">
                <span className="bg-[#85AA1C]/10 text-[#85AA1C] text-[10px] font-mono uppercase font-extrabold px-3 py-1 rounded-full border border-[#85AA1C]/20 tracking-wider">
                  Acceso al Sistema Multiusuario
                </span>
                <h2 className="text-base font-bold text-slate-700 mt-2">
                  Seleccione su función para acceder al formulario de firma digital
                </h2>
              </div>

              {/* Roles Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                {ROLES_LIST.map((role, idx) => {
                  const IconComponent = role.icon;
                  return (
                    <motion.button
                      key={role.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.03 * idx, duration: 0.4, ease: "easeOut" }}
                      onClick={() => handleRoleClick(role)}
                      id={`role-btn-${role.id}`}
                      className="group flex flex-col items-center justify-center p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-[#85AA1C]/40 hover:-translate-y-0.5 focus:outline-none text-center"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 transition-all duration-200 group-hover:bg-[#85AA1C]/10 group-hover:text-[#85AA1C] mb-3 border border-slate-100">
                        <IconComponent className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                      </div>
                      <span className="font-sans text-xs font-bold text-slate-700 group-hover:text-slate-900 leading-tight">
                        {role.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Toggle script SQL button */}
              <button
                onClick={() => setShowSqlViewer(!showSqlViewer)}
                className="mt-8 flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors duration-200 shadow-sm cursor-pointer"
              >
                <Code className="w-4 h-4 text-[#85AA1C]" />
                <span>{showSqlViewer ? "Ocultar Script SQL para Supabase" : "Ver Script SQL para Supabase"}</span>
              </button>
            </motion.div>
          ) : (
            // FORM VIEW: PORTAL ACCESS CARD
            <motion.div
              key="access-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl shadow-xl p-6 md:p-8 relative"
            >
              {/* Back button */}
              <button
                onClick={() => setSelectedRoleConfig(null)}
                className="absolute top-6 left-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors duration-200 text-slate-600 cursor-pointer"
                title="Volver"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center mb-6 pt-2">
                <div className="w-12 h-12 rounded-2xl bg-[#85AA1C]/10 text-[#85AA1C] flex items-center justify-center mb-3">
                  {React.createElement(selectedRoleConfig.icon, { className: "w-6 h-6" })}
                </div>
                <h2 className="text-lg font-bold text-slate-800 text-center uppercase tracking-tight">
                  Formulario de Acceso
                </h2>
                <span className="text-xs text-slate-500 font-medium px-3 py-1 bg-slate-50 border border-slate-100 rounded-full mt-1.5 font-mono">
                  {selectedRoleConfig.name}
                </span>
              </div>

              {/* Connection Mode Selector */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setConnectionMode("local");
                    setErrorMessage(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                    connectionMode === "local"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Server className="w-3.5 h-3.5 inline mr-1.5" />
                  Modo Local (Demo)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConnectionMode("supabase");
                    setErrorMessage(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                    connectionMode === "supabase"
                      ? "bg-white text-[#85AA1C] shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <CloudLightning className="w-3.5 h-3.5 inline mr-1.5" />
                  Supabase (Producción)
                </button>
              </div>

              {/* Suggestion User Section */}
              <div className="mb-6 bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
                <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono tracking-wider mb-2">
                  Usuario Oficial Sugerido para esta función:
                </span>
                {(() => {
                  const suggested = getSuggestedUserForRole(selectedRoleConfig.id);
                  if (!suggested) return <p className="text-xs text-slate-500">Ningún usuario configurado.</p>;
                  return (
                    <button
                      type="button"
                      onClick={() => selectSuggestedUser(suggested)}
                      className="w-full flex items-center justify-between p-2.5 bg-white border border-slate-200 hover:border-[#85AA1C]/40 rounded-xl hover:bg-[#85AA1C]/5 transition-all text-left group cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-700 group-hover:text-slate-900">{suggested.nombre}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{suggested.email}</div>
                      </div>
                      <span className="text-[9px] bg-slate-100 group-hover:bg-[#85AA1C]/20 group-hover:text-[#85AA1C] text-slate-600 font-bold px-2 py-0.5 rounded-md font-mono">
                        Usar
                      </span>
                    </button>
                  );
                })()}
              </div>

              {/* Login form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Correo Electrónico Oficial:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@aspechs.com.mx"
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] focus:border-[#85AA1C] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Contraseña de Acceso:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] focus:border-[#85AA1C] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex gap-2.5 items-start text-xs text-red-600 leading-normal">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    <div className="space-y-2">
                      <p>{errorMessage}</p>
                      {connectionMode === "supabase" && !errorMessage.includes("Este correo no") && (
                        <button
                          type="button"
                          onClick={handleBootstrapUserInSupabase}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-[10px] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
                        >
                          <Database className="w-3 h-3" />
                          <span>Crear este perfil sugerido en mi Supabase ahora</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Success Banner */}
                {successMessage && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex gap-2.5 items-center text-xs text-emerald-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <p>{successMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#85AA1C] hover:bg-[#739418] disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Iniciar Sesión en el Portal</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SQL Script Accordion */}
        <AnimatePresence>
          {showSqlViewer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl mt-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#85AA1C]" />
                  <span className="text-xs font-mono font-bold text-slate-300">SUPABASE POSTGRESQL DDL SCRIPT</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(SQL_SCRIPT);
                    alert("¡Script SQL copiado al portapapeles!");
                  }}
                  className="px-2.5 py-1 text-[10px] font-bold text-slate-400 hover:text-white bg-slate-800 rounded-md hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Copiar Código
                </button>
              </div>
              <pre className="p-5 text-[10px] font-mono text-emerald-400 bg-slate-900 overflow-x-auto select-all max-h-72">
                {SQL_SCRIPT}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info badge */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center gap-3 text-[10px] text-slate-400 font-mono"
        >
          <span>ACREDITADO EMA</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span>CUMPLIMIENTO NOM-151</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span>NMX-EC-17025</span>
        </motion.div>
      </div>
    </div>
  );
}
