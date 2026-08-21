import { Router } from "express";
import {
    listarHorario,
    obtenerHorario,
    listarHorarioPorMateria,
    crearHorario,
    actualizarHorario,
    eliminarHorario,
} from "../controllers/horario.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const soloAdmin = autorizarRoles("Admin");

router.get("/horario", listarHorario);
router.get("/horario/porMateria", listarHorarioPorMateria);
router.get("/horario/:id", obtenerHorario);

router.post("/horario", soloAdmin, crearHorario);
router.put("/horario/:id", soloAdmin, actualizarHorario);
router.delete("/horario/:id", soloAdmin, eliminarHorario);

export default router;
