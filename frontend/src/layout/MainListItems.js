import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useLocation, useHistory } from "react-router-dom";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useHelps from "../hooks/useHelps";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";
import Collapse from "@material-ui/core/Collapse";
import List from "@material-ui/core/List";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import SvgIcon from "@material-ui/core/SvgIcon";

import HistoryIcon from "@material-ui/icons/History";
import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import HomeOutlinedIcon from "@material-ui/icons/HomeOutlined";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import ContactPhoneOutlinedIcon from "@material-ui/icons/ContactPhoneOutlined";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import CodeRoundedIcon from "@material-ui/icons/CodeRounded";
import ViewKanban from "@mui/icons-material/ViewKanban";
import Schedule from "@material-ui/icons/Schedule";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import EventAvailableIcon from "@material-ui/icons/EventAvailable";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import CakeIcon from "@material-ui/icons/Cake";
import PeopleIcon from "@material-ui/icons/People";
import ListIcon from "@material-ui/icons/ListAlt";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import ForumIcon from "@material-ui/icons/Forum";
import LocalAtmIcon from "@material-ui/icons/LocalAtm";
import AssignmentOutlinedIcon from "@material-ui/icons/AssignmentOutlined";
import WorkOutlineIcon from "@material-ui/icons/WorkOutline";
import MonetizationOnOutlinedIcon from "@material-ui/icons/MonetizationOnOutlined";
import StoreOutlinedIcon from "@material-ui/icons/StoreOutlined";
import FolderOutlinedIcon from "@material-ui/icons/FolderOutlined";
import EmailOutlinedIcon from "@material-ui/icons/EmailOutlined";
import CodeOutlinedIcon from "@material-ui/icons/CodeOutlined";
import ForumOutlinedIcon from "@material-ui/icons/ForumOutlined";
import BusinessIcon from "@material-ui/icons/Business";
import ConfirmationNumberOutlinedIcon from "@material-ui/icons/ConfirmationNumberOutlined";
import AndroidIcon from "@material-ui/icons/Android";
import BusinessCenterIcon from "@material-ui/icons/BusinessCenter";
import StoreIcon from "@material-ui/icons/Store";
import FolderIcon from "@material-ui/icons/Folder";
import EmailIcon from "@material-ui/icons/Email";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import {
  AllInclusive,
  AttachFile,
  Dashboard,
  Description,
  DeviceHubOutlined,
  GridOn,
  PhonelinkSetup,
} from "@material-ui/icons";

import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { useActiveMenu } from "../context/ActiveMenuContext";

import { Can } from "../components/Can";

import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";
import usePlans from "../hooks/usePlans";
// import useVersion from "../hooks/useVersion";
import { i18n } from "../translate/i18n";
import { Campaign, ShapeLine, Webhook } from "@mui/icons-material";

import useCompanySettings from "../hooks/useSettings/companySettings";

