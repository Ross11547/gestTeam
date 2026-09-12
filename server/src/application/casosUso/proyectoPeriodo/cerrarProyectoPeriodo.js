import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { cerrarProyectoPeriodoSchema } from "../../../dominio/academico/validacionAcademico.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { obtenerContextoCierre, esDirectorDeCarrera, esDocenteDeContexto, validarCarreraUnica } from "./obtenerContextoCierre.js";

export async function cerrarProyectoPeriodoCasoUso(payload, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const data = cerrarProyectoPeriodoSchema.parse(payload);
    const contextoCierre = await obtenerContextoCierre(data.proyectoPeriodoId);
    const { proyectoPeriodo, contextos, idsCarrera, todosEvaluados } = contextoCierre;
    const carreraId = validarCarreraUnica(idsCarrera);

    if (proyectoPeriodo.estado === "CERRADO_PERIODO") {
        throw crearError("El ProyectoPeriodo ya está cerrado", 409);
    }

    const autorizado = contextos.length === 1
        ? esDirectorDeCarrera(usuario, carreraId) || esDocenteDeContexto(usuario, contextos[0])
        : esDirectorDeCarrera(usuario, carreraId);
    if (!autorizado) throw crearError("No tienes permisos para cerrar este ProyectoPeriodo", 403);

    if (contextos.length > 1 && !todosEvaluados) {
        throw crearError("Todos los contextos deben tener evaluación de H5", 409);
    }

    return prisma.proyectoPeriodo.update({
        where: { id: proyectoPeriodo.id },
        data: { estado: "CERRADO_PERIODO", fechaFin: new Date() },
        include: {
            proyecto: { select: { id: true, titulo: true, estado: true } },
            periodo: { select: { id: true, nombre: true } },
        },
    });
}
