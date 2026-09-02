import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

// --- IMPORTACIONES BASE Y RRHH ---
import LoginPage from '../../modules/auth/LoginPage';
import WelcomePage from '../../modules/inicio/Index';
import { IndexRRHHPage } from '../../modules/rrhh/pages/index';
import { RRHHLayout } from '../../modules/rrhh/components/RRHHLayout';
import { GruposPage } from '../../modules/rrhh/pages/grupo/GruposPage';
import { NuevoGrupoPage } from '../../modules/rrhh/pages/grupo/NuevoGrupoPage';
import { DetalleGrupoPage } from '../../modules/rrhh/pages/grupo/DetalleGrupoPage';
import { EditarGrupoPage } from '../../modules/rrhh/pages/grupo/EditarGrupoPage';
import { RolesPage } from '../../modules/rrhh/pages/rol/RolesPage';
import { NuevoRolPage } from '../../modules/rrhh/pages/rol/NuevoRolPage';
import { DetalleRolPage } from '../../modules/rrhh/pages/rol/DetalleRolPage';
import { EditarRolPage } from '../../modules/rrhh/pages/rol/EditarRolPage';
import { PuestosPage } from '../../modules/rrhh/pages/puesto/PuestosPage';
import { NuevoPuestoPage } from '../../modules/rrhh/pages/puesto/NuevoPuestoPage';
import { EditarPuestoPage } from '../../modules/rrhh/pages/puesto/EditarPuestoPage';
import { DetallePuestoPage } from '../../modules/rrhh/pages/puesto/DetallePuestoPage';
import { PersonasPage } from '../../modules/rrhh/pages/persona/PersonasPage';
import { NuevaPersonaPage } from '../../modules/rrhh/pages/persona/NuevaPersonaPage';
import { DetallePersonaPage } from '../../modules/rrhh/pages/persona/DetallePersonaPage';
import { EditarPersonaPage } from '../../modules/rrhh/pages/persona/EditarPersonaPage';
import AccesoDenegadoPage from '../../modules/auth/AccesoDenegadoPage';
import { AccesoPendientePage } from '../../modules/auth/AccesoPendientePage';
import { DocumentosPersonaPage } from '../../modules/rrhh/pages/persona/DocumentosPersonaPage';
import { CapacitacionesPersonaPage } from '../../modules/rrhh/pages/persona/CapacitacionesPersonaPage';
import { CapacitacionesPage } from '../../modules/rrhh/pages/capacitacion/CapacitacionesPage';
import { CapacitacionFormPage } from '../../modules/rrhh/pages/capacitacion/CapacitacionFormPage';
import { CapacitacionDetallePage } from '../../modules/rrhh/pages/capacitacion/CapacitacionDetallePage';

// --- IMPORTACIONES DE LABORATORIOS ---
import { LaboratoriosPage } from '../../modules/laboratorios/pages/LaboratoriosPage';
import { LaboratoriosLayout } from '../../modules/laboratorios/LaboratoriosLayout';
import { EquiposPage } from '../../modules/laboratorios/pages/equipos/EquiposPages';
import { ServiciosPage } from '../../modules/laboratorios/pages/servicios/ServiciosPage';
import DashboardLaboratorios from '../../modules/laboratorios/pages/DashboardLaboratorios';

// --- IMPORTACIONES DE USUARIOS ---
import { UsuarioFormPage } from '../../modules/usuarios/UsuarioFormPage';
import { UsuariosLayout } from '../../modules/usuarios/UsuariosLayout';
import { UsuariosPage } from '../../modules/usuarios/UsuariosPage';
import { UsuariosGruposPage } from '../../modules/usuarios/UsuariosGrupoPage';
import { SesionesActivasPage } from '../../modules/usuarios/SesionesActivasPage';
import { GrupoFormPage } from '../../modules/usuarios/GrupoFormPage';
import { ConfiguracionGeneralPage } from '../../modules/usuarios/ConfiguracionGeneralPage';
import { PreferenciasPage } from '../../modules/usuarios/PreferenciasPage';

// --- GESTOR DOCUMENTAL ---
import { GestorDocumentalPage } from '../../modules/gestor_documental/pages/index';
import { NuevaCarpetaPage } from '../../modules/gestor_documental/pages/NuevaCarpetaPage';
import { GestorDocumentalLayout } from '../../modules/gestor_documental/components/GDLayout';
import { NuevoFicheroPage } from '../../modules/gestor_documental/pages/NuevoFicheroPage';
import { MoverDocumentosPage } from '../../modules/gestor_documental/pages/MoverDocumentoPage';
import { DetalleDocumentoPage } from '../../modules/gestor_documental/pages/DetalleDocumentoPage';
import LayoutConfiguracion from '../../modules/gestor_documental/components/LayoutConfiguracion';
import { LibreriasConfigPage } from '../../modules/gestor_documental/pages/configuracion/LibreriaConfigPage';
import { AreasConfigPage } from '../../modules/gestor_documental/pages/configuracion/AreasConfigPage';
import { CarpetasConfigPage } from '../../modules/gestor_documental/pages/configuracion/CarpetasConfigPage';
import { CircuitosConfigPage } from '../../modules/gestor_documental/pages/configuracion/CircuitosConfigPage';
import { FasesConfigPage } from '../../modules/gestor_documental/pages/configuracion/FasesConfigPage';
import { NuevoCircuitoPage } from '../../modules/gestor_documental/pages/configuracion/NuevoCircuitoPage';
import { NuevaFasePage } from '../../modules/gestor_documental/pages/configuracion/NuevaFasePage';
import { EditarFasePage } from '../../modules/gestor_documental/pages/configuracion/EditarFasePage';

