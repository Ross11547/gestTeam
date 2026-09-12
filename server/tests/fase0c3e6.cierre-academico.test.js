import { config } from "dotenv";
config({ path: ".env.test", override: true });

import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { app } from "../index.js";
import { seedFase0C3E1 } from "../prisma/seed.fase0c3e1.js";
import { crearProyectoPeriodoCasoUso } from "../src/application/casosUso/proyectoPeriodo/crearProyectoPeriodo.js";
import { vincularProyectoMateriaCasoUso } from "../src/application/casosUso/proyectoMateria/vincularProyectoMateria.js";

const prisma = new PrismaClient();
const PASSWORD = "TestPass0C3E1!";

let ids = {};
const tokens = {};

async function login(correo) {
    const respuesta = await request(app).post("/api/login").send({ correo, password: PASSWORD });
    assert.equal(respuesta.status, 200, `Login fallido: ${JSON.stringify(respuesta.body)}`);
    return respuesta.body.token;
}

function auth(token) {
    return { Authorization: `Bearer ${token}` };
}

async function crearContexto(proyectoId, periodoId, materiaId, claseId) {
    const proyectoPeriodo = await crearProyectoPeriodoCasoUso({ proyectoId, periodoId });
    const proyectoMateria = await vincularProyectoMateriaCasoUso({
        proyectoPeriodoId: proyectoPeriodo.id,
        materiaId,
        claseId,
    });
    return { proyectoPeriodo, proyectoMateria };
}

async function registrarEvaluacionH5(proyectoPeriodoId, proyectoMateriaId, evaluadorId) {
    const hitoFinal = await prisma.hitoProyecto.findFirst({
        where: { proyectoPeriodoId, hitoPeriodo: { orden: 5 } },
    });
    return prisma.evaluacionHito.create({
        data: {
            hitoProyectoId: hitoFinal.id,
            proyectoMateriaId,
            evaluadorId,
            tipoEvaluador: "DOCENTE",
            puntaje: 1,
            comentario: "Evaluación final registrada",
        },
    });
}

