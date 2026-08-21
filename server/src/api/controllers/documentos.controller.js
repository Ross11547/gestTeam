import { subirDocumentoCasoUso } from "../../application/casosUso/documentos/subirDocumento.js";

export async function subirDocumento(req, res, next) {
    try {
        const data = await subirDocumentoCasoUso({ file: req.file });
        return res.json({ data, mensaje: "Archivo subido correctamente" });
    } catch (e) {
        return next(e);
    }
}
