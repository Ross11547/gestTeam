import { revisionRepositorio } from "../../../infrastructure/repositories/repositorioRevision.js";
import { ensureIdPositivo, crearError } from "../../../dominio/revision/helpersRevision.js";
import { puedeVerEntrega } from "../../../dominio/comun/autoridadRecursoAcademico.js";

export async function listarRevisionesPorEntregaCasoUso(query = {}, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const entregaId = ensureIdPositivo(query.entregaId);
    if (!entregaId) throw crearError("El parámetro entregaId es obligatorio");

    const autorizado = await puedeVerEntrega(entregaId, usuario);
    if (!autorizado) throw crearError("No tienes permisos para ver las revisiones de esta entrega", 403);

    return revisionRepositorio.listarPorEntrega(entregaId);
}
