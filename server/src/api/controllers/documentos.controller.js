import { subirDocumentoCasoUso } from "../../application/casosUso/documentos/subirDocumento.js";
import { obtenerDocumentoPorSolicitudCasoUso } from "../../application/casosUso/documentos/obtenerDocumentoPorSolicitud.js";

export async function subirDocumento(req, res, next) {
    try {
        const data = await subirDocumentoCasoUso({ file: req.file });
        return res.json({ data, mensaje: "Archivo subido correctamente" });
    } catch (e) {
        return next(e);
    }
}

export async function obtenerDocumentoAutorizado(req, res, next) {
    try {
        const data = await obtenerDocumentoPorSolicitudCasoUso(req.params.id, req.user);
        return res.json({ data, mensaje: "Documento obtenido correctamente" });
    } catch (e) {
        return next(e);
    }
}

export async function descargarDocumentoAutorizado(req, res, next) {
    try {
        const { metadata, ruta } = await obtenerDocumentoPorSolicitudCasoUso(req.params.id, req.user, true);
        return res.download(ruta, metadata.nombre, (error) => {
            if (error && !res.headersSent) next(error);
        });
    } catch (e) {
        return next(e);
    }
}
