import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  height: 100vh;
  padding: 1rem;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  height: 120px;
  color: #fff;
  background: #ffcc00;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 30px;
  padding: 20px;
`;

export const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  position: relative;
`;

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

export const TabList = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  padding-top: 10px;

  overflow-x: auto;
  padding-bottom: 1rem;
`;

export const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  background: ${(props) => (props.active ? "#FFCC00" : "white")};
  color: ${(props) => (props.active ? "white" : "#333")};
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  &:hover {
    //background: ${(props) => (props.active ? "#FFDE59" : "#FFCC00")};
    transform: translateY(-2px);
    color: ${(props) => (props.active ? "#fff" : "#FFCC00")};
  }
`;

export const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
`;

export const ProjectCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    cursor: pointer;
    transform: translateY(-5px);
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.12);
  }
`;

export const ProjectType = styled.span`
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  background: #ffde59;
  color: #333;
  display: inline-block;
  margin-bottom: 0.75rem;
  font-weight: 600;
`;

export const Rating = styled.div`
  color: #ffcc00;
  margin-bottom: 0.75rem;
`;

export const ProjectTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 700;
`;

export const ProjectInfo = styled.div`
  font-size: 0.875rem;
  color: #666;

  > div {
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
  }
`;

export const Label = styled.span`
  font-weight: 600;
  color: #333;
  margin-right: 0.5rem;
  min-width: 80px;
`;

export const IconWrapper = styled.span`
  margin-right: 0.5rem;
  display: inline-flex;
  align-items: center;
  color: #ffcc00;
`;
