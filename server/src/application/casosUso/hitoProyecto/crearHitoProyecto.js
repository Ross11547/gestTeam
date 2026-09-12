import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function crearHitoProyectoCasoUso(payload) {
    const { proyectoPeriodoId, hitoPeriodoId, nombre, descripcion, peso, orden, estado } = payload || {};

    if (!proyectoPeriodoId || !Number.isInteger(proyectoPeriodoId) || proyectoPeriodoId <= 0) {
        throw crearError("proyectoPeriodoId inválido", 400);
    }
    if (!hitoPeriodoId || !Number.isInteger(hitoPeriodoId) || hitoPeriodoId <= 0) {
        throw crearError("hitoPeriodoId inválido", 400);
    }

    const pp = await prisma.proyectoPeriodo.findUnique({
        where: { id: proyectoPeriodoId },
        include: { periodo: { select: { id: true } }, proyecto: { select: { id: true } } },
    });
    if (!pp) throw crearError("El ProyectoPeriodo no existe", 404);

    const hp = await prisma.hitoPeriodo.findUnique({
        where: { id: hitoPeriodoId },
        select: { id: true, periodoId: true, orden: true, nombre: true },
    });
    if (!hp) throw crearError("El HitoPeriodo no existe", 404);

    if (hp.periodoId !== pp.periodo.id) {
        throw crearError("El HitoPeriodo no pertenece al periodo del ProyectoPeriodo", 400);
    }

    const existente = await prisma.hitoProyecto.findUnique({
        where: { proyectoPeriodoId_hitoPeriodoId: { proyectoPeriodoId, hitoPeriodoId } },
    });
    if (existente) {
        throw crearError("Ya existe un HitoProyecto para este HitoPeriodo en el ProyectoPeriodo", 409);
    }

    const total = await prisma.hitoProyecto.count({ where: { proyectoPeriodoId } });
    if (total >= 5) {
        throw crearError("El ProyectoPeriodo ya tiene sus 5 hitos institucionales", 400);
    }

    return prisma.hitoProyecto.create({
        data: {
            proyectoId: pp.proyecto.id,
            proyectoPeriodoId,
            hitoPeriodoId,
            nombre: nombre ?? hp.nombre,
            descripcion: descripcion ?? null,
            peso: peso ?? null,
            orden: orden ?? hp.orden,
            estado: estado ?? "PENDIENTE",
        },
    });
}
