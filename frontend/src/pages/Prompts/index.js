import React, { useContext, useEffect, useReducer, useState } from "react";

import {
  Box,
  Button,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Chip,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

import TableRowSkeleton from "../../components/TableRowSkeleton";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { WorkOutline as WorkOutlineIcon, Memory as MemoryIcon, FlashOn as FlashOnIcon, BugReport as BugReportIcon, Business, Flag, Gavel, Category as CategoryIcon, InfoOutlined, EventNote, PersonAdd, Assignment, DragHandle, NotificationsActive, PermMedia, Note, TrendingUp, Repeat, LocalOffer, SwapHoriz } from "@material-ui/icons";
// Ícone oficial da OpenAI via react-icons (simple-icons)
import { SiOpenai } from "react-icons/si";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Auth/AuthContext";
import ForbiddenPage from "../../components/ForbiddenPage";
import ActivitiesStyleLayout from "../../components/ActivitiesStyleLayout";
import SectionCard from "./components/shared/SectionCard";
import ProactivityTab from "./components/ProactivityTab";
import MediaTab from "./components/MediaTab";
import IntegrationTab from "./components/IntegrationTab";
import { mergeProactiveFromApi } from "./utils/mergeProactiveFromApi";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1, 2),
    overflow: "visible"
  },
  mainPaperTight: {
    paddingTop: theme.spacing(0)
  },
  card: {
    background: "transparent",
    border: "none",
    borderRadius: 0,
    padding: 0,
    boxShadow: "none",
    height: "100%"
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6
  },
  labelSmall: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
    display: "block"
  },
  inputDense: {
    marginTop: 2,
    marginBottom: 4,
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#fff',
      borderRadius: 10
    },
    '& .MuiOutlinedInput-input': {
      padding: '6px 10px',
      fontSize: 13,
      lineHeight: 1.4
    },
    '& .MuiOutlinedInput-inputMultiline': {
      fontSize: 13,
      lineHeight: 1.4
    },
    '& input::placeholder': {
      fontSize: 13,
      opacity: 0.8
    },
    '& textarea::placeholder': {
      fontSize: 13,
      opacity: 0.8
    }
  },
  selectWhite: {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#fff',
      borderRadius: 10,
    },
    '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
      borderColor: '#e5e7eb',
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#d1d5db',
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#cbd5e1',
    },
    '& .MuiSelect-select': {
      backgroundColor: '#fff',
      fontSize: 13,
    },
  },
  section: {
    marginBottom: theme.spacing(2)
  },
  switchRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 10
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  formRow: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  statusBadgeOk: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: 8,
    background: "#E6F4EA",
    color: "#1E7E34",
    fontSize: 12,
    fontWeight: 600
  },
  statusBadgeWarn: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: 8,
    background: "#FFF4E5",
    color: "#8A6D3B",
    fontSize: 12,
    fontWeight: 600
  },
  statusRow: {
    display: "flex",
    gap: theme.spacing(2),
    alignItems: "center",
    marginTop: theme.spacing(1)
  },
  tabsContainer: {
    background: "#fff",
    borderRadius: 8,
    marginBottom: theme.spacing(2)
  },
  rightModelCard: {
    background: "transparent",
    border: "none",
    borderRadius: 0,
    padding: theme.spacing(0, 0, 0, 1),
    boxShadow: "none",
    height: "100%"
  },
  rightSection: {
    borderTop: "1px solid #f1f5f9",
    marginTop: 10,
    paddingTop: 10
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12
  },
  tipBox: {
    background: "#F9FAFB",
    border: "1px dashed #e5e7eb",
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    color: "#4b5563",
    marginTop: 10
  },
  brainWrapper: {
    padding: 0,
    borderRadius: 0,
    background: "transparent"
  },
  actionItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    border: "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: 12,
    marginBottom: 8,
    cursor: "pointer",
    minHeight: 88,
    height: "100%"
  },
  uploadBox: {
    border: "1px dashed #cbd5e1",
    background: "#F8FAFC",
    borderRadius: 10,
    padding: 12
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280"
  },
  expandableWrapper: {
    position: "relative"
  },
  resizableInput: {
    resize: "none",
    minHeight: 96,
    maxHeight: 480,
    overflow: "auto"
  },
  resizeHandle: {
    position: "absolute",
    right: 10,
    bottom: 8,
    opacity: 0.45,
    cursor: "ns-resize",
    userSelect: "none"
  },
  summaryRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  pageContent: {
    width: "100%",
    maxWidth: "100%",
    padding: theme.spacing(0, 1)
  },
  formFooterBar: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: theme.spacing(1)
  },
  brainSectionCard: {
    marginBottom: theme.spacing(2)
  },
  qaListRow: {
    padding: "8px 0",
    borderBottom: "1px solid #f1f5f9"
  },
  chatTesterShell: {
    display: "flex",
    flexDirection: "column",
    height: 480,
    maxHeight: "60vh"
  },
  chatTesterMessages: {
    flex: 1,
    overflowY: "auto",
    padding: theme.spacing(1),
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    marginBottom: theme.spacing(1),
    background: "#fafafa"
  },
  chatBubbleUser: {
    maxWidth: "80%",
    padding: "8px 12px",
    borderRadius: 14,
    background: "#131B2D",
    color: "#fff"
  },
  chatBubbleAssistant: {
    maxWidth: "80%",
    padding: "8px 12px",
    borderRadius: 14,
    background: "#e5e7eb",
    color: "#111"
  },
  sectionCardSpacing: {
    marginBottom: theme.spacing(1)
  },
  sectionCardSpacingTop: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  promptsAccordion: {
    marginTop: theme.spacing(1),
    background: "transparent",
    border: "none",
    borderBottom: "1px solid #e5e7eb",
    borderRadius: 0,
    boxShadow: "none",
    "&:before": { display: "none" }
  },
  integrationTabRoot: {
    paddingTop: theme.spacing(2)
  },
}));

const ExpandableField = ({
  label,
  value,
  onChange,
  className,
  InputProps,
  InputLabelProps,
  minRows = 4,
  maxRows = 14,
  placeholder
}) => {
  const classes = useStyles();
  const inputRef = React.useRef(null);
  const wrapperRef = React.useRef(null);
  const [rows, setRows] = useState(() => {
    const text = String(value || "");
    const lines = text.split("\n").length + 1;
    return Math.min(maxRows, Math.max(minRows, lines));
  });

  useEffect(() => {
    const text = String(value || "");
    const lines = text.split("\n").length + 1;
    setRows(Math.min(maxRows, Math.max(minRows, lines)));
  }, [value, minRows, maxRows]);

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", onStop);
    };
  }, []);

  let startY = 0;
  let startH = 0;

  const onStart = (e) => {
    const ta = inputRef.current;
    if (!ta) return;
    startY = e.clientY;
    startH = ta.clientHeight;
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", onStop);
    e.preventDefault();
  };

  const onDrag = (e) => {
    const ta = inputRef.current;
    if (!ta) return;
    const dy = e.clientY - startY;
    const next = Math.max(96, Math.min(480, startH + dy));
    ta.style.height = `${next}px`;
  };

  const onStop = () => {
    window.removeEventListener("mousemove", onDrag);
    window.removeEventListener("mouseup", onStop);
  };

  return (
    <div className={classes.expandableWrapper} ref={wrapperRef}>
      <TextField
        label={label}
        value={value}
        onChange={onChange}
        fullWidth
        variant="outlined"
        multiline
        rows={rows}
        className={className}
        InputProps={{
          ...(InputProps || {}),
          classes: {
            ...(InputProps && InputProps.classes ? InputProps.classes : {}),
            inputMultiline: classes.resizableInput
          }
        }}
        InputLabelProps={InputLabelProps}
        placeholder={placeholder}
        inputRef={inputRef}
      />
      <DragHandle fontSize="small" className={classes.resizeHandle} onMouseDown={onStart} />
    </div>
  );
};

