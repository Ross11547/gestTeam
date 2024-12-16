import styled from "styled-components";
import { Colors, ColorsEstu } from "../colors";

export const ContenedorNavegacion = styled.div`
  width: ${(props) => (props.visible ? '400px' : '0px')}; 
  background: ${Colors.white};
  padding: 15px;
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);
  display: ${(props) => (props.visible ? 'block' : 'none')};
  flex-direction: column;
  align-items: center;
  border-radius: 15px 0px 0px 15px;
  transition: 0.5s; 
  overflow: hidden; 
`;

export const ContenedorPerfil = styled.div`
  width: 100%; 
  height: 25%; 
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 15px;
`;

export const DivButtonNav = styled.div`
  width: auto; 
  height: 25px; 
  position: relative;
  display: flex;
  justify-content:center;
  border-radius: 5px;
  background:${Colors.primary400};
  box-shadow: 2px 2px 3px rgba(70, 66, 66, 0.297);
  top: 45px;
  right:10px;
`;

export const BottonNav = styled.button`
  font-size: 25px;
  color: ${Colors.white}; 
  border: none;
  background: transparent;
  cursor: pointer;
`;

export const ImagenPerfil = styled.div`
  width: 70px; 
  height: 70px;
  background: ${Colors.primary400};
  border-radius: 50%; 
  margin-bottom: 15px; 
`;

export const NombrePerfil = styled.h3`
  font-size: 16px;
  color: ${Colors.black};
  margin-bottom: 10px;
`;

export const RolPerfil = styled.p`
  font-size: 14px;
  color: ${Colors.black};
  margin-bottom: 10px;
`;

export const ContenedorCalendario = styled.div`
  width: 100%;
  height: 100%;
  background: ${Colors.white};
  padding:50px;
  border-left: 6px solid ${ColorsEstu.primary300};

  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 20px;

  .rbc-month-view {
    border: none; 
    padding-top: 20px;
    gap: 20px; 
  }

  .rbc-header {
    width: 50px;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: ${ColorsEstu.primary900};
    color: ${Colors.white} !important; 
    font-weight: bold;
    font-size: 20px;
    text-align: center;
    border-radius: 15px !important;
    text-transform: uppercase;
    margin: 2px;
  }

  .rbc-month-row,
  .rbc-day-bg,
  .rbc-date-cell {
    width: 100%;
    height: 50px;
    display: flex;
    justify-content: center;
    border: none !important;
    background: transparent;
  }

  .rbc-selected {
    background: transparent !important;
  }

  .rbc-event {
    background: transparent !important;
  }

  .rbc-day-slot {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

export const ContenedorRecordatorios = styled.div`
  width: 100%;
  height: 157px; 
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow-y: auto;
  margin-top: 10px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const TituloRecordatorio = styled.div`
  width: 100%;
  height: 50px; 
  display: flex;
  font-weight: bold;
  align-items: center;
  margin-top: 10px;
  font-size: 18px;
  text-transform: uppercase;
`;

export const ItemRecordatorio = styled.div`
  width: 100%;
  height: 90px; 
  display: flex;
  align-items: center;
`;

export const IconoRecordatorio = styled.div`
  width: 70px; 
  height: 60px;
  background: #ffd966;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: ${Colors.white};
  margin-right: 8px;
`;

export const DivTexto = styled.div`
  width: 100%; 
  height: 100px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  font-weight: bold;
`;

export const TextoRecordatorio = styled.div`
  font-size: 12px;
  color: ${Colors.black};
  font-weight: bold;
  white-space: normal;
`;

export const TextoDescripcion = styled.div`
  font-size: 12px;
  color: ${Colors.greyLight};
  font-weight: bold;
  white-space: normal;
`;

export const ContenedorHerramientas = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
`;

export const BotonNavegacion = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #fbc02d;
  cursor: pointer;

  &:hover {
    color: #f57f17;
  }
`;

export const EtiquetaMesAno = styled.span`
  font-size: 16px;
  font-weight: bold;
  color: #333;
`;

export const ContenedorDia = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const CirculoDia = styled.div`
  width: 50px;
  height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
`;

export const EventoColor = styled.div`
  color: white;
  font-weight: bold;
  font-size: 22px;
  display:flex;
  justify-content: center;
  align-items: center;
`;



export const ContenedorPagina = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  gap: 15px;
`;


export const ContenedorCalendarioVista = styled.div`
  width: 100%;
  height: 100%;
  
`;

export const ContenedorRecordatoriosVista = styled.div`
  width: 100%;
  height: 600px;
  background: ${Colors.white};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 20px;
  padding: 20px;
  border-left: 6px solid ${ColorsEstu.primary800};
`;

export const TituloVista = styled.h1`
  margin: 0;
  font-size: 24px;
`;

export const ConteinerDerecho = styled.div`
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const ContenedorDestacados = styled.div`
  width: 100%;
  height: 295px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 20px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  text-align: left; 
  border-left: 6px solid ${ColorsEstu.primary500};
  overflow-y: auto; 
`;

export const ContenedorEstadisticas = styled.div`
  width: 100%;
  height: 295px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 20px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  text-align: left; 
  border-left: 6px solid ${ColorsEstu.primary500};
  overflow-y: auto; 
`;

export const ItemDestacado = styled.div`
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-left: 4px solid ${ColorsEstu.primary100};
`;

export const TextoEstadisticas = styled.p`
  font-size: 16px;
  color: ${Colors.black}; 
  margin: 8px 0;
  line-height: 1.6; 
`;

export const TituloDestacados = styled.h3`
  font-size: 20px;
  color:${Colors.black};
  margin-bottom: 15px;
  text-transform: uppercase;
  font-weight: bold;
`;

export const TituloEstadisticas = styled.h3`
  font-size: 20px;
  color:${Colors.black};
  margin-bottom: 15px;
  text-transform: uppercase;
  font-weight: bold;
`;


