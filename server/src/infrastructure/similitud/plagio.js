import path from "path";
import { prisma } from "../db/prisma.client.js";
import { fileURLToPath } from "url";

import { extraerTextoDeDocumento, contarPalabras } from "./texto.js";
import { buscarEnWeb } from "./similitud.js";
import { buscarEnRepositorioUnifranzIA } from "./repositorioIA.js";
import { estimarContenidoIA } from "./IADetector.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getNivelRiesgo(
  originalidad,
  plagioWeb,
  plagioUniversidad,
  contenidoIA,
) {
  const riesgoBruto = plagioWeb + plagioUniversidad + contenidoIA;
  if (riesgoBruto >= 60 || originalidad < 55) return "ALTO";
  if (riesgoBruto >= 35 || originalidad < 65) return "MEDIO";
  return "BAJO";
}

function construirAlertas({
  originalidad,
  plagioWeb,
  plagioUniversidad,
  contenidoIA,
}) {
  const alertas = [];

  if (contenidoIA > 10) {
    alertas.push({
      nivel: "alto",
      mensaje: `Se detectó ${contenidoIA}% de contenido con patrones que pueden corresponder a IA`,
    });
  }

  if (plagioUniversidad > 10) {
    alertas.push({
      nivel: "medio",
      mensaje: `Coincidencia del ${plagioUniversidad}% con documentos del repositorio UNIFRANZ`,
    });
  }

  if (plagioWeb > 0) {
    alertas.push({
      nivel: "medio",
      mensaje: `Se encontraron posibles coincidencias en la web (${plagioWeb}%)`,
    });
  }

  if (originalidad < 60) {
    alertas.push({
      nivel: "alto",
      mensaje:
        "El porcentaje de originalidad está por debajo del mínimo sugerido (60%)",
    });
  }

  return alertas;
}

function generarFragmentos(texto, simWeb, simUnifranz, resultadoIA) {
  const oracionesBase =
    simWeb?.oraciones && Array.isArray(simWeb.oraciones)
      ? simWeb.oraciones
      : texto
          .split(/(?<=[.!?])\s+/)
          .map((o) => o.trim())
          .filter((o) => o.length > 20);

  const fragmentosSospechosos = [];
  const fragmentosOriginales = [];
  const marca = new Array(oracionesBase.length).fill(null);

  if (simWeb?.coincidenciasPorOracion) {
    simWeb.coincidenciasPorOracion.forEach((info, idx) => {
      if (!info) return;
      const o = oracionesBase[idx];
      const inicio = texto.indexOf(o);
      if (inicio === -1) return;

      marca[idx] = "web";
      fragmentosSospechosos.push({
        texto: o,
        tipo: "WEB",
        fuenteLabel: info.titulo || "Fuente web",
        inicio,
        fin: inicio + o.length,
      });
    });
  }

  if (
    simUnifranz?.coincidenciasPorFragmento &&
    Array.isArray(simUnifranz.coincidenciasPorFragmento)
  ) {
    for (const coincidencia of simUnifranz.coincidenciasPorFragmento) {
      if (!coincidencia || coincidencia.puntaje < 0.6) continue;

      const o = coincidencia.texto;
      const inicio = texto.indexOf(o);

      if (inicio === -1) continue;

      const idx = oracionesBase.findIndex((base) => base === o);

      if (idx >= 0 && marca[idx]) continue;

      if (idx >= 0) {
        marca[idx] = "universidad";
      }

      fragmentosSospechosos.push({
        texto: o,
        tipo: "universidad",
        fuenteLabel: coincidencia.titulo || "Repositorio UNIFRANZ",
        inicio,
        fin: inicio + o.length,
        similitud: coincidencia.coincidencia,
        riesgo: coincidencia.nivel,
      });
    }
  }

  const pctIA = resultadoIA?.porcentajeIA || 0;
  if (pctIA > 10) {
    const objetivoIA = Math.max(
      1,
      Math.round((oracionesBase.length * pctIA) / 100),
    );

    let marcadasIA = 0;
    const indicesOrdenados = oracionesBase
      .map((o, idx) => ({ idx, len: o.length }))
      .sort((a, b) => b.len - a.len);

    for (const { idx } of indicesOrdenados) {
      if (marcadasIA >= objetivoIA) break;
      if (marca[idx]) continue;

      const o = oracionesBase[idx];
      const palabras = o.split(/\s+/).length;
      if (palabras < 12) continue;

      const inicio = texto.indexOf(o);
      if (inicio === -1) continue;

      marca[idx] = "ia";
      fragmentosSospechosos.push({
        texto: o,
        tipo: "IA",
        fuenteLabel: "Patrón sospechoso de IA",
        inicio,
        fin: inicio + o.length,
      });
      marcadasIA++;
    }
  }

  oracionesBase.forEach((o, idx) => {
    const inicio = texto.indexOf(o);
    if (inicio === -1) return;

    if (!marca[idx]) {
      marca[idx] = "original";
      fragmentosOriginales.push({
        texto: o,
        tipo: "ORIGINAL",
        fuenteLabel: "Texto del estudiante",
        inicio,
        fin: inicio + o.length,
      });
    }
  });

  const todos = [...fragmentosSospechosos, ...fragmentosOriginales];
  todos.sort((a, b) => a.inicio - b.inicio);

  return todos;
}

