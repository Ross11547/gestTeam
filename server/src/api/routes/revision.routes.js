import { Router } from "express";
import {
    listarRevisionesPorEntrega,
    crearRevision,
    actualizarRevision,
    eliminarRevision,
} from "../controllers/revision.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const staffAcademico = autorizarRoles("Admin", "Director", "Docente");

router.get("/revision/by-entrega", listarRevisionesPorEntrega);

router.post("/revision", staffAcademico, crearRevision);
router.put("/revision/:id", staffAcademico, actualizarRevision);
router.delete("/revision/:id", staffAcademico, eliminarRevision);

export default router;
