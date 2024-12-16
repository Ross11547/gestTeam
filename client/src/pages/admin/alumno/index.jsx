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
  IdCard,
  Phone,
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

const Alumno = () => {
  const [alumnos, setAlumnos] = useState([
    {
      id: 1,
      nombre: "Rossana Angela",
      email: "cbbe.Rossana.angela.tru@unifranz.edu.bo",
      especialidad: "Ingeniería de Sistemas",
      credencial: "SIS9587854",
      telefono: "68785485",
      departamento: "Ingenieria",
    },
    {
      id: 2,
      nombre: "Camina torrez",
      email: "cbbe.Camila.torrez.tru@unifranz.edu.bo",
      especialidad: "Medicina",
      credencial: "MED9587854",
      telefono: "72240558",
      departamento: "Ciencias de salud",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAlumno, setCurrentAlumno] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddAlumno = (nuevoAlumno) => {
    const alumno = {
      ...nuevoAlumno,
      id: alumnos.length + 1,
    };
    setAlumnos([...alumnos, alumno]);
    setIsModalOpen(false);
  };

  const handleEditAlumno = (alumnoActualizado) => {
    setAlumnos(
      alumnos.map((d) =>
        d.id === alumnoActualizado.id ? alumnoActualizado : d
      )
    );
    setIsModalOpen(false);
    setCurrentAlumno(null);
  };

  const handleDeleteAlumno = (id) => {
    setAlumnos(alumnos.filter((d) => d.id !== id));
  };

  const filteredAlumnos = alumnos.filter(
    (d) =>
      d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderModal = () => {
    if (!isModalOpen) return null;

    const initialState = currentAlumno || {
      nombre: "",
      email: "",
      especialidad: "",
      departamento: "",
      credencial: "",
      telefono: "",
    };
    return (
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {currentAlumno ? "Editar Alumno" : "Agregar Alumno"}
            </ModalTitle>
            <ActionButton
              color={ColorsLogin.secondary100}
              onClick={() => {
                setIsModalOpen(false);
                setCurrentAlumno(null);
              }}
            >
              <X />
            </ActionButton>
          </ModalHeader>

          <Form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const alumno = {
                id: currentAlumno?.id,
                nombre: formData.get("nombre"),
                email: formData.get("email"),
                especialidad: formData.get("especialidad"),
                departamento: formData.get("departamento"),
                telefono: formData.get("telefono"),
                credencial: formData.get("credencial"),
              };

              currentAlumno
                ? handleEditAlumno(alumno)
                : handleAddAlumno(alumno);
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
                <Briefcase size={16} /> Carrera
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
                <Phone size={16} /> Telefono
              </Label>
              <Input
                type="text"
                name="departamento"
                defaultValue={initialState.departamento}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>
                <IdCard size={16} /> Credenciales
              </Label>
              <Input
                type="text"
                name="credenciales"
                defaultValue={initialState.credencial}
                required
              />
            </FormGroup>

            <ButtonGroup>
              <Button
                type="button"
                className="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentAlumno(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="primary">
                <Save size={16} />
                {currentAlumno ? "Actualizar" : "Guardar"}
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
          <Title>Gestión de Alumnos</Title>
        </PageHeader>

        <SearchContainer>
          <Search color={ColorsLogin.secondary100} />
          <SearchInput
            placeholder="Buscar alumnos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        <Table>
          <thead>
            <tr>
              <TableHeader>Nombre</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Carrera</TableHeader>
              <TableHeader>Credencial</TableHeader>
              <TableHeader>Facultad</TableHeader>
              <TableHeader>Telefono</TableHeader>
              <TableHeader>Acciones</TableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredAlumnos.map((alumno) => (
              <TableRow key={alumno.id}>
                <TableCell>{alumno.nombre}</TableCell>
                <TableCell>{alumno.email}</TableCell>
                <TableCell>{alumno.departamento}</TableCell>
                <TableCell>{alumno.credencial}</TableCell>
                <TableCell>{alumno.especialidad}</TableCell>
                <TableCell>{alumno.telefono}</TableCell>
                <TableCell>
                  <ActionButton
                    color={Colors.greyDark}
                    onClick={() => {
                      setCurrentAlumno(alumno);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit size={20} />
                  </ActionButton>
                  <ActionButton
                    color={ColorsLogin.secondary100}
                    onClick={() => handleDeleteAlumno(alumno.id)}
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

export default Alumno;
