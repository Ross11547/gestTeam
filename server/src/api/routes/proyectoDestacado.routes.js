import { Router } from "express";
import {
    listarDestacados,
    crearDestacado,
    actualizarDestacado,
    eliminarDestacado,
} from "../controllers/proyectoDestacado.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const staff = autorizarRoles("Admin", "Director");

router.get("/proyecto-destacado", listarDestacados);
router.post("/proyecto-destacado", staff, crearDestacado);
router.put("/proyecto-destacado/:id(\\d+)", staff, actualizarDestacado);
router.delete("/proyecto-destacado/:id(\\d+)", staff, eliminarDestacado);

export default router;
