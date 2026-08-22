import { prisma } from "../../../infrastructure/db/prisma.client.js";
import { crearError } from "../../../dominio/reporte/helpersReporte.js";
import { generarReporte as validarGenerar } from "../../../dominio/reporte/validacionReporte.js";

async function calcularDashboard() {
    const [usuariosPorRol, proyectosPorEstado, equipos, pizarras, documentos, evaluaciones] = await Promise.all([
        prisma.usuario.groupBy({ by: ["idRol"], _count: { _all: true } }),
        prisma.proyecto.groupBy({ by: ["estado"], _count: { _all: true } }),
        prisma.equipo.count(),
        prisma.pizarra.count(),
        prisma.documento.count(),
        prisma.evaluacionProyecto.count(),
    ]);

    const roles = await prisma.rol.findMany({ select: { id: true, nombre: true } });
    const nombreRol = Object.fromEntries(roles.map((r) => [r.id, r.nombre]));

    return {
        usuariosPorRol: usuariosPorRol.map((u) => ({ rol: nombreRol[u.idRol] ?? `rol ${u.idRol}`, total: u._count._all })),
        proyectosPorEstado: proyectosPorEstado.map((p) => ({ estado: p.estado, total: p._count._all })),
        totales: { equipos, pizarras, documentos, evaluaciones },
    };
}

async function calcularAvanceSemestre(periodoId) {
    const vinculos = await prisma.proyectoMateria.findMany({
        where: periodoId ? { periodoId } : undefined,
        select: { proyectoId: true },
        distinct: ["proyectoId"],
    });
    const proyectoIds = vinculos.map((v) => v.proyectoId);

    if (proyectoIds.length === 0) {
        return { proyectosAlcanzados: 0, hitosPorEstado: [], entregasTotales: 0, progresoPorProyecto: [] };
    }

    const hitos = await prisma.hitoProyecto.findMany({
        where: { proyectoId: { in: proyectoIds } },
        select: { id: true, estado: true, proyectoId: true },
    });

    const hitosPorEstado = {};
    for (const h of hitos) hitosPorEstado[h.estado] = (hitosPorEstado[h.estado] ?? 0) + 1;

    const entregasTotales = await prisma.entregaHito.count({
        where: { hitoId: { in: hitos.map((h) => h.id) } },
    });

    const porProyecto = {};
    for (const h of hitos) {
        porProyecto[h.proyectoId] ??= { total: 0, finalizados: 0 };
        porProyecto[h.proyectoId].total += 1;
        if (h.estado === "FINALIZADO") porProyecto[h.proyectoId].finalizados += 1;
    }

    const proyectos = await prisma.proyecto.findMany({
        where: { id: { in: proyectoIds } },
        select: { id: true, titulo: true },
    });

    return {
        proyectosAlcanzados: proyectoIds.length,
        hitosPorEstado,
        entregasTotales,
        progresoPorProyecto: proyectos
            .map((p) => {
                const c = porProyecto[p.id] ?? { total: 0, finalizados: 0 };
                return {
                    proyectoId: p.id,
                    titulo: p.titulo,
                    hitosTotal: c.total,
                    hitosFinalizados: c.finalizados,
                    porcentaje: c.total ? Math.round((c.finalizados / c.total) * 100) : 0,
                };
            })
            .sort((a, b) => b.porcentaje - a.porcentaje),
    };
}

async function calcularTopProyectos(periodoId) {
    const grupos = await prisma.evaluacionProyecto.groupBy({
        by: ["proyectoId"],
        where: periodoId ? { periodoId } : undefined,
        _avg: { puntaje: true },
        _count: { _all: true },
    });

    const top = grupos
        .map((g) => ({ proyectoId: g.proyectoId, promedio: Number((g._avg.puntaje ?? 0).toFixed(2)), evaluaciones: g._count._all }))
        .sort((a, b) => b.promedio - a.promedio)
        .slice(0, 10);

    const proyectos = await prisma.proyecto.findMany({ where: { id: { in: top.map((t) => t.proyectoId) } }, select: { id: true, titulo: true } });
    const tituloDe = Object.fromEntries(proyectos.map((p) => [p.id, p.titulo]));

    return top.map((t) => ({ ...t, titulo: tituloDe[t.proyectoId] ?? "—" }));
}

