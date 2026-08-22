import { Router } from "express";
import {
    listarEvaluaciones,
    obtenerEvaluacion,
    crearEvaluacion,
    actualizarEvaluacion,
    eliminarEvaluacion,
} from "../controllers/evaluacionProyecto.controller.js";

const router = Router();

router.get("/evaluacion", listarEvaluaciones);
router.get("/evaluacion/:id", obtenerEvaluacion);

router.post("/evaluacion", crearEvaluacion);
router.put("/evaluacion/:id", actualizarEvaluacion);
router.delete("/evaluacion/:id", eliminarEvaluacion);

export default router;
