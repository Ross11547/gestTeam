import { ensureIdPositivo, crearError } from "../../../dominio/evaluacionProyecto/helpersEvaluacionProyecto.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function obtenerEvaluacionPorIdCasoUso(id) {
    const idValido = ensureIdPositivo(id);
    if (!idValido) throw crearError("ID inválido", 400);

    const evaluacion = await prisma.evaluacionProyecto.findUnique({
        where: { id: idValido },
        select: {
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
            proyecto: { select: { id: true, titulo: true } },
        },
    });

    if (!evaluacion) throw crearError("La evaluación indicada no existe", 404);
    return evaluacion;
}
