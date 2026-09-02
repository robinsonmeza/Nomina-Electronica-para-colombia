import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  X, 
  Shield, 
  Building, 
  Download, 
  Database, 
  Server, 
  KeyRound, 
  CheckCircle2,
  HardDrive,
  RefreshCw,
  Globe,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { ConfiguracionEntidad, Usuario, RemoteServerConfig } from '../types';
import { CONFIGURACION_DEFAULT } from '../data/mockData';
import { 
  getDatabaseStatus, 
  getRemoteServerConfig, 
  saveRemoteServerConfig, 
  updateAdminPassword 
} from '../db/localDatabase';

interface SettingsModalProps {
  configuracion: ConfiguracionEntidad;
  currentUser: Usuario | null;
  onGuardarConfiguracion: (conf: ConfiguracionEntidad) => void;
  onClose: () => void;
  onExportarBackupJSON: () => void;
  onRestaurarDatosDefecto: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  configuracion,
  currentUser,
  onGuardarConfiguracion,
  onClose,
  onExportarBackupJSON,
  onRestaurarDatosDefecto,
}) => {
  const [activeTab, setActiveTab] = useState<'parametros' | 'database' | 'seguridad'>('parametros');
  const [form, setForm] = useState<ConfiguracionEntidad>({ ...configuracion });
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  // Database & Remote Server State
  const [remoteConfig, setRemoteConfig] = useState<RemoteServerConfig>(getRemoteServerConfig());
  const [testConnectionStatus, setTestConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [dbStatus, setDbStatus] = useState(getDatabaseStatus());

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardarConfiguracion(form);
    saveRemoteServerConfig(remoteConfig);
    setGuardadoExitoso(true);
    setTimeout(() => {
      setGuardadoExitoso(false);
      onClose();
    }, 1000);
  };

  const handleTestRemoteConnection = () => {
    setTestConnectionStatus('testing');
    setTimeout(() => {
      // Validating endpoint structure
      if (remoteConfig.apiUrl && remoteConfig.apiUrl.startsWith('http')) {
        setTestConnectionStatus('success');
      } else {
        setTestConnectionStatus('failed');
      }
    }, 800);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }

    const updated = updateAdminPassword(currentUser?.username || 'admin', newPassword);
    if (updated) {
      setPasswordMsg({ type: 'success', text: '¡Contraseña actualizada exitosamente!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMsg({ type: 'error', text: 'Error al actualizar la contraseña.' });
    }
  };

  const handleExportSQLScript = () => {
    const sqlContent = `-- GOBERNACIÓN DEL DEPARTAMENTO DEL AMAZONAS
-- SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS POSTGRESQL / SQLITE
-- Generado automáticamente para migración a Servidor Centralizado

CREATE TABLE IF NOT EXISTS configuracion_entidad (
  id SERIAL PRIMARY KEY,
  entidad VARCHAR(255) NOT NULL,
  nit VARCHAR(50) NOT NULL,
  gobernador VARCHAR(255),
  secretario_hacienda VARCHAR(255),
  porcentaje_prima_amazonas NUMERIC(5,2) DEFAULT 18.00,
  porcentaje_salud_empleado NUMERIC(5,2) DEFAULT 4.00,
  porcentaje_pension_empleado NUMERIC(5,2) DEFAULT 4.00,
  porcentaje_sindicato NUMERIC(5,2) DEFAULT 1.00,
  tarifa_retencion_contratista_def NUMERIC(5,2) DEFAULT 10.00,
  porcentaje_estampillas_def NUMERIC(5,2) DEFAULT 2.50
);

CREATE TABLE IF NOT EXISTS empleados_planta (
  id SERIAL PRIMARY KEY,
  tipo_documento VARCHAR(10) NOT NULL,
  numero_documento VARCHAR(50) UNIQUE NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  cargo VARCHAR(150) NOT NULL,
  dependencia VARCHAR(150) NOT NULL,
  asignacion_basica NUMERIC(12,2) NOT NULL,
  fecha_ingreso DATE NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  aplica_prima_amazonas BOOLEAN DEFAULT TRUE,
  tiene_sindicato BOOLEAN DEFAULT FALSE,
  banco VARCHAR(100),
  numero_cuenta VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS contratistas_gobierno (
  id SERIAL PRIMARY KEY,
  tipo_documento VARCHAR(10) NOT NULL,
  numero_documento VARCHAR(50) NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  numero_contrato VARCHAR(100) UNIQUE NOT NULL,
  objeto_contrato TEXT NOT NULL,
  valor_total_contrato NUMERIC(15,2) NOT NULL,
  honorarios_mensuales NUMERIC(12,2) NOT NULL,
  dependencia VARCHAR(150) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado_contrato VARCHAR(20) DEFAULT 'ACTIVO',
  tarifa_retencion_porc NUMERIC(5,2) DEFAULT 10.00,
  porcentaje_estampillas_porc NUMERIC(5,2) DEFAULT 2.50
);

CREATE TABLE IF NOT EXISTS liquidaciones_planta (
  id VARCHAR(100) PRIMARY KEY,
  consecutivo VARCHAR(50) NOT NULL,
  periodo_mes VARCHAR(50) NOT NULL,
  periodo_ano INTEGER NOT NULL,
  empleado_id INTEGER REFERENCES empleados_planta(id),
  asignacion_basica NUMERIC(12,2) NOT NULL,
  prima_amazonas NUMERIC(12,2) NOT NULL,
  total_devengados NUMERIC(12,2) NOT NULL,
  total_deducciones NUMERIC(12,2) NOT NULL,
  neto_a_pagar NUMERIC(12,2) NOT NULL,
  estado VARCHAR(20) DEFAULT 'APROBADA'
);

CREATE TABLE IF NOT EXISTS liquidaciones_contratistas (
  id VARCHAR(100) PRIMARY KEY,
  consecutivo VARCHAR(50) NOT NULL,
  periodo_mes VARCHAR(50) NOT NULL,
  periodo_ano INTEGER NOT NULL,
  contratista_id INTEGER REFERENCES contratistas_gobierno(id),
  honorarios_mensuales NUMERIC(12,2) NOT NULL,
  ibc_utilizado NUMERIC(12,2) NOT NULL,
  retencion_fuente NUMERIC(12,2) NOT NULL,
  estampillas_amazonas NUMERIC(12,2) NOT NULL,
  neto_a_recibir_por_el_contratista NUMERIC(12,2) NOT NULL,
  estado VARCHAR(20) DEFAULT 'APROBADA'
);
`;

    const blob = new Blob([sqlContent], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Schema_Amazonas_Nomina_${new Date().toISOString().split('T')[0]}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 p-6 space-y-5 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                Panel de Configuración & Base de Datos
              </h3>
              <p className="text-xs text-slate-500">
                Gobernación del Departamento del Amazonas • Sede Central
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('parametros')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'parametros'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            Parámetros de Nómina
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'database'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Base de Datos & Servidor Remoto
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seguridad')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'seguridad'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Seguridad & Admin
          </button>
        </div>

        {/* TAB 1: PARÁMETROS INSTITUCIONALES */}
        {activeTab === 'parametros' && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Building className="w-4 h-4" />
                Datos de la Entidad Territorial
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Nombre Oficial de la Entidad</label>
                  <input
                    type="text"
                    value={form.entidad}
                    onChange={(e) => setForm({ ...form, entidad: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIT Institucional</label>
                  <input
                    type="text"
                    value={form.nit}
                    onChange={(e) => setForm({ ...form, nit: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Municipio / Departamento</label>
                  <input
                    type="text"
                    value={`${form.municipio}, ${form.departamento}`}
                    onChange={(e) => setForm({ ...form, municipio: e.target.value.split(',')[0]?.trim() || 'Leticia' })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gobernador Titular</label>
                  <input
                    type="text"
                    value={form.gobernador}
                    onChange={(e) => setForm({ ...form, gobernador: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Secretario(a) de Hacienda</label>
                  <input
                    type="text"
                    value={form.secretario_hacienda}
                    onChange={(e) => setForm({ ...form, secretario_hacienda: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>
            </div>

            {/* Legal Percentages */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                Porcentajes de Nómina y Tarifas Tributarias
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  <label className="block font-bold text-amber-950 mb-1">Prima Amazonas (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.porcentaje_prima_amazonas}
                    onChange={(e) => setForm({ ...form, porcentaje_prima_amazonas: Number(e.target.value) })}
                    className="w-full border border-amber-300 rounded p-1.5 font-mono font-bold bg-white text-center"
                  />
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <label className="block font-bold text-slate-800 mb-1">Aporte Salud Emp. (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.porcentaje_salud_empleado}
                    onChange={(e) => setForm({ ...form, porcentaje_salud_empleado: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded p-1.5 font-mono font-bold bg-white text-center"
                  />
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <label className="block font-bold text-slate-800 mb-1">Aporte Pensión Emp. (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.porcentaje_pension_empleado}
                    onChange={(e) => setForm({ ...form, porcentaje_pension_empleado: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded p-1.5 font-mono font-bold bg-white text-center"
                  />
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <label className="block font-bold text-slate-800 mb-1">Cuota Sindicato (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.porcentaje_sindicato}
                    onChange={(e) => setForm({ ...form, porcentaje_sindicato: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded p-1.5 font-mono font-bold bg-white text-center"
                  />
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <label className="block font-bold text-slate-800 mb-1">Retefuente Contratistas (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.tarifa_retencion_contratista_def}
                    onChange={(e) => setForm({ ...form, tarifa_retencion_contratista_def: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded p-1.5 font-mono font-bold bg-white text-center"
                  />
                </div>

                <div className="bg-teal-50 p-2.5 rounded-lg border border-teal-200">
                  <label className="block font-bold text-teal-950 mb-1">Estampillas Amazonas (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.porcentaje_estampillas_def}
                    onChange={(e) => setForm({ ...form, porcentaje_estampillas_def: Number(e.target.value) })}
                    className="w-full border border-teal-300 rounded p-1.5 font-mono font-bold bg-white text-center"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Parámetros</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: BASE DE DATOS & SERVIDOR REMOTO */}
        {activeTab === 'database' && (
          <div className="space-y-4 text-xs">
            {/* Status Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-slate-800 text-sm">
                    Motor Actual: Base de Datos Local Auto-Gestionada
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px]">
                  ONLINE (Local SQLite / IndexedDB)
                </span>
              </div>

              <p className="text-slate-600 leading-relaxed">
                Al ejecutar el programa localmente o abrir el ejecutable, la base de datos se inicializa y crea automáticamente de manera transparente con las tablas maestras de empleados, contratistas, liquidaciones y auditoría.
              </p>

              {/* Records counts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Empleados Planta</span>
                  <span className="text-base font-bold text-slate-900 font-mono">{dbStatus.totalRecords.empleados}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Contratistas Ley 80</span>
                  <span className="text-base font-bold text-slate-900 font-mono">{dbStatus.totalRecords.contratistas}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Liquidaciones Planta</span>
                  <span className="text-base font-bold text-slate-900 font-mono">{dbStatus.totalRecords.liquidacionesPlanta}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Cuentas de Cobro</span>
                  <span className="text-base font-bold text-slate-900 font-mono">{dbStatus.totalRecords.liquidacionesContratistas}</span>
                </div>
              </div>
            </div>

            {/* Remote Server Sync Architecture Setup */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <Server className="w-4 h-4 text-amber-700" />
                  <span>Preparación para Servidor Centralizado (Próximas Versiones)</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remoteConfig.enabled}
                    onChange={(e) => setRemoteConfig({ ...remoteConfig, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span className="ml-2 text-xs font-semibold text-slate-700">Habilitar Servidor</span>
                </label>
              </div>

              <p className="text-slate-600 text-[11px]">
                Configure aquí la URL de la API del servidor central (PostgreSQL / Cloud SQL) para que los usuarios remotos consulten y sincronicen la información centralizada en las futuras versiones.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">URL Endpoint Servidor Central</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Globe className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="url"
                      value={remoteConfig.apiUrl}
                      onChange={(e) => setRemoteConfig({ ...remoteConfig, apiUrl: e.target.value })}
                      placeholder="https://nomina-api.amazonas.gov.co/api/v1"
                      className="w-full pl-8 p-2 border border-slate-300 rounded-lg font-mono text-xs bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Modo de Sincronización</label>
                  <select
                    value={remoteConfig.mode}
                    onChange={(e) => setRemoteConfig({ ...remoteConfig, mode: e.target.value as 'local_first' | 'server_first' })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="local_first">Local-First (Offline con Sync)</option>
                    <option value="server_first">Server-First (En Línea Directo)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestRemoteConnection}
                  disabled={testConnectionStatus === 'testing'}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testConnectionStatus === 'testing' ? 'animate-spin' : ''}`} />
                  <span>Probar Conexión con Servidor</span>
                </button>

                {testConnectionStatus === 'success' && (
                  <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Endpoint estructurado correctamente (Listo para migración)
                  </span>
                )}
                {testConnectionStatus === 'failed' && (
                  <span className="text-rose-600 font-bold text-[11px]">
                    URL de servidor no válida. Ingrese una URL con http:// o https://
                  </span>
                )}
              </div>
            </div>

            {/* Data Tools */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onExportarBackupJSON}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Backup JSON</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportSQLScript}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Generar Script SQL Servidor</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Deseas restaurar la base de datos a sus valores iniciales por defecto?')) {
                    onRestaurarDatosDefecto();
                    setDbStatus(getDatabaseStatus());
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar Base de Datos Local</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SEGURIDAD & ADMIN */}
        {activeTab === 'seguridad' && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-700" />
                Cuenta de Acceso Actual
              </h4>
              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <div>
                  <span className="text-slate-500 block text-[11px]">Usuario:</span>
                  <span className="font-bold font-mono">{currentUser?.username || 'admin'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Rol:</span>
                  <span className="font-bold text-emerald-800">{currentUser?.rol || 'SUPER_ADMIN'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Nombre:</span>
                  <span>{currentUser?.nombre || 'Administrador General de Nómina'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Correo:</span>
                  <span>{currentUser?.email || 'admin@amazonas.gov.co'}</span>
                </div>
              </div>
            </div>

            {/* Change Password Form */}
            <form onSubmit={handleChangePassword} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-600" />
                Cambiar Contraseña de Administrador
              </h4>

              {passwordMsg && (
                <div className={`p-2.5 rounded-lg font-semibold text-xs ${
                  passwordMsg.type === 'success' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                }`}>
                  {passwordMsg.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nueva Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full p-2 pr-8 border border-slate-300 rounded-lg font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confirmar Nueva Contraseña</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita la contraseña"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Actualizar Contraseña</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
