import express from "express";
import multer from "multer";
import * as path from "path";
import * as fs from "fs";
import {
    uploadDocumento,
    analizar,
    uploadRepositorioUnifranz,
} from "./controllerPlagioIA.js";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads", "plagio");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(_req, _file, cb) {
        cb(null, uploadDir);
    },
    filename(_req, file, cb) {
        const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
        // Nunca confiar en originalname: solo extensión saneada.
        const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, "");
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

const upload = multer({ storage, fileFilter, limits: { fileSize: 15 * 1024 * 1024 } });

router.post("/upload", upload.single("file"), uploadDocumento);

router.post("/analizar", analizar);

router.post(
    "/repositorio/unifranz",
    upload.single("file"),
    uploadRepositorioUnifranz
);

export default router;
