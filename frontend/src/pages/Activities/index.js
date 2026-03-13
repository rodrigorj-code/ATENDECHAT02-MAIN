// Re-saved
import React, { useState, useEffect, useMemo, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  List as ListIcon,
  CalendarToday as CalendarIcon,
  ViewWeek as KanbanIcon,
  Dashboard as DashboardIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon, // Mantendo import original se precisar reverter
  FullscreenExit as FullscreenExitIcon,
  Settings as SettingsIcon,
  ZoomOutMap as ZoomOutMapIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  EventNote as EventNoteIcon
} from "@material-ui/icons";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Drawer,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Popover,
  Grid
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import api from "../../services/api";

import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import "../Schedules/Schedules.css";
import "moment/locale/pt-br";

import ActivitiesStyleLayout from "../../components/ActivitiesStyleLayout";
import KanbanBoard from "../../components/KanbanBoard";
import ActivityDetailsModal from "../../components/ActivityDetailsModal";
import CreateActivityModal from "../../components/CreateActivityModal";
import useActivities from "../../hooks/useActivities";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import activitiesService from "../../services/activitiesService";
import activityStagesService from "../../services/activityStagesService";
import convertedLeadsService from "../../services/convertedLeadsService";

// Charts (igual ao Dashboard de Leads/Vendas)
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
  dashboardCard: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(2),
  },
  cardValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: theme.palette.primary.main,
  },
  cardLabel: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1),
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
    overflow: "hidden",
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
    marginBottom: theme.spacing(2),
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
  },
  drawerActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: theme.spacing(3),
    gap: theme.spacing(1),
  },
}));
// Helpers
const formatDate = (value) => {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return String(value);
  }
};

const mapTypeLabel = (type) => {
  const t = String(type || '').toLowerCase();
  if (t === 'task') return 'Tarefa';
  if (t === 'call') return 'Ligação';
  if (t === 'email') return 'E-mail';
  if (t === 'meeting') return 'Reunião';
  return type || '';
};

const mapStatusLabel = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'in_progress') return 'Em progresso';
  if (s === 'pending') return 'Pendente';
  if (s === 'completed') return 'Concluído';
  if (s === 'backlog') return 'Backlog';
  return status || '';
};

const defaultActivityStages = [
  { key: 'backlog', label: 'Backlog', color: '#4B5563' },
  { key: 'pending', label: 'Pendente', color: '#4B5563' },
  { key: 'in_progress', label: 'Em Progresso', color: '#F97316' },
  { key: 'completed', label: 'Concluído', color: '#10B981' }
];

