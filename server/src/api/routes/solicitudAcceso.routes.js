import { Router } from "express";
import {
    listarSolicitudes,
    crearSolicitud,
    resolverSolicitud,
    cancelarSolicitud,
} from "../controllers/solicitudAcceso.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const staffAcademico = autorizarRoles("Admin", "Director", "Docente");

router.get("/solicitud-acceso", staffAcademico, listarSolicitudes);

router.post("/solicitud-acceso", crearSolicitud);

router.put("/solicitud-acceso/:id/resolver", staffAcademico, resolverSolicitud);

router.delete("/solicitud-acceso/:id", staffAcademico, cancelarSolicitud);

export default router;
