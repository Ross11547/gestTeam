import { config } from "dotenv";
config({ path: ".env.test", override: true });

import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

import { seedFase0C3E1 } from "../prisma/seed.fase0c3e1.js";

import { obtenerEntregaCasoUso } from "../src/application/casosUso/entrega/obtenerEntregaID.js";
import { crearEntregaCasoUso } from "../src/application/casosUso/entrega/crearEntrega.js";
import { actualizarEntregaCasoUso } from "../src/application/casosUso/entrega/actualizarEntrega.js";
import { eliminarEntregaCasoUso } from "../src/application/casosUso/entrega/eliminarEntrega.js";
import { listarEntregasPorHitoCasoUso } from "../src/application/casosUso/entrega/listarEntregasPorHito.js";

import { crearRevisionCasoUso } from "../src/application/casosUso/revision/crearRevision.js";
import { listarRevisionesPorEntregaCasoUso } from "../src/application/casosUso/revision/listarRevisionesPorEntrega.js";

import { crearEvaluacionHitoCasoUso } from "../src/application/casosUso/evaluacionHito/crearEvaluacionHito.js";

import { obtenerHitoCasoUso } from "../src/application/casosUso/hito/obtenerHitoID.js";
import { avanzarEstadoHitoCasoUso } from "../src/application/casosUso/hito/avanzarEstadoHito.js";

import { actualizarProyectoCasoUso } from "../src/application/casosUso/proyecto/actualizarProyecto.js";
import { obtenerProyectoCasoUso } from "../src/application/casosUso/proyecto/obtenerProyectoID.js";
import { cerrarProyectoPeriodoCasoUso } from "../src/application/casosUso/proyectoPeriodo/cerrarProyectoPeriodo.js";

import { crearHito as crearHitoController } from "../src/api/controllers/hito.controller.js";
import { eliminarHito as eliminarHitoController } from "../src/api/controllers/hito.controller.js";
import { crearEvaluacion as crearEvaluacionController } from "../src/api/controllers/evaluacionProyecto.controller.js";

import { puedeVerProyectoPeriodo } from "../src/dominio/comun/autoridadProyectoPeriodo.js";
import { puedeVerEntrega, puedeVerHitoProyecto, puedeVerEvaluacionHito } from "../src/dominio/comun/autoridadRecursoAcademico.js";

const prisma = new PrismaClient();
const PASSWORD_HASH = await bcrypt.hash("TestPass0C3E3B!", 10);

let ids = {};
let usuarios = {};