import { AuditoriaPage } from '../../modules/auditoria/AuditoriaPage';

// --- IMPORTACIONES CALIDAD ---
import { CalidadLayout } from '../../modules/calidad/CalidadLayout';
import { AuditoriasPage } from '../../modules/calidad/pages/AuditoriasPage';
import { AuditoriaFormPage } from '../../modules/calidad/pages/AuditoriaFormPage';
import { AuditoriaDetallePage } from '../../modules/calidad/pages/AuditoriaDetallePage';
import { NoConformidadesPage } from '../../modules/calidad/pages/NoConformidadesPage';
import { NuevaNcPage } from '../../modules/calidad/pages/NuevaNcPage';
import { DetalleNcPage } from '../../modules/calidad/pages/DetalleNcPage';
import { PlanAccionPage } from '../../modules/calidad/pages/PlanAccionPage';
import { RiesgosOportunidadesPage } from '../../modules/calidad/pages/RiesgosOportunidadesPage';
import { RiesgoFormPage } from '../../modules/calidad/pages/RiesgoFormPage';
import { RiesgoDetallePage } from '../../modules/calidad/pages/RiesgoDetallePage';
import { RiesgoSeguimientoPage } from '../../modules/calidad/pages/RiesgoSeguimientoPage';
import { QuejasPage } from '../../modules/calidad/pages/QuejasPage';
import { QuejaFormPage } from '../../modules/calidad/pages/QuejaFormPage';
import { QuejaDetallePage } from '../../modules/calidad/pages/QuejaDetallePage';
import { QuejaSeguimientoPage } from '../../modules/calidad/pages/QuejaSeguimientoPage';

// --- IMPORTACIONES ADMINISTRATIVO (NUEVO) ---
import { AdministrativoLayout } from '../../modules/administrativo/components/AdministrativoLayout';
import BandejaTrabajoPage from '../../modules/administrativo/pages/BandejaTrabajoPage';
import RecepcionesPage from '../../modules/administrativo/pages/RecepcionesPage';
import ClientesPage from '../../modules/administrativo/pages/ClientesPage';
import CertificadosPage from '../../modules/administrativo/pages/CertificadosPage';
import ReportesPage from '../../modules/administrativo/pages/ReportesPage';
import DashboardClientes from '../../modules/inicio/pages/DashboardClientes';

// --- PÚBLICO (sin sesión) ---
import VerificarCertificadoPage from '../../modules/publico/pages/VerificarCertificadoPage';
import VerificarDocumentoPage from '../../modules/publico/pages/VerificarDocumentoPage';

