import { inscribirEquipoFeria, actualizarFeriaEquipo, agregarMiembroFeriaEquipo } from "../../../dominio/feria/validacionFeria.js";
import { ensureIdPositivo, crearError } from "../../../dominio/feria/helpersFeria.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

const SELECCION_EQUIPO_FERIA = {
    id: true,
    feriaId: true,
    categoriaId: true,
    equipoId: true,
    nombreEquipo: true,
    nombreProyecto: true,
    descripcion: true,
    mesaCodigo: true,
    mesaX: true,
    mesaY: true,
    miembros: { select: { usuarioId: true, usuario: { select: { id: true, nombre: true, apellido: true } } } },
};

export async function listarEquiposFeriaCasoUso(feriaIdRaw) {
    const feriaId = ensureIdPositivo(feriaIdRaw);
    if (!feriaId) throw crearError("ID inválido", 400);

    return prisma.feriaEquipo.findMany({
        where: { feriaId },
        select: {
            ...SELECCION_EQUIPO_FERIA,
            evaluaciones: { select: { puntaje: true, juradoId: true, comentario: true, jurado: { select: { nombre: true, apellido: true } } } },
        },
        orderBy: [{ categoriaId: "asc" }, { nombreEquipo: "asc" }],
    });
}

export async function inscribirEquipoFeriaCasoUso(feriaIdRaw, payload) {
    const feriaId = ensureIdPositivo(feriaIdRaw);
    if (!feriaId) throw crearError("ID inválido", 400);

    const data = inscribirEquipoFeria.parse(payload);

    const feria = await prisma.feria.findUnique({ where: { id: feriaId }, select: { id: true } });
    if (!feria) throw crearError("La feria indicada no existe", 404);

    if (data.categoriaId) {
        const categoria = await prisma.feriaCategoria.findUnique({ where: { id: data.categoriaId }, select: { id: true, feriaId: true } });
        if (!categoria || categoria.feriaId !== feriaId) throw crearError("La categoría no pertenece a esta feria", 404);
    }

    let nombreEquipo = data.nombreEquipo;
    let nombreProyecto = data.nombreProyecto;
    let miembros = [];

    if (data.equipoId) {
        const equipo = await prisma.equipo.findUnique({
            where: { id: data.equipoId },
            select: {
                id: true,
                nombre: true,
                proyecto: { select: { titulo: true } },
                miembros: { select: { usuarioId: true } },
            },
        });
        if (!equipo) throw crearError("El equipo indicado no existe", 404);

        if (!nombreEquipo) nombreEquipo = equipo.nombre;
        if (!nombreProyecto) nombreProyecto = equipo.proyecto?.titulo || "";
        miembros = equipo.miembros.map((m) => ({ usuarioId: m.usuarioId }));
    }

    if (!nombreEquipo) throw crearError("Indica el nombre del equipo o selecciona uno existente", 400);
    if (!nombreProyecto) throw crearError("Indica el nombre del proyecto participante", 400);

    let inscrito;
    try {
        inscrito = await prisma.feriaEquipo.create({
            data: {
                feriaId,
                categoriaId: data.categoriaId ?? null,
                equipoId: data.equipoId ?? null,
                nombreEquipo,
                nombreProyecto,
                descripcion: data.descripcion ?? "",
                mesaCodigo: data.mesaCodigo ?? null,
                mesaX: data.mesaX ?? null,
                mesaY: data.mesaY ?? null,
                miembros: { create: miembros },
            },
            select: SELECCION_EQUIPO_FERIA,
        });
    } catch (e) {
        if (e.code === "P2002") throw crearError("Ese equipo ya está inscrito en esta feria", 409);
        throw e;
    }

    return inscrito;
}

export async function actualizarFeriaEquipoCasoUso(feriaEquipoIdRaw, payload) {
    const id = ensureIdPositivo(feriaEquipoIdRaw);
    if (!id) throw crearError("ID inválido", 400);

    const data = actualizarFeriaEquipo.parse(payload);

    const inscrito = await prisma.feriaEquipo.findUnique({ where: { id }, select: { id: true, feriaId: true } });
    if (!inscrito) throw crearError("La participación indicada no existe", 404);

    if (data.categoriaId) {
        const categoria = await prisma.feriaCategoria.findUnique({ where: { id: data.categoriaId }, select: { id: true, feriaId: true } });
        if (!categoria || categoria.feriaId !== inscrito.feriaId) throw crearError("La categoría no pertenece a esta feria", 404);
    }

    return prisma.feriaEquipo.update({
        where: { id },
        data: {
            categoriaId: data.categoriaId,
            nombreEquipo: data.nombreEquipo,
            nombreProyecto: data.nombreProyecto,
            descripcion: data.descripcion,
            mesaCodigo: data.mesaCodigo,
            mesaX: data.mesaX,
            mesaY: data.mesaY,
        },
        select: SELECCION_EQUIPO_FERIA,
    });
}

export async function eliminarFeriaEquipoCasoUso(feriaEquipoIdRaw) {
    const id = ensureIdPositivo(feriaEquipoIdRaw);
    if (!id) throw crearError("ID inválido", 400);

    const inscrito = await prisma.feriaEquipo.findUnique({ where: { id }, select: { id: true } });
    if (!inscrito) throw crearError("La participación indicada no existe", 404);

    await prisma.$transaction([
        prisma.feriaEvaluacion.deleteMany({ where: { feriaEquipoId: id } }),
        prisma.feriaEquipoMiembro.deleteMany({ where: { feriaEquipoId: id } }),
        prisma.feriaEquipo.delete({ where: { id } }),
    ]);

    return { id };
}

export async function agregarMiembroFeriaEquipoCasoUso(feriaEquipoIdRaw, payload) {
    const id = ensureIdPositivo(feriaEquipoIdRaw);
    if (!id) throw crearError("ID inválido", 400);

    const data = agregarMiembroFeriaEquipo.parse(payload);

    const inscrito = await prisma.feriaEquipo.findUnique({ where: { id }, select: { id: true } });
    if (!inscrito) throw crearError("La participación indicada no existe", 404);

    const usuario = await prisma.usuario.findUnique({ where: { id: data.usuarioId }, select: { id: true } });
    if (!usuario) throw crearError("El usuario indicado no existe", 404);

    try {
        await prisma.feriaEquipoMiembro.create({ data: { feriaEquipoId: id, usuarioId: data.usuarioId } });
    } catch (e) {
        if (e.code === "P2002") throw crearError("Ese usuario ya figura como miembro del equipo en la feria", 409);
        throw e;
    }

    return prisma.feriaEquipo.findUnique({ where: { id }, select: SELECCION_EQUIPO_FERIA });
}

export async function eliminarMiembroFeriaEquipoCasoUso(feriaEquipoIdRaw, usuarioIdRaw) {
    const id = ensureIdPositivo(feriaEquipoIdRaw);
    const usuarioId = ensureIdPositivo(usuarioIdRaw);
    if (!id || !usuarioId) throw crearError("ID inválido", 400);

    const borrados = await prisma.feriaEquipoMiembro.deleteMany({
        where: { feriaEquipoId: id, usuarioId },
    });
    if (borrados.count === 0) throw crearError("Ese usuario no es miembro de esta participación", 404);

    return { feriaEquipoId: id, usuarioId };
}
