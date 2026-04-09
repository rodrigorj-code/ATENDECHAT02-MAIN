import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  makeStyles,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Select,
  Button,
} from "@material-ui/core";
import * as XLSX from "xlsx";
import { Formik, Form, Field } from "formik";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";

import { Edit as EditIcon } from "@material-ui/icons";

import { toast } from "react-toastify";
import useCompanies from "../../hooks/useCompanies";
import usePlans from "../../hooks/usePlans";
import ModalUsers from "../ModalUsers";
import ModalCompany from "../ModalCompany";
import api from "../../services/api";
import { head, isArray, has } from "lodash";
import { useDate } from "../../hooks/useDate";
import ColorModeContext from "../../layout/themeContext";

import moment from "moment";
import { i18n } from "../../translate/i18n";
import { useTheme } from "@material-ui/core/styles";
import { Delete as DeleteIcon, PersonAdd as PersonAddIcon } from "@material-ui/icons";

const UFS = [
  "",
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO"
];

const campaignTemplateRows = (records) =>
  records.map((r) => {
    const meta = r.signupMetadata || {};
    const addr = meta.address || {};
    const contacts = meta.contacts || {};
    const legal = contacts.legal || {};
    return {
      nome: legal.name || r.name || "",
      telefone: String(r.phone || legal.phone || "").replace(/\D/g, ""),
      email: r.email || legal.email || "",
      empresa: r.name || "",
      cidade: addr.cidade || "",
      uf: addr.uf || "",
      documento: r.document || "",
      data_cadastro: r.createdAt ? moment(r.createdAt).format("DD/MM/YYYY HH:mm") : "",
      recorrencia: r.recurrence || ""
    };
  });

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    padding: "2px"
  },
  mainPaper: {
    width: "100%",
    flex: 1,
    // padding: theme.spacing(2), //comentado para retirar o scroll do Empresas
  },
  fullWidth: {
    width: "100%",
  },
  tableContainer: {
    width: "100%",
    // overflowX: "scroll",
    // ...theme.scrollbarStyles,
    padding: "2px",
  },
  textfield: {
    width: "100%",
  },
  textRight: {
    textAlign: "right",
  },
  row: {
    // paddingTop: theme.spacing(2),
    // paddingBottom: theme.spacing(2),
  },
  control: {
    // paddingRight: theme.spacing(1),
    // paddingLeft: theme.spacing(1),
  },
  buttonContainer: {
    textAlign: "right",
    // padding: theme.spacing(1),
  },
}));

