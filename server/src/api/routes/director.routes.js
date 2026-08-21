import { Router } from "express";
import {
    listarDirectores,
    obtenerDirectorID,
    crearDirector,
    actualizarDirector,
    eliminarDirector,
} from "../controllers/director.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const soloStaff = autorizarRoles("Admin", "Director", "Docente");
const soloAdmin = autorizarRoles("Admin");

router.get("/director", soloStaff, listarDirectores);
router.get("/director/:id", soloStaff, obtenerDirectorID);
router.post("/director", soloAdmin, crearDirector);
router.put("/director/:id", soloAdmin, actualizarDirector);
router.delete("/director/:id", soloAdmin, eliminarDirector);

export default router;
