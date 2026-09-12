import { actualizarRevision } from "../../../dominio/revision/validacionRevision.js";
import { normalizarTexto, crearError, ensureIdPositivo } from "../../../dominio/revision/helpersRevision.js";
import { revisionRepositorio } from "../../../infrastructure/repositories/repositorioRevision.js";
import { puedeGestionarRevision } from "../../../dominio/comun/autoridadRecursoAcademico.js";

export async function actualizarRevisionCasoUso(idRaw, payload, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido");

    const revision = await revisionRepositorio.obtenerPorId(id);
    if (!revision) throw crearError("La revisión no existe", 404);

    const autorizado = await puedeGestionarRevision(id, usuario);
    if (!autorizado) {
        throw crearError("No tienes permisos para modificar esta revisión", 403);
    }

    const data = actualizarRevision.parse(payload);

    return revisionRepositorio.actualizar(id, {
        nota: data.nota,
        feedback: data.feedback !== undefined ? normalizarTexto(data.feedback) : undefined,
    });
}
