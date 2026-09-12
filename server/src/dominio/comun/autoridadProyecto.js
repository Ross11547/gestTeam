import { prisma } from "../../infrastructure/db/prisma.client.js";
import { esRolStaff } from "./helpersComunes.js";

function obtenerNombreRol(usuario) {
    return String(usuario?.rol?.nombre || "").trim().toLowerCase();
}

function esAdmin(usuario) {
    return obtenerNombreRol(usuario) === "admin";
}

function esDirector(usuario) {
    return obtenerNombreRol(usuario) === "director";
}

function esDocente(usuario) {
    return obtenerNombreRol(usuario) === "docente";
}

function usuarioSinId(usuario) {
    return !usuario?.id;
}

async function proyectoEnAmbitoDirector(proyectoId, usuario) {
    const idFacultad = usuario.idFacultad ? Number(usuario.idFacultad) : null;
    const idCarrera = usuario.idCarrera ? Number(usuario.idCarrera) : null;

    if (!idFacultad && !idCarrera) return false;

    const filtroCarrera = [];
    if (idCarrera) filtroCarrera.push({ id: idCarrera });
    if (idFacultad) filtroCarrera.push({ idFacultad });

    const vinculo = await prisma.proyectoMateria.findFirst({
        where: {
            proyectoId,
            materia: {
                carrera: {
                    OR: filtroCarrera,
                },
            },
        },
        select: { id: true },
    });

    return Boolean(vinculo);
}

async function esDocenteDeProyecto(proyectoId, usuario) {
    // Autoridad docente sobre proyecto derivada ÚNICAMENTE de ClaseMateria.docenteId.
    // No se usa DocenteMateria como fallback operativo.
    const docenteDeClase = await prisma.proyectoMateria.findFirst({
        where: { proyectoId, clase: { docenteId: usuario.id } },
        select: { id: true },
    });
    return Boolean(docenteDeClase);
}

async function esMiembroDeProyecto(proyectoId, usuario) {
    const miembro = await prisma.miembroProyecto.findFirst({
        where: { proyectoId, usuarioId: usuario.id },
        select: { id: true },
    });
    return Boolean(miembro);
}

async function esMiembroDeEquipoDeProyecto(proyectoId, usuario) {
    const miembro = await prisma.equipoMiembro.findFirst({
        where: {
            usuarioId: usuario.id,
            activo: true,
            equipo: { proyectoId },
        },
        select: { id: true },
    });
    return Boolean(miembro);
}

export async function puedeVerProyecto(proyectoId, usuario) {
    if (usuarioSinId(usuario)) return false;
    if (esAdmin(usuario)) return true;
    if (await esMiembroDeProyecto(proyectoId, usuario)) return true;
    if (await esMiembroDeEquipoDeProyecto(proyectoId, usuario)) return true;
    if (esDocente(usuario) && (await esDocenteDeProyecto(proyectoId, usuario))) return true;
    if (esDirector(usuario) && (await proyectoEnAmbitoDirector(proyectoId, usuario))) return true;

    return false;
}

export async function puedeGestionarProyecto(proyectoId, usuario) {
    if (usuarioSinId(usuario)) return false;
    if (esAdmin(usuario)) return true;
    if (esDocente(usuario) && (await esDocenteDeProyecto(proyectoId, usuario))) return true;
    if (esDirector(usuario) && (await proyectoEnAmbitoDirector(proyectoId, usuario))) return true;

    const esOwner = await prisma.miembroProyecto.findFirst({
        where: { proyectoId, usuarioId: usuario.id, rol: "OWNER" },
        select: { id: true },
    });

    return Boolean(esOwner);
}

// Mantiene compatibilidad con módulos existentes (pizarras, solicitudes).
// Ahora Director solo tiene autoridad si el proyecto está en su ámbito académico.
export async function tieneAutoridadSobreProyecto(proyectoId, usuario) {
    return puedeGestionarProyecto(proyectoId, usuario);
}

export async function obtenerFiltroProyectos(usuario) {
    if (usuarioSinId(usuario)) return { id: -1 };
    if (esAdmin(usuario)) return {};

    const uid = usuario.id;

    if (esDirector(usuario)) {
        const idFacultad = usuario.idFacultad ? Number(usuario.idFacultad) : null;
        const idCarrera = usuario.idCarrera ? Number(usuario.idCarrera) : null;
        const filtroCarrera = [];
        if (idCarrera) filtroCarrera.push({ id: idCarrera });
        if (idFacultad) filtroCarrera.push({ idFacultad });

        if (filtroCarrera.length === 0) return { id: -1 };

        return {
            proyectosMateria: {
                some: {
                    materia: {
                        carrera: {
                            OR: filtroCarrera,
                        },
                    },
                },
            },
        };
    }

    if (esDocente(usuario)) {
        // Solo proyectos donde imparte una clase concreta asignada.
        return {
            proyectosMateria: { some: { clase: { docenteId: uid } } },
        };
    }

    return {
        OR: [
            { miembros: { some: { usuarioId: uid } } },
            { equipos: { some: { miembros: { some: { usuarioId: uid } } } } },
        ],
    };
}

export async function puedeCrearProyecto(usuario) {
    if (usuarioSinId(usuario)) return false;
    if (esAdmin(usuario)) return true;
    if (esDirector(usuario)) return true;
    if (esDocente(usuario)) return true;
    return false;
}

// ===== Equipos =====

export async function puedeVerEquipo(usuario, equipo) {
    if (usuarioSinId(usuario)) return false;
    if (esAdmin(usuario)) return true;

    const esMiembro = await prisma.equipoMiembro.findFirst({
        where: {
            equipoId: equipo.id,
            usuarioId: usuario.id,
            activo: true,
        },
        select: { id: true },
    });
    if (esMiembro) return true;

    return puedeVerProyecto(equipo.proyectoId, usuario);
}

export async function puedeGestionarEquipo(usuario, equipo) {
    if (usuarioSinId(usuario)) return false;
    if (esAdmin(usuario)) return true;
    if (await puedeGestionarProyecto(equipo.proyectoId, usuario)) return true;
    if (equipo.creadoPorId === usuario.id) return true;

    const lider = await prisma.equipoMiembro.findFirst({
        where: {
            equipoId: equipo.id,
            usuarioId: usuario.id,
            activo: true,
            rolEquipo: "LIDER",
        },
        select: { id: true },
    });

    return Boolean(lider);
}

export async function obtenerFiltroEquipos(usuario) {
    if (usuarioSinId(usuario)) return { id: -1 };
    if (esAdmin(usuario)) return {};

    const uid = usuario.id;
    const filtroProyectos = await obtenerFiltroProyectos(usuario);

    return {
        OR: [
            { miembros: { some: { usuarioId: uid, activo: true } } },
            { proyecto: filtroProyectos },
        ],
    };
}

export async function puedeCrearEquipoEnProyecto(proyectoId, usuario) {
    if (usuarioSinId(usuario)) return false;
    if (esAdmin(usuario)) return true;
    if (await puedeGestionarProyecto(proyectoId, usuario)) return true;
    if (await esMiembroDeProyecto(proyectoId, usuario)) return true;
    return false;
}

// Alias explícitos para el modelo académico.
export async function puedeAdministrarProyecto(proyectoId, usuario) {
    return puedeGestionarProyecto(proyectoId, usuario);
}

export async function puedeGestionarProyectoGlobal(proyectoId, usuario) {
    return puedeGestionarProyecto(proyectoId, usuario);
}
