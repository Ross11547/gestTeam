import { Router } from "express";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";
import {
    listarInscripcionMateria,
    obtenerInscripcionMateria,
    crearInscripcionMateria,
    actualizarInscripcionMateria,
    eliminarInscripcionMateria,
} from "../controllers/inscripcionMateria.controller.js";

const router = Router();

// La gestión de inscripciones es responsabilidad del staff académico.
router.get("/inscripcionMateria", listarInscripcionMateria);
router.get("/inscripcionMateria/:id(\\d+)", obtenerInscripcionMateria);

router.post("/inscripcionMateria", autorizarRoles("Admin", "Director"), crearInscripcionMateria);
router.put("/inscripcionMateria/:id(\\d+)", autorizarRoles("Admin", "Director"), actualizarInscripcionMateria);
router.delete("/inscripcionMateria/:id(\\d+)", autorizarRoles("Admin", "Director"), eliminarInscripcionMateria);

export default router;
