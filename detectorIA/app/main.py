from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.esquemas import (
    PeticionSimilitud,
    RespuestaSimilitud,
    Respuesta
)

from app.modelo import puntuar, informacion_modelo

app = FastAPI(
    title = "GestTeam - Microservicio de similitud semántica",
    description = "API para comparar textos usando sentence-transformers.",
    version = "1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

@app.get("/salud", response_model = Respuesta)
def salud():
    info = informacion_modelo()

    return {
        "estado": "ok",
        "modelo": info["modelo"],
        "ajustado": info["ajustado"],
    }


@app.post("/similitud", response_model = RespuestaSimilitud)
def similitud(payload: PeticionSimilitud):
    info = informacion_modelo()

    resultados = puntuar(
        texto_a = payload.texto_a,
        candidatos = payload.candidatos,
    )

    return {
        "modelo": info["modelo"],
        "ajustado": info["ajustado"],
        "resultados": resultados,
    }
