import { Router } from "express";
import { listarHitoProyecto, obtenerHitoProyecto } from "../controllers/hitoProyecto.controller.js";

const router = Router();

router.get("/hitoProyecto", listarHitoProyecto);
router.get("/hitoProyecto/:id", obtenerHitoProyecto);

export default router;
