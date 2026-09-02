import React, { useState } from 'react';
import { 
  Receipt, 
  Briefcase, 
  ShieldCheck, 
  Percent, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  Printer, 
  FileText,
  DollarSign
} from 'lucide-react';
import { ContratistaGobierno, LiquidacionContratista, ConfiguracionEntidad } from '../types';
import { calcularCuentaCobroContratista, formatCOP } from '../utils/calculator';
import { exportarLiquidacionesContratistasExcel } from '../utils/excelHelper';

interface ContratistasViewProps {
  contratistas: ContratistaGobierno[];
  liquidaciones: LiquidacionContratista[];
  periodoActivo: string;
  configuracion: ConfiguracionEntidad;
  onGuardarLiquidacion: (liquidacion: LiquidacionContratista) => void;
  onGenerarMasivoContratistas: () => void;
  onVerComprobante: (liquidacion: LiquidacionContratista) => void;
  onEliminarLiquidacion: (id: string) => void;
}

export const ContratistasView: React.FC<ContratistasViewProps> = ({
  contratistas,
  liquidaciones,
  periodoActivo,
  configuracion,
  onGuardarLiquidacion,
  onGenerarMasivoContratistas,
  onVerComprobante,
  onEliminarLiquidacion,
}) => {
  const [selectedContratistaId, setSelectedContratistaId] = useState<number>(contratistas[0]?.id || 1);
  const [honorariosManual, setHonorariosManual] = useState<number>(contratistas[0]?.honorarios_mensuales || 4500000);
  const [diasCobro, setDiasCobro] = useState<number>(30);
  const [ibcPersonalizado, setIbcPersonalizado] = useState<number | null>(null);
  const [tarifaRetencion, setTarifaRetencion] = useState<number>(contratistas[0]?.tarifa_retencion_porc || 10.0);
  const [porcentajeEstampillas, setPorcentajeEstampillas] = useState<number>(contratistas[0]?.porcentaje_estampillas_porc || 2.5);
  const [otrosDescuentos, setOtrosDescuentos] = useState<number>(0);
  const [filtroBusqueda, setFiltroBusqueda] = useState<string>('');

  const handleContratistaChange = (cId: number) => {
    setSelectedContratistaId(cId);
    const cto = contratistas.find(c => c.id === cId);
    if (cto) {
      setHonorariosManual(cto.honorarios_mensuales);
      setTarifaRetencion(cto.tarifa_retencion_porc || 10.0);
      setPorcentajeEstampillas(cto.porcentaje_estampillas_porc || 2.5);
      setIbcPersonalizado(null);
    }
  };

  const contratistaSeleccionado = contratistas.find(c => c.id === selectedContratistaId) || contratistas[0];

  // Cálculo en vivo
  const resultadoLive = calcularCuentaCobroContratista({
    honorarios_mensuales: honorariosManual,
    dias_cobro: diasCobro,
    ibc_personalizado: ibcPersonalizado,
    tarifa_retencion_porc: tarifaRetencion,
    porcentaje_estampillas_porc: porcentajeEstampillas,
    otros_descuentos: otrosDescuentos,
  });

  const handleGuardarIndividual = () => {
    if (!contratistaSeleccionado) return;

    const nuevaLiq: LiquidacionContratista = {
      id: `liq-cto-${Date.now()}`,
      consecutivo: `CC-AMZ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      fecha_liquidacion: new Date().toISOString().split('T')[0],
      periodo_mes: periodoActivo.split(' ')[0],
      periodo_ano: parseInt(periodoActivo.split(' ')[1]) || 2026,
      contratista_id: contratistaSeleccionado.id,
      contratista: { ...contratistaSeleccionado, honorarios_mensuales: honorariosManual },
      honorarios_mensuales: honorariosManual,
      dias_cobro: diasCobro,
      honorarios_proporcionales: resultadoLive.honorarios_brutos,
      ibc_minimo: resultadoLive.ibc_minimo,
      ibc_utilizado: resultadoLive.ibc_utilizado,
      tarifa_retencion_porc: tarifaRetencion,
      retencion_fuente: resultadoLive.retencion_fuente,
      porcentaje_estampillas_porc: porcentajeEstampillas,
      estampillas_amazonas: resultadoLive.estampillas_amazonas,
      otros_descuentos: otrosDescuentos,
      total_descuentos: resultadoLive.total_descuentos,
      neto_a_recibir_por_el_contratista: resultadoLive.neto_a_recibir_por_el_contratista,
      estado: 'APROBADA',
    };

    onGuardarLiquidacion(nuevaLiq);
  };

  const liquidacionesFiltradas = liquidaciones.filter(l => {
    const cto = l.contratista || contratistas.find(c => c.id === l.contratista_id);
    if (!cto) return false;
    const term = filtroBusqueda.toLowerCase();
    return (
      (cto.nombres || '').toLowerCase().includes(term) ||
      (cto.apellidos || '').toLowerCase().includes(term) ||
      (cto.numero_documento || '').includes(term) ||
      (cto.numero_contrato || '').toLowerCase().includes(term) ||
      (cto.dependencia || '').toLowerCase().includes(term) ||
      (l.consecutivo || '').toLowerCase().includes(term)
    );
  });

  const contratistasActivosCount = contratistas.filter(c => 
    !c.estado_contrato || String(c.estado_contrato).toUpperCase() === 'ACTIVO'
  ).length;

  return (
    <div className="space-y-6">
      
      {/* Header section with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <Receipt className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 font-serif">
              Liquidación de Cuentas de Cobro - Contratistas Ley 80
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Contratos de prestación de servicios: Cálculo de IBC al 40%, Retención en la fuente y Estampillas del Departamento del Amazonas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-liquidar-todo-contratistas"
            onClick={onGenerarMasivoContratistas}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
            title="Calcular la liquidación de todos los contratistas activos"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Liquidar Todos los Contratistas ({contratistasActivosCount})</span>
          </button>

          <button
            onClick={() => exportarLiquidacionesContratistasExcel(liquidaciones, periodoActivo)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Calculator & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form Calculator (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-600" />
              Calculadora de Honorarios por Contrato
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-medium">
              Periodo: {periodoActivo}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Seleccionar Contratista */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contratista y Contrato Activo
              </label>
              <select
                id="select-contratista-ley80"
                value={selectedContratistaId}
                onChange={(e) => handleContratistaChange(Number(e.target.value))}
                className="w-full text-sm font-medium border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {contratistas.map(cto => (
                  <option key={cto.id} value={cto.id}>
                    {cto.nombres} {cto.apellidos} — {cto.numero_contrato} ({cto.dependencia})
                  </option>
                ))}
              </select>
            </div>

            {/* Honorarios Mensuales */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Honorarios Mensuales Pactados ($ COP)
              </label>
              <input
                type="number"
                value={honorariosManual}
                onChange={(e) => setHonorariosManual(Number(e.target.value))}
                className="w-full text-sm font-semibold border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                min="0"
                step="100000"
              />
            </div>

            {/* Días a Cobrar */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Días de Prestación a Cobrar (Base 30)
              </label>
              <input
                type="number"
                value={diasCobro}
                onChange={(e) => setDiasCobro(Math.min(30, Math.max(1, Number(e.target.value))))}
                className="w-full text-sm font-semibold border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                min="1"
                max="30"
              />
            </div>

            {/* Tarifa Retención en la Fuente */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tarifa Retención en la Fuente (%)
              </label>
              <div className="flex gap-2">
                {[10, 11, 4, 3.5].map((tarifa) => (
                  <button
                    key={tarifa}
                    type="button"
                    onClick={() => setTarifaRetencion(tarifa)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      tarifaRetencion === tarifa
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tarifa}%
                  </button>
                ))}
                <input
                  type="number"
                  step="0.1"
                  value={tarifaRetencion}
                  onChange={(e) => setTarifaRetencion(Number(e.target.value))}
                  className="w-20 text-xs font-bold border border-slate-300 rounded-lg px-2 py-1 bg-slate-50 text-center font-mono"
                />
              </div>
            </div>

            {/* Tarifa Estampillas Amazonas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estampillas Departamentales del Amazonas (%)
              </label>
              <div className="flex gap-2">
                {[2.5, 2.0, 3.0, 0].map((tarifa) => (
                  <button
                    key={tarifa}
                    type="button"
                    onClick={() => setPorcentajeEstampillas(tarifa)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      porcentajeEstampillas === tarifa
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tarifa}%
                  </button>
                ))}
                <input
                  type="number"
                  step="0.1"
                  value={porcentajeEstampillas}
                  onChange={(e) => setPorcentajeEstampillas(Number(e.target.value))}
                  className="w-20 text-xs font-bold border border-slate-300 rounded-lg px-2 py-1 bg-slate-50 text-center font-mono"
                />
              </div>
            </div>

            {/* IBC Personalizado Opcional */}
            <div className="md:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">
                  Ingreso Base de Cotización (IBC) Mínimo Legal:
                </span>
                <span className="font-mono font-bold text-blue-700">
                  {formatCOP(resultadoLive.ibc_minimo)} (40%)
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                La Ley colombiana estipula que el contratista debe cotizar a salud y pensión sobre mínimo el 40% del valor bruto facturado.
              </p>
            </div>

          </div>

          <div className="pt-2">
            <button
              id="btn-guardar-liquidacion-contratista"
              onClick={handleGuardarIndividual}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-200" />
              <span>Guardar / Aprobar Cuenta de Cobro en el Historial</span>
            </button>
          </div>
        </div>

        {/* Live Calculation Sheet (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-amber-950 text-white rounded-2xl p-6 shadow-md border border-amber-800/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-amber-800/80">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300">
                  Liquidación Contrato Ley 80
                </span>
                <h4 className="text-base font-bold font-serif text-white">
                  {contratistaSeleccionado?.nombres} {contratistaSeleccionado?.apellidos}
                </h4>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-900/80 text-amber-200">
                {contratistaSeleccionado?.numero_contrato}
              </span>
            </div>

            <p className="text-xs text-amber-100/80 mt-1 mb-4 line-clamp-2">
              <strong>Objeto:</strong> {contratistaSeleccionado?.objeto_contrato}
            </p>

            {/* Detalle de Cálculos */}
            <div className="space-y-2.5 text-xs">
              
              <div className="flex justify-between py-1.5 border-b border-amber-900/60 font-semibold">
                <span className="text-slate-300">Honorarios Brutos Facturados:</span>
                <span className="font-mono text-white text-sm">{formatCOP(resultadoLive.honorarios_brutos)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-amber-900/60 text-blue-300 bg-blue-950/40 px-2 rounded">
                <span>IBC Calculado para Aportes (40%):</span>
                <span className="font-mono font-bold">{formatCOP(resultadoLive.ibc_utilizado)}</span>
              </div>

              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-300 pt-2">
                Descuentos y Retenciones Territoriales (-)
              </div>

              <div className="flex justify-between py-1 border-b border-amber-900/60 text-slate-300">
                <span>Retención en la Fuente ({resultadoLive.tarifa_retencion_porc}%):</span>
                <span className="font-mono text-rose-300 font-semibold">
                  -{formatCOP(resultadoLive.retencion_fuente)}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-amber-900/60 text-amber-200 bg-amber-900/30 px-2 rounded">
                <span>Estampillas Amazonas ({resultadoLive.porcentaje_estampillas_porc}%):</span>
                <span className="font-mono text-amber-300 font-semibold">
                  -{formatCOP(resultadoLive.estampillas_amazonas)}
                </span>
              </div>

              {resultadoLive.otros_descuentos > 0 && (
                <div className="flex justify-between py-1 border-b border-amber-900/60 text-slate-300">
                  <span>Otros Descuentos:</span>
                  <span className="font-mono text-rose-300">-{formatCOP(resultadoLive.otros_descuentos)}</span>
                </div>
              )}

              <div className="flex justify-between py-1.5 font-bold text-rose-300 text-sm bg-rose-950/40 px-2 rounded">
                <span>Total Descuentos Aplicados:</span>
                <span className="font-mono">-{formatCOP(resultadoLive.total_descuentos)}</span>
              </div>
            </div>
          </div>

          {/* Big Total at bottom */}
          <div className="mt-6 pt-4 border-t border-amber-700/80">
            <div className="p-4 rounded-xl bg-amber-500 text-emerald-950 text-center shadow-lg">
              <span className="text-xs font-extrabold uppercase tracking-wider block">
                Neto a Girar al Contratista
              </span>
              <span className="text-2xl font-black font-mono tracking-tight block mt-1">
                {formatCOP(resultadoLive.neto_a_recibir_por_el_contratista)}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Table of Processed Contratistas Liquidations */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Cuentas de Cobro Aprobadas ({liquidacionesFiltradas.length})
            </h3>
            <p className="text-xs text-slate-500">
              Contratos de prestación de servicios liquidados para {periodoActivo}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por contrato, nombre o CC..."
              value={filtroBusqueda}
              onChange={(e) => setFiltroBusqueda(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <th className="py-3 px-3">Contratista</th>
                <th className="py-3 px-3">No. Contrato / Dependencia</th>
                <th className="py-3 px-3 text-right">Honorarios Brutos</th>
                <th className="py-3 px-3 text-right">IBC (40%)</th>
                <th className="py-3 px-3 text-right">Retefuente</th>
                <th className="py-3 px-3 text-right">Estampillas (2.5%)</th>
                <th className="py-3 px-3 text-right">Neto a Girar</th>
                <th className="py-3 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {liquidacionesFiltradas.map((liq) => (
                <tr key={liq.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{liq.contratista.nombres} {liq.contratista.apellidos}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{liq.contratista.tipo_documento} {liq.contratista.numero_documento}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-amber-900 font-mono">{liq.contratista.numero_contrato}</div>
                    <div className="text-[10px] text-slate-500">{liq.contratista.dependencia}</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                    {formatCOP(liq.honorarios_mensuales)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-medium text-blue-700 bg-blue-50/40">
                    {formatCOP(liq.ibc_utilizado)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-rose-700">
                    -{formatCOP(liq.retencion_fuente)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-amber-700 bg-amber-50/40">
                    -{formatCOP(liq.estampillas_amazonas)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-extrabold text-amber-950 bg-amber-100/60">
                    {formatCOP(liq.neto_a_recibir_por_el_contratista)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onVerComprobante(liq)}
                        className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 transition"
                        title="Ver Certificación de Cuenta de Cobro"
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
                        No se encontraron cuentas de cobro liquidadas para este periodo.
                      </p>
                      <button
                        onClick={onGenerarMasivoContratistas}
                        className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-200" />
                        <span>Liquidar Todos los Contratistas Ahora ({contratistasActivosCount} Contratos)</span>
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
