import { Router } from "express";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";
import { generar, listar, obtenerPorId, eliminar } from "../controllers/reporte.controller.js";

const router = Router();

router.post("/reporte", autorizarRoles("Admin", "Director", "Docente"), generar);
router.get("/reporte", autorizarRoles("Admin", "Director", "Docente"), listar);
router.get("/reporte/:id(\\d+)", autorizarRoles("Admin", "Director", "Docente"), obtenerPorId);
router.delete("/reporte/:id(\\d+)", autorizarRoles("Admin", "Director", "Docente"), eliminar);

export default router;