export function CompanyForm(props) {
  const { onSubmit, onDelete, onCancel, initialValue, loading } = props;
  const classes = useStyles();
  const [plans, setPlans] = useState([]);
  const [modalUser, setModalUser] = useState(false);
  const [firstUser, setFirstUser] = useState({});

  const [record, setRecord] = useState({
    name: "",
    email: "",
    phone: "",
    planId: "",
    status: true,
    // campaignsEnabled: false,
    dueDate: "",
    recurrence: "MENSAL",
    password: "",
    generateInvoice: true,
    ...initialValue,
  });

  const { list: listPlans } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const list = await listPlans();
      setPlans(list);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setRecord((prev) => {
      if (moment(initialValue).isValid()) {
        initialValue.dueDate = moment(initialValue.dueDate).format(
          "YYYY-MM-DD"
        );
      }
      return {
        ...prev,
        ...initialValue,
      };
    });
  }, [initialValue]);

  const handleSubmit = async (data) => {
    if (data.dueDate === "" || moment(data.dueDate).isValid() === false) {
      data.dueDate = null;
    }
    console.log("Dados do formulário:", data);
    onSubmit(data);
    setRecord({ ...initialValue, dueDate: "", generateInvoice: true });
  };

  const handleOpenModalUsers = async () => {
    try {
      const { data } = await api.get("/users/list", {
        params: {
          companyId: initialValue.id,
        },
      });
      if (isArray(data) && data.length) {
        setFirstUser(head(data));
      }
      setModalUser(true);
    } catch (e) {
      toast.error(e);
    }
  };

  const handleCloseModalUsers = () => {
    setFirstUser({});
    setModalUser(false);
  };

  const incrementDueDate = () => {
    const data = { ...record };
    if (data.dueDate !== "" && data.dueDate !== null) {
      switch (data.recurrence) {
        case "MENSAL":
          data.dueDate = moment(data.dueDate)
            .add(1, "month")
            .format("YYYY-MM-DD");
          break;
        case "BIMESTRAL":
          data.dueDate = moment(data.dueDate)
            .add(2, "month")
            .format("YYYY-MM-DD");
          break;
        case "TRIMESTRAL":
          data.dueDate = moment(data.dueDate)
            .add(3, "month")
            .format("YYYY-MM-DD");
          break;
        case "SEMESTRAL":
          data.dueDate = moment(data.dueDate)
            .add(6, "month")
            .format("YYYY-MM-DD");
          break;
        case "ANUAL":
          data.dueDate = moment(data.dueDate)
            .add(12, "month")
            .format("YYYY-MM-DD");
          break;
        default:
          break;
      }
    }
    setRecord(data);
  };

  return (
    <>
      <ModalUsers
        userId={firstUser.id}
        companyId={initialValue.id}
        open={modalUser}
        onClose={handleCloseModalUsers}
      />
      <Formik
        enableReinitialize
        className={classes.fullWidth}
        initialValues={record}
        onSubmit={(values, { resetForm }) =>
          setTimeout(() => {
            handleSubmit(values);
            resetForm();
          }, 500)
        }
      >
        {(values, setValues) => (
          <Form className={classes.fullWidth}>
            <Grid spacing={1} justifyContent="center" container>
              <Grid xs={12} sm={6} md={3} item>
                <Field
                  as={TextField}
                  label={i18n.t("compaies.table.name")}
                  name="name"
                  variant="outlined"
                  className={classes.fullWidth}
                  margin="dense"
                />
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <Field
                  as={TextField}
                  label={i18n.t("compaies.table.email")}
                  name="email"
                  variant="outlined"
                  className={classes.fullWidth}
                  margin="dense"
                  required
                />
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <Field
                  as={TextField}
                  label={i18n.t("compaies.table.password")}
                  name="password"
                  variant="outlined"
                  className={classes.fullWidth}
                  margin="dense"
                />
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <Field
                  as={TextField}
                  label={i18n.t("compaies.table.phone")}
                  name="phone"
                  variant="outlined"
                  className={classes.fullWidth}
                  margin="dense"
                />
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="plan-selection">{i18n.t("compaies.table.plan")}</InputLabel>
                  <Field
                    as={Select}
                    id="plan-selection"
                    label={i18n.t("compaies.table.plan")}
                    labelId="plan-selection-label"
                    name="planId"
                    margin="dense"
                    required
                  >
                    {plans.map((plan, key) => (
                      <MenuItem key={key} value={plan.id}>
                        {plan.name}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6} md={1} item>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="status-selection">{i18n.t("compaies.table.active")}</InputLabel>
                  <Field
                    as={Select}
                    id="status-selection"
                    label={i18n.t("compaies.table.active")}
                    labelId="status-selection-label"
                    name="status"
                    margin="dense"
                  >
                    <MenuItem value={true}>{i18n.t("compaies.table.yes")}</MenuItem>
                    <MenuItem value={false}>{i18n.t("compaies.table.no")}</MenuItem>
                  </Field>
                </FormControl>
              </Grid>              
              {/* <Grid xs={12} sm={6} md={3} item>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="payment-method-selection">
                    Método de Pagamento
                  </InputLabel>
                  <Field
                    as={Select}
                    id="payment-method-selection"
                    label="Método de Pagamento"
                    labelId="payment-method-selection-label"
                    name="paymentMethod"
                    margin="dense"
                  >
                    <MenuItem value={"pix"}>PIX</MenuItem>
                  </Field>
                </FormControl>
              </Grid> */}
              <Grid xs={12} sm={6} md={2} item>
                <Field
                  as={TextField}
                  label={i18n.t("compaies.table.document")}
                  name="document"
                  variant="outlined"
                  className={classes.fullWidth}
                  margin="dense"
                />
              </Grid>
              {/* <Grid xs={12} sm={6} md={2} item>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="status-selection">Campanhas</InputLabel>
                  <Field
                    as={Select}
                    id="campaigns-selection"
                    label="Campanhas"
                    labelId="campaigns-selection-label"
                    name="campaignsEnabled"
                    margin="dense"
                  >
                    <MenuItem value={true}>Habilitadas</MenuItem>
                    <MenuItem value={false}>Desabilitadas</MenuItem>
                  </Field>
                </FormControl>
              </Grid> */}
              <Grid xs={12} sm={6} md={2} item>
                <FormControl variant="outlined" fullWidth>
                  <Field
                    as={TextField}
                    label={i18n.t("compaies.table.dueDate")}
                    type="date"
                    name="dueDate"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    variant="outlined"
                    fullWidth
                    margin="dense"
                  />
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6} md={2} item>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="recorrencia-selection">
                  {i18n.t("compaies.table.recurrence")}
                  </InputLabel>
                  <Field
                    as={Select}
                    label="Recorrência"
                    labelId="recorrencia-selection-label"
                    id="recurrence"
                    name="recurrence"
                    margin="dense"
                  >
                    <MenuItem value="MENSAL">{i18n.t("compaies.table.monthly")}</MenuItem>
                    <MenuItem value="BIMESTRAL">{i18n.t("compaies.table.bimonthly")}</MenuItem>
                    <MenuItem value="TRIMESTRAL">{i18n.t("compaies.table.quarterly")}</MenuItem>
                    <MenuItem value="SEMESTRAL">{i18n.t("compaies.table.semester")}</MenuItem>
                    <MenuItem value="ANUAL">{i18n.t("compaies.table.yearly")}</MenuItem>
                  </Field>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={6} md={2} item>
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="generate-invoice-selection">
                    Gerar Fatura
                  </InputLabel>
                  <Field
                    as={Select}
                    id="generate-invoice-selection"
                    label="Gerar Fatura"
                    labelId="generate-invoice-selection-label"
                    name="generateInvoice"
                    margin="dense"
                  >
                    <MenuItem value={true}>Sim</MenuItem>
                    <MenuItem value={false}>Não</MenuItem>
                  </Field>
                </FormControl>
              </Grid>

              <Grid xs={12} item>
                <Grid justifyContent="flex-end" spacing={1} container>
                  <Grid xs={4} md={1} item>
                    <ButtonWithSpinner
                      className={classes.fullWidth}
                      style={{ marginTop: 7 }}
                      loading={loading}
                      onClick={() => onCancel()}
                      variant="contained"
                    >
                      {i18n.t("compaies.table.clear")}
                    </ButtonWithSpinner>
                  </Grid>
                  {record.id !== undefined ? (
                    <>
                      <Grid xs={6} md={1} item>
                        <ButtonWithSpinner
                          style={{ marginTop: 7 }}
                          className={classes.fullWidth}
                          loading={loading}
                          onClick={() => onDelete(record)}
                          variant="contained"
                          color="secondary"
                          disabled={record.id === 1}
                        >
                          {i18n.t("compaies.table.delete")}
                        </ButtonWithSpinner>
                      </Grid>
                      <Grid xs={6} md={2} item>
                        <ButtonWithSpinner
                          style={{ marginTop: 7 }}
                          className={classes.fullWidth}
                          loading={loading}
                          onClick={() => incrementDueDate()}
                          variant="contained"
                          color="primary"
                        >
                          {i18n.t("compaies.table.dueDate")}
                        </ButtonWithSpinner>
                      </Grid>
                      {/* <Grid xs={6} md={1} item>
                        <ButtonWithSpinner
                          style={{ marginTop: 7 }}
                          className={classes.fullWidth}
                          loading={loading}
                          onClick={() => handleOpenModalUsers()}
                          variant="contained"
                          color="primary"
                        >
                          {i18n.t("compaies.table.user")}
                        </ButtonWithSpinner>
                      </Grid> */}
                    </>
                  ) : null}
                  <Grid xs={6} md={1} item>
                    <ButtonWithSpinner
                      className={classes.fullWidth}
                      style={{ marginTop: 7 }}
                      loading={loading}
                      type="submit"
                      variant="contained"
                      color="primary"
                    >
                      {i18n.t("compaies.table.save")}
                    </ButtonWithSpinner>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </>
  );
}

export function CompaniesManagerGrid(props) {
  const { records, onSelect } = props;
  const classes = useStyles();
  const { dateToClient, datetimeToClient } = useDate();
  const { mode } = useContext(ColorModeContext);
  const theme = useTheme();

  const renderStatus = (row) => {
    return row.status === false ? "Não" : "Sim";
  };

  const renderPlan = (row) => {
    return row.planId !== null ? row.plan.name : "-";
  };

  const renderPlanValue = (row) => {
    return row.planId !== null ? row.plan.amount ? row.plan.amount.toLocaleString('pt-br', { minimumFractionDigits: 2 }) : '00.00' : "-";
  };

  const rowStyle = (record) => {
    if (moment(record.dueDate).isValid()) {
      const now = moment();
      const dueDate = moment(record.dueDate);
      const diff = dueDate.diff(now, "days");
      if (diff >= 1 && diff <= 5) {
        return { backgroundColor: "#fffead" };
      }
      if (diff <= 0) {
        return { backgroundColor: "#fa8c8c" };
      }
    }
    return {};
  };
  
  const cellStyle = (record) => {
    if (moment(record.dueDate).isValid()) {
      const now = moment();
      const dueDate = moment(record.dueDate);
      const diff = dueDate.diff(now, "days");
      if (diff >= 1 && diff <= 5) {
        return { color: "#000" }; // Texto preto para fundo amarelo
      }
      if (diff <= 0) {
        return { color: "#fff" }; // Texto branco para fundo vermelho
      }
    }
    return {};
  };

  const iconStyle = (record) => {
    if (moment(record.dueDate).isValid()) {
      const now = moment();
      const dueDate = moment(record.dueDate);
      const diff = dueDate.diff(now, "days");
      if (diff >= 1 && diff <= 5) {
        return { color: "#000" }; // Ícone preto para fundo amarelo
      }
    }
    return {};
  };

  return (
    <Paper className={classes.tableContainer}>
      <Table
        className={classes.fullWidth}
        // size="small"
        padding="none"
        aria-label="a dense table"
      >
        <TableHead>
          <TableRow>
            <TableCell align="center" style={{ width: "1%" }}>#</TableCell>
            <TableCell align="left">{i18n.t("compaies.table.name")}</TableCell>
            <TableCell align="left">{i18n.t("compaies.table.email")}</TableCell>
            <TableCell align="center">{i18n.t("compaies.table.phone")}</TableCell>
            <TableCell align="center">{i18n.t("compaies.table.plan")}</TableCell>
            <TableCell align="center">{i18n.t("compaies.table.value")}</TableCell>
            {/* <TableCell align="center">Campanhas</TableCell> */}
            <TableCell align="center">{i18n.t("compaies.table.active")}</TableCell>
            <TableCell align="center">{i18n.t("compaies.table.createdAt")}</TableCell>
            <TableCell align="center">{i18n.t("compaies.table.dueDate")}</TableCell>
            <TableCell align="center">{i18n.t("compaies.table.lastLogin")}</TableCell>
            <TableCell align="center">{i18n.t("compaies.table.generateInvoice")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((row, key) => (
            <TableRow style={rowStyle(row)} key={key} onClick={() => onSelect(row)} style={{ ...rowStyle(row), cursor: 'pointer' }}>
              <TableCell style={{...cellStyle(row), width: "1%"}} align="center">
                <IconButton style={iconStyle(row)} aria-label="edit">
                  <EditIcon style={iconStyle(row)} />
                </IconButton>
              </TableCell>
              <TableCell style={cellStyle(row)} align="left">{row.name || "-"}</TableCell>
              <TableCell style={cellStyle(row)} align="left" size="small">{row.email || "-"}</TableCell>
              <TableCell style={cellStyle(row)} align="center">{row.phone || "-"}</TableCell>
              <TableCell style={cellStyle(row)} align="center">{renderPlan(row)}</TableCell>
              <TableCell style={cellStyle(row)} align="center">{i18n.t("compaies.table.money")} {renderPlanValue(row)}</TableCell>
              {/* <TableCell style={cellStyle(row)} align="center">{renderCampaignsStatus(row)}</TableCell> */}
              <TableCell style={cellStyle(row)} align="center">{renderStatus(row)}</TableCell>
              <TableCell style={cellStyle(row)} align="center">{dateToClient(row.createdAt)}</TableCell>
              <TableCell style={cellStyle(row)} align="center">{dateToClient(row.dueDate)}<br /><span>{row.recurrence}</span></TableCell>
              <TableCell style={cellStyle(row)} align="center">{datetimeToClient(row.lastLogin)}</TableCell>
              <TableCell style={cellStyle(row)} align="center">{row.generateInvoice ? i18n.t("compaies.table.yes") : i18n.t("compaies.table.no")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default function CompaniesManager() {
  const classes = useStyles();
  const { list, save, update, remove } = useCompanies();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [natureFilter, setNatureFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [ufFilter, setUfFilter] = useState("");
  const [users, setUsers] = useState([]);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(undefined);
  const [record, setRecord] = useState({
    name: "",
    email: "",
    phone: "",
    planId: "",
    status: true,
    // campaignsEnabled: false,
    dueDate: "",
    recurrence: "MENSAL",
    password: "",
    document: "",
    paymentMethod: "",
    generateInvoice: true
  });

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (natureFilter && natureFilter !== "all") params.nature = natureFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (ufFilter) params.uf = ufFilter;
      const companyList = await list(params);
      setRecords(Array.isArray(companyList) ? companyList : []);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        (typeof e?.message === "string" ? e.message : null);
      toast.error(
        msg && String(msg).length < 220
          ? String(msg)
          : "Não foi possível carregar a lista de registros"
      );
    }
    setLoading(false);
  }, [list, natureFilter, dateFrom, dateTo, ufFilter]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    if (record?.id) {
      loadCompanyUsers(record.id);
    } else {
      setUsers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record.id]);

  const exportExcel = () => {
    try {
      const rows = campaignTemplateRows(records);
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Contatos");
      XLSX.writeFile(wb, `assinaturas_${moment().format("YYYYMMDD_HHmm")}.xlsx`);
      toast.success("Planilha gerada.");
    } catch (e) {
      toast.error("Não foi possível exportar a planilha.");
    }
  };

  const loadCompanyUsers = async (companyId) => {
    try {
      const { data } = await api.get("/users/list", { params: { companyId } });
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setUsers([]);
    }
  };

  const handleSubmit = async (data) => {
    console.log("Dados enviados para o backend:", data);
    setLoading(true);
    try {
      if (data.id !== undefined) {
        await update(data);
      } else {
        await save(data);
      }
      await loadPlans();
      handleCancel();
      setCompanyModalOpen(false);
      toast.success("Operação realizada com sucesso!");
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || e?.message || "Erro desconhecido";
      toast.error(`Não foi possível realizar a operação: ${msg}`);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await remove(record.id);
      await loadPlans();
      handleCancel();
      setShowConfirmDialog(false);
      toast.success("Operação realizada com sucesso!");
    } catch (e) {
      toast.error("Não foi possível realizar a operação");
    }
    setLoading(false);
  };

  const handleOpenDeleteDialog = () => {
    setShowConfirmDialog(true);
  };

  const handleCancel = () => {
    setRecord({
      id: undefined,
      name: "",
      email: "",
      phone: "",
      planId: "",
      status: true,
      dueDate: "",
      recurrence: "MENSAL",
      password: "",
      document: "",
      paymentMethod: "",
      generateInvoice: true
    });
  };

  const handleSelect = (data) => {
    console.log("Dados da empresa selecionada:", data);
    const selectedRecord = {
      id: data.id,
      name: data.name || "",
      phone: data.phone || "",
      email: data.email || "",
      planId: data.planId || "",
      status: data.status === false ? false : true,
      dueDate: data.dueDate || "",
      recurrence: data.recurrence || "MENSAL",
      password: "",
      document: data.document || "",
      paymentMethod: data.paymentMethod || "",
      generateInvoice: data.generateInvoice !== undefined ? data.generateInvoice : true,
    };
    setRecord(selectedRecord);
    setCompanyModalOpen(true);
  };

  const handleAddCompany = () => {
    handleCancel();
    setCompanyModalOpen(true);
  };

  return (
    <Paper className={classes.mainPaper} elevation={0}>
      <Grid container spacing={2} style={{ marginBottom: 16 }} alignItems="center" justifyContent="space-between">
        <Grid item xs={12} sm={12} md={9}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>Origem / assinatura</InputLabel>
                <Select
                  label="Origem / assinatura"
                  value={natureFilter}
                  onChange={(e) => setNatureFilter(e.target.value)}
                  MenuProps={{
                    anchorOrigin: { vertical: "bottom", horizontal: "left" },
                    transformOrigin: { vertical: "top", horizontal: "left" },
                    getContentAnchorEl: null,
                    PaperProps: {
                      style: { maxWidth: 280, minWidth: 220 }
                    }
                  }}
                >
                  <MenuItem value="all">Todas</MenuItem>
                  <MenuItem value="freemium">Teste grátis (ativo)</MenuItem>
                  <MenuItem value="cadastro_gratis">Cadastro grátis (+ migrados)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Data inicial"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Data final"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>UF (região)</InputLabel>
                <Select label="UF (região)" value={ufFilter} onChange={(e) => setUfFilter(e.target.value)}>
                  {UFS.map((u) => (
                    <MenuItem key={u || "empty"} value={u}>
                      {u || "—"}
                </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} style={{ display: "flex", alignItems: "flex-end", gap: 8, flexWrap: "wrap" }}>
              <Button variant="contained" color="primary" onClick={() => loadPlans()} disabled={loading}>
                Aplicar filtros
              </Button>
              <Button variant="outlined" onClick={exportExcel} disabled={!records.length}>
                Exportar Excel
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleAddCompany}>
            Adicionar Empresa
          </Button>
        </Grid>
      </Grid>

      <ModalCompany
        open={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        company={record.id ? record : null}
        onSave={handleSubmit}
      />

      <ModalUsers
        open={userModalOpen}
        onClose={() => {
          setUserModalOpen(false);
          setEditingUserId(undefined);
          if (record?.id) loadCompanyUsers(record.id);
        }}
        userId={editingUserId}
        companyId={record?.id}
      />

      <Grid spacing={2} container>
        {record?.id && (
          <Grid xs={12} item>
            <Paper className={classes.tableContainer}>
              <Grid container alignItems="center" justifyContent="space-between" style={{ padding: 8 }}>
                <Grid item>
                  <strong>Usuários da empresa: {record.name}</strong>
                </Grid>
                <Grid item>
                  <Button
                    onClick={() => {
                      setEditingUserId(undefined);
                      setUserModalOpen(true);
                    }}
                    variant="contained"
                    color="primary"
                    startIcon={<PersonAddIcon />}
                  >
                    Adicionar usuário
                  </Button>
                  <Button
                    onClick={handleOpenDeleteDialog}
                    variant="contained"
                    color="secondary"
                    style={{ marginLeft: 8 }}
                    disabled={record.id === 1}
                  >
                    Excluir Empresa
                  </Button>
                </Grid>
              </Grid>
              <Table className={classes.fullWidth} padding="none" aria-label="users-table">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" style={{ width: "1%" }}>#</TableCell>
                    <TableCell align="left">Nome</TableCell>
                    <TableCell align="left">Email</TableCell>
                    <TableCell align="center">Perfil</TableCell>
                    <TableCell align="center" style={{ width: 160 }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell align="center">{u.id}</TableCell>
                      <TableCell align="left">{u.name}</TableCell>
                      <TableCell align="left">{u.email}</TableCell>
                      <TableCell align="center">{u.profile}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          title="Editar"
                          onClick={() => {
                            setEditingUserId(u.id);
                            setUserModalOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          title="Excluir"
                          onClick={async () => {
                            try {
                              await api.delete(`/users/${u.id}`);
                              loadCompanyUsers(record.id);
                              toast.success("Usuário removido");
                            } catch (e) {
                              toast.error("Não foi possível remover o usuário");
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Nenhum usuário encontrado para esta empresa.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        )}
        <Grid xs={12} item>
          <CompaniesManagerGrid records={records} onSelect={handleSelect} />
        </Grid>
      </Grid>
      <ConfirmationModal
        title="Exclusão de Registro"
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => handleDelete()}
      >
        Deseja realmente excluir esse registro?
      </ConfirmationModal>
    </Paper>
  );
}
