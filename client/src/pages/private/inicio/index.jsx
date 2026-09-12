import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  FolderKanban,
  GraduationCap,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
  UserCircle,
  Users,
  X,
} from "lucide-react";

import CardHeader from "../../../components/ui/cardHeader";
import imagenProyectoFallback from "../../../assets/img/headerPort.svg";
import { ROUTES } from "../../../enums/routes/Routes";
import { api } from "../../../services/api";
import { useColors } from "../../../style/colors";

import {
  AccionesFiltros,
  AvisoSeguro,
  BarraBusquedaContenedor,
  BloqueDocumento,
  BotonCerrarDetalle,
  BotonFiltrosAvanzados,
  BotonPaginacion,
  BotonPrimario,
  BotonSecundario,
  BotonTexto,
  BuscadorInput,
  CabeceraDetalle,
  CabeceraSeccion,
  CajaResumen,
  ContadorInsignia,
  ContenedorInicio,
  ContenidoDetalle,
  ContenidoTarjeta,
  ContextoDocumental,
  CuerpoDetalle,
  DescripcionProyecto,
  DetalleBackdrop,
  DocentesGrid,
  DocentesSection,
  EstadoCargando,
  EstadoVacio,
  FilaAccionesTarjeta,
  FilaInsignias,
  FilaMetadato,
  FormularioBusqueda,
  GrupoFiltro,
  IconoBuscador,
  ImagenDetalle,
  ImagenProyecto,
  InsigniaCategoria,
  InsigniaDestacado,
  InsigniaEstado,
  InsigniaTipo,
  ListaFacultades,
  ListaDocumentos,
  MensajeSolicitud,
  MetadatosProyecto,
  PaginacionContenedor,
  PanelDetalle,
  PanelFiltrosAvanzados,
  PestanaFacultad,
  PieDetalle,
  RejillaFiltros,
  RejillaProyectos,
  RejillaResumen,
  SeccionBloque,
  SeccionDetalle,
  SelectFiltro,
  SelectorDocumento,
  SelectorContexto,
  TextoMotivo,
  TextoPaginacion,
  TarjetaProyecto,
  TituloProyecto,
  TituloSeccion,
} from "../../../style/estudiante/styledInicio";

