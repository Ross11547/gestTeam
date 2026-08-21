import { useEffect, useState, useCallback } from "react";
import { Plus, Edit, Trash2, Save, X, Search, Users, UserPlus, Crown, FolderKanban, CalendarDays, Book } from "lucide-react";
import { toast } from "sonner";
import {
    PageWrapper,
    Container,
    PageHeader,
    Title,
    SearchContainer,
    SearchInput,
    TableWrapper,
    TableScrollContainer,
    Table,
    TableHeader,
    TableRow,
    TableCell,
    ActionButton,
    FloatingButton,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalTitle,
    Form,
    FormGroup,
    Label,
    Input,
    ButtonGroup,
    Button,
    EmptyState,
    LoadingRow,
    LoadingCell,
} from "../../../style/admin/generalStyle.jsx";
import { ColorsLogin, Colors } from "../../../style/colors";
import { authFetch } from "../../../services/api";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API = `${BASE}/api/equipo`;
const API_PROYECTO = `${BASE}/api/proyecto`;
const API_MATERIA = `${BASE}/api/materia`;
const API_PERIODO = `${BASE}/api/periodoAcademico`;
const API_USUARIO = `${BASE}/api/usuario`;
const FETCH_OPTS = { credentials: "include", headers: { "Content-Type": "application/json" } };

const TIPOS_GRUPO = ["INDIVIDUAL", "GRUPAL", "COLABORATIVO"];
const ROLES_EQUIPO = ["LIDER", "MIEMBRO", "COLABORADOR"];

