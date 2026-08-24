from pathlib import Path

#Ruta base del microservicio
BASE_DIR = Path(__file__).resolve().parent.parent

MODELO_BASE = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

RUTA_MODELO_AJUSTADO = BASE_DIR / "modelos" / "modelo_ajustado"

RUTA_MODELOS = BASE_DIR / "modelos"

#Umbral de similitud
# 0.00 a 0.54 = bajo
# 0.55 a 0.74 = medio
# 0.75 a 1.00 = alto

# Umbral primer y segundo entrenamiento
#UMBRAL_MEDIO = 0.55
#UMBRAL_ALTO = 0.75

UMBRAL_MEDIO = 0.60
UMBRAL_ALTO = 0.78
UMBRAL_CRITICO = 0.90

# Tamaño por cada fragmento
MAX_FRAGMENTO_LENGTH = 256

#Puntaje final
PESO_SEMANTICO = 0.85
PESO_LEXICO = 0.15

def nivel_de_riesgo(puntaje: float) -> str:
    if puntaje >= UMBRAL_CRITICO:
        return "CRITICO"
    if puntaje >= UMBRAL_ALTO:
        return "ALTO"
    if puntaje >= UMBRAL_MEDIO:
        return "MEDIO"
    return "BAJO"

def modelo_ajustado_existe() -> bool:
    return RUTA_MODELO_AJUSTADO.exists() and any(RUTA_MODELO_AJUSTADO.iterdir())

