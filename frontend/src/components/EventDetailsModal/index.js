import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  TextField
} from "@material-ui/core";
import moment from "moment";
import activitiesService from "../../services/activitiesService";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";

const EventDetailsModal = ({
  open,
  onClose,
  event,
  onEditSchedule,
  onDeleteSchedule,
  onActivityUpdated,
  onActivityDeleted
}) => {
  const hasEvent = Boolean(event);
  const res = (event && (event.resource || event)) || {};
  const isActivityEvent = !!res.date || !!res.type || res?.kind === "activity-event";
  const kind = res?.kind || (isActivityEvent ? "activity-event" : "schedule");
  const when = isActivityEvent ? res.date : res.sendAt;
  const title = res.title || res?.contact?.name || "Evento";
  const description = res.description || res.body || "Sem descrição";

  const toInputDateTimeLocal = (dt) => {
    if (!dt) return "";
    const d = new Date(dt);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => ({
    title: title || "",
    description: res.description || "",
    datetime: toInputDateTimeLocal(when),
    location: res.location || "",
    address: res.address || "",
    phone: res.phone || "",
    link: res.link || "",
  }));

  const canEditInline = isActivityEvent; // schedules usam ScheduleModal do pai

  const handleField = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSave = async () => {
    if (!isActivityEvent) return;
    try {
      setSaving(true);
      const payload = {
        title: form.title,
        description: form.description,
        date: new Date(form.datetime).toISOString(),
        location: form.location,
        address: form.address,
        phone: form.phone,
        link: form.link
      };
      const updated = await activitiesService.update(res.id, payload);
      toast.success("Evento atualizado com sucesso.");
      onActivityUpdated && onActivityUpdated({ ...(res || {}), ...(updated || payload), id: res.id });
      setEditMode(false);
      onClose && onClose();
    } catch (err) {
      toastError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isActivityEvent) {
      try {
        if (!window.confirm("Excluir este evento? Esta ação não pode ser desfeita.")) return;
        await activitiesService.delete(res.id);
        toast.success("Evento excluído.");
        onActivityDeleted && onActivityDeleted(res.id);
        onClose && onClose();
      } catch (err) {
        toastError(err);
      }
    } else {
      if (onDeleteSchedule) {
        onDeleteSchedule(res.id);
        onClose && onClose();
      }
    }
  };

  return (
    hasEvent ? (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Detalhes do Evento</DialogTitle>
      <DialogContent dividers>
        {!editMode && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">Título</Typography>
              <Typography variant="body1">{title}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">Quando</Typography>
              <Typography variant="body1">
                {when ? moment(when).format("DD/MM/YYYY HH:mm") : "Sem data"}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">Descrição</Typography>
              <Typography variant="body1">{description}</Typography>
            </Grid>
            {res.responsible && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Responsável</Typography>
                <Typography variant="body1">{res.responsible}</Typography>
              </Grid>
            )}
            {res.location && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Local</Typography>
                <Typography variant="body1">{res.location}</Typography>
              </Grid>
            )}
            {res.address && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Endereço</Typography>
                <Typography variant="body1">{res.address}</Typography>
              </Grid>
            )}
            {res.phone && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Telefone</Typography>
                <Typography variant="body1">{res.phone}</Typography>
              </Grid>
            )}
            {res.link && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Link</Typography>
                <Typography variant="body1">
                  <a href={res.link} target="_blank" rel="noreferrer">{res.link}</a>
                </Typography>
              </Grid>
            )}
          </Grid>
        )}

        {editMode && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Título"
                value={form.title}
                onChange={handleField("title")}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Data e hora"
                type="datetime-local"
                value={form.datetime}
                onChange={handleField("datetime")}
                InputLabelProps={{ shrink: true }}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descrição"
                value={form.description}
                onChange={handleField("description")}
                fullWidth
                multiline
                minRows={3}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Local"
                value={form.location}
                onChange={handleField("location")}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Endereço"
                value={form.address}
                onChange={handleField("address")}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Telefone"
                value={form.phone}
                onChange={handleField("phone")}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Link"
                value={form.link}
                onChange={handleField("link")}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        {!editMode && (
          <>
            {kind === "schedule" ? (
              <Button
                onClick={() => {
                  onEditSchedule && onEditSchedule(res);
                  onClose && onClose();
                }}
                color="primary"
                variant="outlined"
              >
                Editar
              </Button>
            ) : (
              canEditInline && (
                <Button onClick={() => setEditMode(true)} color="primary" variant="outlined">
                  Editar
                </Button>
              )
            )}
            <Button onClick={handleDelete} color="secondary">
              Excluir
            </Button>
            <Button onClick={onClose}>Fechar</Button>
          </>
        )}
        {editMode && (
          <>
            <Button onClick={() => setEditMode(false)}>Cancelar</Button>
            <Button onClick={handleSave} color="primary" variant="contained" disabled={saving}>
              Salvar
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
    ) : null
  );
};

export default EventDetailsModal;
