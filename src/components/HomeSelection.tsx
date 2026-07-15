import React from "react";
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
  HardHat 
} from "lucide-react";
import { motion } from "motion/react";

interface RoleConfig {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  personaId: string; // Map to database persona for demo simulation
}

const ROLES_LIST: RoleConfig[] = [
  {
    id: "ceo",
    name: "CEO",
    icon: Briefcase,
    personaId: "91d1c8ea-c774-4b92-ba78-2dfa938c5f59" // Sofía Méndez
  },
  {
    id: "dir_op",
    name: "Director de Operaciones",
    icon: Cpu,
    personaId: "e88b48f9-4d6d-478a-aef4-4f40d12ea661" // Roberto Fernández
  },
  {
    id: "dir_at_cl",
    name: "Director de Atención a Clientes",
    icon: HeartHandshake,
    personaId: "91d1c8ea-c774-4b92-ba78-2dfa938c5f59" // Sofía Méndez
  },
  {
    id: "ger_tec",
    name: "Gerencia Técnica",
    icon: Wrench,
    personaId: "a6c8b931-e129-450a-8bf8-d30c50d4f128" // Carlos Slim Jr.
  },
  {
    id: "ger_cal",
    name: "Gerencia de Calidad",
    icon: ShieldCheck,
    personaId: "a6c8b931-e129-450a-8bf8-d30c50d4f128" // Carlos Slim Jr.
  },
  {
    id: "coord_lab",
    name: "Coordinación de Laboratorio",
    icon: Layers,
    personaId: "a6c8b931-e129-450a-8bf8-d30c50d4f128" // Carlos Slim Jr.
  },
  {
    id: "ger_lab",
    name: "Gerente Laboratorio",
    icon: Microscope,
    personaId: "a6c8b931-e129-450a-8bf8-d30c50d4f128" // Carlos Slim Jr.
  },
  {
    id: "contabilidad",
    name: "Contabilidad",
    icon: DollarSign,
    personaId: "91d1c8ea-c774-4b92-ba78-2dfa938c5f59" // Sofía Méndez
  },
  {
    id: "jefe_rep",
    name: "Jefe de Reportes",
    icon: ClipboardList,
    personaId: "a6c8b931-e129-450a-8bf8-d30c50d4f128" // Carlos Slim Jr.
  },
  {
    id: "jefe_op",
    name: "Jefe de Operaciones",
    icon: Settings,
    personaId: "a6c8b931-e129-450a-8bf8-d30c50d4f128" // Carlos Slim Jr.
  },
  {
    id: "jefe_alm",
    name: "Jefe de Almacen",
    icon: Package,
    personaId: "a6c8b931-e129-450a-8bf8-d30c50d4f128" // Carlos Slim Jr.
  },
  {
    id: "ing_campo",
    name: "Ingeniero de Campo",
    icon: HardHat,
    personaId: "3cd40182-ef35-42d8-9df2-51c6b12a8844" // Lucía Juárez
  }
];

interface HomeSelectionProps {
  onSelectRole: (roleId: string, personaId: string) => void;
}

export default function HomeSelection({ onSelectRole }: HomeSelectionProps) {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
      
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#85AA1C]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-200/40 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-6xl w-full flex flex-col items-center justify-center relative z-10">
        
        {/* LOGOTIPO CENTRAL & CORPORATIVO */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center text-center mb-10 max-w-2xl"
        >
          <div className="mb-6 flex items-center justify-center">
            <img 
              src="https://appdesignproyectos.com//asplogo.jpg" 
              alt="Logo ASP" 
              className="h-20 md:h-24 w-auto object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight mb-2 uppercase font-mono">
            ASP/EcH&S
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium font-sans uppercase tracking-widest leading-relaxed">
            Análisis & Servicios Profesionales de Ecología, Consultoría, Higiene, & Seguridad Industrial
          </p>
          <div className="h-1 w-16 bg-[#85AA1C] mt-4 rounded-full" />
        </motion.div>

        {/* GRILLA DE SELECCIÓN DE ROLES */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 w-full"
        >
          {ROLES_LIST.map((role, idx) => {
            const IconComponent = role.icon;
            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * idx, duration: 0.5, ease: "easeOut" }}
                onClick={() => onSelectRole(role.id, role.personaId)}
                id={`role-btn-${role.id}`}
                className="group flex flex-col items-center justify-center p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:border-[#85AA1C]/50 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#85AA1C]/40 text-center"
              >
                {/* Icon wrapper */}
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 transition-all duration-300 group-hover:bg-[#85AA1C]/10 group-hover:text-[#85AA1C] mb-4 shadow-sm border border-slate-100 group-hover:border-transparent">
                  <IconComponent className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                </div>

                {/* Role Title */}
                <span className="font-sans text-xs md:text-sm font-semibold text-slate-700 transition-colors duration-300 group-hover:text-slate-900 group-hover:font-bold">
                  {role.name}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Dynamic regulatory conformities footer badge */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex items-center gap-3 text-[10px] text-slate-400 font-mono"
        >
          <span>ACREDITADO EMA</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span>CUMPLIMIENTO NOM-151</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span>SISTEMA DE GESTIÓN DE CALIDAD NMX-17025</span>
        </motion.div>
      </div>
    </div>
  );
}