describe("Fase 0C.3E-6 - Cierre académico", () => {
    before(async () => {
        await seedFase0C3E1();

        const [
            proyectoSimple,
            proyectoColaborativo,
            periodoAnterior,
            periodoDestino,
            materiaDestino,
            claseDestino,
            estudianteA,
            directorDestino,
            docenteDestino,
            docenteOtraClase,
            admin,
            rolDirector,
            rolDocente,
            institucion,
        ] = await Promise.all([
            prisma.proyecto.findFirst({ where: { titulo: "Proyecto X - Continuidad" } }),
            prisma.proyecto.findFirst({ where: { titulo: "Proyecto Y - Colaborativo" } }),
            prisma.periodoAcademico.findFirst({ where: { nombre: "2026-1" } }),
            prisma.periodoAcademico.findFirst({ where: { nombre: "2026-2" } }),
            prisma.materia.findFirst({ where: { codigo: "PI2" } }),
            prisma.claseMateria.findFirst({ where: { materia: { codigo: "PI2" }, periodo: { nombre: "2026-2" } } }),
            prisma.usuario.findFirst({ where: { correo: "estudiante.a.0c3e1@unifranz.edu.bo" } }),
            prisma.usuario.findFirst({ where: { correo: "director.sistemas.0c3e1@unifranz.edu.bo" } }),
            prisma.usuario.findFirst({ where: { correo: "docente.integrador.0c3e1@unifranz.edu.bo" } }),
            prisma.usuario.findFirst({ where: { correo: "docente.psicologia.0c3e1@unifranz.edu.bo" } }),
            prisma.usuario.findFirst({ where: { correo: "admin.0c3e1@unifranz.edu.bo" } }),
            prisma.rol.findFirst({ where: { nombre: "Director" } }),
            prisma.rol.findFirst({ where: { nombre: "Docente" } }),
            prisma.institucion.findFirst({ where: { slug: "univ-test-0c3e1" } }),
        ]);

        const ppSimple = await prisma.proyectoPeriodo.findFirst({
            where: { proyectoId: proyectoSimple.id, periodoId: periodoDestino.id },
        });
        const pmSimple = await prisma.proyectoMateria.findFirst({ where: { proyectoPeriodoId: ppSimple.id } });
        const ppColaborativo = await prisma.proyectoPeriodo.findFirst({
            where: { proyectoId: proyectoColaborativo.id, periodoId: periodoDestino.id },
        });
        const pmColaborativos = await prisma.proyectoMateria.findMany({
            where: { proyectoPeriodoId: ppColaborativo.id },
            include: { clase: true },
        });

        const proyectoInconcluso = await prisma.proyecto.create({
            data: { titulo: "Proyecto a declarar inconcluso", estado: "ACTIVO", creadoPorId: estudianteA.id },
        });
        const contextoInconcluso = await crearContexto(
            proyectoInconcluso.id,
            periodoDestino.id,
            materiaDestino.id,
            claseDestino.id
        );

        const facultadExterna = await prisma.facultad.create({
            data: { institucionId: institucion.id, nombre: "Facultad interdisciplinaria E6" },
        });
        const carreraExterna = await prisma.carrera.create({
            data: { idFacultad: facultadExterna.id, nombre: "Carrera interdisciplinaria E6", sigla: "E6X" },
        });
        const materiaExterna = await prisma.materia.create({
            data: { idCarrera: carreraExterna.id, nombre: "Materia externa E6", codigo: "E6X" },
        });
        const hash = await bcrypt.hash(PASSWORD, 10);
        const docenteExterno = await prisma.usuario.create({
            data: {
                nombre: "Docente",
                apellido: "Externo E6",
                telefono: "70000881",
                ci: 2088881,
                correo: "docente.externo.e6@unifranz.edu.bo",
                password: hash,
                idRol: rolDocente.id,
                activo: true,
            },
        });
        const directorExterno = await prisma.usuario.create({
            data: {
                nombre: "Director",
                apellido: "Externo E6",
                telefono: "70000882",
                ci: 2088882,
                correo: "director.externo.e6@unifranz.edu.bo",
                password: hash,
                idRol: rolDirector.id,
                activo: true,
                esDirector: true,
                idFacultad: facultadExterna.id,
                idCarrera: carreraExterna.id,
            },
        });
        const claseExterna = await prisma.claseMateria.create({
            data: {
                periodoId: periodoDestino.id,
                materiaId: materiaExterna.id,
                docenteId: docenteExterno.id,
                paralelo: "E6",
            },
        });

        const proyectoInterdisciplinario = await prisma.proyecto.create({
            data: { titulo: "Proyecto interdisciplinario E6", estado: "ACTIVO", creadoPorId: estudianteA.id },
        });
        const ppInterdisciplinario = await crearProyectoPeriodoCasoUso({
            proyectoId: proyectoInterdisciplinario.id,
            periodoId: periodoDestino.id,
        });
        await vincularProyectoMateriaCasoUso({
            proyectoPeriodoId: ppInterdisciplinario.id,
            materiaId: materiaDestino.id,
            claseId: claseDestino.id,
        });
        await vincularProyectoMateriaCasoUso({
            proyectoPeriodoId: ppInterdisciplinario.id,
            materiaId: materiaExterna.id,
            claseId: claseExterna.id,
        });

        const proyectoSinH5 = await prisma.proyecto.create({
            data: { titulo: "Proyecto sin H5 E6", estado: "ACTIVO", creadoPorId: estudianteA.id },
        });
        const ppSinH5 = await prisma.proyectoPeriodo.create({
            data: { proyectoId: proyectoSinH5.id, periodoId: periodoAnterior.id, estado: "CERRADO_PERIODO", fechaFin: new Date() },
        });
        await prisma.proyectoMateria.create({
            data: {
                proyectoId: proyectoSinH5.id,
                proyectoPeriodoId: ppSinH5.id,
                periodoId: periodoAnterior.id,
                materiaId: (await prisma.materia.findFirst({ where: { codigo: "PI1" } })).id,
                claseId: (await prisma.claseMateria.findFirst({ where: { materia: { codigo: "PI1" } } })).id,
            },
        });

        ids = {
            proyectoSimple: proyectoSimple.id,
            ppSimple: ppSimple.id,
            pmSimple: pmSimple.id,
            proyectoColaborativo: proyectoColaborativo.id,
            ppColaborativo: ppColaborativo.id,
            pmColaborativos,
            proyectoInconcluso: proyectoInconcluso.id,
            ppInconcluso: contextoInconcluso.proyectoPeriodo.id,
            proyectoInterdisciplinario: proyectoInterdisciplinario.id,
            ppInterdisciplinario: ppInterdisciplinario.id,
            proyectoSinH5: proyectoSinH5.id,
            ppSinH5: ppSinH5.id,
            directorDestino: directorDestino.id,
            docenteDestino: docenteDestino.id,
            docenteOtraClase: docenteOtraClase.id,
            admin: admin.id,
            datasetAntes: await prisma.datasetPlagio.count(),
            documentosRepositorioAntes: await prisma.documento.count({ where: { esRepositorioUnifranz: true } }),
        };

        tokens.directorDestino = await login(directorDestino.correo);
        tokens.docenteDestino = await login(docenteDestino.correo);
        tokens.docenteOtraClase = await login(docenteOtraClase.correo);
        tokens.admin = await login(admin.correo);
        tokens.estudiante = await login(estudianteA.correo);
        tokens.directorExterno = await login(directorExterno.correo);
    });

    after(async () => {
        await prisma.$disconnect();
    });

    it("validación informa H5 y evaluación faltante por contexto", async () => {
        const respuesta = await request(app)
            .get(`/api/proyecto/${ids.proyectoSimple}/cierre/validacion`)
            .query({ proyectoPeriodoId: ids.ppSimple })
            .set(auth(tokens.directorDestino));
        assert.equal(respuesta.status, 200, JSON.stringify(respuesta.body));
        assert.equal(respuesta.body.data.contextos.length, 1);
        assert.equal(respuesta.body.data.contextos[0].existeH5, true);
        assert.equal(respuesta.body.data.contextos[0].tieneEvaluacionH5, false);
        assert.equal(respuesta.body.data.puedeCerrar, false);
    });

    it("Admin, Estudiante y docente ajeno no cierran ProyectoPeriodo", async () => {
        for (const token of [tokens.admin, tokens.estudiante, tokens.docenteOtraClase]) {
            const respuesta = await request(app)
                .put(`/api/proyectoPeriodo/${ids.ppSimple}/cerrar`)
                .set(auth(token));
            assert.equal(respuesta.status, 403);
        }
    });

    it("docente real cierra ProyectoPeriodo simple sin modificar Proyecto", async () => {
        const respuesta = await request(app)
            .put(`/api/proyectoPeriodo/${ids.ppSimple}/cerrar`)
            .set(auth(tokens.docenteDestino));
        assert.equal(respuesta.status, 200, JSON.stringify(respuesta.body));
        assert.equal(respuesta.body.data.estado, "CERRADO_PERIODO");
        assert.ok(respuesta.body.data.fechaFin);
        assert.equal(respuesta.body.data.proyecto.estado, "ACTIVO");
    });

    it("cierre definitivo falla mientras falta evaluación H5", async () => {
        const respuesta = await request(app)
            .put(`/api/proyecto/${ids.proyectoSimple}/cerrar-definitivamente`)
            .set(auth(tokens.directorDestino))
            .send({ proyectoPeriodoId: ids.ppSimple });
        assert.equal(respuesta.status, 409);
    });

    it("validación habilita cierre al existir evaluación H5 sin interpretar nota", async () => {
        await registrarEvaluacionH5(ids.ppSimple, ids.pmSimple, ids.docenteDestino);
        const respuesta = await request(app)
            .get(`/api/proyecto/${ids.proyectoSimple}/cierre/validacion`)
            .query({ proyectoPeriodoId: ids.ppSimple })
            .set(auth(tokens.directorDestino));
        assert.equal(respuesta.status, 200);
        assert.equal(respuesta.body.data.contextos[0].tieneEvaluacionH5, true);
        assert.equal(respuesta.body.data.puedeCerrar, true);
    });

    it("Director de carrera cierra definitivamente", async () => {
        const respuesta = await request(app)
            .put(`/api/proyecto/${ids.proyectoSimple}/cerrar-definitivamente`)
            .set(auth(tokens.directorDestino))
            .send({ proyectoPeriodoId: ids.ppSimple });
        assert.equal(respuesta.status, 200, JSON.stringify(respuesta.body));
        assert.equal(respuesta.body.data.estado, "CERRADO");
    });

    it("cierre definitivo es irreversible", async () => {
        const generico = await request(app)
            .put(`/api/proyecto/${ids.proyectoSimple}`)
            .set(auth(tokens.directorDestino))
            .send({ estado: "ACTIVO" });
        assert.equal(generico.status, 403);

        const explicito = await request(app)
            .put(`/api/proyecto/${ids.proyectoSimple}/cerrar-definitivamente`)
            .set(auth(tokens.directorDestino))
            .send({ proyectoPeriodoId: ids.ppSimple });
        assert.equal(explicito.status, 409);
    });

    it("creación genérica rechaza CERRADO e INCONCLUSO", async () => {
        for (const estado of ["CERRADO", "INCONCLUSO"]) {
            const respuesta = await request(app)
                .post("/api/proyecto")
                .set(auth(tokens.directorDestino))
                .send({ titulo: `Creación inválida ${estado}`, estado });
            assert.equal(respuesta.status, 400);
        }
    });

    it("proyecto colaborativo de una carrera exige Director y evaluaciones de todos los contextos", async () => {
        const docente = await request(app)
            .put(`/api/proyectoPeriodo/${ids.ppColaborativo}/cerrar`)
            .set(auth(tokens.docenteDestino));
        assert.equal(docente.status, 403);

        const sinEvaluaciones = await request(app)
            .put(`/api/proyectoPeriodo/${ids.ppColaborativo}/cerrar`)
            .set(auth(tokens.directorDestino));
        assert.equal(sinEvaluaciones.status, 409);

        for (const contexto of ids.pmColaborativos) {
            await registrarEvaluacionH5(ids.ppColaborativo, contexto.id, contexto.clase.docenteId);
        }

        const director = await request(app)
            .put(`/api/proyectoPeriodo/${ids.ppColaborativo}/cerrar`)
            .set(auth(tokens.directorDestino));
        assert.equal(director.status, 200, JSON.stringify(director.body));
        assert.equal(director.body.data.proyecto.estado, "ACTIVO");
    });

    it("proyecto de varias carreras bloquea cierres globales", async () => {
        const cierrePeriodo = await request(app)
            .put(`/api/proyectoPeriodo/${ids.ppInterdisciplinario}/cerrar`)
            .set(auth(tokens.directorDestino));
        assert.equal(cierrePeriodo.status, 409);

        const inconcluso = await request(app)
            .put(`/api/proyecto/${ids.proyectoInterdisciplinario}/declarar-inconcluso`)
            .set(auth(tokens.directorDestino))
            .send({ proyectoPeriodoId: ids.ppInterdisciplinario });
        assert.equal(inconcluso.status, 409);
    });

    it("declarar inconcluso es exclusivo del Director y no exige evaluación H5", async () => {
        for (const token of [tokens.admin, tokens.docenteDestino, tokens.estudiante]) {
            const denegada = await request(app)
                .put(`/api/proyecto/${ids.proyectoInconcluso}/declarar-inconcluso`)
                .set(auth(token))
                .send({ proyectoPeriodoId: ids.ppInconcluso });
            assert.equal(denegada.status, 403);
        }

        const aprobada = await request(app)
            .put(`/api/proyecto/${ids.proyectoInconcluso}/declarar-inconcluso`)
            .set(auth(tokens.directorDestino))
            .send({ proyectoPeriodoId: ids.ppInconcluso });
        assert.equal(aprobada.status, 200, JSON.stringify(aprobada.body));
        assert.equal(aprobada.body.data.proyecto.estado, "INCONCLUSO");
        assert.equal(aprobada.body.data.proyectoPeriodo.estado, "CERRADO_PERIODO");
        assert.ok(aprobada.body.data.proyectoPeriodo.fechaFin);
    });

    it("validación reporta H5 inexistente", async () => {
        const respuesta = await request(app)
            .get(`/api/proyecto/${ids.proyectoSinH5}/cierre/validacion`)
            .query({ proyectoPeriodoId: ids.ppSinH5 })
            .set(auth(tokens.admin));
        assert.equal(respuesta.status, 200);
        assert.equal(respuesta.body.data.hitoFinal, null);
        assert.ok(respuesta.body.data.faltantes.some((faltante) => faltante.tipo === "H5"));
        assert.equal(respuesta.body.data.puedeCerrar, false);
    });

    it("cierres no indexan y la inclusión manual responde 410", async () => {
        const manual = await request(app)
            .post(`/api/plagio/proyecto/${ids.proyectoSimple}/incluir-en-dataset`)
            .set(auth(tokens.admin));
        assert.equal(manual.status, 410);
        assert.equal(await prisma.datasetPlagio.count(), ids.datasetAntes);
        assert.equal(
            await prisma.documento.count({ where: { esRepositorioUnifranz: true } }),
            ids.documentosRepositorioAntes
        );
    });
});
