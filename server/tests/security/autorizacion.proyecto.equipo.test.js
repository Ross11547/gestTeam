// Tests de integración para Fase 0C.2V — Autorización de Proyectos y Equipos.
// Runner propio (sin Jest) usando node:assert y supertest.
import { config } from "dotenv";
config({ path: ".env.test", override: true });

import request from "supertest";
import assert from "node:assert";
import { app } from "../../index.js";
import { prisma } from "../../src/infrastructure/db/prisma.client.js";
import { seedSecurity, limpiar } from "./seed.security.test.js";

let ids = {};
const tokens = {};
let fallos = 0;
let pasados = 0;

async function loginComo(correo) {
    const res = await request(app).post("/api/login").send({ correo, password: "TestPass123!" });
    if (res.status !== 200) {
        throw new Error(`Login fallido para ${correo}: ${res.status} ${JSON.stringify(res.body)}`);
    }
    return res.body.token;
}

async function run(name, fn) {
    try {
        await fn();
        pasados++;
        console.log(`  ✓ ${name}`);
    } catch (e) {
        fallos++;
        console.error(`  ✗ ${name}`);
        console.error(`    ${e.message}`);
    }
}

function assertStatus(resp, esperado) {
    assert.strictEqual(
        resp.status,
        esperado,
        `Esperado ${esperado}, obtenido ${resp.status}. Body: ${JSON.stringify(resp.body)}`
    );
}

async function setup() {
    const seeded = await seedSecurity();
    ids = seeded.ids;

    tokens.admin = await loginComo("admin@unifranz.edu.bo");
    tokens.directorA = await loginComo("director.a@unifranz.edu.bo");
    tokens.directorB = await loginComo("director.b@unifranz.edu.bo");
    tokens.docenteA = await loginComo("docente.a@unifranz.edu.bo");
    tokens.docenteB = await loginComo("docente.b@unifranz.edu.bo");
    tokens.estudianteA = await loginComo("estudiante.a@unifranz.edu.bo");
    tokens.estudianteB = await loginComo("estudiante.b@unifranz.edu.bo");
    tokens.estudianteSin = await loginComo("estudiante.sin@unifranz.edu.bo");
}

async function teardown() {
    await limpiar();
    await prisma.$disconnect();
}

