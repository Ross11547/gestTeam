import { Router } from "express";
import {
    listarSolicitudes,
    crearSolicitud,
    resolverSolicitud,
    cancelarSolicitud,
} from "../controllers/solicitudAcceso.controller.js";

const router = Router();

router.get("/solicitud-acceso", listarSolicitudes);

router.post("/solicitud-acceso", crearSolicitud);

router.put("/solicitud-acceso/:id/resolver", resolverSolicitud);

router.delete("/solicitud-acceso/:id", cancelarSolicitud);

export default router;
