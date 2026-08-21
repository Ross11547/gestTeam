import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { actualizarInscripcionMateria } from "../../../dominio/inscripcionMateria/validacionInscripcionMateria.js";
import { inscripcionMateriaRepositorio } from "../../../infrastructure/repositories/repositorioInscripcionMateria.js";

export async function actualizarInscripcionMateriaCasoUso(id, payload) {
    const actual = await inscripcionMateriaRepositorio.obtenerPorId(id);
    if (!actual) throw crearError("Inscripción de materia no encontrada", 404);

    const body = actualizarInscripcionMateria.parse(payload);

    const data = {};

    if (body.usuarioId !== undefined) {
        const usuario = await inscripcionMateriaRepositorio.existeUsuario(body.usuarioId);
        if (!usuario) throw crearError("El usuario no existe", 404);
        data.usuarioId = body.usuarioId;
    }

    if (body.periodoId !== undefined) {
        const periodo = await inscripcionMateriaRepositorio.existePeriodo(body.periodoId);
        if (!periodo) throw crearError("El periodo académico no existe", 404);
        data.periodoId = body.periodoId;
    }

    if (body.materiaId !== undefined) {
        const materia = await inscripcionMateriaRepositorio.existeMateria(body.materiaId);
        if (!materia) throw crearError("La materia no existe", 404);
        data.materiaId = body.materiaId;
    }

    if (body.claseId !== undefined) {
        if (body.claseId === null) {
            data.claseId = null;
        } else {
            const clase = await inscripcionMateriaRepositorio.obtenerClase(body.claseId);
            if (!clase) throw crearError("La clase no existe", 404);
            data.claseId = body.claseId;
        }
    }

    if (Object.keys(data).length === 0) return actual;

    const usuarioIdFinal = data.usuarioId ?? actual.usuarioId;
    const periodoIdFinal = data.periodoId ?? actual.periodoId;
    const materiaIdFinal = data.materiaId ?? actual.materiaId;

    const dup = await inscripcionMateriaRepositorio.existePorUsuarioPeriodoMateria(
        usuarioIdFinal,
        periodoIdFinal,
        materiaIdFinal,
        id
    );
    if (dup) throw crearError("Ya existe una inscripción para ese usuario, periodo y materia", 409);

    const claseIdFinal =
        data.claseId !== undefined ? data.claseId : (actual.clase ? actual.clase.id : null);

    if (claseIdFinal) {
        const clase = await inscripcionMateriaRepositorio.obtenerClase(claseIdFinal);
        if (!clase) throw crearError("La clase no existe", 404);
        if (clase.periodoId !== periodoIdFinal) throw crearError("La clase no pertenece al periodo indicado", 400);
        if (clase.materiaId !== materiaIdFinal) throw crearError("La clase no corresponde a la materia indicada", 400);
    }

    return inscripcionMateriaRepositorio.actualizar(id, data);
}
