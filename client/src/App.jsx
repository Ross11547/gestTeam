import SidebarNav from "./components/sidebar";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Inicio from "./pages/private/inicio";
import Materias from "./pages/private/materias";
import Colaboradores from "./pages/private/colaboradores";
import Layout from "./pages/private/layout";
import Login from "./pages/public/login";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/" element={<Layout />}>
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/materias" element={<Materias />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
