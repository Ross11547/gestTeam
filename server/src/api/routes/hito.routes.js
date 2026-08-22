import { Router } from "express";
import {
    listarHitosPorProyecto,
    obtenerHito,
    crearHito,
    actualizarHito,
    eliminarHito,
    sembrarHitosBase,
    avanzarHito,
} from "../controllers/hito.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const staffAcademico = autorizarRoles("Admin", "Director", "Docente");

router.get("/hito/by-proyecto", listarHitosPorProyecto);
router.get("/hito/:id", obtenerHito);

router.post("/hito/base/:proyectoId", sembrarHitosBase);
router.put("/hito/:id/avanzar", avanzarHito);

router.post("/hito", staffAcademico, crearHito);
router.put("/hito/:id", staffAcademico, actualizarHito);
router.delete("/hito/:id", staffAcademico, eliminarHito);

export default router;
