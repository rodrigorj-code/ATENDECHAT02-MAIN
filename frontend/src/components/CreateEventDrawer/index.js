import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  CircularProgress
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import { Close as CloseIcon } from '@material-ui/icons';
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import activitiesService from "../../services/activitiesService";
import api from "../../services/api";

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
  },
  colorSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1)
  },
  colorDots: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(1)
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    border: '2px solid transparent',
    cursor: 'pointer',
    outline: 'none',
    padding: 0,
    backgroundColor: 'transparent'
  },
  colorDotSelected: {
    boxShadow: '0 0 0 2px rgba(0,0,0,0.08)'
  }
}));

const CreateEventDrawer = ({ open, onClose, onSave, initialDate }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    datetime: "",
    color: "#D1FAE5",
    responsible: "",
    responsibleId: null,
    location: "",
    address: "",
    phone: "",
    link: ""
  });

  const toInputDateTimeLocal = (dt) => {
    const d = new Date(dt || new Date());
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  useEffect(() => {
    if (open) {
      (async () => {
        try {
          const { data } = await api.get("/users", { params: { searchParam: "" } });
          setUsers(data?.users || []);
        } catch (err) {
          // ignore
        }
      })();
      setFormValues((prev) => ({
        ...prev,
        datetime: toInputDateTimeLocal(initialDate || new Date())
      }));
    }
  }, [open, initialDate]);

  const handleChange = (field) => (event) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSelectColor = (color) => {
    setFormValues((prev) => ({
      ...prev,
      color
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formValues.title || !formValues.datetime) {
      toast.error("Preencha título e data/hora do evento.");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        title: formValues.title,
        description: formValues.description,
        type: "event",
        date: new Date(formValues.datetime).toISOString(),
        status: "pending",
        owner: formValues.responsible,
        location: formValues.location,
        address: formValues.address,
        phone: formValues.phone,
        link: formValues.link,
        eventColor: formValues.color
      };
      const saved = await activitiesService.create(payload);
      toast.success("Evento criado com sucesso.");
      if (onSave) onSave({ ...payload, id: saved?.id || Math.random().toString(36).slice(2) });
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
        <Typography variant="h6">Novo Evento</Typography>
        <div style={{ width: 30 }} />
      </Box>
      <form onSubmit={handleSubmit} className={classes.formContainer}>
        <TextField
          label="Título do evento"
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
        <TextField
          label="Data e hora"
          type="datetime-local"
          value={formValues.datetime}
          onChange={handleChange("datetime")}
          InputLabelProps={{ shrink: true }}
          fullWidth
          variant="outlined"
          required
          size="small"
        />
        <div className={classes.colorSection}>
          <Typography variant="subtitle2">Cor do evento</Typography>
          <div className={classes.colorDots}>
            {["#D1FAE5", "#EDE9FE", "#FEF3C7", "#FEE2E2", "#DBEAFE", "#F3F4F6"].map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Cor ${c}`}
                onClick={() => handleSelectColor(c)}
                className={classes.colorDot + (formValues.color === c ? ` ${classes.colorDotSelected}` : "")}
                style={{
                  backgroundColor: c,
                  borderColor: formValues.color === c ? "#111" : "transparent"
                }}
              />
            ))}
          </div>
        </div>
        <Autocomplete
          options={users}
          getOptionLabel={(opt) => opt?.name || ""}
          value={users.find((u) => String(u.id) === String(formValues.responsibleId)) || null}
          onChange={(_, v) => {
            setFormValues((prev) => ({
              ...prev,
              responsibleId: v ? v.id : null,
              responsible: v ? v.name : ""
            }));
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Responsável"
              variant="outlined"
              size="small"
              placeholder="Selecione um usuário"
              fullWidth
            />
          )}
        />
        <TextField
          label="Local"
          value={formValues.location}
          onChange={handleChange("location")}
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Ex.: Sala de Reuniões A"
        />
        <TextField
          label="Endereço"
          value={formValues.address}
          onChange={handleChange("address")}
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Rua, número, cidade"
        />
        <TextField
          label="Telefone"
          value={formValues.phone}
          onChange={handleChange("phone")}
          fullWidth
          variant="outlined"
          size="small"
          placeholder="(xx) xxxxx-xxxx"
        />
        <TextField
          label="Link"
          value={formValues.link}
          onChange={handleChange("link")}
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Link da reunião (se houver)"
        />
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
            {loading ? <CircularProgress size={24} /> : "Salvar evento"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
};

export default CreateEventDrawer;

