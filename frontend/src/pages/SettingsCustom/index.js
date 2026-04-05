import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";

import TabPanel from "../../components/TabPanel/index.js";

import SchedulesForm from "../../components/SchedulesForm";
import CompaniesManager from "../../components/CompaniesManager";
import Options from "../../components/Settings/Options.js";
import Whitelabel from "../../components/Settings/Whitelabel.js";
import FinalizacaoAtendimento from "../../components/Settings/FinalizacaoAtendimento";
import Users from "../Users";
import AllConnections from "../AllConnections";
import QueueIntegration from "../QueueIntegration";
import BirthdaySettings from "../BirthdaySettings";
import EmailSettings from "../../components/Settings/EmailSettings";
import Connections from "../Connections";

import { i18n } from "../../translate/i18n.js";
import { toast } from "react-toastify";

import useCompanies from "../../hooks/useCompanies";
import { AuthContext } from "../../context/Auth/AuthContext";

import OnlyForSuperUser from "../../components/OnlyForSuperUser";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import useSettings from "../../hooks/useSettings";
import ForbiddenPage from "../../components/ForbiddenPage/index.js";
import ActivitiesStyleLayout from "../../components/ActivitiesStyleLayout/index.js";

const settingsFontStack = '"Helvetica Neue", Helvetica, Arial, sans-serif';

const useStyles = makeStyles((theme) => ({
  /** Tipografia /settings: Helvetica Neue; títulos como modal Nova Atividade (h6, peso normal) */
  settingsRoot: {
    fontFamily: settingsFontStack,
    ...(theme.palette.type === "dark"
      ? {
          color: theme.palette.text.primary,
          "& .MuiPaper-outlined": {
            backgroundColor: theme.palette.listScrollArea,
            borderColor: "rgba(255, 255, 255, 0.12)",
          },
          "& .MuiTableCell-body": {
            color: theme.palette.text.primary,
            borderBottomColor: "rgba(255, 255, 255, 0.08)",
          },
          "& .MuiTableCell-head": {
            color: theme.palette.text.secondary,
            borderBottomColor: "rgba(255, 255, 255, 0.12)",
          },
        }
      : {}),
    "& .MuiTypography-h6": {
      fontFamily: settingsFontStack,
      fontWeight: 400,
    },
    "& .MuiTypography-h5": {
      fontFamily: settingsFontStack,
      fontWeight: 400,
    },
    "& .MuiTypography-h4": {
      fontFamily: settingsFontStack,
      fontWeight: 400,
    },
    "& .MuiTypography-subtitle1": {
      fontFamily: settingsFontStack,
      fontWeight: 400,
    },
    "& .MuiTypography-subtitle2": {
      fontFamily: settingsFontStack,
      fontWeight: 400,
    },
    "& .MuiTypography-body1": {
      fontFamily: settingsFontStack,
    },
    "& .MuiTypography-body2": {
      fontFamily: settingsFontStack,
    },
    "& .MuiTypography-caption": {
      fontFamily: settingsFontStack,
    },
    "& .MuiButton-root": {
      fontFamily: settingsFontStack,
    },
    "& .MuiInputBase-root": {
      fontFamily: settingsFontStack,
    },
    "& .MuiFormLabel-root": {
      fontFamily: settingsFontStack,
    },
    "& .MuiTab-root": {
      fontFamily: settingsFontStack,
      fontWeight: 400,
    },
    "& .MuiTableCell-head": {
      fontFamily: settingsFontStack,
      fontWeight: 400,
    },
    "& .MuiTableCell-body": {
      fontFamily: settingsFontStack,
    },
  },
  root: {
    flex: 1,
    backgroundColor:
      theme.palette.type === "dark"
        ? theme.palette.background.default
        : theme.palette.background.paper,
  },
  mainPaper: {
    overflowY: "hidden",
    overflowX: "hidden",
    flex: 1,
  },
  paper: {
    overflowY: "auto",
    overflowX: "hidden",
    padding: theme.spacing(1.25, 2, 2),
    display: "flex",
    flexDirection: "column",
    flex: 1,
    alignSelf: "stretch",
    alignItems: "stretch",
    width: "100%",
    minHeight: 0,
    maxWidth: "100%",
    margin: 0,
    backgroundColor:
      theme.palette.type === "dark"
        ? theme.palette.listScrollArea
        : "transparent",
    boxSizing: "border-box",
    fontFamily: settingsFontStack,
    [theme.breakpoints.up("md")]: {
      padding: theme.spacing(1.5, 2.5, 2.5),
    },
  },
  container: {
    width: "100%",
    maxHeight: "100%",
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  },
  control: {
    padding: theme.spacing(1),
  },
  textfield: {
    width: "100%",
  },
}));

