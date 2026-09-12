import { useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  ChevronRight,
  FolderKanban,
  RefreshCw,
  Users,
} from "lucide-react";

import CardHeader from "../../../components/ui/cardHeader";
import { api } from "../../../services/api";
import { useColors } from "../../../style/colors";
import {
  Avatar,
  BotonDetalle,
  BotonReintentar,
  CabeceraProyecto,
  CabeceraSeccion,
  Cargador,
  Codigo,
  Contador,
  ContenidoHito,
  DatoResumen,
  Descripcion,
  DetalleSecundario,
  Distribucion,
  ErrorSecundario,
  Estado,
  EstadoVacio,
  Etiqueta,
  FilaEquipo,
  FilaHito,
  Hito,
  IconoPortada,
  LineaTiempo,
  ListaMiembros,
  ListaProyectos,
  MarcaHito,
  Miembro,
  Pagina,
  PanelDetalle,
  PanelLista,
  ProyectoBoton,
  ProyectoLinea,
  RejillaContextos,
  RejillaEquipos,
  Resumen,
  ResumenPortada,
  Seccion,
  TarjetaContexto,
  TarjetaEquipo,
  TextoAuxiliar,
  TituloPanel,
  TituloProyecto,
  TituloSeccion,
  VacioSeccion,
} from "../../../style/workspaceAcademicoStyle";

const extraerDatos = (respuesta) => respuesta?.data;

