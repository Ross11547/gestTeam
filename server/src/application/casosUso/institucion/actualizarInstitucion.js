import { crearError } from "../../../dominio/comun/helpersComunes.js";
import { actualizarInstitucion } from "../../../dominio/institucion/validacionInstitucion.js";
import { institucionRepositorio } from "../../../infrastructure/repositories/repositorioInstitucion.js";

export async function actualizarInstitucionCasoUso(id, payload) {
    const data = actualizarInstitucion.parse(payload);

    const actual = await institucionRepositorio.obtenerPorId(id);
    if (!actual) throw crearError("Institución no encontrada", 404);

    if (data.slug && data.slug !== actual.slug) {
        const existe = await institucionRepositorio.obtenerPorSlug(data.slug);
        if (existe) throw crearError("El slug ya está en uso", 409);
    }

    return institucionRepositorio.actualizar(id, data);
}
