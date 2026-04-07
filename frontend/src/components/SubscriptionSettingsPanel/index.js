import React, { useState, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Paper, Grid, TextField, Button, Typography, Box } from "@material-ui/core";
import { Link } from "react-router-dom";
import SubscriptionModal from "../SubscriptionModal";
import { useDate } from "../../hooks/useDate";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    width: "100%",
  },
}));

/**
 * Bloco de assinatura / pagamento para a aba Configurações (admin ou white label).
 */
const SubscriptionSettingsPanel = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { returnDays } = useDate();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <SubscriptionModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <Paper className={classes.paper} variant="outlined">
        <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 600 }}>
          Sua assinatura
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Período de licença"
              value={
                returnDays(user?.company?.dueDate) === 0
                  ? "Sua licença vence hoje!"
                  : `Sua licença vence em ${returnDays(user?.company?.dueDate)} dias!`
              }
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: true }}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="E-mail de cobrança"
              value={user?.email || ""}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: true }}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" flexWrap="wrap" alignItems="center" style={{ gap: 12 }}>
              <Button variant="contained" color="primary" onClick={() => setModalOpen(true)}>
                Assine agora / alterar plano
              </Button>
              <Button variant="outlined" component={Link} to="/payment">
                Abrir página de pagamento
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export default SubscriptionSettingsPanel;
