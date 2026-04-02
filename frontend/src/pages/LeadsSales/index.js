import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  List as ListIcon,
  CalendarToday as CalendarIcon,
  ViewWeek as KanbanIcon
} from "@material-ui/icons";
import DashboardIcon from "@material-ui/icons/Dashboard";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  TextField,
  Popover,
  Button,
  Typography,
  Avatar,
  IconButton
} from "@material-ui/core";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import BusinessCenterIcon from "@material-ui/icons/BusinessCenter";
import AddIcon from "@material-ui/icons/Add";
import PhoneIcon from "@material-ui/icons/Phone";
import PersonOutlineIcon from "@material-ui/icons/PersonOutline";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import CloseIcon from "@material-ui/icons/Close";
import QueryBuilderIcon from "@material-ui/icons/QueryBuilder";
import ZoomOutMapIcon from "@material-ui/icons/ZoomOutMap";
import FullscreenExitIcon from "@material-ui/icons/FullscreenExit";
import SettingsIcon from "@material-ui/icons/Settings";
import ActivitiesStyleLayout from "../../components/ActivitiesStyleLayout";
import PipelineDrawer from "../../components/PipelineDrawer";
import leadPipelinesService from "../../services/leadPipelinesService";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../Schedules/Schedules.css";
import "moment/locale/pt-br";
import useLeadsSales from "../../hooks/useLeadsSales";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import CreateLeadSaleModal from "../../components/CreateLeadSaleModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import leadsSalesService from "../../services/leadsSalesService";
import { toast } from "react-toastify";
import LocalOfferOutlinedIcon from "@material-ui/icons/LocalOfferOutlined";
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
import { useTheme } from "@material-ui/core/styles";

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

const ContactAvatar = ({ contact, lead, classes }) => {
  const [src, setSrc] = useState(contact?.urlPicture || contact?.profilePicUrl || "");
  const name = lead?.name || contact?.name || "Lead";
  const number = lead?.phone || contact?.number;

  useEffect(() => {
    setSrc(contact?.urlPicture || contact?.profilePicUrl || "");
  }, [contact?.urlPicture, contact?.profilePicUrl]);

  useEffect(() => {
    let cancelled = false;
    async function fetchProfile() {
      if (src || !number) return;
      try {
        const { data } = await api.get(`/contacts/profile/${encodeURIComponent(number)}`);
        const fetched =
          data?.profilePicUrl || data?.urlPicture || (typeof data === "string" ? data : "");
        if (!cancelled && fetched) setSrc(fetched);
      } catch (e) {
        // ignore
      }
    }
    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [src, number]);

  return (
    <Avatar
      className={classes.cardAvatarTopLeft}
      src={src || undefined}
      imgProps={{ onError: () => setSrc("") }}
    >
      {initials(name)}
    </Avatar>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    height: "100%",
    overflow: "hidden",
  },
  fixedContent: {
    width: "100%",
    maxWidth: "100%",
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
  },
  board: {
    display: "grid",
    gridAutoRows: "1fr",
    width: "100%",
    overflowX: "auto",
    gridAutoFlow: "column",
    gridAutoColumns: "minmax(0, 1fr)",
    padding: 12,
    gap: 16,
    ...theme.scrollbarStyles,
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    "&::-webkit-scrollbar": {
      display: "none"
    }
  },
  column: {
    minWidth: 0,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    maxHeight: "100%",
  },
  columnHeader: {
    background: theme.palette.type === "dark" ? "#161616" : "#fff",
    border:
      theme.palette.type === "dark"
        ? "1px solid rgba(255,255,255,0.1)"
        : "1px solid #E5E7EB",
    borderRadius: 12,
    padding: 12,
    minHeight: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow:
      theme.palette.type === "dark"
        ? "0 2px 10px rgba(0,0,0,0.35)"
        : "0 1px 3px rgba(0,0,0,0.06)",
    [theme.breakpoints.down("sm")]: {
      padding: 10,
      minHeight: 50,
    },
  },
  columnLabel: {
    fontWeight: 600,
    color: theme.palette.type === "dark" ? "#f4f4f5" : "#111827",
    fontSize: 14,
    lineHeight: 1.2,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  columnMeta: {
    display: "flex",
    gap: 16,
    alignItems: "baseline",
    color: "#6B7280",
    fontSize: 12,
  },
  columnRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginLeft: 8,
    whiteSpace: "nowrap",
  },
  columnCount: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 1.2,
    padding: 0,
  },
  columnMenuBtn: {
    width: 28,
    height: 28,
    padding: 0,
    color: "#9CA3AF",
  },
  columnStripe: {
    width: 5,
    alignSelf: "stretch",
    borderRadius: 12,
    marginRight: 12,
  },
  cardsWrapper: {
    marginTop: 10,
    padding: "4px 0 8px",
    width: "100%",
    flex: 1,
    alignSelf: "flex-start",
    backgroundColor:
      theme.palette.type === "dark" ? "#0a0a0a" : "#F3F4F6",
    border:
      theme.palette.type === "dark"
        ? "1px solid rgba(255,255,255,0.08)"
        : "1px solid #E5E7EB",
    borderRadius: 10,
    ...theme.scrollbarStyles,
    [theme.breakpoints.down("sm")]: {
      marginTop: 8,
    },
  },
  card: {
    background: theme.palette.type === "dark" ? "#161616" : "#FFFFFF",
    border:
      theme.palette.type === "dark"
        ? "1px solid rgba(255,255,255,0.1)"
        : "1px solid #E5E7EB",
    borderRadius: 10,
    padding: "8px 10px 10px 40px",
    marginBottom: 10,
    width: "100%",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    cursor: "pointer",
    transition: "box-shadow .2s ease, transform .1s ease",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    aspectRatio: "auto",
    "&:hover": {
      boxShadow: "0 5px 12px rgba(0,0,0,0.08)",
      transform: "translateY(-1px)",
    },
    [theme.breakpoints.down("sm")]: {
      marginBottom: 8,
      padding: "8px 8px 10px 38px",
      aspectRatio: "auto",
    },
  },
  cardTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  cardDeleteBtn: {
    position: "absolute",
    bottom: 2,
    right: 6,
    width: 20,
    height: 20,
    minWidth: 20,
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    color: "#EF4444",
    transition: "all 120ms ease",
    "&:hover": {
      color: "#B91C1C",
    }
  },
  cardApproveBtn: {
    position: "absolute",
    bottom: 2,
    left: 6,
    width: 20,
    height: 20,
    minWidth: 20,
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    color: "#10B981",
    transition: "all 120ms ease",
    "&:hover": {
      color: "#059669",
    }
  },
  cardTimeBadge: {
    position: "absolute",
    bottom: 32,
    right: 8,
    fontSize: 10,
    color: "#6B7280",
    backgroundColor: "rgba(0,0,0,0.02)",
    border: "none",
    borderRadius: 6,
    padding: "1px 4px"
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 0
  },
  avatar: {
    width: 26,
    height: 26,
    fontSize: 12,
    background: "#F3F4F6",
    color: "#374151",
  },
  cardAvatarTopRight: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    fontSize: 11,
    background: "#F3F4F6",
    color: "#374151",
    border: "1px solid #E5E7EB",
  },
  cardAvatarTopLeft: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 26,
    height: 26,
    fontSize: 12,
    background: "#F3F4F6",
    color: "#374151",
    border: "1px solid #E5E7EB",
  },
  avatarStatusDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 9999,
    backgroundColor: "#10B981",
    top: 28,
    left: 28,
    zIndex: 2,
    border: "2px solid #FFFFFF"
  },
  cardTitle: {
    fontWeight: 600,
    fontSize: "clamp(9px, 1.1vw, 12px)",
    color: theme.palette.type === "dark" ? "#f4f4f5" : "#111827",
    lineHeight: 1.25,
    whiteSpace: "normal",
    wordBreak: "break-word",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  cardSub: {
    fontSize: "clamp(8px, 1vw, 11px)",
    fontWeight: 400,
    color: theme.palette.type === "dark" ? "#94a3b8" : "#9CA3AF",
    marginTop: 2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  tagChip: {
    fontSize: 8.5,
    color: "#6B7280",
    backgroundColor: "rgba(0,0,0,0.03)",
    border: "1px solid #E5E7EB",
    borderRadius: 6,
    padding: "0 4px",
    lineHeight: "14px"
  },
  cardValue: {
    marginTop: 4,
    fontWeight: 700,
    color: "#059669",
    fontSize: "clamp(7.5px, 0.95vw, 10px)",
    textAlign: "left",
    alignSelf: "flex-start",
  },
  cardRow: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    marginTop: 3,
    color: "#6B7280",
    fontSize: "clamp(7.5px, 0.85vw, 9.5px)",
    alignSelf: "flex-start",
    width: "100%",
    justifyContent: "flex-start",
  },
  cardEdgeLeft: {
    marginLeft: -36
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  cardBodyLeft: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    minWidth: 0,
  },
  cardTagRow: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
    alignSelf: "flex-start",
    justifyContent: "flex-start",
  },
  cardResponsible: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    marginTop: 1,
    color: "#4B5563",
    fontSize: 8,
    alignSelf: "flex-start",
    justifyContent: "flex-start",
  },
  addLeadBtn: {
    marginTop: 8,
    borderRadius: 12,
    textTransform: "none",
    color: "rgba(107, 114, 128, 0.85)",
    borderColor: "rgba(209, 213, 219, 0.7)",
    borderStyle: "dashed",
    backgroundColor: "rgba(249, 250, 251, 0.45)",
    minHeight: 40,
    padding: "6px 12px",
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: 0,
    "& .MuiSvgIcon-root": {
      fontSize: 16,
      color: "rgba(107, 114, 128, 0.8)",
    },
    "&:hover": {
      backgroundColor: "rgba(243, 244, 246, 0.6)",
      borderColor: "rgba(209, 213, 219, 1)",
    },
  },
  popoverContent: {
    padding: theme.spacing(2),
    maxWidth: 360
  },
  popoverGrid: {
    width: 320
  }
}));

