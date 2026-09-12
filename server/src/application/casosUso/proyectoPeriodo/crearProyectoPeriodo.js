import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { crearProyectoPeriodoSchema } from "../../../dominio/academico/validacionAcademico.js";
import { proyectoPeriodoRepositorio } from "../../../infrastructure/repositories/repositorioProyectoPeriodo.js";
import { hitoPeriodoRepositorio } from "../../../infrastructure/repositories/repositorioHitoPeriodo.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function crearProyectoPeriodoCasoUso(payload) {
    const data = crearProyectoPeriodoSchema.parse(payload);

    const proyecto = await prisma.proyecto.findUnique({
        where: { id: data.proyectoId },
        select: { id: true, estado: true },
    });
    if (!proyecto) throw crearError("El proyecto no existe", 404);

    const periodo = await prisma.periodoAcademico.findUnique({
        where: { id: data.periodoId },
        select: { id: true },
    });
    if (!periodo) throw crearError("El periodo académico no existe", 404);

    const duplicado = await proyectoPeriodoRepositorio.existePorProyectoYPeriodo(
        data.proyectoId,
        data.periodoId
    );
    if (duplicado) throw crearError("Ya existe un ProyectoPeriodo para este proyecto y periodo", 409);

    const hitosPeriodo = await hitoPeriodoRepositorio.listarPorPeriodo(data.periodoId);
    if (hitosPeriodo.length !== 5) {
        throw crearError(
            `El periodo debe tener exactamente 5 hitos institucionales. Tiene ${hitosPeriodo.length}.`,
            400
        );
    }
    const ordenes = hitosPeriodo.map((h) => h.orden).sort((a, b) => a - b);
    if (ordenes.join(",") !== "1,2,3,4,5") {
        throw crearError("El periodo no tiene los hitos H1-H5 completos", 400);
    }

    return prisma.$transaction(async (tx) => {
        const pp = await tx.proyectoPeriodo.create({
            data: {
                proyectoId: data.proyectoId,
                periodoId: data.periodoId,
                estado: "ACTIVO",
            },
        });

        await tx.hitoProyecto.createMany({
            data: hitosPeriodo.map((hp) => ({
                proyectoId: data.proyectoId,
                proyectoPeriodoId: pp.id,
                hitoPeriodoId: hp.id,
                nombre: hp.nombre,
                descripcion: null,
                peso: null,
                orden: hp.orden,
            })),
        });

        return tx.proyectoPeriodo.findUnique({
            where: { id: pp.id },
            include: {
                proyecto: { select: { id: true, titulo: true } },
                periodo: { select: { id: true, nombre: true } },
                hitos: {
                    include: {
                        hitoPeriodo: { select: { id: true, orden: true, nombre: true } },
                    },
                    orderBy: { hitoPeriodo: { orden: "asc" } },
                },
            },
        });
    });
}