const AppRouter = () => {
  return (
    <QueryClientProvider client={queryClient}>
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/403" element={<AccesoDenegadoPage />} />
        <Route path="/espera" element={<AccesoPendientePage />} />
        <Route path="/verificar/:codigo" element={<VerificarCertificadoPage />} />
        <Route path="/verificar-documento/:codigo" element={<VerificarDocumentoPage />} />

        <Route path="/usuarios" element={<UsuariosLayout />}>
          <Route index element={<UsuariosPage />} />
          <Route path="nuevo" element={<UsuarioFormPage />} />
          <Route path="editar/:id" element={<UsuarioFormPage />} />
          <Route path="grupos" element={<UsuariosGruposPage />} />
          <Route path="grupos/nuevo" element={<GrupoFormPage />} />
          <Route path="grupos/editar/:id" element={<GrupoFormPage />} />
          <Route path="sesiones" element={<SesionesActivasPage />} />
          <Route path="configuracion" element={<ConfiguracionGeneralPage />} />
        </Route>

        <Route path="/preferencias" element={<PreferenciasPage />} />

        <Route path="/rrhh" element={<RRHHLayout />}>
          <Route index element={<IndexRRHHPage />} />
          <Route path="grupos" element={<GruposPage />} />
          <Route path="grupos/nuevo" element={<NuevoGrupoPage />} />
          <Route path="grupos/:id" element={<DetalleGrupoPage />} />
          <Route path="grupos/editar/:id" element={<EditarGrupoPage />} />
          <Route path="puestos" element={<PuestosPage />} />
          <Route path="puestos/nuevo" element={<NuevoPuestoPage />} />
          <Route path="puestos/:id" element={<DetallePuestoPage />} />
          <Route path="puestos/editar/:id" element={<EditarPuestoPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="roles/nuevo" element={<NuevoRolPage />} />
          <Route path="roles/:id" element={<DetalleRolPage />} />
          <Route path="roles/editar/:id" element={<EditarRolPage />} />
          <Route path="personas" element={<PersonasPage />} />
          <Route path="personas/nuevo" element={<NuevaPersonaPage />} />
          <Route path="personas/:id" element={<DetallePersonaPage />} />
          <Route path="personas/editar/:id" element={<EditarPersonaPage />} />
          <Route path="personas/:id/documentos" element={<DocumentosPersonaPage />} />
          <Route path="personas/:id/capacitaciones-archivos" element={<CapacitacionesPersonaPage />} />
          <Route path="capacitaciones" element={<CapacitacionesPage />} />
          <Route path="capacitaciones/nueva" element={<CapacitacionFormPage />} />
          <Route path="capacitaciones/:id" element={<CapacitacionDetallePage />} />
          <Route path="capacitaciones/editar/:id" element={<CapacitacionFormPage />} />
          <Route path="personalizacion" element={<div>Configuración de RRHH</div>} />
        </Route>
        
        <Route path="/laboratorios" element={<LaboratoriosLayout />}>
          <Route index element={<LaboratoriosPage />} />
          <Route path="equipos" element={<EquiposPage />} />
          <Route path="servicios" element={<ServiciosPage />} />
          <Route path="dashboard" element={<DashboardLaboratorios />} />
        </Route>
        
        <Route path="/gestordocumental" element={<GestorDocumentalLayout />}>
          <Route index element={<GestorDocumentalPage />} />
          <Route path="carpeta/:id" element={<GestorDocumentalPage />} />
          <Route path="nueva-carpeta" element={<NuevaCarpetaPage />} />
          <Route path="nuevo-fichero" element={<NuevoFicheroPage />} />
          <Route path="mover-documentos" element={<MoverDocumentosPage />} />
          <Route path="documento/:id" element={<DetalleDocumentoPage />} />
        </Route>

        <Route path="/gestordocumental/configuracion" element={<LayoutConfiguracion />}>
          <Route index element={<LibreriasConfigPage />} />
          <Route path="areas" element={<AreasConfigPage />} />
          <Route path="carpetas" element={<CarpetasConfigPage />} />
          <Route path="circuitos" element={<CircuitosConfigPage />} />
          <Route path="circuitos/:circuitoId/fases" element={<FasesConfigPage />} />
          <Route path="circuitos/nuevo" element={<NuevoCircuitoPage />} />
          <Route path="circuitos/:circuitoId/fases/nueva" element={<NuevaFasePage />} /> 
          <Route path="circuitos/:circuitoId/fases/:faseId/editar" element={<EditarFasePage />} />
        </Route>

        <Route path="/auditoria" element={<AuditoriaPage />} />

        {/* --- MÓDULO CALIDAD --- */}
        <Route path="/calidad" element={<CalidadLayout />}>
          <Route index element={<AuditoriasPage />} />
          <Route path="auditorias" element={<AuditoriasPage />} />
          <Route path="auditorias/nueva" element={<AuditoriaFormPage />} />
          <Route path="auditorias/editar/:id" element={<AuditoriaFormPage />} />
          <Route path="auditorias/:id" element={<AuditoriaDetallePage />} />
          <Route path="auditorias/:auditoriaId/nc/nueva" element={<NuevaNcPage />} />
          <Route path="auditorias/:auditoriaId/nc/editar/:ncId" element={<NuevaNcPage />} />
          <Route path="auditorias/:auditoriaId/nc/:ncId" element={<DetalleNcPage />} />
          <Route path="auditorias/:auditoriaId/nc/:ncId/plan-accion" element={<PlanAccionPage />} />
          <Route path="riesgos" element={<RiesgosOportunidadesPage />} />
          <Route path="riesgos/nueva" element={<RiesgoFormPage />} />
          <Route path="riesgos/editar/:id" element={<RiesgoFormPage />} />
          <Route path="riesgos/:id/seguimiento" element={<RiesgoSeguimientoPage />} />
          <Route path="riesgos/:id" element={<RiesgoDetallePage />} />
          <Route path="quejas" element={<QuejasPage />} />
          <Route path="quejas/nueva" element={<QuejaFormPage />} />
          <Route path="quejas/editar/:id" element={<QuejaFormPage />} />
          <Route path="quejas/:id/seguimiento" element={<QuejaSeguimientoPage />} />
          <Route path="quejas/:id" element={<QuejaDetallePage />} />
        </Route>

        {/* --- NUEVO MÓDULO ADMINISTRATIVO --- */}
        <Route path="/administrativo" element={<AdministrativoLayout />}>
          <Route path="recepciones" element={<BandejaTrabajoPage />} />
          <Route path="ordenes" element={<RecepcionesPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="certificados" element={<CertificadosPage />} />
          <Route path="reportes" element={<ReportesPage />} />
          <Route path="dashboard-clientes" element={<DashboardClientes />} />
        </Route>
        
      </Routes>
    </Router>
    </QueryClientProvider>
  );
};

export default AppRouter;