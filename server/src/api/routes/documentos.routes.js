import { Router } from "express";
import { upload } from "../../infrastructure/documents/configuracionDocumentos.js";
import { subirDocumento } from "../controllers/documentos.controller.js";

const router = Router();

router.post("/documentos", upload.single("file"), subirDocumento);

export default router;
