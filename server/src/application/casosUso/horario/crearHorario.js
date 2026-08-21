import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { crearHorario } from "../../../dominio/horario/validacionHorario.js";
import { toHoraDate } from "../../../dominio/horario/helpersHorario.js";
import { horarioRepositorio } from "../../../infrastructure/repositories/repositorioHorario.js";

export async function crearHorarioCasoUso(payload) {
    const body = crearHorario.parse(payload);

    const mat = await horarioRepositorio.existeMateria(body.materiaId);
    if (!mat) throw crearError("La materia indicada no existe", 404);

    const ini = toHoraDate(body.horaInicio);
    const fin = toHoraDate(body.horaFin);

    if (!ini || !fin) throw crearError("Formato de hora inválido (use HH:MM)", 400);
    if (fin <= ini) throw crearError("horaFin debe ser mayor que horaInicio", 400);

    const solapa = await horarioRepositorio.haySolapamiento({
        materiaId: body.materiaId,
        dia: body.dia,
        ini,
        fin,
    });
    if (solapa) throw crearError("El horario se solapa con otro existente para esa materia y día", 409);

    return horarioRepositorio.crear({
        materiaId: body.materiaId,
        dia: body.dia,
        horaInicio: ini,
        horaFin: fin,
        aula: body.aula,
    });
}
