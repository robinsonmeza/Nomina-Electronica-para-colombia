import React from 'react';
import { 
  Users, 
  Receipt, 
  Calculator, 
  TrendingUp, 
  ShieldCheck, 
  Building, 
  DollarSign, 
  ArrowUpRight, 
  Download, 
  PlusCircle, 
  FileSpreadsheet,
  CheckCircle2,
  PieChart,
  Percent
} from 'lucide-react';
import { Empleado, ContratistaGobierno, LiquidacionPlanta, LiquidacionContratista, ConfiguracionEntidad } from '../types';
import { formatCOP } from '../utils/calculator';
import { exportarLiquidacionesPlantaExcel, exportarLiquidacionesContratistasExcel } from '../utils/excelHelper';

interface DashboardProps {
  empleados: Empleado[];
  contratistas: ContratistaGobierno[];
  liquidacionesPlanta: LiquidacionPlanta[];
  liquidacionesContratistas: LiquidacionContratista[];
  periodoActivo: string;
  configuracion: ConfiguracionEntidad;
  onNavigate: (tab: string) => void;
  onLiquidarTodoPlanta: () => void;
  onLiquidarTodoContratistas: () => void;
}

export const DashboardView: React.FC<DashboardProps> = ({
  empleados,
  contratistas,
  liquidacionesPlanta,
  liquidacionesContratistas,
  periodoActivo,
  configuracion,
  onNavigate,
  onLiquidarTodoPlanta,
  onLiquidarTodoContratistas,
}) => {
  const mes = periodoActivo.split(' ')[0];
  const ano = parseInt(periodoActivo.split(' ')[1]) || 2026;

  // Filtrar liquidaciones del periodo activo
  const liqPlantaPeriodo = liquidacionesPlanta.filter(l => 
    l.periodo_mes === mes && l.periodo_ano === ano
  );
  // Si aún no se ha liquidado el periodo activo, mostrar las existentes o calcular estimación
  const liqPlantaMostrar = liqPlantaPeriodo.length > 0 ? liqPlantaPeriodo : liquidacionesPlanta;

  const liqContratistasPeriodo = liquidacionesContratistas.filter(l => 
    l.periodo_mes === mes && l.periodo_ano === ano
  );
  const liqContratistasMostrar = liqContratistasPeriodo.length > 0 ? liqContratistasPeriodo : liquidacionesContratistas;

  const totalNetoPlanta = liqPlantaMostrar.reduce((acc, curr) => acc + curr.neto_a_pagar, 0);
  const totalPrimaAmazonas = liqPlantaMostrar.reduce((acc, curr) => acc + curr.prima_amazonas, 0);
  const totalDevengadoPlanta = liqPlantaMostrar.reduce((acc, curr) => acc + curr.total_devengados, 0);
  const totalDeduccionesPlanta = liqPlantaMostrar.reduce((acc, curr) => acc + curr.total_deducciones, 0);

  const totalNetoContratistas = liqContratistasMostrar.reduce((acc, curr) => acc + curr.neto_a_recibir_por_el_contratista, 0);
  const totalBrutoContratistas = liqContratistasMostrar.reduce((acc, curr) => acc + curr.honorarios_mensuales, 0);
  const totalRetefuenteContratistas = liqContratistasMostrar.reduce((acc, curr) => acc + curr.retencion_fuente, 0);
  const totalEstampillasAmazonas = liqContratistasMostrar.reduce((acc, curr) => acc + curr.estampillas_amazonas, 0);

  const totalPresupuestoGeneral = totalNetoPlanta + totalNetoContratistas;
  const totalPersonalActivo = empleados.filter(e => e.activo !== false).length + contratistas.filter(c => !c.estado_contrato || String(c.estado_contrato).toUpperCase() === 'ACTIVO').length;

  const empleadosActivosCount = empleados.filter(e => e.activo !== false).length;
  const contratistasActivosCount = contratistas.filter(c => !c.estado_contrato || String(c.estado_contrato).toUpperCase() === 'ACTIVO').length;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 rounded-2xl p-6 text-white shadow-lg border border-emerald-700/50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
            <Building className="w-3.5 h-3.5" />
            <span>Departamento del Amazonas • Leticia • {periodoActivo}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight">
            Panel de Control Financiero y Nómina
          </h1>
          <p className="text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
            Gestión integral de personal de planta con cálculo automatizado de la <strong>Prima del Amazonas (18%)</strong> y liquidación de honorarios de contratistas bajo <strong>Ley 80 de 1993</strong> con IBC al 40% y estampillas departamentales.
          </p>
        </div>

        {/* Quick actions buttons */}
        <div className="flex flex-wrap gap-2.5">
          <button
            id="btn-dash-liquidar-planta"
            onClick={onLiquidarTodoPlanta}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs shadow-md transition cursor-pointer"
            title="Calcular y liquidar automáticamente toda la planta de personal"
          >
            <Calculator className="w-4 h-4" />
            <span>Liquidar Toda la Planta ({empleadosActivosCount})</span>
          </button>
          <button
            id="btn-dash-liquidar-contratistas"
            onClick={onLiquidarTodoContratistas}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs border border-emerald-600 shadow-md transition cursor-pointer"
            title="Calcular y liquidar todas las cuentas de cobro de contratistas Ley 80"
          >
            <Receipt className="w-4 h-4" />
            <span>Liquidar Todos los Contratistas ({contratistasActivosCount})</span>
          </button>
          <button
            id="btn-dash-importar"
            onClick={() => onNavigate('cargamasiva')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-semibold text-xs border border-teal-600 shadow-md transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Carga Excel</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Presupuesto Total */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Presupuesto Neto Periodo
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {formatCOP(totalPresupuestoGeneral)}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
            <span>{periodoActivo}</span>
            <span className="font-semibold text-emerald-700">Planta + Ley 80</span>
          </div>
        </div>

        {/* Card 2: Prima Amazonas Liquidada */}
        <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm hover:shadow-md transition bg-gradient-to-br from-amber-50/40 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-amber-600" />
              Prima Amazonas (18%)
            </span>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-900 mt-2 font-mono">
            {formatCOP(totalPrimaAmazonas)}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-2 border-t border-amber-100">
            <span>Régimen Territorial Especial</span>
            <span className="font-semibold text-amber-700">{liqPlantaPeriodo.length} funcionarios</span>
          </div>
        </div>

        {/* Card 3: Estampillas Departamentales Recaudadas */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Estampillas Amazonas (2.5%)
            </span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {formatCOP(totalEstampillasAmazonas)}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
            <span>Pro-Desarrollo / Cultura</span>
            <span className="font-semibold text-teal-700">Retenido a Contratistas</span>
          </div>
        </div>

        {/* Card 4: Personal Total Activo */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Fuerza Laboral Activa
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {totalPersonalActivo} <span className="text-sm font-medium text-slate-500">Personas</span>
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
            <span>{empleados.length} Planta</span>
            <span className="font-semibold text-indigo-700">{contratistas.length} Contratistas</span>
          </div>
        </div>

      </div>

      {/* Two Column Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Box: Nómina de Planta Summary */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Resumen Nómina de Planta
                </h3>
                <p className="text-xs text-slate-500">
                  Servidores públicos de carrera administrativa y libre nombramiento
                </p>
              </div>
            </div>
            <button
              onClick={() => exportarLiquidacionesPlantaExcel(liqPlantaPeriodo, periodoActivo)}
              className="p-2 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-xs font-semibold flex items-center gap-1 transition"
              title="Exportar a Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50">
              <span className="text-slate-600">Total Sueldos Básicos Proporcionales:</span>
              <span className="font-mono font-bold text-slate-800">
                {formatCOP(totalDevengadoPlanta - totalPrimaAmazonas)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50 text-emerald-800 font-semibold bg-emerald-50/50 px-2 rounded">
              <span className="flex items-center gap-1.5">
                <span>➕ Prima Especial Amazonas (18%):</span>
              </span>
              <span className="font-mono font-bold">
                {formatCOP(totalPrimaAmazonas)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50">
              <span className="text-slate-700 font-medium">Total Devengado Bruto:</span>
              <span className="font-mono font-bold text-slate-900">
                {formatCOP(totalDevengadoPlanta)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50 text-rose-700">
              <span>➖ Total Deducciones (Salud 4%, Pensión 4%, Sindicato):</span>
              <span className="font-mono font-bold">
                {formatCOP(totalDeduccionesPlanta)}
              </span>
            </div>
            <div className="flex justify-between items-center text-base pt-2 font-bold text-emerald-950 bg-emerald-100/60 p-3 rounded-xl border border-emerald-200">
              <span>Neto a Pagar Funcionarios:</span>
              <span className="font-mono text-lg font-extrabold text-emerald-900">
                {formatCOP(totalNetoPlanta)}
              </span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={onLiquidarTodoPlanta}
              className="text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-300" />
              <span>Liquidar Toda la Planta</span>
            </button>
            <button
              onClick={() => onNavigate('planta')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
            >
              <span>Ver detalle y desprendibles</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

        {/* Right Box: Contratistas Ley 80 Summary */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Resumen Contratistas de Prestación de Servicios
                </h3>
                <p className="text-xs text-slate-500">
                  Contratos estatales de apoyo a la gestión y servicios profesionales (Ley 80)
                </p>
              </div>
            </div>
            <button
              onClick={() => exportarLiquidacionesContratistasExcel(liqContratistasMostrar, periodoActivo)}
              className="p-2 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-800 text-xs font-semibold flex items-center gap-1 transition"
              title="Exportar a Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50">
              <span className="text-slate-600">Total Honorarios Brutos Pactados:</span>
              <span className="font-mono font-bold text-slate-800">
                {formatCOP(totalBrutoContratistas)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50 text-blue-900 bg-blue-50/50 px-2 rounded">
              <span>Ingreso Base de Cotización (IBC 40% Ley):</span>
              <span className="font-mono font-bold">
                {formatCOP(totalBrutoContratistas * 0.40)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50 text-rose-700">
              <span>➖ Retención en la Fuente DIAN (10% / 11%):</span>
              <span className="font-mono font-bold">
                {formatCOP(totalRetefuenteContratistas)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50 text-amber-800 font-medium">
              <span>➖ Estampillas Departamentales del Amazonas (2.5%):</span>
              <span className="font-mono font-bold">
                {formatCOP(totalEstampillasAmazonas)}
              </span>
            </div>
            <div className="flex justify-between items-center text-base pt-2 font-bold text-amber-950 bg-amber-100/60 p-3 rounded-xl border border-amber-200">
              <span>Neto a Girar a Contratistas:</span>
              <span className="font-mono text-lg font-extrabold text-amber-900">
                {formatCOP(totalNetoContratistas)}
              </span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={onLiquidarTodoContratistas}
              className="text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-amber-200" />
              <span>Liquidar Todos los Contratistas</span>
            </button>
            <button
              onClick={() => onNavigate('contratistas')}
              className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 group"
            >
              <span>Ver cuentas de cobro y contratos</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Dependencias y Distribución Territorial */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Building className="w-4 h-4 text-emerald-700" />
          Distribución Presupuestal por Secretarías y Dependencias del Amazonas
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Gobernación del Amazonas - Cobertura en Leticia, Puerto Nariño y áreas no municipalizadas
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { dep: 'Secretaría de Salud Departamental', count: 2, monto: 8550000, color: 'bg-teal-500' },
            { dep: 'Secretaría de Infraestructura y Transporte', count: 2, monto: 6950000, color: 'bg-emerald-600' },
            { dep: 'Secretaría de Hacienda Departamental', count: 1, monto: 4850000, color: 'bg-amber-500' },
            { dep: 'Oficina Asesora Jurídica', count: 1, monto: 6000000, color: 'bg-indigo-600' },
            { dep: 'Secretaría de Educación Departamental', count: 1, monto: 4300000, color: 'bg-sky-500' },
            { dep: 'Secretaría de Agricultura y Medio Ambiente', count: 1, monto: 3900000, color: 'bg-lime-600' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-800 line-clamp-1">{item.dep}</span>
                <span className="text-slate-500 font-mono">{item.count} vinc.</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                <div className={`h-full ${item.color}`} style={{ width: `${Math.min(100, (item.monto / 9000000) * 100)}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Ejecución mensual:</span>
                <span className="font-bold text-slate-800 font-mono">{formatCOP(item.monto)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
