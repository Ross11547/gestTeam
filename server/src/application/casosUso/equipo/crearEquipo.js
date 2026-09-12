import { crearEquipo } from "../../../dominio/equipo/validacionEquipo.js";
import { normalizarTexto, crearError } from "../../../dominio/equipo/helpersEquipo.js";
import { equipoRepositorio } from "../../../infrastructure/repositories/repositorioEquipo.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { puedeCrearEquipoEnProyecto } from "../../../dominio/comun/autoridadProyecto.js";

export async function crearEquipoCasoUso(payload, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const data = crearEquipo.parse(payload);

    const proyecto = await prisma.proyecto.findUnique({
        where: { id: data.proyectoId },
        select: { id: true },
    });

    if (!proyecto) throw crearError("El proyecto indicado no existe", 404);

    let proyectoPeriodo = null;
    if (data.proyectoPeriodoId) {
        proyectoPeriodo = await prisma.proyectoPeriodo.findUnique({
            where: { id: data.proyectoPeriodoId },
            include: {
                proyecto: { select: { id: true } },
                periodo: { select: { id: true } },
            },
        });
        if (!proyectoPeriodo) throw crearError("El ProyectoPeriodo indicado no existe", 404);
        if (proyectoPeriodo.proyecto.id !== data.proyectoId) {
            throw crearError("El ProyectoPeriodo no corresponde al proyecto indicado", 400);
        }
    }

    let proyectoMateria = null;
    if (data.proyectoMateriaId) {
        proyectoMateria = await prisma.proyectoMateria.findUnique({
            where: { id: data.proyectoMateriaId },
            include: {
                proyectoPeriodo: { select: { id: true, proyectoId: true, periodoId: true } },
                materia: { select: { id: true } },
                clase: { select: { id: true, periodoId: true } },
            },
        });
        if (!proyectoMateria) throw crearError("El ProyectoMateria indicado no existe", 404);
        if (proyectoMateria.proyectoPeriodo.proyectoId !== data.proyectoId) {
            throw crearError("El ProyectoMateria no corresponde al proyecto indicado", 400);
        }
        if (proyectoPeriodo && proyectoMateria.proyectoPeriodoId !== proyectoPeriodo.id) {
            throw crearError("El ProyectoMateria no corresponde al ProyectoPeriodo indicado", 400);
        }
    }

    const autorizado = await puedeCrearEquipoEnProyecto(data.proyectoId, usuario);
    if (!autorizado) throw crearError("No tienes permisos para crear un equipo en este proyecto", 403);

    for (const campo of ["materiaId", "periodoId", "claseId"]) {
        const valor = data[campo];
        if (valor === undefined || valor === null) continue;

        const modelo = { materiaId: "materia", periodoId: "periodoAcademico", claseId: "claseMateria" }[campo];
        const registro = await prisma[modelo].findUnique({ where: { id: valor }, select: { id: true } });

        if (!registro) throw crearError(`El registro indicado en ${campo} no existe`, 404);
    }

    if (proyectoMateria) {
        if (data.materiaId && data.materiaId !== proyectoMateria.materia.id) {
            throw crearError("materiaId no coincide con el ProyectoMateria indicado", 400);
        }
        if (data.claseId && proyectoMateria.clase && data.claseId !== proyectoMateria.clase.id) {
            throw crearError("claseId no coincide con el ProyectoMateria indicado", 400);
        }
    }

    if (proyectoPeriodo && data.periodoId && data.periodoId !== proyectoPeriodo.periodo.id) {
        throw crearError("periodoId no coincide con el ProyectoPeriodo indicado", 400);
    }

    try {
        return await equipoRepositorio.crearConLider(
            {
                proyectoId: data.proyectoId,
                nombre: normalizarTexto(data.nombre),
                tipoGrupo: data.tipoGrupo ?? undefined,
                proyectoPeriodoId: data.proyectoPeriodoId ?? null,
                proyectoMateriaId: data.proyectoMateriaId ?? null,
                periodoId: data.periodoId ?? proyectoPeriodo?.periodo.id ?? null,
                materiaId: data.materiaId ?? proyectoMateria?.materia.id ?? null,
                claseId: data.claseId ?? proyectoMateria?.clase?.id ?? null,
                creadoPorId: usuario.id,
            },
            usuario.id
        );
    } catch (e) {
        if (e.code === "P2003") {
            throw crearError("Alguna referencia indicada no existe", 404);
        }
        throw e;
    }
}
