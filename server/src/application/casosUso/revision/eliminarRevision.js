import { crearError, ensureIdPositivo } from "../../../dominio/revision/helpersRevision.js";
import { revisionRepositorio } from "../../../infrastructure/repositories/repositorioRevision.js";
import { esAdminODirector } from "../equipo/permisosEquipo.js";

export async function eliminarRevisionCasoUso(idRaw, usuario) {
    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido");

    const revision = await revisionRepositorio.obtenerPorId(id);
    if (!revision) throw crearError("La revisión no existe", 404);

    // Solo el revisor original o Admin/Director pueden eliminarla.
    if (revision.revisorId !== usuario.id && !esAdminODirector(usuario)) {
        throw crearError("No tienes permisos para eliminar esta revisión", 403);
    }

    return revisionRepositorio.eliminar(id);
}
