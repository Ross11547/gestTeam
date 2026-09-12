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
    assert.equal(respuesta.status, 200, `Login fallido para ${correo}: ${JSON.stringify(respuesta.body)}`);
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

describe("Fase 0C.3E-5 - Continuidad y catálogo de integradores", () => {
    before(async () => {
        await seedFase0C3E1();

        const [
            periodoAnterior,
            periodoDestino,
            materiaAnterior,
            materiaDestino,
            materiaNoIntegradora,
            claseAnterior,
            claseDestino,
            claseNoIntegradora,
            estudianteA,
            estudianteB,
            rolDirector,
        ] = await Promise.all([
            prisma.periodoAcademico.findFirst({ where: { nombre: "2026-1" } }),
            prisma.periodoAcademico.findFirst({ where: { nombre: "2026-2" } }),
            prisma.materia.findFirst({ where: { codigo: "PI1" } }),
            prisma.materia.findFirst({ where: { codigo: "PI2" } }),
            prisma.materia.findFirst({ where: { codigo: "PSI" } }),
            prisma.claseMateria.findFirst({ where: { materia: { codigo: "PI1" } } }),
            prisma.claseMateria.findFirst({ where: { materia: { codigo: "PI2" } } }),
            prisma.claseMateria.findFirst({ where: { materia: { codigo: "PSI" } } }),
            prisma.usuario.findFirst({ where: { correo: "estudiante.a.0c3e1@unifranz.edu.bo" } }),
            prisma.usuario.findFirst({ where: { correo: "estudiante.b.0c3e1@unifranz.edu.bo" } }),
            prisma.rol.findFirst({ where: { nombre: "Director" } }),
        ]);

        const proyectoHistorico = await prisma.proyecto.create({
            data: {
                titulo: "Proyecto Continuable con Historia",
                descripcion: "Conserva participantes del periodo anterior",
                estado: "INCONCLUSO",
                creadoPorId: estudianteB.id,
            },
        });
        const contextoAnterior = await crearContexto(
            proyectoHistorico.id,
            periodoAnterior.id,
            materiaAnterior.id,
            claseAnterior.id
        );
        const equipoAnterior = await prisma.equipo.create({
            data: {
                proyectoId: proyectoHistorico.id,
                proyectoPeriodoId: contextoAnterior.proyectoPeriodo.id,
                proyectoMateriaId: contextoAnterior.proyectoMateria.id,
                nombre: "Equipo histórico",
                periodoId: periodoAnterior.id,
                materiaId: materiaAnterior.id,
                claseId: claseAnterior.id,
                creadoPorId: estudianteB.id,
            },
        });
        const miembroAnterior = await prisma.equipoMiembro.create({
            data: { equipoId: equipoAnterior.id, usuarioId: estudianteB.id, rolEquipo: "LIDER" },
        });

        const proyectoDirector = await prisma.proyecto.create({
            data: { titulo: "Proyecto para Dirección", descripcion: "Continuidad por director", estado: "INCONCLUSO", creadoPorId: estudianteA.id },
        });
        const proyectoRechazo = await prisma.proyecto.create({
            data: { titulo: "Proyecto para Rechazo", descripcion: "Debe permanecer inconcluso", estado: "INCONCLUSO", creadoPorId: estudianteA.id },
        });
        const proyectoCerrado = await prisma.proyecto.create({
            data: { titulo: "Proyecto Integrador Terminado", descripcion: "Catálogo terminado", estado: "CERRADO", creadoPorId: estudianteB.id },
        });
        await crearContexto(proyectoCerrado.id, periodoAnterior.id, materiaAnterior.id, claseAnterior.id);

        const proyectoInconclusoCatalogo = await prisma.proyecto.create({
            data: { titulo: "Proyecto Integrador Pendiente", descripcion: "Catálogo inconcluso", estado: "INCONCLUSO", creadoPorId: estudianteB.id },
        });
        await crearContexto(proyectoInconclusoCatalogo.id, periodoAnterior.id, materiaAnterior.id, claseAnterior.id);

        const proyectoNoIntegrador = await prisma.proyecto.create({
            data: { titulo: "Proyecto de Materia Regular", descripcion: "No debe aparecer", estado: "ACTIVO", creadoPorId: estudianteB.id },
        });
        await crearContexto(proyectoNoIntegrador.id, periodoDestino.id, materiaNoIntegradora.id, claseNoIntegradora.id);

        const institucion = await prisma.institucion.findFirst({ where: { slug: "univ-test-0c3e1" } });
        const facultadExterna = await prisma.facultad.create({
            data: { institucionId: institucion.id, nombre: "Facultad externa E5" },
        });
        const carreraExterna = await prisma.carrera.create({
            data: { idFacultad: facultadExterna.id, nombre: "Carrera externa E5", sigla: "E5X" },
        });
        const passwordHash = await bcrypt.hash(PASSWORD, 10);
        const directorExterno = await prisma.usuario.create({
            data: {
                nombre: "Director",
                apellido: "Externo E5",
                telefono: "70000999",
                ci: 2099999,
                correo: "director.externo.e5@unifranz.edu.bo",
                password: passwordHash,
                idRol: rolDirector.id,
                activo: true,
                esDirector: true,
                idFacultad: facultadExterna.id,
                idCarrera: carreraExterna.id,
            },
        });

        const proyectoActivo = await prisma.proyecto.findFirst({ where: { titulo: "Proyecto X - Continuidad" } });
        const directorDestino = await prisma.usuario.findFirst({ where: { correo: "director.sistemas.0c3e1@unifranz.edu.bo" } });
        const docenteDestino = await prisma.usuario.findFirst({ where: { correo: "docente.integrador.0c3e1@unifranz.edu.bo" } });
        const docenteOtraClase = await prisma.usuario.findFirst({ where: { correo: "docente.psicologia.0c3e1@unifranz.edu.bo" } });
        const admin = await prisma.usuario.findFirst({ where: { correo: "admin.0c3e1@unifranz.edu.bo" } });

        ids = {
            periodoAnterior: periodoAnterior.id,
            periodoDestino: periodoDestino.id,
            materiaAnterior: materiaAnterior.id,
            materiaDestino: materiaDestino.id,
            materiaNoIntegradora: materiaNoIntegradora.id,
            claseDestino: claseDestino.id,
            estudianteA: estudianteA.id,
            proyectoHistorico: proyectoHistorico.id,
            proyectoDirector: proyectoDirector.id,
            proyectoRechazo: proyectoRechazo.id,
            proyectoActivo: proyectoActivo.id,
            proyectoCerrado: proyectoCerrado.id,
            proyectoInconclusoCatalogo: proyectoInconclusoCatalogo.id,
            proyectoNoIntegrador: proyectoNoIntegrador.id,
            proyectoPeriodoAnterior: contextoAnterior.proyectoPeriodo.id,
            equipoAnterior: equipoAnterior.id,
            miembroAnterior: miembroAnterior.id,
            directorDestino: directorDestino.id,
            directorExterno: directorExterno.id,
            docenteDestino: docenteDestino.id,
            docenteOtraClase: docenteOtraClase.id,
            admin: admin.id,
        };

        tokens.estudianteA = await login(estudianteA.correo);
        tokens.docenteDestino = await login(docenteDestino.correo);
        tokens.docenteOtraClase = await login(docenteOtraClase.correo);
        tokens.directorDestino = await login(directorDestino.correo);
        tokens.directorExterno = await login(directorExterno.correo);
        tokens.admin = await login(admin.correo);
    });

    after(async () => {
        await prisma.$disconnect();
    });

    it("estudiante ajeno puede solicitar continuar un INCONCLUSO", async () => {
        const datos = {
            periodoId: ids.periodoDestino,
            materiaId: ids.materiaDestino,
            claseId: ids.claseDestino,
            motivo: "Retomar en el nuevo periodo",
        };
        const respuestaHistorico = await request(app)
            .post("/api/solicitudContinuacion")
            .set(auth(tokens.estudianteA))
            .send({ ...datos, proyectoId: ids.proyectoHistorico });
        assert.equal(respuestaHistorico.status, 201, JSON.stringify(respuestaHistorico.body));
        ids.solicitudDocente = respuestaHistorico.body.data.id;

        const respuestaDirector = await request(app)
            .post("/api/solicitudContinuacion")
            .set(auth(tokens.estudianteA))
            .send({ ...datos, proyectoId: ids.proyectoDirector });
        assert.equal(respuestaDirector.status, 201, JSON.stringify(respuestaDirector.body));
        ids.solicitudDirector = respuestaDirector.body.data.id;

        const respuestaRechazo = await request(app)
            .post("/api/solicitudContinuacion")
            .set(auth(tokens.estudianteA))
            .send({ ...datos, proyectoId: ids.proyectoRechazo });
        assert.equal(respuestaRechazo.status, 201, JSON.stringify(respuestaRechazo.body));
        ids.solicitudRechazo = respuestaRechazo.body.data.id;
    });

    it("ACTIVO no puede solicitarse", async () => {
        const respuesta = await request(app).post("/api/solicitudContinuacion").set(auth(tokens.estudianteA)).send({
            proyectoId: ids.proyectoActivo,
            periodoId: ids.periodoDestino,
            materiaId: ids.materiaDestino,
            claseId: ids.claseDestino,
        });
        assert.equal(respuesta.status, 403);
    });

    it("CERRADO no puede retomarse", async () => {
        const respuesta = await request(app).post("/api/solicitudContinuacion").set(auth(tokens.estudianteA)).send({
            proyectoId: ids.proyectoCerrado,
            periodoId: ids.periodoDestino,
            materiaId: ids.materiaDestino,
            claseId: ids.claseDestino,
        });
        assert.equal(respuesta.status, 403);
    });

    it("Admin no aprueba actos académicos", async () => {
        const respuesta = await request(app)
            .put(`/api/solicitudContinuacion/${ids.solicitudDocente}/resolver`)
            .set(auth(tokens.admin))
            .send({ estado: "APROBADA" });
        assert.equal(respuesta.status, 403);
    });

    it("docente de otra clase no aprueba", async () => {
        const respuesta = await request(app)
            .put(`/api/solicitudContinuacion/${ids.solicitudDocente}/resolver`)
            .set(auth(tokens.docenteOtraClase))
            .send({ estado: "APROBADA" });
        assert.equal(respuesta.status, 403);
    });

    it("docente destino sí puede aprobar", async () => {
        const respuesta = await request(app)
            .put(`/api/solicitudContinuacion/${ids.solicitudDocente}/resolver`)
            .set(auth(tokens.docenteDestino))
            .send({ estado: "APROBADA", respuesta: "Aprobada por docente destino" });
        assert.equal(respuesta.status, 200, JSON.stringify(respuesta.body));
        assert.equal(respuesta.body.data.estado, "APROBADA");
        ids.proyectoPeriodoNuevo = respuesta.body.data.contexto.proyectoPeriodo.id;
        ids.proyectoMateriaNuevo = respuesta.body.data.contexto.proyectoMateria.id;
        ids.equipoNuevo = respuesta.body.data.contexto.equipo.id;
    });

    it("Director de otra carrera no aprueba", async () => {
        const respuesta = await request(app)
            .put(`/api/solicitudContinuacion/${ids.solicitudDirector}/resolver`)
            .set(auth(tokens.directorExterno))
            .send({ estado: "APROBADA" });
        assert.equal(respuesta.status, 403);
    });

    it("Director destino sí puede aprobar", async () => {
        const respuesta = await request(app)
            .put(`/api/solicitudContinuacion/${ids.solicitudDirector}/resolver`)
            .set(auth(tokens.directorDestino))
            .send({ estado: "APROBADA", respuesta: "Aprobada por dirección" });
        assert.equal(respuesta.status, 200, JSON.stringify(respuesta.body));
        assert.equal(respuesta.body.data.estado, "APROBADA");
        assert.equal(respuesta.body.data.aprobadorId, ids.directorDestino);
    });

    it("autoridad destino puede rechazar sin crear contexto", async () => {
        const respuesta = await request(app)
            .put(`/api/solicitudContinuacion/${ids.solicitudRechazo}/resolver`)
            .set(auth(tokens.docenteDestino))
            .send({ estado: "RECHAZADA", respuesta: "No cumple condiciones" });
        assert.equal(respuesta.status, 200);
        assert.equal(respuesta.body.data.estado, "RECHAZADA");
        assert.equal(await prisma.proyectoPeriodo.count({ where: { proyectoId: ids.proyectoRechazo } }), 0);
        assert.equal((await prisma.proyecto.findUnique({ where: { id: ids.proyectoRechazo } })).estado, "INCONCLUSO");
    });

    it("aprobación crea contexto del nuevo periodo", async () => {
        const proyectoPeriodo = await prisma.proyectoPeriodo.findUnique({
            where: { id: ids.proyectoPeriodoNuevo },
            include: { hitos: true, proyectosMateria: true, equipos: { include: { miembros: true } } },
        });
        assert.equal(proyectoPeriodo.periodoId, ids.periodoDestino);
        assert.equal(proyectoPeriodo.hitos.length, 5);
        assert.ok(proyectoPeriodo.proyectosMateria.some((registro) => registro.id === ids.proyectoMateriaNuevo));
        assert.ok(proyectoPeriodo.equipos.some((equipo) =>
            equipo.id === ids.equipoNuevo
            && equipo.miembros.some((miembro) => miembro.usuarioId === ids.estudianteA && miembro.activo)
        ));
    });

    it("historial anterior permanece", async () => {
        const [proyectoPeriodo, equipo, miembro] = await Promise.all([
            prisma.proyectoPeriodo.findUnique({ where: { id: ids.proyectoPeriodoAnterior }, include: { hitos: true } }),
            prisma.equipo.findUnique({ where: { id: ids.equipoAnterior } }),
            prisma.equipoMiembro.findUnique({ where: { id: ids.miembroAnterior } }),
        ]);
        assert.ok(proyectoPeriodo);
        assert.equal(proyectoPeriodo.hitos.length, 5);
        assert.ok(equipo);
        assert.ok(miembro);
    });

    it("Proyecto vuelve a ACTIVO", async () => {
        const proyecto = await prisma.proyecto.findUnique({ where: { id: ids.proyectoHistorico } });
        assert.equal(proyecto.estado, "ACTIVO");
    });

    it("catálogo solo muestra materias esIntegrador=true", async () => {
        const respuesta = await request(app).get("/api/proyecto/catalogo/integradores").set(auth(tokens.estudianteA));
        assert.equal(respuesta.status, 200);
        assert.ok(!respuesta.body.data.some((proyecto) => proyecto.id === ids.proyectoNoIntegrador));
        assert.ok(respuesta.body.data.every((proyecto) =>
            proyecto.materiasIntegradoras.length > 0
            && proyecto.materiasIntegradoras.every((materia) => materia.id !== ids.materiaNoIntegradora)
        ));
        assert.ok(respuesta.body.data.every((proyecto) => proyecto.repoUrl === undefined && proyecto.documentos === undefined));
    });

    it("estados se etiquetan correctamente", async () => {
        const respuesta = await request(app).get("/api/proyecto/catalogo/integradores").set(auth(tokens.estudianteA));
        const etiquetas = new Map(respuesta.body.data.map((proyecto) => [proyecto.estado, proyecto.etiqueta]));
        assert.equal(etiquetas.get("ACTIVO"), "En proceso");
        assert.equal(etiquetas.get("CERRADO"), "Terminado");
        assert.equal(etiquetas.get("INCONCLUSO"), "Inconcluso");
    });

    it("filtros de catálogo funcionan", async () => {
        const casos = [
            ["estado", "CERRADO", (proyecto) => proyecto.estado === "CERRADO"],
            ["periodoId", ids.periodoDestino, (proyecto) => proyecto.periodos.some((periodo) => periodo.id === ids.periodoDestino)],
            ["materiaId", ids.materiaAnterior, (proyecto) => proyecto.materiasIntegradoras.some((materia) => materia.id === ids.materiaAnterior)],
            ["texto", "Terminado", (proyecto) => proyecto.titulo.includes("Terminado") || proyecto.descripcion.includes("Terminado")],
        ];

        for (const [filtro, valor, cumple] of casos) {
            const respuesta = await request(app)
                .get("/api/proyecto/catalogo/integradores")
                .query({ [filtro]: valor })
                .set(auth(tokens.estudianteA));
            assert.equal(respuesta.status, 200, `${filtro}: ${JSON.stringify(respuesta.body)}`);
            assert.ok(respuesta.body.data.length > 0, filtro);
            assert.ok(respuesta.body.data.every(cumple), filtro);
        }
    });

    it("catálogo no concede acceso al proyecto ni a sus recursos", async () => {
        const catalogo = await request(app)
            .get("/api/proyecto/catalogo/integradores")
            .query({ texto: "Terminado" })
            .set(auth(tokens.estudianteA));
        assert.ok(catalogo.body.data.some((proyecto) => proyecto.id === ids.proyectoCerrado));

        const detalle = await request(app)
            .get(`/api/proyecto/${ids.proyectoCerrado}`)
            .set(auth(tokens.estudianteA));
        assert.equal(detalle.status, 403);
    });
});
