import React, { useState } from 'react';
import { 
  FileCheck, 
  Printer, 
  Download, 
  Search, 
  CreditCard, 
  Building, 
  Calendar, 
  CheckCircle2, 
  FileSpreadsheet,
  Layers,
  ArrowDownToLine
} from 'lucide-react';
import { LiquidacionPlanta, LiquidacionContratista, ConfiguracionEntidad } from '../types';
import { formatCOP } from '../utils/calculator';
import { exportarLiquidacionesPlantaExcel, exportarLiquidacionesContratistasExcel } from '../utils/excelHelper';
import * as XLSX from 'xlsx';

interface ComprobantesViewProps {
  liquidacionesPlanta: LiquidacionPlanta[];
  liquidacionesContratistas: LiquidacionContratista[];
  periodoActivo: string;
  configuracion: ConfiguracionEntidad;
  onVerComprobantePlanta: (liq: LiquidacionPlanta) => void;
  onVerComprobanteContratista: (liq: LiquidacionContratista) => void;
}

export const ComprobantesView: React.FC<ComprobantesViewProps> = ({
  liquidacionesPlanta,
  liquidacionesContratistas,
  periodoActivo,
  configuracion,
  onVerComprobantePlanta,
  onVerComprobanteContratista,
}) => {
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'planta' | 'contratistas'>('todos');
  const [busqueda, setBusqueda] = useState('');

  // Generar archivo de dispersión bancaria ACH para Tesorería
  const exportarDispersionBancaria = () => {
    const dispersionRows: any[] = [];

    // Empleados de Planta
    liquidacionesPlanta.forEach(l => {
      dispersionRows.push({
        'Tipo Beneficiario': 'EMPLEADO PLANTA',
        'Tipo Doc': l.empleado.tipo_documento,
        'No. Identificación': l.empleado.numero_documento,
        'Nombre Completo': `${l.empleado.nombres} ${l.empleado.apellidos}`,
        'Banco Destino': l.empleado.banco || 'Banco Agrario de Colombia',
        'Tipo Cuenta': l.empleado.tipo_cuenta || 'Ahorros',
        'No. Cuenta': l.empleado.numero_cuenta || '000000000',
        'Valor a Pagar': l.neto_a_pagar,
        'Concepto': `Pago Nómina ${l.periodo_mes} ${l.periodo_ano} - Gobernación Amazonas`,
      });
    });

    // Contratistas
    liquidacionesContratistas.forEach(l => {
      dispersionRows.push({
        'Tipo Beneficiario': 'CONTRATISTA LEY 80',
        'Tipo Doc': l.contratista.tipo_documento,
        'No. Identificación': l.contratista.numero_documento,
        'Nombre Completo': `${l.contratista.nombres} ${l.contratista.apellidos}`,
        'Banco Destino': l.contratista.banco || 'Bancolombia',
        'Tipo Cuenta': l.contratista.tipo_cuenta || 'Ahorros',
        'No. Cuenta': l.contratista.numero_cuenta || '000000000',
        'Valor a Pagar': l.neto_a_recibir_por_el_contratista,
        'Concepto': `Pago Honorarios ${l.contratista.numero_contrato} - ${l.periodo_mes} ${l.periodo_ano}`,
      });
    });

    const ws = XLSX.utils.json_to_sheet(dispersionRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dispersion_Bancaria_ACH');
    XLSX.writeFile(wb, `Plano_Dispersion_ACH_Amazonas_${periodoActivo.replace(/\s+/g, '_')}.xlsx`);
  };

  const totalGeneralNeto = 
    liquidacionesPlanta.reduce((a, b) => a + b.neto_a_pagar, 0) +
    liquidacionesContratistas.reduce((a, b) => a + b.neto_a_recibir_por_el_contratista, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <FileCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 font-serif">
              Centro de Desprendibles, Certificaciones y Reportes
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generación de volantes oficiales de pago, certificados para contratistas y archivos de dispersión ACH.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportarDispersionBancaria}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition"
          >
            <CreditCard className="w-4 h-4 text-emerald-300" />
            <span>Generar Archivo Dispersión ACH</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold uppercase">Desprendibles de Planta</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">{liquidacionesPlanta.length} Volantes</p>
          <span className="text-xs text-emerald-700 font-semibold">{formatCOP(liquidacionesPlanta.reduce((a, b) => a + b.neto_a_pagar, 0))}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold uppercase">Certificaciones Contratistas</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">{liquidacionesContratistas.length} Cuentas</p>
          <span className="text-xs text-amber-800 font-semibold">{formatCOP(liquidacionesContratistas.reduce((a, b) => a + b.neto_a_recibir_por_el_contratista, 0))}</span>
        </div>

        <div className="bg-emerald-950 text-white p-4 rounded-xl border border-emerald-800 shadow-xs">
          <span className="text-xs text-emerald-300 font-bold uppercase">Total Giro Tesorería</span>
          <p className="text-xl font-black text-amber-400 mt-1 font-mono">{formatCOP(totalGeneralNeto)}</p>
          <span className="text-xs text-emerald-200 font-medium">{periodoActivo}</span>
        </div>
      </div>

      {/* Filter and search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setFiltroTipo('todos')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filtroTipo === 'todos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Todos ({liquidacionesPlanta.length + liquidacionesContratistas.length})
          </button>
          <button
            onClick={() => setFiltroTipo('planta')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filtroTipo === 'planta' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Planta ({liquidacionesPlanta.length})
          </button>
          <button
            onClick={() => setFiltroTipo('contratistas')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filtroTipo === 'contratistas' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Contratistas ({liquidacionesContratistas.length})
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar comprobante por cédula o nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Unified List of Vouchers */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          
          {/* Planta Items */}
          {(filtroTipo === 'todos' || filtroTipo === 'planta') && liquidacionesPlanta
            .filter(l => {
              const emp = l.empleado;
              const text = `${emp?.nombres || ''} ${emp?.apellidos || ''} ${emp?.numero_documento || ''} ${l.consecutivo || ''}`.toLowerCase();
              return text.includes(busqueda.toLowerCase());
            })
            .map((liq) => (
              <div key={liq.id} className="p-4 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 flex-shrink-0 mt-0.5">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                        {liq.consecutivo}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Nómina de Planta • {liq.periodo_mes} {liq.periodo_ano}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {liq.empleado?.nombres} {liq.empleado?.apellidos}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {liq.empleado?.cargo} • {liq.empleado?.dependencia} • CC {liq.empleado?.numero_documento}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase block">Neto Pagado:</span>
                    <span className="text-base font-extrabold font-mono text-emerald-900">
                      {formatCOP(liq.neto_a_pagar)}
                    </span>
                  </div>

                  <button
                    onClick={() => onVerComprobantePlanta(liq)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Ver Volante</span>
                  </button>
                </div>
              </div>
            ))}

          {/* Contratistas Items */}
          {(filtroTipo === 'todos' || filtroTipo === 'contratistas') && liquidacionesContratistas
            .filter(l => {
              const cto = l.contratista;
              const text = `${cto?.nombres || ''} ${cto?.apellidos || ''} ${cto?.numero_documento || ''} ${l.consecutivo || ''} ${cto?.numero_contrato || ''}`.toLowerCase();
              return text.includes(busqueda.toLowerCase());
            })
            .map((liq) => (
              <div key={liq.id} className="p-4 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900 flex-shrink-0 mt-0.5">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-900 font-bold border border-amber-200">
                        {liq.consecutivo}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Contratista Ley 80 • {liq.periodo_mes} {liq.periodo_ano}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {liq.contratista?.nombres} {liq.contratista?.apellidos}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {liq.contratista?.numero_contrato} • {liq.contratista?.dependencia} • CC {liq.contratista?.numero_documento}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase block">Neto a Girar:</span>
                    <span className="text-base font-extrabold font-mono text-amber-900">
                      {formatCOP(liq.neto_a_recibir_por_el_contratista)}
                    </span>
                  </div>

                  <button
                    onClick={() => onVerComprobanteContratista(liq)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Ver Certificado</span>
                  </button>
                </div>
              </div>
            ))}

        </div>
      </div>

    </div>
  );
};
