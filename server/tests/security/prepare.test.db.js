// Prepara la base de datos aislada para Fase 0C.2V.
// Uso: node tests/security/prepare.test.db.js
import { config } from "dotenv";
config({ path: ".env.test", override: true });

import { PrismaClient } from "@prisma/client";
import { spawnSync } from "child_process";
import { seedSecurity } from "./seed.security.test.js";

const DATABASE_URL = process.env.DATABASE_URL || "";
const nombreBaseDatos = (() => {
    try {
        return new URL(DATABASE_URL).pathname.replace(/^\//, "");
    } catch {
        return "";
    }
})();

if (nombreBaseDatos !== "gestteam_test") {
    throw new Error("DATABASE_URL no apunta a gestteam_test. Abortado por seguridad.");
}

function urlBaseAdmin(urlOriginal, baseAdmin = "postgres") {
    return urlOriginal.replace(/\/gestteam_test(\?|$)/, `/${baseAdmin}$1`);
}

async function crearBaseSiNoExiste() {
    const urlAdmin = urlBaseAdmin(DATABASE_URL);
    const prismaAdmin = new PrismaClient({ datasources: { db: { url: urlAdmin } } });
    try {
        await prismaAdmin.$connect();
        const existe = await prismaAdmin.$queryRaw`
            SELECT 1 FROM pg_database WHERE datname = 'gestteam_test'
        `;
        if (existe.length === 0) {
            await prismaAdmin.$executeRawUnsafe(`CREATE DATABASE "gestteam_test";`);
            console.log("Base de datos gestteam_test creada.");
        } else {
            console.log("Base de datos gestteam_test ya existe.");
        }
    } finally {
        await prismaAdmin.$disconnect();
    }
}

async function aplicarMigraciones() {
    console.log("Aplicando migraciones con prisma migrate deploy...");
    const result = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], {
        cwd: process.cwd(),
        env: { ...process.env, DATABASE_URL },
        stdio: "inherit",
    });
    if (result.status !== 0) {
        throw new Error("prisma migrate deploy falló");
    }
}

async function main() {
    console.log("=== Preparación BD aislada Fase 0C.2V ===");
    console.log("DATABASE_URL objetivo: [oculto, base gestteam_test]");

    try {
        await crearBaseSiNoExiste();
        await aplicarMigraciones();

        const resultado = await seedSecurity();
        console.log("Seed de seguridad completado.");
        console.log("IDs generados:", JSON.stringify(resultado.ids, null, 2));
    } catch (e) {
        console.error("Error preparando BD de pruebas:", e);
        process.exitCode = 1;
    }
}

main()
    .catch((e) => {
        console.error("Error fatal:", e);
        process.exitCode = 1;
    });