const formatearFecha = (fecha) => {
  if (!fecha) return "Sin fecha";
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return "Sin fecha";
  return valor.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const textoEstado = (estado) => {
  if (!estado) return "Sin estado";
  return String(estado).replaceAll("_", " ");
};

const mensajePorError = (error) => {
  const mensajes = {
    401: {
      titulo: "Sesión no válida",
      descripcion: "Inicia sesión nuevamente para consultar el workspace académico.",
    },
    403: {
      titulo: "Acceso no autorizado",
      descripcion: "No tienes permisos para consultar este contenido académico.",
    },
    404: {
      titulo: "Contenido no encontrado",
      descripcion: "El contenido solicitado ya no está disponible.",
    },
    409: {
      titulo: "La información cambió",
      descripcion: "Actualiza la vista para consultar el estado más reciente.",
    },
  };

  return (
    mensajes[error?.status] || {
      titulo: "No se pudo cargar la información",
      descripcion: error?.message || "Verifica tu conexión e inténtalo nuevamente.",
    }
  );
};

const EspacioAcademico = () => {
  const colores = useColors();
  const [proyectosPeriodo, setProyectosPeriodo] = useState([]);
  const [proyectoPeriodoId, setProyectoPeriodoId] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [contextos, setContextos] = useState([]);
  const [hitos, setHitos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorLista, setErrorLista] = useState(null);
  const [errorDetalle, setErrorDetalle] = useState(null);
  const [contextoAbierto, setContextoAbierto] = useState(null);
  const [hitoAbierto, setHitoAbierto] = useState(null);
  const [cargandoSecundario, setCargandoSecundario] = useState("");
  const [errorSecundario, setErrorSecundario] = useState(null);

  const cargarProyectosPeriodo = async () => {
    setCargandoLista(true);
    setErrorLista(null);

    try {
      const respuesta = await api.listarProyectosPeriodo();
      const lista = Array.isArray(extraerDatos(respuesta))
        ? extraerDatos(respuesta)
        : [];
      setProyectosPeriodo(lista);
      setProyectoPeriodoId((actual) => {
        if (lista.some((registro) => registro.id === actual)) return actual;
        return lista[0]?.id ?? null;
      });
    } catch (error) {
      setProyectosPeriodo([]);
      setProyectoPeriodoId(null);
      setErrorLista(error);
    } finally {
      setCargandoLista(false);
    }
  };

  useEffect(() => {
    cargarProyectosPeriodo();
  }, []);

  useEffect(() => {
    let vigente = true;

    const cargarDetalle = async () => {
      if (!proyectoPeriodoId) {
        setDetalle(null);
        setContextos([]);
        setHitos([]);
        setEquipos([]);
        return;
      }

      setCargandoDetalle(true);
      setErrorDetalle(null);
      setContextoAbierto(null);
      setHitoAbierto(null);
      setErrorSecundario(null);

      try {
        const seleccionado = proyectosPeriodo.find(
          (registro) => registro.id === proyectoPeriodoId
        );
        const proyectoId = seleccionado?.proyectoId;
        const periodoId = seleccionado?.periodoId;

        const [
          respuestaDetalle,
          respuestaContextos,
          respuestaHitos,
          respuestaEquipos,
        ] = await Promise.all([
          api.obtenerProyectoPeriodo(proyectoPeriodoId),
          api.listarProyectosMateria(proyectoPeriodoId),
          api.listarHitosProyecto(proyectoPeriodoId),
          api.listarEquipos({ proyectoId, periodoId }),
        ]);

        const listaEquipos = Array.isArray(extraerDatos(respuestaEquipos))
          ? extraerDatos(respuestaEquipos).filter(
              (equipo) => Number(equipo.proyectoPeriodoId) === Number(proyectoPeriodoId)
            )
          : [];
        const detallesEquipos = await Promise.all(
          listaEquipos.map(async (equipo) => {
            const respuestaEquipo = await api.obtenerEquipo(equipo.id);
            return extraerDatos(respuestaEquipo) || equipo;
          })
        );

        if (!vigente) return;

        const listaHitos = Array.isArray(extraerDatos(respuestaHitos))
          ? extraerDatos(respuestaHitos)
          : [];
        setDetalle(extraerDatos(respuestaDetalle) || null);
        setContextos(
          Array.isArray(extraerDatos(respuestaContextos))
            ? extraerDatos(respuestaContextos)
            : []
        );
        setHitos(
          [...listaHitos].sort(
            (primero, segundo) =>
              Number(primero?.hitoPeriodo?.orden || 0) -
              Number(segundo?.hitoPeriodo?.orden || 0)
          )
        );
        setEquipos(detallesEquipos);
      } catch (error) {
        if (!vigente) return;
        setDetalle(null);
        setContextos([]);
        setHitos([]);
        setEquipos([]);
        setErrorDetalle(error);
      } finally {
        if (vigente) setCargandoDetalle(false);
      }
    };

    cargarDetalle();
    return () => {
      vigente = false;
    };
  }, [proyectoPeriodoId, proyectosPeriodo]);

  const abrirContexto = async (contexto) => {
    if (contextoAbierto?.id === contexto.id) {
      setContextoAbierto(null);
      return;
    }

    setCargandoSecundario(`contexto-${contexto.id}`);
    setErrorSecundario(null);
    try {
      const respuesta = await api.obtenerProyectoMateria(contexto.id);
      setContextoAbierto(extraerDatos(respuesta) || contexto);
      setHitoAbierto(null);
    } catch (error) {
      setErrorSecundario(error);
    } finally {
      setCargandoSecundario("");
    }
  };

  const abrirHito = async (hito) => {
    if (hitoAbierto?.id === hito.id) {
      setHitoAbierto(null);
      return;
    }

    setCargandoSecundario(`hito-${hito.id}`);
    setErrorSecundario(null);
    try {
      const respuesta = await api.obtenerHitoProyecto(hito.id);
      setHitoAbierto(extraerDatos(respuesta) || hito);
      setContextoAbierto(null);
    } catch (error) {
      setErrorSecundario(error);
    } finally {
      setCargandoSecundario("");
    }
  };

  const reintentarDetalle = () => {
    const actual = proyectoPeriodoId;
    setProyectoPeriodoId(null);
    window.setTimeout(() => setProyectoPeriodoId(actual), 0);
  };

  const renderizarError = (error, reintentar) => {
    const contenido = mensajePorError(error);
    return (
      <EstadoVacio role="alert">
        <AlertCircle size={32} />
        <strong>{contenido.titulo}</strong>
        <span>{contenido.descripcion}</span>
        <BotonReintentar type="button" onClick={reintentar} $colores={colores}>
          <RefreshCw size={16} /> Reintentar
        </BotonReintentar>
      </EstadoVacio>
    );
  };

  return (
    <Pagina>
      <CardHeader
        title="Workspace académico"
        parrafo="Consulta el contexto vigente de tus proyectos académicos."
      >
        <ResumenPortada>
          <IconoPortada $colores={colores}>
            <FolderKanban size={30} />
          </IconoPortada>
          <div>
            <strong>Tu actividad académica en un solo lugar</strong>
            <span>Revisa materias, equipos e hitos asociados a cada proyecto.</span>
          </div>
        </ResumenPortada>
      </CardHeader>

      {cargandoLista ? (
        <EstadoVacio aria-live="polite">
          <Cargador $colores={colores} />
          <strong>Cargando proyectos autorizados...</strong>
        </EstadoVacio>
      ) : errorLista ? (
        renderizarError(errorLista, cargarProyectosPeriodo)
      ) : proyectosPeriodo.length === 0 ? (
        <EstadoVacio>
          <FolderKanban size={36} />
          <strong>No hay proyectos académicos disponibles</strong>
          <span>No tienes ProyectoPeriodo autorizados para consultar.</span>
          <BotonReintentar type="button" onClick={cargarProyectosPeriodo} $colores={colores}>
            <RefreshCw size={16} /> Actualizar
          </BotonReintentar>
        </EstadoVacio>
      ) : (
        <Distribucion>
          <PanelLista>
            <TituloPanel>Proyectos autorizados</TituloPanel>
            <ListaProyectos>
              {proyectosPeriodo.map((registro) => {
                const activo = registro.id === proyectoPeriodoId;
                return (
                  <ProyectoBoton
                    key={registro.id}
                    type="button"
                    onClick={() => setProyectoPeriodoId(registro.id)}
                    $activo={activo}
                    $colores={colores}
                  >
                    <ProyectoLinea>
                      <strong>{registro.proyecto?.titulo || "Proyecto sin título"}</strong>
                      <ChevronRight size={17} />
                    </ProyectoLinea>
                    <span>{registro.periodo?.nombre || "Periodo sin nombre"}</span>
                    <Estado $estado={registro.estado}>{textoEstado(registro.estado)}</Estado>
                  </ProyectoBoton>
                );
              })}
            </ListaProyectos>
          </PanelLista>

          <PanelDetalle>
            {cargandoDetalle ? (
              <EstadoVacio aria-live="polite">
                <Cargador $colores={colores} />
                <strong>Cargando detalle académico...</strong>
              </EstadoVacio>
            ) : errorDetalle ? (
              renderizarError(errorDetalle, reintentarDetalle)
            ) : detalle ? (
              <>
                <CabeceraProyecto $colores={colores}>
                  <Etiqueta>Proyecto</Etiqueta>
                  <TituloProyecto>{detalle.proyecto?.titulo || "Proyecto sin título"}</TituloProyecto>
                  {detalle.proyecto?.descripcion ? (
                    <Descripcion>{detalle.proyecto.descripcion}</Descripcion>
                  ) : null}
                  <Resumen>
                    <DatoResumen>
                      <CalendarDays size={18} />
                      <div>
                        <Etiqueta>Periodo académico</Etiqueta>
                        <strong>{detalle.periodo?.nombre || "Sin periodo"}</strong>
                      </div>
                    </DatoResumen>
                    <DatoResumen>
                      <FolderKanban size={18} />
                      <div>
                        <Etiqueta>Estado</Etiqueta>
                        <Estado $estado={detalle.estado}>{textoEstado(detalle.estado)}</Estado>
                      </div>
                    </DatoResumen>
                    <DatoResumen>
                      <CalendarDays size={18} />
                      <div>
                        <Etiqueta>Vigencia</Etiqueta>
                        <strong>{formatearFecha(detalle.fechaInicio)} - {formatearFecha(detalle.fechaFin)}</strong>
                      </div>
                    </DatoResumen>
                  </Resumen>
                </CabeceraProyecto>

                <Seccion>
                  <CabeceraSeccion>
                    <div>
                      <TituloSeccion>Materias / contextos académicos</TituloSeccion>
                      <TextoAuxiliar>{contextos.length} contexto(s) autorizado(s)</TextoAuxiliar>
                    </div>
                    <BookOpen size={22} />
                  </CabeceraSeccion>
                  {contextos.length === 0 ? (
                    <VacioSeccion>No hay materias o contextos académicos disponibles.</VacioSeccion>
                  ) : (
                    <RejillaContextos>
                      {contextos.map((contexto) => (
                        <TarjetaContexto key={contexto.id}>
                          <Codigo>{contexto.materia?.codigo || "Sin código"}</Codigo>
                          <strong>{contexto.materia?.nombre || "Materia sin nombre"}</strong>
                          <span>Paralelo: {contexto.clase?.paralelo || "No asignado"}</span>
                          <BotonDetalle
                            type="button"
                            onClick={() => abrirContexto(contexto)}
                            $colores={colores}
                            disabled={cargandoSecundario === `contexto-${contexto.id}`}
                          >
                            {cargandoSecundario === `contexto-${contexto.id}`
                              ? "Cargando..."
                              : contextoAbierto?.id === contexto.id
                                ? "Ocultar detalle"
                                : "Ver detalle"}
                          </BotonDetalle>
                          {contextoAbierto?.id === contexto.id ? (
                            <DetalleSecundario>
                              <span>Equipos vinculados</span>
                              <strong>{contextoAbierto.equiposCount ?? 0}</strong>
                            </DetalleSecundario>
                          ) : null}
                        </TarjetaContexto>
                      ))}
                    </RejillaContextos>
                  )}
                </Seccion>

                <Seccion>
                  <CabeceraSeccion>
                    <div>
                      <TituloSeccion>Equipo</TituloSeccion>
                      <TextoAuxiliar>Integrantes registrados en el periodo académico</TextoAuxiliar>
                    </div>
                    <Users size={22} />
                  </CabeceraSeccion>
                  {equipos.length === 0 ? (
                    <VacioSeccion>No hay equipos vinculados a este ProyectoPeriodo.</VacioSeccion>
                  ) : (
                    <RejillaEquipos>
                      {equipos.map((equipo) => (
                        <TarjetaEquipo key={equipo.id}>
                          <FilaEquipo>
                            <div>
                              <strong>{equipo.nombre || "Equipo sin nombre"}</strong>
                              <span>{equipo.materia?.nombre || "Sin materia vinculada"}</span>
                            </div>
                            <Contador>{equipo.miembros?.length ?? equipo._count?.miembros ?? 0}</Contador>
                          </FilaEquipo>
                          {Array.isArray(equipo.miembros) && equipo.miembros.length > 0 ? (
                            <ListaMiembros>
                              {equipo.miembros.map((miembro) => (
                                <Miembro key={`${equipo.id}-${miembro.usuarioId}`}>
                                  <Avatar $colores={colores}>
                                    {(miembro.usuario?.nombre?.[0] || "U").toUpperCase()}
                                  </Avatar>
                                  <div>
                                    <strong>
                                      {[miembro.usuario?.nombre, miembro.usuario?.apellido]
                                        .filter(Boolean)
                                        .join(" ") || "Usuario"}
                                    </strong>
                                    <span>{textoEstado(miembro.rolEquipo)}</span>
                                  </div>
                                </Miembro>
                              ))}
                            </ListaMiembros>
                          ) : (
                            <TextoAuxiliar>Sin integrantes registrados.</TextoAuxiliar>
                          )}
                        </TarjetaEquipo>
                      ))}
                    </RejillaEquipos>
                  )}
                </Seccion>

                <Seccion>
                  <CabeceraSeccion>
                    <div>
                      <TituloSeccion>Hitos del proyecto H1-H5</TituloSeccion>
                      <TextoAuxiliar>Timeline ordenado por hitoPeriodo.orden</TextoAuxiliar>
                    </div>
                    <CalendarDays size={22} />
                  </CabeceraSeccion>
                  {hitos.length === 0 ? (
                    <VacioSeccion>No hay hitos del proyecto configurados.</VacioSeccion>
                  ) : (
                    <LineaTiempo>
                      {hitos.map((hito) => {
                        const orden = hito.hitoPeriodo?.orden;
                        return (
                          <Hito key={hito.id}>
                            <MarcaHito $colores={colores}>H{orden ?? "-"}</MarcaHito>
                            <ContenidoHito>
                              <FilaHito>
                                <div>
                                  <strong>{hito.nombre || hito.hitoPeriodo?.nombre || `Hito H${orden}`}</strong>
                                  <span>{formatearFecha(hito.fechaInicio)} - {formatearFecha(hito.fechaFin)}</span>
                                </div>
                                <Estado $estado={hito.estado}>{textoEstado(hito.estado)}</Estado>
                              </FilaHito>
                              <p>{hito.descripcion || hito.hitoPeriodo?.descripcion || "Sin descripción."}</p>
                              <BotonDetalle
                                type="button"
                                onClick={() => abrirHito(hito)}
                                $colores={colores}
                                disabled={cargandoSecundario === `hito-${hito.id}`}
                              >
                                {cargandoSecundario === `hito-${hito.id}`
                                  ? "Cargando..."
                                  : hitoAbierto?.id === hito.id
                                    ? "Ocultar detalle"
                                    : "Ver detalle"}
                              </BotonDetalle>
                              {hitoAbierto?.id === hito.id ? (
                                <DetalleSecundario>
                                  <span>Peso sugerido</span>
                                  <strong>{hitoAbierto.hitoPeriodo?.pesoSugerido ?? "No definido"}</strong>
                                </DetalleSecundario>
                              ) : null}
                            </ContenidoHito>
                          </Hito>
                        );
                      })}
                    </LineaTiempo>
                  )}
                </Seccion>

                {errorSecundario ? (
                  <ErrorSecundario role="alert">
                    <AlertCircle size={18} /> {mensajePorError(errorSecundario).descripcion}
                  </ErrorSecundario>
                ) : null}
              </>
            ) : null}
          </PanelDetalle>
        </Distribucion>
      )}
    </Pagina>
  );
};

export default EspacioAcademico;
