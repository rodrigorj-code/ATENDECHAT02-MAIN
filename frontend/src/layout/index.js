import React, { useState, useContext, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import {
  makeStyles,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  Button,
  MenuItem,
  IconButton,
  Menu,
  useTheme,
  useMediaQuery,
  Avatar,
  Badge,
  withStyles,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItem,
  ListItemAvatar,
  ListItemText,
  FormControlLabel,
  Checkbox,
  InputBase,
  Tabs,
  Tab,
  Paper,
  Tooltip,
} from "@material-ui/core";
import { Link as RouterLink, useHistory } from "react-router-dom";
import { PageTitleContext } from "../context/PageTitleContext";
import { DrawerContext } from "../context/DrawerContext";
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";
import EventIcon from "@material-ui/icons/Event";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import NotificationsIcon from "@material-ui/icons/Notifications";
import api from "../services/api";
import MainListItems from "./MainListItems";
import NotificationsPopOver from "../components/NotificationsPopOver";
import UserModal from "../components/UserModal";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import { i18n } from "../translate/i18n";
import toastError from "../errors/toastError";
import AnnouncementsPopover from "../components/AnnouncementsPopover";
import BirthdayModal from "../components/BirthdayModal";
import logo from "../assets/LOGO VB-PNG.png";
import logoDark from "../assets/LOGO VB PRETO.png";
import ChatPopover from "../pages/Chat/ChatPopover";
import { useDate } from "../hooks/useDate";
import ColorModeContext from "../layout/themeContext";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import { getBackendUrl } from "../config";
import useSettings from "../hooks/useSettings";
import VersionControl from "../components/VersionControl";
import useSocketListener from "../hooks/useSocketListener";
import PublicIcon from "@material-ui/icons/Public";
import { logInfo, logError } from "../utils/logger";

const backendUrl = getBackendUrl();
const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh",
    [theme.breakpoints.down("sm")]: {
      height: "calc(100vh - 56px)",
    },
    backgroundColor: theme.palette.fancyBackground,
    "& .MuiButton-outlinedPrimary": {
      color: theme.palette.primary.main, // Usa cor do tema
      border: `1px solid ${theme.palette.primary.main}40`,
      borderRadius: "8px",
      fontWeight: 600,
      textTransform: "none",
      transition: "all 0.3s ease",
      "&:hover": {
        backgroundColor: `${theme.palette.primary.main}10`,
        borderColor: theme.palette.primary.main,
        transform: "translateY(-1px)",
        boxShadow: `0 4px 12px ${theme.palette.primary.main}30`,
      },
    },
    "& .MuiTab-textColorPrimary.Mui-selected": {
      color: theme.palette.primary.main, // Usa cor do tema
      fontWeight: 700,
    },
  },

  chip: {
    background: "red",
    color: "white",
  },

  avatar: {
    width: "100%",
  },

  toolbar: {
    paddingRight: 24,
    color: theme.palette.dark.main,
    background: theme.palette.primary.main,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    minHeight: "40px", // Reduzido
    "& .MuiIconButton-root": {
      padding: 8,
      margin: "0 4px",
      borderRadius: 8,
      color: "rgba(255, 255, 255, 0.9)",
      transition: "all 0.3s ease",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        transform: "translateY(-1px)",
      }
    },
    "& .MuiSvgIcon-root": {
      fontSize: "1.2rem", // Padronizado
    }
  },

  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    height: "70px", // Reduzido
    minHeight: "70px",
    backgroundColor: theme.palette.background.paper, // Ajusta ao tema
    // borderBottom: `1px solid ${theme.palette.divider}`,
    transition: "all 0.3s ease",
    marginTop: 0,
    marginBottom: 0,
    position: "relative", // Necessário para posicionamento absoluto do botão
  },
  chevronButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 2, // Botão ainda menor
    color: "#000000", // Preto mais vivo
    "& svg": {
      fontSize: "1rem", // Ícone ainda menor
    },
    [theme.breakpoints.down("sm")]: {
      display: "none", // Esconde em mobile
    },
  },

  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    '&:hover': {
      backgroundColor: "rgba(255, 255, 255, 0.25)",
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1), // Reduzido
      width: 'auto',
    },
    flexGrow: 1,
    maxWidth: "300px", // Reduzido proporcionalmente
    height: "30px", // Reduzido altura
    alignItems: "center",
    display: "flex",
  },
  searchIcon: {
    padding: theme.spacing(0, 1), // Reduzido padding
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: "white",
  },
  inputRoot: {
    color: 'inherit',
    width: "100%",
    fontSize: "0.875rem", // Reduzido tamanho do texto
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(2)}px)`, // Ajustado padding
    transition: theme.transitions.create('width'),
    width: '100%',
    color: "white",
    "&::placeholder": {
        color: "rgba(255, 255, 255, 0.8)",
        opacity: 1,
        fontSize: "0.8rem", // Placeholder menor
    }
  },

  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    height: "40px", // Altura fixa
  },

  appBarShift: {
    // marginLeft: drawerWidth, // REMOVIDO PARA OCUPAR LARGURA TOTAL
    // width: `calc(100% - ${drawerWidth}px)`, // REMOVIDO
    width: "100%",
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },

  secondaryNavbar: {
    position: "fixed",
    top: 40,
    right: 0,
    left: theme.spacing(7),
    backgroundColor: theme.mode === "light" ? "#f5f5f5" : "#333",
    // borderBottom: "1px solid rgba(0, 0, 0, 0.12)", // Removed
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin", "left"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.up("sm")]: {
      left: theme.spacing(9),
    },
    [theme.breakpoints.down("sm")]: {
      left: 0,
    },
  },
  secondaryNavbarShift: {
    left: drawerWidth,
    transition: theme.transitions.create(["width", "margin", "left"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },

  menuButtonHidden: {
    display: "none",
  },

  title: {
    fontSize: 12,
    color: "white",
    fontWeight: 600,
    letterSpacing: "0.025em",
    marginLeft: theme.spacing(7),
    transition: theme.transitions.create(["margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(9),
    },
  },

  titleShift: {
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },

  drawerPaper: {
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
    overflowY: "hidden",
    display: "flex",
    flexDirection: "column",
    // Melhorias sutis no drawer
    borderRight: `1px solid ${theme.mode === "light" ? "#e0e0e0" : "#424242"}`,
    boxShadow:
      theme.mode === "light"
        ? "2px 0 8px rgba(0, 0, 0, 0.1)"
        : "2px 0 8px rgba(0, 0, 0, 0.3)",
    top: "40px", // Já está colado na topbar de 40px
    height: "calc(100% - 40px)",
    marginTop: 0, // Garantindo margem 0
    paddingTop: 0, // Garantindo padding 0
  },

  drawerPaperClose: {
    overflowX: "hidden",
    overflowY: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },

  appBarSpacer: {
    minHeight: "40px",
  },

  content: {
    flex: 1,
    overflow: "auto",
    padding: 0,
    margin: 0,
    paddingLeft: 0,
    ...theme.scrollbarStyles,
  },

  container: {
    padding: 0,
    margin: 0,
    maxWidth: "none",
    width: "100%",
  },

  containerWithScroll: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    ...theme.scrollbarStylesSoft,
    borderRadius: "8px",
    border: "2px solid transparent",
  },

  NotificationsPopOver: {
    // Mantém original
  },

  logo: {
    width: "auto",
    height: "auto",
    maxHeight: "90px", // Aumentado um pouco mais
    maxWidth: "100%", // Permite ocupar largura disponível
    objectFit: "contain", // Garante que a imagem caiba sem distorcer
    content: `url(${theme.mode === "light" ? theme.calculatedLogoDark() : theme.calculatedLogoLight()})`,
    transition: "all 0.3s ease",
    cursor: "pointer", // Adicionado cursor pointer
    "&:hover": {
      transform: "scale(1.02)",
    },
  },


  hideLogo: {
    width: "30px", // Reduzido de 35px
    maxWidth: "30px",
    content: `url(${theme.mode === "light" ? theme.calculatedLogoDark() : theme.calculatedLogoLight()})`,
    margin: "0 auto", // Centraliza
  },

  avatar2: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    cursor: "pointer",
    borderRadius: "50%",
    border: "2px solid #ccc",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "scale(1.05)",
      borderColor: theme.palette.primary.main, // Usa cor do tema
    },
  },

  updateDiv: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  // Botões da toolbar melhorados
  toolbarButton: {
    color: "rgba(255, 255, 255, 0.9)",
    borderRadius: "8px",
    padding: "8px",
    margin: "0 2px",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      transform: "translateY(-1px)",
    },
    "&:active": {
      transform: "translateY(0)",
    },
  },

  // Menu hambúrguer com animação sutil
  menuButton: {
    color: "white",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    "& .MuiSvgIcon-root": {
      transition: "transform 0.3s ease",
    },
    "&:hover .MuiSvgIcon-root": {
      transform: "rotate(90deg)",
    },
  },

  // Seletor de idioma melhorado
  languageSelector: {
    position: "relative",
    display: "inline-block",
    "& > button": {
      background: "rgba(255, 255, 255, 0.1)",
      border: "none",
      borderRadius: "8px",
      color: "rgba(255, 255, 255, 0.9)",
      fontSize: "18px",
      padding: "8px 12px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      "&:hover": {
        background: "rgba(255, 255, 255, 0.2)",
        transform: "translateY(-1px)",
      },
    },
    "& > div": {
      position: "absolute",
      top: "45px",
      left: "0",
      background: "#fff",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      borderRadius: "8px",
      padding: "8px",
      zIndex: 1000,
      minWidth: "120px",
      "& button": {
        background: "none",
        border: "none",
        color: "#374151",
        display: "block",
        width: "100%",
        padding: "8px 12px",
        textAlign: "left",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: 500,
        transition: "all 0.2s ease",
        "&:hover": {
          background: `${theme.palette.primary.main}10`, // Usa cor do tema
          color: theme.palette.primary.main, // Usa cor do tema
          transform: "none",
        },
      },
    },
  },

  // Badge animado
  animatedBadge: {
    "& .MuiBadge-badge": {
      animation: "$heartbeat 2s infinite",
    },
  },

  "@keyframes heartbeat": {
    "0%": { transform: "scale(1)" },
    "14%": { transform: "scale(1.1)" },
    "28%": { transform: "scale(1)" },
    "42%": { transform: "scale(1.1)" },
    "70%": { transform: "scale(1)" },
  },
}));

const StyledBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "$ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}))(Badge);

const SmallAvatar = withStyles((theme) => ({
  root: {
    width: 22,
    height: 22,
    border: `2px solid ${theme.palette.background.paper}`,
  },
}))(Avatar);

const LoggedInLayout = ({ children, themeToggle, hideMenu = false }) => {
  const classes = useStyles();
  const { pageTitle } = useContext(PageTitleContext);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleLogout, loading, user, socket } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState("permanent");

  const [showOptions, setShowOptions] = useState(false);
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [ackChecked, setAckChecked] = useState(false);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);

  const theme = useTheme();
  const { colorMode } = useContext(ColorModeContext);
  const greaterThenSm = useMediaQuery(theme.breakpoints.up("sm"));

  const [volume, setVolume] = useState(localStorage.getItem("volume") || 1);
  const history = useHistory();
  const [searchParam, setSearchParam] = useState("");

  const handleSearch = (e) => {
    setSearchParam(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchParam.trim()) {
      const term = searchParam.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      const routes = [
        { name: "inicio", path: "/" },
        { name: "gerencia", path: "/reports" },
        { name: "dashboard", path: "/reports" },
        { name: "relatorios", path: "/reports" },
        { name: "chats em tempo real", path: "/moments" },
        { name: "historico de chamadas", path: "/call-historicals" },
        { name: "contatos", path: "/contacts" },
        { name: "calendario", path: "/schedules" },
        { name: "chat", path: "/chats" },
        { name: "api", path: "/api" },
        { name: "whatsaap", path: "/tickets" },
        { name: "whatsapp", path: "/tickets" },
        { name: "tickets", path: "/tickets" },
        { name: "filas e chatbot", path: "/queues" },
        { name: "filas", path: "/queues" },
        { name: "chatbot", path: "/queues" },
        { name: "config. aniversario", path: "/birthday-settings" },
        { name: "aniversario", path: "/birthday-settings" },
        { name: "respostas rapidas", path: "/quick-messages" },
        { name: "gerenciar conexoes", path: "/connections" },
        { name: "conexoes", path: "/connections" },
        { name: "informativos", path: "/announcements" },
        { name: "kanban", path: "/kanban" },
        { name: "campanhas", path: "/campaigns" },
        { name: "agente ia", path: "/prompts" },
        { name: "automacoes", path: "/flowbuilders" },
        { name: "configuracoes", path: "/settings" },
        { name: "identidade visual", path: "/settings" },
        { name: "empresas", path: "/companies" },
        { name: "usuarios", path: "/users" },
        { name: "integracoes", path: "/integrations" },
        { name: "financeiro", path: "/financeiro" },
        { name: "tags", path: "/tags" },
        { name: "ajuda", path: "/helps" },
      ];

      const found = routes.find(r => r.name.includes(term) || term.includes(r.name));
      
      if (found) {
        history.push(found.path);
        setSearchParam("");
      }
    }
  };

  const { dateToClient } = useDate();
  const [profileUrl, setProfileUrl] = useState(null);
  const [updateInProgress, setUpdateInProgress] = useState(false);


  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mainListItems = useMemo(
    () => <MainListItems drawerOpen={drawerOpen} collapsed={!drawerOpen} />,
    [user, drawerOpen]
  );

  const settings = useSettings();

  const fetchAnnouncements = useCallback(async () => {
      try {
        const { data } = await api.get("/announcements/for-company", {
          params: {
            status: true,
            pageNumber: "1"
          }
        });

        // Filtra apenas os informativos ativos e não expirados
        const activeAnnouncementsRaw = data.records.filter(announcement => {
          const isActive = announcement.status === true || announcement.status === "true";
          const isNotExpired = !announcement.expiresAt || new Date(announcement.expiresAt) > new Date();
          return isActive && isNotExpired;
        });

        // Backend já filtra por empresa excluindo os reconhecidos
        const activeAnnouncements = activeAnnouncementsRaw;
        setAnnouncements(activeAnnouncements);
        setShowAnnouncementsModal(activeAnnouncements.length > 0);
      } catch (err) {
        toastError(err);
      }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchAnnouncements();
    }
  }, [user?.id, fetchAnnouncements]);

  // Atualiza checkbox ao trocar de aviso
  useEffect(() => {
    if (!selectedAnnouncement) {
      setAckChecked(false);
      return;
    }
    // Não precisamos mais ler localStorage; tratamos via backend
    setAckChecked(false);
  }, [selectedAnnouncement, user?.companyId]);

  const handleToggleAcknowledge = async (announcementId, checked) => {
    try {
      if (checked) {
        await api.post(`/announcements/${announcementId}/ack`);
        // Remove este aviso da lista
        setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
        setSelectedAnnouncement(null);
      } else {
        await api.delete(`/announcements/${announcementId}/ack`);
        // Opcional: recarregar lista para reexibir (se desejar permitir desfazer)
        await fetchAnnouncements();
      }
      // Fecha modal se não restarem avisos
      setShowAnnouncementsModal((prev) => {
        return announcements.length - 1 > 0;
      });
    } catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    

    if (document.body.offsetWidth > 600) {
      if (user.defaultMenu === "closed") {
        setDrawerOpen(false);
      } else {
        setDrawerOpen(true);
      }
    }
    if (user.defaultTheme === "dark" && theme.mode === "light") {
      colorMode.toggleColorMode();
    }
  }, [user.defaultMenu, document.body.offsetWidth]);

  useEffect(() => {
    if (document.body.offsetWidth < 600) {
      setDrawerVariant("temporary");
    } else {
      setDrawerVariant("permanent");
    }
  }, [drawerOpen]);

  useEffect(() => {
    const companyId = user?.companyId;

    if (companyId) {
      const buildProfileUrl = () => {
        const savedProfileImage = localStorage.getItem("profileImage");
        const currentProfileImage = savedProfileImage || user.profileImage;

        if (currentProfileImage) {
          return `${backendUrl}/public/company${companyId}/user/${currentProfileImage}`;
        }
        return `${backendUrl}/public/app/noimage.png`;
      };

      setProfileUrl(buildProfileUrl());
    }
  }, [user?.companyId, user?.profileImage, backendUrl]);

  // Callbacks dos eventos
  const handleAuthEvent = useCallback((data) => {
    if (data.user.id === +user?.id) {
      toastError("Sua conta foi acessada em outro computador.");
      setTimeout(() => {
        localStorage.clear();
        window.location.reload();
      }, 1000);
    }
  }, [user?.id]);

  const handleUserUpdate = useCallback((data) => {
    if (data.action === "update" && data.user.id === +user?.id) {
      if (data.user.profileImage) {
        const newProfileUrl = `${backendUrl}/public/company${user?.companyId}/user/${data.user.profileImage}`;
        setProfileUrl(newProfileUrl);
        localStorage.setItem("profileImage", data.user.profileImage);
      }
    }
  }, [user?.companyId, user?.id, backendUrl]);

  // Callbacks para eventos de aniversário
  const handleUserBirthday = useCallback((data) => {
    logInfo("Evento de aniversário de usuário recebido", { data });
    if (data.userId === +user?.id) {
      setShowBirthdayModal(true);
    }
  }, [user?.id]);

  const handleContactBirthday = useCallback((data) => {
    logInfo("Evento de aniversário de contato recebido", { data });
  }, []);

  // Verificar aniversários no login
  const checkBirthdaysOnLogin = useCallback(async () => {
    if (user?.id && user?.companyId) {
      try {
        const { data } = await api.get("/birthdays/today");
        const birthdayData = data.data;

        // Verificar se o usuário atual faz aniversário hoje
        const userBirthday = birthdayData.users.find(u => u.id === +user.id);
        if (userBirthday) {
          logInfo("Usuário faz aniversário hoje; exibindo modal");
          setShowBirthdayModal(true);
        }

        // Se há aniversariantes, mostrar notificação
        if (birthdayData.users.length > 0 || birthdayData.contacts.length > 0) {
          logInfo("Há aniversariantes hoje", { birthdayData });
        }
      } catch (error) {
        logError("Erro ao verificar aniversários", error);
      }
    }
  }, [user?.id, user?.companyId]);

  // Registrar listeners
  useSocketListener(socket, user, 'auth', handleAuthEvent);
  useSocketListener(socket, user, 'user', handleUserUpdate);
  useSocketListener(socket, user, 'user-birthday', handleUserBirthday);
  useSocketListener(socket, user, 'contact-birthday', handleContactBirthday);

  // Verificar aniversários quando o usuário faz login
  useEffect(() => {
    if (user?.id && user?.companyId) {
      // Pequeno delay para garantir que o socket esteja conectado
      const timer = setTimeout(() => {
        checkBirthdaysOnLogin();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user?.id, user?.companyId, checkBirthdaysOnLogin]);

  // Status do usuário
  useEffect(() => {
    if (socket?.emit && user?.companyId) {
      socket.emit("userStatus");

      const interval = setInterval(() => {
        socket?.emit && socket.emit("userStatus");
      }, 1000 * 60 * 5);

      return () => clearInterval(interval);
    }
  }, [socket, user?.companyId]);

  const handleUpdateStart = () => {
    setUpdateInProgress(true);
  };

  const handleUpdateComplete = () => {
    setUpdateInProgress(false);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };

  const handleClickLogout = () => {
    handleCloseMenu();
    handleLogout();
  };

  const drawerClose = () => {
    if (document.body.offsetWidth < 600 || user.defaultMenu === "closed") {
      setDrawerOpen(false);
    }
  };

  const handleRefreshPage = () => {
    window.location.reload(false);
  };

  const handleMenuItemClick = () => {
    const { innerWidth: width } = window;
    if (width <= 600) {
      setDrawerOpen(false);
    }
  };

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
    window.location.reload();
  };

  const LANGUAGE_OPTIONS = [
    { code: "pt-BR", label: "Português" },
    { code: "en", label: "English" },
    { code: "es", label: "Spanish" },
    { code: "ar", label: "عربي" },
  ];

  const [enabledLanguages, setEnabledLanguages] = useState(["pt-BR", "en"]);
  const { getAll } = useSettings();
  useEffect(() => {
    async function fetchSettings() {
      try {
        const settings = await getAll();
        const enabledLanguagesSetting = settings.find(
          (s) => s.key === "enabledLanguages"
        )?.value;
        let langs = ["pt-BR", "en"];
        try {
          if (enabledLanguagesSetting) {
            langs = JSON.parse(enabledLanguagesSetting);
          }
        } catch { }
        console.log(
          "Layout - enabledLanguages carregadas:",
          langs,
          "para companyId:",
          user?.companyId
        );
        setEnabledLanguages(langs);
      } catch (error) {
        console.log("Layout - erro ao carregar enabledLanguages:", error);
      }
    }
    fetchSettings();
  }, [user?.companyId]);

  const filteredLanguageOptions = LANGUAGE_OPTIONS.filter((lang) =>
    enabledLanguages.includes(lang.code)
  );

  if (loading || updateInProgress) {
    return <BackdropLoading />;
  }

  return (
    <DrawerContext.Provider value={{ drawerOpen, setDrawerOpen }}>
      <div className={clsx(classes.root, "logged-in-layout")}>
      {!hideMenu && (
        <Drawer
          variant={drawerVariant}
          className={drawerOpen ? classes.drawerPaper : classes.drawerPaperClose}
          classes={{
            paper: clsx(
              classes.drawerPaper,
              !drawerOpen && classes.drawerPaperClose
            ),
          }}
          open={drawerOpen}
        >
          <div className={classes.toolbarIcon}>
            <img
              src={theme.mode === "light" ? theme.calculatedLogoDark() : theme.calculatedLogoLight()}
              alt="VBSolution"
              className={clsx(classes.logo, !drawerOpen && classes.hideLogo)}
              onClick={() => setDrawerOpen(!drawerOpen)}
            />
            {drawerOpen && (
              <IconButton onClick={() => setDrawerOpen(!drawerOpen)} className={classes.chevronButton}>
                <MenuIcon />
              </IconButton>
            )}
          </div>
          <List className={classes.containerWithScroll}>
            <MainListItems collapsed={!drawerOpen} section="main" />
          </List>
          <Divider />
          <List style={{ marginTop: "auto", flexShrink: 0 }}>
             <MainListItems collapsed={!drawerOpen} section="bottom" />
          </List>
        </Drawer>
      )}

      <AppBar
        position="absolute"
        className={clsx(classes.appBar, !hideMenu && drawerOpen && classes.appBarShift)}
        color="primary"
      >
        <Toolbar variant="dense" className={classes.toolbar}>
          {!hideMenu && (
            <IconButton
              edge="start"
              variant="contained"
              aria-label="open drawer"
              style={{ color: "white" }}
              onClick={() => setDrawerOpen(!drawerOpen)}
              className={clsx(
                // Esconde se a drawer estiver aberta OU se estiver no modo permanente (reduzido)
                (drawerOpen || drawerVariant === "permanent") && classes.menuButtonHidden
              )}
            >
              <MenuIcon />
            </IconButton>
          )}
          {/* Logo removida da AppBar para ficar apenas no Menu Lateral */}
          
          <Typography
            variant="body2"
            color="inherit"
            noWrap
            className={clsx(classes.title, drawerOpen && classes.titleShift)}
          >
             {/* Boas vindas removido da topbar */}
          </Typography>

          <div style={{ flexGrow: 1 }} />
          <Tooltip title="Calendário">
            <IconButton
              component={Link}
              to="/schedules"
              style={{ color: "white" }}
            >
              <EventIcon />
            </IconButton>
          </Tooltip>

          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="Pesquisar..."
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
              value={searchParam}
              onChange={handleSearch}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          <div style={{ flexGrow: 1 }} />

          {!hideMenu && (
            <>
              <VersionControl
                onUpdateStart={handleUpdateStart}
                onUpdateComplete={handleUpdateComplete}
              />

              <div
                style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
                className="language-dropdown"
              >
                <IconButton
                  onClick={() => setShowOptions(!showOptions)}
                >
                  <PublicIcon />
                </IconButton>

                {showOptions && (
                  <div
                    style={{
                      position: "absolute",
                      top: "32px",
                      left: "0",
                      background: "#fff",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                      borderRadius: "8px",
                      padding: "8px",
                      zIndex: 1000,
                      minWidth: "120px",
                      maxWidth: "200px",
                    }}
                  >
                    {filteredLanguageOptions.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "block",
                          width: "100%",
                          padding: "4px",
                        }}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <IconButton edge="start" onClick={colorMode.toggleColorMode}>
                {theme.mode === "dark" ? (
                  <Brightness7Icon />
                ) : (
                  <Brightness4Icon />
                )}
              </IconButton>

              



              {/* <DarkMode themeToggle={themeToggle} /> */}

              {user.id && <NotificationsPopOver volume={volume} />}

              <AnnouncementsPopover />

              <ChatPopover />



              <div className="user-menu-wrapper" style={{ marginLeft: 8 }}>
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  variant="dot"
                  onClick={handleMenu}
                >
                  <Avatar
                    alt="VBSolution"
                    className={classes.avatar2}
                    src={profileUrl}
                  />
                </StyledBadge>

                <UserModal
                  open={userModalOpen}
                  onClose={() => setUserModalOpen(false)}
                  onImageUpdate={(newProfileUrl) => setProfileUrl(newProfileUrl)}
                  userId={user?.id}
                />

                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  getContentAnchorEl={null}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={menuOpen}
                  onClose={handleCloseMenu}
                  PaperProps={{
                    style: {
                      minWidth: "150px",
                      maxWidth: "200px",
                      width: "auto",
                    },
                  }}
                >
                  <MenuItem onClick={handleOpenUserModal}>
                    {i18n.t("mainDrawer.appBar.user.profile")}
                  </MenuItem>
                  <MenuItem onClick={handleClickLogout}>
                    {i18n.t("mainDrawer.appBar.user.logout")}
                  </MenuItem>
                </Menu>
              </div>
            </>
          )}
        </Toolbar>
      </AppBar>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        {children ? children : null}
      </main>

      {/* Modal de Informativos */}
      <Dialog
        open={showAnnouncementsModal}
        onClose={() => setShowAnnouncementsModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Informativos</DialogTitle>
        <DialogContent dividers>
          {selectedAnnouncement ? (
            <div>
              <Typography variant="h6" gutterBottom>
                {selectedAnnouncement.title}
              </Typography>
              <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                {selectedAnnouncement.text}
              </Typography>
              <FormControlLabel
                style={{ marginTop: 12 }}
                control={
                  <Checkbox
                    color="primary"
                    checked={ackChecked}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setAckChecked(checked);
                      handleToggleAcknowledge(selectedAnnouncement.id, checked);
                    }}
                  />
                }
                label="Estou ciente e não mostrar novamente"
              />
              {selectedAnnouncement.mediaPath && (
                <div style={{ marginTop: 16 }}>
                  <img
                    src={`${backendUrl}/public/company${user.companyId}${selectedAnnouncement.mediaPath}`}
                    alt="Anexo"
                    style={{ maxWidth: '100%' }}
                  />
                </div>
              )}
              <Button
                onClick={() => setSelectedAnnouncement(null)}
                style={{ marginTop: 16 }}
                variant="outlined"
              >
                Voltar para lista
              </Button>
            </div>
          ) : (
            <List>
              {announcements.map((announcement) => (
                <ListItem
                  button
                  key={announcement.id}
                  onClick={() => setSelectedAnnouncement(announcement)}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <NotificationsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={announcement.title}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="textPrimary"
                        >
                          Prioridade: {announcement.priority === 1 ? 'Alta' : announcement.priority === 2 ? 'Média' : 'Baixa'}
                        </Typography>
                        {` — ${new Date(announcement.createdAt).toLocaleDateString()}`}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowAnnouncementsModal(false)}
            color="primary"
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Aniversário */}
      <BirthdayModal
        open={showBirthdayModal}
        onClose={() => setShowBirthdayModal(false)}
        user={user}
      />

    </div>
    </DrawerContext.Provider>
  );
};

export default LoggedInLayout;
