import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { actualizarHorario } from "../../../dominio/horario/validacionHorario.js";
import { toHoraDate } from "../../../dominio/horario/helpersHorario.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { horarioRepositorio } from "../../../infrastructure/repositories/repositorioHorario.js";

export async function actualizarHorarioCasoUso(id, payload) {
    if (!Number.isInteger(id) || id <= 0) throw crearError("ID inválido", 400);

    const current = await prisma.horario.findUnique({ where: { id } });
    if (!current) throw crearError("Horario no encontrado", 404);

    const body = actualizarHorario.parse(payload);

    let materiaId = current.materiaId;
    let dia = current.dia;
    let ini = current.horaInicio;
    let fin = current.horaFin;

    const data = {};

    if (body.materiaId !== undefined) {
        const mat = await horarioRepositorio.existeMateria(body.materiaId);
        if (!mat) throw crearError("La materia indicada no existe", 404);
        materiaId = body.materiaId;
        data.materiaId = body.materiaId;
    }

    if (body.dia !== undefined) {
        dia = body.dia;
        data.dia = body.dia;
    }

    if (body.horaInicio !== undefined) {
        const d = toHoraDate(body.horaInicio);
        if (!d) throw crearError("horaInicio inválida (HH:MM)", 400);
        ini = d;
        data.horaInicio = d;
    }

    if (body.horaFin !== undefined) {
        const d = toHoraDate(body.horaFin);
        if (!d) throw crearError("horaFin inválida (HH:MM)", 400);
        fin = d;
        data.horaFin = d;
    }

    if (fin <= ini) throw crearError("horaFin debe ser mayor que horaInicio", 400);

    const solapa = await horarioRepositorio.haySolapamiento({
        idIgnorar: id,
        materiaId,
        dia,
        ini,
        fin,
    });
    if (solapa) throw crearError("El horario se solapa con otro existente para esa materia y día", 409);

    if (body.aula !== undefined) {
        data.aula = body.aula;
    }

    return horarioRepositorio.actualizar(id, data);
}