async function main() {
    console.log("=== Fase 0C.2V — Tests de autorización ===");
    await setup();

    console.log("\nProyectos — GET /api/proyecto/:id");
    const casosProyectoGet = [
        ["Admin puede ver Proyecto A", "admin", "proyectoA", 200],
        ["Admin puede ver Proyecto B", "admin", "proyectoB", 200],
        ["Director A puede ver Proyecto A", "directorA", "proyectoA", 200],
        ["Director A NO puede ver Proyecto B", "directorA", "proyectoB", 403],
        ["Director B NO puede ver Proyecto A", "directorB", "proyectoA", 403],
        ["Docente A puede ver Proyecto A", "docenteA", "proyectoA", 200],
        ["Docente A NO puede ver Proyecto B", "docenteA", "proyectoB", 403],
        ["Docente B NO puede ver Proyecto A", "docenteB", "proyectoA", 403],
        ["Estudiante A puede ver Proyecto A", "estudianteA", "proyectoA", 200],
        ["Estudiante A NO puede ver Proyecto B (IDOR)", "estudianteA", "proyectoB", 403],
        ["Estudiante B NO puede ver Proyecto A", "estudianteB", "proyectoA", 403],
        ["Estudiante sin proyecto NO puede ver Proyecto A", "estudianteSin", "proyectoA", 403],
        ["Estudiante sin proyecto NO puede ver Proyecto B", "estudianteSin", "proyectoB", 403],
    ];
    for (const [nombre, tokenKey, proyectoKey, esperado] of casosProyectoGet) {
        await run(nombre, async () => {
            const res = await request(app)
                .get(`/api/proyecto/${ids[proyectoKey]}`)
                .set("Authorization", `Bearer ${tokens[tokenKey]}`);
            assertStatus(res, esperado);
        });
    }
    await run("Sin token → 401", async () => {
        const res = await request(app).get(`/api/proyecto/${ids.proyectoA}`);
        assertStatus(res, 401);
    });

    console.log("\nProyectos — GET /api/proyecto (listado)");
    const casosProyectoList = [
        ["Estudiante A solo ve Proyecto A", "estudianteA", ["Proyecto A"]],
        ["Estudiante B solo ve Proyecto B", "estudianteB", ["Proyecto B"]],
        ["Estudiante sin proyecto ve vacío", "estudianteSin", []],
        ["Docente A solo ve Proyecto A", "docenteA", ["Proyecto A"]],
        ["Docente B solo ve Proyecto B", "docenteB", ["Proyecto B"]],
        ["Director A solo ve Proyecto A", "directorA", ["Proyecto A"]],
        ["Director B solo ve Proyecto B", "directorB", ["Proyecto B"]],
        ["Admin ve ambos proyectos", "admin", ["Proyecto A", "Proyecto B"]],
    ];
    for (const [nombre, tokenKey, esperados] of casosProyectoList) {
        await run(nombre, async () => {
            const res = await request(app)
                .get("/api/proyecto")
                .set("Authorization", `Bearer ${tokens[tokenKey]}`);
            assertStatus(res, 200);
            const titulos = res.body.data.map((p) => p.titulo).sort();
            assert.deepStrictEqual(titulos, esperados.sort());
        });
    }

    console.log("\nProyectos — mutaciones");
    await run("Estudiante B NO puede modificar Proyecto A", async () => {
        const res = await request(app)
            .put(`/api/proyecto/${ids.proyectoA}`)
            .set("Authorization", `Bearer ${tokens.estudianteB}`)
            .send({ titulo: "Hackeado", descripcion: "No debería permitirse" });
        assert([403, 404].includes(res.status), `Esperado 403/404, obtenido ${res.status}`);
    });
    await run("Estudiante B NO puede eliminar Proyecto A", async () => {
        const res = await request(app)
            .delete(`/api/proyecto/${ids.proyectoA}`)
            .set("Authorization", `Bearer ${tokens.estudianteB}`);
        assert([403, 404].includes(res.status), `Esperado 403/404, obtenido ${res.status}`);
    });
    await run("OWNER (Estudiante A) puede modificar Proyecto A", async () => {
        const res = await request(app)
            .put(`/api/proyecto/${ids.proyectoA}`)
            .set("Authorization", `Bearer ${tokens.estudianteA}`)
            .send({ titulo: "Proyecto A actualizado", descripcion: "Actualizado por OWNER" });
        assertStatus(res, 200);
    });

    console.log("\nEquipos — GET /api/equipo/:id");
    const casosEquipoGet = [
        ["Admin puede ver Equipo A", "admin", "equipoA", 200],
        ["Admin puede ver Equipo B", "admin", "equipoB", 200],
        ["Estudiante A puede ver Equipo A", "estudianteA", "equipoA", 200],
        ["Estudiante A NO puede ver Equipo B", "estudianteA", "equipoB", 403],
        ["Estudiante B NO puede ver Equipo A", "estudianteB", "equipoA", 403],
        ["Estudiante B puede ver Equipo B", "estudianteB", "equipoB", 200],
        ["Estudiante sin proyecto NO puede ver Equipo A", "estudianteSin", "equipoA", 403],
        ["Docente A puede ver Equipo A", "docenteA", "equipoA", 200],
        ["Docente A NO puede ver Equipo B", "docenteA", "equipoB", 403],
        ["Director A puede ver Equipo A", "directorA", "equipoA", 200],
        ["Director A NO puede ver Equipo B", "directorA", "equipoB", 403],
    ];
    for (const [nombre, tokenKey, equipoKey, esperado] of casosEquipoGet) {
        await run(nombre, async () => {
            const res = await request(app)
                .get(`/api/equipo/${ids[equipoKey]}`)
                .set("Authorization", `Bearer ${tokens[tokenKey]}`);
            assertStatus(res, esperado);
        });
    }

    console.log("\nEquipos — GET /api/equipo (listado)");
    const casosEquipoList = [
        ["Estudiante A solo ve Equipo A", "estudianteA", ["Equipo A"]],
        ["Estudiante B solo ve Equipo B", "estudianteB", ["Equipo B"]],
        ["Estudiante sin proyecto ve vacío", "estudianteSin", []],
        ["Docente A solo ve Equipo A", "docenteA", ["Equipo A"]],
        ["Director A solo ve Equipo A", "directorA", ["Equipo A"]],
        ["Admin ve ambos equipos", "admin", ["Equipo A", "Equipo B"]],
    ];
    for (const [nombre, tokenKey, esperados] of casosEquipoList) {
        await run(nombre, async () => {
            const res = await request(app)
                .get("/api/equipo")
                .set("Authorization", `Bearer ${tokens[tokenKey]}`);
            assertStatus(res, 200);
            const nombres = res.body.data.map((e) => e.nombre).sort();
            assert.deepStrictEqual(nombres, esperados.sort());
        });
    }

    console.log("\nEquipos — mutaciones");
    await run("Estudiante B NO puede actualizar Equipo A", async () => {
        const res = await request(app)
            .put(`/api/equipo/${ids.equipoA}`)
            .set("Authorization", `Bearer ${tokens.estudianteB}`)
            .send({ nombre: "Equipo A hackeado" });
        assert([403, 404].includes(res.status), `Esperado 403/404, obtenido ${res.status}`);
    });
    await run("Estudiante B NO puede eliminar Equipo A", async () => {
        const res = await request(app)
            .delete(`/api/equipo/${ids.equipoA}`)
            .set("Authorization", `Bearer ${tokens.estudianteB}`);
        assert([403, 404].includes(res.status), `Esperado 403/404, obtenido ${res.status}`);
    });
    await run("Creador (Estudiante A) puede actualizar Equipo A", async () => {
        const res = await request(app)
            .put(`/api/equipo/${ids.equipoA}`)
            .set("Authorization", `Bearer ${tokens.estudianteA}`)
            .send({ nombre: "Equipo A actualizado" });
        assertStatus(res, 200);
    });
    await run("NO se puede crear equipo en proyecto ajeno", async () => {
        const res = await request(app)
            .post("/api/equipo")
            .set("Authorization", `Bearer ${tokens.estudianteB}`)
            .send({
                proyectoId: ids.proyectoA,
                nombre: "Equipo intruso",
                tipoGrupo: "GRUPAL",
                materiaId: ids.materiaA,
                periodoId: ids.periodo,
                claseId: ids.claseA,
            });
        assertStatus(res, 403);
    });

    console.log("\nEquipos — miembros");
    await run("Estudiante A puede listar miembros de Equipo A", async () => {
        const res = await request(app)
            .get(`/api/equipo/${ids.equipoA}/miembro`)
            .set("Authorization", `Bearer ${tokens.estudianteA}`);
        assertStatus(res, 200);
    });
    await run("Estudiante B NO puede listar miembros de Equipo A", async () => {
        const res = await request(app)
            .get(`/api/equipo/${ids.equipoA}/miembro`)
            .set("Authorization", `Bearer ${tokens.estudianteB}`);
        assert([403, 404].includes(res.status), `Esperado 403/404, obtenido ${res.status}`);
    });

    await teardown();

    console.log(`\n=== Resultados: ${pasados} pasados, ${fallos} fallos ===`);
    process.exit(fallos > 0 ? 1 : 0);
}

main().catch((e) => {
    console.error("Error fatal en tests:", e);
    process.exit(1);
});
