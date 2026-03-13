import React, { useEffect, useMemo, useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Box,
  Typography,
  TextField,
  Grid,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  FormControlLabel,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  makeStyles,
  IconButton,
  Paper,
  Button
} from "@material-ui/core";
import { toast } from "react-toastify";
import usePlans from "../../hooks/usePlans";
import { openApi } from "../../services/api";
import { i18n } from "../../translate/i18n";
import ColorModeContext from "../../layout/themeContext";
import { useTheme, withStyles } from "@material-ui/core/styles";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import StepConnector from "@material-ui/core/StepConnector";
import BRFlag from "../../assets/brazil.png";
import USFlag from "../../assets/unitedstates.png";
import ESFlag from "../../assets/esspain.png";
import ARFlag from "../../assets/arabe.png";
import PlanosPreview from "../../PlanosPreview";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";

const useStyles = makeStyles(theme => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: theme.palette.type === "light" ? "#f5f5f7" : theme.palette.background.default,
    padding: theme.spacing(5, 1.5, 2),
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    color: theme.palette.type === "light" ? "#111" : theme.palette.text.primary
  },
  container: {
    width: "100%",
    maxWidth: 640,
    position: "relative"
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: theme.spacing(2),
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    padding: theme.spacing(1, 2),
    zIndex: 20,
    background: "transparent"
  },
  stepperWrap: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(0, 1),
    marginTop: theme.spacing(1)
  },
  stepperInner: {
    width: "100%",
    maxWidth: 520
  },
  brand: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1.5),
    paddingTop: 0,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  logo: {
    height: 72,
    width: "auto",
    marginRight: theme.spacing(1.5),
    filter: theme.palette.type === "dark" ? "invert(1) brightness(1.1)" : "none"
  },
  stepperClear: {
    background: "transparent !important",
    boxShadow: "none !important",
    padding: theme.spacing(0.5, 0),
    "& .MuiSvgIcon-root": {
      fontSize: "1.2rem"
    },
    "& .MuiStepLabel-label": {
      fontSize: 12,
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      color: theme.palette.type === "light" ? "#111" : theme.palette.text.primary
    },
    "& .MuiStepIcon-root": {
      color: "#cbd5e1"
    },
    "& .MuiStepIcon-root.MuiStepIcon-active": {
      color: theme.palette.primary.main
    },
    "& .MuiStepIcon-root.MuiStepIcon-completed": {
      color: theme.palette.primary.dark
    },
    "& .MuiStepLabel-label.MuiStepLabel-active": {
      color: theme.palette.primary.main
    }
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2)
  },
  title: {
    fontWeight: 700,
    fontSize: 22
  },
  subtitle: {
    color: theme.palette.text.secondary
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: theme.spacing(2)
  },
  grayDivider: {
    backgroundColor: theme.palette.type === "light" ? "#e5e7eb" : theme.palette.divider,
    margin: theme.spacing(2, 0)
  },
  inputGroup: {
    border: "none",
    borderRadius: 16,
    padding: theme.spacing(1),
    background: "transparent",
    boxShadow: "none",
    "& .MuiOutlinedInput-root": {
      background: theme.palette.type === "light" ? "#ffffff" : theme.palette.background.paper,
      borderRadius: 12,
      minHeight: 42
    },
    "& .MuiSelect-select.MuiSelect-outlined": {
      paddingTop: 9,
      paddingBottom: 9,
      borderRadius: 12
    },
    "& .MuiFormLabel-root": {
      color: theme.palette.type === "light" ? "#111" : theme.palette.text.primary,
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      fontWeight: 300
    },
    "& .MuiInputBase-input": {
      color: theme.palette.type === "light" ? "#111" : theme.palette.text.primary,
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      fontWeight: 300
    }
  },
  menuPaper: {
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
  },
  actionBar: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(1)
  },
  navButtonLeft: {
    position: "fixed",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 40,
    left: 96,
    [theme.breakpoints.up("sm")]: { left: 120 },
    [theme.breakpoints.up("md")]: { left: 144 },
    [theme.breakpoints.up("lg")]: { left: 168 },
    [theme.breakpoints.up("xl")]: { left: 192 }
  },
  navButtonRight: {
    position: "fixed",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 40,
    right: 96,
    [theme.breakpoints.up("sm")]: { right: 120 },
    [theme.breakpoints.up("md")]: { right: 144 },
    [theme.breakpoints.up("lg")]: { right: 168 },
    [theme.breakpoints.up("xl")]: { right: 192 }
  }
}));

