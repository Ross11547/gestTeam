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

// Los hitos son planificación académica: solo personal docente/administrativo.
const staffAcademico = autorizarRoles("Admin", "Director", "Docente");

router.get("/hito/by-proyecto", listarHitosPorProyecto);
router.get("/hito/:id", obtenerHito);

// Sembrar y avanzan según autoridad sobre el proyecto
// (staff, docente de la clase o miembro OWNER), no solo por rol.
router.post("/hito/base/:proyectoId", sembrarHitosBase);
router.put("/hito/:id/avanzar", avanzarHito);

// IMPORTANTE: las rutas con segmento fijo van antes de /hito/:id dinámico.
router.post("/hito", staffAcademico, crearHito);
router.put("/hito/:id", staffAcademico, actualizarHito);
router.delete("/hito/:id", staffAcademico, eliminarHito);

export default router;
