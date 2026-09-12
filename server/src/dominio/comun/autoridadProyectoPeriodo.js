import { prisma } from "../../infrastructure/db/prisma.client.js";
import { puedeVerProyecto } from "./autoridadProyecto.js";

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

export async function esMiembroVigenteDeProyectoPeriodo(proyectoPeriodoId, usuarioId) {
    if (!proyectoPeriodoId || !usuarioId) return false;
    const miembro = await prisma.equipoMiembro.findFirst({
        where: {
            usuarioId,
            activo: true,
            equipo: { proyectoPeriodoId },
        },
        select: { id: true },
    });
    return Boolean(miembro);
}

export async function fueMiembroDeProyectoPeriodo(proyectoPeriodoId, usuarioId) {
    if (!proyectoPeriodoId || !usuarioId) return false;
    const miembro = await prisma.equipoMiembro.findFirst({
        where: {
            usuarioId,
            equipo: { proyectoPeriodoId },
        },
        select: { id: true },
    });
    return Boolean(miembro);
}

export async function esDocenteVigenteDeProyectoMateria(proyectoMateriaId, usuarioId) {
    if (!proyectoMateriaId || !usuarioId) return false;
    const pm = await prisma.proyectoMateria.findUnique({
        where: { id: proyectoMateriaId },
        select: { claseId: true },
    });
    if (!pm?.claseId) return false;

    const clase = await prisma.claseMateria.findUnique({
        where: { id: pm.claseId },
        select: { docenteId: true },
    });
    return clase?.docenteId === usuarioId;
}

export async function fueDocenteDeProyectoMateria(proyectoMateriaId, usuarioId) {
    return esDocenteVigenteDeProyectoMateria(proyectoMateriaId, usuarioId);
}

export async function esDirectorDirectivoDeProyectoMateria(proyectoMateriaId, usuario) {
    if (usuarioSinId(usuario) || !esDirector(usuario)) return false;
    if (!usuario.idCarrera) return false;

    const pm = await prisma.proyectoMateria.findUnique({
        where: { id: proyectoMateriaId },
        select: {
            materia: { select: { idCarrera: true } },
        },
    });
    if (!pm) return false;
    return Number(usuario.idCarrera) === Number(pm.materia.idCarrera);
}

export async function esDirectorDirectivoDeProyecto(proyectoId, usuario) {
    if (usuarioSinId(usuario) || !esDirector(usuario)) return false;
    if (!usuario.idCarrera) return false;

    const vinculo = await prisma.proyectoMateria.findFirst({
        where: {
            proyectoId,
            materia: { idCarrera: Number(usuario.idCarrera) },
        },
        select: { id: true },
    });
    return Boolean(vinculo);
}

export async function puedeVerProyectoPeriodo(proyectoPeriodoId, usuario) {
    if (usuarioSinId(usuario)) return false;
    if (esAdmin(usuario)) return true;

    const pp = await prisma.proyectoPeriodo.findUnique({
        where: { id: proyectoPeriodoId },
        include: {
            proyectosMateria: {
                include: {
                    materia: { select: { idCarrera: true } },
                    clase: { select: { docenteId: true } },
                },
            },
        },
    });
    if (!pp) return false;

    if (await esMiembroVigenteDeProyectoPeriodo(proyectoPeriodoId, usuario.id)) return true;
    if (await fueMiembroDeProyectoPeriodo(proyectoPeriodoId, usuario.id)) return true;

    for (const pm of pp.proyectosMateria) {
        if (pm.clase?.docenteId === usuario.id) return true;
        if (await esDirectorDirectivoDeProyectoMateria(pm.id, usuario)) return true;
    }

    return false;
}

export async function puedeSupervisarProyectoPeriodo(proyectoPeriodoId, usuario) {
    if (usuarioSinId(usuario)) return false;
    if (esAdmin(usuario)) return true;
    if (!esDirector(usuario)) return false;

    const pp = await prisma.proyectoPeriodo.findUnique({
        where: { id: proyectoPeriodoId },
        include: {
            proyectosMateria: {
                select: {
                    materia: { select: { idCarrera: true } },
                },
            },
        },
    });
    if (!pp || !usuario.idCarrera) return false;

    return pp.proyectosMateria.some(
        (pm) => Number(pm.materia.idCarrera) === Number(usuario.idCarrera)
    );
}

export async function obtenerProyectoMateriasPermitidas(proyectoPeriodoId, usuario) {
    if (usuarioSinId(usuario)) return [];

    const pms = await prisma.proyectoMateria.findMany({
        where: { proyectoPeriodoId },
        select: { id: true, materiaId: true, claseId: true },
    });

    if (esAdmin(usuario) || (await puedeSupervisarProyectoPeriodo(proyectoPeriodoId, usuario))) {
        return pms.map((pm) => pm.id);
    }

    const permitidas = [];
    for (const pm of pms) {
        if (await esDocenteVigenteDeProyectoMateria(pm.id, usuario.id)) {
            permitidas.push(pm.id);
        }
    }
    return permitidas;
}

