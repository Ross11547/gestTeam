import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { crearInscripcionMateria } from "../../../dominio/inscripcionMateria/validacionInscripcionMateria.js";
import { inscripcionMateriaRepositorio } from "../../../infrastructure/repositories/repositorioInscripcionMateria.js";

export async function crearInscripcionMateriaCasoUso(payload) {
    const body = crearInscripcionMateria.parse(payload);

    const usuario = await inscripcionMateriaRepositorio.existeUsuario(body.usuarioId);
    if (!usuario) throw crearError("El usuario no existe", 404);

    const periodo = await inscripcionMateriaRepositorio.existePeriodo(body.periodoId);
    if (!periodo) throw crearError("El periodo académico no existe", 404);

    const materia = await inscripcionMateriaRepositorio.existeMateria(body.materiaId);
    if (!materia) throw crearError("La materia no existe", 404);

    const yaExiste = await inscripcionMateriaRepositorio.existePorUsuarioPeriodoMateria(
        body.usuarioId,
        body.periodoId,
        body.materiaId
    );
    if (yaExiste) throw crearError("El usuario ya está inscrito en esta materia para este periodo", 409);

    if (body.claseId !== undefined) {
        const clase = await inscripcionMateriaRepositorio.obtenerClase(body.claseId);
        if (!clase) throw crearError("La clase no existe", 404);
        if (clase.periodoId !== body.periodoId) throw crearError("La clase no pertenece al periodo indicado", 400);
        if (clase.materiaId !== body.materiaId) throw crearError("La clase no corresponde a la materia indicada", 400);
    }

    return inscripcionMateriaRepositorio.crear({
        usuarioId: body.usuarioId,
        periodoId: body.periodoId,
        materiaId: body.materiaId,
        claseId: body.claseId ?? null,
    });
}
