import React, { useState } from "react";
import styled from "styled-components";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  User,
  Mail,
  Briefcase,
  FileText,
} from "lucide-react";
import {
  ModalOverlay,
  ActionButton,
  Button,
  ButtonGroup,
  Container,
  FloatingButton,
  Form,
  FormGroup,
  Input,
  Label,
  ModalContent,
  ModalHeader,
  ModalTitle,
  PageHeader,
  PageWrapper,
  SearchContainer,
  SearchInput,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  Title,
} from "../../../style/admin/crudAdmin";
import { ColorsLogin, Colors } from "../../../style/colors";
import { FactultadesData } from "../../../data/facultadesData";
const Facultades = () => {
  const [facultades, setFacultades] = useState([
    {
      id: 1,
      nombre: "Juan Pérez",
      email: "juan.perez@universidad.edu",
      especialidad: "Ingeniería de Sistemas",
      departamento: "Tecnología",
    },
    {
      id: 2,
      nombre: "María García",
      email: "maria.garcia@universidad.edu",
      especialidad: "Ciencias Sociales",
      departamento: "Humanidades",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFacultad, setCurrentFacultad] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddFacultad = (nuevoFacultad) => {
    const facultad = {
      ...nuevoFacultad,
      id: facultades.length + 1,
    };
    setFacultades([...facultades, facultad]);
    setIsModalOpen(false);
  };

  const handleEditFacultad = (facultadActualizado) => {
    setFacultades(
      facultades.map((d) =>
        d.id === facultadActualizado.id ? facultadActualizado : d
      )
    );
    setIsModalOpen(false);
    setCurrentFacultad(null);
  };

  const handleDeleteFacultad = (id) => {
    setFacultades(facultades.filter((d) => d.id !== id));
  };

  const filteredFacultades = FactultadesData?.filter((d) =>
    d.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderModal = () => {
    if (!isModalOpen) return null;

    const initialState = currentFacultad || {
      nombre: "",
    };

    return (
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {currentFacultad ? "Editar Facultad" : "Agregar Facultad"}
            </ModalTitle>
            <ActionButton
              color={ColorsLogin.secondary100}
              onClick={() => {
                setIsModalOpen(false);
                setCurrentFacultad(null);
              }}
            >
              <X />
            </ActionButton>
          </ModalHeader>

          <Form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const facultad = {
                id: currentFacultad?.id,
                nombre: formData.get("nombre"),
              };

              currentFacultad
                ? handleEditFacultad(facultad)
                : handleAddFacultad(facultad);
            }}
          >
            <FormGroup>
              <Label>
                <User size={16} /> Nombre
              </Label>
              <Input
                type="text"
                name="nombre"
                defaultValue={initialState.nombre}
                required
              />
            </FormGroup>

            <ButtonGroup>
              <Button
                type="button"
                className="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentFacultad(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="primary">
                <Save size={16} />
                {currentFacultad ? "Actualizar" : "Guardar"}
              </Button>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </ModalOverlay>
    );
  };

  return (
    <PageWrapper>
      <Container>
        <PageHeader>
          <Title>Gestión de Facultades</Title>
        </PageHeader>

        <SearchContainer>
          <Search color={ColorsLogin.secondary100} />
          <SearchInput
            placeholder="Buscar facultades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        <Table>
          <thead>
            <tr>
              <TableHeader>Nombre</TableHeader>
              <TableHeader>Carreras</TableHeader>
              <TableHeader>Acciones</TableHeader>
            </tr>
          </thead>
          <tbody>
            {FactultadesData.map((facultad) => (
              <TableRow key={facultad.id}>
                <TableCell>{facultad.nombre}</TableCell>
                <TableCell>
                  <ul>
                    {facultad.carreras.map((carrera, index) => (
                      <li key={index}>{carrera}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>
                  <ActionButton
                    color={Colors.greyDark}
                    onClick={() => {
                      setCurrentFacultad(facultad);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit size={20} />
                  </ActionButton>
                  <ActionButton
                    color={ColorsLogin.secondary100}
                    onClick={() => handleDeleteFacultad(facultad.id)}
                  >
                    <Trash2 size={20} />
                  </ActionButton>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>

        <FloatingButton onClick={() => setIsModalOpen(true)}>
          <Plus size={30} />
        </FloatingButton>
        {renderModal()}
      </Container>
    </PageWrapper>
  );
};

export default Facultades;