async function setupExtraFixtures() {
    const institucion = await prisma.institucion.findFirst({ where: { slug: "univ-test-0c3e1" } });
    const carreraSistemas = await prisma.carrera.findFirst({ where: { sigla: "SIS" } });

    const facultadB = await prisma.facultad.create({
        data: { institucionId: institucion.id, nombre: "Facultad B" },
    });
    const carreraB = await prisma.carrera.create({
        data: { idFacultad: facultadB.id, nombre: "Carrera B", sigla: "CARB" },
    });

    const rolDirector = await prisma.rol.findFirst({ where: { nombre: "Director" } });
    const rolDocente = await prisma.rol.findFirst({ where: { nombre: "Docente" } });
    const rolEstudiante = await prisma.rol.findFirst({ where: { nombre: "Estudiante" } });

    const directorB = await prisma.usuario.create({
        data: {
            nombre: "Director", apellido: "B", telefono: "70000100", ci: 2000100,
            correo: "director.b.0c3e3b@unifranz.edu.bo", password: PASSWORD_HASH,
            idRol: rolDirector.id, activo: true, esDirector: true,
            idCarrera: carreraB.id, idFacultad: facultadB.id,
        },
    });

    const directorDocente = await prisma.usuario.create({
        data: {
            nombre: "Director", apellido: "Docente", telefono: "70000101", ci: 2000101,
            correo: "director.docente.0c3e3b@unifranz.edu.bo", password: PASSWORD_HASH,
            idRol: rolDirector.id, activo: true, esDirector: true,
            idCarrera: carreraSistemas.id, idFacultad: carreraSistemas.idFacultad,
        },
    });

    const docenteSolo2026_1 = await prisma.usuario.create({
        data: {
            nombre: "Docente", apellido: "Solo2026_1", telefono: "70000102", ci: 2000102,
            correo: "docente.solo2026_1.0c3e3b@unifranz.edu.bo", password: PASSWORD_HASH,
            idRol: rolDocente.id, activo: true,
        },
    });

    const estudianteSolo2026_1 = await prisma.usuario.create({
        data: {
            nombre: "Estudiante", apellido: "Solo2026_1", telefono: "70000103", ci: 2000103,
            correo: "estudiante.solo2026_1.0c3e3b@unifranz.edu.bo", password: PASSWORD_HASH,
            idRol: rolEstudiante.id, activo: true,
            idFacultad: carreraSistemas.idFacultad, idCarrera: carreraSistemas.id,
        },
    });

    const periodo2026_1 = await prisma.periodoAcademico.findFirst({ where: { nombre: "2026-1" } });
    const materiaIntegrador1 = await prisma.materia.findFirst({ where: { codigo: "PI1" } });
    const proyectoX = await prisma.proyecto.findFirst({ where: { titulo: "Proyecto X - Continuidad" } });

    const claseSolo2026_1 = await prisma.claseMateria.create({
        data: { periodoId: periodo2026_1.id, materiaId: materiaIntegrador1.id, docenteId: docenteSolo2026_1.id, paralelo: "B" },
    });

    const ppX_2026_1 = await prisma.proyectoPeriodo.findFirst({ where: { proyectoId: proyectoX.id, periodoId: periodo2026_1.id } });
    const pmX_2026_1 = await prisma.proyectoMateria.findFirst({ where: { proyectoPeriodoId: ppX_2026_1.id } });

    const equipoX_2026_1_extra = await prisma.equipo.create({
        data: {
            proyectoId: proyectoX.id, proyectoPeriodoId: ppX_2026_1.id, proyectoMateriaId: pmX_2026_1.id,
            nombre: "Equipo X Extra 2026-1", materiaId: materiaIntegrador1.id, periodoId: periodo2026_1.id,
            claseId: pmX_2026_1.claseId, creadoPorId: estudianteSolo2026_1.id,
        },
    });

    await prisma.equipoMiembro.createMany({
        data: [
            { equipoId: equipoX_2026_1_extra.id, usuarioId: estudianteSolo2026_1.id, rolEquipo: "LIDER", activo: true },
        ],
    });

    // Asignar al Director-Docente la clase Sistemas del Proyecto Y (2026-2) para prueba K.
    const materiaPI2 = await prisma.materia.findFirst({ where: { codigo: "PI2" } });
    const periodo2026_2_local = await prisma.periodoAcademico.findFirst({ where: { nombre: "2026-2" } });
    const claseY_Sistemas = await prisma.claseMateria.findFirst({
        where: { periodoId: periodo2026_2_local.id, materiaId: materiaPI2.id },
    });
    if (claseY_Sistemas) {
        await prisma.claseMateria.update({ where: { id: claseY_Sistemas.id }, data: { docenteId: directorDocente.id } });
    }

    return {
        directorB,
        directorDocente,
        docenteSolo2026_1,
        estudianteSolo2026_1,
        equipoX_2026_1_extra,
    };
}

async function cargarUsuarios() {
    const todos = await prisma.usuario.findMany({ include: { rol: { select: { id: true, nombre: true } } } });
    const map = {};
    for (const u of todos) {
        map[u.correo] = u;
    }
    return map;
}

async function invocarController(controller, req = {}) {
    let error = null;
    let response = null;
    const res = {
        statusCode: 200,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            response = { statusCode: this.statusCode, data };
            return this;
        },
    };
    const next = (e) => {
        error = e;
    };
    await controller(req, res, next);
    if (error) throw error;
    return response;
}

