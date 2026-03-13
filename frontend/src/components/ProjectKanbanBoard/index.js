import React, { useContext, useRef, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Button,
  Tooltip
} from '@material-ui/core';
import { MoreVert as MoreVertIcon, Add as AddIcon, DeleteOutline as DeleteIcon, CalendarTodayOutlined as CalendarIcon, ChevronRightOutlined as ArrowIcon } from '@material-ui/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { AuthContext } from '../../context/Auth/AuthContext';
import { getBackendUrl } from '../../config';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: 'minmax(0, 1fr)',
    alignItems: 'flex-start',
    overflowX: 'auto',
    padding: theme.spacing(2),
    gap: theme.spacing(2),
    backgroundColor: 'transparent',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': {
      display: 'none'
    }
  },
  column: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 0,
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '100%',
  },
  columnHeaderRow: {
    margin: theme.spacing(1, 1, 0.5, 1),
    padding: theme.spacing(0.5, 0.5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 28
  },
  columnHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1)
  },
  columnDot: {
    width: 10,
    height: 10,
    borderRadius: '50%'
  },
  columnTitle: {
    fontSize: '0.85rem',
    fontWeight: 400,
    letterSpacing: '0.06em',
    color: '#6B7280',
    textTransform: 'uppercase',
    opacity: 1
  },
  countBadge: {
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
    fontWeight: 600
  },
  columnContent: {
    padding: theme.spacing(1),
    margin: theme.spacing(0.5, 1, 1, 1),
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 0,
    overflowY: 'auto',
    flex: 1,
    '&::-webkit-scrollbar': {
      width: 0,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'transparent',
      borderRadius: 0,
    },
  },
  card: {
    position: 'relative',
    margin: theme.spacing(0.75, 0.5),
    borderRadius: 8,
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 2px rgba(15,23,42,0.05)',
    cursor: 'pointer',
    minHeight: 96,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: '#fff',
    '&:hover': {
      boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
      '& $cardDeleteBtn': {
        opacity: 1,
        transform: 'scale(1)'
      }
    },
  },
  cardAccent: {
    height: 3,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  cardTitle: {
    fontWeight: 400,
    color: '#111827',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    marginBottom: theme.spacing(1),
  },
  cardMeta: {
    color: '#6B7280'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing(1),
  },
  cardFooterDot: {
    width: 8,
    height: 8,
    borderRadius: '50%'
  },
  cardDeleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    minWidth: 22,
    padding: 0,
    backgroundColor: '#ffffffEE',
    border: '1px solid #E5E7EB',
    borderRadius: 6,
    color: '#9CA3AF',
    opacity: 0,
    transform: 'scale(0.92)',
    transition: 'all 120ms ease',
    '&:hover': {
      backgroundColor: '#fff'
    }
  },
  addButton: {
    margin: theme.spacing(1, 1.5, 1.5),
    textTransform: 'none',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: '1px dashed #CBD5E1',
    color: '#6B7280',
    fontSize: '0.85rem',
    fontWeight: 500,
    borderRadius: 8,
    padding: theme.spacing(0.75, 0),
    minHeight: 36,
    '&:hover': {
      backgroundColor: '#F9FAFB'
    }
  }
}));

