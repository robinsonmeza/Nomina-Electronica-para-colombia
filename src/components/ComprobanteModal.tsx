import React from 'react';
import { Printer, Download, X, ShieldCheck, Building, CheckCircle } from 'lucide-react';
import { LiquidacionPlanta, LiquidacionContratista, ConfiguracionEntidad } from '../types';
import { formatCOP } from '../utils/calculator';
import { AmazonasCoatOfArms } from './AmazonasCoatOfArms';

interface ComprobanteModalProps {
  liquidacion: LiquidacionPlanta | LiquidacionContratista | null;
  tipo: 'planta' | 'contratista';
  configuracion: ConfiguracionEntidad;
  onClose: () => void;
}

export const ComprobanteModal: React.FC<ComprobanteModalProps> = ({
  liquidacion,
  tipo,
  configuracion,
  onClose,
}) => {
  if (!liquidacion) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPlanta = tipo === 'planta';
  const liqPlanta = isPlanta ? (liquidacion as LiquidacionPlanta) : null;
  const liqCto = !isPlanta ? (liquidacion as LiquidacionContratista) : null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Container Box */}
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto print:border-none print:shadow-none print:max-w-none print:w-full">
        
        {/* Modal Top Bar (Hidden on print) */}
        <div className="bg-emerald-950 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Documento Oficial Imprimible
            </span>
            <span className="text-xs text-slate-300">• {liquidacion.consecutivo}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-900 font-sans print:p-4" id="printable-area">
          
          {/* Institutional Header with Coat of Arms */}
          <div className="border-b-2 border-emerald-900 pb-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <AmazonasCoatOfArms size="lg" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800 block">
                  República de Colombia
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 font-serif uppercase tracking-tight">
                  {configuracion.entidad}
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  NIT: {configuracion.nit} • Secretaría de Hacienda Departamental
                </p>
                <p className="text-[10px] text-slate-500">
                  {configuracion.direccion}
                </p>
              </div>
            </div>

            <div className="text-right sm:text-right border sm:border-0 border-slate-200 p-2 sm:p-0 rounded-lg">
              <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold mb-1">
                {liquidacion.consecutivo}
              </span>
              <div className="text-xs font-bold text-slate-700 font-mono">
                Fecha: {liquidacion.fecha_liquidacion}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Periodo: {liquidacion.periodo_mes} {liquidacion.periodo_ano}
              </div>
            </div>
          </div>

          {/* Title of Document */}
          <div className="text-center py-2 bg-slate-100 rounded-lg border border-slate-200">
            <h3 className="text-sm font-extrabold text-slate-900 font-serif uppercase tracking-wider">
              {isPlanta
                ? 'VOLANTE OFICIAL DE LIQUIDACIÓN DE NÓMINA INDIVIDUAL'
                : 'CERTIFICACIÓN DE CUENTA DE COBRO Y LIQUIDACIÓN DE HONORARIOS'}
            </h3>
            <span className="text-[11px] text-slate-600 font-semibold">
              {isPlanta
                ? 'RÉGIMEN SALARIAL Y PRESTACIONAL DE EMPLEADOS PÚBLICOS - DEPARTAMENTO DEL AMAZONAS'
                : 'CONTRATO DE PRESTACIÓN DE SERVICIOS - LEY 80 DE 1993'}
            </span>
          </div>

          {/* Beneficiary Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Beneficiario / Titular:</span>
              <span className="font-bold text-slate-900">
                {isPlanta
                  ? `${liqPlanta?.empleado.nombres} ${liqPlanta?.empleado.apellidos}`
                  : `${liqCto?.contratista.nombres} ${liqCto?.contratista.apellidos}`}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Identificación:</span>
              <span className="font-mono font-bold text-slate-900">
                {isPlanta
                  ? `${liqPlanta?.empleado.tipo_documento} ${liqPlanta?.empleado.numero_documento}`
                  : `${liqCto?.contratista.tipo_documento} ${liqCto?.contratista.numero_documento}`}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">
                {isPlanta ? 'Cargo / Posición:' : 'No. Contrato:'}
              </span>
              <span className="font-medium text-slate-800">
                {isPlanta ? liqPlanta?.empleado.cargo : liqCto?.contratista.numero_contrato}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Dependencia:</span>
              <span className="font-medium text-slate-800">
                {isPlanta ? liqPlanta?.empleado.dependencia : liqCto?.contratista.dependencia}
              </span>
            </div>
          </div>

          {/* Object if contractor */}
          {!isPlanta && liqCto && (
            <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200 text-xs">
              <span className="font-bold text-amber-950 block text-[10px] uppercase">Objeto Contractual:</span>
              <p className="text-slate-700 text-[11px] leading-relaxed mt-0.5">
                {liqCto.contratista.objeto_contrato}
              </p>
              <div className="flex justify-between items-center text-[10px] text-amber-900 font-semibold mt-2 pt-1 border-t border-amber-200/60">
                <span>Supervisor: {liqCto.contratista.supervisor_asignado}</span>
                <span>Vigencia: {liqCto.contratista.fecha_inicio} al {liqCto.contratista.fecha_fin}</span>
              </div>
            </div>
          )}

          {/* Financial Breakdown Table */}
          {isPlanta && liqPlanta ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="grid grid-cols-2 bg-slate-100 font-bold text-slate-700 py-2 px-3 border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <div>Conceptos Devengados (+)</div>
                <div className="text-right">Conceptos Deducidos (-)</div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-slate-200 p-3 space-y-1">
                {/* Devengados Column */}
                <div className="space-y-1.5 pr-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Sueldo Básico ({liqPlanta.dias_trabajados} días):</span>
                    <span className="font-mono font-semibold">{formatCOP(liqPlanta.sueldo_proporcional)}</span>
                  </div>
                  {liqPlanta.aplica_prima_amazonas && (
                    <div className="flex justify-between font-semibold text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded">
                      <span>Prima Amazonas (+18% Ley):</span>
                      <span className="font-mono">{formatCOP(liqPlanta.prima_amazonas)}</span>
                    </div>
                  )}
                  {liqPlanta.auxilio_transporte > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Auxilio de Transporte:</span>
                      <span className="font-mono">{formatCOP(liqPlanta.auxilio_transporte)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-900 text-sm">
                    <span>Total Devengado:</span>
                    <span className="font-mono">{formatCOP(liqPlanta.total_devengados)}</span>
                  </div>
                </div>

                {/* Deducciones Column */}
                <div className="space-y-1.5 pl-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Aporte Salud Empleado (4%):</span>
                    <span className="font-mono font-semibold text-rose-700">-{formatCOP(liqPlanta.aporte_salud)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Aporte Pensión Empleado (4%):</span>
                    <span className="font-mono font-semibold text-rose-700">-{formatCOP(liqPlanta.aporte_pension)}</span>
                  </div>
                  {liqPlanta.tiene_sindicato && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Cuota Sindical (1%):</span>
                      <span className="font-mono font-semibold text-rose-700">-{formatCOP(liqPlanta.cuota_sindical)}</span>
                    </div>
                  )}
                  {liqPlanta.otras_deducciones > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Otras Deducciones / Libranzas:</span>
                      <span className="font-mono font-semibold text-rose-700">-{formatCOP(liqPlanta.otras_deducciones)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-rose-800 text-sm">
                    <span>Total Deducciones:</span>
                    <span className="font-mono">-{formatCOP(liqPlanta.total_deducciones)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            liqCto && (
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-2 bg-slate-100 font-bold text-slate-700 py-2 px-3 border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <div>Honorarios y Base de Cotización</div>
                  <div className="text-right">Retenciones y Descuentos Departamentales</div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-slate-200 p-3 space-y-1">
                  {/* Honorarios Column */}
                  <div className="space-y-1.5 pr-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Honorarios Mensuales Pactados:</span>
                      <span className="font-mono font-semibold">{formatCOP(liqCto.honorarios_mensuales)}</span>
                    </div>
                    <div className="flex justify-between bg-blue-50 px-1.5 py-0.5 rounded text-blue-900 font-medium">
                      <span>IBC Aportes Seguridad Social (40%):</span>
                      <span className="font-mono font-bold">{formatCOP(liqCto.ibc_utilizado)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-900 text-sm">
                      <span>Total Honorarios Brutos:</span>
                      <span className="font-mono">{formatCOP(liqCto.honorarios_proporcionales)}</span>
                    </div>
                  </div>

                  {/* Retenciones Column */}
                  <div className="space-y-1.5 pl-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Retención en la Fuente ({liqCto.tarifa_retencion_porc}%):</span>
                      <span className="font-mono font-semibold text-rose-700">-{formatCOP(liqCto.retencion_fuente)}</span>
                    </div>
                    <div className="flex justify-between bg-amber-50 px-1.5 py-0.5 rounded text-amber-900 font-medium">
                      <span>Estampillas Amazonas ({liqCto.porcentaje_estampillas_porc}%):</span>
                      <span className="font-mono font-bold text-amber-800">-{formatCOP(liqCto.estampillas_amazonas)}</span>
                    </div>
                    {liqCto.otros_descuentos > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Otros Descuentos:</span>
                        <span className="font-mono font-semibold text-rose-700">-{formatCOP(liqCto.otros_descuentos)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-rose-800 text-sm">
                      <span>Total Descuentos:</span>
                      <span className="font-mono">-{formatCOP(liqCto.total_descuentos)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Highlight Net Pay Box */}
          <div className="p-4 rounded-xl bg-emerald-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-300 block">
                Valor Neto a Girar / Dispersar
              </span>
              <span className="text-xs text-emerald-100">
                Dispersión vía ACH a cuenta de ahorros registrada en Tesorería Departamental
              </span>
            </div>
            <div className="text-2xl font-black font-mono tracking-tight text-amber-300">
              {formatCOP(isPlanta ? (liqPlanta?.neto_a_pagar || 0) : (liqCto?.neto_a_recibir_por_el_contratista || 0))}
            </div>
          </div>

          {/* Legal Signatures Section */}
          <div className="grid grid-cols-3 gap-6 pt-10 mt-6 border-t border-slate-200 text-center text-xs">
            <div className="space-y-1">
              <div className="border-b border-slate-400 h-10 w-3/4 mx-auto mb-2"></div>
              <span className="font-bold block text-slate-800">{configuracion.secretario_hacienda}</span>
              <span className="text-[10px] text-slate-500 block">Secretaria de Hacienda Departamental</span>
              <span className="text-[9px] text-slate-400">Ordenadora del Gasto</span>
            </div>

            <div className="space-y-1">
              <div className="border-b border-slate-400 h-10 w-3/4 mx-auto mb-2"></div>
              <span className="font-bold block text-slate-800">Profesional de Nómina</span>
              <span className="text-[10px] text-slate-500 block">Área de Talento Humano y Pagaduría</span>
              <span className="text-[9px] text-slate-400">Elaboró y Liquidó</span>
            </div>

            <div className="space-y-1">
              <div className="border-b border-slate-400 h-10 w-3/4 mx-auto mb-2"></div>
              <span className="font-bold block text-slate-800">
                {isPlanta
                  ? `${liqPlanta?.empleado.nombres} ${liqPlanta?.empleado.apellidos}`
                  : `${liqCto?.contratista.nombres} ${liqCto?.contratista.apellidos}`}
              </span>
              <span className="text-[10px] text-slate-500 block">Firma y C.C. Beneficiario</span>
              <span className="text-[9px] text-slate-400">Recibí a entera satisfacción</span>
            </div>
          </div>

          {/* Footer certification */}
          <div className="text-center pt-4 text-[10px] text-slate-400 border-t border-slate-100 flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sistema Oficial de Nómina y Honorarios - Gobernación del Amazonas. Generado bajo normatividad salarial colombiana.</span>
          </div>

        </div>

      </div>

    </div>
  );
};