function mapearAFrontend(analisis, fuentes, fragmentosGuardados, texto) {
  const resumen = analisis.resumenJson || {};
  const palabrasAnalizadas =
    resumen.palabrasAnalizadas || contarPalabras(texto);
  const frasesAnalizadas =
    resumen.frasesAnalizadas ||
    Math.max(1, Math.round(palabrasAnalizadas / 18));

  const fuentesDto = fuentes.map((f) => ({
    tipo: f.tipo,
    titulo: f.titulo,
    autor: f.autor || "",
    coincidencia: f.coincidencia,
    url: f.url,
  }));

  const fragmentosDto = fragmentosGuardados.map((fr) => ({
    original: fr.texto,
    fuente: fr.fuenteLabel || "Desconocida",
    tipo: fr.tipo,
    inicio: fr.inicio,
    fin: fr.fin,
  }));

  const alertas = construirAlertas({
    originalidad: analisis.originalidad,
    plagioWeb: analisis.plagioWeb,
    plagioUniversidad: analisis.plagioUniversidad,
    contenidoIA: analisis.contenidoIA,
  });

  return {
    originalidad: Math.round(analisis.originalidad),
    plagioWeb: Math.round(analisis.plagioWeb),
    plagioUniversidad: Math.round(analisis.plagioUniversidad),
    contenidoIA: Math.round(analisis.contenidoIA),
    fuentes: fuentesDto,
    alertas,
    fragmentos: fragmentosDto,
    fechaAnalisis: analisis.creadoEn.toLocaleString("es-BO"),
    tiempoAnalisis: resumen.tiempoAnalisis || "7.8 segundos",
    palabrasAnalizadas,
    frasesAnalizadas,
    textoOriginal: texto,
  };
}

export async function analizarDocumento(documentoId) {
  const documento = await prisma.documento.findUnique({
    where: { id: documentoId },
  });

  if (!documento) throw new Error("Documento no encontrado");

  const rutaAbsoluta = path.resolve(documento.ruta);
  const texto =
    documento.contenidoTexto ||
    (await extraerTextoDeDocumento(
      rutaAbsoluta,
      documento.mimetype,
      documento.nombre,
    ));

  const palabrasAnalizadas = contarPalabras(texto);

  const simUnifranz = await buscarEnRepositorioUnifranzIA(texto);
  const simWeb = await buscarEnWeb(texto);
  const resultadoIA = estimarContenidoIA(texto);

  const plagioUniversidad = simUnifranz.porcentajeGlobal;
  const plagioWeb = simWeb.porcentajeGlobal;
  const contenidoIA = resultadoIA.porcentajeIA;
  const originalidad = Math.max(
    0,
    100 - plagioUniversidad - plagioWeb - contenidoIA,
  );

  const nivelRiesgo = getNivelRiesgo(
    originalidad,
    plagioWeb,
    plagioUniversidad,
    contenidoIA,
  );

  const fragmentosCalculados = generarFragmentos(
    texto,
    simWeb,
    simUnifranz,
    resultadoIA,
  );

  const analisis = await prisma.analisisPlagio.create({
    data: {
      documentoId,
      originalidad,
      plagioWeb,
      plagioUniversidad,
      contenidoIA,
      nivelRiesgo,
      resumenJson: {
        palabrasAnalizadas,
        frasesAnalizadas: Math.max(1, Math.round(palabrasAnalizadas / 18)),
        tiempoAnalisis: "7.8 segundos",
      },
      fuentes: {
        create: [
          ...simUnifranz.fuentes.map((f) => ({
            tipo: f.tipo,
            titulo: f.titulo,
            autor: f.autor || "Repositorio UNIFRANZ",
            url: f.url || null,
            coincidencia: f.coincidencia,
            similitud: f.similitud || f.coincidencia / 100,
            metodo: f.metodo || "sentence_transformers_fine_tuned",
          })),

          ...simWeb.fuentes.map((f) => ({
            tipo: f.tipo,
            titulo: f.titulo,
            autor: f.autor || "",
            url: f.url || null,
            coincidencia: f.coincidencia,
            similitud: f.coincidencia / 100,
            metodo: "serper_jaccard_snippet",
          })),

          ...(contenidoIA > 5
            ? [
                {
                  tipo: "ia",
                  titulo: "Contenido potencialmente generado por IA",
                  autor: "Heurística local",
                  url: null,
                  coincidencia: contenidoIA,
                  similitud: contenidoIA / 100,
                  metodo: "heuristica_local_temporal",
                },
              ]
            : []),
        ],
      },
      fragmentos: {
        create: fragmentosCalculados.map((f) => ({
          inicio: f.inicio || 0,
          fin: f.fin || 0,
          texto: f.texto,
          tipo: f.tipo,
          fuenteLabel: f.fuenteLabel,
        })),
      },
    },
    include: {
      fuentes: true,
      fragmentos: true,
    },
  });

  return mapearAFrontend(
    analisis,
    analisis.fuentes,
    analisis.fragmentos,
    texto,
  );
}
