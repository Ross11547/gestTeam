import styled from "styled-components";
import { ColorsLogin, Colors } from "../colors";

export const PageWrapper = styled.div`
  min-height: 100vh;
  padding: 20px;
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

export const PageHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background-color: ${Colors.white};
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

export const Title = styled.h1`
  color: ${ColorsLogin.secondary100};
  margin: 0;
  font-size: 2rem;
`;

export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: ${Colors.white};
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 20px;
`;

export const SearchInput = styled.input`
  border: none;
  background: transparent;
  flex-grow: 1;
  margin-left: 10px;
  font-size: 1rem;
  color: ${Colors.black};

  &:focus {
    outline: none;
  }
`;

export const Table = styled.table`
  width: 100%;
  background-color: ${Colors.white};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
  border-collapse: separate;
  border-spacing: 0;
`;

export const TableHeader = styled.th`
  background-color: ${ColorsLogin.secondary100};
  color: white;
  padding: 15px;
  text-align: left;
`;

export const TableRow = styled.tr`
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${Colors.white};
  }
`;

export const TableCell = styled.td`
  padding: 15px;
  border-bottom: 1px solid ${Colors.greyLight};
  color: ${Colors.greyDark};
`;

export const ActionButton = styled.button`
  background-color: transparent;
  border: none;
  color: ${(props) => props.color || Colors.greyDark};
  cursor: pointer;
  margin-right: 10px;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

export const FloatingButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  background-color: ${ColorsLogin.secondary100};
  color: white;
  border: none;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${Colors.secondary};
    transform: scale(1.1);
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background-color: ${Colors.white};
  border-radius: 12px;
  padding: 30px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const ModalTitle = styled.h2`
  color: ${ColorsLogin.secondary100};
  margin: 0;
`;

export const Form = styled.form`
  display: grid;
  gap: 15px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Label = styled.label`
  color: ${Colors.greyDark};
  margin-bottom: 5px;
`;

export const Input = styled.input`
  padding: 10px;
  border: 1px solid ${Colors.greyLight};
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

export const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;

  &.primary {
    background-color: ${ColorsLogin.secondary100};
    color: white;
  }

  &.secondary {
    background-color: ${Colors.white};
    color: ${Colors.greyDark};
  }
`;
