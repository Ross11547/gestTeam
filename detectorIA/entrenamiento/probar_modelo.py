from pathlib import Path
import sys

from sentence_transformers import SentenceTransformer, util

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))

from app.configuracion import (
    MODELO_BASE,
    RUTA_MODELO_AJUSTADO,
    MAX_FRAGMENTO_LENGTH,
    nivel_de_riesgo,
)


def cargar_modelos():
    base = SentenceTransformer(MODELO_BASE)
    base.max_seq_length = MAX_FRAGMENTO_LENGTH


    if not RUTA_MODELO_AJUSTADO.exists():
        raise FileNotFoundError(
            "No existe modelos/modelo_ajustado. Entrena primero: python entrenamiento\\entrenar.py"
        )

    fine = SentenceTransformer(str(RUTA_MODELO_AJUSTADO))
    fine.max_seq_length = MAX_FRAGMENTO_LENGTH


    return base, fine


def similitud(model, a, b):
    emb = model.encode(
        [a, b],
        convert_to_tensor = True,
        normalize_embeddings = True,
        show_progress_bar = False,
    )

    return float(util.cos_sim(emb[0], emb[1]).item())


def comparar_caso(nombre, texto_a, texto_b, base, fine):
    sim_base = similitud(base, texto_a, texto_b)
    sim_fine = similitud(fine, texto_a, texto_b)

    print()
    print(f"===== {nombre} =====")
    print(f"Texto A: {texto_a}")
    print(f"Texto B: {texto_b}")
    print("--------------------------------")
    print(f"Base:       {sim_base:.4f} | {nivel_de_riesgo(sim_base)}")
    print(f"Fine-tuned: {sim_fine:.4f} | {nivel_de_riesgo(sim_fine)}")
    print(f"Diferencia: {sim_fine - sim_base:+.4f}")


def main():
    print("Cargando modelos (una sola vez)...")
    base, fine = cargar_modelos()

    casos = [
        (
            "Paráfrasis académica alta",
            "El sistema permite gestionar proyectos integradores, registrar entregas y realizar seguimiento académico.",
            "La plataforma administra proyectos académicos integradores, controla entregas y permite monitorear el avance estudiantil."
        ),
        (
            "Copia casi literal",
            "El módulo de plagio identifica similitudes con documentos internos y fuentes web.",
            "El módulo de plagio identifica similitudes con documentos internos y fuentes web."
        ),
        (
            "Relacionado pero no plagio",
            "GestTeam permite controlar proyectos académicos dentro de una universidad.",
            "Un sistema LMS permite administrar cursos, estudiantes, recursos educativos y actividades académicas."
        ),
        (
            "Hard negative académico",
            "La integración con GitHub permite asociar repositorios de código a proyectos de Ingeniería de Sistemas.",
            "GitHub Actions permite automatizar pruebas y despliegues continuos en proyectos de software empresarial."
        ),
        (
            "Negativo claro",
            "El sistema registra entregas de documentos universitarios.",
            "El karate Kyokushin utiliza golpes, patadas y entrenamiento de combate."
        ),
    ]

    for nombre, a, b in casos:
        comparar_caso(nombre, a, b, base, fine)


if __name__ == "__main__":
    main()