const useStyles = makeStyles((theme) => ({
  listItem: {
    height: 32,
    width: "auto",
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 12,
    borderRadius: 8,
    margin: "2px 8px",
    "&:hover $iconHoverActive": {
      backgroundColor: "transparent",
      color: theme.palette.sidebarMenuHoverAccent,
      transform: "scale(1.05)",
    },
    "&:hover $listItemText": {
      color: theme.palette.sidebarMenuHoverAccent,
      fontWeight: 400,
    },
    "&:hover": {
      backgroundColor: theme.palette.sidebarMenuItemHoverBg,
    },
    transition: "all 0.2s ease",
    justifyContent: props => props.collapsed ? "center" : "flex-start", // Centraliza o conteúdo se colapsado
  },

  moreItem: {
    marginTop: 8,
    marginBottom: 6,
  },

  moreCollapse: {
    paddingTop: 6,
    paddingBottom: 6,
  },

  bottomSpacing: {
    margin: "10px 8px",
  },

  listItemActive: {
    backgroundColor: theme.palette.sidebarMenuItemActiveBg,
    "& $listItemText": {
      color: theme.palette.sidebarMenuHoverAccent,
      fontWeight: 400,
    },
    "& $iconHoverActive": {
      color: theme.palette.sidebarMenuHoverAccent,
    },
  },

  listItemText: {
    fontSize: "13px",
    color: theme.palette.sidebarMenuTextPrimary,
    transition: "color 0.3s ease",
    fontWeight: 400,
    "& .MuiTypography-root": {
      fontFamily: '"Helvetica Neue", "Helvetica", "Arial", sans-serif',
    },
  },

  avatarActive: {
    backgroundColor: "transparent",
  },

  avatarHover: {
    backgroundColor: "transparent",
  },

  iconHoverActive: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%",
    height: 22,
    width: 22,
    backgroundColor: "transparent",
    color: theme.palette.sidebarMenuIcon,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover, &.active": {
      backgroundColor: "transparent",
      color: theme.palette.sidebarMenuHoverAccent,
      boxShadow: "none",
    },
    "& .MuiSvgIcon-root": {
      fontSize: "1rem",
      transition: "transform 0.3s ease",
    },
    "&:hover .MuiSvgIcon-root": {
      transform: "scale(1.1)",
    }
  },

  badge: {
    "& .MuiBadge-badge": {
      backgroundColor: "#ef4444",
      color: "#fff",
      fontSize: "0.75rem",
      fontWeight: 600,
      animation: "$pulse 2s infinite",
    }
  },

  "@keyframes pulse": {
    "0%, 100%": {
      opacity: 1,
    },
    "50%": {
      opacity: 0.7,
    }
  },

  submenuContainer: {
    backgroundColor:
      theme.mode === "light" ? "rgba(0, 0, 0, 0.02)" : "transparent",
  },

  customTooltip: {
    backgroundColor: theme.mode === "light" ? "#1e293b" : "#374151",
    color: "#fff",
    fontSize: "0.875rem",
    fontWeight: 500,
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    "& .MuiTooltip-arrow": {
      color: theme.mode === "light" ? "#1e293b" : "#374151",
    }
  },

  versionContainer: {
    textAlign: "center",
    padding: "10px",
    color: theme.palette.sidebarMenuTextSecondary,
    fontSize: "12px",
    fontWeight: "bold",
    borderTop: `1px solid ${theme.palette.divider}`,
    marginTop: "auto",
  },

  adminSection: {
    "& .MuiListSubheader-root": {
      color: theme.palette.sidebarMenuTextSecondary,
      fontSize: "0.875rem",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    }
  },

  expandIcon: {
    transition: "transform 0.3s ease",
    color: theme.palette.sidebarMenuTextSecondary,
    "&.expanded": {
      transform: "rotate(180deg)",
    }
  },

  menuContainer: {
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: 3,
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(148, 163, 184, 0.6)",
      borderRadius: 2,
    },
  },
}));

const OpenAiIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1195 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4533l-.142.0805L8.704 5.4596a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l3.854-2.2092 3.8539 2.2092v4.4184l-3.8539 2.2186-3.854-2.2186z" />
  </SvgIcon>
);