const DEFAULT_STAGES = [
  { key: "novo", label: "Novo Lead", color: "#6366F1" },
  { key: "qualificacao", label: "Contato Inicial", color: "#8B5CF6" },
  { key: "proposta", label: "Proposta", color: "#F59E0B" },
  { key: "negociacao", label: "Reunião", color: "#F97316" },
  { key: "fechado", label: "Fechamento", color: "#10B981" },
];

function initials(name = "") {
  const parts = String(name).trim().split(" ");
  const i1 = parts[0]?.[0] || "";
  const i2 = parts.length > 1 ? parts[1][0] : "";
  return (i1 + i2).toUpperCase();
}

const AutoShrinkText = ({ text, max = 13, min = 8, className }) => {
  const containerRef = React.useRef(null);
  const textRef = React.useRef(null);
  const [size, setSize] = React.useState(max);
  const measure = React.useCallback(() => {
    const container = containerRef.current;
    const el = textRef.current;
    if (!container || !el) return;
    let current = max;
    el.style.fontSize = `${current}px`;
    let guard = 0;
    const limit = Math.max(0, container.clientWidth - 6);
    while (guard < 80 && current > min && el.scrollWidth > limit) {
      current -= 0.5;
      el.style.fontSize = `${current}px`;
      guard++;
    }
    setSize(current);
  }, [max, min, text]);
  React.useLayoutEffect(() => {
    const id = requestAnimationFrame(() => measure());
    return () => cancelAnimationFrame(id);
  }, [measure, text]);
  React.useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);
  return (
    <div ref={containerRef} style={{ overflow: "hidden", whiteSpace: "nowrap", minWidth: 0, paddingRight: 12, maxWidth: "100%" }}>
      <span ref={textRef} className={className} style={{ fontSize: size, display: "inline-block", maxWidth: "100%" }}>{text}</span>
    </div>
  );
};

const currencyBRL = (v) => {
  const n = Number(v || 0);
  try {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } catch {
    // fallback simples
    const fixed = n.toFixed(2).replace(".", ",");
    return `R$ ${fixed}`; 
  }
};

