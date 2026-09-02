import React, { useState } from 'react';
import { 
  Calculator, 
  UserCheck, 
  Percent, 
  FileText, 
  Download, 
  CheckCircle2, 
  Plus, 
  RefreshCw, 
  Printer, 
  Building, 
  AlertCircle,
  Sparkles,
  Search
} from 'lucide-react';
import { Empleado, LiquidacionPlanta, ConfiguracionEntidad } from '../types';
import { calcularNominaPlanta, formatCOP } from '../utils/calculator';
import { exportarLiquidacionesPlantaExcel } from '../utils/excelHelper';

interface NominaPlantaViewProps {
  empleados: Empleado[];
  liquidaciones: LiquidacionPlanta[];
  periodoActivo: string;
  configuracion: ConfiguracionEntidad;
  onGuardarLiquidacion: (liquidacion: LiquidacionPlanta) => void;
  onGenerarMasivoPlanta: () => void;
  onVerComprobante: (liquidacion: LiquidacionPlanta) => void;
  onEliminarLiquidacion: (id: string) => void;
}

export const NominaPlantaView: React.FC<NominaPlantaViewProps> = ({
  empleados,
  liquidaciones,
  periodoActivo,
  configuracion,
  onGuardarLiquidacion,
  onGenerarMasivoPlanta,
  onVerComprobante,
  onEliminarLiquidacion,
}) => {
  // Selector o entrada individual
  const [selectedEmpleadoId, setSelectedEmpleadoId] = useState<number>(empleados[0]?.id || 1);
  const [diasTrabajados, setDiasTrabajados] = useState<number>(30);
  const [aplicaPrimaAmazonas, setAplicaPrimaAmazonas] = useState<boolean>(true);
  const [tieneSindicato, setTieneSindicato] = useState<boolean>(false);
  const [asignacionManual, setAsignacionManual] = useState<number>(empleados[0]?.asignacion_basica || 4850000);
  const [otrasDeducciones, setOtrasDeducciones] = useState<number>(0);
  const [auxilioTransporte, setAuxilioTransporte] = useState<number>(0);
  const [otrosDevengados, setOtrosDevengados] = useState<number>(0);
  const [filtroBusqueda, setFiltroBusqueda] = useState<string>('');

  // Handle employee change
  const handleEmpleadoChange = (empId: number) => {
    setSelectedEmpleadoId(empId);
    const emp = empleados.find(e => e.id === empId);
    if (emp) {
      setAsignacionManual(emp.asignacion_basica);
      setAplicaPrimaAmazonas(emp.aplica_prima_amazonas !== false);
      setTieneSindicato(Boolean(emp.tiene_sindicato));
    }
  };

  // Live calculation based on current form
  const resultadoLive = calcularNominaPlanta({
    asignacion_basica: asignacionManual,
    dias_trabajados: diasTrabajados,
    aplica_prima_amazonas: aplicaPrimaAmazonas,
    tiene_sindicato: tieneSindicato,
    auxilio_transporte: auxilioTransporte,
    otras_deducciones: otrasDeducciones,
    otros_devengados: otrosDevengados,
  });

  const empleadoSeleccionado = empleados.find(e => e.id === selectedEmpleadoId) || empleados[0];

  const handleGuardarIndividual = () => {
    if (!empleadoSeleccionado) return;

    const nuevaLiq: LiquidacionPlanta = {
      id: `liq-planta-${Date.now()}`,
      consecutivo: `LP-AMZ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      fecha_liquidacion: new Date().toISOString().split('T')[0],
      periodo_mes: periodoActivo.split(' ')[0],
      periodo_ano: parseInt(periodoActivo.split(' ')[1]) || 2026,
      empleado_id: empleadoSeleccionado.id,
      empleado: { ...empleadoSeleccionado, asignacion_basica: asignacionManual },
      asignacion_basica: asignacionManual,
      dias_trabajados: diasTrabajados,
      sueldo_proporcional: resultadoLive.sueldo_proporcional,
      aplica_prima_amazonas: aplicaPrimaAmazonas,
      prima_amazonas: resultadoLive.prima_amazonas,
      auxilio_transporte: resultadoLive.auxilio_transporte,
      otros_devengados: resultadoLive.otros_devengados,
      total_devengados: resultadoLive.total_devengados,
      aporte_salud: resultadoLive.aporte_salud,
      aporte_pension: resultadoLive.aporte_pension,
      tiene_sindicato: tieneSindicato,
      cuota_sindical: resultadoLive.cuota_sindical,
      otras_deducciones: resultadoLive.otras_deducciones,
      total_deducciones: resultadoLive.total_deducciones,
      neto_a_pagar: resultadoLive.neto_a_pagar,
      estado: 'APROBADA',
    };

    onGuardarLiquidacion(nuevaLiq);
  };

  const liquidacionesFiltradas = liquidaciones.filter(l => {
    const emp = l.empleado || empleados.find(e => e.id === l.empleado_id);
    if (!emp) return false;
    const term = filtroBusqueda.toLowerCase();
    return (
      (emp.nombres || '').toLowerCase().includes(term) ||
      (emp.apellidos || '').toLowerCase().includes(term) ||
      (emp.numero_documento || '').includes(term) ||
      (emp.cargo || '').toLowerCase().includes(term) ||
      (emp.dependencia || '').toLowerCase().includes(term) ||
      (l.consecutivo || '').toLowerCase().includes(term)
    );
  });

  const empleadosActivosCount = empleados.filter(e => e.activo !== false).length;

  return (
    <div className="space-y-6">
      
      {/* Header section with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <Calculator className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 font-serif">
              Módulo de Liquidación de Nómina de Planta
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cálculo de sueldo proporcional, Prima Departamental del Amazonas (18% Ley) y deducciones de seguridad social.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-liquidar-todo-planta"
            onClick={onGenerarMasivoPlanta}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
            title="Calcular la liquidación de todos los empleados de planta activos"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Liquidar Toda la Planta ({empleadosActivosCount})</span>
          </button>

          <button
            onClick={() => exportarLiquidacionesPlantaExcel(liquidaciones, periodoActivo)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Calculator on Left, Preview/Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form Calculator (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Calculadora Individual de Empleado Público
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
              Periodo: {periodoActivo}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Seleccionar Empleado */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Servidor Público de Planta
              </label>
              <select
                id="select-empleado-planta"
                value={selectedEmpleadoId}
                onChange={(e) => handleEmpleadoChange(Number(e.target.value))}
                className="w-full text-sm font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {empleados.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombres} {emp.apellidos} — {emp.tipo_documento} {emp.numero_documento} ({emp.cargo})
                  </option>
                ))}
              </select>
            </div>

            {/* Asignación Básica Mensual */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Asignación Básica Mensual ($ COP)
              </label>
              <input
                type="number"
                value={asignacionManual}
                onChange={(e) => setAsignacionManual(Number(e.target.value))}
                className="w-full text-sm font-semibold border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                min="0"
                step="50000"
              />
            </div>

            {/* Días Trabajados */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Días Trabajados en el Mes (Base 30)
              </label>
              <input
                type="number"
                value={diasTrabajados}
                onChange={(e) => setDiasTrabajados(Math.min(30, Math.max(1, Number(e.target.value))))}
                className="w-full text-sm font-semibold border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                min="1"
                max="30"
              />
            </div>

            {/* Auxilio de Transporte */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Auxilio de Transporte ($ COP)
              </label>
              <input
                type="number"
                value={auxilioTransporte}
                onChange={(e) => setAuxilioTransporte(Number(e.target.value))}
                placeholder="0"
                className="w-full text-sm font-semibold border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>

            {/* Otras Deducciones */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Otras Deducciones / Libranzas ($ COP)
              </label>
              <input
                type="number"
                value={otrasDeducciones}
                onChange={(e) => setOtrasDeducciones(Number(e.target.value))}
                placeholder="0"
                className="w-full text-sm font-semibold border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Toggles territoriales */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            
            {/* Prima Amazonas Checkbox */}
            <label className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 cursor-pointer hover:bg-amber-100/60 transition">
              <input
                type="checkbox"
                checked={aplicaPrimaAmazonas}
                onChange={(e) => setAplicaPrimaAmazonas(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
              <div className="text-xs">
                <span className="font-bold text-amber-900 block">
                  Aplica Prima Especial del Amazonas (+18% sobre devengado proporcional)
                </span>
                <span className="text-amber-700/90 text-[11px]">
                  Régimen salarial y prestacional especial para empleados públicos que laboran en el Departamento del Amazonas.
                </span>
              </div>
            </label>

            {/* Sindicato Checkbox */}
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition">
              <input
                type="checkbox"
                checked={tieneSindicato}
                onChange={(e) => setTieneSindicato(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">
                  Afiliado a Organización Sindical de Empleados Públicos (-1%)
                </span>
                <span className="text-slate-500 text-[11px]">
                  Descuento estatutario del 1.0% del sueldo básico proporcional con destino al sindicato institucional.
                </span>
              </div>
            </label>
          </div>

          <div className="pt-3">
            <button
              id="btn-guardar-liquidacion-planta"
              onClick={handleGuardarIndividual}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md transition"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Guardar / Actualizar Liquidación en el Historial</span>
            </button>
          </div>
        </div>

        {/* Live Calculation Sheet (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-emerald-950 text-white rounded-2xl p-6 shadow-md border border-emerald-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/80">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300">
                  Desglose Financiero
                </span>
                <h4 className="text-base font-bold font-serif text-white">
                  {empleadoSeleccionado?.nombres} {empleadoSeleccionado?.apellidos}
                </h4>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-800/80 text-emerald-200">
                {diasTrabajados} / 30 Días
              </span>
            </div>

            <p className="text-xs text-emerald-200/80 mt-1 mb-4">
              {empleadoSeleccionado?.cargo} • {empleadoSeleccionado?.dependencia}
            </p>

            {/* Items Devengados */}
            <div className="space-y-2 text-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 pt-1">
                Conceptos Devengados (+)
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-900/60">
                <span className="text-slate-300">Sueldo Proporcional ({diasTrabajados} días):</span>
                <span className="font-mono font-semibold">{formatCOP(resultadoLive.sueldo_proporcional)}</span>
              </div>
              {aplicaPrimaAmazonas && (
                <div className="flex justify-between py-1 border-b border-emerald-900/60 text-amber-300 font-semibold bg-amber-950/40 px-2 rounded">
                  <span>➕ Prima Amazonas (18%):</span>
                  <span className="font-mono">{formatCOP(resultadoLive.prima_amazonas)}</span>
                </div>
              )}
              {resultadoLive.auxilio_transporte > 0 && (
                <div className="flex justify-between py-1 border-b border-emerald-900/60 text-slate-300">
                  <span>Auxilio de Transporte:</span>
                  <span className="font-mono">{formatCOP(resultadoLive.auxilio_transporte)}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 font-bold text-emerald-300 text-sm bg-emerald-900/40 px-2 rounded">
                <span>Total Devengado:</span>
                <span className="font-mono">{formatCOP(resultadoLive.total_devengados)}</span>
              </div>

              {/* Items Deducciones */}
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-300 pt-3">
                Conceptos Deducidos (-)
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-900/60 text-slate-300">
                <span>Aporte Salud (4%):</span>
                <span className="font-mono text-rose-300">-{formatCOP(resultadoLive.aporte_salud)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-900/60 text-slate-300">
                <span>Aporte Pensión (4%):</span>
                <span className="font-mono text-rose-300">-{formatCOP(resultadoLive.aporte_pension)}</span>
              </div>
              {tieneSindicato && (
                <div className="flex justify-between py-1 border-b border-emerald-900/60 text-slate-300">
                  <span>Cuota Sindical (1%):</span>
                  <span className="font-mono text-rose-300">-{formatCOP(resultadoLive.cuota_sindical)}</span>
                </div>
              )}
              {resultadoLive.otras_deducciones > 0 && (
                <div className="flex justify-between py-1 border-b border-emerald-900/60 text-slate-300">
                  <span>Otras Deducciones:</span>
                  <span className="font-mono text-rose-300">-{formatCOP(resultadoLive.otras_deducciones)}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 font-bold text-rose-300 text-sm bg-rose-950/40 px-2 rounded">
                <span>Total Deducciones:</span>
                <span className="font-mono">-{formatCOP(resultadoLive.total_deducciones)}</span>
              </div>
            </div>
          </div>

          {/* Big Total at bottom */}
          <div className="mt-6 pt-4 border-t border-emerald-700/80">
            <div className="p-4 rounded-xl bg-amber-400 text-emerald-950 text-center shadow-lg">
              <span className="text-xs font-extrabold uppercase tracking-wider block">
                Neto a Pagar al Servidor Público
              </span>
              <span className="text-2xl font-black font-mono tracking-tight block mt-1">
                {formatCOP(resultadoLive.neto_a_pagar)}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Table of Processed Planta Liquidations */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Liquidaciones Registradas de Nómina de Planta ({liquidacionesFiltradas.length})
            </h3>
            <p className="text-xs text-slate-500">
              Registros correspondientes a la Gobernación del Amazonas para {periodoActivo}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por cédula o nombre..."
              value={filtroBusqueda}
              onChange={(e) => setFiltroBusqueda(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <th className="py-3 px-3">Funcionario</th>
                <th className="py-3 px-3">Dependencia / Cargo</th>
                <th className="py-3 px-3 text-right">Asig. Básica</th>
                <th className="py-3 px-3 text-right">Prima Amazonas (18%)</th>
                <th className="py-3 px-3 text-right">Devengado</th>
                <th className="py-3 px-3 text-right">Deducciones</th>
                <th className="py-3 px-3 text-right">Neto a Pagar</th>
                <th className="py-3 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {liquidacionesFiltradas.map((liq) => (
                <tr key={liq.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{liq.empleado.nombres} {liq.empleado.apellidos}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{liq.empleado.tipo_documento} {liq.empleado.numero_documento}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-800">{liq.empleado.cargo}</div>
                    <div className="text-[10px] text-slate-500">{liq.empleado.dependencia}</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-700">
                    {formatCOP(liq.asignacion_basica)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-amber-700 bg-amber-50/50">
                    +{formatCOP(liq.prima_amazonas)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                    {formatCOP(liq.total_devengados)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-rose-700">
                    -{formatCOP(liq.total_deducciones)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-900 bg-emerald-50/60">
                    {formatCOP(liq.neto_a_pagar)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onVerComprobante(liq)}
                        className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition"
                        title="Ver Desprendible Oficial de Pago"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEliminarLiquidacion(liq.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition text-[10px]"
                        title="Eliminar registro"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {liquidacionesFiltradas.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-slate-500 text-xs">
                        No se encontraron liquidaciones de nómina de planta registradas para este periodo.
                      </p>
                      <button
                        onClick={onGenerarMasivoPlanta}
                        className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Liquidar Toda la Planta Ahora ({empleadosActivosCount} Servidores)</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
