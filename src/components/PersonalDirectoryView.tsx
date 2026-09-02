import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Briefcase, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Download,
  Building,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Plus
} from 'lucide-react';
import { Empleado, ContratistaGobierno } from '../types';
import { formatCOP } from '../utils/calculator';
import * as XLSX from 'xlsx';

interface PersonalDirectoryProps {
  empleados: Empleado[];
  contratistas: ContratistaGobierno[];
  onGuardarEmpleado: (empleado: Empleado) => void;
  onEliminarEmpleado: (id: number) => void;
  onGuardarContratista: (contratista: ContratistaGobierno) => void;
  onEliminarContratista: (id: number) => void;
}

export const PersonalDirectoryView: React.FC<PersonalDirectoryProps> = ({
  empleados,
  contratistas,
  onGuardarEmpleado,
  onEliminarEmpleado,
  onGuardarContratista,
  onEliminarContratista,
}) => {
  const [subTab, setSubTab] = useState<'planta' | 'contratistas'>('planta');
  const [busqueda, setBusqueda] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
  const [editingContratista, setEditingContratista] = useState<ContratistaGobierno | null>(null);

  // Form states for Empleado
  const [empForm, setEmpForm] = useState<Partial<Empleado>>({
    tipo_documento: 'CC',
    numero_documento: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    cargo: '',
    dependencia: 'Secretaría de Hacienda Departamental',
    asignacion_basica: 3500000,
    fecha_ingreso: new Date().toISOString().split('T')[0],
    activo: true,
    tiene_sindicato: false,
    aplica_prima_amazonas: true,
    banco: 'Banco Agrario de Colombia',
    numero_cuenta: '',
  });

  // Form states for Contratista
  const [ctoForm, setCtoForm] = useState<Partial<ContratistaGobierno>>({
    tipo_documento: 'CC',
    numero_documento: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    numero_contrato: 'CTO-AMZ-2026-',
    objeto_contrato: '',
    valor_total_contrato: 40000000,
    honorarios_mensuales: 4000000,
    supervisor_asignado: '',
    dependencia: 'Secretaría de Infraestructura Departamental',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '2026-12-31',
    estado_contrato: 'ACTIVO',
    tarifa_retencion_porc: 10,
    porcentaje_estampillas_porc: 2.5,
    banco: 'Bancolombia',
    numero_cuenta: '',
  });

  const abrirNuevo = () => {
    if (subTab === 'planta') {
      setEditingEmpleado(null);
      setEmpForm({
        tipo_documento: 'CC',
        numero_documento: '',
        nombres: '',
        apellidos: '',
        correo: '',
        telefono: '',
        cargo: '',
        dependencia: 'Secretaría de Hacienda Departamental',
        asignacion_basica: 3500000,
        fecha_ingreso: new Date().toISOString().split('T')[0],
        activo: true,
        tiene_sindicato: false,
        aplica_prima_amazonas: true,
        banco: 'Banco Agrario de Colombia',
        numero_cuenta: '',
      });
    } else {
      setEditingContratista(null);
      setCtoForm({
        tipo_documento: 'CC',
        numero_documento: '',
        nombres: '',
        apellidos: '',
        correo: '',
        telefono: '',
        numero_contrato: `CTO-AMZ-2026-${Math.floor(100 + Math.random() * 900)}`,
        objeto_contrato: '',
        valor_total_contrato: 40000000,
        honorarios_mensuales: 4000000,
        supervisor_asignado: '',
        dependencia: 'Secretaría de Infraestructura Departamental',
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: '2026-12-31',
        estado_contrato: 'ACTIVO',
        tarifa_retencion_porc: 10,
        porcentaje_estampillas_porc: 2.5,
        banco: 'Bancolombia',
        numero_cuenta: '',
      });
    }
    setModalOpen(true);
  };

  const handleEditEmpleado = (emp: Empleado) => {
    setEditingEmpleado(emp);
    setEmpForm(emp);
    setModalOpen(true);
  };

  const handleEditContratista = (cto: ContratistaGobierno) => {
    setEditingContratista(cto);
    setCtoForm(cto);
    setModalOpen(true);
  };

  const guardarFormulario = (e: React.FormEvent) => {
    e.preventDefault();
    if (subTab === 'planta') {
      const nuevoEmp: Empleado = {
        id: editingEmpleado ? editingEmpleado.id : Date.now(),
        tipo_documento: empForm.tipo_documento || 'CC',
        numero_documento: empForm.numero_documento || '',
        nombres: empForm.nombres || '',
        apellidos: empForm.apellidos || '',
        correo: empForm.correo,
        telefono: empForm.telefono,
        cargo: empForm.cargo || 'Funcionario Público',
        dependencia: empForm.dependencia || 'Gobernación del Amazonas',
        asignacion_basica: Number(empForm.asignacion_basica) || 3000000,
        fecha_ingreso: empForm.fecha_ingreso || new Date().toISOString().split('T')[0],
        activo: empForm.activo !== false,
        tiene_sindicato: Boolean(empForm.tiene_sindicato),
        aplica_prima_amazonas: empForm.aplica_prima_amazonas !== false,
        banco: empForm.banco,
        tipo_cuenta: 'Ahorros',
        numero_cuenta: empForm.numero_cuenta,
      };
      onGuardarEmpleado(nuevoEmp);
    } else {
      const nuevoCto: ContratistaGobierno = {
        id: editingContratista ? editingContratista.id : Date.now(),
        tipo_documento: ctoForm.tipo_documento || 'CC',
        numero_documento: ctoForm.numero_documento || '',
        nombres: ctoForm.nombres || '',
        apellidos: ctoForm.apellidos || '',
        correo: ctoForm.correo,
        telefono: ctoForm.telefono,
        numero_contrato: ctoForm.numero_contrato || 'CTO-AMZ-2026-000',
        objeto_contrato: ctoForm.objeto_contrato || 'Prestación de servicios profesionales',
        valor_total_contrato: Number(ctoForm.valor_total_contrato) || 30000000,
        honorarios_mensuales: Number(ctoForm.honorarios_mensuales) || 3000000,
        supervisor_asignado: ctoForm.supervisor_asignado || 'Supervisor de Contrato',
        dependencia: ctoForm.dependencia || 'Secretaría General',
        fecha_inicio: ctoForm.fecha_inicio || new Date().toISOString().split('T')[0],
        fecha_fin: ctoForm.fecha_fin || '2026-12-31',
        estado_contrato: ctoForm.estado_contrato || 'ACTIVO',
        tarifa_retencion_porc: Number(ctoForm.tarifa_retencion_porc) || 10,
        porcentaje_estampillas_porc: Number(ctoForm.porcentaje_estampillas_porc) || 2.5,
        banco: ctoForm.banco,
        tipo_cuenta: 'Ahorros',
        numero_cuenta: ctoForm.numero_cuenta,
      };
      onGuardarContratista(nuevoCto);
    }
    setModalOpen(false);
  };

  const exportarDirectorioExcel = () => {
    if (subTab === 'planta') {
      const ws = XLSX.utils.json_to_sheet(empleados);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Empleados_Planta');
      XLSX.writeFile(wb, 'Directorio_Empleados_Amazonas.xlsx');
    } else {
      const ws = XLSX.utils.json_to_sheet(contratistas);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Contratistas_Ley80');
      XLSX.writeFile(wb, 'Directorio_Contratistas_Amazonas.xlsx');
    }
  };

  // Filters
  const empleadosFiltrados = empleados.filter(e =>
    `${e.nombres} ${e.apellidos} ${e.numero_documento} ${e.cargo} ${e.dependencia}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const contratistasFiltrados = contratistas.filter(c =>
    `${c.nombres} ${c.apellidos} ${c.numero_documento} ${c.numero_contrato} ${c.dependencia} ${c.supervisor_asignado}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 font-serif">
              Directorio de Personal Institucional
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Administración de servidores públicos de planta y contratistas de prestación de servicios de la Gobernación del Amazonas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-agregar-personal"
            onClick={abrirNuevo}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo {subTab === 'planta' ? 'Funcionario' : 'Contratista'}</span>
          </button>

          <button
            onClick={exportarDirectorioExcel}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Exportar Lista</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Toggle between Planta & Contratistas */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            id="tab-sub-planta"
            onClick={() => setSubTab('planta')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              subTab === 'planta'
                ? 'bg-white text-emerald-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            <span>Servidores de Planta ({empleados.length})</span>
          </button>
          
          <button
            id="tab-sub-contratistas"
            onClick={() => setSubTab('contratistas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              subTab === 'contratistas'
                ? 'bg-white text-amber-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-amber-700" />
            <span>Contratistas Ley 80 ({contratistas.length})</span>
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por cédula, nombre, cargo o contrato..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

      </div>

      {/* Content Table */}
      {subTab === 'planta' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3.5 px-4">Funcionario / Identificación</th>
                  <th className="py-3.5 px-4">Cargo / Dependencia</th>
                  <th className="py-3.5 px-4 text-right">Asignación Básica</th>
                  <th className="py-3.5 px-4 text-center">Prima Amazonas</th>
                  <th className="py-3.5 px-4">Fecha Ingreso</th>
                  <th className="py-3.5 px-4">Cuenta Bancaria</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {empleadosFiltrados.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{emp.nombres} {emp.apellidos}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{emp.tipo_documento} {emp.numero_documento}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{emp.cargo}</div>
                      <div className="text-[10px] text-slate-500">{emp.dependencia}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCOP(emp.asignacion_basica)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                        +18% Aplica
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {emp.fecha_ingreso}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[11px] font-medium text-slate-800">{emp.banco || 'Banco Agrario'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{emp.numero_cuenta || 'No reg.'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {emp.activo ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3" /> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          <XCircle className="w-3 h-3" /> Inactivo
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEditEmpleado(emp)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="Editar Funcionario"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEliminarEmpleado(emp.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3.5 px-4">Contratista</th>
                  <th className="py-3.5 px-4">No. Contrato / Dependencia</th>
                  <th className="py-3.5 px-4">Objeto Contractual</th>
                  <th className="py-3.5 px-4 text-right">Honorarios Mes</th>
                  <th className="py-3.5 px-4 text-right">Valor Total</th>
                  <th className="py-3.5 px-4">Vigencia</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contratistasFiltrados.map((cto) => (
                  <tr key={cto.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{cto.nombres} {cto.apellidos}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{cto.tipo_documento} {cto.numero_documento}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-amber-900">{cto.numero_contrato}</div>
                      <div className="text-[10px] text-slate-500">{cto.dependencia}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-[11px] text-slate-600 line-clamp-2" title={cto.objeto_contrato}>
                        {cto.objeto_contrato}
                      </p>
                      <span className="text-[10px] text-emerald-700 font-medium">Sup: {cto.supervisor_asignado}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCOP(cto.honorarios_mensuales)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-600">
                      {formatCOP(cto.valor_total_contrato)}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-600 font-mono whitespace-nowrap">
                      {cto.fecha_inicio} al {cto.fecha_fin}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {cto.estado_contrato}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEditContratista(cto)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="Editar Contrato"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEliminarContratista(cto.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Agregar/Editar */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900 font-serif">
                {subTab === 'planta'
                  ? (editingEmpleado ? 'Editar Servidor de Planta' : 'Registrar Nuevo Servidor de Planta')
                  : (editingContratista ? 'Editar Contrato Ley 80' : 'Registrar Nuevo Contratista')}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={guardarFormulario} className="space-y-4">
              {subTab === 'planta' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tipo Doc.</label>
                      <select
                        value={empForm.tipo_documento}
                        onChange={(e) => setEmpForm({ ...empForm, tipo_documento: e.target.value })}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-medium"
                      >
                        <option value="CC">Cédula de Ciudadanía (CC)</option>
                        <option value="CE">Cédula de Extranjería (CE)</option>
                        <option value="PAS">Pasaporte (PAS)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Número de Documento *</label>
                      <input
                        type="text"
                        required
                        value={empForm.numero_documento}
                        onChange={(e) => setEmpForm({ ...empForm, numero_documento: e.target.value })}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-mono"
                        placeholder="Ej: 1058204918"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nombres *</label>
                      <input
                        type="text"
                        required
                        value={empForm.nombres}
                        onChange={(e) => setEmpForm({ ...empForm, nombres: e.target.value })}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-medium"
                        placeholder="Nombres completos"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Apellidos *</label>
                      <input
                        type="text"
                        required
                        value={empForm.apellidos}
                        onChange={(e) => setEmpForm({ ...empForm, apellidos: e.target.value })}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-medium"
                        placeholder="Apellidos completos"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Cargo Institucional *</label>
                      <input
                        type="text"
                        required
                        value={empForm.cargo}
                        onChange={(e) => setEmpForm({ ...empForm, cargo: e.target.value })}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-medium"
                        placeholder="Ej: Profesional Especializado"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Dependencia / Secretaría</label>
                      <select
                        value={empForm.dependencia}
                        onChange={(e) => setEmpForm({ ...empForm, dependencia: e.target.value })}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-medium"
                      >
                        <option value="Secretaría de Hacienda Departamental">Secretaría de Hacienda</option>
                        <option value="Secretaría de Salud Departamental">Secretaría de Salud</option>
                        <option value="Secretaría de Educación Departamental">Secretaría de Educación</option>
                        <option value="Secretaría de Infraestructura y Transporte">Secretaría de Infraestructura</option>
                        <option value="Secretaría de Agricultura y Medio Ambiente">Secretaría de Agricultura</option>
                        <option value="Despacho del Gobernador">Despacho del Gobernador</option>
                        <option value="Oficina Asesora Jurídica">Oficina Asesora Jurídica</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Asignación Básica Mensual ($ COP) *</label>
                      <input
                        type="number"
                        required
                        value={empForm.asignacion_basica}
                        onChange={(e) => setEmpForm({ ...empForm, asignacion_basica: Number(e.target.value) })}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de Ingreso</label>
                      <input
                        type="date"
                        value={empForm.fecha_ingreso}
                        onChange={(e) => setEmpForm({ ...empForm, fecha_ingreso: e.target.value })}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Banco para Dispersión</label>
                      <input
                        type="text"
                        value={empForm.banco}
                        onChange={(e) => setEmpForm({ ...empForm, banco: e.target.value })}
                        placeholder="Ej: Banco Agrario de Colombia"
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">No. Cuenta Bancaria</label>
                      <input
                        type="text"
                        value={empForm.numero_cuenta}
                        onChange={(e) => setEmpForm({ ...empForm, numero_cuenta: e.target.value })}
                        placeholder="Ej: 048291039401"
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-mono"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tipo Doc.</label>
                      <select
                        value={ctoForm.tipo_documento}
                        onChange={(e) => setCtoForm({ ...ctoForm, tipo_documento: e.target.value })}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-medium"
                      >
                        <option value="CC">Cédula de Ciudadanía (CC)</option>
                        <option value="NIT">NIT Persona Jurídica</option>
                        <option value="CE">Cédula de Extranjería (CE)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Número de Identificación *</label>
                      <input
                        type="text"
                        required
                        value={ctoForm.numero_documento}
                        onChange={(e) => setCtoForm({ ...ctoForm, numero_documento: e.target.value })}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-mono"
                        placeholder="Ej: 1098492018"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nombres / Razón Social *</label>
                      <input
                        type="text"
                        required
                        value={ctoForm.nombres}
                        onChange={(e) => setCtoForm({ ...ctoForm, nombres: e.target.value })}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Apellidos</label>
                      <input
                        type="text"
                        value={ctoForm.apellidos}
                        onChange={(e) => setCtoForm({ ...ctoForm, apellidos: e.target.value })}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Número de Contrato *</label>
                      <input
                        type="text"
                        required
                        value={ctoForm.numero_contrato}
                        onChange={(e) => setCtoForm({ ...ctoForm, numero_contrato: e.target.value })}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-mono font-bold"
                        placeholder="CTO-AMZ-2026-000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Dependencia Asignada</label>
                      <input
                        type="text"
                        value={ctoForm.dependencia}
                        onChange={(e) => setCtoForm({ ...ctoForm, dependencia: e.target.value })}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Objeto del Contrato *</label>
                    <textarea
                      rows={2}
                      required
                      value={ctoForm.objeto_contrato}
                      onChange={(e) => setCtoForm({ ...ctoForm, objeto_contrato: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-medium"
                      placeholder="Describa el objeto de la prestación de servicios..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Honorarios Mensuales ($ COP) *</label>
                      <input
                        type="number"
                        required
                        value={ctoForm.honorarios_mensuales}
                        onChange={(e) => setCtoForm({ ...ctoForm, honorarios_mensuales: Number(e.target.value) })}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Valor Total del Contrato ($ COP)</label>
                      <input
                        type="number"
                        value={ctoForm.valor_total_contrato}
                        onChange={(e) => setCtoForm({ ...ctoForm, valor_total_contrato: Number(e.target.value) })}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Supervisor Asignado</label>
                      <input
                        type="text"
                        value={ctoForm.supervisor_asignado}
                        onChange={(e) => setCtoForm({ ...ctoForm, supervisor_asignado: e.target.value })}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-medium"
                        placeholder="Nombre y cargo del supervisor"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de Terminación</label>
                      <input
                        type="date"
                        value={ctoForm.fecha_fin}
                        onChange={(e) => setCtoForm({ ...ctoForm, fecha_fin: e.target.value })}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md"
                >
                  Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
