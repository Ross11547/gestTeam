import { Router } from "express";
import {
    listarEquipos,
    obtenerEquipo,
    crearEquipo,
    actualizarEquipo,
    eliminarEquipo,
    listarMiembros,
    agregarMiembro,
    actualizarMiembro,
    eliminarMiembro,
} from "../controllers/equipo.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const staffAcademico = autorizarRoles("Admin", "Director", "Docente");

router.get("/equipo", listarEquipos);
router.get("/equipo/:id", obtenerEquipo);
router.get("/equipo/:id/miembro", listarMiembros);

router.post("/equipo", staffAcademico, crearEquipo);
router.put("/equipo/:id", staffAcademico, actualizarEquipo);
router.delete("/equipo/:id", staffAcademico, eliminarEquipo);

router.post("/equipo/:id/miembro", staffAcademico, agregarMiembro);
router.put("/equipo/:id/miembro/:usuarioId", staffAcademico, actualizarMiembro);
router.delete("/equipo/:id/miembro/:usuarioId", staffAcademico, eliminarMiembro);

export default router;
