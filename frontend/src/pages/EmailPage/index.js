import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import {
  Dashboard as DashboardIcon,
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  FilterList as FilterListIcon,
  Add as AddIcon
} from "@material-ui/icons";
import MailOutlineIcon from "@material-ui/icons/MailOutline";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import CancelOutlinedIcon from "@material-ui/icons/CancelOutlined";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { useLocation, useHistory } from "react-router-dom";
import qs from "query-string";

import ActivitiesStyleLayout from "../../components/ActivitiesStyleLayout";
import { Button, CircularProgress, Typography as MuiTypography, Popover } from "@material-ui/core";
import { toast } from "react-toastify";
import useEmail from "../../hooks/useEmail";
import emailService from "../../services/emailService";
import api from "../../services/api";
import convertedLeadsService from "../../services/convertedLeadsService";
import smtpService from "../../services/smtpService";
import { getBackendUrl } from "../../config";

// Placeholders for views
import { Grid, Paper, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ButtonGroup, Select, MenuItem, TextField, InputAdornment, Button as MuiButton, Dialog, DialogTitle, DialogContent, DialogActions, Stepper, Step, StepLabel, Chip, Avatar, Divider, Fab, Checkbox, FormControlLabel } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, Tooltip, Legend, Filler);

const backendBase = (api?.defaults?.baseURL || getBackendUrl() || "").replace(/\/+$/, "");
const toPublicUrl = (u) => {
  if (!u || typeof u !== "string") return "";
  const url = u.trim();
  if (/^(data:|blob:|https?:\/\/)/i.test(url)) return url;
  if (url.startsWith("/")) return `${backendBase}${url}`;
  return `${backendBase}/public/${url}`;
};

