import { crearFeria, actualizarFeria } from "../../../dominio/feria/validacionFeria.js";
import { ensureIdPositivo, crearError } from "../../../dominio/feria/helpersFeria.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function crearFeriaCasoUso(payload) {
    const data = crearFeria.parse(payload);

    if (data.institucionId) {
        const institucion = await prisma.institucion.findUnique({
            where: { id: data.institucionId },
            select: { id: true },
        });
        if (!institucion) throw crearError("La institución indicada no existe", 404);
    }

    return prisma.feria.create({
        data: {
            institucionId: data.institucionId ?? null,
            nombre: data.nombre,
            descripcion: data.descripcion ?? "",
            fecha: new Date(data.fecha),
            lugar: data.lugar ?? "",
            imagenMapaUrl: data.imagenMapaUrl === undefined ? undefined : data.imagenMapaUrl,
        },
        select: { id: true, nombre: true, fecha: true, lugar: true },
    });
}

export async function actualizarFeriaCasoUso(idRaw, payload) {
    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido", 400);

    const data = actualizarFeria.parse(payload);

    const feria = await prisma.feria.findUnique({ where: { id }, select: { id: true } });
    if (!feria) throw crearError("La feria indicada no existe", 404);

    return prisma.feria.update({
        where: { id },
        data: {
            institucionId: data.institucionId,
            nombre: data.nombre,
            descripcion: data.descripcion,
            fecha: data.fecha ? new Date(data.fecha) : undefined,
            lugar: data.lugar,
            imagenMapaUrl: data.imagenMapaUrl,
        },
        select: { id: true, nombre: true, descripcion: true, fecha: true, lugar: true, imagenMapaUrl: true },
    });
}

export async function eliminarFeriaCasoUso(idRaw) {
    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido", 400);

    const feria = await prisma.feria.findUnique({ where: { id }, select: { id: true } });
    if (!feria) throw crearError("La feria indicada no existe", 404);

    // Hijos primero (los FK son restrict): evaluaciones -> miembros -> equipos -> categorias
    await prisma.$transaction([
        prisma.feriaEvaluacion.deleteMany({ where: { feriaEquipo: { feriaId: id } } }),
        prisma.feriaEquipoMiembro.deleteMany({ where: { feriaEquipo: { feriaId: id } } }),
        prisma.feriaEquipo.deleteMany({ where: { feriaId: id } }),
        prisma.feriaCategoria.deleteMany({ where: { feriaId: id } }),
        prisma.feria.delete({ where: { id } }),
    ]);

    return { id };
}