const Inicio = () => {
  const navigate = useNavigate();
  const colors = useColors();

  const [propios, setPropios] = useState([]);
  const [cargandoPropios, setCargandoPropios] = useState(true);

  const [destacados, setDestacados] = useState([]);
  const [cargandoDestacados, setCargandoDestacados] = useState(true);

  const [catalogo, setCatalogo] = useState([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [errorCatalogo, setErrorCatalogo] = useState(null);

  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    limite: 12,
    total: 0,
    totalPaginas: 1,
  });

  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [textoAplicado, setTextoAplicado] = useState("");

  const [mostrarAvanzados, setMostrarAvanzados] = useState(false);

  const [facultadId, setFacultadId] = useState("");
  const [carreraId, setCarreraId] = useState("");
  const [periodoId, setPeriodoId] = useState("");
  const [materiaId, setMateriaId] = useState("");
  const [tipoGrupo, setTipoGrupo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [estado, setEstado] = useState("");
  const [orden, setOrden] = useState("recientes");

  const [listaFacultades, setListaFacultades] = useState([]);
  const [listaCarreras, setListaCarreras] = useState([]);
  const [listaPeriodos, setListaPeriodos] = useState([]);
  const [listaMaterias, setListaMaterias] = useState([]);

  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [cargandoDocumentos, setCargandoDocumentos] = useState(false);
  const [contextosDocumentales, setContextosDocumentales] = useState([]);
  const [contextoSeleccionadoId, setContextoSeleccionadoId] = useState("");
  const [documentosSeleccionados, setDocumentosSeleccionados] = useState([]);
  const [motivoSolicitud, setMotivoSolicitud] = useState("");
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
  const [mensajeDocumental, setMensajeDocumental] = useState(null);
  const solicitudDetalleActual = useRef(0);

  const cargarPropios = useCallback(async () => {
    try {
      setCargandoPropios(true);

      const respuesta = await api.listarCatalogoProyectos({
        propios: true,
        limite: 8,
      });

      setPropios(respuesta?.data || []);
    } catch {
      setPropios([]);
    } finally {
      setCargandoPropios(false);
    }
  }, []);

  const cargarDestacados = useCallback(async () => {
    try {
      setCargandoDestacados(true);

      const respuesta = await api.listarCatalogoProyectos({
        destacado: true,
        limite: 4,
      });

      setDestacados(respuesta?.data || []);
    } catch {
      setDestacados([]);
    } finally {
      setCargandoDestacados(false);
    }
  }, []);

  useEffect(() => {
    let cancelado = false;

    const cargarOpciones = async () => {
      try {
        const [respuestaFacultades, respuestaCarreras, respuestaPeriodos] =
          await Promise.all([
            api.listarFacultades().catch(() => ({ data: [] })),
            api.listarCarreras().catch(() => ({ data: [] })),
            api.listarPeriodosAcademicos().catch(() => ({ data: [] })),
          ]);

        if (cancelado) return;

        setListaFacultades(respuestaFacultades?.data || []);
        setListaCarreras(respuestaCarreras?.data || []);
        setListaPeriodos(respuestaPeriodos?.data || []);
      } catch {
        if (!cancelado) {
          setListaFacultades([]);
          setListaCarreras([]);
          setListaPeriodos([]);
        }
      }
    };

    cargarOpciones();
    cargarPropios();
    cargarDestacados();

    return () => {
      cancelado = true;
    };
  }, [cargarPropios, cargarDestacados]);

  const carrerasFiltradas = useMemo(() => {
    if (!facultadId) {
      return listaCarreras;
    }

    return listaCarreras.filter(
      (carrera) => Number(carrera.idFacultad) === Number(facultadId),
    );
  }, [listaCarreras, facultadId]);

  const cambiarFacultad = (nuevaFacultadId) => {
    setFacultadId(nuevaFacultadId);

    if (!carreraId) return;

    const carreraPertenece = listaCarreras.some(
      (carrera) =>
        Number(carrera.id) === Number(carreraId) &&
        (!nuevaFacultadId ||
          Number(carrera.idFacultad) === Number(nuevaFacultadId)),
    );

    if (!carreraPertenece) {
      setCarreraId("");
      setMateriaId("");
      setListaMaterias([]);
    }
  };

  useEffect(() => {
    let cancelado = false;

    if (!carreraId) {
      setListaMaterias([]);
      setMateriaId("");
      return undefined;
    }

    const cargarMaterias = async () => {
      try {
        const respuesta = await api.listarMateriasPorCarrera(Number(carreraId));

        if (!cancelado) {
          setListaMaterias(respuesta?.data || []);
        }
      } catch {
        if (!cancelado) {
          setListaMaterias([]);
        }
      }
    };

    cargarMaterias();

    return () => {
      cancelado = true;
    };
  }, [carreraId]);

  const cargarCatalogo = useCallback(
    async (paginaObjetivo = 1) => {
      try {
        setCargandoCatalogo(true);
        setErrorCatalogo(null);

        const parametros = {
          pagina: paginaObjetivo,
          limite: 12,
          orden,
        };

        if (textoAplicado.trim()) {
          parametros.texto = textoAplicado.trim();
        }

        if (facultadId) {
          parametros.facultadId = Number(facultadId);
        }

        if (carreraId) {
          parametros.carreraId = Number(carreraId);
        }

        if (periodoId) {
          parametros.periodoId = Number(periodoId);
        }

        if (materiaId) {
          parametros.materiaId = Number(materiaId);
        }

        if (tipoGrupo) {
          parametros.tipoGrupo = tipoGrupo;
        }

        if (categoria) {
          parametros.categoria = categoria;
        }

        if (estado) {
          parametros.estado = estado;
        }

        const respuesta = await api.listarCatalogoProyectos(parametros);

        setCatalogo(respuesta?.data || []);

        if (respuesta?.paginacion) {
          setPaginacion(respuesta.paginacion);
        }
      } catch (error) {
        setCatalogo([]);

        setErrorCatalogo(
          error?.message || "No fue posible cargar los proyectos.",
        );
      } finally {
        setCargandoCatalogo(false);
      }
    },
    [
      orden,
      textoAplicado,
      facultadId,
      carreraId,
      periodoId,
      materiaId,
      tipoGrupo,
      categoria,
      estado,
    ],
  );

  useEffect(() => {
    cargarCatalogo(1);
  }, [cargarCatalogo]);

  useEffect(() => {
    if (!proyectoSeleccionado) return undefined;

    const cerrarConEscape = (evento) => {
      if (evento.key === "Escape") {
        solicitudDetalleActual.current += 1;
        setProyectoSeleccionado(null);
      }
    };

    const overflowAnterior = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", cerrarConEscape);
    };
  }, [proyectoSeleccionado]);

  const buscar = (evento) => {
    evento?.preventDefault();
    setTextoAplicado(textoBusqueda.trim());
  };

  const limpiarFiltros = () => {
    setTextoBusqueda("");
    setTextoAplicado("");
    setFacultadId("");
    setCarreraId("");
    setPeriodoId("");
    setMateriaId("");
    setTipoGrupo("");
    setCategoria("");
    setEstado("");
    setOrden("recientes");
    setListaMaterias([]);
  };

  const abrirWorkspace = (proyecto) => {
    if (!proyecto?.puedeAbrirWorkspace || !proyecto?.proyectoPeriodoId) {
      return;
    }

    navigate(
      `${
        ROUTES.ESPACIOACADEMICO || "/estudiante/workspace-academico"
      }?proyectoPeriodoId=${proyecto.proyectoPeriodoId}`,
    );
  };

  const obtenerMateriaPrincipal = (proyecto) =>
    proyecto?.materias?.[0]?.nombre || "Sin materia asignada";

  const obtenerPeriodoPrincipal = (proyecto) =>
    proyecto?.periodos?.[0]?.nombre || "Sin periodo";

  const obtenerCarreraPrincipal = (proyecto) =>
    proyecto?.carreras?.[0]?.nombre || "Interdisciplinario";

  const obtenerImagenProyecto = (proyecto) =>
    proyecto?.imagenUrl || proyecto?.imagen || imagenProyectoFallback;

  const usarImagenFallback = (evento) => {
    evento.currentTarget.onerror = null;
    evento.currentTarget.src = imagenProyectoFallback;
  };

  const obtenerNombrePersona = (persona) => {
    if (typeof persona === "string") {
      return persona;
    }

    if (!persona || typeof persona !== "object") {
      return "";
    }

    const nombreCompleto = [persona.nombre, persona.apellido]
      .filter(Boolean)
      .join(" ")
      .trim();

    return nombreCompleto || persona.correo || "";
  };

  const obtenerEstudiantes = (proyecto) => {
    if (!Array.isArray(proyecto?.estudiantes)) {
      return [];
    }

    return proyecto.estudiantes.map(obtenerNombrePersona).filter(Boolean);
  };

  const obtenerDocentes = (proyecto) => {
    if (!Array.isArray(proyecto?.docentes)) {
      return [];
    }

    return proyecto.docentes.map(obtenerNombrePersona).filter(Boolean);
  };

  const cerrarDetalle = () => {
    solicitudDetalleActual.current += 1;
    setProyectoSeleccionado(null);
  };

  const abrirDetalle = async (proyecto) => {
    const solicitudActual = solicitudDetalleActual.current + 1;
    solicitudDetalleActual.current = solicitudActual;
    setProyectoSeleccionado(proyecto);
    setCargandoDetalle(true);
    setCargandoDocumentos(!proyecto.puedeAbrirWorkspace);
    setContextosDocumentales([]);
    setContextoSeleccionadoId("");
    setDocumentosSeleccionados([]);
    setMotivoSolicitud("");
    setMensajeDocumental(null);

    try {
      const respuestaDetalle = await api.obtenerCatalogoProyecto(proyecto.id);
      if (solicitudDetalleActual.current === solicitudActual) {
        setProyectoSeleccionado(respuestaDetalle?.data || proyecto);
      }
    } catch {
      // El resumen seguro permite mantener abierto el detalle si falla la actualización.
    } finally {
      if (solicitudDetalleActual.current === solicitudActual) {
        setCargandoDetalle(false);
      }
    }

    if (proyecto.puedeAbrirWorkspace) {
      setCargandoDocumentos(false);
      return;
    }

    try {
      const respuestaDocumentos = await api.listarDocumentosSolicitables(proyecto.id);
      if (solicitudDetalleActual.current !== solicitudActual) return;

      const contextos = respuestaDocumentos?.data?.contextos || [];
      setContextosDocumentales(contextos);
      setContextoSeleccionadoId(
        contextos[0]?.proyectoMateriaId
          ? String(contextos[0].proyectoMateriaId)
          : "",
      );
    } catch (error) {
      if (solicitudDetalleActual.current === solicitudActual) {
        setMensajeDocumental({
          tipo: "error",
          texto:
            error?.message ||
            "No fue posible consultar la documentación solicitable.",
        });
      }
    } finally {
      if (solicitudDetalleActual.current === solicitudActual) {
        setCargandoDocumentos(false);
      }
    }
  };

  const cambiarContextoDocumental = (proyectoMateriaId) => {
    setContextoSeleccionadoId(String(proyectoMateriaId));
    setDocumentosSeleccionados([]);
    setMensajeDocumental(null);
  };

  const alternarDocumento = (documentoId) => {
    setDocumentosSeleccionados((seleccionados) =>
      seleccionados.includes(documentoId)
        ? seleccionados.filter((id) => id !== documentoId)
        : [...seleccionados, documentoId],
    );
    setMensajeDocumental(null);
  };

  const enviarSolicitudDocumental = async () => {
    const contexto = contextosDocumentales.find(
      (item) =>
        String(item.proyectoMateriaId) === String(contextoSeleccionadoId),
    );
    const idsPermitidos = new Set(
      contexto?.documentos?.map((documento) => documento.id) || [],
    );
    const documentoIds = documentosSeleccionados.filter((id) =>
      idsPermitidos.has(id),
    );

    if (!proyectoSeleccionado || !contexto || documentoIds.length === 0) {
      setMensajeDocumental({
        tipo: "error",
        texto: "Selecciona al menos un documento del contexto académico.",
      });
      return;
    }

    setEnviandoSolicitud(true);
    setMensajeDocumental(null);
    try {
      await api.crearSolicitudAcceso({
        proyectoId: proyectoSeleccionado.id,
        proyectoMateriaId: contexto.proyectoMateriaId,
        documentoIds,
        ...(motivoSolicitud.trim() ? { motivo: motivoSolicitud.trim() } : {}),
      });
      setDocumentosSeleccionados([]);
      setMotivoSolicitud("");
      setMensajeDocumental({
        tipo: "exito",
        texto: "Solicitud enviada. La documentación seguirá protegida hasta su aprobación.",
      });
    } catch (error) {
      setMensajeDocumental({
        tipo: "error",
        texto: error?.message || "No fue posible enviar la solicitud.",
      });
    } finally {
      setEnviandoSolicitud(false);
    }
  };

  const renderTarjeta = (proyecto) => {
    const imagen = obtenerImagenProyecto(proyecto);
    const materia = obtenerMateriaPrincipal(proyecto);
    const periodo = obtenerPeriodoPrincipal(proyecto);
    const carrera = obtenerCarreraPrincipal(proyecto);

    const estudiantes = obtenerEstudiantes(proyecto);
    const docentes = obtenerDocentes(proyecto);

    return (
      <TarjetaProyecto
        key={proyecto.id}
        $colors={colors}
        role="button"
        tabIndex={0}
        onClick={() => abrirDetalle(proyecto)}
        onKeyDown={(evento) => {
          if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            abrirDetalle(proyecto);
          }
        }}
      >
        <ImagenProyecto
          src={imagen}
          alt={`Portada de ${proyecto.titulo}`}
          loading="lazy"
          onError={usarImagenFallback}
        />

        <ContenidoTarjeta>
          <FilaInsignias>
            <InsigniaEstado $estado={proyecto.estado}>
              {proyecto.estadoLabel || proyecto.estado}
            </InsigniaEstado>

            <InsigniaTipo $tipo={proyecto.tipoGrupo}>
              {proyecto.tipoLabel || proyecto.tipoGrupo}
            </InsigniaTipo>

            {proyecto.esIntegrador && (
              <InsigniaCategoria $esIntegrador>Integrador</InsigniaCategoria>
            )}

            {proyecto.esDestacado && (
              <InsigniaDestacado
                title={proyecto.motivoDestacado || "Proyecto destacado"}
              >
                <Sparkles size={12} />
                Destacado
              </InsigniaDestacado>
            )}
          </FilaInsignias>

          <TituloProyecto>{proyecto.titulo}</TituloProyecto>

          {proyecto.descripcion && (
            <DescripcionProyecto>{proyecto.descripcion}</DescripcionProyecto>
          )}

          <RejillaResumen>
            <CajaResumen $destacada $colors={colors}>
              <strong>
                <BookOpen size={16} />
                Materia
              </strong>

              <span>{materia}</span>
            </CajaResumen>

            <CajaResumen $colors={colors}>
              {estudiantes.length > 0 ? (
                <>
                  <strong>
                    <Users size={16} />
                    Estudiantes
                  </strong>

                  <span>
                    {estudiantes.slice(0, 3).join(", ")}
                    {estudiantes.length > 3
                      ? ` +${estudiantes.length - 3}`
                      : ""}
                  </span>
                </>
              ) : (
                <>
                  <strong>
                    <GraduationCap size={16} />
                    Carrera
                  </strong>

                  <span>{carrera}</span>
                </>
              )}
            </CajaResumen>
          </RejillaResumen>

          {docentes.length > 0 && (
            <DocentesSection>
              <strong>
                <UserCircle size={16} />
                Docentes
              </strong>

              <DocentesGrid>
                {docentes.map((docente) => (
                  <span key={docente}>{docente}</span>
                ))}
              </DocentesGrid>
            </DocentesSection>
          )}

          <MetadatosProyecto>
            <FilaMetadato $colors={colors}>
              <Calendar size={15} />
              <span>Periodo: {periodo}</span>
            </FilaMetadato>
          </MetadatosProyecto>

          <FilaAccionesTarjeta>
            <BotonSecundario
              type="button"
              onClick={(evento) => {
                evento.stopPropagation();
                abrirDetalle(proyecto);
              }}
            >
              Ver detalle
            </BotonSecundario>

            {proyecto.puedeAbrirWorkspace && (
              <BotonPrimario
                type="button"
                $colors={colors}
                onClick={(evento) => {
                  evento.stopPropagation();
                  abrirWorkspace(proyecto);
                }}
              >
                <FolderKanban size={16} />
                Abrir Workspace
              </BotonPrimario>
            )}
          </FilaAccionesTarjeta>
        </ContenidoTarjeta>
      </TarjetaProyecto>
    );
  };

  const estudiantesDetalle = obtenerEstudiantes(proyectoSeleccionado);

  const docentesDetalle = obtenerDocentes(proyectoSeleccionado);

  const imagenDetalle = obtenerImagenProyecto(proyectoSeleccionado);

  return (
    <ContenedorInicio>
      <CardHeader
        title="Inicio Académico"
        parrafo="Descubre proyectos de todas las carreras y consulta el estado de tus avances"
      ></CardHeader>
      <SeccionBloque>
        <CabeceraSeccion>
          <TituloSeccion>
            <Users size={21} color={colors?.primary} />
            Tus proyectos
            {!cargandoPropios && propios.length > 0 && (
              <ContadorInsignia $colors={colors}>
                {propios.length}
              </ContadorInsignia>
            )}
          </TituloSeccion>

          <FormularioBusqueda onSubmit={buscar}>
            <BarraBusquedaContenedor>
              <BuscadorInput
                type="text"
                placeholder="Buscar proyectos..."
                value={textoBusqueda}
                onChange={(evento) => setTextoBusqueda(evento.target.value)}
                $colors={colors}
              />

              <IconoBuscador type="submit" $colors={colors} title="Buscar">
                <Search size={19} />
              </IconoBuscador>
            </BarraBusquedaContenedor>
          </FormularioBusqueda>
        </CabeceraSeccion>

        {cargandoPropios ? (
          <EstadoCargando $colors={colors}>
            Cargando tus proyectos...
          </EstadoCargando>
        ) : propios.length === 0 ? (
          <EstadoVacio>
            <FolderKanban size={34} />

            <h4>No tienes proyectos asignados</h4>

            <p>
              Los proyectos académicos en los que participes aparecerán aquí.
            </p>
          </EstadoVacio>
        ) : (
          <RejillaProyectos>{propios.map(renderTarjeta)}</RejillaProyectos>
        )}
      </SeccionBloque>

      {!cargandoDestacados && destacados.length > 0 && (
        <SeccionBloque>
          <CabeceraSeccion>
            <TituloSeccion>
              <Sparkles size={21} color={colors?.primary} />
              Proyectos destacados
              <ContadorInsignia $colors={colors}>
                {destacados.length}
              </ContadorInsignia>
            </TituloSeccion>
          </CabeceraSeccion>

          <RejillaProyectos>{destacados.map(renderTarjeta)}</RejillaProyectos>
        </SeccionBloque>
      )}

      <SeccionBloque>
        <CabeceraSeccion>
          <TituloSeccion>
            <Layers size={21} color={colors?.primary} />
            Explorar proyectos
            <ContadorInsignia $colors={colors}>
              {paginacion.total}
            </ContadorInsignia>
          </TituloSeccion>

          <BotonFiltrosAvanzados
            type="button"
            $activo={mostrarAvanzados}
            $colors={colors}
            onClick={() =>
              setMostrarAvanzados((estadoAnterior) => !estadoAnterior)
            }
          >
            <Filter size={16} />
            Filtros
          </BotonFiltrosAvanzados>
        </CabeceraSeccion>

        <ListaFacultades>
          <PestanaFacultad
            type="button"
            $activa={!facultadId}
            $colors={colors}
            onClick={() => cambiarFacultad("")}
          >
            Todas
          </PestanaFacultad>

          {listaFacultades.map((facultad) => (
            <PestanaFacultad
              key={facultad.id}
              type="button"
              $activa={Number(facultadId) === Number(facultad.id)}
              $colors={colors}
              onClick={() => cambiarFacultad(String(facultad.id))}
            >
              {facultad.nombre}
            </PestanaFacultad>
          ))}
        </ListaFacultades>

        {mostrarAvanzados && (
          <PanelFiltrosAvanzados $colors={colors}>
            <RejillaFiltros>
              <GrupoFiltro>
                <span>Carrera</span>

                <SelectFiltro
                  value={carreraId}
                  $colors={colors}
                  onChange={(evento) => setCarreraId(evento.target.value)}
                >
                  <option value="">Todas las carreras</option>

                  {carrerasFiltradas.map((carrera) => (
                    <option key={carrera.id} value={carrera.id}>
                      {carrera.nombre}
                    </option>
                  ))}
                </SelectFiltro>
              </GrupoFiltro>

              <GrupoFiltro>
                <span>Materia</span>

                <SelectFiltro
                  value={materiaId}
                  $colors={colors}
                  disabled={!carreraId}
                  onChange={(evento) => setMateriaId(evento.target.value)}
                >
                  <option value="">
                    {!carreraId
                      ? "Selecciona una carrera"
                      : "Todas las materias"}
                  </option>

                  {listaMaterias.map((materia) => (
                    <option key={materia.id} value={materia.id}>
                      {materia.nombre}
                    </option>
                  ))}
                </SelectFiltro>
              </GrupoFiltro>

              <GrupoFiltro>
                <span>Periodo</span>

                <SelectFiltro
                  value={periodoId}
                  $colors={colors}
                  onChange={(evento) => setPeriodoId(evento.target.value)}
                >
                  <option value="">Todos los periodos</option>

                  {listaPeriodos.map((periodo) => (
                    <option key={periodo.id} value={periodo.id}>
                      {periodo.nombre}
                      {periodo.activo ? " (Activo)" : ""}
                    </option>
                  ))}
                </SelectFiltro>
              </GrupoFiltro>

              <GrupoFiltro>
                <span>Modalidad</span>

                <SelectFiltro
                  value={tipoGrupo}
                  $colors={colors}
                  onChange={(evento) => setTipoGrupo(evento.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="GRUPAL">Grupal</option>
                  <option value="COLABORATIVO">Colaborativo</option>
                </SelectFiltro>
              </GrupoFiltro>

              <GrupoFiltro>
                <span>Tipo académico</span>

                <SelectFiltro
                  value={categoria}
                  $colors={colors}
                  onChange={(evento) => setCategoria(evento.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="INTEGRADOR">Integrador</option>
                  <option value="REGULAR">Regular</option>
                </SelectFiltro>
              </GrupoFiltro>

              <GrupoFiltro>
                <span>Estado</span>

                <SelectFiltro
                  value={estado}
                  $colors={colors}
                  onChange={(evento) => setEstado(evento.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="ACTIVO">En proceso</option>
                  <option value="INCONCLUSO">Inconcluso</option>
                  <option value="CERRADO">Terminado</option>
                </SelectFiltro>
              </GrupoFiltro>

              <GrupoFiltro>
                <span>Orden</span>

                <SelectFiltro
                  value={orden}
                  $colors={colors}
                  onChange={(evento) => setOrden(evento.target.value)}
                >
                  <option value="recientes">Más recientes</option>
                  <option value="antiguos">Más antiguos</option>
                  <option value="titulo">Título A-Z</option>
                </SelectFiltro>
              </GrupoFiltro>
            </RejillaFiltros>

            <AccionesFiltros>
              <BotonTexto type="button" onClick={limpiarFiltros}>
                Restablecer filtros
              </BotonTexto>
            </AccionesFiltros>
          </PanelFiltrosAvanzados>
        )}

        {cargandoCatalogo ? (
          <EstadoCargando $colors={colors}>
            Cargando proyectos...
          </EstadoCargando>
        ) : errorCatalogo ? (
          <EstadoVacio>
            <h4>No fue posible cargar los proyectos</h4>

            <p>{errorCatalogo}</p>

            <BotonPrimario
              type="button"
              $colors={colors}
              onClick={() => cargarCatalogo(paginacion.pagina)}
            >
              Reintentar
            </BotonPrimario>
          </EstadoVacio>
        ) : catalogo.length === 0 ? (
          <EstadoVacio>
            <Search size={34} />

            <h4>No se encontraron proyectos</h4>

            <p>Modifica la búsqueda o los filtros seleccionados.</p>

            <BotonSecundario type="button" onClick={limpiarFiltros}>
              Limpiar filtros
            </BotonSecundario>
          </EstadoVacio>
        ) : (
          <>
            <RejillaProyectos>{catalogo.map(renderTarjeta)}</RejillaProyectos>

            {paginacion.totalPaginas > 1 && (
              <PaginacionContenedor>
                <BotonPaginacion
                  type="button"
                  disabled={paginacion.pagina <= 1}
                  onClick={() => cargarCatalogo(paginacion.pagina - 1)}
                >
                  <ChevronLeft size={16} />
                  Anterior
                </BotonPaginacion>

                <TextoPaginacion>
                  Página {paginacion.pagina} de {paginacion.totalPaginas}
                </TextoPaginacion>

                <BotonPaginacion
                  type="button"
                  disabled={paginacion.pagina >= paginacion.totalPaginas}
                  onClick={() => cargarCatalogo(paginacion.pagina + 1)}
                >
                  Siguiente
                  <ChevronRight size={16} />
                </BotonPaginacion>
              </PaginacionContenedor>
            )}
          </>
        )}
      </SeccionBloque>

      {proyectoSeleccionado && (
        <DetalleBackdrop onMouseDown={cerrarDetalle}>
          <PanelDetalle onMouseDown={(evento) => evento.stopPropagation()}>
            <CabeceraDetalle>
              <div>
                <FilaInsignias>
                  <InsigniaEstado $estado={proyectoSeleccionado.estado}>
                    {proyectoSeleccionado.estadoLabel ||
                      proyectoSeleccionado.estado}
                  </InsigniaEstado>

                  <InsigniaTipo $tipo={proyectoSeleccionado.tipoGrupo}>
                    {proyectoSeleccionado.tipoLabel ||
                      proyectoSeleccionado.tipoGrupo}
                  </InsigniaTipo>

                  {proyectoSeleccionado.esIntegrador && (
                    <InsigniaCategoria $esIntegrador>
                      Integrador
                    </InsigniaCategoria>
                  )}
                </FilaInsignias>

                <h2>{proyectoSeleccionado.titulo}</h2>
              </div>

              <BotonCerrarDetalle
                type="button"
                onClick={cerrarDetalle}
                title="Cerrar"
              >
                <X size={22} />
              </BotonCerrarDetalle>
            </CabeceraDetalle>

            <CuerpoDetalle>
              <ImagenDetalle
                src={imagenDetalle}
                alt={`Portada de ${proyectoSeleccionado.titulo}`}
                onError={usarImagenFallback}
              />

              <ContenidoDetalle>
                {cargandoDetalle && (
                  <EstadoCargando $colors={colors}>
                    Actualizando detalle...
                  </EstadoCargando>
                )}
                <SeccionDetalle>
                  <h3>Descripción</h3>

                  <p>
                    {proyectoSeleccionado.descripcion ||
                      "Este proyecto no tiene una descripción pública registrada."}
                  </p>
                </SeccionDetalle>

                <SeccionDetalle>
                  <h3>Detalles del proyecto</h3>

                  <MetadatosProyecto>
                    <FilaMetadato $colors={colors}>
                      <BookOpen size={17} />

                      <span>
                        <strong>Materia:</strong>{" "}
                        {obtenerMateriaPrincipal(proyectoSeleccionado)}
                      </span>
                    </FilaMetadato>

                    <FilaMetadato $colors={colors}>
                      <GraduationCap size={17} />

                      <span>
                        <strong>Carrera:</strong>{" "}
                        {proyectoSeleccionado.carreras
                          ?.map((carrera) => carrera.nombre)
                          .join(", ") || "Interdisciplinario"}
                      </span>
                    </FilaMetadato>

                    <FilaMetadato $colors={colors}>
                      <Calendar size={17} />

                      <span>
                        <strong>Periodo:</strong>{" "}
                        {proyectoSeleccionado.periodos
                          ?.map((periodo) => periodo.nombre)
                          .join(", ") || "Sin periodo"}
                      </span>
                    </FilaMetadato>

                    {proyectoSeleccionado.facultades?.length > 0 && (
                      <FilaMetadato $colors={colors}>
                        <Layers size={17} />

                        <span>
                          <strong>Facultad:</strong>{" "}
                          {proyectoSeleccionado.facultades
                            .map((facultad) => facultad.nombre)
                            .join(", ")}
                        </span>
                      </FilaMetadato>
                    )}
                  </MetadatosProyecto>
                </SeccionDetalle>

                {(estudiantesDetalle.length > 0 ||
                  docentesDetalle.length > 0) && (
                  <SeccionDetalle>
                    <h3>Equipo</h3>

                    {estudiantesDetalle.length > 0 && (
                      <>
                        <FilaMetadato $colors={colors}>
                          <Users size={17} />
                          <strong>Estudiantes</strong>
                        </FilaMetadato>

                        <DocentesGrid>
                          {estudiantesDetalle.map((estudiante) => (
                            <span key={estudiante}>{estudiante}</span>
                          ))}
                        </DocentesGrid>
                      </>
                    )}

                    {docentesDetalle.length > 0 && (
                      <>
                        <FilaMetadato $colors={colors}>
                          <UserCircle size={17} />
                          <strong>Docentes</strong>
                        </FilaMetadato>

                        <DocentesGrid>
                          {docentesDetalle.map((docente) => (
                            <span key={docente}>{docente}</span>
                          ))}
                        </DocentesGrid>
                      </>
                    )}
                  </SeccionDetalle>
                )}

                {!proyectoSeleccionado.puedeAbrirWorkspace && (
                  <SeccionDetalle>
                    <h3>Documentación del proyecto</h3>

                    <BloqueDocumento $colors={colors}>
                      <FileText size={42} />

                    {cargandoDocumentos ? (
                      <p>Consultando documentos solicitables...</p>
                    ) : contextosDocumentales.length === 0 ? (
                      <p>No hay documentación solicitable disponible.</p>
                    ) : (
                      <>
                        <SelectorContexto>
                          {contextosDocumentales.map((contexto) => (
                            <ContextoDocumental
                              key={contexto.proyectoMateriaId}
                              $activo={
                                String(contexto.proyectoMateriaId) ===
                                contextoSeleccionadoId
                              }
                              $colors={colors}
                            >
                              <input
                                type="radio"
                                name="contexto-documental"
                                checked={
                                  String(contexto.proyectoMateriaId) ===
                                  contextoSeleccionadoId
                                }
                                onChange={() =>
                                  cambiarContextoDocumental(
                                    contexto.proyectoMateriaId,
                                  )
                                }
                              />
                              <span>
                                <strong>{contexto.materia.nombre}</strong>
                                <small>
                                  {contexto.materia.codigo || "Sin código"}
                                  {contexto.periodo?.nombre
                                    ? ` · ${contexto.periodo.nombre}`
                                    : ""}
                                </small>
                              </span>
                            </ContextoDocumental>
                          ))}
                        </SelectorContexto>

                        <ListaDocumentos>
                          {(contextosDocumentales.find(
                            (contexto) =>
                              String(contexto.proyectoMateriaId) ===
                              contextoSeleccionadoId,
                          )?.documentos || []).map((documento) => (
                            <SelectorDocumento key={documento.id}>
                              <input
                                type="checkbox"
                                checked={documentosSeleccionados.includes(
                                  documento.id,
                                )}
                                onChange={() => alternarDocumento(documento.id)}
                              />
                              <span>
                                <strong>{documento.nombre}</strong>
                                <small>
                                  {documento.tipo} · {documento.mimetype} ·{" "}
                                  {Math.max(1, Math.ceil(documento.tamano / 1024))} KB
                                </small>
                              </span>
                            </SelectorDocumento>
                          ))}
                        </ListaDocumentos>

                        <TextoMotivo
                          value={motivoSolicitud}
                          $colors={colors}
                          maxLength={1000}
                          onChange={(evento) =>
                            setMotivoSolicitud(evento.target.value)
                          }
                          placeholder="Motivo de la solicitud (opcional)"
                        />

                        <BotonPrimario
                          type="button"
                          $colors={colors}
                          disabled={
                            enviandoSolicitud ||
                            documentosSeleccionados.length === 0
                          }
                          onClick={enviarSolicitudDocumental}
                        >
                          {enviandoSolicitud
                            ? "Enviando solicitud..."
                            : "Solicitar acceso a documentación"}
                        </BotonPrimario>
                      </>
                    )}

                    <small>
                      El listado no concede acceso al contenido. La descarga
                      permanece bloqueada hasta la aprobación.
                    </small>

                    {mensajeDocumental && (
                      <MensajeSolicitud $tipo={mensajeDocumental.tipo}>
                        {mensajeDocumental.texto}
                      </MensajeSolicitud>
                    )}
                    </BloqueDocumento>
                  </SeccionDetalle>
                )}

                <AvisoSeguro
                  $autorizado={proyectoSeleccionado.puedeAbrirWorkspace}
                  $colors={colors}
                >
                  <ShieldCheck size={19} />

                  <span>
                    {proyectoSeleccionado.puedeAbrirWorkspace
                      ? "Tienes autorización para ingresar al Workspace académico de este proyecto."
                      : proyectoSeleccionado.puedeSolicitarContinuacion
                        ? "Este proyecto se encuentra disponible para continuidad académica."
                        : "Estás consultando la vista pública segura del proyecto."}
                  </span>
                </AvisoSeguro>
              </ContenidoDetalle>
            </CuerpoDetalle>

            <PieDetalle>
              <BotonSecundario
                type="button"
                onClick={cerrarDetalle}
              >
                Cerrar
              </BotonSecundario>

              {proyectoSeleccionado.puedeAbrirWorkspace && (
                <BotonPrimario
                  type="button"
                  $colors={colors}
                  onClick={() => abrirWorkspace(proyectoSeleccionado)}
                >
                  <FolderKanban size={16} />
                  Abrir Workspace
                </BotonPrimario>
              )}
            </PieDetalle>
          </PanelDetalle>
        </DetalleBackdrop>
      )}
    </ContenedorInicio>
  );
};

export default Inicio;