const Connector = withStyles((theme) => ({
  alternativeLabel: {
    top: 14
  },
  active: {
    "& $line": {
      backgroundColor: theme.palette.primary.main
    }
  },
  completed: {
    "& $line": {
      backgroundColor: theme.palette.primary.main
    }
  },
  line: {
    height: 2,
    border: 0,
    backgroundColor: "#e5e7eb",
    borderRadius: 1
  }
}))(StepConnector);

const tKey = (key, fallback) => {
  const v = i18n.t(key);
  return v !== key ? v : fallback;
};

const niches = [
  "retail",
  "services",
  "education",
  "health",
  "realEstate",
  "technology",
  "other"
];

const foundOptions = [
  "google",
  "referral",
  "social",
  "marketplace",
  "other"
];

const needsOptions = [
  "whatsappSupport",
  "chatbotFlows",
  "campaigns",
  "reportsNps",
  "integrations",
  "leadManagement",
  "crmPipeline",
  "projectManagement",
  "kanbanTasks",
  "emailMarketing",
  "omnichannelCampaigns",
  "telephonyDialer",
  "formsCapture",
  "calendar",
  "advancedReportsBi",
  "taskAutomation",
  "erpEcommerceIntegrations",
  "aiAgents",
  "other"
];

const Schema = Yup.object().shape({
  companyName: Yup.string().required(),
  legalName: Yup.string().required(),
  legalEmail: Yup.string().email().required(),
  email: Yup.string().email().required(),
  password: Yup.string().min(5).required(),
  phone: Yup.string().required(),
  planId: Yup.string().required(),
  acceptTerms: Yup.boolean().oneOf([true]).required()
});

