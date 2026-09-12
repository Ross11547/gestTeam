import { proyectoRepositorio } from "../../../infrastructure/repositories/repositorioProyecto.js";
import { obtenerFiltroProyectos } from "../../../dominio/comun/autoridadProyecto.js";
import { crearError } from "../../../dominio/proyecto/helpersProyecto.js";

export async function listarProyectosCasoUso(usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const filtros = await obtenerFiltroProyectos(usuario);
    return proyectoRepositorio.listar(filtros);
}
