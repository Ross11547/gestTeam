// Fase 0C.3E-4 — Tests REST de exposición controlada del nuevo modelo.
// Ejecutar exclusivamente sobre gestteam_test.
import { config } from "dotenv";
config({ path: ".env.test", override: true });

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../index.js";
import { PrismaClient } from "@prisma/client";
import { seedFase0C3E1 } from "../prisma/seed.fase0c3e1.js";

const prisma = new PrismaClient();
const PASSWORD = "TestPass0C3E1!";

let ids = {};
let tokens = {};

async function login(correo) {
    const res = await request(app).post("/api/login").send({ correo, password: PASSWORD });
    assert.equal(res.status, 200, `Login fallido para ${correo}: ${JSON.stringify(res.body)}`);
    return res.body.token;
}

describe("Fase 0C.3E-4 — REST exposición controlada", () => {
    before(async () => {
        await seedFase0C3E1();

        const proyectoX = await prisma.proyecto.findFirst({ where: { titulo: "Proyecto X - Continuidad" } });
        const proyectoY = await prisma.proyecto.findFirst({ where: { titulo: "Proyecto Y - Colaborativo" } });
        const proyectoZ = await prisma.proyecto.findFirst({ where: { titulo: "Proyecto Z - Inconcluso" } });
        const periodo2026_1 = await prisma.periodoAcademico.findFirst({ where: { nombre: "2026-1" } });
        const periodo2026_2 = await prisma.periodoAcademico.findFirst({ where: { nombre: "2026-2" } });
        const ppX_2026_1 = await prisma.proyectoPeriodo.findFirst({ where: { proyectoId: proyectoX.id, periodoId: periodo2026_1.id } });
        const ppX_2026_2 = await prisma.proyectoPeriodo.findFirst({ where: { proyectoId: proyectoX.id, periodoId: periodo2026_2.id } });
        const ppY_2026_2 = await prisma.proyectoPeriodo.findFirst({ where: { proyectoId: proyectoY.id, periodoId: periodo2026_2.id } });
        const pmY_Sistemas = await prisma.proyectoMateria.findFirst({ where: { proyectoPeriodoId: ppY_2026_2.id, materia: { codigo: "PI2" } } });
        const pmY_Psicologia = await prisma.proyectoMateria.findFirst({ where: { proyectoPeriodoId: ppY_2026_2.id, materia: { codigo: "PSI" } } });
        const hitoY_Sistemas_H1 = await prisma.hitoProyecto.findFirst({ where: { proyectoPeriodoId: ppY_2026_2.id, hitoPeriodo: { orden: 1 } } });
        const hitoY_Sistemas_H2 = await prisma.hitoProyecto.findFirst({ where: { proyectoPeriodoId: ppY_2026_2.id, hitoPeriodo: { orden: 2 } } });
        const hitoX_2026_2_H1 = await prisma.hitoProyecto.findFirst({ where: { proyectoPeriodoId: ppX_2026_2.id, hitoPeriodo: { orden: 1 } } });
        const materiaPI2 = await prisma.materia.findFirst({ where: { codigo: "PI2" } });
        const clasePI2_2026_2 = await prisma.claseMateria.findFirst({ where: { periodoId: periodo2026_2.id, materiaId: materiaPI2.id } });

        // Evaluación de referencia en contexto Sistemas del Proyecto Y
        const evalSistemas = await prisma.evaluacionHito.create({
            data: {
                hitoProyectoId: hitoY_Sistemas_H2.id,
                proyectoMateriaId: pmY_Sistemas.id,
                evaluadorId: (await prisma.usuario.findFirst({ where: { correo: "docente.integrador.0c3e1@unifranz.edu.bo" } })).id,
                tipoEvaluador: "DOCENTE",
                puntaje: 80,
            },
        });

        // Proyecto CERRADO para pruebas de rechazo
        const proyectoCerrado = await prisma.proyecto.create({
            data: { titulo: "Proyecto Cerrado Test", descripcion: "C", tipoGrupo: "GRUPAL", estado: "CERRADO", creadoPorId: (await prisma.usuario.findFirst({ where: { correo: "admin.0c3e1@unifranz.edu.bo" } })).id },
        });

        ids = {
            proyectoX: proyectoX.id,
            proyectoY: proyectoY.id,
            proyectoZ: proyectoZ.id,
            proyectoCerrado: proyectoCerrado.id,
            periodo2026_2: periodo2026_2.id,
            ppX_2026_1: ppX_2026_1.id,
            ppX_2026_2: ppX_2026_2.id,
            ppY_2026_2: ppY_2026_2.id,
            pmY_Sistemas: pmY_Sistemas.id,
            pmY_Psicologia: pmY_Psicologia.id,
            hitoY_Sistemas_H1: hitoY_Sistemas_H1.id,
            hitoX_2026_2_H1: hitoX_2026_2_H1.id,
            evalSistemas: evalSistemas.id,
            materiaPI2: materiaPI2.id,
            clasePI2_2026_2: clasePI2_2026_2.id,
        };

        tokens.admin = await login("admin.0c3e1@unifranz.edu.bo");
        tokens.docenteIntegrador = await login("docente.integrador.0c3e1@unifranz.edu.bo");
        tokens.docentePsicologia = await login("docente.psicologia.0c3e1@unifranz.edu.bo");
        tokens.estudianteA = await login("estudiante.a.0c3e1@unifranz.edu.bo");
        tokens.estudianteC = await login("estudiante.c.0c3e1@unifranz.edu.bo");
    });

    after(async () => {
        await prisma.$disconnect();
    });

    function auth(token) {
        return { Authorization: `Bearer ${token}` };
    }

    describe("ProyectoPeriodo", () => {
        it("1. Estudiante solo lista ProyectoPeriodo permitidos", async () => {
            const res = await request(app).get("/api/proyectoPeriodo").set(auth(tokens.estudianteA));
            assert.equal(res.status, 200);
            const idsObtenidos = res.body.data.map((p) => p.id);
            assert.ok(idsObtenidos.includes(ids.ppX_2026_1), "debe ver ppX_2026_1");
            assert.ok(idsObtenidos.includes(ids.ppY_2026_2), "debe ver ppY_2026_2");
            assert.ok(!idsObtenidos.includes(ids.ppX_2026_2), "no debe ver ppX_2026_2");
        });

        it("16. No existe POST público de ProyectoPeriodo", async () => {
            const res = await request(app).post("/api/proyectoPeriodo").set(auth(tokens.admin)).send({ proyectoId: ids.proyectoX, periodoId: ids.ppX_2026_1 });
            assert.equal(res.status, 404);
        });
    });

    describe("ProyectoMateria", () => {
        it("2. Docente solo accede a contextos correspondientes", async () => {
            const res = await request(app).get(`/api/proyectoMateria/${ids.pmY_Psicologia}`).set(auth(tokens.docenteIntegrador));
            assert.equal(res.status, 403, "Docente integrador no debe ver contexto Psicología");
        });

        it("3. ProyectoMateria de otro contexto no expone equipos/entregas privadas", async () => {
            const res = await request(app).get(`/api/proyectoMateria/${ids.pmY_Sistemas}`).set(auth(tokens.docenteIntegrador));
            assert.equal(res.status, 200);
            assert.ok(!("equipos" in res.body.data), "No debe incluir array equipos");
            assert.ok(!("entregas" in res.body.data), "No debe incluir entregas");
            assert.equal(typeof res.body.data.equiposCount, "number");
        });
    });

    describe("HitoProyecto", () => {
        it("4. GET HitoProyecto ajeno → 403", async () => {
            const res = await request(app).get(`/api/hitoProyecto/${ids.hitoX_2026_2_H1}`).set(auth(tokens.estudianteA));
            assert.equal(res.status, 403);
        });

        it("14. No existe POST público de HitoProyecto", async () => {
            const res = await request(app).post("/api/hitoProyecto").set(auth(tokens.admin)).send({ proyectoPeriodoId: ids.ppX_2026_1, hitoPeriodoId: 1 });
            assert.equal(res.status, 404);
        });

        it("15. No existe avance público nuevo de HitoProyecto", async () => {
            const res = await request(app).put(`/api/hitoProyecto/${ids.hitoY_Sistemas_H1}/avanzar`).set(auth(tokens.admin)).send({ estado: "FINALIZADO" });
            assert.equal(res.status, 404);
        });
    });

    describe("EvaluacionHito", () => {
        it("5. EvaluacionHito de otro contexto → 403", async () => {
            const res = await request(app).get(`/api/evaluacionHito/${ids.evalSistemas}`).set(auth(tokens.estudianteC));
            assert.equal(res.status, 403);
        });

        it("6. Docente correcto crea EvaluacionHito → éxito", async () => {
            const res = await request(app).post("/api/evaluacionHito").set(auth(tokens.docenteIntegrador)).send({
                hitoProyectoId: ids.hitoY_Sistemas_H1,
                proyectoMateriaId: ids.pmY_Sistemas,
                puntaje: 75,
                comentario: "Bien",
            });
            assert.equal(res.status, 201, JSON.stringify(res.body));
            assert.equal(res.body.data.puntaje, 75);
        });

        it("7. Docente de otro contexto → 403", async () => {
            const res = await request(app).post("/api/evaluacionHito").set(auth(tokens.docentePsicologia)).send({
                hitoProyectoId: ids.hitoY_Sistemas_H1,
                proyectoMateriaId: ids.pmY_Sistemas,
                puntaje: 60,
            });
            assert.equal(res.status, 403);
        });

        it("8. Admin crea EvaluacionHito → 403", async () => {
            const res = await request(app).post("/api/evaluacionHito").set(auth(tokens.admin)).send({
                hitoProyectoId: ids.hitoY_Sistemas_H1,
                proyectoMateriaId: ids.pmY_Sistemas,
                puntaje: 90,
            });
            assert.equal(res.status, 403);
        });

        it("9. Estudiante crea EvaluacionHito → 403", async () => {
            const res = await request(app).post("/api/evaluacionHito").set(auth(tokens.estudianteA)).send({
                hitoProyectoId: ids.hitoY_Sistemas_H1,
                proyectoMateriaId: ids.pmY_Sistemas,
                puntaje: 95,
            });
            assert.equal(res.status, 403);
        });
    });

    describe("SolicitudContinuacion", () => {
        it("10. Estudiante NO miembro puede solicitar Proyecto INCONCLUSO válido", async () => {
            const res = await request(app).post("/api/solicitudContinuacion").set(auth(tokens.estudianteA)).send({
                proyectoId: ids.proyectoZ,
                periodoId: ids.periodo2026_2,
                materiaId: ids.materiaPI2,
                claseId: ids.clasePI2_2026_2,
                motivo: "Quiero retomar este proyecto",
            });
            assert.equal(res.status, 201, JSON.stringify(res.body));
            assert.equal(res.body.data.estado, "PENDIENTE");
        });

        it("11. Solicitar continuación de Proyecto CERRADO → rechazo", async () => {
            const res = await request(app).post("/api/solicitudContinuacion").set(auth(tokens.estudianteA)).send({
                proyectoId: ids.proyectoCerrado,
                periodoId: ids.periodo2026_2,
                materiaId: ids.materiaPI2,
                claseId: ids.clasePI2_2026_2,
            });
            assert.equal(res.status, 403);
        });

        it("12. Solicitar continuación de Proyecto ACTIVO → rechazo", async () => {
            const res = await request(app).post("/api/solicitudContinuacion").set(auth(tokens.estudianteA)).send({
                proyectoId: ids.proyectoX,
                periodoId: ids.periodo2026_2,
                materiaId: ids.materiaPI2,
                claseId: ids.clasePI2_2026_2,
            });
            assert.equal(res.status, 403);
        });

        it("13. Solicitud no crea automáticamente ProyectoPeriodo ni Equipo", async () => {
            const ppAntes = await prisma.proyectoPeriodo.count();
            const eqAntes = await prisma.equipo.count();

            const res = await request(app).post("/api/solicitudContinuacion").set(auth(tokens.estudianteA)).send({
                proyectoId: ids.proyectoZ,
                periodoId: ids.periodo2026_2,
                materiaId: ids.materiaPI2,
                claseId: ids.clasePI2_2026_2,
                motivo: "Segunda solicitud",
            });
            assert.equal(res.status, 201);

            const ppDespues = await prisma.proyectoPeriodo.count();
            const eqDespues = await prisma.equipo.count();
            assert.equal(ppAntes, ppDespues);
            assert.equal(eqAntes, eqDespues);
        });
    });

    describe("Legacy críticos", () => {
        it("17. Legacy críticos siguen devolviendo 410", async () => {
            const r1 = await request(app).post("/api/hito").set(auth(tokens.admin)).send({});
            assert.equal(r1.status, 410);
            const r2 = await request(app).post(`/api/hito/base/${ids.proyectoX}`).set(auth(tokens.admin)).send({});
            assert.equal(r2.status, 410);
            const r3 = await request(app).post("/api/evaluacion").set(auth(tokens.docenteIntegrador)).send({ proyectoId: ids.proyectoX, puntaje: 80 });
            assert.equal(r3.status, 410);
        });
    });
});
