import { ensureIdPositivo, crearError, esRolStaff } from "../../../dominio/evaluacionProyecto/helpersEvaluacionProyecto.js";
import { actualizarEvaluacion } from "../../../dominio/evaluacionProyecto/validacionEvaluacionProyecto.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function actualizarEvaluacionCasoUso(id, payload, usuario) {
    const idValido = ensureIdPositivo(id);
    if (!idValido) throw crearError("ID inválido", 400);

    const data = actualizarEvaluacion.parse(payload);

    const evaluacion = await prisma.evaluacionProyecto.findUnique({
        where: { id: idValido },
        select: { id: true, evaluadorId: true },
    });
    if (!evaluacion) throw crearError("La evaluación indicada no existe", 404);

    if (evaluacion.evaluadorId !== usuario.id && !esRolStaff(usuario)) {
        throw crearError("Solo el evaluador o el personal autorizado puede modificar esta evaluación", 403);
    }

    return prisma.evaluacionProyecto.update({
        where: { id: idValido },
        data: {
            puntaje: data.puntaje,
            comentario: data.comentario,
            criteriosJson: data.criteriosJson === undefined ? undefined : data.criteriosJson ?? null,
            tipoEvaluador: data.tipoEvaluador,
        },
        select: { id: true, puntaje: true, comentario: true, criteriosJson: true, createdAt: true },
    });
}
