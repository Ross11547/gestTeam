import { guardarCV } from "../../../dominio/cv/validacionCV.js";
import { ensureIdPositivo, crearError, esRolStaff } from "../../../dominio/cv/helpersCV.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

const INCLUYO_TODO = {
    habilidades: { orderBy: { nombre: "asc" } },
    logros: { orderBy: { fecha: "desc" } },
    proyectos: { orderBy: { fechaInicio: "desc" } },
};

const SELECCION_CV = {
    id: true,
    usuarioId: true,
    resumen: true,
    createdAt: true,
    updatedAt: true,
    usuario: { select: { id: true, nombre: true, apellido: true, correo: true } },
};

export async function obtenerCVDelUsuario(usuarioId) {
    return prisma.cV.findUnique({
        where: { usuarioId },
        include: INCLUYO_TODO,
    });
}

// El estudiante ve su CV; docentes y staff pueden consultar el de cualquiera.
export async function obtenerCVDeUsuarioCasoUso(usuarioIdRaw, solicitante) {
    const usuarioId = ensureIdPositivo(usuarioIdRaw);
    if (!usuarioId) throw crearError("ID inválido", 400);

    const rolSolicitante = String(solicitante?.rol?.nombre || "").trim().toLowerCase();
    const esAcademico = esRolStaff(solicitante) || rolSolicitante === "docente";

    if (usuarioId !== solicitante.id && !esAcademico) {
        throw crearError("Solo puedes ver tu propio CV", 403);
    }

    const cv = await obtenerCVDelUsuario(usuarioId);
    if (!cv) throw crearError("Este usuario aún no tiene CV", 404);

    return cv;
}

export async function obtenerMiCVCasoUso(solicitante) {
    const cv = await obtenerCVDelUsuario(solicitante.id);
    if (!cv) {
        // Un CV vacío no es un error para el dueño: devuelve estructura lista.
        return {
            usuarioId: solicitante.id,
            resumen: "",
            habilidades: [],
            logros: [],
            proyectos: [],
        };
    }
    return cv;
}

// Upsert de la cabecera del CV (crea si no existe).
export async function guardarMiCVCasoUso(payload, solicitante) {
    const data = guardarCV.parse(payload);

    return prisma.cV.upsert({
        where: { usuarioId: solicitante.id },
        create: { usuarioId: solicitante.id, resumen: data.resumen ?? "" },
        update: { resumen: data.resumen },
        include: INCLUYO_TODO,
    });
}

export async function eliminarMiCVCasoUso(solicitante) {
    const cv = await obtenerCVDelUsuario(solicitante.id);
    if (!cv) throw crearError("No tienes CV que eliminar", 404);

    await prisma.$transaction([
        prisma.cVHabilidad.deleteMany({ where: { cvId: cv.id } }),
        prisma.cVLogro.deleteMany({ where: { cvId: cv.id } }),
        prisma.cVProyecto.deleteMany({ where: { cvId: cv.id } }),
        prisma.cV.delete({ where: { id: cv.id } }),
    ]);

    return { id: cv.id };
}
