import express from "express";
import cors from "cors";
import usuario from "./controllers/usuario.js";
import carrera from "./controllers/carrera.js";
import facultad from "./controllers/facultad.js";
import materia from "./controllers/materias.js";
import rol from "./controllers/rol.js";

const app = express();
const port = 3000;
import bodyParser from "body-parser";
app.use(cors({ origin: "*" }));
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());
app.use(usuario);
app.use(carrera);
app.use(facultad);
app.use(materia);
app.use(rol);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
