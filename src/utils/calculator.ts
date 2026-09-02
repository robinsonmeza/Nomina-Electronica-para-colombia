import { Empleado, ContratistaGobierno, LiquidacionPlanta, LiquidacionContratista } from '../types';

export interface ParametrosNominaPlanta {
  asignacion_basica: number;
  dias_trabajados?: number;
  aplica_prima_amazonas?: boolean;
  tiene_sindicato?: boolean;
  auxilio_transporte?: number;
  otras_deducciones?: number;
  otros_devengados?: number;
}

export interface ResultadoNominaPlanta {
  sueldo_proporcional: number;
  prima_amazonas: number;
  auxilio_transporte: number;
  otros_devengados: number;
  total_devengados: number;
  
  aporte_salud: number;
  aporte_pension: number;
  cuota_sindical: number;
  otras_deducciones: number;
  total_deducciones: number;
  
  neto_a_pagar: number;
}

export function calcularNominaPlanta(params: ParametrosNominaPlanta): ResultadoNominaPlanta {
  const asignacionBasica = Number(params.asignacion_basica) || 0;
  const diasTrabajados = params.dias_trabajados !== undefined ? Number(params.dias_trabajados) : 30;
  const aplicaPrima = params.aplica_prima_amazonas !== false;
  const tieneSindicato = Boolean(params.tiene_sindicato);
  const auxTransporte = Number(params.auxilio_transporte) || 0;
  const otrosDevengados = Number(params.otros_devengados) || 0;
  const otrasDeducciones = Number(params.otras_deducciones) || 0;

  // 1. Sueldo proporcional a días trabajados (base 30 días)
  const sueldoProporcional = (asignacionBasica / 30) * diasTrabajados;

  // 2. Prima del Amazonas (18% sobre sueldo devengado proporcional)
  const primaAmazonas = aplicaPrima ? sueldoProporcional * 0.18 : 0.0;

  // Total Devengado
  const totalDevengados = sueldoProporcional + primaAmazonas + auxTransporte + otrosDevengados;

  // 3. Deducciones de Ley
  // Aporte Salud empleado: 4% sobre sueldo proporcional
  const aporteSalud = sueldoProporcional * 0.04;
  
  // Aporte Pensión empleado: 4% sobre sueldo proporcional
  const aportePension = sueldoProporcional * 0.04;

  // Cuota Sindical: 1% sobre sueldo proporcional si aplica
  const cuotaSindical = tieneSindicato ? sueldoProporcional * 0.01 : 0.0;

  // Total Deducciones
  const totalDeducciones = aporteSalud + aportePension + cuotaSindical + otrasDeducciones;

  // Neto a Pagar
  const netoPagar = totalDevengados - totalDeducciones;

  return {
    sueldo_proporcional: Math.round(sueldoProporcional * 100) / 100,
    prima_amazonas: Math.round(primaAmazonas * 100) / 100,
    auxilio_transporte: Math.round(auxTransporte * 100) / 100,
    otros_devengados: Math.round(otrosDevengados * 100) / 100,
    total_devengados: Math.round(totalDevengados * 100) / 100,
    aporte_salud: Math.round(aporteSalud * 100) / 100,
    aporte_pension: Math.round(aportePension * 100) / 100,
    cuota_sindical: Math.round(cuotaSindical * 100) / 100,
    otras_deducciones: Math.round(otrasDeducciones * 100) / 100,
    total_deducciones: Math.round(totalDeducciones * 100) / 100,
    neto_a_pagar: Math.round(netoPagar * 100) / 100,
  };
}

export interface ParametrosContratista {
  honorarios_mensuales: number;
  dias_cobro?: number;
  ibc_personalizado?: number | null;
  tarifa_retencion_porc?: number; // Ej: 10.0%
  porcentaje_estampillas_porc?: number; // Ej: 2.5%
  otros_descuentos?: number;
}

export interface ResultadoContratista {
  honorarios_brutos: number;
  dias_cobro: number;
  ibc_minimo: number;
  ibc_utilizado: number;
  tarifa_retencion_porc: number;
  retencion_fuente: number;
  porcentaje_estampillas_porc: number;
  estampillas_amazonas: number;
  otros_descuentos: number;
  total_descuentos: number;
  neto_a_recibir_por_el_contratista: number;
}

export function calcularCuentaCobroContratista(params: ParametrosContratista): ResultadoContratista {
  const honorariosBase = Number(params.honorarios_mensuales) || 0;
  const diasCobro = params.dias_cobro !== undefined ? Number(params.dias_cobro) : 30;
  const honorariosBrutos = (honorariosBase / 30) * diasCobro;

  // IBC Mínimo por Ley 80 / Estatuto: 40% del valor de honorarios
  const ibcMinimo = honorariosBrutos * 0.40;
  const ibcPersonalizado = Number(params.ibc_personalizado);
  const ibcUtilizado = (ibcPersonalizado && ibcPersonalizado >= ibcMinimo) ? ibcPersonalizado : ibcMinimo;

  const tarifaRetencion = params.tarifa_retencion_porc !== undefined ? Number(params.tarifa_retencion_porc) : 10.0;
  const porcentajeEstampillas = params.porcentaje_estampillas_porc !== undefined ? Number(params.porcentaje_estampillas_porc) : 2.5;
  const otrosDescuentos = Number(params.otros_descuentos) || 0;

  // Descuentos
  const retencion = honorariosBrutos * (tarifaRetencion / 100.0);
  const estampillas = honorariosBrutos * (porcentajeEstampillas / 100.0);
  const totalDescuentos = retencion + estampillas + otrosDescuentos;

  // Neto a Recibir
  const netoPagar = honorariosBrutos - totalDescuentos;

  return {
    honorarios_brutos: Math.round(honorariosBrutos * 100) / 100,
    dias_cobro: diasCobro,
    ibc_minimo: Math.round(ibcMinimo * 100) / 100,
    ibc_utilizado: Math.round(ibcUtilizado * 100) / 100,
    tarifa_retencion_porc: tarifaRetencion,
    retencion_fuente: Math.round(retencion * 100) / 100,
    porcentaje_estampillas_porc: porcentajeEstampillas,
    estampillas_amazonas: Math.round(estampillas * 100) / 100,
    otros_descuentos: Math.round(otrosDescuentos * 100) / 100,
    total_descuentos: Math.round(totalDescuentos * 100) / 100,
    neto_a_recibir_por_el_contratista: Math.round(netoPagar * 100) / 100,
  };
}

export function formatCOP(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return '$ 0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-CO').format(value);
}
