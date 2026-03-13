import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import { Close as CloseIcon } from '@material-ui/icons';
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import projectsService from "../../services/projectsService";
import useActivities from "../../hooks/useActivities";
import useUsers from "../../hooks/useUsers";
import convertedLeadsService from "../../services/convertedLeadsService";

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
    justifyContent: 'center',
    position: 'relative',
    borderBottom: '1px solid #eee',
    paddingBottom: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  closeButton: {
    position: 'absolute',
    left: 0,
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    paddingTop: theme.spacing(1),
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
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
    marginTop: theme.spacing(3)
  }
}));

const CreateProjectModal = ({ open, onClose, onSave, project }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const { activities } = useActivities({ searchParam: "", pageNumber: 1 });
  const { users } = useUsers();
  const [companiesConverted, setCompaniesConverted] = useState([]);
  const activeUsers = Array.isArray(users) ? users.filter(u => {
    if (typeof u.isActive === "boolean") return u.isActive;
    if (typeof u.active === "boolean") return u.active;
    if (typeof u.disabled === "boolean") return !u.disabled;
    if (typeof u.status === "string") return ["active", "enabled"].includes(u.status.toLowerCase());
    return true;
  }) : [];
  
  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
    status: "active",
    companyId: "",
    responsible: "",
    activityIds: []
  });

  useEffect(() => {
    if (open) {
      if (project) {
        setFormValues({
          name: project.name || "",
          description: project.description || "",
          status: project.status || "active",
          companyId: project.companyId || "",
          responsible: (project.userId || (project.user && project.user.id)) || "",
          activityIds: project.activities ? project.activities.map(a => a.id) : []
        });
      } else {
        setFormValues({
          name: "",
          description: "",
          status: "active",
          companyId: "",
          responsible: "",
          activityIds: []
        });
      }
    }
  }, [open, project]);

  useEffect(() => {
    let mounted = true;
    const loadConverted = async () => {
      try {
        const data = await convertedLeadsService.list({ pageNumber: 1 });
        if (!mounted) return;
        setCompaniesConverted(Array.isArray(data?.leads) ? data.leads : []);
      } catch (err) {
        // falha silenciosa
      }
    };
    loadConverted();
    return () => { mounted = false; };
  }, []);

  const handleChange = (field) => (event) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formValues.name) {
      toast.error("Nome do projeto é obrigatório.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formValues,
        userId: formValues.responsible || null
      };
      delete payload.responsible;

      let savedProject;
      if (project && project.id) {
        savedProject = await projectsService.update(project.id, payload);
        toast.success("Projeto atualizado com sucesso.");
      } else {
        savedProject = await projectsService.create(payload);
        toast.success("Projeto criado com sucesso.");
      }
      
      if (onSave) onSave(savedProject);
      
      onClose();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

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
        <Typography variant="h6">{project ? "Editar Projeto" : "Novo Projeto"}</Typography>
        <div style={{ width: 30 }} />
      </Box>

      <form onSubmit={handleSubmit} className={classes.formContainer}>
        <TextField
          label="Nome do Projeto"
          value={formValues.name}
          onChange={handleChange("name")}
          fullWidth
          required
          variant="outlined"
          size="small"
        />

        <TextField
          label="Descrição"
          value={formValues.description}
          onChange={handleChange("description")}
          fullWidth
          multiline
          minRows={3}
          variant="outlined"
          size="small"
        />

        {/* Campo Status removido a pedido: status padrão permanece 'active' ou do próprio projeto em edição */}

        <FormControl variant="outlined" fullWidth size="small">
          <InputLabel>Atividades Vinculadas</InputLabel>
          <Select
            multiple
            value={formValues.activityIds}
            onChange={handleChange("activityIds")}
            label="Atividades Vinculadas"
            renderValue={(selected) => (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {selected.map((value) => {
                  const activity = activities.find(a => a.id === value);
                  return (
                    <Chip key={value} label={activity ? activity.title : value} size="small" />
                  );
                })}
              </div>
            )}
          >
            {activities.map((activity) => (
              <MenuItem key={activity.id} value={activity.id}>
                {activity.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Responsável com busca */}
        <Autocomplete
          options={activeUsers}
          getOptionLabel={(option) => option?.name || option?.fullName || option?.email || String(option?.id)}
          value={activeUsers.find(u => u.id === formValues.responsible) || null}
          onChange={(_, value) => setFormValues(prev => ({ ...prev, responsible: value ? value.id : "" }))}
          noOptionsText="Nenhum usuário encontrado"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Responsável"
              variant="outlined"
              size="small"
              placeholder="Selecione o responsável"
              fullWidth
            />
          )}
        />

        <Autocomplete
          options={companiesConverted}
          getOptionLabel={(option) => option?.name || String(option?.id)}
          value={companiesConverted.find(c => String(c.id) === String(formValues.companyId)) || null}
          onChange={(_, value) => setFormValues(prev => ({ ...prev, companyId: value ? value.id : "" }))}
          noOptionsText="Nenhuma empresa encontrada"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Empresa"
              variant="outlined"
              size="small"
              placeholder="Selecione a empresa (Leads Convertidos)"
              fullWidth
            />
          )}
        />

        <Box mt={2}>
           <Typography variant="caption" color="textSecondary">
             Data de Criação: {new Date().toLocaleDateString()}
           </Typography>
        </Box>

        <div className={classes.footer}>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Salvar"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
};

export default CreateProjectModal;
