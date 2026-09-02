import React, { useState, useEffect } from 'react';
import { AmazonasHeader } from './components/AmazonasHeader';
import { DashboardView } from './components/DashboardView';
import { NominaPlantaView } from './components/NominaPlantaView';
import { ContratistasView } from './components/ContratistasView';
import { PersonalDirectoryView } from './components/PersonalDirectoryView';
import { CargaMasivaView } from './components/CargaMasivaView';
import { ComprobantesView } from './components/ComprobantesView';
import { AvanceProyectoView } from './components/AvanceProyectoView';
import { ComprobanteModal } from './components/ComprobanteModal';
import { SettingsModal } from './components/SettingsModal';
import { LoginView } from './components/LoginView';
import { 
  Empleado, 
  ContratistaGobierno, 
  LiquidacionPlanta, 
  LiquidacionContratista, 
  ConfiguracionEntidad,
  Usuario
} from './types';
import { 
  CONFIGURACION_DEFAULT, 
  EMPLEADOS_INICIALES, 
  CONTRATISTAS_INICIALES, 
  LIQUIDACIONES_PLANTA_INICIALES, 
  LIQUIDACIONES_CONTRATISTAS_INICIALES 
} from './data/mockData';
import { 
  initializeLocalDatabase, 
  getCurrentSession, 
  closeCurrentSession 
} from './db/localDatabase';
import { calcularNominaPlanta, calcularCuentaCobroContratista, formatCOP } from './utils/calculator';
import { CheckCircle2, Sparkles, AlertTriangle, X } from 'lucide-react';