// Sub-component for List View
const ActivitiesList = ({ activities }) => {
  return (
    <TableContainer component={Paper} style={{ height: '100%', overflow: 'auto' }}>
      <Table stickyHeader aria-label="activities table">
        <TableHead>
          <TableRow>
            <TableCell>Título</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activities.length > 0 ? (
            activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell component="th" scope="row">
                  {activity.title}
                </TableCell>
                <TableCell>{mapTypeLabel(activity.type)}</TableCell>
                <TableCell>{formatDate(activity.date)}</TableCell>
                <TableCell>
                  <Chip 
                    label={mapStatusLabel(activity.status)} 
                    size="small" 
                    color={String(activity.status).toLowerCase() === 'completed' ? 'primary' : 'default'} 
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center">
                Nenhuma atividade encontrada
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Sub-component for Calendar View – layout equivalente a /schedules
const ActivitiesCalendar = ({ activities, onCreate }) => {
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
    return activities.map(a => ({
      title: a.title,
      start: new Date(a.date),
      end: new Date(a.date),
      allDay: true,
      resource: a
    }));
  }, [activities]);
  const eventPropGetter = (event) => {
    const now = new Date();
    const start = new Date(event.start);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const isPast = eventDate < today;
    const isToday = eventDate.getTime() === today.getTime();
    const status = String(event.resource.status || "").toLowerCase();
    let style = { backgroundColor: "#DBEAFE", border: "1px solid #BFDBFE", color: "#1E40AF", borderRadius: 10, padding: "6px 8px", fontSize: 12 };
    if (status === "completed" || status === "concluído") style = { backgroundColor: "#D1FAE5", border: "1px solid #A7F3D0", color: "#065F46", borderRadius: 10, padding: "6px 8px", fontSize: 12 };
    else if (isPast) style = { backgroundColor: "#FEE2E2", border: "1px solid #FCA5A5", color: "#991B1B", borderRadius: 10, padding: "6px 8px", fontSize: 12 };
    else if (isToday) style = { backgroundColor: "#FEF3C7", border: "1px solid #FDE68A", color: "#92400E", borderRadius: 10, padding: "6px 8px", fontSize: 12 };
    return { style };
  };
  const total = activities.length;
  const conclu = activities.filter(a => String(a.status).toLowerCase() === "completed").length;
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
              <button className="aside-action" onClick={onCreate}>Criar Atividade</button>
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
                <Typography className="aside-title" variant="body2">Atividade</Typography>
              </div>
              {(() => {
                const recent = [...activities].sort((a,b) => new Date(b.date) - new Date(a.date))[0];
                return (
                  <div className="activity-item">
                    <div className="activity-icon"><EventNoteIcon style={{ fontSize: 18 }} /></div>
                    <div className="activity-info">
                      <div className="activity-title">{recent?.title || "—"}</div>
                      <div className="activity-sub">{recent?.type || "—"}</div>
                    </div>
                    <div className="activity-time">{recent ? moment(recent.date).format("HH:mm") : "—"}</div>
                  </div>
                );
              })()}
              <div className="donut-center" style={{ position: "static", transform: "none", textAlign: "left" }}>
                <div className="donut-total" style={{ fontSize: 24 }}>{total}</div>
                <div className="donut-label">Total</div>
                <div className="donut-label">Concluídas: {conclu}</div>
              </div>
            </Paper>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

const Activities = () => {
  const classes = useStyles();
  const [viewMode, setViewMode] = useState("board");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [selectedResponsible, setSelectedResponsible] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [contactsList, setContactsList] = useState([]);
  const [anchorResp, setAnchorResp] = useState(null);
  const [anchorEmpresa, setAnchorEmpresa] = useState(null);
  const [anchorPeriodo, setAnchorPeriodo] = useState(null);
  const [anchorTodos, setAnchorTodos] = useState(null);
  const [activitiesState, setActivitiesState] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityToEdit, setActivityToEdit] = useState(null);
  const kanbanRef = useRef(null);
  const [activityStagesState, setActivityStagesState] = useState([]);
  const [stagesDrawerOpen, setStagesDrawerOpen] = useState(false);
  const [localStages, setLocalStages] = useState([]);
  const [hoveredKpi, setHoveredKpi] = useState(null);
  
  // Use existing hook
  const { activities, loading, count, hasMore } = useActivities({
    searchParam,
    pageNumber,
    dateStart,
    dateEnd
  });

  useEffect(() => {
    async function fetchFilters() {
      try {
        const resp = await convertedLeadsService.list({ searchParam: "", pageNumber: 1 });
        const list = (resp && resp.leads) ? resp.leads : [];
        setContactsList(list);
        const { data: usersResp } = await api.get("/users", { params: { searchParam: "" } });
        setUsersList(usersResp?.users || []);
      } catch (err) {
        // ignore
      }
    }
    fetchFilters();
  }, []);

  useEffect(() => {
    setActivitiesState(activities);
  }, [activities]);

  const handleSearch = (value) => {
    setSearchParam(value);
  };

  const handleCreateActivity = () => {
    setDrawerOpen(true);
  };

  const viewModes = [
    { value: "board", label: "Quadro", icon: <KanbanIcon /> },
    { value: "list", label: "Lista", icon: <ListIcon /> },
    { value: "calendar", label: "Calendário", icon: <CalendarIcon /> },
    { value: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  ];

  // Filters placeholder
  const filters = [
    {
      label: "Status",
      value: statusFilter,
      options: [
        { value: "pending", label: "Pendente" },
        { value: "in_progress", label: "Em Progresso" },
        { value: "completed", label: "Concluído" },
      ],
      onChange: (val) => setStatusFilter(val)
    }
  ];

  const filteredActivities = useMemo(() => {
    let base = activitiesState.filter(a => String(a.type || "").toLowerCase() !== "event");
    if (statusFilter) {
      base = base.filter((activity) => String(activity.status || "") === statusFilter);
    }
    if (selectedResponsible && (selectedResponsible.id || selectedResponsible.name)) {
      const idVal = selectedResponsible.id ? String(selectedResponsible.id) : null;
      const nameVal = selectedResponsible.name ? String(selectedResponsible.name).toLowerCase() : null;
      base = base.filter(a => {
        const idMatch = idVal ? String(a.userId || "") === idVal : false;
        const nameMatch = nameVal ? String(a.owner || "").toLowerCase().includes(nameVal) : false;
        return idMatch || nameMatch;
      });
    }
    // Empresa: filtra por correspondência de ID ou nome em campos conhecidos
    if (selectedCompany && (selectedCompany.id || selectedCompany.name)) {
      const cid = selectedCompany.id ? String(selectedCompany.id) : null;
      const cname = String(selectedCompany.name || "").toLowerCase().trim();
      base = base.filter(a => {
        const compId = a?.companyId || a?.company?.id || a?.project?.company?.id;
        const compName = (a?.company?.name || a?.project?.company?.name || a?.project?.name || a?.title || a?.description || "").toLowerCase();
        const byId = cid ? String(compId || "") === cid : false;
        const byName = cname ? compName.includes(cname) : false;
        return byId || byName;
      });
    }
    // Período: usa a data principal da atividade (date) com fallback para createdAt/updatedAt
    const startOk = (d) => {
      if (!dateStart) return true;
      try {
        const cmp = new Date(dateStart); cmp.setHours(0,0,0,0);
        const dt = new Date(d); return dt >= cmp;
      } catch { return true; }
    };
    const endOk = (d) => {
      if (!dateEnd) return true;
      try {
        const cmp = new Date(dateEnd); cmp.setHours(23,59,59,999);
        const dt = new Date(d); return dt <= cmp;
      } catch { return true; }
    };
    if (dateStart || dateEnd) {
      base = base.filter(a => {
        const when = a?.date || a?.createdAt || a?.updatedAt || Date.now();
        return startOk(when) && endOk(when);
      });
    }
    return base;
  }, [activitiesState, statusFilter, selectedResponsible, selectedCompany, dateStart, dateEnd]);

  // Calculate quick stats for the header (respeita filtros)
  const headerStats = useMemo(() => {
    const base = filteredActivities;
    const total = base.length;
    const completed = base.filter(a => a.status === 'completed' || a.status === 'Concluído').length;
    return [
      { label: "Total", value: total, color: "#2563eb" },
      { label: "Concluídas", value: completed, color: "#22c55e" }
    ];
  }, [filteredActivities]);

  useEffect(() => {
    const onFsChange = () => {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      setIsFullscreen(!!fsEl && (fsEl === kanbanRef.current));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    document.addEventListener("mozfullscreenchange", onFsChange);
    document.addEventListener("MSFullscreenChange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
      document.removeEventListener("mozfullscreenchange", onFsChange);
      document.removeEventListener("MSFullscreenChange", onFsChange);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadStages = async () => {
      try {
        const list = await activityStagesService.list();
        if (mounted && Array.isArray(list) && list.length) {
          setActivityStagesState(list);
        }
      } catch (_) {
        // silencioso
      }
    };
    loadStages();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (stagesDrawerOpen) {
      const base = activityStagesState.length ? activityStagesState : defaultActivityStages;
      // deep clone
      setLocalStages(JSON.parse(JSON.stringify(base)));
    }
  }, [stagesDrawerOpen, activityStagesState]);

  const slug = (txt) =>
    (txt || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

  const addStage = () => {
    const idx = (localStages?.length || 0) + 1;
    const label = `Etapa ${idx}`;
    const key = slug(label);
    setLocalStages(prev => [...prev, { key, label, color: "#4B5563" }]);
  };
  const removeStage = (key) => setLocalStages(prev => prev.filter(s => s.key !== key));
  const updateStage = (i, field, value) => {
    setLocalStages(prev => {
      const next = prev.slice();
      if (field === "label") {
        next[i] = { ...next[i], label: value, key: slug(value) };
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

  const requestFs = (el) => {
    if (el.requestFullscreen) return el.requestFullscreen();
    if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
    if (el.mozRequestFullScreen) return el.mozRequestFullScreen();
    if (el.msRequestFullscreen) return el.msRequestFullscreen();
  };

  const exitFs = () => {
    if (document.exitFullscreen) return document.exitFullscreen();
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
    if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
    if (document.msExitFullscreen) return document.msExitFullscreen();
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
      {/* Removidos botões de setas da navbar */}
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
            getOptionLabel={(option) => option.name}
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
                InputLabelProps={{ shrink: true }}
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                size="small"
                InputProps={{ style: { fontSize: 13 } }}
                InputLabelProps={{ shrink: true, style: { fontSize: 12 } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Fim"
                type="date"
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                size="small"
                InputProps={{ style: { fontSize: 13 } }}
                InputLabelProps={{ shrink: true, style: { fontSize: 12 } }}
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
                setSelectedCompany(null);
                setSelectedResponsible(null);
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
      description="Gerencie suas tarefas e atividades"
      onCreateClick={handleCreateActivity}
      searchPlaceholder="Buscar atividades..."
      searchValue={searchParam}
      onSearchChange={handleSearch}
      filters={filters}
      stats={[]}
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
            const palette = {
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
              gray: "#6B7280"
            };
            const todayMid = new Date(); todayMid.setHours(0,0,0,0);
            const total = filteredActivities.length;
            const completed = filteredActivities.filter(a => String(a.status).toLowerCase() === "completed").length;
            const inProgress = filteredActivities.filter(a => String(a.status).toLowerCase() === "in_progress").length;
            const overdue = filteredActivities.filter(a => {
              if (!a?.date) return false;
              const d = new Date(a.date);
              const st = String(a.status || "").toLowerCase();
              return d < todayMid && st !== "completed";
            }).length;

            // Séries diárias por status para percentuais/sparkline
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
            filteredActivities.forEach(a => {
              const k = dayKeyLocal(a.date || a.createdAt || Date.now());
              if (!k) return;
              createdPerDay[k] = (createdPerDay[k] || 0) + 1;
              const st = String(a.status || "").toLowerCase();
              if (st === "completed") completedPerDay[k] = (completedPerDay[k] || 0) + 1;
              if (st === "in_progress") inProgPerDay[k] = (inProgPerDay[k] || 0) + 1;
              const d = new Date(a.date || Date.now());
              if (d < todayMid && st !== "completed") overduePerDay[k] = (overduePerDay[k] || 0) + 1;
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
              { label: "Total de Atividades", value: total, color: palette.blueDark, badgeBg: `${palette.blueDark}18`, delta: computeDelta(createdSeries), icon: <InsertChartOutlinedIcon style={{ color: palette.blueDark }} />, spark: createdSeries },
              { label: "Concluídas", value: completed, color: palette.green, badgeBg: `${palette.green}18`, delta: computeDelta(completedSeries), icon: <CheckCircleOutlineIcon style={{ color: palette.green }} />, spark: completedSeries },
              { label: "Em Progresso", value: inProgress, color: palette.amber, badgeBg: `${palette.amber}18`, delta: computeDelta(inProgSeries), icon: <ScheduleIcon style={{ color: palette.amber }} />, spark: inProgSeries },
              { label: "Atrasadas", value: overdue, color: palette.red, badgeBg: `${palette.red}18`, delta: computeDelta(overdueSeries), icon: <ErrorOutlineIcon style={{ color: palette.red }} />, spark: overdueSeries }
            ];

            // Agrupar por mês (Criadas vs Concluídas)
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
            filteredActivities.forEach(a => {
              const key = monthKey(a.date || a.createdAt || Date.now());
              if (!key) return;
              createdMap[key] = (createdMap[key] || 0) + 1;
              const st = String(a.status || "").toLowerCase();
              if (st === "completed") doneMap[key] = (doneMap[key] || 0) + 1;
            });
            const months = Array.from(new Set([...Object.keys(createdMap), ...Object.keys(doneMap)])).sort();
            // Labels humanizados PT-BR
            const labelFromKey = (k) => {
              const [yy, mm] = k.split("-");
              const d = new Date(Number(yy), Number(mm) - 1, 1);
              return d.toLocaleDateString("pt-BR", { month: "short" });
            };
            const labelsCreatedDone = months.map(labelFromKey);
            const dataCreated = months.map(k => createdMap[k] || 0);
            const dataDone = months.map(k => doneMap[k] || 0);

            // Donut por Etapa (status)
            const stages = (activityStagesState.length ? activityStagesState : defaultActivityStages);
            const stageOrder = stages.map(s => s.key);
            const stageLabelByKey = stages.reduce((acc, s) => { acc[s.key] = s.label; return acc; }, {});
            const stageColorByKey = stages.reduce((acc, s) => { acc[s.key] = s.color || palette.gray; return acc; }, {});
            const stageCounts = stageOrder.map(k =>
              filteredActivities.filter(a => String(a.status).toLowerCase() === String(k).toLowerCase()).length
            );
            const stageLabels = stageOrder.map(k => stageLabelByKey[k] || k);
            const stageColors = stageOrder.map(k => stageColorByKey[k]);

            // Gráfico por Tipo
            const typeMap = {};
            filteredActivities.forEach(a => {
              const t = String(a.type || "outros").toLowerCase();
              typeMap[t] = (typeMap[t] || 0) + 1;
            });
            const typeLabels = Object.keys(typeMap);
            const humanizeType = (t) => {
              const key = String(t || "").toLowerCase();
              if (key === "task") return "Tarefa";
              return key.charAt(0).toUpperCase() + key.slice(1);
            };
            const typeValues = typeLabels.map(k => typeMap[k]);

            // Linha diária (total criado por dia)
            const dayKey = (d) => {
              try {
                const dt = new Date(d);
                if (isNaN(dt.getTime())) return null;
                return dt.toISOString().slice(0,10);
              } catch { return null; }
            };
            const perDay = {};
            filteredActivities.forEach(a => {
              const k = dayKey(a.date || a.createdAt || Date.now());
              if (!k) return;
              perDay[k] = (perDay[k] || 0) + 1;
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
              background: `linear-gradient(180deg, rgba(99,102,241,0.06) 0%, rgba(255,255,255,0.88) 100%)`,
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
                y: { grid: { color: "#E6F0FF" }, ticks: { color: palette.sub } }
              }
            };
            const barCreatedDone = {
              labels: labelsCreatedDone,
              datasets: [
                { label: "Concluídas", data: dataDone, backgroundColor: palette.blueLight, borderRadius: 6, maxBarThickness: 22 },
                { label: "Criadas", data: dataCreated, backgroundColor: palette.blueDark, borderRadius: 6, maxBarThickness: 22 }
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
            const donutStages = {
              labels: stageLabels,
              datasets: [{ data: stageCounts, backgroundColor: stageColors, borderWidth: 0 }]
            };
            const donutTypes = {
              labels: typeLabels.map(humanizeType),
              datasets: [{ data: typeValues, backgroundColor: [palette.blue, palette.green, palette.amber, palette.red, "#8B5CF6", "#14B8A6", "#F97316"] }]
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
                y: { grid: { color: "#E6F0FF" }, ticks: { color: palette.sub }, beginAtZero: true, suggestedMax, grace: "10%" }
              }
            };
            const linePerDay = {
              labels: dayLabels,
              datasets: [{
                label: "Atividades",
                data: dayValues,
                fill: true,
                borderColor: palette.blueDark,
                backgroundColor: "rgba(37,99,235,0.10)",
                tension: 0.35
              }]
            };

            return (
              <div style={{ padding: 4, overflowX: "hidden", overflowY: "visible", width: "100%", height: "auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, margin: 0 }}>
                  {kpis.map((c) => {
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
                          boxShadow: hoveredKpi === c.label ? "0 12px 24px rgba(2,6,23,0.16)" : palette.shadow,
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
                    <div style={{ fontSize: 13, fontWeight: 400, color: palette.text, marginBottom: 8 }}>Criadas vs Concluídas</div>
                    <div style={{ height: 220 }}>
                      <Bar options={barOptions} data={barCreatedDone} />
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: palette.sub, fontSize: 12 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: palette.blueLight, display: "inline-block" }} />
                        Concluídas
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: palette.sub, fontSize: 12 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: palette.blueDark, display: "inline-block" }} />
                        Criadas
                      </span>
                    </div>
                  </Paper>
                  <Paper style={chartCardStyle}>
                    <div style={{ fontSize: 13, fontWeight: 400, color: palette.text, marginBottom: 8 }}>Atividades por Etapa</div>
                    <div style={{ height: 240 }}>
                      <Doughnut data={donutStages} options={donutOptions} />
                    </div>
                  </Paper>
                </div>

                <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Paper style={chartCardStyle}>
                    <div style={{ fontSize: 13, fontWeight: 400, color: palette.text, marginBottom: 8 }}>Atividades por Tipo</div>
                    <div style={{ height: 240 }}>
                      <Doughnut data={donutTypes} options={donutOptions} />
                    </div>
                  </Paper>
                  <Paper style={chartCardStyle}>
                    <div style={{ fontSize: 13, fontWeight: 400, color: palette.text, marginBottom: 8 }}>Atividades por Dia</div>
                    <div style={{ height: 220 }}>
                      <Line data={linePerDay} options={lineOptions} />
                    </div>
                  </Paper>
                </div>
              </div>
            );
          })()}
          {viewMode === "list" && <ActivitiesList activities={filteredActivities} />}
          {viewMode === "calendar" && <ActivitiesCalendar activities={filteredActivities} onCreate={handleCreateActivity} />}
          {viewMode === "board" && (
            <div ref={kanbanRef} style={{ height: '100%', width: '100%' }}>
              <KanbanBoard
                columns={(activityStagesState.length ? activityStagesState : defaultActivityStages).map(s => ({ id: s.key, title: s.label, color: s.color }))}
                activities={filteredActivities}
                users={usersList}
                onActivityClick={(activity) => {
                  setSelectedActivity(activity);
                  setDetailsOpen(true);
                }}
                onMove={async (activityId, sourceCol, destCol) => {
                  if (sourceCol === destCol) return;
                  const id = Number(activityId);
                  const map = {
                    backlog: 'backlog',
                    pending: 'pending',
                    in_progress: 'in_progress',
                    completed: 'completed'
                  };
                  const newStatus = map[destCol] || destCol;
                  setActivitiesState(prev => {
                    const next = prev.map(a => a.id === id ? { ...a, status: newStatus } : a);
                    return next;
                  });
                  try {
                    await activitiesService.update(id, { status: newStatus });
                  } catch (err) {
                    toastError(err);
                  }
                }}
                onDelete={async (activity) => {
                  const id = Number(activity.id);
                  try {
                    await activitiesService.delete(id);
                    setActivitiesState(prev => prev.filter(a => a.id !== id));
                    toast.success("Atividade excluída.");
                  } catch (err) {
                    toastError(err);
                  }
                }}
                onAdd={() => handleCreateActivity()}
              />
            </div>
          )}
        </>
      )}
    </ActivitiesStyleLayout>

    <ActivityDetailsModal
      open={detailsOpen}
      onClose={() => setDetailsOpen(false)}
      activity={selectedActivity}
      stages={activityStagesState.length ? activityStagesState : defaultActivityStages}
      users={usersList}
      onEdit={(activity) => {
        setActivityToEdit(activity);
        setDetailsOpen(false);
        setDrawerOpen(true);
      }}
      onDelete={async (activity) => {
        const id = Number(activity.id);
        try {
          await activitiesService.delete(id);
          setActivitiesState(prev => prev.filter(a => a.id !== id));
          setDetailsOpen(false);
          toast.success("Atividade excluída.");
        } catch (err) {
          toastError(err);
        }
      }}
    />

    <CreateActivityModal
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      activity={activityToEdit}
      onSave={(savedActivity) => {
         setActivitiesState((prev) => {
             // Garante que o ID da atividade salva seja um número para comparação consistente
             const savedId = Number(savedActivity.id);
             
             // Procura se já existe uma atividade com esse ID
             const exists = prev.some(a => Number(a.id) === savedId);
             
             if (exists) {
                 // Se existe, atualiza o item no array
                 return prev.map(a => Number(a.id) === savedId ? savedActivity : a);
             } else {
                 // Se não existe, adiciona no início
                 return [savedActivity, ...prev];
             }
         });
         // Reseta o estado de edição para evitar conflitos futuros
         setActivityToEdit(null);
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
                  value={st.color || "#4B5563"}
                  onChange={(e) => updateStage(idx, "color", e.target.value)}
                  aria-label="Cor"
                  style={{ width: 34, height: 34, padding: 0, border: "1px solid #E5E7EB", borderRadius: "50%", background: "transparent" }}
                />
                <TextField
                  label="Rótulo"
                  variant="outlined"
                  fullWidth
                  value={st.label}
                  onChange={(e) => updateStage(idx, "label", e.target.value)}
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
                  <Button onClick={() => removeStage(st.key)}>Remover</Button>
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
                const saved = await activityStagesService.bulkSave(localStages);
                setActivityStagesState(saved);
                setStagesDrawerOpen(false);
              } catch (err) {
                toastError(err);
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

export default Activities;
