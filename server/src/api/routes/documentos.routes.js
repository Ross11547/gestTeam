import { Router } from "express";
import { upload } from "../../infrastructure/documents/configuracionDocumentos.js";
import {
    descargarDocumentoAutorizado,
    obtenerDocumentoAutorizado,
    subirDocumento,
} from "../controllers/documentos.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();
const estudiante = autorizarRoles("Estudiante");

router.post("/documentos", upload.single("file"), subirDocumento);
router.get("/documentos/:id", estudiante, obtenerDocumentoAutorizado);
router.get("/documentos/:id/descargar", estudiante, descargarDocumentoAutorizado);

export default router;