export default function App() {
  // 1. Auto-initialize local database on startup
  useEffect(() => {
    initializeLocalDatabase();
  }, []);

  // 2. Authentication State (requires login before accessing data)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => {
    return getCurrentSession();
  });

  // Navigation & Period
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [periodoActivo, setPeriodoActivo] = useState<string>('Enero 2026');
  
  // Notification Toast State
  const [toast, setToast] = useState<{
    message: string;
    subMessage?: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);

  const triggerToast = (message: string, subMessage?: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, subMessage, type });
    setTimeout(() => {
      setToast(null);
    }, 6000);
  };
  
  // Data States with LocalStorage Persistence
  const [configuracion, setConfiguracion] = useState<ConfiguracionEntidad>(() => {
    const saved = localStorage.getItem('amz_configuracion');
    return saved ? JSON.parse(saved) : CONFIGURACION_DEFAULT;
  });

  const [empleados, setEmpleados] = useState<Empleado[]>(() => {
    const saved = localStorage.getItem('amz_empleados');
    return saved ? JSON.parse(saved) : EMPLEADOS_INICIALES;
  });

  const [contratistas, setContratistas] = useState<ContratistaGobierno[]>(() => {
    const saved = localStorage.getItem('amz_contratistas');
    return saved ? JSON.parse(saved) : CONTRATISTAS_INICIALES;
  });

  const [liquidacionesPlanta, setLiquidacionesPlanta] = useState<LiquidacionPlanta[]>(() => {
    const saved = localStorage.getItem('amz_liq_planta');
    return saved ? JSON.parse(saved) : LIQUIDACIONES_PLANTA_INICIALES;
  });

  const [liquidacionesContratistas, setLiquidacionesContratistas] = useState<LiquidacionContratista[]>(() => {
    const saved = localStorage.getItem('amz_liq_contratistas');
    return saved ? JSON.parse(saved) : LIQUIDACIONES_CONTRATISTAS_INICIALES;
  });

  // Modal States
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [comprobanteModal, setComprobanteModal] = useState<{
    open: boolean;
    data: LiquidacionPlanta | LiquidacionContratista | null;
    tipo: 'planta' | 'contratista';
  }>({
    open: false,
    data: null,
    tipo: 'planta',
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('amz_configuracion', JSON.stringify(configuracion));
  }, [configuracion]);

  useEffect(() => {
    localStorage.setItem('amz_empleados', JSON.stringify(empleados));
  }, [empleados]);

  useEffect(() => {
    localStorage.setItem('amz_contratistas', JSON.stringify(contratistas));
  }, [contratistas]);

  useEffect(() => {
    localStorage.setItem('amz_liq_planta', JSON.stringify(liquidacionesPlanta));
  }, [liquidacionesPlanta]);

  useEffect(() => {
    localStorage.setItem('amz_liq_contratistas', JSON.stringify(liquidacionesContratistas));
  }, [liquidacionesContratistas]);

  // Auth Handlers
  const handleLoginSuccess = (user: Usuario) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    closeCurrentSession();
    setCurrentUser(null);
  };

  // Liquidación masiva de empleados de planta para el periodo activo
  const handleLiquidarTodoPlanta = () => {
    const mes = periodoActivo.split(' ')[0];
    const ano = parseInt(periodoActivo.split(' ')[1]) || 2026;

    const empleadosActivos = empleados.filter(e => e.activo !== false);

    if (empleadosActivos.length === 0) {
      triggerToast(
        'No hay empleados de planta activos',
        'Por favor verifique el directorio de personal o reactive funcionarios.',
        'warning'
      );
      return;
    }

    const nuevasLiquidaciones: LiquidacionPlanta[] = empleadosActivos.map((emp, index) => {
      const resultado = calcularNominaPlanta({
        asignacion_basica: emp.asignacion_basica,
        dias_trabajados: 30,
        aplica_prima_amazonas: emp.aplica_prima_amazonas !== false,
        tiene_sindicato: Boolean(emp.tiene_sindicato),
      });

      return {
        id: `liq-planta-${emp.id}-${ano}-${mes}-${Date.now()}-${index}`,
        consecutivo: `LP-AMZ-${ano}-${String(index + 1).padStart(3, '0')}`,
        fecha_liquidacion: new Date().toISOString().split('T')[0],
        periodo_mes: mes,
        periodo_ano: ano,
        empleado_id: emp.id,
        empleado: emp,
        asignacion_basica: emp.asignacion_basica,
        dias_trabajados: 30,
        sueldo_proporcional: resultado.sueldo_proporcional,
        aplica_prima_amazonas: emp.aplica_prima_amazonas !== false,
        prima_amazonas: resultado.prima_amazonas,
        auxilio_transporte: 0,
        otros_devengados: 0,
        total_devengados: resultado.total_devengados,
        aporte_salud: resultado.aporte_salud,
        aporte_pension: resultado.aporte_pension,
        tiene_sindicato: Boolean(emp.tiene_sindicato),
        cuota_sindical: resultado.cuota_sindical,
        otras_deducciones: 0,
        total_deducciones: resultado.total_deducciones,
        neto_a_pagar: resultado.neto_a_pagar,
        estado: 'APROBADA',
      };
    });

    const totalNeto = nuevasLiquidaciones.reduce((acc, curr) => acc + curr.neto_a_pagar, 0);
    const totalPrima = nuevasLiquidaciones.reduce((acc, curr) => acc + curr.prima_amazonas, 0);

    // Reemplazar liquidaciones del mismo periodo y conservar las de otros meses
    setLiquidacionesPlanta(prev => {
      const otrosPeriodos = prev.filter(p => !(p.periodo_mes === mes && p.periodo_ano === ano));
      return [...nuevasLiquidaciones, ...otrosPeriodos];
    });

    setActiveTab('planta');

    triggerToast(
      `¡Liquidación Masiva de Planta Exitosa (${periodoActivo})!`,
      `Se liquidaron ${nuevasLiquidaciones.length} servidores públicos. Total Neto: ${formatCOP(totalNeto)} • Prima Amazonas (18%): ${formatCOP(totalPrima)}`,
      'success'
    );
  };

  // Liquidación masiva de contratistas para el periodo activo
  const handleLiquidarTodoContratistas = () => {
    const mes = periodoActivo.split(' ')[0];
    const ano = parseInt(periodoActivo.split(' ')[1]) || 2026;

    const contratistasActivos = contratistas.filter(c => 
      !c.estado_contrato || String(c.estado_contrato).toUpperCase() === 'ACTIVO'
    );

    if (contratistasActivos.length === 0) {
      triggerToast(
        'No hay contratistas con contrato activo',
        'Por favor verifique el directorio de personal o reactive contratos.',
        'warning'
      );
      return;
    }

    const nuevasLiquidaciones: LiquidacionContratista[] = contratistasActivos.map((cto, index) => {
      const resultado = calcularCuentaCobroContratista({
        honorarios_mensuales: cto.honorarios_mensuales,
        dias_cobro: 30,
        tarifa_retencion_porc: cto.tarifa_retencion_porc || 10,
        porcentaje_estampillas_porc: cto.porcentaje_estampillas_porc || 2.5,
      });

      return {
        id: `liq-cto-${cto.id}-${ano}-${mes}-${Date.now()}-${index}`,
        consecutivo: `CC-AMZ-${ano}-${String(index + 1).padStart(3, '0')}`,
        fecha_liquidacion: new Date().toISOString().split('T')[0],
        periodo_mes: mes,
        periodo_ano: ano,
        contratista_id: cto.id,
        contratista: cto,
        honorarios_mensuales: cto.honorarios_mensuales,
        dias_cobro: 30,
        honorarios_proporcionales: resultado.honorarios_brutos,
        ibc_minimo: resultado.ibc_minimo,
        ibc_utilizado: resultado.ibc_utilizado,
        tarifa_retencion_porc: resultado.tarifa_retencion_porc,
        retencion_fuente: resultado.retencion_fuente,
        porcentaje_estampillas_porc: resultado.porcentaje_estampillas_porc,
        estampillas_amazonas: resultado.estampillas_amazonas,
        otros_descuentos: 0,
        total_descuentos: resultado.total_descuentos,
        neto_a_recibir_por_el_contratista: resultado.neto_a_recibir_por_el_contratista,
        estado: 'APROBADA',
      };
    });

    const totalNeto = nuevasLiquidaciones.reduce((acc, curr) => acc + curr.neto_a_recibir_por_el_contratista, 0);
    const totalEstampillas = nuevasLiquidaciones.reduce((acc, curr) => acc + curr.estampillas_amazonas, 0);

    // Reemplazar liquidaciones del mismo periodo y conservar las de otros meses
    setLiquidacionesContratistas(prev => {
      const otrosPeriodos = prev.filter(c => !(c.periodo_mes === mes && c.periodo_ano === ano));
      return [...nuevasLiquidaciones, ...otrosPeriodos];
    });

    setActiveTab('contratistas');

    triggerToast(
      `¡Liquidación Masiva de Contratistas Exitosa (${periodoActivo})!`,
      `Se liquidaron ${nuevasLiquidaciones.length} cuentas de cobro Ley 80. Total Neto: ${formatCOP(totalNeto)} • Estampillas Amazonas (2.5%): ${formatCOP(totalEstampillas)}`,
      'success'
    );
  };

  // Guardar liquidación individual
  const handleGuardarLiqPlanta = (liq: LiquidacionPlanta) => {
    setLiquidacionesPlanta(prev => [liq, ...prev.filter(p => p.id !== liq.id && !(p.empleado_id === liq.empleado_id && p.periodo_mes === liq.periodo_mes && p.periodo_ano === liq.periodo_ano))]);
    triggerToast('Liquidación individual guardada', `Se registró la liquidación de ${liq.empleado.nombres} ${liq.empleado.apellidos} por ${formatCOP(liq.neto_a_pagar)}`, 'success');
  };

  const handleGuardarLiqContratista = (liq: LiquidacionContratista) => {
    setLiquidacionesContratistas(prev => [liq, ...prev.filter(c => c.id !== liq.id && !(c.contratista_id === liq.contratista_id && c.periodo_mes === liq.periodo_mes && c.periodo_ano === liq.periodo_ano))]);
    triggerToast('Cuenta de cobro guardada', `Se registró la cuenta de cobro de ${liq.contratista.nombres} ${liq.contratista.apellidos} por ${formatCOP(liq.neto_a_recibir_por_el_contratista)}`, 'success');
  };

  // Carga Masiva - Empleados
  const handleImportarEmpleados = (nuevos: Empleado[]) => {
    let creados = 0;
    let duplicados = 0;
    const actualesDocs = new Set(empleados.map(e => e.numero_documento.trim()));
    const paraAgregar: Empleado[] = [];

    nuevos.forEach(nuevo => {
      const doc = nuevo.numero_documento.trim();
      if (actualesDocs.has(doc)) {
        duplicados++;
      } else {
        actualesDocs.add(doc);
        paraAgregar.push(nuevo);
        creados++;
      }
    });

    if (paraAgregar.length > 0) {
      setEmpleados(prev => [...paraAgregar, ...prev]);
    }

    return { creados, duplicados };
  };

  // Carga Masiva - Contratistas
  const handleImportarContratistas = (nuevos: ContratistaGobierno[]) => {
    let creados = 0;
    let duplicados = 0;
    const actualesContratos = new Set(contratistas.map(c => c.numero_contrato.trim()));
    const paraAgregar: ContratistaGobierno[] = [];

    nuevos.forEach(nuevo => {
      const numCto = nuevo.numero_contrato.trim();
      if (actualesContratos.has(numCto)) {
        duplicados++;
      } else {
        actualesContratos.add(numCto);
        paraAgregar.push(nuevo);
        creados++;
      }
    });

    if (paraAgregar.length > 0) {
      setContratistas(prev => [...paraAgregar, ...prev]);
    }

    return { creados, duplicados };
  };

  // Backup & Restore
  const handleExportarBackupJSON = () => {
    const backup = {
      configuracion,
      empleados,
      contratistas,
      liquidacionesPlanta,
      liquidacionesContratistas,
      fechaExportacion: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Nomina_Amazonas_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestaurarDatosDefecto = () => {
    setConfiguracion(CONFIGURACION_DEFAULT);
    setEmpleados(EMPLEADOS_INICIALES);
    setContratistas(CONTRATISTAS_INICIALES);
    setLiquidacionesPlanta(LIQUIDACIONES_PLANTA_INICIALES);
    setLiquidacionesContratistas(LIQUIDACIONES_CONTRATISTAS_INICIALES);
    localStorage.clear();
    initializeLocalDatabase();
  };

  // 3. Render Login View if not authenticated
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col font-sans text-slate-900">
      
      {/* Official Amazonas Header & Nav */}
      <AmazonasHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        periodoActivo={periodoActivo}
        setPeriodoActivo={setPeriodoActivo}
        configuracion={configuracion}
        currentUser={currentUser}
        onOpenSettings={() => setSettingsOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        
        {/* Floating / Top Alert Toast Banner */}
        {toast && (
          <div
            id="app-notification-toast"
            className={`p-4 rounded-2xl border shadow-lg flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-3 duration-300 ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-white border-emerald-700'
                : toast.type === 'warning'
                ? 'bg-amber-950 text-white border-amber-600'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl mt-0.5 ${
                toast.type === 'success' ? 'bg-emerald-800 text-amber-300' : 'bg-amber-800 text-white'
              }`}>
                {toast.type === 'success' ? <Sparkles className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide">
                  {toast.message}
                </h4>
                {toast.subMessage && (
                  <p className="text-xs text-emerald-100/90 mt-0.5 font-medium leading-relaxed">
                    {toast.subMessage}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              title="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {activeTab === 'dashboard' && (
          <DashboardView
            empleados={empleados}
            contratistas={contratistas}
            liquidacionesPlanta={liquidacionesPlanta}
            liquidacionesContratistas={liquidacionesContratistas}
            periodoActivo={periodoActivo}
            configuracion={configuracion}
            onNavigate={setActiveTab}
            onLiquidarTodoPlanta={handleLiquidarTodoPlanta}
            onLiquidarTodoContratistas={handleLiquidarTodoContratistas}
          />
        )}

        {activeTab === 'planta' && (
          <NominaPlantaView
            empleados={empleados}
            liquidaciones={liquidacionesPlanta}
            periodoActivo={periodoActivo}
            configuracion={configuracion}
            onGuardarLiquidacion={handleGuardarLiqPlanta}
            onGenerarMasivoPlanta={handleLiquidarTodoPlanta}
            onVerComprobante={(liq) => setComprobanteModal({ open: true, data: liq, tipo: 'planta' })}
            onEliminarLiquidacion={(id) => setLiquidacionesPlanta(prev => prev.filter(p => p.id !== id))}
          />
        )}

        {activeTab === 'contratistas' && (
          <ContratistasView
            contratistas={contratistas}
            liquidaciones={liquidacionesContratistas}
            periodoActivo={periodoActivo}
            configuracion={configuracion}
            onGuardarLiquidacion={handleGuardarLiqContratista}
            onGenerarMasivoContratistas={handleLiquidarTodoContratistas}
            onVerComprobante={(liq) => setComprobanteModal({ open: true, data: liq, tipo: 'contratista' })}
            onEliminarLiquidacion={(id) => setLiquidacionesContratistas(prev => prev.filter(c => c.id !== id))}
          />
        )}

        {activeTab === 'personal' && (
          <PersonalDirectoryView
            empleados={empleados}
            contratistas={contratistas}
            onGuardarEmpleado={(emp) => setEmpleados(prev => [emp, ...prev.filter(e => e.id !== emp.id)])}
            onEliminarEmpleado={(id) => setEmpleados(prev => prev.filter(e => e.id !== id))}
            onGuardarContratista={(cto) => setContratistas(prev => [cto, ...prev.filter(c => c.id !== cto.id)])}
            onEliminarContratista={(id) => setContratistas(prev => prev.filter(c => c.id !== id))}
          />
        )}

        {activeTab === 'cargamasiva' && (
          <CargaMasivaView
            empleadosExistentes={empleados}
            contratistasExistentes={contratistas}
            onImportarEmpleados={handleImportarEmpleados}
            onImportarContratistas={handleImportarContratistas}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'comprobantes' && (
          <ComprobantesView
            liquidacionesPlanta={liquidacionesPlanta}
            liquidacionesContratistas={liquidacionesContratistas}
            periodoActivo={periodoActivo}
            configuracion={configuracion}
            onVerComprobantePlanta={(liq) => setComprobanteModal({ open: true, data: liq, tipo: 'planta' })}
            onVerComprobanteContratista={(liq) => setComprobanteModal({ open: true, data: liq, tipo: 'contratista' })}
          />
        )}

        {activeTab === 'avance' && (
          <AvanceProyectoView
            configuracion={configuracion}
            onNavigate={setActiveTab}
          />
        )}

      </main>

      {/* Official Voucher / Receipt Modal */}
      {comprobanteModal.open && (
        <ComprobanteModal
          liquidacion={comprobanteModal.data}
          tipo={comprobanteModal.tipo}
          configuracion={configuracion}
          onClose={() => setComprobanteModal({ open: false, data: null, tipo: 'planta' })}
        />
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <SettingsModal
          configuracion={configuracion}
          currentUser={currentUser}
          onGuardarConfiguracion={setConfiguracion}
          onClose={() => setSettingsOpen(false)}
          onExportarBackupJSON={handleExportarBackupJSON}
          onRestaurarDatosDefecto={handleRestaurarDatosDefecto}
        />
      )}

      {/* Institutional Footer */}
      <footer className="bg-emerald-950 text-emerald-200/80 border-t-2 border-amber-500 py-6 text-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <p className="font-bold text-white font-serif">
              Gobernación del Departamento del Amazonas • República de Colombia
            </p>
            <p className="text-[11px] text-emerald-300">
              Calle 10 No. 10-45, Leticia, Amazonas • Secretaría de Hacienda Departamental
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <span>Prima Amazonas (18%)</span>
            <span>•</span>
            <span>Contratos Ley 80 / IBC (40%)</span>
            <span>•</span>
            <span>Estampillas Departamentales (2.5%)</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">Base de Datos Local Auto-Gestionada</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
