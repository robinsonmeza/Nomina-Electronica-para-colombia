export interface Usuario {
  id: string;
  username: string;
  email: string;
  nombre: string;
  cargo: string;
  rol: 'SUPER_ADMIN' | 'LIQUIDADOR' | 'AUDITOR';
  activo: boolean;
  ultimoAcceso?: string;
  avatarUrl?: string;
}

export interface DatabaseStatus {
  engine: 'LOCAL_INDEXED_DB' | 'REMOTE_SERVER_API' | 'HYBRID_SYNC';
  status: 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'ERROR';
  dbName: string;
  version: number;
  totalRecords: {
    empleados: number;
    contratistas: number;
    liquidacionesPlanta: number;
    liquidacionesContratistas: number;
    usuarios: number;
  };
  serverEndpoint?: string;
  lastSync?: string;
  autoCreated: boolean;
}

export interface RemoteServerConfig {
  enabled: boolean;
  apiUrl: string;
  apiKey?: string;
  syncIntervalMinutes: number;
  mode: 'local_first' | 'server_first';
}

export interface Empleado {
  id: number;
  tipo_documento: string; // 'CC', 'CE', 'PAS', 'TI'
  numero_documento: string;
  nombres: string;
  apellidos: string;
  correo?: string;
  telefono?: string;
  cargo: string;
  dependencia: string;
  asignacion_basica: number;
  fecha_ingreso: string;
  activo: boolean;
  banco?: string;
  tipo_cuenta?: 'Ahorros' | 'Corriente';
  numero_cuenta?: string;
  tiene_sindicato?: boolean;
  aplica_prima_amazonas?: boolean;
  creado_en?: string;
}

export interface ContratistaGobierno {
  id: number;
  tipo_documento: string;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  correo?: string;
  telefono?: string;
  numero_contrato: string;
  objeto_contrato: string;
  valor_total_contrato: number;
  honorarios_mensuales: number;
  supervisor_asignado: string;
  dependencia: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado_contrato: 'ACTIVO' | 'SUSPENDIDO' | 'LIQUIDADO' | 'TERMINADO';
  tarifa_retencion_porc?: number;
  porcentaje_estampillas_porc?: number;
  banco?: string;
  tipo_cuenta?: 'Ahorros' | 'Corriente';
  numero_cuenta?: string;
}

export interface LiquidacionPlanta {
  id: string;
  consecutivo: string;
  fecha_liquidacion: string;
  periodo_mes: string; // ej. "Enero 2026"
  periodo_ano: number;
  empleado_id: number;
  empleado: Empleado;
  
  // Parámetros
  asignacion_basica: number;
  dias_trabajados: number; // base 30
  sueldo_proporcional: number;
  
  // Devengados
  aplica_prima_amazonas: boolean;
  prima_amazonas: number; // 18% del sueldo proporcional
  auxilio_transporte: number;
  otros_devengados: number;
  total_devengados: number;
  
  // Deducciones
  aporte_salud: number; // 4%
  aporte_pension: number; // 4%
  tiene_sindicato: boolean;
  cuota_sindical: number; // 1%
  otras_deducciones: number;
  total_deducciones: number;
  
  // Neto
  neto_a_pagar: number;
  estado: 'BORRADOR' | 'APROBADA' | 'PAGADA';
}

export interface LiquidacionContratista {
  id: string;
  consecutivo: string;
  fecha_liquidacion: string;
  periodo_mes: string;
  periodo_ano: number;
  contratista_id: number;
  contratista: ContratistaGobierno;
  
  // Honorarios
  honorarios_mensuales: number;
  dias_cobro: number;
  honorarios_proporcionales: number;
  
  // IBC
  ibc_minimo: number; // 40%
  ibc_utilizado: number;
  
  // Descuentos
  tarifa_retencion_porc: number;
  retencion_fuente: number;
  porcentaje_estampillas_porc: number;
  estampillas_amazonas: number; // Estampillas Departamentales
  otros_descuentos: number;
  total_descuentos: number;
  
  // Neto
  neto_a_recibir_por_el_contratista: number;
  estado: 'BORRADOR' | 'APROBADA' | 'PAGADA';
}

export interface ConfiguracionEntidad {
  entidad: string;
  nit: string;
  gobernador: string;
  secretario_hacienda: string;
  direccion: string;
  municipio: string;
  departamento: string;
  porcentaje_prima_amazonas: number; // 18%
  porcentaje_salud_empleado: number; // 4%
  porcentaje_pension_empleado: number; // 4%
  porcentaje_sindicato: number; // 1%
  tarifa_retencion_contratista_def: number; // 10%
  porcentaje_estampillas_def: number; // 2.5%
  smmlv_actual: number; // 2026 reference
  auxilio_transporte_actual: number;
}
