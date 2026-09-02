import React, { useState } from 'react';
import { AmazonasCoatOfArms } from './AmazonasCoatOfArms';
import { 
  Building2, 
  Users, 
  FileSpreadsheet, 
  Calculator, 
  Receipt, 
  Award, 
  Settings, 
  HardDrive,
  Calendar,
  Layers,
  FileCheck,
  User,
  LogOut,
  ShieldCheck,
  Database
} from 'lucide-react';
import { ConfiguracionEntidad, Usuario } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  periodoActivo: string;
  setPeriodoActivo: (periodo: string) => void;
  configuracion: ConfiguracionEntidad;
  currentUser: Usuario | null;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const AmazonasHeader: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  periodoActivo,
  setPeriodoActivo,
  configuracion,
  currentUser,
  onOpenSettings,
  onLogout,
}) => {
  const periodos = [
    'Enero 2026',
    'Febrero 2026',
    'Marzo 2026',
    'Abril 2026',
    'Mayo 2026',
    'Junio 2026',
    'Julio 2026',
    'Agosto 2026',
    'Septiembre 2026',
    'Octubre 2026',
    'Noviembre 2026',
    'Diciembre 2026',
  ];

  const tabs = [
    { id: 'dashboard', label: 'Tablero Principal', icon: Layers },
    { id: 'planta', label: 'Nómina de Planta', icon: Calculator, badge: 'Prima 18%' },
    { id: 'contratistas', label: 'Contratistas Ley 80', icon: Receipt, badge: 'IBC 40%' },
    { id: 'personal', label: 'Directorio de Personal', icon: Users },
    { id: 'cargamasiva', label: 'Carga Masiva Excel', icon: FileSpreadsheet },
    { id: 'comprobantes', label: 'Desprendibles & Reportes', icon: FileCheck },
    { id: 'avance', label: 'Avance de Proyecto', icon: Award, highlight: true },
  ];

  return (
    <header className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white shadow-xl border-b-4 border-amber-500">
      {/* Top institutional strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3.5 pb-2.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Brand & Crest */}
          <div className="flex items-center gap-3">
            <AmazonasCoatOfArms size="lg" showText={true} />
          </div>

          {/* Right Status & Global Controls */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Database Engine Status Badge */}
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-800/80 hover:bg-emerald-700/80 border border-emerald-700/60 text-[11px] text-emerald-200 font-medium transition cursor-pointer"
              title="Base de datos local auto-creada • Clic para ver configuración y migración a servidor"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">DB Local:</span>
              <strong className="text-white">Online</strong>
            </button>

            {/* Period Picker */}
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/90 border border-amber-500/40 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-300">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Periodo:</span>
              <select 
                value={periodoActivo} 
                onChange={(e) => setPeriodoActivo(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
              >
                {periodos.map(p => (
                  <option key={p} value={p} className="bg-emerald-950 text-white">
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Settings Config Button */}
            <button
              id="btn-open-settings"
              onClick={onOpenSettings}
              className="p-1.5 px-2 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-700 transition flex items-center gap-1 text-xs cursor-pointer"
              title="Configuración de Parámetros de Nómina y Base de Datos"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Ajustes</span>
            </button>

            {/* User Session Profile & Logout */}
            {currentUser && (
              <div className="flex items-center pl-2 border-l border-emerald-800/80 gap-1.5">
                <div 
                  onClick={onOpenSettings}
                  className="flex items-center gap-1.5 bg-emerald-900/90 px-2.5 py-1 rounded-lg border border-emerald-700/60 text-xs cursor-pointer hover:bg-emerald-800/90 transition"
                  title={`Conectado como: ${currentUser.nombre} (${currentUser.username})`}
                >
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-emerald-950 flex items-center justify-center font-bold text-[10px]">
                    {currentUser.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-[11px] font-bold text-white leading-none">{currentUser.username}</p>
                    <p className="text-[9px] text-amber-300 leading-none mt-0.5">{currentUser.rol}</p>
                  </div>
                </div>

                <button
                  id="btn-header-logout"
                  onClick={onLogout}
                  className="p-1.5 px-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-800/60 transition flex items-center gap-1 text-xs cursor-pointer"
                  title="Cerrar Sesión Segura"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-emerald-950/95 border-t border-emerald-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-emerald-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-all duration-150 relative cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-emerald-950 shadow-md font-bold'
                      : tab.highlight
                      ? 'text-amber-300 hover:bg-emerald-800/80 hover:text-white border border-amber-500/30'
                      : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-950' : tab.highlight ? 'text-amber-400' : 'text-emerald-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && !isActive && (
                    <span className="text-[10px] bg-emerald-800 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
