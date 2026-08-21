import { crearProyectoDestacado, actualizarProyectoDestacado } from "../../../dominio/proyectoDestacado/validacionProyectoDestacado.js";
import { ensureIdPositivo, crearError } from "../../../dominio/proyectoDestacado/helpersProyectoDestacado.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

const SELECCION = {
    id: true,
    proyectoId: true,
    periodoId: true,
    idFacultad: true,
    idCarrera: true,
    motivo: true,
    orden: true,
    createdAt: true,
    proyecto: { select: { id: true, titulo: true, descripcion: true, repoUrl: true } },
};

export async function listarProyectosDestacadosCasoUso() {
    return prisma.proyectoDestacado.findMany({
        select: SELECCION,
        orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
    });
}

// Verifica que las FKs opcionales existan cuando vengan con valor.
async function validarReferenciasOpcionales({ periodoId, idFacultad, idCarrera }) {
    if (periodoId != null) {
        const periodo = await prisma.periodoAcademico.findUnique({ where: { id: periodoId }, select: { id: true } });
        if (!periodo) throw crearError("El periodo académico indicado no existe", 404);
    }
    if (idFacultad != null) {
        const facultad = await prisma.facultad.findUnique({ where: { id: idFacultad }, select: { id: true } });
        if (!facultad) throw crearError("La facultad indicada no existe", 404);
    }
    if (idCarrera != null) {
        const carrera = await prisma.carrera.findUnique({ where: { id: idCarrera }, select: { id: true } });
        if (!carrera) throw crearError("La carrera indicada no existe", 404);
    }
}

export async function crearProyectoDestacadoCasoUso(payload) {
    const data = crearProyectoDestacado.parse(payload);

    const proyecto = await prisma.proyecto.findUnique({
        where: { id: data.proyectoId },
        select: { id: true },
    });
    if (!proyecto) throw crearError("El proyecto indicado no existe", 404);

    await validarReferenciasOpcionales(data);

    try {
        return await prisma.proyectoDestacado.create({
            data: {
                proyectoId: data.proyectoId,
                periodoId: data.periodoId ?? null,
                idFacultad: data.idFacultad ?? null,
                idCarrera: data.idCarrera ?? null,
                motivo: data.motivo ?? "",
                orden: data.orden ?? null,
            },
            select: SELECCION,
        });
    } catch (e) {
        if (e.code === "P2002") throw crearError("Ese proyecto ya está destacado", 409);
        throw e;
    }
}

export async function actualizarProyectoDestacadoCasoUso(idRaw, payload) {
    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido", 400);

    const data = actualizarProyectoDestacado.parse(payload);

    const destacado = await prisma.proyectoDestacado.findUnique({ where: { id }, select: { id: true } });
    if (!destacado) throw crearError("El destacado indicado no existe", 404);

    await validarReferenciasOpcionales(data);

    return prisma.proyectoDestacado.update({
        where: { id },
        data: {
            periodoId: data.periodoId,
            idFacultad: data.idFacultad,
            idCarrera: data.idCarrera,
            motivo: data.motivo,
            orden: data.orden,
        },
        select: SELECCION,
    });
}

export async function eliminarProyectoDestacadoCasoUso(idRaw) {
    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido", 400);

    const destacado = await prisma.proyectoDestacado.findUnique({ where: { id }, select: { id: true } });
    if (!destacado) throw crearError("El destacado indicado no existe", 404);

    await prisma.proyectoDestacado.delete({ where: { id } });
    return { id };
}
