import { Router } from "express";
import {
    listarProyectos,
    obtenerProyecto,
    crearProyecto,
    actualizarProyecto,
    eliminarProyecto,
} from "../controllers/proyecto.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const staffAcademico = autorizarRoles("Admin", "Director", "Docente");

router.get("/proyecto", listarProyectos);
router.get("/proyecto/:id", obtenerProyecto);

router.post("/proyecto", staffAcademico, crearProyecto);
router.put("/proyecto/:id", staffAcademico, actualizarProyecto);
router.delete("/proyecto/:id", staffAcademico, eliminarProyecto);

export default router;
