import React, { useState, useCallback } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Switch,
  TextField,
  Tooltip,
  Typography
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import InsertLinkIcon from "@material-ui/icons/InsertLink";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import SectionCard from "./shared/SectionCard";
import api from "../../../services/api";
import { toast } from "react-toastify";
import toastError from "../../../errors/toastError";

const CONTEXTS = [
  {
    id: "inbound",
    label: "Resposta no chat",
    cron: "Após texto da IA",
    when:
      "Quando o cliente envia mensagem e a IA responde com sucesso. Anexos seguem o texto (pausa, “não enviar se já mandei mídia” e “só na 1ª resposta” na aba Proatividade)."
  },
  {
    id: "follow_up",
    label: "Follow-up",
    cron: "Diário 9h",
    when:
      "Após a tratativa (material, proposta de reunião) o cliente pode sumir: o job de follow-up manda o texto e, se houver arquivos aqui, envia na ordem imagens → documentos → vídeos. Use “Contexto antes dos anexos” para a IA anunciar o PDF/vídeo antes dos anexos subirem."
  },
  {
    id: "hot_lead",
    label: "Lead quente",
    cron: "A cada 30 min",
    when: "Útil para catálogo, PDF de proposta ou vídeo curto logo após a mensagem de interesse."
  },
  {
    id: "reengagement",
    label: "Reengajamento",
    cron: "Segunda 10h",
    when: "Boa hora para folder novo, case de sucesso ou vídeo institucional."
  },
  {
    id: "cold_outreach",
    label: "Prospecção fria",
    cron: "Manual / API",
    when: "Primeiro o texto de abertura; em seguida os anexos (se configurados)."
  }
];

