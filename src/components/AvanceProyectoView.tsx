import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  FileText, 
  Terminal, 
  MonitorCheck, 
  DownloadCloud, 
  Building2, 
  Calendar, 
  ArrowRight,
  Sparkles,
  Package,
  HardDrive,
  Database,
  Server,
  Lock,
  KeyRound
} from 'lucide-react';
import { AmazonasCoatOfArms } from './AmazonasCoatOfArms';
import { ConfiguracionEntidad } from '../types';

interface AvanceProps {
  configuracion: ConfiguracionEntidad;
  onNavigate: (tab: string) => void;
}

export const AvanceProyectoView: React.FC<AvanceProps> = ({ configuracion, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'ejecutivo' | 'arquitectura' | 'normatividad' | 'roadmap' | 'database'>('ejecutivo');

  return (
    <div className="space-y-6">
      
      {/* Hero Executive Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white rounded-3xl p-8 shadow-xl border-4 border-amber-500/80 relative overflow-hidden">
        
        {/* Background decorative glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <AmazonasCoatOfArms size="xl" />
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-emerald-950 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Informe de Avance y Presentación Ejecutiva
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight text-white">
                Sistema Integral de Nómina y Honorarios
              </h1>
              <p className="text-sm text-emerald-100 font-medium">
                Gobernación del Departamento del Amazonas • República de Colombia
              </p>
              <p className="text-xs text-emerald-200/80 max-w-2xl leading-relaxed">
                Liquidación de servidores públicos de planta (con Prima del Amazonas al 18%), cuentas de cobro de contratistas Ley 80, control de acceso autenticado, base de datos local auto-creable y arquitectura preparada para servidor centralizado.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-900/80 border border-amber-400/40 text-center min-w-44">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Estado del Sistema</span>
            <div className="text-3xl font-black text-white font-mono my-1">100%</div>
            <span className="text-[11px] font-bold text-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Operativo Localmente
            </span>
          </div>
        </div>

        {/* Sub navigation pills */}
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-emerald-800/80">
          {[
            { id: 'ejecutivo', label: '1. Resumen Ejecutivo', icon: Award },
            { id: 'arquitectura', label: '2. Arquitectura & Módulos', icon: Cpu },
            { id: 'database', label: '3. Base de Datos & Servidor', icon: Database },
            { id: 'normatividad', label: '4. Cumplimiento Normativo', icon: ShieldCheck },
            { id: 'roadmap', label: '5. Hoja de Ruta & Ejecutable', icon: HardDrive },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isSel
                    ? 'bg-amber-400 text-emerald-950 shadow-md scale-105'
                    : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Resumen Ejecutivo */}
      {activeTab === 'ejecutivo' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-700" />
              Objetivos Cumplidos y Beneficios para el Departamento
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed">
              El Sistema Local de Nómina de la Gobernación del Amazonas resuelve de manera definitiva la complejidad del cálculo salarial territorial y contractual en la región:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="font-bold text-emerald-950 text-xs block mb-1">
                  ⚡ Automatización de Prima Amazonas (18%)
                </span>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Cálculo automático y sin margen de error del 18% sobre la asignación proporcional, respetando el régimen territorial amazónico.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                <span className="font-bold text-amber-950 text-xs block mb-1">
                  ⚖️ Control de Cuentas de Cobro Ley 80
                </span>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Generación de cuentas con IBC mínimo al 40%, retención en la fuente (10%/11%) y estampillas departamentales (2.5%).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200">
                <span className="font-bold text-teal-950 text-xs block mb-1">
                  📊 Carga Masiva Inteligente Excel/CSV
                </span>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Procesamiento ágil con validación de columnas y detección de duplicados por número de cédula o contrato.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 text-xs block mb-1">
                  🔐 Control de Acceso & Base de Datos Auto-Creable
                </span>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Módulo de login institucional y creación automática de la base de datos al dar clic en el ejecutable, sin configuraciones complejas.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 text-sm font-serif">Credenciales de Acceso</h4>
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <KeyRound className="w-4 h-4 text-emerald-700" />
                <span>Cuenta de Administrador</span>
              </div>
              <div className="font-mono text-[11px] text-emerald-900 bg-white p-2.5 rounded-lg border border-emerald-200 space-y-1">
                <p><strong>Usuario:</strong> admin</p>
                <p><strong>Clave:</strong> Amazonas2026*</p>
              </div>
              <p className="text-[11px] text-emerald-800">
                Puede cambiar la contraseña en cualquier momento desde el menú de Ajustes.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Arquitectura & Módulos */}
      {activeTab === 'arquitectura' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                Módulos del Sistema y Flujo de Información
              </h3>
              <p className="text-xs text-slate-500">
                Arquitectura integral de cálculo y procesamiento de nómina
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="font-bold text-slate-900 block text-sm">1. Módulo de Autenticación & Seguridad</span>
              <p className="text-slate-600">
                Control de sesión institucional, protección de datos sensibles de servidores y contratistas.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
              <span className="font-bold text-emerald-950 block text-sm">2. Nómina de Planta (Prima 18%)</span>
              <p className="text-slate-600">
                Liquidación mensual proporcional, aportes parafiscales, salud, pensión y sindicato.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
              <span className="font-bold text-amber-950 block text-sm">3. Contratistas Ley 80 (IBC 40%)</span>
              <p className="text-slate-600">
                Cálculo de honorarios, retención en la fuente y estampillas departamentales del Amazonas.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="font-bold text-slate-900 block text-sm">4. Directorio de Personal</span>
              <p className="text-slate-600">
                Gestión de empleados activos, dependencias, cuentas bancarias y contratos vigentes.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 space-y-2">
              <span className="font-bold text-teal-950 block text-sm">5. Carga Masiva Excel / CSV</span>
              <p className="text-slate-600">
                Ingesta de archivos masivos con validación sintáctica y prevención de duplicidad.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <span className="font-bold text-slate-900 block text-sm">6. Desprendibles & Reportes</span>
              <p className="text-slate-600">
                Generación de comprobantes imprimibles con formato oficial y archivos planos bancarios.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Base de Datos & Servidor */}
      {activeTab === 'database' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                Estrategia de Base de Datos: Local Auto-Gestionada a Servidor Central
              </h3>
              <p className="text-xs text-slate-500">
                Arquitectura diseñada para funcionar de forma 100% autónoma y lista para conectar a servidor en red
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <HardDrive className="w-4 h-4 text-emerald-700" />
                <span>FASE ACTUAL: Base de Datos Local Auto-Creable</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Al hacer clic en el ejecutable o abrir el sistema, la base de datos se inicializa inmediatamente en el almacenamiento local del computador.
              </p>
              <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
                <li>Sin necesidad de instalar motores de bases de datos externos.</li>
                <li>Crea automáticamente las tablas de nómina, contratistas y auditoría.</li>
                <li>Inicializa la cuenta de Administrador de manera segura.</li>
                <li>Permite realizar copias de seguridad en formato JSON y scripts SQL con 1 clic.</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl border-2 border-amber-400 bg-amber-50/40 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Server className="w-4 h-4 text-amber-700" />
                <span>PRÓXIMAS VERSIONES: Servidor Centralizado</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                El sistema ya cuenta con el módulo de configuración para apuntar a un servidor central (PostgreSQL / Cloud SQL / REST API) en la red de la Gobernación.
              </p>
              <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
                <li>Soporte de modo híbrido (Local-First con sincronización diferida).</li>
                <li>Múltiples usuarios liquidando de forma simultánea desde diferentes despachos.</li>
                <li>Consolidación central en la Secretaría de Hacienda Departamental.</li>
                <li>Descarga de scripts de esquema SQL generados directamente desde el panel de Ajustes.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Cumplimiento Normativo */}
      {activeTab === 'normatividad' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                Marco Legal Aplicable a la Nómina del Amazonas
              </h3>
              <p className="text-xs text-slate-500">
                Bases jurídicas aplicadas en las fórmulas de liquidación del sistema
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <span className="font-bold text-emerald-950 text-sm block">
                🌿 Prima Especial del Amazonas (18%)
              </span>
              <p className="text-slate-700 mt-1 leading-relaxed">
                Beneficio salarial legal otorgado a los servidores públicos que ejercen sus funciones en el Departamento del Amazonas en reconocimiento a las condiciones de frontera, aislamiento geográfico y costo de vida en la región amazónica.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
              <span className="font-bold text-amber-950 text-sm block">
                📜 Contratación Estatal - Ley 80 de 1993 y Ley 1150 de 2007
              </span>
              <p className="text-slate-700 mt-1 leading-relaxed">
                Regula los contratos de prestación de servicios profesionales y de apoyo a la gestión. El contratista asume sus aportes al Sistema General de Seguridad Social Integral con un Ingreso Base de Cotización (IBC) mínimo del 40% del valor mensualizado del contrato.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200">
              <span className="font-bold text-teal-950 text-sm block">
                🏛️ Estampillas Departamentales del Amazonas (2.5%)
              </span>
              <p className="text-slate-700 mt-1 leading-relaxed">
                Tributos departamentales aprobados por la Asamblea Departamental del Amazonas (incluyendo Estampilla Pro-Desarrollo y Estampilla Pro-Cultura) retenidos en la fuente sobre las órdenes de pago de contratos públicos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Roadmap & Ejecutable Local */}
      {activeTab === 'roadmap' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                Hoja de Ruta hacia el Ejecutable Instalable Local (.exe)
              </h3>
              <p className="text-xs text-slate-500">
                Estrategia para compilar e instalar el sistema en los computadores de la Gobernación en Leticia
              </p>
            </div>
          </div>

          <div className="relative border-l-2 border-emerald-500 ml-4 pl-6 space-y-6 text-xs">
            
            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-300"></div>
              <span className="font-bold text-emerald-800 uppercase text-[10px] block">Fase 1 • Completada</span>
              <h4 className="text-sm font-bold text-slate-900">Desarrollo de Modelos, Motor y Cálculos</h4>
              <p className="text-slate-600 mt-1">
                Lógica matemática completa de sueldos, Prima Amazonas (+18%), deducciones de salud/pensión (4%), cuota sindical, IBC contratistas (40%), retención y estampillas (2.5%).
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-300"></div>
              <span className="font-bold text-emerald-800 uppercase text-[10px] block">Fase 2 • Completada</span>
              <h4 className="text-sm font-bold text-slate-900">Interfaz Operativa, Carga Masiva y Seguridad</h4>
              <p className="text-slate-600 mt-1">
                Módulos interactivos en React con importación masiva de Excel/CSV, detección de duplicados, login de Administrador y auto-creación de base de datos local.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-300"></div>
              <span className="font-bold text-emerald-800 uppercase text-[10px] block">Fase 3 • Completada</span>
              <h4 className="text-sm font-bold text-slate-900">Desprendibles Imprimibles y Dispersión ACH</h4>
              <p className="text-slate-600 mt-1">
                Volantes oficiales de liquidación, certificados con firmas de ordenadores de gasto y generación de plano bancario.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-white ring-2 ring-amber-300"></div>
              <span className="font-bold text-amber-800 uppercase text-[10px] block">Fase 4 • Próxima Versión</span>
              <h4 className="text-sm font-bold text-slate-900">Empaquetado en Instalador Ejecutable y Conexión con Servidor Central</h4>
              <p className="text-slate-600 mt-1">
                Compilación a ejecutable de escritorio (`.exe` para Windows) con base de datos local embebida y sincronización a base de datos PostgreSQL en el servidor de la Gobernación.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
