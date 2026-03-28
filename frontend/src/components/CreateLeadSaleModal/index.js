import React, { useEffect, useState, useMemo, useContext } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Card,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
  Divider,
  Avatar,
  Chip,
  Paper
} from '@material-ui/core';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { makeStyles } from '@material-ui/core/styles';
import { Close as CloseIcon } from '@material-ui/icons';
import Autocomplete from "@material-ui/lab/Autocomplete";
import leadsSalesService from "../../services/leadsSalesService";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import MessagesList from "../MessagesList";
import MessageInput from "../MessageInput";
import { ReplyMessageProvider } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { ForwardMessageProvider } from "../../context/ForwarMessage/ForwardMessageContext";
import { EditMessageProvider } from "../../context/EditingMessage/EditingMessageContext";
import { QueueSelectedProvider, QueueSelectedContext } from "../../context/QueuesSelected/QueuesSelectedContext";
import NumberFormat from "react-number-format";
import inventoryService from "../../services/inventoryService";
import TicketInfo from "../TicketInfo";
import TicketActionButtons from "../TicketActionButtonsCustom";
import ContactDrawer from "../ContactDrawer";
import ArrowBackIos from "@material-ui/icons/ArrowBackIos";
import leadPipelinesService from "../../services/leadPipelinesService";

const NumberFormatCustom = (props) => {
  const { inputRef, onChange, thousandSeparator, decimalSeparator, prefix, ...other } = props;
  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({ target: { value: values.value } });
      }}
      thousandSeparator={thousandSeparator}
      decimalSeparator={decimalSeparator}
      prefix={prefix}
      decimalScale={2}
      fixedDecimalScale
      allowNegative={false}
    />
  );
};

const useStyles = makeStyles((theme) => ({
  drawerPaper: {
    width: 1120,
    maxWidth: '100%',
    padding: theme.spacing(3),
    borderRadius: 16,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    height: 'calc(100% - 32px)',
    marginRight: theme.spacing(2),
    overflow: 'hidden'
  },
  drawerPaperNarrow: {
    width: 520,
    maxWidth: '100%',
    padding: theme.spacing(3),
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
    }
  },
  sectionTitle: {
    fontWeight: 600,
    color: '#111827',
    opacity: 0.9,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing(2)
  },
  twoCols: {
    height: '100%',
    overflow: 'hidden'
  },
  leftPane: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  leftScroll: {
    flex: 1,
    overflowY: 'auto',
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(9),
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0,0,0,0.1)',
      borderRadius: '3px',
    }
  },
  rightPane: {
    height: '100%',
    borderLeft: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column'
  },
  cardRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'transparent',
    borderRadius: 8,
    padding: theme.spacing(1),
    border: 'none'
  },
  valueRow: {
    display: 'flex',
    gap: theme.spacing(1),
    width: '100%',
    alignItems: 'center'
  },
  fieldLabel: {
    fontSize: 13,
    textTransform: 'none',
    color: '#000',
    marginBottom: 6,
    fontWeight: 400
  },
  valueText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: 600
  },
  inputRoot: {
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E5E7EB !important',
      borderWidth: '1px !important'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E5E7EB !important'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E5E7EB !important',
      borderWidth: '1px !important'
    },
    '&.Mui-focused': {
      boxShadow: 'none !important'
    },
    backgroundColor: 'transparent'
  },
  notchedOutline: {
    borderColor: '#E5E7EB',
    borderWidth: 1
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden'
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5, 2),
    borderBottom: '1px solid #eee'
    },
  chatHeaderTitle: {
    marginLeft: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column'
  },
  chatStatus: {
    marginLeft: 'auto'
  },
  chatBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  ticketHeader: {
    display: "flex",
    background: theme.palette.total,
    flex: "none",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    height: 65,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    [theme.breakpoints.down("sm")]: {
      flexWrap: "wrap",
      height: "max-content"
    }
  },
  tagInputRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  actionsFooter: {
    position: 'sticky',
    bottom: 0,
    background: '#fff',
    padding: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #eee',
    zIndex: 2
  },
  priorityChip: {
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 8px',
    borderRadius: 8,
    display: 'inline-flex',
    alignItems: 'center'
  },
  prioBaixa: { backgroundColor: '#DCFCE7', color: '#166534' },
  prioMedia: { backgroundColor: '#FEF9C3', color: '#A16207' },
  prioAlta: { backgroundColor: '#FFE4D5', color: '#9A3412' },
  prioCritica: { backgroundColor: '#FEE2E2', color: '#B91C1C' }
}));

const statusOptions = [
  { value: "novo", label: "Novo Lead" },
  { value: "qualificacao", label: "Qualificação" },
  { value: "proposta", label: "Proposta" },
  { value: "negociacao", label: "Negociação" },
  { value: "fechado", label: "Fechado" }
];

