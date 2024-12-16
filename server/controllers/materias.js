import express from "express";
import { PrismaClient } from "@prisma/client";
const app = express();
const prisma = new PrismaClient();

app.get("/materia", async (req, res) => {
  try {
    const materia = await prisma.materia.findMany({});
    res.json({
      data: materia,
      message: "materiaes obtenidos correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener materia",
      error: error.message,
    });
  }
});

app.post("/materia", async (req, res) => {
  try {
    const materia = await prisma.materia.create({
      data: req.body,
    });
    res.json({
      data: materia,
      message: "materia creado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al agregar materia",
      error: error.message,
    });
  }
});
app.put("/materia/:id", async (req, res) => {
  try {
    const materia = await prisma.materia.update({
      where: {
        ci: Number(req.params.id),
      },
      data: req.body,
    });
    res.json({
      data: materia,
      message: "materia actualizado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar materia",
      error: error.message,
    });
  }
});
app.delete("/materia/:id", async (req, res) => {
  try {
    const materia = await prisma.materia.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.json({
      data: materia,
      message: "materia eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar materia",
      error: error.message,
    });
  }
});
app.get("/materia/:id", async (req, res) => {
  try {
    const materia = await prisma.materia.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    res.json({
      data: materia,
      message: "materia obtenido correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener materia",
      error: error.message,
    });
  }
});

export default app;
