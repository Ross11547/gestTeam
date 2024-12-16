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

const Docente = () => {
  const [docentes, setDocentes] = useState([
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
  const [currentDocente, setCurrentDocente] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddDocente = (nuevoDocente) => {
    const docente = {
      ...nuevoDocente,
      id: docentes.length + 1,
    };
    setDocentes([...docentes, docente]);
    setIsModalOpen(false);
  };

  const handleEditDocente = (docenteActualizado) => {
    setDocentes(
      docentes.map((d) =>
        d.id === docenteActualizado.id ? docenteActualizado : d
      )
    );
    setIsModalOpen(false);
    setCurrentDocente(null);
  };

  const handleDeleteDocente = (id) => {
    setDocentes(docentes.filter((d) => d.id !== id));
  };

  const filteredDocentes = docentes.filter(
    (d) =>
      d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderModal = () => {
    if (!isModalOpen) return null;

    const initialState = currentDocente || {
      nombre: "",
      email: "",
      especialidad: "",
      departamento: "",
    };

    return (
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {currentDocente ? "Editar Docente" : "Agregar Docente"}
            </ModalTitle>
            <ActionButton
              color={ColorsLogin.secondary100}
              onClick={() => {
                setIsModalOpen(false);
                setCurrentDocente(null);
              }}
            >
              <X />
            </ActionButton>
          </ModalHeader>

          <Form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const docente = {
                id: currentDocente?.id,
                nombre: formData.get("nombre"),
                email: formData.get("email"),
                especialidad: formData.get("especialidad"),
                departamento: formData.get("departamento"),
              };

              currentDocente
                ? handleEditDocente(docente)
                : handleAddDocente(docente);
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
                <Briefcase size={16} /> Especialidad
              </Label>
              <Input
                type="text"
                name="especialidad"
                defaultValue={initialState.especialidad}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <FileText size={16} /> Departamento
              </Label>
              <Input
                type="text"
                name="departamento"
                defaultValue={initialState.departamento}
                required
              />
            </FormGroup>

            <ButtonGroup>
              <Button
                type="button"
                className="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentDocente(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="primary">
                <Save size={16} />
                {currentDocente ? "Actualizar" : "Guardar"}
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
          <Title>Gestión de Docentes</Title>
        </PageHeader>

        <SearchContainer>
          <Search color={ColorsLogin.secondary100} />
          <SearchInput
            placeholder="Buscar docentes..."
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
              <TableHeader>Departamento</TableHeader>
              <TableHeader>Acciones</TableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredDocentes.map((docente) => (
              <TableRow key={docente.id}>
                <TableCell>{docente.nombre}</TableCell>
                <TableCell>{docente.email}</TableCell>
                <TableCell>{docente.especialidad}</TableCell>
                <TableCell>{docente.departamento}</TableCell>
                <TableCell>
                  <ActionButton
                    color={Colors.greyDark}
                    onClick={() => {
                      setCurrentDocente(docente);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit size={20} />
                  </ActionButton>
                  <ActionButton
                    color={ColorsLogin.secondary100}
                    onClick={() => handleDeleteDocente(docente.id)}
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

export default Docente;