const LeadsKanbanBoard = ({ columns, leads, onEdit, onAdd, onMove, onDelete, contacts, onOpenTagCreator, onOpenPipelineConfig }) => {
  const classes = useStyles();
  const cols = Array.isArray(columns) && columns.length ? columns : DEFAULT_STAGES;

  const leadsByStatus = useMemo(() => {
    const map = {};
    const valid = new Set((cols || []).map(c => String(c.key || "").toLowerCase()));
    const fallback = (cols && cols[0] ? String(cols[0].key || "novo").toLowerCase() : "novo");
    (leads || []).forEach((l) => {
      const st = String(l.status || "").toLowerCase();
      const isValid = valid.has(st);
      // Remove explicit 'perdido' do quadro; outros inválidos caem na primeira coluna
      if (/(perdido|lost|cancelado|rejeitado)/i.test(st)) return;
      const key = st ? (isValid ? st : fallback) : fallback;
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push({ ...l, status: key });
    });
    return map;
  }, [leads, cols]);

  const getTotalValue = (arr = []) =>
    arr.reduce((sum, l) => sum + (Number(l.value) || 0), 0);

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result || {};
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    if (onMove) onMove(draggableId, source.droppableId, destination.droppableId, destination.index);
  };

  const boardRef = useRef(null);
  const isPanningRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [colPx, setColPx] = useState(0);

  useEffect(() => {
    const calc = () => {
      const el = boardRef.current;
      if (!el) return;
      // largura interna do board menos paddings/gaps
      const style = window.getComputedStyle(el);
      const paddingLeft = parseFloat(style.paddingLeft || "12") || 12;
      const paddingRight = parseFloat(style.paddingRight || "12") || 12;
      const gap = parseFloat(style.columnGap || style.gap || "16") || 16;
      const totalGap = gap * 4; // 5 colunas => 4 gaps
      const inner = el.clientWidth - paddingLeft - paddingRight - totalGap;
      const widthPerCol = inner > 0 ? Math.floor(inner / 5) : 260;
      setColPx(widthPerCol);
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (boardRef.current) ro.observe(boardRef.current);
    window.addEventListener("resize", calc);
    return () => {
      window.removeEventListener("resize", calc);
      ro.disconnect();
    };
  }, []);

  const onMouseDown = (e) => {
    if (cols.length <= 5) return;
    isPanningRef.current = true;
    startXRef.current = e.pageX - (boardRef.current?.offsetLeft || 0);
    scrollLeftRef.current = boardRef.current?.scrollLeft || 0;
  };
  const onMouseLeave = () => { isPanningRef.current = false; };
  const onMouseUp = () => { isPanningRef.current = false; };
  const onMouseMove = (e) => {
    if (!isPanningRef.current || !boardRef.current) return;
    const x = e.pageX - boardRef.current.offsetLeft;
    const walk = (x - startXRef.current) * -1;
    boardRef.current.scrollLeft = scrollLeftRef.current + walk;
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div
        className={classes.board}
        ref={boardRef}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        style={{
          gridTemplateColumns: colPx ? `repeat(5, ${colPx}px)` : undefined,
          gridAutoColumns: colPx ? `${colPx}px` : undefined,
          cursor: cols.length > 5 ? (isPanningRef.current ? "grabbing" : "grab") : "default",
          userSelect: isPanningRef.current ? "none" : "auto"
        }}
      >
        {cols.map((col) => {
          const list = leadsByStatus[col.key] || [];
          const total = getTotalValue(list);
          const since = (date) => {
            if (!date) return "0s";
            const diff = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
            if (diff < 60) return `${diff}s`;
            const m = Math.floor(diff / 60);
            if (m < 60) return `${m}m`;
            const h = Math.floor(m / 60);
            if (h < 24) return `${h}h`;
            const d = Math.floor(h / 24);
            return `${d}d`;
          };
          return (
            <div key={col.key} className={classes.column}>
              <div className={classes.columnHeader}>
                <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div className={classes.columnStripe} style={{ background: col.color }} />
                  <div style={{ minWidth: 0 }}>
                    <div className={classes.columnLabel}>{col.label}</div>
                    <div className={classes.columnMeta}>
                      <span>{currencyBRL(total)}</span>
                    </div>
                  </div>
                </div>
                <div className={classes.columnRight}>
                  <span className={classes.columnCount}>{list.length}</span>
                  <IconButton
                    size="small"
                    className={classes.columnMenuBtn}
                    onClick={() => {
                      if (typeof onOpenPipelineConfig === "function") onOpenPipelineConfig();
                    }}
                    title="Configurar pipeline"
                  >
                    <MoreHorizIcon fontSize="small" />
                  </IconButton>
                </div>
              </div>

              <Droppable droppableId={col.key}>
                {(providedDroppable) => (
                  <div className={classes.cardsWrapper} ref={providedDroppable.innerRef} {...providedDroppable.droppableProps}>
                    {list.map((l, index) => (
                      <Draggable draggableId={String(l.id)} index={index} key={l.id}>
                        {(providedDraggable) => (
                          <div
                            ref={providedDraggable.innerRef}
                            {...providedDraggable.draggableProps}
                            {...providedDraggable.dragHandleProps}
                            className={classes.card}
                            onClick={() => onEdit(l)}
                          >
                            <div className={classes.cardTimeBadge} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <QueryBuilderIcon style={{ fontSize: 14, color: "#9CA3AF" }} />
                              <span>{since(l.date)}</span>
                            </div>
                            <IconButton
                              className={classes.cardDeleteBtn}
                              size="small"
                              onClick={(e) => { e.stopPropagation(); onDelete && onDelete(l); }}
                              title="Excluir lead"
                              onMouseDown={(e) => e.stopPropagation()}
                              onMouseUp={(e) => e.stopPropagation()}
                            >
                              <CloseIcon style={{ fontSize: 12 }} />
                            </IconButton>
                            <IconButton
                              className={classes.cardApproveBtn}
                              size="small"
                              title="Concluir"
                              onMouseDown={(e) => e.stopPropagation()}
                              onMouseUp={(e) => e.stopPropagation()}
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                if (typeof onMove === "function") {
                                  try {
                                    onMove(l.id, col.key, "fechado");
                                  } catch (_) {}
                                }
                              }}
                            >
                              <CheckCircleOutlineIcon style={{ fontSize: 12 }} />
                            </IconButton>
                            <div className={classes.cardTopBar} style={{ background: col.color }} />
                            {(() => {
                              const contact = l.contact || (Array.isArray(contacts) ? contacts.find((c) => String(c.id) === String(l.contactId)) : null);
                              return (
                                <>
                                  <ContactAvatar contact={contact} lead={l} classes={classes} />
                                  <span className={classes.avatarStatusDot} />
                                  <div className={classes.cardHeader}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div className={classes.cardTitle}>
                                        {l.name || "Sem nome"}
                                      </div>
                                      {(l.companyName || contact?.name || l.contactId) && (
                                        <div className={classes.cardSub}>
                                          {l.companyName || contact?.name || l.contactId}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className={classes.cardBodyLeft}>
                                    {(l.phone || contact?.number) && (
                                <div className={classes.cardRow}>
                                  <PhoneIcon style={{ fontSize: 10, color: "#9CA3AF" }} />
                                  <span>{l.phone || contact?.number}</span>
                                </div>
                              )}
                              {Number(l.value || 0) > 0 && (
                                <div className={classes.cardValue}>
                                  {currencyBRL(Number(l.value || 0))}
                                </div>
                              )}
                              <div
                                className={classes.cardTagRow}
                                style={{ cursor: "pointer" }}
                                onClick={(e) => onOpenTagCreator && onOpenTagCreator(e, l)}
                              >
                                <LocalOfferOutlinedIcon style={{ fontSize: 12, color: "#3B82F6", opacity: 0.85 }} />
                                {Array.isArray(l.tags) && l.tags.length > 0 && (
                                  <span className={classes.tagChip}>{l.tags[0]}</span>
                                )}
                                <AddIcon style={{ fontSize: 12, color: "#3B82F6", opacity: 0.9 }} />
                              </div>
                              {l.responsible?.name && (
                                <div className={classes.cardResponsible}>
                                  <PersonOutlineIcon style={{ fontSize: 9, color: "#4B5563" }} />
                                  <span style={{ fontSize: 8, color: "#4B5563" }}>{l.responsible?.name}</span>
                                </div>
                              )}
                                  </div>
                                </>
                              );
                            })()}
                            <div className={classes.cardFooter} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {providedDroppable.placeholder}
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<AddIcon />}
                      className={classes.addLeadBtn}
                      onClick={() => onAdd(col.key)}
                    >
                      Adicionar Lead
                    </Button>
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

const LeadsList = ({ leads }) => {
  const getStatusMeta = (key) => {
    const cols = window.__LEADS_COLUMNS__ || [];
    const k = String(key || "").toLowerCase();
    const meta = cols.find((c) => c.key === k);
    if (meta) return meta;
    // Fallback: primeira coluna (ex.: 'novo') quando vazio/desconhecido
    if (!k && cols[0]) return cols[0];
    return { label: (k || "NOVO").toUpperCase(), color: "#E5E7EB" };
  };
  return (
    <TableContainer component={Paper} style={{ height: '100%', overflow: 'auto' }}>
      <Table stickyHeader aria-label="leads table">
        <TableHead>
          <TableRow>
            <TableCell>Lead</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Valor</TableCell>
            <TableCell>Contato</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.isArray(leads) && leads.length > 0 ? (
            leads.map((item) => (
              <TableRow key={item.id}>
                <TableCell component="th" scope="row">
                  {item.name}
                </TableCell>
                <TableCell>
                  {(() => {
                    const meta = getStatusMeta(item.status);
                    return (
                      <Chip
                        label={meta.label}
                        size="small"
                        style={{ background: `${meta.color}20`, color: meta.color, fontWeight: 600 }}
                      />
                    );
                  })()}
                </TableCell>
                <TableCell>{currencyBRL(item.value)}</TableCell>
                <TableCell>{item.contact?.name || item.contactId || "—"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center">
                Nenhum lead encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const LeadsSales = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isDark = (theme && theme.mode === "dark");
  const labelColor = isDark ? "#FFFFFF" : "#0F172A";
  const [viewMode, setViewMode] = useState("board");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chartCols, setChartCols] = useState(2);
  const [searchParam, setSearchParam] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [status, setStatus] = useState("");
  const [responsible, setResponsible] = useState(null);
  const [contact, setContact] = useState(null);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [leadsState, setLeadsState] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [contactsList, setContactsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const { user, socket } = useContext(AuthContext);
  const kanbanRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dash, setDash] = useState(null);
  const [hoveredKpi, setHoveredKpi] = useState(null);

  const visibleLeads = useMemo(() => {
    let arr = Array.isArray(leadsState) ? leadsState : [];
    if (contact && contact.__company) {
      const target = String(contact.name || "").trim().toLowerCase();
      arr = arr.filter(l => String(l.companyName || "").trim().toLowerCase() === target);
    }
    if (searchParam) {
      const term = String(searchParam || "").trim().toLowerCase();
      if (term) {
        arr = arr.filter((l) => {
          const n = String(l.name || "").trim().toLowerCase();
          const c = String(l.companyName || "").trim().toLowerCase();
          return n.includes(term) || c.includes(term);
        });
      }
    }
    return arr;
  }, [leadsState, contact, searchParam]);

  const companiesFromLeads = useMemo(() => {
    const names = new Set();
    const items = [];
    (leadsState || []).forEach((l) => {
      const nm = String(l.companyName || "").trim();
      if (nm && !names.has(nm)) {
        names.add(nm);
        items.push({ id: `company:${nm}`, name: nm, __company: true });
      }
    });
    return items;
  }, [leadsState]);

  const [anchorResp, setAnchorResp] = useState(null);
  const [anchorContact, setAnchorContact] = useState(null);
  const [anchorPeriodo, setAnchorPeriodo] = useState(null);
  const [anchorTodos, setAnchorTodos] = useState(null);
  // Tag creator popover
  const [tagAnchor, setTagAnchor] = useState(null);
  const [tagLead, setTagLead] = useState(null);
  const [tagText, setTagText] = useState("");

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth || document.documentElement.clientWidth || 0;
      setChartCols(w >= 1024 ? 2 : 1);
      document.body.style.overflowX = "hidden";
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchFilters() {
      try {
        const { data: contactsData } = await api.get("/contacts/list");
        const list = contactsData || [];
        setContactsList(list);
        const { data: usersResp } = await api.get("/users", { params: { searchParam: "" } });
        setUsersList(usersResp?.users || []);
      } catch (err) {
      }
    }
    fetchFilters();
  }, []);

  

  useEffect(() => {
    if (!socket || !user || !user.companyId) return;
    const onLeadEvent = (data) => {
      if (data?.action === "create" || data?.action === "update") {
        setLeadsState((prev) => {
          const idx = prev.findIndex((x) => String(x.id) === String(data.lead.id));
          if (idx >= 0) {
            const clone = [...prev];
            clone[idx] = data.lead;
            return clone;
          }
          return [data.lead, ...prev.filter(x => String(x.id) !== String(data.lead.id))];
        });
      }
      if (data?.action === "delete") {
        setLeadsState((prev) => prev.filter(x => String(x.id) !== String(data.id)));
      }
    };
    socket.on(`company-${user.companyId}-leads-sales`, onLeadEvent);
    return () => {
      socket.off(`company-${user.companyId}-leads-sales`, onLeadEvent);
    };
  }, [socket, user]);

  useEffect(() => {
    if (!socket || !user?.companyId) return;
    const onContact = (data) => {
      if (!data?.contact) return;
      setContactsList((prev) => {
        const idx = prev.findIndex((c) => String(c.id) === String(data.contact.id));
        return idx >= 0 ? prev.map((c) => (String(c.id) === String(data.contact.id) ? data.contact : c)) : [data.contact, ...prev];
      });
    };
    socket.on(`company-${user.companyId}-contact`, onContact);
    return () => {
      socket.off(`company-${user.companyId}-contact`, onContact);
    };
  }, [socket, user]);

  const openTagCreator = (e, lead) => {
    e.stopPropagation();
    setTagAnchor(e.currentTarget);
    setTagLead(lead);
    setTagText("");
  };
  const closeTagCreator = () => {
    setTagAnchor(null);
    setTagLead(null);
    setTagText("");
  };
  const handleAddTag = async () => {
    try {
      const text = String(tagText || "").trim();
      if (!text || !tagLead) return;
      const newTags = Array.isArray(tagLead.tags) ? [...tagLead.tags, text] : [text];
      const record = await leadsSalesService.update(tagLead.id, { tags: newTags });
      setLeadsState((prev) => prev.map((x) => String(x.id) === String(record.id) ? record : x));
      closeTagCreator();
      toast.success("Tag adicionada");
    } catch (err) {
      toastError(err);
    }
  };

  const viewModes = [
    { value: "board", label: "Quadro", icon: <KanbanIcon /> },
    { value: "list", label: "Lista", icon: <ListIcon /> },
    { value: "calendar", label: "Calendário", icon: <CalendarIcon /> },
    { value: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  ];

  const handleSearch = (value) => setSearchParam(value);

  // Pipelines (configuração)
  const defaultPipelines = useMemo(() => ([
    { id: "default", name: "Padrão", stages: DEFAULT_STAGES }
  ]), []);
  const [pipelines, setPipelines] = useState(defaultPipelines);
  const [selectedPipelineId, setSelectedPipelineId] = useState(() => {
    return localStorage.getItem("leads_selected_pipeline") || "default";
  });
  const [pipelineDrawerOpen, setPipelineDrawerOpen] = useState(false);
  const [anchorPipeline, setAnchorPipeline] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadPipelines = async () => {
      try {
        const list = await leadPipelinesService.list();
        if (mounted && Array.isArray(list) && list.length) {
          setPipelines(list);
          if (!list.find(p => p.id === selectedPipelineId)) {
            setSelectedPipelineId(list[0].id);
          }
        }
      } catch (_) {
        // silencioso
      }
    };
    loadPipelines();
    return () => { mounted = false; };
  }, []);

  const currentColumns = useMemo(() => {
    const current = pipelines.find(p => p.id === selectedPipelineId) || pipelines[0];
    return (current?.stages || DEFAULT_STAGES);
  }, [pipelines, selectedPipelineId]);

  useEffect(() => {
    let active = true;
    async function fetchDashboard() {
      try {
        const selectedContactId = contact && !contact.__company ? contact.id : undefined;
        const data = await leadsSalesService.dashboard({
          status,
          pipelineId: selectedPipelineId,
          responsibleId: responsible?.id,
          contactId: selectedContactId,
          dateStart,
          dateEnd
        });
        if (active) setDash(data);
      } catch (err) {
      }
    }
    fetchDashboard();
    return () => { active = false; };
  }, [status, selectedPipelineId, responsible?.id, contact?.id, dateStart, dateEnd]);

  // Carrega leads filtrando por pipelineId no backend
  const { leadsSales, loading, count, hasMore } = useLeadsSales({
    pageNumber,
    searchParam,
    status,
    pipelineId: selectedPipelineId,
    responsibleId: responsible?.id,
    contactId: (contact && !contact.__company) ? contact.id : undefined,
    dateStart,
    dateEnd
  });

  useEffect(() => {
    setLeadsState(leadsSales || []);
  }, [leadsSales]);
  // Leads renderizam diretamente do estado já filtrado pelo backend

  useEffect(() => {
    if (selectedPipelineId) {
      localStorage.setItem("leads_selected_pipeline", selectedPipelineId);
    }
  }, [selectedPipelineId]);

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

  const requestFs = (el) => {
    if (el?.requestFullscreen) return el.requestFullscreen();
    if (el?.webkitRequestFullscreen) return el.webkitRequestFullscreen();
    if (el?.mozRequestFullScreen) return el.mozRequestFullScreen();
    if (el?.msRequestFullscreen) return el.msRequestFullscreen();
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

  const navActions = (
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
        onClick={() => setPipelineDrawerOpen(true)}
      >
        <SettingsIcon style={{ fontSize: 18 }} />
      </IconButton>
    </>
  );

  const rightFilters = ({ classes: layout }) => (
    <>
      <div className={layout.filterItem} onClick={(e) => setAnchorPipeline(e.currentTarget)}>
        <Typography className={layout.filterLabel}>Pipeline</Typography>
        <ExpandMoreIcon className={layout.chevronIcon} />
      </div>
      <Popover
        open={Boolean(anchorPipeline)}
        anchorEl={anchorPipeline}
        onClose={() => setAnchorPipeline(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <div className={classes.popoverContent} style={{ padding: 8, maxWidth: 260, width: 220 }}>
          <Typography variant="subtitle2" style={{ marginBottom: 6, fontSize: 13 }}>Selecionar pipeline</Typography>
          <Grid container spacing={0.5} className={classes.popoverGrid} style={{ width: 220 }}>
            {pipelines.map((p) => (
              <Grid item xs={12} key={p.id}>
                <Button
                  fullWidth
                  size="small"
                  variant={selectedPipelineId === p.id ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => { setSelectedPipelineId(p.id); setAnchorPipeline(null); }}
                  style={{ textTransform: "none", minHeight: 30 }}
                >
                  {p.name}
                </Button>
              </Grid>
            ))}
            <Grid item xs={12} style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
              <Button size="small" onClick={() => { setAnchorPipeline(null); setPipelineDrawerOpen(true); }}>Gerenciar</Button>
              <Button size="small" onClick={() => setAnchorPipeline(null)}>Fechar</Button>
            </Grid>
          </Grid>
        </div>
      </Popover>
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
        <div className={classes.popoverContent} style={{ padding: 8, width: 220 }}>
          <Autocomplete
            fullWidth
            value={responsible}
            options={usersList}
            onChange={(e, val) => setResponsible(val)}
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
            <Button onClick={() => setResponsible(null)}>Limpar</Button>
          </div>
        </div>
      </Popover>

      <div className={layout.filterItem} onClick={(e) => setAnchorContact(e.currentTarget)}>
        <Typography className={layout.filterLabel}>Contato/Empresa</Typography>
        <ExpandMoreIcon className={layout.chevronIcon} />
      </div>
      <Popover
        open={Boolean(anchorContact)}
        anchorEl={anchorContact}
        onClose={() => setAnchorContact(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <div className={classes.popoverContent} style={{ padding: 8, width: 220 }}>
          <Autocomplete
            fullWidth
            value={contact}
            options={[...contactsList, ...companiesFromLeads]}
            onChange={(e, val) => setContact(val)}
            getOptionLabel={(option) => option.name || option.number || String(option.id)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Contato/Empresa"
                variant="outlined"
                size="small"
                placeholder="Pesquisar..."
                InputProps={{ ...params.InputProps, style: { fontSize: 13 } }}
                InputLabelProps={{ style: { fontSize: 12 } }}
              />
            )}
          />
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setContact(null)}>Limpar</Button>
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
        <div className={classes.popoverContent} style={{ padding: 8, width: 220 }}>
          <Grid container spacing={1} className={classes.popoverGrid}>
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
        <div className={classes.popoverContent} style={{ padding: 8, width: 220 }}>
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
                setResponsible(null);
                setContact(null);
                setStatus("");
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
        description="Leads e Vendas"
        onCreateClick={() => { setEditing(null); setDrawerOpen(true); }}
        searchPlaceholder="Filtrar por nome do lead, empresa..."
        searchValue={searchParam}
        onSearchChange={handleSearch}
        stats={[]}
        navActions={navActions}
        viewModes={viewModes}
        currentViewMode={viewMode}
        onViewModeChange={setViewMode}
        rightFilters={rightFilters}
        scrollContent={viewMode !== "calendar" && viewMode !== "dashboard"}
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
                blueLight: "#60A5FA",
                blueDark: "#2563EB",
                green: "#10B981",
                red: "#EF4444",
                amber: "#F59E0B",
                indigo: "#2563EB"
              };
              const fallbackSummary = (() => {
                const totalLeads = (leadsState || []).length;
                let leadsWon = 0;
                let leadsLost = 0;
                let totalSales = 0;
                (leadsState || []).forEach((l) => {
                  const st = String(l.status || "").toLowerCase();
                  const val = Number(l.value || 0) || 0;
                  const isWon = /(won|convert|fech|fechado|fechamento|ganho)/i.test(st);
                  const isLost = /(lost|perdido)/i.test(st);
                  if (isWon) {
                    totalSales += val;
                  }
                  if (isWon) {
                    leadsWon += 1;
                  } else if (isLost) {
                    leadsLost += 1;
                  }
                });
                const efficiency = (leadsWon + leadsLost) ? Math.round((leadsWon / (leadsWon + leadsLost)) * 100) : 0;
                return { totalLeads, leadsWon, leadsLost, totalSales, efficiency };
              })();
              const summary = dash?.summary || fallbackSummary;
              const kpi = [
                { label: "Total de Leads", value: summary.totalLeads, color: palette.blueDark, icon: <PersonOutlineIcon style={{ color: palette.blueDark }} /> },
                { label: "Total de Vendas", value: (summary.totalSales || 0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}), color: palette.green, icon: <BusinessCenterIcon style={{ color: palette.green }} /> },
                { label: "Eficiência", value: `${summary.efficiency?.toFixed ? summary.efficiency.toFixed(0) : summary.efficiency}%`, sub: "Conversão relativa entre leads e vendas", color: palette.amber, icon: <CheckCircleOutlineIcon style={{ color: palette.amber }} /> },
                { label: "Leads Ganhos", value: summary.leadsWon || 0, color: palette.green, icon: <CheckCircleOutlineIcon style={{ color: palette.green }} /> },
                { label: "Leads Perdidos", value: summary.leadsLost || 0, color: palette.red, icon: <CloseIcon style={{ color: palette.red }} /> }
              ];
              // Dados para mini-sparklines
              const seriesLeads = (dash?.clientsValueByDay || []).map(d => d.leads);
              const seriesRevenue = (dash?.revenuePerDay || []).map(d => d.revenue);
              const sparkOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: { x: { display: false }, y: { display: false } },
                elements: { point: { radius: 0 } }
              };
              const computeDelta = (arr) => {
                if (!Array.isArray(arr) || arr.length < 2) return null;
                const last = Number(arr[arr.length - 1] || 0);
                const prev = Number(arr[arr.length - 2] || 0);
                const diff = last - prev;
                const pct = prev === 0 ? 0 : (diff / prev) * 100;
                return { pct, up: diff >= 0 };
              };
              const lastOf = (arr) => (Array.isArray(arr) && arr.length ? Number(arr[arr.length - 1] || 0) : 0);
              const avgLast = (arr, n = 7) => {
                if (!Array.isArray(arr) || arr.length === 0) return 0;
                const slice = arr.slice(-n);
                const vals = slice.map(v => Number(v || 0)).filter(v => !isNaN(v));
                if (!vals.length) return 0;
                return vals.reduce((a, b) => a + b, 0) / vals.length;
              };
              let labelsRevenue = (dash?.revenuePerDay || []).map(d => d.date);
              let dataRevenue = (dash?.revenuePerDay || []).map(d => d.revenue);
              let labelsClients = (dash?.clientsValueByDay || []).map(d => d.date);
              let dataClients = (dash?.clientsValueByDay || []).map(d => d.leads);
              let dataValues = (dash?.clientsValueByDay || []).map(d => d.value);

              const fromLeadsSeries = (() => {
                const toKey = (v) => {
                  try {
                    const dt = new Date(v);
                    if (isNaN(dt.getTime())) return null;
                    return dt.toISOString().slice(0,10);
                  } catch { return null; }
                };
                const counts = {};
                const totals = {};
                const revenue = {};
                (leadsState || []).forEach((l) => {
                  const raw = l.updatedAt || l.createdAt || l.date || Date.now();
                  const k = toKey(raw);
                  if (!k) return;
                  const val = Number(l.value || 0) || 0;
                  counts[k] = (counts[k] || 0) + 1;
                  totals[k] = (totals[k] || 0) + val;
                  const st = String(l.status || "").toLowerCase();
                  const won = /(won|converted|fechado|ganho)/i.test(st);
                  revenue[k] = (revenue[k] || 0) + (won ? val : 0);
                });
                const keys = Object.keys(counts).sort();
                return {
                  labels: keys,
                  leads: keys.map(k => counts[k] || 0),
                  values: keys.map(k => totals[k] || 0),
                  revenue: keys.map(k => revenue[k] || 0)
                };
              })();

              // Fallback: manter \"Receita por Dia\" restrita a ganhos
              const sumArr = (arr) => (Array.isArray(arr) ? arr.reduce((a,b) => a + (Number(b)||0), 0) : 0);
              if ((!labelsRevenue.length || sumArr(dataRevenue) === 0) && fromLeadsSeries.labels.length) {
                labelsRevenue = fromLeadsSeries.labels;
                dataRevenue = fromLeadsSeries.revenue; // apenas ganhos
              }
              if (!labelsClients.length && fromLeadsSeries.labels.length) {
                labelsClients = fromLeadsSeries.labels;
                dataClients = fromLeadsSeries.leads;
                dataValues = fromLeadsSeries.values;
              }

              // Fallback robusto para Ranking de Responsáveis
              const fallbackRankingMap = (() => {
                const map = {};
                (leadsState || []).forEach((l) => {
                  const name = (l?.responsible?.name || "Outros");
                  const val = Number(l?.value || 0);
                  map[name] = (map[name] || 0) + (isNaN(val) ? 0 : val);
                });
                return map;
              })();
              const rankingDataArr = Array.isArray(dash?.rankingResponsibles) && dash.rankingResponsibles.length
                ? dash.rankingResponsibles
                : Object.entries(fallbackRankingMap).map(([name, value]) => ({ name, value }));
              const rankingLabels = rankingDataArr.map(r => r.name);
              const rankingValues = rankingDataArr.map(r => r.value);

              // Funil de Vendas (contagem por status) com normalização robusta
              const statusOrder = (currentColumns || []).map(c => String(c.key || "").toLowerCase());
              const LABEL_BY_KEY = (currentColumns || []).reduce((acc, c) => { acc[c.key] = c.label; return acc; }, {});
              const validKeys = new Set((currentColumns || []).map(c => String(c.key || "").toLowerCase()));
              const normalizeStatus = (s) => {
                const raw = String(s || "").toLowerCase();
                if (validKeys.has(raw)) return raw;
                const byLabel = (currentColumns || []).find(c => {
                  const lbl = String(c.label || "").toLowerCase();
                  return lbl === raw || raw.includes(lbl) || lbl.includes(raw);
                });
                if (byLabel && byLabel.key) return String(byLabel.key).toLowerCase();
                if (raw.includes("qualific") || raw.includes("contato inicial")) return "qualificacao";
                if (raw.includes("propost")) return "proposta";
                if (raw.includes("negoc") || raw.includes("reuni")) return "negociacao";
                if (/(fech|won|converted|ganho|ganhos)/i.test(raw)) return "fechado";
                if (raw.includes("novo")) return "novo";
                return "novo";
              };
              const funnelCounts = statusOrder.map((k) =>
                (leadsState || []).filter(l => normalizeStatus(l.status) === k).length
              );
              const funnelLabels = statusOrder.map(k => LABEL_BY_KEY[k] || k.toUpperCase());

              const chartHeight = 180;
              // Garante pelo menos 2 pontos na série para exibir uma "linha"
              const toISO = (s) => {
                try {
                  const d = new Date(s);
                  if (isNaN(d.getTime())) return null;
                  return d.toISOString().slice(0,10);
                } catch { return null; }
              };
              if (labelsRevenue.length === 1) {
                const onlyDateISO = toISO(labelsRevenue[0]) || labelsRevenue[0];
                const base = new Date(onlyDateISO);
                const prev = new Date(base.getTime() - 24 * 60 * 60 * 1000);
                const prevISO = prev.toISOString().slice(0,10);
                labelsRevenue = [prevISO, onlyDateISO];
                dataRevenue = [0, Number(dataRevenue[0] || 0)];
              }
              const maxRevenueVal = Math.max(0, ...dataRevenue.map(v => Number(v || 0)));
              const fmtBR = (s) => {
                try {
                  const d = new Date(s);
                  if (isNaN(d.getTime())) return s;
                  const dd = String(d.getDate()).padStart(2, "0");
                  const mm = String(d.getMonth() + 1).padStart(2, "0");
                  const yyyy = d.getFullYear();
                  return `${dd}/${mm}/${yyyy}`;
                } catch { return s; }
              };
              const lineOptions = {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { top: 24, right: 8, left: 4, bottom: 8 } },
                plugins: { 
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      title: (items) => (items && items[0] ? fmtBR(items[0].label) : "")
                    }
                  },
                  datalabels: {
                    display: true,
                    color: labelColor,
                    backgroundColor: (ctx) => (isDark ? "rgba(17,24,39,0.7)" : "rgba(255,255,255,0.85)"),
                    borderRadius: 4,
                    padding: { left: 4, right: 4, top: 2, bottom: 2 },
                    anchor: "end",
                    align: "top",
                    offset: 6,
                    clamp: true,
                    clip: false,
                    formatter: (v) => (typeof v === "number" ? v.toLocaleString("pt-BR") : v),
                    font: { weight: "700", size: 10 }
                  }
                },
                scales: {
                  x: { 
                    ticks: { 
                      maxRotation: 0, 
                      color: palette.sub, 
                      callback: (value, index) => fmtBR(labelsRevenue[index] ?? value) 
                    }, 
                    grid: { display: false } 
                  },
                  y: { ticks: { color: palette.sub }, grid: { color: "#E6F0FF" }, beginAtZero: true, grace: "15%", suggestedMax: maxRevenueVal * 1.12 }
                }
              };
              const lineData = {
                labels: labelsRevenue,
                datasets: [{
                  label: "Receita",
                  data: dataRevenue,
                  fill: false,
                  borderColor: palette.blueDark,
                  backgroundColor: "rgba(37,99,235,0.10)",
                  tension: 0.35,
                  borderWidth: 2,
                  pointRadius: 3,
                  pointHoverRadius: 4
                }]
              };
              const barOptions = {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { top: 18, right: 12, left: 4, bottom: 8 } },
                plugins: { 
                  legend: { position: "bottom" },
                  datalabels: {
                    display: true,
                    color: labelColor,
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
                  x: { stacked: false, ticks: { color: palette.sub }, grid: { display: false }, beginAtZero: true },
                  y: { stacked: false, position: "left", beginAtZero: true, ticks: { color: palette.sub, padding: 6 }, grid: { color: "#E6F0FF" } },
                  y1: { position: "right", beginAtZero: true, ticks: { color: palette.sub, padding: 6, callback: (v) => (typeof v === "number" ? v.toLocaleString("pt-BR") : v) }, grid: { drawOnChartArea: false } }
                }
              };
              const barData = {
                labels: labelsClients,
                datasets: [
                  { type: "bar", label: "Leads", data: dataClients, backgroundColor: palette.blueLight, borderRadius: 6, maxBarThickness: 20 },
                  { type: "bar", label: "Valor", data: dataValues, backgroundColor: palette.blueDark, borderRadius: 6, maxBarThickness: 20, yAxisID: "y1" }
                ]
              };
              const barRanking = {
                labels: rankingLabels,
                datasets: [{ label: "Valor", data: rankingValues, backgroundColor: palette.blueDark, borderRadius: 6, maxBarThickness: 20 }]
              };
              const funnelBar = {
                labels: funnelLabels,
                datasets: [{ label: "Quantidade", data: funnelCounts, backgroundColor: palette.blue, borderRadius: 6, maxBarThickness: 20 }]
              };

              return (
                <div style={{ padding: 4, overflowX: "hidden", overflowY: "hidden", width: "100%", height: "auto" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, margin: 0 }}>
                    {kpi.map((c) => (
                      <Paper key={c.label} onMouseEnter={() => setHoveredKpi(c.label)} onMouseLeave={() => setHoveredKpi(null)} style={{
                        borderRadius: 12,
                        padding: 12,
                        border: `1px solid ${palette.border}`,
                        boxShadow: hoveredKpi === c.label ? "0 12px 24px rgba(2,6,23,0.16)" : palette.shadow,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: 6,
                        minHeight: 110,
                        background: `linear-gradient(180deg, rgba(99,102,241,0.06) 0%, rgba(255,255,255,0.88) 100%)`,
                        overflow: "hidden",
                        transition: "transform 150ms ease, box-shadow 150ms ease",
                        transform: hoveredKpi === c.label ? "translateY(-4px) scale(1.01)" : "none",
                        transformStyle: "preserve-3d",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ fontSize: 13, color: palette.text, whiteSpace: "nowrap", fontWeight: 400 }}>{c.label}</div>
                          <div style={{ width: 28, height: 28, borderRadius: 10, background: `${c.color}18`, display: "grid", placeItems: "center" }}>
                            <div style={{ transform: "scale(0.9)" }}>{c.icon}</div>
                          </div>
                        </div>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ fontWeight: 700, fontSize: 20, color: palette.text, whiteSpace: "nowrap" }}>{c.value}</div>
                          {(() => {
                            let delta = null;
                            if (c.label === "Total de Leads") delta = computeDelta(seriesLeads);
                            if (c.label === "Total de Vendas") delta = computeDelta(seriesRevenue);
                            const effVal = Number(String(c.value).replace("%",""));
                            if (c.label === "Eficiência") {
                              if (effVal >= 70) {
                                return <span style={{ fontSize: 10, fontWeight: 700, color: "#065F46", background: "#D1FAE5", borderRadius: 6, padding: "2px 6px", whiteSpace: "nowrap" }}>SAUDÁVEL</span>;
                              }
                              if (effVal < 40) {
                                return <span style={{ fontSize: 10, fontWeight: 700, color: "#B91C1C", background: "#FEE2E2", borderRadius: 6, padding: "2px 6px", whiteSpace: "nowrap" }}>ATENÇÃO</span>;
                              }
                              return null;
                            }
                            if (delta) {
                              if (delta.up && Math.abs(delta.pct) >= 5) {
                                return <span style={{ fontSize: 10, fontWeight: 700, color: "#065F46", background: "#D1FAE5", borderRadius: 6, padding: "2px 6px", whiteSpace: "nowrap" }}>EM ALTA</span>;
                              }
                              if (!delta.up && Math.abs(delta.pct) >= 5) {
                                return <span style={{ fontSize: 10, fontWeight: 700, color: "#B91C1C", background: "#FEE2E2", borderRadius: 6, padding: "2px 6px", whiteSpace: "nowrap" }}>ATENÇÃO</span>;
                              }
                            }
                            if (c.label === "Leads Perdidos") {
                              const won = Number(summary.leadsWon || 0);
                              const lost = Number(summary.leadsLost || 0);
                              const lostRate = (won + lost) ? (lost / (won + lost)) * 100 : 0;
                              if (lostRate >= 30) {
                                return <span style={{ fontSize: 10, fontWeight: 700, color: "#B91C1C", background: "#FEE2E2", borderRadius: 6, padding: "2px 6px", whiteSpace: "nowrap" }}>ATENÇÃO</span>;
                              }
                            }
                            return null;
                          })()}
                        </div>
                        <div style={{ fontSize: 11, color: palette.sub }}>
                          {(() => {
                            // Primeira linha estratégica
                            if (c.label === "Total de Leads") {
                              const today = lastOf(seriesLeads);
                              return <span>Hoje: {today}</span>;
                            }
                            if (c.label === "Total de Vendas") {
                              const today = lastOf(seriesRevenue);
                              return <span>Hoje: {today.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>;
                            }
                            if (c.label === "Eficiência") {
                              return <span>Ganhos: {Number(summary.leadsWon || 0)}</span>;
                            }
                            if (c.label === "Leads Ganhos") {
                              const eff = Number(summary.efficiency || 0);
                              return <span>Taxa: {eff}%</span>;
                            }
                            if (c.label === "Leads Perdidos") {
                              const won = Number(summary.leadsWon || 0);
                              const lost = Number(summary.leadsLost || 0);
                              const lostRate = (won + lost) ? (lost / (won + lost)) * 100 : 0;
                              return <span>Perda: {lostRate.toFixed(0)}%</span>;
                            }
                            return null;
                          })()}
                        </div>
                        <div style={{ fontSize: 11, color: palette.sub }}>
                          {(() => {
                            // Segunda linha estratégica
                            if (c.label === "Total de Leads") {
                              const avg = avgLast(seriesLeads, 7);
                              return <span>Média 7d: {avg.toFixed(1)}</span>;
                            }
                            if (c.label === "Total de Vendas") {
                              const avg = avgLast(seriesRevenue, 7);
                              return <span>Média 7d: {avg.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>;
                            }
                            if (c.label === "Eficiência") {
                              return <span>Perdas: {Number(summary.leadsLost || 0)}</span>;
                            }
                            if (c.label === "Leads Ganhos") {
                              const total = Number(summary.totalSales || 0);
                              return <span>Receita: {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>;
                            }
                            if (c.label === "Leads Perdidos") {
                              return <span>Ganhos: {Number(summary.leadsWon || 0)}</span>;
                            }
                            return null;
                          })()}
                        </div>
                      </Paper>
                    ))}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${chartCols}, minmax(0, 1fr))`, gap: 16, marginTop: 8, width: "100%", overflowX: "hidden", overflowY: "hidden", alignItems: "stretch", minWidth: 0 }}>
                    {(() => {
                      const boxH = 260; // Altura igual para todos os gráficos
                      const chartH = 200; // Área interna do canvas
                      const titleStyle = { fontSize: 14, color: palette.text, marginBottom: 6, fontWeight: 400 };
                      return (
                        <>
                          {/* Gráfico 1 */}
                          <Paper style={{ borderRadius: 12, padding: 16, border: `1px solid ${palette.border}`, boxShadow: palette.shadow, height: boxH, background: "#FFFFFF" }}>
                            <div style={titleStyle}>Receita por Dia</div>
                            <div style={{ height: chartH }}>
                              <Line options={lineOptions} data={lineData} />
                            </div>
                          </Paper>
                          {/* Gráfico 2 */}
                          <Paper style={{ borderRadius: 12, padding: 16, border: `1px solid ${palette.border}`, boxShadow: palette.shadow, height: boxH, background: "#FFFFFF" }}>
                            <div style={titleStyle}>Clientes x Valor</div>
                            <div style={{ height: chartH }}>
                              <Bar options={barOptions} data={barData} />
                            </div>
                          </Paper>
                          {/* Gráfico 3 */}
                          <Paper style={{ borderRadius: 12, padding: 16, border: `1px solid ${palette.border}`, boxShadow: palette.shadow, height: boxH, background: "#FFFFFF" }}>
                            <div style={titleStyle}>Ranking de Responsáveis</div>
                            <div style={{ height: chartH }}>
                              <Bar
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  layout: { padding: { right: 16, left: 8, top: 4, bottom: 8 } },
                                  plugins: { 
                                    legend: { display: false },
                                    datalabels: {
                                      display: true,
                                      color: labelColor,
                                      anchor: "end",
                                      align: "right",
                                      offset: 6,
                                      clamp: true,
                                      clip: false,
                                      formatter: (v) => (typeof v === "number" ? v.toLocaleString("pt-BR") : v),
                                      font: { weight: "600", size: 10 }
                                    }
                                  },
                                  indexAxis: "y",
                                  scales: {
                                    x: { ticks: { color: palette.sub }, grid: { display: false }, beginAtZero: true },
                                    y: { ticks: { color: palette.sub } }
                                  }
                                }}
                                data={barRanking}
                              />
                            </div>
                          </Paper>
                          {/* Gráfico 4 */}
                          <Paper style={{ borderRadius: 12, padding: 16, border: `1px solid ${palette.border}`, boxShadow: palette.shadow, height: boxH, background: "#FFFFFF" }}>
                            <div style={titleStyle}>Funil de Vendas (Barras)</div>
                            <Bar
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                layout: { padding: { right: 16, left: 8, top: 4, bottom: 8 } },
                                plugins: { 
                                  legend: { display: false },
                                  datalabels: {
                                    display: true,
                                    color: labelColor,
                                    anchor: "end",
                                    align: "right",
                                    offset: 6,
                                    clamp: true,
                                    clip: false,
                                    formatter: (v) => (typeof v === "number" ? v.toLocaleString("pt-BR") : v),
                                    font: { weight: "600", size: 10 }
                                  }
                                },
                                indexAxis: "y",
                                scales: {
                                  x: { ticks: { color: palette.sub }, grid: { display: false }, beginAtZero: true },
                                  y: { ticks: { color: palette.sub } }
                                }
                              }}
                              data={funnelBar}
                              height={chartH}
                            />
                          </Paper>
                        </>
                      );
                    })()}
                  </div>
                </div>
              );
            })()}
            {viewMode === "list" && (() => {
              window.__LEADS_COLUMNS__ = currentColumns;
              return <LeadsList leads={visibleLeads} />;
            })()}
            {viewMode === "calendar" && (() => {
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
              const events = (visibleLeads || []).map((l) => {
                const when = l.nextFollowUpAt || l.date || l.createdAt || l.updatedAt || Date.now();
                return {
                  title: l.name || l.companyName || `Lead ${l.id}`,
                  start: new Date(when),
                  end: new Date(when),
                  allDay: true,
                  resource: l
                };
              });
              const eventPropGetter = (evt) => {
                const st = String(evt?.resource?.status || "").toLowerCase();
                let backgroundColor = "#2563eb";
                if (st.includes("won") || st.includes("converted") || st.includes("fechado")) backgroundColor = "#10B981";
                if (st.includes("lost") || st.includes("perdido")) backgroundColor = "#EF4444";
                return { style: { backgroundColor, color: "#0f172a", borderRadius: 10, border: `1px solid ${backgroundColor}`, padding: "6px 8px", fontSize: 12 } };
              };
              const total = visibleLeads.length;
              const ganho = visibleLeads.filter(l => /(won|converted|fechado)/i.test(String(l.status || ""))).length;
              return (
                <div className="schedules-page" style={{ paddingTop: 8, height: 'calc(100vh - 128px)', overflow: 'hidden' }}>
                  <Grid container spacing={2} style={{ height: '100%' }}>
                    <Grid item xs={12} md={9} lg={9} style={{ height: '100%' }}>
                      <Paper style={{ padding: 8, height: '100%', display: 'flex', overflow: 'visible' }}>
                        <Calendar
                          localizer={localizer}
                          views={["day","week","month"]}
                          components={{ toolbar: CustomToolbar }}
                          events={events}
                          startAccessor="start"
                          endAccessor="end"
                          eventPropGetter={eventPropGetter}
                          selectable
                          onSelectSlot={(slot) => {
                            const d = slot.start;
                            setSelectedDate(d);
                            setEditing({ date: d.toISOString().slice(0,10) });
                            setDrawerOpen(true);
                          }}
                          style={{ height: "100%", width: '100%' }}
                        />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3} style={{ height: '100%' }}>
                      <div className="right-aside" style={{ height: '100%', overflowY: 'visible' }}>
                        <div className="aside-top-actions">
                          <button className="aside-action" onClick={() => { setEditing(null); setDrawerOpen(true); }}>
                            Novo Lead
                          </button>
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
                            <Typography className="aside-title" variant="body2">Lead</Typography>
                          </div>
                          {(() => {
                            const recent = [...visibleLeads].sort((a,b) => new Date(b.updatedAt||b.createdAt||b.date||0) - new Date(a.updatedAt||a.createdAt||a.date||0))[0];
                            return (
                          <div className="activity-item">
                                <div className="activity-icon"><BusinessCenterIcon style={{ fontSize: 18 }} /></div>
                                <div className="activity-info">
                                  <div className="activity-title">{recent?.name || "—"}</div>
                                  <div className="activity-sub">{recent?.companyName || recent?.contact?.name || "Sem empresa"}</div>
                                </div>
                                <div className="activity-time">{recent ? moment(recent.updatedAt || recent.createdAt || recent.date).format("HH:mm") : "—"}</div>
                              </div>
                            );
                          })()}
                          <div className="donut-center" style={{ position: "static", transform: "none", textAlign: "left" }}>
                            <div className="donut-total" style={{ fontSize: 24 }}>{total}</div>
                            <div className="donut-label">Total</div>
                            <div className="donut-label">Convertidos: {ganho}</div>
                          </div>
                        </Paper>
                      </div>
                    </Grid>
                  </Grid>
                </div>
              );
            })()}
            {viewMode === "board" && (
              <div ref={kanbanRef} className={classes.fixedContent} style={{ height: '100%' }}>
                <LeadsKanbanBoard
                  columns={currentColumns}
                  leads={visibleLeads}
                  contacts={contactsList}
                  onEdit={(lead) => { setEditing(lead); setDrawerOpen(true); }}
                  onOpenTagCreator={openTagCreator}
                  onOpenPipelineConfig={() => setPipelineDrawerOpen(true)}
                  onAdd={(statusKey) => {
                    setEditing({ status: statusKey });
                    setDrawerOpen(true);
                  }}
                  onMove={async (leadId, sourceCol, destCol) => {
                    if (sourceCol === destCol) return;
                    const id = Number(leadId);
                    const newStatus = destCol;
                    setLeadsState(prev => prev.map(l => Number(l.id) === id ? { ...l, status: newStatus } : l));
                    try {
                      await leadsSalesService.update(id, { status: newStatus });
                    } catch (err) {
                      toastError(err);
                      setLeadsState(prev => prev.map(l => Number(l.id) === id ? { ...l, status: sourceCol } : l));
                    }
                  }}
                  onDelete={async (lead) => {
                    const id = Number(lead.id);
                    try {
                      // Marca como perdido em vez de excluir
                      await leadsSalesService.update(id, { status: "perdido" });
                      // Remove do quadro (status 'perdido' não aparece no Kanban)
                      setLeadsState(prev => prev.filter(l => Number(l.id) !== id));
                      toast.success("Lead marcado como perdido.");
                    } catch (err) {
                      toastError(err);
                    }
                  }}
                />
              </div>
            )}
          </>
        )}
      </ActivitiesStyleLayout>
      {/* calendário renderizado dentro do ActivitiesStyleLayout para evitar espaçamento extra */}
      {false && (() => {
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
        const events = (leadsState || []).map((l) => {
          const when = l.nextFollowUpAt || l.date || l.createdAt || l.updatedAt || Date.now();
          return {
            title: l.name || l.companyName || `Lead ${l.id}`,
            start: new Date(when),
            end: new Date(when),
            allDay: true,
            resource: l
          };
        });
        const eventPropGetter = (evt) => {
          const st = String(evt?.resource?.status || "").toLowerCase();
          let backgroundColor = "#2563eb";
          if (st.includes("won") || st.includes("converted") || st.includes("fechado")) backgroundColor = "#10B981";
          if (st.includes("lost") || st.includes("perdido")) backgroundColor = "#EF4444";
          return { style: { backgroundColor, color: "#0f172a", borderRadius: 10, border: `1px solid ${backgroundColor}`, padding: "6px 8px", fontSize: 12 } };
        };
        const total = leadsState.length;
        const ganho = leadsState.filter(l => /(won|converted|fechado)/i.test(String(l.status || ""))).length;
        return null;
      })()}
      <Popover
        open={Boolean(tagAnchor)}
        anchorEl={tagAnchor}
        onClose={closeTagCreator}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <div style={{ padding: 10, width: 220 }}>
          <Typography variant="caption" style={{ color: "#374151" }}>
            Criar tag
          </Typography>
          <TextField
            autoFocus
            size="small"
            fullWidth
            variant="outlined"
            placeholder="Ex.: Cliente VIP"
            value={tagText}
            onChange={(e) => setTagText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddTag(); }}
            style={{ marginTop: 6 }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <Button size="small" onClick={closeTagCreator}>Cancelar</Button>
            <Button size="small" color="primary" variant="contained" onClick={handleAddTag}>
              Adicionar
            </Button>
          </div>
        </div>
      </Popover>

      <CreateLeadSaleModal
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        lead={editing}
        pipelineId={selectedPipelineId}
        columns={currentColumns}
        onSave={(saved) => {
          setLeadsState((prev) => {
            const id = Number(saved.id);
            const exists = prev.some(p => Number(p.id) === id);
            return exists ? prev.map(p => Number(p.id) === id ? saved : p) : [saved, ...prev];
          });
          setEditing(null);
        }}
      />

      <PipelineDrawer
        open={pipelineDrawerOpen}
        onClose={() => setPipelineDrawerOpen(false)}
        title="Configurar Pipelines"
        pipelines={pipelines}
        selectedId={selectedPipelineId}
        onSave={(pipes, selId) => {
          // Otimista: aplica e fecha imediatamente
          setPipelines(pipes);
          if (selId) setSelectedPipelineId(selId);
          else if (pipes?.length) setSelectedPipelineId(pipes[0].id);
          setPipelineDrawerOpen(false);
          // Salva em background
          leadPipelinesService.bulkSave(pipes)
            .then((saved) => {
              setPipelines(saved);
            })
            .catch((err) => {
              toastError(err);
            });
        }}
      />
    </>
  );
};

export default LeadsSales;