function ListItemLink(props) {
  const { icon, primary, to, tooltip, showBadge, bottom } = props;
  const collapsed = props.collapsed;
  const classes = useStyles({ collapsed }); // Passando collapsed para o useStyles
  const { activeMenu } = useActiveMenu();
  const location = useLocation();
  const isActive = activeMenu === to || location.pathname === to;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  const ConditionalTooltip = ({ children, tooltipEnabled }) =>
    tooltipEnabled ? (
      <Tooltip title={primary} placement="right">
        {children}
      </Tooltip>
    ) : (
      children
    );

  return (
    <ConditionalTooltip tooltipEnabled={!!tooltip}>
      <ListItem
        button
        dense
        component={renderLink}
        className={`${classes.listItem} ${isActive ? classes.listItemActive : ""} ${bottom ? classes.bottomSpacing : ""}`}
      >
        {icon ? (
          <ListItemIcon style={{ minWidth: 28, marginRight: collapsed ? 0 : 6, justifyContent: 'center' }}>
            {showBadge ? (
              <Badge
                badgeContent="!"
                color="error"
                overlap="circular"
                className={classes.badge}
              >
                <Avatar
                  className={`${classes.iconHoverActive} ${isActive ? "active" : ""
                    }`}
                >
                  {icon}
                </Avatar>
              </Badge>
            ) : (
              <Avatar
                className={`${classes.iconHoverActive} ${isActive ? "active" : ""
                  }`}
              >
                {icon}
              </Avatar>
            )}
          </ListItemIcon>
        ) : null}
        {!collapsed && (
          <ListItemText
            primary={
              <Typography className={classes.listItemText}>
                {primary}
              </Typography>
            }
            style={{ display: collapsed ? 'none' : 'block' }}
          />
        )}
      </ListItem>
    </ConditionalTooltip>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

const MainListItems = ({ collapsed, drawerClose, section }) => {
  const theme = useTheme();
  const classes = useStyles({ collapsed });
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, socket } = useContext(AuthContext);
  const history = useHistory();

  const { setActiveMenu } = useActiveMenu();
  const location = useLocation();

  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [openDashboardSubmenu, setOpenDashboardSubmenu] = useState(false);
  const [openVBZappySubmenu, setOpenVBZappySubmenu] = useState(false);
  const [openSettingsSubmenu, setOpenSettingsSubmenu] = useState(false);
  const [openMoreSubmenu, setOpenMoreSubmenu] = useState(false);
  const [openCompaniesSubmenu, setOpenCompaniesSubmenu] = useState(false);
  
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showWavoipCall, setShowWavoipCall] = useState(false);

  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);

  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  
  const [managementHover, setManagementHover] = useState(false);
  const [campaignHover, setCampaignHover] = useState(false);
  const [vbzappyHover, setVbzappyHover] = useState(false);
  const [settingsHover, setSettingsHover] = useState(false);
  const [moreHover, setMoreHover] = useState(false);

  const { list } = useHelps();
  const [hasHelps, setHasHelps] = useState(false);

  const [openFlowSubmenu, setOpenFlowSubmenu] = useState(false);
  const [flowHover, setFlowHover] = useState(false);

  const { get: getSetting } = useCompanySettings();
  const [showWallets, setShowWallets] = useState(false);

  const isFlowbuilderRouteActive = location.pathname.startsWith("/phrase-lists") || location.pathname.startsWith("/flowbuilders");

  const handleVBZappyClick = () => {
    history.push("/tickets");
    setOpenVBZappySubmenu((prev) => !prev);
  };

  const handleSettingsClick = () => {
    history.push("/settings");
    setOpenSettingsSubmenu((prev) => !prev);
  };

  useEffect(() => {
    async function checkHelps() {
      try {
        const helps = await list();
        setHasHelps(helps.length > 0);
      } catch (err) {
      }
    }
    checkHelps();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const setting = await getSetting(
          {
            "column": "DirectTicketsToWallets"
          }
        );
        setShowWallets(setting.DirectTicketsToWallets);
      } catch (err) {
        toastError(err);
      }
    }
    fetchSettings();
  }, [setShowWallets]);

  const isManagementActive =
    location.pathname === "/" ||
    location.pathname.startsWith("/reports") ||
    location.pathname.startsWith("/moments");

  const isCampaignRouteActive =
    location.pathname === "/campaigns" ||
    location.pathname.startsWith("/contact-lists") ||
    location.pathname.startsWith("/campaigns-config");

  useEffect(() => {
    if (location.pathname.startsWith("/tickets")) {
      setActiveMenu("/tickets");
    } else {
      setActiveMenu("");
    }
  }, [location, setActiveMenu]);

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      try {
        const companyId = user.companyId;
        if (!companyId) return;
        const planConfigs = await getPlanCompany(undefined, companyId);

        if (!planConfigs || !planConfigs.plan) return;

        setShowCampaigns(planConfigs.plan.useCampaigns);
        setShowKanban(planConfigs.plan.useKanban);
        setShowOpenAi(planConfigs.plan.useOpenAi);
        setShowIntegrations(planConfigs.plan.useIntegrations);
        setShowSchedules(planConfigs.plan.useSchedules);
        setShowInternalChat(planConfigs.plan.useInternalChat);
        setShowExternalApi(planConfigs.plan.useExternalApi);
        setShowWavoipCall(planConfigs.plan.wavoip);
      } catch (err) {
      }
    }
    fetchData();
  }, [user.companyId]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (user.id && socket && typeof socket.on === 'function') {
      const companyId = user.companyId;

      const onCompanyChatMainListItems = (data) => {
        if (data.action === "new-message") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
        if (data.action === "update") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
      };

      const eventName = `company-${companyId}-chat`;
      socket.on(eventName, onCompanyChatMainListItems);

      return () => {
        if (socket && typeof socket.off === 'function') {
          socket.off(eventName, onCompanyChatMainListItems);
        }
      };
    }
  }, [socket, user.id, user.companyId]);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (Array.isArray(whatsApps) && whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div onClick={drawerClose}>
      {section === "main" && (
        <>
          <ListItemLink
            to="/"
            primary={i18n.t("mainDrawer.listItems.start")}
            icon={<HomeOutlinedIcon style={{ fontSize: "1.2rem" }} />}
            tooltip={collapsed}
            collapsed={collapsed}
          />

          <ListItemLink to="/leads-sales" primary="Leads e Vendas" icon={<MonetizationOnOutlinedIcon />} tooltip={collapsed} collapsed={collapsed} />
          <ListItemLink to="/activities" primary="Atividades" icon={<AssignmentOutlinedIcon />} tooltip={collapsed} collapsed={collapsed} />
          <ListItemLink to="/projects" primary="Projetos" icon={<WorkOutlineIcon />} tooltip={collapsed} collapsed={collapsed} />
          {showSchedules && (
            <ListItemLink
              to="/schedules"
              primary={i18n.t("mainDrawer.listItems.schedules")}
              icon={<EventAvailableIcon />}
              tooltip={collapsed}
              collapsed={collapsed}
            />
          )}
          <ListItemLink to="/leads-convertidos" primary="Empresas" icon={<BusinessIcon />} tooltip={collapsed} collapsed={collapsed} />
          {user.showContacts === "enabled" && (
            <ListItemLink
              to="/contacts"
              primary={i18n.t("mainDrawer.listItems.contacts")}
              icon={<ContactPhoneOutlinedIcon />}
              tooltip={collapsed}
              collapsed={collapsed}
            />
          )}

          <ListItem
            button
            onClick={() => setOpenMoreSubmenu((prev) => !prev)}
            onMouseEnter={() => setMoreHover(true)}
            onMouseLeave={() => setMoreHover(false)}
            className={`${classes.listItem} ${classes.moreItem} ${classes.bottomSpacing}`}
          >
            <ListItemIcon style={{ minWidth: 28, marginRight: collapsed ? 0 : 6, justifyContent: 'center' }}>
              <Avatar className={`${classes.iconHoverActive} ${openMoreSubmenu || moreHover ? "active" : ""}`}>
                <MoreHorizIcon />
              </Avatar>
            </ListItemIcon>
            {!collapsed && (
              <ListItemText 
                primary={
                  <Typography className={classes.listItemText} style={{ fontWeight: 400, textAlign: "center", width: "100%" }}>
                    Mais
                  </Typography>
                } 
              />
            )}
            {!collapsed && (openMoreSubmenu ? <ExpandLessIcon className={classes.expandIcon} /> : <ExpandMoreIcon className={classes.expandIcon} />)}
          </ListItem>
          <Collapse in={openMoreSubmenu} timeout="auto" unmountOnExit className={`${classes.submenuContainer} ${classes.moreCollapse}`}>
            <ListItemLink
              to="/inventory"
              primary="Inventário"
              icon={<StoreOutlinedIcon />}
              tooltip={collapsed}
              collapsed={collapsed}
            />
            {/* Relatórios acima da aba Gerência */}
            <ListItemLink
              to="/reports"
              primary={i18n.t("mainDrawer.listItems.reports")}
              icon={<Description />}
              tooltip={collapsed}
              collapsed={collapsed}
            />

            {showInternalChat && (
            <ListItemLink
              to="/chats"
              primary="Chat"
              icon={
                <Badge color="secondary" variant="dot" invisible={invisible}>
                  <ForumOutlinedIcon />
                </Badge>
              }
              tooltip={collapsed}
              collapsed={collapsed}
            />
          )}

            <ListItemLink to="/api" primary="API" icon={<CodeOutlinedIcon />} tooltip={collapsed} collapsed={collapsed} />
            {user.profile === "admin" && (
              <ListItemLink
                to="/users-gratis"
                primary="Cadastros grátis"
                icon={<PeopleIcon />}
                tooltip={collapsed}
                collapsed={collapsed}
              />
            )}

          </Collapse>

          {hasHelps && (
            <ListItemLink
              to="/helps"
              primary={i18n.t("mainDrawer.listItems.helps")}
              icon={<HelpOutlineIcon />}
              tooltip={collapsed}
            />
          )}
          
        </>
      )}

      {section === "bottom" && (
        <>
           <Tooltip title={collapsed ? "Whatsaap" : ""} placement="right">
            <ListItem
                button
                onClick={handleVBZappyClick}
                onMouseEnter={() => setVbzappyHover(true)}
                onMouseLeave={() => setVbzappyHover(false)}
                className={classes.listItem}
            >
                <ListItemIcon style={{ minWidth: 28, marginRight: collapsed ? 0 : 6, justifyContent: 'center' }}>
                    <Avatar className={`${classes.iconHoverActive} ${location.pathname.startsWith("/tickets") || vbzappyHover ? "active" : ""}`}>
                        <WhatsAppIcon />
                    </Avatar>
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText 
                    primary={<Typography className={classes.listItemText}>Whatsaap</Typography>} 
                    style={{ display: collapsed ? 'none' : 'block' }}
                  />
                )}
                {!collapsed && (openVBZappySubmenu ? <ExpandLessIcon className={classes.expandIcon} /> : <ExpandMoreIcon className={classes.expandIcon} />)}
            </ListItem>
           </Tooltip>
          <Collapse in={openVBZappySubmenu} timeout="auto" unmountOnExit className={classes.submenuContainer}>
                <ListItemLink to="/connections" primary={"Conexões"} icon={<SyncAltIcon />} tooltip={collapsed} collapsed={collapsed} />
                <ListItemLink to="/queues" primary={"Filas & Chatbot"} icon={<AccountTreeOutlinedIcon />} tooltip={collapsed} collapsed={collapsed} />
                {showCampaigns && <ListItemLink to="/campaigns" primary="Campanhas" icon={<EventAvailableIcon />} tooltip={collapsed} collapsed={collapsed} />}
                <ListItemLink to="/quick-messages" primary="Respostas Rápidas" icon={<FlashOnIcon />} tooltip={collapsed} collapsed={collapsed} />
                
                <ListItemLink to="/whatsapp-dashboard" primary="Dashboard" icon={<DashboardOutlinedIcon />} tooltip={collapsed} collapsed={collapsed} />
           </Collapse>

           {/* Email abaixo de WhatsApp no mesmo espaço */}
           <ListItemLink
              to="/email"
              primary="Email"
              icon={<EmailOutlinedIcon />}
              tooltip={collapsed}
              bottom
              collapsed={collapsed}
           />

           {(showOpenAi || user.profile !== "user") && (
             <ListItemLink
                to="/prompts"
                primary="Agente IA"
                icon={<OpenAiIcon />}
                tooltip={collapsed}
                bottom
                collapsed={collapsed}
             />
           )}

           {user.showFlow === "enabled" && (
             <Tooltip
                title={collapsed ? "Automações" : ""}
                placement="right"
             >
                <ListItemLink
                    to="/flowbuilders"
                    primary={"Automações"}
                    icon={<AccountTreeOutlinedIcon />}
                    tooltip={collapsed}
                    bottom
                    collapsed={collapsed}
                />
             </Tooltip>
           )}

            <ListItemLink
                to="/settings"
                primary="Configurações"
                icon={<SettingsOutlinedIcon />}
                tooltip={collapsed}
                bottom
                collapsed={collapsed}
            />
        </>
      )}
    </div>
  );
};

export default MainListItems;
