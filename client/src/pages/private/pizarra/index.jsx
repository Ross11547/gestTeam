import React, { useState, useEffect } from 'react';
import { Plus, Users, User, UsersRound } from 'lucide-react';
import ExcalidrawComponente from '../../../components/excalidraw';
import { BoardCard, BoardsGrid, CardDate, CardHeaders, CardTitle, CloseButton, Container, Header, Modal, ModalContent, ModalHeader, ModalTitle, NewBoardButton, TabButton, TabsContainer, TabsList, FormGroup, FormActions } from '../../../style/estudiante/styledPizarra';
import { ROUTES } from "../../../enums/routes/Routes";
import { useNavigate } from 'react-router-dom';
import CardHeader from '../../../components/ui/cardHeader';

const Pizarra = () => {
  const [activeTab, setActiveTab] = useState('individual');
  const [showModal, setShowModal] = useState(false);
  const [boardName, setBoardName] = useState("");
  const [boardType, setBoardType] = useState("individual");
  const [boardDate, setBoardDate] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedFaculties, setSelectedFaculties] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    fetchStudents();
    fetchFaculties();
  }, []);
  const fetchStudents = async () => {
    const data = await fetch("/api/students").then((res) => res.json());
    setStudents(data);
  };
  const fetchFaculties = async () => {
    const data = await fetch("/api/faculties").then((res) => res.json());
    setFaculties(data);
  };
  const handleCreateBoard = () => {
    const newBoard = {
      name: boardName,
      type: boardType,
      date: boardDate,
      students: selectedStudents,
      faculties: selectedFaculties,
    };
    console.log("Creando pizarra:", newBoard);
    navigate(ROUTES.EXCALIDRAW);
  };
  const boards = {
    individual: [
      { id: 1, title: "Mi primera pizarra", date: "2024-02-01", type: "individual" },
      { id: 2, title: "Notas personales", date: "2024-02-05", type: "individual" },
    ],
    grupal: [
      { id: 3, title: "Proyecto Equipo A", date: "2024-02-03", type: "grupal" },
      { id: 4, title: "Lluvia de ideas", date: "2024-02-06", type: "grupal" },
    ],
    colaborativo: [
      { id: 5, title: "Workshop Design", date: "2024-02-04", type: "colaborativo" },
      { id: 6, title: "Planificación Q1", date: "2024-02-07", type: "colaborativo" },
    ],
  };
  const getIcon = (type) => {
    switch (type) {
      case 'individual':
        return <User size={20} color="#2563EB" />;
      case 'grupal':
        return <Users size={20} color="#10B981" />;
      case 'colaborativo':
        return <UsersRound size={20} color="#8B5CF6" />;
      default:
        return null;
    }
  };
  return (
    <Container>
      <CardHeader title="Pizarras">
        <Header>
          <NewBoardButton onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Nueva Pizarra
          </NewBoardButton>
        </Header>
      </CardHeader>
      <TabsContainer>
        <TabsList>
          {['individual', 'grupal', 'colaborativo'].map((tab) => (
            <TabButton
              key={tab}
              active={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'individual' && <User size={16} />}
              {tab === 'grupal' && <Users size={16} />}
              {tab === 'colaborativo' && <UsersRound size={16} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabButton>
          ))}
        </TabsList>
        <BoardsGrid>
          {boards[activeTab].map((board) => (
            <BoardCard key={board.id}>
              <CardHeaders>
                <CardTitle>{board.title}</CardTitle>
                {getIcon(board.type)}
              </CardHeaders>
              <CardDate>Creada el: {new Date(board.date).toLocaleDateString()}</CardDate>
            </BoardCard>
          ))}
        </BoardsGrid>
      </TabsContainer>
      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Nueva Pizarra</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>&times;</CloseButton>
            </ModalHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateBoard();
              }}
            >
              <FormGroup>
                <label htmlFor="boardName">Nombre de la Pizarra</label>
                <input
                  type="text"
                  id="boardName"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label htmlFor="boardType">Tipo</label>
                <select
                  id="boardType"
                  value={boardType}
                  onChange={(e) => setBoardType(e.target.value)}
                  required
                >
                  <option value="individual">Individual</option>
                  <option value="grupal">Grupal</option>
                  <option value="colaborativo">Colaborativo</option>
                </select>
              </FormGroup>
              {boardType === "grupal" && (
                <FormGroup>
                  <label htmlFor="students">Seleccionar Estudiantes</label>
                  <select
                    id="students"
                    multiple
                    value={selectedStudents}
                    onChange={(e) =>
                      setSelectedStudents(
                        Array.from(e.target.selectedOptions, (option) => option.value)
                      )
                    }
                  >
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </FormGroup>
              )}
              {boardType === "colaborativo" && (
                <FormGroup>
                  <label htmlFor="faculties">Seleccionar Otras Facultades</label>
                  <select
                    id="faculties"
                    multiple
                    value={selectedFaculties}
                    onChange={(e) =>
                      setSelectedFaculties(
                        Array.from(e.target.selectedOptions, (option) => option.value)
                      )
                    }
                  >
                    {faculties.map((faculty) => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </option>
                    ))}
                  </select>
                </FormGroup>
              )}
              <FormGroup>
                <label htmlFor="boardDate">Fecha</label>
                <input
                  type="date"
                  id="boardDate"
                  value={boardDate}
                  onChange={(e) => setBoardDate(e.target.value)}
                  required
                />
              </FormGroup>
              <FormActions>
                <button type="submit" onClick={handleCreateBoard}>Crear</button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
              </FormActions>
            </form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Pizarra;