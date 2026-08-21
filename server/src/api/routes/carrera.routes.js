import { Router } from "express";
import {
    listarCarrera,
    obtenerCarrera,
    crearCarrera,
    actualizarCarrera,
    eliminarCarrera,
} from "../controllers/carrera.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const soloAdmin = autorizarRoles("Admin");

router.get("/carrera", listarCarrera);            // ?idFacultad=1&q=sistemas
router.get("/carrera/:id", obtenerCarrera);
router.post("/carrera", soloAdmin, crearCarrera);
router.put("/carrera/:id", soloAdmin, actualizarCarrera);
router.delete("/carrera/:id", soloAdmin, eliminarCarrera);

export default router;
