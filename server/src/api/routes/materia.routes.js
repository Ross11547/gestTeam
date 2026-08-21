import { Router } from "express";
import {
  listarMateria,
  obtenerMateria,
  crearMateria,
  actualizarMateria,
  eliminarMateria,
  listarMateriaPorSemestre,
  listarMateriaPorCarrera,
  listarMateriasMias,
  obtenerRelacionesMateria,
} from "../controllers/materia.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const soloAdmin = autorizarRoles("Admin");

router.get("/materia", listarMateria);
router.get("/materia/by-semestre", listarMateriaPorSemestre);
router.get("/materia/by-carrera", listarMateriaPorCarrera);

router.get("/materias/mias", listarMateriasMias);

router.get("/materia/:id/relaciones", obtenerRelacionesMateria);
router.get("/materia/:id", obtenerMateria);

router.post("/materia", soloAdmin, crearMateria);
router.put("/materia/:id", soloAdmin, actualizarMateria);
router.delete("/materia/:id", soloAdmin, eliminarMateria);

export default router;
