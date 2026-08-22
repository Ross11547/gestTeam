import { resolverSolicitudAcceso } from "../../../dominio/solicitudAcceso/validacionSolicitudAcceso.js";
import { ensureIdPositivo, crearError } from "../../../dominio/solicitudAcceso/helpersSolicitudAcceso.js";
import { tieneAutoridadSobreProyecto } from "../../../dominio/comun/autoridadProyecto.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function resolverSolicitudAccesoCasoUso(id, payload, usuario) {
    const idValido = ensureIdPositivo(id);
    if (!idValido) throw crearError("ID inválido", 400);

    const data = resolverSolicitudAcceso.parse(payload);

    const solicitud = await prisma.solicitudAccesoProyecto.findUnique({
        where: { id: idValido },
        select: { id: true, proyectoId: true, solicitanteId: true, estado: true },
    });
    if (!solicitud) throw crearError("La solicitud indicada no existe", 404);
    if (solicitud.estado !== "PENDIENTE") {
        throw crearError("La solicitud ya fue resuelta", 409);
    }

    if (!(await tieneAutoridadSobreProyecto(solicitud.proyectoId, usuario))) {
        throw crearError("No tienes autoridad para resolver esta solicitud", 403);
    }

    const actualizada = await prisma.solicitudAccesoProyecto.update({
        where: { id: idValido },
        data: {
            estado: data.estado,
            respuesta: data.respuesta ?? "",
            aprobadorId: usuario.id,
            expiresAt: data.expiresAt === undefined ? undefined : data.expiresAt,
        },
        select: {
            id: true,
            proyectoId: true,
            estado: true,
            tipo: true,
            respuesta: true,
            expiresAt: true,
            updatedAt: true,
            solicitante: { select: { id: true, nombre: true, apellido: true } },
        },
    });

    let miembroAgregado = false;
    if (data.estado === "APROBADA" && data.agregarMiembro) {
        const yaMiembro = await prisma.miembroProyecto.findUnique({
            where: { proyectoId_usuarioId: { proyectoId: solicitud.proyectoId, usuarioId: solicitud.solicitanteId } },
            select: { id: true },
        });
        if (!yaMiembro) {
            await prisma.miembroProyecto.create({
                data: { proyectoId: solicitud.proyectoId, usuarioId: solicitud.solicitanteId, rol: "MEMBER" },
            });
            miembroAgregado = true;
        }
    }

    return { ...actualizada, miembroAgregado };
}
