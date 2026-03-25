import React, { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import SectionCard from "./shared/SectionCard";
import ProactivityHelpDialog from "./ProactivityHelpDialog";
import { QUICK_OBJECTIVES, QUICK_TONES, appendToField } from "../constants/proactivityQuickSnippets";
import api from "../../../services/api";
import { toast } from "react-toastify";
import toastError from "../../../errors/toastError";
import { applySalesCampaignPreset } from "../constants/salesCampaignPreset";
import {
  ProactiveMissionPicker,
  ProactivePlaybookPicker
} from "./personalization/ProactivityStylePickers";

const OUTREACH_SNIPPETS = [
  {
    label: "Curiosidade",
    text: "Abra com uma pergunta específica sobre o negócio do lead, sem citar produto ou preço na primeira linha."
  },
  {
    label: "Dor comum",
    text: "Mencione um desafio típico do segmento e pergunte se isso também acontece com ele."
  },
  {
    label: "Prova social leve",
    text: "Diga que acompanha empresas parecidas e convide a trocar uma ideia curta, sem prometer resultado mágico."
  },
  {
    label: "Convite 10 min",
    text: "Proponha uma conversa breve para entender contexto — sem pedir fechamento ou cartão."
  },
  {
    label: "Reativação",
    text: "Se já houve contato antes, retome com um fato novo (novidade, case ou conteúdo) em uma frase."
  }
];

const FLOWS = [
  {
    id: "follow_up",
    title: "Follow-up",
    badge: "Diário 9h",
    enabledKey: "followUpEnabled",
    hintKey: "hintFollowUp",
    desc:
      "O job roda uma vez por dia (por volta das 9h, horário São Paulo), não no minuto exato após o silêncio. Usa “dias sem resposta” + opcionalmente “mín. horas entre follow-ups”. Ao atingir o limite de tentativas o ticket pode ser marcado inativo."
  },
  {
    id: "hot_lead",
    title: "Lead quente",
    badge: "A cada 30 min",
    enabledKey: "hotLeadEnabled",
    hintKey: "hintHotLead",
    desc:
      "O job verifica aproximadamente a cada 30 min. Dispara quando o texto do cliente combina com as palavras-chave. Pode incluir botões rápidos no WhatsApp."
  },
  {
    id: "reengagement",
    title: "Reengajamento",
    badge: "Segunda 10h",
    enabledKey: "reengagementEnabled",
    hintKey: "hintReengagement",
    desc:
      "Roda em janela semanal (ex.: segunda ~10h, SP). Retoma tickets já marcados inativos após o número de semanas que você configurar."
  },
  {
    id: "cold_outreach",
    title: "Prospecção fria",
    badge: "Manual / API",
    enabledKey: null,
    hintKey: "hintColdOutreach",
    desc:
      "Mensagem gerada sob demanda (API ou disparo manual). Respeita disableBot, horário comercial e segmentos."
  }
];

export default function ProactivityTab({
  classes,
  proactiveState,
  setProactiveState,
  ExpandableField,
  onSaveProactivity,
  tags,
  contactLists,
  canSaveSettings = true
}) {
  const [outreachOpen, setOutreachOpen] = useState(false);
  const [outreachIdsText, setOutreachIdsText] = useState("");
  const [outreachListId, setOutreachListId] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [presetOpen, setPresetOpen] = useState(false);
  const [masterFlowDialog, setMasterFlowDialog] = useState({ open: false, flowKey: null });
  const [helpOpen, setHelpOpen] = useState(false);

  const appendObjectiveSnippet = (flowId, snippet) => {
    setProactiveState((prev) => ({
      ...prev,
      objectives: {
        ...(prev.objectives || {}),
        [flowId]: appendToField(prev.objectives?.[flowId], snippet.text, "; ")
      }
    }));
  };

  const appendToneSnippet = (hintKey, snippet) => {
    setProactiveState((prev) => ({
      ...prev,
      [hintKey]: appendToField(prev[hintKey], snippet.text)
    }));
  };

  const appendInboundBriefSnippet = (snippet) => {
    setProactiveState((prev) => ({
      ...prev,
      inboundConversationBrief: appendToField(prev.inboundConversationBrief, snippet.text, "\n")
    }));
  };

  const previewCount = useMemo(() => {
    const fromText = outreachIdsText
      .split(/[\n,;\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n) && n > 0);
    const uniq = new Set(fromText);
    return uniq.size;
  }, [outreachIdsText]);

  const openConfirm = () => {
    const mode = proactiveState.coldOutreachBlendMode || "merge";
    const hasList = outreachListId && String(outreachListId).length > 0;
    if (mode === "list_only" && !hasList) {
      toast.error("No modo “só lista”, selecione uma lista de contatos.");
      return;
    }
    if (mode === "ids_only" && previewCount === 0) {
      toast.error("No modo “só IDs”, informe ao menos um ID de contato.");
      return;
    }
    if (mode === "merge" && !hasList && previewCount === 0) {
      toast.error("Informe IDs de contatos ou uma lista (ou ambos).");
      return;
    }
    setConfirmOpen(true);
  };

  const runOutreach = async () => {
    try {
      const contactIds = outreachIdsText
        .split(/[\n,;\s]+/)
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n) && n > 0);
      const payload = {
        contactIds: [...new Set(contactIds)],
        contactListId: outreachListId ? Number(outreachListId) : undefined,
        blendMode: proactiveState.coldOutreachBlendMode || "merge"
      };
      const { data } = await api.post("/agent-proactive/cold-outreach", payload);
      toast.success(
        data?.accepted != null
          ? `Envio iniciado para ${data.accepted} contato(s).`
          : "Solicitação enviada."
      );
      setConfirmOpen(false);
      setOutreachOpen(false);
    } catch (err) {
      toastError(err);
    }
  };

  const setSegment = (ctx, partial) => {
    setProactiveState((prev) => ({
      ...prev,
      segments: {
        ...(prev.segments || {}),
        [ctx]: {
          tagIds: [],
          contactListId: "",
          ...(prev.segments || {})[ctx],
          ...partial
        }
      }
    }));
  };

  const setObjective = (ctx, text) => {
    setProactiveState((prev) => ({
      ...prev,
      objectives: {
        ...(prev.objectives || {}),
        [ctx]: text
      }
    }));
  };

  const setCustomProactiveText = (ctx, text) => {
    setProactiveState((prev) => ({
      ...prev,
      customProactiveText: {
        ...(prev.customProactiveText || {}),
        [ctx]: text
      }
    }));
  };

  const addSequenceStep = () => {
    setProactiveState((prev) => ({
      ...prev,
      sequenceSteps: [...(prev.sequenceSteps || []), { delayHours: 24, hint: "" }]
    }));
  };

  const updateSequenceStep = (idx, field, value) => {
    setProactiveState((prev) => {
      const steps = [...(prev.sequenceSteps || [])];
      steps[idx] = { ...steps[idx], [field]: value };
      return { ...prev, sequenceSteps: steps };
    });
  };

  const removeSequenceStep = (idx) => {
    setProactiveState((prev) => {
      const steps = [...(prev.sequenceSteps || [])];
      steps.splice(idx, 1);
      return { ...prev, sequenceSteps: steps };
    });
  };

  const handleFlowSwitch = (flowKey, checked) => {
    if (!flowKey) return;
    if (checked && !proactiveState.enabled) {
      setMasterFlowDialog({ open: true, flowKey });
      return;
    }
    setProactiveState((prev) => ({ ...prev, [flowKey]: checked }));
  };

  const flowTitle = (key) => {
    if (key === "followUpEnabled") return "Follow-up";
    if (key === "hotLeadEnabled") return "Lead quente";
    if (key === "reengagementEnabled") return "Reengajamento";
    return "Esta automação";
  };

  return (
    <div className={`${classes.mainPaper} ${classes.mainPaperTight}`}>
      <SectionCard className={classes.sectionCardSpacing}>
        <Box display="flex" flexWrap="wrap" alignItems="center" style={{ gap: 10 }}>
          <Button variant="outlined" color="primary" size="small" onClick={() => setPresetOpen(true)}>
            Aplicar preset recomendado…
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<HelpOutlineIcon />}
            onClick={() => setHelpOpen(true)}
          >
            Manual: como funciona tudo
          </Button>
        </Box>
        <Box display="flex" alignItems="center" style={{ gap: 6, marginTop: 8 }}>
          <Typography variant="caption" color="textSecondary">
            Dúvidas? Abra o manual — fluxos, horários e checklist.
          </Typography>
          <Tooltip title="Na primeira configuração, leia o manual completo (botão acima): jobs, campos e boas práticas.">
            <HelpOutlineIcon fontSize="small" color="action" style={{ cursor: "help" }} />
          </Tooltip>
        </Box>
      </SectionCard>

      <ProactivityHelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />

      <SectionCard className={classes.sectionCardSpacing}>
        <div className={classes.switchRow}>
          <Box display="flex" alignItems="center" style={{ gap: 6 }} flex={1}>
            <span className={classes.labelSmall}>Automações proativas (interruptor geral)</span>
            <Tooltip title="Desligado: nenhum job (follow-up, lead quente, reengajamento) nem disparo de prospecção fria roda — mesmo com campos preenchidos.">
              <HelpOutlineIcon fontSize="small" color="action" style={{ cursor: "help" }} />
            </Tooltip>
          </Box>
          <Switch
            checked={!!proactiveState.enabled}
            onChange={(e) => setProactiveState((prev) => ({ ...prev, enabled: e.target.checked }))}
            color="primary"
            inputProps={{ "aria-label": "Automações proativas" }}
          />
        </div>
      </SectionCard>

      {!proactiveState.enabled ? (
        <SectionCard className={classes.sectionCardSpacing}>
          <Paper
            elevation={0}
            style={{
              padding: 12,
              backgroundColor: "#fffbeb",
              border: "1px solid #fbbf24",
              borderRadius: 8
            }}
          >
            <Typography variant="body2" component="div" style={{ lineHeight: 1.5, color: "#92400e" }}>
              As opções abaixo são salvas no servidor, mas <b>só passam a rodar na prática</b> quando você liga o
              interruptor geral acima. Depois de salvar, use <b>Salvar proatividade</b> e confira se o interruptor ficou
              como deseja.
            </Typography>
          </Paper>
        </SectionCard>
      ) : null}

      <SectionCard className={classes.sectionCardSpacing}>
        <div className={classes.switchRow} style={{ marginBottom: 12 }}>
          <Box display="flex" alignItems="center" style={{ gap: 6 }} flex={1} pr={1}>
            <span className={classes.labelSmall}>Filtrar cada fluxo por tag ou lista</span>
            <Tooltip title="Ligado: só recebe quem bate tag/lista no bloco do fluxo. Desligado: tickets elegíveis podem receber qualquer automação (demais regras do sistema).">
              <HelpOutlineIcon fontSize="small" color="action" style={{ cursor: "help" }} />
            </Tooltip>
          </Box>
          <Switch
            checked={proactiveState.applySegmentFilters !== false}
            onChange={(e) =>
              setProactiveState((prev) => ({ ...prev, applySegmentFilters: e.target.checked }))
            }
            color="primary"
            inputProps={{ "aria-label": "Filtrar por segmento" }}
          />
        </div>
        <ProactiveMissionPicker
          value={proactiveState.proactiveMission}
          onChange={(val) => setProactiveState((prev) => ({ ...prev, proactiveMission: val }))}
        />
        <Box display="flex" alignItems="center" style={{ gap: 6, marginTop: 16, marginBottom: 8 }}>
          <Typography variant="body2" style={{ fontWeight: 600, fontSize: 13 }}>
            Limites globais (insistência)
          </Typography>
          <Tooltip title="Controlam follow-up (tentativas e intervalo) e teto de reengajamentos em tickets inativos.">
            <HelpOutlineIcon fontSize="small" color="action" style={{ cursor: "help" }} />
          </Tooltip>
        </Box>
        <Grid container spacing={1} style={{ marginTop: 4 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Máximo de follow-ups automáticos (sem resposta)"
              type="number"
              fullWidth
              variant="outlined"
              size="small"
              className={classes.inputDense}
              helperText="1–15. Ao bater o limite, pode marcar inativo."
              value={proactiveState.maxFollowUpAttempts ?? 3}
              onChange={(e) =>
                setProactiveState((prev) => ({
                  ...prev,
                  maxFollowUpAttempts: Math.min(15, Math.max(1, Number(e.target.value) || 3))
                }))
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: 1, max: 15 }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Espera mínima entre um follow-up e outro (horas)"
              type="number"
              fullWidth
              variant="outlined"
              size="small"
              className={classes.inputDense}
              helperText="Opcional. Vazio = só regra de dias no follow-up."
              value={proactiveState.minHoursBetweenFollowUps ?? ""}
              onChange={(e) =>
                setProactiveState((prev) => ({
                  ...prev,
                  minHoursBetweenFollowUps: e.target.value
                }))
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: 0, max: 168 }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Máximo de reengajamentos por conversa"
              type="number"
              fullWidth
              variant="outlined"
              size="small"
              className={classes.inputDense}
              helperText="Vazio = sem teto extra. Cada reengajamento conta 1."
              value={proactiveState.maxReengagementAttempts ?? ""}
              onChange={(e) =>
                setProactiveState((prev) => ({
                  ...prev,
                  maxReengagementAttempts: e.target.value
                }))
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: 1, max: 50 }}
            />
          </Grid>
        </Grid>
      </SectionCard>

      <SectionCard className={classes.sectionCardSpacing}>
        <Typography variant="body2" style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>
          Quem entra no disparo de prospecção fria
        </Typography>
        <Typography variant="caption" color="textSecondary" style={{ display: "block", marginBottom: 10, lineHeight: 1.45 }}>
          Usado ao enfileirar contatos pela API ou pelo botão <b>Configurar disparo</b>.
        </Typography>
        <Select
          fullWidth
          variant="outlined"
          value={proactiveState.coldOutreachBlendMode || "merge"}
          onChange={(e) =>
            setProactiveState((prev) => ({ ...prev, coldOutreachBlendMode: e.target.value }))
          }
          className={`${classes.inputDense} ${classes.selectWhite}`}
        >
          <MenuItem value="merge">Unir lista + IDs (remove duplicados)</MenuItem>
          <MenuItem value="list_only">Apenas contatos da lista</MenuItem>
          <MenuItem value="ids_only">Apenas IDs informados manualmente</MenuItem>
        </Select>
      </SectionCard>

      <SectionCard className={classes.sectionCardSpacing}>
        <Box display="flex" flexWrap="wrap" style={{ gap: 6 }}>
          {OUTREACH_SNIPPETS.map((s) => (
            <Button
              key={s.label}
              size="small"
              variant="outlined"
              onClick={() =>
                setProactiveState((prev) => ({
                  ...prev,
                  hintColdOutreach: [prev.hintColdOutreach, `— ${s.label}: ${s.text}`]
                    .filter(Boolean)
                    .join("\n")
                }))
              }
            >
              {s.label}
            </Button>
          ))}
        </Box>
      </SectionCard>

      <SectionCard className={classes.sectionCardSpacing}>
        <Typography variant="body2" style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>
          Playbook de mensagens
        </Typography>
        <ProactivePlaybookPicker
          value={proactiveState.playbook}
          onChange={(val) => setProactiveState((prev) => ({ ...prev, playbook: val }))}
        />
      </SectionCard>

      <SectionCard className={classes.sectionCardSpacing}>
        <Box display="flex" alignItems="center" flexWrap="wrap" style={{ gap: 8, marginBottom: 10 }}>
          <Typography variant="body2" style={{ fontWeight: 600, fontSize: 13 }}>
            Chat ao vivo (cliente escreve)
          </Typography>
          <Tooltip title="Entra no prompt da IA com Cargo e Cérebro. Missão e playbook acima também orientam o tom. Mídias após a resposta: aba Mídias → “Resposta no chat”.">
            <HelpOutlineIcon fontSize="small" color="action" style={{ cursor: "help" }} />
          </Tooltip>
        </Box>
        <ExpandableField
          label="Roteiro comercial no chat (checklist curto)"
          value={proactiveState.inboundConversationBrief || ""}
          onChange={(e) =>
            setProactiveState((prev) => ({ ...prev, inboundConversationBrief: e.target.value }))
          }
          className={classes.inputDense}
          minRows={2}
          maxRows={12}
          placeholder="Ex.: 1) Perguntar necessidade 2) Resumir oferta 3) CTA: link ou horário"
        />
        <div className={classes.switchRow} style={{ marginTop: 10 }}>
          <Box flex={1} pr={1}>
            <span className={classes.labelSmall}>Anexos “Resposta no chat”: só na 1ª mensagem da IA no ticket</span>
            <Typography variant="caption" color="textSecondary" style={{ display: "block", marginTop: 2, lineHeight: 1.4 }}>
              Evita repetir PDF/vídeo a cada resposta. Configuração dos arquivos na aba Mídias.
            </Typography>
          </Box>
          <Switch
            checked={!!proactiveState.inboundMediaOnlyFirstResponse}
            onChange={(e) =>
              setProactiveState((prev) => ({
                ...prev,
                inboundMediaOnlyFirstResponse: e.target.checked
              }))
            }
            color="primary"
            inputProps={{ "aria-label": "Mídia inbound só na primeira resposta" }}
          />
        </div>
        <Typography variant="caption" color="textSecondary" style={{ display: "block", marginTop: 12, marginBottom: 4, fontWeight: 600 }}>
          Objetivo no chat (atalhos)
        </Typography>
        <Box display="flex" flexWrap="wrap" style={{ gap: 6, marginBottom: 8 }}>
          {(QUICK_OBJECTIVES.inbound || []).map((s) => (
            <Button
              key={`obj-inbound-${s.label}`}
              size="small"
              variant="outlined"
              onClick={() => appendObjectiveSnippet("inbound", s)}
            >
              Objetivo: {s.label}
            </Button>
          ))}
        </Box>
        <TextField
          label="Objetivo específico no chat (uma frase)"
          fullWidth
          variant="outlined"
          size="small"
          className={classes.inputDense}
          style={{ marginBottom: 10 }}
          value={(proactiveState.objectives && proactiveState.objectives.inbound) || ""}
          onChange={(e) => setObjective("inbound", e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Typography variant="caption" color="textSecondary" style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
          Tom no chat (acrescenta ao roteiro)
        </Typography>
        <Box display="flex" flexWrap="wrap" style={{ gap: 6, marginBottom: 8 }}>
          {(QUICK_TONES.inbound || []).map((s) => (
            <Button
              key={`tone-inbound-${s.label}`}
              size="small"
              variant="outlined"
              onClick={() => appendInboundBriefSnippet(s)}
            >
              Tom: {s.label}
            </Button>
          ))}
        </Box>
      </SectionCard>

      <Accordion defaultExpanded={false} className={classes.promptsAccordion}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box>
            <Typography style={{ fontWeight: 600 }}>Fluxos automáticos</Typography>
            <Typography variant="caption" color="textSecondary" style={{ display: "block", marginTop: 4 }}>
              Follow-up, lead quente, reengajamento e prospecção — detalhes no ícone de ajuda em cada bloco.
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails style={{ display: "block", paddingTop: 0 }}>
      <Grid container spacing={1}>
        {FLOWS.map((flow) => (
          <Grid item xs={12} key={flow.id}>
            <SectionCard className={classes.sectionCardSpacing}>
              <Box display="flex" alignItems="center" flexWrap="wrap" style={{ gap: 8, marginBottom: 8 }}>
                <Typography component="span" variant="body2" style={{ fontWeight: 600 }}>
                  {flow.title}
                </Typography>
                <Tooltip title={flow.desc}>
                  <HelpOutlineIcon fontSize="small" color="action" style={{ cursor: "help" }} />
                </Tooltip>
                <span
                  className={
                    flow.id === "cold_outreach" ? classes.statusBadgeWarn : classes.statusBadgeOk
                  }
                >
                  {flow.badge}
                </span>
                {flow.enabledKey ? (
                  <Box ml="auto">
                    <Switch
                      checked={proactiveState[flow.enabledKey] !== false}
                      onChange={(e) => handleFlowSwitch(flow.enabledKey, e.target.checked)}
                      color="primary"
                      inputProps={{ "aria-label": `Ativar ${flow.title}` }}
                    />
                  </Box>
                ) : null}
              </Box>

              {flow.id === "hot_lead" ? (
                <>
                  <TextField
                    label="Palavras que indicam interesse forte (separadas por vírgula)"
                    fullWidth
                    variant="outlined"
                    size="small"
                    className={classes.inputDense}
                    helperText="Quando o cliente enviar mensagem contendo algo parecido com estas palavras, o sistema pode tratar como lead quente e enviar a resposta automática deste bloco."
                    value={proactiveState.hotLeadKeywords}
                    onChange={(e) =>
                      setProactiveState((prev) => ({ ...prev, hotLeadKeywords: e.target.value }))
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                  <div className={classes.switchRow} style={{ marginTop: 10 }}>
                    <Box flex={1} pr={1}>
                      <span className={classes.labelSmall}>Atalhos de resposta no WhatsApp (botões)</span>
                      <Typography variant="caption" color="textSecondary" style={{ display: "block", marginTop: 2, lineHeight: 1.4 }}>
                        Se ligado, a mensagem de proposta pode incluir botões rápidos quando o canal suportar.
                      </Typography>
                    </Box>
                    <Switch
                      checked={proactiveState.useHotLeadButtons !== false}
                      onChange={(e) =>
                        setProactiveState((prev) => ({ ...prev, useHotLeadButtons: e.target.checked }))
                      }
                      color="primary"
                    />
                  </div>
                </>
              ) : null}

              {flow.id === "follow_up" ? (
                <TextField
                  label="Referência: dias sem mensagem do cliente para considerar follow-up"
                  type="number"
                  fullWidth
                  variant="outlined"
                  size="small"
                  className={classes.inputDense}
                  style={{ marginBottom: 10 }}
                  helperText="O job roda em janela diária (ex.: manhã), não no minuto exato. Este número orienta após quantos dias de silêncio vale insistir."
                  value={proactiveState.followUpAfterDays}
                  onChange={(e) =>
                    setProactiveState((prev) => ({
                      ...prev,
                      followUpAfterDays: Number(e.target.value)
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
              ) : null}

              {flow.id === "reengagement" ? (
                <TextField
                  label="Esperar quantas semanas com ticket inativo antes de tentar de novo"
                  type="number"
                  fullWidth
                  variant="outlined"
                  size="small"
                  className={classes.inputDense}
                  style={{ marginBottom: 10 }}
                  helperText="Ex.: 2 = na janela do job semanal, após pelo menos 2 semanas desde que a conversa foi marcada inativa."
                  value={proactiveState.reengageAfterWeeks}
                  onChange={(e) =>
                    setProactiveState((prev) => ({
                      ...prev,
                      reengageAfterWeeks: Number(e.target.value)
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
              ) : null}

              <Typography variant="caption" color="textSecondary" style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
                Ideias de objetivo (clique para acrescentar ao campo abaixo)
              </Typography>
              <Box display="flex" flexWrap="wrap" style={{ gap: 6, marginBottom: 8 }}>
                {(QUICK_OBJECTIVES[flow.id] || []).map((s) => (
                  <Button
                    key={`obj-${flow.id}-${s.label}`}
                    size="small"
                    variant="outlined"
                    onClick={() => appendObjectiveSnippet(flow.id, s)}
                  >
                    Objetivo: {s.label}
                  </Button>
                ))}
              </Box>
              <TextField
                label="O que você quer alcançar neste tipo de envio (guia para a IA)"
                fullWidth
                variant="outlined"
                size="small"
                className={classes.inputDense}
                style={{ marginBottom: 10 }}
                value={(proactiveState.objectives && proactiveState.objectives[flow.id]) || ""}
                onChange={(e) => setObjective(flow.id, e.target.value)}
                placeholder="Ex.: marcar demonstração de 15 min; enviar proposta do plano Y; só retomar o diálogo"
                helperText="Uma ou duas frases. A IA usa isso para não sair do propósito. Deixe vazio se quiser só o playbook/missão."
                InputLabelProps={{ shrink: true }}
              />

              <Typography variant="caption" color="textSecondary" style={{ display: "block", marginBottom: 4, marginTop: 4, fontWeight: 600 }}>
                Ideias de tom e limites (clique para acrescentar ao campo abaixo)
              </Typography>
              <Box display="flex" flexWrap="wrap" style={{ gap: 6, marginBottom: 8 }}>
                {(QUICK_TONES[flow.id] || []).map((s) => (
                  <Button
                    key={`tone-${flow.hintKey}-${s.label}`}
                    size="small"
                    variant="outlined"
                    onClick={() => appendToneSnippet(flow.hintKey, s)}
                  >
                    Tom: {s.label}
                  </Button>
                ))}
              </Box>
              <ExpandableField
                label="Instruções de tom: como falar, o que nunca fazer ou repetir"
                value={proactiveState[flow.hintKey] || ""}
                onChange={(e) =>
                  setProactiveState((prev) => ({ ...prev, [flow.hintKey]: e.target.value }))
                }
                className={classes.inputDense}
                minRows={2}
                maxRows={10}
              />

              <Typography variant="caption" color="textSecondary" style={{ display: "block", marginTop: 8, marginBottom: 4 }}>
                <b>Mensagem fixa (sem IA)</b> — só preencha se quiser texto sempre igual. Caso contrário deixe vazio e use a
                OpenAI (aba Integração).
              </Typography>
              <ExpandableField
                label="Texto fixo em vez da IA neste fluxo (opcional)"
                value={(proactiveState.customProactiveText && proactiveState.customProactiveText[flow.id]) || ""}
                onChange={(e) => setCustomProactiveText(flow.id, e.target.value)}
                className={classes.inputDense}
                minRows={2}
                maxRows={8}
                placeholder="Ex.: Olá {{primeiro_nome}}, passando para saber se recebeu nossa última mensagem."
              />
              <Typography variant="caption" color="textSecondary" style={{ display: "block", marginTop: 4, marginBottom: 10, lineHeight: 1.45 }}>
                Variáveis: <code>{"{{nome}} {{primeiro_nome}} {{numero}} {{ticket_id}}"}</code>
              </Typography>

              <Box display="flex" alignItems="center" style={{ gap: 6, marginTop: 4, marginBottom: 6 }}>
                <Typography variant="body2" style={{ fontWeight: 600, fontSize: 12 }}>
                  Tags e lista neste fluxo
                </Typography>
                <Tooltip
                  title={
                    proactiveState.applySegmentFilters !== false
                      ? "Vazio = sem filtro extra neste fluxo. Preencha tag e/ou lista para restringir."
                      : "Filtro global desligado: estas seleções não restringem envio."
                  }
                >
                  <HelpOutlineIcon fontSize="small" color="action" style={{ cursor: "help" }} />
                </Tooltip>
              </Box>
              <Typography variant="caption" color="textSecondary" style={{ display: "block", marginBottom: 4 }}>
                Tags (pode marcar várias)
              </Typography>
              <Select
                multiple
                displayEmpty
                fullWidth
                variant="outlined"
                value={(proactiveState.segments && proactiveState.segments[flow.id]?.tagIds) || []}
                onChange={(e) => setSegment(flow.id, { tagIds: e.target.value })}
                className={`${classes.inputDense} ${classes.selectWhite}`}
                style={{ marginTop: 6 }}
                renderValue={(selected) =>
                  !selected || selected.length === 0 ? (
                    <em>Nenhuma tag selecionada — não filtrar por tag neste fluxo</em>
                  ) : (
                    selected.map((id) => tags.find((t) => t.id === id)?.name || id).join(", ")
                  )
                }
              >
                {tags.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="textSecondary" style={{ display: "block", marginTop: 10, marginBottom: 4 }}>
                Lista de contatos (opcional)
              </Typography>
              <Select
                displayEmpty
                fullWidth
                variant="outlined"
                value={
                  (proactiveState.segments && proactiveState.segments[flow.id]?.contactListId) || ""
                }
                onChange={(e) =>
                  setSegment(flow.id, { contactListId: e.target.value === "" ? "" : e.target.value })
                }
                className={`${classes.inputDense} ${classes.selectWhite}`}
                style={{ marginTop: 2 }}
              >
                <MenuItem value="">
                  <em>Nenhuma lista — não filtrar por lista neste fluxo</em>
                </MenuItem>
                {contactLists.map((l) => (
                  <MenuItem key={l.id} value={l.id}>
                    {l.name}
                  </MenuItem>
                ))}
              </Select>
            </SectionCard>
          </Grid>
        ))}
      </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded={false} className={classes.promptsAccordion}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box>
            <Typography style={{ fontWeight: 600 }}>Avançado: horário comercial, limite por dia e sequências pós-prospecção</Typography>
            <Typography variant="caption" color="textSecondary" style={{ display: "block", marginTop: 4 }}>
              Opcional. Limite diário evita muitas mensagens automáticas no mesmo dia; horário restringe envios à janela em
              SP.
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails style={{ display: "block" }}>
          <div className={classes.switchRow} style={{ marginBottom: 12 }}>
            <span className={classes.labelSmall}>Enviar só no horário comercial (America/São Paulo)</span>
            <Switch
              checked={!!proactiveState.businessHoursEnabled}
              onChange={(e) =>
                setProactiveState((prev) => ({ ...prev, businessHoursEnabled: e.target.checked }))
              }
              color="primary"
            />
          </div>
          <Grid container spacing={2}>
            <Grid item xs={6} md={4}>
              <TextField
                label="Início (h)"
                type="number"
                fullWidth
                variant="outlined"
                size="small"
                className={classes.inputDense}
                value={proactiveState.businessStartHour}
                onChange={(e) =>
                  setProactiveState((prev) => ({
                    ...prev,
                    businessStartHour: Number(e.target.value)
                  }))
                }
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: 0, max: 23 }}
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                label="Fim (h)"
                type="number"
                fullWidth
                variant="outlined"
                size="small"
                className={classes.inputDense}
                value={proactiveState.businessEndHour}
                onChange={(e) =>
                  setProactiveState((prev) => ({
                    ...prev,
                    businessEndHour: Number(e.target.value)
                  }))
                }
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: 0, max: 24 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Teto de mensagens automáticas por conversa / dia"
                type="number"
                fullWidth
                variant="outlined"
                size="small"
                className={classes.inputDense}
                helperText="Evita disparar várias proativas no mesmo dia para o mesmo contato. 0 ou vazio = sem teto extra neste critério."
                value={proactiveState.maxProactivePerContactPerDay}
                onChange={(e) =>
                  setProactiveState((prev) => ({
                    ...prev,
                    maxProactivePerContactPerDay: e.target.value
                  }))
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {(proactiveState.sequenceSteps || []).map((step, idx) => (
            <Box
              key={idx}
              style={{
                padding: "4px 0",
                marginBottom: 4
              }}
            >
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Esperar (horas)"
                    type="number"
                    fullWidth
                    variant="outlined"
                    size="small"
                    className={classes.inputDense}
                    value={step.delayHours}
                    onChange={(e) =>
                      updateSequenceStep(idx, "delayHours", Number(e.target.value) || 0)
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    label="Instrução extra do passo"
                    fullWidth
                    variant="outlined"
                    size="small"
                    className={classes.inputDense}
                    value={step.hint || ""}
                    onChange={(e) => updateSequenceStep(idx, "hint", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <Button size="small" onClick={() => removeSequenceStep(idx)}>
                    Remover
                  </Button>
                </Grid>
              </Grid>
            </Box>
          ))}
          <Button size="small" variant="outlined" onClick={addSequenceStep}>
            Adicionar passo
          </Button>
        </AccordionDetails>
      </Accordion>

      <SectionCard className={classes.sectionCardSpacingTop}>
        <Button variant="outlined" color="primary" size="small" onClick={() => setOutreachOpen(true)}>
          Configurar disparo…
        </Button>
      </SectionCard>

      <Box mt={2}>
        <Tooltip
          disableHoverListener={canSaveSettings}
          title="Apenas administradores podem salvar configurações do agente."
        >
          <span>
            <Button
              variant="contained"
              color="primary"
              onClick={onSaveProactivity}
              disabled={!canSaveSettings}
            >
              Salvar proatividade
            </Button>
          </span>
        </Tooltip>
        {!canSaveSettings ? (
          <Typography variant="caption" color="textSecondary" display="block" style={{ marginTop: 8 }}>
            Você pode visualizar e copiar configurações, mas só administradores persistem alterações.
          </Typography>
        ) : null}
      </Box>

      <Dialog open={outreachOpen} onClose={() => setOutreachOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Disparo de prospecção</DialogTitle>
        <DialogContent>
          <Typography variant="caption" color="textSecondary" display="block" style={{ marginBottom: 8 }}>
            Modo atual:{" "}
            <b>
              {proactiveState.coldOutreachBlendMode === "list_only"
                ? "só lista"
                : proactiveState.coldOutreachBlendMode === "ids_only"
                  ? "só IDs"
                  : "lista + IDs"}
            </b>
            . Ajuste no cartão acima se precisar.
          </Typography>
          <TextField
            label="IDs de contatos (opcional)"
            fullWidth
            multiline
            minRows={3}
            variant="outlined"
            className={classes.inputDense}
            style={{ marginTop: 8 }}
            placeholder="Um ID por linha ou separados por vírgula"
            value={outreachIdsText}
            onChange={(e) => setOutreachIdsText(e.target.value)}
          />
          <Select
            displayEmpty
            fullWidth
            variant="outlined"
            className={`${classes.inputDense} ${classes.selectWhite}`}
            style={{ marginTop: 12 }}
            value={outreachListId}
            onChange={(e) => setOutreachListId(e.target.value)}
          >
            <MenuItem value="">
              <em>Ou escolha uma lista de contatos</em>
            </MenuItem>
            {contactLists.map((l) => (
              <MenuItem key={l.id} value={l.id}>
                {l.name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOutreachOpen(false)}>Cancelar</Button>
          <Button color="primary" variant="contained" onClick={openConfirm}>
            Continuar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={presetOpen} onClose={() => setPresetOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Preset &quot;campanha → venda&quot;</DialogTitle>
        <DialogContent>
          <Typography variant="body2" component="div" style={{ lineHeight: 1.55 }}>
            Serão ajustados na tela (não salvos ainda): follow-up (1 dia sem resposta, até 5 tentativas, mín. 24h entre
            envios), reengajamento (máx. 3), missão <b>vendas</b>, playbook <b>prospecção</b>,{" "}
            <b>segmentação por tags/lista desligada</b> (todos os tickets elegíveis), objetivos e dicas dos quatro
            fluxos, sequência pós-prospecção em 24h e 48h, limite de 2 proativas/ticket/dia se estiver vazio, e
            palavras-chave extras (material, pdf, demo, reunião, agendar…).
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block" style={{ marginTop: 12 }}>
            Tratativa ao vivo (perguntas, material, reunião) continua no <b>Cargo</b>, <b>Cérebro</b> e ações como{" "}
            <b>Agendamento</b>. Veja o runbook no repositório.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPresetOpen(false)}>Cancelar</Button>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              setProactiveState((prev) => applySalesCampaignPreset(prev));
              setPresetOpen(false);
              toast.success("Preset aplicado. Salve com “Salvar proatividade”.");
            }}
          >
            Aplicar na tela
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={masterFlowDialog.open}
        onClose={() => setMasterFlowDialog({ open: false, flowKey: null })}
      >
        <DialogTitle>Ativar também o interruptor geral?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" style={{ lineHeight: 1.55 }}>
            Você ligou <b>{flowTitle(masterFlowDialog.flowKey)}</b>. Para esta automação (e cold outreach) rodarem de
            verdade, é preciso deixar <b>Ativar automações proativas</b> ligado.
          </Typography>
          <Typography variant="body2" style={{ marginTop: 12, lineHeight: 1.55 }}>
            Deseja ligar o interruptor geral agora?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setMasterFlowDialog({ open: false, flowKey: null });
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              const k = masterFlowDialog.flowKey;
              setMasterFlowDialog({ open: false, flowKey: null });
              if (k) {
                setProactiveState((prev) => ({ ...prev, [k]: true }));
                toast.info(
                  "Fluxo ativado. Lembre-se de ligar o interruptor geral para as automações funcionarem."
                );
              }
            }}
          >
            Só este fluxo
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              const k = masterFlowDialog.flowKey;
              setMasterFlowDialog({ open: false, flowKey: null });
              if (k) {
                setProactiveState((prev) => ({ ...prev, enabled: true, [k]: true }));
              }
            }}
          >
            Ligar geral + fluxo
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmar envio</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {(proactiveState.coldOutreachBlendMode || "merge") === "merge" && outreachListId
              ? "Lista e IDs serão unidos (sem duplicar)."
              : null}
            {(proactiveState.coldOutreachBlendMode || "merge") === "list_only"
              ? "Somente contatos da lista (com ticket) serão incluídos."
              : null}
            {(proactiveState.coldOutreachBlendMode || "merge") === "ids_only"
              ? "Somente os IDs informados serão usados."
              : null}
            {previewCount > 0 ? ` IDs na caixa: ${previewCount}.` : null}
            {!(proactiveState.coldOutreachBlendMode === "ids_only") && outreachListId
              ? " Lista selecionada."
              : null}
          </Typography>
          <Typography variant="body2" style={{ marginTop: 8 }}>
            Deseja enfileirar o processamento?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button color="primary" variant="contained" onClick={runOutreach}>
            Enviar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
