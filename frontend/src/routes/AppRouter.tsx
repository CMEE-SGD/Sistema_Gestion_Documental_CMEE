import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage'; 
import WelcomePage from '../pages/Index'; 
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

// --- IMPORTACIONES DE USUARIOS CORREGIDAS ---
import { UsuarioFormPage } from '../pages/usuarios/UsuarioFormPage';
import { UsuariosLayout } from '../pages/usuarios/UsuariosLayout';
import { UsuariosPage } from '../pages/usuarios/UsuariosPage';
import { UsuariosGruposPage } from '../pages/usuarios/UsuariosGrupoPage'; // Nombre exacto del archivo
import { GrupoFormPage } from '../pages/usuarios/GrupoFormPage'; // ¡ESTA IMPORTACIÓN FALTABA!

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas base existentes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/welcome" element={<WelcomePage />} />

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
          {/* Se carga por defecto al entrar a /rrhh */}
          <Route index element={<div>Dashboard de RRHH</div>} />
          
          {/* Vistas hijas que aparecerán junto al menú lateral */}
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
          <Route path="personalizacion" element={<div>Configuración de RRHH</div>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;