export async function obtenerEquiposPermitidos(proyectoPeriodoId, usuario) {
    if (usuarioSinId(usuario)) return [];

    if (esAdmin(usuario) || (await puedeSupervisarProyectoPeriodo(proyectoPeriodoId, usuario))) {
        const equipos = await prisma.equipo.findMany({
            where: { proyectoPeriodoId },
            select: { id: true },
        });
        return equipos.map((e) => e.id);
    }

    const equiposMiembro = await prisma.equipo.findMany({
        where: {
            proyectoPeriodoId,
            miembros: { some: { usuarioId: usuario.id, activo: true } },
        },
        select: { id: true },
    });

    const equiposDocente = await prisma.equipo.findMany({
        where: {
            proyectoPeriodoId,
            proyectoMateria: { clase: { docenteId: usuario.id } },
        },
        select: { id: true },
    });

    return [...new Set([...equiposMiembro.map((e) => e.id), ...equiposDocente.map((e) => e.id)])];
}

export async function puedeGestionarContextoAcademico(proyectoMateriaId, usuario) {
    if (usuarioSinId(usuario)) return false;
    if (await esDocenteVigenteDeProyectoMateria(proyectoMateriaId, usuario.id)) return true;
    if (await esDirectorDirectivoDeProyectoMateria(proyectoMateriaId, usuario)) return true;
    return false;
}

export function puedeResolverSolicitudContinuacion(solicitud, usuario) {
    if (usuarioSinId(usuario) || !solicitud) return false;

    if (esDirector(usuario)) {
        return Boolean(usuario.idCarrera)
            && Number(usuario.idCarrera) === Number(solicitud.materia?.idCarrera);
    }

    if (esDocente(usuario)) {
        return solicitud.clase?.docenteId === usuario.id;
    }

    return false;
}

export function puedeVerSolicitudContinuacion(solicitud, usuario) {
    if (usuarioSinId(usuario) || !solicitud) return false;
    if (esAdmin(usuario)) return true;
    if (esEstudiante(usuario)) return solicitud.solicitanteId === usuario.id;
    return puedeResolverSolicitudContinuacion(solicitud, usuario);
}

export async function puedeVerProyectoMateria(proyectoMateriaId, usuario) {
    if (usuarioSinId(usuario)) return false;
    if (esAdmin(usuario)) return true;

    const pm = await prisma.proyectoMateria.findUnique({
        where: { id: proyectoMateriaId },
        select: {
            id: true,
            proyectoPeriodoId: true,
            claseId: true,
            materia: { select: { idCarrera: true } },
        },
    });
    if (!pm) return false;

    // Docente/director asignado a este contexto específico.
    if (pm.claseId && (await esDocenteVigenteDeProyectoMateria(pm.id, usuario.id))) return true;
    if (await esDirectorDirectivoDeProyectoMateria(pm.id, usuario)) return true;

    // Estudiante miembro de un equipo activo de este contexto.
    const esMiembro = await prisma.equipoMiembro.findFirst({
        where: {
            usuarioId: usuario.id,
            activo: true,
            equipo: { proyectoMateriaId: pm.id },
        },
        select: { id: true },
    });
    if (esMiembro) return true;

    return false;
}

export async function puedeVerEquipoAcademico(equipo, usuario) {
    if (usuarioSinId(usuario)) return false;
    if (esAdmin(usuario)) return true;

    const esMiembro = await prisma.equipoMiembro.findFirst({
        where: { equipoId: equipo.id, usuarioId: usuario.id, activo: true },
        select: { id: true },
    });
    if (esMiembro) return true;

    if (equipo.proyectoMateriaId) {
        if (await esDocenteVigenteDeProyectoMateria(equipo.proyectoMateriaId, usuario.id)) return true;
        if (await esDirectorDirectivoDeProyectoMateria(equipo.proyectoMateriaId, usuario)) return true;
    }

    if (equipo.proyectoPeriodoId) {
        return puedeVerProyectoPeriodo(equipo.proyectoPeriodoId, usuario);
    }

    // Compatibilidad con equipos del modelo anterior sin ProyectoPeriodo/ProyectoMateria explícito.
    if (equipo.proyectoId) {
        return puedeVerProyecto(equipo.proyectoId, usuario);
    }

    return false;
}

export async function puedeGestionarEquipoAcademico(equipo, usuario) {
    if (usuarioSinId(usuario)) return false;
    if (esAdmin(usuario)) return true;

    const miembro = await prisma.equipoMiembro.findFirst({
        where: {
            equipoId: equipo.id,
            usuarioId: usuario.id,
            activo: true,
            rolEquipo: "LIDER",
        },
        select: { id: true },
    });
    if (miembro) return true;
    if (equipo.creadoPorId === usuario.id) return true;

    if (equipo.proyectoMateriaId) {
        if (await esDocenteVigenteDeProyectoMateria(equipo.proyectoMateriaId, usuario.id)) return true;
        if (await esDirectorDirectivoDeProyectoMateria(equipo.proyectoMateriaId, usuario)) return true;
    }

    return false;
}
