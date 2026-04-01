import React, { useEffect, useState, useContext } from "react";
import { BrowserRouter, Switch, Redirect } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import moment from "moment";

import LoggedInLayout from "../layout";
import Dashboard from "../pages/Dashboard/";
import TicketResponsiveContainer from "../pages/TicketResponsiveContainer";
import Signup from "../pages/Signup";
import Register from "../pages/Register";
import RegisterFreemium from "../pages/RegisterFreemium";
import Login from "../pages/Login/";
import ResetPassword from "../pages/ResetPassword";
import Connections from "../pages/Connections/";
import Settings from "../pages/SettingsCustom/";
import Financeiro from "../pages/Financeiro/";
import Users from "../pages/Users";
import Contacts from "../pages/Contacts/";
import ContactImportPage from "../pages/Contacts/import";
import ChatMoments from "../pages/Moments";
import Queues from "../pages/Queues/";
import Tags from "../pages/Tags/";
import MessagesAPI from "../pages/MessagesAPI/";
import Helps from "../pages/Helps/";
import ContactLists from "../pages/ContactLists/";
import ContactListItems from "../pages/ContactListItems/";
import Companies from "../pages/Companies/";
import Wallets from "../pages/Wallets/";
import QuickMessages from "../pages/QuickMessages/";
import { AuthProvider, AuthContext } from "../context/Auth/AuthContext";
import { TicketsContextProvider } from "../context/Tickets/TicketsContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import { CampaignSendingProvider } from "../context/CampaignSendingContext";
import Route from "./Route";
import Schedules from "../pages/Schedules";
import Campaigns from "../pages/Campaigns";
import CampaignsConfig from "../pages/CampaignsConfig";
import CampaignReport from "../pages/CampaignReport";
import Annoucements from "../pages/Annoucements";
import Chat from "../pages/Chat";
import Prompts from "../pages/Prompts";
import AllConnections from "../pages/AllConnections/";
import Reports from "../pages/Reports";
import RelatorioVendas from "../pages/RelatorioVendas";
import Subscription from "../pages/Subscription/";
import QueueIntegration from "../pages/QueueIntegration";
import Files from "../pages/Files/";
import ToDoList from "../pages/ToDoList/";
import Kanban from "../pages/Kanban";
import TagsKanban from "../pages/TagsKanban";
import BirthdaySettingsPage from "../pages/BirthdaySettings";
import CallHistoricals from "../pages/CallHistoricals";
import { FlowBuilderConfig } from "../pages/FlowBuilderConfig";
import FlowBuilder from "../pages/FlowBuilder";
import FlowDefault from "../pages/FlowDefault";
import CampaignsPhrase from "../pages/CampaignsPhrase";
import Activities from "../pages/Activities/";
import Projects from "../pages/Projects/";
import LeadsSales from "../pages/LeadsSales/";
import Inventory from "../pages/Inventory/";
import FilesPage from "../pages/FilesPage/";
import EmailPage from "../pages/EmailPage/";
import WhatsappDashboard from "../pages/WhatsappDashboard/";
import LeadsConvertidos from "../pages/LeadsConvertidos/";
import Payment from "../pages/Payment/";

