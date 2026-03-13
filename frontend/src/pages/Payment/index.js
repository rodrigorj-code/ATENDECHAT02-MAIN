import React, { useMemo, useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Typography, Paper, CircularProgress } from "@material-ui/core";
import { useLocation } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(2, 0.5),
    background: theme.palette.type === "light" ? "#f5f7fb" : theme.palette.background.default,
  },
  frameWrap: {
    width: "calc(100vw - 8px)",
    height: 720,
    maxWidth: "100vw",
    maxHeight: "80vh",
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 8,
    background: theme.palette.type === "light" ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.35)",
    zIndex: 2,
  },
  iframe: {
    width: "100%",
    height: "100%",
    border: "none",
  },
  placeholder: {
    padding: theme.spacing(3),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

const resolveLink = (cycle, tier) => {
  const map = {
    mensal: {
      starter: "https://pay.cakto.com.br/yfsvcpc",
      essencial: "https://pay.cakto.com.br/dm2p96b",
      pro: "https://pay.cakto.com.br/3ecov2x",
    },
    semestral: {
      starter: "https://pay.cakto.com.br/3wkepst",
      essencial: "https://pay.cakto.com.br/rasnk6e",
      pro: "https://pay.cakto.com.br/ecosrjo",
    },
    anual: {
      starter: "https://pay.cakto.com.br/8jcckd5",
      essencial: "https://pay.cakto.com.br/h8woa7d",
      pro: "https://pay.cakto.com.br/me8p4x3",
    },
  };
  const c = String(cycle || "").toLowerCase();
  const t = String(tier || "").toLowerCase();
  return map[c]?.[t] || null;
};

export default function Payment() {
  const classes = useStyles();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const cycle = params.get("cycle"); // mensal|semestral|anual
  const tier = params.get("tier"); // starter|essencial|pro
  const directUrl = params.get("url");

  const url = useMemo(() => {
    if (directUrl) return directUrl;
    return resolveLink(cycle, tier);
  }, [directUrl, cycle, tier]);

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(false);
  }, [url]);

  return (
    <Box className={classes.root}>
      <Paper elevation={1} className={classes.frameWrap}>
        {url ? (
          <>
            {!loaded && (
              <div className={classes.loader}>
                <CircularProgress size={28} />
                <Typography variant="caption" color="textSecondary">Carregando checkout...</Typography>
              </div>
            )}
            <iframe title="Pagamento" src={url} className={classes.iframe} onLoad={() => setLoaded(true)} />
          </>
        ) : (
          <div className={classes.placeholder}>
            <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 8 }}>
              Selecione um plano para prosseguir com o pagamento
            </Typography>
            <Typography variant="body2">
              Volte à página de planos e escolha o ciclo e o plano desejados.
            </Typography>
          </div>
        )}
      </Paper>
    </Box>
  );
}