function parseUrlList(str) {
  return String(str || "")
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function joinUrls(arr) {
  return (arr || []).join("\n");
}

function shortPath(p) {
  if (!p) return "";
  const s = String(p);
  return s.length > 48 ? `…${s.slice(-44)}` : s;
}

function ensurePack(state, ctx) {
  return (
    state.mediaByContext?.[ctx] || {
      imageUrls: [],
      documentUrls: [],
      videoUrls: [],
      delayAfterTextSec: 0,
      skipIfRecentOutboundMedia: false,
      beforeMediaContext: ""
    }
  );
}

export default function MediaTab({
  classes,
  proactiveState,
  setProactiveState,
  onSaveMedia,
  canSaveSettings = true
}) {
  const [busyKey, setBusyKey] = useState("");
  const [urlDraft, setUrlDraft] = useState({});

  const updatePack = useCallback(
    (ctx, updater) => {
      setProactiveState((prev) => {
        const prevPack = ensurePack(prev, ctx);
        const nextPack = typeof updater === "function" ? updater(prevPack) : { ...prevPack, ...updater };
        return {
          ...prev,
          mediaByContext: {
            ...(prev.mediaByContext || {}),
            [ctx]: nextPack
          }
        };
      });
    },
    [setProactiveState]
  );

  const uploadFile = async (ctx, field, file) => {
    if (!file) return;
    const key = `${ctx}:${field}`;
    setBusyKey(key);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/agent-proactive/upload-media", fd);
      const webPath = data.path;
      if (!webPath) throw new Error("Resposta sem path");
      updatePack(ctx, (pack) => {
        const arr = [...(pack[field] || [])];
        if (!arr.includes(webPath)) arr.push(webPath);
        return { ...pack, [field]: arr };
      });
      toast.success("Arquivo anexado ao fluxo");
    } catch (e) {
      toastError(e);
    } finally {
      setBusyKey("");
    }
  };

  const removeAt = (ctx, field, idx) => {
    updatePack(ctx, (pack) => {
      const arr = [...(pack[field] || [])];
      arr.splice(idx, 1);
      return { ...pack, [field]: arr };
    });
  };

  const mergeUrlsFromDraft = (ctx, field) => {
    const key = `${ctx}:${field}`;
    const raw = urlDraft[key] || "";
    const urls = parseUrlList(raw);
    if (!urls.length) {
      toast.error("Cole pelo menos uma URL válida.");
      return;
    }
    updatePack(ctx, (pack) => {
      const arr = [...new Set([...(pack[field] || []), ...urls])];
      return { ...pack, [field]: arr };
    });
    setUrlDraft((d) => ({ ...d, [key]: "" }));
    toast.success("Links adicionados");
  };

  const renderChips = (ctx, field) => {
    const p = ensurePack(proactiveState, ctx);
    const arr = p[field] || [];
    if (!arr.length) return null;
    return (
      <Box display="flex" flexWrap="wrap" style={{ gap: 6, marginTop: 8 }}>
        {arr.map((path, idx) => (
          <Chip
            key={`${path}-${idx}`}
            size="small"
            label={shortPath(path)}
            onDelete={() => removeAt(ctx, field, idx)}
            title={path}
          />
        ))}
      </Box>
    );
  };

  const uploadSlot = (ctx, field, accept, label) => {
    const key = `${ctx}:${field}`;
    const busy = busyKey === key;
    return (
      <Box display="flex" alignItems="center" flexWrap="wrap" style={{ gap: 8, marginTop: 6 }}>
        <input
          type="file"
          accept={accept}
          style={{ display: "none" }}
          id={`up-${key}`}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) uploadFile(ctx, field, f);
          }}
        />
        <label htmlFor={`up-${key}`}>
          <Button
            variant="outlined"
            size="small"
            component="span"
            disabled={busy}
            startIcon={busy ? <CircularProgress size={14} /> : <CloudUploadIcon />}
          >
            {label}
          </Button>
        </label>
      </Box>
    );
  };

  return (
    <div className={`${classes.mainPaper} ${classes.mainPaperTight}`}>
      <SectionCard className={classes.sectionCardSpacing}>
        <div className={classes.switchRow}>
          <span className={classes.labelSmall}>OpenAI Vision em imagens e figurinhas</span>
          <Switch
            checked={!!proactiveState.openAiVisionInbound}
            onChange={(e) =>
              setProactiveState((prev) => ({ ...prev, openAiVisionInbound: e.target.checked }))
            }
            color="primary"
            inputProps={{ "aria-label": "Vision em mídia recebida" }}
          />
        </div>
        <div className={classes.switchRow} style={{ marginTop: 8 }}>
          <span className={classes.labelSmall}>Mensagem curta ao receber mídia (fallback)</span>
          <Switch
            checked={proactiveState.acknowledgeMedia !== false}
            onChange={(e) =>
              setProactiveState((prev) => ({ ...prev, acknowledgeMedia: e.target.checked }))
            }
            color="primary"
            inputProps={{ "aria-label": "Reconhecer mídia recebida" }}
          />
        </div>
        <div className={classes.switchRow} style={{ marginTop: 8 }}>
          <span className={classes.labelSmall}>Permitir que o modelo sugira URLs de mídia na resposta</span>
          <Switch
            checked={!!proactiveState.defaultOutbound?.allowAgentToSuggestUrls}
            onChange={(e) =>
              setProactiveState((prev) => ({
                ...prev,
                defaultOutbound: {
                  ...(prev.defaultOutbound || {}),
                  allowAgentToSuggestUrls: e.target.checked
                }
              }))
            }
            color="primary"
          />
        </div>
      </SectionCard>

      <Grid container spacing={1}>
        {CONTEXTS.map((c) => {
          const p = ensurePack(proactiveState, c.id);
          return (
            <Grid item xs={12} key={c.id}>
              <SectionCard className={classes.sectionCardSpacing}>
                <Box display="flex" alignItems="center" flexWrap="wrap" style={{ gap: 8, marginBottom: 6 }}>
                  <Typography component="span" variant="body2" style={{ fontWeight: 600 }}>
                    {c.label}
                  </Typography>
                  <Tooltip title={c.when}>
                    <HelpOutlineIcon fontSize="small" color="action" style={{ cursor: "help" }} />
                  </Tooltip>
                  <span className={classes.statusBadgeWarn}>{c.cron}</span>
                </Box>

                <Grid container spacing={1} style={{ marginTop: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Pausa após o texto (segundos)"
                      type="number"
                      fullWidth
                      variant="outlined"
                      size="small"
                      className={classes.inputDense}
                      helperText="0 = envio imediato; 5–30 s parece mais humano."
                      value={p.delayAfterTextSec ?? 0}
                      onChange={(e) =>
                        updatePack(c.id, (pack) => ({
                          ...pack,
                          delayAfterTextSec: Math.min(180, Math.max(0, Number(e.target.value) || 0))
                        }))
                      }
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: 0, max: 180 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <div className={classes.switchRow} style={{ height: "100%", alignItems: "center" }}>
                      <span className={classes.labelSmall}>
                        Não anexar se já enviei mídia neste ticket (48h)
                      </span>
                      <Switch
                        checked={!!p.skipIfRecentOutboundMedia}
                        onChange={(e) =>
                          updatePack(c.id, (pack) => ({
                            ...pack,
                            skipIfRecentOutboundMedia: e.target.checked
                          }))
                        }
                        color="primary"
                      />
                    </div>
                  </Grid>
                </Grid>

                <TextField
                  label="Contexto antes dos anexos (para a IA)"
                  fullWidth
                  variant="outlined"
                  size="small"
                  multiline
                  minRows={2}
                  className={classes.inputDense}
                  style={{ marginTop: 12 }}
                  value={p.beforeMediaContext || ""}
                  onChange={(e) =>
                    updatePack(c.id, (pack) => ({
                      ...pack,
                      beforeMediaContext: e.target.value
                    }))
                  }
                  placeholder="Ex.: avisar que segue o PDF com valores; ou que enviará um vídeo curto da demo."
                  helperText="Instrução extra ao modelo: o texto da mensagem deve preparar o cliente para as mídias que vêm em seguida."
                  InputLabelProps={{ shrink: true }}
                />

                <Typography
                  variant="subtitle2"
                  style={{ marginTop: 16, marginBottom: 6, fontWeight: 600, color: "#374151" }}
                >
                  Anexos (upload — sem colar URL)
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block" style={{ marginBottom: 8 }}>
                  Imagens, PDFs/planilhas e vídeos. Tamanho máx. ~30 MB por arquivo.
                </Typography>

                <Box style={{ border: "1px dashed #cbd5e1", borderRadius: 10, padding: 12, marginBottom: 12 }}>
                  <Typography variant="caption" style={{ fontWeight: 600 }}>
                    Imagens
                  </Typography>
                  {uploadSlot(c.id, "imageUrls", "image/*", "Enviar imagem")}
                  {renderChips(c.id, "imageUrls")}
                </Box>
                <Box style={{ border: "1px dashed #cbd5e1", borderRadius: 10, padding: 12, marginBottom: 12 }}>
                  <Typography variant="caption" style={{ fontWeight: 600 }}>
                    Documentos
                  </Typography>
                  {uploadSlot(
                    c.id,
                    "documentUrls",
                    ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,application/*",
                    "Enviar documento"
                  )}
                  {renderChips(c.id, "documentUrls")}
                </Box>
                <Box style={{ border: "1px dashed #cbd5e1", borderRadius: 10, padding: 12, marginBottom: 8 }}>
                  <Typography variant="caption" style={{ fontWeight: 600 }}>
                    Vídeos
                  </Typography>
                  {uploadSlot(c.id, "videoUrls", "video/*", "Enviar vídeo")}
                  {renderChips(c.id, "videoUrls")}
                </Box>

                <Accordion square className={classes.promptsAccordion} style={{ marginTop: 8 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                      <InsertLinkIcon fontSize="small" color="action" />
                      <Typography variant="body2">Opcional: adicionar por URL pública</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails style={{ display: "block" }}>
                    <Typography variant="caption" color="textSecondary" display="block" style={{ marginBottom: 8 }}>
                      Uma URL por linha. Útil para CDN ou arquivos já hospedados.
                    </Typography>
                    {["imageUrls", "documentUrls", "videoUrls"].map((field) => {
                      const key = `${c.id}:${field}`;
                      const lab =
                        field === "imageUrls" ? "URLs de imagem" : field === "documentUrls" ? "URLs de documento" : "URLs de vídeo";
                      return (
                        <Box key={field} style={{ marginBottom: 10 }}>
                          <TextField
                            label={lab}
                            fullWidth
                            variant="outlined"
                            size="small"
                            multiline
                            minRows={2}
                            className={classes.inputDense}
                            value={urlDraft[key] || ""}
                            onChange={(e) => setUrlDraft((d) => ({ ...d, [key]: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                          />
                          <Button
                            size="small"
                            style={{ marginTop: 4 }}
                            onClick={() => mergeUrlsFromDraft(c.id, field)}
                          >
                            Adicionar links
                          </Button>
                          <TextField
                            style={{ marginTop: 8 }}
                            fullWidth
                            variant="outlined"
                            size="small"
                            className={classes.inputDense}
                            label={`Editar lista (${lab})`}
                            multiline
                            minRows={2}
                            value={joinUrls(p[field])}
                            onChange={(e) =>
                              updatePack(c.id, (pack) => ({
                                ...pack,
                                [field]: parseUrlList(e.target.value)
                              }))
                            }
                            InputLabelProps={{ shrink: true }}
                          />
                        </Box>
                      );
                    })}
                  </AccordionDetails>
                </Accordion>
              </SectionCard>
            </Grid>
          );
        })}
      </Grid>

      <Box mt={2}>
        <Tooltip
          disableHoverListener={canSaveSettings}
          title="Apenas administradores podem salvar configurações do agente."
        >
          <span>
            <Button
              variant="contained"
              color="primary"
              onClick={onSaveMedia}
              disabled={!canSaveSettings}
            >
              Salvar mídias e timing
            </Button>
          </span>
        </Tooltip>
      </Box>
    </div>
  );
}
