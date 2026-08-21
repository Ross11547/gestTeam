import { revisionRepositorio } from "../../../infrastructure/repositories/repositorioRevision.js";
import { ensureIdPositivo, crearError } from "../../../dominio/revision/helpersRevision.js";

export async function listarRevisionesPorEntregaCasoUso(query = {}) {
    const entregaId = ensureIdPositivo(query.entregaId);
    if (!entregaId) throw crearError("El parámetro entregaId es obligatorio");

    return revisionRepositorio.listarPorEntrega(entregaId);
}
