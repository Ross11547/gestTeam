import { crearSolicitudAcceso } from "../../../dominio/solicitudAcceso/validacionSolicitudAcceso.js";
import { crearError } from "../../../dominio/solicitudAcceso/helpersSolicitudAcceso.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function crearSolicitudAccesoCasoUso(payload, usuario) {
    const data = crearSolicitudAcceso.parse(payload);

    const proyecto = await prisma.proyecto.findUnique({
        where: { id: data.proyectoId },
        select: { id: true, titulo: true },
    });
    if (!proyecto) throw crearError("El proyecto indicado no existe", 404);

    // Quien ya es miembro no necesita solicitar acceso.
    const yaEsMiembro = await prisma.miembroProyecto.findUnique({
        where: { proyectoId_usuarioId: { proyectoId: data.proyectoId, usuarioId: usuario.id } },
        select: { id: true },
    });
    if (yaEsMiembro) throw crearError("Ya eres miembro de este proyecto", 409);

    // Una sola solicitud pendiente por usuario y proyecto.
    const pendiente = await prisma.solicitudAccesoProyecto.findFirst({
        where: { proyectoId: data.proyectoId, solicitanteId: usuario.id, estado: "PENDIENTE" },
        select: { id: true },
    });
    if (pendiente) throw crearError("Ya tienes una solicitud pendiente para este proyecto", 409);

    return prisma.solicitudAccesoProyecto.create({
        data: {
            proyectoId: data.proyectoId,
            solicitanteId: usuario.id,
            tipo: data.tipo,
            motivo: data.motivo ?? "",
            expiresAt: data.expiresAt ?? null,
        },
        select: {
            id: true,
            proyectoId: true,
            estado: true,
            tipo: true,
            motivo: true,
            createdAt: true,
        },
    });
}
