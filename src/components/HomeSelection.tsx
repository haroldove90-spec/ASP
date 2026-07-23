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
import { DB_SCHEMA_SQL } from "../db_schema_sql";
import { Usuario } from "../initial_data";
import { downloadCredentialsPdf } from "../utils/credentialsPdf";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "10000000-0000-4000-8000-" + Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

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
    personaId: "",
    defaultEmail: "",
    puesto: "CEO"
  },
  {
    id: "dir_op",
    name: "Director de Operaciones",
    icon: Cpu,
    personaId: "e88b48f9-4d6d-478a-aef4-4f40d12ea661",
    defaultEmail: "roberto.fernandez@aspechs.com.mx",
    puesto: "Director de Operaciones"
  },
  {
    id: "dir_at_cl",
    name: "Director de Atención a Clientes",
    icon: HeartHandshake,
    personaId: "01000000-0000-0000-0000-000000000002",
    defaultEmail: "carlos.ayala@aspechs.com.mx",
    puesto: "Director de Atención a Clientes"
  },
  {
    id: "ger_tec",
    name: "Gerencia Técnica",
    icon: Wrench,
    personaId: "01000000-0000-0000-0000-000000000004",
    defaultEmail: "adalberto.ledezma@aspechs.com.mx",
    puesto: "Gerente Técnico"
  },
  {
    id: "ger_cal",
    name: "Gerencia de Calidad",
    icon: ShieldCheck,
    personaId: "01000000-0000-0000-0000-000000000005",
    defaultEmail: "isela.ramos@aspechs.com.mx",
    puesto: "Gerente de Calidad"
  },
  {
    id: "coord_lab",
    name: "Coordinación de Laboratorio",
    icon: Layers,
    personaId: "01000000-0000-0000-0000-000000000008",
    defaultEmail: "mauricio.cordoba@aspechs.com.mx",
    puesto: "Coordinador de Laboratorio"
  },
  {
    id: "ger_lab",
    name: "Gerente Laboratorio",
    icon: Microscope,
    personaId: "01000000-0000-0000-0000-000000000008",
    defaultEmail: "mauricio.cordoba@aspechs.com.mx",
    puesto: "Coordinador de Laboratorio"
  },
  {
    id: "contabilidad",
    name: "Contabilidad",
    icon: DollarSign,
    personaId: "91d1c8ea-c774-4b92-ba78-2dfa938c5f59",
    defaultEmail: "alejandro.torres@aspechs.com.mx",
    puesto: "Coordinador de Ciberseguridad y TI"
  },
  {
    id: "jefe_rep",
    name: "Jefe de Reportes",
    icon: ClipboardList,
    personaId: "01000000-0000-0000-0000-000000000006",
    defaultEmail: "jasiel.navarro@aspechs.com.mx",
    puesto: "Gerente de Reportes"
  },
  {
    id: "jefe_op",
    name: "Jefe de Operaciones",
    icon: Settings,
    personaId: "01000000-0000-0000-0000-000000000009",
    defaultEmail: "juan.gallegos@aspechs.com.mx",
    puesto: "Gerente de Operaciones"
  },
  {
    id: "jefe_alm",
    name: "Jefe de Almacén",
    icon: Package,
    personaId: "01000000-0000-0000-0000-000000000007",
    defaultEmail: "abraham.navarro@aspechs.com.mx",
    puesto: "Jefe de Almacén"
  },
  {
    id: "ing_campo",
    name: "Ingeniero de Campo",
    icon: HardHat,
    personaId: "01000000-0000-0000-0000-000000000010",
    defaultEmail: "gerardo.sanchez@aspechs.com.mx",
    puesto: "Ingeniero en Fuentes Fijas"
  },
  {
    id: "sys_admin",
    name: "Administrador del Sistema",
    icon: Settings,
    personaId: "91d1c8ea-c774-4b92-ba78-2dfa938c5f59",
    defaultEmail: "alejandro.torres@aspechs.com.mx",
    puesto: "Coordinador de Ciberseguridad y TI"
  }
];

