import path from "path";
import fs from "fs";
import { prisma } from "../db/prisma.client.js";
import { fileURLToPath } from "url";

import { crearError } from "../../dominio/comun/helpersComunes.js";
import { extraerTextoDeDocumento, contarPalabras } from "./texto.js";
import { buscarEnWeb, buscarEnRepositorioUnifranz } from "./similitud.js";
import { buscarEnRepositorioUnifranzIA } from "./repositorioIA.js";
import { buscarEnWebMejorado } from "./webCombinado.js";
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

const COLORES_RIESGO = {
  CRITICO: "#7f1d1d",
  ALTO: "#ef4444",
  MEDIO: "#f97316",
  BAJO: "#eab308",
};

function colorPorFragmento(tipo, riesgo) {
  if (riesgo && riesgo !== "BAJO") return COLORES_RIESGO[riesgo];
  switch (String(tipo || "").toLowerCase()) {
    case "web":
      return COLORES_RIESGO.ALTO;
    case "universidad":
    case "unifranz":
      return COLORES_RIESGO.MEDIO;
    case "ia":
      return "#8b5cf6";
    default:
      return "#22c55e";
  }
}

function normalizarTipoFuente(tipo) {
  const t = String(tipo || "").toUpperCase();
  switch (t) {
    case "WEB":
      return "WEB";
    case "UNIFRANZ":
    case "UNIVERSIDAD":
      return "UNIFRANZ";
    case "IA":
      return "IA";
    case "UNIVERSIDADEXTERNA":
    case "LIBRO":
      return "UNIVERSIDADEXTERNA";
    default:
      return "DESCONOCIDO";
  }
}

function normalizarTipoFragmento(tipo) {
  const t = String(tipo || "").toUpperCase();
  switch (t) {
    case "ORIGINAL":
      return "ORIGINAL";
    case "WEB":
      return "WEB";
    case "UNIFRANZ":
    case "UNIVERSIDAD":
      return "UNIFRANZ";
    case "IA":
      return "IA";
    case "MIXTO":
      return "MIXTO";
    case "UNIVERSIDADEXTERNA":
      return "UNIVERSIDADEXTERNA";
    default:
      return "DESCONOCIDO";
  }
}

