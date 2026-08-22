import { useEffect, useState, useCallback } from "react";
import { Plus, Edit, Trash2, Save, X, Search, Milestone, FolderKanban, Hash, CalendarDays } from "lucide-react";
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
const API = `${BASE}/api/hito`;
const API_PROYECTO = `${BASE}/api/proyecto`;
const FETCH_OPTS = { credentials: "include", headers: { "Content-Type": "application/json" } };

const fmtFecha = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
};

const HitosCRUD = () => {
    const [proyectos, setProyectos] = useState([]);
    const [proyectoFiltro, setProyectoFiltro] = useState("");
    const [hitos, setHitos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [current, setCurrent] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [siguienteOrden, setSiguienteOrden] = useState(1);

    const readErrorMsg = async (res) => {
        try {
            const j = await res.json();
            return j?.mensaje || j?.error || j?.message || res.statusText;
        } catch {
            return res.statusText;
        }
    };

    const loadHitos = useCallback(async (proyectoId) => {
        try {
            setLoading(true);
            const r = await authFetch(`${API}/by-proyecto?proyectoId=${proyectoId}`, FETCH_OPTS);
            if (!r.ok) throw new Error(await readErrorMsg(r));
            const j = await r.json();
            setHitos(Array.isArray(j.data) ? j.data : []);
        } catch (e) {
            console.error(e);
            toast.error(e.message || "No se pudieron cargar los hitos");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const r = await authFetch(API_PROYECTO, FETCH_OPTS);
                if (!r.ok) throw new Error(await readErrorMsg(r));
                const j = await r.json();
                const lista = Array.isArray(j.data) ? j.data : [];
                setProyectos(lista);
                if (lista.length > 0) {
                    setProyectoFiltro(String(lista[0].id));
                }
            } catch (e) {
                console.error(e);
                toast.error(e.message || "No se pudieron cargar los proyectos");
            }
        })();
    }, []);

    useEffect(() => {
        if (proyectoFiltro) loadHitos(proyectoFiltro);
        else setHitos([]);
    }, [proyectoFiltro, loadHitos]);

    const handleCreate = async (payload) => {
        try {
            const r = await authFetch(API, { ...FETCH_OPTS, method: "POST", body: JSON.stringify(payload) });
            if (!r.ok) throw new Error(await readErrorMsg(r));
            toast.success("Hito creado correctamente");
            setIsModalOpen(false);
            await loadHitos(payload.proyectoId);
            setProyectoFiltro(String(payload.proyectoId));
        } catch (e) {
            console.error(e);
            toast.error(e.message || "No se pudo crear el hito");
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
            toast.success("Hito actualizado");
            setIsModalOpen(false);
            setCurrent(null);
            await loadHitos(proyectoFiltro);
        } catch (e) {
            console.error(e);
            toast.error(e.message || "No se pudo actualizar el hito");
        }
    };

    const handleDelete = async (hito) => {
        if (!confirm(`¿Eliminar el hito "${hito.nombre}"?`)) return;

        try {
            const r = await authFetch(`${API}/${hito.id}`, { ...FETCH_OPTS, method: "DELETE" });
            if (!r.ok) throw new Error(await readErrorMsg(r));
            toast.success("Hito eliminado");
            await loadHitos(proyectoFiltro);
        } catch (e) {
            console.error(e);
            toast.error(e.message || "No se pudo eliminar el hito");
        }
    };

    const filtered = hitos.filter((h) => {
        const q = searchTerm.toLowerCase();
        return (
            h.nombre?.toLowerCase().includes(q) ||
            h.descripcion?.toLowerCase().includes(q) ||
            String(h.orden).includes(q)
        );
    });

    const openCreate = () => {
        if (!proyectoFiltro) {
            toast.error("Primero selecciona un proyecto");
            return;
        }
        const siguienteOrden = hitos.reduce((max, h) => Math.max(max, h.orden), 0) + 1;
        setCurrent(null);
        setSiguienteOrden(siguienteOrden);
        setIsModalOpen(true);
    };

    const openEdit = (row) => {
        setCurrent({
            id: row.id,
            proyectoId: row.proyecto?.id ?? Number(proyectoFiltro),
            orden: row.orden,
            nombre: row.nombre,
            descripcion: row.descripcion || "",
            peso: row.peso,
            fechaInicio: row.fechaInicio ? row.fechaInicio.slice(0, 10) : "",
            fechaFin: row.fechaFin ? row.fechaFin.slice(0, 10) : "",
            estado: row.estado || "",
        });
        setIsModalOpen(true);
    };

    const renderModal = () => {
        if (!isModalOpen) return null;

        return (
            <ModalOverlay>
                <ModalContent size="medium">
                    <ModalHeader>
                        <ModalTitle>{current ? "Editar Hito" : "Nuevo Hito"}</ModalTitle>
                        <ActionButton color={ColorsLogin.secondary100} onClick={() => { setIsModalOpen(false); setCurrent(null); }}>
                            <X />
                        </ActionButton>
                    </ModalHeader>

                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.target);

                            const fechaInicio = fd.get("fechaInicio");
                            const fechaFin = fd.get("fechaFin");

                            const payload = {
                                id: current?.id,
                                proyectoId: Number(fd.get("proyectoId")),
                                orden: Number(fd.get("orden")),
                                nombre: fd.get("nombre"),
                                descripcion: fd.get("descripcion") || undefined,
                                peso: fd.get("peso") ? Number(fd.get("peso")) : null,
                                fechaInicio: fechaInicio ? new Date(`${fechaInicio}T12:00:00`).toISOString() : null,
                                fechaFin: fechaFin ? new Date(`${fechaFin}T12:00:00`).toISOString() : null,
                                estado: fd.get("estado") || undefined,
                            };

                            if (!payload.nombre || String(payload.nombre).trim().length < 2) {
                                toast.error("El nombre del hito es obligatorio");
                                return;
                            }
                            if (!payload.proyectoId || !Number.isInteger(payload.orden) || payload.orden < 1) {
                                toast.error("Proyecto y orden son obligatorios");
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
                                defaultValue={current?.proyectoId ?? proyectoFiltro}
                                required
                            >
                                <option value="" disabled>Selecciona un proyecto</option>
                                {proyectos.map((p) => (
                                    <option key={p.id} value={p.id}>{p.titulo}</option>
                                ))}
                            </Input>
                        </FormGroup>

                        <FormGroup>
                            <Label><Hash size={16} /> Orden</Label>
                            <Input
                                type="number"
                                name="orden"
                                min="1"
                                defaultValue={current?.orden ?? siguienteOrden}
                                required
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label><Milestone size={16} /> Nombre del Hito</Label>
                            <Input
                                type="text"
                                name="nombre"
                                defaultValue={current?.nombre ?? ""}
                                required
                                placeholder="Ej: Entrega de documentación"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Descripción</Label>
                            <Input
                                type="text"
                                name="descripcion"
                                defaultValue={current?.descripcion ?? ""}
                                placeholder="Descripción breve del hito"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Peso (%)</Label>
                            <Input
                                type="number"
                                name="peso"
                                min="0"
                                max="100"
                                defaultValue={current?.peso ?? ""}
                                placeholder="Ej: 30"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label><CalendarDays size={16} /> Fecha de inicio</Label>
                            <Input type="date" name="fechaInicio" defaultValue={current?.fechaInicio ?? ""} />
                        </FormGroup>

                        <FormGroup>
                            <Label><CalendarDays size={16} /> Fecha de fin</Label>
                            <Input type="date" name="fechaFin" defaultValue={current?.fechaFin ?? ""} />
                        </FormGroup>

                        <FormGroup>
                            <Label>Estado</Label>
                            <Input
                                type="text"
                                name="estado"
                                defaultValue={current?.estado ?? ""}
                                placeholder="Ej: Planificado, En curso…"
                            />
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

    const columnCount = 7;

    return (
        <PageWrapper>
            <Container>
                <PageHeader>
                    <Title>Gestión de Hitos</Title>
                </PageHeader>

                <SearchContainer style={{ gap: "12px", flexWrap: "wrap" }}>
                    <FolderKanban color={ColorsLogin.secondary100} />
                    <Input
                        as="select"
                        value={proyectoFiltro}
                        onChange={(e) => setProyectoFiltro(e.target.value)}
                        style={{ maxWidth: "320px" }}
                    >
                        <option value="" disabled>Selecciona un proyecto</option>
                        {proyectos.map((p) => (
                            <option key={p.id} value={p.id}>{p.titulo}</option>
                        ))}
                    </Input>
                    <Search color={ColorsLogin.secondary100} />
                    <SearchInput
                        placeholder="Buscar por nombre o descripción…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </SearchContainer>

                <TableWrapper>
                    <TableScrollContainer>
                        <Table>
                            <thead>
                                <tr>
                                    <TableHeader>Orden</TableHeader>
                                    <TableHeader>Hito</TableHeader>
                                    <TableHeader>Peso</TableHeader>
                                    <TableHeader>Inicio</TableHeader>
                                    <TableHeader>Fin</TableHeader>
                                    <TableHeader>Entregas</TableHeader>
                                    <TableHeader>Acciones</TableHeader>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 4 }, (_, i) => (
                                        <LoadingRow key={`loading-${i}`}>
                                            {Array.from({ length: columnCount }, (_, j) => (
                                                <LoadingCell key={j}><div className="skeleton" /></LoadingCell>
                                            ))}
                                        </LoadingRow>
                                    ))
                                ) : !proyectoFiltro ? (
                                    <TableRow>
                                        <TableCell colSpan={columnCount}>
                                            <EmptyState>
                                                <h3>Selecciona un proyecto</h3>
                                                <p>Los hitos se muestran por proyecto</p>
                                            </EmptyState>
                                        </TableCell>
                                    </TableRow>
                                ) : filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={columnCount}>
                                            <EmptyState>
                                                <h3>No se encontraron hitos</h3>
                                                <p>
                                                    {searchTerm
                                                        ? "Intenta con otros términos de búsqueda"
                                                        : "Este proyecto aún no tiene hitos definidos"}
                                                </p>
                                            </EmptyState>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((h) => (
                                        <TableRow key={h.id}>
                                            <TableCell>
                                                <span style={{
                                                    fontFamily: "monospace",
                                                    backgroundColor: "#f8f9fa",
                                                    padding: "4px 10px",
                                                    borderRadius: "4px",
                                                    fontWeight: 600,
                                                    color: ColorsLogin.secondary200,
                                                }}>
                                                    #{h.orden}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <span style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 500 }}>
                                                        <Milestone size={16} color={ColorsLogin.secondary200} />
                                                        {h.nombre}
                                                    </span>
                                                    {h.descripcion && (
                                                        <small style={{ color: Colors.greyLight }}>{h.descripcion}</small>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{h.peso != null ? `${h.peso}%` : "—"}</TableCell>
                                            <TableCell>{fmtFecha(h.fechaInicio)}</TableCell>
                                            <TableCell>{fmtFecha(h.fechaFin)}</TableCell>
                                            <TableCell>{h._count?.entregas ?? 0}</TableCell>
                                            <TableCell>
                                                <ActionButton color={Colors.greyDark} onClick={() => openEdit(h)}>
                                                    <Edit size={18} />
                                                </ActionButton>
                                                <ActionButton color={ColorsLogin.secondary100} onClick={() => handleDelete(h)}>
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
            </Container>
        </PageWrapper>
    );
};

export default HitosCRUD;
