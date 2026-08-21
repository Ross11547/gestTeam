import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { crearDocenteMateria } from "../../../dominio/docenteMateria/validacionDocenteMateria.js";
import { docenteMateriaRepositorio } from "../../../infrastructure/repositories/repositorioDocenteMateria.js";

export async function crearDocenteMateriaCasoUso(payload) {
    const body = crearDocenteMateria.parse(payload);

    const usuario = await docenteMateriaRepositorio.existeUsuario(body.usuarioId);
    if (!usuario) throw crearError("El usuario no existe", 404);

    const materia = await docenteMateriaRepositorio.existeMateria(body.materiaId);
    if (!materia) throw crearError("La materia no existe", 404);

    const yaExiste = await docenteMateriaRepositorio.existePorUsuarioMateria(body.usuarioId, body.materiaId);
    if (yaExiste) throw crearError("El docente ya está asignado a esta materia", 409);

    return docenteMateriaRepositorio.crear({
        usuarioId: body.usuarioId,
        materiaId: body.materiaId,
    });
}
