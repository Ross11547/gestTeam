import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import cookieSession from 'cookie-session';
import path from 'path';
import { pathToFileURL } from 'url';

import passport from './src/infrastructure/github/githubAuth.js';
import { erroresMiddleware } from './src/api/middleware/erroresMiddleware.js';
import { autenticarToken } from './src/api/middleware/autenticacionMiddleware.js';
import { obtenerSecretoSesion } from './src/shared/auth/secret.js';
import institucionRutas from './src/api/routes/institucion.routes.js';
import periodoAcademicoRutas from './src/api/routes/periodoAcademico.routes.js';
import facultadRutas from './src/api/routes/facultad.routes.js';
import carreraRutas from './src/api/routes/carrera.routes.js';
import semestreRutas from './src/api/routes/semestre.routes.js';
import materiaRutas from './src/api/routes/materia.routes.js';
import horarioRutas from './src/api/routes/horario.routes.js';
import rolRutas from './src/api/routes/rol.routes.js';
import usuarioRutas from './src/api/routes/usuarios.routes.js';
import claseMateriaRutas from './src/api/routes/claseMateria.routes.js';
import inscripcionMateriaRutas from './src/api/routes/inscripcionMateria.routes.js';
import docenteMateriaRutas from './src/api/routes/docenteMateria.routes.js';
import proyectoRutas from './src/api/routes/proyecto.routes.js';
import proyectoPeriodoRutas from './src/api/routes/proyectoPeriodo.routes.js';
import proyectoMateriaRutas from './src/api/routes/proyectoMateria.routes.js';
import equipoRutas from './src/api/routes/equipo.routes.js';
import hitoRutas from './src/api/routes/hito.routes.js';
import hitoProyectoRutas from './src/api/routes/hitoProyecto.routes.js';
import entregaRutas from './src/api/routes/entrega.routes.js';
import revisionRutas from './src/api/routes/revision.routes.js';
import evaluacionProyectoRutas from './src/api/routes/evaluacionProyecto.routes.js';
import evaluacionHitoRutas from './src/api/routes/evaluacionHito.routes.js';
import solicitudContinuacionRutas from './src/api/routes/solicitudContinuacion.routes.js';
import solicitudAccesoRutas from './src/api/routes/solicitudAcceso.routes.js';
import feriaRutas from './src/api/routes/feria.routes.js';
import proyectoDestacadoRutas from './src/api/routes/proyectoDestacado.routes.js';
import cvRutas from './src/api/routes/cv.routes.js';
import reporteRutas from './src/api/routes/reporte.routes.js';
import estudianteRutas from './src/api/routes/estudiante.route.js';
import docenteRutas from './src/api/routes/docente.routes.js';
import directorRutas from './src/api/routes/director.routes.js';
import dashhoardRutas from './src/api/routes/dashboard.routes.js';
import documentosRutas from './src/api/routes/documentos.routes.js';
import pizarraRutas from './src/api/routes/pizarra.routes.js';
import proyectosGitHub from './src/infrastructure/github/githubProyectos.js';
import githubRoutes from './src/infrastructure/github/githubRutas.js';
import plagio from './src/infrastructure/similitud/plagioRoutes.js';

export const app = express();

const PORT = process.env.PORT || 3000;
const ES_DESARROLLO = process.env.NODE_ENV !== 'production';
const ORIGENES_PERMITIDOS = (
  process.env.ORIGENES_CORS ||
  process.env.FRONTEND_URL ||
  'http://localhost:5173'
)
  .split(',')
  .map((origen) => origen.trim())
  .filter(Boolean);

function esOrigenLocalhost(origen) {
  return /^https?:\/\/localhost(:\d+)?$/.test(origen);
}

app.use(
  cors({
    origin(origin, callback) {
      // Permite solicitudes sin Origin, como Postman o aplicaciones móviles.
      if (!origin) {
        return callback(null, true);
      }

      // Durante desarrollo permite cualquier puerto de localhost.
      if (ES_DESARROLLO && esOrigenLocalhost(origin)) {
        return callback(null, true);
      }

      // Permite los orígenes configurados.
      if (ORIGENES_PERMITIDOS.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  })
);

app.options('*', cors());

process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED REJECTION]', err);
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});

app.use(express.json());

app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(
  cookieSession({
    name: 'session',
    keys: [
      obtenerSecretoSesion(),
    ],
    sameSite: 'lax',
    secure: false,
    maxAge: 24 * 60 * 60 * 1000,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use('/api', autenticarToken);

app.use('/api', usuarioRutas);
app.use('/api', facultadRutas);
app.use('/api', carreraRutas);
app.use('/api', semestreRutas);
app.use('/api', materiaRutas);
app.use('/api', horarioRutas);
app.use('/api', rolRutas);
app.use('/api', estudianteRutas);
app.use('/api', docenteRutas);
app.use('/api', directorRutas);
app.use('/api', dashhoardRutas);
app.use('/api', documentosRutas);
app.use('/api', pizarraRutas);
app.use('/api', institucionRutas);
app.use('/api', periodoAcademicoRutas);
app.use('/api', claseMateriaRutas);
app.use('/api', inscripcionMateriaRutas);
app.use('/api', docenteMateriaRutas);
app.use('/api', proyectoRutas);
app.use('/api', proyectoPeriodoRutas);
app.use('/api', proyectoMateriaRutas);
app.use('/api', equipoRutas);
app.use('/api', hitoRutas);
app.use('/api', hitoProyectoRutas);
app.use('/api', entregaRutas);
app.use('/api', revisionRutas);
app.use('/api', evaluacionProyectoRutas);
app.use('/api', evaluacionHitoRutas);
app.use('/api', solicitudContinuacionRutas);
app.use('/api', solicitudAccesoRutas);
app.use('/api', feriaRutas);
app.use('/api', proyectoDestacadoRutas);
app.use('/api', cvRutas);
app.use('/api', reporteRutas);
app.use('/github', githubRoutes);
app.use('/projects', proyectosGitHub);
app.use('/api/plagio', plagio);

app.get('/', (_req, res) => {
  res.send('GestTeam Server OK');
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
  });
});

app.use(erroresMiddleware);

export function startServer(port = PORT) {
  return app.listen(port, '0.0.0.0', () => {
    console.log(
      `[server]: Server is running at http://localhost:${port}`
    );
  });
}

const archivoEjecutado = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : null;

if (archivoEjecutado === import.meta.url) {
  startServer();
}