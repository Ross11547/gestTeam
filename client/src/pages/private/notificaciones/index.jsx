import React, { useState } from 'react';
import styled from 'styled-components';
import { FaBell, FaComments, FaUserPlus, FaTrashAlt, FaCheck } from 'react-icons/fa';
import CardHeader from '../../../components/ui/cardHeader';
import { Colors, ColorsEstu, ColorsLogin } from '../../../style/colors';
import { Acciones, Apartado, ApartadoTitulo, BotonAccion, BuscarInput, Container, ContainerNoti, EmptyMessage, Fecha, IconWrapper, MarcarLeidoButton, Mensaje, NotificacionContent, NotificacionesList, NotificacionItemWrapper } from '../../../style/estudiante/styledNotificacion';

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
                    <BuscarInput type="text" placeholder="Buscar notificaciones..." value={buscar} onChange={(e) => setBuscar(e.target.value)} />
                    <BotonAccion onClick={handleMarcarTodoLeido}>
                        <FaCheck /> Marcar todo como leído
                    </BotonAccion>
                    <BotonAccion onClick={handleLimpiarNotificaciones}>
                        <FaTrashAlt /> Limpiar Notificaciones
                    </BotonAccion>
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

export default Notificacion;
