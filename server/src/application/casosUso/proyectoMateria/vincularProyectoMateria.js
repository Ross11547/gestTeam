import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { vincularProyectoMateriaSchema } from "../../../dominio/academico/validacionAcademico.js";
import { proyectoPeriodoRepositorio } from "../../../infrastructure/repositories/repositorioProyectoPeriodo.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function vincularProyectoMateriaCasoUso(payload) {
    const data = vincularProyectoMateriaSchema.parse(payload);

    const pp = await proyectoPeriodoRepositorio.obtenerPorId(data.proyectoPeriodoId);
    if (!pp) throw crearError("El ProyectoPeriodo no existe", 404);

    const materia = await prisma.materia.findUnique({
        where: { id: data.materiaId },
        select: { id: true, nombre: true },
    });
    if (!materia) throw crearError("La materia no existe", 404);

    if (data.claseId) {
        const clase = await prisma.claseMateria.findUnique({
            where: { id: data.claseId },
            include: { materia: { select: { id: true } }, periodo: { select: { id: true } } },
        });
        if (!clase) throw crearError("La clase no existe", 404);
        if (clase.materia.id !== data.materiaId) {
            throw crearError("La clase no corresponde a la materia indicada", 400);
        }
        if (clase.periodo.id !== pp.periodoId) {
            throw crearError("La clase no corresponde al periodo del ProyectoPeriodo", 400);
        }
    }

    const duplicado = await prisma.proyectoMateria.findUnique({
        where: {
            proyectoPeriodoId_materiaId: {
                proyectoPeriodoId: data.proyectoPeriodoId,
                materiaId: data.materiaId,
            },
        },
    });
    if (duplicado) {
        throw crearError("La materia ya está vinculada a este ProyectoPeriodo", 409);
    }

    return prisma.proyectoMateria.create({
        data: {
            proyectoId: pp.proyectoId,
            periodoId: pp.periodoId,
            proyectoPeriodoId: data.proyectoPeriodoId,
            materiaId: data.materiaId,
            claseId: data.claseId ?? null,
        },
        include: {
            proyectoPeriodo: {
                include: {
                    proyecto: { select: { id: true, titulo: true } },
                    periodo: { select: { id: true, nombre: true } },
                },
            },
            materia: { select: { id: true, nombre: true } },
        },
    });
}
