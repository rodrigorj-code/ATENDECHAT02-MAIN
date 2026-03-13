import React, { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Grid,
  CircularProgress
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { makeStyles } from "@material-ui/core/styles";
import { Close as CloseIcon } from "@material-ui/icons";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
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
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderBottom: "1px solid #eee",
    paddingBottom: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  closeButton: {
    position: "absolute",
    left: 0
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    paddingTop: theme.spacing(1),
    overflowY: "auto",
    flex: 1,
    paddingRight: theme.spacing(1),
    "&::-webkit-scrollbar": {
      width: "6px"
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0,0,0,0.1)",
      borderRadius: "3px"
    }
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(1),
    marginTop: theme.spacing(3)
  }
}));

export default function LeadCompanyModal({ open, initialValues, onClose, onSave }) {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    sector: "",
    contactId: null,
    responsibleId: null,
    date: ""
  });

  useEffect(() => {
    setForm((prev) => ({ ...prev, ...(initialValues || {}) }));
  }, [initialValues, open]);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const { data } = await api.get("/contacts/list");
        setContacts(data || []);
        if (initialValues?.contactId) {
          const c = data.find((x) => x.id === initialValues.contactId);
          if (c) setSelectedContact(c);
        }
      } catch (err) {
        toastError(err);
      }
    };
    if (open) loadContacts();
  }, [open, initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave({
        ...form,
        contactId: selectedContact ? selectedContact.id : null
      });
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
        <Typography variant="h6">
          {initialValues?.id ? "Editar Empresa" : "Nova Empresa"}
        </Typography>
        <div style={{ width: 30 }} />
      </Box>

      <div className={classes.formContainer}>
        <TextField
          label="Nome"
          name="name"
          value={form.name}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          size="small"
        />

        <TextField
          label="Descrição"
          name="description"
          value={form.description}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          multiline
          rows={3}
          size="small"
        />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Telefone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Endereço"
              name="address"
              value={form.address}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Setor"
              name="sector"
              value={form.sector}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Data"
              name="date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.date || ""}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>

        <Autocomplete
          options={contacts}
          getOptionLabel={(option) => option.name || ""}
          value={selectedContact}
          onChange={(_, v) => setSelectedContact(v)}
          renderInput={(params) => (
            <TextField {...params} label="Contato" variant="outlined" size="small" />
          )}
        />

        <div className={classes.footer}>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={18} /> : "Salvar"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
