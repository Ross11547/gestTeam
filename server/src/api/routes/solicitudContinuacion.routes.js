import { Router } from "express";
import { listarSolicitudContinuacion, obtenerSolicitudContinuacion, crearSolicitudContinuacion, resolverSolicitudContinuacion } from "../controllers/solicitudContinuacion.controller.js";

const router = Router();

router.get("/solicitudContinuacion", listarSolicitudContinuacion);
router.get("/solicitudContinuacion/:id", obtenerSolicitudContinuacion);
router.post("/solicitudContinuacion", crearSolicitudContinuacion);
router.put("/solicitudContinuacion/:id/resolver", resolverSolicitudContinuacion);

export default router;
