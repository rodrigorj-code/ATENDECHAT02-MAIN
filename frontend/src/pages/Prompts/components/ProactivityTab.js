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
  Select,
  Switch,
  TextField,
  Typography
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import SectionCard from "./shared/SectionCard";
import api from "../../../services/api";
import { toast } from "react-toastify";
import toastError from "../../../errors/toastError";
import { applySalesCampaignPreset } from "../constants/salesCampaignPreset";

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
      "Reativa conversas em que o cliente parou de responder. Número máximo de tentativas e intervalo mínimo entre envios são configuráveis abaixo; ao atingir o limite o ticket pode ser marcado inativo."
  },
  {
    id: "hot_lead",
    title: "Lead quente",
    badge: "A cada 30 min",
    enabledKey: "hotLeadEnabled",
    hintKey: "hintHotLead",
    desc:
      "Dispara quando o modelo detecta intenção forte (palavras-chave). Pode incluir botões rápidos no WhatsApp."
  },
  {
    id: "reengagement",
    title: "Reengajamento",
    badge: "Segunda 10h",
    enabledKey: "reengagementEnabled",
    hintKey: "hintReengagement",
    desc: "Tenta retomar tickets marcados inativos após o período configurado em semanas."
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
  contactLists
}) {
  const [outreachOpen, setOutreachOpen] = useState(false);
  const [outreachIdsText, setOutreachIdsText] = useState("");
  const [outreachListId, setOutreachListId] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [presetOpen, setPresetOpen] = useState(false);

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

  return (
    <div className={`${classes.mainPaper} ${classes.mainPaperTight}`}>
      <SectionCard className={classes.sectionCardSpacing}>
        <Button variant="outlined" color="primary" size="small" onClick={() => setPresetOpen(true)}>
          Aplicar preset recomendado…
        </Button>
      </SectionCard>

      <SectionCard className={classes.sectionCardSpacing}>
        <div className={classes.switchRow}>
          <span className={classes.labelSmall}>Ativar automações proativas (master)</span>
          <Switch
            checked={!!proactiveState.enabled}
            onChange={(e) => setProactiveState((prev) => ({ ...prev, enabled: e.target.checked }))}
            color="primary"
            inputProps={{ "aria-label": "Automações proativas" }}
          />
        </div>
      </SectionCard>

      <SectionCard className={classes.sectionCardSpacing}>
        <div className={classes.switchRow} style={{ marginBottom: 12 }}>
          <span className={classes.labelSmall}>
            Exigir tags ou lista por fluxo (se desligado, todos os tickets elegíveis entram)
          </span>
          <Switch
            checked={proactiveState.applySegmentFilters !== false}
            onChange={(e) =>
              setProactiveState((prev) => ({ ...prev, applySegmentFilters: e.target.checked }))
            }
            color="primary"
            inputProps={{ "aria-label": "Filtrar por segmento" }}
          />
        </div>
        <Select
          inputProps={{ "aria-label": "Missão da conversa proativa" }}
          fullWidth
          variant="outlined"
          value={proactiveState.proactiveMission || "balanced"}
          onChange={(e) =>
            setProactiveState((prev) => ({ ...prev, proactiveMission: e.target.value }))
          }
          className={`${classes.inputDense} ${classes.selectWhite}`}
        >
          <MenuItem value="balanced">Equilibrado (responde e conduz com leveza)</MenuItem>
          <MenuItem value="sales">Vendas (perguntas, próximos passos, uso de mídia quando configurada)</MenuItem>
          <MenuItem value="support">Suporte (diagnóstico, clareza, ajuda antes de ofertas)</MenuItem>
        </Select>
        <Grid container spacing={1} style={{ marginTop: 8 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Máx. follow-ups sem resposta"
              type="number"
              fullWidth
              variant="outlined"
              size="small"
              className={classes.inputDense}
              helperText="1–15; depois marca inativo"
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
              label="Mín. horas entre follow-ups"
              type="number"
              fullWidth
              variant="outlined"
              size="small"
              className={classes.inputDense}
              helperText="Vazio ou 0 = só regra em dias"
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
              label="Máx. reengajamentos / ticket"
              type="number"
              fullWidth
              variant="outlined"
              size="small"
              className={classes.inputDense}
              helperText="Vazio = sem teto (só intervalo semanal)"
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
        <Select
          fullWidth
          variant="outlined"
          displayEmpty
          value={proactiveState.playbook || ""}
          onChange={(e) => setProactiveState((prev) => ({ ...prev, playbook: e.target.value }))}
          className={`${classes.inputDense} ${classes.selectWhite}`}
        >
          <MenuItem value="">Nenhum (só instruções abaixo)</MenuItem>
          <MenuItem value="consultivo">Consultivo</MenuItem>
          <MenuItem value="prospeccao">Prospecção</MenuItem>
          <MenuItem value="suporte_upsell">Suporte + upsell</MenuItem>
        </Select>
      </SectionCard>

      <Grid container spacing={1}>
        {FLOWS.map((flow) => (
          <Grid item xs={12} key={flow.id}>
            <SectionCard className={classes.sectionCardSpacing}>
              <Box display="flex" alignItems="center" flexWrap="wrap" style={{ gap: 8, marginBottom: 6 }}>
                <Typography component="span" variant="body2" style={{ fontWeight: 600 }}>
                  {flow.title}
                </Typography>
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
                      onChange={(e) =>
                        setProactiveState((prev) => ({ ...prev, [flow.enabledKey]: e.target.checked }))
                      }
                      color="primary"
                      inputProps={{ "aria-label": `Ativar ${flow.title}` }}
                    />
                  </Box>
                ) : null}
              </Box>
              {flow.id === "hot_lead" ? (
                <>
                  <TextField
                    label="Palavras-chave (vírgula)"
                    fullWidth
                    variant="outlined"
                    size="small"
                    className={classes.inputDense}
                    value={proactiveState.hotLeadKeywords}
                    onChange={(e) =>
                      setProactiveState((prev) => ({ ...prev, hotLeadKeywords: e.target.value }))
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                  <div className={classes.switchRow} style={{ marginTop: 8 }}>
                    <span className={classes.labelSmall}>Botões rápidos na proposta</span>
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
                  label="Dias sem resposta do cliente"
                  type="number"
                  fullWidth
                  variant="outlined"
                  size="small"
                  className={classes.inputDense}
                  style={{ marginBottom: 8 }}
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
                  label="Semanas após marcar inativo"
                  type="number"
                  fullWidth
                  variant="outlined"
                  size="small"
                  className={classes.inputDense}
                  style={{ marginBottom: 8 }}
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

              <TextField
                label="Objetivo comercial (opcional)"
                fullWidth
                variant="outlined"
                size="small"
                className={classes.inputDense}
                style={{ marginBottom: 8 }}
                value={(proactiveState.objectives && proactiveState.objectives[flow.id]) || ""}
                onChange={(e) => setObjective(flow.id, e.target.value)}
                placeholder="Ex.: marcar demo, fechar plano X"
                InputLabelProps={{ shrink: true }}
              />

              <ExpandableField
                label="Tom da mensagem / o que nunca fazer"
                value={proactiveState[flow.hintKey] || ""}
                onChange={(e) =>
                  setProactiveState((prev) => ({ ...prev, [flow.hintKey]: e.target.value }))
                }
                className={classes.inputDense}
                minRows={2}
                maxRows={10}
              />

              <ExpandableField
                label="Texto fixo (opcional — substitui a IA neste fluxo)"
                value={(proactiveState.customProactiveText && proactiveState.customProactiveText[flow.id]) || ""}
                onChange={(e) => setCustomProactiveText(flow.id, e.target.value)}
                className={classes.inputDense}
                minRows={2}
                maxRows={8}
                placeholder={
                  "Mustache: {{nome}}, {{primeiro_nome}}, {{numero}}, {{ticket_id}}. Deixe vazio para gerar com OpenAI."
                }
              />

              <Typography variant="caption" color="textSecondary" style={{ marginTop: 12, display: "block" }}>
                {proactiveState.applySegmentFilters !== false
                  ? "Público-alvo (opcional): se preencher tags ou lista, só esses contatos recebem este fluxo."
                  : "Filtro por tags/lista desligado globalmente — este bloco não restringe o público."}
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
                    <em>Tags (nenhuma = todos)</em>
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
                style={{ marginTop: 8 }}
              >
                <MenuItem value="">
                  <em>Lista de contatos (nenhuma)</em>
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

      <Accordion defaultExpanded={false} className={classes.promptsAccordion}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography style={{ fontWeight: 600 }}>Avançado: horário, limite diário e sequências</Typography>
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
                label="Máx. proativas / ticket / dia"
                type="number"
                fullWidth
                variant="outlined"
                size="small"
                className={classes.inputDense}
                helperText="0 ou vazio = sem limite extra"
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
        <Button variant="contained" color="primary" onClick={onSaveProactivity}>
          Salvar proatividade
        </Button>
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
