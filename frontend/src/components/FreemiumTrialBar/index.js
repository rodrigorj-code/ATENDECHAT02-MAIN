import React, { useContext, useMemo, useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  CircularProgress
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import moment from "moment";
import { AuthContext } from "../../context/Auth/AuthContext";
import PlanosPreview from "../../PlanosPreview";
import { buildCaktoCheckoutUrl } from "../../utils/caktoCheckout";

const useStyles = makeStyles((theme) => ({
  bar: {
    margin: "8px 16px 0",
    padding: "10px 16px",
    borderRadius: 8,
    background: "linear-gradient(90deg, #0ea5e9 0%, #6366f1 100%)",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontWeight: 400,
    transition: "opacity 0.2s ease",
    "&:hover": {
      opacity: 0.95
    },
    "&:focus": {
      outline: "none",
      boxShadow: "0 0 0 2px rgba(255,255,255,0.35)"
    }
  },
  barMain: {
    fontSize: "0.875rem",
    fontWeight: 400,
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    color: "#fff",
    lineHeight: 1.35
  },
  barHint: {
    fontSize: "0.75rem",
    fontWeight: 400,
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    color: "#fff",
    opacity: 0.95
  },
  dialogTitle: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontWeight: 400
  },
  frameWrap: {
    width: "100%",
    minHeight: 560,
    height: "min(72vh, 720px)",
    maxHeight: "80vh",
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    border: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  loader: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 8,
    background: theme.palette.type === "light" ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.35)",
    zIndex: 2
  },
  iframe: {
    width: "100%",
    height: "100%",
    border: "none"
  }
}));

/**
 * Barra: período grátis Starter. Modal: planos → checkout Cakto no mesmo modal (sem mudar de rota).
 */
const FreemiumTrialBar = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [modalView, setModalView] = useState("plans");
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    setIframeLoaded(false);
  }, [checkoutUrl]);

  const { show, daysRemaining } = useMemo(() => {
    if (!user?.company || user.company.id === 1) {
      return { show: false, daysRemaining: null };
    }
    if (user.company.recurrence !== "freemium") {
      return { show: false, daysRemaining: null };
    }
    const due = user.company.dueDate;
    if (!due || !moment(due).isValid()) {
      return { show: false, daysRemaining: null };
    }
    const today = moment().startOf("day");
    const end = moment(due).startOf("day");
    if (today.isAfter(end)) {
      return { show: false, daysRemaining: 0 };
    }
    const days = end.diff(today, "days");
    return { show: true, daysRemaining: days };
  }, [user]);

  const handleChoosePlan = (cycle, tier) => {
    const url = buildCaktoCheckoutUrl(cycle, tier, user?.email);
    if (!url) return;
    setCheckoutUrl(url);
    setModalView("checkout");
  };

  const handleCloseModal = () => {
    setOpen(false);
    setModalView("plans");
    setCheckoutUrl(null);
    setIframeLoaded(false);
  };

  const handleBackToPlans = () => {
    setModalView("plans");
    setCheckoutUrl(null);
    setIframeLoaded(false);
  };

  if (!show) {
    return null;
  }

  const label =
    daysRemaining === 0
      ? "último dia do período grátis"
      : `${daysRemaining} dia${daysRemaining !== 1 ? "s" : ""} restante${daysRemaining !== 1 ? "s" : ""} no Starter grátis`;

  return (
    <>
      <Box
        className={classes.bar}
        onClick={() => {
          setOpen(true);
          setModalView("plans");
          setCheckoutUrl(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setOpen(true);
            setModalView("plans");
            setCheckoutUrl(null);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <Typography component="span" className={classes.barMain}>
          Período grátis Starter · {label}
        </Typography>
        <Typography component="span" className={classes.barHint}>
          Ver planos pagos
        </Typography>
      </Box>

      <Dialog open={open} onClose={handleCloseModal} maxWidth="md" fullWidth scroll="body">
        <DialogTitle className={classes.dialogTitle} disableTypography>
          <Typography
            variant="h6"
            component="span"
            style={{
              fontWeight: 400,
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
            }}
          >
            {modalView === "checkout" ? "Pagamento" : "Planos pagos"}
          </Typography>
        </DialogTitle>

        <DialogContent dividers={modalView === "plans"} style={modalView === "checkout" ? { padding: 0 } : undefined}>
          {modalView === "plans" ? (
            <PlanosPreview onChoose={handleChoosePlan} />
          ) : (
            <Box p={2}>
              <Paper elevation={0} className={classes.frameWrap}>
                {checkoutUrl ? (
                  <>
                    {!iframeLoaded && (
                      <div className={classes.loader}>
                        <CircularProgress size={28} />
                        <Typography variant="caption" color="textSecondary" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                          Carregando checkout...
                        </Typography>
                      </div>
                    )}
                    <iframe
                      title="Pagamento"
                      src={checkoutUrl}
                      className={classes.iframe}
                      onLoad={() => setIframeLoaded(true)}
                    />
                  </>
                ) : null}
              </Paper>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          {modalView === "checkout" ? (
            <Button
              onClick={handleBackToPlans}
              color="default"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontWeight: 400 }}
            >
              Voltar aos planos
            </Button>
          ) : null}
          <Button
            onClick={handleCloseModal}
            color="default"
            style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontWeight: 400 }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FreemiumTrialBar;
