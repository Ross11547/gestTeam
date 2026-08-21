import { Router } from "express";
import {
    obtenerMiCV,
    obtenerCVDeUsuario,
    guardarMiCV,
    eliminarMiCV,
    agregarHabilidad,
    editarHabilidad,
    quitarHabilidad,
    agregarLogro,
    editarLogro,
    quitarLogro,
    agregarProyectoCV,
    editarProyectoCV,
    quitarProyectoCV,
} from "../controllers/cv.controller.js";

const router = Router();

// El CV es personal: cada usuario gestiona el suyo.
// Docentes y staff pueden consultar el de cualquier estudiante.
router.get("/cv/me", obtenerMiCV);
router.put("/cv/me", guardarMiCV);
router.delete("/cv/me", eliminarMiCV);
router.get("/cv/usuario/:usuarioId(\\d+)", obtenerCVDeUsuario);

router.post("/cv/habilidad", agregarHabilidad);
router.put("/cv/habilidad/:id(\\d+)", editarHabilidad);
router.delete("/cv/habilidad/:id(\\d+)", quitarHabilidad);

router.post("/cv/logro", agregarLogro);
router.put("/cv/logro/:id(\\d+)", editarLogro);
router.delete("/cv/logro/:id(\\d+)", quitarLogro);

router.post("/cv/proyecto", agregarProyectoCV);
router.put("/cv/proyecto/:id(\\d+)", editarProyectoCV);
router.delete("/cv/proyecto/:id(\\d+)", quitarProyectoCV);

export default router;
