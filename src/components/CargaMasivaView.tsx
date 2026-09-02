import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  HelpCircle,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import { Empleado, ContratistaGobierno } from '../types';
import { descargarPlantillaEmpleados, descargarPlantillaContratistas, parsearArchivoExcelOCSV } from '../utils/excelHelper';

interface CargaMasivaProps {
  empleadosExistentes: Empleado[];
  contratistasExistentes: ContratistaGobierno[];
  onImportarEmpleados: (nuevos: Empleado[]) => { creados: number; duplicados: number };
  onImportarContratistas: (nuevos: ContratistaGobierno[]) => { creados: number; duplicados: number };
  onNavigate: (tab: string) => void;
}

export const CargaMasivaView: React.FC<CargaMasivaProps> = ({
  empleadosExistentes,
  contratistasExistentes,
  onImportarEmpleados,
  onImportarContratistas,
  onNavigate,
}) => {
  const [tipoImportacion, setTipoImportacion] = useState<'empleados' | 'contratistas'>('empleados');
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [filasLeidas, setFilasLeidas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultadoImportacion, setResultadoImportacion] = useState<{ creados: number; duplicados: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    procesarArchivo(file);
  };

  const procesarArchivo = async (file: File) => {
    setCargando(true);
    setErrorMsg(null);
    setResultadoImportacion(null);
    setArchivoSeleccionado(file);

    try {
      const data = await parsearArchivoExcelOCSV(file);
      if (!data || data.length === 0) {
        throw new Error('El archivo no contiene registros o está vacío.');
      }

      // Validar columnas obligatorias según FastAPI schema
      const primeraFila = data[0] || {};
      const columnas = Object.keys(primeraFila);

      if (tipoImportacion === 'empleados') {
        const required = ['tipo_documento', 'numero_documento', 'nombres', 'apellidos'];
        const faltantes = required.filter(r => !columnas.includes(r));
        if (faltantes.length > 0) {
          throw new Error(`Faltan columnas obligatorias para empleados: ${faltantes.join(', ')}`);
        }
      } else {
        const required = ['tipo_documento', 'numero_documento', 'nombres', 'numero_contrato', 'honorarios_mensuales'];
        const faltantes = required.filter(r => !columnas.includes(r));
        if (faltantes.length > 0) {
          throw new Error(`Faltan columnas obligatorias para contratistas: ${faltantes.join(', ')}`);
        }
      }

      setFilasLeidas(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error procesando el archivo.');
      setFilasLeidas([]);
    } finally {
      setCargando(false);
    }
  };

  const confirmarCargue = () => {
    if (filasLeidas.length === 0) return;

    if (tipoImportacion === 'empleados') {
      const listaMapeada: Empleado[] = filasLeidas.map((row, idx) => ({
        id: Date.now() + idx,
        tipo_documento: String(row.tipo_documento || 'CC').trim(),
        numero_documento: String(row.numero_documento).trim(),
        nombres: String(row.nombres || '').trim(),
        apellidos: String(row.apellidos || '').trim(),
        correo: row.correo ? String(row.correo).trim() : undefined,
        telefono: row.telefono ? String(row.telefono).trim() : undefined,
        cargo: String(row.cargo || 'Funcionario Público').trim(),
        dependencia: String(row.dependencia || 'Gobernación del Amazonas').trim(),
        asignacion_basica: Number(row.asignacion_basica) || 3000000,
        fecha_ingreso: row.fecha_ingreso ? String(row.fecha_ingreso).trim() : new Date().toISOString().split('T')[0],
        activo: true,
        tiene_sindicato: String(row.tiene_sindicato || '').toUpperCase() === 'SI' || row.tiene_sindicato === true,
        aplica_prima_amazonas: String(row.aplica_prima_amazonas || '').toUpperCase() !== 'NO',
        banco: row.banco ? String(row.banco).trim() : 'Banco Agrario',
        numero_cuenta: row.numero_cuenta ? String(row.numero_cuenta).trim() : undefined,
      }));

      const res = onImportarEmpleados(listaMapeada);
      setResultadoImportacion(res);
    } else {
      const listaMapeada: ContratistaGobierno[] = filasLeidas.map((row, idx) => ({
        id: Date.now() + idx,
        tipo_documento: String(row.tipo_documento || 'CC').trim(),
        numero_documento: String(row.numero_documento).trim(),
        nombres: String(row.nombres || '').trim(),
        apellidos: String(row.apellidos || '').trim(),
        correo: row.correo ? String(row.correo).trim() : undefined,
        telefono: row.telefono ? String(row.telefono).trim() : undefined,
        numero_contrato: String(row.numero_contrato || `CTO-AMZ-2026-${idx + 100}`).trim(),
        objeto_contrato: String(row.objeto_contrato || 'Prestación de servicios profesionales').trim(),
        valor_total_contrato: Number(row.valor_total_contrato) || (Number(row.honorarios_mensuales || 3000000) * 10),
        honorarios_mensuales: Number(row.honorarios_mensuales) || 3000000,
        supervisor_asignado: String(row.supervisor_asignado || 'Supervisor de Contrato').trim(),
        dependencia: String(row.dependencia || 'Secretaría General').trim(),
        fecha_inicio: row.fecha_inicio ? String(row.fecha_inicio).trim() : new Date().toISOString().split('T')[0],
        fecha_fin: row.fecha_fin ? String(row.fecha_fin).trim() : '2026-12-31',
        estado_contrato: 'ACTIVO',
        tarifa_retencion_porc: Number(row.tarifa_retencion_porc) || 10,
        porcentaje_estampillas_porc: Number(row.porcentaje_estampillas_porc) || 2.5,
        banco: row.banco ? String(row.banco).trim() : 'Bancolombia',
        numero_cuenta: row.numero_cuenta ? String(row.numero_cuenta).trim() : undefined,
      }));

      const res = onImportarContratistas(listaMapeada);
      setResultadoImportacion(res);
    }

    setFilasLeidas([]);
    setArchivoSeleccionado(null);
  };

  const cargarEjemploDemostracion = () => {
    if (tipoImportacion === 'empleados') {
      const demoEmpleados = [
        {
          tipo_documento: 'CC',
          numero_documento: '1058' + Math.floor(100000 + Math.random() * 900000),
          nombres: 'Lina Patricia',
          apellidos: 'Macuna Yucuna',
          correo: 'lina.macuna@amazonas.gov.co',
          telefono: '315 889 2011',
          cargo: 'Profesional Especializado en Tesorería',
          dependencia: 'Secretaría de Hacienda Departamental',
          asignacion_basica: 4600000,
          fecha_ingreso: '2022-04-01',
          banco: 'Banco Agrario de Colombia',
          numero_cuenta: '0849201948',
          tiene_sindicato: 'SI',
          aplica_prima_amazonas: 'SI'
        },
        {
          tipo_documento: 'CC',
          numero_documento: '1004' + Math.floor(100000 + Math.random() * 900000),
          nombres: 'Guillermo',
          apellidos: 'Tikuna Murui',
          correo: 'guillermo.tikuna@amazonas.gov.co',
          telefono: '312 901 4455',
          cargo: 'Técnico Operativo de Transporte Fluvial',
          dependencia: 'Secretaría de Infraestructura y Transporte',
          asignacion_basica: 2600000,
          fecha_ingreso: '2023-01-15',
          banco: 'Banco de Bogotá',
          numero_cuenta: '194029482',
          tiene_sindicato: 'NO',
          aplica_prima_amazonas: 'SI'
        }
      ];
      setFilasLeidas(demoEmpleados);
      setArchivoSeleccionado(new File([''], 'ejemplo_empleados_amazonas.xlsx'));
    } else {
      const demoContratistas = [
        {
          tipo_documento: 'CC',
          numero_documento: '1098' + Math.floor(100000 + Math.random() * 900000),
          nombres: 'Rodrigo',
          apellidos: 'Bermúdez Leticiano',
          correo: 'rodrigo.bermudez@amazonas.gov.co',
          telefono: '311 400 9988',
          numero_contrato: `CTO-AMZ-2026-${Math.floor(200 + Math.random() * 800)}`,
          objeto_contrato: 'Prestación de servicios profesionales para la gestión y seguimiento del Plan Departamental de Aguas y Saneamiento Básico.',
          valor_total_contrato: 50000000,
          honorarios_mensuales: 5000000,
          supervisor_asignado: 'Ing. Carlos Mendoza (Sec. Infraestructura)',
          dependencia: 'Secretaría de Infraestructura Departamental',
          fecha_inicio: '2026-02-01',
          fecha_fin: '2026-11-30',
          tarifa_retencion_porc: 10,
          porcentaje_estampillas_porc: 2.5,
          banco: 'Bancolombia',
          numero_cuenta: '84920194820'
        }
      ];
      setFilasLeidas(demoContratistas);
      setArchivoSeleccionado(new File([''], 'ejemplo_contratistas_amazonas.xlsx'));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-100 text-teal-800">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 font-serif">
              Módulo de Carga Masiva (Excel / CSV)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Importación automatizada de nómina de servidores públicos y contratos Ley 80 con detección inteligente de duplicados.
          </p>
        </div>

        {/* Download templates buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={descargarPlantillaEmpleados}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 transition"
          >
            <Download className="w-4 h-4" />
            <span>Plantilla Empleados (.xlsx)</span>
          </button>

          <button
            onClick={descargarPlantillaContratistas}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300 transition"
          >
            <Download className="w-4 h-4" />
            <span>Plantilla Contratistas (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Target selector and dropzone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Upload Box (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          
          {/* Target Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Selecciona el Tipo de Registro a Importar:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTipoImportacion('empleados');
                  setFilasLeidas([]);
                  setArchivoSeleccionado(null);
                }}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  tipoImportacion === 'empleados'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-lg ${tipoImportacion === 'empleados' ? 'bg-emerald-700 text-white' : 'bg-slate-100'}`}>
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Servidores de Planta</div>
                  <div className="text-[10px] text-slate-500">Nómina mensual y Prima Amazonas</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTipoImportacion('contratistas');
                  setFilasLeidas([]);
                  setArchivoSeleccionado(null);
                }}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  tipoImportacion === 'contratistas'
                    ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-lg ${tipoImportacion === 'contratistas' ? 'bg-amber-600 text-white' : 'bg-slate-100'}`}>
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Contratistas Ley 80</div>
                  <div className="text-[10px] text-slate-500">Honorarios, IBC y Estampillas</div>
                </div>
              </button>
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Sube el Archivo Excel o CSV:
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) procesarArchivo(file);
              }}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/80 hover:bg-emerald-50/30 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="p-3.5 rounded-full bg-emerald-100 text-emerald-800">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Haz clic para examinar o arrastra tu archivo aquí
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Formatos compatibles: Microsoft Excel (.xlsx, .xls) o Valores separados por comas (.csv)
                </p>
              </div>
              {archivoSeleccionado && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold">
                  <span>{archivoSeleccionado.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Demonstration shortcut */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-xs text-slate-500">¿No tienes un archivo a la mano?</span>
            <button
              type="button"
              onClick={cargarEjemploDemostracion}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Cargar datos de prueba de la Gobernación</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Error en la validación:</strong>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {resultadoImportacion && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>¡Carga Masiva Exitosa!</span>
              </div>
              <p>
                Se registraron <strong>{resultadoImportacion.creados}</strong> nuevos registros en la base de datos local.
                {resultadoImportacion.duplicados > 0 && (
                  <span className="text-amber-800 ml-1">
                    (Se omitieron <strong>{resultadoImportacion.duplicados}</strong> duplicados existentes).
                  </span>
                )}
              </p>
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => onNavigate(tipoImportacion === 'empleados' ? 'planta' : 'contratistas')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                >
                  <span>Ir a Liquidación</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Technical Schema & Help (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Database className="w-4 h-4" />
              <span>Validación de Columnas (FastAPI & Pandas)</span>
            </div>
            <h3 className="text-base font-bold text-white font-serif mb-3">
              Estructura Obligatoria de Datos
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              El motor de validación local procesa automáticamente los encabezados idénticos a los del backend en Python.
            </p>

            {tipoImportacion === 'empleados' ? (
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                  <span className="text-emerald-400 font-bold">tipo_documento:</span> CC, CE, PAS
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                  <span className="text-emerald-400 font-bold">numero_documento:</span> Número único (index)
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                  <span className="text-emerald-400 font-bold">nombres / apellidos:</span> Texto
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                  <span className="text-emerald-400 font-bold">fecha_ingreso:</span> AAAA-MM-DD
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                  <span className="text-amber-400 font-bold">aplica_prima_amazonas:</span> SI / NO
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                  <span className="text-amber-400 font-bold">numero_contrato:</span> CTO-AMZ-2026-XXX
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                  <span className="text-amber-400 font-bold">honorarios_mensuales:</span> Valor en COP
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                  <span className="text-amber-400 font-bold">objeto_contrato:</span> Descripción
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                  <span className="text-amber-400 font-bold">supervisor_asignado:</span> Funcionario
                </div>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-[11px] text-emerald-200">
            <strong>Protección de Duplicados:</strong> Si una cédula o contrato ya existe en el sistema local, el cargador lo omitirá automáticamente sin interrumpir el resto de los registros.
          </div>
        </div>

      </div>

      {/* Preview Table if rows read */}
      {filasLeidas.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Vista Previa de Registros a Importar ({filasLeidas.length} filas detectadas)
              </h3>
              <p className="text-xs text-slate-500">
                Verifica los datos antes de sincronizarlos con la base de datos local
              </p>
            </div>

            <button
              id="btn-confirmar-cargue-masivo"
              onClick={confirmarCargue}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Confirmar e Importar {filasLeidas.length} Registros</span>
            </button>
          </div>

          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 sticky top-0">
                  {Object.keys(filasLeidas[0] || {}).map((col) => (
                    <th key={col} className="py-2.5 px-3 whitespace-nowrap bg-slate-100">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filasLeidas.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    {Object.values(row).map((val: any, vIdx) => (
                      <td key={vIdx} className="py-2 px-3 whitespace-nowrap text-[11px]">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
