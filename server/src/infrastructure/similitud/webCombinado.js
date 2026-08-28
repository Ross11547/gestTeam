import { buscarEnWeb } from "./similitud.js";
import { compararSimilitudIA } from "./clienteSimilitudIA.js";

const UMBRAL_SNIPPET_JACCARD = 25;
const MAX_SNIPPETS_POR_ORACION = 3;

export async function buscarEnWebMejorado(textoDocumento) {
  const base = await buscarEnWeb(textoDocumento);

  const oraciones = base.oraciones || [];
  const coincidenciasPorOracion = Array.isArray(base.coincidenciasPorOracion)
    ? base.coincidenciasPorOracion
    : [];

  if (
    oraciones.length === 0 ||
    !coincidenciasPorOracion.some(Boolean) ||
    base.fuentes.length === 0
  ) {
    return base;
  }

  const candidatosPorOracion = new Map();

  for (let idx = 0; idx < coincidenciasPorOracion.length; idx++) {
    const info = coincidenciasPorOracion[idx];
    if (!info || info.score < UMBRAL_SNIPPET_JACCARD) continue;

    const fuente = base.fuentes.find((f) => f.url === info.url);
    if (!fuente || !fuente._snippet) continue;

    const lista = candidatosPorOracion.get(idx) || [];
    lista.push({ url: info.url, snippet: fuente._snippet });
    candidatosPorOracion.set(idx, lista.slice(0, MAX_SNIPPETS_POR_ORACION));
  }

  const urlMaxScore = new Map();

  for (const [idx, candidatos] of candidatosPorOracion.entries()) {
    const oracion = oraciones[idx];
    const snippets = candidatos.map((c) => c.snippet);

    try {
      const respuesta = await compararSimilitudIA(oracion, snippets);
      const resultados = respuesta.resultados || [];

      for (let i = 0; i < resultados.length && i < candidatos.length; i++) {
        const r = resultados[i];
        const url = candidatos[i].url;
        const scoreLexico = coincidenciasPorOracion[idx]?.score || 0;

        const scoreFinal = Math.max(
          scoreLexico,
          Math.round(Number(r.puntaje || 0) * 100),
        );

        if (!urlMaxScore.has(url) || urlMaxScore.get(url) < scoreFinal) {
          urlMaxScore.set(url, scoreFinal);
        }
      }
    } catch (e) {
      console.warn(
        "IA web no disponible, se mantiene score léxico:",
        e.message,
      );
    }
  }

  const fuentesMejoradas = base.fuentes
    .map((f) => {
      const scoreIA = urlMaxScore.get(f.url);
      if (scoreIA !== undefined) {
        return { ...f, coincidencia: scoreIA, metodo: "serper_jaccard_sbert" };
      }
      return f;
    })
    .sort((a, b) => b.coincidencia - a.coincidencia)
    .slice(0, 5);

  return {
    ...base,
    fuentes: fuentesMejoradas,
  };
}
