import { actualizarEntrega } from "../../../dominio/entrega/validacionEntrega.js";
import { normalizarTexto, crearError, ensureIdPositivo } from "../../../dominio/entrega/helpersEntrega.js";
import { entregaRepositorio } from "../../../infrastructure/repositories/repositorioEntrega.js";
import { esStaff } from "../equipo/permisosEquipo.js";

export async function actualizarEntregaCasoUso(idRaw, payload, usuario) {
    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido");

    const entrega = await entregaRepositorio.obtenerPorId(id);
    if (!entrega) throw crearError("La entrega no existe", 404);

    // Solo el autor de la entrega o el staff pueden modificarla.
    if (!esStaff(usuario) && entrega.autorId !== usuario.id) {
        throw crearError("No tienes permisos para modificar esta entrega", 403);
    }

    const data = actualizarEntrega.parse(payload);

    // Marcar REVISADO es tarea del docente/staff al revisar.
    if (data.estado === "REVISADO" && !esStaff(usuario)) {
        throw crearError("Solo el personal puede marcar una entrega como revisada", 403);
    }

    return entregaRepositorio.actualizar(id, {
        estado: data.estado,
        comentario: data.comentario !== undefined ? normalizarTexto(data.comentario) : undefined,
        evidenciaUrl: data.evidenciaUrl !== undefined
            ? (data.evidenciaUrl ? data.evidenciaUrl : null)
            : undefined,
    });
}