const EquiposCRUD = () => {
    const [equipos, setEquipos] = useState([]);
    const [proyectos, setProyectos] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [current, setCurrent] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    // Gestión de miembros
    const [membersOpen, setMembersOpen] = useState(false);
    const [membersEquipo, setMembersEquipo] = useState(null);
    const [miembros, setMiembros] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [nuevoMiembroId, setNuevoMiembroId] = useState("");
    const [nuevoMiembroRol, setNuevoMiembroRol] = useState("MIEMBRO");
    const [loadingMiembros, setLoadingMiembros] = useState(false);

    const readErrorMsg = async (res) => {
        try {
            const j = await res.json();
            return j?.mensaje || j?.error || j?.message || res.statusText;
        } catch {
            return res.statusText;
        }
    };

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [re, rp, rm, rpe] = await Promise.all([
                authFetch(API, FETCH_OPTS),
                authFetch(API_PROYECTO, FETCH_OPTS),
                authFetch(API_MATERIA, FETCH_OPTS),
                authFetch(API_PERIODO, FETCH_OPTS),
            ]);
            if (!re.ok) throw new Error(await readErrorMsg(re));
            const je = await re.json();
            setEquipos(Array.isArray(je.data) ? je.data : []);
            if (rp.ok) { const j = await rp.json(); setProyectos(Array.isArray(j.data) ? j.data : []); }
            if (rm.ok) { const j = await rm.json(); setMaterias(Array.isArray(j.data) ? j.data : []); }
            if (rpe.ok) { const j = await rpe.json(); setPeriodos(Array.isArray(j.data) ? j.data : []); }
        } catch (e) {
            console.error(e);
            toast.error(e.message || "No se pudieron cargar los equipos");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreate = async (payload) => {
        try {
            const r = await authFetch(API, { ...FETCH_OPTS, method: "POST", body: JSON.stringify(payload) });
            if (!r.ok) throw new Error(await readErrorMsg(r));
            toast.success("Equipo creado correctamente");
            await loadData();
        } catch (e) {
            console.error(e);
            toast.error(e.message || "No se pudo crear el equipo");
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleUpdate = async (payload) => {
        try {
            const r = await authFetch(`${API}/${payload.id}`, {
                ...FETCH_OPTS,
                method: "PUT",
                body: JSON.stringify(payload),
            });
            if (!r.ok) throw new Error(await readErrorMsg(r));
            toast.success("Equipo actualizado");
            await loadData();
        } catch (e) {
            console.error(e);
            toast.error(e.message || "No se pudo actualizar el equipo");
        } finally {
            setIsModalOpen(false);
            setCurrent(null);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar este equipo? Sus miembros dejarán de pertenecer al grupo.")) return;

        try {
            const r = await authFetch(`${API}/${id}`, { ...FETCH_OPTS, method: "DELETE" });
            if (!r.ok) throw new Error(await readErrorMsg(r));
            toast.success("Equipo eliminado");
            await loadData();
        } catch (e) {
            console.error(e);
            toast.error(e.message || "No se pudo eliminar el equipo");
        }
    };

    // ===== Miembros =====
    const openMembers = async (equipo) => {
        setMembersEquipo(equipo);
        setMembersOpen(true);
        setLoadingMiembros(true);
        setNuevoMiembroId("");

        try {
            const [rm, ru] = await Promise.all([
                authFetch(`${API}/${equipo.id}/miembro`, FETCH_OPTS),
                authFetch(API_USUARIO, FETCH_OPTS),
            ]);
            if (!rm.ok) throw new Error(await readErrorMsg(rm));
            const jm = await rm.json();
            setMiembros(Array.isArray(jm.data) ? jm.data : []);
            if (ru.ok) {
                const ju = await ru.json();
                setUsuarios(Array.isArray(ju.data) ? ju.data : []);
            }
        } catch (e) {
            console.error(e);
            toast.error(e.message || "No se pudieron cargar los miembros");
        } finally {
            setLoadingMiembros(false);
        }
    };

    const refreshMiembros = async () => {
        if (!membersEquipo) return;
        const r = await authFetch(`${API}/${membersEquipo.id}/miembro`, FETCH_OPTS);
        if (r.ok) {
            const j = await r.json();
            setMiembros(Array.isArray(j.data) ? j.data : []);
        }
    };

    const handleAddMiembro = async () => {
        if (!nuevoMiembroId) {
            toast.error("Selecciona un usuario");
            return;
        }

        try {
            const r = await authFetch(`${API}/${membersEquipo.id}/miembro`, {
                ...FETCH_OPTS,
                method: "POST",
                body: JSON.stringify({ usuarioId: Number(nuevoMiembroId), rolEquipo: nuevoMiembroRol }),
            });
            if (!r.ok) throw new Error(await readErrorMsg(r));
            toast.success("Miembro agregado");
            setNuevoMiembroId("");
            await refreshMiembros();
        } catch (e) {
            console.error(e);
            toast.error(e.message || "No se pudo agregar el miembro");
        }
    };

    const handleChangeRol = async (usuarioId, rolEquipo) => {
        try {
            const r = await authFetch(`${API}/${membersEquipo.id}/miembro/${usuarioId}`, {
                ...FETCH_OPTS,
                method: "PUT",
                body: JSON.stringify({ rolEquipo }),
            });
            if (!r.ok) throw new Error(await readErrorMsg(r));
            toast.success("Rol actualizado");
            await refreshMiembros();
        } catch (e) {
            console.error(e);
            toast.error(e.message || "No se pudo actualizar el rol");
        }
    };

    const handleRemoveMiembro = async (miembro) => {
        if (!confirm(`¿Quitar a ${miembro.usuario?.nombre} ${miembro.usuario?.apellido} del equipo?`)) return;

        try {
            const r = await authFetch(`${API}/${membersEquipo.id}/miembro/${miembro.usuarioId}`, {
                ...FETCH_OPTS,
                method: "DELETE",
            });
            if (!r.ok) throw new Error(await readErrorMsg(r));
            toast.success("Miembro eliminado del equipo");
            await refreshMiembros();
        } catch (e) {
            console.error(e);
            toast.error(e.message || "No se pudo quitar al miembro");
        }
    };

    const filtered = equipos.filter((eq) => {
        const q = searchTerm.toLowerCase();
        return (
            eq.nombre?.toLowerCase().includes(q) ||
            eq.proyecto?.titulo?.toLowerCase().includes(q) ||
            eq.materia?.nombre?.toLowerCase().includes(q)
        );
    });

    const openCreate = () => {
        setCurrent(null);
        setIsModalOpen(true);
    };

    const openEdit = (row) => {
        setCurrent({
            id: row.id,
            proyectoId: row.proyecto?.id,
            nombre: row.nombre,
            tipoGrupo: row.tipoGrupo,
            materiaId: row.materia?.id ?? null,
            periodoId: row.periodo?.id ?? null,
        });
        setIsModalOpen(true);
    };

    const renderModal = () => {
        if (!isModalOpen) return null;

        return (
            <ModalOverlay>
                <ModalContent size="medium">
                    <ModalHeader>
                        <ModalTitle>{current ? "Editar Equipo" : "Nuevo Equipo"}</ModalTitle>
                        <ActionButton color={ColorsLogin.secondary100} onClick={() => { setIsModalOpen(false); setCurrent(null); }}>
                            <X />
                        </ActionButton>
                    </ModalHeader>

                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.target);
                            const payload = {
                                id: current?.id,
                                proyectoId: Number(fd.get("proyectoId")),
                                nombre: fd.get("nombre"),
                                tipoGrupo: fd.get("tipoGrupo") || undefined,
                                materiaId: fd.get("materiaId") ? Number(fd.get("materiaId")) : null,
                                periodoId: fd.get("periodoId") ? Number(fd.get("periodoId")) : null,
                            };

                            if (!payload.nombre || String(payload.nombre).trim().length < 2) {
                                toast.error("El nombre del equipo es obligatorio");
                                return;
                            }
                            if (!payload.proyectoId) {
                                toast.error("Selecciona un proyecto válido");
                                return;
                            }

                            current ? handleUpdate(payload) : handleCreate(payload);
                        }}
                    >
                        <FormGroup>
                            <Label><FolderKanban size={16} /> Proyecto</Label>
                            <Input
                                as="select"
                                name="proyectoId"
                                defaultValue={current?.proyectoId ?? ""}
                                required
                            >
                                <option value="" disabled>Selecciona un proyecto</option>
                                {proyectos.map((p) => (
                                    <option key={p.id} value={p.id}>{p.titulo}</option>
                                ))}
                            </Input>
                        </FormGroup>

                        <FormGroup>
                            <Label><Users size={16} /> Nombre del Equipo</Label>
                            <Input
                                type="text"
                                name="nombre"
                                defaultValue={current?.nombre ?? ""}
                                required
                                placeholder="Ej: Equipo Alpha"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label><Crown size={16} /> Tipo de Grupo</Label>
                            <Input as="select" name="tipoGrupo" defaultValue={current?.tipoGrupo ?? "GRUPAL"}>
                                <option value="">Por defecto (GRUPAL)</option>
                                {TIPOS_GRUPO.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </Input>
                        </FormGroup>

                        <FormGroup>
                            <Label><Book size={16} /> Materia (opcional)</Label>
                            <Input as="select" name="materiaId" defaultValue={current?.materiaId ?? ""}>
                                <option value="">Sin materia asociada</option>
                                {materias.map((m) => (
                                    <option key={m.id} value={m.id}>{m.nombre}</option>
                                ))}
                            </Input>
                        </FormGroup>

                        <FormGroup>
                            <Label><CalendarDays size={16} /> Periodo Académico (opcional)</Label>
                            <Input as="select" name="periodoId" defaultValue={current?.periodoId ?? ""}>
                                <option value="">Sin periodo asociado</option>
                                {periodos.map((p) => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </Input>
                        </FormGroup>

                        <ButtonGroup>
                            <Button
                                type="button"
                                className="secondary"
                                onClick={() => { setIsModalOpen(false); setCurrent(null); }}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" className="primary">
                                <Save size={16} /> {current ? "Actualizar" : "Guardar"}
                            </Button>
                        </ButtonGroup>
                    </Form>
                </ModalContent>
            </ModalOverlay>
        );
    };

    const renderMembersModal = () => {
        if (!membersOpen || !membersEquipo) return null;

        const idsEnEquipo = new Set(miembros.map((m) => m.usuarioId));
        const disponibles = usuarios.filter((u) => !idsEnEquipo.has(u.id));

        return (
            <ModalOverlay>
                <ModalContent size="large">
                    <ModalHeader>
                        <ModalTitle>Miembros · {membersEquipo.nombre}</ModalTitle>
                        <ActionButton color={ColorsLogin.secondary100} onClick={() => setMembersOpen(false)}>
                            <X />
                        </ActionButton>
                    </ModalHeader>

                    <FormGroup>
                        <Label><UserPlus size={16} /> Agregar miembro</Label>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <Input
                                as="select"
                                value={nuevoMiembroId}
                                onChange={(e) => setNuevoMiembroId(e.target.value)}
                                style={{ flex: "2", minWidth: "220px" }}
                            >
                                <option value="">Selecciona un usuario</option>
                                {disponibles.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.nombre} {u.apellido} ({u.correo})
                                    </option>
                                ))}
                            </Input>
                            <Input
                                as="select"
                                value={nuevoMiembroRol}
                                onChange={(e) => setNuevoMiembroRol(e.target.value)}
                                style={{ flex: "1", minWidth: "140px" }}
                            >
                                {ROLES_EQUIPO.map((rol) => (
                                    <option key={rol} value={rol}>{rol}</option>
                                ))}
                            </Input>
                            <Button type="button" className="primary" onClick={handleAddMiembro}>
                                <UserPlus size={16} /> Agregar
                            </Button>
                        </div>
                    </FormGroup>

                    <TableWrapper>
                        <TableScrollContainer>
                            <Table>
                                <thead>
                                    <tr>
                                        <TableHeader>Usuario</TableHeader>
                                        <TableHeader>Correo</TableHeader>
                                        <TableHeader>Rol en equipo</TableHeader>
                                        <TableHeader>Estado</TableHeader>
                                        <TableHeader>Acciones</TableHeader>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingMiembros ? (
                                        Array.from({ length: 3 }, (_, i) => (
                                            <LoadingRow key={`lm-${i}`}>
                                                <LoadingCell><div className="skeleton" /></LoadingCell>
                                                <LoadingCell><div className="skeleton" /></LoadingCell>
                                                <LoadingCell><div className="skeleton" /></LoadingCell>
                                                <LoadingCell><div className="skeleton" /></LoadingCell>
                                                <LoadingCell><div className="skeleton" /></LoadingCell>
                                            </LoadingRow>
                                        ))
                                    ) : miembros.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5}>
                                                <EmptyState>
                                                    <h3>Sin miembros</h3>
                                                    <p>Agrega estudiantes al equipo con el formulario superior</p>
                                                </EmptyState>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        miembros.map((m) => (
                                            <TableRow key={m.id}>
                                                <TableCell>
                                                    <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
                                                        {m.rolEquipo === "LIDER" && <Crown size={14} color="#d4a017" />}
                                                        {m.usuario?.nombre} {m.usuario?.apellido}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{m.usuario?.correo}</TableCell>
                                                <TableCell>
                                                    <Input
                                                        as="select"
                                                        value={m.rolEquipo}
                                                        onChange={(e) => handleChangeRol(m.usuarioId, e.target.value)}
                                                        style={{ maxWidth: "160px" }}
                                                    >
                                                        {ROLES_EQUIPO.map((rol) => (
                                                            <option key={rol} value={rol}>{rol}</option>
                                                        ))}
                                                    </Input>
                                                </TableCell>
                                                <TableCell>
                                                    <span style={{
                                                        padding: "2px 10px",
                                                        borderRadius: "12px",
                                                        fontSize: "0.8rem",
                                                        fontWeight: 600,
                                                        backgroundColor: m.activo ? "#e6f4ea" : "#fce8e6",
                                                        color: m.activo ? "#137333" : "#c5221f",
                                                    }}>
                                                        {m.activo ? "Activo" : "Inactivo"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <ActionButton color={ColorsLogin.secondary100} onClick={() => handleRemoveMiembro(m)}>
                                                        <Trash2 size={18} />
                                                    </ActionButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </TableScrollContainer>
                    </TableWrapper>
                </ModalContent>
            </ModalOverlay>
        );
    };

    const columnCount = 7;

    return (
        <PageWrapper>
            <Container>
                <PageHeader>
                    <Title>Gestión de Equipos</Title>
                </PageHeader>

                <SearchContainer>
                    <Search color={ColorsLogin.secondary100} />
                    <SearchInput
                        placeholder="Buscar por equipo, proyecto o materia…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </SearchContainer>

                <TableWrapper>
                    <TableScrollContainer>
                        <Table>
                            <thead>
                                <tr>
                                    <TableHeader>Equipo</TableHeader>
                                    <TableHeader>Proyecto</TableHeader>
                                    <TableHeader>Tipo</TableHeader>
                                    <TableHeader>Materia</TableHeader>
                                    <TableHeader>Periodo</TableHeader>
                                    <TableHeader>Miembros</TableHeader>
                                    <TableHeader>Acciones</TableHeader>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }, (_, i) => (
                                        <LoadingRow key={`loading-${i}`}>
                                            {Array.from({ length: columnCount }, (_, j) => (
                                                <LoadingCell key={j}><div className="skeleton" /></LoadingCell>
                                            ))}
                                        </LoadingRow>
                                    ))
                                ) : filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={columnCount}>
                                            <EmptyState>
                                                <h3>No se encontraron equipos</h3>
                                                <p>
                                                    {searchTerm
                                                        ? "Intenta con otros términos de búsqueda"
                                                        : "Aún no hay equipos registrados"}
                                                </p>
                                            </EmptyState>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((eq) => (
                                        <TableRow key={eq.id}>
                                            <TableCell>
                                                <span style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 500 }}>
                                                    <Users size={16} color={ColorsLogin.secondary200} />
                                                    {eq.nombre}
                                                </span>
                                            </TableCell>
                                            <TableCell>{eq.proyecto?.titulo || "—"}</TableCell>
                                            <TableCell>
                                                <span style={{
                                                    padding: "2px 10px",
                                                    borderRadius: "12px",
                                                    fontSize: "0.8rem",
                                                    fontWeight: 600,
                                                    backgroundColor: "#eef2ff",
                                                    color: "#4338ca",
                                                }}>
                                                    {eq.tipoGrupo}
                                                </span>
                                            </TableCell>
                                            <TableCell>{eq.materia?.nombre || <em style={{ color: Colors.greyLight }}>—</em>}</TableCell>
                                            <TableCell>{eq.periodo?.nombre || <em style={{ color: Colors.greyLight }}>—</em>}</TableCell>
                                            <TableCell>{eq._count?.miembros ?? 0}</TableCell>
                                            <TableCell>
                                                <ActionButton color={Colors.greyDark} title="Miembros" onClick={() => openMembers(eq)}>
                                                    <UserPlus size={18} />
                                                </ActionButton>
                                                <ActionButton color={Colors.greyDark} onClick={() => openEdit(eq)}>
                                                    <Edit size={18} />
                                                </ActionButton>
                                                <ActionButton color={ColorsLogin.secondary100} onClick={() => handleDelete(eq.id)}>
                                                    <Trash2 size={18} />
                                                </ActionButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </TableScrollContainer>
                </TableWrapper>

                <FloatingButton onClick={openCreate}>
                    <Plus size={28} />
                </FloatingButton>

                {renderModal()}
                {renderMembersModal()}
            </Container>
        </PageWrapper>
    );
};

export default EquiposCRUD;
