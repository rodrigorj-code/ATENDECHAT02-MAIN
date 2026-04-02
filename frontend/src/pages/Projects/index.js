import React, { useState, useEffect, useMemo, useRef } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  List as ListIcon,
  CalendarToday as CalendarIcon,
  ViewWeek as KanbanIcon,
  Dashboard as DashboardIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Settings as SettingsIcon,
  ZoomOutMap as ZoomOutMapIcon
} from "@material-ui/icons";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Drawer,
  Popover,
  Grid,
  TextField,
  Button,
  Typography
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import CloseIcon from "@material-ui/icons/Close";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";

import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import "../Schedules/Schedules.css";
import "moment/locale/pt-br";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";

import ActivitiesStyleLayout from "../../components/ActivitiesStyleLayout";
import ProjectKanbanBoard from "../../components/ProjectKanbanBoard"; // Novo componente
import ProjectDetailsModal from "../../components/ProjectDetailsModal"; // Novo componente
import CreateProjectModal from "../../components/CreateProjectModal"; // Novo componente
import useProjects from "../../hooks/useProjects"; // Novo hook
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import projectsService from "../../services/projectsService"; // Novo serviço
import convertedLeadsService from "../../services/convertedLeadsService";
import api from "../../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import InsertChartOutlinedIcon from "@material-ui/icons/InsertChartOutlined";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import ScheduleIcon from "@material-ui/icons/Schedule";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

const localizer = momentLocalizer(moment);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    height: "100%",
    overflow: "hidden",
  },
  drawerPaper: {
    width: 420,
    maxWidth: "100%",
    padding: theme.spacing(2),
    borderRadius: 16,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    height: "calc(100% - 32px)",
    marginRight: theme.spacing(2),
    overflow: "hidden"
  },
  drawerContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderBottom: "1px solid #eee",
    paddingBottom: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  drawerTitle: {
    fontWeight: 400,
    color: "#111827",
    opacity: 0.92,
    fontSize: "1.2rem",
  },
  drawerCloseButton: {
    position: "absolute",
    right: 0,
    top: 0,
  },
  drawerContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    overflowY: "auto",
    paddingRight: theme.spacing(1)
  },
  drawerActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: theme.spacing(3),
    gap: theme.spacing(1),
  },
}));

