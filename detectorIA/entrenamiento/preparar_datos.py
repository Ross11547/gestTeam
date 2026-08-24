from pathlib import Path
import random
import json

import pandas as pd
from datasets import load_dataset
from sklearn.model_selection import train_test_split

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents = True, exist_ok = True)

SEED = 42
random.seed(SEED)

def limpiar_texto(texto: str) -> str:
    return " ".join(str(texto).strip().split())


def limpiar_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    df["oracion1"] = df["oracion1"].apply(limpiar_texto)
    df["oracion2"] = df["oracion2"].apply(limpiar_texto)
    df["score"] = df["score"].astype(float).clip(0, 1)

    df = df[
        (df["oracion1"].str.len() >= 8)
        & (df["oracion2"].str.len() >= 8)
    ]

    df = df.drop_duplicates(subset = ["oracion1", "oracion2"])

    return df.reset_index(drop=True)



def convertir_split(dataset, nombre_split: str) -> pd.DataFrame:
    filas = []

    for item in dataset[nombre_split]:
        filas.append({
            "oracion1": item["sentence1"],
            "oracion2": item["sentence2"],
            "score": float(item["similarity_score"]) / 5.0
        })

    df = pd.DataFrame(filas)
    df = limpiar_dataframe(df)

    return df

def guardar_split(df: pd.DataFrame, nombre_split: str):
    salida = DATA_DIR / f"{nombre_split}.csv"

    df[["oracion1", "oracion2", "score"]].to_csv(
        salida,
        index=False,
        encoding="utf-8"
    )

    print(f"{nombre_split}: {len(df)} pares -> {salida}")

def resolver_ruta_academico() -> Path | None:
    for candidato in (
        BASE_DIR / "dataset_academico.csv",
        BASE_DIR / "dataset_academico",
        BASE_DIR / "dataset_academico" / "dataset_academico.csv",
    ):
        if candidato.is_file():
            return candidato
    return None

def cargar_dataset_academico() -> pd.DataFrame:
    ruta = resolver_ruta_academico()

    if ruta is None:
        print("No se encontró dataset_academico.csv, se usará solo español.")
        return pd.DataFrame(columns = ["oracion1", "oracion2", "score"])

    print(f"Cargando dataset académico desde: {ruta.name}")

    df = pd.read_csv(ruta)

    columnas_requeridas = {"oracion1", "oracion2", "score"}

    if not columnas_requeridas.issubset(df.columns):
        raise ValueError(
            "dataset_academico.csv debe tener las columnas: oracion1, oracion2, score"
        )

    df = limpiar_dataframe(df)

    print(f"Dataset académico GestTeam: {len(df)} pares cargados.")

    return df


def dividir_dataset_academico(df: pd.DataFrame):
    if len(df) == 0:
        return df, df
    if len(df) < 10:
        return df, pd.DataFrame(columns = ["oracion1", "oracion2", "score"])

    train_df, validation_df = train_test_split(
        df,
        test_size = 0.15,
        random_state = SEED
    )

    return train_df, validation_df


def crear_copias_exactas(df_base: pd.DataFrame, cantidad: int = 400) -> pd.DataFrame:
    if len(df_base) == 0:
        return pd.DataFrame(columns = ["oracion1", "oracion2", "score"])

    muestra = df_base.sample(
        n=min(cantidad, len(df_base)),
        random_state=SEED
    )

    filas = []

    for _, row in muestra.iterrows():
        filas.append({
            "oracion1": row["oracion1"],
            "oracion2": row["oracion1"],
            "score": 1.0
        })

    df = pd.DataFrame(filas)
    df = limpiar_dataframe(df)

    return df

def crear_negativos_aleatorios(df_base: pd.DataFrame, cantidad: int = 800) -> pd.DataFrame:
    if len(df_base) == 0:
        return pd.DataFrame(columns=["oracion1", "oracion2", "score"])

    muestra = df_base.sample(
        n=min(cantidad, len(df_base)),
        random_state=SEED
    ).reset_index(drop=True)

    oraciones_a = muestra["oracion1"].tolist()
    oraciones_b = muestra["oracion2"].tolist()

    random.shuffle(oraciones_b)

    filas = []

    for a, b in zip(oraciones_a, oraciones_b):
        if a == b:
            continue

        filas.append({
            "oracion1": a,
            "oracion2": b,
            "score": 0.0
        })

    df = pd.DataFrame(filas)
    df = limpiar_dataframe(df)

    return df


def guardar_resumen(train, validation, test, academico, copias, negativos):
    resumen = {
        "train": len(train),
        "validation": len(validation),
        "test": len(test),
        "academico": len(academico),
        "copias_exactas_generadas": len(copias),
        "negativos_aleatorios_generados": len(negativos),
        "nota": "Test se mantiene limpio para comparar contra entrenamientos anteriores."
    }

    salida = DATA_DIR / "resumen_dataset.json"

    salida.write_text(
        json.dumps(resumen, ensure_ascii = False, indent = 2),
        encoding="utf-8"
    )

    print(f"Resumen: {salida}")


def main():
    print("Descargando stsb_multi_mt en español desde Hugging Face...")

    dataset = load_dataset("stsb_multi_mt", "es")

    print("Splits disponibles:", list(dataset.keys()))

    train = convertir_split(dataset, "train")

    if "validation" in dataset:
        validation = convertir_split(dataset, "validation")
    elif "dev" in dataset:
        validation = convertir_split(dataset, "dev")
    else:
        print("Aviso: no se encontró split validation/dev.")
        validation = pd.DataFrame(columns = ["oracion1", "oracion2", "score"])

    test = convertir_split(dataset, "test")

    academico = cargar_dataset_academico()
    academico_train, academico_validation = dividir_dataset_academico(academico)

    copias = crear_copias_exactas(train, cantidad = 400)
    negativos = crear_negativos_aleatorios(train, cantidad = 800)

    train_final = pd.concat(
        [
            train,
            academico_train,
            copias,
            negativos
        ],
        ignore_index = True
    )

    validation_final = pd.concat(
        [
            validation,
            academico_validation
        ],
        ignore_index = True
    )

    train_final = limpiar_dataframe(train_final)
    validation_final = limpiar_dataframe(validation_final)
    test = limpiar_dataframe(test)

    guardar_split(train_final, "train")
    guardar_split(validation_final, "validation")
    guardar_split(test, "test")

    guardar_resumen(
        train = train_final,
        validation = validation_final,
        test = test,
        academico = academico,
        copias = copias,
        negativos = negativos
    )

    print("Datos preparados correctamente.")


if __name__ == "__main__":
    main()