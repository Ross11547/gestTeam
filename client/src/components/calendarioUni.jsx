import React from 'react';
import { Calendar as BigCalendar, dayjsLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';
import 'dayjs/locale/es';
import {
  ContenedorPagina,
  ContenedorCalendarioVista,
  ContenedorCalendario,
  ContenedorRecordatoriosVista,
  TituloRecordatorio,
  ItemRecordatorio,
  IconoRecordatorio,
  DivTexto,
  TextoRecordatorio,
  TextoDescripcion,
  BotonNavegacion,
  CirculoDia,
  ContenedorDia,
  ContenedorHerramientas,
  EtiquetaMesAno,
  EventoColor,
  ContenedorEstadisticas,
  TituloEstadisticas,
  TextoEstadisticas,
  ContenedorDestacados,
  TituloDestacados,
  ItemDestacado,
  ConteinerDerecho
} from '../style/estudiante/calendarioStyle.jsx';
import { events, colorMap } from '../data/datosDate.jsx';
import CardHeader from './ui/cardHeader.jsx';

dayjs.locale('es');

const CalendarioUni = () => {
  const localizer = dayjsLocalizer(dayjs);

  const components = {
    toolbar: ({ label, onNavigate }) => (
      <ContenedorHerramientas>
        <BotonNavegacion onClick={() => onNavigate('PREV')}><FaChevronLeft /></BotonNavegacion>
        <EtiquetaMesAno>{label.toUpperCase()}</EtiquetaMesAno>
        <BotonNavegacion onClick={() => onNavigate('NEXT')}><FaChevronRight /></BotonNavegacion>
      </ContenedorHerramientas>
    ),
    dateCellWrapper: ({ children, value }) => {
      const event = events.find(event =>
        dayjs(value).isSame(event.start, 'day')
      );
      const color = event ? colorMap[event.title] : 'transparent';

      return (
        <ContenedorDia>
          <CirculoDia style={{ backgroundColor: color }}>{children}</CirculoDia>
        </ContenedorDia>
      );
    },
    event: () => {
      return (
        <EventoColor>
          <FaCalendarAlt />
        </EventoColor>
      );
    }
  };

  const formats = {
    weekdayFormat: (date, culture, localizer) => localizer.format(date, 'dd', culture).charAt(0)
  };

  const eventosDelMes = events.filter(event =>
    dayjs(event.start).isSame(dayjs(), 'month')
  );

  const proximosEventos = events
    .filter(event => dayjs(event.start).isAfter(dayjs()))
    .sort((a, b) => dayjs(a.start) - dayjs(b.start))
    .slice(0, 3);

  return (
    <div>
      <CardHeader title="Calendario"></CardHeader>
      <ContenedorPagina>
        <ContenedorCalendarioVista>
          <ContenedorCalendario>
            <BigCalendar
              localizer={localizer}
              events={events}
              views={['month']}
              components={components}
              popup
              startAccessor="start"
              endAccessor="end"
              style={{ height: '500px', width: '100%', fontSize: '15px' }}
              defaultDate={new Date()}
              formats={formats}
            />
          </ContenedorCalendario>
        </ContenedorCalendarioVista>

        <ContenedorRecordatoriosVista>
          <TituloRecordatorio>Recordatorios</TituloRecordatorio>
          {events.map((event, index) => (
            <ItemRecordatorio key={index}>
              <IconoRecordatorio><FaCalendarAlt /></IconoRecordatorio>
              <DivTexto>
                <TextoRecordatorio>
                  {event.title} - {dayjs(event.start).format('DD MMMM YYYY')} - {dayjs(event.start).format('h A')}
                </TextoRecordatorio>
                <TextoDescripcion>
                  {event.description}
                </TextoDescripcion>
              </DivTexto>
            </ItemRecordatorio>
          ))}
        </ContenedorRecordatoriosVista>
        <ConteinerDerecho>

          {/* Nueva sección: Estadísticas */}
          <ContenedorEstadisticas>
            <TituloEstadisticas>Estadísticas del Mes</TituloEstadisticas>
            <TextoEstadisticas>Eventos: {eventosDelMes.length}</TextoEstadisticas>
            <TextoEstadisticas>Ferias: {eventosDelMes.filter(e => e.type === 'Reunión').length}</TextoEstadisticas>
          </ContenedorEstadisticas>

          {/* Nueva sección: Próximos Eventos Destacados */}
          <ContenedorDestacados>
            <TituloDestacados>Eventos Importantes</TituloDestacados>
            {proximosEventos.map((event, index) => (
              <ItemDestacado key={index}>
                <TextoRecordatorio>
                  {event.title} - {dayjs(event.start).format('DD MMMM YYYY')} - {dayjs(event.start).format('h A')}
                </TextoRecordatorio>
                <TextoDescripcion>{event.description}</TextoDescripcion>
              </ItemDestacado>
            ))}
          </ContenedorDestacados>
        </ConteinerDerecho>
      </ContenedorPagina>
    </div>
  );
};

export default CalendarioUni;
