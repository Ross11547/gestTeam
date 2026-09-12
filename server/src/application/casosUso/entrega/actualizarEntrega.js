import { actualizarEntrega } from "../../../dominio/entrega/validacionEntrega.js";
import { normalizarTexto, crearError, ensureIdPositivo } from "../../../dominio/entrega/helpersEntrega.js";
import { entregaRepositorio } from "../../../infrastructure/repositories/repositorioEntrega.js";
import { puedeGestionarEntrega } from "../../../dominio/comun/autoridadRecursoAcademico.js";

export async function actualizarEntregaCasoUso(idRaw, payload, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido");

    const entrega = await entregaRepositorio.obtenerPorId(id);
    if (!entrega) throw crearError("La entrega no existe", 404);

    const autorizado = await puedeGestionarEntrega(id, usuario);
    if (!autorizado) {
        throw crearError("No tienes permisos para modificar esta entrega", 403);
    }

    const data = actualizarEntrega.parse(payload);

    return entregaRepositorio.actualizar(id, {
        comentario: data.comentario !== undefined ? normalizarTexto(data.comentario) : undefined,
        evidenciaUrl: data.evidenciaUrl !== undefined
            ? (data.evidenciaUrl ? data.evidenciaUrl : null)
            : undefined,
    });
}
