import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Empleado, ContratistaGobierno, LiquidacionPlanta, LiquidacionContratista } from '../types';

export function descargarPlantillaEmpleados() {
  const data = [
    {
      tipo_documento: 'CC',
      numero_documento: '1058204918',
      nombres: 'Carlos Alberto',
      apellidos: 'Valderrama Yucuna',
      correo: 'carlos.valderrama@amazonas.gov.co',
      telefono: '3124589201',
      cargo: 'Profesional Especializado en Presupuesto',
      dependencia: 'Secretaría de Hacienda',
      asignacion_basica: 4850000,
      fecha_ingreso: '2021-03-15',
      banco: 'Banco Agrario',
      numero_cuenta: '048291039401',
      tiene_sindicato: 'SI',
      aplica_prima_amazonas: 'SI',
    },
    {
      tipo_documento: 'CC',
      numero_documento: '1004819203',
      nombres: 'Karen Yesenia',
      apellidos: 'Bocanegra Huitoto',
      correo: 'karen.bocanegra@amazonas.gov.co',
      telefono: '3159024411',
      cargo: 'Técnico Administrativo',
      dependencia: 'Secretaría de Salud',
      asignacion_basica: 2950000,
      fecha_ingreso: '2022-06-01',
      banco: 'Bancolombia',
      numero_cuenta: '39102948102',
      tiene_sindicato: 'NO',
      aplica_prima_amazonas: 'SI',
    }
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Plantilla_Empleados');
  XLSX.writeFile(wb, 'plantilla_importacion_empleados_amazonas.xlsx');
}

export function descargarPlantillaContratistas() {
  const data = [
    {
      tipo_documento: 'CC',
      numero_documento: '1098492018',
      nombres: 'Fernando',
      apellidos: 'Torres Benavides',
      correo: 'fernando.torres@amazonas.gov.co',
      telefono: '3109948201',
      numero_contrato: 'CTO-AMZ-2026-042',
      objeto_contrato: 'Supervisión técnica de muelles fluviales en Leticia y Puerto Nariño',
      valor_total_contrato: 45000000,
      honorarios_mensuales: 4500000,
      supervisor_asignado: 'Arq. Javier Mendoza',
      dependencia: 'Secretaría de Infraestructura',
      fecha_inicio: '2026-01-15',
      fecha_fin: '2026-11-15',
      tarifa_retencion_porc: 10.0,
      porcentaje_estampillas_porc: 2.5,
      banco: 'Bancolombia',
      numero_cuenta: '84920194820',
    }
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Plantilla_Contratistas');
  XLSX.writeFile(wb, 'plantilla_importacion_contratistas_amazonas.xlsx');
}

export async function parsearArchivoExcelOCSV(file: File): Promise<any[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'csv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          resolve(results.data as any[]);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } else if (extension === 'xlsx' || extension === 'xls') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          resolve(json);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  } else {
    throw new Error('Formato no soportado. Por favor sube un archivo .xlsx, .xls o .csv');
  }
}

export function exportarLiquidacionesPlantaExcel(liquidaciones: LiquidacionPlanta[], periodo: string) {
  const rows = liquidaciones.map(l => ({
    'Consecutivo': l.consecutivo,
    'Periodo': `${l.periodo_mes} ${l.periodo_ano}`,
    'Fecha Liquidación': l.fecha_liquidacion,
    'Tipo Doc': l.empleado.tipo_documento,
    'No. Documento': l.empleado.numero_documento,
    'Nombres': l.empleado.nombres,
    'Apellidos': l.empleado.apellidos,
    'Cargo': l.empleado.cargo,
    'Dependencia': l.empleado.dependencia,
    'Asignación Básica': l.asignacion_basica,
    'Días Trabajados': l.dias_trabajados,
    'Sueldo Proporcional': l.sueldo_proporcional,
    'Prima Amazonas (18%)': l.prima_amazonas,
    'Auxilio Transporte': l.auxilio_transporte,
    'Otros Devengados': l.otros_devengados,
    'Total Devengado': l.total_devengados,
    'Aporte Salud (4%)': l.aporte_salud,
    'Aporte Pensión (4%)': l.aporte_pension,
    'Cuota Sindical (1%)': l.cuota_sindical,
    'Otras Deducciones': l.otras_deducciones,
    'Total Deducciones': l.total_deducciones,
    'Neto a Pagar': l.neto_a_pagar,
    'Banco': l.empleado.banco || 'N/A',
    'No. Cuenta': l.empleado.numero_cuenta || 'N/A',
    'Estado': l.estado,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Nomina_Planta');
  XLSX.writeFile(wb, `Nomina_Planta_Amazonas_${periodo.replace(/\s+/g, '_')}.xlsx`);
}

export function exportarLiquidacionesContratistasExcel(liquidaciones: LiquidacionContratista[], periodo: string) {
  const rows = liquidaciones.map(l => ({
    'Consecutivo': l.consecutivo,
    'Periodo': `${l.periodo_mes} ${l.periodo_ano}`,
    'Fecha': l.fecha_liquidacion,
    'No. Contrato': l.contratista.numero_contrato,
    'Tipo Doc': l.contratista.tipo_documento,
    'No. Documento': l.contratista.numero_documento,
    'Contratista': `${l.contratista.nombres} ${l.contratista.apellidos}`,
    'Dependencia': l.contratista.dependencia,
    'Supervisor': l.contratista.supervisor_asignado,
    'Honorarios Mensuales': l.honorarios_mensuales,
    'Días Cobro': l.dias_cobro,
    'Honorarios Brutos': l.honorarios_proporcionales,
    'IBC Cotización (40%)': l.ibc_utilizado,
    'Tarifa Retefuente (%)': `${l.tarifa_retencion_porc}%`,
    'Retención en la Fuente': l.retencion_fuente,
    'Tarifa Estampillas (%)': `${l.porcentaje_estampillas_porc}%`,
    'Estampillas Amazonas': l.estampillas_amazonas,
    'Otros Descuentos': l.otros_descuentos,
    'Total Descuentos': l.total_descuentos,
    'Neto a Recibir': l.neto_a_recibir_por_el_contratista,
    'Banco': l.contratista.banco || 'N/A',
    'No. Cuenta': l.contratista.numero_cuenta || 'N/A',
    'Estado': l.estado,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Cuentas_Cobro');
  XLSX.writeFile(wb, `Cuentas_Cobro_Amazonas_${periodo.replace(/\s+/g, '_')}.xlsx`);
}