function normalizarClave(str) {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function combinarResultadosRepositorio(lexico, semantico) {
  const fuentesMap = new Map();

  for (const f of semantico.fuentes || []) {
    const key = f.documentoOrigenId
      ? `id:${f.documentoOrigenId}`
      : normalizarClave(f.titulo);

    fuentesMap.set(key, {
      tipo: "universidad",
      titulo: f.titulo,
      autor: f.autor || "Repositorio UNIFRANZ",
      url: f.url || null,
      coincidencia: f.coincidencia,
      similitud: f.similitud,
      documentoOrigenId: f.documentoOrigenId,
      metodo: f.metodo || "sentence_transformers_fine_tuned",
    });
  }

  for (const f of lexico.fuentes || []) {
    const key = normalizarClave(f.titulo);

    if (fuentesMap.has(key)) {
      const existente = fuentesMap.get(key);
      existente.coincidencia = Math.max(existente.coincidencia, f.coincidencia);
      existente.similitud = Math.max(
        existente.similitud || 0,
        f.coincidencia / 100,
      );
      if (!String(existente.metodo).includes("jaccard")) {
        existente.metodo = `${existente.metodo}_jaccard`;
      }
    } else {
      fuentesMap.set(key, {
        tipo: "universidad",
        titulo: f.titulo,
        autor: f.autor || "Repositorio UNIFRANZ",
        url: f.url || null,
        coincidencia: f.coincidencia,
        similitud: f.coincidencia / 100,
        metodo: "jaccard_lexico",
      });
    }
  }

  const fuentes = Array.from(fuentesMap.values())
    .sort((a, b) => b.coincidencia - a.coincidencia)
    .slice(0, 5);

  const porcentajeGlobal = Math.min(
    100,
    Math.max(lexico.porcentajeGlobal || 0, semantico.porcentajeGlobal || 0),
  );

  return {
    porcentajeGlobal,
    fuentes,
    coincidenciasPorFragmento: semantico.coincidenciasPorFragmento || [],
    modelo: semantico.modelo || null,
    ajustado: semantico.ajustado === true,
  };
}

function leerMetadataModelo() {
  const rutaBase = path.join(process.cwd(), "..", "detectorIA");

  const metadataPath = path.join(
    rutaBase,
    "modelos",
    "modelo_ajustado",
    "gestteam_entrenamiento.json",
  );
  const evalPath = path.join(
    rutaBase,
    "entrenamiento",
    "resultados",
    "evaluacion.json",
  );

  const metadata = fs.existsSync(metadataPath)
    ? JSON.parse(fs.readFileSync(metadataPath, "utf8"))
    : null;
  const evaluacion = fs.existsSync(evalPath)
    ? JSON.parse(fs.readFileSync(evalPath, "utf8"))
    : null;

  return { metadata, evaluacion };
}

async function registrarModeloPlagio(modeloInfo) {
  const { metadata, evaluacion } = leerMetadataModelo();
  const ajustado = modeloInfo.ajustado === true;

  const versionBase = metadata?.fecha
    ? `v_${metadata.fecha.replace(/[:.T]/g, "-")}`
    : ajustado
      ? "fine-tuned"
      : "base";

  const version = `${versionBase}-${ajustado ? "fine-tuned" : "base"}`;

  const metricas = {
    modelo: modeloInfo.modelo,
    ajustado,
    ...(evaluacion?.resultados?.[0] || {}),
    umbrales: {
      bajo: 0.0,
      medio: 0.6,
      alto: 0.78,
      critico: 0.9,
    },
  };

  const nombre = ajustado
    ? "GestTeam - Similitud Semántica Fine-Tuned"
    : "GestTeam - Similitud Semántica Base";

  const row = await prisma.modeloPlagio.upsert({
    where: {
      tarea_version: {
        tarea: "SIMILITUDSEMANTICA",
        version,
      },
    },
    update: {
      nombre,
      activo: true,
      metricas,
      rutaModelo: modeloInfo.modelo || "",
      notas: metadata?.nota || "Modelo usado en análisis de plagio",
    },
    create: {
      nombre,
      tarea: "SIMILITUDSEMANTICA",
      version,
      rutaModelo: modeloInfo.modelo || "",
      activo: true,
      metricas,
      notas: metadata?.nota || "Modelo usado en análisis de plagio",
    },
  });

  await prisma.modeloPlagio.updateMany({
    where: {
      tarea: "SIMILITUDSEMANTICA",
      id: { not: row.id },
    },
    data: { activo: false },
  });

  return row.id;
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
    tipo: String(f.tipo || "").toLowerCase(),
    titulo: f.titulo,
    autor: f.autor || "",
    coincidencia: f.coincidencia,
    url: f.url,
    metodo: f.metodo,
  }));

  const fragmentosDto = fragmentosGuardados.map((fr) => ({
    original: fr.texto,
    fuente: fr.fuenteLabel || "Desconocida",
    tipo: String(fr.tipo || "").toLowerCase(),
    inicio: fr.inicio,
    fin: fr.fin,
    riesgo: fr.riesgo,
    color: fr.color,
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
    tiempoAnalisis: resumen.tiempoAnalisis || null,
    palabrasAnalizadas,
    frasesAnalizadas,
    textoOriginal: texto,
  };
}

export async function analizarDocumento(documentoId) {
  const inicioMs = Date.now();

  const documento = await prisma.documento.findUnique({
    where: { id: documentoId },
  });

  if (!documento) throw crearError("Documento no encontrado", 404);

  const rutaAbsoluta = path.resolve(documento.ruta);
  const texto =
    documento.contenidoTexto ||
    (await extraerTextoDeDocumento(
      rutaAbsoluta,
      documento.mimetype,
      documento.nombre,
    ));

  const palabrasAnalizadas = contarPalabras(texto);

  const [repoLexico, repoSemantico, simWeb] = await Promise.all([
    buscarEnRepositorioUnifranz(texto),
    buscarEnRepositorioUnifranzIA(texto),
    buscarEnWebMejorado(texto),
  ]);
  const simUnifranz = combinarResultadosRepositorio(repoLexico, repoSemantico);
  const resultadoIA = estimarContenidoIA(texto);

  const modeloPlagioId = await registrarModeloPlagio({
    modelo: simUnifranz.modelo,
    ajustado: simUnifranz.ajustado,
  });

  const tiempoAnalisis = `${((Date.now() - inicioMs) / 1000).toFixed(1)} segundos`;

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
        tiempoAnalisis,
        modeloIA: simUnifranz.modelo || null,
        iaAjustado: simUnifranz.ajustado === true,
        modeloPlagioId,
      },
      fuentes: {
        create: [
          ...simUnifranz.fuentes.map((f) => ({
            tipo: normalizarTipoFuente(f.tipo),
            titulo: f.titulo,
            autor: f.autor || "Repositorio UNIFRANZ",
            url: f.url || null,
            coincidencia: f.coincidencia,
            similitud: f.similitud || f.coincidencia / 100,
            metodo: f.metodo || "sentence_transformers_fine_tuned",
          })),

          ...simWeb.fuentes.map((f) => ({
            tipo: normalizarTipoFuente(f.tipo),
            titulo: f.titulo,
            autor: f.autor || "",
            url: f.url || null,
            coincidencia: f.coincidencia,
            similitud: f.coincidencia / 100,
            metodo: f.metodo || "serper_jaccard_snippet",
          })),

          ...(contenidoIA > 5
            ? [
                {
                  tipo: normalizarTipoFuente("ia"),
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
        create: fragmentosCalculados.map((f) => {
          const tipoRaw = f.tipo;
          const tipoFragmento = normalizarTipoFragmento(tipoRaw);
          return {
            inicio: f.inicio || 0,
            fin: f.fin || 0,
            texto: f.texto,
            tipo: tipoFragmento,
            fuenteLabel: f.fuenteLabel,
            riesgo:
              f.riesgo && ["BAJO", "MEDIO", "ALTO", "CRITICO"].includes(f.riesgo)
                ? f.riesgo
                : "BAJO",
            color: colorPorFragmento(tipoRaw, f.riesgo),
          };
        }),
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
