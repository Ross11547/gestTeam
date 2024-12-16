import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { Search, BookOpen } from "lucide-react";
import Logo from "../../../assets/img/headerPort.svg";
//import { Header, IconWrapper, SearchBar } from "../../../style/styledInicio";
const Container = styled.div`
  width: 100%;
  padding: 1rem;
  height: 100vh;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #fff;
  margin-bottom: 1rem;
  font-weight: bold;
`;

const SubjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const SubjectCard = styled.div`
  cursor: pointer;
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
    background: linear-gradient(90deg, #f89c5e 0%, #ffcc00 100%);
  }

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 200px;
  overflow: hidden;
  position: relative;
`;

const SubjectImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;

  ${SubjectCard}:hover & {
    transform: scale(1.1);
  }
`;

const SubjectIconOverlay = styled(BookOpen)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.7);
  z-index: 2;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${SubjectCard}:hover & {
    opacity: 1;
  }
`;

const SubjectContent = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
`;

const SubjectTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  text-align: center;
`;

const SubjectDetail = styled.p`
  color: #6b7280;
  font-size: 1rem;
  margin: 0.25rem 0;
  text-align: center;
  font-weight: 500;
`;

const SUBJECTS = [
  {
    id: 1,
    name: "Ingeniería de Software I",
    teacher: "Yblin Vargas",
    schedule: "07:30 am a 10:00 am",
    classroom: "Aula 301",
    image:
      "https://concepto.de/wp-content/uploads/2015/03/software-1-e1550080097569.jpg",
  },
  {
    id: 2,
    name: "Programación Avanzada",
    teacher: "Carlos Mendoza",
    schedule: "10:30 am a 1:00 pm",
    classroom: "Aula 302",
    image:
      "https://concepto.de/wp-content/uploads/2020/08/Programacion-informatica-scaled-e1724960033513.jpg",
  },
  {
    id: 3,
    name: "Bases de Datos",
    teacher: "María González",
    schedule: "2:00 pm a 4:30 pm",
    classroom: "Aula 303",
    image:
      "https://www.ymant.com/wp-content/uploads/2017/02/Base-de-Datos-YMANT.jpg.webp",
  },
  {
    id: 4,
    name: "Arquitectura de Software",
    teacher: "Juan Pérez",
    schedule: "4:30 pm a 7:00 pm",
    classroom: "Aula 304",
    image:
      "https://www.starkcloud.com/hubfs/Futuro%20del%20Desarrollo%20de%20Software.webp",
  },
  {
    id: 5,
    name: "Inteligencia Artificial",
    teacher: "Ana Rodríguez",
    schedule: "8:00 am a 10:30 am",
    classroom: "Aula 305",
    image:
      "https://mediatek-marketing.transforms.svdcdn.com/production/posts/MediaTek-IA-2023.jpg?w=2048&h=1075&q=80&auto=format&fit=crop&dm=1688130337&s=3b56535c28f441a34db9455d64444cb7",
  },
  {
    id: 6,
    name: "Redes de Computadoras",
    teacher: "Luis Martínez",
    schedule: "1:00 pm a 3:30 pm",
    classroom: "Aula 306",
    image:
      "https://img.redestelecom.es/wp-content/uploads/2024/04/22124120/Conexiones-con-perifericos--1620x1080.jpg",
  },
];

const Materias = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSubjects = useMemo(() => {
    return SUBJECTS.filter(
      (subject) =>
        subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.teacher.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <Container>
      {/*  <Header>
        <Title>Mis Materias</Title>
        <div style={{ position: "relative" }}>
          <SearchBar
            type="text"
            placeholder="Buscar materias..."
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
      </Header> */}
      <Header>
        <HeaderTitle>
          <Title>Mis Materias</Title>
          <CardHeader style={{ position: "relative" }}>
            <SearchBar
              type="text"
              placeholder="Buscar materias..."
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
          </CardHeader>
        </HeaderTitle>
        <HeaderContent></HeaderContent>
        <BackgroundIllustration>
          <ImgLogo src={Logo} />
        </BackgroundIllustration>
      </Header>
      <SubjectsGrid>
        {filteredSubjects.map((subject) => (
          <SubjectCard key={subject.id}>
            <ImageContainer>
              <SubjectImage
                src={subject.image}
                alt={`Imagen de ${subject.name}`}
              />
            </ImageContainer>
            <SubjectContent>
              <SubjectTitle>{subject.name}</SubjectTitle>
              <SubjectDetail>Prof. {subject.teacher}</SubjectDetail>
              <SubjectDetail>{subject.schedule}</SubjectDetail>
              <SubjectDetail>{subject.classroom}</SubjectDetail>
            </SubjectContent>
          </SubjectCard>
        ))}
      </SubjectsGrid>
    </Container>
  );
};

export default Materias;
export const CardHeader = styled.div``;
export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  height: 280px;
  color: #333;
  background: linear-gradient(135deg, #ffcc00 0%, #ffd54f 100%);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 30px;
  padding: 20px;
  position: relative;
  flex-direction: column;
`;

export const HeaderContent = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 20px;
`;

/* export const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: bold;
`; */

export const SearchBar = styled.input`
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 30px;
  width: 300px;
  font-size: 1rem;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.15);
    width: 320px;
  }
`;

export const IconWrapper = styled.span`
  margin-right: 0.5rem;
  display: inline-flex;
  align-items: center;
  color: #333;
`;

export const BackgroundIllustration = styled.div`
  position: absolute;
  top: -25px;
  right: 0;
  bottom: 0;
  width: 40%;
  //opacity: 0.1;
  display: flex;
  align-items: center;
  justify-content: center;
`;
export const ImgLogo = styled.img`
  width: 350px;
  height: 350px;
`;
export const HeaderTitle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;

  width: 100%;
  
`;
