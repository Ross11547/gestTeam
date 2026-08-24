import argparse
import json
import math
import shutil
from datetime import datetime
from pathlib import Path
import sys

import pandas as pd
from torch.utils.data import DataLoader
from sentence_transformers import SentenceTransformer, InputExample, losses
from sentence_transformers.evaluation import EmbeddingSimilarityEvaluator

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))

from app.configuracion import (
    MODELO_BASE,
    RUTA_MODELO_AJUSTADO,
    RUTA_MODELOS,
    MAX_FRAGMENTO_LENGTH,
)

DATA_DIR = ROOT_DIR / "entrenamiento" / "data"


def cargar_ejemplos(path_csv: Path, muestras: int | None = None):
    if not path_csv.exists():
        raise FileNotFoundError(
            f"No existe {path_csv}. Primero ejecuta: python entrenamiento\\preparar_datos.py"
        )

    df = pd.read_csv(path_csv)

    if muestras:
        df = df.sample(
            n=min(muestras, len(df)),
            random_state = 42
        )

    ejemplos = []

    for _, row in df.iterrows():
        ejemplos.append(
            InputExample(
                texts = [
                    str(row["oracion1"]),
                    str(row["oracion2"]),
                ],
                label = float(row["score"]),
            )
        )

    return ejemplos


def cargar_evaluador(path_csv: Path, nombre: str, muestras: int | None = None):
    if not path_csv.exists():
        raise FileNotFoundError(f"No existe {path_csv}.")

    df = pd.read_csv(path_csv)

    if muestras:
        df = df.sample(
            n = min(muestras, len(df)),
            random_state = 42
        )

    sentences1 = df["oracion1"].astype(str).tolist()
    sentences2 = df["oracion2"].astype(str).tolist()
    scores = df["score"].astype(float).tolist()

    return EmbeddingSimilarityEvaluator(
        sentences1,
        sentences2,
        scores,
        name = nombre
    )


def respaldar_modelo_actual():
    if not RUTA_MODELO_AJUSTADO.exists():
        return None

    if not any(RUTA_MODELO_AJUSTADO.iterdir()):
        return None

    backups_dir = RUTA_MODELOS / "backups"
    backups_dir.mkdir(parents = True, exist_ok = True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    destino = backups_dir / f"modelo_ajustado_{timestamp}"

    shutil.copytree(RUTA_MODELO_AJUSTADO, destino)

    return destino


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--epocas",
        type=int,
        default=3,
        help="Cantidad de épocas de entrenamiento. Recomendado: 2 o 3."
    )

    parser.add_argument(
        "--muestras",
        type=int,
        default=None,
        help="Cantidad de muestras para prueba rápida. Si no se define, usa todo."
    )

    parser.add_argument(
        "--batch",
        type=int,
        default=16,
        help="Si tu laptop falla por memoria, usa 8."
    )

    parser.add_argument(
        "--lr",
        type=float,
        default=2e-5,
        help="Recomendado: 2e-5 desde base, 1e-5 desde modelo actual."
    )

    parser.add_argument(
        "--validacion-muestras",
        type=int,
        default=1500,
        help="Muestras de validation usadas durante entrenamiento."
    )

    parser.add_argument(
        "--desde-actual",
        action="store_true",
        help="Continúa entrenando desde modelos/modelo_ajustado en vez de iniciar desde el modelo base."
    )

    parser.add_argument(
        "--sin-backup",
        action="store_true",
        help="No respalda el modelo anterior antes de entrenar."
    )

    parser.add_argument(
        "--fp16",
        action="store_true",
        help="Entrena en precisión mixta (recomendado con GPU NVIDIA)."
    )

    args = parser.parse_args()

    train_csv = DATA_DIR / "train.csv"
    validation_csv = DATA_DIR / "validation.csv"

    backup = None

    if not args.sin_backup:
        backup = respaldar_modelo_actual()
        if backup:
            print(f"Modelo anterior respaldado en: {backup}")

    if args.desde_actual and backup:
        modelo_inicial = str(backup)
        print(f"Continuando entrenamiento desde backup del modelo actual: {modelo_inicial}")
    elif args.desde_actual and RUTA_MODELO_AJUSTADO.exists() and any(RUTA_MODELO_AJUSTADO.iterdir()):
        modelo_inicial = str(RUTA_MODELO_AJUSTADO)
        print(f"Continuando entrenamiento desde modelo actual: {modelo_inicial}")
    else:
        modelo_inicial = MODELO_BASE
        print(f"Cargando modelo base: {MODELO_BASE}")

    model = SentenceTransformer(modelo_inicial)
    model.max_seq_length = MAX_FRAGMENTO_LENGTH

    train_examples = cargar_ejemplos(train_csv, args.muestras)

    evaluator = cargar_evaluador(
        validation_csv,
        nombre="validacion_v2",
        muestras=args.validacion_muestras
    )

    print(f"Ejemplos de entrenamiento: {len(train_examples)}")
    print(f"Épocas: {args.epocas}")
    print(f"Batch size: {args.batch}")
    print(f"Learning rate: {args.lr}")
    print(f"Max sequence length: {MAX_FRAGMENTO_LENGTH}")

    import torch

    dispositivo = "CUDA (" + torch.cuda.get_device_name(0) + ")" if torch.cuda.is_available() else "CPU"
    print(f"Dispositivo de entrenamiento: {dispositivo}")

    if args.fp16 and not torch.cuda.is_available():
        print("Aviso: --fp16 requiere GPU NVIDIA; se ignorará y se entrenará en CPU.")

    train_dataloader = DataLoader(
        train_examples,
        shuffle=True,
        batch_size=args.batch
    )

    train_loss = losses.CosineSimilarityLoss(model)

    warmup_steps = math.ceil(
        len(train_dataloader) * args.epocas * 0.1
    )

    evaluation_steps = max(100, len(train_dataloader) // 3)

    print(f"Warmup steps: {warmup_steps}")
    print(f"Evaluation steps: {evaluation_steps}")
    print("Entrenando...")

    model.fit(
    train_objectives = [(train_dataloader, train_loss)],
    evaluator = evaluator,
    epochs = args.epocas,
    warmup_steps = warmup_steps,
    evaluation_steps = evaluation_steps,
    output_path = str(RUTA_MODELO_AJUSTADO),
    save_best_model = True,
    optimizer_params = {"lr": args.lr},
    use_amp=args.fp16 and torch.cuda.is_available(),
    show_progress_bar = True,
)

    metadata = {
        "fecha": datetime.now().isoformat(),
        "modelo_inicial": modelo_inicial,
        "modelo_base": MODELO_BASE,
        "ruta_salida": str(RUTA_MODELO_AJUSTADO),
        "epocas": args.epocas,
        "muestras": args.muestras,
        "batch": args.batch,
        "learning_rate": args.lr,
        "warmup_steps": warmup_steps,
        "evaluation_steps": evaluation_steps,
        "max_fragmento_length": MAX_FRAGMENTO_LENGTH,
        "desde_actual": args.desde_actual,
        "backup": str(backup) if backup else None,
        "nota": "Entrenamiento con STS español y dataset académico."
    }

    metadata_path = RUTA_MODELO_AJUSTADO / "gestteam_entrenamiento.json"
    metadata_path.write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    print(f"Modelo guardado en: {RUTA_MODELO_AJUSTADO}")
    print(f"Metadata guardada en: {metadata_path}")


if __name__ == "__main__":
    main()