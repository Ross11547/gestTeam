import { crearError, ensureIdPositivo } from "../../../dominio/entrega/helpersEntrega.js";
import { entregaRepositorio } from "../../../infrastructure/repositories/repositorioEntrega.js";

export async function eliminarEntregaCasoUso(idRaw) {
    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido");

    const entrega = await entregaRepositorio.obtenerPorId(id);
    if (!entrega) throw crearError("La entrega no existe", 404);

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
