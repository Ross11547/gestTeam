import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { crearError, ensureIdPositivo } from "../../../dominio/comun/helpersComunes.js";
import { obtenerContextoCierre, esDirectorDeCarrera, validarCarreraUnica } from "../proyectoPeriodo/obtenerContextoCierre.js";

export async function cerrarProyectoDefinitivamenteCasoUso(proyectoIdRaw, payload, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const proyectoId = ensureIdPositivo(proyectoIdRaw);
    const proyectoPeriodoId = ensureIdPositivo(payload?.proyectoPeriodoId);
    if (!proyectoId || !proyectoPeriodoId) throw crearError("IDs inválidos", 400);

    const { proyectoPeriodo, idsCarrera, hitoFinal, todosEvaluados } = await obtenerContextoCierre(proyectoPeriodoId);
    if (proyectoPeriodo.proyectoId !== proyectoId) {
        throw crearError("El ProyectoPeriodo no corresponde al proyecto", 400);
    }
    if (proyectoPeriodo.proyecto.estado !== "ACTIVO") {
        throw crearError("Solo un proyecto ACTIVO puede cerrarse definitivamente", 409);
    }
    if (proyectoPeriodo.estado !== "CERRADO_PERIODO") {
        throw crearError("El ProyectoPeriodo debe estar CERRADO_PERIODO", 409);
    }

    const carreraId = validarCarreraUnica(idsCarrera);
    if (!esDirectorDeCarrera(usuario, carreraId)) {
        throw crearError("Solo el Director de la carrera puede cerrar definitivamente el proyecto", 403);
    }
    if (!hitoFinal || !todosEvaluados) {
        throw crearError("Todos los contextos deben tener evaluación correspondiente a H5", 409);
    }

    const actualizado = await prisma.proyecto.updateMany({
        where: { id: proyectoId, estado: "ACTIVO" },
        data: { estado: "CERRADO" },
    });
    if (actualizado.count !== 1) throw crearError("El proyecto ya no está ACTIVO", 409);

    return prisma.proyecto.findUnique({
        where: { id: proyectoId },
        select: { id: true, titulo: true, descripcion: true, estado: true, proyectoOrigenId: true, updatedAt: true },
    });
}
