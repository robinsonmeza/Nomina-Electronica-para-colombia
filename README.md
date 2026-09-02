# Sistema Integrado de Nómina y Honorarios - Gobernación del Amazonas 🌿🏛️

Sistema institucional para la gestión, liquidación salarial de servidores públicos de planta (con aplicación de la **Prima Especial del Amazonas del 18%**) y control integral de cuentas de cobro de contratistas de prestación de servicios bajo la **Ley 80 de 1993**.

---

## 🔐 1. Credenciales de Acceso Administrador (Login)

Para salvaguardar la confidencialidad de la información salarial y contractual de la entidad, el sistema incorpora control de acceso por autenticación y perfiles de usuario:

- **Usuario / Correo Institucional:** `admin` *(o `admin@amazonas.gov.co`)*
- **Contraseña por Defecto:** `Amazonas2026*`
- **Rol Asignado:** `SUPER_ADMIN` (Administrador General de Nómina y Secretaría de Hacienda)

> 💡 **Gestión de Seguridad:** Desde el módulo **Ajustes > Seguridad & Admin**, el administrador puede cambiar contraseñas, gestionar perfiles de usuario (`SUPER_ADMIN`, `LIQUIDADOR`, `AUDITOR`) y auditar sesiones activas.

---

## ⚡ 2. Liquidación Masiva en 1-Clic

El sistema cuenta con un motor de cálculo masivo optimizado para procesar nóminas departamentales en segundos:

### 🏛️ Nómina de Planta (Servidores Públicos)
- **Fórmula de Asignación Proporcional:** Cálculo exacto por días laborados (base 30 días).
- **Prima Especial del Amazonas (+18%):** Adición automática del 18% sobre el sueldo devengado proporcional según la Ley 43 de 1975 y régimen territorial.
- **Deducciones de Ley:** Aportes de Salud (4.0%), Pensión (4.0%), Fondo de Solidaridad Pensional (1.0% - 2.0% para salarios superiores a 4 SMMLV) y Cuota Sindical (1.0% voluntario).
- **Desprendibles Oficiales:** Generación instantánea de volantes de nómina individuales imprimibles y descargables.

### 📝 Contratistas de Prestación de Servicios (Ley 80 de 1993)
- **Ingreso Base de Cotización (IBC 40%):** Validación de aportes a seguridad social calculando automáticamente el 40% de los honorarios mensuales (mínimo 1 SMMLV).
- **Retención en la Fuente DIAN:** Aplicación de tarifas oficiales del 10% (servicios generales) o 11% (servicios especializados/declarantes).
- **Estampillas Departamentales del Amazonas (2.5%):**
  - Estampilla Pro-Desarrollo Departamental (1.0%)
  - Estampilla Pro-Cultura (1.0%)
  - Estampilla Pro-Bienestar del Adulto Mayor (0.5%)
- **Cuentas de Cobro & Certificados:** Generación de formatos estandarizados de liquidación de pago y certificación contractual.

---

## 💾 3. Arquitectura Local-First y Base de Datos

La aplicación opera con un motor de almacenamiento persistente **Local-First** que garantiza disponibilidad inmediata:

1. **Auto-inicialización:** Al abrir la aplicación, se detecta y estructura automáticamente el esquema de tablas si es la primera ejecución.
2. **Tablas Maestras Estructuradas:**
   - `usuarios`: Cuentas de acceso, credenciales y asignación de roles.
   - `empleados_planta`: Registro maestro de funcionarios, cargos, dependencias y asignaciones básicas.
   - `contratistas_gobierno`: Directorio de contratos Ley 80, números de contrato, RP/CDP, objetos y honorarios.
   - `liquidaciones_planta`: Historial de liquidaciones mensuales, devengados y deducciones.
   - `liquidaciones_contratistas`: Cuentas de cobro procesadas, retenciones y estampillas departamentales.
   - `configuracion_entidad`: Datos de la Gobernación (NIT, SMMLV, porcentajes normativos).
   - `auditoria_logs`: Registro cronológico e inmutable de eventos, logins y modificaciones.

