import { prisma } from "../db/prisma.client.js";
import { extraerTextoDeDocumento } from "./texto.js";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const NOTA_MINIMA_APROBACION = 70;
const MAX_PARES_POSITIVOS_POR_DOC = 30;
const MAX_PARES_NEGATIVOS_POR_DOC = 30;
const LONGITUD_MINIMA_FRAGMENTO = 80;

export async function proyectoYaIncluido(proyectoId) {
    const existentes = await prisma.datasetPlagio.count({
        where: {
            tarea: "SIMILITUDSEMANTICA",
            origen: `proyecto:${proyectoId}`,
        },
    });
    return existentes > 0;
}

function identificarHitoFinal(hitos) {
    if (!hitos || hitos.length === 0) return null;

    const porNombre = hitos.find((h) =>
        /final|defensa|último|ultimo|entrega final/i.test(h.nombre || "")
    );
    if (porNombre) return porNombre;

    return hitos.reduce((max, h) => (h.orden > max.orden ? h : max), hitos[0]);
}

export async function validarProyectoAprobado(proyectoId, forzar = false) {
    const proyecto = await prisma.proyecto.findUnique({
        where: { id: proyectoId },
        include: {
            hitos: {
                include: {
                    entregas: {
                        include: {
                            documentos: true,
                            revisiones: { orderBy: { id: "desc" }, take: 1 },
                        },
                    },
                },
            },
            evaluacionProyectos: true,
        },
    });

    if (!proyecto) throw new Error("Proyecto no encontrado");

    if (forzar) {
        return { proyecto, aprobado: true, hitoFinal: null, entregaFinal: null };
    }

    const aprobadoPorEstado = proyecto.estado === "CERRADO";

    const hitoFinal = identificarHitoFinal(proyecto.hitos);
    const hitoFinalizado = hitoFinal?.estado === "FINALIZADO";

    const entregaFinal = hitoFinal?.entregas?.[0];
    const entregaRevisada = entregaFinal?.estado === "REVISADO";
    const notaFinal = entregaFinal?.revisiones?.[0]?.nota ?? 0;
    const notaAprobatoria = Number(notaFinal) >= NOTA_MINIMA_APROBACION;

    const evaluacionAprobatoria =
        proyecto.evaluacionProyectos.length === 0 ||
        proyecto.evaluacionProyectos.some((e) => Number(e.puntaje) >= NOTA_MINIMA_APROBACION);

    const aprobado =
        aprobadoPorEstado &&
        hitoFinalizado &&
        entregaRevisada &&
        notaAprobatoria &&
        evaluacionAprobatoria;

    const razones = {
        aprobadoPorEstado,
        hitoFinalizado,
        entregaRevisada,
        notaAprobatoria,
        evaluacionAprobatoria,
        notaFinal,
        estadoProyecto: proyecto.estado,
        estadoHitoFinal: hitoFinal?.estado,
        estadoEntregaFinal: entregaFinal?.estado,
    };

    return { proyecto, aprobado, hitoFinal, entregaFinal, razones };
}

function dividirEnFragmentos(texto) {
    return String(texto || "")
        .split(/\n\s*\n+/)
        .map((f) => f.replace(/\s+/g, " ").trim())
        .filter((f) => f.length >= LONGITUD_MINIMA_FRAGMENTO);
}

async function generarParesDeDocumento(documento, otrosRepo, proyectoId) {
    const pares = [];
    const fragmentos = dividirEnFragmentos(documento.contenidoTexto);

    if (fragmentos.length < 2) return pares;

    for (let i = 0; i < Math.min(fragmentos.length - 1, MAX_PARES_POSITIVOS_POR_DOC); i++) {
        pares.push({
            textoA: fragmentos[i],
            textoB: fragmentos[i + 1],
            score: 0.85,
            label: "alta",
            origen: `proyecto:${proyectoId}`,
            metadata: {
                proyectoId,
                documentoIdA: documento.id,
                documentoIdB: documento.id,
                tipoPar: "mismo_documento",
            },
        });
    }

    if (otrosRepo && otrosRepo.length > 0) {
        for (let i = 0; i < Math.min(fragmentos.length, MAX_PARES_NEGATIVOS_POR_DOC); i++) {
            const otroDoc = otrosRepo[i % otrosRepo.length];
            const otrosFragmentos = dividirEnFragmentos(otroDoc.contenidoTexto);
            if (otrosFragmentos.length === 0) continue;

            const otroFragmento =
                otrosFragmentos[Math.floor(Math.random() * otrosFragmentos.length)];

            pares.push({
                textoA: fragmentos[i],
                textoB: otroFragmento,
                score: 0.1,
                label: "baja",
                origen: `proyecto:${proyectoId}`,
                metadata: {
                    proyectoId,
                    documentoIdA: documento.id,
                    documentoIdB: otroDoc.id,
                    tipoPar: "distinto_documento",
                },
            });
        }
    }

    return pares;
}

