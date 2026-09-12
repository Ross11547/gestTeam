import { ensureIdPositivo, crearError } from "../../../dominio/evaluacionProyecto/helpersEvaluacionProyecto.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { puedeVerProyecto } from "../../../dominio/comun/autoridadProyecto.js";

export async function obtenerEvaluacionPorIdCasoUso(id, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

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

    const autorizado = await puedeVerProyecto(evaluacion.proyectoId, usuario);
    if (!autorizado) throw crearError("No tienes permisos para ver esta evaluación", 403);

    return evaluacion;
}
