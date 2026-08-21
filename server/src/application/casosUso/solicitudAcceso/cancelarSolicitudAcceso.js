import { ensureIdPositivo, crearError, esRolStaff } from "../../../dominio/solicitudAcceso/helpersSolicitudAcceso.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

// El solicitante cancela su propia solicitud pendiente; el staff puede
// eliminar cualquiera.
export async function cancelarSolicitudAccesoCasoUso(id, usuario) {
    const idValido = ensureIdPositivo(id);
    if (!idValido) throw crearError("ID inválido", 400);

    const solicitud = await prisma.solicitudAccesoProyecto.findUnique({
        where: { id: idValido },
        select: { id: true, solicitanteId: true, estado: true },
    });
    if (!solicitud) throw crearError("La solicitud indicada no existe", 404);

    if (solicitud.solicitanteId !== usuario.id && !esRolStaff(usuario)) {
        throw crearError("Solo el solicitante o el personal autorizado puede eliminar esta solicitud", 403);
    }

    if (solicitud.solicitanteId === usuario.id && solicitud.estado !== "PENDIENTE") {
        throw crearError("Solo puedes eliminar solicitudes pendientes", 409);
    }

    await prisma.solicitudAccesoProyecto.delete({ where: { id: idValido } });
    return { id: idValido };
}