export default function CreateLeadSaleModal({ open, onClose, lead, onSave, pipelineId, columns }) {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState(pipelineId || null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [phone, setPhone] = useState("");
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [productService, setProductService] = useState("");
  const [priority, setPriority] = useState("Média");
  const [currency, setCurrency] = useState("BRL");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "novo",
    value: 0,
    companyName: "",
    contactId: null,
    responsibleId: null,
    date: "",
    site: "",
    origin: "",
    document: "",
    birthDate: "",
    address: {
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: ""
    },
    tags: []
  });

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name || "",
        description: lead.description || "",
        status: lead.status || "novo",
        value: lead.value || 0,
        companyName: lead.companyName || "",
        contactId: lead.contactId || null,
        responsibleId: lead.responsibleId || null,
        date: lead.date ? String(lead.date).slice(0,10) : "",
        site: lead.site || "",
        origin: lead.origin || "",
        document: lead.document || "",
        birthDate: lead.birthDate ? String(lead.birthDate).slice(0,10) : "",
        address: {
          cep: lead.address?.cep || "",
          street: lead.address?.street || "",
          number: lead.address?.number || "",
          complement: lead.address?.complement || "",
          neighborhood: lead.address?.neighborhood || "",
          city: lead.address?.city || "",
          state: lead.address?.state || ""
        },
        tags: Array.isArray(lead.tags) ? lead.tags : []
      });
      setPhone(lead.phone || "");
      setSelectedPipelineId(lead.pipelineId ?? (pipelineId || null));
    } else {
      setForm({
        name: "",
        description: "",
        status: "novo",
        value: 0,
        companyName: "",
        contactId: null,
        responsibleId: null,
        date: "",
        site: "",
        origin: "",
        document: "",
        birthDate: "",
        address: {
          cep: "",
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: ""
        },
        tags: []
      });
      setPhone("");
    }
  }, [lead, open]);

  useEffect(() => {
    const load = async () => {
      try {
        // Carregar inventário para seleção de produto/serviço
        try {
          const data = await inventoryService.list({ searchParam: "", pageNumber: 1 });
          setInventoryItems(Array.isArray(data?.inventory) ? data.inventory : []);
        } catch { /* ignore inventário */ }
        try {
          const list = await leadPipelinesService.list();
          setPipelines(Array.isArray(list) ? list : []);
        } catch { /* ignore pipelines */ }
        const { data: contactsResp } = await api.get("/contacts/list");
        setContacts(contactsResp || []);
        const { data: usersResp } = await api.get("/users", { params: { searchParam: "" } });
        setUsers(usersResp?.users || []);
        if (lead?.contactId) {
          const c = contactsResp.find((x) => x.id === lead.contactId);
          if (c) setSelectedContact(c);
        } else {
          setSelectedContact(null);
        }
      } catch (err) {
        toastError(err);
      }
    };
    if (open) load();
  }, [open, lead]);

  useEffect(() => {
    setPhone(selectedContact?.number || "");
  }, [selectedContact]);

  const digitsPhone = useMemo(() => String(phone || "").replace(/\D/g, ""), [phone]);

  useEffect(() => {
    const resolveAvatar = async () => {
      const t = ticket;
      const contact = t?.contact || selectedContact;
      if (contact?.profilePicUrl || contact?.urlPicture) {
        setAvatarUrl(contact.profilePicUrl || contact.urlPicture);
        return;
      }
      const number = contact?.number || digitsPhone;
      if (!number) return;
      try {
        const { data } = await api.get(`/contacts/profile/${number}`);
        const url = data?.profilePicUrl || data?.urlPicture || "";
        if (url) setAvatarUrl(url);
      } catch {
        /* ignore */
      }
    };
    resolveAvatar();
  }, [ticket, selectedContact, digitsPhone]);

  useEffect(() => {
    const loadTicket = async () => {
      if (!open) return;
      if (!(lead && lead.id)) return;
      // Sem contato selecionado, sem phone digitado e sem contactId salvo => não buscar nada
      if (!selectedContact && !digitsPhone && !lead?.contactId) {
        setTicket(null);
        setTicketLoading(false);
        return;
      }
      setTicketLoading(true);
      try {
        // Obtém todas as filas para evitar restrições de visibilidade no endpoint /tickets
        let allQueueIds = [];
        try {
          const { data } = await api.get("/queue");
          allQueueIds = Array.isArray(data) ? data.map(q => q.id) : [];
        } catch { /* ignore */ }
        // 1) Tentativa rápida: recuperar último ticket persistido (por contato/telefone)
        const storageKey =
          (selectedContact?.id && `leadTicket:contact:${selectedContact.id}`) ||
          (digitsPhone && `leadTicket:phone:${digitsPhone}`) ||
          null;
        if (storageKey) {
          const cachedUuid = localStorage.getItem(storageKey);
          if (cachedUuid) {
            try {
              const { data: cachedFull } = await api.get(`/tickets/u/${cachedUuid}`);
              if (cachedFull && cachedFull.uuid) {
                setTicket(cachedFull);
                setTicketLoading(false);
                return;
              }
            } catch { /* ignore and continue fetching */ }
          }
        }

        const { data: ticketsResp } = await api.get("/tickets", {
          params: {
            searchParam: selectedContact?.number || digitsPhone,
            pageNumber: 1,
            showAll: "true",
            status: "search",
            queueIds: JSON.stringify(allQueueIds)
          }
        });
        let list = Array.isArray(ticketsResp?.tickets) ? ticketsResp.tickets : [];
        // Fallback: se a busca por número não retornar, tentar por contactId
        if ((!list || list.length === 0) && (lead?.contactId || selectedContact?.id || digitsPhone)) {
          let contactId = lead?.contactId || selectedContact?.id;
          if (!contactId && digitsPhone) {
            try {
              const prof = await api.get(`/contacts/profile/${digitsPhone}`);
              contactId = prof?.data?.contactId;
            } catch {}
          }
          if (contactId) {
            const { data: byContactData } = await api.get("/tickets", {
              params: {
                contacts: JSON.stringify([contactId]),
                pageNumber: 1,
                showAll: "true",
                status: "search",
                queueIds: JSON.stringify(allQueueIds)
              }
            });
            list = Array.isArray(byContactData?.tickets) ? byContactData.tickets : [];
          }
        }
        // Não buscar por nome quando não há contato/telefone, para evitar puxar conversa errada
        const byContactBaseId = lead?.contactId || selectedContact?.id || null;
        const byContact = byContactBaseId ? list.filter(t => String(t.contactId) === String(byContactBaseId)) : list;
        const chosen = byContact.sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
        if (chosen?.uuid) {
          const { data: full } = await api.get(`/tickets/u/${chosen.uuid}`);
          setTicket(full);
          if (storageKey) {
            localStorage.setItem(storageKey, chosen.uuid);
          }
        } else {
          // Sem match: limpar preview para não exibir conversa de outra pessoa
          setTicket(null);
        }
      } catch (err) {
        // Em caso de erro, limpamos para evitar preview incorreto
        setTicket(null);
      } finally {
        setTicketLoading(false);
      }
    };
    loadTicket();
  }, [open, lead, selectedContact, digitsPhone]);

  const pipelineTimeLabel = useMemo(() => {
    const base = lead?.createdAt ? new Date(lead.createdAt) : new Date();
    const now = new Date();
    const diffMs = now.getTime() - base.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }, [lead]);

  const QueueSetter = ({ queueId }) => {
    const { setSelectedQueuesMessage } = useContext(QueueSelectedContext);
    useEffect(() => {
      if (setSelectedQueuesMessage) {
        if (queueId) setSelectedQueuesMessage([queueId]);
        else setSelectedQueuesMessage([]);
      }
    }, [queueId, setSelectedQueuesMessage]);
    return null;
  };

  const handleChange = (field) => (e) => {
    const value = e?.target?.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleAddressChange = (field) => (e) => {
    const value = e?.target?.value;
    setForm((prev) => ({ ...prev, address: { ...(prev.address || {}), [field]: value } }));
  };

  const stageOptions = useMemo(() => {
    if (Array.isArray(columns) && columns.length) {
      return columns.map((c) => ({ value: c.key, label: c.label }));
    }
    return statusOptions;
  }, [columns]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const sanitizePhone = (v) => String(v || "").replace(/\D/g, "");
      if (selectedContact) {
        const newDigits = sanitizePhone(phone);
        const oldDigits = sanitizePhone(selectedContact.number);
        if (newDigits && newDigits !== oldDigits) {
          try {
            await api.put(`/contacts/${selectedContact.id}`, { number: newDigits });
          } catch (err) {
            toastError(err);
          }
        }
      }
      const payload = {
        name: (form.name || "").trim(),
        description: (form.description || "").trim(),
        status: form.status,
        value: Number(form.value) || 0,
        companyName: (form.companyName || "").trim() || undefined,
        phone: sanitizePhone(phone) || undefined,
        site: (form.site || "").trim() || undefined,
        origin: (form.origin || "").trim() || undefined,
        document: (form.document || "").replace(/\D/g, "") || undefined,
        birthDate: form.birthDate && String(form.birthDate).trim() !== "" ? form.birthDate : undefined,
        address: (() => {
          const a = form.address || {};
          const clean = Object.keys(a).reduce((acc, k) => {
            const v = a[k];
            if (v !== undefined && v !== null && String(v).trim() !== "") acc[k] = v;
            return acc;
          }, {});
          return Object.keys(clean).length ? clean : undefined;
        })(),
        contactId: form.contactId || undefined,
        responsibleId:
          form.responsibleId === "" || form.responsibleId === null || form.responsibleId === undefined
            ? undefined
            : Number(form.responsibleId),
        date: form.date && String(form.date).trim() !== "" ? form.date : undefined,
        tags: Array.isArray(form.tags) ? form.tags : undefined
      };
      let saved;
      const numericPipelineId = (() => {
        if (selectedPipelineId == null) return undefined;
        const s = String(selectedPipelineId).trim();
        if (s === "") return undefined;
        const n = Number(s);
        return Number.isFinite(n) ? n : undefined;
      })();
      if (lead && lead.id) {
        const payloadWithPipeline = { ...payload, pipelineId: numericPipelineId };
        saved = await leadsSalesService.update(lead.id, payloadWithPipeline);
      } else {
        const payloadWithPipeline = { ...payload, pipelineId: numericPipelineId };
        saved = await leadsSalesService.create(payloadWithPipeline);
      }
      setLoading(false);
      if (onSave) onSave(saved);
      onClose();
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  if (lead && lead.id) {
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
          <Typography variant="h6">Detalhes do Lead</Typography>
          <div style={{ width: 30 }} />
        </Box>

        <Grid container className={classes.twoCols} spacing={2}>
          <Grid item xs={12} md={4} className={classes.leftPane}>
            <div className={classes.leftScroll}>
            <div className={classes.cardRow}>
              <div style={{ width: '100%' }}>
                <div className={classes.fieldLabel}>Nome</div>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={form.name}
                  onChange={handleChange("name")}
                  InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                />
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div className={classes.cardRow}>
              <div style={{ width: '100%' }}>
                <div className={classes.fieldLabel}>Contato</div>
                <Autocomplete
                  options={contacts}
                  getOptionLabel={(c) => c?.name ? `${c.name} (${c.number})` : c?.number || ""}
                  value={selectedContact}
                  onChange={(_e, val) => {
                    setSelectedContact(val || null);
                    setForm(prev => ({ ...prev, contactId: val?.id || null }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      placeholder="Selecionar contato (opcional)"
                      InputProps={{ ...params.InputProps, classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                    />
                  )}
                />
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div className={classes.cardRow}>
              <div style={{ width: '100%' }}>
                <div className={classes.fieldLabel}>Telefone</div>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="(DDD) 9 0000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                />
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div className={classes.cardRow}>
              <div style={{ width: '100%' }}>
                <div className={classes.fieldLabel}>Nome da empresa</div>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={form.companyName}
                  onChange={handleChange("companyName")}
                  placeholder="Não definido"
                  InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                />
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div className={classes.cardRow}>
              <div style={{ width: '100%' }}>
                <div className={classes.fieldLabel}>Produto/ Serviço (inventário)</div>
                <Autocomplete
                  options={inventoryItems}
                  getOptionLabel={(opt) => `${opt?.name ?? ""} ${typeof opt?.price === "number" ? `- R$ ${opt.price?.toFixed?.(2)}` : ""}`}
                  value={inventoryItems.find(i => i.name === productService) || null}
                  onChange={(_e, val) => {
                    setProductService(val?.name || "");
                    if (val && typeof val.price !== "undefined") {
                      setForm(prev => ({ ...prev, value: Number(val.price || 0) }));
                    }
                    if (val?.currency) setCurrency(String(val.currency || "BRL").toUpperCase());
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      placeholder="Selecione um produto/serviço"
                      InputProps={{
                        ...params.InputProps,
                        classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline }
                      }}
                    />
                  )}
                />
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div className={classes.cardRow}>
              <div style={{ width: '100%' }}>
                <div className={classes.fieldLabel}>Valor</div>
                <div className={classes.valueRow}>
                    <TextField
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={form.value}
                      onChange={handleChange("value")}
                      InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                      inputMode="decimal"
                    />
                  <FormControl variant="outlined" size="small" style={{ width: 110 }}>
                    <Select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      input={<OutlinedInput classes={{ root: classes.inputRoot, notchedOutline: classes.notchedOutline }} />}
                    >
                      <MenuItem value="BRL">Real (R$)</MenuItem>
                      <MenuItem value="USD">Dólar ($)</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div className={classes.cardRow}>
              <div style={{ width: '100%' }}>
                <div className={classes.fieldLabel}>Responsável</div>
                <FormControl variant="outlined" fullWidth size="small">
                  <Select
                    value={form.responsibleId ?? ""}
                    onChange={(e) => setForm(prev => ({ ...prev, responsibleId: e.target.value === "" ? null : e.target.value }))}
                    input={<OutlinedInput classes={{ root: classes.inputRoot, notchedOutline: classes.notchedOutline }} />}
                  >
                    <MenuItem value=""><em>Sem responsável</em></MenuItem>
                    {Array.isArray(users) && users.map((u) => (
                      <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div className={classes.cardRow}>
              <div style={{ width: '100%' }}>
                <div className={classes.fieldLabel}>Pipeline</div>
                <FormControl variant="outlined" fullWidth size="small">
                  <Select
                    value={selectedPipelineId ?? ""}
                    onChange={(e) => setSelectedPipelineId(e.target.value === "" ? null : e.target.value)}
                    input={<OutlinedInput classes={{ root: classes.inputRoot, notchedOutline: classes.notchedOutline }} />}
                  >
                    <MenuItem value=""><em>Padrão</em></MenuItem>
                    {Array.isArray(pipelines) && pipelines.map((p) => (
                      <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div className={classes.cardRow}>
              <div style={{ width: '100%' }}>
                <div className={classes.fieldLabel}>Estágio</div>
                <FormControl variant="outlined" fullWidth size="small">
                  <Select
                    value={form.status}
                    onChange={handleChange("status")}
                    input={<OutlinedInput classes={{ root: classes.inputRoot, notchedOutline: classes.notchedOutline }} />}
                  >
                    {stageOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div className={classes.cardRow}>
              <div style={{ width: '100%' }}>
                <div className={classes.fieldLabel}>Site</div>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="https://..."
                  value={form.site}
                  onChange={handleChange("site")}
                  InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                />
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div className={classes.cardRow}>
              <div style={{ width: '100%' }}>
                <div className={classes.fieldLabel}>Origem</div>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="Ex.: Google, Indicação, Redes sociais"
                  value={form.origin}
                  onChange={handleChange("origin")}
                  InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                />
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div className={classes.cardRow}>
              <div style={{ width: '100%' }}>
                <div className={classes.fieldLabel}>Documento (CPF/CNPJ)</div>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="Somente números"
                  value={form.document}
                  onChange={handleChange("document")}
                  InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                />
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div className={classes.cardRow}>
              <div style={{ width: '100%' }}>
                <div className={classes.fieldLabel}>Data de Nascimento</div>
                <TextField
                  type="date"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={form.birthDate}
                  onChange={handleChange("birthDate")}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                />
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div className={classes.cardRow}>
              <div style={{ width: '100%' }}>
                <div className={classes.fieldLabel}>Endereço</div>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="CEP"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={form.address?.cep || ""}
                      onChange={handleAddressChange("cep")}
                      InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      label="Logradouro"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={form.address?.street || ""}
                      onChange={handleAddressChange("street")}
                      InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Número"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={form.address?.number || ""}
                      onChange={handleAddressChange("number")}
                      InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      label="Complemento"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={form.address?.complement || ""}
                      onChange={handleAddressChange("complement")}
                      InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Bairro"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={form.address?.neighborhood || ""}
                      onChange={handleAddressChange("neighborhood")}
                      InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Cidade"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={form.address?.city || ""}
                      onChange={handleAddressChange("city")}
                      InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="UF"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={form.address?.state || ""}
                      onChange={handleAddressChange("state")}
                      InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                    />
                  </Grid>
                </Grid>
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div className={classes.cardRow}>
              <div style={{ width: '100%' }}>
                <div className={classes.fieldLabel}>Descrição</div>
                <TextField
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  value={form.description}
                  onChange={handleChange("description")}
                  InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                />
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div className={classes.cardRow}>
              <div style={{ width: '100%' }}>
                <div className={classes.fieldLabel}>Prioridade</div>
                <FormControl variant="outlined" fullWidth size="small">
                  <Select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    input={<OutlinedInput classes={{ root: classes.inputRoot, notchedOutline: classes.notchedOutline }} />}
                  >
                    <MenuItem value="Baixa">Baixa</MenuItem>
                    <MenuItem value="Média">Média</MenuItem>
                    <MenuItem value="Alta">Alta</MenuItem>
                    <MenuItem value="Crítica">Crítica</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div className={classes.cardRow}>
              <div style={{ width: '100%' }}>
                <div className={classes.fieldLabel}>Tags</div>
                <div className={classes.tagInputRow}>
                  {Array.isArray(form.tags) && form.tags.map((t, idx) => (
                    <Chip key={`${t}-${idx}`} label={t} onDelete={() => setForm(prev => ({ ...prev, tags: prev.tags.filter((x, i) => i !== idx) }))} />
                  ))}
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Adicionar"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && tagInput.trim()) {
                        setForm(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
                        setTagInput("");
                      }
                    }}
                    style={{ minWidth: 120 }}
                    InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                  />
                </div>
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div className={classes.cardRow}>
              <div style={{ width: '100%' }}>
                <div className={classes.fieldLabel}>Tempo na pipeline</div>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={pipelineTimeLabel}
                  InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline }, readOnly: true }}
                />
              </div>
            </div>
            </div>
            <div className={classes.actionsFooter}>
              <Button onClick={onClose} variant="outlined">Cancelar</Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : null}
              >
                Salvar
              </Button>
            </div>
          </Grid>

          <Grid item xs={12} md={8} className={classes.rightPane}>
            <Card square className={classes.ticketHeader}>
              <Button color="primary" onClick={onClose}>
                <ArrowBackIos />
              </Button>
              <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                {(ticket?.contact || selectedContact) && (
                  <div id="TicketHeader" style={{ flex: "1 1 auto", minWidth: 0, overflow: "hidden" }}>
                    <TicketInfo
                      contact={ticket?.contact || selectedContact}
                      ticket={ticket || {}}
                      onClick={() => setDrawerOpen(true)}
                    />
                  </div>
                )}
                {ticket && (
                  <div style={{ flex: "none", marginLeft: "auto" }}>
                    <TicketActionButtons
                      ticket={ticket}
                      contact={ticket?.contact}
                      onQuickMessageSelect={(quickMessage) => {
                        try {
                          if (quickMessage?.message) {
                            const event = new CustomEvent('insertQuickMessage', {
                              detail: { message: quickMessage.message }
                            });
                            window.dispatchEvent(event);
                          }
                        } catch (e) {}
                      }}
                    />
                  </div>
                )}
              </div>
            </Card>
            <div className={classes.chatBody}>
              {ticketLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <CircularProgress />
                </div>
              ) : ticket ? (
                <ReplyMessageProvider>
                  <ForwardMessageProvider>
                    <EditMessageProvider>
                      <QueueSelectedProvider>
                        <QueueSetter queueId={ticket.queueId} />
                        <MessagesList
                          isGroup={ticket.isGroup}
                          onDrop={() => {}}
                          whatsappId={ticket.whatsappId}
                          queueId={ticket.queueId}
                          channel={ticket.channel}
                          ticketStatus={ticket.status}
                          ticketIdOverride={ticket.uuid}
                          ticketInternalId={ticket.id}
                        />
                        <MessageInput
                          ticketId={ticket.id}
                          ticketStatus={ticket.status}
                          ticketChannel={ticket.channel}
                          droppedFiles={[]}
                          contactId={ticket.contact?.id}
                          whatsappId={ticket.whatsappId}
                          disableAutoFocus
                          allowAiWhileClosed
                        />
                      </QueueSelectedProvider>
                    </EditMessageProvider>
                  </ForwardMessageProvider>
                </ReplyMessageProvider>
              ) : (
                <Paper style={{ margin: 16, padding: 16 }} variant="outlined">
                  <Typography variant="body2">Nenhuma conversa encontrada para este contato.</Typography>
                </Paper>
              )}
            </div>
          </Grid>
        </Grid>
        <ContactDrawer
          open={drawerOpen}
          handleDrawerClose={() => setDrawerOpen(false)}
          contact={ticket?.contact || selectedContact || {}}
          loading={ticketLoading}
          ticket={ticket || {}}
        />
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ className: classes.drawerPaperNarrow }}
      ModalProps={{ keepMounted: true }}
    >
      <Box className={classes.header}>
        <IconButton onClick={onClose} size="small" className={classes.closeButton}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6">Novo Lead</Typography>
        <div style={{ width: 30 }} />
      </Box>

      <div className={classes.contentWrapper}>
        <div className={classes.formContainer} style={{ paddingBottom: 16 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <div className={classes.cardRow}>
                <div style={{ width: '100%' }}>
                  <div className={classes.fieldLabel}>Nome</div>
                  <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={form.name}
                    onChange={handleChange("name")}
                    InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                  />
                </div>
              </div>
              <div style={{ height: 12 }} />
              <div className={classes.cardRow}>
                <div style={{ width: '100%' }}>
                  <div className={classes.fieldLabel}>Contato</div>
                  <Autocomplete
                    options={contacts}
                    getOptionLabel={(c) => c?.name ? `${c.name} (${c.number})` : c?.number || ""}
                    value={selectedContact}
                    onChange={(_e, val) => {
                      setSelectedContact(val || null);
                      setForm(prev => ({ ...prev, contactId: val?.id || null }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        placeholder="Selecionar contato (opcional)"
                        InputProps={{ ...params.InputProps, classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                      />
                    )}
                  />
                </div>
              </div>
              <div style={{ height: 12 }} />
              <div className={classes.cardRow}>
                <div style={{ width: '100%' }}>
                  <div className={classes.fieldLabel}>Telefone</div>
                  <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="(DDD) 9 0000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                  />
                </div>
              </div>
              <div style={{ height: 12 }} />
              <div className={classes.cardRow}>
                <div style={{ width: '100%' }}>
                  <div className={classes.fieldLabel}>Nome da empresa</div>
                  <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={form.companyName}
                    onChange={handleChange("companyName")}
                    placeholder="Não definido"
                    InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                  />
                </div>
              </div>
              <div style={{ height: 12 }} />
              <div className={classes.cardRow}>
                <div style={{ width: '100%' }}>
                  <div className={classes.fieldLabel}>Produto/ Serviço (inventário)</div>
                  <Autocomplete
                    options={inventoryItems}
                    getOptionLabel={(opt) => `${opt?.name ?? ""} ${typeof opt?.price === "number" ? `- R$ ${opt.price?.toFixed?.(2)}` : ""}`}
                    value={inventoryItems.find(i => i.name === productService) || null}
                    onChange={(_e, val) => {
                      setProductService(val?.name || "");
                      if (val && typeof val.price !== "undefined") {
                        setForm(prev => ({ ...prev, value: Number(val.price || 0) }));
                      }
                      if (val?.currency) setCurrency(String(val.currency || "BRL").toUpperCase());
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        placeholder="Selecione um produto/serviço"
                        InputProps={{
                          ...params.InputProps,
                          classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline }
                        }}
                      />
                    )}
                  />
                </div>
              </div>
              <div style={{ height: 12 }} />
              <div className={classes.cardRow}>
                <div style={{ width: '100%' }}>
                  <div className={classes.fieldLabel}>Valor</div>
                  <div className={classes.valueRow}>
                    <TextField
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={form.value}
                      onChange={handleChange("value")}
                      InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                      inputMode="decimal"
                    />
                    <FormControl variant="outlined" size="small" style={{ width: 110 }}>
                      <Select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        input={<OutlinedInput classes={{ root: classes.inputRoot, notchedOutline: classes.notchedOutline }} />}
                      >
                        <MenuItem value="BRL">Real (R$)</MenuItem>
                        <MenuItem value="USD">Dólar ($)</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>
              </div>
              <div style={{ height: 12 }} />
              <div className={classes.cardRow}>
                <div style={{ width: '100%' }}>
                  <div className={classes.fieldLabel}>Responsável</div>
                  <FormControl variant="outlined" fullWidth size="small">
                    <Select
                      value={form.responsibleId ?? ""}
                      onChange={(e) => setForm(prev => ({ ...prev, responsibleId: e.target.value === "" ? null : e.target.value }))}
                      input={<OutlinedInput classes={{ root: classes.inputRoot, notchedOutline: classes.notchedOutline }} />}
                    >
                      <MenuItem value=""><em>Sem responsável</em></MenuItem>
                      {Array.isArray(users) && users.map((u) => (
                        <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>
              <div style={{ height: 12 }} />
              <div className={classes.cardRow}>
                <div style={{ width: '100%' }}>
                  <div className={classes.fieldLabel}>Pipeline</div>
                  <FormControl variant="outlined" fullWidth size="small">
                    <Select
                      value={selectedPipelineId ?? ""}
                      onChange={(e) => setSelectedPipelineId(e.target.value === "" ? null : e.target.value)}
                      input={<OutlinedInput classes={{ root: classes.inputRoot, notchedOutline: classes.notchedOutline }} />}
                    >
                      <MenuItem value=""><em>Padrão</em></MenuItem>
                      {Array.isArray(pipelines) && pipelines.map((p) => (
                        <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>
              <div style={{ height: 12 }} />
              <div className={classes.cardRow}>
                <div style={{ width: '100%' }}>
                  <div className={classes.fieldLabel}>Estágio</div>
                  <FormControl variant="outlined" fullWidth size="small">
                    <Select
                      value={form.status}
                      onChange={handleChange("status")}
                      input={<OutlinedInput classes={{ root: classes.inputRoot, notchedOutline: classes.notchedOutline }} />}
                    >
                      {stageOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>
              <div style={{ height: 12 }} />
              <div className={classes.cardRow}>
                <div style={{ width: '100%' }}>
                  <div className={classes.fieldLabel}>Site</div>
                  <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="https://..."
                    value={form.site}
                    onChange={handleChange("site")}
                    InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                  />
                </div>
              </div>
              <div style={{ height: 12 }} />
              <div className={classes.cardRow}>
                <div style={{ width: '100%' }}>
                  <div className={classes.fieldLabel}>Origem</div>
                  <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="Ex.: Google, Indicação, Redes sociais"
                    value={form.origin}
                    onChange={handleChange("origin")}
                    InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                  />
                </div>
              </div>
              <div style={{ height: 12 }} />
              <div className={classes.cardRow}>
                <div style={{ width: '100%' }}>
                  <div className={classes.fieldLabel}>Documento (CPF/CNPJ)</div>
                  <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="Somente números"
                    value={form.document}
                    onChange={handleChange("document")}
                    InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                  />
                </div>
              </div>
              <div style={{ height: 12 }} />
              <div className={classes.cardRow}>
                <div style={{ width: '100%' }}>
                  <div className={classes.fieldLabel}>Data de Nascimento</div>
                  <TextField
                    type="date"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={form.birthDate}
                    onChange={handleChange("birthDate")}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                  />
                </div>
              </div>
              <div style={{ height: 12 }} />
              <div className={classes.cardRow}>
                <div style={{ width: '100%' }}>
                  <div className={classes.fieldLabel}>Endereço</div>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="CEP"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={form.address?.cep || ""}
                        onChange={handleAddressChange("cep")}
                        InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <TextField
                        label="Logradouro"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={form.address?.street || ""}
                        onChange={handleAddressChange("street")}
                        InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Número"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={form.address?.number || ""}
                        onChange={handleAddressChange("number")}
                        InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <TextField
                        label="Complemento"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={form.address?.complement || ""}
                        onChange={handleAddressChange("complement")}
                        InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Bairro"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={form.address?.neighborhood || ""}
                        onChange={handleAddressChange("neighborhood")}
                        InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Cidade"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={form.address?.city || ""}
                        onChange={handleAddressChange("city")}
                        InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        label="UF"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={form.address?.state || ""}
                        onChange={handleAddressChange("state")}
                        InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                      />
                    </Grid>
                  </Grid>
                </div>
              </div>
              <div style={{ height: 12 }} />
              <div className={classes.cardRow}>
                <div style={{ width: '100%' }}>
                  <div className={classes.fieldLabel}>Descrição</div>
                  <TextField
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    value={form.description}
                    onChange={handleChange("description")}
                    InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                  />
                </div>
              </div>
              <div style={{ height: 12 }} />
              <div className={classes.cardRow}>
                <div style={{ width: '100%' }}>
                  <div className={classes.fieldLabel}>Prioridade</div>
                  <FormControl variant="outlined" fullWidth size="small">
                    <Select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      input={<OutlinedInput classes={{ root: classes.inputRoot, notchedOutline: classes.notchedOutline }} />}
                      renderValue={(val) => {
                        const mapClass = {
                          'Baixa': classes.prioBaixa,
                          'Média': classes.prioMedia,
                          'Alta': classes.prioAlta,
                          'Crítica': classes.prioCritica
                        };
                        return <span className={`${classes.priorityChip} ${mapClass[val] || ''}`}>{val}</span>;
                      }}
                    >
                      <MenuItem value="Baixa"><span className={`${classes.priorityChip} ${classes.prioBaixa}`}>Baixa</span></MenuItem>
                      <MenuItem value="Média"><span className={`${classes.priorityChip} ${classes.prioMedia}`}>Média</span></MenuItem>
                      <MenuItem value="Alta"><span className={`${classes.priorityChip} ${classes.prioAlta}`}>Alta</span></MenuItem>
                      <MenuItem value="Crítica"><span className={`${classes.priorityChip} ${classes.prioCritica}`}>Crítica</span></MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>
              <div style={{ height: 12 }} />
              <div className={classes.cardRow}>
                <div style={{ width: '100%' }}>
                  <div className={classes.fieldLabel}>Tags</div>
                  <div className={classes.tagInputRow}>
                    {Array.isArray(form.tags) && form.tags.map((t, idx) => (
                      <Chip key={`${t}-${idx}`} label={t} onDelete={() => setForm(prev => ({ ...prev, tags: prev.tags.filter((x, i) => i !== idx) }))} />
                    ))}
                    <TextField
                      variant="outlined"
                      size="small"
                      placeholder="Adicionar"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && tagInput.trim()) {
                          setForm(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
                          setTagInput("");
                        }
                      }}
                      style={{ minWidth: 120 }}
                      InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline } }}
                    />
                  </div>
                </div>
              </div>
              <div style={{ height: 12 }} />
              <div className={classes.cardRow}>
                <div style={{ width: '100%' }}>
                  <div className={classes.fieldLabel}>Tempo na pipeline</div>
                  <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={pipelineTimeLabel}
                    InputProps={{ classes: { root: classes.inputRoot, notchedOutline: classes.notchedOutline }, readOnly: true }}
                  />
                </div>
              </div>
            </Grid>
          </Grid>
        </div>
        <div className={classes.actionsFooter}>
          <Button onClick={onClose} variant="outlined">Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            Criar
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
