import express from "express";
import { PrismaClient } from "@prisma/client";
const app = express();
const prisma = new PrismaClient();

app.get("/carrera", async (req, res) => {
  try {
    const carrera = await prisma.carrera.findMany({});
    res.json({
      data: carrera,
      message: "Carreras obtenidos correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener carrera",
      error: error.message,
    });
  }
});

app.post("/carrera", async (req, res) => {
  try {
    const carrera = await prisma.carrera.create({
      data: req.body,
    });
    res.json({
      data: carrera,
      message: "carrera creado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al agregar carrera",
      error: error.message,
    });
  }
});
app.put("/carrera/:id", async (req, res) => {
  try {
    const carrera = await prisma.carrera.update({
      where: {
        ci: Number(req.params.id),
      },
      data: req.body,
    });
    res.json({
      data: carrera,
      message: "carrera actualizado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar carrera",
      error: error.message,
    });
  }
});
app.delete("/carrera/:id", async (req, res) => {
  try {
    const carrera = await prisma.carrera.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.json({
      data: carrera,
      message: "carrera eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar carrera",
      error: error.message,
    });
  }
});
app.get("/carrera/:id", async (req, res) => {
  try {
    const carrera = await prisma.carrera.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    res.json({
      data: carrera,
      message: "carrera obtenido correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener carrera",
      error: error.message,
    });
  }
});

export default app;