const PREDEFINED_USERS_MAPPING = [
  {
    id: "01000000-0000-0000-0000-000000000001",
    nombre: "Ing. Daniel Treviño Reyes",
    email: "daniel.trevino@aspechs.com.mx",
    rol: "ceo",
    puesto: "CEO",
    firma: "SHA256:CEO_DT_88129A (e.firma SAT)",
    password: "DanielT2026!"
  },
  {
    id: "01000000-0000-0000-0000-000000000002",
    nombre: "Lic. Carlos Ayala",
    email: "carlos.ayala@aspechs.com.mx",
    rol: "dir_at_cl",
    puesto: "Director de Atención a Clientes",
    firma: "SHA256:DAC_CA_22910B (e.firma SAT)",
    password: "CarlosA2026!"
  },
  {
    id: "e88b48f9-4d6d-478a-aef4-4f40d12ea661",
    nombre: "Lic. Roberto Fernández Alanís",
    email: "roberto.fernandez@aspechs.com.mx",
    rol: "dir_op",
    puesto: "Director de Operaciones",
    firma: "SHA256:f16b23...88ca4192 (e.firma SAT)",
    password: "RobertoF2026!"
  },
  {
    id: "01000000-0000-0000-0000-000000000004",
    nombre: "Ing. Adalberto Ledezma",
    email: "adalberto.ledezma@aspechs.com.mx",
    rol: "ger_tec",
    puesto: "Gerente Técnico",
    firma: "SHA256:GT_AL_91032C (e.firma SAT)",
    password: "AdalbertoL2026!"
  },
  {
    id: "01000000-0000-0000-0000-000000000005",
    nombre: "Bio. Isela Ramos Lozano",
    email: "isela.ramos@aspechs.com.mx",
    rol: "ger_cal",
    puesto: "Gerente de Calidad",
    firma: "SHA256:GC_IR_10293D (e.firma SAT)",
    password: "IselaR2026!"
  },
  {
    id: "01000000-0000-0000-0000-000000000006",
    nombre: "Ing. Jasiel Navarro",
    email: "jasiel.navarro@aspechs.com.mx",
    rol: "jefe_rep",
    puesto: "Gerente de Reportes",
    firma: "SHA256:JR_JN_40210E (e.firma SAT)",
    password: "JasielN2026!"
  },
  {
    id: "01000000-0000-0000-0000-000000000007",
    nombre: "Abraham Navarro",
    email: "abraham.navarro@aspechs.com.mx",
    rol: "jefe_alm",
    puesto: "Jefe de Almacén",
    firma: "SHA256:JA_AN_50321F (e.firma SAT)",
    password: "AbrahamN2026!"
  },
  {
    id: "01000000-0000-0000-0000-000000000008",
    nombre: "Ing. Mauricio Iván Córdoba",
    email: "mauricio.cordoba@aspechs.com.mx",
    rol: "coord_lab",
    puesto: "Coordinador de Laboratorio",
    firma: "SHA256:CL_MC_60432A (e.firma SAT)",
    password: "MauricioC2026!"
  },
  {
    id: "01000000-0000-0000-0000-000000000009",
    nombre: "Ing. Juan José Gallegos",
    email: "juan.gallegos@aspechs.com.mx",
    rol: "jefe_op",
    puesto: "Gerente de Operaciones",
    firma: "SHA256:JO_JG_70543B (e.firma SAT)",
    password: "JuanG2026!"
  },
  {
    id: "01000000-0000-0000-0000-000000000010",
    nombre: "Ing. Gerardo Daniel Sánchez",
    email: "gerardo.sanchez@aspechs.com.mx",
    rol: "ing_campo",
    puesto: "Ingeniero en Fuentes Fijas",
    firma: "SHA256:IC_GS_80654C (e.firma SAT)",
    password: "GerardoS2026!"
  },
  {
    id: "01000000-0000-0000-0000-000000000011",
    nombre: "Ing. Andrés Manuel Gómez",
    email: "andres.gomez@aspechs.com.mx",
    rol: "ing_campo",
    puesto: "Ingeniero en Fuentes Fijas",
    firma: "SHA256:IC_AG_90765D (e.firma SAT)",
    password: "AndresG2026!"
  },
  {
    id: "01000000-0000-0000-0000-000000000012",
    nombre: "Ing. Carlos Sánchez Leal",
    email: "carlos.sanchez@aspechs.com.mx",
    rol: "ing_campo",
    puesto: "Ingeniero en Fuentes Fijas",
    firma: "SHA256:IC_CS_10876E (e.firma SAT)",
    password: "CarlosS2026!"
  },
  {
    id: "01000000-0000-0000-0000-000000000013",
    nombre: "Ing. Roberto Paulino Hdz",
    email: "roberto.paulino@aspechs.com.mx",
    rol: "ing_campo",
    puesto: "Ingeniero en Ambiente Laboral",
    firma: "SHA256:IC_RP_20987F (e.firma SAT)",
    password: "RobertoP2026!"
  },
  {
    id: "01000000-0000-0000-0000-000000000014",
    nombre: "Ing. Francisco Cupil",
    email: "francisco.cupil@aspechs.com.mx",
    rol: "ing_campo",
    puesto: "Ingeniero en Termo y OSP",
    firma: "SHA256:IC_FC_31098A (e.firma SAT)",
    password: "FranciscoC2026!"
  },
  {
    id: "01000000-0000-0000-0000-000000000015",
    nombre: "Ing. Misael Baltasar",
    email: "misael.baltasar@aspechs.com.mx",
    rol: "ing_campo",
    puesto: "Ingeniero en Termo y OSP",
    firma: "SHA256:IC_MB_42109B (e.firma SAT)",
    password: "MisaelB2026!"
  },
  {
    id: "01000000-0000-0000-0000-000000000016",
    nombre: "Ing. Natalia Alfaro",
    email: "natalia.alfaro@aspechs.com.mx",
    rol: "ing_campo",
    puesto: "Ingeniero en Termo y OSP",
    firma: "SHA256:IC_NA_53210C (e.firma SAT)",
    password: "NataliaA2026!"
  },
  {
    id: "01000000-0000-0000-0000-000000000017",
    nombre: "Ing. Baltazar",
    email: "baltazar.hdz@aspechs.com.mx",
    rol: "ing_campo",
    puesto: "Ingeniero en Ambiente Laboral",
    firma: "SHA256:IC_IB_64321D (e.firma SAT)",
    password: "BaltazarH2026!"
  },
  {
    id: "91d1c8ea-c774-4b92-ba78-2dfa938c5f59",
    nombre: "Alejandro Torres",
    email: "alejandro.torres@aspechs.com.mx",
    rol: "sys_admin",
    puesto: "Coordinador de Ciberseguridad y TI",
    firma: "SHA256:d89a12...931cb921 (e.firma SAT)",
    password: "ASPPass2026!"
  },
  {
    id: "77000000-0000-0000-0000-000000000099",
    nombre: "Ing. Harold Anguiano",
    email: "harold.anguiano@aspechs.com.mx",
    rol: "sys_admin",
    puesto: "Administrador del Sistema (sys_admin)",
    firma: "SHA256:HA_99810A_ADMIN (e.firma SAT)",
    password: "Chevropar#1970"
  }
];