export async function incluirProyectoEnDataset(proyectoId, opts = {}) {
    const { forzar = false, creadoPorId = null } = opts;

    const { proyecto, aprobado, hitoFinal, entregaFinal, razones } =
        await validarProyectoAprobado(proyectoId, forzar);

    if (!aprobado) {
        return {
            ok: false,
            mensaje: "El proyecto no cumple los criterios de aprobación.",
            razones,
        };
    }

    const documentos =
        entregaFinal?.documentos?.filter((d) => Boolean(d.contenidoTexto?.trim())) || [];

    if (documentos.length === 0) {
        return {
            ok: false,
            mensaje: "La entrega final no tiene documentos con texto extraído.",
            razones,
        };
    }

    for (const doc of documentos) {
        if (!doc.contenidoTexto) {
            try {
                const rutaAbsoluta = path.resolve(doc.ruta);
                const texto = await extraerTextoDeDocumento(
                    rutaAbsoluta,
                    doc.mimetype,
                    doc.nombre
                );
                await prisma.documento.update({
                    where: { id: doc.id },
                    data: { contenidoTexto: texto },
                });
                doc.contenidoTexto = texto;
            } catch (e) {
                console.error(`No se pudo extraer texto de doc ${doc.id}:`, e.message);
            }
        }
    }

    const documentosValidos = documentos.filter((d) =>
        Boolean(d.contenidoTexto?.trim())
    );

    if (documentosValidos.length === 0) {
        return {
            ok: false,
            mensaje: "Ningún documento de la entrega final pudo procesarse.",
            razones,
        };
    }

    const ids = documentosValidos.map((d) => d.id);
    await prisma.documento.updateMany({
        where: { id: { in: ids } },
        data: { esRepositorioUnifranz: true },
    });

    const otrosRepo = await prisma.documento.findMany({
        where: {
            esRepositorioUnifranz: true,
            contenidoTexto: { not: null },
            id: { notIn: ids },
        },
        select: { id: true, contenidoTexto: true },
        take: 50,
    });

    let todosLosPares = [];
    for (const doc of documentosValidos) {
        const pares = await generarParesDeDocumento(doc, otrosRepo, proyectoId);
        todosLosPares = todosLosPares.concat(pares);
    }

    let creados = 0;
    for (const par of todosLosPares) {
        const existente = await prisma.datasetPlagio.findFirst({
            where: {
                tarea: "SIMILITUDSEMANTICA",
                textoA: par.textoA,
                textoB: par.textoB,
            },
        });

        if (!existente) {
            await prisma.datasetPlagio.create({
                data: {
                    tarea: "SIMILITUDSEMANTICA",
                    textoA: par.textoA,
                    textoB: par.textoB,
                    label: par.label,
                    score: par.score,
                    origen: par.origen,
                    creadoPorId,
                    aprobado: true,
                    metadata: par.metadata,
                },
            });
            creados++;
        }
    }

    return {
        ok: true,
        mensaje: "Proyecto incluido en el repositorio y dataset de entrenamiento.",
        proyectoId,
        documentosIncluidos: documentosValidos.length,
        paresDatasetCreados: creados,
        razones,
    };
}

export async function exportarDatasetParaEntrenamiento() {
    const filas = await prisma.datasetPlagio.findMany({
        where: { aprobado: true, tarea: "SIMILITUDSEMANTICA" },
        select: { textoA: true, textoB: true, score: true },
    });

    const base = path.join(__dirname, "..", "..", "..", "..", "detectorIA", "entrenamiento", "data");
    fs.mkdirSync(base, { recursive: true });

    const ruta = path.join(base, "dataset_autogenerado.csv");

    const lineas = [
        "oracion1,oracion2,score",
        ...filas.map((f) => {
            const a = String(f.textoA).replace(/"/g, '""').trim();
            const b = String(f.textoB).replace(/"/g, '""').trim();
            const score = Number(f.score).toFixed(4);
            return `"${a}","${b}",${score}`;
        }),
    ];

    fs.writeFileSync(ruta, lineas.join("\n"), "utf8");

    return { ruta, filas: filas.length };
}

export async function reentrenarModeloDesdeDataset() {
    const { ruta, filas } = await exportarDatasetParaEntrenamiento();

    if (filas < 10) {
        return {
            ok: false,
            mensaje: `Solo hay ${filas} pares aprobados. Se recomienda al menos 10 para reentrenar.`,
        };
    }

    return {
        ok: true,
        mensaje:
            "Dataset exportado. Ejecuta ahora el entrenamiento con: python detectorIA/entrenamiento/entrenar.py",
        rutaDataset: ruta,
        pares: filas,
    };
}
