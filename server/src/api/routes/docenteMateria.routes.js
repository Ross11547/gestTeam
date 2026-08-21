import { Router } from "express";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";
import {
    listarDocenteMateria,
    obtenerDocenteMateria,
    crearDocenteMateria,
    actualizarDocenteMateria,
    eliminarDocenteMateria,
} from "../controllers/docenteMateria.controller.js";

const router = Router();

// Asignar docentes a materias es decisión del staff académico.
router.get("/docenteMateria", listarDocenteMateria);
router.get("/docenteMateria/:id(\\d+)", obtenerDocenteMateria);

router.post("/docenteMateria", autorizarRoles("Admin", "Director"), crearDocenteMateria);
router.put("/docenteMateria/:id(\\d+)", autorizarRoles("Admin", "Director"), actualizarDocenteMateria);
router.delete("/docenteMateria/:id(\\d+)", autorizarRoles("Admin", "Director"), eliminarDocenteMateria);

export default router;