interface HomeSelectionProps {
  onSelectRole: (roleId: string, personaId: string, loggedInUser?: Usuario) => void;
}

export default function HomeSelection({ onSelectRole }: HomeSelectionProps) {
  const [selectedRoleConfig, setSelectedRoleConfig] = useState<RoleConfig | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [connectionMode, setConnectionMode] = useState<"local" | "supabase">("local");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSqlViewer, setShowSqlViewer] = useState(false);

  // User Registration State
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerNombre, setRegisterNombre] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPuesto, setRegisterPuesto] = useState("");
  const [registerRole, setRegisterRole] = useState("ing_campo");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerNombre.trim()) {
      setErrorMessage("Por favor, ingrese su nombre completo.");
      return;
    }
    if (!registerEmail.trim()) {
      setErrorMessage("Por favor, ingrese su correo electrónico.");
      return;
    }
    if (!registerPuesto.trim()) {
      setErrorMessage("Por favor, ingrese su cargo o puesto.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const newUserId = generateUUID();
    const newUser: Usuario = {
      id_usuario: newUserId,
      nombre_completo: registerNombre.trim(),
      email: registerEmail.trim().toLowerCase(),
      id_rol: registerRole,
      puesto: registerPuesto.trim(),
      firma_electronica_fingerprint: `SHA256:REG_${Math.random().toString(16).slice(2, 10).toUpperCase()} (e.firma SAT)`,
      esta_activo: true,
      ultimo_acceso: new Date().toISOString()
    };

    if (connectionMode === "local") {
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMessage("¡Usuario registrado con éxito localmente!");
        setTimeout(() => {
          onSelectRole(registerRole, newUserId, newUser);
        }, 1000);
      }, 800);
      return;
    }

    try {
      // If we attempt Supabase registration
      const roleObj = ROLES_LIST.find(r => r.id === registerRole);
      try {
        await supabase.from("roles").upsert({
          id_rol: registerRole,
          nombre: roleObj?.name || "Rol Personalizado",
          descripcion: "Rol registrado dinámicamente."
        });
      } catch (rErr) {
        console.warn("Could not upsert role to Supabase:", rErr);
      }

      const { error: insertErr } = await supabase.from("usuarios").insert({
        id_usuario: newUserId,
        nombre_completo: newUser.nombre_completo,
        email: newUser.email,
        password_hash: registerPassword,
        id_rol: registerRole,
        puesto: newUser.puesto,
        firma_electronica_fingerprint: newUser.firma_electronica_fingerprint,
        esta_activo: true,
        ultimo_acceso: new Date().toISOString()
      });

      if (insertErr) throw insertErr;

      setSuccessMessage("¡Usuario registrado con éxito en Supabase!");
      setTimeout(() => {
        onSelectRole(registerRole, newUserId, newUser);
      }, 1000);
    } catch (err: any) {
      console.error("Error registering in Supabase:", err);
      setSuccessMessage("¡Registrado localmente (Supabase no configurado o sin tabla)!");
      setTimeout(() => {
        onSelectRole(registerRole, newUserId, newUser);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestedUserForRole = (roleId: string) => {
    const matching = PREDEFINED_USERS_MAPPING.filter(u => u.rol === roleId);
    if (matching.length > 0) return matching[0];
    
    // Fallbacks
    if (["ceo", "sys_admin", "dir_at_cl", "contabilidad"].includes(roleId)) {
      return PREDEFINED_USERS_MAPPING.find(u => u.rol === "sys_admin");
    }
    if (roleId === "dir_op") {
      return PREDEFINED_USERS_MAPPING.find(u => u.rol === "dir_op");
    }
    if (roleId === "ing_campo") {
      return PREDEFINED_USERS_MAPPING.find(u => u.rol === "ing_campo");
    }
    return PREDEFINED_USERS_MAPPING.find(u => u.rol === "ger_tec") || PREDEFINED_USERS_MAPPING[0];
  };

  const selectSuggestedUser = (u: typeof PREDEFINED_USERS_MAPPING[0]) => {
    setEmail(u.email);
    setPassword(u.password || "ASPPass2026!");
    setErrorMessage(null);
  };

  const handleRoleClick = (role: RoleConfig) => {
    setSelectedRoleConfig(role);
    setEmail("");
    setPassword("");
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
        const searchEmail = email.trim().toLowerCase();
        const mappedUser = PREDEFINED_USERS_MAPPING.find(u => 
          u.email.toLowerCase() === searchEmail || 
          u.email.split('@')[0].toLowerCase() === searchEmail
        );
        
        if (mappedUser) {
          const correctPassword = mappedUser.password || "ASPPass2026!";
          if (password !== correctPassword) {
            setErrorMessage("Contraseña de acceso incorrecta. Por favor verifique las credenciales.");
            return;
          }

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
          // Allow guest login ONLY with fallback password
          if (password !== "ASPPass2026!") {
            setErrorMessage("Contraseña de acceso incorrecta. Use la contraseña por defecto para cuentas de invitado: ASPPass2026!");
            return;
          }

          const customName = email.split("@")[0].replace(".", " ");
          const formattedName = customName.charAt(0).toUpperCase() + customName.slice(1);
          
          const guestUsuario: Usuario = {
            id_usuario: generateUUID(),
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
        id_usuario: userRow.id_usuario || generateUUID(),
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

  const SQL_SCRIPT = DB_SCHEMA_SQL;

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

              {/* PDF Download Callout Bar (Ocultado temporalmente por solicitud del usuario) */}
              {false && (
                <div className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/50">
                      <FileText className="w-5 h-5 text-[#85AA1C]" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xs font-bold text-slate-800">Directorio de Personal Autorizado (e.firma)</h3>
                      <p className="text-[11px] text-slate-500">Descargue el archivo PDF con las credenciales de los 17 usuarios oficiales configurados en el sistema.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadCredentialsPdf(PREDEFINED_USERS_MAPPING)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#85AA1C] hover:bg-[#729218] text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Descargar Credenciales (PDF)</span>
                  </button>
                </div>
              )}

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
              key={isRegistering ? "register-form" : "access-form"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl shadow-xl p-6 md:p-8 relative"
            >
              {/* Back button */}
              <button
                onClick={() => {
                  if (isRegistering) {
                    setIsRegistering(false);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  } else {
                    setSelectedRoleConfig(null);
                  }
                }}
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
                  {isRegistering ? "Registro de Usuario" : "Formulario de Acceso"}
                </h2>
                <span className="text-xs text-slate-500 font-medium px-3 py-1 bg-slate-50 border border-slate-100 rounded-full mt-1.5 font-mono">
                  {selectedRoleConfig.name}
                </span>
              </div>

              {!isRegistering ? (
                // 1. LOGIN VIEW
                <>
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

                  {/* Register link */}
                  <div className="text-center mt-5 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                      ¿No tienes una cuenta?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegistering(true);
                          setRegisterNombre("");
                          setRegisterEmail("");
                          setRegisterPuesto(selectedRoleConfig.puesto || "");
                          setRegisterRole(selectedRoleConfig.id);
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="text-[#85AA1C] hover:text-[#739418] font-bold underline focus:outline-none cursor-pointer"
                      >
                        Regístrate aquí
                      </button>
                    </p>
                  </div>
                </>
              ) : (
                // 2. REGISTRATION VIEW
                <>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Nombre Completo:
                      </label>
                      <input
                        type="text"
                        value={registerNombre}
                        onChange={(e) => setRegisterNombre(e.target.value)}
                        placeholder="Ej. Juan Pérez López"
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] focus:border-[#85AA1C] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Correo Electrónico Oficial:
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          placeholder="ejemplo@aspechs.com.mx"
                          required
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] focus:border-[#85AA1C] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Cargo / Puesto de Trabajo:
                      </label>
                      <input
                        type="text"
                        value={registerPuesto}
                        onChange={(e) => setRegisterPuesto(e.target.value)}
                        placeholder="Ej. Coordinador Senior"
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] focus:border-[#85AA1C] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Función / Rol en el Portal:
                      </label>
                      <select
                        value={registerRole}
                        onChange={(e) => {
                          setRegisterRole(e.target.value);
                          const rObj = ROLES_LIST.find(r => r.id === e.target.value);
                          if (rObj) {
                            setRegisterPuesto(rObj.puesto);
                          }
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#85AA1C] focus:border-[#85AA1C] transition-all cursor-pointer"
                      >
                        {ROLES_LIST.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Contraseña de Acceso:
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
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
                        <p>{errorMessage}</p>
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
                          <span>Registrar y Acceder al Sistema</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Back to login link */}
                  <div className="text-center mt-5 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                      ¿Ya tienes una cuenta?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegistering(false);
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="text-[#85AA1C] hover:text-[#739418] font-bold underline focus:outline-none cursor-pointer"
                      >
                        Inicia Sesión aquí
                      </button>
                    </p>
                  </div>
                </>
              )}
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
