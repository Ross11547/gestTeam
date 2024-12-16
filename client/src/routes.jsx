import { Route, Routes } from "react-router-dom";
import { ROUTES } from "./enums/routes/Routes.js";
import Inicio from "./pages/private/inicio/index.jsx";
import Nav from "./components/sidebar.jsx";
/* import Proyecto from "./pages/private/proyecto/index.jsx"; */
import Materia from "./pages/private/materias/index.jsx";
/* import Notificacion from "./pages/private/notificacion/index.jsx";
 */ /* import TareaPendiente from "./pages/private/tareaPendiente/index.jsx"; */
import Colaboracion from "./pages/private/colaboradores/index.jsx";
import Pizarra from "./pages/private/pizarra/index.jsx";
import Login from "./pages/public/login.jsx";
import Layout from "./pages/private/layout.jsx";
import ExcalidrawComponente from "./components/excalidraw.jsx";
import Excalidraw from "./pages/private/excalidraw/index.jsx";
import Notificacion from "./pages/private/notificaciones/index.jsx";
import CalendarioUni from "./components/calendarioUni.jsx";
/* import NavbarAdmin from "./components/ui/navAdmin/navAdmin.jsx"; */
/* import Facultad from "./pages/admin/facultad/index.jsx";
 */ /* import Usuario from "./pages/admin/usuario/index.jsx"; */
import { useUser } from "./context/useContext.jsx";
import Docente from "./pages/admin/docente/index.jsx";
import Directores from "./pages/admin/directores/index.jsx";
import Facultades from "./pages/admin/facultades/index.jsx";
import Alumno from "./pages/admin/alumno/index.jsx";
import Dashboard from "./pages/admin/dashboard/index.jsx";
const AppRoutes = () => {
  const { user } = useUser();
  return (
    <>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login />} />

        {/*       <Route path={ROUTES.ADMIN} element={<NavbarAdmin />}>
        <Route path={ROUTES.FACULTAD} element={<Facultad />} />
        <Route path={ROUTES.USUARIO} element={<Usuario />} />
      </Route> */}
        {user?.rol === "Admin" ? (
          <Route path={ROUTES.ADMIN} element={<Layout />}>
            <Route path={ROUTES.DASHBOARDADMIN} element={<Dashboard />} />
            <Route path={ROUTES.DOCENTE} element={<Docente />} />
            <Route path={ROUTES.DIRECTOCARRERA} element={<Directores />} />
            <Route path={ROUTES.FACULTAD} element={<Facultades />} />
            <Route path={ROUTES.USUARIO} element={<Alumno />} />
          </Route>
        ) : (
          <Route path={ROUTES.ESTUDIANTE} element={<Layout />}>
            <Route path={ROUTES.DASHBOARD} element={<Inicio />} />
            <Route path={ROUTES.MATERIA} element={<Materia />} />
            <Route path={ROUTES.COLABORACION} element={<Colaboracion />} />
            <Route path={ROUTES.NOTIFICACION} element={<Notificacion />} />
            <Route path={ROUTES.PIZARRA} element={<Pizarra />} />
            <Route path={ROUTES.EXCALIDRAW} element={<Excalidraw />} />
            <Route path={ROUTES.CALENDARIOU} element={<CalendarioUni />} />
          </Route>
        )}
      </Routes>
    </>
  );
};

export default AppRoutes;
