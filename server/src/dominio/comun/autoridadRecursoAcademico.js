import { prisma } from "../../infrastructure/db/prisma.client.js";
import {
    esMiembroVigenteDeProyectoPeriodo,
    fueMiembroDeProyectoPeriodo,
    esDocenteVigenteDeProyectoMateria,
    esDirectorDirectivoDeProyectoMateria,
    puedeSupervisarProyectoPeriodo,
    obtenerEquiposPermitidos,
} from "./autoridadProyectoPeriodo.js";

function nombreRol(usuario) {
    return String(usuario?.rol?.nombre || "").trim().toLowerCase();
}

function esAdmin(usuario) {
    return nombreRol(usuario) === "admin";
}

function esDirector(usuario) {
    return nombreRol(usuario) === "director";
}

function esDocente(usuario) {
    return nombreRol(usuario) === "docente";
}

function esEstudiante(usuario) {
    return nombreRol(usuario) === "estudiante";
}

function usuarioSinId(usuario) {
    return !usuario?.id;
}

async function obtenerEntregaConContexto(entregaId) {
    return prisma.entregaHito.findUnique({
        where: { id: entregaId },
        include: {
            equipo: {
                select: {
                    id: true,
                    proyectoPeriodoId: true,
                    proyectoMateriaId: true,
                    miembros: { where: { activo: true }, select: { usuarioId: true } },
                },
            },
            hito: {
                select: { id: true, proyectoPeriodoId: true },
            },
        },
    });
}

async function obtenerRevisionConContexto(revisionId) {
    return prisma.revisionEntrega.findUnique({
        where: { id: revisionId },
        include: {
            entrega: {
                include: {
                    equipo: {
                        select: {
                            id: true,
                            proyectoPeriodoId: true,
                            proyectoMateriaId: true,
                        },
                    },
                    hito: { select: { id: true, proyectoPeriodoId: true } },
                },
            },
        },
    });
}

async function obtenerEvaluacionHitoConContexto(evaluacionId) {
    return prisma.evaluacionHito.findUnique({
        where: { id: evaluacionId },
        include: {
            hitoProyecto: { select: { id: true, proyectoPeriodoId: true } },
            proyectoMateria: { select: { id: true, claseId: true } },
        },
    });
}

// ================= HitoProyecto =================

export async function puedeVerHitoProyecto(hitoProyectoId, usuario) {
    if (usuarioSinId(usuario)) return false;

    const hito = await prisma.hitoProyecto.findUnique({
        where: { id: hitoProyectoId },
        select: { proyectoPeriodoId: true },
    });
    if (!hito) return false;

    const { puedeVerProyectoPeriodo } = await import("./autoridadProyectoPeriodo.js");
    return puedeVerProyectoPeriodo(hito.proyectoPeriodoId, usuario);
}

export async function puedeConfigurarHitoProyecto(hitoProyectoId, usuario) {
    // Política global pendiente para proyectos colaborativos.
    // Por ahora solo Admin estructural puede configurar; docentes individuales NO.
    if (usuarioSinId(usuario)) return false;
    return esAdmin(usuario);
}

// ================= EntregaHito =================

async function esMiembroDeEquipo(equipoId, usuarioId, activo = true) {
    const where = { equipoId, usuarioId };
    if (activo) where.activo = true;
    const miembro = await prisma.equipoMiembro.findFirst({ where, select: { id: true } });
    return Boolean(miembro);
}

export async function puedeVerEntrega(entregaId, usuario) {
    if (usuarioSinId(usuario)) return false;
    if (esAdmin(usuario)) return true;

    const entrega = await obtenerEntregaConContexto(entregaId);
    if (!entrega) return false;

    const equipoId = entrega.equipo?.id;
    const pmId = entrega.equipo?.proyectoMateriaId;
    const ppId = entrega.equipo?.proyectoPeriodoId;

    // Estudiante: solo si es (o fue) miembro del equipo que entregó.
    if (equipoId && (await esMiembroDeEquipo(equipoId, usuario.id, true))) return true;
    if (equipoId && (await esMiembroDeEquipo(equipoId, usuario.id, false))) return true;

    // Docente/director: solo dentro de su ProyectoMateria.
    if (pmId && (await esDocenteVigenteDeProyectoMateria(pmId, usuario.id))) return true;
    if (pmId && (await esDirectorDirectivoDeProyectoMateria(pmId, usuario))) return true;

    if (ppId && (await puedeSupervisarProyectoPeriodo(ppId, usuario))) return true;

    return false;
}