const Register = () => {
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();
  const { colorMode } = useContext(ColorModeContext);
  const { handleLogin } = useContext(AuthContext) || {};
  const [lang, setLang] = useState(i18n.language);
  const { getPlanList } = usePlans();
  const [plans, setPlans] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [validatingCep, setValidatingCep] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(null); // mensal|semestral|anual
  const [selectedTier, setSelectedTier] = useState(null); // starter|essencial|pro
  const [confirmToken, setConfirmToken] = useState(null);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmErr, setConfirmErr] = useState("");
  const [confirmEmailPay, setConfirmEmailPay] = useState("");
  const [confirmBusyPay, setConfirmBusyPay] = useState(false);
  const [confirmErrPay, setConfirmErrPay] = useState("");
  const [accessEmail, setAccessEmail] = useState("");
  const [accessPassword, setAccessPassword] = useState("");
  const [accessPassword2, setAccessPassword2] = useState("");
  const [accessBusy, setAccessBusy] = useState(false);
  const [accessErr, setAccessErr] = useState("");

  useEffect(() => {
    const handler = lng => setLang(lng);
    i18n.on("languageChanged", handler);
    return () => i18n.off("languageChanged", handler);
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        const list = await getPlanList({ listPublic: "false" });
        setPlans(list);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const steps = [
    tKey("register.steps.discovery", "Encontro e necessidades"),
    tKey("register.steps.company", "Informações da empresa"),
    tKey("register.steps.address", "Endereço"),
    tKey("register.steps.plans", "Planos"),
    tKey("register.steps.payment", "Pagamento"),
    tKey("register.steps.access", "Acesso")
  ];

  const resolvePaymentLink = (cycle, tier) => {
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

  const initialValues = useMemo(
    () => ({
      foundUs: [],
      needs: [],
      razaoSocial: "",
      companyName: "",
      document: "",
      hasCNPJ: true,
      cpf: "",
      personName: "",
      inscricaoEstadual: "",
      inscricaoMunicipal: "",
      niche: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      legalName: "",
      legalEmail: "",
      legalPhone: "",
      techName: "",
      techEmail: "",
      techPhone: "",
      publicAccountName: "",
      email: "",
      password: "",
      phone: "",
      planId: "",
      paymentMethod: "",
      cardNumber: "",
      cardName: "",
      cardExpiry: "",
      cardCvv: "",
      acceptTerms: false
    }),
    []
  );

  const handleCnpjCpf = async (value, isCnpj, setFieldValue) => {
    const digits = (value || "").replace(/\D/g, "");
    if (isCnpj) {
      if (digits.length !== 14) return;
      try {
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data) {
          setFieldValue("razaoSocial", data.razao_social || "");
          setFieldValue("companyName", data.nome_fantasia || data.razao_social || "");
          if (data.cep) setFieldValue("cep", data.cep);
          if (data.logradouro) setFieldValue("logradouro", data.logradouro);
          if (data.numero) setFieldValue("numero", String(data.numero));
          if (data.complemento) setFieldValue("complemento", data.complemento);
          if (data.bairro) setFieldValue("bairro", data.bairro);
          if (data.municipio) setFieldValue("cidade", data.municipio);
          if (data.uf) setFieldValue("uf", data.uf);
        }
      } catch {}
    } else {
      const valid = digits.length === 11;
      if (!valid) return;
      try {
        const customUrl = process.env.REACT_APP_CPF_LOOKUP_URL;
        if (customUrl) {
          const r = await fetch(`${customUrl}?cpf=${digits}`);
          if (r.ok) {
            const d = await r.json();
            const nome = d.nome || d.name || d.fullname || d.nome_completo;
            if (nome) setFieldValue("personName", nome);
          }
          return;
        }
        const token = process.env.REACT_APP_HUBDEV_TOKEN;
        if (token) {
          const r = await fetch(`https://ws.hubdodesenvolvedor.com.br/v2/cpf/?cpf=${digits}&token=${token}`);
          if (r.ok) {
            const d = await r.json();
            const nome = d?.result?.nome || d?.nome;
            if (nome) setFieldValue("personName", nome);
          }
        }
      } catch {}
    }
  };

  const handleCep = async (cep, setFieldValue) => {
    const digits = (cep || "").replace(/\D/g, "");
    if (digits.length !== 8) return;
    setValidatingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFieldValue("logradouro", data.logradouro || "");
        setFieldValue("bairro", data.bairro || "");
        setFieldValue("cidade", data.localidade || "");
        setFieldValue("uf", data.uf || "");
      }
    } catch {}
    setValidatingCep(false);
  };

  const next = () => setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
  const prev = () => setActiveStep(prev => Math.max(prev - 1, 0));

  const onSubmit = async values => {
    const payload = {
      document: "",
      email: values.email,
      phone: values.phone || values.legalPhone,
      planId: values.planId,
      metadata: {
        razaoSocial: undefined,
        hasCNPJ: undefined,
        personName: undefined,
        niche: values.niche,
        foundUs: values.foundUs,
        needs: values.needs,
        address: {
          cep: values.cep,
          logradouro: values.logradouro,
          numero: values.numero,
          complemento: values.complemento,
          bairro: values.bairro,
          cidade: values.cidade,
          uf: values.uf
        },
        payment: {
          method: values.paymentMethod,
          card: values.paymentMethod === "card"
            ? {
                number: values.cardNumber,
                name: values.cardName,
                expiry: values.cardExpiry,
                cvv: values.cardCvv
              }
            : undefined
        },
        contacts: {
          legal: { name: values.legalName, email: values.legalEmail, phone: values.legalPhone },
          tech: { name: values.techName, email: values.techEmail, phone: values.techPhone }
        },
        publicAccountName: values.publicAccountName,
        acceptTerms: values.acceptTerms,
        acceptTimestamp: new Date().toISOString()
      }
    };
    try {
      await openApi.post("/auth/signup", payload);
      toast.success("Cadastro concluído");
      history.push("/login");
    } catch (e) {
      toast.error("Erro ao concluir cadastro");
    }
  };

  const Section1 = ({ values, setFieldValue }) => (
    <Box>
      <Grid container spacing={1} className={classes.inputGroup}>
        <Grid item xs={12}>
          <InputLabel>{tKey("register.labels.niche", "Nicho de Atuação")}</InputLabel>
          <Select
            value={values.niche}
            onChange={e => setFieldValue("niche", e.target.value)}
            fullWidth
            variant="outlined"
            displayEmpty
          >
            <MenuItem value=""><em>{tKey("common.select", "Selecione")}</em></MenuItem>
            {niches.map(key => (
              <MenuItem key={key} value={key} style={{ fontSize: 14, paddingTop: 6, paddingBottom: 6 }}>
                {tKey(`register.options.niches.${key}`, key)}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12}>
          <InputLabel>{tKey("register.labels.foundUs", "Como nos encontrou")}</InputLabel>
          <Select
            multiple
            value={values.foundUs}
            onChange={e => setFieldValue("foundUs", e.target.value)}
            fullWidth
            variant="outlined"
            displayEmpty
            MenuProps={{
              PaperProps: { className: classes.menuPaper, style: { maxHeight: 280, width: 320 } },
              MenuListProps: { dense: true }
            }}
            renderValue={(selected) => {
              if (!selected || selected.length === 0) {
                return <span style={{ color: "#9ca3af" }}>{tKey("common.select", "Selecione")}</span>;
              }
              return selected.map(k => tKey(`register.options.foundUs.${k}`, k)).join(", ");
            }}
          >
            {foundOptions.map(key => (
              <MenuItem key={key} value={key} style={{ fontSize: 14, paddingTop: 6, paddingBottom: 6 }}>
                <Checkbox checked={values.foundUs.indexOf(key) > -1} />
                <ListItemText primary={tKey(`register.options.foundUs.${key}`, key)} />
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12}>
          <InputLabel>{tKey("register.labels.needs", "Necessidade")}</InputLabel>
          <Select
            multiple
            value={values.needs}
            onChange={e => setFieldValue("needs", e.target.value)}
            fullWidth
            variant="outlined"
            displayEmpty
            MenuProps={{
              PaperProps: { className: classes.menuPaper, style: { maxHeight: 280, width: 320 } },
              MenuListProps: { dense: true }
            }}
            renderValue={(selected) => {
              if (!selected || selected.length === 0) {
                return <span style={{ color: "#9ca3af" }}>{tKey("common.select", "Selecione")}</span>;
              }
              return selected.map(k => tKey(`register.options.needs.${k}`, k)).join(", ");
            }}
          >
            {needsOptions.map(key => (
              <MenuItem key={key} value={key} style={{ fontSize: 14, paddingTop: 6, paddingBottom: 6 }}>
                <Checkbox checked={values.needs.indexOf(key) > -1} />
                <ListItemText primary={tKey(`register.options.needs.${key}`, key)} />
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>
    </Box>
  );

  const Section2 = ({ setFieldValue }) => (
    <Box>
      <Grid container spacing={1} className={classes.inputGroup}>
        <Grid item xs={12}>
          <Field as={TextField} name="companyName" label={tKey("register.labels.companyName", "Nome da Empresa")} variant="outlined" fullWidth />
        </Grid>
        <Grid item xs={12}>
          <Field as={TextField} name="legalName" label={tKey("register.labels.userName", "Nome do Usuário")} variant="outlined" fullWidth />
        </Grid>
        <Grid item xs={12}>
          <Field as={TextField} name="legalEmail" label={tKey("register.labels.email", "E-mail")} variant="outlined" fullWidth />
        </Grid>
      </Grid>
    </Box>
  );

  const SectionAddress = ({ setFieldValue }) => (
    <Box>
      <Grid container spacing={2} className={classes.inputGroup}>
        <Grid item xs={12} sm={6} md={4}>
          <Field
            as={TextField}
            name="cep"
            label={tKey("register.address.cep", "CEP")}
            variant="outlined"
            fullWidth
            size="small"
            margin="dense"
            placeholder="00000-000"
            onBlur={e => handleCep(e.target.value, setFieldValue)}
            InputProps={{
              endAdornment: validatingCep ? <CircularProgress size={16} /> : null
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={8}>
          <Field as={TextField} name="logradouro" label={tKey("register.address.street", "Logradouro")} variant="outlined" fullWidth size="small" margin="dense" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Field as={TextField} name="numero" label={tKey("register.address.number", "Número")} variant="outlined" fullWidth size="small" margin="dense" />
        </Grid>
        <Grid item xs={12} sm={6} md={8}>
          <Field as={TextField} name="complemento" label={tKey("register.address.complement", "Complemento")} variant="outlined" fullWidth size="small" margin="dense" />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <Field as={TextField} name="bairro" label={tKey("register.address.neighborhood", "Bairro")} variant="outlined" fullWidth size="small" margin="dense" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Field as={TextField} name="cidade" label={tKey("register.address.city", "Cidade")} variant="outlined" fullWidth size="small" margin="dense" />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Field as={TextField} name="uf" label={tKey("register.address.state", "UF")} variant="outlined" fullWidth size="small" margin="dense" />
        </Grid>
      </Grid>
    </Box>
  );

  const Section3 = ({ touched, errors, values, setFieldValue }) => (
    <Box>
      <Grid container spacing={1} className={classes.inputGroup}>
        <Grid item xs={12}>
          <Field as={TextField} name="legalName" label={tKey("register.labels.fullName", "Nome completo")} variant="outlined" fullWidth />
        </Grid>
        <Grid item xs={12}>
          <Field as={TextField} name="legalEmail" label={tKey("register.labels.email", "E-mail")} variant="outlined" fullWidth />
        </Grid>
        <Grid item xs={12}>
          <Field as={TextField} name="legalPhone" label={tKey("register.labels.phone", "Telefone")} variant="outlined" fullWidth />
        </Grid>
        <Grid item xs={12}>
          <Field as={TextField} name="publicAccountName" label={tKey("register.labels.publicName", "Nome público da empresa")} variant="outlined" fullWidth />
        </Grid>
      </Grid>
    </Box>
  );

  const Section4 = ({ values, touched, errors }) => (
    <Box style={{ position: "relative" }}>
      <Grid container spacing={1} className={classes.inputGroup}>
        <Grid item xs={12}>
          <PlanosPreview
            onChoose={(cycle, tier) => {
              setSelectedCycle(cycle);
              setSelectedTier(tier);
              setActiveStep(4);
            }}
          />
        </Grid>
        <Grid item xs={12} style={{ display: "none" }}>
          <InputLabel>Plano</InputLabel>
          <Field as={Select} name="planId" fullWidth variant="outlined" error={touched.planId && Boolean(errors.planId)}>
            {plans.map(p => (
              <MenuItem key={p.id} value={p.id}>
                {p.name} • Atendentes {p.users} • WhatsApp {p.connections} • Filas {p.queues} • R$ {p.amount}
              </MenuItem>
            ))}
          </Field>
        </Grid>
      </Grid>
      {/* Campo de confirmação de pagamento removido da seção Planos */}
    </Box>
  );

  const Section5 = ({ touched, errors, values }) => {
    useEffect(() => {
      let mounted = true;
      const run = async () => {
        if (!confirmToken) return;
        try {
          const r = await openApi.get(`/auth/confirm/${confirmToken}`);
          if (mounted && r?.data?.email) {
            setAccessEmail(r.data.email);
          }
        } catch {}
      };
      run();
      return () => {
        mounted = false;
      };
    }, [confirmToken]);
    const [valid, setValid] = React.useState(false);
    const [mismatch, setMismatch] = React.useState(false);
    const passRef = React.useRef(null);
    const confirmRef = React.useRef(null);
    const recompute = React.useCallback(() => {
      const p = passRef.current?.value || "";
      const c = confirmRef.current?.value || "";
      const okLen = p.length >= 6;
      const okMix = /[A-Za-z]/.test(p) && /[0-9]/.test(p);
      const okMatch = c.length > 0 && p === c;
      setMismatch(c.length > 0 && p !== c);
      setValid(okLen && okMix && okMatch);
    }, []);
    if (confirmToken) {
      return (
        <Box p={2} display="flex" justifyContent="center">
          <Box style={{ width: "100%", maxWidth: 520 }}>
            <Box className={classes.inputGroup}>
              <TextField
                label={tKey("register.labels.loginEmail", "E-mail de acesso")}
                value={accessEmail || values.email}
                variant="outlined"
                fullWidth
                disabled
              />
            </Box>
            <Box className={classes.inputGroup}>
              <TextField
                label={tKey("register.labels.password", "Senha")}
                type="password"
                inputRef={passRef}
                onChange={recompute}
                onInput={recompute}
                variant="outlined"
                fullWidth
                autoComplete="new-password"
                inputProps={{ autoCapitalize: "none", autoCorrect: "off", spellCheck: false }}
              />
            </Box>
            <Box className={classes.inputGroup}>
              <TextField
                label="Confirmar senha"
                type="password"
                inputRef={confirmRef}
                onChange={recompute}
                onInput={recompute}
                variant="outlined"
                fullWidth
                autoComplete="new-password"
                inputProps={{ autoCapitalize: "none", autoCorrect: "off", spellCheck: false }}
                error={mismatch}
                helperText={mismatch ? "As senhas não coincidem" : ""}
              />
            </Box>
            <Typography variant="caption" color="textSecondary">
              A senha deve ter no mínimo 6 caracteres, contendo letras e números.
            </Typography>
            <Box mt={1} display="flex" justifyContent="center">
              <Button
                color="primary"
                variant="contained"
                disabled={accessBusy || !valid}
                onClick={async () => {
                  const p = passRef.current?.value || "";
                  const nameValue = values.legalName || values.companyName || (accessEmail || values.email || "").split("@")[0];
                  setAccessBusy(true);
                  setAccessErr("");
                  try {
                    await openApi.post(`/auth/confirm/${confirmToken}`, {
                      name: nameValue,
                      password: p
                    });
                    try {
                      // encerra qualquer sessão anterior
                      localStorage.removeItem("token");
                      await api.delete("/auth/logout");
                    } catch {}
                    if (handleLogin) {
                      await handleLogin({ email: accessEmail || values.email, password: p });
                    } else {
                      window.location.assign("/login");
                    }
                  } catch (e) {
                    setAccessErr("Falha ao criar acesso");
                  }
                  setAccessBusy(false);
                }}
              >
                Salvar e continuar
              </Button>
              {accessErr ? (
                <Typography variant="caption" color="error" style={{ marginLeft: 8 }}>
                  {accessErr}
                </Typography>
              ) : null}
            </Box>
          </Box>
        </Box>
      );
    }
    return (
      <Box>
        <Grid container spacing={1} className={classes.inputGroup}>
          <Grid item xs={12} sm={6}>
            <Field as={TextField} name="email" label={tKey("register.labels.loginEmail", "E-mail de acesso")} variant="outlined" fullWidth error={touched.email && Boolean(errors.email)} helperText={touched.email && errors.email} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Field as={TextField} name="password" label={tKey("register.labels.password", "Senha")} type="password" variant="outlined" fullWidth error={touched.password && Boolean(errors.password)} helperText={touched.password && errors.password} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Field as={TextField} name="phone" label={tKey("register.labels.whatsapp", "Telefone (WhatsApp)")} variant="outlined" fullWidth />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Field as={Checkbox} name="acceptTerms" color="primary" />
              }
              label={tKey("register.labels.terms", "Li e aceito os Termos e a Política de Privacidade")}
            />
            {touched.acceptTerms && errors.acceptTerms && (
              <Typography color="error" variant="caption">{errors.acceptTerms}</Typography>
            )}
          </Grid>
        </Grid>
      </Box>
    );
  };

  const SectionPayment = ({ values }) => {
    const urlBase = resolvePaymentLink(selectedCycle, selectedTier);
    const emailParam = values?.email ? `email=${encodeURIComponent(values.email)}` : "";
    const url = urlBase ? (emailParam ? `${urlBase}${urlBase.includes("?") ? "&" : "?"}${emailParam}` : urlBase) : null;
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
      setLoaded(false);
    }, [urlBase, values?.email]);
    useEffect(() => {
      if (!values?.email) return;
      let timer = null;
      const tick = async () => {
        try {
          const r = await openApi.get("/auth/confirm/by-email", { params: { email: values.email } });
          if (r?.data?.token) {
            setConfirmToken(r.data.token);
            setActiveStep(5);
          }
        } catch {}
      };
      timer = setInterval(tick, 4000);
      tick();
      return () => {
        if (timer) clearInterval(timer);
      };
    }, [values?.email, urlBase]);
    return (
      <Box display="flex" alignItems="center" justifyContent="center" style={{ minHeight: 420, width: "100%", paddingLeft: 4, paddingRight: 4, boxSizing: "border-box" }}>
        <Paper variant="outlined" style={{ width: "calc(100vw - 8px)", height: 600, maxWidth: "100vw", maxHeight: "78vh", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {url ? (
            <>
              <Box style={{ position: "relative", flex: "1 1 auto" }}>
                {!loaded && (
                  <Box position="absolute" top={0} left={0} right={0} bottom={0} display="flex" alignItems="center" justifyContent="center" flexDirection="column" style={{ background: "rgba(0,0,0,0.08)" }}>
                    <CircularProgress size={28} />
                    <Typography variant="caption" color="textSecondary" style={{ marginTop: 8 }}>Carregando checkout...</Typography>
                  </Box>
                )}
                <iframe title="Pagamento" src={url} onLoad={() => setLoaded(true)} style={{ width: "100%", height: "100%", border: "none" }} />
              </Box>
              <Box display="flex" alignItems="center" justifyContent="center" style={{ gap: 6, background: "transparent", borderTop: "1px solid rgba(0,0,0,0.06)", padding: 8 }}>
                <Typography variant="caption" color="textSecondary" style={{ marginRight: 6, opacity: 0.9 }}>
                  Confirme seu pagamento:
                </Typography>
                <TextField
                  value={confirmEmailPay}
                  onChange={e => setConfirmEmailPay(e.target.value)}
                  placeholder="E-mail do checkout"
                  variant="outlined"
                  size="small"
                  type="email"
                  autoFocus
                  inputProps={{ autoCapitalize: "none", autoCorrect: "off", spellCheck: false }}
                  style={{ width: 240 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  disabled={!confirmEmailPay || confirmBusyPay}
                  onClick={async () => {
                    setConfirmBusyPay(true);
                    setConfirmErrPay("");
                    try {
                      const r = await openApi.get("/auth/confirm/by-email", { params: { email: confirmEmailPay } });
                      if (r?.data?.token) {
                        setConfirmErrPay("");
                        setConfirmBusyPay(false);
                        setConfirmToken(r.data.token);
                        setActiveStep(5);
                        return;
                      }
                    } catch {
                      // segue para o polling
                    }
                    setConfirmErrPay("Aguardando aprovação...");
                    let tries = 0;
                    const poll = setInterval(async () => {
                      try {
                        const r = await openApi.get("/auth/confirm/by-email", { params: { email: confirmEmailPay } });
                        if (r?.data?.token) {
                          clearInterval(poll);
                          setConfirmErrPay("");
                          setConfirmBusyPay(false);
                          setConfirmToken(r.data.token);
                          setActiveStep(5);
                          return;
                        }
                      } catch {}
                      tries += 1;
                      if (tries > 25) {
                        clearInterval(poll);
                        setConfirmBusyPay(false);
                        setConfirmErrPay("Não encontrado");
                      }
                    }, 3000);
                  }}
                >
                  Confirmar
                </Button>
                {confirmErrPay ? (
                  <Typography variant="caption" color={confirmErrPay.includes("Aguardando") ? "textSecondary" : "error"} style={{ marginLeft: 6 }}>
                    {confirmErrPay}
                  </Typography>
                ) : null}
              </Box>
            </>
          ) : (
            <Box p={3} textAlign="center" color="textSecondary">
              <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 8 }}>
                Selecione um plano para prosseguir com o pagamento
              </Typography>
              <Typography variant="body2">Volte à etapa anterior e escolha o ciclo e o plano.</Typography>
            </Box>
          )}
        </Paper>
      </Box>
    );
  };

  const canGoNext = (step, values) => {
    switch (step) {
      case 0:
        return (values.niche && values.niche !== "") || (values.foundUs && values.foundUs.length > 0) || (values.needs && values.needs.length > 0);
      case 1:
        return values.companyName && values.legalName && values.legalEmail;
      case 2:
        return values.cep && values.logradouro && values.cidade && values.uf;
      case 3:
        return !!values.planId;
      case 4:
        return !!values.paymentMethod;
      case 5:
        return values.email && values.password && values.acceptTerms;
      default:
        return false;
    }
  };

  return (
    <Box className={classes.root}>
      <div className={classes.container}>
        <Box className={classes.topBar}>
          <div className={classes.brand}>
            <img
              className={classes.logo}
              alt="VB Solution"
              src={theme.mode === "light" ? theme.calculatedLogoLight() : theme.calculatedLogoDark()}
            />
          </div>
          <div className={classes.stepperWrap}>
            <div className={classes.stepperInner}>
              <Stepper activeStep={activeStep} alternativeLabel className={classes.stepperClear} connector={<Connector />}>
                {steps.map(label => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Select
              value={(i18n.language && i18n.language.split("-")[0]) || "pt"}
              onChange={e => i18n.changeLanguage(e.target.value)}
              variant="outlined"
              style={{ height: 36, borderRadius: 10 }}
            >
              <MenuItem value="pt"><img alt="pt" src={BRFlag} height={14} style={{ marginRight: 8 }} />PT</MenuItem>
              <MenuItem value="en"><img alt="en" src={USFlag} height={14} style={{ marginRight: 8 }} />EN</MenuItem>
              <MenuItem value="es"><img alt="es" src={ESFlag} height={14} style={{ marginRight: 8 }} />ES</MenuItem>
              <MenuItem value="ar"><img alt="ar" src={ARFlag} height={14} style={{ marginRight: 8 }} />AR</MenuItem>
            </Select>
            <IconButton onClick={() => colorMode?.toggleColorMode?.()}>
              {theme.mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </div>
        </Box>
        <Box mt={6}>
          <Formik
            initialValues={initialValues}
            validationSchema={Schema}
            onSubmit={onSubmit}
          >
            {({ values, touched, errors, isSubmitting, setFieldValue }) => (
              <Form>
                {activeStep === 0 && <Section1 values={values} setFieldValue={setFieldValue} />}
                {activeStep === 1 && <Section2 setFieldValue={setFieldValue} />}
                {activeStep === 2 && <SectionAddress setFieldValue={setFieldValue} />}
                {activeStep === 3 && <Section4 values={values} touched={touched} errors={errors} />}
                {activeStep === 4 && <SectionPayment values={values} setFieldValue={setFieldValue} />}
                {activeStep === 5 && <Section5 touched={touched} errors={errors} values={values} />}

                <IconButton
                  className={classes.navButtonLeft}
                  onClick={prev}
                  disabled={activeStep === 0}
                  style={{
                    background: activeStep === 0 ? "#cbd5e1" : theme.palette.primary.main,
                    color: "#fff",
                    width: 46,
                    height: 46,
                    borderRadius: "50%",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                  }}
                >
                  <ArrowBackIosIcon />
                </IconButton>
                {activeStep < steps.length - 1 ? (
                  <IconButton
                    className={classes.navButtonRight}
                    onClick={() => canGoNext(activeStep, values) && next()}
                    disabled={!canGoNext(activeStep, values)}
                    style={{
                      background: canGoNext(activeStep, values) ? theme.palette.primary.main : "#cbd5e1",
                      color: "#fff",
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                    }}
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>
                ) : (
                  <IconButton
                    className={classes.navButtonRight}
                    type="submit"
                    disabled={!canGoNext(activeStep, values) || isSubmitting}
                    style={{
                      background: canGoNext(activeStep, values) ? theme.palette.primary.main : "#cbd5e1",
                      color: "#fff",
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                    }}
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>
                )}
              </Form>
            )}
          </Formik>
        </Box>
      </div>
    </Box>
  );
};

export default Register;
