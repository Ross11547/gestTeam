import { Router } from "express";
import {
    crearInstitucion,
    listarInstitucion,
    obtenerInstitucion,
    actualizarInstitucion,
    eliminarInstitucion,
} from "../controllers/institucion.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const soloAdmin = autorizarRoles("Admin");

router.get("/institucion", listarInstitucion);
router.get("/institucion/:id", obtenerInstitucion);
router.post("/institucion", soloAdmin, crearInstitucion);
router.put("/institucion/:id", soloAdmin, actualizarInstitucion);
router.delete("/institucion/:id", soloAdmin, eliminarInstitucion);

export default router;
