import { habilidadCV, logroCV, proyectoCV } from "../../../dominio/cv/validacionCV.js";
import { ensureIdPositivo, crearError } from "../../../dominio/cv/helpersCV.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

async function obtenerCVDelDueño(solicitante) {
    const cv = await prisma.cV.findUnique({
        where: { usuarioId: solicitante.id },
        select: { id: true },
    });
    if (!cv) throw crearError("Primero guarda tu CV para agregar contenido", 404);
    return cv;
}

async function verificarPropiedad(modelo, idRaw, solicitante) {
    const id = ensureIdPositivo(idRaw);
    if (!id) throw crearError("ID inválido", 400);

    const item = await modelo.findUnique({
        where: { id },
        select: { id: true, cvId: true, cv: { select: { usuarioId: true } } },
    });
    if (!item) throw crearError("El elemento indicado no existe", 404);
    if (item.cv.usuarioId !== solicitante.id) throw crearError("Solo puedes editar tu propio CV", 403);

    return { id, cvId: item.cvId };
}

const aFecha = (v) => (v ? new Date(v) : null);

export async function agregarHabilidadCVCasoUso(payload, solicitante) {
    const data = habilidadCV.parse(payload);
    const cv = await obtenerCVDelDueño(solicitante);

    return prisma.cVHabilidad.create({
        data: { cvId: cv.id, nombre: data.nombre, categoria: data.categoria ?? null, nivel: data.nivel ?? null, evidencia: data.evidencia === undefined ? null : data.evidencia },
        select: { id: true, nombre: true, categoria: true, nivel: true },
    });
}

export async function editarHabilidadCVCasoUso(idRaw, payload, solicitante) {
    const { id } = await verificarPropiedad(prisma.cVHabilidad, idRaw, solicitante);
    const data = habilidadCV.partial().parse(payload);

    return prisma.cVHabilidad.update({
        where: { id },
        data: { nombre: data.nombre, categoria: data.categoria, nivel: data.nivel, evidencia: data.evidencia },
        select: { id: true, nombre: true, categoria: true, nivel: true },
    });
}

export async function quitarHabilidadCVCasoUso(idRaw, solicitante) {
    const { id } = await verificarPropiedad(prisma.cVHabilidad, idRaw, solicitante);
    await prisma.cVHabilidad.delete({ where: { id } });
    return { id };
}

export async function agregarLogroCVCasoUso(payload, solicitante) {
    const data = logroCV.parse(payload);
    const cv = await obtenerCVDelDueño(solicitante);

    return prisma.cVLogro.create({
        data: { cvId: cv.id, titulo: data.titulo, descripcion: data.descripcion ?? "", fecha: aFecha(data.fecha) },
        select: { id: true, titulo: true, descripcion: true, fecha: true },
    });
}

export async function editarLogroCVCasoUso(idRaw, payload, solicitante) {
    const { id } = await verificarPropiedad(prisma.cVLogro, idRaw, solicitante);
    const data = logroCV.partial().parse(payload);

    return prisma.cVLogro.update({
        where: { id },
        data: { titulo: data.titulo, descripcion: data.descripcion, fecha: data.fecha === undefined ? undefined : aFecha(data.fecha) },
        select: { id: true, titulo: true, descripcion: true, fecha: true },
    });
}

export async function quitarLogroCVCasoUso(idRaw, solicitante) {
    const { id } = await verificarPropiedad(prisma.cVLogro, idRaw, solicitante);
    await prisma.cVLogro.delete({ where: { id } });
    return { id };
}

export async function agregarProyectoCVCasoUso(payload, solicitante) {
    const data = proyectoCV.parse(payload);
    const cv = await obtenerCVDelDueño(solicitante);

    return prisma.cVProyecto.create({
        data: {
            cvId: cv.id,
            titulo: data.titulo,
            descripcion: data.descripcion ?? "",
            rol: data.rol ?? "",
            area: data.area ?? "",
            tecnologias: data.tecnologias ?? "",
            linkEvidencia: data.linkEvidencia === undefined ? null : data.linkEvidencia,
            fechaInicio: aFecha(data.fechaInicio),
            fechaFin: aFecha(data.fechaFin),
        },
        select: { id: true, titulo: true, rol: true, area: true, tecnologias: true, linkEvidencia: true },
    });
}

export async function editarProyectoCVCasoUso(idRaw, payload, solicitante) {
    const { id } = await verificarPropiedad(prisma.cVProyecto, idRaw, solicitante);
    const data = proyectoCV.partial().parse(payload);

    return prisma.cVProyecto.update({
        where: { id },
        data: {
            titulo: data.titulo,
            descripcion: data.descripcion,
            rol: data.rol,
            area: data.area,
            tecnologias: data.tecnologias,
            linkEvidencia: data.linkEvidencia,
            fechaInicio: data.fechaInicio === undefined ? undefined : aFecha(data.fechaInicio),
            fechaFin: data.fechaFin === undefined ? undefined : aFecha(data.fechaFin),
        },
        select: { id: true, titulo: true, rol: true, area: true, tecnologias: true, linkEvidencia: true },
    });
}

export async function quitarProyectoCVCasoUso(idRaw, solicitante) {
    const { id } = await verificarPropiedad(prisma.cVProyecto, idRaw, solicitante);
    await prisma.cVProyecto.delete({ where: { id } });
    return { id };
}
