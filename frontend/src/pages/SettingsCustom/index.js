import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { makeStyles, Paper } from "@material-ui/core";

import TabPanel from "../../components/TabPanel";

import SchedulesForm from "../../components/SchedulesForm";
import CompaniesManager from "../../components/CompaniesManager";
import PlansManager from "../../components/PlansManager";
import Options from "../../components/Settings/Options";
import Whitelabel from "../../components/Settings/Whitelabel";
import FinalizacaoAtendimento from "../../components/Settings/FinalizacaoAtendimento";
import Users from "../Users";
import AllConnections from "../AllConnections";
import QueueIntegration from "../QueueIntegration";
import Invoices from "../Financeiro";
import Tags from "../Tags";
import BirthdaySettings from "../BirthdaySettings";
import Announcements from "../Annoucements";
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
import ActivitiesStyleLayout from "../../components/ActivitiesStyleLayout";

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.palette.background.paper,
  },
  mainPaper: {
    overflowY: "hidden",
    overflowX: "hidden",
    flex: 1,
  },
  paper: {
    overflowY: "hidden",
    overflowX: "hidden",
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  container: {
    width: "100%",
    maxHeight: "100%",
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
    if (initialTab) {
      setTab(initialTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Construct viewModes (Tabs) - keeping Plans and Financeiro as the last items, with Plans before Financeiro
  const baseTabs = [
    { value: "options", label: i18n.t("settings.tabs.options") },
    ...(schedulesEnabled ? [{ value: "schedules", label: "Horários" }] : []),
    ...(user.profile === "admin" && user.finalizacaoComValorVendaAtiva ? [{ value: "finalizacao", label: "Finalização do Atendimento" }] : []),
    ...(isSuper() ? [{ value: "whitelabel", label: "Identidade Visual" }] : []),
    { value: "users", label: "Usuários" },
    { value: "connections", label: "Gerenciar Conexões" },
    { value: "integrations", label: "Integrações" },
    { value: "email", label: "Email" },
    { value: "tags", label: "Tags" },
    { value: "announcements", label: "Informativos" },
    ...(isSpecificAdminUI() ? [{ value: "companies", label: "Assinaturas" }] : []),
  ];
  const trailingTabs = isSpecificAdminUI()
    ? [
        { value: "plans", label: i18n.t("settings.tabs.plans") },
        { value: "financeiro", label: "Financeiro" }
      ]
    : [];
  const settingsTabs = [...baseTabs, ...trailingTabs];

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
                    {isSpecificAdminUI() && (
                      <TabPanel
                        className={classes.container}
                        value={tab}
                        name={"plans"}
                      >
                        <PlansManager />
                      </TabPanel>
                    )}
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
              {isSpecificAdminUI() && (
                <TabPanel
                  className={classes.container}
                  value={tab}
                  name={"financeiro"}
                >
                  <Invoices renderAsTab={true} />
                </TabPanel>
              )}
              <TabPanel
                className={classes.container}
                value={tab}
                name={"tags"}
              >
                <Tags renderAsTab={true} />
              </TabPanel>
              
              <TabPanel
                className={classes.container}
                value={tab}
                name={"announcements"}
              >
                <Announcements renderAsTab={true} />
              </TabPanel>
            </Paper>
        </ActivitiesStyleLayout>
      )}
    </>
  );
};

export default SettingsCustom;
