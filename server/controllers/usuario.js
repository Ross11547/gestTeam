import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.get("/usuario", async (req, res) => {
  try {
    const usuario = await prisma.usuario.findMany({});

    res.json({
      data: usuario,
      mensaje: "usuarios obtenidos correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al traer los usuarios",
      error: error.mensaje,
    });
  }
});

app.get("/usuario/:id", async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    res.json({
      data: usuario,
      mensaje: "usuario obtenido correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al traer el usuario",
      error: error.mensaje,
    });
  }
});

app.post("/usuario", async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      telefono,
      ci,
      correo,
      password,
      confirmaPassword,
      idRol,
      activo,
    } = req.body;

    if (
      !nombre ||
      !apellido ||
      !telefono ||
      !ci ||
      !correo ||
      !password ||
      !confirmaPassword ||
      idRol === undefined ||
      activo === undefined
    ) {
      res.status(400).json({
        mensaje: "Todos los campos son obligatorios.",
      });
      return;
    }

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoValido.test(correo)) {
      res.status(400).json({
        mensaje: "El correo debe tener un formato válido.",
      });
      return;
    }

    if (password !== confirmaPassword) {
      res.status(400).json({
        mensaje: "Las contraseñas no coinciden.",
      });
      return;
    }

    if (typeof ci !== "number" || ci <= 0) {
      res.status(400).json({
        mensaje: "El CI debe ser un número válido y positivo.",
      });
      return;
    }

    const usuarioExis = await prisma.usuario.findUnique({
      where: {
        correo,
      },
    });

    if (usuarioExis) {
      res.status(400).json({
        mensaje: "El correo ingresado ya está registrado.",
      });
      return;
    }

    const usuarioCreado = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        telefono,
        ci,
        correo,
        password,
        idRol,
        activo,
      },
    });

    res.status(201).json({
      mensaje: "Usuario agregado correctamente.",
      data: usuarioCreado,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al agregar usuario.",
      error: error.message,
    });
  }
});

app.put("/usuario/:id", async (req, res) => {
  try {
    const usuario = await prisma.usuario.update({
      where: {
        id: Number(req.params.id),
      },
      data: req.body,
    });

    res.json({
      data: usuario,
      mensaje: "usuario actualizado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar usuario",
      error: error.mensaje,
    });
  }
});

app.delete("/usuario/:id", async (req, res) => {
  try {
    const usuario = await prisma.usuario.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    res.json({
      data: usuario,
      mensaje: "usuario eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar usuario",
      error: error.mensaje,
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    const login = await prisma.usuario.findFirst({
      where: {
        correo,
        password,
      },
      include: {
        rol: true,
      },
    });

    if (!login) {
      res.status(401).json({
        mensaje: "Usuario no autorizado",
      });
      return;
    }

    const { password: _, ...userWithoutPassword } = login;

    res.status(200).json({
      mensaje: "Inicio de sesión correcto",
      data: {
        ...userWithoutPassword,
        rol: login.rol.nombre,
      },
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al iniciar sesión",
      error: error.message,
    });
  }
});

export default app;
