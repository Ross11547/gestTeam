import { Router } from "express";
import {
    listarSemestre,
    listarSemestrePorCarrera,
    obtenerSemestre,
    crearSemestre,
    actualizarSemestre,
    eliminarSemestre,
} from "../controllers/semestre.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const soloAdmin = autorizarRoles("Admin");

router.get("/semestre", listarSemestre);
router.get("/semestre/by-carrera", listarSemestrePorCarrera);
router.get("/semestre/:id", obtenerSemestre);
router.post("/semestre", soloAdmin, crearSemestre);
router.put("/semestre/:id", soloAdmin, actualizarSemestre);
router.delete("/semestre/:id", soloAdmin, eliminarSemestre);

export default router;
