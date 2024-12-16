import React, { useState, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { Users, GithubIcon, ArrowRightIcon } from "lucide-react";
import CardHeader from "../../../components/ui/cardHeader";
import { ColorsEstu } from "../../../style/colors";
import { Container,CardContent,CardHeaders,CardImage,CollaboratorCard,CollaboratorsGrid,EnterButton,Name,ParticipantCircle,ParticipantsContainer,Role,fadeIn } from "../../../style/estudiante/colaborativoStyled";

const COLLABORATORS = [
  {
    id: 1,
    name: "Maria Rene",
    role: "Heladeria Flavor burst",
    tipo: "Privado",
    careers: ["Ingeniería Comercial", "Sistemas"],
    image:
      "https://static.vecteezy.com/system/resources/previews/001/961/501/large_2x/various-of-ice-cream-flavor-free-photo.jpg",
    participants: [
      "https://randomuser.me/api/portraits/women/1.jpg",
      "https://randomuser.me/api/portraits/men/2.jpg",
      "https://randomuser.me/api/portraits/women/3.jpg",
    ],
  },
  {
    id: 2,
    name: "Richard Torrico",
    role: "Juego carreras",
    tipo: "Publico",
    careers: ["Diseño grafico", "Sistemas"],
    image:
      "https://dinorank.com/img/dinobrain/40201/imagen8bcea1cbac00982d05796412ddcf2fb5.jpg",
    participants: [
      "https://randomuser.me/api/portraits/women/1.jpg",
      "https://randomuser.me/api/portraits/men/2.jpg",
      "https://randomuser.me/api/portraits/women/3.jpg",
    ],
  },
  {
    id: 3,
    name: "Yblin Vargas",
    role: "Integrador II",
    tipo: "Colaborativo",
    careers: ["Sistemas", "Ingeniera de sistemas"],
    image:
      "https://colombia.unir.net/wp-content/uploads/sites/4/2021/07/business-team-connect-pieces-of-gears-teamwork-partnership-and-picture-id1203832818.jpg",
    participants: [
      "https://randomuser.me/api/portraits/women/1.jpg",
      "https://randomuser.me/api/portraits/men/2.jpg",
      "https://randomuser.me/api/portraits/women/3.jpg",
    ],
  },
];

const Colaboradores = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCollaborators = useMemo(() => {
    return COLLABORATORS.filter(
      (collaborator) =>
        collaborator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collaborator.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collaborator.careers.some((career) =>
          career.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [searchQuery]);

  return (
    <Container>
      <CardHeader title="Colaboraciones" />
      <CollaboratorsGrid>
        {filteredCollaborators.map((collaborator) => (
          <CollaboratorCard key={collaborator.id}>
            <CardHeaders>
              <CardImage
                src={collaborator.image}
                alt={`Imagen de ${collaborator.name}`}
              />
            </CardHeaders>
            <CardContent>
              <Name>{collaborator.role}</Name>
              <Role>{collaborator.name}</Role>
              {collaborator?.careers?.map((v, i) => (
                <Carrear>
                  <CarrearLabel key={i}>{v}</CarrearLabel>
                </Carrear>
              ))}
              <ParticipantsContainer>
                {collaborator.participants
                  .slice(0, 3)
                  .map((participant, index) => (
                    <ParticipantCircle key={index}>
                      <img src={participant} alt="Participant" />
                    </ParticipantCircle>
                  ))}
                {collaborator.participants.length > 3 && (
                  <ParticipantCircle>
                    +{collaborator.participants.length - 3}
                  </ParticipantCircle>
                )}
              </ParticipantsContainer>
              <EnterButton>
                Entrar <ArrowRightIcon size={18} />
              </EnterButton>
            </CardContent>
          </CollaboratorCard>
        ))}
      </CollaboratorsGrid>
    </Container>
  );
};

export default Colaboradores;

const Carrear = styled.div`
  display: flex;
`;
const CarrearLabel = styled.h3`
  font-size: 18px;
`;
