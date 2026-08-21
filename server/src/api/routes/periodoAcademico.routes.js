import { Router } from "express";
import {
    crearPeriodoAcademico,
    listarPeriodoAcademico,
    obtenerPeriodoAcademico,
    actualizarPeriodoAcademico,
    eliminarPeriodoAcademico,
    activarPeriodoAcademico,
} from "../controllers/periodoAcademico.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const soloAdmin = autorizarRoles("Admin");

router.get("/periodoAcademico", listarPeriodoAcademico);
router.get("/periodoAcademico/:id", obtenerPeriodoAcademico);
router.post("/periodoAcademico", soloAdmin, crearPeriodoAcademico);
router.put("/periodoAcademico/:id", soloAdmin, actualizarPeriodoAcademico);
router.delete("/periodoAcademico/:id", soloAdmin, eliminarPeriodoAcademico);

router.post("/periodoAcademico/:id/activar", soloAdmin, activarPeriodoAcademico);

export default router;