const SettingsCustom = () => {
  const classes = useStyles();
  const theme = useTheme();
  const [tab, setTab] = useState("options");
  const [schedules, setSchedules] = useState([]);
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [settings, setSettings] = useState({});
  const [oldSettings, setOldSettings] = useState({});
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);

  const { find, updateSchedules } = useCompanies();

  //novo hook
  const { getAll: getAllSettings } = useCompanySettings();
  const { getAll: getAllSettingsOld } = useSettings();
  const { user, socket } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialTab = params.get("tab");
    if (initialTab === "tags") {
      setTab("options");
    } else if (initialTab && initialTab !== "financeiro" && initialTab !== "plans") {
      setTab(initialTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      tab === "financeiro" ||
      tab === "plans" ||
      tab === "announcements"
    ) {
      setTab("options");
    }
  }, [tab]);

  useEffect(() => {
    async function findData() {
      if (!user || !user.companyId) {
        return;
      }

      setLoading(true);
      try {
        const companyId = user.companyId;

        const company = await find(companyId);

        const settingList = await getAllSettings(companyId);

        const settingListOld = await getAllSettingsOld();

        setCompany(company);
        setSchedules(company.schedules);
        setSettings(settingList);
        setOldSettings(settingListOld);

        setSchedulesEnabled(settingList.scheduleType === "company");
        setCurrentUser(user);
      } catch (e) {
        toast.error(e);
      }
      setLoading(false);
    }
    findData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!socket || !user || !user.companyId) return;
    const onSettingsEvent = () => {
      getAllSettingsOld().then(setOldSettings);
    };
    socket.on(`company-${user.companyId}-settings`, onSettingsEvent);
    return () => {
      socket.off(`company-${user.companyId}-settings`, onSettingsEvent);
    };
  }, [socket, user]);

  const handleSubmitSchedules = async (data) => {
    setLoading(true);
    try {
      setSchedules(data);
      await updateSchedules({ id: company.id, schedules: data });
      toast.success("Horários atualizados com sucesso.");
    } catch (e) {
      toast.error(e);
    }
    setLoading(false);
  };

  const isSuper = () => {
    return currentUser && currentUser.super;
  };
  const isSpecificAdminUI = () => {
    return currentUser?.email?.toLowerCase() === "admin@admin.com";
  };

  const baseTabs = [
    { value: "options", label: i18n.t("settings.tabs.options") },
    ...(schedulesEnabled ? [{ value: "schedules", label: "Horários" }] : []),
    ...(user.profile === "admin" && user.finalizacaoComValorVendaAtiva ? [{ value: "finalizacao", label: "Finalização do Atendimento" }] : []),
    ...(isSuper() ? [{ value: "whitelabel", label: "Identidade Visual" }] : []),
    { value: "users", label: "Usuários" },
    { value: "connections", label: "Gerenciar Conexões" },
    { value: "integrations", label: "Integrações" },
    { value: "email", label: "Email" },
    ...(isSpecificAdminUI() ? [{ value: "companies", label: "Assinaturas" }] : []),
  ];
  const settingsTabs = baseTabs;

  return (
    <>
      {user.profile === "user" ? (
        <ForbiddenPage />
      ) : (
        <ActivitiesStyleLayout
          title={i18n.t("settings.title")}
          viewModes={settingsTabs}
          currentViewMode={tab}
          onViewModeChange={setTab}
          searchPlaceholder="Buscar configurações..."
          disableFilterBar={true}
          hideSearch={true}
          enableTabsScroll={true}
          hideNavDivider={true}
          hideHeaderDivider={true}
          contentEdgeToEdge={true}
          rootBackground={
            theme.palette.type === "dark"
              ? theme.palette.background.default
              : theme.palette.background.paper
          }
          rootClassName={classes.settingsRoot}
        >
            <Paper className={classes.paper} elevation={0}>
              <TabPanel
                className={classes.container}
                value={tab}
                name={"schedules"}
              >
                <SchedulesForm
                  loading={loading}
                  onSubmit={handleSubmitSchedules}
                  initialValues={schedules}
                />
              </TabPanel>
              {isSpecificAdminUI() && (
                <TabPanel
                  className={classes.container}
                  value={tab}
                  name={"companies"}
                >
                  <CompaniesManager />
                </TabPanel>
              )}
              <OnlyForSuperUser
                user={currentUser}
                yes={() => (
                  <>
                    <TabPanel
                      className={classes.container}
                      value={tab}
                      name={"whitelabel"}
                    >
                      <Whitelabel settings={oldSettings} />
                    </TabPanel>
                  </>
                )}
              />
              <TabPanel
                className={classes.container}
                value={tab}
                name={"finalizacao"}
              >
                <FinalizacaoAtendimento
                  settings={settings}
                  onSettingsChange={(newSettings) => setSettings(newSettings)}
                />
              </TabPanel>
              <TabPanel
                className={classes.container}
                value={tab}
                name={"options"}
              >
                <Options
                  settings={settings}
                  oldSettings={oldSettings}
                  user={currentUser}
                  scheduleTypeChanged={(value) =>
                    setSchedulesEnabled(value === "company")
                  }
                />
              </TabPanel>
              <TabPanel
                className={classes.container}
                value={tab}
                name={"users"}
              >
                <Users renderAsTab={true} />
              </TabPanel>
              <TabPanel
                className={classes.container}
                value={tab}
                name={"integrations"}
              >
                <QueueIntegration renderAsTab={true} />
              </TabPanel>
              <TabPanel
                className={classes.container}
                value={tab}
                name={"connections"}
              >
                {isSuper() ? (
                  <AllConnections renderAsTab={true} />
                ) : (
                  <Connections />
                )}
              </TabPanel>
              <TabPanel
                className={classes.container}
                value={tab}
                name={"email"}
              >
                <EmailSettings renderAsTab={true} />
              </TabPanel>
            </Paper>
        </ActivitiesStyleLayout>
      )}
    </>
  );
};

export default SettingsCustom;
