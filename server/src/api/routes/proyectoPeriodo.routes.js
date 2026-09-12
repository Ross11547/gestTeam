import { Router } from "express";
import { listarProyectoPeriodo, obtenerProyectoPeriodo, cerrarProyectoPeriodo } from "../controllers/proyectoPeriodo.controller.js";

const router = Router();

router.get("/proyectoPeriodo", listarProyectoPeriodo);
router.get("/proyectoPeriodo/:id", obtenerProyectoPeriodo);
router.put("/proyectoPeriodo/:id/cerrar", cerrarProyectoPeriodo);

export default router;
