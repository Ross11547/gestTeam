import { prisma } from "../db/prisma.client.js";
import { compararSimilitudIA } from "./clienteSimilitudIA.js";

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
  if (puntaje >= 0.9) return "CRITICO";
  if (puntaje >= 0.78) return "ALTO";
  if (puntaje >= 0.6) return "MEDIO";
  return "BAJO";
}

function palabrasClave(texto) {
  return String(texto || "")
    .toLowerCase()
    .split(/[^a-záéíóúñü0-9]+/)
    .filter((w) => w.length > 3);
}

function jaccardConjuntos(conjuntoA, conjuntoB) {
  if (!conjuntoA.size || !conjuntoB.size) return 0;
  let interseccion = 0;
  for (const palabra of conjuntoA) {
    if (conjuntoB.has(palabra)) interseccion++;
  }
  const menor = Math.min(conjuntoA.size, conjuntoB.size) || 1;
  return interseccion / menor;
}

function mejorLexico(textoFragmento, conjuntosDocs) {
  const conjuntoFrag = new Set(palabrasClave(textoFragmento));

  let mejor = { indice: -1, valor: 0 };

  conjuntosDocs.forEach((conjuntoDoc, indice) => {
    const valor = jaccardConjuntos(conjuntoFrag, conjuntoDoc);
    if (valor > mejor.valor) {
      mejor = { indice, valor };
    }
  });

  return mejor;
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

  const fragmentosDocumento = dividirEnFragmentosPorOraciones(
    textoDocumento,
    20,
  );

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
    cortarTexto(doc.contenidoTexto || "", 900),
  );

  const fuentesMap = new Map();
  const coincidenciasPorFragmento = [];

  let modelo = null;
  let ajustado = false;

  const conjuntosDocs = docsRepo.map(
    (doc) => new Set(palabrasClave(doc.contenidoTexto || "")),
  );

  for (const frag of fragmentosDocumento) {
    const respuestaIA = await compararSimilitudIA(frag.texto, candidatos);

    modelo = respuestaIA.modelo;
    ajustado = respuestaIA.ajustado;

    const mejor = [...(respuestaIA.resultados || [])].sort(
      (a, b) => b.puntaje - a.puntaje,
    )[0];

    const lexico = mejorLexico(frag.texto, conjuntosDocs);

    const puntajeSemantico = Number(
      mejor?.puntaje_semantico ?? mejor?.puntaje ?? 0,
    );
    const puntajeLexico = lexico.valor;
    const puntajeFusionado = Math.max(puntajeSemantico, puntajeLexico);
    const indiceGanador =
      puntajeLexico > puntajeSemantico ? lexico.indice : mejor?.indice;

    if (
      indiceGanador === undefined ||
      indiceGanador === null ||
      indiceGanador < 0
    )
      continue;

    const docOrigen = docsRepo[indiceGanador];

    if (!docOrigen) continue;

    const coincidenciaPct = porcentajeDesdePuntaje(puntajeFusionado);

    if (puntajeFusionado >= 0.6) {
      const señales =
        puntajeSemantico >= 0.6 && puntajeLexico >= 0.6
          ? "ia_semantico+jaccard_lexico"
          : puntajeLexico > puntajeSemantico
            ? "jaccard_lexico"
            : "ia_semantico";

      coincidenciasPorFragmento.push({
        fragmentoIndice: frag.indice,
        texto: frag.texto,
        documentoOrigenId: docOrigen.id,
        titulo: docOrigen.nombre,
        puntaje: puntajeFusionado,
        puntajeSemantico,
        puntajeLexico,
        coincidencia: coincidenciaPct,
        nivel: obtenerNivelDesdePuntaje(puntajeFusionado),
      });

      const existente = fuentesMap.get(docOrigen.id);

      if (!existente || coincidenciaPct > existente.coincidencia) {
        fuentesMap.set(docOrigen.id, {
          tipo: "universidad",
          titulo: docOrigen.nombre,
          autor: "Repositorio UNIFRANZ",
          url: null,
          coincidencia: coincidenciaPct,
          similitud: puntajeFusionado,
          documentoOrigenId: docOrigen.id,
          metodo: señales,
        });
      }
    }
  }

  const fuentes = Array.from(fuentesMap.values())
    .sort((a, b) => b.coincidencia - a.coincidencia)
    .slice(0, 5);

  const coincidenciasFuertes = coincidenciasPorFragmento.filter(
    (c) => c.puntaje >= 0.78,
  );

  const porcentajeGlobal =
    fragmentosDocumento.length === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            (coincidenciasFuertes.length / fragmentosDocumento.length) * 100,
          ),
        );

  return {
    porcentajeGlobal,
    fuentes,
    coincidenciasPorFragmento,
    modelo,
    ajustado,
  };
}
