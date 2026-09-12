import { entregaRepositorio } from "../../../infrastructure/repositories/repositorioEntrega.js";
import { ensureIdPositivo, crearError } from "../../../dominio/entrega/helpersEntrega.js";
import { puedeVerEntrega } from "../../../dominio/comun/autoridadRecursoAcademico.js";

export async function obtenerEntregaCasoUso(idRaw, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido");

    const entrega = await entregaRepositorio.obtenerPorId(id);
    if (!entrega) throw crearError("La entrega no existe", 404);

    const autorizado = await puedeVerEntrega(id, usuario);
    if (!autorizado) throw crearError("No tienes permisos para ver esta entrega", 403);

    return entrega;
}
