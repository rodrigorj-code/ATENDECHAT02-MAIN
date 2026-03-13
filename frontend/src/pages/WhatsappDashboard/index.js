import React, { useContext, useState, useEffect } from "react";

import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Popover from "@material-ui/core/Popover";
import { Button, TextField } from "@material-ui/core";
// import {  Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/core/styles";
import { IconButton } from "@mui/material";
import { Groups, SaveAlt } from "@mui/icons-material";

import CallIcon from "@material-ui/icons/Call";
import RecordVoiceOverIcon from "@material-ui/icons/RecordVoiceOver";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import FilterListIcon from "@material-ui/icons/FilterList";
import ClearIcon from "@material-ui/icons/Clear";
import SendIcon from '@material-ui/icons/Send';
import MessageIcon from '@material-ui/icons/Message';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import TimerIcon from '@material-ui/icons/Timer';
import * as XLSX from 'xlsx';

import { grey, blue } from "@material-ui/core/colors";
import { toast } from "react-toastify";

import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import { isArray } from "lodash";

import { AuthContext } from "../../context/Auth/AuthContext";

import useDashboard from "../../hooks/useDashboard";
import useMessages from "../../hooks/useMessages";
import { ChatsUser } from "../Dashboard/ChartsUser";
import ChartDonut from "../Dashboard/ChartDonut";

import Filters from "../Dashboard/Filters";
import { isEmpty } from "lodash";
import moment from "moment";
import { ChartsDate } from "../Dashboard/ChartsDate";
import { Avatar, Card, CardContent, Container, Stack, SvgIcon } from "@mui/material";
import { i18n } from "../../translate/i18n";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import ForbiddenPage from "../../components/ForbiddenPage";
import { ArrowDownward, ArrowUpward } from "@material-ui/icons";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import ActivitiesStyleLayout from "../../components/ActivitiesStyleLayout";

const useStyles = makeStyles((theme) => ({
  overline: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: theme.palette.text.secondary,
    letterSpacing: '0.5px',
    lineHeight: 2.5,
    textTransform: 'uppercase',
    fontFamily: "'Plus Jakarta Sans', sans-serif'",
  },
  h4: {
    fontFamily: "'Plus Jakarta Sans', sans-serif'",
    fontWeight: 500,
    fontSize: '2rem',
    lineHeight: 1,
    color: theme.palette.text.primary,
  },
  tab: {
    minWidth: "auto",
    width: "auto",
    padding: theme.spacing(0.5, 1),
    borderRadius: 8,
    transition: "0.3s",
    borderWidth: "1px",
    borderStyle: "solid",
    marginRight: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5),

    [theme.breakpoints.down("lg")]: {
      fontSize: "0.9rem",
      padding: theme.spacing(0.4, 0.8),
      marginRight: theme.spacing(0.4),
      marginLeft: theme.spacing(0.4),
    },
    [theme.breakpoints.down("md")]: {
      fontSize: "0.8rem",
      padding: theme.spacing(0.3, 0.6),
      marginRight: theme.spacing(0.3),
      marginLeft: theme.spacing(0.3),
    },
    "&:hover": {
      backgroundColor: "rgba(6, 81, 131, 0.3)",
    },
    "&$selected": {
      color: "#FFF",
      backgroundColor: theme.palette.primary.main,
    },
  },
  tabIndicator: {
    borderWidth: "2px",
    borderStyle: "solid",
    height: 6,
    bottom: 0,
    color: theme.mode === "light" ? theme.palette.primary.main : "#FFF",
  },
  container: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
    maxWidth: "1150px",
    minWidth: "xs",
  },
  nps: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.padding,
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: 240,
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  cardAvatar: {
    fontSize: "55px",
    color: grey[500],
    backgroundColor: "#ffffff",
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  cardTitle: {
    fontSize: "18px",
    color: blue[700],
  },
  cardSubtitle: {
    color: grey[600],
    fontSize: "14px",
  },
  alignRight: {
    textAlign: "right",
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
  iframeDashboard: {
    width: "100%",
    height: "calc(100vh - 64px)",
    border: "none",
  },
  container: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 240,
  },
  customFixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 120,
  },
  customFixedHeightPaperLg: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
  },
  fixedHeightPaper2: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
}));

