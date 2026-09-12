import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { crearError, ensureIdPositivo } from "../../../dominio/solicitudAcceso/helpersSolicitudAcceso.js";
import { esEstudiante } from "../../../dominio/solicitudAcceso/autorizacionSolicitudAcceso.js";
import {
    ESTADOS_PROYECTO_SOLICITABLES,
    estudianteEsAjenoAlProyecto,
    filtroDocumentosSolicitables,
} from "../../../dominio/solicitudAcceso/politicaDocumentosSolicitables.js";

export async function listarDocumentosSolicitablesCasoUso(proyectoIdRaw, usuario) {
    if (!esEstudiante(usuario)) {
        throw crearError("Solo un estudiante puede consultar documentación solicitable", 403);
    }

    const proyectoId = ensureIdPositivo(proyectoIdRaw);
    if (!proyectoId) throw crearError("ID inválido", 400);

    const proyecto = await prisma.proyecto.findFirst({
        where: { id: proyectoId, estado: { in: ESTADOS_PROYECTO_SOLICITABLES } },
        select: {
            id: true,
            creadoPorId: true,
            miembros: { where: { usuarioId: usuario.id }, select: { id: true } },
            equipos: {
                where: { miembros: { some: { usuarioId: usuario.id } } },
                select: { id: true },
            },
        },
    });
    if (!proyecto) throw crearError("Proyecto no disponible para solicitud documental", 404);
    if (!estudianteEsAjenoAlProyecto(proyecto, usuario.id)) {
        throw crearError("La solicitud documental aplica únicamente a proyectos ajenos", 409);
    }

    const documentos = await prisma.documento.findMany({
        where: filtroDocumentosSolicitables(proyecto.id),
        select: {
            id: true,
            nombre: true,
            mimetype: true,
            tamano: true,
            tipo: true,
            creadoEn: true,
            entrega: {
                select: {
                    equipo: {
                        select: {
                            proyectoMateria: {
                                select: {
                                    id: true,
                                    materia: { select: { id: true, nombre: true, codigo: true } },
                                    periodo: { select: { id: true, nombre: true } },
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: [{ creadoEn: "desc" }, { id: "desc" }],
    });

    const contextos = new Map();
    for (const documento of documentos) {
        const contexto = documento.entrega?.equipo?.proyectoMateria;
        if (!contexto) continue;

        if (!contextos.has(contexto.id)) {
            contextos.set(contexto.id, {
                proyectoMateriaId: contexto.id,
                materia: contexto.materia,
                periodo: contexto.periodo,
                documentos: [],
            });
        }

        contextos.get(contexto.id).documentos.push({
            id: documento.id,
            nombre: documento.nombre,
            mimetype: documento.mimetype,
            tamano: documento.tamano,
            tipo: documento.tipo,
            creadoEn: documento.creadoEn,
        });
    }

    return {
        proyectoId: proyecto.id,
        contextos: [...contextos.values()].sort((a, b) => a.proyectoMateriaId - b.proyectoMateriaId),
    };
}
