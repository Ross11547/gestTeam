import { Route, Routes } from "react-router-dom";
import { ROUTES } from "./enums/routes/Routes.js";
import Inicio from "./pages/private/inicio/index.jsx";
import Nav from "./components/sidebar.jsx";
/* import Proyecto from "./pages/private/proyecto/index.jsx"; */
import Materia from "./pages/private/materias/index.jsx";
/* import Notificacion from "./pages/private/notificacion/index.jsx";
 *//* import TareaPendiente from "./pages/private/tareaPendiente/index.jsx"; */
import Colaboracion from "./pages/private/colaboradores/index.jsx";
import Pizarra from "./pages/private/pizarra/index.jsx";
import Login from "./pages/public/login.jsx";
/* import ExcalidrawComponente from "./components/ui/excalidraw.jsx";
 *//* import NavbarAdmin from "./components/ui/navAdmin/navAdmin.jsx"; */
/* import Facultad from "./pages/admin/facultad/index.jsx";
 *//* import Usuario from "./pages/admin/usuario/index.jsx"; */
const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<Login />} />

{/*       <Route path={ROUTES.ADMIN} element={<NavbarAdmin />}>
        <Route path={ROUTES.FACULTAD} element={<Facultad />} />
        <Route path={ROUTES.USUARIO} element={<Usuario />} />
      </Route> */}

      <Route path={ROUTES.ESTUDIANTE} element={<Nav />}>
        <Route path={ROUTES.DASHBOARD} element={<Inicio />} />
        <Route path={ROUTES.MATERIA} element={<Materia />} />
         <Route path={ROUTES.COLABORACION} element={<Colaboracion />} />
        <Route path={ROUTES.PIZARRA} element={<Pizarra />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;