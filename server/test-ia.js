import {
    compararSimilitudIA,
    verificarServicioIA,
} from "./src/infrastructure/similitud/clienteSimilitudIA.js";

async function main() {
    const salud = await verificarServicioIA();

    console.log("SALUD IA:");
    console.log(salud);

    const resultado = await compararSimilitudIA(
        "El sistema permite gestionar proyectos integradores y registrar entregas académicas.",
        [
            "La plataforma administra proyectos académicos y controla entregas estudiantiles.",
            "El karate Kyokushin utiliza golpes, patadas y entrenamiento de combate.",
        ]
    );

    console.log("RESULTADO:");
    console.dir(resultado, { depth: null });
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});