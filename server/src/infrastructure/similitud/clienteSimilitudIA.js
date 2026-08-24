import fetch from "cross-fetch";

const IA_SIMILITUD_URL =
    process.env.IA_SIMILITUD_URL || "http://localhost:8000";

export async function verificarServicioIA() {
    const response = await fetch(`${IA_SIMILITUD_URL}/salud`);

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
            `Servicio IA no disponible: ${response.status} ${text}`
        );
    }

    return response.json();
}

export async function compararSimilitudIA(textoA, candidatos) {
    if (!textoA || typeof textoA !== "string") {
        throw new Error("textoA es obligatorio para comparar similitud.");
    }

    if (!Array.isArray(candidatos) || candidatos.length === 0) {
        return {
            modelo: null,
            ajustado: false,
            resultados: [],
        };
    }

    const response = await fetch(`${IA_SIMILITUD_URL}/similitud`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            texto_a: textoA,
            candidatos,
        }),
    });

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
            `Error en /similitud IA: ${response.status} ${text}`
        );
    }

    return response.json();
}