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

const soloAdminODirector = autorizarRoles("Admin", "Director");

router.get("/entrega/by-hito", listarEntregasPorHito);
router.get("/entrega/by-equipo", listarEntregasPorEquipo);
router.get("/entrega/:id", obtenerEntrega);

router.post("/entrega", crearEntrega);
router.put("/entrega/:id", actualizarEntrega);
router.delete("/entrega/:id", soloAdminODirector, eliminarEntrega);

export default router;
