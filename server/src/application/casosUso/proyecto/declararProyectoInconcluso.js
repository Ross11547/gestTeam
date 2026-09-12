import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { crearError, ensureIdPositivo } from "../../../dominio/comun/helpersComunes.js";
import { obtenerContextoCierre, esDirectorDeCarrera, validarCarreraUnica } from "../proyectoPeriodo/obtenerContextoCierre.js";

export async function declararProyectoInconclusoCasoUso(proyectoIdRaw, payload, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const proyectoId = ensureIdPositivo(proyectoIdRaw);
    const proyectoPeriodoId = ensureIdPositivo(payload?.proyectoPeriodoId);
    if (!proyectoId || !proyectoPeriodoId) throw crearError("IDs inválidos", 400);

    const { proyectoPeriodo, idsCarrera } = await obtenerContextoCierre(proyectoPeriodoId);
    if (proyectoPeriodo.proyectoId !== proyectoId) {
        throw crearError("El ProyectoPeriodo no corresponde al proyecto", 400);
    }
    if (proyectoPeriodo.proyecto.estado === "CERRADO") {
        throw crearError("Un proyecto CERRADO no puede reactivarse ni declararse inconcluso", 409);
    }
    if (proyectoPeriodo.proyecto.estado !== "ACTIVO") {
        throw crearError("Solo un proyecto ACTIVO puede declararse inconcluso", 409);
    }

    const carreraId = validarCarreraUnica(idsCarrera);
    if (!esDirectorDeCarrera(usuario, carreraId)) {
        throw crearError("Solo el Director de la carrera puede declarar el proyecto inconcluso", 403);
    }

    const fechaFin = proyectoPeriodo.fechaFin || new Date();
    return prisma.$transaction(async (tx) => {
        const periodoActualizado = await tx.proyectoPeriodo.update({
            where: { id: proyectoPeriodoId },
            data: { estado: "CERRADO_PERIODO", fechaFin },
        });
        const actualizado = await tx.proyecto.updateMany({
            where: { id: proyectoId, estado: "ACTIVO" },
            data: { estado: "INCONCLUSO" },
        });
        if (actualizado.count !== 1) throw crearError("El proyecto ya no está ACTIVO", 409);
        const proyectoActualizado = await tx.proyecto.findUnique({ where: { id: proyectoId } });
        return { proyecto: proyectoActualizado, proyectoPeriodo: periodoActualizado };
    });
}
