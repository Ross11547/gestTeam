import { Router } from "express";
import { listarEvaluacionHito, obtenerEvaluacionHito, crearEvaluacionHito } from "../controllers/evaluacionHito.controller.js";

const router = Router();

router.get("/evaluacionHito", listarEvaluacionHito);
router.get("/evaluacionHito/:id", obtenerEvaluacionHito);
router.post("/evaluacionHito", crearEvaluacionHito);

export default router;