// Sub-component for List View
const ProjectsList = ({ projects }) => {
  return (
    <TableContainer component={Paper} style={{ height: '100%', overflow: 'auto' }}>
      <Table stickyHeader aria-label="projects table">
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Descrição</TableCell>
            <TableCell>Empresa</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Criado em</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.length > 0 ? (
            projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell component="th" scope="row">
                  {project.name}
                </TableCell>
                <TableCell>{project.description}</TableCell>
                <TableCell>{project.company ? project.company.name : project.companyId}</TableCell>
                <TableCell>
                  <Chip 
                    label={project.status === 'active' ? 'Ativo' : project.status === 'completed' ? 'Concluído' : 'Arquivado'} 
                    size="small" 
                    color={project.status === 'active' ? 'primary' : 'default'} 
                  />
                </TableCell>
                <TableCell>{new Date(project.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                Nenhum projeto encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Sub-component for Calendar View – com layout /schedules
const ProjectsCalendar = ({ projects, onCreate }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const MiniMonth = ({ value, onChange }) => {
    const m = moment(value);
    const start = m.clone().startOf("month").startOf("week");
    const end = m.clone().endOf("month").endOf("week");
    const day = start.clone().subtract(1, "day");
    const days = [];
    while (day.isBefore(end, "day")) days.push(day.add(1, "day").clone());
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
    return (
      <div className="mini-cal">
        <div className="mini-cal-grid">
          {["D","S","T","Q","Q","S","S"].map((d,i) => <div key={i} className="mini-cal-header">{d}</div>)}
          {weeks.flat().map((d, idx) => {
            const isCurrentMonth = d.month() === m.month();
            const isToday = d.isSame(moment(), "day");
            const isSelected = d.isSame(m, "day");
            const cls = ["mini-cal-day", !isCurrentMonth ? "mini-cal-off" : "", isToday ? "mini-cal-today" : "", isSelected ? "mini-cal-selected" : ""].join(" ");
            return <button key={idx} type="button" className={cls} onClick={() => onChange(d.toDate())}>{d.date()}</button>;
          })}
        </div>
      </div>
    );
  };
  const CustomToolbar = (toolbarProps) => {
    const setView = (v) => toolbarProps.onView(v);
    const goToday = () => toolbarProps.onNavigate("TODAY");
    const goPrev = () => toolbarProps.onNavigate("PREV");
    const goNext = () => toolbarProps.onNavigate("NEXT");
    const monthRaw = moment(toolbarProps.date).format("MMMM, YYYY");
    const label = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1);
    return (
      <div className="rbc-toolbar">
        <span className="rbc-btn-group">
          <button type="button" className="btn-naked" onClick={goToday}>Hoje</button>
        </span>
        <span className="rbc-toolbar-label">
          <button type="button" className="btn-naked chevron" onClick={goPrev}>‹</button>
          <span className="month-label">{label}</span>
          <button type="button" className="btn-naked chevron" onClick={goNext}>›</button>
        </span>
        <span className="rbc-btn-group">
          <button type="button" className={`btn-naked ${toolbarProps.view === "day" ? "active" : ""}`} onClick={() => setView("day")}>Dia</button>
          <button type="button" className={`btn-naked ${toolbarProps.view === "week" ? "active" : ""}`} onClick={() => setView("week")}>Semana</button>
          <button type="button" className={`btn-naked ${toolbarProps.view === "month" ? "active" : ""}`} onClick={() => setView("month")}>Mês</button>
        </span>
      </div>
    );
  };
  const events = useMemo(() => {
    return projects.map(p => ({
      title: p.name,
      start: new Date(p.deadlineAt || p.createdAt),
      end: new Date(p.deadlineAt || p.createdAt),
      allDay: true,
      resource: p
    }));
  }, [projects]);
  const eventPropGetter = (event) => {
    const status = String(event.resource.status || "").toLowerCase();
    let style = { backgroundColor: "#DBEAFE", border: "1px solid #BFDBFE", color: "#1E40AF", borderRadius: 10, padding: "6px 8px", fontSize: 12 };
    if (status === "completed") style = { backgroundColor: "#D1FAE5", border: "1px solid #A7F3D0", color: "#065F46", borderRadius: 10, padding: "6px 8px", fontSize: 12 };
    if (status === "archived") style = { backgroundColor: "#F3F4F6", border: "1px solid #E5E7EB", color: "#374151", borderRadius: 10, padding: "6px 8px", fontSize: 12 };
    return { style };
  };
  const total = projects.length;
  const concluded = projects.filter(p => String(p.status).toLowerCase() === "completed").length;
  return (
    <div className="schedules-page" style={{ paddingTop: 8 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={9} lg={9}>
          <Paper style={{ padding: 8 }}>
            <Calendar
              localizer={localizer}
              components={{ toolbar: CustomToolbar }}
              views={["day","week","month"]}
              events={events}
              startAccessor="start"
              endAccessor="end"
              eventPropGetter={eventPropGetter}
              selectable
              onSelectSlot={(slot) => {
                setSelectedDate(slot.start);
                onCreate && onCreate();
              }}
              style={{ height: "calc(100vh - 160px)" }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={3} lg={3}>
          <div className="right-aside">
            <div className="aside-top-actions">
              <button className="aside-action" onClick={onCreate}>Novo Projeto</button>
            </div>
            <Paper className="aside-card mini-calendar-card" variant="outlined">
              <div className="aside-header">
                <Typography className="aside-month" variant="body2">
                  {moment(selectedDate).format("MMMM, YYYY")}
                </Typography>
              </div>
              <div className="aside-body">
                <MiniMonth value={selectedDate} onChange={setSelectedDate} />
              </div>
            </Paper>
            <Paper className="aside-card activity-card" variant="outlined">
              <div className="aside-header">
                <Typography className="aside-title" variant="body2">Projeto</Typography>
              </div>
              {(() => {
                const recent = [...projects].sort((a,b) => new Date(b.updatedAt||b.createdAt) - new Date(a.updatedAt||a.createdAt))[0];
                return (
                  <div className="activity-item">
                    <div className="activity-icon"><FolderOpenIcon style={{ fontSize: 18 }} /></div>
                    <div className="activity-info">
                      <div className="activity-title">{recent?.name || "—"}</div>
                      <div className="activity-sub">{recent?.company?.name || recent?.companyId || "Sem empresa"}</div>
                    </div>
                    <div className="activity-time">{recent ? moment(recent.updatedAt||recent.createdAt).format("HH:mm") : "—"}</div>
                  </div>
                );
              })()}
              <div className="donut-center" style={{ position: "static", transform: "none", textAlign: "left" }}>
                <div className="donut-total" style={{ fontSize: 24 }}>{total}</div>
                <div className="donut-label">Total</div>
                <div className="donut-label">Concluídos: {concluded}</div>
              </div>
            </Paper>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

const Projects = () => {
  const theme = useTheme();
  const classes = useStyles();
  const [viewMode, setViewMode] = useState("board");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [hoveredKpi, setHoveredKpi] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [anchorResp, setAnchorResp] = useState(null);
  const [anchorEmpresa, setAnchorEmpresa] = useState(null);
  const [anchorPeriodo, setAnchorPeriodo] = useState(null);
  const [anchorTodos, setAnchorTodos] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [contactsList, setContactsList] = useState([]);
  const [selectedResponsible, setSelectedResponsible] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [projectsState, setProjectsState] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const kanbanRef = useRef(null);
  const [stagesDrawerOpen, setStagesDrawerOpen] = useState(false);
  const [projectStagesState, setProjectStagesState] = useState([]);
  const [localStages, setLocalStages] = useState([]);
  
  const { projects, loading, count, hasMore } = useProjects({
    searchParam,
    pageNumber
  });

  useEffect(() => {
    setProjectsState(projects);
  }, [projects]);

  // Carrega estágios do Kanban de Projetos do localStorage (frontend-only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("project-stages");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setProjectStagesState(parsed);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (stagesDrawerOpen) {
      const base = (projectStagesState && projectStagesState.length)
        ? projectStagesState
        : [
            { id: 'backlog', title: 'Backlog', color: '#6b7280' },
            { id: 'pending', title: 'Pendente', color: '#f59e0b' },
            { id: 'in_progress', title: 'Em Progresso', color: '#2563eb' },
            { id: 'completed', title: 'Concluído', color: '#10B981' }
          ];
      setLocalStages(JSON.parse(JSON.stringify(base)));
    }
  }, [stagesDrawerOpen, projectStagesState]);

  const slug = (txt) =>
    (txt || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

  const addStage = () => {
    const idx = (localStages?.length || 0) + 1;
    const title = `Etapa ${idx}`;
    const id = slug(title);
    setLocalStages(prev => [...prev, { id, title, color: "#3B82F6" }]);
  };
  const removeStage = (id) => setLocalStages(prev => prev.filter(s => (s.id) !== id));
  const updateStage = (i, field, value) => {
    setLocalStages(prev => {
      const next = prev.slice();
      if (field === "title") {
        next[i] = { ...next[i], title: value, id: slug(value) };
      } else {
        next[i] = { ...next[i], [field]: value };
      }
      return next;
    });
  };
  const moveStageUp = (i) => {
    setLocalStages(prev => {
      if (i <= 0) return prev;
      const next = prev.slice();
      const tmp = next[i - 1];
      next[i - 1] = next[i];
      next[i] = tmp;
      return next;
    });
  };
  const moveStageDown = (i) => {
    setLocalStages(prev => {
      if (i >= prev.length - 1) return prev;
      const next = prev.slice();
      const tmp = next[i + 1];
      next[i + 1] = next[i];
      next[i] = tmp;
      return next;
    });
  };

  const handleSearch = (value) => {
    setSearchParam(value);
  };

  const handleCreateProject = () => {
    setProjectToEdit(null);
    setDrawerOpen(true);
  };

  const viewModes = [
    { value: "board", label: "Quadro", icon: <KanbanIcon /> },
    { value: "list", label: "Lista", icon: <ListIcon /> },
    { value: "calendar", label: "Calendário", icon: <CalendarIcon /> },
    { value: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  ];

  const filters = [
    {
      label: "Status",
      value: statusFilter,
      options: [
        { value: "active", label: "Ativo" },
        { value: "completed", label: "Concluído" },
        { value: "archived", label: "Arquivado" },
      ],
      onChange: (val) => setStatusFilter(val)
    }
  ];

  const filteredProjects = useMemo(() => {
    let base = projectsState;

    // Busca geral por termo (nome, descrição, empresa)
    if (searchParam) {
      const term = String(searchParam || "").trim().toLowerCase();
      if (term) {
        base = base.filter((p) => {
          const n = String(p?.name || "").toLowerCase();
          const d = String(p?.description || "").toLowerCase();
          const c = String(p?.company?.name || "").toLowerCase();
          return n.includes(term) || d.includes(term) || c.includes(term);
        });
      }
    }

    // Status
    if (statusFilter) {
      base = base.filter((p) => String(p.status || "") === String(statusFilter));
    }

    // Responsável
    if (selectedResponsible && (selectedResponsible.id || selectedResponsible.name)) {
      const rid = selectedResponsible.id;
      const rname = (selectedResponsible.name || "").toLowerCase();
      base = base.filter((p) => {
        const pid = p?.userId || p?.user?.id;
        const pname = (p?.user?.name || p?.user?.email || "").toLowerCase();
        return (rid && String(pid) === String(rid)) || (!!rname && pname.includes(rname));
      });
    }

    // Empresa: aceitar correspondência por ID (companyId) ou por nome
    if (selectedCompany && (selectedCompany.id || selectedCompany.name)) {
      const cid = selectedCompany.id ? String(selectedCompany.id) : null;
      const cname = String(selectedCompany.name || "").toLowerCase();
      base = base.filter((p) => {
        const byId =
          (cid && String(p?.companyId || p?.company?.id) === cid);
        const byName =
          cname &&
          (
            String(p?.name || "").toLowerCase().includes(cname) ||
            String(p?.description || "").toLowerCase().includes(cname) ||
            String(p?.company?.name || "").toLowerCase().includes(cname)
          );
        return byId || byName;
      });
    }

    // Período (por data de criação)
    const startOk = (d) => {
      if (!dateStart) return true;
      try {
        const cmp = new Date(dateStart);
        cmp.setHours(0, 0, 0, 0);
        const dt = new Date(d);
        return dt >= cmp;
      } catch { return true; }
    };
    const endOk = (d) => {
      if (!dateEnd) return true;
      try {
        const cmp = new Date(dateEnd);
        cmp.setHours(23, 59, 59, 999);
        const dt = new Date(d);
        return dt <= cmp;
      } catch { return true; }
    };
    if (dateStart || dateEnd) {
      base = base.filter((p) => {
        const when = p?.createdAt || p?.updatedAt || Date.now();
        return startOk(when) && endOk(when);
      });
    }

    return base;
  }, [projectsState, searchParam, statusFilter, selectedResponsible, selectedCompany, dateStart, dateEnd]);

  const headerStats = useMemo(() => {
    const total = filteredProjects.length;
    const completed = filteredProjects.filter(p => p.status === 'completed').length;
    return [
      { label: "Total", value: total, color: "#2563eb" },
      { label: "Concluídos", value: completed, color: "#22c55e" }
    ];
  }, [filteredProjects]);

  // Fullscreen logic (mesma de Activities)
  useEffect(() => {
    // carregar opções de filtros (Responsável/Empresa)
    async function fetchFilters() {
      try {
        const { data: usersResp } = await api.get("/users", { params: { searchParam: "" } });
        setUsersList(usersResp?.users || []);
      } catch (_) {}
      try {
        const data = await convertedLeadsService.list({ pageNumber: 1 });
        const list = Array.isArray(data?.leads) ? data.leads : [];
        setContactsList(list);
      } catch (_) {}
    }
    fetchFilters();

    const onFsChange = () => {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      setIsFullscreen(!!fsEl && (fsEl === kanbanRef.current));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, []);

  const requestFs = (el) => {
    if (el.requestFullscreen) return el.requestFullscreen();
    if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
  };

  const exitFs = () => {
    if (document.exitFullscreen) return document.exitFullscreen();
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
  };

  const handleToggleKanbanFullscreen = () => {
    if (viewMode !== "board") return;
    if (!kanbanRef.current) return;
    if (isFullscreen) {
      exitFs();
    } else {
      requestFs(kanbanRef.current);
    }
  };

  const actionsRight = (
    <>
      <IconButton
        title="Expandir Kanban"
        onClick={handleToggleKanbanFullscreen}
        color="default"
        size="small"
        style={{ color: '#6b7280', padding: 4, width: 32, height: 32 }}
      >
        {isFullscreen ? <FullscreenExitIcon style={{ fontSize: 18 }} /> : <ZoomOutMapIcon style={{ fontSize: 18 }} />}
      </IconButton>
      <IconButton
        title="Configurações"
        color="default"
        size="small"
        style={{ color: '#6b7280', padding: 4, width: 32, height: 32 }}
        onClick={() => setStagesDrawerOpen(true)}
      >
        <SettingsIcon style={{ fontSize: 18 }} />
      </IconButton>
    </>
  );

  const rightFilters = ({ classes: layout }) => (
    <>
      <div className={layout.filterItem} onClick={(e) => setAnchorResp(e.currentTarget)}>
        <Typography className={layout.filterLabel}>Responsável</Typography>
        <ExpandMoreIcon className={layout.chevronIcon} />
      </div>
      <Popover
        open={Boolean(anchorResp)}
        anchorEl={anchorResp}
        onClose={() => setAnchorResp(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <div style={{ padding: 8, width: 220 }}>
          <Autocomplete
            fullWidth
            value={selectedResponsible}
            options={usersList}
            onChange={(e, val) => setSelectedResponsible(val)}
            getOptionLabel={(option) => option.name || option.email || String(option.id)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Responsável"
                variant="outlined"
                size="small"
                placeholder="Selecione"
                InputProps={{ ...params.InputProps, style: { fontSize: 13 } }}
                InputLabelProps={{ style: { fontSize: 12 } }}
              />
            )}
          />
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setSelectedResponsible(null)}>Limpar</Button>
          </div>
        </div>
      </Popover>

      <div className={layout.filterItem} onClick={(e) => setAnchorEmpresa(e.currentTarget)}>
        <Typography className={layout.filterLabel}>Empresa</Typography>
        <ExpandMoreIcon className={layout.chevronIcon} />
      </div>
      <Popover
        open={Boolean(anchorEmpresa)}
        anchorEl={anchorEmpresa}
        onClose={() => setAnchorEmpresa(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <div style={{ padding: 8, width: 220 }}>
          <Autocomplete
            fullWidth
            value={selectedCompany}
            options={contactsList}
            onChange={(e, val) => setSelectedCompany(val)}
            getOptionLabel={(option) => option.name || option.number || String(option.id)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Empresa"
                variant="outlined"
                size="small"
                placeholder="Pesquisar..."
                InputProps={{ ...params.InputProps, style: { fontSize: 13 } }}
                InputLabelProps={{ style: { fontSize: 12 } }}
              />
            )}
          />
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setSelectedCompany(null)}>Limpar</Button>
          </div>
        </div>
      </Popover>

      <div className={layout.filterItem} onClick={(e) => setAnchorPeriodo(e.currentTarget)}>
        <CalendarIcon className={layout.calendarIcon} />
        <Typography className={layout.filterLabel}>Período</Typography>
      </div>
      <Popover
        open={Boolean(anchorPeriodo)}
        anchorEl={anchorPeriodo}
        onClose={() => setAnchorPeriodo(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <div style={{ padding: 8, width: 220 }}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <TextField
                label="Início"
                type="date"
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true, style: { fontSize: 12 } }}
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                size="small"
                InputProps={{ style: { fontSize: 13 } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Fim"
                type="date"
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true, style: { fontSize: 12 } }}
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                size="small"
                InputProps={{ style: { fontSize: 13 } }}
              />
            </Grid>
          </Grid>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => { setDateStart(""); setDateEnd(""); }}>Limpar</Button>
            <Button color="primary" variant="contained" onClick={() => setAnchorPeriodo(null)}>Aplicar</Button>
          </div>
        </div>
      </Popover>

      <div className={layout.filterItem} onClick={(e) => setAnchorTodos(e.currentTarget)}>
        <Typography className={layout.filterLabel}>Todos</Typography>
        <ExpandMoreIcon className={layout.chevronIcon} />
      </div>
      <Popover
        open={Boolean(anchorTodos)}
        anchorEl={anchorTodos}
        onClose={() => setAnchorTodos(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <div style={{ padding: 8, width: 220 }}>
          <Typography variant="subtitle2" style={{ marginBottom: 8 }}>Período rápido</Typography>
          <Grid container spacing={1}>
            <Grid item>
              <Button size="small" onClick={() => {
                const end = new Date();
                const start = new Date();
                start.setDate(end.getDate() - 7);
                setDateStart(start.toISOString().slice(0,10));
                setDateEnd(end.toISOString().slice(0,10));
                setAnchorTodos(null);
              }}>Últimos 7 dias</Button>
            </Grid>
            <Grid item>
              <Button size="small" onClick={() => {
                const end = new Date();
                const start = new Date();
                start.setMonth(end.getMonth() - 1);
                setDateStart(start.toISOString().slice(0,10));
                setDateEnd(end.toISOString().slice(0,10));
                setAnchorTodos(null);
              }}>Último mês</Button>
            </Grid>
            <Grid item>
              <Button size="small" onClick={() => {
                setDateStart("");
                setDateEnd("");
                setSelectedResponsible(null);
                setSelectedCompany(null);
                setAnchorTodos(null);
              }}>Todos os registros</Button>
            </Grid>
          </Grid>
        </div>
      </Popover>
    </>
  );

  return (
    <>
    <ActivitiesStyleLayout
      title={null}
      description="Gerencie seus projetos"
      onCreateClick={handleCreateProject}
      searchPlaceholder="Buscar projetos..."
      searchValue={searchParam}
      onSearchChange={handleSearch}
      filters={filters}
      stats={[]} // headerStats removido se quiser clean igual ao layout novo
      navActions={actionsRight}
      viewModes={viewModes}
      currentViewMode={viewMode}
      onViewModeChange={setViewMode}
      rightFilters={rightFilters}
      scrollContent={viewMode !== "dashboard" && viewMode !== "calendar"}
    >
      {loading ? (
        <div style={{ padding: 20, textAlign: "center" }}>Carregando...</div>
      ) : (
        <>
          {viewMode === "dashboard" && (() => {
            const isDark = theme.palette.type === "dark";
            const palette = isDark
              ? {
                  bg: "#000000",
                  card: "#161616",
                  text: "#f4f4f5",
                  sub: "#94a3b8",
                  border: "rgba(255,255,255,0.12)",
                  shadow: "0 4px 16px rgba(0,0,0,0.45)",
                  blue: "#60a5fa",
                  blueDark: "#3b82f6",
                  blueLight: "#93c5fd",
                  green: "#34d399",
                  red: "#f87171",
                  amber: "#fbbf24",
                  gray: "#9ca3af",
                }
              : {
                  bg: "#F8FAFC",
                  card: "#FFFFFF",
                  text: "#0F172A",
                  sub: "#64748B",
                  border: "#E2E8F0",
                  shadow: "0 2px 8px rgba(2,6,23,0.06)",
                  blue: "#3B82F6",
                  blueDark: "#2563EB",
                  blueLight: "#60A5FA",
                  green: "#10B981",
                  red: "#EF4444",
                  amber: "#F59E0B",
                  gray: "#6B7280",
                };

            const todayMid = new Date(); todayMid.setHours(0,0,0,0);
            const total = filteredProjects.length;
            const completed = filteredProjects.filter(p => String(p.status).toLowerCase() === "completed").length;
            const inProgress = filteredProjects.filter(p => {
              const s = String(p.status || "").toLowerCase();
              return s === "in_progress" || s === "active";
            }).length;
            const overdue = filteredProjects.filter(p => {
              const s = String(p.status || "").toLowerCase();
              if (s === "completed") return false;
              const acts = Array.isArray(p.activities) ? p.activities : [];
              return acts.some(a => {
                const st = String(a.status || "").toLowerCase();
                if (st === "completed") return false;
                if (!a?.date) return false;
                const d = new Date(a.date);
                return d < todayMid;
              });
            }).length;

            const dayKeyLocal = (d) => {
              try {
                const dt = new Date(d);
                if (isNaN(dt.getTime())) return null;
                return dt.toISOString().slice(0,10);
              } catch { return null; }
            };
            const createdPerDay = {};
            const completedPerDay = {};
            const inProgPerDay = {};
            const overduePerDay = {};
            filteredProjects.forEach(p => {
              const k = dayKeyLocal(p.createdAt || Date.now());
              if (k) createdPerDay[k] = (createdPerDay[k] || 0) + 1;
              const s = String(p.status || "").toLowerCase();
              if (s === "completed") {
                const kc = dayKeyLocal(p.updatedAt || p.createdAt || Date.now());
                if (kc) completedPerDay[kc] = (completedPerDay[kc] || 0) + 1;
              }
              if (s === "in_progress" || s === "active") {
                const ki = dayKeyLocal(p.updatedAt || p.createdAt || Date.now());
                if (ki) inProgPerDay[ki] = (inProgPerDay[ki] || 0) + 1;
              }
              const hasOver = (Array.isArray(p.activities) ? p.activities : []).some(a => {
                const st = String(a.status || "").toLowerCase();
                if (st === "completed") return false;
                const d = a?.date ? new Date(a.date) : null;
                return !!d && d < todayMid;
              });
              if (hasOver) {
                const ko = dayKeyLocal(p.updatedAt || p.createdAt || Date.now());
                if (ko) overduePerDay[ko] = (overduePerDay[ko] || 0) + 1;
              }
            });
            const sortKeys = (obj) => Object.keys(obj || {}).sort();
            const seriesFrom = (obj) => sortKeys(obj).map(k => obj[k]);
            const createdSeries = seriesFrom(createdPerDay);
            const completedSeries = seriesFrom(completedPerDay);
            const inProgSeries = seriesFrom(inProgPerDay);
            const overdueSeries = seriesFrom(overduePerDay);
            const computeDelta = (arr) => {
              if (!Array.isArray(arr) || arr.length < 2) return 0;
              const last = Number(arr[arr.length - 1] || 0);
              const prev = Number(arr[arr.length - 2] || 0);
              if (prev === 0) return 0;
              return ((last - prev) / prev) * 100;
            };

            const kpis = [
              { label: "Total de Projetos", value: total, color: palette.blueDark, badgeBg: `${palette.blueDark}18`, delta: computeDelta(createdSeries), icon: <InsertChartOutlinedIcon style={{ color: palette.blueDark }} />, spark: createdSeries },
              { label: "Concluídos", value: completed, color: palette.green, badgeBg: `${palette.green}18`, delta: computeDelta(completedSeries), icon: <CheckCircleOutlineIcon style={{ color: palette.green }} />, spark: completedSeries },
              { label: "Em Progresso", value: inProgress, color: palette.amber, badgeBg: `${palette.amber}18`, delta: computeDelta(inProgSeries), icon: <ScheduleIcon style={{ color: palette.amber }} />, spark: inProgSeries },
              { label: "Atrasados", value: overdue, color: palette.red, badgeBg: `${palette.red}18`, delta: computeDelta(overdueSeries), icon: <ErrorOutlineIcon style={{ color: palette.red }} />, spark: overdueSeries }
            ];

            const monthKey = (d) => {
              try {
                const dt = new Date(d);
                if (isNaN(dt.getTime())) return null;
                const y = dt.getFullYear();
                const m = String(dt.getMonth() + 1).padStart(2, "0");
                return `${y}-${m}`;
              } catch { return null; }
            };
            const createdMap = {};
            const doneMap = {};
            filteredProjects.forEach(p => {
              const key = monthKey(p.createdAt || Date.now());
              if (key) createdMap[key] = (createdMap[key] || 0) + 1;
              if (String(p.status || "").toLowerCase() === "completed") {
                const kd = monthKey(p.updatedAt || p.createdAt || Date.now());
                if (kd) doneMap[kd] = (doneMap[kd] || 0) + 1;
              }
            });
            const months = Array.from(new Set([...Object.keys(createdMap), ...Object.keys(doneMap)])).sort();
            const labelFromKey = (k) => {
              const [yy, mm] = k.split("-");
              const d = new Date(Number(yy), Number(mm) - 1, 1);
              return d.toLocaleDateString("pt-BR", { month: "short" });
            };
            const labelsCreatedDone = months.map(labelFromKey);
            const dataCreated = months.map(k => createdMap[k] || 0);
            const dataDone = months.map(k => doneMap[k] || 0);

            const statusKey = (s) => {
              const v = String(s || "").toLowerCase();
              if (["backlog"].includes(v)) return "backlog";
              if (["pending","pendente"].includes(v)) return "pending";
              if (["in_progress","em progresso","active","ativo"].includes(v)) return "in_progress";
              if (["completed","concluído","concluido"].includes(v)) return "completed";
              if (["archived","arquivado"].includes(v)) return "archived";
              return "backlog";
            };
            const stageOrder = ["backlog","pending","in_progress","completed"];
            const stageLabelByKey = {
              backlog: "Backlog",
              pending: "Pendente",
              in_progress: "Em Progresso",
              completed: "Concluído"
            };
            const stageColorByKey = {
              backlog: palette.gray,
              pending: palette.gray,
              in_progress: palette.amber,
              completed: palette.green
            };
            const stageCounts = stageOrder.map(k => filteredProjects.filter(p => statusKey(p.status) === k).length);
            const stageLabels = stageOrder.map(k => stageLabelByKey[k]);
            const stageColors = stageOrder.map(k => stageColorByKey[k]);

            // Ranking por Responsável (média de progresso)
            const clampPct = (v) => Math.max(0, Math.min(100, Number.isFinite(v) ? v : 0));
            const deriveProgress = (p) => {
              const stKey = statusKey(p?.status);
              if (stKey === "completed") return 100;
              const val = Number(p?.progress);
              if (Number.isFinite(val)) return clampPct(val);
              const acts = Array.isArray(p?.activities) ? p.activities : [];
              if (acts.length > 0) {
                const total = acts.length;
                const done = acts.filter(a => String(a.status || "").toLowerCase() === "completed").length;
                return clampPct((done / total) * 100);
              }
              const idx = Math.max(0, stageOrder.findIndex(k => k === stKey));
              const denom = Math.max(1, stageOrder.length - 1);
              return Math.round((idx / denom) * 100);
            };
            const respMap = {};
            filteredProjects.forEach(p => {
              const respName =
                (p?.user && (p.user.name || p.user.email)) ||
                (p?.userId ? `Usuário ${p.userId}` : "Sem responsável");
              const prog = deriveProgress(p);
              if (!respMap[respName]) respMap[respName] = { sum: 0, count: 0 };
              respMap[respName].sum += prog;
              respMap[respName].count += 1;
            });
            const ranking = Object.entries(respMap).map(([name, v]) => ({
              name,
              avg: v.count ? v.sum / v.count : 0,
              count: v.count
            })).sort((a, b) => b.avg - a.avg).slice(0, 6);
            const rankLabels = ranking.map(r => r.name);
            const rankValues = ranking.map(r => Number(r.avg.toFixed(1)));
            const rankCounts = ranking.map(r => r.count);
            const barRankOptions = {
              responsive: true,
              indexAxis: 'y',
              maintainAspectRatio: false,
              layout: { padding: { top: 18, right: 24, left: 4, bottom: 8 } },
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx) => {
                      const i = ctx.dataIndex;
                      return `${rankValues[i]}% • ${rankCounts[i]} proj`;
                    }
                  }
                },
                datalabels: {
                  color: palette.text,
                  anchor: "end",
                  align: "right",
                  clamp: true,
                  clip: false,
                  offset: 2,
                  formatter: (v, ctx) => {
                    const i = ctx.dataIndex;
                    return `${v}%  (${rankCounts[i]})`;
                  },
                  font: { weight: "600", size: 10 }
                }
              },
              scales: {
                x: {
                  grid: { color: isDark ? "rgba(255,255,255,0.08)" : "#E6F0FF" },
                  ticks: {
                    color: palette.sub,
                    callback: (val) => `${val}%`,
                    max: 105,
                    min: 0
                  },
                  suggestedMax: 105
                },
                y: { grid: { display: false }, ticks: { color: palette.sub } }
              }
            };
            const barRankData = {
              labels: rankLabels,
              datasets: [
                { label: "Média de progresso", data: rankValues, backgroundColor: palette.blueDark, borderRadius: 6, barThickness: 18, maxBarThickness: 22 }
              ]
            };

            const perDay = {};
            filteredProjects.forEach(p => {
              const k = dayKeyLocal(p.createdAt || Date.now());
              if (k) perDay[k] = (perDay[k] || 0) + 1;
            });
            const dayKeys = Object.keys(perDay).sort();
            const dayLabels = dayKeys;
            const dayValues = dayKeys.map(k => perDay[k]);

            const cardStyle = {
              borderRadius: 12,
              padding: 12,
              border: `1px solid ${palette.border}`,
              boxShadow: palette.shadow,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 6,
              minHeight: 110,
              background: isDark
                ? `linear-gradient(180deg, rgba(99,102,241,0.14) 0%, ${palette.card} 100%)`
                : `linear-gradient(180deg, rgba(99,102,241,0.06) 0%, rgba(255,255,255,0.88) 100%)`,
              overflow: "hidden"
            };
            const chartCardStyle = {
              borderRadius: 12,
              padding: 12,
              border: `1px solid ${palette.border}`,
              boxShadow: palette.shadow,
              background: palette.card,
              minHeight: 280
            };

            const sparkOptions = {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { enabled: false }, datalabels: { display: false } },
              scales: { x: { display: false }, y: { display: false } },
              elements: { point: { radius: 0 }, line: { tension: 0.35 } },
              layout: { padding: 0 }
            };

            const barOptions = {
              responsive: true,
              maintainAspectRatio: false,
              layout: { padding: { top: 18, right: 12, left: 4, bottom: 8 } },
              plugins: {
                legend: { position: "bottom" },
                datalabels: {
                  display: true,
                  color: palette.text,
                  anchor: "end",
                  align: "top",
                  offset: 4,
                  clamp: true,
                  clip: false,
                  formatter: (v) => (typeof v === "number" ? v.toLocaleString("pt-BR") : v),
                  font: { weight: "600", size: 10 }
                }
              },
              scales: {
                x: { grid: { display: false }, ticks: { color: palette.sub } },
                y: {
                  grid: { color: isDark ? "rgba(255,255,255,0.08)" : "#E6F0FF" },
                  ticks: { color: palette.sub },
                },
              }
            };
            const barCreatedDone = {
              labels: labelsCreatedDone,
              datasets: [
                { label: "Concluídos", data: dataDone, backgroundColor: palette.blueLight, borderRadius: 6, maxBarThickness: 22 },
                { label: "Criados", data: dataCreated, backgroundColor: palette.blueDark, borderRadius: 6, maxBarThickness: 22 }
              ]
            };

            const donutOptions = {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "right", labels: { color: palette.text } },
                datalabels: {
                  color: "#fff",
                  textStrokeColor: "rgba(0,0,0,0.25)",
                  textStrokeWidth: 2,
                  formatter: (v) => (v > 0 ? v : ""),
                  font: { weight: "700", size: 10 }
                }
              },
              cutout: "55%"
            };
            // Compat: variáveis neutras para possíveis referências residuais em builds em cache
            const compLabels = [];
            const compValues = [];
            const compColors = [];
            const donutStages = {
              labels: stageLabels,
              datasets: [{ data: stageCounts, backgroundColor: stageColors, borderWidth: 0 }]
            };

            const singlePoint = (dayValues || []).length <= 1;
            const maxVal = Math.max(0, ...(dayValues || []));
            const suggestedMax = maxVal <= 1 ? 1.2 : maxVal * 1.1;
            const lineOptions = {
              responsive: true,
              maintainAspectRatio: false,
              layout: { padding: { top: 18, right: 12, left: 4, bottom: 8 } },
              plugins: {
                legend: { display: false },
                datalabels: {
                  display: singlePoint,
                  color: palette.text,
                  anchor: "center",
                  align: "top",
                  offset: 6,
                  clamp: true,
                  clip: false,
                  formatter: (v) => (typeof v === "number" ? v.toLocaleString("pt-BR") : v),
                  font: { weight: "600", size: 10 }
                }
              },
              elements: { point: { radius: singlePoint ? 6 : 2 } },
              spanGaps: true,
              scales: {
                x: { grid: { display: false }, ticks: { color: palette.sub } },
                y: {
                  grid: { color: isDark ? "rgba(255,255,255,0.08)" : "#E6F0FF" },
                  ticks: { color: palette.sub },
                  beginAtZero: true,
                  suggestedMax,
                  grace: "10%",
                },
              }
            };
            const linePerDay = {
              labels: dayLabels,
              datasets: [{
                label: "Projetos",
                data: dayValues,
                fill: true,
                borderColor: palette.blueDark,
                backgroundColor: isDark ? "rgba(59,130,246,0.22)" : "rgba(37,99,235,0.10)",
                tension: 0.35
              }]
            };

            return (
              <div style={{ padding: 4, overflowX: "hidden", overflowY: "visible", width: "100%", height: "auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, margin: 0 }}>
                  {kpis.map((c, idx) => {
                    const delta = Math.round(c.delta || 0);
                    const deltaColor = delta > 0 ? "#065F46" : delta < 0 ? "#B91C1C" : palette.sub;
                    const deltaPrefix = delta > 0 ? "+" : "";
                    return (
                      <Paper
                        key={c.label}
                        onMouseEnter={() => setHoveredKpi(c.label)}
                        onMouseLeave={() => setHoveredKpi(null)}
                        style={{
                          ...cardStyle,
                          boxShadow:
                            hoveredKpi === c.label
                              ? isDark
                                ? "0 12px 28px rgba(0,0,0,0.55)"
                                : "0 12px 24px rgba(2,6,23,0.16)"
                              : palette.shadow,
                          transform: hoveredKpi === c.label ? "translateY(-4px) scale(1.01)" : "none",
                          transition: "transform 150ms ease, box-shadow 150ms ease",
                          transformStyle: "preserve-3d"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ fontSize: 13, color: palette.text, whiteSpace: "nowrap", fontWeight: 400 }}>{c.label}</div>
                          <div style={{ width: 28, height: 28, borderRadius: 10, background: c.badgeBg, display: "grid", placeItems: "center" }}>
                            <div style={{ transform: "scale(0.9)" }}>{c.icon}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <div style={{ fontWeight: 700, fontSize: 20, color: palette.text, whiteSpace: "nowrap" }}>{c.value}</div>
                          <div style={{ width: 64, height: 22 }}>
                            <Line
                              data={{
                                labels: (c.spark || []).map((_, i) => i + 1),
                                datasets: [{ data: c.spark || [], borderColor: c.color, backgroundColor: `${c.color}22`, fill: true }]
                              }}
                              options={sparkOptions}
                            />
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: palette.sub, minHeight: 16, display: "flex", justifyContent: "space-between" }}>
                          <span />
                          <span style={{ color: deltaColor }}>{`${deltaPrefix}${delta}%`}</span>
                        </div>
                      </Paper>
                    );
                  })}
                </div>

                <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Paper style={chartCardStyle}>
                    <div style={{ fontSize: 13, fontWeight: 400, color: palette.text, marginBottom: 8 }}>Criados vs Concluídos</div>
                    <div style={{ height: 220 }}>
                      <Bar options={barOptions} data={barCreatedDone} />
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: palette.sub, fontSize: 12 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: palette.blueLight, display: "inline-block" }} />
                        Concluídos
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: palette.sub, fontSize: 12 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: palette.blueDark, display: "inline-block" }} />
                        Criados
                      </span>
                    </div>
                  </Paper>
                  <Paper style={chartCardStyle}>
                    <div style={{ fontSize: 13, fontWeight: 400, color: palette.text, marginBottom: 8 }}>Projetos por Status</div>
                    <div style={{ height: 240 }}>
                      <Doughnut data={donutStages} options={donutOptions} />
                    </div>
                  </Paper>
                </div>

                <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Paper style={chartCardStyle}>
                    <div style={{ fontSize: 13, fontWeight: 400, color: palette.text, marginBottom: 8 }}>Ranking por Responsável (média de progresso)</div>
                    <div style={{ height: 240 }}>
                      <Bar data={barRankData} options={barRankOptions} />
                    </div>
                  </Paper>
                  <Paper style={chartCardStyle}>
                    <div style={{ fontSize: 13, fontWeight: 400, color: palette.text, marginBottom: 8 }}>Projetos por Dia</div>
                    <div style={{ height: 220 }}>
                      <Line data={linePerDay} options={lineOptions} />
                    </div>
                  </Paper>
                </div>
              </div>
            );
          })()}
          {viewMode === "list" && <ProjectsList projects={filteredProjects} />}
          {viewMode === "calendar" && <ProjectsCalendar projects={filteredProjects} onCreate={handleCreateProject} />}
          {viewMode === "board" && (
            <div ref={kanbanRef} style={{ height: '100%', width: '100%' }}>
          <ProjectKanbanBoard
                columns={ (projectStagesState && projectStagesState.length) ? projectStagesState : undefined }
                projects={filteredProjects}
                users={usersList}
                onProjectClick={(project) => {
                  setSelectedProject(project);
                  setDetailsOpen(true);
                }}
                onMove={async (projectId, sourceCol, destCol) => {
                  if (sourceCol === destCol) return;
                  const id = Number(projectId);
                  // Mapeamento reverso se necessário, mas aqui colunas == status
                  const newStatus = destCol;
                  
                  setProjectsState(prev => {
                    const next = prev.map(p => p.id === id ? { ...p, status: newStatus } : p);
                    return next;
                  });
                  try {
                    await projectsService.update(id, { status: newStatus });
                  } catch (err) {
                    toastError(err);
                  }
                }}
                onDelete={async (project) => {
                  const id = Number(project.id);
                  try {
                    await projectsService.delete(id);
                    setProjectsState(prev => prev.filter(p => p.id !== id));
                    toast.success("Projeto excluído.");
                  } catch (err) {
                    toastError(err);
                  }
                }}
                onAdd={() => handleCreateProject()}
              />
            </div>
          )}
        </>
      )}
    </ActivitiesStyleLayout>

    <ProjectDetailsModal
      open={detailsOpen}
      onClose={() => setDetailsOpen(false)}
      project={selectedProject}
      users={usersList}
      stages={(projectStagesState && projectStagesState.length) ? projectStagesState : [
        { id: 'backlog', title: 'Backlog', color: '#6b7280' },
        { id: 'pending', title: 'Pendente', color: '#f59e0b' },
        { id: 'in_progress', title: 'Em Progresso', color: '#2563eb' },
        { id: 'completed', title: 'Concluído', color: '#10B981' }
      ]}
      onEdit={(project) => {
        setProjectToEdit(project);
        setDetailsOpen(false);
        setDrawerOpen(true);
      }}
      onDelete={async (project) => {
        const id = Number(project.id);
        try {
          await projectsService.delete(id);
          setProjectsState(prev => prev.filter(p => p.id !== id));
          setDetailsOpen(false);
          toast.success("Projeto excluído.");
        } catch (err) {
          toastError(err);
        }
      }}
    />

    <CreateProjectModal
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      project={projectToEdit}
      onSave={(savedProject) => {
         setProjectsState((prev) => {
             const savedId = Number(savedProject.id);
             const exists = prev.some(p => Number(p.id) === savedId);
             if (exists) {
                 return prev.map(p => Number(p.id) === savedId ? savedProject : p);
             } else {
                 return [savedProject, ...prev];
             }
         });
         setProjectToEdit(null);
      }}
    />

    <Drawer
      anchor="right"
      open={stagesDrawerOpen}
      onClose={() => setStagesDrawerOpen(false)}
      classes={{ paper: classes.drawerPaper }}
    >
      <div className={classes.drawerContainer}>
        <div className={classes.drawerHeader}>
          <Typography className={classes.drawerTitle}>Configure seu Kanban</Typography>
          <IconButton onClick={() => setStagesDrawerOpen(false)} className={classes.drawerCloseButton}>
            <CloseIcon />
          </IconButton>
        </div>
        <div className={classes.drawerContent}>
          <Typography variant="subtitle2" style={{ color: "#374151", fontSize: 16, fontWeight: 600 }}>Configure suas Etapas</Typography>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 10 }}>
            {localStages.map((st, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "36px 1fr auto",
                  alignItems: "center",
                  columnGap: 14,
                  rowGap: 18
                }}
              >
                <input
                  type="color"
                  value={st.color || "#3B82F6"}
                  onChange={(e) => updateStage(idx, "color", e.target.value)}
                  aria-label="Cor"
                  style={{ width: 34, height: 34, padding: 0, border: "1px solid #E5E7EB", borderRadius: "50%", background: "transparent" }}
                />
                <TextField
                  label="Rótulo"
                  variant="outlined"
                  fullWidth
                  value={st.title}
                  onChange={(e) => updateStage(idx, "title", e.target.value)}
                  InputLabelProps={{ style: { fontSize: 14 } }}
                  inputProps={{ style: { fontSize: 16, padding: "12px 14px" } }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <IconButton size="small" onClick={() => moveStageUp(idx)} title="Mover para cima">
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => moveStageDown(idx)} title="Mover para baixo">
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                  <Button onClick={() => removeStage(st.id)}>Remover</Button>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button color="primary" variant="outlined" onClick={addStage}>Adicionar etapa</Button>
            </div>
          </div>
        </div>
        <div className={classes.drawerActions}>
          <Button onClick={() => setStagesDrawerOpen(false)} variant="outlined">Cancelar</Button>
          <Button
            color="primary"
            variant="contained"
            onClick={async () => {
              try {
                setProjectStagesState(localStages);
                localStorage.setItem("project-stages", JSON.stringify(localStages));
                setStagesDrawerOpen(false);
              } catch (err) {
                // silencia
              }
            }}
          >
            Salvar
          </Button>
        </div>
      </div>
    </Drawer>
    </>
  );
};

export default Projects;
