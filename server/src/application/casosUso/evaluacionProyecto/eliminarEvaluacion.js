import { ensureIdPositivo, crearError, esRolStaff } from "../../../dominio/evaluacionProyecto/helpersEvaluacionProyecto.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function eliminarEvaluacionCasoUso(id, usuario) {
    const idValido = ensureIdPositivo(id);
    if (!idValido) throw crearError("ID inválido", 400);

    const evaluacion = await prisma.evaluacionProyecto.findUnique({
        where: { id: idValido },
        select: { id: true, evaluadorId: true },
    });
    if (!evaluacion) throw crearError("La evaluación indicada no existe", 404);

    if (evaluacion.evaluadorId !== usuario.id && !esRolStaff(usuario)) {
        throw crearError("Solo el evaluador o el personal autorizado puede eliminar esta evaluación", 403);
    }

    await prisma.evaluacionProyecto.delete({ where: { id: idValido } });
    return { id: idValido };
}
