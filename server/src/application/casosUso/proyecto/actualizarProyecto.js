import { actualizarProyecto } from "../../../dominio/proyecto/validacionProyecto.js";
import { normalizarTexto, crearError } from "../../../dominio/proyecto/helpersProyecto.js";
import { tieneAutoridadSobreProyecto } from "../../../dominio/comun/autoridadProyecto.js";
import { proyectoRepositorio } from "../../../infrastructure/repositories/repositorioProyecto.js";

export async function actualizarProyectoCasoUso(id, payload, usuario) {
    const actual = await proyectoRepositorio.obtenerPorId(id);
    if (!actual) throw crearError("Proyecto no encontrado", 404);

    const autorizado = await tieneAutoridadSobreProyecto(actual.id, usuario);
    if (!autorizado) throw crearError("No tienes permisos sobre este proyecto", 403);

    const body = actualizarProyecto.parse(payload);

    const data = {};

    if (body.titulo !== undefined) data.titulo = normalizarTexto(body.titulo);

    if (body.descripcion !== undefined) data.descripcion = normalizarTexto(body.descripcion);

    if (body.codigoMateria !== undefined) {
        data.codigoMateria = body.codigoMateria ? normalizarTexto(body.codigoMateria) : null;
    }

    if (body.tipoGrupo !== undefined) data.tipoGrupo = body.tipoGrupo;

    if (body.estado !== undefined) data.estado = body.estado;

    if (body.repoUrl !== undefined) data.repoUrl = body.repoUrl ? body.repoUrl.trim() : null;

    if (Object.keys(data).length === 0) return actual;

    return proyectoRepositorio.actualizar(id, data);
}
