import { crearError } from "../../../dominio/proyecto/helpersProyecto.js";
import { tieneAutoridadSobreProyecto } from "../../../dominio/comun/autoridadProyecto.js";
import { proyectoRepositorio } from "../../../infrastructure/repositories/repositorioProyecto.js";
import { prisma } from "../../../infrastructure/db/prisma.client.js";

// Elimina un proyecto y TODA su descendencia en una sola transacción:
// revisiones → entregas → hitos, equipos (ferias, miembros), evaluaciones,
// solicitudes, pizarras (colaboradores), vínculos con materias y destacados.
export async function eliminarProyectoCasoUso(id, usuario) {
    const proyecto = await proyectoRepositorio.obtenerPorId(id);
    if (!proyecto) throw crearError("Proyecto no encontrado", 404);

    const autorizado = await tieneAutoridadSobreProyecto(proyecto.id, usuario);
    if (!autorizado) throw crearError("No tienes permisos sobre este proyecto", 403);

    const [hitos, equipos, pizarras] = await Promise.all([
        prisma.hitoProyecto.findMany({ where: { proyectoId: proyecto.id }, select: { id: true } }),
        prisma.equipo.findMany({ where: { proyectoId: proyecto.id }, select: { id: true } }),
        prisma.pizarra.findMany({ where: { proyectoId: proyecto.id }, select: { id: true } }),
    ]);

    const hitoIds = hitos.map((h) => h.id);
    const equipoIds = equipos.map((e) => e.id);
    const pizarraIds = pizarras.map((p) => p.id);

    const entregas = await prisma.entregaHito.findMany({
        where: {
            OR: [
                ...(hitoIds.length ? [{ hitoId: { in: hitoIds } }] : []),
                ...(equipoIds.length ? [{ equipoId: { in: equipoIds } }] : []),
            ],
        },
        select: { id: true },
    });
    const entregaIds = entregas.map((e) => e.id);

    const feriaEquipos = equipoIds.length
        ? await prisma.feriaEquipo.findMany({ where: { equipoId: { in: equipoIds } }, select: { id: true } })
        : [];
    const feriaEquipoIds = feriaEquipos.map((f) => f.id);

    await prisma.$transaction([
        ...(entregaIds.length ? [prisma.revisionEntrega.deleteMany({ where: { entregaId: { in: entregaIds } } })] : []),
        ...(entregaIds.length ? [prisma.analisisPlagio.deleteMany({ where: { entregaId: { in: entregaIds } } })] : []),
        ...(entregaIds.length || hitoIds.length || equipoIds.length
            ? [prisma.entregaHito.deleteMany({
                  where: {
                      OR: [
                          ...(hitoIds.length ? [{ hitoId: { in: hitoIds } }] : []),
                          ...(equipoIds.length ? [{ equipoId: { in: equipoIds } }] : []),
                      ],
                  },
              })]
            : []),
        ...(feriaEquipoIds.length
            ? [
                  prisma.feriaEvaluacion.deleteMany({ where: { feriaEquipoId: { in: feriaEquipoIds } } }),
                  prisma.feriaEquipoMiembro.deleteMany({ where: { feriaEquipoId: { in: feriaEquipoIds } } }),
                  prisma.feriaEquipo.deleteMany({ where: { id: { in: feriaEquipoIds } } }),
              ]
            : []),
        ...(equipoIds.length ? [prisma.equipoMiembro.deleteMany({ where: { equipoId: { in: equipoIds } } })] : []),
        ...(equipoIds.length ? [prisma.equipo.deleteMany({ where: { id: { in: equipoIds } } })] : []),
        prisma.hitoProyecto.deleteMany({ where: { proyectoId: proyecto.id } }),
        prisma.evaluacionProyecto.deleteMany({ where: { proyectoId: proyecto.id } }),
        prisma.solicitudAccesoProyecto.deleteMany({ where: { proyectoId: proyecto.id } }),
        ...(pizarraIds.length ? [prisma.pizarraColaborador.deleteMany({ where: { pizarraId: { in: pizarraIds } } })] : []),
        prisma.pizarra.deleteMany({ where: { proyectoId: proyecto.id } }),
        prisma.proyectoMateria.deleteMany({ where: { proyectoId: proyecto.id } }),
        prisma.proyectoDestacado.deleteMany({ where: { proyectoId: proyecto.id } }),
        prisma.miembroProyecto.deleteMany({ where: { proyectoId: proyecto.id } }),
        prisma.proyecto.delete({ where: { id: proyecto.id } }),
    ]);

    return { id: proyecto.id };
}
