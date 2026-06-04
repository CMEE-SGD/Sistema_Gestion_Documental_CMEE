import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import WelcomePage from '../pages/Index';
import { IndexRRHHPage } from '@/pages/rrhh/index';
import { RRHHLayout } from '../pages/rrhh/RRHHLayout';
import { GruposPage } from '../pages/rrhh/GruposPage';
import { NuevoGrupoPage } from '../pages/rrhh/NuevoGrupoPage';
import { DetalleGrupoPage } from '../pages/rrhh/DetalleGrupoPage';
import { EditarGrupoPage } from '../pages/rrhh/EditarGrupoPage';
import { RolesPage } from '../pages/rrhh/RolesPage';
import { NuevoRolPage } from '../pages/rrhh/NuevoRolPage';
import { DetalleRolPage } from '../pages/rrhh/DetalleRolPage';
import { EditarRolPage } from '../pages/rrhh/EditarRolPage';
import { PuestosPage } from '../pages/rrhh/PuestosPage';
import { NuevoPuestoPage } from '../pages/rrhh/NuevoPuestoPage';
import { EditarPuestoPage } from '../pages/rrhh/EditarPuestoPage';
import { DetallePuestoPage } from '../pages/rrhh/DetallePuestoPage';
import { PersonasPage } from '../pages/rrhh/PersonasPage';
import { NuevaPersonaPage } from '../pages/rrhh/NuevaPersonaPage';
import { DetallePersonaPage } from '../pages/rrhh/DetallePersonaPage';
import { EditarPersonaPage } from '../pages/rrhh/EditarPersonaPage';
import AccesoDenegadoPage from '../pages/AccesoDenegadoPage';
import { DocumentosPersonaPage } from '../pages/rrhh/DocumentosPersonaPage';

// --- IMPORTACIONES DE USUARIOS CORREGIDAS ---
import { UsuarioFormPage } from '../pages/usuarios/UsuarioFormPage';
import { UsuariosLayout } from '../pages/usuarios/UsuariosLayout';
import { UsuariosPage } from '../pages/usuarios/UsuariosPage';
import { UsuariosGruposPage } from '../pages/usuarios/UsuariosGrupoPage';
import { GrupoFormPage } from '../pages/usuarios/GrupoFormPage';

//-----------------Gestor Documental-----------------
import { GestorDocumentalPage } from '../pages/gestorDocumental/index';
import { NuevaCarpetaPage } from '../pages/gestorDocumental/NuevaCarpetaPage';
import { GestorDocumentalLayout } from '../pages/gestorDocumental/GDLayout';
import {NuevoFicheroPage} from '../pages/gestorDocumental/NuevoFicheroPage';
import { MoverDocumentosPage } from '../pages/gestorDocumental/MoverDocumentoPage';
import { DetalleDocumentoPage } from '../pages/gestorDocumental/DetalleDocumentoPage';
import { ConfiguracionGestorPage } from '../pages/gestorDocumental/configuracion/ConfiguracionGestorPage';
import { LayoutConfiguracion } from '../pages/gestorDocumental/configuracion/LayoutConfiguracion';
import { LibreriasConfigPage } from '../pages/gestorDocumental/configuracion/LibreriaConfigPage';

import { AuditoriaPage } from '../pages/configuracion/AuditoriaPage';

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