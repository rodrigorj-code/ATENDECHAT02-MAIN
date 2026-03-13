import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Avatar
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Close as CloseIcon, Edit as EditIcon, DeleteOutline as DeleteIcon } from '@material-ui/icons';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import { AuthContext } from '../../context/Auth/AuthContext';
import { getBackendUrl } from '../../config';

const useStyles = makeStyles((theme) => ({
  drawerPaper: {
    width: 420,
    maxWidth: '100%',
    padding: theme.spacing(2),
    borderRadius: 16,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    height: 'calc(100% - 32px)',
    marginRight: theme.spacing(2),
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    borderBottom: '1px solid #eee',
    paddingBottom: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  closeButton: {
    
  },
  contentScroll: {
    overflowY: 'auto',
    flex: 1,
    paddingRight: theme.spacing(1),
    '&::-webkit-scrollbar': {
        width: '6px',
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: '3px',
    },
    display: 'flex',
    flexDirection: 'column'
  },
  sectionTitle: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: '#111827',
    margin: theme.spacing(2, 0, 1)
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  infoCardPurple: {
    backgroundColor: '#F5F3FF',
    color: '#4C1D95',
    padding: theme.spacing(2),
    borderRadius: 12,
    minHeight: 96
  },
  infoCardOrange: {
    backgroundColor: '#FFF7ED',
    color: '#9A3412',
    padding: theme.spacing(2),
    borderRadius: 12,
    minHeight: 96
  },
  label: {
    fontSize: '0.75rem',
    color: '#6B7280',
    marginBottom: 2
  },
  value: {
    fontSize: '0.95rem',
    color: '#111827'
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2)
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing(2)
  }
}));

