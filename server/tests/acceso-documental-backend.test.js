// Ejecutar exclusivamente sobre gestteam_test.
import { config } from "dotenv";
config({ path: ".env.test", override: true });

import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import request from "supertest";
import { app } from "../index.js";
import { seedFase0C3E1 } from "../prisma/seed.fase0c3e1.js";

const prisma = new PrismaClient();
const PASSWORD = "TestPass0C3E1!";
const ids = {};
const tokens = {};

function auth(token) {
    return { Authorization: `Bearer ${token}` };
}

async function login(correo) {
    const respuesta = await request(app).post("/api/login").send({ correo, password: PASSWORD });
    assert.equal(respuesta.status, 200, JSON.stringify(respuesta.body));
    return respuesta.body.token;
}

async function crearContextoConDocumento({ titulo, estado, creadorId, materiaId, claseId, periodoId, autorId }) {
    const proyecto = await prisma.proyecto.create({
        data: { titulo, estado, tipoGrupo: "GRUPAL", creadoPorId: creadorId },
    });
    const proyectoPeriodo = await prisma.proyectoPeriodo.create({
        data: { proyectoId: proyecto.id, periodoId, estado: "CERRADO_PERIODO" },
    });
    const proyectoMateria = await prisma.proyectoMateria.create({
        data: { proyectoId: proyecto.id, materiaId, periodoId, claseId, proyectoPeriodoId: proyectoPeriodo.id },
    });
    const equipo = await prisma.equipo.create({
        data: {
            proyectoId: proyecto.id,
            proyectoPeriodoId: proyectoPeriodo.id,
            proyectoMateriaId: proyectoMateria.id,
            materiaId,
            periodoId,
            claseId,
            creadoPorId: creadorId,
            nombre: `Equipo ${titulo}`,
        },
    });
    const hito = await prisma.hitoProyecto.create({
        data: { proyectoId: proyecto.id, proyectoPeriodoId: proyectoPeriodo.id, orden: 1, nombre: "Entrega documental" },
    });
    const entrega = await prisma.entregaHito.create({
        data: { hitoId: hito.id, equipoId: equipo.id, autorId, estado: "ENTREGADO" },
    });
    const documento = await prisma.documento.create({
        data: {
            nombre: `${titulo}.pdf`,
            ruta: `uploads/${titulo.replaceAll(" ", "-")}.pdf`,
            mimetype: "application/pdf",
            tamano: 128,
            tipo: "INFORME",
            usuarioId: autorId,
            entregaId: entrega.id,
        },
    });
    return { proyecto, proyectoMateria, equipo, hito, entrega, documento };
}

