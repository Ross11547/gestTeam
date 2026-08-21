export function erroresMiddleware(err, req, res, next) {
  console.error("[ERROR]", err);

  // Errores de validación de esquema (zod).
  if (err.name === "ZodError") {
    return res.status(400).json({
      error: "Datos inválidos",
      mensaje: "Datos inválidos",
      detalles: err.issues || [],
    });
  }

  // Errores conocidos de Prisma: traducir a códigos HTTP correctos.
  if (err.code === "P2002") {
    return res.status(409).json({
      error: "El registro ya existe",
      mensaje: err.meta?.target?.length
        ? `Valor duplicado en: ${err.meta.target.join(", ")}`
        : "El registro ya existe",
    });
  }
  if (err.code === "P2003") {
    return res.status(409).json({
      error: "Operación bloqueada",
      mensaje: "La operación afecta registros relacionados existentes",
    });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ error: "No encontrado", mensaje: "El registro indicado no existe" });
  }

  // Los errores de dominio pueden exponer estadoHttp (módulo pizarra).
  const status = err.statusCode || err.status || err.estadoHttp || 500;

  return res.status(status).json({
    error: err.message || "Error interno del servidor",
    mensaje: err.message || "Error interno del servidor",
  });
}
