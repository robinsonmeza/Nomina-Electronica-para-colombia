import React, { useState } from 'react';
import { AmazonasCoatOfArms } from './AmazonasCoatOfArms';
import { 
  Lock, 
  User, 
  KeyRound, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  HardDrive, 
  Database, 
  ArrowRight,
  Sparkles,
  Server,
  AlertCircle
} from 'lucide-react';
import { authenticateUser, getDatabaseStatus } from '../db/localDatabase';
import { Usuario } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: Usuario) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Amazonas2026*');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dbStatus = getDatabaseStatus();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = authenticateUser(username, password);
      setIsLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Credenciales no válidas. Por favor intente nuevamente.');
      }
    }, 350);
  };

  const handleFillAdminCredentials = () => {
    setUsername('admin');
    setPassword('Amazonas2026*');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col justify-between selection:bg-emerald-600 selection:text-white relative overflow-hidden">
      
      {/* Decorative subtle background elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

      {/* Top Header Bar */}
      <header className="bg-emerald-950 text-white py-3 px-4 border-b-2 border-amber-500 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AmazonasCoatOfArms size="md" showText={false} />
            <div>
              <p className="text-xs md:text-sm font-serif font-bold text-amber-300">
                GOBERNACIÓN DEL DEPARTAMENTO DEL AMAZONAS
              </p>
              <p className="text-[11px] text-emerald-200">
                Secretaría de Hacienda • Subdirección de Talento Humano y Nómina
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-300 bg-emerald-900/70 px-3 py-1.5 rounded-full border border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Base de Datos Local Activa</span>
          </div>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden">
          
          {/* Card Header Banner */}
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 p-6 text-center text-white relative">
            <div className="flex justify-center mb-3">
              <AmazonasCoatOfArms size="xl" showText={false} />
            </div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-white">
              Sistema de Nómina y Honorarios
            </h1>
            <p className="text-xs text-emerald-200 mt-1">
              Control de Liquidación de Planta, Prima Amazonas (18%) y Contratistas Ley 80
            </p>
            
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-[11px] text-amber-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Acceso Restringido para Personal Autorizado</span>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Error de Autenticación</p>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Usuario o Correo Institucional
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="input-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin o admin@amazonas.gov.co"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Contraseña de Seguridad
                  </label>
                  <span className="text-[11px] text-slate-400">Default: Amazonas2026*</span>
                </div>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="input-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="btn-login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verificando Credenciales...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>Ingresar al Sistema de Nómina</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Admin Demo Helper Button */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="bg-emerald-50/80 rounded-xl p-3.5 border border-emerald-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Cuenta Administrador por Defecto
                  </span>
                  <button
                    type="button"
                    onClick={handleFillAdminCredentials}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                  >
                    Autocompletar
                  </button>
                </div>
                <div className="text-[11px] text-emerald-800 font-mono space-y-0.5">
                  <p><strong className="font-sans font-semibold">Usuario:</strong> admin</p>
                  <p><strong className="font-sans font-semibold">Contraseña:</strong> Amazonas2026*</p>
                </div>
              </div>

              {/* Local DB status notice */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                  Base de datos local: <strong className="text-slate-700">Auto-creada ({dbStatus.totalRecords.empleados} emp / {dbStatus.totalRecords.contratistas} cto)</strong>
                </span>
                <span className="flex items-center gap-1 text-slate-400" title="Preparado para migración a servidor central">
                  <Server className="w-3 h-3 text-amber-500" />
                  Listo p/ Servidor
                </span>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="bg-emerald-950 text-emerald-300/80 border-t-2 border-amber-500 py-3 text-center text-xs">
        <p className="font-serif text-white font-medium">
          Gobernación del Departamento del Amazonas • República de Colombia
        </p>
        <p className="text-[11px] text-emerald-300/60 mt-0.5">
          Sede Administrativa Central: Calle 10 No. 10-45, Leticia, Amazonas • Sistema de Nómina y Contratistas Ley 80
        </p>
      </footer>

    </div>
  );
};
