import { Router } from "express";
import {
    listarEvaluaciones,
    obtenerEvaluacion,
    crearEvaluacion,
    actualizarEvaluacion,
    eliminarEvaluacion,
} from "../controllers/evaluacionProyecto.controller.js";

const router = Router();

// Lecturas: cualquier usuario autenticado.
router.get("/evaluacion", listarEvaluaciones);
router.get("/evaluacion/:id", obtenerEvaluacion);

// Registrar evaluación: docentes, directores y administradores
// (un mismo evaluador solo puede evaluar una vez cada proyecto).
router.post("/evaluacion", crearEvaluacion);
router.put("/evaluacion/:id", actualizarEvaluacion);
router.delete("/evaluacion/:id", eliminarEvaluacion);

export default router;
