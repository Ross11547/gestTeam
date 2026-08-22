import { crearEquipo } from "../../../dominio/equipo/validacionEquipo.js";
import { normalizarTexto, crearError } from "../../../dominio/equipo/helpersEquipo.js";
import { equipoRepositorio } from "../../../infrastructure/repositories/repositorioEquipo.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function crearEquipoCasoUso(payload, usuario) {
    const data = crearEquipo.parse(payload);

    const proyecto = await prisma.proyecto.findUnique({
        where: { id: data.proyectoId },
        select: { id: true },
    });

    if (!proyecto) throw crearError("El proyecto indicado no existe", 404);

    for (const campo of ["materiaId", "periodoId", "claseId"]) {
        const valor = data[campo];
        if (valor === undefined || valor === null) continue;

        const modelo = { materiaId: "materia", periodoId: "periodoAcademico", claseId: "claseMateria" }[campo];
        const registro = await prisma[modelo].findUnique({ where: { id: valor }, select: { id: true } });

        if (!registro) throw crearError(`El registro indicado en ${campo} no existe`, 404);
    }

    try {
        return await equipoRepositorio.crearConLider(
            {
                proyectoId: data.proyectoId,
                nombre: normalizarTexto(data.nombre),
                tipoGrupo: data.tipoGrupo ?? undefined,
                materiaId: data.materiaId ?? null,
                periodoId: data.periodoId ?? null,
                claseId: data.claseId ?? null,
                creadoPorId: usuario.id,
            },
            usuario.id
        );
    } catch (e) {
        if (e.code === "P2003") {
            throw crearError("Alguna referencia indicada no existe", 404);
        }
        throw e;
    }
}