async function calcularPlagioResumen() {
    const [agregados, porRiesgo] = await Promise.all([
        prisma.analisisPlagio.aggregate({
            _count: { _all: true },
            _avg: { originalidad: true, scoreGlobal: true, contenidoIA: true, plagioWeb: true, plagioUniversidad: true },
        }),
        prisma.analisisPlagio.groupBy({ by: ["nivelRiesgo"], _count: { _all: true } }),
    ]);

    return {
        analisisTotales: agregados._count._all,
        promedios: {
            originalidad: Number((agregados._avg.originalidad ?? 0).toFixed(2)),
            scoreGlobal: Number((agregados._avg.scoreGlobal ?? 0).toFixed(2)),
            contenidoIA: Number((agregados._avg.contenidoIA ?? 0).toFixed(2)),
            plagioWeb: Number((agregados._avg.plagioWeb ?? 0).toFixed(2)),
            plagioUniversidad: Number((agregados._avg.plagioUniversidad ?? 0).toFixed(2)),
        },
        distribucionPorRiesgo: porRiesgo.map((r) => ({ nivel: r.nivelRiesgo, total: r._count._all })),
    };
}

async function calcularDocentesDesempeno(periodoId) {
    const clases = await prisma.claseMateria.findMany({
        where: { ...(periodoId ? { periodoId } : {}), docenteId: { not: null } },
        select: { id: true, docenteId: true },
    });
    if (clases.length === 0) return [];

    const porDocente = {};
    for (const c of clases) {
        if (c.docenteId == null) continue;
        porDocente[c.docenteId] ??= new Set();
        porDocente[c.docenteId].add(c.id);
    }

    const docentes = await prisma.usuario.findMany({
        where: { id: { in: Object.keys(porDocente).map(Number) } },
        select: { id: true, nombre: true, apellido: true },
    });
    const nombreDe = Object.fromEntries(docentes.map((d) => [d.id, `${d.nombre} ${d.apellido}`.trim()]));

    const todasLasClases = clases.map((c) => c.id);
    const [vinculos, evaluaciones] = await Promise.all([
        prisma.proyectoMateria.findMany({
            where: { claseId: { in: todasLasClases } },
            select: { claseId: true, proyectoId: true },
            distinct: ["claseId", "proyectoId"],
        }),
        prisma.evaluacionProyecto.findMany({
            where: { proyecto: { proyectoMateria: { some: { claseId: { in: todasLasClases } } } } },
            select: { proyectoId: true, puntaje: true },
        }),
    ]);

    const proyectosDeClase = {};
    for (const v of vinculos) (proyectosDeClase[v.claseId] ??= new Set()).add(v.proyectoId);

    const puntajesPorProyecto = {};
    for (const e of evaluaciones) (puntajesPorProyecto[e.proyectoId] ??= []).push(e.puntaje);

    const filas = [];
    for (const [docenteId, claseIdsSet] of Object.entries(porDocente)) {
        const claseIds = [...claseIdsSet];
        const proyectoIds = new Set();
        for (const cid of claseIds) for (const pid of proyectosDeClase[cid] ?? []) proyectoIds.add(pid);

        let promedio = null;
        if (proyectoIds.size > 0) {
            const puntajes = [...proyectoIds].flatMap((pid) => puntajesPorProyecto[pid] ?? []);
            if (puntajes.length > 0) {
                promedio = Number((puntajes.reduce((a, p) => a + p, 0) / puntajes.length).toFixed(2));
            }
        }

        filas.push({
            docenteId: Number(docenteId),
            docente: nombreDe[docenteId] ?? "—",
            clasesDictadas: claseIds.length,
            proyectosVinculados: proyectoIds.size,
            promedioEvaluaciones: promedio,
        });
    }
    return filas.sort((a, b) => (b.promedioEvaluaciones ?? -1) - (a.promedioEvaluaciones ?? -1));
}

const CALCULOS = {
    DASHBOARD: () => calcularDashboard(),
    AVANCESEMESTRE: (p) => calcularAvanceSemestre(p),
    TOPPROYECTOS: (p) => calcularTopProyectos(p),
    PLAGIORESUMEN: () => calcularPlagioResumen(),
    DOCENTESDESEMPENO: (p) => calcularDocentesDesempeno(p),
};

export async function generarReporteCasoUso(payload, solicitante) {
    const data = validarGenerar.parse(payload);

    if (!CALCULOS[data.tipo]) throw crearError("Tipo de reporte no soportado", 400);

    let periodoValido = null;
    if (data.periodoId) {
        periodoValido = await prisma.periodoAcademico.findUnique({ where: { id: data.periodoId }, select: { id: true } });
        if (!periodoValido) throw crearError("El periodo académico indicado no existe", 404);
    }

    const resultadoJson = await CALCULOS[data.tipo](data.periodoId ?? null);

    return prisma.reporteGenerado.create({
        data: {
            tipo: data.tipo,
            periodoId: data.periodoId ?? null,
            generadoPorId: solicitante.id,
            filtrosJson: data.filtrosJson === undefined ? undefined : data.filtrosJson,
            resultadoJson,
        },
        include: {
            generadoPor: { select: { id: true, nombre: true, apellido: true } },
            periodo: { select: { id: true, nombre: true } },
        },
    });
}