const EmailInbox = ({ data, loading }) => {
  if (loading) return <CircularProgress />;
  
  return (
    <Grid container spacing={2} style={{ height: '100%', overflowX: 'auto', flexWrap: 'nowrap' }}>
      {['Não Lidos', 'Lidos', 'Spam'].map((status) => (
        <Grid item xs={12} sm={6} md={4} key={status} style={{ minWidth: 300 }}>
          <Paper style={{ height: '100%', padding: 16, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom style={{ color: '#333' }}>
              {status}
            </Typography>
            {data && data.length > 0 ? (
                data.filter(item => item.status === status).map(item => (
                    <Card key={item.id} style={{ marginBottom: 8 }}>
                        <CardContent>
                        <Typography variant="subtitle1">{item.subject || "Sem assunto"}</Typography>
                        <Typography variant="body2" color="textSecondary">{item.sender || "Desconhecido"}</Typography>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div style={{ padding: 10, textAlign: "center", color: "#999" }}>
                    Vazio
                </div>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

const EmailList = ({ data, loading }) => {
    if (loading) return <CircularProgress />;
    
    return (
        <TableContainer component={Paper}>
            <Table>
            <TableHead>
                <TableRow>
                <TableCell>Assunto</TableCell>
                <TableCell>Remetente</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Status</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {data && data.length > 0 ? (
                    data.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>{item.subject}</TableCell>
                            <TableCell>{item.sender}</TableCell>
                            <TableCell>{item.date}</TableCell>
                            <TableCell>{item.status}</TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} align="center">Nenhum email encontrado</TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </TableContainer>
    );
};

const EmailCalendar = ({ data }) => (
  <Paper style={{ padding: 16, height: '100%' }}>
    <Typography variant="h6">Agendamento de Emails</Typography>
    <div style={{ marginTop: 20, textAlign: 'center', color: '#666' }}>
      Componente de calendário será integrado aqui.
      {data && data.length > 0 && <div>{data.length} emails agendados.</div>}
    </div>
  </Paper>
);

const EmailDashboard = ({ fetchTotals, fetchSeries }) => {
  const [totals, setTotals] = useState({ templates: 0, sent: 0, scheduled: 0, success: 0 });
  const [chartDate, setChartDate] = useState("");
  const [anchorChartDate, setAnchorChartDate] = useState(null);
  const [period, setPeriod] = useState("week");
  const [series, setSeries] = useState({ labels: [], values: [] });
  const [recentEmails, setRecentEmails] = useState([]);
  const [pendingSchedules, setPendingSchedules] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const t = await fetchTotals();
      if (mounted) setTotals(t);
    };
    load();
    return () => { mounted = false; };
  }, [fetchTotals]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const s = await fetchSeries(period);
      if (mounted) setSeries(s);
    };
    load();
    return () => { mounted = false; };
  }, [fetchSeries, period]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [recent, sched] = await Promise.all([
          emailService.list({ pageNumber: 1 }),
          emailService.schedules.list({ pageNumber: 1 })
        ]);
        if (!mounted) return;
        setRecentEmails(recent?.emails || recent?.items || recent?.rows || []);
        const rawSched = sched?.items || sched?.schedules || [];
        // Somente pendentes/futuros
        const now = Date.now();
        const pend = rawSched.filter(s => {
          const when = new Date(s.scheduledAt || s.sendAt || s.date).getTime();
          return isFinite(when) && when >= now && !String(s.status || "").toLowerCase().includes("sent");
        });
        setPendingSchedules(pend);
      } catch {
        if (!mounted) return;
        setRecentEmails([]);
        setPendingSchedules([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const fmtDate = (iso) => {
    if (!iso) return "";
    try {
      const [y, m, d] = iso.split("-");
      return `${d}/${m}/${y}`;
    } catch {
      return iso;
    }
  };
  const kpis = [
    { title: "Templates", value: totals.templates, subtitle: "Total de templates criados", Icon: DescriptionIcon, circle: "#E9D5FF", color: "#1E293B" },
    { title: "Envios", value: totals.sent, subtitle: "Total de mensagens enviadas", Icon: EmailIcon, circle: "#A7F3D0", color: "#1E293B" },
    { title: "Agendamentos", value: totals.scheduled, subtitle: "Total de envios agendados", Icon: CalendarIcon, circle: "#FDE68A", color: "#1E293B" },
    { title: "Taxa de Sucesso", value: `${totals.success}%`, subtitle: "Emails entregues com sucesso", Icon: CheckCircleIcon, circle: "#A7F3D0", color: "#10B981" },
  ];

  const chartData = React.useMemo(() => {
    const labels = series.labels;
    const data = series.values;
    return {
      labels,
      datasets: [
        {
          label: "Envios",
          data,
          fill: false,
          borderColor: "#1E293B",
          tension: 0.3,
          borderWidth: 2,
          pointBackgroundColor: "#1E293B",
        },
      ],
    };
  }, [series]);

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { borderDash: [4, 4], color: "#E2E8F0" }
      },
      x: {
        grid: { display: false },
      },
    },
    elements: { point: { radius: 0, hoverRadius: 4 } },
  };

  const cardStyle = { padding: 16, borderRadius: 12, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)", display: "flex", flexDirection: "column", minHeight: 360, height: "100%", overflow: "hidden" };
  const tableWrapStyle = { flex: 1 };
  return (
    <Grid container spacing={3} alignItems="stretch" style={{ margin: 0, width: "100%", overflow: "hidden" }}>
      {kpis.map(({ title, value, subtitle, Icon, circle, color }) => (
        <Grid item xs={12} sm={6} md={3} key={title}>
          <Paper style={{ padding: 16, borderRadius: 12, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: circle, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon style={{ fontSize: 18, color: "#1E293B" }} />
              </div>
              <Typography variant="body2" style={{ color: "#111827", opacity: 1 }}>{title}</Typography>
            </div>
            <Typography variant="h4" style={{ fontWeight: 700, color }}>{value}</Typography>
            <Typography variant="caption" style={{ color: "#64748B" }}>{subtitle}</Typography>
          </Paper>
        </Grid>
      ))}

      <Grid item xs={12}>
            <Paper style={{ padding: 16, borderRadius: 12, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <Typography variant="h6" style={{ color: "#1E293B", fontWeight: 600 }}>Tendência de Envios</Typography>
              <Typography variant="body2" style={{ color: "#64748B" }}>Quantidade de emails enviados por período</Typography>
            </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ButtonGroup variant="outlined" color="default">
                  <MuiButton
                    onClick={() => setPeriod("week")}
                    style={{
                      backgroundColor: period === "week" ? "#131B2D" : "#fff",
                      color: period === "week" ? "#fff" : "#111827",
                      borderColor: "#E2E8F0",
                      fontWeight: 400
                    }}
                  >
                    Semana
                  </MuiButton>
                  <MuiButton
                    onClick={() => setPeriod("month")}
                    style={{
                      backgroundColor: period === "month" ? "#131B2D" : "#fff",
                      color: period === "month" ? "#fff" : "#111827",
                      borderColor: "#E2E8F0",
                      fontWeight: 400
                    }}
                  >
                    Mês
                  </MuiButton>
                  <MuiButton
                    onClick={() => setPeriod("year")}
                    style={{
                      backgroundColor: period === "year" ? "#131B2D" : "#fff",
                      color: period === "year" ? "#fff" : "#111827",
                      borderColor: "#E2E8F0",
                      fontWeight: 400
                    }}
                  >
                    Ano
                  </MuiButton>
                </ButtonGroup>
                <MuiButton
                  variant="outlined"
                  onClick={(e) => setAnchorChartDate(e.currentTarget)}
                  startIcon={<CalendarIcon style={{ fontSize: 16, color: "#9CA3AF" }} />}
                  style={{ background: "#fff", color: "#111827", borderColor: "#E2E8F0", fontWeight: 400, padding: "6px 10px", minWidth: 124 }}
                >
                  {chartDate ? fmtDate(chartDate) : "dd/mm/aaaa"}
                </MuiButton>
                <Popover
                  open={Boolean(anchorChartDate)}
                  anchorEl={anchorChartDate}
                  onClose={() => setAnchorChartDate(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                >
                  <div style={{ padding: 12 }}>
                    <TextField
                      type="date"
                      value={chartDate}
                      onChange={(e) => setChartDate(e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                  </div>
                </Popover>
            </div>
          </div>
          <Line data={chartData} options={chartOptions} height={88} />
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper style={cardStyle}>
          <Typography variant="h6" style={{ color: "#0F172A", fontWeight: 400, letterSpacing: 0, marginBottom: 8 }}>
            Status dos Envios Recentes
          </Typography>
          <TableContainer style={{ ...tableWrapStyle, overflowX: "hidden", overflowY: "hidden", maxHeight: "none" }}>
            <Table size="small" style={{ tableLayout: "fixed", width: "100%" }}>
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: "18%" }}>Data/Hora</TableCell>
                  <TableCell style={{ width: "30%" }}>Destinatário</TableCell>
                  <TableCell style={{ width: "36%" }}>Assunto</TableCell>
                  <TableCell style={{ width: "16%" }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(recentEmails || []).slice(0, 8).map((e) => {
                  const when = e.sentAt || e.createdAt || e.date;
                  const to = e.to || e.recipient || e.recipientEmail || e.email;
                  const subject = e.subject || e.title || "-";
                  const status = String(e.status || (e.error ? "erro" : "enviado")).toLowerCase();
                  const isOk = /(sent|enviado|delivered|sucesso)/i.test(status);
                  const isError = /(erro|error|fail|bounce|bounced)/i.test(status);
                  const chipStyle = isOk
                    ? { background: "#ECFDF5", color: "#059669" }
                    : isError
                    ? { background: "#FEF2F2", color: "#DC2626" }
                    : { background: "#EFF6FF", color: "#2563EB" };
                  const label =
                    isOk ? "Enviado" : isError ? "Erro" : "Pendente";
                  return (
                    <TableRow key={e.id || `${to}-${when}-${subject}`}>
                      <TableCell style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", verticalAlign: "middle" }}>
                        {when ? new Date(when).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", verticalAlign: "middle" }}>{to || "-"}</TableCell>
                      <TableCell style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", verticalAlign: "middle" }}>{subject}</TableCell>
                      <TableCell style={{ whiteSpace: "nowrap", verticalAlign: "middle" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 10px", borderRadius: 999, fontWeight: 600, fontSize: 12, ...chipStyle }}>
                          {label}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!recentEmails || recentEmails.length === 0) && (
                  <TableRow><TableCell colSpan={4} align="center">Sem registros</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper style={cardStyle}>
          <Typography variant="h6" style={{ color: "#0F172A", fontWeight: 400, letterSpacing: 0, marginBottom: 8 }}>
            Agendamentos Pendentes
          </Typography>
          <TableContainer style={{ ...tableWrapStyle, overflowX: "hidden", overflowY: "hidden", maxHeight: "none" }}>
            <Table size="small" style={{ tableLayout: "fixed", width: "100%" }}>
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: "14%" }}>Status</TableCell>
                  <TableCell style={{ width: "26%" }}>Destinatário</TableCell>
                  <TableCell style={{ width: "16%" }}>Campanha</TableCell>
                  <TableCell style={{ width: "24%" }}>Assunto</TableCell>
                  <TableCell style={{ width: "20%", whiteSpace: "normal", overflow: "visible", textOverflow: "clip" }}>Agendado para</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(pendingSchedules || []).slice(0, 8).map((s) => {
                  const when = s.scheduledAt || s.sendAt || s.date;
                  const to = s.contactEmail || s.to || s.recipient;
                  const statusPt = "Agendado";
                  return (
                    <TableRow key={s.id || `${to}-${when}`}>
                      <TableCell style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", verticalAlign: "middle" }}>{statusPt}</TableCell>
                      <TableCell style={{ whiteSpace: "normal", wordBreak: "break-word", overflow: "hidden", verticalAlign: "middle" }}>
                        <div style={{ fontWeight: 600 }}>{s.contactName || to || "-"}</div>
                        <div style={{ fontSize: 12, color: "#64748B", whiteSpace: "normal", wordBreak: "break-word", overflow: "hidden", textOverflow: "ellipsis" }}>{to || "-"}</div>
                      </TableCell>
                      <TableCell style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", verticalAlign: "middle" }}>{s.campaignName || "-"}</TableCell>
                      <TableCell style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", verticalAlign: "middle" }}>{s.subject || "-"}</TableCell>
                      <TableCell style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", verticalAlign: "middle" }}>{when ? new Date(when).toLocaleString() : "-"}</TableCell>
                    </TableRow>
                  );
                })}
                {(!pendingSchedules || pendingSchedules.length === 0) && (
                  <TableRow><TableCell colSpan={5} align="center">Nenhum agendamento</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(1.5),
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
    marginTop: theme.spacing(2),
    overflowY: "visible",
    maxWidth: "100%",
    marginLeft: 0,
    marginRight: 0,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}));

const EmailPage = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [anchorStatus, setAnchorStatus] = useState(null);
  const [anchorDate, setAnchorDate] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleStep, setScheduleStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templatesList, setTemplatesList] = useState([]);
  const [contactsList, setContactsList] = useState([]);
  const [contactsSource, setContactsSource] = useState("email"); // 'email' | 'system'
  const [contactsLoading, setContactsLoading] = useState(false);
  const [schedulesList, setSchedulesList] = useState([]);
  const [multiSelect, setMultiSelect] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editor, setEditor] = useState({
    id: null,
    name: "",
    subject: "",
    description: "",
    fontSize: 16,
    contentHtml: "",
    contentText: "",
    signatureImageFile: null,
    signatureImagePath: "",
    attachmentsFiles: []
  });
  const [signaturePreviewUrl, setSignaturePreviewUrl] = useState("");
  const [editorAttachments, setEditorAttachments] = useState([]);
  const [signatureBust, setSignatureBust] = useState(0);
  const variables = [
    { token: "{nome}", label: "Nome do contato" },
    { token: "{email}", label: "Email do contato" },
    { token: "{telefone}", label: "Telefone do contato" },
    { token: "{empresa}", label: "Nome da empresa" },
    { token: "{razao_social}", label: "Razão social" },
    { token: "{endereco}", label: "Endereço" },
    { token: "{data}", label: "Data atual" },
    { token: "{hora}", label: "Hora atual" },
    { token: "{produto}", label: "Produto" },
    { token: "{valor}", label: "Valor" },
    { token: "{vencimento}", label: "Vencimento" },
    { token: "{cargo}", label: "Cargo" }
  ];
  
  const { emails, loading, count } = useEmail({
      pageNumber: 1,
      searchParam: ""
  });
  const [smtpOk, setSmtpOk] = useState(true);
  const [smtpChecked, setSmtpChecked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await smtpService.list();
        const rows = res?.items || [];
        setSmtpOk(rows && rows.length > 0);
      } catch {
        setSmtpOk(false);
      } finally {
        setSmtpChecked(true);
      }
    })();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    const parsed = qs.parse(location.search);
    if (parsed.tab === "agendamento" || parsed.contacts) {
      setActiveTab("agendamento");
    }
    if (parsed.tab === "historico") {
      setActiveTab("historico");
    }
    if (parsed.tab === "template") {
      setActiveTab("template");
    }
    if (parsed.contacts) {
      const ids = String(parsed.contacts).split(",").filter(Boolean);
      setRecipients(ids);
    }
  }, [location.search]);

  useEffect(() => {
    if (activeTab !== "template") return;
    let mounted = true;
    (async () => {
      try {
        const res = await emailService.templates.list({ pageNumber: 1 });
        if (mounted) setTemplatesList(res?.templates || res?.records || res?.rows || []);
      } catch {
        if (mounted) setTemplatesList([]);
      }
    })();
    return () => { mounted = false; };
  }, [activeTab]);

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const res = await emailService.schedules.list({ pageNumber: 1 });
        setSchedulesList(res?.items || []);
      } catch {
        setSchedulesList([]);
      }
    };
    if (activeTab === "agendamento") loadSchedules();
  }, [activeTab]);

  const openEditor = (tpl = null) => {
    if (tpl) {
      setEditor({
        id: tpl.id,
        name: tpl.name || "",
        subject: tpl.subject || "",
        description: tpl.description || "",
        fontSize: tpl.fontSize || 16,
        contentHtml: tpl.contentHtml || "",
        contentText: tpl.contentText || "",
        signatureImageFile: null,
        signatureImagePath: tpl.signatureImagePath || "",
        attachmentsFiles: []
      });
      (async () => {
        try {
          const res = await emailService.templates.listAttachments(tpl.id);
          const items = res?.attachments || [];
          setEditorAttachments(items);
        } catch {
          setEditorAttachments([]);
        }
      })();
    } else {
      setEditor({
        id: null,
        name: "",
        subject: "",
        description: "",
        fontSize: 16,
        contentHtml: "",
        contentText: "",
        signatureImageFile: null,
        signatureImagePath: "",
        attachmentsFiles: []
      });
      setEditorAttachments([]);
    }
    setEditorOpen(true);
  };
  const closeEditor = () => setEditorOpen(false);
  const insertVariable = (token) => {
    setEditor(prev => ({ ...prev, contentHtml: (prev.contentHtml || "") + token }));
  };
  const onChangeEditor = (field, value) => {
    setEditor(prev => ({ ...prev, [field]: value }));
  };
  useEffect(() => {
    let revoke = null;
    try {
      setSignaturePreviewUrl("");
      if (editor.signatureImageFile) {
        const url = URL.createObjectURL(editor.signatureImageFile);
        setSignaturePreviewUrl(url);
        revoke = url;
        setSignatureBust(Date.now());
      } else if (editor.signatureImagePath) {
        // Usa a URL pública diretamente; não depende de endpoints com auth
        const url = toPublicUrl(editor.signatureImagePath);
        setSignaturePreviewUrl(url);
        setSignatureBust(Date.now());
      }
    } catch {
      setSignaturePreviewUrl("");
    }
    return () => { if (revoke) URL.revokeObjectURL(revoke); };
  }, [editor.signatureImageFile, editor.signatureImagePath]);
  const onFilesSelected = (files) => {
    const arr = Array.from(files || []);
    const filtered = arr.filter(f => f.size <= 50 * 1024 * 1024);
    setEditor(prev => ({ ...prev, attachmentsFiles: filtered }));
  };
  const onSignatureSelected = (file) => {
    if (file && file.size <= 50 * 1024 * 1024) {
      setEditor(prev => ({ ...prev, signatureImageFile: file }));
    } else {
      toast.error("Arquivo muito grande");
    }
  };
  const saveTemplate = async () => {
    try {
      setEditorLoading(true);
      const payload = {
        id: editor.id,
        name: editor.name,
        subject: editor.subject,
        description: editor.description,
        fontSize: Number(editor.fontSize) || 16,
        contentHtml: editor.contentHtml,
        contentText: editor.contentText,
        isActive: true
      };
      const saved = await emailService.templates.save(payload);
      if (editor.attachmentsFiles?.length) {
        await emailService.templates.uploadAttachments(saved.id, editor.attachmentsFiles);
      }
      if (editor.signatureImageFile) {
        const resp = await emailService.templates.uploadSignatureImage(saved.id, editor.signatureImageFile);
        if (resp?.signatureImagePath) {
          setEditor(prev => ({ ...prev, signatureImagePath: resp.signatureImagePath, signatureImageFile: null }));
        }
      }
      // Atualizar lista de anexos e templates após upload
      try {
        const [tpls, atts] = await Promise.all([
          emailService.templates.list({ pageNumber: 1 }),
          emailService.templates.listAttachments(saved.id)
        ]);
        setTemplatesList(tpls?.templates || tpls?.records || tpls?.rows || []);
        setEditorAttachments(atts?.attachments || []);
      } catch {}
      toast.success("Template salvo");
      setEditorLoading(false);
      // Manter modal aberto quando houve anexos/assinatura para o usuário visualizar o resultado
      if (!editor.attachmentsFiles?.length && !editor.signatureImageFile) {
        closeEditor();
      } else {
        setEditor(prev => ({ ...prev, id: saved.id, attachmentsFiles: [] }));
      }
    } catch (e) {
      setEditorLoading(false);
      toast.error("Erro ao salvar template");
    }
  };

  const isValidEmail = (email) => {
    if (!email) return false;
    const v = String(email).trim();
    return v.includes("@");
  };

  const mergeRecipientsByEmail = (systemContacts, convertedLeads) => {
    const byEmail = new Map();
    [...systemContacts, ...convertedLeads].forEach((item) => {
      const key = String(item.email).toLowerCase();
      if (!byEmail.has(key) || byEmail.get(key)?._source !== "system") {
        byEmail.set(key, item);
      }
    });
    return Array.from(byEmail.values());
  };

  const fetchAllSystemContactsWithEmail = async ({ searchParam = "" } = {}) => {
    let pageNumber = 1;
    let hasMore = true;
    const acc = [];
    while (hasMore) {
      const res = await api.request({
        url: "/contacts",
        method: "GET",
        params: { pageNumber, ...(searchParam ? { searchParam } : {}) },
      });
      const rows = (res.data?.contacts || res.data?.rows || res.data?.records || []).filter(
        (c) => isValidEmail(c?.email)
      );
      acc.push(...rows.map((c) => ({ ...c, _source: "system" })));
      hasMore = !!res.data?.hasMore;
      pageNumber += 1;
      if (pageNumber > 200) break; // segurança contra loop infinito
    }
    return acc;
  };

  const fetchAllConvertedLeadsWithEmail = async ({ searchParam = "" } = {}) => {
    let pageNumber = 1;
    let hasMore = true;
    const acc = [];
    while (hasMore) {
      const data = await convertedLeadsService.list({
        pageNumber,
        ...(searchParam ? { searchParam } : {}),
      });
      const rows = (data?.leads || []).filter((l) => isValidEmail(l?.email));
      acc.push(
        ...rows.map((l) => ({
          id: `lead-${l.id}`,
          name: l.name,
          email: l.email,
          phone: l.phone || l.contact?.number || "",
          _source: "converted-lead",
        }))
      );
      hasMore = !!data?.hasMore;
      pageNumber += 1;
      if (pageNumber > 200) break; // segurança contra loop infinito
    }
    return acc;
  };

  const loadRecipientsCatalog = async ({ searchParam = "" } = {}) => {
    setContactsLoading(true);
    try {
      // Preferir catálogo do sistema (contacts + converted leads) e cair para /email/contacts se vazio
      const [systemContacts, convertedLeads] = await Promise.all([
        fetchAllSystemContactsWithEmail({ searchParam }),
        fetchAllConvertedLeadsWithEmail({ searchParam }),
      ]);

      const merged = mergeRecipientsByEmail(systemContacts, convertedLeads);
      if (merged.length > 0) {
        setContactsList(merged);
        setContactsSource("system");
        return merged;
      }

      const res = await emailService.contacts.list({ pageNumber: 1, ...(searchParam ? { searchParam } : {}) });
      const emailContacts = (res?.contacts || res?.records || res?.rows || []).filter((c) => isValidEmail(c?.email));
      const normalized = emailContacts.map((c) => ({ ...c, _source: "email" }));
      setContactsList(normalized);
      setContactsSource("email");
      return normalized;
    } catch (e) {
      setContactsList([]);
      setContactsSource("email");
      return [];
    } finally {
      setContactsLoading(false);
    }
  };

  const findEmailContactIdByEmail = async (email) => {
    const needle = String(email || "").trim().toLowerCase();
    if (!needle) return null;
    let pageNumber = 1;
    let hasMore = true;
    while (hasMore) {
      const data = await emailService.contacts.list({ searchParam: needle, pageNumber });
      const rows = data?.contacts || data?.records || data?.rows || [];
      const found = rows.find((c) => String(c?.email || "").trim().toLowerCase() === needle);
      if (found?.id) return found.id;
      hasMore = !!data?.hasMore;
      pageNumber += 1;
      if (pageNumber > 200) break;
    }
    return null;
  };

  const ensureEmailContactId = async (item) => {
    const email = String(item?.email || "").trim();
    if (!isValidEmail(email)) return null;
    const payload = {
      name: item?.name || "",
      email,
      phone: item?.phone || item?.number || ""
    };
    try {
      const created = await api.request({
        url: "/email/contacts",
        method: "POST",
        data: payload
      });
      return created?.data?.id || null;
    } catch (e) {
      const status = e?.response?.status;
      if (status === 409) {
        return await findEmailContactIdByEmail(email);
      }
      return null;
    }
  };

  const openScheduleWizard = (presetRecipients = []) => {
    if (presetRecipients.length) setRecipients(presetRecipients);
    setScheduleStep(0);
    setScheduleOpen(true);
    (async () => {
      try {
        await loadRecipientsCatalog();
      } catch {
        try {
          const res = await emailService.contacts.list({ pageNumber: 1 });
          const emailContacts = (res?.contacts || res?.records || res?.rows || []).filter(c => isValidEmail(c?.email));
          setContactsList(emailContacts.map(c => ({ ...c, _source: "email" })));
          setContactsSource("email");
        } catch {
          setContactsList([]);
          setContactsSource("email");
        }
      }
    })();
  };

  const closeScheduleWizard = () => setScheduleOpen(false);

  const tabs = [
    { label: "Dashboard", value: "dashboard", icon: <DashboardIcon /> },
    { label: "Template", value: "template", icon: <DescriptionIcon /> },
    { label: "Agendamento", value: "agendamento", icon: <CalendarIcon /> },
    { label: "Histórico", value: "historico", icon: <EmailIcon /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <EmailDashboard
            fetchTotals={async () => {
              const [metrics, tpl] = await Promise.all([
                emailService.metrics(),
                emailService.templates.list({ pageNumber: 1 })
              ]);
              const templates = tpl?.count || 0;
              const sent = metrics?.totalSent || 0;
              const scheduled = metrics?.scheduled || 0;
              const success = sent > 0 ? Math.round(((sent - (metrics?.totalBounced || 0)) / sent) * 100) : 0;
              return { templates, sent, scheduled, success };
            }}
            fetchSeries={async (period) => {
              const data = await emailService.series({ period });
              const labels = (data || []).map(d => d.label || d.date || "");
              const values = (data || []).map(d => d.value || d.totalSent || 0);
              return { labels, values };
            }}
          />
        );
      case "template":
        return (
          <Paper style={{ padding: 16, borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Typography variant="h6" style={{ color: "#1E293B", fontWeight: 600 }}>Templates</Typography>
            </div>
            <Grid container spacing={2}>
              {templatesList.map(tpl => (
                <Grid item xs={12} sm={6} md={4} key={tpl.id}>
                  <Paper style={{ padding: 12, display: "flex", gap: 12, alignItems: "center", borderRadius: 12 }}>
                    <div style={{ width: 80, height: 50, borderRadius: 6, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Typography variant="caption">{tpl.name?.slice(0, 10) || "Template"}</Typography>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Typography variant="subtitle1" style={{ color: "#1E293B", fontWeight: 500 }}>{tpl.name}</Typography>
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <Button size="small" variant="outlined" onClick={() => openEditor(tpl)}>Editar</Button>
                        <Button size="small" variant="outlined" onClick={() => setEditor({ ...editor, ...tpl, id: tpl.id, signatureImageFile: null, attachmentsFiles: [] }) || setEditorOpen(true)}>Pré-visualizar</Button>
                        <Button size="small" variant="outlined" color="secondary" onClick={async () => { await emailService.templates.remove(tpl.id); const res = await emailService.templates.list({ pageNumber: 1 }); setTemplatesList(res?.templates || res?.records || res?.rows || []); toast.success("Excluído"); }}>Excluir</Button>
                      </div>
                    </div>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            
            <Dialog open={editorOpen} onClose={closeEditor} fullWidth maxWidth="md">
              <DialogTitle>{editor.id ? "Editar Template" : "Criar Template"}</DialogTitle>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <TextField label="Nome do Template" value={editor.name} onChange={(e) => onChangeEditor("name", e.target.value)} variant="outlined" fullWidth style={{ marginBottom: 12 }} />
                    <TextField label="Descrição" value={editor.description} onChange={(e) => onChangeEditor("description", e.target.value)} variant="outlined" fullWidth style={{ marginBottom: 12 }} />
                    <TextField label="Assunto" value={editor.subject} onChange={(e) => onChangeEditor("subject", e.target.value)} variant="outlined" fullWidth style={{ marginBottom: 12 }} />
                    <TextField type="number" label="Tamanho da fonte (px)" value={editor.fontSize} onChange={(e) => onChangeEditor("fontSize", e.target.value)} variant="outlined" fullWidth style={{ marginBottom: 12 }} />
                    <Paper style={{ padding: 12, borderRadius: 8, marginBottom: 12 }}>
                      <Typography variant="subtitle2" style={{ marginBottom: 8 }}>Variáveis Dinâmicas</Typography>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {variables.map(v => (
                          <Chip key={v.token} label={`${v.token}`} onClick={() => insertVariable(v.token)} />
                        ))}
                      </div>
                    </Paper>
                    <TextField
                      label="Conteúdo do Template (HTML)"
                      value={editor.contentHtml}
                      onChange={(e) => onChangeEditor("contentHtml", e.target.value)}
                      variant="outlined"
                      fullWidth
                      multiline
                      minRows={8}
                    />
                    <Typography variant="caption" style={{ display: "block", marginTop: 4 }}>Fonte ativa: {editor.fontSize}px</Typography>
                    <Divider style={{ margin: "16px 0" }} />
                    <Typography variant="subtitle2" style={{ marginBottom: 8 }}>Adicionar arquivos anexos (até 50MB cada)</Typography>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input type="file" multiple onChange={(e) => onFilesSelected(e.target.files)} />
                      <span style={{ fontSize: 12, color: "#6B7280" }}>
                        {editor.attachmentsFiles?.length
                          ? `${editor.attachmentsFiles.length} arquivo(s) novo(s) selecionado(s)`
                          : (editorAttachments?.length ? "anexos já salvos listados abaixo" : "Nenhum arquivo selecionado")}
                      </span>
                    </div>
                    <Typography variant="subtitle2" style={{ marginTop: 16 }}>Assinatura (imagem opcional)</Typography>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input type="file" accept="image/*" onChange={(e) => onSignatureSelected(e.target.files[0])} />
                      <span style={{ fontSize: 12, color: "#6B7280" }}>
                        {editor.signatureImageFile?.name
                          ? editor.signatureImageFile.name
                          : (editor.signatureImagePath ? "assinatura já salva" : "Nenhum arquivo selecionado")}
                      </span>
                      {editor.id && editor.signatureImagePath && (
                        <Button size="small" color="secondary" onClick={async () => {
                          try {
                            await emailService.templates.clearSignature(editor.id);
                            setEditor(prev => ({ ...prev, signatureImagePath: "" }));
                            toast.success("Assinatura removida");
                          } catch {
                            toast.error("Falha ao remover assinatura");
                          }
                        }}>Remover assinatura</Button>
                      )}
                    </div>
                    <Typography variant="subtitle2" style={{ marginTop: 16 }}>Anexos já salvos</Typography>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {(editorAttachments || []).map(a => {
                        const href = toPublicUrl(a.path || "");
                        return (
                          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <a href={href} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#2563EB", flex: 1 }}>
                              {a.filename}
                            </a>
                            {editor.id && (
                              <Button size="small" onClick={async () => {
                                try {
                                  await emailService.templates.deleteAttachment(editor.id, a.id);
                                  setEditorAttachments(prev => prev.filter(x => x.id !== a.id));
                                  toast.success("Anexo removido");
                                } catch {
                                  toast.error("Não foi possível remover");
                                }
                              }}>Remover</Button>
                            )}
                          </div>
                        );
                      })}
                      {(!editorAttachments || editorAttachments.length === 0) && (
                        <span style={{ fontSize: 12, color: "#6B7280" }}>—</span>
                      )}
                    </div>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper style={{ padding: 12, borderRadius: 8 }}>
                      <Typography variant="subtitle2" style={{ marginBottom: 8 }}>Preview ao Vivo</Typography>
                      <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: 12 }}>
                        <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 8 }}>Tamanho da fonte: {editor.fontSize}px</div>
                        <div style={{ minHeight: 120, fontSize: `${editor.fontSize || 16}px` }} dangerouslySetInnerHTML={{ __html: editor.contentHtml || "<i>Sem conteúdo</i>" }} />
                        <div style={{ marginTop: 12, color: "#6B7280" }}>Assinatura:</div>
                        {signaturePreviewUrl ? (
                          <img alt="assinatura" style={{ maxWidth: "100%", marginTop: 8 }} src={signaturePreviewUrl} />
                        ) : editor.signatureImagePath ? (
                          <>
                            <img
                              alt="assinatura"
                              style={{ maxWidth: "100%", marginTop: 8 }}
                              src={`${(api?.defaults?.baseURL || "").replace(/\/+$/,"")}/email/templates/${editor.id}/signature-image/public${signatureBust ? `?v=${signatureBust}` : ""}`}
                              onError={(e) => {
                                try {
                                  const base = (api?.defaults?.baseURL || "").replace(/\/+$/,"");
                                  e.currentTarget.src = `${base}/email/templates/${editor.id}/signature-image/public${signatureBust ? `?v=${signatureBust}` : ""}`;
                                } catch {
                                  e.currentTarget.src = "";
                                }
                              }}
                            />
                            {/* Link removido a pedido: manter apenas preview inline estável */}
                          </>
                        ) : (
                          <div style={{ fontSize: 12, color: "#9CA3AF" }}>—</div>
                        )}
                      </div>
                    </Paper>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={closeEditor}>Cancelar</Button>
                <Button onClick={saveTemplate} color="primary" variant="contained" disabled={editorLoading || !editor.name || !editor.subject}>Salvar</Button>
              </DialogActions>
            </Dialog>
          </Paper>
        );
      case "agendamento":
        return (
          <>
            <Paper style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Typography variant="h6" style={{ fontWeight: 700, color: "#0F172A" }}>Agendamentos</Typography>
              </div>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell>Contato</TableCell>
                      <TableCell>Template/Campanha</TableCell>
                      <TableCell>Assunto</TableCell>
                  <TableCell>Data de Envio</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(schedulesList || []).map((s) => {
                      const now = new Date();
                      const sched = s.scheduledAt ? new Date(s.scheduledAt) : null;
                      const isDueOrPast = sched ? sched.getTime() <= now.getTime() : false;
                      const statusPt = (() => {
                        switch (s.status) {
                          case "sent": return "Enviado";
                          case "failed": return "Falhou";
                          case "retrying": return "Tentando novamente";
                          case "canceled": return "Cancelado";
                          case "scheduled":
                          default:
                            return isDueOrPast ? "Enviado Agora" : "Agendado";
                        }
                      })();
                      return (
                      <TableRow key={s.id}>
                        <TableCell>{statusPt}</TableCell>
                        <TableCell>
                          <div style={{ fontWeight: 600 }}>{s.contactName || s.contactEmail}</div>
                          <div style={{ fontSize: 12, color: "#64748B" }}>{s.contactEmail}</div>
                        </TableCell>
                        <TableCell>{s.campaignName || "-"}</TableCell>
                        <TableCell>{s.subject || "-"}</TableCell>
                      <TableCell>{s.scheduledAt ? new Date(s.scheduledAt).toLocaleString() : "-"}</TableCell>
                      </TableRow>
                    )})}
                    {(!schedulesList || schedulesList.length === 0) && (
                  <TableRow><TableCell colSpan={5} align="center">Nenhum agendamento encontrado</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        );
      case "historico":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10B981", display: "inline-block" }} />
              <span style={{ color: "#10B981", fontSize: 14 }}>Atualizações em tempo real ativadas</span>
            </div>

            {(() => {
              const arr = Array.isArray(emails) ? emails : [];
              const total = arr.length;
              const sent = arr.filter(e => {
                const status = String(e.status || (e.error ? "erro" : "enviado")).toLowerCase();
                return /(sent|enviado|delivered|sucesso)/.test(status) && !/(erro|error|fail|bounce|bounced)/.test(status);
              }).length;
              const errors = arr.filter(e => {
                const status = String(e.status || (e.error ? "erro" : "")).toLowerCase();
                return /(erro|error|fail|bounce|bounced)/.test(status);
              }).length;
              return (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Paper style={{ padding: 16, borderRadius: 12, border: "1px solid #E5E7EB", background: "#FFFFFF" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <MailOutlineIcon style={{ color: "#1E40AF" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 12, color: "#6B7280" }}>Total</span>
                      <span style={{ fontSize: 20, fontWeight: 700, color: "#111827", lineHeight: 1 }}>{total}</span>
                    </div>
                  </div>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper style={{ padding: 16, borderRadius: 12, border: "1px solid #E5E7EB", background: "#FFFFFF" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CheckCircleOutlineIcon style={{ color: "#059669" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 12, color: "#6B7280" }}>Enviados</span>
                      <span style={{ fontSize: 20, fontWeight: 700, color: "#111827", lineHeight: 1 }}>{sent}</span>
                    </div>
                  </div>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper style={{ padding: 16, borderRadius: 12, border: "1px solid #E5E7EB", background: "#FFFFFF" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CancelOutlinedIcon style={{ color: "#DC2626" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 12, color: "#6B7280" }}>Erros</span>
                      <span style={{ fontSize: 20, fontWeight: 700, color: "#111827", lineHeight: 1 }}>{errors}</span>
                    </div>
                  </div>
                </Paper>
              </Grid>
            </Grid>
              );
            })()}

            <Paper style={{ padding: 16, borderRadius: 12, border: "1px solid #E5E7EB", background: "#FFFFFF" }}>
              <Typography variant="h6" style={{ fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Histórico de Envios</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ color: "#6B7280", fontWeight: 600 }}>Data/Hora</TableCell>
                      <TableCell style={{ color: "#6B7280", fontWeight: 600 }}>Destinatário</TableCell>
                      <TableCell style={{ color: "#6B7280", fontWeight: 600 }}>Remetente</TableCell>
                      <TableCell style={{ color: "#6B7280", fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(Array.isArray(emails) ? emails : []).map((e) => {
                      const when = e.sentAt || e.createdAt || e.date;
                      const to = e.to || e.recipient || e.recipientEmail || e.email;
                      const from = e.from || e.sender || e.remetente || "-";
                      const status = String(e.status || (e.error ? "erro" : "enviado")).toLowerCase();
                      const isOk = /(sent|enviado|delivered|sucesso)/.test(status) && !/(erro|error|fail|bounce|bounced)/.test(status);
                      const isError = /(erro|error|fail|bounce|bounced)/.test(status);
                      const chipStyle = isOk
                        ? { background: "#ECFDF5", color: "#059669" }
                        : isError
                        ? { background: "#FEF2F2", color: "#DC2626" }
                        : { background: "#EFF6FF", color: "#2563EB" };
                      const label = isOk ? "Enviado" : isError ? "Erro" : "Pendente";
                      return (
                        <TableRow key={e.id || `${to}-${when}-${from}`}>
                          <TableCell style={{ color: "#111827" }}>{when ? new Date(when).toLocaleString() : "-"}</TableCell>
                          <TableCell>
                            <div style={{ color: "#111827", fontWeight: 600 }}>{e.recipientName || to || "-"}</div>
                            <div style={{ color: "#6B7280", fontSize: 12 }}>{to || "-"}</div>
                          </TableCell>
                          <TableCell>
                            <div style={{ color: "#111827", fontWeight: 600 }}>{e.senderName || from || "-"}</div>
                            <div style={{ color: "#6B7280", fontSize: 12 }}>{from || "-"}</div>
                          </TableCell>
                          <TableCell>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 10px", borderRadius: 999, fontWeight: 600, fontSize: 12, ...chipStyle }}>
                              {label}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {(!emails || emails.length === 0) && (
                      <TableRow><TableCell colSpan={4} align="center">Nenhum registro encontrado</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </div>
        );
      default:
        return (
          <EmailDashboard
            fetchTotals={async () => {
              const [metrics, tpl] = await Promise.all([
                emailService.metrics(),
                emailService.templates.list({ pageNumber: 1 })
              ]);
              const templates = tpl?.count || 0;
              const sent = metrics?.totalSent || 0;
              const scheduled = metrics?.scheduled || 0;
              const success = sent > 0 ? Math.round(((sent - (metrics?.totalBounced || 0)) / sent) * 100) : 0;
              return { templates, sent, scheduled, success };
            }}
            fetchSeries={async (period) => {
              const data = await emailService.series({ period });
              const labels = (data || []).map(d => d.label || d.date || "");
              const values = (data || []).map(d => d.value || d.totalSent || 0);
              return { labels, values };
            }}
          />
        );
    }
  };

  return (
    <ActivitiesStyleLayout
      searchPlaceholder="Buscar emails..."
      viewModes={tabs}
      currentViewMode={activeTab}
      onViewModeChange={(val) => setActiveTab(val)}
      scrollContent={false}
      rightFilters={({ classes: layout }) => (
        <>
          <div className={layout.filterItem} onClick={(e) => setAnchorStatus(e.currentTarget)}>
            <MuiTypography className={layout.filterLabel}>Status</MuiTypography>
            <ExpandMoreIcon className={layout.chevronIcon} />
          </div>
          <Popover
            open={Boolean(anchorStatus)}
            anchorEl={anchorStatus}
            onClose={() => setAnchorStatus(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          >
            <div style={{ padding: 8, minWidth: 160 }}>
              <MenuItem selected={statusFilter === ""} onClick={() => { setStatusFilter(""); setAnchorStatus(null); }}>Todos</MenuItem>
              <MenuItem selected={statusFilter === "enviado"} onClick={() => { setStatusFilter("enviado"); setAnchorStatus(null); }}>Enviado</MenuItem>
              <MenuItem selected={statusFilter === "pendente"} onClick={() => { setStatusFilter("pendente"); setAnchorStatus(null); }}>Pendente</MenuItem>
              <MenuItem selected={statusFilter === "erro"} onClick={() => { setStatusFilter("erro"); setAnchorStatus(null); }}>Erro</MenuItem>
            </div>
          </Popover>

          <div className={layout.filterItem} onClick={(e) => setAnchorDate(e.currentTarget)}>
            <CalendarIcon className={layout.calendarIcon} />
            <MuiTypography className={layout.filterLabel}>
              {dateFilter ? dateFilter : "dd/mm/aaaa"}
            </MuiTypography>
            <ExpandMoreIcon className={layout.chevronIcon} />
          </div>
          <Popover
            open={Boolean(anchorDate)}
            anchorEl={anchorDate}
            onClose={() => setAnchorDate(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          >
            <div style={{ padding: 12 }}>
              <TextField
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                variant="outlined"
                size="small"
              />
            </div>
          </Popover>
        </>
      )}
    >
      <div className={classes.content}>
        {smtpChecked && !smtpOk && (
          <Paper style={{ padding: 12, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#7F1D1D", borderRadius: 8, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <Typography variant="body2" style={{ fontWeight: 600 }}>
                Nenhuma configuração SMTP encontrada. Configure em Configurações › Email para habilitar envios.
              </Typography>
              <Button size="small" variant="outlined" onClick={() => history.push("/settings?tab=email")}>
                Abrir Configurações
              </Button>
            </div>
          </Paper>
        )}
        {renderContent()}
      </div>

      <Dialog open={scheduleOpen} onClose={closeScheduleWizard} maxWidth="sm" fullWidth>
        <DialogTitle>Agendar Envio</DialogTitle>
        <DialogContent>
          <Stepper activeStep={scheduleStep} alternativeLabel>
            <Step><StepLabel>Template</StepLabel></Step>
            <Step><StepLabel>Destinatários</StepLabel></Step>
            <Step><StepLabel>Data e Hora</StepLabel></Step>
          </Stepper>
          {scheduleStep === 0 && (
            <div style={{ marginTop: 16 }}>
              <Typography variant="subtitle2" style={{ marginBottom: 8 }}>Selecione um template</Typography>
              <TextField
                label="Nome da Campanha"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                variant="outlined"
                fullWidth
                style={{ marginBottom: 12 }}
              />
              <Grid container spacing={2}>
                {templatesList.map(tpl => (
                  <Grid item xs={6} key={tpl.id}>
                    <Paper onClick={() => setSelectedTemplate(tpl.id)} style={{ padding: 12, cursor: "pointer", border: selectedTemplate === tpl.id ? "2px solid #3B82F6" : "1px solid #E2E8F0", borderRadius: 8 }}>
                      <div style={{ width: "100%", height: 80, borderRadius: 6, border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Typography variant="body2">{tpl.name}</Typography>
                      </div>
                      <Typography variant="body2" style={{ marginTop: 8, textAlign: "center" }}>{tpl.name}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </div>
          )}
          {scheduleStep === 1 && (
            <div style={{ marginTop: 16 }}>
              <Typography variant="subtitle2" style={{ marginBottom: 8 }}>Destinatários</Typography>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <FormControlLabel
                  control={<Checkbox checked={multiSelect} onChange={(e) => setMultiSelect(e.target.checked)} color="primary" />}
                  label="Selecionar múltiplos contatos"
                />
                <Button variant="outlined" onClick={async () => {
                  if (!contactsList.length) {
                    const list = await loadRecipientsCatalog();
                    setRecipients(list.map(c => String(c.id)));
                  } else {
                    setRecipients(contactsList.map(c => String(c.id)));
                  }
                }}>Selecionar todos os contatos</Button>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                {recipients.map(id => {
                  const c = contactsList.find(x => String(x.id) === String(id));
                  const label = c ? (c.name || c.email) : `Contato #${id}`;
                  return <Chip key={id} label={label} onDelete={() => setRecipients(recipients.filter(r => r !== id))} />;
                })}
              </div>
              <TextField
                placeholder="Buscar contato"
                variant="outlined"
                fullWidth
                onChange={async (e) => {
                  const term = e.target.value;
                  await loadRecipientsCatalog({ searchParam: term });
                }}
                style={{ marginBottom: 8 }}
              />
              <div style={{ maxHeight: 260, overflow: "auto", border: "1px solid #E5E7EB", borderRadius: 8 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Selecionar</TableCell>
                      <TableCell>Nome</TableCell>
                      <TableCell>Email</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contactsList.map(c => {
                      const selected = recipients.includes(String(c.id)) || recipients.includes(c.id);
                      return (
                        <TableRow key={c.id} hover onClick={() => {
                          const id = String(c.id);
                          setRecipients(prev => {
                            if (multiSelect) {
                              return selected ? prev.filter(x => String(x) !== id) : [...prev, id];
                            } else {
                              return selected ? [] : [id];
                            }
                          });
                        }}>
                          <TableCell>{selected ? "✓" : ""}</TableCell>
                          <TableCell>{c.name || "-"}</TableCell>
                          <TableCell>{c.email || "-"}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          {scheduleStep === 2 && (
            <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
              <TextField
                type="datetime-local"
                label="Data e Hora"
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                fullWidth
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeScheduleWizard}>Cancelar</Button>
          {scheduleStep > 0 && <Button onClick={() => setScheduleStep(scheduleStep - 1)}>Voltar</Button>}
          {scheduleStep < 2 ? (
            <Button color="primary" variant="contained" onClick={() => {
              if (scheduleStep === 0 && (!selectedTemplate || !campaignName)) return;
              if (scheduleStep === 1 && recipients.length === 0) return;
              setScheduleStep(scheduleStep + 1);
            }} disabled={scheduleStep === 0 && (!selectedTemplate || !campaignName)}>
              Próximo
            </Button>
          ) : (
            <>
              <Button onClick={async () => {
                try {
                  // Resolver destinatários para EmailContacts
                  const resolveRecipientIds = async () => {
                    if (contactsSource === "email") {
                      return recipients.map(r => parseInt(String(r), 10)).filter(Boolean);
                    }
                    const ids = [];
                    for (const rid of recipients) {
                      const item = contactsList.find(x => String(x.id) === String(rid));
                      const id = await ensureEmailContactId(item);
                      if (id) ids.push(id);
                    }
                    return ids;
                  };

                  const contactIds = await resolveRecipientIds();
                  if (!contactIds.length) {
                    toast.error("Nenhum destinatário válido encontrado");
                    return;
                  }

                  const campaign = await emailService.campaigns.create({
                    templateId: selectedTemplate,
                    name: campaignName
                  });
                  await emailService.campaigns.schedule(campaign.id, { contactIds });
                  toast.success("Envio iniciado");
                  closeScheduleWizard();
                } catch {
                  toast.error("Erro ao enviar agora");
                }
              }}>Enviar Agora</Button>
              <Button color="primary" variant="contained" onClick={async () => {
                try {
                  const resolveRecipientIds = async () => {
                    if (contactsSource === "email") {
                      return recipients.map(r => parseInt(String(r), 10)).filter(Boolean);
                    }
                    const ids = [];
                    for (const rid of recipients) {
                      const item = contactsList.find(x => String(x.id) === String(rid));
                      const id = await ensureEmailContactId(item);
                      if (id) ids.push(id);
                    }
                    return ids;
                  };

                  const contactIds = await resolveRecipientIds();
                  if (!contactIds.length) {
                    toast.error("Nenhum destinatário válido encontrado");
                    return;
                  }

                  const campaign = await emailService.campaigns.create({
                    templateId: selectedTemplate,
                    name: campaignName,
                    scheduledAt: scheduleAt ? new Date(scheduleAt).toISOString() : undefined
                  });
                  await emailService.campaigns.schedule(campaign.id, {
                    contactIds,
                    scheduledAt: scheduleAt ? new Date(scheduleAt).toISOString() : undefined
                  });
                  toast.success("Agendamento criado");
                  closeScheduleWizard();
                } catch (err) {
                  toast.error("Erro ao agendar");
                }
              }}>
                Criar Agendamento
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      {activeTab === "template" && (
        <Fab onClick={() => openEditor()} style={{ position: "fixed", right: 24, bottom: 24, backgroundColor: "#131B2D", color: "#fff" }}>
          <AddIcon />
        </Fab>
      )}
      {activeTab === "agendamento" && (
        <Fab onClick={() => openScheduleWizard(recipients)} style={{ position: "fixed", right: 24, bottom: 24, backgroundColor: "#131B2D", color: "#fff" }}>
          <AddIcon />
        </Fab>
      )}
    </ActivitiesStyleLayout>
  );
};

export default EmailPage;
