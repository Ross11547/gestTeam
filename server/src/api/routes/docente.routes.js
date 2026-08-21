import { Router } from "express";
import {
    listarDocentes,
    obtenerDocenteID,
    crearDocente,
    actualizarDocente,
    eliminarDocente,
} from "../controllers/docente.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const soloStaff = autorizarRoles("Admin", "Director", "Docente");
const soloAdmin = autorizarRoles("Admin");

router.get("/docente", soloStaff, listarDocentes);
router.get("/docente/:id", soloStaff, obtenerDocenteID);
router.post("/docente", soloAdmin, crearDocente);
router.put("/docente/:id", soloAdmin, actualizarDocente);
router.delete("/docente/:id", soloAdmin, eliminarDocente);

export default router;
