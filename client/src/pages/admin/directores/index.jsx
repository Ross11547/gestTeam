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

const Directores = () => {
  const [directores, setDirectores] = useState([
    {
      id: 1,
      nombre: "Dennis saavedra",
      email: "cbbe.dennis.saavedra.a@unifranz.edu.bo",
      especialidad: "Ingeniería comercial",
    },
    {
      id: 2,
      nombre: "Fabiola cadima",
      email: "cbbe.fabi.cadima.s@unifranz.edu.bo",
      especialidad: "Ingeniera de sistemas",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDirector, setCurrentDirector] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddDirector = (nuevoDirector) => {
    const director = {
      ...nuevoDirector,
      id: directores.length + 1,
    };
    setDirectores([...directores, director]);
    setIsModalOpen(false);
  };

  const handleEditDirector = (directorActualizado) => {
    setDirectores(
      directores.map((d) =>
        d.id === directorActualizado.id ? directorActualizado : d
      )
    );
    setIsModalOpen(false);
    setCurrentDirector(null);
  };

  const handleDeleteDirector = (id) => {
    setDirectores(directores.filter((d) => d.id !== id));
  };

  const filteredDirectores = directores.filter(
    (d) =>
      d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderModal = () => {
    if (!isModalOpen) return null;

    const initialState = currentDirector || {
      nombre: "",
      email: "",
      facultad: "",
    };

    return (
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {currentDirector ? "Editar Director" : "Agregar Director"}
            </ModalTitle>
            <ActionButton
              color={ColorsLogin.secondary100}
              onClick={() => {
                setIsModalOpen(false);
                setCurrentDirector(null);
              }}
            >
              <X />
            </ActionButton>
          </ModalHeader>

          <Form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const director = {
                id: currentDirector?.id,
                nombre: formData.get("nombre"),
                email: formData.get("email"),
                especialidad: formData.get("especialidad"),
                departamento: formData.get("departamento"),
              };

              currentDirector
                ? handleEditDirector(director)
                : handleAddDirector(director);
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

            <FormGroup>
              <Label>
                <Mail size={16} /> Email
              </Label>
              <Input
                type="email"
                name="email"
                defaultValue={initialState.email}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <Briefcase size={16} /> Facultad
              </Label>
              <Input
                type="text"
                name="especialidad"
                defaultValue={initialState.especialidad}
                required
              />
            </FormGroup>

            <ButtonGroup>
              <Button
                type="button"
                className="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentDirector(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="primary">
                <Save size={16} />
                {currentDirector ? "Actualizar" : "Guardar"}
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
          <Title>Gestión de Directores</Title>
        </PageHeader>

        <SearchContainer>
          <Search color={ColorsLogin.secondary100} />
          <SearchInput
            placeholder="Buscar directores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        <Table>
          <thead>
            <tr>
              <TableHeader>Nombre</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Especialidad</TableHeader>
              <TableHeader>Acciones</TableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredDirectores.map((director) => (
              <TableRow key={director.id}>
                <TableCell>{director.nombre}</TableCell>
                <TableCell>{director.email}</TableCell>
                <TableCell>{director.especialidad}</TableCell>
                <TableCell>
                  <ActionButton
                    color={Colors.greyDark}
                    onClick={() => {
                      setCurrentDirector(director);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit size={20} />
                  </ActionButton>
                  <ActionButton
                    color={ColorsLogin.secondary100}
                    onClick={() => handleDeleteDirector(director.id)}
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

export default Directores;
