import { Router } from "express";
import {
    listarFerias,
    obtenerFeria,
    crearFeria,
    actualizarFeria,
    eliminarFeria,
    listarCategoriasFeria,
    crearCategoriaFeria,
    eliminarCategoriaFeria,
    listarEquiposFeria,
    inscribirEquipoFeria,
    actualizarFeriaEquipo,
    eliminarFeriaEquipo,
    agregarMiembroFeriaEquipo,
    eliminarMiembroFeriaEquipo,
    evaluarFeriaEquipo,
    listarEvaluacionesFeriaEquipo,
} from "../controllers/feria.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const staffAcademico = autorizarRoles("Admin", "Director", "Docente");

router.get("/feria", listarFerias);
router.get("/feria/:id", obtenerFeria);

router.get("/feria/:feriaId(\\d+)/categoria", listarCategoriasFeria);
router.post("/feria/:feriaId(\\d+)/categoria", staffAcademico, crearCategoriaFeria);
router.delete("/feria/:feriaId(\\d+)/categoria/:categoriaId(\\d+)", staffAcademico, eliminarCategoriaFeria);

router.get("/feria/:feriaId(\\d+)/equipo", listarEquiposFeria);
router.post("/feria/:feriaId(\\d+)/equipo", staffAcademico, inscribirEquipoFeria);
router.put("/feria/equipo/:participacionId(\\d+)", staffAcademico, actualizarFeriaEquipo);
router.delete("/feria/equipo/:participacionId(\\d+)", staffAcademico, eliminarFeriaEquipo);
router.post("/feria/equipo/:participacionId(\\d+)/miembro", staffAcademico, agregarMiembroFeriaEquipo);
router.delete("/feria/equipo/:participacionId(\\d+)/miembro/:usuarioId(\\d+)", staffAcademico, eliminarMiembroFeriaEquipo);

router.get("/feria/equipo/:participacionId(\\d+)/evaluacion", listarEvaluacionesFeriaEquipo);
router.post("/feria/equipo/:participacionId(\\d+)/evaluacion", staffAcademico, evaluarFeriaEquipo);

router.post("/feria", staffAcademico, crearFeria);
router.put("/feria/:id(\\d+)", staffAcademico, actualizarFeria);
router.delete("/feria/:id(\\d+)", staffAcademico, eliminarFeria);

export default router;
