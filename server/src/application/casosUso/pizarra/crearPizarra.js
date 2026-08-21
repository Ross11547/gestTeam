import { crearPizarra } from "../../../dominio/pizarra/validacionesPizarra.js";
import { ErrorNoEncontrado, ErrorValidacion, ErrorNoAutorizado } from "../../../dominio/pizarra//erroresPizarra.js";
import { tieneAutoridadSobreProyecto } from "../../../dominio/comun/autoridadProyecto.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { pizarraRepositorio } from "../../../infrastructure/repositories/repositoriosPizarras.js";

function validarJsonObjeto(dataJson) {
    if (!dataJson || typeof dataJson !== "object" || Array.isArray(dataJson)) {
        throw new ErrorValidacion("dataJson debe ser un objeto JSON válido");
    }
}

export async function crearPizarraCasoUso(payload, usuario) {
    if (!usuario?.id) throw new ErrorValidacion("Usuario no autenticado");

    const parsed = crearPizarra.safeParse(payload);
    if (!parsed.success) throw new ErrorValidacion("Datos inválidos", parsed.error.flatten());

    const { colaboradores = [], dataJson, ...dto } = parsed.data;

    validarJsonObjeto(dataJson);

    let proyectoId = dto.proyectoId ?? null;
    const equipoId = dto.equipoId ? Number(dto.equipoId) : null;
    const periodoId = dto.periodoId ? Number(dto.periodoId) : null;

    // Si ligan un equipo sin proyecto, el proyecto se infiere del equipo.
    if (equipoId && !proyectoId) {
        const equipo = await prisma.equipo.findUnique({ where: { id: equipoId }, select: { proyectoId: true } });
        if (!equipo) throw new ErrorNoEncontrado("Equipo no existe");
        proyectoId = equipo.proyectoId;
    }

    // Pizarra ligada a un proyecto: solo staff, docente/director con autoridad
    // o integrantes del proyecto pueden crearla. Sin proyecto (pizarra libre de ideas)
    // cualquier usuario autenticado puede crearla e invitar colaboradores.
    if (proyectoId) {
        const proyecto = await prisma.proyecto.findUnique({ where: { id: proyectoId }, select: { id: true } });
        if (!proyecto) throw new ErrorNoEncontrado("Proyecto no existe");

        const conAutoridad = await tieneAutoridadSobreProyecto(proyectoId, usuario);
        const esMiembro = await prisma.miembroProyecto.findFirst({
            where: { proyectoId, usuarioId: usuario.id },
            select: { id: true },
        });
        if (!conAutoridad && !esMiembro) throw new ErrorNoAutorizado("No tienes autoridad sobre este proyecto");
    }

    if (equipoId && dto.proyectoId) {
        const equipo = await prisma.equipo.findUnique({
            where: { id: equipoId },
            select: { id: true, proyectoId: true },
        });
        if (!equipo) throw new ErrorNoEncontrado("Equipo no existe");
        if (equipo.proyectoId !== proyectoId) throw new ErrorValidacion("El equipo no pertenece al proyecto");
    }

    if (periodoId) {
        const periodo = await prisma.periodoAcademico.findUnique({ where: { id: periodoId }, select: { id: true } });
        if (!periodo) throw new ErrorNoEncontrado("Periodo académico no existe");
    }

    // Validar usuarios colaboradores (si vienen)
    if (colaboradores.length > 0) {
        const ids = [...new Set(colaboradores.map(c => Number(c.usuarioId)))];
        const existentes = await prisma.usuario.findMany({ where: { id: { in: ids } }, select: { id: true } });
        if (existentes.length !== ids.length) throw new ErrorValidacion("Uno o más colaboradores no existen");
    }

    // Crear con transacción
    const creada = await prisma.$transaction(async (tx) => {
        const p = await pizarraRepositorio.crear({
            proyectoId,
            equipoId,
            periodoId,
            nombre: dto.nombre.trim(),
            esPublica: dto.esPublica ?? false,
            dataJson,
            version: 1,
            creadoPorId: usuario.id,
            colaboradores: colaboradores.length
                ? {
                    create: colaboradores.map(c => ({
                        usuarioId: Number(c.usuarioId),
                        rol: c.rol ?? "EDITOR",
                        agregadoPorId: usuario.id,
                    })),
                }
                : undefined,
        }, tx);

        return p;
    });

    return creada;
}
