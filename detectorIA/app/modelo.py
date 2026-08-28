import threading

from difflib import SequenceMatcher

from sentence_transformers import SentenceTransformer, util

from app.configuracion import ( 
    MODELO_BASE, 
    RUTA_MODELO_AJUSTADO, 
    MAX_FRAGMENTO_LENGTH,
    PESO_SEMANTICO,
    PESO_LEXICO,
    nivel_de_riesgo, 
    modelo_ajustado_existe
)

_modelo = None
_modelo_nombre = None
_ajustado = False
_candado_carga = threading.Lock()

def cargar_modelo():
    global _modelo, _modelo_nombre, _ajustado

    if _modelo is not None:
        return _modelo

    with _candado_carga:
        if _modelo is not None:
            return _modelo

        if modelo_ajustado_existe():
            ruta = str(RUTA_MODELO_AJUSTADO)
            print("Cargando modelo ajustado desde: " + ruta)
            _modelo = SentenceTransformer(ruta)
            _modelo_nombre = ruta
            _ajustado = True
        else:
            print("Cargando modelo base: "+ MODELO_BASE)
            _modelo = SentenceTransformer(MODELO_BASE)
            _modelo_nombre = MODELO_BASE
            _ajustado = False

        _modelo.max_seq_length = MAX_FRAGMENTO_LENGTH

    return _modelo

def informacion_modelo():
    cargar_modelo()

    return{
        "modelo": _modelo_nombre,
        "ajustado": _ajustado,
        "dispositivo": str(_modelo.device)
    }

def puntaje_lexico(texto_a: str, texto_b: str) -> float:
    if not texto_a or not texto_b:
        return 0.0

    a = texto_a.lower()
    b = texto_b.lower()

    palabras_a = set(a.split())
    palabras_b = set(b.split())

    if palabras_a and palabras_b:
        jaccard = len(palabras_a & palabras_b) / len(palabras_a | palabras_b)
    else:
        jaccard = 0.0

    secuencia = SequenceMatcher(None, a, b).ratio()

    return round((jaccard + secuencia) / 2, 4)

def puntuar(texto_a: str, candidatos: list[str]):
    modelo = cargar_modelo()
    textos = [texto_a] + candidatos

    embeddings = modelo.encode(
        textos,
        convert_to_tensor = True,
        normalize_embeddings = True,
        show_progress_bar = False
    )

    vector_a = embeddings[0]
    vectores_candidatos = embeddings[1:]

    similitudes = util.cos_sim(vector_a, vectores_candidatos)[0]
    resultados = []

    for indice, score in enumerate(similitudes):
        puntaje_semantico = round(float(score), 4)
        puntaje_lex = puntaje_lexico(texto_a, candidatos[indice])

        puntaje = round(
            PESO_SEMANTICO * puntaje_semantico + PESO_LEXICO * puntaje_lex,
            4
        )

        resultados.append({
            "indice": indice,
            "puntaje": puntaje,
            "puntaje_semantico": puntaje_semantico,
            "puntaje_lexico": puntaje_lex,
            "nivel": nivel_de_riesgo(puntaje),
            "candidato": candidatos[indice]
        })

    resultados.sort(key = lambda item: item["puntaje"], reverse = True)

    return resultados