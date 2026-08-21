import { actualizarRevision } from "../../../dominio/revision/validacionRevision.js";
import { normalizarTexto, crearError, ensureIdPositivo } from "../../../dominio/revision/helpersRevision.js";
import { revisionRepositorio } from "../../../infrastructure/repositories/repositorioRevision.js";
import { esAdminODirector } from "../equipo/permisosEquipo.js";

export async function actualizarRevisionCasoUso(idRaw, payload, usuario) {
    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido");

    const revision = await revisionRepositorio.obtenerPorId(id);
    if (!revision) throw crearError("La revisión no existe", 404);

    // Solo el revisor original o Admin/Director pueden editarla.
    if (revision.revisorId !== usuario.id && !esAdminODirector(usuario)) {
        throw crearError("No tienes permisos para modificar esta revisión", 403);
    }

    const data = actualizarRevision.parse(payload);

    return revisionRepositorio.actualizar(id, {
        nota: data.nota,
        feedback: data.feedback !== undefined ? normalizarTexto(data.feedback) : undefined,
    });
}
