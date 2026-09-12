import { crearError, ensureIdPositivo } from "../../../dominio/entrega/helpersEntrega.js";
import { entregaRepositorio } from "../../../infrastructure/repositories/repositorioEntrega.js";
import { puedeGestionarEntrega } from "../../../dominio/comun/autoridadRecursoAcademico.js";

export async function eliminarEntregaCasoUso(idRaw, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido");

    const entrega = await entregaRepositorio.obtenerPorId(id);
    if (!entrega) throw crearError("La entrega no existe", 404);

    const autorizado = await puedeGestionarEntrega(id, usuario);
    if (!autorizado) {
        throw crearError("No tienes permisos para eliminar esta entrega", 403);
    }

    try {
        return await entregaRepositorio.eliminar(id);
    } catch (e) {
        if (e.code === "P2003") {
            throw crearError(
                "La entrega tiene revisiones o documentos asociados",
                409
            );
        }
        throw e;
    }
}