const reducer = (state, action) => {
  if (action.type === "LOAD_PROMPTS") {
    const prompts = action.payload;
    const newPrompts = [];

    prompts.forEach((prompt) => {
      const promptIndex = state.findIndex((p) => p.id === prompt.id);
      if (promptIndex !== -1) {
        state[promptIndex] = prompt;
      } else {
        newPrompts.push(prompt);
      }
    });

    return [...state, ...newPrompts];
  }

  if (action.type === "UPDATE_PROMPTS") {
    const prompt = action.payload;
    const promptIndex = state.findIndex((p) => p.id === prompt.id);

    if (promptIndex !== -1) {
      state[promptIndex] = prompt;
      return [...state];
    } else {
      return [prompt, ...state];
    }
  }

  if (action.type === "DELETE_PROMPT") {
    const promptId = action.payload;
    const promptIndex = state.findIndex((p) => p.id === promptId);
    if (promptIndex !== -1) {
      state.splice(promptIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Prompts = () => {
  const classes = useStyles();

  const [prompts, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);

  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  //   const socketManager = useContext(SocketContext);
  const { user, socket } = useContext(AuthContext);

  const companyId = user.companyId;
  const [activeTab, setActiveTab] = useState("integracao");

  const [integrationState, setIntegrationState] = useState({
    apiKey: "",
    model: "gpt-4o-mini",
    aplicarTodos: false,
    status: { whatsapp: false, apiKey: "desconhecido" },
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,
    stopSequences: "###, FIM",
    active: true,
    scope: "Pessoal",
    responderGrupo: false
  });
  const [showApiKey, setShowApiKey] = useState(false);

  const [roleState, setRoleState] = useState({
    agente: "",
    funcao: "",
    personalidade: "",
    instrucoes: "",
    formalidade: "",
    saudacao: "",
    despedida: "",
    emojis: "",
    idioma: "",
    empresaContexto: "",
    objetivoAgente: "",
    regrasRestricoes: "",
    nichoEmpresa: ""
  });

  const [brainState, setBrainState] = useState({
    fileListId: null,
    websites: [],
    qna: []
  });
  const [brainFiles, setBrainFiles] = useState([]);
  const [newWebsite, setNewWebsite] = useState("");
  const [newQa, setNewQa] = useState({ pergunta: "", resposta: "", categoria: "" });

  const [createPromptForm, setCreatePromptForm] = useState({
    name: "",
    apiKey: "",
    prompt: "",
    queueId: null,
    voice: "texto",
    voiceKey: "",
    voiceRegion: "",
    temperature: 1,
    maxTokens: 100,
    maxMessages: 10
  });
  const [queues, setQueues] = useState([]);
  const [tags, setTags] = useState([]);
  const [contactLists, setContactLists] = useState([]);
  const emptySeg = () => ({ tagIds: [], contactListId: "" });
  const [proactiveState, setProactiveState] = useState({
    enabled: false,
    followUpEnabled: true,
    hotLeadEnabled: true,
    reengagementEnabled: true,
    followUpAfterDays: 2,
    reengageAfterWeeks: 2,
    hotLeadKeywords: "preço, proposta, orçamento, quero, valor, contratar",
    useHotLeadButtons: true,
    openAiVisionInbound: false,
    acknowledgeMedia: true,
    hintFollowUp: "",
    hintHotLead: "",
    hintReengagement: "",
    hintColdOutreach: "",
    objectives: {
      follow_up: "",
      hot_lead: "",
      reengagement: "",
      cold_outreach: "",
      inbound: ""
    },
    segments: {
      follow_up: emptySeg(),
      hot_lead: emptySeg(),
      reengagement: emptySeg(),
      cold_outreach: emptySeg()
    },
    businessHoursEnabled: false,
    businessStartHour: 9,
    businessEndHour: 18,
    playbook: "",
    mediaByContext: {},
    defaultOutbound: { allowAgentToSuggestUrls: false },
    maxProactivePerContactPerDay: "",
    sequenceSteps: [],
    coldOutreachBlendMode: "merge",
    applySegmentFilters: true,
    proactiveMission: "balanced",
    maxFollowUpAttempts: 3,
    minHoursBetweenFollowUps: "",
    maxReengagementAttempts: "",
    customProactiveText: {
      follow_up: "",
      hot_lead: "",
      reengagement: "",
      cold_outreach: ""
    },
    inboundConversationBrief: "",
    inboundMediaOnlyFirstResponse: false
  });
  const [actionsState, setActionsState] = useState({
    enabled: ["Agendamento"],
    custom: [],
    transferChamado: { queueId: "", userId: "" }
  });
  const [actionsUsers, setActionsUsers] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const openAiModels = [
    "gpt-4o-mini",
    "gpt-4o",
    "gpt-4.1",
    "gpt-4.1-mini",
    "o3",
    "o3-mini",
    "gpt-4o-realtime-preview-2024-12-17",
    "gpt-4o-audio-preview-2024-12-17",
    "gpt-4o-mini-tts",
    "text-embedding-3-large",
    "text-embedding-3-small",
    "text-embedding-ada-002"
  ];
  const modelInfo = {
    "gpt-4o-mini": { title: "GPT‑4o Mini", desc: "Rápido e econômico, ideal para chat e automações.", capability: "Texto", context: "128K", output: "16K", speed: "Muito rápido", quality: "Alta", cost: "Baixo", iconColor: "#10a37f" },
    "gpt-4o": { title: "GPT‑4o", desc: "Multimodal equilibrado para qualidade geral.", capability: "Texto/Imagem/Áudio", context: "128K", output: "16K", speed: "Rápido", quality: "Muito alta", cost: "Médio", iconColor: "#0a7f66" },
    "gpt-4.1": { title: "GPT‑4.1", desc: "Alta qualidade de raciocínio.", capability: "Texto", context: "200K", output: "??", speed: "Médio", quality: "Alta", cost: "Médio", iconColor: "#0f766e" },
    "gpt-4.1-mini": { title: "GPT‑4.1 Mini", desc: "Ótimo custo/benefício.", capability: "Texto", context: "128K", output: "16K", speed: "Muito rápido", quality: "Boa", cost: "Baixo", iconColor: "#0ea5a4" },
    "o3": { title: "o3", desc: "Raciocínio avançado.", capability: "Texto", context: "200K", output: "??", speed: "Médio", quality: "Alta", cost: "Alto", iconColor: "#0284c7" },
    "o3-mini": { title: "o3-mini", desc: "Raciocínio econômico.", capability: "Texto", context: "128K", output: "??", speed: "Rápido", quality: "Boa", cost: "Baixo", iconColor: "#22c55e" },
    "gpt-4o-realtime-preview-2024-12-17": { title: "GPT‑4o Realtime Preview", desc: "Experimentos de voz/tempo real.", capability: "Voz/Tempo real", context: "-", output: "-", speed: "Muito rápido", quality: "Boa", cost: "Médio", iconColor: "#3b82f6" },
    "gpt-4o-audio-preview-2024-12-17": { title: "GPT‑4o Audio Preview", desc: "Geração/entendimento de áudio.", capability: "Áudio", context: "-", output: "-", speed: "Rápido", quality: "Boa", cost: "Médio", iconColor: "#8b5cf6" },
    "gpt-4o-mini-tts": { title: "GPT‑4o Mini TTS", desc: "Texto para fala (TTS).", capability: "TTS", context: "-", output: "-", speed: "Rápido", quality: "Boa", cost: "Baixo", iconColor: "#0ea5a4" },
    "text-embedding-3-large": { title: "Embeddings 3 Large", desc: "Vetores de alta qualidade.", capability: "Embeddings", context: "-", output: "-", speed: "Rápido", quality: "Alta", cost: "Médio", iconColor: "#64748b" },
    "text-embedding-3-small": { title: "Embeddings 3 Small", desc: "Custo reduzido.", capability: "Embeddings", context: "-", output: "-", speed: "Rápido", quality: "Boa", cost: "Baixo", iconColor: "#94a3b8" },
    "text-embedding-ada-002": { title: "Embeddings Ada 002", desc: "Legado.", capability: "Embeddings", context: "-", output: "-", speed: "Rápido", quality: "Média", cost: "Baixo", iconColor: "#94a3b8" }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/prompt");
        dispatch({ type: "LOAD_PROMPTS", payload: data.prompts });

        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    // const socket = socketManager.GetSocket();

    const onPromptEvent = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_PROMPTS", payload: data.prompt });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_PROMPT", payload: data.promptId });
      }
    };

    socket.on(`company-${companyId}-prompt`, onPromptEvent);
    return () => {
      socket.off(`company-${companyId}-prompt`, onPromptEvent);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !user || !user.companyId) return;
    const onSettingsEvent = (data) => {
      if (data?.action !== "update" || !data?.setting) return;
      const { key, value } = data.setting || {};
      let parsed = value;
      try {
        parsed = typeof value === "string" ? JSON.parse(value) : value;
      } catch {
        parsed = value;
      }
      if (key === "agent_integration" && parsed) {
        setIntegrationState((prev) => ({ ...prev, ...parsed }));
      }
      if (key === "agent_role" && parsed) {
        setRoleState((prev) => ({ ...prev, ...parsed }));
      }
      if (key === "agent_brain" && parsed) {
        setBrainState((prev) => ({ ...prev, ...parsed }));
      }
      if (key === "agent_proactive" && parsed) {
        setProactiveState((prev) => mergeProactiveFromApi(prev, parsed));
      }
      if (key === "agent_actions" && parsed) {
        setActionsState((prev) => ({
          ...prev,
          ...parsed,
          transferChamado: parsed.transferChamado
            ? {
                queueId:
                  parsed.transferChamado.queueId != null && parsed.transferChamado.queueId !== ""
                    ? parsed.transferChamado.queueId
                    : "",
                userId:
                  parsed.transferChamado.userId != null && parsed.transferChamado.userId !== ""
                    ? parsed.transferChamado.userId
                    : ""
              }
            : prev.transferChamado
        }));
      }
    };
    socket.on(`company-${user.companyId}-settings`, onSettingsEvent);
    return () => {
      socket.off(`company-${user.companyId}-settings`, onSettingsEvent);
    };
  }, [socket, user]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/settings/agent_integration");
        if (data && data.value) {
          const v = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
          setIntegrationState(prev => ({
            ...prev,
            ...v,
            responderGrupo: typeof v.responderGrupo === "boolean" ? v.responderGrupo : prev.responderGrupo
          }));
        }
      } catch {}
      try {
        const { data } = await api.get("/whatsapp/");
        const ok = Array.isArray(data) && data.some(w => String(w.status).toUpperCase().includes("CONNECT"));
        setIntegrationState(prev => ({
          ...prev,
          status: { ...prev.status, whatsapp: !!ok }
        }));
      } catch {}
      try {
        const { data } = await api.get("/settings/agent_role");
        if (data && data.value) {
          const v = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
          setRoleState(prev => ({ ...prev, ...v }));
        }
      } catch {}
      try {
        const { data } = await api.get("/settings/agent_brain");
        if (data && data.value) {
          const v = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
          setBrainState(prev => ({ ...prev, ...v }));
        }
      } catch {}
      try {
        const { data } = await api.get("/settings/agent_proactive");
        if (data && data.value) {
          const v = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
          setProactiveState((prev) => mergeProactiveFromApi(prev, v));
        }
      } catch {}
      try {
        const { data } = await api.get("/settings/agent_actions");
        if (data && data.value) {
          const v = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
          setActionsState(prev => ({
            ...prev,
            ...v,
            transferChamado: {
              queueId: v?.transferChamado?.queueId != null && v.transferChamado.queueId !== ""
                ? v.transferChamado.queueId
                : "",
              userId: v?.transferChamado?.userId != null && v.transferChamado.userId !== ""
                ? v.transferChamado.userId
                : ""
            }
          }));
        }
      } catch {}
      try {
        const { data } = await api.get("/queue");
        setQueues(data || []);
      } catch {}
      try {
        const { data: usersResp } = await api.get("/users", { params: { searchParam: "" } });
        setActionsUsers(Array.isArray(usersResp?.users) ? usersResp.users : []);
      } catch {}
      try {
        const { data: tagData } = await api.get("/tags/list");
        setTags(Array.isArray(tagData) ? tagData : []);
      } catch {}
      try {
        const { data: listData } = await api.get("/contact-lists/", {
          params: { pageNumber: "1" }
        });
        setContactLists(listData?.records || []);
      } catch {}
    })();
  }, []);

  const handleOpenPromptModal = () => {};
  const handleClosePromptModal = () => {};
  const handleEditPrompt = () => {};
  const handleCloseConfirmationModal = () => {};
  const handleDeletePrompt = async () => {};

  const saveSetting = async (key, value, successMessage) => {
    try {
      const { data } = await api.put(`/settings/${key}`, { value });
      toast.success(successMessage || "Configurações salvas");
      return data;
    } catch (err) {
      if (err?.response?.status === 403) {
        toast.error("Apenas administradores podem salvar estas configurações.");
      } else {
        toastError(err);
      }
      return null;
    }
  };

  const canSaveAgentSettings =
    user?.profile === "admin" || user?.super === true;

  const refetchProactiveSettings = async () => {
    try {
      const { data } = await api.get("/settings/agent_proactive");
      if (data && data.value) {
        const v = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
        setProactiveState((prev) => mergeProactiveFromApi(prev, v));
      }
    } catch (e) {
      toastError(e);
    }
  };

  const handleSaveIntegration = async () => {
    const { status, ...rest } = integrationState;
    await saveSetting("agent_integration", rest);
  };

  const handleSaveRole = async () => {
    await saveSetting("agent_role", roleState);
  };
  const sanitizeMediaByContext = (raw) => {
    if (!raw || typeof raw !== "object") return undefined;
    const out = {};
    ["follow_up", "hot_lead", "reengagement", "cold_outreach", "inbound"].forEach((ctx) => {
      const v = raw[ctx];
      if (!v || typeof v !== "object") return;
      const imageUrls = (v.imageUrls || []).map(String).map((s) => s.trim()).filter(Boolean);
      const documentUrls = (v.documentUrls || []).map(String).map((s) => s.trim()).filter(Boolean);
      const videoUrls = (v.videoUrls || []).map(String).map((s) => s.trim()).filter(Boolean);
      const delayAfterTextSec = Math.min(180, Math.max(0, Number(v.delayAfterTextSec) || 0));
      const skipIfRecentOutboundMedia = !!v.skipIfRecentOutboundMedia;
      const beforeMediaContext = String(v.beforeMediaContext || "").trim();
      if (
        !imageUrls.length &&
        !documentUrls.length &&
        !videoUrls.length &&
        !delayAfterTextSec &&
        !skipIfRecentOutboundMedia &&
        !beforeMediaContext
      ) {
        return;
      }
      out[ctx] = {
        imageUrls,
        documentUrls,
        videoUrls
      };
      if (delayAfterTextSec > 0) out[ctx].delayAfterTextSec = delayAfterTextSec;
      if (skipIfRecentOutboundMedia) out[ctx].skipIfRecentOutboundMedia = true;
      if (beforeMediaContext) out[ctx].beforeMediaContext = beforeMediaContext;
    });
    return Object.keys(out).length ? out : undefined;
  };

  const buildProactivePayload = () => {
    const hints = {
      follow_up: proactiveState.hintFollowUp || undefined,
      hot_lead: proactiveState.hintHotLead || undefined,
      reengagement: proactiveState.hintReengagement || undefined,
      cold_outreach: proactiveState.hintColdOutreach || undefined
    };
    const objectives = {};
    ["follow_up", "hot_lead", "reengagement", "cold_outreach", "inbound"].forEach((k) => {
      const t = (proactiveState.objectives && proactiveState.objectives[k]) || "";
      if (t.trim()) objectives[k] = t.trim();
    });
    const segments = {};
    ["follow_up", "hot_lead", "reengagement", "cold_outreach"].forEach((k) => {
      const s = proactiveState.segments?.[k] || {};
      const tagIds = (s.tagIds || []).filter(Boolean);
      const lid = s.contactListId === "" || s.contactListId == null ? null : Number(s.contactListId);
      if (tagIds.length || (lid && lid > 0)) {
        segments[k] = {};
        if (tagIds.length) segments[k].tagIds = tagIds;
        if (lid && lid > 0) segments[k].contactListId = lid;
      }
    });
    const seq = (proactiveState.sequenceSteps || [])
      .filter(st => st && Number(st.delayHours) > 0)
      .map(st => ({
        delayHours: Number(st.delayHours),
        hint: (st.hint && st.hint.trim()) || undefined
      }));
    const maxDay = parseInt(String(proactiveState.maxProactivePerContactPerDay || ""), 10);
    const customProactiveText = {};
    ["follow_up", "hot_lead", "reengagement", "cold_outreach"].forEach((k) => {
      const t = (proactiveState.customProactiveText && proactiveState.customProactiveText[k]) || "";
      if (String(t).trim()) customProactiveText[k] = String(t).trim();
    });
    const maxReRaw = parseInt(String(proactiveState.maxReengagementAttempts || ""), 10);
    return {
      enabled: proactiveState.enabled,
      followUpEnabled: proactiveState.followUpEnabled,
      hotLeadEnabled: proactiveState.hotLeadEnabled,
      reengagementEnabled: proactiveState.reengagementEnabled,
      followUpAfterDays: Number(proactiveState.followUpAfterDays) || 2,
      reengageAfterWeeks: Number(proactiveState.reengageAfterWeeks) || 2,
      hotLeadKeywords: String(proactiveState.hotLeadKeywords || "")
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean),
      useHotLeadButtons: proactiveState.useHotLeadButtons,
      openAiVisionInbound: proactiveState.openAiVisionInbound,
      acknowledgeMedia: proactiveState.acknowledgeMedia,
      hints,
      objectives: Object.keys(objectives).length ? objectives : undefined,
      playbook: proactiveState.playbook || undefined,
      inboundConversationBrief: String(proactiveState.inboundConversationBrief || "").trim() || undefined,
      inboundMediaOnlyFirstResponse: proactiveState.inboundMediaOnlyFirstResponse ? true : undefined,
      segments: Object.keys(segments).length ? segments : undefined,
      businessHours: proactiveState.businessHoursEnabled
        ? {
            enabled: true,
            startHour: Math.min(23, Math.max(0, Number(proactiveState.businessStartHour) || 9)),
            endHour: Math.min(24, Math.max(0, Number(proactiveState.businessEndHour) || 18))
          }
        : { enabled: false },
      mediaByContext: sanitizeMediaByContext(proactiveState.mediaByContext),
      coldOutreachBlendMode:
        proactiveState.coldOutreachBlendMode && proactiveState.coldOutreachBlendMode !== "merge"
          ? proactiveState.coldOutreachBlendMode
          : undefined,
      defaultOutbound: proactiveState.defaultOutbound?.allowAgentToSuggestUrls
        ? { allowAgentToSuggestUrls: true }
        : undefined,
      maxProactivePerContactPerDay: Number.isFinite(maxDay) && maxDay > 0 ? maxDay : undefined,
      sequences: seq.length ? { cold_outreach: seq } : undefined,
      applySegmentFilters: proactiveState.applySegmentFilters !== false,
      proactiveMission: proactiveState.proactiveMission || "balanced",
      maxFollowUpAttempts: Math.min(
        15,
        Math.max(1, Number(proactiveState.maxFollowUpAttempts) || 3)
      ),
      minHoursBetweenFollowUps: (() => {
        const n = parseInt(String(proactiveState.minHoursBetweenFollowUps || ""), 10);
        return Number.isFinite(n) && n > 0 ? Math.min(168, n) : undefined;
      })(),
      maxReengagementAttempts:
        Number.isFinite(maxReRaw) && maxReRaw > 0 ? Math.min(50, maxReRaw) : undefined,
      customProactiveText:
        Object.keys(customProactiveText).length > 0 ? customProactiveText : undefined
    };
  };

  const handleSaveProactive = async () => {
    if (!canSaveAgentSettings) {
      toast.error("Apenas administradores podem salvar estas configurações.");
      return;
    }
    const ok = await saveSetting(
      "agent_proactive",
      buildProactivePayload(),
      "Proatividade salva"
    );
    if (ok) await refetchProactiveSettings();
  };
  const handleSaveMedia = async () => {
    if (!canSaveAgentSettings) {
      toast.error("Apenas administradores podem salvar estas configurações.");
      return;
    }
    const ok = await saveSetting(
      "agent_proactive",
      buildProactivePayload(),
      "Mídias salvas"
    );
    if (ok) await refetchProactiveSettings();
  };
  const handleSaveActions = async () => {
    if (actionsState.enabled?.includes("Transferir Chamado")) {
      const q = actionsState.transferChamado?.queueId;
      const u = actionsState.transferChamado?.userId;
      if (q === "" || q == null || Number(q) <= 0) {
        toast.error("Com Transferir Chamado ativo, selecione a fila de atendimento.");
        return;
      }
      if (u === "" || u == null || Number(u) <= 0) {
        toast.error("Com Transferir Chamado ativo, selecione o usuário responsável.");
        return;
      }
    }
    const payload = {
      ...actionsState,
      transferChamado: {
        queueId:
          actionsState.transferChamado?.queueId === "" || actionsState.transferChamado?.queueId == null
            ? null
            : Number(actionsState.transferChamado.queueId),
        userId:
          actionsState.transferChamado?.userId === "" || actionsState.transferChamado?.userId == null
            ? null
            : Number(actionsState.transferChamado.userId)
      }
    };
    await saveSetting("agent_actions", payload, "Ações salvas");
  };

  const uploadBrainFiles = async (opts, files, listId) => {
    const formData = new FormData();
    formData.append("fileId", listId);
    formData.append("typeArch", "fileList");
    opts.forEach((opt, idx) => {
      if (files[idx]) {
        formData.append("files", files[idx]);
        formData.append("mediaType", files[idx].type || "");
        formData.append("name", opt.name);
        formData.append("id", String(opt.id));
      }
    });
    try {
      await api.post(`/files/uploadList/${listId}`, formData);
      toast.success("Arquivos enviados");
    } catch (err) {
      toastError(err);
    }
  };

  const handleSendBrainFiles = async () => {
    if (!brainFiles || brainFiles.length === 0) return;
    try {
      if (!brainState.fileListId) {
        const options = Array.from(brainFiles).map(f => ({ name: f.name, path: "", mediaType: f.type }));
        const { data } = await api.post("/files", {
          name: "AGENT_BRAIN",
          message: "Base de Conhecimento do Agente",
          options
        });
        if (data?.id) {
          await uploadBrainFiles(data.options || [], Array.from(brainFiles), data.id);
          const next = { ...brainState, fileListId: data.id };
          setBrainState(next);
          await saveSetting("agent_brain", next);
        }
      } else {
        const options = Array.from(brainFiles).map(f => ({ name: f.name, path: "", mediaType: f.type }));
        const { data } = await api.put(`/files/${brainState.fileListId}`, {
          id: brainState.fileListId,
          name: "AGENT_BRAIN",
          message: "Base de Conhecimento do Agente",
          options
        });
        await uploadBrainFiles(data.options || [], Array.from(brainFiles), brainState.fileListId);
      }
      setBrainFiles([]);
    } catch (err) {
      toastError(err);
    }
  };

  const handleAddWebsite = () => {
    if (!newWebsite.trim()) return;
    const next = { ...brainState, websites: [...(brainState.websites || []), newWebsite.trim()] };
    setBrainState(next);
    saveSetting("agent_brain", next);
    setNewWebsite("");
  };

  const handleRemoveWebsite = (idx) => {
    const arr = [...(brainState.websites || [])];
    arr.splice(idx, 1);
    const next = { ...brainState, websites: arr };
    setBrainState(next);
    saveSetting("agent_brain", next);
  };

  const handleAddQa = () => {
    if (!newQa.pergunta.trim() || !newQa.resposta.trim()) return;
    const next = { ...brainState, qna: [...(brainState.qna || []), { ...newQa }] };
    setBrainState(next);
    setNewQa({ pergunta: "", resposta: "", categoria: "" });
  };

  const handleRemoveQa = (idx) => {
    const arr = [...(brainState.qna || [])];
    arr.splice(idx, 1);
    setBrainState(prev => ({ ...prev, qna: arr }));
  };

  const handleSaveBrain = async () => {
    await saveSetting("agent_brain", brainState);
  };

  const handleCreatePrompt = async () => {
    try {
      if (!createPromptForm.name || !createPromptForm.prompt || !createPromptForm.apiKey || !createPromptForm.queueId) {
        toast.error("Preencha os campos obrigatórios");
        return;
      }
      await api.post("/prompt", {
        name: createPromptForm.name,
        prompt: createPromptForm.prompt,
        apiKey: createPromptForm.apiKey,
        queueId: createPromptForm.queueId,
        voice: createPromptForm.voice,
        voiceKey: createPromptForm.voiceKey,
        voiceRegion: createPromptForm.voiceRegion,
        temperature: createPromptForm.temperature,
        maxTokens: createPromptForm.maxTokens,
        maxMessages: createPromptForm.maxMessages
      });
      toast.success(i18n.t("promptModal.success"));
      setCreatePromptForm({
        name: "",
        apiKey: "",
        prompt: "",
        queueId: null,
        voice: "texto",
        voiceKey: "",
        voiceRegion: "",
        temperature: 1,
        maxTokens: 100,
        maxMessages: 10
      });
    } catch (err) {
      toastError(err);
    }
  };

  const tabViewModes = [
    { value: "integracao", label: "Integração", icon: <SiOpenai size={14} /> },
    { value: "cargo", label: "Cargo", icon: <WorkOutlineIcon /> },
    { value: "cerebro", label: "Cérebro", icon: <MemoryIcon /> },
    { value: "acoes", label: "Ações", icon: <FlashOnIcon /> },
    { value: "proatividade", label: "Proatividade", icon: <NotificationsActive /> },
    { value: "midias", label: "Mídias", icon: <PermMedia /> },
    { value: "teste", label: "Teste", icon: <BugReportIcon /> }
  ];

  return (
    <>
      {user.profile === "user" ?
        <ForbiddenPage />
        :
        <>
          <ActivitiesStyleLayout
            title={null}
            description={null}
            disableFilterBar
            hideHeaderDivider
            hideNavDivider
            hideSearch
            compactHeader
            enableTabsScroll
            scrollContent={false}
            viewModes={tabViewModes}
            currentViewMode={activeTab}
            onViewModeChange={setActiveTab}
          >
            <Box className={classes.pageContent}>
            {activeTab === "integracao" && (
              <IntegrationTab
                rootClassName={classes.integrationTabRoot}
                classes={classes}
                integrationState={integrationState}
                setIntegrationState={setIntegrationState}
                showApiKey={showApiKey}
                setShowApiKey={setShowApiKey}
                openAiModels={openAiModels}
                modelInfo={modelInfo}
                handleSaveIntegration={handleSaveIntegration}
              />
            )}

            {activeTab === "cargo" && (
              <div className={`${classes.mainPaper} ${classes.mainPaperTight}`}>
                <SectionCard>
                <Grid container spacing={1} className={classes.formRow} alignItems="flex-start">
                  <Grid item xs={12}>
                    {(roleState.funcao || roleState.formalidade || roleState.personalidade || roleState.idioma) ? (
                      <div className={classes.summaryRow}>
                        {roleState.funcao ? <Chip size="small" label={`Função: ${roleState.funcao}`} /> : null}
                        {roleState.formalidade ? <Chip size="small" label={`Formalidade: ${roleState.formalidade}`} /> : null}
                        {roleState.personalidade ? <Chip size="small" label={`Personalidade: ${roleState.personalidade}`} /> : null}
                        {roleState.idioma ? <Chip size="small" label={`Idioma: ${roleState.idioma}`} /> : null}
                      </div>
                    ) : null}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Nome do Agente"
                      value={roleState.agente}
                      onChange={(e) => setRoleState(prev => ({ ...prev, agente: e.target.value }))}
                      fullWidth
                      variant="outlined"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      className={classes.inputDense}
                    />
                    <TextField
                      label="Saudação padrão"
                      value={roleState.saudacao || ""}
                      onChange={(e) => setRoleState(prev => ({ ...prev, saudacao: e.target.value }))}
                      fullWidth
                      variant="outlined"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      className={classes.inputDense}
                    />
                    <TextField
                      label="Despedida padrão"
                      value={roleState.despedida || ""}
                      onChange={(e) => setRoleState(prev => ({ ...prev, despedida: e.target.value }))}
                      fullWidth
                      variant="outlined"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      className={classes.inputDense}
                    />
                    <ExpandableField
                      label="Instruções"
                      value={roleState.instrucoes}
                      onChange={(e) => setRoleState(prev => ({ ...prev, instrucoes: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                      className={classes.inputDense}
                      minRows={5}
                      maxRows={16}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      label="Função"
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={roleState.funcao || ""}
                      onChange={(e) => setRoleState(prev => ({ ...prev, funcao: e.target.value }))}
                      className={`${classes.inputDense} ${classes.selectWhite}`}
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="" disabled>Selecione a função</MenuItem>
                      <MenuItem value="Atendimento ao Cliente"><WorkOutlineIcon fontSize="small" style={{ marginRight: 6 }} />Atendimento ao Cliente</MenuItem>
                      <MenuItem value="Vendas"><Flag fontSize="small" style={{ marginRight: 6 }} />Vendas</MenuItem>
                      <MenuItem value="Suporte Técnico"><Gavel fontSize="small" style={{ marginRight: 6 }} />Suporte Técnico</MenuItem>
                      <MenuItem value="Agente de Agendamento"><CategoryIcon fontSize="small" style={{ marginRight: 6 }} />Agente de Agendamento</MenuItem>
                      <MenuItem value="Cobrança"><Business fontSize="small" style={{ marginRight: 6 }} />Cobrança</MenuItem>
                      <MenuItem value="Marketing"><InfoOutlined fontSize="small" style={{ marginRight: 6 }} />Marketing</MenuItem>
                    </TextField>
                    <TextField
                      select
                      label="Formalidade"
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={roleState.formalidade || ""}
                      onChange={(e) => setRoleState(prev => ({ ...prev, formalidade: e.target.value }))}
                      className={`${classes.inputDense} ${classes.selectWhite}`}
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="" disabled>Selecione a formalidade</MenuItem>
                      <MenuItem value="Formal"><Gavel fontSize="small" style={{ marginRight: 6 }} />Formal</MenuItem>
                      <MenuItem value="Neutro"><InfoOutlined fontSize="small" style={{ marginRight: 6 }} />Neutro</MenuItem>
                      <MenuItem value="Informal"><Flag fontSize="small" style={{ marginRight: 6 }} />Informal</MenuItem>
                    </TextField>
                    <TextField
                      select
                      label="Idioma"
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={roleState.idioma || ""}
                      onChange={(e) => setRoleState(prev => ({ ...prev, idioma: e.target.value }))}
                      className={`${classes.inputDense} ${classes.selectWhite}`}
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="" disabled>Selecione o idioma</MenuItem>
                      <MenuItem value="pt-BR"><Flag fontSize="small" style={{ marginRight: 6 }} />Português (Brasil)</MenuItem>
                      <MenuItem value="en"><Flag fontSize="small" style={{ marginRight: 6 }} />Inglês</MenuItem>
                      <MenuItem value="es"><Flag fontSize="small" style={{ marginRight: 6 }} />Espanhol</MenuItem>
                    </TextField>
                    <TextField
                      select
                      label="Personalidade"
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={roleState.personalidade || ""}
                      onChange={(e) => setRoleState(prev => ({ ...prev, personalidade: e.target.value }))}
                      className={`${classes.inputDense} ${classes.selectWhite}`}
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="" disabled>Selecione a personalidade</MenuItem>
                      <MenuItem value="Formal"><Gavel fontSize="small" style={{ marginRight: 6 }} />Formal</MenuItem>
                      <MenuItem value="Amigável"><InfoOutlined fontSize="small" style={{ marginRight: 6 }} />Amigável</MenuItem>
                      <MenuItem value="Objetivo"><CategoryIcon fontSize="small" style={{ marginRight: 6 }} />Objetivo</MenuItem>
                      <MenuItem value="Empático"><Business fontSize="small" style={{ marginRight: 6 }} />Empático</MenuItem>
                      <MenuItem value="Criativo"><Flag fontSize="small" style={{ marginRight: 6 }} />Criativo</MenuItem>
                      <MenuItem value="Técnico"><WorkOutlineIcon fontSize="small" style={{ marginRight: 6 }} />Técnico</MenuItem>
                    </TextField>
                    <TextField
                      select
                      label="Uso de emojis"
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={roleState.emojis || ""}
                      onChange={(e) => setRoleState(prev => ({ ...prev, emojis: e.target.value }))}
                      className={`${classes.inputDense} ${classes.selectWhite}`}
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="" disabled>Uso de emojis</MenuItem>
                      <MenuItem value="Nunca"><Gavel fontSize="small" style={{ marginRight: 6 }} />Nunca</MenuItem>
                      <MenuItem value="Moderado"><InfoOutlined fontSize="small" style={{ marginRight: 6 }} />Com moderação</MenuItem>
                      <MenuItem value="Liberal"><Flag fontSize="small" style={{ marginRight: 6 }} />Liberal</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ExpandableField
                      label="Contexto da Empresa"
                      value={roleState.empresaContexto || ""}
                      onChange={(e) => setRoleState(prev => ({ ...prev, empresaContexto: e.target.value }))}
                      InputProps={{ startAdornment: <InputAdornment position="start"><Business color="action" /></InputAdornment> }}
                      InputLabelProps={{ shrink: true }}
                      className={classes.inputDense}
                      minRows={5}
                      maxRows={16}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ExpandableField
                      label="Objetivo do Agente"
                      value={roleState.objetivoAgente || ""}
                      onChange={(e) => setRoleState(prev => ({ ...prev, objetivoAgente: e.target.value }))}
                      InputProps={{ startAdornment: <InputAdornment position="start"><Flag color="action" /></InputAdornment> }}
                      InputLabelProps={{ shrink: true }}
                      className={classes.inputDense}
                      minRows={5}
                      maxRows={16}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ExpandableField
                      label="Regras e Restrições"
                      value={roleState.regrasRestricoes || ""}
                      onChange={(e) => setRoleState(prev => ({ ...prev, regrasRestricoes: e.target.value }))}
                      InputProps={{ startAdornment: <InputAdornment position="start"><Gavel color="action" /></InputAdornment> }}
                      InputLabelProps={{ shrink: true }}
                      className={classes.inputDense}
                      minRows={5}
                      maxRows={16}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ExpandableField
                      label="Nicho da Empresa"
                      value={roleState.nichoEmpresa || ""}
                      onChange={(e) => setRoleState(prev => ({ ...prev, nichoEmpresa: e.target.value }))}
                      InputProps={{ startAdornment: <InputAdornment position="start"><CategoryIcon color="action" /></InputAdornment> }}
                      InputLabelProps={{ shrink: true }}
                      className={classes.inputDense}
                      minRows={5}
                      maxRows={16}
                    />
                  </Grid>
                </Grid>
                <div className={classes.formFooterBar}>
                  <Button color="primary" variant="contained" onClick={handleSaveRole} size="small">
                    Salvar Cargo
                  </Button>
                </div>
                </SectionCard>
              </div>
            )}

            {activeTab === "cerebro" && (
              <div className={`${classes.mainPaper} ${classes.mainPaperTight}`}>
                <Grid container spacing={1} className={classes.formRow}>
                  <Grid item xs={12} md={12}>
                    <SectionCard className={classes.brainSectionCard}>
                    <div className={`${classes.section} ${classes.brainWrapper}`}>
                      <div className={classes.uploadBox}>
                        <div className={classes.helperText}>Selecione um ou mais arquivos para treinar o agente.</div>
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <input id="brain-file-input" type="file" multiple style={{ display: "none" }} onChange={(e) => setBrainFiles(Array.from(e.target.files || []))} />
                          <Button variant="outlined" onClick={() => document.getElementById("brain-file-input").click()}>Selecionar arquivos</Button>
                          <Button color="primary" variant="contained" onClick={handleSendBrainFiles} disabled={!brainFiles || brainFiles.length === 0}>Enviar Arquivos</Button>
                        </div>
                        <div className={classes.helperText} style={{ marginTop: 6 }}>{brainFiles?.length ? `${brainFiles.length} arquivo(s) selecionado(s)` : "Nenhum arquivo selecionado"}</div>
                      </div>
                    </div>
                    <div className={`${classes.section} ${classes.brainWrapper}`}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                        <TextField
                          placeholder="https://..."
                          value={newWebsite}
                          onChange={(e) => setNewWebsite(e.target.value)}
                          fullWidth
                          variant="outlined"
                          className={classes.inputDense}
                        />
                        <Button variant="outlined" onClick={handleAddWebsite}>Adicionar</Button>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        {(brainState.websites || []).map((url, idx) => (
                          <div key={idx} className={classes.qaListRow} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span>{url}</span>
                            <Button size="small" onClick={() => handleRemoveWebsite(idx)}>Remover</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    </SectionCard>
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <SectionCard>
                    <div className={`${classes.section} ${classes.brainWrapper}`}>
                      <Grid container spacing={2} className={classes.formRow}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Pergunta"
                            value={newQa.pergunta}
                            onChange={(e) => setNewQa(prev => ({ ...prev, pergunta: e.target.value }))}
                            fullWidth
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                            className={classes.inputDense}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Categoria"
                            value={newQa.categoria}
                            onChange={(e) => setNewQa(prev => ({ ...prev, categoria: e.target.value }))}
                            fullWidth
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                            className={classes.inputDense}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <ExpandableField
                            label="Resposta"
                            value={newQa.resposta}
                            onChange={(e) => setNewQa(prev => ({ ...prev, resposta: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            className={classes.inputDense}
                            minRows={4}
                            maxRows={16}
                          />
                        </Grid>
                      </Grid>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Button variant="outlined" onClick={handleAddQa}>Adicionar Q&A</Button>
                        <Button color="primary" variant="contained" onClick={handleSaveBrain}>
                          Salvar Cérebro
                        </Button>
                      </div>
                      <div style={{ marginTop: 12 }}>
                        {(brainState.qna || []).map((qa, idx) => (
                          <div key={idx} className={classes.qaListRow}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Typography style={{ fontWeight: 600 }}>{qa.pergunta}</Typography>
                              <Button size="small" onClick={() => handleRemoveQa(idx)}>Remover</Button>
                            </div>
                            {qa.categoria ? <Typography variant="caption">Categoria: {qa.categoria}</Typography> : null}
                            <Typography>{qa.resposta}</Typography>
                          </div>
                        ))}
                      </div>
                    </div>
                    </SectionCard>
                  </Grid>
                  
                </Grid>
              </div>
            )}

            {activeTab === "acoes" && (
              <div className={`${classes.mainPaper} ${classes.mainPaperTight}`}>
                <SectionCard>
                <Grid container spacing={1} className={classes.formRow} alignItems="flex-start">
                  {[
                    { name: "Agendamento", desc: "Cria compromissos e lembretes", icon: <EventNote style={{ opacity: 0.8 }} /> },
                    { name: "Criar Lead", desc: "Gera leads na área de Vendas", icon: <PersonAdd style={{ opacity: 0.8 }} /> },
                    { name: "Criar Empresa", desc: "Registra empresas no CRM", icon: <Business style={{ opacity: 0.8 }} /> },
                    { name: "Consultar Pedidos", desc: "Busca pedidos no sistema", icon: <Assignment style={{ opacity: 0.8 }} /> },
                    { name: "Transferir Chamado", desc: "Encaminha ao responsável e/ou fila de atendimento", icon: <SwapHoriz style={{ opacity: 0.8 }} /> },
                    { name: "Resumo p/ handoff", desc: "Contexto curto ao transferir para humano", icon: <Note style={{ opacity: 0.8 }} /> },
                    { name: "Qualificar interesse", desc: "Perguntas de fit antes de propor valor", icon: <TrendingUp style={{ opacity: 0.8 }} /> },
                    { name: "Follow-up suave", desc: "Relembrar próximo passo sem pressionar", icon: <Repeat style={{ opacity: 0.8 }} /> },
                    { name: "Oferta contextual", desc: "Sugerir pacote ou add-on alinhado ao que falou", icon: <LocalOffer style={{ opacity: 0.8 }} /> },
                  ].map((a) => (
                    <Grid key={a.name} item xs={12} sm={6}>
                      <div className={classes.actionItem} onClick={() => setActionsState(prev => ({ ...prev, selected: a.name }))}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span>{a.icon}</span>
                          <div>
                            <Typography style={{ fontWeight: 600 }}>{a.name}</Typography>
                            <Typography variant="caption" color="textSecondary">{a.desc}</Typography>
                          </div>
                        </div>
                        <Switch
                          checked={actionsState.enabled.includes(a.name)}
                          onChange={(e) => {
                            const set = new Set(actionsState.enabled);
                            if (e.target.checked) set.add(a.name); else set.delete(a.name);
                            setActionsState(prev => ({ ...prev, enabled: Array.from(set) }));
                          }}
                          color="primary"
                          inputProps={{ "aria-label": `Ação ${a.name}` }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </Grid>
                  ))}
                  {actionsState.enabled.includes("Transferir Chamado") && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: 8 }}>
                        Destino da transferência (chamado)
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth variant="outlined" className={classes.inputDense}>
                            <InputLabel shrink id="transfer-queue-label">
                              Fila de atendimento
                            </InputLabel>
                            <Select
                              labelId="transfer-queue-label"
                              label="Fila de atendimento"
                              displayEmpty
                              value={actionsState.transferChamado?.queueId === "" || actionsState.transferChamado?.queueId == null ? "" : actionsState.transferChamado.queueId}
                              onChange={(e) =>
                                setActionsState(prev => ({
                                  ...prev,
                                  transferChamado: {
                                    ...(prev.transferChamado || { queueId: "", userId: "" }),
                                    queueId: e.target.value === "" ? "" : e.target.value
                                  }
                                }))
                              }
                              className={classes.selectWhite}
                            >
                              <MenuItem value="">
                                <em>Selecione a fila</em>
                              </MenuItem>
                              {(queues || []).map(q => (
                                <MenuItem key={q.id} value={q.id}>
                                  {q.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth variant="outlined" className={classes.inputDense}>
                            <InputLabel shrink id="transfer-user-label">
                              Usuário responsável
                            </InputLabel>
                            <Select
                              labelId="transfer-user-label"
                              label="Usuário responsável"
                              displayEmpty
                              value={actionsState.transferChamado?.userId === "" || actionsState.transferChamado?.userId == null ? "" : actionsState.transferChamado.userId}
                              onChange={(e) =>
                                setActionsState(prev => ({
                                  ...prev,
                                  transferChamado: {
                                    ...(prev.transferChamado || { queueId: "", userId: "" }),
                                    userId: e.target.value === "" ? "" : e.target.value
                                  }
                                }))
                              }
                              className={classes.selectWhite}
                            >
                              <MenuItem value="">
                                <em>Selecione o usuário</em>
                              </MenuItem>
                              {(actionsUsers || []).map(u => (
                                <MenuItem key={u.id} value={u.id}>
                                  {u.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                      <Typography variant="caption" color="textSecondary" display="block" style={{ marginTop: 6 }}>
                        Usado quando o cliente pede atendente ou a IA indica transferência para o setor. Salve as ações após alterar.
                      </Typography>
                      <Button
                        color="primary"
                        variant="outlined"
                        size="small"
                        style={{ marginTop: 8 }}
                        onClick={() => handleSaveActions()}
                      >
                        Salvar destino da transferência
                      </Button>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Grid container spacing={1}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Nome da Ação"
                          fullWidth
                          variant="outlined"
                          value={actionsState.draft?.name || actionsState.selected || ""}
                          onChange={(e) => setActionsState(prev => ({ ...prev, draft: { ...(prev.draft || {}), name: e.target.value } }))}
                          InputLabelProps={{ shrink: true }}
                          className={classes.inputDense}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Objetivo"
                          fullWidth
                          variant="outlined"
                          value={actionsState.draft?.objetivo || ""}
                          onChange={(e) => setActionsState(prev => ({ ...prev, draft: { ...(prev.draft || {}), objetivo: e.target.value } }))}
                          InputLabelProps={{ shrink: true }}
                          className={classes.inputDense}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Select
                          multiple
                          fullWidth
                          variant="outlined"
                          displayEmpty
                          value={(actionsState.draft?.tabelas || [])}
                          onChange={(e) => setActionsState(prev => ({ ...prev, draft: { ...(prev.draft || {}), tabelas: e.target.value } }))}
                          className={`${classes.inputDense} ${classes.selectWhite}`}
                        >
                          {[
                            { v: "tickets", l: "Tickets" },
                            { v: "contacts", l: "Contatos" },
                            { v: "schedules", l: "Agendamentos" },
                            { v: "companies", l: "Empresas" },
                            { v: "leads", l: "Leads" },
                            { v: "projects", l: "Projetos" },
                            { v: "activities", l: "Atividades" },
                          ].map(t => (
                            <MenuItem key={t.v} value={t.v}>{t.l}</MenuItem>
                          ))}
                        </Select>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Select
                          fullWidth
                          variant="outlined"
                          value={actionsState.draft?.hook || ""}
                          onChange={(e) => setActionsState(prev => ({ ...prev, draft: { ...(prev.draft || {}), hook: e.target.value } }))}
                          displayEmpty
                          className={`${classes.inputDense} ${classes.selectWhite}`}
                        >
                          <MenuItem value="" disabled>Selecione um Hook</MenuItem>
                          <MenuItem value="beforeCreate">Antes de criar (beforeCreate)</MenuItem>
                          <MenuItem value="afterCreate">Depois de criar (afterCreate)</MenuItem>
                          <MenuItem value="beforeSave">Antes de salvar (beforeSave)</MenuItem>
                          <MenuItem value="afterSave">Depois de salvar (afterSave)</MenuItem>
                        </Select>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <ExpandableField
                          label="Regras (palavras-chave, formatos)"
                          value={actionsState.draft?.regras || ""}
                          onChange={(e) => setActionsState(prev => ({ ...prev, draft: { ...(prev.draft || {}), regras: e.target.value } }))}
                          className={classes.inputDense}
                          minRows={3}
                          maxRows={14}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => {
                            if (!actionsState.draft?.name) return;
                            const next = { ...actionsState, custom: [...(actionsState.custom || []), actionsState.draft], draft: undefined };
                            setActionsState(next);
                            handleSaveActions();
                          }}
                        >
                          Salvar Configuração
                        </Button>
                      </Grid>
                      <Grid item xs={12}>
                        {(actionsState.custom || []).map((a, idx) => (
                          <div key={idx} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 8, marginBottom: 8 }}>
                            <Typography variant="subtitle2">{a.name}</Typography>
                            <Typography variant="caption" color="textSecondary">{a.objetivo}</Typography>
                            <div style={{ marginTop: 6 }}>
                              <Typography variant="caption">Tabelas: {(a.tabelas || []).join(", ")}</Typography>
                            </div>
                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                              <Button size="small" onClick={() => {
                                const arr = [...actionsState.custom];
                                arr.splice(idx, 1);
                                setActionsState(prev => ({ ...prev, custom: arr }));
                                handleSaveActions();
                              }}>Remover</Button>
                            </div>
                          </div>
                        ))}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                </SectionCard>
              </div>
            )}

            {activeTab === "proatividade" && (
              <ProactivityTab
                classes={classes}
                proactiveState={proactiveState}
                setProactiveState={setProactiveState}
                ExpandableField={ExpandableField}
                onSaveProactivity={handleSaveProactive}
                tags={tags}
                contactLists={contactLists}
                canSaveSettings={canSaveAgentSettings}
              />
            )}

            {activeTab === "midias" && (
              <MediaTab
                classes={classes}
                proactiveState={proactiveState}
                setProactiveState={setProactiveState}
                onSaveMedia={handleSaveMedia}
                canSaveSettings={canSaveAgentSettings}
              />
            )}

            {activeTab === "teste" && (
              <div className={`${classes.mainPaper} ${classes.mainPaperTight}`}>
                <SectionCard>
                {!integrationState.apiKey ? (
                  <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                    Informe sua API Key em Integração para testar o chat.
                  </Typography>
                ) : null}
                <ChatTester
                  classes={classes}
                  apiKey={integrationState.apiKey}
                  model={integrationState.model}
                />
                </SectionCard>
              </div>
            )}
            </Box>
          </ActivitiesStyleLayout>
        </>}
    </>
  );
};

// Componente interno: Chat de Teste com OpenAI
const ChatTester = ({ classes, apiKey, model }) => {
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const send = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setInput("");
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    try {
      setSending(true);
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model || "gpt-4o-mini",
          messages: next,
          temperature: 0.7
        })
      });
      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content || "Sem resposta.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Erro ao chamar OpenAI." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={classes.chatTesterShell}>
      <div className={classes.chatTesterMessages}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 8 }}>
            <div className={m.role === "user" ? classes.chatBubbleUser : classes.chatBubbleAssistant}>
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <TextField
          placeholder="Escreva uma mensagem para o agente..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          fullWidth
          variant="outlined"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <Button variant="contained" color="primary" onClick={send} disabled={sending || !input.trim()}>
          Enviar
        </Button>
      </div>
    </div>
  );
};

export default Prompts;
