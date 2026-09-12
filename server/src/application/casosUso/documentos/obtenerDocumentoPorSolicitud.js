import path from "path";
import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { crearError, ensureIdPositivo } from "../../../dominio/comun/helpersComunes.js";

function esEstudiante(usuario) {
    return String(usuario?.rol?.nombre || "").trim().toLowerCase() === "estudiante";
}

export async function obtenerDocumentoPorSolicitudCasoUso(idRaw, usuario, incluirRuta = false) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);
    if (!esEstudiante(usuario)) throw crearError("El acceso solicitado corresponde únicamente al estudiante autorizado", 403);

    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido", 400);

    const documento = await prisma.documento.findUnique({
        where: { id },
        select: {
            id: true,
            nombre: true,
            mimetype: true,
            tamano: true,
            tipo: true,
            creadoEn: true,
            entregaId: true,
            ruta: true,
        },
    });
    if (!documento) throw crearError("El documento indicado no existe", 404);

    const ahora = new Date();
    const permiso = await prisma.documentoSolicitudAcceso.findFirst({
        where: {
            documentoId: id,
            solicitud: {
                solicitanteId: usuario.id,
                estado: "APROBADA",
                OR: [{ expiresAt: null }, { expiresAt: { gt: ahora } }],
            },
        },
        select: { solicitudId: true },
    });
    if (!permiso) throw crearError("No tienes acceso autorizado a este documento", 403);

    const { ruta, ...metadata } = documento;
    if (!incluirRuta) return metadata;

    const raizUploads = path.resolve(process.cwd(), "uploads");
    const rutaResuelta = path.resolve(ruta);
    if (rutaResuelta !== raizUploads && !rutaResuelta.startsWith(`${raizUploads}${path.sep}`)) {
        throw crearError("La ubicación del documento no es válida", 409);
    }
    return { metadata, ruta: rutaResuelta };
}
