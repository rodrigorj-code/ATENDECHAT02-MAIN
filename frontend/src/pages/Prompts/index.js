import React, { useContext, useEffect, useReducer, useState } from "react";

import openSocket from "socket.io-client";

import {
  Button,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Chip,
  Paper,
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
import { DeleteOutline, Edit, Visibility, VisibilityOff, Settings as SettingsIcon, WorkOutline as WorkOutlineIcon, Memory as MemoryIcon, FlashOn as FlashOnIcon, BugReport as BugReportIcon, List as ListIcon, Business, Flag, Gavel, Category as CategoryIcon, InfoOutlined, EventNote, PersonAdd, Assignment, DragHandle } from "@material-ui/icons";
// Ícone oficial da OpenAI via react-icons (simple-icons)
import { SiOpenai } from "react-icons/si";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ForbiddenPage from "../../components/ForbiddenPage";
import ActivitiesStyleLayout from "../../components/ActivitiesStyleLayout";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "auto",
    ...theme.scrollbarStyles,
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
    marginBottom: 6,
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
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(229,231,235,0.6)",
    borderRadius: 12,
    padding: theme.spacing(2),
    boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
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
  }
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

  const { getPlanCompany } = usePlans();
  const history = useHistory();
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
    scope: "Pessoal"
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
  const [advancedState, setAdvancedState] = useState({
    responderGrupo: false,
    welcomeMessage: "",
    farewellMessage: "",
    transferMessage: "",
    voice: "texto",
    voiceKey: "",
    voiceRegion: ""
  });
  const [actionsState, setActionsState] = useState({
    enabled: ["Agendamento"],
    custom: []
  });
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
    async function fetchData() {
      try {
        const planConfigs = await getPlanCompany(undefined, companyId);
        if (planConfigs && planConfigs.plan && !planConfigs.plan.useOpenAi) {
          toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
          setTimeout(() => {
            history.push(`/`);
          }, 1000);
        }
      } catch (e) {}
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      if (key === "agent_advanced" && parsed) {
        setAdvancedState((prev) => ({ ...prev, ...parsed }));
      }
      if (key === "agent_actions" && parsed) {
        setActionsState((prev) => ({ ...prev, ...parsed }));
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
            ...v
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
        const { data } = await api.get("/settings/agent_advanced");
        if (data && data.value) {
          const v = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
          setAdvancedState(prev => ({ ...prev, ...v }));
        }
      } catch {}
      try {
        const { data } = await api.get("/settings/agent_actions");
        if (data && data.value) {
          const v = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
          setActionsState(prev => ({ ...prev, ...v }));
        }
      } catch {}
      try {
        const { data } = await api.get("/queue");
        setQueues(data || []);
      } catch {}
    })();
  }, []);

  const handleOpenPromptModal = () => {};
  const handleClosePromptModal = () => {};
  const handleEditPrompt = () => {};
  const handleCloseConfirmationModal = () => {};
  const handleDeletePrompt = async () => {};

  const saveSetting = async (key, value) => {
    try {
      const { data } = await api.put(`/settings/${key}`, { value });
      toast.success("Configurações salvas");
      return data;
    } catch (err) {
      toastError(err);
      return null;
    }
  };

  const handleSaveIntegration = async () => {
    await saveSetting("agent_integration", integrationState);
  };

  const handleSaveRole = async () => {
    await saveSetting("agent_role", roleState);
  };
  const handleSaveAdvanced = async () => {
    await saveSetting("agent_advanced", advancedState);
  };
  const handleSaveActions = async () => {
    await saveSetting("agent_actions", actionsState);
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
    { value: "avancado", label: "Avançado", icon: <SettingsIcon /> },
    { value: "teste", label: "Teste", icon: <BugReportIcon /> },
  ];

  return (
    <>
      {user.profile === "user" ?
        <ForbiddenPage />
        :
        <>
          <ActivitiesStyleLayout
            title={null}
            description="Configura o agente de IA e gerencia Prompts"
            disableFilterBar
            hideHeaderDivider
            hideNavDivider
            hideSearch
            compactHeader
            viewModes={tabViewModes}
            currentViewMode={activeTab}
            onViewModeChange={setActiveTab}
          >
            {activeTab === "integracao" && (
              <div className={`${classes.mainPaper} ${classes.mainPaperTight}`}>
                <Grid container spacing={2} className={classes.formRow} alignItems="flex-start">
                  <Grid item xs={12} md={6}>
                    <Paper className={classes.card}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 8 }}>
                        <div className={classes.switchRow}>
                          <span className={classes.labelSmall}>Ativo</span>
                          <Switch
                            checked={integrationState.active}
                            onChange={(e) => setIntegrationState(prev => ({ ...prev, active: e.target.checked }))}
                            color="primary"
                          />
                        </div>
                        <div className={classes.switchRow}>
                          <span className={classes.labelSmall}>Responder em grupos do WhatsApp</span>
                          <Switch
                            checked={advancedState.responderGrupo}
                            onChange={(e) => setAdvancedState(prev => ({ ...prev, responderGrupo: e.target.checked }))}
                            color="primary"
                          />
                        </div>
                      </div>

                      <span className={classes.labelSmall}>API Key</span>
                      <TextField
                        placeholder="sk-..."
                        type={showApiKey ? "text" : "password"}
                        value={integrationState.apiKey}
                        onChange={(e) => setIntegrationState(prev => ({ ...prev, apiKey: e.target.value }))}
                        fullWidth
                        variant="outlined"
                        size="small"
                        className={classes.inputDense}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowApiKey(s => !s)}>
                                {showApiKey ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />

                      <span className={classes.labelSmall}>Modelo</span>
                      <Select
                        fullWidth
                        variant="outlined"
                        value={integrationState.model}
                        onChange={(e) => setIntegrationState(prev => ({ ...prev, model: e.target.value }))}
                        className={`${classes.inputDense} ${classes.selectWhite}`}
                      >
                        {openAiModels.map(m => (
                          <MenuItem key={m} value={m}>{m}</MenuItem>
                        ))}
                      </Select>

                      <span className={classes.labelSmall}>Escopo</span>
                      <Select
                        fullWidth
                        variant="outlined"
                        value={integrationState.scope}
                        onChange={(e) => setIntegrationState(prev => ({ ...prev, scope: e.target.value }))}
                        className={`${classes.inputDense} ${classes.selectWhite}`}
                      >
                        <MenuItem value="Pessoal">Pessoal</MenuItem>
                        <MenuItem value="Equipe">Equipe</MenuItem>
                        <MenuItem value="Global">Global</MenuItem>
                      </Select>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                        <div>
                          <span className={classes.labelSmall}>top_p</span>
                          <TextField
                            value={integrationState.topP}
                            onChange={(e) => setIntegrationState(prev => ({ ...prev, topP: Number(e.target.value) }))}
                            fullWidth
                            variant="outlined"
                            size="small"
                            type="number"
                            inputProps={{ step: "0.01", min: "0", max: "1" }}
                            className={classes.inputDense}
                          />
                        </div>
                        <div>
                          <span className={classes.labelSmall}>presence_penalty</span>
                          <TextField
                            value={integrationState.presencePenalty}
                            onChange={(e) => setIntegrationState(prev => ({ ...prev, presencePenalty: Number(e.target.value) }))}
                            fullWidth
                            variant="outlined"
                            size="small"
                            type="number"
                            inputProps={{ step: "0.1", min: "-2", max: "2" }}
                            className={classes.inputDense}
                          />
                        </div>
                        <div>
                          <span className={classes.labelSmall}>frequency_penalty</span>
                          <TextField
                            value={integrationState.frequencyPenalty}
                            onChange={(e) => setIntegrationState(prev => ({ ...prev, frequencyPenalty: Number(e.target.value) }))}
                            fullWidth
                            variant="outlined"
                            size="small"
                            type="number"
                            inputProps={{ step: "0.1", min: "-2", max: "2" }}
                            className={classes.inputDense}
                          />
                        </div>
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <span className={classes.labelSmall}>stop (separe por vírgula)</span>
                        <TextField
                          value={integrationState.stopSequences}
                          onChange={(e) => setIntegrationState(prev => ({ ...prev, stopSequences: e.target.value }))}
                          fullWidth
                          variant="outlined"
                          size="small"
                          placeholder="###, FIM"
                          className={classes.inputDense}
                        />
                      </div>

                      <div className={classes.formRow} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                        <Switch
                          checked={integrationState.aplicarTodos}
                          onChange={(e) => setIntegrationState(prev => ({ ...prev, aplicarTodos: e.target.checked }))}
                          color="primary"
                          size="small"
                        />
                        <Typography>Aplicar configurações a todas as filas</Typography>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button color="primary" variant="contained" onClick={handleSaveIntegration} size="small">
                          Salvar Integração
                        </Button>
                      </div>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper className={classes.rightModelCard}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                        <SiOpenai size={24} color={"#111827"} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>
                            {(modelInfo[integrationState.model] && modelInfo[integrationState.model].title) || integrationState.model}
                          </div>
                          <div style={{ fontSize: 12, color: "#6b7280" }}>
                            {(modelInfo[integrationState.model] && modelInfo[integrationState.model].desc) || "Modelo selecionado da OpenAI."} Ideal para: Chat, automação.
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                        <div>Contexto: <b>{modelInfo[integrationState.model]?.context || "-"}</b></div>
                        <div>Saída Máx.: <b>{modelInfo[integrationState.model]?.output || "-"}</b></div>
                        <div>Velocidade: <b>{modelInfo[integrationState.model]?.speed || "-"}</b></div>
                        <div>Qualidade: <b>{modelInfo[integrationState.model]?.quality || "-"}</b></div>
                        <div>Custo: <b>{modelInfo[integrationState.model]?.cost || "-"}</b></div>
                      </div>

                      <div className={classes.rightSection} style={{ fontSize: 12 }}>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>Resumo da Configuração</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <div>Modelo: <b>{modelInfo[integrationState.model]?.title || integrationState.model}</b></div>
                          <div>Escopo: <b>{integrationState.scope}</b></div>
                          <div>Status: <b>{integrationState.active ? "Pronto" : "Desativado"}</b></div>
                          <div>Grupos do WhatsApp: <b>{advancedState.responderGrupo ? "Sim" : "Não"}</b></div>
                        </div>
                      </div>

                      <div className={classes.rightSection}>
                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Preços (por 1M tokens)</div>
                        <div className={classes.priceRow}>
                          <span>Entrada</span>
                          <span>$0.15/1M</span>
                        </div>
                        <div className={classes.priceRow} style={{ marginTop: 4 }}>
                          <span>Saída</span>
                          <span>$0.60/1M</span>
                        </div>
                      </div>

                      <div className={classes.rightSection} style={{ fontSize: 12 }}>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>Conexão Ativa</div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Status API</span>
                          <span>{integrationState.apiKey ? "Operacional" : "Indisponível"}</span>
                        </div>
                      </div>

                      {/* dica removida para compactar o card */}
                    </Paper>
                    <div className={classes.statusRow} style={{ marginTop: 10 }}>
                      <span className={integrationState.status.whatsapp ? classes.statusBadgeOk : classes.statusBadgeWarn}>
                        WhatsApp {integrationState.status.whatsapp ? "OK" : "Não conectado"}
                      </span>
                      <span className={integrationState.apiKey ? classes.statusBadgeOk : classes.statusBadgeWarn}>
                        API Key {integrationState.apiKey ? "informada" : "não informada"}
                      </span>
                    </div>
                  </Grid>
                </Grid>
                
              </div>
            )}

            {activeTab === "cargo" && (
              <div className={`${classes.mainPaper} ${classes.mainPaperTight}`}>
                <Grid container spacing={2} className={classes.formRow}>
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
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button color="primary" variant="contained" onClick={handleSaveRole} size="small">
                    Salvar Cargo
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "cerebro" && (
              <div className={`${classes.mainPaper} ${classes.mainPaperTight}`}>
                <Grid container spacing={2} className={classes.formRow}>
                  <Grid item xs={12} md={12}>
                    <div className={`${classes.section} ${classes.brainWrapper}`}>
                      <Typography variant="subtitle1">Arquivos</Typography>
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
                      <Typography variant="subtitle1">Sites</Typography>
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
                          <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #eee" }}>
                            <span>{url}</span>
                            <Button size="small" onClick={() => handleRemoveWebsite(idx)}>Remover</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <div className={classes.cardTitle}>Q&A</div>
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
                          <div key={idx} style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
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
                  </Grid>
                  
                </Grid>
              </div>
            )}

            {activeTab === "acoes" && (
              <div className={`${classes.mainPaper} ${classes.mainPaperTight}`}>
                <Grid container spacing={2} className={classes.formRow}>
                  <Grid item xs={12} md={6}>
                    <div className={classes.cardTitle} style={{ marginLeft: 8 }}>Ações disponíveis</div>
                    <Grid container spacing={2}>
                      {[
                        { name: "Agendamento", desc: "Cria compromissos e lembretes", icon: <EventNote style={{ opacity: 0.8 }} /> },
                        { name: "Criar Lead", desc: "Gera leads na área de Vendas", icon: <PersonAdd style={{ opacity: 0.8 }} /> },
                        { name: "Criar Empresa", desc: "Registra empresas no CRM", icon: <Business style={{ opacity: 0.8 }} /> },
                        { name: "Consultar Pedidos", desc: "Busca pedidos no sistema", icon: <Assignment style={{ opacity: 0.8 }} /> },
                      ].map((a) => (
                        <Grid key={a.name} item xs={12} md={6}>
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
                            />
                          </div>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <Grid container spacing={2}>
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
              </div>
            )}

            {activeTab === "avancado" && (
              <div className={`${classes.mainPaper} ${classes.mainPaperTight}`}>
                <Grid container spacing={2} className={classes.formRow}>
                  <Grid item xs={12}>
                    <div className={classes.cardTitle}>Exemplos de Conversação</div>
                    <div className={classes.tipBox}>Adicione pares de mensagens que representem o tom desejado.</div>
                    <Grid container spacing={1}>
                      {(advancedState.examples || [{ user: "", assistant: "" }]).map((ex, idx) => (
                        <>
                          <Grid item xs={12}>
                          <ExpandableField
                            placeholder="Mensagem do usuário"
                            label={null}
                            value={ex.user}
                            onChange={(e) => {
                                const arr = [...(advancedState.examples || [])];
                                arr[idx] = { ...(arr[idx] || {}), user: e.target.value };
                                setAdvancedState(prev => ({ ...prev, examples: arr }));
                              }}
                            className={classes.inputDense}
                            minRows={3}
                            maxRows={16}
                          />
                          </Grid>
                          <Grid item xs={12}>
                          <ExpandableField
                            placeholder="Resposta do assistente"
                            label={null}
                            value={ex.assistant}
                            onChange={(e) => {
                                const arr = [...(advancedState.examples || [])];
                                arr[idx] = { ...(arr[idx] || {}), assistant: e.target.value };
                                setAdvancedState(prev => ({ ...prev, examples: arr }));
                              }}
                            className={classes.inputDense}
                            minRows={3}
                            maxRows={16}
                          />
                          </Grid>
                        </>
                      ))}
                      <Grid item xs={12}>
                        <Button variant="outlined" onClick={() => setAdvancedState(prev => ({ ...prev, examples: [...(prev.examples || []), { user: "", assistant: "" }] }))}>+ Adicionar Exemplo</Button>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <div className={classes.cardTitle}>Configurações</div>
                    <div className={classes.tipBox}>Ajuste tempo de inatividade, mensagens padrões e voz de leitura, sem alterar os campos existentes.</div>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <TextField
                          label="Timeout de Inatividade (minutos)"
                          value={advancedState.timeoutMinutes || ""}
                          onChange={(e) => setAdvancedState(prev => ({ ...prev, timeoutMinutes: Number(e.target.value) }))}
                          fullWidth
                          variant="outlined"
                          type="number"
                          InputLabelProps={{ shrink: true }}
                          className={classes.inputDense}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <ExpandableField
                          label="Mensagem de boas-vindas"
                          value={advancedState.welcomeMessage}
                          onChange={(e) => setAdvancedState(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                          InputLabelProps={{ shrink: true }}
                          className={classes.inputDense}
                          minRows={3}
                          maxRows={16}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <ExpandableField
                          label="Mensagem de despedida"
                          value={advancedState.farewellMessage}
                          onChange={(e) => setAdvancedState(prev => ({ ...prev, farewellMessage: e.target.value }))}
                          InputLabelProps={{ shrink: true }}
                          className={classes.inputDense}
                          minRows={3}
                          maxRows={16}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <ExpandableField
                          label="Mensagem de transferência"
                          value={advancedState.transferMessage}
                          onChange={(e) => setAdvancedState(prev => ({ ...prev, transferMessage: e.target.value }))}
                          InputLabelProps={{ shrink: true }}
                          className={classes.inputDense}
                          minRows={3}
                          maxRows={16}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Select
                          value={advancedState.voice}
                          onChange={(e) => setAdvancedState(prev => ({ ...prev, voice: e.target.value }))}
                          fullWidth
                          variant="outlined"
                          className={`${classes.inputDense} ${classes.selectWhite}`}
                        >
                          <MenuItem value="texto">Texto</MenuItem>
                          <MenuItem value="pt-BR-FranciscaNeural">pt-BR-FranciscaNeural</MenuItem>
                          <MenuItem value="pt-BR-AntonioNeural">pt-BR-AntonioNeural</MenuItem>
                          <MenuItem value="pt-BR-BrendaNeural">pt-BR-BrendaNeural</MenuItem>
                        </Select>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Voice Key"
                          value={advancedState.voiceKey}
                          onChange={(e) => setAdvancedState(prev => ({ ...prev, voiceKey: e.target.value }))}
                          fullWidth
                          variant="outlined"
                          InputLabelProps={{ shrink: true }}
                          className={classes.inputDense}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Voice Region"
                          value={advancedState.voiceRegion}
                          onChange={(e) => setAdvancedState(prev => ({ ...prev, voiceRegion: e.target.value }))}
                          fullWidth
                          variant="outlined"
                          InputLabelProps={{ shrink: true }}
                          className={classes.inputDense}
                        />
                      </Grid>
                    </Grid>
                    <div style={{ marginTop: 8 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={handleSaveAdvanced}
                      >
                        Salvar Avançado
                      </Button>
                    </div>
                  </Grid>
                </Grid>
              </div>
            )}

            {activeTab === "teste" && (
              <div className={`${classes.mainPaper} ${classes.mainPaperTight}`}>
                {!integrationState.apiKey ? (
                  <Typography variant="body2" color="textSecondary">Informe sua API Key em Integração para testar o chat.</Typography>
                ) : null}
                <ChatTester
                  apiKey={integrationState.apiKey}
                  model={integrationState.model}
                />
              </div>
            )}
          </ActivitiesStyleLayout>
        </>}
    </>
  );
};

// Componente interno: Chat de Teste com OpenAI
const ChatTester = ({ apiKey, model }) => {
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
    <div style={{ display: "flex", flexDirection: "column", height: 480, maxHeight: "60vh" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: 8, border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 8, background: "#fafafa" }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 6 }}>
            <div style={{ maxWidth: "80%", padding: "8px 12px", borderRadius: 14, background: m.role === "user" ? "#131B2D" : "#e5e7eb", color: m.role === "user" ? "#fff" : "#111" }}>
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
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
