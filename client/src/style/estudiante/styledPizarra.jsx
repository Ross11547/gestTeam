import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  padding: 1rem;
  background-color: #f9fafb;
`;

export const Header = styled.div`
  width: 25%;
  height: 90%;
  display: flex;
  justify-content: center;
  align-items:flex-end;
`;

export const NewBoardButton = styled.button`
  width: 200px;
  height: 50px;
  display: flex;
  justify-content:center;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #F8E061ff, #ffc107);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s;
  margin-top:20px;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  }
`;

export const TabsContainer = styled.div`
  margin-top: 2rem;
`;

export const TabsList = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

export const TabButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  background-color: ${(props) => (props.active ? '#feffdc' : 'transparent')};
  color: ${(props) => (props.active ? '#ffc107' : '#6b7280')};
  border: 2px solid ${(props) => (props.active ? '#ffc107' : 'transparent')};
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: #feffdc;
    color: #ffc107;
  }
`;

export const BoardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

export const BoardCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
`;

export const CardHeaders = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const CardTitle = styled.h3`
  color: #1f2937;
`;

export const CardDate = styled.p`
  color: #9ca3af;
`;

export const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 80%;
  max-width: 900px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #feffdc;
  padding-bottom: 1rem;
`;

export const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: #1f2937;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;

  &:hover {
    color: #1f2937;
  }
`;
// Grupo de formularios
export const FormGroup = styled.div`
  margin-bottom: 15px;

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 5px;
  }

  input,
  select {
    width: 100%;
    padding: 10px;
    font-size: 1rem;
    border: 1px solid #d1d5db;
    border-radius: 5px;
    background-color: #f9fafb;
    color: #374151;

    &:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.3);
    }
  }
`;

// Contenedor de acciones del formulario
export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  button {
    padding: 10px 15px;
    font-size: 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:first-child {
      background-color: #2563eb;
      color: white;

      &:hover {
        background-color: #1d4ed8;
      }
    }

    &:last-child {
      background-color: #f3f4f6;
      color: #374151;

      &:hover {
        background-color: #e5e7eb;
      }
    }
  }
`;

export const ExcalidrawContainer = styled.div`
  height: 60vh;
  margin-top: 1rem;
  background-color: #feffdc;
  border-radius: 1rem;
`;