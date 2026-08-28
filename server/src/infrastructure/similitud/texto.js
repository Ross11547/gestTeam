import * as fs from "fs";
import * as path from "path";
import * as pdfParseModule from "pdf-parse";
import * as mammothModule from "mammoth";

import { crearError } from "../../dominio/comun/helpersComunes.js";

const PDFParseClass =
  pdfParseModule.PDFParse || pdfParseModule.default || pdfParseModule;
const mammoth =
  mammothModule.extractRawText || mammothModule.default || mammothModule;

export async function extraerTextoDeDocumento(
  rutaAbsoluta,
  mimetype,
  nombreArchivo,
) {
  const ext = path.extname(nombreArchivo || "").toLowerCase();

  if (mimetype === "text/plain" || ext === ".txt") {
    const contenido = fs.readFileSync(rutaAbsoluta, "utf8");
    return contenido.toString();
  }

  if (mimetype === "application/pdf" || ext === ".pdf") {
    const buffer = fs.readFileSync(rutaAbsoluta);
    const data = new Uint8Array(buffer);
    const parser = new PDFParseClass(data);
    try {
      await parser.load();
      const resultado = await parser.getText();
      return resultado?.text || "";
    } finally {
      try {
        parser.destroy();
      } catch {
        // ignorar errores de limpieza
      }
    }
  }

  if (
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === ".docx"
  ) {
    const buffer = fs.readFileSync(rutaAbsoluta);
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }

  throw crearError("Formato no soportado para extracción de texto.", 400);
}

export function contarPalabras(texto) {
  if (!texto) return 0;
  return texto
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0).length;
}

export function dividirEnFragmentos(texto, tamano = 250) {
  const palabras = texto.split(/\s+/);
  const fragmentos = [];
  let inicioPalabra = 0;

  while (inicioPalabra < palabras.length) {
    const chunk = palabras.slice(inicioPalabra, inicioPalabra + tamano);
    const textoFragmento = chunk.join(" ");
    const inicioChar = texto.indexOf(
      chunk[0],
      fragmentos.length ? fragmentos[fragmentos.length - 1].fin : 0,
    );
    const finChar = inicioChar + textoFragmento.length;

    fragmentos.push({
      texto: textoFragmento,
      inicio: inicioChar >= 0 ? inicioChar : 0,
      fin: finChar >= 0 ? finChar : textoFragmento.length,
    });

    inicioPalabra += Math.floor(tamano * 0.7);
  }

  return fragmentos;
}
