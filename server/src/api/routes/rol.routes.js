import { Router } from "express";
import {
    listarRoles,
    obtenerRol,
    crearRol,
    actualizarRol,
    eliminarRol,
} from "../controllers/rol.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const soloStaff = autorizarRoles("Admin", "Director", "Docente");
const soloAdmin = autorizarRoles("Admin");

router.get("/rol", soloStaff, listarRoles);
router.get("/rol/:id", soloStaff, obtenerRol);
router.post("/rol", soloAdmin, crearRol);
router.put("/rol/:id", soloAdmin, actualizarRol);
router.delete("/rol/:id", soloAdmin, eliminarRol);

export default router;
