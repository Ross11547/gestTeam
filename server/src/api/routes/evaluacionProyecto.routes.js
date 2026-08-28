import { Router } from "express";
import {
    listarEvaluaciones,
    obtenerEvaluacion,
    crearEvaluacion,
    actualizarEvaluacion,
    eliminarEvaluacion,
} from "../controllers/evaluacionProyecto.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const staffAcademico = autorizarRoles("Admin", "Director", "Docente");

router.get("/evaluacion", listarEvaluaciones);
router.get("/evaluacion/:id", obtenerEvaluacion);

router.post("/evaluacion", staffAcademico, crearEvaluacion);
router.put("/evaluacion/:id", staffAcademico, actualizarEvaluacion);
router.delete("/evaluacion/:id", staffAcademico, eliminarEvaluacion);

export default router;