describe("Fase 0C.3E-3B — Seguridad e IDOR", () => {
    before(async () => {
        await seedFase0C3E1();
        const extra = await setupExtraFixtures();
        usuarios = await cargarUsuarios();

        const proyectoX = await prisma.proyecto.findFirst({ where: { titulo: "Proyecto X - Continuidad" } });
        const proyectoY = await prisma.proyecto.findFirst({ where: { titulo: "Proyecto Y - Colaborativo" } });
        const proyectoZ = await prisma.proyecto.findFirst({ where: { titulo: "Proyecto Z - Inconcluso" } });

        const periodo2026_1 = await prisma.periodoAcademico.findFirst({ where: { nombre: "2026-1" } });
        const periodo2026_2 = await prisma.periodoAcademico.findFirst({ where: { nombre: "2026-2" } });

        const ppX_2026_1 = await prisma.proyectoPeriodo.findFirst({ where: { proyectoId: proyectoX.id, periodoId: periodo2026_1.id } });
        const ppX_2026_2 = await prisma.proyectoPeriodo.findFirst({ where: { proyectoId: proyectoX.id, periodoId: periodo2026_2.id } });
        const ppY_2026_2 = await prisma.proyectoPeriodo.findFirst({ where: { proyectoId: proyectoY.id, periodoId: periodo2026_2.id } });

        const equipoX_2026_1 = await prisma.equipo.findFirst({ where: { proyectoId: proyectoX.id, periodoId: periodo2026_1.id } });
        const equipoX_2026_2 = await prisma.equipo.findFirst({ where: { proyectoId: proyectoX.id, periodoId: periodo2026_2.id } });
        const equipoY_Sistemas = await prisma.equipo.findFirst({ where: { proyectoId: proyectoY.id, proyectoMateria: { materia: { codigo: "PI2" } } } });
        const equipoY_Psicologia = await prisma.equipo.findFirst({ where: { proyectoId: proyectoY.id, proyectoMateria: { materia: { codigo: "PSI" } } } });

        const hitoX_2026_2_H1 = await prisma.hitoProyecto.findFirst({ where: { proyectoPeriodoId: ppX_2026_2.id, hitoPeriodo: { orden: 1 } } });
        const hitoY_Sistemas_H1 = await prisma.hitoProyecto.findFirst({ where: { proyectoPeriodoId: ppY_2026_2.id, hitoPeriodo: { orden: 1 } } });
        const hitoY_Psicologia_H1 = await prisma.hitoProyecto.findFirst({ where: { proyectoPeriodoId: ppY_2026_2.id, hitoPeriodo: { orden: 1 } } });

        // Crear una entrega en equipoY_Psicologia por estudianteC (miembro de Psicología)
        const entregaPsicologia = await prisma.entregaHito.create({
            data: {
                hitoId: hitoY_Psicologia_H1.id,
                equipoId: equipoY_Psicologia.id,
                autorId: usuarios["estudiante.c.0c3e1@unifranz.edu.bo"].id,
                estado: "ENTREGADO",
                comentario: "Entrega Psicología",
            },
        });

        // Crear una entrega en equipoY_Sistemas por estudianteA
        const entregaSistemas = await prisma.entregaHito.create({
            data: {
                hitoId: hitoY_Sistemas_H1.id,
                equipoId: equipoY_Sistemas.id,
                autorId: usuarios["estudiante.a.0c3e1@unifranz.edu.bo"].id,
                estado: "ENTREGADO",
                comentario: "Entrega Sistemas",
            },
        });

        // Crear entrega histórica 2026-1 por estudianteA
        const hitoX_2026_1_H1 = await prisma.hitoProyecto.findFirst({ where: { proyectoPeriodoId: ppX_2026_1.id, hitoPeriodo: { orden: 1 } } });
        const entregaHistorica = await prisma.entregaHito.create({
            data: {
                hitoId: hitoX_2026_1_H1.id,
                equipoId: equipoX_2026_1.id,
                autorId: usuarios["estudiante.a.0c3e1@unifranz.edu.bo"].id,
                estado: "ENTREGADO",
                comentario: "Entrega histórica 2026-1",
            },
        });

        // Crear evaluación en contexto Sistemas de Proyecto Y
        const pmY_Sistemas = await prisma.proyectoMateria.findFirst({ where: { proyectoPeriodoId: ppY_2026_2.id, materia: { codigo: "PI2" } } });
        const evaluacionSistemas = await prisma.evaluacionHito.create({
            data: {
                hitoProyectoId: hitoY_Sistemas_H1.id,
                proyectoMateriaId: pmY_Sistemas.id,
                evaluadorId: usuarios["docente.integrador.0c3e1@unifranz.edu.bo"].id,
                tipoEvaluador: "DOCENTE",
                puntaje: 80,
            },
        });

        ids = {
            proyectoX: proyectoX.id,
            proyectoY: proyectoY.id,
            proyectoZ: proyectoZ.id,
            ppX_2026_1: ppX_2026_1.id,
            ppX_2026_2: ppX_2026_2.id,
            ppY_2026_2: ppY_2026_2.id,
            equipoX_2026_1: equipoX_2026_1.id,
            equipoX_2026_2: equipoX_2026_2.id,
            equipoY_Sistemas: equipoY_Sistemas.id,
            equipoY_Psicologia: equipoY_Psicologia.id,
            entregaPsicologia: entregaPsicologia.id,
            entregaSistemas: entregaSistemas.id,
            entregaHistorica: entregaHistorica.id,
            hitoX_2026_2_H1: hitoX_2026_2_H1.id,
            hitoY_Sistemas_H1: hitoY_Sistemas_H1.id,
            hitoY_Psicologia_H1: hitoY_Psicologia_H1.id,
            evaluacionSistemas: evaluacionSistemas.id,
            equipoX_2026_1_extra: extra.equipoX_2026_1_extra.id,
        };
    });

    function u(email) {
        return usuarios[email];
    }

    describe("Entregas — IDOR", () => {
        it("A. Estudiante A ve entrega de Equipo Psicología → 403", async () => {
            await assert.rejects(
                () => obtenerEntregaCasoUso(ids.entregaPsicologia, u("estudiante.a.0c3e1@unifranz.edu.bo")),
                (e) => e.status === 403
            );
        });

        it("B. Estudiante A crea entrega en Equipo Psicología → 403", async () => {
            await assert.rejects(
                () => crearEntregaCasoUso({ hitoId: ids.hitoY_Psicologia_H1, equipoId: ids.equipoY_Psicologia }, u("estudiante.a.0c3e1@unifranz.edu.bo")),
                (e) => e.status === 403
            );
        });

        it("C. Estudiante histórico (2026-1) modifica periodo 2026-2 → 403", async () => {
            await assert.rejects(
                () => crearEntregaCasoUso({ hitoId: ids.hitoX_2026_2_H1, equipoId: ids.equipoX_2026_2 }, u("estudiante.a.0c3e1@unifranz.edu.bo")),
                (e) => e.status === 403
            );
        });

        it("D. Docente Sistemas lee entrega Psicología → 403", async () => {
            await assert.rejects(
                () => obtenerEntregaCasoUso(ids.entregaPsicologia, u("docente.integrador.0c3e1@unifranz.edu.bo")),
                (e) => e.status === 403
            );
        });

        it("E. Docente Sistemas modifica entrega Psicología → 403", async () => {
            await assert.rejects(
                () => actualizarEntregaCasoUso(ids.entregaPsicologia, { comentario: "Hackeado" }, u("docente.integrador.0c3e1@unifranz.edu.bo")),
                (e) => e.status === 403
            );
        });

        it("V. DELETE entrega ajena autenticado → 403", async () => {
            await assert.rejects(
                () => eliminarEntregaCasoUso(ids.entregaPsicologia, u("estudiante.a.0c3e1@unifranz.edu.bo")),
                (e) => e.status === 403
            );
        });

        it("R. Estudiante histórico consulta su entrega anterior → permitido", async () => {
            const e = await obtenerEntregaCasoUso(ids.entregaHistorica, u("estudiante.a.0c3e1@unifranz.edu.bo"));
            assert.equal(e.id, ids.entregaHistorica);
        });
    });

    describe("Revisiones — IDOR", () => {
        it("F. Docente Sistemas crea revisión Psicología → 403", async () => {
            await assert.rejects(
                () => crearRevisionCasoUso({ entregaId: ids.entregaPsicologia, feedback: "Mal" }, u("docente.integrador.0c3e1@unifranz.edu.bo")),
                (e) => e.status === 403
            );
        });

        it("W. Admin intenta crear RevisionEntrega → 403", async () => {
            await assert.rejects(
                () => crearRevisionCasoUso({ entregaId: ids.entregaSistemas, feedback: "Admin" }, u("admin.0c3e1@unifranz.edu.bo")),
                (e) => e.status === 403
            );
        });

        it("X. Director directivo sin ClaseMateria intenta crear RevisionEntrega → 403", async () => {
            await assert.rejects(
                () => crearRevisionCasoUso({ entregaId: ids.entregaSistemas, feedback: "Director" }, u("director.sistemas.0c3e1@unifranz.edu.bo")),
                (e) => e.status === 403
            );
        });
    });

    describe("EvaluacionHito — IDOR", () => {
        it("G. Docente Sistemas crea EvaluacionHito Psicología → 403", async () => {
            const pmPsicologia = await prisma.proyectoMateria.findFirst({ where: { proyectoPeriodoId: ids.ppY_2026_2, materia: { codigo: "PSI" } } });
            await assert.rejects(
                () => crearEvaluacionHitoCasoUso({ hitoProyectoId: ids.hitoY_Psicologia_H1, proyectoMateriaId: pmPsicologia.id, evaluadorId: u("docente.integrador.0c3e1@unifranz.edu.bo").id, tipoEvaluador: "DOCENTE", puntaje: 70 }, u("docente.integrador.0c3e1@unifranz.edu.bo")),
                (e) => e.status === 403
            );
        });

        it("J. Director sin clase intenta evaluar → 403", async () => {
            const pmSistemas = await prisma.proyectoMateria.findFirst({ where: { proyectoPeriodoId: ids.ppY_2026_2, materia: { codigo: "PI2" } } });
            await assert.rejects(
                () => crearEvaluacionHitoCasoUso({ hitoProyectoId: ids.hitoY_Sistemas_H1, proyectoMateriaId: pmSistemas.id, evaluadorId: u("director.sistemas.0c3e1@unifranz.edu.bo").id, tipoEvaluador: "DOCENTE", puntaje: 70 }, u("director.sistemas.0c3e1@unifranz.edu.bo")),
                (e) => e.status === 403
            );
        });

        it("L. Admin crea EvaluacionHito → rechazado", async () => {
            const pmSistemas = await prisma.proyectoMateria.findFirst({ where: { proyectoPeriodoId: ids.ppY_2026_2, materia: { codigo: "PI2" } } });
            await assert.rejects(
                () => crearEvaluacionHitoCasoUso({ hitoProyectoId: ids.hitoY_Sistemas_H1, proyectoMateriaId: pmSistemas.id, evaluadorId: u("admin.0c3e1@unifranz.edu.bo").id, tipoEvaluador: "DOCENTE", puntaje: 70 }, u("admin.0c3e1@unifranz.edu.bo")),
                (e) => e.status === 403
            );
        });

        it("K. Director que imparte clase evalúa SU contexto → permitido", async () => {
            const pmSistemas = await prisma.proyectoMateria.findFirst({ where: { proyectoPeriodoId: ids.ppY_2026_2, materia: { codigo: "PI2" } } });
            const ev = await crearEvaluacionHitoCasoUso({ hitoProyectoId: ids.hitoY_Sistemas_H1, proyectoMateriaId: pmSistemas.id, evaluadorId: u("director.docente.0c3e3b@unifranz.edu.bo").id, tipoEvaluador: "DOCENTE", puntaje: 75 }, u("director.docente.0c3e3b@unifranz.edu.bo"));
            assert.ok(ev.id);
        });

        it("M. Admin lee EvaluacionHito → permitido", async () => {
            const ok = await puedeVerEvaluacionHito(ids.evaluacionSistemas, u("admin.0c3e1@unifranz.edu.bo"));
            assert.equal(ok, true);
        });
    });

    describe("Proyecto / Director — IDOR", () => {
        it("H. Director Carrera B accede a Proyecto Carrera A → 403", async () => {
            await assert.rejects(
                () => obtenerProyectoCasoUso(ids.proyectoX, u("director.b.0c3e3b@unifranz.edu.bo")),
                (e) => e.status === 403
            );
        });

        it("I. Director Carrera B muta recurso Carrera A → 403", async () => {
            await assert.rejects(
                () => actualizarProyectoCasoUso(ids.proyectoX, { descripcion: "Hackeado" }, u("director.b.0c3e3b@unifranz.edu.bo")),
                (e) => e.status === 403
            );
        });
    });

    describe("Iteración de IDs", () => {
        it("N. Iteración de hitoId ajeno → 403", async () => {
            await assert.rejects(
                () => obtenerHitoCasoUso(ids.hitoX_2026_2_H1, u("estudiante.a.0c3e1@unifranz.edu.bo")),
                (e) => e.status === 403
            );
        });

        it("O. Iteración de entregaId ajeno → 403", async () => {
            await assert.rejects(
                () => obtenerEntregaCasoUso(ids.entregaPsicologia, u("estudiante.a.0c3e1@unifranz.edu.bo")),
                (e) => e.status === 403
            );
        });

        it("P. Iteración de evaluación ajena → 403", async () => {
            const ok = await puedeVerEvaluacionHito(ids.evaluacionSistemas, u("estudiante.c.0c3e1@unifranz.edu.bo"));
            assert.equal(ok, false);
        });
    });

    describe("Histórico vs vigente", () => {
        it("Q. Docente histórico muta periodo nuevo → 403", async () => {
            const pmSistemas = await prisma.proyectoMateria.findFirst({ where: { proyectoPeriodoId: ids.ppX_2026_2, materia: { codigo: "PI2" } } });
            await assert.rejects(
                () => crearEvaluacionHitoCasoUso({ hitoProyectoId: ids.hitoX_2026_2_H1, proyectoMateriaId: pmSistemas.id, evaluadorId: u("docente.solo2026_1.0c3e3b@unifranz.edu.bo").id, tipoEvaluador: "DOCENTE", puntaje: 60 }, u("docente.solo2026_1.0c3e3b@unifranz.edu.bo")),
                (e) => e.status === 403
            );
        });

        it("S. Estudiante no participante consulta ProyectoPeriodo ajeno → 403", async () => {
            const ok = await puedeVerProyectoPeriodo(ids.ppY_2026_2, u("estudiante.solo2026_1.0c3e3b@unifranz.edu.bo"));
            assert.equal(ok, false);
        });
    });

    describe("Operaciones globales pendientes", () => {
        it("T. Docente de un contexto intenta cerrar hito global colaborativo → rechazado", async () => {
            await assert.rejects(
                () => avanzarEstadoHitoCasoUso(ids.hitoY_Sistemas_H1, { estado: "FINALIZADO" }, u("docente.integrador.0c3e1@unifranz.edu.bo")),
                (e) => e.status === 403
            );
        });

        it("U. Docente de un contexto intenta cerrar ProyectoPeriodo colaborativo → rechazado (interno)", async () => {
            await assert.rejects(
                () => cerrarProyectoPeriodoCasoUso({ proyectoPeriodoId: ids.ppY_2026_2 }, u("docente.integrador.0c3e1@unifranz.edu.bo")),
                (e) => e.status === 403
            );
        });
    });

    describe("Legacy bypasses bloqueados", () => {
        it("Y. POST legacy hito no permite Hito 6", async () => {
            await assert.rejects(
                () => invocarController(crearHitoController, { body: { proyectoId: ids.proyectoX, orden: 6, nombre: "H6" }, user: u("admin.0c3e1@unifranz.edu.bo") }),
                (e) => e.status === 410
            );
        });

        it("Z. DELETE legacy hito no elimina hito institucional", async () => {
            await assert.rejects(
                () => invocarController(eliminarHitoController, { params: { id: ids.hitoX_2026_2_H1 }, user: u("admin.0c3e1@unifranz.edu.bo") }),
                (e) => e.status === 410
            );
        });

        it("AA. POST legacy EvaluacionProyecto no permite saltarse EvaluacionHito", async () => {
            await assert.rejects(
                () => invocarController(crearEvaluacionController, { body: { proyectoId: ids.proyectoX, puntaje: 80 }, user: u("docente.integrador.0c3e1@unifranz.edu.bo") }),
                (e) => e.status === 410
            );
        });

        it("AB. PUT Proyecto estado=CERRADO no ejecuta cierre definitivo", async () => {
            await assert.rejects(
                () => actualizarProyectoCasoUso(ids.proyectoZ, { estado: "CERRADO" }, u("admin.0c3e1@unifranz.edu.bo")),
                (e) => e.status === 403
            );
        });
    });
});
