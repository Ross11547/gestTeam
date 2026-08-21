import { crearCategoriaFeria } from "../../../dominio/feria/validacionFeria.js";
import { ensureIdPositivo, normalizarTexto, crearError } from "../../../dominio/feria/helpersFeria.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function listarCategoriasFeriaCasoUso(feriaIdRaw) {
    const feriaId = ensureIdPositivo(feriaIdRaw);
    if (!feriaId) throw crearError("ID inválido", 400);

    return prisma.feriaCategoria.findMany({
        where: { feriaId },
        select: {
            id: true,
            nombre: true,
            descripcion: true,
            _count: { select: { equipos: true } },
        },
        orderBy: { nombre: "asc" },
    });
}

export async function crearCategoriaFeriaCasoUso(feriaIdRaw, payload) {
    const feriaId = ensureIdPositivo(feriaIdRaw);
    if (!feriaId) throw crearError("ID inválido", 400);

    const data = crearCategoriaFeria.parse(payload);

    const feria = await prisma.feria.findUnique({ where: { id: feriaId }, select: { id: true } });
    if (!feria) throw crearError("La feria indicada no existe", 404);

    try {
        return await prisma.feriaCategoria.create({
            data: { feriaId, nombre: normalizarTexto(data.nombre), descripcion: data.descripcion ?? "" },
            select: { id: true, nombre: true, descripcion: true },
        });
    } catch (e) {
        if (e.code === "P2002") throw crearError("Ya existe una categoría con ese nombre en esta feria", 409);
        throw e;
    }
}

export async function eliminarCategoriaFeriaCasoUso(feriaIdRaw, categoriaIdRaw) {
    const feriaId = ensureIdPositivo(feriaIdRaw);
    const categoriaId = ensureIdPositivo(categoriaIdRaw);
    if (!feriaId || !categoriaId) throw crearError("ID inválido", 400);

    const categoria = await prisma.feriaCategoria.findUnique({
        where: { id: categoriaId },
        select: { id: true, feriaId: true, _count: { select: { equipos: true } } },
    });
    if (!categoria || categoria.feriaId !== feriaId) throw crearError("La categoría indicada no existe en esta feria", 404);

    if (categoria._count.equipos > 0) {
        throw crearError("No puedes eliminar una categoría con equipos inscritos; reasígnalos primero", 409);
    }

    await prisma.feriaCategoria.delete({ where: { id: categoriaId } });
    return { id: categoriaId };
}
