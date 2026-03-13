import React, { useEffect, useState } from "react";
import { Grid, FormControl, TextField, InputLabel, Select, MenuItem, Button, FormHelperText, Paper, Typography } from "@material-ui/core";
import { toast } from "react-toastify";
import smtpService from "../../services/smtpService";

export default function EmailSettings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState({
    smtpHost: "",
    smtpPort: 587,
    smtpUsername: "",
    smtpPassword: "",
    smtpEncryption: "tls",
    isDefault: true
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await smtpService.list();
      const rows = res?.items || [];
      setItems(rows);
      const def = rows.find(r => r.isDefault) || rows[0];
      if (def) {
        setCurrentId(def.id);
        setForm({
          smtpHost: def.smtpHost || "",
          smtpPort: def.smtpPort || 587,
          smtpUsername: def.smtpUsername || "",
          smtpPassword: "",
          smtpEncryption: def.smtpEncryption || "tls",
          isDefault: true
        });
      }
    } catch (e) {
      // ignore
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const save = async () => {
    setSaving(true);
    try {
      // Não enviar senha vazia para não apagar a senha existente
      const payload = { ...form };
      if (!payload.smtpPassword) {
        delete payload.smtpPassword;
      }
      if (currentId) {
        await smtpService.update(currentId, payload);
      } else {
        const created = await smtpService.create(payload);
        setCurrentId(created?.id || null);
      }
      toast.success("Configurações salvas e validadas.");
      await load();
    } catch (err) {
      toast.error("Falha ao salvar/validar. Verifique as credenciais SMTP.");
    }
    setSaving(false);
  };

  const test = async () => {
    setTesting(true);
    try {
      if (currentId) {
        const payload = { ...form, isDefault: true };
        if (!payload.smtpPassword) delete payload.smtpPassword;
        await smtpService.update(currentId, payload);
      } else {
        const payload = { ...form, isDefault: true };
        if (!payload.smtpPassword) delete payload.smtpPassword;
        await smtpService.create(payload);
      }
      toast.success("Conexão SMTP verificada com sucesso.");
    } catch (e) {
      toast.error("Falha na verificação SMTP.");
    }
    setTesting(false);
  };

  const remove = async (id) => {
    try {
      await smtpService.remove(id);
      toast.success("Removido");
      setCurrentId(null);
      setForm({
        smtpHost: "",
        smtpPort: 587,
        smtpUsername: "",
        smtpPassword: "",
        smtpEncryption: "tls",
        isDefault: true
      });
      await load();
    } catch (e) {
      toast.error("Erro ao remover");
    }
  };

  return (
    <Paper variant="outlined" style={{ padding: 16 }}>
      <Typography variant="h6" gutterBottom>Configurações de Email (SMTP)</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <TextField
              label="Servidor SMTP"
              value={form.smtpHost}
              onChange={(e) => onChange("smtpHost", e.target.value)}
              margin="dense"
              variant="outlined"
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <TextField
              label="Porta"
              value={form.smtpPort}
              onChange={(e) => onChange("smtpPort", Number(e.target.value))}
              type="number"
              margin="dense"
              variant="outlined"
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <TextField
              label="Email/Usuário"
              value={form.smtpUsername}
              onChange={(e) => onChange("smtpUsername", e.target.value)}
              margin="dense"
              variant="outlined"
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <TextField
              label="Senha/Token"
              value={form.smtpPassword}
              onChange={(e) => onChange("smtpPassword", e.target.value)}
              type="password"
              margin="dense"
              variant="outlined"
            />
            <FormHelperText>Não exibimos a senha atual por segurança.</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel id="encryption-label">Segurança</InputLabel>
            <Select
              labelId="encryption-label"
              value={form.smtpEncryption}
              onChange={(e) => onChange("smtpEncryption", e.target.value)}
              variant="outlined"
              margin="dense"
              label="Segurança"
            >
              <MenuItem value="ssl">SSL</MenuItem>
              <MenuItem value="tls">TLS</MenuItem>
              <MenuItem value="none">Nenhuma</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={9} />
        <Grid item xs={12} md={12} style={{ display: "flex", gap: 12 }}>
          <Button disabled={saving || loading} color="primary" variant="contained" onClick={save}>
            Salvar
          </Button>
          <Button disabled={testing || loading} variant="outlined" onClick={test}>
            Testar Conexão
          </Button>
          {currentId && (
            <Button disabled={loading} variant="outlined" color="secondary" onClick={() => remove(currentId)}>
              Remover
            </Button>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
