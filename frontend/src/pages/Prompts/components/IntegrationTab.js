import React from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { SiOpenai } from "react-icons/si";
import SectionCard from "./shared/SectionCard";

export default function IntegrationTab({
  rootClassName,
  classes,
  integrationState,
  setIntegrationState,
  showApiKey,
  setShowApiKey,
  openAiModels,
  modelInfo,
  handleSaveIntegration
}) {
  const theme = useTheme();
  const isDark = theme.palette.type === "dark";
  const openAiIconColor = isDark ? "#f4f4f5" : "#111827";
  const modelMetaColor = isDark ? theme.palette.text.secondary : "#6b7280";

  return (
    <div className={`${classes.mainPaper} ${classes.mainPaperTight} ${rootClassName || ""}`}>
      <SectionCard>
        <Grid container spacing={1} alignItems="flex-start">
          <Grid item xs={12} md={6}>
            <Box>
              <Grid container spacing={1} style={{ marginBottom: 8 }}>
                <Grid item xs={12} sm={6}>
                  <div className={classes.switchRow}>
                    <span className={classes.labelSmall}>Ativo</span>
                    <Switch
                      checked={integrationState.active}
                      onChange={(e) =>
                        setIntegrationState((prev) => ({ ...prev, active: e.target.checked }))
                      }
                      color="primary"
                      inputProps={{ "aria-label": "Integração OpenAI ativa" }}
                    />
                  </div>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <div className={classes.switchRow}>
                    <span className={classes.labelSmall}>Responder em grupos do WhatsApp</span>
                    <Switch
                      checked={integrationState.responderGrupo}
                      onChange={(e) =>
                        setIntegrationState((prev) => ({ ...prev, responderGrupo: e.target.checked }))
                      }
                      color="primary"
                      inputProps={{ "aria-label": "Responder em grupos WhatsApp" }}
                    />
                  </div>
                </Grid>
              </Grid>

              <span className={classes.labelSmall}>API Key</span>
              <TextField
                placeholder="sk-..."
                type={showApiKey ? "text" : "password"}
                value={integrationState.apiKey}
                onChange={(e) =>
                  setIntegrationState((prev) => ({ ...prev, apiKey: e.target.value }))
                }
                fullWidth
                variant="outlined"
                size="small"
                className={classes.inputDense}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowApiKey((s) => !s)}
                        aria-label={showApiKey ? "Ocultar chave" : "Mostrar chave"}
                      >
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
                onChange={(e) =>
                  setIntegrationState((prev) => ({ ...prev, model: e.target.value }))
                }
                className={`${classes.inputDense} ${classes.selectWhite}`}
                inputProps={{ "aria-label": "Modelo OpenAI" }}
              >
                {openAiModels.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>

              <span className={classes.labelSmall}>Escopo</span>
              <Select
                fullWidth
                variant="outlined"
                value={integrationState.scope}
                onChange={(e) =>
                  setIntegrationState((prev) => ({ ...prev, scope: e.target.value }))
                }
                className={`${classes.inputDense} ${classes.selectWhite}`}
                inputProps={{ "aria-label": "Escopo da chave" }}
              >
                <MenuItem value="Pessoal">Pessoal</MenuItem>
                <MenuItem value="Equipe">Equipe</MenuItem>
                <MenuItem value="Global">Global</MenuItem>
              </Select>

              <Grid container spacing={1} style={{ marginTop: 8 }}>
                <Grid item xs={12} sm={4}>
                  <span className={classes.labelSmall}>top_p</span>
                  <TextField
                    value={integrationState.topP}
                    onChange={(e) =>
                      setIntegrationState((prev) => ({ ...prev, topP: Number(e.target.value) }))
                    }
                    fullWidth
                    variant="outlined"
                    size="small"
                    type="number"
                    inputProps={{ step: "0.01", min: "0", max: "1" }}
                    className={classes.inputDense}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <span className={classes.labelSmall}>presence_penalty</span>
                  <TextField
                    value={integrationState.presencePenalty}
                    onChange={(e) =>
                      setIntegrationState((prev) => ({
                        ...prev,
                        presencePenalty: Number(e.target.value)
                      }))
                    }
                    fullWidth
                    variant="outlined"
                    size="small"
                    type="number"
                    inputProps={{ step: "0.1", min: "-2", max: "2" }}
                    className={classes.inputDense}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <span className={classes.labelSmall}>frequency_penalty</span>
                  <TextField
                    value={integrationState.frequencyPenalty}
                    onChange={(e) =>
                      setIntegrationState((prev) => ({
                        ...prev,
                        frequencyPenalty: Number(e.target.value)
                      }))
                    }
                    fullWidth
                    variant="outlined"
                    size="small"
                    type="number"
                    inputProps={{ step: "0.1", min: "-2", max: "2" }}
                    className={classes.inputDense}
                  />
                </Grid>
              </Grid>

              <Box mt={2}>
                <span className={classes.labelSmall}>stop (separe por vírgula)</span>
                <TextField
                  value={integrationState.stopSequences}
                  onChange={(e) =>
                    setIntegrationState((prev) => ({ ...prev, stopSequences: e.target.value }))
                  }
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="###, FIM"
                  className={classes.inputDense}
                />
              </Box>

              <Box display="flex" alignItems="center" style={{ gap: 8, marginTop: 16 }}>
                <Switch
                  checked={integrationState.aplicarTodos}
                  onChange={(e) =>
                    setIntegrationState((prev) => ({ ...prev, aplicarTodos: e.target.checked }))
                  }
                  color="primary"
                  size="small"
                  inputProps={{ "aria-label": "Aplicar a todas as filas" }}
                />
                <Typography variant="body2">Aplicar configurações a todas as filas</Typography>
              </Box>

              <Box className={classes.formFooterBar}>
                <Button color="primary" variant="contained" onClick={handleSaveIntegration} size="small">
                  Salvar Integração
                </Button>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper className={classes.rightModelCard}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <SiOpenai size={24} color={openAiIconColor} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {(modelInfo[integrationState.model] && modelInfo[integrationState.model].title) ||
                      integrationState.model}
                  </div>
                  <div style={{ fontSize: 12, color: modelMetaColor }}>
                    {(modelInfo[integrationState.model] && modelInfo[integrationState.model].desc) ||
                      "Modelo selecionado da OpenAI."}{" "}
                    Ideal para: Chat, automação.
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                <div>
                  Contexto: <b>{modelInfo[integrationState.model]?.context || "-"}</b>
                </div>
                <div>
                  Saída Máx.: <b>{modelInfo[integrationState.model]?.output || "-"}</b>
                </div>
                <div>
                  Velocidade: <b>{modelInfo[integrationState.model]?.speed || "-"}</b>
                </div>
                <div>
                  Qualidade: <b>{modelInfo[integrationState.model]?.quality || "-"}</b>
                </div>
                <div>
                  Custo: <b>{modelInfo[integrationState.model]?.cost || "-"}</b>
                </div>
              </div>

              <div className={classes.rightSection} style={{ fontSize: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Resumo da configuração</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    Modelo: <b>{modelInfo[integrationState.model]?.title || integrationState.model}</b>
                  </div>
                  <div>
                    Escopo: <b>{integrationState.scope}</b>
                  </div>
                  <div>
                    Status: <b>{integrationState.active ? "Pronto" : "Desativado"}</b>
                  </div>
                  <div>
                    Grupos do WhatsApp: <b>{integrationState.responderGrupo ? "Sim" : "Não"}</b>
                  </div>
                </div>
              </div>

              <div className={classes.rightSection}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Preços (por 1M tokens)</div>
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
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Conexão ativa</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Status API</span>
                  <span>{integrationState.apiKey ? "Operacional" : "Indisponível"}</span>
                </div>
              </div>
            </Paper>
            <div className={classes.statusRow} style={{ marginTop: 16 }}>
              <span
                className={
                  integrationState.status.whatsapp ? classes.statusBadgeOk : classes.statusBadgeWarn
                }
              >
                WhatsApp {integrationState.status.whatsapp ? "OK" : "Não conectado"}
              </span>
              <span className={integrationState.apiKey ? classes.statusBadgeOk : classes.statusBadgeWarn}>
                API Key {integrationState.apiKey ? "informada" : "não informada"}
              </span>
            </div>
          </Grid>
        </Grid>
      </SectionCard>
    </div>
  );
}
