import { Router } from "express";
import { listarProyectoMateria, obtenerProyectoMateria } from "../controllers/proyectoMateria.controller.js";

const router = Router();

router.get("/proyectoMateria", listarProyectoMateria);
router.get("/proyectoMateria/:id", obtenerProyectoMateria);

export default router;
