import { Router } from "express";
import {
    listarUsuarios,
    obtenerUsuarioId,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    login,
} from "../controllers/usuarios.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const soloStaff = autorizarRoles("Admin", "Director", "Docente");
const soloAdmin = autorizarRoles("Admin");

router.get("/usuario", soloStaff, listarUsuarios);
router.get("/usuario/:id", soloStaff, obtenerUsuarioId);
router.post("/usuario", soloAdmin, crearUsuario);
router.put("/usuario/:id", soloAdmin, actualizarUsuario);
router.delete("/usuario/:id", soloAdmin, eliminarUsuario);

router.post("/login", login);

export default router;
