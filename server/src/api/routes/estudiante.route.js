import { Router } from "express";
import {
    listarEstudiantes,
    obtenerEstudianteID,
    crearEstudiante,
    actualizarEstudiante,
    eliminarEstudiante,
} from "../controllers/estudiante.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const soloStaff = autorizarRoles("Admin", "Director", "Docente");
const soloAdmin = autorizarRoles("Admin");

router.get("/estudiante", soloStaff, listarEstudiantes);
router.get("/estudiante/:id", soloStaff, obtenerEstudianteID);
router.post("/estudiante", soloAdmin, crearEstudiante);
router.put("/estudiante/:id", soloAdmin, actualizarEstudiante);
router.delete("/estudiante/:id", soloAdmin, eliminarEstudiante);

export default router;
