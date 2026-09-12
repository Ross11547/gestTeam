// Fase 0C.2V — Pruebas automatizadas de autorización para proyectos y equipos.
// Base de datos: gestteam_test (AISLADA). NO ejecutar contra GestTeam principal.
import { config } from "dotenv";
config({ path: ".env.test" });

import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";

import { seedSecurity, verificarBaseAislada } from "./seed.security.test.js";

import { listarProyectosCasoUso } from "../../src/application/casosUso/proyecto/listarProyectos.js";
import { obtenerProyectoCasoUso } from "../../src/application/casosUso/proyecto/obtenerProyectoID.js";
import { crearProyectoCasoUso } from "../../src/application/casosUso/proyecto/crearProyecto.js";
import { actualizarProyectoCasoUso } from "../../src/application/casosUso/proyecto/actualizarProyecto.js";
import { eliminarProyectoCasoUso } from "../../src/application/casosUso/proyecto/eliminarProyecto.js";

import { listarEquiposCasoUso } from "../../src/application/casosUso/equipo/listarEquipos.js";
import { obtenerEquipoCasoUso } from "../../src/application/casosUso/equipo/obtenerEquipoID.js";
import { crearEquipoCasoUso } from "../../src/application/casosUso/equipo/crearEquipo.js";
import { actualizarEquipoCasoUso } from "../../src/application/casosUso/equipo/actualizarEquipo.js";
import { eliminarEquipoCasoUso } from "../../src/application/casosUso/equipo/eliminarEquipo.js";
import { agregarMiembroEquipoCasoUso } from "../../src/application/casosUso/equipo/agregarMiembroEquipo.js";

const prisma = new PrismaClient();

let ids = {};
let usuarios = {};

function assertErrorStatus(error, expectedStatus) {
    assert.equal(error.status, expectedStatus, `Se esperaba status ${expectedStatus}, se obtuvo ${error.status}: ${error.message}`);
}

async function cargarUsuarios() {
    const todos = await prisma.usuario.findMany({ include: { rol: { select: { id: true, nombre: true } } } });
    const map = {};
    for (const u of todos) {
        const key = u.correo.split("@")[0].replace(/\./g, "");
        map[key] = u;
    }
    return map;
}

