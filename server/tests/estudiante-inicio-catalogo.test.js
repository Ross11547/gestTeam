import { config } from "dotenv";
config({ path: ".env.test", override: true });

import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { app } from "../index.js";
import { seedFase0C3E1 } from "../prisma/seed.fase0c3e1.js";

const prisma = new PrismaClient();
const PASSWORD = "TestPass0C3E1!";

let tokens = {};
let datosTest = {};

async function login(correo) {
    const res = await request(app).post("/api/login").send({ correo, password: PASSWORD });
    assert.equal(res.status, 200, `Login fallido para ${correo}`);
    return res.body.token;
}

function auth(token) {
    return { Authorization: `Bearer ${token}` };
}

describe("Estudiante — Inicio y Catálogo Seguro (GET /api/proyecto/catalogo)", () => {
    before(async () => {
        await seedFase0C3E1();

        const [
            estudianteA,
            estudianteB,
            periodoActivo,
            materiaIntegrador,
            materiaRegular,
            carreraSistemas,
            facultadIng,
        ] = await Promise.all([
            prisma.usuario.findFirst({ where: { correo: "estudiante.a.0c3e1@unifranz.edu.bo" } }),
            prisma.usuario.findFirst({ where: { correo: "estudiante.b.0c3e1@unifranz.edu.bo" } }),
            prisma.periodoAcademico.findFirst({ where: { nombre: "2026-1" } }),
            prisma.materia.findFirst({ where: { codigo: "PI1" } }),
            prisma.materia.findFirst({ where: { codigo: "PSI" } }),
            prisma.carrera.findFirst({ where: { sigla: "SIS" } }),
            prisma.facultad.findFirst({ where: { nombre: "Ingeniería de Sistemas" } }),
        ]);

        // Crear proyectos para pruebas exhaustivas del catálogo
        const pBorrador = await prisma.proyecto.create({
            data: {
                titulo: "Proyecto en Borrador Oculto",
                descripcion: "No debe aparecer jamás en catálogo",
                estado: "BORRADOR",
                tipoGrupo: "INDIVIDUAL",
                repoUrl: "https://github.com/privado/borrador",
                creadoPorId: estudianteA.id,
            },
        });

        const pArchivado = await prisma.proyecto.create({
            data: {
                titulo: "Proyecto Archivado Oculto",
                descripcion: "No debe aparecer jamás en catálogo",
                estado: "ARCHIVADO",
                tipoGrupo: "GRUPAL",
                repoUrl: "https://github.com/privado/archivado",
                creadoPorId: estudianteA.id,
            },
        });

        const pActivoIntegrador = await prisma.proyecto.create({
            data: {
                titulo: "Sistema IoT de Monitoreo Agrícola",
                descripcion: "Proyecto integrador de sensores inteligentes",
                estado: "ACTIVO",
                tipoGrupo: "GRUPAL",
                repoUrl: "https://github.com/privado/iot-agricola",
                creadoPorId: estudianteA.id,
            },
        });

        const ppActivo = await prisma.proyectoPeriodo.create({
            data: {
                proyectoId: pActivoIntegrador.id,
                periodoId: periodoActivo.id,
                estado: "ACTIVO",
            },
        });

        const pmActivo = await prisma.proyectoMateria.create({
            data: {
                proyectoId: pActivoIntegrador.id,
                periodoId: periodoActivo.id,
                materiaId: materiaIntegrador.id,
                proyectoPeriodoId: ppActivo.id,
            },
        });

        const equipoActivo = await prisma.equipo.create({
            data: {
                nombre: "Equipo AgroTech",
                proyectoId: pActivoIntegrador.id,
                proyectoPeriodoId: ppActivo.id,
                proyectoMateriaId: pmActivo.id,
                periodoId: periodoActivo.id,
                materiaId: materiaIntegrador.id,
                tipoGrupo: "GRUPAL",
                creadoPorId: estudianteA.id,
            },
        });

        await prisma.equipoMiembro.create({
            data: {
                equipoId: equipoActivo.id,
                usuarioId: estudianteA.id,
                rolEquipo: "LIDER",
                activo: true,
            },
        });

        const pColaborativo = await prisma.proyecto.create({
            data: {
                titulo: "Plataforma de Salud Interdisciplinaria",
                descripcion: "Colaboración entre ingeniería y psicología",
                estado: "ACTIVO",
                tipoGrupo: "COLABORATIVO",
                repoUrl: "https://github.com/privado/salud-mental",
                creadoPorId: estudianteB.id,
            },
        });

        await prisma.proyectoMateria.create({
            data: {
                proyectoId: pColaborativo.id,
                periodoId: periodoActivo.id,
                materiaId: materiaRegular.id,
            },
        });

        const pInconcluso = await prisma.proyecto.create({
            data: {
                titulo: "Robot Autónomo de Rescate",
                descripcion: "Inconcluso del periodo anterior",
                estado: "INCONCLUSO",
                tipoGrupo: "INDIVIDUAL",
                repoUrl: "https://github.com/privado/robot-rescate",
                creadoPorId: estudianteB.id,
            },
        });

        await prisma.proyectoMateria.create({
            data: {
                proyectoId: pInconcluso.id,
                periodoId: periodoActivo.id,
                materiaId: materiaIntegrador.id,
            },
        });

        const pCerrado = await prisma.proyecto.create({
            data: {
                titulo: "Analizador de Datos Genómicos",
                descripcion: "Proyecto terminado con éxito",
                estado: "CERRADO",
                tipoGrupo: "GRUPAL",
                repoUrl: "https://github.com/privado/genomica",
                creadoPorId: estudianteB.id,
            },
        });

        await prisma.proyectoMateria.create({
            data: {
                proyectoId: pCerrado.id,
                periodoId: periodoActivo.id,
                materiaId: materiaIntegrador.id,
            },
        });

        // Crear destacado real en la base de datos
        await prisma.proyectoDestacado.create({
            data: {
                proyectoId: pActivoIntegrador.id,
                motivo: "Innovación tecnológica destacada 2026",
                orden: 1,
            },
        });

        datosTest = {
            estudianteA: estudianteA.id,
            estudianteB: estudianteB.id,
            pBorradorId: pBorrador.id,
            pArchivadoId: pArchivado.id,
            pActivoIntegradorId: pActivoIntegrador.id,
            pColaborativoId: pColaborativo.id,
            pInconclusoId: pInconcluso.id,
            pCerradoId: pCerrado.id,
            periodoId: periodoActivo.id,
            materiaIntegradorId: materiaIntegrador.id,
            materiaRegularId: materiaRegular.id,
            carreraId: carreraSistemas.id,
            facultadId: facultadIng.id,
            proyectoPeriodoId: ppActivo.id,
        };

        tokens.estudianteA = await login(estudianteA.correo);
        tokens.estudianteB = await login(estudianteB.correo);
    });

    after(async () => {
        await prisma.$disconnect();
    });

    it("1. Seguridad DTO: no expone repoUrl, documentos ni datos personales privados", async () => {
        const res = await request(app)
            .get("/api/proyecto/catalogo")
            .set(auth(tokens.estudianteA));

        assert.equal(res.status, 200);
        assert.ok(Array.isArray(res.body.data));
        assert.ok(res.body.data.length > 0);

        for (const p of res.body.data) {
            assert.equal(p.repoUrl, undefined, "repoUrl no debe exponerse");
            assert.equal(p.documentos, undefined, "documentos no debe exponerse");
            assert.equal(p.entregas, undefined, "entregas no debe exponerse");
            assert.equal(p.revisiones, undefined, "revisiones no debe exponerse");
            assert.equal(p.evaluaciones, undefined, "evaluaciones no debe exponerse");
            assert.equal(p.notas, undefined, "notas no debe exponerse");
            assert.equal(p.feedback, undefined, "feedback no debe exponerse");
            assert.equal(p.correos, undefined, "correos no debe exponerse");
            assert.equal(p.ci, undefined, "CI no debe exponerse");
            assert.equal(p.telefono, undefined, "telefono no debe exponerse");

            // Campos obligatorios del DTO
            assert.ok(p.id, "Debe tener id");
            assert.ok(p.titulo, "Debe tener titulo");
            assert.ok(p.estado, "Debe tener estado");
            assert.ok(p.estadoLabel, "Debe tener estadoLabel");
            assert.ok(p.tipoGrupo, "Debe tener tipoGrupo");
            assert.ok(p.tipoLabel, "Debe tener tipoLabel");
            assert.ok(p.categoria, "Debe tener categoria");
            assert.ok(typeof p.participa === "boolean", "Debe tener booleano participa");
            assert.ok(typeof p.puedeAbrirWorkspace === "boolean", "Debe tener booleano puedeAbrirWorkspace");
            assert.ok(typeof p.puedeSolicitarContinuacion === "boolean", "Debe tener puedeSolicitarContinuacion");
            assert.ok(typeof p.esDestacado === "boolean", "Debe tener booleano esDestacado");
        }
    });

    it("2. BORRADOR y ARCHIVADO jamás aparecen en el catálogo", async () => {
        const res = await request(app)
            .get("/api/proyecto/catalogo")
            .set(auth(tokens.estudianteA));

        assert.equal(res.status, 200);
        const ids = res.body.data.map((p) => p.id);
        assert.ok(!ids.includes(datosTest.pBorradorId), "Borrador no debe aparecer");
        assert.ok(!ids.includes(datosTest.pArchivadoId), "Archivado no debe aparecer");
    });

    it("3. Filtro por categoría (INTEGRADOR y REGULAR) funciona correctamente", async () => {
        const resIntegrador = await request(app)
            .get("/api/proyecto/catalogo")
            .query({ categoria: "INTEGRADOR" })
            .set(auth(tokens.estudianteA));

        assert.equal(resIntegrador.status, 200);
        assert.ok(resIntegrador.body.data.every((p) => p.esIntegrador === true && p.categoria === "INTEGRADOR"));

        const resRegular = await request(app)
            .get("/api/proyecto/catalogo")
            .query({ categoria: "REGULAR" })
            .set(auth(tokens.estudianteA));

        assert.equal(resRegular.status, 200);
        assert.ok(resRegular.body.data.every((p) => p.esIntegrador === false && p.categoria === "REGULAR"));
    });

    it("4. Filtro por tipoGrupo (INDIVIDUAL, GRUPAL, COLABORATIVO) funciona", async () => {
        const resColab = await request(app)
            .get("/api/proyecto/catalogo")
            .query({ tipoGrupo: "COLABORATIVO" })
            .set(auth(tokens.estudianteA));

        assert.equal(resColab.status, 200);
        assert.ok(resColab.body.data.every((p) => p.tipoGrupo === "COLABORATIVO"));
    });

    it("5. Filtro por estado (ACTIVO, CERRADO, INCONCLUSO) funciona", async () => {
        const resInconcluso = await request(app)
            .get("/api/proyecto/catalogo")
            .query({ estado: "INCONCLUSO" })
            .set(auth(tokens.estudianteA));

        assert.equal(resInconcluso.status, 200);
        assert.ok(resInconcluso.body.data.every((p) => p.estado === "INCONCLUSO"));
    });

    it("6. Filtro por propios=true devuelve solo proyectos donde el usuario participa", async () => {
        const resPropios = await request(app)
            .get("/api/proyecto/catalogo")
            .query({ propios: "true" })
            .set(auth(tokens.estudianteA));

        assert.equal(resPropios.status, 200);
        assert.ok(resPropios.body.data.length > 0);
        assert.ok(resPropios.body.data.every((p) => p.participa === true));
        assert.ok(resPropios.body.data.some((p) => p.id === datosTest.pActivoIntegradorId));
    });

    it("7. Filtro por destacado=true devuelve proyectos con ProyectoDestacado", async () => {
        const resDestacados = await request(app)
            .get("/api/proyecto/catalogo")
            .query({ destacado: "true" })
            .set(auth(tokens.estudianteA));

        assert.equal(resDestacados.status, 200);
        assert.ok(resDestacados.body.data.length > 0);
        assert.ok(resDestacados.body.data.every((p) => p.esDestacado === true));
        const pAgricola = resDestacados.body.data.find((p) => p.id === datosTest.pActivoIntegradorId);
        assert.ok(pAgricola);
        assert.equal(pAgricola.motivoDestacado, "Innovación tecnológica destacada 2026");
    });

    it("8. Filtro por texto busca en título, descripción y materia", async () => {
        const res = await request(app)
            .get("/api/proyecto/catalogo")
            .query({ texto: "Agrícola" })
            .set(auth(tokens.estudianteA));

        assert.equal(res.status, 200);
        assert.ok(res.body.data.some((p) => p.id === datosTest.pActivoIntegradorId));
    });

    it("9. Filtros jerárquicos: facultadId, carreraId, periodoId, materiaId", async () => {
        const res = await request(app)
            .get("/api/proyecto/catalogo")
            .query({
                facultadId: datosTest.facultadId,
                carreraId: datosTest.carreraId,
                periodoId: datosTest.periodoId,
                materiaId: datosTest.materiaIntegradorId,
            })
            .set(auth(tokens.estudianteA));

        assert.equal(res.status, 200);
        assert.ok(res.body.data.length > 0);
        assert.ok(res.body.data.every((p) =>
            p.facultades.some((f) => f.id === datosTest.facultadId) &&
            p.carreras.some((c) => c.id === datosTest.carreraId) &&
            p.materias.some((m) => m.id === datosTest.materiaIntegradorId)
        ));
    });

    it("10. Capacidades calculadas: puedeAbrirWorkspace es true para miembro y false para ajeno", async () => {
        const resA = await request(app)
            .get(`/api/proyecto/catalogo/${datosTest.pActivoIntegradorId}`)
            .set(auth(tokens.estudianteA));

        assert.equal(resA.status, 200);
        assert.equal(resA.body.data.puedeAbrirWorkspace, true);
        assert.equal(resA.body.data.proyectoPeriodoId, datosTest.proyectoPeriodoId);

        const resB = await request(app)
            .get(`/api/proyecto/catalogo/${datosTest.pActivoIntegradorId}`)
            .set(auth(tokens.estudianteB));

        assert.equal(resB.status, 200);
        assert.equal(resB.body.data.puedeAbrirWorkspace, false);
        assert.equal(resB.body.data.proyectoPeriodoId, null);
    });

    it("11. Paginación y orden en el catálogo", async () => {
        const res = await request(app)
            .get("/api/proyecto/catalogo")
            .query({ pagina: 1, limite: 2, orden: "titulo" })
            .set(auth(tokens.estudianteA));

        assert.equal(res.status, 200);
        assert.equal(res.body.paginacion.pagina, 1);
        assert.equal(res.body.paginacion.limite, 2);
        assert.ok(res.body.paginacion.total >= 4);
        assert.equal(res.body.data.length, 2);
    });
});
