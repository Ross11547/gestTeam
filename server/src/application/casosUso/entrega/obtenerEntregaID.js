import { entregaRepositorio } from "../../../infrastructure/repositories/repositorioEntrega.js";
import { ensureIdPositivo, crearError } from "../../../dominio/entrega/helpersEntrega.js";

export async function obtenerEntregaCasoUso(idRaw) {
    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido");

    const entrega = await entregaRepositorio.obtenerPorId(id);
    if (!entrega) throw crearError("La entrega no existe", 404);

    return entrega;
}
