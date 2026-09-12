import { Router } from "express";
import {
    listarProyectos,
    obtenerProyecto,
    crearProyecto,
    actualizarProyecto,
    eliminarProyecto,
    listarCatalogoIntegradores,
    listarCatalogoProyectos,
    obtenerCatalogoProyecto,
    listarDocumentosSolicitables,
    validarCierreProyecto,
    declararProyectoInconcluso,
    cerrarProyectoDefinitivamente,
} from "../controllers/proyecto.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();
const estudiante = autorizarRoles("Estudiante");

router.get("/proyecto", listarProyectos);
router.get("/proyecto/catalogo/integradores", listarCatalogoIntegradores);
router.get("/proyecto/catalogo", listarCatalogoProyectos);
router.get("/proyecto/catalogo/:proyectoId/documentos-solicitables", estudiante, listarDocumentosSolicitables);
router.get("/proyecto/catalogo/:id", obtenerCatalogoProyecto);
router.get("/proyecto/:id/cierre/validacion", validarCierreProyecto);
router.get("/proyecto/:id", obtenerProyecto);

router.post("/proyecto", crearProyecto);
router.put("/proyecto/:id", actualizarProyecto);
router.put("/proyecto/:id/declarar-inconcluso", declararProyectoInconcluso);
router.put("/proyecto/:id/cerrar-definitivamente", cerrarProyectoDefinitivamente);
router.delete("/proyecto/:id", eliminarProyecto);

export default router;
