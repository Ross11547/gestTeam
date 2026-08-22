import { ensureIdPositivo, crearError } from "../../../dominio/hito/helpersHito.js";
import { avanzarHito } from "../../../dominio/hito/validacionHito.js";
import { tieneAutoridadSobreProyecto } from "../../../dominio/comun/autoridadProyecto.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

const TRANSICIONES = {
    PENDIENTE: ["ACTIVO", "CANCELADO"],
    ACTIVO: ["FINALIZADO", "CANCELADO"],
    FINALIZADO: [],
    CANCELADO: ["PENDIENTE"],
};

export async function avanzarEstadoHitoCasoUso(idRaw, payload, usuario) {
    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido", 400);

    const { estado: destino } = avanzarHito.parse(payload);

    const hito = await prisma.hitoProyecto.findUnique({
        where: { id },
        select: { id: true, proyectoId: true, estado: true, fechaInicio: true, fechaFin: true },
    });
    if (!hito) throw crearError("El hito no existe", 404);

    if (!(await tieneAutoridadSobreProyecto(hito.proyectoId, usuario))) {
        throw crearError("No tienes autoridad para cambiar el estado de este hito", 403);
    }

    const permitidos = TRANSICIONES[hito.estado] || [];
    if (!permitidos.includes(destino)) {
        throw crearError(
            `Transición inválida: un hito ${hito.estado} no puede pasar a ${destino}`,
            409
        );
    }

    const data = { estado: destino };
    if (destino === "ACTIVO" && !hito.fechaInicio) data.fechaInicio = new Date();
    if (destino === "FINALIZADO" && !hito.fechaFin) data.fechaFin = new Date();

    return prisma.hitoProyecto.update({
        where: { id },
        data,
        select: {
            id: true,
            orden: true,
            nombre: true,
            estado: true,
            fechaInicio: true,
            fechaFin: true,
            updatedAt: true,
        },
    });
}
