import React, { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Grid,
  Paper,
  Typography,
  ButtonGroup,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from "@material-ui/core";
import CodeIcon from "@material-ui/icons/Code";
import { i18n } from "./translate/i18n";

const useStyles = makeStyles(theme => ({
  viewport: {
    paddingTop: 0,
    paddingBottom: 0,
    fontFamily: '"Helvetica Neue", Arial, Helvetica, sans-serif'
  },
  container: {
    width: "100%",
    maxWidth: 1120,
    margin: "0 auto"
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    borderRadius: 16,
    border: "2px solid #e5e7eb"
  },
  cardHeader: {
    padding: theme.spacing(0.25, 1.8),
    paddingBottom: theme.spacing(0.15)
  },
  priceWrap: {
    padding: theme.spacing(0.25, 1.8),
    paddingTop: theme.spacing(0.15)
  },
  priceMain: {
    fontSize: "0.95rem",
    fontWeight: 400
  },
  priceSuffix: {
    marginLeft: theme.spacing(0.5),
    fontSize: "0.7rem",
    color: theme.palette.text.secondary
  },
  action: {
    marginTop: theme.spacing(0.2)
  },
  features: {
    paddingTop: theme.spacing(0.1),
    paddingBottom: theme.spacing(0.1),
    paddingLeft: theme.spacing(1.8),
    paddingRight: theme.spacing(1.8),
    '& .MuiListItem-root': {
      paddingTop: 0,
      paddingBottom: 0,
      minHeight: 'auto'
    },
    '& .MuiListItemIcon-root': {
      minWidth: 22
    },
    '& .MuiTypography-body2': {
      fontSize: '0.66rem',
      fontWeight: 400,
      lineHeight: 1.15
    }
  },
  cycleWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: theme.spacing(1.2)
  },
  cyclePill: {
    display: "inline-flex",
    alignItems: "center",
    position: "relative",
    height: 32,
    padding: 3,
    background: "#ffffff",
    borderRadius: 9999,
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 2px rgba(0,0,0,0.06), 0 4px 10px rgba(0,0,0,0.06)"
  },
  cycleBtn: {
    minWidth: 86,
    height: 26,
    borderRadius: 9999,
    textTransform: "none",
    fontSize: 11.5,
    padding: "3px 8px",
    color: "#475569",
    "&:hover": {
      background: "#f1f5f9"
    }
  },
  cycleBtnActive: {
    background: "#e5e7eb",
    color: "#0b2a7e",
    fontWeight: 600,
    "&:hover": {
      background: "#e5e7eb"
    }
  },
  best: {
    border: `2px solid ${theme.palette.primary.main}`,
    borderRadius: 16
  },
  dark: {
    background: theme.palette.type === "light" ? "#0c0f1a" : theme.palette.background.paper,
    color: "#fff",
    borderRadius: 16,
    border: "2px solid rgba(255,255,255,0.12)"
  }
}));

const t = (k, fb) => {
  const r = i18n.t(k);
  return r !== k ? r : fb;
};

const priceParts = v => ({ main: `R$${v}`, suffix: t("register.plans.priceSuffix", "/mês") });

const renderText = text => <span>{text}</span>;