describe("Acceso documental contextual", () => {
    before(async () => {
        const { ids: base } = await seedFase0C3E1();
        Object.assign(ids, base);

        const [periodo, materiaSistemas, materiaPsicologia, proyectoColaborativo, usuarios, roles, institucion] = await Promise.all([
            prisma.periodoAcademico.findUnique({ where: { id: ids.periodo2026_2 } }),
            prisma.materia.findUnique({ where: { id: ids.materiaIntegrador2 } }),
            prisma.materia.findUnique({ where: { id: ids.materiaPsicologia } }),
            prisma.proyecto.findUnique({ where: { id: ids.proyectoY } }),
            prisma.usuario.findMany({ include: { rol: true } }),
            prisma.rol.findMany(),
            prisma.institucion.findUnique({ where: { id: ids.institucion } }),
        ]);
        const porCorreo = Object.fromEntries(usuarios.map((usuario) => [usuario.correo, usuario]));
        const rolPorNombre = Object.fromEntries(roles.map((rol) => [rol.nombre, rol.id]));
        const estudianteA = porCorreo["estudiante.a.0c3e1@unifranz.edu.bo"];
        const estudianteB = porCorreo["estudiante.b.0c3e1@unifranz.edu.bo"];
        const estudianteC = porCorreo["estudiante.c.0c3e1@unifranz.edu.bo"];
        const estudianteD = porCorreo["estudiante.d.0c3e1@unifranz.edu.bo"];

        const pmSistemas = await prisma.proyectoMateria.findFirst({
            where: { proyectoId: proyectoColaborativo.id, materiaId: materiaSistemas.id },
        });
        const pmPsicologia = await prisma.proyectoMateria.findFirst({
            where: { proyectoId: proyectoColaborativo.id, materiaId: materiaPsicologia.id },
        });
        const equipoSistemas = await prisma.equipo.findFirst({ where: { proyectoMateriaId: pmSistemas.id } });
        const equipoPsicologia = await prisma.equipo.findFirst({ where: { proyectoMateriaId: pmPsicologia.id } });
        const hito = await prisma.hitoProyecto.findFirst({ where: { proyectoPeriodoId: pmSistemas.proyectoPeriodoId } });
        const entregaSistemas = await prisma.entregaHito.create({
            data: { hitoId: hito.id, equipoId: equipoSistemas.id, autorId: estudianteA.id, estado: "ENTREGADO" },
        });
        const entregaPsicologia = await prisma.entregaHito.create({
            data: { hitoId: hito.id, equipoId: equipoPsicologia.id, autorId: estudianteC.id, estado: "ENTREGADO" },
        });
        const documentoSistemas = await prisma.documento.create({
            data: {
                nombre: "Informe Sistemas.pdf",
                ruta: "uploads/informe-sistemas.pdf",
                mimetype: "application/pdf",
                tamano: 200,
                tipo: "INFORME",
                usuarioId: estudianteA.id,
                entregaId: entregaSistemas.id,
                contenidoTexto: "Contenido privado",
            },
        });
        const documentoPsicologia = await prisma.documento.create({
            data: {
                nombre: "Informe Psicologia.pdf",
                ruta: "uploads/informe-psicologia.pdf",
                mimetype: "application/pdf",
                tamano: 220,
                tipo: "INFORME",
                usuarioId: estudianteC.id,
                entregaId: entregaPsicologia.id,
            },
        });
        const entregaBorrador = await prisma.entregaHito.create({
            data: { hitoId: hito.id, equipoId: equipoSistemas.id, autorId: estudianteA.id, estado: "BORRADOR" },
        });
        const documentoBorrador = await prisma.documento.create({
            data: {
                nombre: "Borrador privado Sistemas.pdf",
                ruta: "uploads/borrador-privado-sistemas.pdf",
                mimetype: "application/pdf",
                tamano: 180,
                tipo: "INFORME",
                usuarioId: estudianteA.id,
                entregaId: entregaBorrador.id,
                contenidoTexto: "Borrador que no debe enumerarse",
            },
        });
        const evaluacion = await prisma.evaluacionHito.create({
            data: {
                hitoProyectoId: hito.id,
                proyectoMateriaId: pmSistemas.id,
                evaluadorId: ids.docenteIntegrador,
                tipoEvaluador: "DOCENTE",
                puntaje: 87,
                comentario: "Evaluación privada",
            },
        });
        await prisma.revisionEntrega.create({
            data: { entregaId: entregaSistemas.id, revisorId: ids.docenteIntegrador, nota: 87, feedback: "Feedback privado" },
        });

        const facultadAjena = await prisma.facultad.create({
            data: { institucionId: institucion.id, nombre: "Facultad Ajena Acceso Documental" },
        });
        const carreraAjena = await prisma.carrera.create({
            data: { idFacultad: facultadAjena.id, nombre: "Carrera Ajena Acceso Documental", sigla: "CAD" },
        });
        const directorAjeno = await prisma.usuario.create({
            data: {
                nombre: "Director",
                apellido: "Ajeno",
                telefono: "79990001",
                ci: 2999001,
                correo: "director.ajeno.acceso@unifranz.edu.bo",
                password: await bcrypt.hash(PASSWORD, 10),
                idRol: rolPorNombre.Director,
                activo: true,
                esDirector: true,
                idFacultad: facultadAjena.id,
                idCarrera: carreraAjena.id,
            },
        });
        await prisma.materia.update({
            where: { id: materiaPsicologia.id },
            data: { idCarrera: carreraAjena.id },
        });
        const documentoComunSinContexto = await prisma.documento.create({
            data: {
                nombre: "Documento comun multidisciplinario.pdf",
                ruta: "uploads/documento-comun.pdf",
                mimetype: "application/pdf",
                tamano: 240,
                tipo: "INFORME",
                usuarioId: estudianteA.id,
            },
        });

        const cerrado = await crearContextoConDocumento({
            titulo: "Proyecto Cerrado Acceso",
            estado: "CERRADO",
            creadorId: estudianteA.id,
            materiaId: materiaSistemas.id,
            claseId: pmSistemas.claseId,
            periodoId: periodo.id,
            autorId: estudianteA.id,
        });
        const inconcluso = await crearContextoConDocumento({
            titulo: "Proyecto Inconcluso Acceso",
            estado: "INCONCLUSO",
            creadorId: estudianteA.id,
            materiaId: materiaSistemas.id,
            claseId: pmSistemas.claseId,
            periodoId: periodo.id,
            autorId: estudianteA.id,
        });
        const privado = await crearContextoConDocumento({
            titulo: "Proyecto Privado Acceso",
            estado: "BORRADOR",
            creadorId: estudianteA.id,
            materiaId: materiaSistemas.id,
            claseId: pmSistemas.claseId,
            periodoId: periodo.id,
            autorId: estudianteA.id,
        });

        Object.assign(ids, {
            estudianteA: estudianteA.id,
            estudianteB: estudianteB.id,
            estudianteD: estudianteD.id,
            directorAjeno: directorAjeno.id,
            pmSistemas: pmSistemas.id,
            pmPsicologia: pmPsicologia.id,
            entregaSistemas: entregaSistemas.id,
            documentoSistemas: documentoSistemas.id,
            documentoPsicologia: documentoPsicologia.id,
            documentoBorrador: documentoBorrador.id,
            documentoComunSinContexto: documentoComunSinContexto.id,
            evaluacion: evaluacion.id,
            proyectoCerrado: cerrado.proyecto.id,
            pmCerrado: cerrado.proyectoMateria.id,
            documentoCerrado: cerrado.documento.id,
            proyectoInconcluso: inconcluso.proyecto.id,
            pmInconcluso: inconcluso.proyectoMateria.id,
            documentoInconcluso: inconcluso.documento.id,
            proyectoPrivado: privado.proyecto.id,
            pmPrivado: privado.proyectoMateria.id,
            documentoPrivado: privado.documento.id,
        });

        tokens.admin = await login("admin.0c3e1@unifranz.edu.bo");
        tokens.director = await login("director.sistemas.0c3e1@unifranz.edu.bo");
        tokens.directorAjeno = await login("director.ajeno.acceso@unifranz.edu.bo");
        tokens.docente = await login("docente.integrador.0c3e1@unifranz.edu.bo");
        tokens.docenteAjeno = await login("docente.psicologia.0c3e1@unifranz.edu.bo");
        tokens.estudianteAutor = await login("estudiante.a.0c3e1@unifranz.edu.bo");
        tokens.estudianteB = await login("estudiante.b.0c3e1@unifranz.edu.bo");
        tokens.estudiante = await login("estudiante.d.0c3e1@unifranz.edu.bo");
    });

    after(async () => {
        await prisma.$disconnect();
    });

    it("metadata pública del proyecto ajeno no requiere una solicitud", async () => {
        assert.equal(await prisma.solicitudAccesoProyecto.count({ where: { solicitanteId: ids.estudianteD } }), 0);
        const respuesta = await request(app)
            .get(`/api/proyecto/catalogo/${ids.proyectoY}`)
            .set(auth(tokens.estudiante));
        assert.equal(respuesta.status, 200, JSON.stringify(respuesta.body));
        assert.equal(respuesta.body.data.puedeAbrirWorkspace, false);
    });

    it("estudiante puede listar documentos solicitables de un proyecto publicable", async () => {
        const respuesta = await request(app)
            .get(`/api/proyecto/catalogo/${ids.proyectoY}/documentos-solicitables`)
            .set(auth(tokens.estudiante));
        assert.equal(respuesta.status, 200, JSON.stringify(respuesta.body));
        assert.equal(respuesta.body.data.proyectoId, ids.proyectoY);
        assert.ok(respuesta.body.data.contextos.some((contexto) => contexto.proyectoMateriaId === ids.pmSistemas));
        assert.ok(respuesta.body.data.contextos.some((contexto) => contexto.proyectoMateriaId === ids.pmPsicologia));
    });

    it("estudiante no accede al contenido antes de la aprobación", async () => {
        const metadata = await request(app)
            .get(`/api/documentos/${ids.documentoSistemas}`)
            .set(auth(tokens.estudiante));
        const descarga = await request(app)
            .get(`/api/documentos/${ids.documentoSistemas}/descargar`)
            .set(auth(tokens.estudiante));
        assert.equal(metadata.status, 403);
        assert.equal(descarga.status, 403);
    });

    it("los documentos permanecen aislados por ProyectoMateria", async () => {
        const respuesta = await request(app)
            .get(`/api/proyecto/catalogo/${ids.proyectoY}/documentos-solicitables`)
            .set(auth(tokens.estudiante));
        const sistemas = respuesta.body.data.contextos.find((contexto) => contexto.proyectoMateriaId === ids.pmSistemas);
        const psicologia = respuesta.body.data.contextos.find((contexto) => contexto.proyectoMateriaId === ids.pmPsicologia);
        assert.ok(sistemas.documentos.some((documento) => documento.id === ids.documentoSistemas));
        assert.ok(!sistemas.documentos.some((documento) => documento.id === ids.documentoPsicologia));
        assert.ok(psicologia.documentos.some((documento) => documento.id === ids.documentoPsicologia));
        assert.ok(!psicologia.documentos.some((documento) => documento.id === ids.documentoSistemas));
    });

    it("IDs manipulados no exponen metadata privada", async () => {
        const respuesta = await request(app)
            .get(`/api/proyecto/catalogo/${ids.proyectoPrivado}/documentos-solicitables`)
            .set(auth(tokens.estudiante));
        assert.equal(respuesta.status, 404);
        assert.ok(!JSON.stringify(respuesta.body).includes("Proyecto Privado Acceso"));
        assert.ok(!JSON.stringify(respuesta.body).includes(".pdf"));

        const solicitud = await request(app)
            .post("/api/solicitud-acceso")
            .set(auth(tokens.estudianteB))
            .send({ proyectoId: ids.proyectoY, proyectoMateriaId: ids.pmSistemas, documentoIds: [2147483647] });
        assert.equal(solicitud.status, 409);
        assert.deepEqual(Object.keys(solicitud.body).sort(), ["error", "mensaje"]);
        assert.equal(solicitud.body.mensaje, "Uno o más documentos no son solicitables en el contexto indicado");
    });

    it("documentos no solicitables no aparecen ni pueden solicitarse", async () => {
        const listado = await request(app)
            .get(`/api/proyecto/catalogo/${ids.proyectoY}/documentos-solicitables`)
            .set(auth(tokens.estudiante));
        assert.ok(!JSON.stringify(listado.body).includes("Borrador privado Sistemas.pdf"));
        assert.ok(!JSON.stringify(listado.body).includes("Borrador que no debe enumerarse"));

        const solicitud = await request(app)
            .post("/api/solicitud-acceso")
            .set(auth(tokens.estudianteB))
            .send({ proyectoId: ids.proyectoY, proyectoMateriaId: ids.pmSistemas, documentoIds: [ids.documentoBorrador] });
        assert.equal(solicitud.status, 409);
    });

    it("proyecto o contexto inexistente devuelve una respuesta opaca", async () => {
        const proyecto = await request(app)
            .get("/api/proyecto/catalogo/2147483647/documentos-solicitables")
            .set(auth(tokens.estudiante));
        assert.equal(proyecto.status, 404);

        const contexto = await request(app)
            .post("/api/solicitud-acceso")
            .set(auth(tokens.estudianteB))
            .send({ proyectoId: ids.proyectoY, proyectoMateriaId: 2147483647, documentoIds: [ids.documentoSistemas] });
        assert.equal(contexto.status, 409);
        assert.ok(!JSON.stringify(contexto.body).includes("Informe Sistemas.pdf"));
    });

    it("estudiante puede solicitar documentos contextuales de un proyecto ajeno publicable", async () => {
        const respuesta = await request(app)
            .post("/api/solicitud-acceso")
            .set(auth(tokens.estudiante))
            .send({
                proyectoId: ids.proyectoY,
                proyectoMateriaId: ids.pmSistemas,
                documentoIds: [ids.documentoSistemas],
                motivo: "Consulta como referencia académica",
            });
        assert.equal(respuesta.status, 201, JSON.stringify(respuesta.body));
        assert.equal(respuesta.body.data.estado, "PENDIENTE");
        assert.equal(respuesta.body.data.tipo, "DOCUMENTOS");
        ids.solicitudActiva = respuesta.body.data.id;
    });

    it("estudiante no puede autoaprobarse y el autor original no obtiene autoridad", async () => {
        const autoaprobacion = await request(app)
            .put(`/api/solicitud-acceso/${ids.solicitudActiva}/resolver`)
            .set(auth(tokens.estudiante))
            .send({ estado: "APROBADA" });
        assert.equal(autoaprobacion.status, 403);

        const autorOriginal = await request(app)
            .put(`/api/solicitud-acceso/${ids.solicitudActiva}/resolver`)
            .set(auth(tokens.estudianteAutor))
            .send({ estado: "APROBADA" });
        assert.equal(autorOriginal.status, 403);
    });

    it("Admin, docente ajeno y Director no competente no pueden resolver proyecto ACTIVO", async () => {
        for (const token of [tokens.admin, tokens.docenteAjeno, tokens.director]) {
            const respuesta = await request(app)
                .put(`/api/solicitud-acceso/${ids.solicitudActiva}/resolver`)
                .set(auth(token))
                .send({ estado: "APROBADA" });
            assert.equal(respuesta.status, 403, JSON.stringify(respuesta.body));
        }
    });

    it("docente real del contexto ACTIVO aprueba sin conceder membresía ni Workspace", async () => {
        const miembrosAntes = await prisma.miembroProyecto.count({
            where: { proyectoId: ids.proyectoY, usuarioId: ids.estudianteD },
        });
        const respuesta = await request(app)
            .put(`/api/solicitud-acceso/${ids.solicitudActiva}/resolver`)
            .set(auth(tokens.docente))
            .send({ estado: "APROBADA", respuesta: "Consulta documental aprobada" });
        assert.equal(respuesta.status, 200, JSON.stringify(respuesta.body));
        assert.equal(respuesta.body.data.estado, "APROBADA");
        assert.ok(respuesta.body.data.resueltoEn);

        const miembrosDespues = await prisma.miembroProyecto.count({
            where: { proyectoId: ids.proyectoY, usuarioId: ids.estudianteD },
        });
        assert.equal(miembrosAntes, 0);
        assert.equal(miembrosDespues, 0);

        const catalogo = await request(app)
            .get(`/api/proyecto/catalogo/${ids.proyectoY}`)
            .set(auth(tokens.estudiante));
        assert.equal(catalogo.status, 200);
        assert.equal(catalogo.body.data.puedeAbrirWorkspace, false);
    });

    it("la aprobación concede solo metadata del documento aprobado", async () => {
        const aprobado = await request(app)
            .get(`/api/documentos/${ids.documentoSistemas}`)
            .set(auth(tokens.estudiante));
        assert.equal(aprobado.status, 200, JSON.stringify(aprobado.body));
        assert.equal(aprobado.body.data.id, ids.documentoSistemas);
        assert.ok(!("ruta" in aprobado.body.data));
        assert.ok(!("contenidoTexto" in aprobado.body.data));

        const noAprobado = await request(app)
            .get(`/api/documentos/${ids.documentoPsicologia}`)
            .set(auth(tokens.estudiante));
        assert.equal(noAprobado.status, 403);
    });

    it("la aprobación no concede entregas, notas, evaluaciones, revisiones ni feedback", async () => {
        const entrega = await request(app)
            .get(`/api/entrega/${ids.entregaSistemas}`)
            .set(auth(tokens.estudiante));
        assert.equal(entrega.status, 403);

        const evaluacion = await request(app)
            .get(`/api/evaluacionHito/${ids.evaluacion}`)
            .set(auth(tokens.estudiante));
        assert.equal(evaluacion.status, 403);

        const revisiones = await request(app)
            .get(`/api/revision/by-entrega?entregaId=${ids.entregaSistemas}`)
            .set(auth(tokens.estudiante));
        assert.equal(revisiones.status, 403);
    });

    it("la aprobación no concede GitHub ni control sobre el proyecto", async () => {
        const membresia = await prisma.miembroProyecto.findUnique({
            where: { proyectoId_usuarioId: { proyectoId: ids.proyectoY, usuarioId: ids.estudianteD } },
        });
        const membresiaEquipo = await prisma.equipoMiembro.findFirst({
            where: { usuarioId: ids.estudianteD, equipo: { proyectoId: ids.proyectoY } },
        });
        assert.equal(membresia, null);
        assert.equal(membresiaEquipo, null);

        const mutacion = await request(app)
            .put(`/api/proyecto/${ids.proyectoY}`)
            .set(auth(tokens.estudiante))
            .send({ descripcion: "Intento de control" });
        assert.equal(mutacion.status, 403);
    });

    it("cambiar proyecto, documento o contexto no produce IDOR", async () => {
        const cuerpos = [
            { proyectoId: ids.proyectoX, proyectoMateriaId: ids.pmSistemas, documentoIds: [ids.documentoSistemas] },
            { proyectoId: ids.proyectoY, proyectoMateriaId: ids.pmSistemas, documentoIds: [ids.documentoPsicologia] },
            { proyectoId: ids.proyectoY, proyectoMateriaId: ids.pmPsicologia, documentoIds: [ids.documentoSistemas] },
        ];
        for (const cuerpo of cuerpos) {
            const respuesta = await request(app)
                .post("/api/solicitud-acceso")
                .set(auth(tokens.estudianteB))
                .send(cuerpo);
            assert.equal(respuesta.status, 409, JSON.stringify(respuesta.body));
        }
    });

    it("proyecto colaborativo con documentos de varios contextos queda protegido", async () => {
        const mezclada = await request(app)
            .post("/api/solicitud-acceso")
            .set(auth(tokens.estudianteB))
            .send({
                proyectoId: ids.proyectoY,
                proyectoMateriaId: ids.pmSistemas,
                documentoIds: [ids.documentoSistemas, ids.documentoPsicologia],
            });
        assert.equal(mezclada.status, 409);

        const comunSinPolitica = await request(app)
            .post("/api/solicitud-acceso")
            .set(auth(tokens.estudianteB))
            .send({
                proyectoId: ids.proyectoY,
                proyectoMateriaId: ids.pmSistemas,
                documentoIds: [ids.documentoComunSinContexto],
            });
        assert.equal(comunSinPolitica.status, 409);
    });

    it("Director ajeno recibe 403 y Director de carrera origen resuelve CERRADO", async () => {
        const creada = await request(app)
            .post("/api/solicitud-acceso")
            .set(auth(tokens.estudiante))
            .send({
                proyectoId: ids.proyectoCerrado,
                proyectoMateriaId: ids.pmCerrado,
                documentoIds: [ids.documentoCerrado],
            });
        assert.equal(creada.status, 201, JSON.stringify(creada.body));

        const ajeno = await request(app)
            .put(`/api/solicitud-acceso/${creada.body.data.id}/resolver`)
            .set(auth(tokens.directorAjeno))
            .send({ estado: "APROBADA" });
        assert.equal(ajeno.status, 403);

        const origen = await request(app)
            .put(`/api/solicitud-acceso/${creada.body.data.id}/resolver`)
            .set(auth(tokens.director))
            .send({ estado: "APROBADA" });
        assert.equal(origen.status, 200, JSON.stringify(origen.body));
    });

    it("Director de carrera origen resuelve consulta documental de INCONCLUSO", async () => {
        const creada = await request(app)
            .post("/api/solicitud-acceso")
            .set(auth(tokens.estudianteB))
            .send({
                proyectoId: ids.proyectoInconcluso,
                proyectoMateriaId: ids.pmInconcluso,
                documentoIds: [ids.documentoInconcluso],
            });
        assert.equal(creada.status, 201, JSON.stringify(creada.body));

        const respuesta = await request(app)
            .put(`/api/solicitud-acceso/${creada.body.data.id}/resolver`)
            .set(auth(tokens.director))
            .send({ estado: "APROBADA" });
        assert.equal(respuesta.status, 200, JSON.stringify(respuesta.body));
    });

    it("una solicitud rechazada no concede acceso documental", async () => {
        const creada = await request(app)
            .post("/api/solicitud-acceso")
            .set(auth(tokens.estudianteB))
            .send({
                proyectoId: ids.proyectoY,
                proyectoMateriaId: ids.pmSistemas,
                documentoIds: [ids.documentoSistemas],
            });
        assert.equal(creada.status, 201, JSON.stringify(creada.body));

        const rechazada = await request(app)
            .put(`/api/solicitud-acceso/${creada.body.data.id}/resolver`)
            .set(auth(tokens.docente))
            .send({ estado: "RECHAZADA", respuesta: "No corresponde" });
        assert.equal(rechazada.status, 200, JSON.stringify(rechazada.body));
        assert.equal(rechazada.body.data.estado, "RECHAZADA");

        const documento = await request(app)
            .get(`/api/documentos/${ids.documentoSistemas}`)
            .set(auth(tokens.estudianteB));
        assert.equal(documento.status, 403);
    });
});
