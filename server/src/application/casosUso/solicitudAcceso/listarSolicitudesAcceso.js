import { listarSolicitudesAcceso } from "../../../dominio/solicitudAcceso/validacionSolicitudAcceso.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function listarSolicitudesAccesoCasoUso(query, usuario) {
    const filtros = listarSolicitudesAcceso.parse(query);

    const where = {
        proyectoId: filtros.proyectoId,
        proyectoMateriaId: filtros.proyectoMateriaId,
        estado: filtros.estado,
    };

    const rol = String(usuario?.rol?.nombre || "").trim().toLowerCase();
    if (rol === "estudiante") {
        where.solicitanteId = usuario.id;
    } else if (rol === "docente") {
        where.proyecto = { estado: "ACTIVO" };
        where.proyectoMateria = { clase: { docenteId: usuario.id } };
    } else if (rol === "director" && usuario.idCarrera) {
        where.proyecto = { estado: { in: ["CERRADO", "INCONCLUSO"] } };
        where.proyectoMateria = { materia: { idCarrera: Number(usuario.idCarrera) } };
    } else {
        where.id = -1;
    }

    return prisma.solicitudAccesoProyecto.findMany({
        where,
        select: {
            id: true,
            proyectoId: true,
            proyectoMateriaId: true,
            estado: true,
            tipo: true,
            motivo: true,
            respuesta: true,
            expiresAt: true,
            resueltoEn: true,
            createdAt: true,
            updatedAt: true,
            solicitante: { select: { id: true, nombre: true, apellido: true } },
            aprobador: { select: { id: true, nombre: true, apellido: true } },
            proyecto: { select: { id: true, titulo: true } },
            proyectoMateria: {
                select: { id: true, materia: { select: { id: true, nombre: true, codigo: true } } },
            },
            documentos: {
                select: { documento: { select: { id: true, nombre: true, mimetype: true, tamano: true, tipo: true } } },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}
