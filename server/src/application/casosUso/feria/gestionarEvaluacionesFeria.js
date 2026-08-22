import { evaluarFeriaEquipo } from "../../../dominio/feria/validacionFeria.js";
import { ensureIdPositivo, crearError } from "../../../dominio/feria/helpersFeria.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function evaluarFeriaEquipoCasoUso(feriaEquipoIdRaw, payload, usuario) {
    const id = ensureIdPositivo(feriaEquipoIdRaw);
    if (!id) throw crearError("ID inválido", 400);

    const data = evaluarFeriaEquipo.parse(payload);

    const inscrito = await prisma.feriaEquipo.findUnique({ where: { id }, select: { id: true } });
    if (!inscrito) throw crearError("La participación indicada no existe", 404);

    const previa = await prisma.feriaEvaluacion.findFirst({
        where: { feriaEquipoId: id, juradoId: usuario.id },
        select: { id: true },
    });
    if (previa) throw crearError("Ya registraste tu evaluación para este equipo", 409);

    try {
        return await prisma.feriaEvaluacion.create({
            data: {
                feriaEquipoId: id,
                juradoId: usuario.id,
                puntaje: data.puntaje,
                comentario: data.comentario ?? "",
            },
            select: { id: true, feriaEquipoId: true, juradoId: true, puntaje: true, comentario: true, createdAt: true },
        });
    } catch (e) {
        if (e.code === "P2002") throw crearError("Ya registraste tu evaluación para este equipo", 409);
        throw e;
    }
}

export async function listarEvaluacionesFeriaEquipoCasoUso(feriaEquipoIdRaw) {
    const id = ensureIdPositivo(feriaEquipoIdRaw);
    if (!id) throw crearError("ID inválido", 400);

    const inscrito = await prisma.feriaEquipo.findUnique({ where: { id }, select: { id: true } });
    if (!inscrito) throw crearError("La participación indicada no existe", 404);

    const evaluaciones = await prisma.feriaEvaluacion.findMany({
        where: { feriaEquipoId: id },
        select: {
            id: true,
            puntaje: true,
            comentario: true,
            createdAt: true,
            jurado: { select: { id: true, nombre: true, apellido: true } },
        },
        orderBy: { createdAt: "asc" },
    });

    const promedio = evaluaciones.length
        ? Math.round((evaluaciones.reduce((a, e) => a + e.puntaje, 0) / evaluaciones.length) * 100) / 100
        : null;

    return { total: evaluaciones.length, promedio, evaluaciones };
}
