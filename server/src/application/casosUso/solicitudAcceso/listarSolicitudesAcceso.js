import { listarSolicitudesAcceso } from "../../../dominio/solicitudAcceso/validacionSolicitudAcceso.js";
import { esRolStaff } from "../../../dominio/solicitudAcceso/helpersSolicitudAcceso.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

// Staff ve todas las solicitudes; el resto solo las propias.
export async function listarSolicitudesAccesoCasoUso(query, usuario) {
    const filtros = listarSolicitudesAcceso.parse(query);

    const where = {
        proyectoId: filtros.proyectoId,
        estado: filtros.estado,
    };

    if (!esRolStaff(usuario)) {
        where.solicitanteId = usuario.id;
    }

    return prisma.solicitudAccesoProyecto.findMany({
        where,
        select: {
            id: true,
            proyectoId: true,
            estado: true,
            tipo: true,
            motivo: true,
            respuesta: true,
            expiresAt: true,
            createdAt: true,
            updatedAt: true,
            solicitante: { select: { id: true, nombre: true, apellido: true, correo: true } },
            aprobador: { select: { id: true, nombre: true, apellido: true } },
            proyecto: { select: { id: true, titulo: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}
