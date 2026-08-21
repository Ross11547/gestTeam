import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { actualizarDocenteMateria } from "../../../dominio/docenteMateria/validacionDocenteMateria.js";
import { docenteMateriaRepositorio } from "../../../infrastructure/repositories/repositorioDocenteMateria.js";

export async function actualizarDocenteMateriaCasoUso(id, payload) {
    const actual = await docenteMateriaRepositorio.obtenerPorId(id);
    if (!actual) throw crearError("Asignación docente materia no encontrada", 404);

    const body = actualizarDocenteMateria.parse(payload);

    const data = {};

    if (body.usuarioId !== undefined) {
        const usuario = await docenteMateriaRepositorio.existeUsuario(body.usuarioId);
        if (!usuario) throw crearError("El usuario no existe", 404);
        data.usuarioId = body.usuarioId;
    }

    if (body.materiaId !== undefined) {
        const materia = await docenteMateriaRepositorio.existeMateria(body.materiaId);
        if (!materia) throw crearError("La materia no existe", 404);
        data.materiaId = body.materiaId;
    }

    if (Object.keys(data).length === 0) return actual;

    const usuarioIdFinal = data.usuarioId ?? actual.usuario.id;
    const materiaIdFinal = data.materiaId ?? actual.materia.id;

    const dup = await docenteMateriaRepositorio.existePorUsuarioMateria(usuarioIdFinal, materiaIdFinal, id);
    if (dup) throw crearError("Ya existe una asignación para ese docente y materia", 409);

    return docenteMateriaRepositorio.actualizar(id, data);
}
