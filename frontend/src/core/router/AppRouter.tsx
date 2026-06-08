import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { DocumentosPersonaPage } from '../../modules/rrhh/pages/persona/DocumentosPersonaPage';

// --- IMPORTACIONES DE USUARIOS CORREGIDAS ---
import { UsuarioFormPage } from '../../modules/usuarios/UsuarioFormPage';
import { UsuariosLayout } from '../../modules/usuarios/UsuariosLayout';
import { UsuariosPage } from '../../modules/usuarios/UsuariosPage';
import { UsuariosGruposPage } from '../../modules/usuarios/UsuariosGrupoPage';
import { GrupoFormPage } from '../../modules/usuarios/GrupoFormPage';

//-----------------Gestor Documental-----------------
import { GestorDocumentalPage } from '../../modules/gestor_documental/pages/index';
import { NuevaCarpetaPage } from '../../modules/gestor_documental/pages/NuevaCarpetaPage';
import { GestorDocumentalLayout } from '../../modules/gestor_documental/components/GDLayout';
import {NuevoFicheroPage} from '../../modules/gestor_documental/pages/NuevoFicheroPage';
import { MoverDocumentosPage } from '../../modules/gestor_documental/pages/MoverDocumentoPage';
import { DetalleDocumentoPage } from '../../modules/gestor_documental/pages/DetalleDocumentoPage';
// import { ConfiguracionGestorPage } from '../../pages/gestorDocumental/configuracion/ConfiguracionGestorPage';
import  LayoutConfiguracion  from '../../modules/gestor_documental/components/LayoutConfiguracion';
import { LibreriasConfigPage } from '../../modules/gestor_documental/pages/configuracion/LibreriaConfigPage';
import { AreasConfigPage } from '../../modules/gestor_documental/pages/configuracion/AreasConfigPage';
import { CarpetasConfigPage } from '../../modules/gestor_documental/pages/configuracion/CarpetasConfigPage';
import { CircuitosConfigPage } from '../../modules/gestor_documental/pages/configuracion/CircuitosConfigPage';
import { FasesConfigPage } from '../../modules/gestor_documental/pages/configuracion/FasesConfigPage';
import { NuevoCircuitoPage } from '../../modules/gestor_documental/pages/configuracion/NuevoCircuitoPage';
import { NuevaFasePage } from '../../modules/gestor_documental/pages/configuracion/NuevaFasePage';
import { EditarFasePage } from '../../modules/gestor_documental/pages/configuracion/EditarFasePage';

import { AuditoriaPage } from '../../modules/auditoria/AuditoriaPage';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas base existentes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/403" element={<AccesoDenegadoPage />} />

        {/* ---------------------------------------------------- */}
        {/* MÓDULO DE GESTIÓN DE USUARIOS                        */}
        {/* ---------------------------------------------------- */}
        <Route path="/usuarios" element={<UsuariosLayout />}>
          <Route index element={<UsuariosPage />} />
          <Route path="nuevo" element={<UsuarioFormPage />} />
          <Route path="editar/:id" element={<UsuarioFormPage />} />

          <Route path="grupos" element={<UsuariosGruposPage />} />

          <Route path="grupos/nuevo" element={<GrupoFormPage />} />
          <Route path="grupos/editar/:id" element={<GrupoFormPage />} />
        </Route>

        {/* ---------------------------------------------------- */}
        {/* MÓDULO DE RECURSOS HUMANOS                           */}
        {/* ---------------------------------------------------- */}
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
          
          <Route path="personalizacion" element={<div>Configuración de RRHH</div>} />
        </Route>

       {/* ---------------------------------------------------- */}
        {/* MÓDULO DE GESTOR DOCUMENTAL                          */}
        {/* ---------------------------------------------------- */}
        <Route path="/gestordocumental" element={<GestorDocumentalLayout />}>
          {/* Ruta raíz (Muestra las librerías principales) */}
          <Route index element={<GestorDocumentalPage />} />
          {/* Ruta dinámica para navegar dentro de una carpeta específica */}
          <Route path="carpeta/:id" element={<GestorDocumentalPage />} />
          {/* Ruta para crear nueva carpeta */}
          <Route path="nueva-carpeta" element={<NuevaCarpetaPage />} />
          {/* Ruta para crear nuevo fichero */}
          <Route path="nuevo-fichero" element={<NuevoFicheroPage />} />
          {/* Ruta para mover documentos */}
          <Route path="mover-documentos" element={<MoverDocumentosPage />} />
          {/* Ruta para ver detalles de un documento */}
          <Route path="documento/:id" element={<DetalleDocumentoPage />} />
          
        </Route>
        {/* RUTA MAESTRA DE CONFIGURACIÓN */}
    <Route path="/gestordocumental/configuracion" element={<LayoutConfiguracion />}>
        
        {/* Redirección automática: si entra a /configuracion, lo manda a /librerias */}
        <Route index element={<LibreriasConfigPage />} />
        <Route path="areas" element={<AreasConfigPage />} />
        <Route path="carpetas" element={<CarpetasConfigPage />} />
        <Route path="circuitos" element={<CircuitosConfigPage />} />
        <Route path="circuitos/:circuitoId/fases" element={<FasesConfigPage />} />
        <Route path="circuitos/nuevo" element={<NuevoCircuitoPage />} />
        <Route path="circuitos/:circuitoId/fases/nueva" element={<NuevaFasePage />} /> 
        <Route path="circuitos/:circuitoId/fases/:faseId/editar" element={<EditarFasePage />} />
        
        {/* Las vistas que se inyectarán en el <Outlet /> */}
        {/* <Route path="librerias" element={<LibreriasConfigPage />} />
        <Route path="areas" element={<AreasConfigPage />} />
        <Route path="carpetas" element={<CarpetasConfigPage />} />
        <Route path="circuitos" element={<CircuitosConfigPage />} /> */}
        
    </Route>

        {/* ---------------------------------------------------- */}
        {/* MÓDULO DE CONFIGURACIÓN / AUDITORÍA                  */}
        {/* ---------------------------------------------------- */}
        <Route path="/auditoria" element={<AuditoriaPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;