const RoutesContent = () => {
  const [showCampaigns, setShowCampaigns] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const cshow = localStorage.getItem("cshow");
    if (cshow !== undefined) {
      setShowCampaigns(true);
    }
  }, []);

  // Verificar se a empresa está vencida
  const isCompanyExpired = () => {
    if (process.env.NODE_ENV !== "production") {
      return false;
    }
    if (!user || !user.company || user.company.id === 1) {
      return false; // Empresa ID 1 nunca expira
    }

    const dueDate = user.company.dueDate;
    if (!dueDate) return false;

    // Comparar apenas as datas (sem horas) para permitir acesso até 23h59 do dia do vencimento
    const hojeInicio = moment().startOf('day');
    const vencimentoInicio = moment(dueDate).startOf('day');
    
    // Empresa está vencida apenas após o dia do vencimento
    return hojeInicio.isAfter(vencimentoInicio, 'day');
  };

  const FinanceiroGuard = (props) => {
    const allowed = user?.email?.toLowerCase() === "admin@admin.com";
    return allowed ? <Financeiro {...props} /> : <Redirect to="/" />;
  };

  return (
    <TicketsContextProvider>
      <Switch>
        <Route exact path="/login" component={Login} title="Login" />
        <Route exact path="/reset-password" component={ResetPassword} title="Redefinir Senha" allowWhenAuth />
        <Route exact path="/signup" component={Signup} title="Cadastro" allowWhenAuth />
        <Route exact path="/register" component={Register} title="Registrar" allowWhenAuth />
        <Route exact path="/cadastro-gratis" component={RegisterFreemium} title="Nova organização — cadastro grátis" allowWhenAuth />
        <Route exact path="/payment" component={Payment} title="Pagamento" allowWhenAuth />
        <WhatsAppsProvider>
          <CampaignSendingProvider>
          <LoggedInLayout hideMenu={isCompanyExpired()}>
                <Route
                  exact
                  path="/financeiro"
                  component={FinanceiroGuard}
                  isPrivate
                  title="Financeiro"
                />

                <Route
                  exact
                  path="/financeiro-aberto"
                  component={Financeiro}
                  isPrivate
                  title="Financeiro"
                />

                <Route
                  exact
                  path="/companies"
                  component={Companies}
                  isPrivate
                  title="Empresas"
                />
                <Route
                  exact
                  path="/birthday-settings"
                  component={BirthdaySettingsPage}
                  isPrivate
                  title="Configurações de Aniversário"
                />
                <Route exact path="/" component={Dashboard} isPrivate title="Dashboard" />
                <Route exact path="/call-historicals" component={CallHistoricals} isPrivate title="Histórico de Chamadas" />
                <Route
                  exact
                  path="/tickets/:ticketId?"
                  component={TicketResponsiveContainer}
                  isPrivate
                  title="Atendimentos"
                />
                <Route
                  exact
                  path="/connections"
                  component={Connections}
                  isPrivate
                  title="Conexões"
                />
                <Route
                  exact
                  path="/quick-messages"
                  component={QuickMessages}
                  isPrivate
                  title="Disparos Automáticos"
                />
                <Route exact path="/todolist" component={ToDoList} isPrivate title="Tarefas" />
                <Route
                  exact
                  path="/schedules"
                  component={Schedules}
                  isPrivate
                  title="Agendamentos"
                />
                <Route exact path="/tags" component={Tags} isPrivate title="Etiquetas" />
                <Route exact path="/contacts" component={Contacts} isPrivate title="Contatos" />
                <Route
                  exact
                  path="/contacts/import"
                  component={ContactImportPage}
                  isPrivate
                  title="Importar Contatos"
                />
                <Route exact path="/wallets" component={Wallets} isPrivate title="Carteiras" />
                <Route exact path="/helps" component={Helps} isPrivate title="Ajuda" />
                <Route exact path="/users" component={Users} isPrivate title="Usuários" />
                <Route
                  exact
                  path="/api"
                  component={MessagesAPI}
                  isPrivate
                  title="API"
                />
                <Route
                  exact
                  path="/settings"
                  component={Settings}
                  isPrivate
                  title="Configurações"
                />
                <Route exact path="/queues" component={Queues} isPrivate title="Filas e Chatbot" />
                <Route exact path="/reports" component={Reports} isPrivate title="Relatórios" />
                <Route
                  exact
                  path="/relatorio-vendas"
                  component={RelatorioVendas}
                  isPrivate
                  title="Relatório de Vendas"
                />
                <Route
                  exact
                  path="/integrations"
                  component={QueueIntegration}
                  isPrivate
                  title="Integrações"
                />
                <Route
                  exact
                  path="/queue-integration"
                  component={QueueIntegration}
                  isPrivate
                  title="Integrações de Filas"
                />
                <Route
                  exact
                  path="/announcements"
                  component={Annoucements}
                  isPrivate
                  title="Avisos"
                />
                <Route exact path="/chats/:id?" component={Chat} isPrivate title="Chats Internos" />
                <Route exact path="/files" component={Files} isPrivate title="Lista de Arquivos" />
                <Route
                  exact
                  path="/moments"
                  component={ChatMoments}
                  isPrivate
                  title="Chat Moments"
                />
                <Route exact path="/Kanban" component={Kanban} isPrivate title="Kanban" />
                <Route
                  exact
                  path="/TagsKanban"
                  component={TagsKanban}
                  isPrivate
                  title="Kanban de Tags"
                />
                <Route exact path="/prompts" component={Prompts} isPrivate title="Prompts" />
                <Route
                  exact
                  path="/allConnections"
                  component={AllConnections}
                  isPrivate
                  title="Todas Conexões"
                />

                <Route
                  exact
                  path="/phrase-lists"
                  component={CampaignsPhrase}
                  isPrivate
                  title="Frases de Campanha"
                />
                <Route
                  exact
                  path="/flowbuilders"
                  component={FlowBuilder}
                  isPrivate
                  title="Flow Builder"
                />
                <Route
                  exact
                  path="/flowbuilder/:id?"
                  component={FlowBuilderConfig}
                  isPrivate
                  title="Configuração de Fluxo"
                />
                
                <Route exact path="/activities" component={Activities} isPrivate title="Atividades" />
                <Route exact path="/whatsapp-dashboard" component={WhatsappDashboard} isPrivate title="Dashboard WhatsApp" />
                <Route exact path="/leads-convertidos" component={LeadsConvertidos} isPrivate title="Leads Convertidos" />
                <Route exact path="/projects" component={Projects} isPrivate title="Projetos" />
                <Route exact path="/leads-sales" component={LeadsSales} isPrivate title="Leads e Vendas" />
                <Route exact path="/inventory" component={Inventory} isPrivate title="Inventários" />
                <Route exact path="/arquivos" component={FilesPage} isPrivate title="Arquivos" />
                <Route exact path="/email" component={EmailPage} isPrivate title="Email" />

                {showCampaigns && (
                  <>
                    <Route
                      exact
                      path="/contact-lists"
                      component={ContactLists}
                      isPrivate
                      title="Listas de Contatos"
                    />
                    <Route
                      exact
                      path="/contact-lists/:contactListId/contacts"
                      component={ContactListItems}
                      isPrivate
                      title="Contatos da Lista"
                    />
                    <Route
                      exact
                      path="/campaigns"
                      component={Campaigns}
                      isPrivate
                      title="Campanhas"
                    />
                    <Route
                      exact
                      path="/campaign/:campaignId/report"
                      component={CampaignReport}
                      isPrivate
                      title="Relatório de Campanha"
                    />
                    <Route
                      exact
                      path="/campaigns-config"
                      component={CampaignsConfig}
                      isPrivate
                      title="Configuração de Campanhas"
                    />
                  </>
                )}
              </LoggedInLayout>
          </CampaignSendingProvider>
            </WhatsAppsProvider>
          </Switch>
          <ToastContainer position="top-center" autoClose={3000} />
        </TicketsContextProvider>
  );
};

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RoutesContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
