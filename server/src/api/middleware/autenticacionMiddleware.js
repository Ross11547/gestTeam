import jwt from "jsonwebtoken";
import { prisma } from "../../infrastructure/db/prisma.client.js";
import { obtenerSecretoJwt } from "../../shared/auth/secret.js";

const RUTAS_PUBLICAS = [{ metodo: "POST", ruta: "/login" }];

function esRutaPublica(req) {
    return RUTAS_PUBLICAS.some(
        (r) => req.method === r.metodo && req.path === r.ruta
    );
}

export async function autenticarToken(req, res, next) {
    if (req.method === "OPTIONS") return next();

    if (esRutaPublica(req)) return next();

    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;

    if (!token) {
        return res.status(401).json({
            error: "No autenticado",
            mensaje: "Token no proporcionado",
        });
    }

    let payload;

    try {
        payload = jwt.verify(token, obtenerSecretoJwt());
    } catch {
        return res.status(401).json({
            error: "No autenticado",
            mensaje: "Token inválido o expirado",
        });
    }

    try {
        const usuario = await prisma.usuario.findUnique({
            where: { id: Number(payload.uid) },
            select: {
                id: true,
                nombre: true,
                apellido: true,
                correo: true,
                activo: true,
                idRol: true,
                idFacultad: true,
                idCarrera: true,
                semestreId: true,
                esDirector: true,
                rol: { select: { id: true, nombre: true } },
            },
        });

        if (!usuario || !usuario.activo) {
            return res.status(401).json({
                error: "No autenticado",
                mensaje: "Usuario no válido o inactivo",
            });
        }

        req.user = usuario;
        return next();
    } catch (e) {
        return next(e);
    }
}

export function autorizarRoles(...nombresPermitidos) {
    const permitidos = nombresPermitidos.map((n) =>
        String(n).trim().toLowerCase()
    );

    return (req, res, next) => {
        const nombreRol = String(req.user?.rol?.nombre || "")
            .trim()
            .toLowerCase();

        if (!nombreRol || !permitidos.includes(nombreRol)) {
            return res.status(403).json({
                error: "Sin permisos",
                mensaje: "No tienes permisos para realizar esta acción",
            });
        }

        return next();
    };
}
