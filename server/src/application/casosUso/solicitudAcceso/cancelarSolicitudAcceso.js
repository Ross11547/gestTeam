import { ensureIdPositivo, crearError } from "../../../dominio/solicitudAcceso/helpersSolicitudAcceso.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function cancelarSolicitudAccesoCasoUso(id, usuario) {
    const idValido = ensureIdPositivo(id);
    if (!idValido) throw crearError("ID inválido", 400);

    const solicitud = await prisma.solicitudAccesoProyecto.findUnique({
        where: { id: idValido },
        select: { id: true, solicitanteId: true, estado: true },
    });
    if (!solicitud) throw crearError("La solicitud indicada no existe", 404);

    if (solicitud.solicitanteId !== usuario.id) {
        throw crearError("Solo el solicitante puede eliminar esta solicitud", 403);
    }
    if (solicitud.estado !== "PENDIENTE") {
        throw crearError("Solo puedes eliminar solicitudes pendientes", 409);
    }

    await prisma.solicitudAccesoProyecto.delete({ where: { id: idValido } });
    return { id: idValido };
}
