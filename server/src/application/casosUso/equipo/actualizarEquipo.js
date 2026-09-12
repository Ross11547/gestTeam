import { actualizarEquipo } from "../../../dominio/equipo/validacionEquipo.js";
import { normalizarTexto, crearError } from "../../../dominio/equipo/helpersEquipo.js";
import { equipoRepositorio } from "../../../infrastructure/repositories/repositorioEquipo.js";
import { puedeGestionarEquipoAcademico } from "../../../dominio/comun/autoridadProyectoPeriodo.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

export async function actualizarEquipoCasoUso(idRaw, payload, usuario) {
    if (!usuario?.id) throw crearError("Usuario no autenticado", 401);

    const id = Number(idRaw);
    if (!Number.isInteger(id) || id <= 0) throw crearError("ID inválido");

    const equipo = await equipoRepositorio.obtenerPorId(id);
    if (!equipo) throw crearError("El equipo no existe", 404);

    if (!(await puedeGestionarEquipoAcademico(equipo, usuario))) {
        throw crearError("No tienes permisos para modificar este equipo", 403);
    }

    const data = actualizarEquipo.parse(payload);

    let proyectoPeriodo = null;
    if (data.proyectoPeriodoId) {
        proyectoPeriodo = await prisma.proyectoPeriodo.findUnique({
            where: { id: data.proyectoPeriodoId },
            include: { proyecto: { select: { id: true } }, periodo: { select: { id: true } } },
        });
        if (!proyectoPeriodo) throw crearError("El ProyectoPeriodo indicado no existe", 404);
        if (proyectoPeriodo.proyecto.id !== equipo.proyecto.id) {
            throw crearError("El ProyectoPeriodo no corresponde al proyecto del equipo", 400);
        }
    }

    let proyectoMateria = null;
    if (data.proyectoMateriaId) {
        proyectoMateria = await prisma.proyectoMateria.findUnique({
            where: { id: data.proyectoMateriaId },
            include: {
                proyectoPeriodo: { select: { id: true, proyectoId: true } },
                materia: { select: { id: true } },
                clase: { select: { id: true } },
            },
        });
        if (!proyectoMateria) throw crearError("El ProyectoMateria indicado no existe", 404);
        if (proyectoMateria.proyectoPeriodo.proyectoId !== equipo.proyecto.id) {
            throw crearError("El ProyectoMateria no corresponde al proyecto del equipo", 400);
        }
        if (proyectoPeriodo && proyectoMateria.proyectoPeriodo.id !== proyectoPeriodo.id) {
            throw crearError("El ProyectoMateria no corresponde al ProyectoPeriodo indicado", 400);
        }
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

    return equipoRepositorio.actualizar(id, {
        nombre: data.nombre !== undefined ? normalizarTexto(data.nombre) : undefined,
        tipoGrupo: data.tipoGrupo,
        proyectoPeriodoId: data.proyectoPeriodoId,
        proyectoMateriaId: data.proyectoMateriaId,
        materiaId: data.materiaId ?? (proyectoMateria ? proyectoMateria.materia.id : undefined),
        periodoId: data.periodoId ?? (proyectoPeriodo ? proyectoPeriodo.periodo.id : undefined),
        claseId: data.claseId ?? (proyectoMateria?.clase ? proyectoMateria.clase.id : undefined),
    });
}
