import { Router } from "express";
import {
    listarEntregasPorHito,
    listarEntregasPorEquipo,
    obtenerEntrega,
    crearEntrega,
    actualizarEntrega,
    eliminarEntrega,
} from "../controllers/entrega.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const staffAcademico = autorizarRoles("Admin", "Director", "Docente");

router.get("/entrega/by-hito", listarEntregasPorHito);
router.get("/entrega/by-equipo", listarEntregasPorEquipo);
router.get("/entrega/:id", obtenerEntrega);

router.post("/entrega", crearEntrega);
router.put("/entrega/:id", staffAcademico, actualizarEntrega);
router.delete("/entrega/:id", staffAcademico, eliminarEntrega);

export default router;
