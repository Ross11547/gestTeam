import { Router } from "express";
import {
    listarSolicitudes,
    crearSolicitud,
    resolverSolicitud,
    cancelarSolicitud,
} from "../controllers/solicitudAcceso.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const resolutorAcademico = autorizarRoles("Director", "Docente");
const estudiante = autorizarRoles("Estudiante");

router.get("/solicitud-acceso", listarSolicitudes);

router.post("/solicitud-acceso", estudiante, crearSolicitud);

router.put("/solicitud-acceso/:id/resolver", resolutorAcademico, resolverSolicitud);

router.delete("/solicitud-acceso/:id", estudiante, cancelarSolicitud);

export default router;
