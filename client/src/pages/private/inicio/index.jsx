import React, { useState } from "react";
import { Search } from "lucide-react";
import {
  Container,
  Header,
  Title,
  SearchBar,
  TabList,
  Tab,
  ProjectGrid,
  IconWrapper,
} from "../../../style/styledInicio";
import ProjectCard from "../../../components/ui/projectCard";

const TABS = ["Todos", "Ingeniería", "Medicina", "Psicología"];

const PROJECTS = [
  {
    title: "Sistema de Energía Renovable",
    type: "Grupal",
    rating: 5,
    subject: "Energía Sostenible",
    students: ["Ana García", "Carlos López", "María Rodríguez"],
    teachers: ["Dr. Juan Pérez", "Dra. Laura Martínez"],
  },
  {
    title: "Optimización de Redes Neuronales",
    type: "Individual",
    rating: 5,
    subject: "Inteligencia Artificial",
    students: ["David Wilson"],
    teachers: ["Dr. Robert Smith"],
  },
  {
    title: "Estudio de Comportamiento Social",
    type: "Grupal",
    rating: 4,
    subject: "Psicología Social",
    students: ["Elena Martínez", "Fernando Ruiz"],
    teachers: ["Dra. Sofia Blanco"],
  },
  {
    title: "Desarrollo de Vacuna Experimental",
    type: "Individual",
    rating: 5,
    subject: "Inmunología",
    students: ["Gabriel Torres"],
    teachers: ["Dr. Michael Brown", "Dra. Sarah Johnson"],
  },
];

const Inicio = () => {
  const [activeTab, setActiveTab] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = PROJECTS.filter(
    (project) =>
      (activeTab === "Todos" || project.subject.includes(activeTab)) &&
      (project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  return (
    <Container>
      <Header>
        <Title>Proyectos Destacados</Title>
        <div style={{ position: "relative" }}>
          <SearchBar
            type="text"
            placeholder="Buscar proyectos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <IconWrapper
            style={{
              position: "absolute",
              right: "15px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <Search size={20} />
          </IconWrapper>
        </div>
      </Header>

      <TabList>
        {TABS.map((tab) => (
          <Tab
            key={tab}
            active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Tab>
        ))}
      </TabList>

      <ProjectGrid>
        {filteredProjects.map((project, index) => (
          <ProjectCard key={index} {...project} />
        ))}
      </ProjectGrid>
    </Container>
  );
};

export default Inicio;
