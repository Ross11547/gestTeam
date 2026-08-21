import { listarEvaluaciones } from "../../../dominio/evaluacionProyecto/validacionEvaluacionProyecto.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

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

export async function listarEvaluacionesCasoUso(query) {
    const filtros = listarEvaluaciones.parse(query);

    return prisma.evaluacionProyecto.findMany({
        where: {
            proyectoId: filtros.proyectoId,
            periodoId: filtros.periodoId,
            evaluadorId: filtros.evaluadorId,
        },
        select: SELECCION,
        orderBy: { createdAt: "desc" },
    });
}
