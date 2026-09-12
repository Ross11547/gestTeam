import express from "express";
import multer from "multer";
import * as path from "path";
import * as fs from "fs";
import {autorizarRoles} from "../../api/middleware/autenticacionMiddleware.js"
import { uploadDocumento, analizar, uploadRepositorioUnifranz, exportarDataset, reentrenarModelo} from "./controllerPlagioIA.js";

const router = express.Router();
const staffAcdemico = autorizarRoles("Admin", "Director", "Docente");
const uploadDir = path.join(process.cwd(), "uploads", "plagio");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename(_req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path
      .extname(file.originalname)
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, "");
    cb(null, uniqueSuffix + ext);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = [
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Tipo de archivo no permitido"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
});

router.post("/upload", upload.single("file"), uploadDocumento);

router.post("/analizar", analizar);

router.post(
  "/repositorio/unifranz",
  upload.single("file"),
  uploadRepositorioUnifranz,
);

router.post(
  "/proyecto/:proyectoId/incluir-en-dataset",
  staffAcdemico,
  (_req, res) => res.status(410).json({
    mensaje: "La inclusión manual de proyectos en el dataset está temporalmente deshabilitada.",
  })
);

router.post(
  "/dataset/exportar",
  staffAcdemico,
  exportarDataset
);

router.post(
  "/dataset/reentrenar",
  staffAcdemico,
  reentrenarModelo
);

export default router;
