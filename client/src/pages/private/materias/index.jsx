import React, { useState, useMemo } from "react";
import styled from "styled-components";
import Logo from "../../../assets/img/headerPort.svg";
import {
  SubjectsGrid,
  BackgroundIllustration,
  Container,
  Header,
  HeaderContent,
  HeaderTitle,
  ImageContainer,
  ImgLogo,
  SubjectCard,
  SubjectContent,
  SubjectDetail,
  SubjectImage,
  SubjectTitle,
  Title,
  TableContainer,
  H1Division,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
  TableStyled,
} from "../../../style/materiasStyled";
import CardHeader from "../../../components/ui/cardHeader";

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
  const data = [
    {
      asignatura: "INGENIERÍA DE SISTEMAS",
      dia: "VIE",
      hito1: "09/08/2024",
      hito2: "06/09/2024",
      hito3: "25/10/2024",
      hito4: "22/11/2024",
      hito5: "20/12/2024",
    },
    {
      asignatura: "INGENIERÍA DE SOFTWARE I",
      dia: "MIE",
      hito1: "07/08/2024",
      hito2: "04/09/2024",
      hito3: "16/10/2024",
      hito4: "20/11/2024",
      hito5: "18/12/2024",
    },
    {
      asignatura: "PROGRAMACION AVANZADA",
      dia: "JUE",
      hito1: "08/08/2024",
      hito2: "12/09/2024",
      hito3: "17/10/2024",
      hito4: "21/11/2024",
      hito5: "19/12/2024",
    },
    {
      asignatura: "PREPARACION Y EVALUACION DE PROYECTOS",
      dia: "MAR",
      hito1: "13/08/2024",
      hito2: "03/09/2024",
      hito3: "22/10/2024",
      hito4: "26/11/2024",
      hito5: "17/12/2024",
    },
    {
      asignatura: "PROYECTO INTEGRADOR INTERMEDIO I",
      dia: "LUN",
      hito1: "12/08/2024",
      hito2: "02/09/2024",
      hito3: "21/10/2024",
      hito4: "25/11/2024",
      hito5: "21/12/2024",
    },
    {
      asignatura: "SISTEMAS DE COMUNICACIONES",
      dia: "VIE",
      hito1: "09/08/2024",
      hito2: "13/09/2024",
      hito3: "18/10/2024",
      hito4: "22/11/2024",
      hito5: "13/12/2024",
    },
    {
      asignatura: "SISTEMAS DIGITALES",
      dia: "JUE",
      hito1: "08/08/2024",
      hito2: "05/09/2024",
      hito3: "24/10/2024",
      hito4: "21/11/2024",
      hito5: "19/12/2024",
    },
    {
      asignatura: "SISTEMAS OPERATIVOS MOVILES Y EMBEBIDOS",
      dia: "MAR",
      hito1: "13/08/2024",
      hito2: "10/09/2024",
      hito3: "15/10/2024",
      hito4: "19/11/2024",
      hito5: "17/12/2024",
    },
  ];
  return (
    <Container>
      <CardHeader title="Mis materias" />
      <H1Division>Materias</H1Division>
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
      <H1Division>Evaluaciones</H1Division>
      <TableContainer>
        <TableStyled>
          <TableHeader>
            <TableHeaderRow>
              <TableHeaderCell>ASIGNATURA</TableHeaderCell>
              <TableHeaderCell>DÍA</TableHeaderCell>
              <TableHeaderCell>HITO 1</TableHeaderCell>
              <TableHeaderCell>HITO 2</TableHeaderCell>
              <TableHeaderCell>HITO 3</TableHeaderCell>
              <TableHeaderCell>HITO 4</TableHeaderCell>
              <TableHeaderCell>HITO 5</TableHeaderCell>
            </TableHeaderRow>
          </TableHeader>
          <tbody>
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.asignatura}</TableCell>
                <TableCell>{item.dia}</TableCell>
                <TableCell>{item.hito1}</TableCell>
                <TableCell>{item.hito2}</TableCell>
                <TableCell>{item.hito3}</TableCell>
                <TableCell>{item.hito4}</TableCell>
                <TableCell>{item.hito5}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </TableStyled>
      </TableContainer>
    </Container>
  );
};

export default Materias;
