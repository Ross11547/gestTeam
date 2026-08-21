import { Router } from "express";
import { resumenDashboard, crecimientoEstudiantes } from "../controllers/dashboard.controller.js";
import { autorizarRoles } from "../middleware/autenticacionMiddleware.js";

const router = Router();

const soloStaff = autorizarRoles("Admin", "Director", "Docente");

router.get("/dashboard/summary", soloStaff, resumenDashboard);
router.get("/dashboard/student-growth", soloStaff, crecimientoEstudiantes);

export default router;
