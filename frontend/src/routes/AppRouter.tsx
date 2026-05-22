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

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas base existentes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/welcome" element={<WelcomePage />} />

        {/* Nuevo Módulo de Recursos Humanos (Rutas protegidas por el Layout) */}
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
          <Route path="personas" element={<div>Vista de Personas</div>} />
          <Route path="personalizacion" element={<div>Configuración de RRHH</div>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;