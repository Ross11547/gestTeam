import { Router } from "express";
import {
    listarFacultad,
    obtenerFacultad,
    crearFacultad,
    actualizarFacultad,
    eliminarFacultad,
} from "../controllers/facultad.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const soloAdmin = autorizarRoles("Admin");

router.get("/facultad", listarFacultad);               
router.get("/facultad/:id", obtenerFacultad);
router.post("/facultad", soloAdmin, crearFacultad);
router.put("/facultad/:id", soloAdmin, actualizarFacultad);
router.delete("/facultad/:id", soloAdmin, eliminarFacultad);

export default router;
