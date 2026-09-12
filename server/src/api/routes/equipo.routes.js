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

router.get("/equipo", listarEquipos);
router.get("/equipo/:id", obtenerEquipo);
router.get("/equipo/:id/miembro", listarMiembros);

router.post("/equipo", crearEquipo);
router.put("/equipo/:id", actualizarEquipo);
router.delete("/equipo/:id", eliminarEquipo);

router.post("/equipo/:id/miembro", agregarMiembro);
router.put("/equipo/:id/miembro/:usuarioId", actualizarMiembro);
router.delete("/equipo/:id/miembro/:usuarioId", eliminarMiembro);

export default router;