describe("Fase 0C.2V — Autorización", () => {
    before(async () => {
        await verificarBaseAislada(prisma);
        const seeded = await seedSecurity(prisma);
        ids = seeded.ids;
        usuarios = await cargarUsuarios();
    });

    describe("Proyectos — obtener por ID", () => {
        it("Admin puede consultar Proyecto A", async () => {
            const p = await obtenerProyectoCasoUso(ids.proyectoA, usuarios.admin);
            assert.equal(p.id, ids.proyectoA);
        });

        it("Admin puede consultar Proyecto B", async () => {
            const p = await obtenerProyectoCasoUso(ids.proyectoB, usuarios.admin);
            assert.equal(p.id, ids.proyectoB);
        });

        it("Director A puede consultar Proyecto A (mismo ámbito)", async () => {
            const p = await obtenerProyectoCasoUso(ids.proyectoA, usuarios.directora);
            assert.equal(p.id, ids.proyectoA);
        });

        it("Director A NO puede consultar Proyecto B", async () => {
            await assert.rejects(
                () => obtenerProyectoCasoUso(ids.proyectoB, usuarios.directora),
                (e) => e.status === 403
            );
        });

        it("Director B NO puede consultar Proyecto A", async () => {
            await assert.rejects(
                () => obtenerProyectoCasoUso(ids.proyectoA, usuarios.directorb),
                (e) => e.status === 403
            );
        });

        it("Docente A puede consultar Proyecto A (relación académica)", async () => {
            const p = await obtenerProyectoCasoUso(ids.proyectoA, usuarios.docentea);
            assert.equal(p.id, ids.proyectoA);
        });

        it("Docente A NO puede consultar Proyecto B", async () => {
            await assert.rejects(
                () => obtenerProyectoCasoUso(ids.proyectoB, usuarios.docentea),
                (e) => e.status === 403
            );
        });

        it("Docente B NO puede modificar Proyecto A", async () => {
            await assert.rejects(
                () => actualizarProyectoCasoUso(ids.proyectoA, { titulo: "Hackeado" }, usuarios.docenteb),
                (e) => e.status === 403
            );
        });

        it("Estudiante A puede consultar Proyecto A", async () => {
            const p = await obtenerProyectoCasoUso(ids.proyectoA, usuarios.estudiantea);
            assert.equal(p.id, ids.proyectoA);
        });

        it("Estudiante A NO puede consultar Proyecto B (IDOR)", async () => {
            await assert.rejects(
                () => obtenerProyectoCasoUso(ids.proyectoB, usuarios.estudiantea),
                (e) => e.status === 403
            );
        });

        it("Estudiante B NO puede consultar Proyecto A", async () => {
            await assert.rejects(
                () => obtenerProyectoCasoUso(ids.proyectoA, usuarios.estudianteb),
                (e) => e.status === 403
            );
        });

        it("Estudiante sin proyecto NO puede consultar Proyecto A", async () => {
            await assert.rejects(
                () => obtenerProyectoCasoUso(ids.proyectoA, usuarios.estudiantesin),
                (e) => e.status === 403
            );
        });

        it("Usuario no autenticado NO puede consultar proyecto", async () => {
            await assert.rejects(
                () => obtenerProyectoCasoUso(ids.proyectoA, null),
                (e) => e.status === 401
            );
        });
    });

    describe("Proyectos — listado", () => {
        it("Estudiante A no recibe Proyecto B en listado", async () => {
            const proyectos = await listarProyectosCasoUso(usuarios.estudiantea);
            const idsObtenidos = proyectos.map((p) => p.id);
            assert.ok(idsObtenidos.includes(ids.proyectoA), "Debe incluir Proyecto A");
            assert.ok(!idsObtenidos.includes(ids.proyectoB), "No debe incluir Proyecto B");
        });

        it("Docente A no recibe proyectos ajenos", async () => {
            const proyectos = await listarProyectosCasoUso(usuarios.docentea);
            const idsObtenidos = proyectos.map((p) => p.id);
            assert.ok(idsObtenidos.includes(ids.proyectoA), "Debe incluir Proyecto A");
            assert.ok(!idsObtenidos.includes(ids.proyectoB), "No debe incluir Proyecto B");
        });

        it("Director A no recibe proyectos fuera de su ámbito", async () => {
            const proyectos = await listarProyectosCasoUso(usuarios.directora);
            const idsObtenidos = proyectos.map((p) => p.id);
            assert.ok(idsObtenidos.includes(ids.proyectoA), "Debe incluir Proyecto A");
            assert.ok(!idsObtenidos.includes(ids.proyectoB), "No debe incluir Proyecto B");
        });
    });

    describe("Proyectos — mutaciones", () => {
        it("Usuario no autorizado no puede modificar proyecto ajeno", async () => {
            await assert.rejects(
                () => actualizarProyectoCasoUso(ids.proyectoB, { titulo: "Hackeado" }, usuarios.estudiantea),
                (e) => e.status === 403
            );
        });

        it("Usuario no autorizado no puede eliminar proyecto ajeno", async () => {
            await assert.rejects(
                () => eliminarProyectoCasoUso(ids.proyectoB, usuarios.estudiantea),
                (e) => e.status === 403
            );
        });

        it("Docente A puede actualizar Proyecto A", async () => {
            const actualizado = await actualizarProyectoCasoUso(ids.proyectoA, { descripcion: "Actualizado por docente A" }, usuarios.docentea);
            assert.equal(actualizado.descripcion, "Actualizado por docente A");
        });

        it("Estudiante A NO puede crear proyecto", async () => {
            await assert.rejects(
                () => crearProyectoCasoUso({ titulo: "Proyecto ilegal" }, usuarios.estudiantea),
                (e) => e.status === 403
            );
        });

        it("Docente A puede crear proyecto", async () => {
            const p = await crearProyectoCasoUso({ titulo: "Proyecto docente A" }, usuarios.docentea);
            assert.equal(p.titulo, "Proyecto docente A");
        });
    });

    describe("Equipos — obtener por ID", () => {
        it("Estudiante A puede consultar Equipo A", async () => {
            const e = await obtenerEquipoCasoUso(ids.equipoA, usuarios.estudiantea);
            assert.equal(e.id, ids.equipoA);
        });

        it("Estudiante A NO puede consultar Equipo B (IDOR)", async () => {
            await assert.rejects(
                () => obtenerEquipoCasoUso(ids.equipoB, usuarios.estudiantea),
                (e) => e.status === 403
            );
        });

        it("Estudiante B NO puede consultar Equipo A", async () => {
            await assert.rejects(
                () => obtenerEquipoCasoUso(ids.equipoA, usuarios.estudianteb),
                (e) => e.status === 403
            );
        });

        it("Estudiante sin proyecto NO puede consultar Equipo A", async () => {
            await assert.rejects(
                () => obtenerEquipoCasoUso(ids.equipoA, usuarios.estudiantesin),
                (e) => e.status === 403
            );
        });

        it("Docente A puede consultar Equipo A (relación académica)", async () => {
            const e = await obtenerEquipoCasoUso(ids.equipoA, usuarios.docentea);
            assert.equal(e.id, ids.equipoA);
        });

        it("Docente A NO puede gestionar Equipo B", async () => {
            await assert.rejects(
                () => actualizarEquipoCasoUso(ids.equipoB, { nombre: "Hackeado" }, usuarios.docentea),
                (e) => e.status === 403
            );
        });

        it("Director A no obtiene acceso global a Equipo B", async () => {
            await assert.rejects(
                () => obtenerEquipoCasoUso(ids.equipoB, usuarios.directora),
                (e) => e.status === 403
            );
        });
    });

    describe("Equipos — listado", () => {
        it("Estudiante A no recibe Equipo B en listado", async () => {
            const equipos = await listarEquiposCasoUso({}, usuarios.estudiantea);
            const idsObtenidos = equipos.map((e) => e.id);
            assert.ok(idsObtenidos.includes(ids.equipoA), "Debe incluir Equipo A");
            assert.ok(!idsObtenidos.includes(ids.equipoB), "No debe incluir Equipo B");
        });
    });

    describe("Equipos — mutaciones", () => {
        it("Crear equipo en proyecto ajeno debe rechazarse", async () => {
            await assert.rejects(
                () => crearEquipoCasoUso({ nombre: "Equipo ilegal", proyectoId: ids.proyectoB }, usuarios.estudiantea),
                (e) => e.status === 403
            );
        });

        it("Creador (Estudiante A) puede actualizar Equipo A", async () => {
            const e = await actualizarEquipoCasoUso(ids.equipoA, { nombre: "Equipo A actualizado" }, usuarios.estudiantea);
            assert.equal(e.nombre, "Equipo A actualizado");
        });

        it("Miembro sin privilegio no puede gestionar Equipo A", async () => {
            // Convertimos a estudianteB en miembro de Equipo A sin privilegios.
            await prisma.equipoMiembro.create({ data: { equipoId: ids.equipoA, usuarioId: ids.estudianteB, rolEquipo: "MIEMBRO", activo: true } });
            await assert.rejects(
                () => actualizarEquipoCasoUso(ids.equipoA, { nombre: "Hackeado por miembro" }, usuarios.estudianteb),
                (e) => e.status === 403
            );
        });

        it("Estudiante A no puede eliminar Equipo B", async () => {
            await assert.rejects(
                () => eliminarEquipoCasoUso(ids.equipoB, usuarios.estudiantea),
                (e) => e.status === 403
            );
        });

        it("Estudiante sin privilegio no puede agregar miembros", async () => {
            await assert.rejects(
                () => agregarMiembroEquipoCasoUso(ids.equipoA, { usuarioId: ids.estudianteSin, rolEquipo: "MIEMBRO" }, usuarios.estudiantesin),
                (e) => e.status === 403
            );
        });
    });
});
