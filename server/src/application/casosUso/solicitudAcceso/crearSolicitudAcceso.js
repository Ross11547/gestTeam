import { crearSolicitudAcceso } from "../../../dominio/solicitudAcceso/validacionSolicitudAcceso.js";
import { crearError } from "../../../dominio/solicitudAcceso/helpersSolicitudAcceso.js";
import { esEstudiante } from "../../../dominio/solicitudAcceso/autorizacionSolicitudAcceso.js";
import {
    ESTADOS_PROYECTO_SOLICITABLES,
    estudianteEsAjenoAlProyecto,
    filtroDocumentosSolicitables,
} from "../../../dominio/solicitudAcceso/politicaDocumentosSolicitables.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function crearSolicitudAccesoCasoUso(payload, usuario) {
    const data = crearSolicitudAcceso.parse(payload);
    if (!esEstudiante(usuario)) throw crearError("Solo un estudiante puede solicitar acceso documental", 403);

    const proyecto = await prisma.proyecto.findUnique({
        where: { id: data.proyectoId },
        select: {
            id: true,
            titulo: true,
            estado: true,
            creadoPorId: true,
            miembros: { where: { usuarioId: usuario.id }, select: { id: true } },
            equipos: {
                where: { miembros: { some: { usuarioId: usuario.id } } },
                select: { id: true },
            },
        },
    });
    if (!proyecto) throw crearError("El proyecto indicado no existe", 404);
    if (!ESTADOS_PROYECTO_SOLICITABLES.includes(proyecto.estado)) {
        throw crearError("El proyecto no está disponible en el catálogo público", 409);
    }

    if (!estudianteEsAjenoAlProyecto(proyecto, usuario.id)) {
        throw crearError("El acceso solicitado aplica únicamente a proyectos ajenos", 409);
    }

    const proyectoMateria = await prisma.proyectoMateria.findUnique({
        where: { id: data.proyectoMateriaId },
        select: { id: true, proyectoId: true },
    });
    if (!proyectoMateria || proyectoMateria.proyectoId !== proyecto.id) {
        throw crearError("El contexto académico no pertenece al proyecto indicado", 409);
    }

    const documentos = await prisma.documento.findMany({
        where: filtroDocumentosSolicitables(proyecto.id, proyectoMateria.id, data.documentoIds),
        select: { id: true },
    });
    if (documentos.length !== data.documentoIds.length) {
        throw crearError("Uno o más documentos no son solicitables en el contexto indicado", 409);
    }

    const pendiente = await prisma.solicitudAccesoProyecto.findFirst({
        where: {
            proyectoMateriaId: data.proyectoMateriaId,
            solicitanteId: usuario.id,
            estado: "PENDIENTE",
        },
        select: { id: true },
    });
    if (pendiente) throw crearError("Ya tienes una solicitud pendiente para este contexto", 409);

    return prisma.solicitudAccesoProyecto.create({
        data: {
            proyectoId: data.proyectoId,
            proyectoMateriaId: data.proyectoMateriaId,
            solicitanteId: usuario.id,
            tipo: "DOCUMENTOS",
            motivo: data.motivo ?? "",
            documentos: {
                create: data.documentoIds.map((documentoId) => ({ documentoId })),
            },
        },
        select: {
            id: true,
            proyectoId: true,
            proyectoMateriaId: true,
            estado: true,
            tipo: true,
            motivo: true,
            createdAt: true,
            documentos: { select: { documentoId: true } },
        },
    });
}