export default function PlanosPreview({ onChoose }) {
  const classes = useStyles();
  const [cycle, setCycle] = useState("anual");
  const history = useHistory();

  const prices = useMemo(
    () => ({
      starter: cycle === "mensal" ? 147 : cycle === "semestral" ? 112 : 91,
      essencial: cycle === "mensal" ? 460 : cycle === "semestral" ? 402 : 344,
      pro: cycle === "mensal" ? 807 : cycle === "semestral" ? 750 : 692
    }),
    [cycle]
  );

  const Feature = ({ text, dark }) => (
    <ListItem dense>
      <ListItemIcon>
        <CodeIcon style={{ color: dark ? "#cbd5e1" : "#64748b" }} fontSize="small" />
      </ListItemIcon>
      <ListItemText
        primaryTypographyProps={{ variant: "body2" }}
        primary={<span>{renderText(text)}</span>}
      />
    </ListItem>
  );

  const names = {
    starter: t("register.plans.planNames.starter", "Starter"),
    essencial: t("register.plans.planNames.essential", "Essencial"),
    pro: t("register.plans.planNames.pro", "Pro")
  };

  const ribbons = {
    bestPrice: t("register.plans.bestPrice", "Melhor preço"),
    bestSeller: t("register.plans.bestSeller", "Mais vendido")
  };

  const actionLabel = t("register.plans.actions.startNow", "Comece agora");
  const choose = (tier) => {
    if (typeof onChoose === "function") {
      onChoose(cycle, tier);
      return;
    }
    history.push(`/payment?cycle=${cycle}&tier=${tier}`);
  };

  const featsStarter = i18n.t("register.plans.features.starter", { returnObjects: true }) || [
    "Criação e gerenciamento de negócios e produtos.",
    "Gerenciamento de até 10 mil leads com controle de tags.",
    "Cadastro de até 3 membros da empresa.",
    "Automações para interagir com leads.",
    "Multiatendimento com até 2 conexões (WhatsApp).",
    "2 integrações com Webhooks.",
    "Dashboards de negócios das pipelines."
  ];
  const featsEssencial = i18n.t("register.plans.features.essential", { returnObjects: true }) || [
    "Pipelines ilimitadas.",
    "Gerenciamento de até 100 mil leads.",
    "Cadastro de 15 membros na empresa.",
    "Automações avançadas.",
    "Até 10 conexões (WhatsApp).",
    "15 integrações com Webhooks.",
    "Dashboards de negócios.",
    "Acesso à API de integração."
  ];
  const featsPro = i18n.t("register.plans.features.pro", { returnObjects: true }) || [
    "Pipelines ilimitadas.",
    "Leads ilimitados com tags.",
    "Negócios e produtos avançados.",
    "Membros ilimitados na empresa.",
    "Automações ilimitadas.",
    "Conexões ilimitadas (WhatsApp).",
    "Integrações com Webhooks ilimitadas.",
    "Dashboards e API de integração."
  ];

  return (
    <Box className={classes.viewport}>
      <Box className={classes.container}>
        {/* Navbar de seções (ciclos) movida para o topo */}
        <Box className={classes.cycleWrap}>
          <Box className={classes.cyclePill}>
            <Button
              disableElevation
              className={`${classes.cycleBtn} ${cycle === "anual" ? classes.cycleBtnActive : ""}`}
              onClick={() => setCycle("anual")}
            >
              {t("register.plans.cycle.annual", "Anual")}
            </Button>
            <Button
              disableElevation
              className={`${classes.cycleBtn} ${cycle === "semestral" ? classes.cycleBtnActive : ""}`}
              onClick={() => setCycle("semestral")}
            >
              {t("register.plans.cycle.semiannual", "Semestral")}
            </Button>
            <Button
              disableElevation
              className={`${classes.cycleBtn} ${cycle === "mensal" ? classes.cycleBtnActive : ""}`}
              onClick={() => setCycle("mensal")}
            >
              {t("register.plans.cycle.monthly", "Mensal")}
            </Button>
          </Box>
        </Box>
        {/* Espaço entre cada plano */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" className={classes.card}>
              <Box className={classes.cardHeader}>
                <Typography variant="subtitle2" style={{ fontWeight: 400 }}>{names.starter}</Typography>
                <Typography variant="body2" color="textSecondary" style={{ fontWeight: 400 }}>
                  {t("register.plans.descriptions.starter", "Recursos essenciais para começar com a equipe enxuta.")}
                </Typography>
              </Box>
              <Box className={classes.priceWrap}>
                <Box display="flex" alignItems="baseline">
                  <Typography variant="caption" color="textSecondary" style={{ textDecoration: "line-through", marginRight: 8 }}>
                    {priceParts(Math.round(prices.starter * 1.25)).main}
                  </Typography>
                  <Typography className={classes.priceMain}>{priceParts(prices.starter).main}</Typography>
                  <Typography className={classes.priceSuffix}>{priceParts(prices.starter).suffix}</Typography>
                </Box>
                <Button fullWidth size="small" variant="outlined" color="default" className={classes.action} onClick={() => choose("starter")}>
                  {actionLabel}
                </Button>
              </Box>
              <Divider />
              <List dense className={classes.features}>
                {featsStarter.map(ft => (
                  <Feature key={ft} text={ft} />
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" className={`${classes.card} ${classes.best}`}>
              <Box className={classes.cardHeader}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle2" style={{ fontWeight: 400 }}>{names.essencial}</Typography>
                  <Typography variant="caption" color="primary" style={{ fontWeight: 400 }}>
                    {ribbons.bestPrice}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" style={{ fontWeight: 400 }}>
                  {t("register.plans.descriptions.essential", "Funcionalidades avançadas e limites ampliados para escalar.")}
                </Typography>
              </Box>
              <Box className={classes.priceWrap}>
                <Box display="flex" alignItems="baseline">
                  <Typography variant="caption" color="textSecondary" style={{ textDecoration: "line-through", marginRight: 8 }}>
                    {priceParts(Math.round(prices.essencial * 1.25)).main}
                  </Typography>
                  <Typography className={classes.priceMain}>{priceParts(prices.essencial).main}</Typography>
                  <Typography className={classes.priceSuffix}>{priceParts(prices.essencial).suffix}</Typography>
                </Box>
                <Button fullWidth size="small" color="primary" variant="contained" className={classes.action} onClick={() => choose("essencial")}>
                  {actionLabel}
                </Button>
              </Box>
              <Divider />
              <List dense className={classes.features}>
                {featsEssencial.map(ft => (
                  <Feature key={ft} text={ft} />
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" className={`${classes.card} ${classes.dark}`}>
              <Box className={classes.cardHeader}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle2" style={{ fontWeight: 400, color: "#fff" }}>{names.pro}</Typography>
                  <Typography variant="caption" style={{ color: "#cbd5e1", fontWeight: 400 }}>
                    {ribbons.bestSeller}
                  </Typography>
                </Box>
                <Typography variant="body2" style={{ color: "#cbd5e1", fontWeight: 400 }}>
                  {t("register.plans.descriptions.pro", "Para alta escala com automações e integrações ilimitadas.")}
                </Typography>
              </Box>
              <Box className={classes.priceWrap}>
                <Box display="flex" alignItems="baseline">
                  <Typography variant="caption" style={{ color: "#cbd5e1", textDecoration: "line-through", marginRight: 8 }}>
                    {priceParts(Math.round(prices.pro * 1.25)).main}
                  </Typography>
                  <Typography className={classes.priceMain}>{priceParts(prices.pro).main}</Typography>
                  <Typography className={classes.priceSuffix} style={{ color: "#cbd5e1" }}>
                    {priceParts(prices.pro).suffix}
                  </Typography>
                </Box>
                <Button fullWidth size="small" variant="contained" color="primary" className={classes.action} onClick={() => choose("pro")}>
                  {actionLabel}
                </Button>
              </Box>
              <Divider />
              <List dense className={classes.features}>
                {featsPro.map(ft => (
                  <Feature key={ft} text={ft} dark />
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
