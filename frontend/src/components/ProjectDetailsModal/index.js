import React from 'react';
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
  Chip
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Close as CloseIcon, Edit as EditIcon, DeleteOutline as DeleteIcon } from '@material-ui/icons';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';

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

const ProjectDetailsModal = ({ open, onClose, project, onDelete, onEdit, stages, users = [] }) => {
  const classes = useStyles();
  const progress = React.useMemo(() => {
    const list = Array.isArray(stages) && stages.length >= 2
      ? stages
      : [
          { id: 'backlog', title: 'Backlog' },
          { id: 'pending', title: 'Pendente' },
          { id: 'in_progress', title: 'Em Progresso' },
          { id: 'completed', title: 'Concluído' }
        ];
    const normalize = (s) => {
      const v = String(s || "").toLowerCase();
      if (['pending','pendente'].includes(v)) return 'pending';
      if (['in_progress','em progresso','active','ativo'].includes(v)) return 'in_progress';
      if (['completed','concluído','concluido'].includes(v)) return 'completed';
      if (['archived','arquivado'].includes(v)) return 'archived';
      return 'backlog';
    };
    const ids = list.map(st => st.id || st.key || st.status || String(st).toLowerCase());
    const current = normalize(project?.status);
    const idx = Math.max(0, ids.findIndex(x => String(x).toLowerCase() === current));
    const denom = Math.max(1, ids.length - 1);
    return Math.round((idx / denom) * 100);
  }, [project?.status, stages]);

  const resolveUserById = (id) => {
    if (!id || !Array.isArray(users)) return null;
    const uid = Number(id);
    return users.find(u => Number(u.id) === uid) || null;
  };
  const ownerUser = (project && project.user) || resolveUserById(project && project.userId);
  const ownerName = ownerUser
    ? (ownerUser.name || ownerUser.fullName || ownerUser.email)
    : (project && project.userId ? `Usuário #${project.userId}` : 'Sem responsável');

  if (!project) return null;

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
        <Typography variant="h6">Detalhes do Projeto</Typography>
        <div style={{ width: 30 }} />
      </Box>

      <div className={classes.contentScroll}>
      <Box mb={2}>
        <Typography variant="caption" className={classes.label}>Nome</Typography>
        <Typography variant="body1" className={classes.value}>{project.name || 'Sem nome'}</Typography>
      </Box>
      <Box mb={2}>
        <Typography variant="caption" className={classes.label}>Descrição</Typography>
        <Typography variant="body2" style={{ color: '#374151' }}>
          {project.description || 'Sem descrição'}
        </Typography>
      </Box>

      
      <div className={classes.infoRow}>
        <Paper className={classes.infoCardPurple} elevation={0}>
          <Typography variant="overline" style={{ opacity: 0.9 }}>RESPONSÁVEL</Typography>
          <Typography variant="subtitle2" style={{ marginTop: 6 }}>
            {ownerName}
          </Typography>
        </Paper>
      </div>

      <Typography className={classes.sectionTitle}>Atividades Vinculadas</Typography>
      <Paper elevation={0} style={{ backgroundColor: '#f9fafb', padding: 16, borderRadius: 12 }}>
          {project.activities && project.activities.length > 0 ? (
              <List dense disablePadding>
                {project.activities.map((activity) => (
                    <ListItem key={activity.id} disableGutters>
                        <ListItemText 
                            primary={activity.title} 
                            secondary={`Status: ${activity.status}`}
                        />
                    </ListItem>
                ))}
              </List>
          ) : (
              <Typography variant="body2" color="textSecondary">Nenhuma atividade vinculada.</Typography>
          )}
      </Paper>

      <Box className={classes.progressRow} my={2}>
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
        <Typography variant="body2" className={classes.value}>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '—'}</Typography>
      </Box>
      </div>

      <div className={classes.footer}>
        <IconButton 
          size="small" 
          style={{ color: '#0D47A1' }}
          onClick={() => onEdit && onEdit(project)}
        >
           <EditOutlinedIcon />
        </IconButton>
        <IconButton
          title="Excluir"
          color="secondary"
          size="small"
          onClick={() => onDelete && onDelete(project)}
        >
          <DeleteIcon />
        </IconButton>
      </div>
    </Drawer>
  );
};

export default ProjectDetailsModal;
