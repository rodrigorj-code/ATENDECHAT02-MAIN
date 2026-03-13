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
  CircularProgress
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import { Close as CloseIcon } from '@material-ui/icons';
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import activitiesService from "../../services/activitiesService";
import useProjects from "../../hooks/useProjects";
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

const CreateActivityModal = ({ open, onClose, onSave, activity }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const { projects } = useProjects({ searchParam: "", pageNumber: 1 });
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
    title: "",
    description: "",
    type: "task",
    date: "",
    status: "pending",
    responsible: "", // New field
    companyId: "", // New field
    projectId: "", // New field
    sector: "" // New field
  });

  useEffect(() => {
    if (open) {
      if (activity) {
        setFormValues({
          title: activity.title || "",
          description: activity.description || "",
          type: activity.type || "task",
          date: activity.date ? activity.date.split('T')[0] : "",
          status: activity.status || "pending",
          responsible: activity.userId || "",
          companyId: activity.companyId || "",
          projectId: activity.projectId || "",
          sector: activity.sector || ""
        });
      } else {
        setFormValues({
          title: "",
          description: "",
          type: "task",
          date: new Date().toISOString().split('T')[0], // Default to today
          status: "pending",
          responsible: "",
          companyId: "",
          projectId: "",
          sector: ""
        });
      }
    }
  }, [open, activity]);

  const handleChange = (field) => (event) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const titleTrim = String(formValues.title || "").trim();
    if (!titleTrim || !formValues.date) {
      toast.error("Preencha título e data da atividade.");
      return;
    }
    if (titleTrim.length < 3) {
      toast.error("O título deve ter pelo menos 3 caracteres.");
      return;
    }

    try {
      setLoading(true);
      const selectedUser = Array.isArray(activeUsers) ? activeUsers.find(u => String(u.id) === String(formValues.responsible)) : null;
      const selectedCompany = Array.isArray(companiesConverted)
        ? companiesConverted.find(c => String(c.id) === String(formValues.companyId))
        : null;
      const payloadBase = {
        title: titleTrim,
        description: formValues.description || undefined,
        type: formValues.type || "task",
        status: formValues.status || "pending",
        date: (() => {
          try {
            const d = new Date(formValues.date);
            if (!isNaN(d.getTime())) return d.toISOString();
          } catch {}
          return formValues.date;
        })(),
        owner: selectedUser ? (selectedUser.name || selectedUser.fullName || selectedUser.email || `Usuário ${selectedUser.id}`) : (formValues.owner || undefined),
        userId: selectedUser ? selectedUser.id : undefined
      };
      const payload = Object.fromEntries(Object.entries(payloadBase).filter(([_, v]) => v !== undefined && v !== ""));
      // Here you would call the service. For now, we simulate or call the prop.
      // Assuming onSave handles the API call or we do it here.
      // If we do it here:
      let savedActivity;
      if (activity && activity.id) {
        savedActivity = await activitiesService.update(activity.id, payload);
        toast.success("Atividade atualizada com sucesso.");
      } else {
        savedActivity = await activitiesService.create(payload);
        toast.success("Atividade criada com sucesso.");
      }
      
      // Enriquecer o objeto salvo com as informações de Empresa selecionada (não persistido no backend ainda)
      if (selectedCompany) {
        savedActivity = {
          ...savedActivity,
          companyId: selectedCompany.id,
          company: { id: selectedCompany.id, name: selectedCompany.name }
        };
      }
      
      if (onSave) onSave(savedActivity);
      
      onClose();
    } catch (err) {
      toastError(err);
      const status = err?.response?.status;
      if (!status || status >= 500) {
        toast.error("Erro ao salvar atividade. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadConverted = async () => {
      try {
        const data = await convertedLeadsService.list({ pageNumber: 1 });
        if (!mounted) return;
        setCompaniesConverted(Array.isArray(data?.leads) ? data.leads : []);
      } catch (err) {
        // fallback silencioso para não bloquear o modal
      }
    };
    loadConverted();
    return () => { mounted = false; };
  }, []);

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
        <Typography variant="h6">{activity ? "Editar Atividade" : "Nova Atividade"}</Typography>
        <div style={{ width: 30 }} />
      </Box>

      <form onSubmit={handleSubmit} className={classes.formContainer}>
        <TextField
          label="Título"
          value={formValues.title}
          onChange={handleChange("title")}
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

        <FormControl variant="outlined" fullWidth size="small">
          <InputLabel>Tipo</InputLabel>
          <Select
            value={formValues.type}
            onChange={handleChange("type")}
            label="Tipo"
          >
            <MenuItem value="task">Tarefa</MenuItem>
            <MenuItem value="call">Ligação</MenuItem>
            <MenuItem value="email">E-mail</MenuItem>
            <MenuItem value="meeting">Reunião</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Prazo"
          type="date"
          value={formValues.date}
          onChange={handleChange("date")}
          InputLabelProps={{ shrink: true }}
          fullWidth
          variant="outlined"
          required
          size="small"
        />
        
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

        <FormControl variant="outlined" fullWidth size="small">
          <InputLabel>Projeto</InputLabel>
          <Select
            value={formValues.projectId}
            onChange={handleChange("projectId")}
            label="Projeto"
          >
             <MenuItem value=""><em>Nenhum</em></MenuItem>
             {(projects || []).map(p => (
              <MenuItem key={p.id} value={p.id}>{p.name || p.title || `Projeto ${p.id}`}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
            label="Setor"
            value={formValues.sector}
            onChange={handleChange("sector")}
            fullWidth
            variant="outlined"
            size="small"
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

export default CreateActivityModal;
