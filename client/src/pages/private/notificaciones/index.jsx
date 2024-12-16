import React, { useState } from 'react';
import styled from 'styled-components';
import { FaBell, FaComments, FaUserPlus, FaTrashAlt, FaCheck } from 'react-icons/fa';
import CardHeader from '../../../components/ui/cardHeader';
import { Colors, ColorsEstu, ColorsLogin } from '../../../style/colors';

const NotificacionItem = ({ tipo, mensaje, fecha, leido, onClick, onMarcarLeido }) => {
    const iconos = {
        actualizacion: <FaBell size={24} color={leido ? ColorsLogin.secondary300 : ColorsEstu.primary600} />,
        comentario: <FaComments size={24} color={leido ? ColorsEstu.primary900 : ColorsEstu.primary600} />,
        incorporacion: <FaUserPlus size={24} color={leido ?  Colors.greyLight : ColorsEstu.primary600} />,
    };

    return (
        <NotificacionItemWrapper leido={leido} onClick={onClick}>
            <IconWrapper>{iconos[tipo]}</IconWrapper>
            <NotificacionContent>
                <Mensaje>{mensaje}</Mensaje>
                <Fecha>{fecha}</Fecha>
                {!leido && (
                    <MarcarLeidoButton onClick={(e) => {
                        e.stopPropagation();
                        onMarcarLeido();
                    }}>
                        <FaCheck /> Marcar como leído
                    </MarcarLeidoButton>
                )}
            </NotificacionContent>
        </NotificacionItemWrapper>
    );
};

const Notificacion = () => {
    const [notificaciones, setNotificaciones] = useState([
        {
            id: 1,
            tipo: 'actualizacion',
            mensaje: 'Nueva actualización disponible en tu proyecto',
            fecha: '2024-11-18 10:30 AM',
            leido: false,
        },
        {
            id: 2,
            tipo: 'comentario',
            mensaje: 'Comentario agregado en tu tarea',
            fecha: '2024-11-17 02:45 PM',
            leido: false,
        },
        {
            id: 3,
            tipo: 'incorporacion',
            mensaje: 'Un nuevo miembro se unió a tu repositorio',
            fecha: '2024-11-16 04:00 PM',
            leido: true,
        },
        {
            id: 4,
            tipo: 'incorporacion',
            mensaje: 'Un nuevo miembro se unió a tu repositorio',
            fecha: '2024-11-16 04:00 PM',
            leido: false,
        }
    ]);

    const [buscar, setBuscar] = useState('');

    const handleMarcarLeido = (id) => {
        setNotificaciones((prev) =>
            prev.map((n) => (n.id === id ? { ...n, leido: true } : n))
        );
    };

    const handleMarcarTodoLeido = () => {
        setNotificaciones((prev) => prev.map((n) => ({ ...n, leido: true })));
    };

    const handleLimpiarNotificaciones = () => {
        setNotificaciones([]);
    };

    const notificacionesFiltradas = notificaciones.filter((n) =>
        n.mensaje.toLowerCase().includes(buscar.toLowerCase())
    );

    const recientes = notificacionesFiltradas.filter((n) => !n.leido);
    const historico = notificacionesFiltradas.filter((n) => n.leido);

    return (
        <Container>
            <CardHeader title="Notificaciones">
                <Acciones>
                    <BotonAccion onClick={handleMarcarTodoLeido}>
                        <FaCheck /> Marcar todo como leído
                    </BotonAccion>
                    <BotonAccion onClick={handleLimpiarNotificaciones}>
                        <FaTrashAlt /> Limpiar Notificaciones
                    </BotonAccion>
                    <BuscarInput type="text" placeholder="Buscar notificaciones..." value={buscar} onChange={(e) => setBuscar(e.target.value)} />
                </Acciones>
            </CardHeader>
            <ContainerNoti>
                <Apartado>
                    <ApartadoTitulo>Notificaciones recientes</ApartadoTitulo>
                    <NotificacionesList>
                        {recientes.length > 0 ? (
                            recientes.map((notificacion) => (
                                <NotificacionItem
                                    key={notificacion.id}
                                    {...notificacion}
                                    onMarcarLeido={() => handleMarcarLeido(notificacion.id)}
                                />
                            ))
                        ) : (
                            <EmptyMessage>No hay notificaciones recientes.</EmptyMessage>
                        )}
                    </NotificacionesList>
                </Apartado>
                <Apartado>
                    <ApartadoTitulo>Historial de notificaciones</ApartadoTitulo>
                    <NotificacionesList>
                        {historico.length > 0 ? (
                            historico.map((notificacion) => (
                                <NotificacionItem
                                    key={notificacion.id}
                                    {...notificacion}
                                />
                            ))
                        ) : (
                            <EmptyMessage>No hay notificaciones en el historial.</EmptyMessage>
                        )}
                    </NotificacionesList>
                </Apartado>
            </ContainerNoti>
        </Container>
    );
};

const Container = styled.div`
  width: 100%;
  padding: 20px;
`;

const Acciones = styled.div`
  width:50%;
  height: 100%;
  display:flex;
  flex-direction: column;
  background:red;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const BotonAccion = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: linear-gradient(135deg,${ColorsEstu.primary800}, ${ColorsEstu.primary900});
  color: ${Colors.white};
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: linear-gradient(135deg, ${ColorsEstu.primary900},${ColorsEstu.primary800});
}
`;

const BuscarInput = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid ${Colors.greyLight};
  border-radius: 5px;
`;

const ContainerNoti = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  gap: 15px;
`;

const Apartado = styled.div`
  width: 50%;
  height: 50%;
`;

const ApartadoTitulo = styled.h3`
  font-size: 1.2rem;
  color:${Colors.black};
  margin-bottom: 20px;
`;

const NotificacionesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const NotificacionItemWrapper = styled.div`
  display: flex;
  align-items: center;
  background: ${({ leido }) => (leido ? '#f5f5f5' : '#fff')};
  border: none;
  box-shadow:  0 5px 15px rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
`;

const IconWrapper = styled.div`
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotificacionContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Mensaje = styled.p`
  font-size: 1rem;
  color: ${Colors.black};
  margin: 0;
  font-weight: 500;
`;

const Fecha = styled.small`
  color: ${Colors.greyLight};
  font-size: 0.85rem;
  margin-top: 5px;
`;

const MarcarLeidoButton = styled.button`
  margin-top: 10px;
  background: ${ColorsEstu.primary200};
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover {
    background:${ColorsEstu.primary800};
  }
`;

const EmptyMessage = styled.p`
  font-size: 1rem;
  color: ${Colors.greyLight};
  text-align: center;
`;

export default Notificacion;
