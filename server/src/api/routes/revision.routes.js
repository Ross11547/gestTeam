import { Router } from "express";
import {
    listarRevisionesPorEntrega,
    crearRevision,
    actualizarRevision,
    eliminarRevision,
} from "../controllers/revision.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

// Revisar/calificar es tarea del personal docente/administrativo.
const staffAcademico = autorizarRoles("Admin", "Director", "Docente");

// Lecturas: cualquier usuario autenticado (los equipos ven su feedback).
router.get("/revision/by-entrega", listarRevisionesPorEntrega);

// Crear revisión: solo staff. Editar/eliminar validan que sea el
// revisor original o Admin/Director dentro del caso de uso.
router.post("/revision", staffAcademico, crearRevision);
router.put("/revision/:id", staffAcademico, actualizarRevision);
router.delete("/revision/:id", staffAcademico, eliminarRevision);

export default router;
