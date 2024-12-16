import express from "express";
import { PrismaClient } from "@prisma/client";
const app = express();
const prisma = new PrismaClient();

app.get("/facultad", async (req, res) => {
  try {
    const facultad = await prisma.facultad.findMany({});
    res.json({
      data: facultad,
      message: "Facultades obtenidos correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener facultad",
      error: error.message,
    });
  }
});

app.post("/facultad", async (req, res) => {
  try {
    const facultad = await prisma.facultad.create({
      data: req.body,
    });
    res.json({
      data: facultad,
      message: "facultad creado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al agregar facultad",
      error: error.message,
    });
  }
});
app.put("/facultad/:id", async (req, res) => {
  try {
    const facultad = await prisma.facultad.update({
      where: {
        ci: Number(req.params.id),
      },
      data: req.body,
    });
    res.json({
      data: facultad,
      message: "facultad actualizado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar facultad",
      error: error.message,
    });
  }
});
app.delete("/facultad/:id", async (req, res) => {
  try {
    const facultad = await prisma.facultad.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.json({
      data: facultad,
      message: "facultad eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar facultad",
      error: error.message,
    });
  }
});
app.get("/facultad/:id", async (req, res) => {
  try {
    const facultad = await prisma.facultad.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    res.json({
      data: facultad,
      message: "facultad obtenido correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener facultad",
      error: error.message,
    });
  }
});

export default app;