const WhatsappDashboard = () => {
  const theme = useTheme();
  const classes = useStyles();
  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [filterType, setFilterType] = useState(1);
  const [period, setPeriod] = useState(0);
  const [dateFrom, setDateFrom] = useState(moment("1", "D").format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const { find } = useDashboard();

  //FILTROS NPS
  const [tab, setTab] = useState("Indicadores");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedQueues, setSelectedQueues] = useState([]);



  let newDate = new Date();
  let date = newDate.getDate();
  let month = newDate.getMonth() + 1;
  let year = newDate.getFullYear();
  let nowIni = `${year}-${month < 10 ? `0${month}` : `${month}`}-01`;

  let now = `${year}-${month < 10 ? `0${month}` : `${month}`}-${date < 10 ? `0${date}` : `${date}`}`;

  const [showFilter, setShowFilter] = useState(false);
  const [dateStartTicket, setDateStartTicket] = useState(nowIni);
  const [dateEndTicket, setDateEndTicket] = useState(now);
  const [queueTicket, setQueueTicket] = useState(false);
  const [fetchDataFilter, setFetchDataFilter] = useState(false);
  const [anchorPeriodo, setAnchorPeriodo] = useState(null);

  const { user } = useContext(AuthContext);

  // Contadores de mensagens (hooks no topo, ordem estável)
  const { count: receivedRange } = useMessages({
    fromMe: false,
    dateStart: dateStartTicket,
    dateEnd: dateEndTicket
  });
  const { count: receivedTotal } = useMessages({
    fromMe: false
  });
  const { count: sentRange } = useMessages({
    fromMe: true,
    dateStart: dateStartTicket,
    dateEnd: dateEndTicket
  });
  const { count: sentTotal } = useMessages({
    fromMe: true
  });


  const exportarGridParaExcel = () => {
    const ws = XLSX.utils.table_to_sheet(document.getElementById('grid-attendants'));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'RelatorioDeAtendentes');
    XLSX.writeFile(wb, 'relatorio-de-atendentes.xlsx');
  };

  var userQueueIds = [];

  if (user.queues && user.queues.length > 0) {
    userQueueIds = user.queues.map((q) => q.id);
  }

  useEffect(() => {
    async function firstLoad() {
      await fetchData();
    }
    setTimeout(() => {
      firstLoad();
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchDataFilter]);

  async function fetchData() {
    setLoading(true);

    let params = {};

    if (period > 0) {
      params = {
        days: period,
      };
    }

    if (!isEmpty(dateStartTicket) && moment(dateStartTicket).isValid()) {
      params = {
        ...params,
        date_from: moment(dateStartTicket).format("YYYY-MM-DD"),
      };
    }

    if (!isEmpty(dateEndTicket) && moment(dateEndTicket).isValid()) {
      params = {
        ...params,
        date_to: moment(dateEndTicket).format("YYYY-MM-DD"),
      };
    }

    if (Object.keys(params).length === 0) {
      toast.error("Parametrize o filtro");
      setLoading(false);
      return;
    }

    const data = await find(params);

    console.log("Dados recebidos no componente:", data);

    setCounters(data.counters);
    if (isArray(data.attendants)) {
      setAttendants(data.attendants);
    } else {
      setAttendants([]);
    }

    setLoading(false);
  }

  const handleSelectedUsers = (selecteds) => {
    const users = selecteds.map((t) => t.id);
    setSelectedUsers(users);
  };


  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  function formatTime(minutes) {
    return moment()
      .startOf("day")
      .add(minutes, "minutes")
      .format("HH[h] mm[m]");
  }

  const GetUsers = () => {
    let count;
    let userOnline = 0;
    attendants.forEach(user => {
      if (user.online === true) {
        userOnline = userOnline + 1
      }
    })
    count = userOnline === 0 ? 0 : userOnline;
    return count;
  };

  // removido: chamada de hook dentro de função auxiliar (violava Regras de Hooks)

  function toggleShowFilter() {
    setShowFilter(!showFilter);
  }

  return (
    <>
      {
        user.profile === "user" && user.showDashboard === "disabled" ?
          <ForbiddenPage />
          :
          <>
            <div>
              <ActivitiesStyleLayout
                description="Indicadores e NPS do WhatsApp"
                viewModes={[
                  { value: "Indicadores", label: i18n.t("dashboard.tabs.indicators") },
                  { value: "NPS", label: "NPS" },
                  { value: "Atendentes", label: i18n.t("dashboard.tabs.attendants") },
                ]}
                currentViewMode={tab}
                onViewModeChange={(val) => setTab(val)}
                scrollContent={false}
                rightFilters={({ classes: layout }) => (
                  <>
                    <div
                      className={layout.filterItem}
                      onClick={(e) => setAnchorPeriodo(e.currentTarget)}
                    >
                      <CalendarTodayIcon className={layout.calendarIcon} />
                      <Typography className={layout.filterLabel}>Período</Typography>
                      <ExpandMoreIcon className={layout.chevronIcon} />
                    </div>
                    <Popover
                      open={Boolean(anchorPeriodo)}
                      anchorEl={anchorPeriodo}
                      onClose={() => setAnchorPeriodo(null)}
                      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    >
                      <div style={{ padding: 12, minWidth: 280 }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                          <TextField
                            label="Data Inicial"
                            type="date"
                            value={dateStartTicket}
                            onChange={(e) => setDateStartTicket(e.target.value)}
                            variant="outlined"
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField
                            label="Data Final"
                            type="date"
                            value={dateEndTicket}
                            onChange={(e) => setDateEndTicket(e.target.value)}
                            variant="outlined"
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                          />
                        </div>
                        <Button
                          onClick={() => {
                            setAnchorPeriodo(null);
                            setFetchDataFilter((v) => !v);
                          }}
                          variant="contained"
                          color="primary"
                          size="small"
                          fullWidth
                        >
                          Aplicar
                        </Button>
                      </div>
                    </Popover>
                  </>
                )}
              >
                

                {tab === "Indicadores" && (
                    <Container maxWidth="xl" >
                      <Grid2
                        container
                        spacing={3}
                      >
                        {/* EM ATENDIMENTO */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            border: "none",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.inAttendance")}
                                  </Typography>
                                  <Typography variant="h4" className={classes.h4}>
                                    {counters.supportHappening}
                                  </Typography>
                                </Stack>
                                <Avatar
                                  sx={{
                                    backgroundColor: 'transparent',
                                    color: theme.palette.primary.main,
                                    border: 'none',
                                    height: 56,
                                    width: 56
                                  }}
                                >
                                  <SvgIcon>
                                    <CallIcon />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* AGUARDANDO */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            border: "none",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.waiting")}
                                  </Typography>
                                  <Typography variant="h4"
                                    className={classes.h4}
                                  >
                                    {counters.supportPending}
                                  </Typography>
                                </Stack>
                                <Avatar
                                  sx={{
                                    backgroundColor: 'transparent',
                                    color: theme.palette.primary.main,
                                    border: 'none',
                                    height: 56,
                                    width: 56
                                  }}
                                >
                                  <SvgIcon>
                                    <HourglassEmptyIcon />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* FINALIZADOS */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            border: "none",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.finalized")}
                                  </Typography>
                                  <Typography variant="h4"
                                    className={classes.h4}
                                  >
                                    {counters.supportFinished}
                                  </Typography>
                                </Stack>
                                <Avatar
                                  sx={{
                                    backgroundColor: 'transparent',
                                    color: theme.palette.primary.main,
                                    border: 'none',
                                    height: 56,
                                    width: 56
                                  }}
                                >
                                  <SvgIcon>
                                    <CheckCircleIcon />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* GRUPOS */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            border: "none",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.groups")}
                                  </Typography>
                                  <Typography variant="h4"

                                    className={classes.h4}
                                  >
                                    {counters.supportGroups}
                                  </Typography>
                                </Stack>

                                <Avatar
                                  sx={{
                                    backgroundColor: 'transparent',
                                    color: theme.palette.primary.main,
                                    border: 'none',
                                    height: 56,
                                    width: 56
                                  }}
                                >
                                  <SvgIcon>
                                    <Groups />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* ATENDENTES ATIVOS */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            border: "none",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.activeAttendants")}
                                  </Typography>
                                  <Typography variant="h4"
                                    className={classes.h4}
                                  >
                                    {GetUsers()}/{attendants.length}
                                  </Typography>
                                </Stack>
                                <Avatar
                                  sx={{
                                    backgroundColor: 'transparent',
                                    color: theme.palette.primary.main,
                                    border: 'none',
                                    height: 56,
                                    width: 56
                                  }}
                                >
                                  <SvgIcon>
                                    <RecordVoiceOverIcon />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* NOVOS CONTATOS */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            border: "none",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.newContacts")}
                                  </Typography>
                                  <Typography variant="h4"
                                    className={classes.h4}
                                  >
                                    {counters.leads}
                                  </Typography>
                                </Stack>
                                <Avatar
                                  sx={{
                                    backgroundColor: 'transparent',
                                    color: theme.palette.primary.main,
                                    border: 'none',
                                    height: 56,
                                    width: 56
                                  }}
                                >
                                  <SvgIcon>
                                    <GroupAddIcon />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* MINHAS MENSAGEM RECEBIDAS */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            border: "none",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.totalReceivedMessages")}
                                  </Typography>
                                  <Typography variant="h4" className={classes.h4}>
                                    {receivedRange}/{receivedTotal}
                                  </Typography>
                                </Stack>
                                <Avatar
                                  sx={{
                                    backgroundColor: 'transparent',
                                    color: theme.palette.primary.main,
                                    border: 'none',
                                    height: 56,
                                    width: 56
                                  }}
                                >
                                  <SvgIcon>
                                    <MessageIcon />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* MINHAS MENSAGEM ENVIADAS */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            border: "none",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.totalSentMessages")}
                                  </Typography>
                                  <Typography variant="h4" className={classes.h4}>
                                    {sentRange}/{sentTotal}
                                  </Typography>
                                </Stack>
                                <Avatar
                                  sx={{
                                    backgroundColor: 'transparent',
                                    color: theme.palette.primary.main,
                                    border: 'none',
                                    height: 56,
                                    width: 56
                                  }}
                                >
                                  <SvgIcon>
                                    <SendIcon />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* T.M. DE ATENDIMENTO */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            border: "none",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.averageServiceTime")}
                                  </Typography>
                                  <Typography variant="h4"
                                    className={classes.h4}
                                  >
                                    {formatTime(counters.avgSupportTime)}
                                  </Typography>
                                </Stack>
                                <Avatar
                                  sx={{
                                    backgroundColor: 'transparent',
                                    color: theme.palette.primary.main,
                                    border: 'none',
                                    height: 56,
                                    width: 56
                                  }}
                                >
                                  <SvgIcon>
                                    <AccessAlarmIcon />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* T.M. DE ESPERA */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            border: "none",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.averageWaitingTime")}
                                  </Typography>
                                  <Typography variant="h4"
                                    className={classes.h4}
                                  >
                                    {formatTime(counters.avgWaitTime)}
                                  </Typography>
                                </Stack>
                                <Avatar
                                  sx={{
                                    backgroundColor: 'transparent',
                                    color: theme.palette.primary.main,
                                    border: 'none',
                                    height: 56,
                                    width: 56
                                  }}
                                >
                                  <SvgIcon>
                                    <TimerIcon />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* TICKETS ATIVOS */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            border: "none",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.activeTickets")}
                                  </Typography>
                                  <Typography variant="h4"
                                    className={classes.h4}
                                  >
                                    {counters.activeTickets}
                                  </Typography>
                                </Stack>

                                <Avatar
                                  sx={{
                                    backgroundColor: 'transparent',
                                    color: theme.palette.primary.main,
                                    border: 'none',
                                    height: 56,
                                    width: 56
                                  }}
                                >
                                  <SvgIcon>
                                    <ArrowUpward />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>

                        {/* TICKETS PASSIVOS */}
                        <Grid2 xs={12}
                          sm={6}
                          lg={4}
                        >
                          <Card sx={{
                            height: "100%",
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            border: "none",
                          }}>
                            <CardContent>
                              <Stack
                                alignItems="flex-start"
                                direction="row"
                                justifyContent="space-between"
                                spacing={3}
                              >
                                <Stack spacing={1}>
                                  <Typography
                                    color="primary"
                                    variant="overline"
                                    className={classes.overline}
                                  >
                                    {i18n.t("dashboard.cards.passiveTickets")}
                                  </Typography>
                                  <Typography variant="h4"

                                    className={classes.h4}
                                  >
                                    {counters.passiveTickets}
                                  </Typography>
                                </Stack>


                                <Avatar
                                  sx={{
                                    backgroundColor: 'transparent',
                                    color: theme.palette.primary.main,
                                    border: 'none',
                                    height: 56,
                                    width: 56
                                  }}
                                >
                                  <SvgIcon>
                                    <ArrowDownward />
                                  </SvgIcon>
                                </Avatar>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid2>
                      </Grid2>
                    </Container>
                )}

                {tab === "NPS" && (
                  <Grid2 className={classes.container}>
                    <Grid2 container width="100%" spacing={2}>
                      <Grid2 xs={12} sm={6} md={3}>
                        <Card sx={{ backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #E5E7EB", borderRadius: 2 }}>
                          <CardContent>
                            <ChartDonut
                              data={[`{'name': 'Promotores', 'value': ${counters.npsPromotersPerc | 100}}`, `{'name': 'Detratores', 'value': ${counters.npsDetractorsPerc | 0}}`, `{'name': 'Neutros', 'value': ${counters.npsPassivePerc | 0}}`]}
                              value={counters.npsScore | 0}
                              title="Score"
                              color={(parseInt(counters.npsPromotersPerc | 0) + parseInt(counters.npsDetractorsPerc | 0) + parseInt(counters.npsPassivePerc | 0)) === 0 ? ["#918F94"] : ["#2EA85A", "#F73A2C", "#F7EC2C"]}
                            />
                          </CardContent>
                        </Card>
                      </Grid2>
                      <Grid2 xs={12} sm={6} md={3}>
                        <Card sx={{ backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #E5E7EB", borderRadius: 2 }}>
                          <CardContent>
                            <ChartDonut title={i18n.t("dashboard.assessments.prosecutors")} value={counters.npsPromotersPerc | 0} data={[`{'name': 'Promotores', 'value': 100}`]} color={["#2EA85A"]} />
                          </CardContent>
                        </Card>
                      </Grid2>
                      <Grid2 xs={12} sm={6} md={3}>
                        <Card sx={{ backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #E5E7EB", borderRadius: 2 }}>
                          <CardContent>
                            <ChartDonut data={[`{'name': 'Neutros', 'value': 100}`]} title={i18n.t("dashboard.assessments.neutral")} value={counters.npsPassivePerc | 0} color={["#F7EC2C"]} />
                          </CardContent>
                        </Card>
                      </Grid2>
                      <Grid2 xs={12} sm={6} md={3}>
                        <Card sx={{ backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #E5E7EB", borderRadius: 2 }}>
                          <CardContent>
                            <ChartDonut data={[`{'name': 'Detratores', 'value': 100}`]} title={i18n.t("dashboard.assessments.detractors")} value={counters.npsDetractorsPerc | 0} color={["#F73A2C"]} />
                          </CardContent>
                        </Card>
                      </Grid2>
                      <Grid2 xs={12} sm={6} md={12}>
                        <Card sx={{ backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #E5E7EB", borderRadius: 2 }}>
                          <CardContent>
                            <Typography component="h3" variant="h6" paragraph style={{ marginLeft: "10px" }}>
                              {i18n.t("dashboard.assessments.totalCalls")}: {counters.tickets} <br />
                              {i18n.t("dashboard.assessments.callsWaitRating")}: {counters.waitRating} <br />
                              {i18n.t("dashboard.assessments.callsWithoutRating")}: {counters.withoutRating} <br />
                              {i18n.t("dashboard.assessments.ratedCalls")}: {counters.withRating} <br />
                              {i18n.t("dashboard.assessments.evaluationIndex")}: {Number(counters.percRating / 100).toLocaleString(undefined, { style: "percent" })} <br />
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid2>
                    </Grid2>
                  </Grid2>
                )}

                {tab === "Atendentes" && (
                  <Container width="100%" className={classes.container}>
                    <IconButton onClick={exportarGridParaExcel} aria-label="Exportar para Excel">
                      <SaveAlt />
                    </IconButton>
                    <Grid2 container width="100%" spacing={2}>
                      <Grid2 xs={12} id="grid-attendants">
                        <Card sx={{ backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #E5E7EB", borderRadius: 2 }}>
                          <CardContent>
                            {attendants.length ? <TableAttendantsStatus attendants={attendants} loading={loading} /> : null}
                          </CardContent>
                        </Card>
                      </Grid2>
                      <Grid2 xs={12} id="grid-attendants">
                        <Card sx={{ backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #E5E7EB", borderRadius: 2 }}>
                          <CardContent>
                            <ChatsUser />
                          </CardContent>
                        </Card>
                      </Grid2>
                      <Grid2 xs={12} id="grid-attendants">
                        <Card sx={{ backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #E5E7EB", borderRadius: 2 }}>
                          <CardContent>
                            <ChartsDate />
                          </CardContent>
                        </Card>
                      </Grid2>
                    </Grid2>
                  </Container>
                )}
              </ActivitiesStyleLayout>
            </div >
          </>
      }
    </>
  );
};

export default WhatsappDashboard;