export async function puedeEntregarEnEquipo(equipoId, usuario) {
    if (usuarioSinId(usuario)) return false;
    if (!esEstudiante(usuario)) return false;

    return esMiembroDeEquipo(equipoId, usuario.id, true);
}

export async function puedeGestionarEntrega(entregaId, usuario) {
    if (usuarioSinId(usuario)) return false;

    const entrega = await obtenerEntregaConContexto(entregaId);
    if (!entrega) return false;

    // Si la entrega ya fue revisada, no permite gestión normal por estudiante.
    if (entrega.estado === "REVISADO") return false;

    const equipoId = entrega.equipo?.id;
    if (!equipoId) return false;

    const esMiembro = await esMiembroDeEquipo(equipoId, usuario.id, true);
    if (!esMiembro) return false;

    // Solo el autor de la entrega puede gestionarla (actualizar/eliminar).
    return entrega.autorId === usuario.id;
}

// ================= RevisionEntrega =================

export async function puedeVerRevision(revisionId, usuario) {
    if (usuarioSinId(usuario)) return false;

    const revision = await obtenerRevisionConContexto(revisionId);
    if (!revision) return false;

    return puedeVerEntrega(revision.entrega.id, usuario);
}

export async function puedeCrearRevision(entregaId, usuario) {
    if (usuarioSinId(usuario)) return false;
    if (esEstudiante(usuario)) return false;

    const entrega = await obtenerEntregaConContexto(entregaId);
    if (!entrega) return false;

    const pmId = entrega.equipo?.proyectoMateriaId;
    if (!pmId) return false;

    return esDocenteVigenteDeProyectoMateria(pmId, usuario.id);
}

export async function puedeGestionarRevision(revisionId, usuario) {
    if (usuarioSinId(usuario)) return false;

    const revision = await obtenerRevisionConContexto(revisionId);
    if (!revision) return false;

    if (revision.revisorId !== usuario.id) return false;

    const pmId = revision.entrega?.equipo?.proyectoMateriaId;
    if (!pmId) return false;

    return esDocenteVigenteDeProyectoMateria(pmId, usuario.id);
}

// ================= EvaluacionHito =================

async function esMiembroDeProyectoMateria(proyectoMateriaId, usuarioId, activo = true) {
    const where = { proyectoMateriaId };
    if (activo) where.miembros = { some: { usuarioId, activo: true } };
    else where.miembros = { some: { usuarioId } };
    const equipo = await prisma.equipo.findFirst({ where, select: { id: true } });
    return Boolean(equipo);
}

export async function puedeVerEvaluacionHito(evaluacionId, usuario) {
    if (usuarioSinId(usuario)) return false;
    if (esAdmin(usuario)) return true;

    const evaluacion = await obtenerEvaluacionHitoConContexto(evaluacionId);
    if (!evaluacion) return false;

    const ppId = evaluacion.hitoProyecto?.proyectoPeriodoId;
    const pmId = evaluacion.proyectoMateria?.id;

    // Estudiante: solo si pertenece a un equipo de ese ProyectoMateria.
    if (pmId && (await esMiembroDeProyectoMateria(pmId, usuario.id, true))) return true;
    if (pmId && (await esMiembroDeProyectoMateria(pmId, usuario.id, false))) return true;

    if (pmId && (await esDocenteVigenteDeProyectoMateria(pmId, usuario.id))) return true;
    if (pmId && (await esDirectorDirectivoDeProyectoMateria(pmId, usuario))) return true;
    if (ppId && (await puedeSupervisarProyectoPeriodo(ppId, usuario))) return true;

    return false;
}

export async function puedeCrearEvaluacionHito(hitoProyectoId, proyectoMateriaId, usuario) {
    if (usuarioSinId(usuario)) return false;
    if (esEstudiante(usuario) || esAdmin(usuario)) return false;

    return esDocenteVigenteDeProyectoMateria(proyectoMateriaId, usuario.id);
}

export async function puedeGestionarEvaluacionHito(evaluacionId, usuario) {
    if (usuarioSinId(usuario)) return false;
    if (esEstudiante(usuario) || esAdmin(usuario)) return false;

    const evaluacion = await obtenerEvaluacionHitoConContexto(evaluacionId);
    if (!evaluacion) return false;

    if (evaluacion.evaluadorId !== usuario.id) return false;

    const pmId = evaluacion.proyectoMateria?.id;
    if (!pmId) return false;

    return esDocenteVigenteDeProyectoMateria(pmId, usuario.id);
}
