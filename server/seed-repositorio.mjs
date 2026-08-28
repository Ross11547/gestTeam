import 'dotenv/config';
import { prisma } from './src/infrastructure/db/prisma.client.js';
import { extraerTextoDeDocumento } from './src/infrastructure/similitud/texto.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_DIR = path.join(__dirname, 'uploads', 'repositorio');

function inferirMimetype(nombre) {
  const ext = path.extname(nombre).toLowerCase();
  switch (ext) {
    case '.pdf':
      return 'application/pdf';
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.txt':
    default:
      return 'text/plain';
  }
}

function esSoportado(nombre) {
  const ext = path.extname(nombre).toLowerCase();
  return ['.txt', '.pdf', '.docx'].includes(ext);
}

async function main() {
  if (!fs.existsSync(REPO_DIR)) {
    console.error('No existe el directorio:', REPO_DIR);
    process.exit(1);
  }

  const entradas = fs.readdirSync(REPO_DIR).filter((f) => {
    const full = path.join(REPO_DIR, f);
    return fs.statSync(full).isFile() && esSoportado(f);
  });

  console.log(`Se encontraron ${entradas.length} documentos soportados.`);

  for (const nombre of entradas) {
    const ruta = path.join(REPO_DIR, nombre).replace(/\\/g, '/');
    const mimetype = inferirMimetype(nombre);
    const tamano = fs.statSync(ruta).size;

    let contenido;
    try {
      contenido = await extraerTextoDeDocumento(ruta, mimetype, nombre);
    } catch (err) {
      console.error(`  ⚠️ No se pudo extraer texto de ${nombre}: ${err.message}`);
      continue;
    }

    const contenidoLimpio = String(contenido || '').trim();
    if (!contenidoLimpio) {
      console.error(`  ⚠️ ${nombre} quedó sin texto extraído, se omite.`);
      continue;
    }

    const existente = await prisma.documento.findFirst({
      where: { nombre, esRepositorioUnifranz: true },
    });

    if (existente) {
      await prisma.documento.update({
        where: { id: existente.id },
        data: {
          contenidoTexto: contenidoLimpio,
          tamano,
          ruta,
          mimetype,
        },
      });
      console.log(`Actualizado: ${nombre} (id: ${existente.id})`);
    } else {
      const creado = await prisma.documento.create({
        data: {
          nombre,
          ruta,
          mimetype,
          tamano,
          tipo: 'OTRO',
          contenidoTexto: contenidoLimpio,
          esRepositorioUnifranz: true,
        },
      });
      console.log(`Creado: ${nombre} (id: ${creado.id})`);
    }
  }

  const total = await prisma.documento.count({
    where: { esRepositorioUnifranz: true },
  });
  console.log(`\nTotal documentos en repositorio UNIFRANZ: ${total}`);
}

main()
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