const withAlpha = (hex, alpha) => {
  const c = (hex || '').replace('#', '');
  if (c.length !== 6) return hex;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const ProjectKanbanBoard = ({ projects, columns: columnsProp, onProjectClick, onAdd, onMove, onDelete, users = [] }) => {
  const classes = useStyles();
  const { user: authUser } = useContext(AuthContext) || {};
  const backendUrl = getBackendUrl && getBackendUrl();
  const boardRef = useRef(null);
  const isPanningRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [colPx, setColPx] = useState(0);

  const columns = Array.isArray(columnsProp) && columnsProp.length
    ? columnsProp
    : [
        { id: 'backlog', title: 'Backlog', color: '#6b7280' },
        { id: 'pending', title: 'Pendente', color: '#f59e0b' },
        { id: 'in_progress', title: 'Em Progresso', color: '#2563eb' },
        { id: 'completed', title: 'Concluído', color: '#10B981' }
      ];

  // Função auxiliar para mapear status do backend para colunas
  const getColumnId = (status) => {
    const s = String(status || '').toLowerCase();
    if (['backlog'].includes(s)) return 'backlog';
    if (['pending', 'pendente'].includes(s)) return 'pending';
    if (['in_progress', 'em progresso', 'active', 'ativo'].includes(s)) return 'in_progress';
    if (['completed', 'concluído', 'concluido'].includes(s)) return 'completed';
    return 'backlog'; // Default fallback
  };

  const getProjectsByColumn = (columnId) => {
    return projects.filter(project => getColumnId(project.status) === columnId);
  };

  const resolveUserById = (id) => {
    if (!id || !Array.isArray(users)) return null;
    const uid = Number(id);
    return users.find(u => Number(u.id) === uid) || null;
  };

  const avatarSrcForUser = (u) => {
    if (!u) return undefined;
    const img = u.profileImage || u.avatar || u.picture || null;
    if (!img) return undefined;
    if (String(img).startsWith('http')) return img;
    const companyId = u.companyId || (authUser && authUser.companyId);
    if (!backendUrl || !companyId) return undefined;
    return `${backendUrl}/public/company${companyId}/user/${img}`;
  };

  const formatDate = (value) => {
    if (!value) return 'Sem data';
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return String(value);
      const monthsPtShort = ["jan.","fev.","mar.","abr.","mai.","jun.","jul.","ago.","set.","out.","nov.","dez."];
      const dd = String(d.getDate()).padStart(2, '0');
      const monthName = monthsPtShort[d.getMonth()] || '';
      const hh = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      return `${dd} de ${monthName}, ${hh}:${mi}`;
    } catch {
      return String(value);
    }
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    if (onMove) {
      const projectId = draggableId;
      onMove(projectId, source.droppableId, destination.droppableId, destination.index);
    }
  };

  useEffect(() => {
    const calc = () => {
      const el = boardRef.current;
      if (!el) return;
      const style = window.getComputedStyle(el);
      const paddingLeft = parseFloat(style.paddingLeft || '16') || 16;
      const paddingRight = parseFloat(style.paddingRight || '16') || 16;
      const gap = parseFloat(style.columnGap || style.gap || '16') || 16;
      const totalGap = gap * 3;
      const inner = el.clientWidth - paddingLeft - paddingRight - totalGap;
      const w = inner > 0 ? Math.floor(inner / 4) : 240;
      setColPx(w);
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (boardRef.current) ro.observe(boardRef.current);
    window.addEventListener('resize', calc);
    return () => {
      window.removeEventListener('resize', calc);
      ro.disconnect();
    };
  }, []);

  const onMouseDown = (e) => {
    if ((columns || []).length <= 4) return;
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
        className={classes.root}
        data-kanban-scroll="true"
        ref={boardRef}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        style={{
          gridTemplateColumns: colPx ? `repeat(4, ${colPx}px)` : undefined,
          gridAutoColumns: colPx ? `${colPx}px` : undefined,
          cursor: (columns || []).length > 4 ? (isPanningRef.current ? 'grabbing' : 'grab') : 'default',
          userSelect: isPanningRef.current ? 'none' : 'auto'
        }}
      >
        {columns.map((column) => (
          <div key={column.id} className={classes.column}>
            <div className={classes.columnHeaderRow}>
              <div className={classes.columnHeaderLeft}>
                <span className={classes.columnDot} style={{ backgroundColor: column.color }} />
                <Typography className={classes.columnTitle}>{column.title}</Typography>
              </div>
              <span
                className={classes.countBadge}
                style={{ backgroundColor: withAlpha(column.color, 0.16), color: column.color }}
              >
                {getProjectsByColumn(column.id).length}
              </span>
            </div>
            <Droppable droppableId={column.id}>
              {(provided) => (
                <div
                  className={classes.columnContent}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {getProjectsByColumn(column.id).map((project, index) => (
                    <Draggable draggableId={String(project.id)} index={index} key={project.id}>
                      {(providedDraggable) => (
                        <Card
                          ref={providedDraggable.innerRef}
                          {...providedDraggable.draggableProps}
                          {...providedDraggable.dragHandleProps}
                          className={classes.card}
                          onClick={() => onProjectClick && onProjectClick(project)}
                        >
                          {onDelete && (
                            <IconButton
                              className={classes.cardDeleteBtn}
                              size="small"
                              aria-label="Excluir projeto"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(project);
                              }}
                            >
                              <DeleteIcon style={{ fontSize: 14 }} />
                            </IconButton>
                          )}
                          <div className={classes.cardAccent} style={{ backgroundColor: column.color }} />
                          <CardContent style={{ padding: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 4 }}>
                              <Typography variant="body2" className={classes.cardTitle} style={{ margin: 0 }}>
                                {project.name || "Sem nome"}
                              </Typography>
                              <Tooltip
                                title={(project.company && (project.company.name || project.company.title)) || (project.companyId ? `Empresa #${project.companyId}` : 'Sem empresa')}
                                placement="top"
                                arrow
                              >
                                <ArrowIcon style={{ fontSize: 14, color: '#0D47A1', opacity: 0.9, cursor: 'default' }} />
                              </Tooltip>
                            </div>

                            {(() => {
                              const responsibleId = project.userId || (project.user && project.user.id) || null;
                              const responsibleUser = resolveUserById(responsibleId);
                              if (!responsibleUser) return null;
                              const ownerName = responsibleUser.name || responsibleUser.fullName || responsibleUser.email;
                              const initials = String(ownerName).split(" ").slice(0,2).map(p => p[0]).join("").toUpperCase();
                              const src = avatarSrcForUser(responsibleUser);
                              return (
                                <>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <Avatar src={src} style={{ width: 22, height: 22, fontSize: 11, background: '#E5E7EB', color: '#111827' }}>
                                        {!src && initials}
                                      </Avatar>
                                      <Typography variant="caption" className={classes.cardMeta} style={{ fontSize: 12 }}>
                                        {ownerName}
                                      </Typography>
                                    </div>
                                  </div>
                                  <div style={{ height: 1, background: '#E5E7EB', opacity: 0.8, margin: '6px 0' }} />
                                </>
                              );
                            })()}

                            <Typography variant="caption" className={classes.cardMeta} display="block">
                              {project.description ? (project.description.length > 38 ? project.description.substring(0, 38) + '...' : project.description) : "Sem descrição"}
                            </Typography>

                            <div className={classes.cardFooter}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <CalendarIcon style={{ fontSize: 12, color: '#6B7280' }} />
                                <Typography variant="caption" className={classes.cardMeta}>
                                  {formatDate(project.createdAt || project.deadlineAt)}
                                </Typography>
                              </div>
                              {(() => {
                                const avatarUser = resolveUserById(project.createdById || project.creatorId || project.userId) || authUser || null;
                                const src = avatarSrcForUser(avatarUser);
                                const initials = avatarUser && (avatarUser.name || avatarUser.fullName || avatarUser.email)
                                  ? String(avatarUser.name || avatarUser.fullName || avatarUser.email).charAt(0).toUpperCase()
                                  : 'U';
                                return (
                                  <Avatar src={src} style={{ width: 18, height: 18 }}>
                                    {!src && initials}
                                  </Avatar>
                                );
                              })()}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {onAdd && (
                    <Button
                      fullWidth
                      size="small"
                      variant="text"
                      className={classes.addButton}
                      startIcon={<AddIcon />}
                      onClick={() => onAdd(column.id)}
                    >
                      Adicionar Projeto
                    </Button>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default ProjectKanbanBoard;
