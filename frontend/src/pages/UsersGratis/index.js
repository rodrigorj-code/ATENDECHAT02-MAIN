import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Button,
  makeStyles,
  MenuItem,
  Grid,
  CircularProgress,
} from "@material-ui/core";
import { Redirect } from "react-router-dom";
import * as XLSX from "xlsx";
import { format, parseISO } from "date-fns";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";

const UFS = [
  "", "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const useStyles = makeStyles((theme) => ({
  root: { padding: theme.spacing(2) },
  paper: { padding: theme.spacing(2), marginBottom: theme.spacing(2) },
  filters: { marginBottom: theme.spacing(2) },
}));

/**
 * Colunas no padrão de importação de campanhas / lista de contatos (nome + telefone + e-mail).
 */
const campaignTemplateRows = (records) =>
  records.map((r) => ({
    nome: r.adminName || r.companyName || "",
    telefone: (r.adminPhone || r.companyPhone || "").replace(/\D/g, ""),
    email: r.adminEmail || r.companyEmail || "",
    empresa: r.companyName || "",
    cidade: r.cidade || "",
    uf: r.uf || "",
    documento: r.document || "",
    data_cadastro: r.createdAt ? format(parseISO(r.createdAt), "dd/MM/yyyy HH:mm") : "",
  }));

const UsersGratis = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [uf, setUf] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (uf) params.uf = uf;
      const { data } = await api.get("/users-gratis", { params });
      setRecords(data?.records || []);
    } catch (e) {
      toastError(e);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, uf]);

  useEffect(() => {
    if (user?.profile === "admin") load();
  }, [user?.profile, load]);

  const exportExcel = () => {
    const rows = campaignTemplateRows(records);
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contatos");
    XLSX.writeFile(wb, `cadastros-gratis-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    toast.success("Planilha gerada (formato nome / telefone / e-mail + extras).");
  };

  if (user?.profile !== "admin") {
    return <Redirect to="/" />;
  }

  return (
    <div className={classes.root}>
      <Typography variant="h5" gutterBottom>
        Usuários — cadastro grátis
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Organizações criadas pela rota pública de cadastro grátis (freemium), com filtros por período e UF.
      </Typography>

      <Paper className={classes.paper}>
        <Grid container spacing={2} className={classes.filters} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              label="Data inicial"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              variant="outlined"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              label="Data final"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              variant="outlined"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <TextField
              select
              label="Região (UF)"
              value={uf}
              onChange={(e) => setUf(e.target.value)}
              variant="outlined"
              fullWidth
            >
              {UFS.map((u) => (
                <MenuItem key={u || "all"} value={u}>
                  {u || "Todas"}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <Button variant="contained" color="primary" onClick={load} disabled={loading} style={{ marginRight: 8 }}>
              Filtrar
            </Button>
            <Button variant="outlined" onClick={exportExcel} disabled={!records.length}>
              Extrair Excel (campanhas)
            </Button>
          </Grid>
        </Grid>

        {loading ? (
          <CircularProgress size={32} />
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Empresa</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Cidade/UF</TableCell>
                <TableCell>Doc</TableCell>
                <TableCell>Cadastro</TableCell>
                <TableCell>Venc. trial</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.companyId}>
                  <TableCell>{r.companyName}</TableCell>
                  <TableCell>{r.adminName}</TableCell>
                  <TableCell>{r.adminEmail || r.companyEmail}</TableCell>
                  <TableCell>{r.adminPhone || r.companyPhone}</TableCell>
                  <TableCell>
                    {r.cidade}
                    {r.uf ? ` / ${r.uf}` : ""}
                  </TableCell>
                  <TableCell>{r.document}</TableCell>
                  <TableCell>
                    {r.createdAt ? format(parseISO(r.createdAt), "dd/MM/yyyy HH:mm") : "—"}
                  </TableCell>
                  <TableCell>{r.dueDate || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </div>
  );
};

export default UsersGratis;
