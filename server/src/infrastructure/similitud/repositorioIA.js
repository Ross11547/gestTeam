import { prisma } from "../db/prisma.client.js";
import { compararSimilitudIA } from "./clienteSimilitudIA.js";

const prisma = new PrismaClient();

function dividirEnFragmentosPorOraciones(texto, maxFragmentos = 20) {
    if (!texto) return [];

    const oraciones = texto
        .split(/(?<=[.!?])\s+/)
        .map((o) => o.trim())
        .filter((o) => o.length >= 60);

    return oraciones
        .map((texto, index) => ({
            indice: index,
            texto,
        }))
        .slice(0, maxFragmentos);
}

function cortarTexto(texto, maxChars = 900) {
    if (!texto) return "";
    return texto.length > maxChars ? texto.slice(0, maxChars) : texto;
}

function porcentajeDesdePuntaje(puntaje) {
    return Math.round(Number(puntaje || 0) * 100);
}

function obtenerNivelDesdePuntaje(puntaje) {
    if (puntaje >= 0.90) return "CRITICO";
    if (puntaje >= 0.78) return "ALTO";
    if (puntaje >= 0.60) return "MEDIO";
    return "BAJO";
}

export async function buscarEnRepositorioUnifranzIA(textoDocumento) {
    const docsRepo = await prisma.documento.findMany({
        where: {
            esRepositorioUnifranz: true,
            contenidoTexto: {
                not: null,
            },
        },
        select: {
            id: true,
            nombre: true,
            contenidoTexto: true,
        },
    });

    if (!docsRepo.length) {
        return {
            porcentajeGlobal: 0,
            fuentes: [],
            coincidenciasPorFragmento: [],
            modelo: null,
            ajustado: false,
        };
    }

    const fragmentosDocumento = dividirEnFragmentosPorOraciones(textoDocumento, 20);

    if (!fragmentosDocumento.length) {
        return {
            porcentajeGlobal: 0,
            fuentes: [],
            coincidenciasPorFragmento: [],
            modelo: null,
            ajustado: false,
        };
    }

    const candidatos = docsRepo.map((doc) =>
        cortarTexto(doc.contenidoTexto || "", 900)
    );

    const fuentesMap = new Map();
    const coincidenciasPorFragmento = [];

    let modelo = null;
    let ajustado = false;

    for (const frag of fragmentosDocumento) {
        const respuestaIA = await compararSimilitudIA(frag.texto, candidatos);

        modelo = respuestaIA.modelo;
        ajustado = respuestaIA.ajustado;

        const mejor = [...(respuestaIA.resultados || [])].sort(
            (a, b) => b.puntaje - a.puntaje
        )[0];

        if (!mejor) continue;

        const docOrigen = docsRepo[mejor.indice];

        if (!docOrigen) continue;

        const puntaje = Number(mejor.puntaje || 0);
        const coincidenciaPct = porcentajeDesdePuntaje(puntaje);

        if (puntaje >= 0.60) {
            coincidenciasPorFragmento.push({
                fragmentoIndice: frag.indice,
                texto: frag.texto,
                documentoOrigenId: docOrigen.id,
                titulo: docOrigen.nombre,
                puntaje,
                coincidencia: coincidenciaPct,
                nivel: obtenerNivelDesdePuntaje(puntaje),
            });

            const existente = fuentesMap.get(docOrigen.id);

            if (!existente || coincidenciaPct > existente.coincidencia) {
                fuentesMap.set(docOrigen.id, {
                    tipo: "universidad",
                    titulo: docOrigen.nombre,
                    autor: "Repositorio UNIFRANZ",
                    url: null,
                    coincidencia: coincidenciaPct,
                    similitud: puntaje,
                    documentoOrigenId: docOrigen.id,
                    metodo: "sentence_transformers_fine_tuned",
                });
            }
        }
    }

    const fuentes = Array.from(fuentesMap.values())
        .sort((a, b) => b.coincidencia - a.coincidencia)
        .slice(0, 5);

    const coincidenciasFuertes = coincidenciasPorFragmento.filter(
        (c) => c.puntaje >= 0.78
    );

    const porcentajeGlobal =
        fragmentosDocumento.length === 0
            ? 0
            : Math.min(
                  100,
                  Math.round(
                      (coincidenciasFuertes.length / fragmentosDocumento.length) * 100
                  )
              );

    return {
        porcentajeGlobal,
        fuentes,
        coincidenciasPorFragmento,
        modelo,
        ajustado,
    };
}