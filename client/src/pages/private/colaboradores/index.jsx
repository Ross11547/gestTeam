import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { Search, Users, LinkedinIcon, GithubIcon, Mail } from "lucide-react";
import { Header, IconWrapper, SearchBar } from "../../../style/estudiante/styledInicio";

const Container = styled.div`
  max-width: 95%;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
`;

const CollaboratorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const CollaboratorCard = styled.div`
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.4s ease;
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid #e0e0e0;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg, #4a90e2 0%, #50c878 100%);
  }

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 250px;
  overflow: hidden;
  position: relative;
`;

const CollaboratorImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;

  ${CollaboratorCard}:hover & {
    transform: scale(1.1);
  }
`;

const CollaboratorIconOverlay = styled(Users)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.7);
  z-index: 2;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${CollaboratorCard}:hover & {
    opacity: 1;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  padding-bottom: 1rem;
`;

const SocialIcon = styled.a`
  color: #6b7280;
  transition: color 0.3s ease, transform 0.2s ease;

  &:hover {
    color: #4a90e2;
    transform: scale(1.2);
  }
`;

const CollaboratorContent = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
`;

const CollaboratorName = styled.h2`
  font-size: 1.4rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const CollaboratorRole = styled.p`
  color: #6b7280;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const CollaboratorDetail = styled.p`
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0.25rem 0;
  text-align: center;
  font-weight: 500;
`;

const COLLABORATORS = [
  {
    id: 1,
    name: "Ana Martínez",
    role: "Desarrolladora Full Stack",
    department: "Ingeniería de Software",
    email: "ana.martinez@universidad.edu",
    image: "/api/placeholder/400/250?text=Ana",
    linkedin: "https://linkedin.com/in/anamartinez",
    github: "https://github.com/anamartinez"
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    role: "Arquitecto de Software",
    department: "Desarrollo de Sistemas",
    email: "carlos.rodriguez@universidad.edu",
    image: "/api/placeholder/400/250?text=Carlos",
    linkedin: "https://linkedin.com/in/carlosrodriguez",
    github: "https://github.com/carlosrodriguez"
  },
  {
    id: 3,
    name: "María García",
    role: "Especialista en IA",
    department: "Investigación Tecnológica",
    email: "maria.garcia@universidad.edu",
    image: "/api/placeholder/400/250?text=Maria",
    linkedin: "https://linkedin.com/in/mariagarcia",
    github: "https://github.com/mariagarcia"
  },
  {
    id: 4,
    name: "Juan Pérez",
    role: "Líder de Proyecto",
    department: "Gestión de Innovación",
    email: "juan.perez@universidad.edu",
    image: "/api/placeholder/400/250?text=Juan",
    linkedin: "https://linkedin.com/in/juanperez",
    github: "https://github.com/juanperez"
  },
  {
    id: 5,
    name: "Laura Sánchez",
    role: "Diseñadora UX/UI",
    department: "Diseño de Interfaces",
    email: "laura.sanchez@universidad.edu",
    image: "/api/placeholder/400/250?text=Laura",
    linkedin: "https://linkedin.com/in/laurasanchez",
    github: "https://github.com/laurasanchez"
  },
  {
    id: 6,
    name: "David Torres",
    role: "Especialista en Redes",
    department: "Infraestructura IT",
    email: "david.torres@universidad.edu",
    image: "/api/placeholder/400/250?text=David",
    linkedin: "https://linkedin.com/in/davidtorres",
    github: "https://github.com/davidtorres"
  },
];

const Colaboradores = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCollaborators = useMemo(() => {
    return COLLABORATORS.filter(
      (collaborator) =>
        collaborator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collaborator.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collaborator.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <Container>
      <Header>
        <Title>Nuestros Colaboradores</Title>
        <div style={{ position: "relative" }}>
          <SearchBar
            type="text"
            placeholder="Buscar colaboradores..."
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
      <CollaboratorsGrid>
        {filteredCollaborators.map((collaborator) => (
          <CollaboratorCard key={collaborator.id}>
            <ImageContainer>
              <CollaboratorImage 
                src={collaborator.image} 
                alt={`Imagen de ${collaborator.name}`} 
              />
              <CollaboratorIconOverlay size={50} />
            </ImageContainer>
            <CollaboratorContent>
              <CollaboratorName>{collaborator.name}</CollaboratorName>
              <CollaboratorRole>{collaborator.role}</CollaboratorRole>
              <CollaboratorDetail>{collaborator.department}</CollaboratorDetail>
              <CollaboratorDetail>{collaborator.email}</CollaboratorDetail>
            </CollaboratorContent>
            <SocialLinks>
              <SocialIcon href={collaborator.linkedin} target="_blank" rel="noopener noreferrer">
                <LinkedinIcon size={24} />
              </SocialIcon>
              <SocialIcon href={collaborator.github} target="_blank" rel="noopener noreferrer">
                <GithubIcon size={24} />
              </SocialIcon>
              <SocialIcon href={`mailto:${collaborator.email}`}>
                <Mail size={24} />
              </SocialIcon>
            </SocialLinks>
          </CollaboratorCard>
        ))}
      </CollaboratorsGrid>
    </Container>
  );
};

export default Colaboradores;