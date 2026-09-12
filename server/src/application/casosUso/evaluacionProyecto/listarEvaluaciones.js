import { listarEvaluaciones } from "../../../dominio/evaluacionProyecto/validacionEvaluacionProyecto.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { crearError } from "../../../dominio/evaluacionProyecto/helpersEvaluacionProyecto.js";
import { obtenerFiltroProyectos } from "../../../dominio/comun/autoridadProyecto.js";

const SELECCION = {
    id: true,
    proyectoId: true,
    periodoId: true,
    evaluadorId: true,
    tipoEvaluador: true,
    puntaje: true,
    comentario: true,
    criteriosJson: true,
    createdAt: true,
    evaluador: { select: { id: true, nombre: true, apellido: true, correo: true } },
};

export async function listarEvaluacionesCasoUso(query, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const filtros = listarEvaluaciones.parse(query);
    const filtroProyectos = await obtenerFiltroProyectos(usuario);

    if (filtros.proyectoId !== undefined) {
        const permitido = await prisma.proyecto.findFirst({
            where: { id: filtros.proyectoId, ...filtroProyectos },
            select: { id: true },
        });
        if (!permitido) throw crearError("No tienes permisos para ver estas evaluaciones", 403);
    }

    return prisma.evaluacionProyecto.findMany({
        where: {
            proyectoId: filtros.proyectoId,
            periodoId: filtros.periodoId,
            evaluadorId: filtros.evaluadorId,
            proyecto: filtroProyectos,
        },
        select: SELECCION,
        orderBy: { createdAt: "desc" },
    });
}
