from pathlib import Path
import sys
import json
from datetime import datetime

import pandas as pd
from scipy.stats import pearsonr, spearmanr
from sentence_transformers import SentenceTransformer, util

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))

from app.configuracion import MODELO_BASE, RUTA_MODELO_AJUSTADO, MAX_FRAGMENTO_LENGTH

DATA_DIR = ROOT_DIR / "entrenamiento" / "data"
RESULTADOS_DIR = ROOT_DIR / "entrenamiento" / "resultados"
RESULTADOS_DIR.mkdir(parents = True, exist_ok = True)


def cargar_test():
    test_csv = DATA_DIR / "test.csv"

    if not test_csv.exists():
        raise FileNotFoundError(
            f"No existe {test_csv}. Primero ejecuta: python entrenamiento\\preparar_datos.py"
        )

    return pd.read_csv(test_csv)


def cargar_validation():
    validation_csv = DATA_DIR / "validation.csv"

    if not validation_csv.exists():
        print("No existe validation.csv. Solo se evaluará test.csv.")
        return None

    return pd.read_csv(validation_csv)


def predecir_scores(model, df):
    oraciones1 = df["oracion1"].astype(str).tolist()
    oraciones2 = df["oracion2"].astype(str).tolist()

    embeddings1 = model.encode(
        oraciones1,
        convert_to_tensor = True,
        normalize_embeddings = True,
        show_progress_bar = False
    )

    embeddings2 = model.encode(
        oraciones2,
        convert_to_tensor = True,
        normalize_embeddings = True,
        show_progress_bar = False
    )

    similitudes = util.pairwise_cos_sim(embeddings1, embeddings2)

    return [float(score) for score in similitudes]


def evaluar_modelo(nombre, model, df):
    model.max_seq_length = MAX_FRAGMENTO_LENGTH

    y_true = df["score"].astype(float).tolist()
    y_pred = predecir_scores(model, df)

    pearson = pearsonr(y_true, y_pred).statistic
    spearman = spearmanr(y_true, y_pred).statistic

    return {
        "nombre": nombre,
        "pearson": float(pearson),
        "spearman": float(spearman),
    }


def imprimir_resultados(titulo, resultado_base, resultado_fine):
    mejora_pearson = resultado_fine["pearson"] - resultado_base["pearson"]
    mejora_spearman = resultado_fine["spearman"] - resultado_base["spearman"]

    print()
    print(f"========= {titulo} =========")
    print("Metrica          Base      Ajustado   Mejora")
    print("--------------------------------------------")
    print(f"pearson       {resultado_base['pearson']:.4f}      {resultado_fine['pearson']:.4f}     {mejora_pearson:+.4f}")
    print(f"spearman      {resultado_base['spearman']:.4f}      {resultado_fine['spearman']:.4f}     {mejora_spearman:+.4f}")
    print("============================================")

    return {
        "pearson": float(mejora_pearson),
        "spearman": float(mejora_spearman),
    }


def evaluar_dataset(nombre_dataset, df, modelo_base, modelo_fine):
    print()
    print(f"Evaluando {nombre_dataset}: {len(df)} pares")

    resultado_base = evaluar_modelo("Base", modelo_base, df)
    resultado_fine = evaluar_modelo("Fine-tuned", modelo_fine, df)

    mejora = imprimir_resultados(
        nombre_dataset,
        resultado_base,
        resultado_fine
    )

    return {
        "dataset": nombre_dataset,
        "registros": len(df),
        "base": resultado_base,
        "fine_tuned": resultado_fine,
        "mejora": mejora,
    }


def main():
    df_test = cargar_test()
    df_validation = cargar_validation()

    print("Cargando modelo base...")
    modelo_base = SentenceTransformer(MODELO_BASE)
    modelo_base.max_seq_length = MAX_FRAGMENTO_LENGTH

    if not RUTA_MODELO_AJUSTADO.exists():
        print("No existe modelo fine-tuned. Entrena primero.")
        return

    print("Cargando modelo fine-tuned...")
    modelo_fine = SentenceTransformer(str(RUTA_MODELO_AJUSTADO))
    modelo_fine.max_seq_length = MAX_FRAGMENTO_LENGTH

    resultados = []

    resultado_test = evaluar_dataset(
        "TEST STS ESPAÑOL",
        df_test,
        modelo_base,
        modelo_fine
    )
    resultados.append(resultado_test)

    if df_validation is not None:
        resultado_validation = evaluar_dataset(
            "VALIDACION",
            df_validation,
            modelo_base,
            modelo_fine
        )
        resultados.append(resultado_validation)

    salida = {
        "fecha": datetime.now().isoformat(),
        "modelo_base": MODELO_BASE,
        "modelo_fine_tuned": str(RUTA_MODELO_AJUSTADO),
        "max_fragmento_length": MAX_FRAGMENTO_LENGTH,
        "resultados": resultados,
    }

    json_path = RESULTADOS_DIR / "evaluacion.json"

    json_path.write_text(
        json.dumps(salida, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    print()
    print(f"Resultados guardados en: {json_path}")


if __name__ == "__main__":
    main()