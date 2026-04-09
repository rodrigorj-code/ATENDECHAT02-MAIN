import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
  CircularProgress,
  Typography,
  Divider,
  Box
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { i18n } from "../../translate/i18n";
import usePlans from "../../hooks/usePlans";
import moment from "moment";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  sectionTitle: {
    margin: theme.spacing(2, 0, 1),
    fontWeight: "bold",
  },
  divider: {
    margin: theme.spacing(1, 0, 2),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

const CompanySchema = Yup.object().shape({
  name: Yup.string().required("Obrigatório"),
  email: Yup.string().email("E-mail inválido").required("Obrigatório"),
  planId: Yup.string().required("Obrigatório"),
  password: Yup.string().when("id", {
    is: (id) => id === undefined,
    then: Yup.string().required("Obrigatório para novas empresas").min(5, "Mínimo 5 caracteres"),
    otherwise: Yup.string().nullable(),
  }),
});

const ModalCompany = ({ open, onClose, company, onSave }) => {
  const classes = useStyles();
  const [plans, setPlans] = useState([]);
  const { list: listPlans } = usePlans();

  const initialState = {
    name: "",
    email: "",
    phone: "",
    planId: "",
    status: true,
    dueDate: "",
    recurrence: "MENSAL",
    password: "",
    document: "",
    generateInvoice: true,
    // Permissões e Configurações Globais
    userRating: "disabled",
    scheduleType: "disabled",
    sendGreetingAccepted: "enabled",
    userRandom: "enabled",
    sendMsgTransfTicket: "enabled",
    acceptCallWhatsapp: "enabled",
    sendSignMessage: "enabled",
    sendGreetingMessageOneQueues: "enabled",
    sendQueuePosition: "enabled",
    sendFarewellWaitingTicket: "enabled",
    acceptAudioMessageContact: "enabled",
    enableLGPD: "disabled",
    requiredTag: "enabled",
    closeTicketOnTransfer: false,
    DirectTicketsToWallets: false,
    showNotificationPending: false,
    // Novas Permissões de Módulos e Tickets (Baseadas no ModalUsers)
    allHistoric: "disabled",
    allTicket: "disable",
    allUserChat: "disabled",
    allUserChatHistoric: "disabled",
    allUserChatHistoricTotal: "disabled",
    userChat: "enabled",
    viewMessagesPending: "enabled",
    viewMessagesPendingHistoric: "disabled",
    closePendingTicket: "enabled",
    campaigns: "enabled",
    contacts: "enabled",
    dashboard: "enabled",
    connections: "enabled",
    flow: "enabled",
    groups: "disable",
    kanban: "enabled",
    internalChat: "enabled",
    schedules: "enabled",
    quickAnswers: "enabled",
    tags: "enabled",
    settings: "enabled",
    financeiro: "enabled",
  };

  const [record, setRecord] = useState(initialState);

  useEffect(() => {
    async function fetchData() {
      const list = await listPlans();
      setPlans(list);
    }
    fetchData();
  }, [listPlans]);

  useEffect(() => {
    async function fetchCompanyData() {
      if (company && open) {
        try {
          // Buscar configurações atuais da empresa se estiver editando
          const { data: settings } = await api.get(`/companySettings/${company.id}`);
          
          const settingsObj = {};
          if (Array.isArray(settings)) {
            settings.forEach(s => {
              settingsObj[s.column] = s.data;
            });
          }

          setRecord({
            ...initialState,
            ...company,
            ...settingsObj,
            dueDate: company.dueDate ? moment(company.dueDate).format("YYYY-MM-DD") : "",
            password: ""
          });
        } catch (e) {
          setRecord({
            ...initialState,
            ...company,
            dueDate: company.dueDate ? moment(company.dueDate).format("YYYY-MM-DD") : "",
            password: ""
          });
        }
      } else {
        setRecord(initialState);
      }
    }
    fetchCompanyData();
  }, [company, open]);

  const handleClose = () => {
    onClose();
    setRecord(initialState);
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          {company ? "Editar Empresa" : "Nova Empresa"}
        </DialogTitle>
        <Formik
          initialValues={record}
          enableReinitialize={true}
          validationSchema={CompanySchema}
          onSubmit={(values, actions) => {
            const data = {
              ...values,
              planId: values.planId ? parseInt(values.planId, 10) : undefined
            };
            onSave(data);
            actions.setSubmitting(false);
          }}
        >
          {({ touched, errors, isSubmitting, values }) => (
            <Form>
              <DialogContent dividers>
                <Typography variant="subtitle1" className={classes.sectionTitle}>
                  Dados da Organização
                </Typography>
                <Divider className={classes.divider} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      label="Nome da Empresa"
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      label="E-mail"
                      name="email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      label="Senha"
                      type="password"
                      name="password"
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      autoComplete="new-password"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      label="Telefone"
                      name="phone"
                      variant="outlined"
                      margin="dense"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl margin="dense" variant="outlined" fullWidth>
                      <InputLabel>Plano</InputLabel>
                      <Field
                        as={Select}
                        label="Plano"
                        name="planId"
                      >
                        {plans.map((plan) => (
                          <MenuItem key={plan.id} value={plan.id}>
                            {plan.name}
                          </MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl margin="dense" variant="outlined" fullWidth>
                      <InputLabel>Ativo</InputLabel>
                      <Field
                        as={Select}
                        label="Ativo"
                        name="status"
                      >
                        <MenuItem value={true}>Sim</MenuItem>
                        <MenuItem value={false}>Não</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Field
                      as={TextField}
                      label="CNPJ/CPF"
                      name="document"
                      variant="outlined"
                      margin="dense"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Field
                      as={TextField}
                      label="Vencimento"
                      type="date"
                      name="dueDate"
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl margin="dense" variant="outlined" fullWidth>
                      <InputLabel>Recorrência</InputLabel>
                      <Field
                        as={Select}
                        label="Recorrência"
                        name="recurrence"
                      >
                        <MenuItem value="MENSAL">Mensal</MenuItem>
                        <MenuItem value="BIMESTRAL">Bimestral</MenuItem>
                        <MenuItem value="TRIMESTRAL">Trimestral</MenuItem>
                        <MenuItem value="SEMESTRAL">Semestral</MenuItem>
                        <MenuItem value="ANUAL">Anual</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl margin="dense" variant="outlined" fullWidth>
                      <InputLabel>Gerar Fatura</InputLabel>
                      <Field
                        as={Select}
                        label="Gerar Fatura"
                        name="generateInvoice"
                      >
                        <MenuItem value={true}>Sim</MenuItem>
                        <MenuItem value={false}>Não</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>
                </Grid>

                <Box mt={4}>
                  <Typography variant="subtitle1" className={classes.sectionTitle}>
                    Permissões e Configurações Globais
                  </Typography>
                  <Divider className={classes.divider} />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary" style={{ fontWeight: 'bold', marginTop: 8 }}>
                        Comportamento e Recursos de Tickets
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Ver Tickets de Outros</InputLabel>
                        <Field as={Select} label="Ver Tickets de Outros" name="allTicket">
                          <MenuItem value="enable">Habilitado</MenuItem>
                          <MenuItem value="disable">Desabilitado</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Ver Histórico Completo</InputLabel>
                        <Field as={Select} label="Ver Histórico Completo" name="allHistoric">
                          <MenuItem value="enabled">Habilitado</MenuItem>
                          <MenuItem value="disabled">Desabilitado</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Ver Chats de Outros</InputLabel>
                        <Field as={Select} label="Ver Chats de Outros" name="allUserChat">
                          <MenuItem value="enabled">Habilitado</MenuItem>
                          <MenuItem value="disabled">Desabilitado</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Ver Msg em Pendentes</InputLabel>
                        <Field as={Select} label="Ver Msg em Pendentes" name="viewMessagesPending">
                          <MenuItem value="enabled">Habilitado</MenuItem>
                          <MenuItem value="disabled">Desabilitado</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Fechar Tickets Pendentes</InputLabel>
                        <Field as={Select} label="Fechar Tickets Pendentes" name="closePendingTicket">
                          <MenuItem value="enabled">Habilitado</MenuItem>
                          <MenuItem value="disabled">Desabilitado</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Aceitar Chamadas WhatsApp</InputLabel>
                        <Field as={Select} label="Aceitar Chamadas WhatsApp" name="acceptCallWhatsapp">
                          <MenuItem value="enabled">Habilitado</MenuItem>
                          <MenuItem value="disabled">Desabilitado</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary" style={{ fontWeight: 'bold', marginTop: 16 }}>
                        Módulos e Acessos (Habilitar para a Empresa)
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Dashboard</InputLabel>
                        <Field as={Select} label="Dashboard" name="dashboard">
                          <MenuItem value="enabled">Habilitado</MenuItem>
                          <MenuItem value="disabled">Desabilitado</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Contatos</InputLabel>
                        <Field as={Select} label="Contatos" name="contacts">
                          <MenuItem value="enabled">Habilitado</MenuItem>
                          <MenuItem value="disabled">Desabilitado</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Campanhas</InputLabel>
                        <Field as={Select} label="Campanhas" name="campaigns">
                          <MenuItem value="enabled">Habilitado</MenuItem>
                          <MenuItem value="disabled">Desabilitado</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Flow (Chatbot)</InputLabel>
                        <Field as={Select} label="Flow (Chatbot)" name="flow">
                          <MenuItem value="enabled">Habilitado</MenuItem>
                          <MenuItem value="disabled">Desabilitado</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Kanban</InputLabel>
                        <Field as={Select} label="Kanban" name="kanban">
                          <MenuItem value="enabled">Habilitado</MenuItem>
                          <MenuItem value="disabled">Desabilitado</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Agendamentos</InputLabel>
                        <Field as={Select} label="Agendamentos" name="schedules">
                          <MenuItem value="enabled">Habilitado</MenuItem>
                          <MenuItem value="disabled">Desabilitado</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Chat Interno</InputLabel>
                        <Field as={Select} label="Chat Interno" name="internalChat">
                          <MenuItem value="enabled">Habilitado</MenuItem>
                          <MenuItem value="disabled">Desabilitado</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Financeiro</InputLabel>
                        <Field as={Select} label="Financeiro" name="financeiro">
                          <MenuItem value="enabled">Habilitado</MenuItem>
                          <MenuItem value="disabled">Desabilitado</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary" style={{ fontWeight: 'bold', marginTop: 16 }}>
                        Configurações Gerais de Operação
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Avaliações</InputLabel>
                        <Field as={Select} label="Avaliações" name="userRating">
                          <MenuItem value="enabled">Habilitado</MenuItem>
                          <MenuItem value="disabled">Desabilitado</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Gerenciamento de Horários</InputLabel>
                        <Field as={Select} label="Gerenciamento de Horários" name="scheduleType">
                          <MenuItem value="disabled">Desabilitado</MenuItem>
                          <MenuItem value="queue">Por Fila</MenuItem>
                          <MenuItem value="company">Por Empresa</MenuItem>
                          <MenuItem value="connection">Por Conexão</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Assinatura nas Mensagens</InputLabel>
                        <Field as={Select} label="Assinatura nas Mensagens" name="sendSignMessage">
                          <MenuItem value="enabled">Habilitado</MenuItem>
                          <MenuItem value="disabled">Desabilitado</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Posição na Fila</InputLabel>
                        <Field as={Select} label="Posição na Fila" name="sendQueuePosition">
                          <MenuItem value="enabled">Habilitado</MenuItem>
                          <MenuItem value="disabled">Desabilitado</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Encerrar Ticket na Transferência</InputLabel>
                        <Field as={Select} label="Encerrar Ticket na Transferência" name="closeTicketOnTransfer">
                          <MenuItem value={true}>Sim</MenuItem>
                          <MenuItem value={false}>Não</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Direcionar para Carteira</InputLabel>
                        <Field as={Select} label="Direcionar para Carteira" name="DirectTicketsToWallets">
                          <MenuItem value={true}>Sim</MenuItem>
                          <MenuItem value={false}>Não</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Notificar Pendentes</InputLabel>
                        <Field as={Select} label="Notificar Pendentes" name="showNotificationPending">
                          <MenuItem value={true}>Sim</MenuItem>
                          <MenuItem value={false}>Não</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Habilitar LGPD</InputLabel>
                        <Field as={Select} label="Habilitar LGPD" name="enableLGPD">
                          <MenuItem value="enabled">Habilitado</MenuItem>
                          <MenuItem value="disabled">Desabilitado</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl margin="dense" variant="outlined" fullWidth>
                        <InputLabel>Tag Obrigatória</InputLabel>
                        <Field as={Select} label="Tag Obrigatória" name="requiredTag">
                          <MenuItem value="enabled">Habilitado</MenuItem>
                          <MenuItem value="disabled">Desabilitado</MenuItem>
                        </Field>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                >
                  {isSubmitting ? <CircularProgress size={24} /> : "Salvar"}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default ModalCompany;