const ActivityDetailsModal = ({ open, onClose, activity, onDelete, onEdit, users = [], stages }) => {
  const classes = useStyles();
  const { user: authUser } = useContext(AuthContext) || {};
  const backendUrl = getBackendUrl && getBackendUrl();
  const [projectName, setProjectName] = useState("");

  const progress = useMemo(() => {
    const fallbackStages = [
      { key: 'backlog', label: 'Backlog' },
      { key: 'pending', label: 'Pendente' },
      { key: 'in_progress', label: 'Em Progresso' },
      { key: 'completed', label: 'Concluído' }
    ];
    const list = Array.isArray(stages) && stages.length >= 2 ? stages : fallbackStages;
    const normalize = (s) => {
      const v = String(s || '').toLowerCase();
      if (['in_progress','em progresso','active','ativo'].includes(v)) return 'in_progress';
      if (['pending','pendente'].includes(v)) return 'pending';
      if (['completed','concluído','concluido'].includes(v)) return 'completed';
      if (['archived','arquivado'].includes(v)) return 'archived';
      return 'backlog';
    };
    const ids = list.map(st => st.key || st.id || st.status || String(st).toLowerCase());
    const cur = normalize(activity?.status);
    const idx = Math.max(0, ids.findIndex(x => String(x).toLowerCase() === cur));
    const denom = Math.max(1, ids.length - 1);
    return Math.round((idx / denom) * 100);
  }, [activity?.status, stages]);

  const formatDate = (value) => {
    if (!value) return '—';
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return String(value);
      const monthsPt = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
      const dd = String(d.getDate()).padStart(2, '0');
      const monthName = monthsPt[d.getMonth()] || '';
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      return `${dd} de ${monthName} de ${yyyy}; ${hh}:${mi}`;
    } catch {
      return String(value);
    }
  };

  const mapType = (t) => {
    const v = String(t || '').toLowerCase();
    if (v === 'task') return 'Tarefa';
    if (v === 'call') return 'Ligação';
    if (v === 'email') return 'E-mail';
    if (v === 'meeting') return 'Reunião';
    return t || '—';
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

  const responsibleUser = resolveUserById(activity?.userId);
  const creatorUser = resolveUserById(activity?.createdById || activity?.creatorId) || authUser || null;
  const responsibleName = (responsibleUser && (responsibleUser.name || responsibleUser.fullName || responsibleUser.email)) || '';
  const creatorName = creatorUser ? (creatorUser.name || creatorUser.fullName || creatorUser.email) : '—';
  // Empresa/Cliente removido do modal a pedido do usuário

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ className: classes.drawerPaper }}
      ModalProps={{ keepMounted: true }}
    >
      <Box className={classes.header}>
        <IconButton onClick={onClose} size="small" className={classes.closeButton}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6">Detalhes da Atividade</Typography>
        <div style={{ width: 30 }} /> {/* Spacer to keep title centered if needed, or just empty */}
      </Box>

      <div className={classes.contentScroll}>
      <Box mb={2}>
        <Typography variant="caption" className={classes.label}>Título</Typography>
        <Typography variant="body1" className={classes.value}>{activity?.title || 'Sem título'}</Typography>
      </Box>
      <Box mb={2}>
        <Typography variant="caption" className={classes.label}>Pessoas Atribuídas</Typography>
        <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
          {responsibleUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#EEF2FF', padding: '6px 10px', borderRadius: 10 }}>
              <Avatar src={avatarSrcForUser(responsibleUser)} style={{ width: 24, height: 24 }}>
                {responsibleName ? String(responsibleName).charAt(0).toUpperCase() : 'R'}
              </Avatar>
              <div>
                <Typography variant="caption" style={{ color: '#1D4ED8', fontWeight: 600 }}>RESPONSÁVEL</Typography>
                <Typography variant="caption" style={{ display: 'block', color: '#111827' }}>{responsibleName}</Typography>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ECFDF5', padding: '6px 10px', borderRadius: 10 }}>
            <Avatar src={avatarSrcForUser(creatorUser)} style={{ width: 24, height: 24 }}>
              {creatorName ? String(creatorName).charAt(0).toUpperCase() : 'C'}
            </Avatar>
            <div>
              <Typography variant="caption" style={{ color: '#047857', fontWeight: 600 }}>CRIADO POR</Typography>
              <Typography variant="caption" style={{ display: 'block', color: '#111827' }}>{creatorName}</Typography>
            </div>
          </div>
        </div>
      </Box>
      <Box mb={2}>
        <Typography variant="caption" className={classes.label}>Descrição</Typography>
        <Paper elevation={0} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', padding: 12, borderRadius: 10, marginTop: 6 }}>
          <Typography variant="body2" style={{ color: '#374151' }}>
            {activity?.description || 'Sem descrição'}
          </Typography>
        </Paper>
      </Box>

      <Divider />

      <Typography className={classes.sectionTitle}>Informações da Atividade</Typography>
      <div className={classes.infoRow}>
        <Paper className={classes.infoCardOrange} elevation={0}>
          <Typography variant="overline" style={{ opacity: 0.9, marginBottom: 6 }}>PROJETO VINCULADO</Typography>
          {(() => {
            const p = activity?.project;
            const labelFromObj = p && typeof p === 'object' ? (p.name || p.title || '') : '';
            const label = activity?.projectName || labelFromObj || projectName || '';
            return (
              <Typography variant="subtitle2">
                {label || (activity?.projectId ? `Projeto #${activity.projectId}` : '—')}
              </Typography>
            );
          })()}
        </Paper>
      </div>
      

      <Box mb={1}>
        <Typography variant="caption" className={classes.label}>Tipo de Atividade</Typography>
        <Typography variant="body2" className={classes.value}>{mapType(activity?.type)}</Typography>
      </Box>
      <Box mb={1}>
        <Typography variant="caption" className={classes.label}>Prazo</Typography>
        <Typography variant="body2" className={classes.value}>{formatDate(activity?.date)}</Typography>
      </Box>
      <Box className={classes.progressRow} mb={2}>
        <Typography variant="caption" className={classes.label} style={{ minWidth: 76 }}>Progresso</Typography>
        <Box flex={1}>
          <LinearProgress variant="determinate" value={progress} style={{ height: 6, borderRadius: 6 }} />
        </Box>
        <Typography variant="caption">{progress}%</Typography>
      </Box>

      <Divider />
      <Typography className={classes.sectionTitle}>Informações do Sistema</Typography>
      <Box mb={1}>
        <Typography variant="caption" className={classes.label}>Criado em</Typography>
        <Typography variant="body2" className={classes.value}>{formatDate(activity?.createdAt || activity?.date)}</Typography>
      </Box>
      </div>

      <div className={classes.footer}>
        <IconButton 
          size="small" 
          style={{ color: '#0D47A1' }}
          onClick={() => onEdit && onEdit(activity)}
        >
           <EditOutlinedIcon />
        </IconButton>
        <IconButton
          title="Excluir"
          color="secondary"
          size="small"
          onClick={() => onDelete && onDelete(activity)}
        >
          <DeleteIcon />
        </IconButton>
      </div>
    </Drawer>
  );
};

export default ActivityDetailsModal;