---

## 🌐 4. Conexión a Servidor Centralizado (Modo Corporativo)

Para despliegues institucionales en la infraestructura de la Gobernación:

1. **Configuración de Endpoint:** En **Ajustes > Base de Datos & Servidor Remoto**, se puede ingresar la URL de la API central (ej. `https://nomina-api.amazonas.gov.co/api/v1`).
2. **Aprovisionamiento SQL:** Descarga de scripts SQL listos para `PostgreSQL` o `SQLite` con un solo clic.
3. **Sincronización Bidireccional:** Capacidad de trabajo offline en corregimientos departamentales con sincronización automática al recuperar conectividad.

---

## 📊 5. Carga Masiva y Exportación Financiera

- **Importador Excel / CSV:** Permite cargar planillas de empleados y contratistas con validación de columnas, autocompletado y detección de registros duplicados.
- **Dispersión Bancaria (ACH):** Generación de archivos planos y consolidados bancarios para el pago masivo a través de entidades financieras.
- **Exportación a Excel:** Descarga de resúmenes consolidados de planta, contratistas y recaudo de estampillas.

---

## 📋 6. Marco Normativo y Tarifas Aplicables

| Concepto | Porcentaje / Regla | Base Legal |
| :--- | :--- | :--- |
| **Prima Especial del Amazonas** | **+18%** sobre asignación básica devengada | Ley 43 de 1975 / Régimen salarial territorial Amazonas |
| **Aportes Salud Servidor** | **4.0%** sobre devengado | Ley 100 de 1993 |
| **Aportes Pensión Servidor** | **4.0%** sobre devengado | Ley 100 de 1993 |
| **Fondo de Solidaridad Pensional** | **1.0% a 2.0%** (> 4 SMMLV) | Ley 797 de 2003 |
| **Cuota Sindical** | **1.0%** (si está afiliado) | Estatutos sindicales |
| **IBC Contratistas Ley 80** | **40%** de honorarios mensuales | Ley 80 de 1993 / Ley 1150 / Estatuto Tributario |
| **Estampillas Departamentales** | **2.5%** sobre honorarios brutos | Ordenanzas Departamentales de la Asamblea del Amazonas |
| **Retención en la Fuente** | **10% - 11%** según contrato | Estatuto Tributario Nacional |

---

## 🖥️ 7. Ejecución y Comandos del Proyecto

### Entorno de Desarrollo:
```bash
# Iniciar servidor local
npm run dev
```
Acceso en el navegador: `http://localhost:3000`

### Verificación y Calidad:
```bash
# Comprobación de tipos y sintaxis (Linter)
npm run lint

# Compilación para producción
npm run build
```

---

## 📁 8. Resumen de Módulos del Sistema

1. **Tablero Principal (Dashboard):** Visión general con métricas financieras, totales a girar, recaudo de estampillas y botones de liquidación masiva.
2. **Nómina de Planta:** Liquidación de servidores públicos, cálculo de Prima Amazonas (18%) y generación de desprendibles.
3. **Contratistas Ley 80:** Liquidación de cuentas de cobro, retenciones DIAN y estampillas departamentales.
4. **Directorio de Personal:** Registro y edición centralizada de servidores y contratistas.
5. **Carga Masiva:** Importación ágil de archivos Excel/CSV con plantillas oficiales descargables.
6. **Comprobantes & ACH:** Volantes oficiales imprimibles y generación de archivos para dispersión bancaria.
7. **Informe Ejecutivo:** Reporte gerencial de avance para la Secretaría de Hacienda Departamental.
8. **Ajustes & Auditoría:** Parámetros institucionales, usuarios, logs de auditoría y configuración de servidor remoto.

---

*Gobernación del Departamento del Amazonas • República de Colombia • Secretaría de Hacienda Departamental*
