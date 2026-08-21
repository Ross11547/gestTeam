import { Router } from "express";
import {
    listarSolicitudes,
    crearSolicitud,
    resolverSolicitud,
    cancelarSolicitud,
} from "../controllers/solicitudAcceso.controller.js";

const router = Router();

// Lecturas filtradas: staff ve todas; el resto solo las propias.
router.get("/solicitud-acceso", listarSolicitudes);

// El estudiante solicita acceso a un proyecto del que no es miembro.
router.post("/solicitud-acceso", crearSolicitud);

// Aprobar/rechazar: docente de la clase, propietario o staff.
// Al aprobar se agrega al solicitante como miembro MEMBER.
router.put("/solicitud-acceso/:id/resolver", resolverSolicitud);

// Cancelar: el solicitante (pendiente) o staff.
router.delete("/solicitud-acceso/:id", cancelarSolicitud);

export default router;
