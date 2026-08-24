from typing import Annotated, List
from pydantic import BaseModel, Field

TextoCandidato = Annotated[str, Field(max_length=4000)]

class PeticionSimilitud(BaseModel):
    texto_a: str = Field(..., min_length=3, max_length=8000, description="Primer texto que se quiere comparar")

    candidatos: List[TextoCandidato] = Field(..., min_length=1, max_length=500, description="Lista de textos candidatos a comparar con el primer texto")

class ResultadoComparacion(BaseModel): 
    indice: int
    puntaje: float
    nivel: str
    candidato: str

class RespuestaSimilitud(BaseModel): 
    modelo: str
    ajustado: bool
    resultados: List[ResultadoComparacion]

class Respuesta(BaseModel):
    estado: str
    modelo: str
    ajustado: bool