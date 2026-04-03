import React, { useState, useEffect, useMemo } from "react";
import api from "./services/api";
import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { ptBR } from "@material-ui/core/locale";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { useMediaQuery } from "@material-ui/core";
import ColorModeContext from "./layout/themeContext";
import { ActiveMenuProvider } from "./context/ActiveMenuContext";
import { PageTitleProvider } from "./context/PageTitleContext";
import Favicon from "react-favicon";
import { getBackendUrl } from "./config";
import Routes from "./routes";
import defaultLogoLight from "./assets/LOGO VB PRETO.png";
import defaultLogoDark from "./assets/LOGO VB-PNG.png";
import defaultLogoFavicon from "./assets/favicon.ico";
import useSettings from "./hooks/useSettings";
import {
  getContrastTextForBackground,
  getSidebarContrast,
  logosLookSameUrl,
} from "./utils/colorContrast";

import "./styles/animations.css";

const queryClient = new QueryClient();

const isValidHex = (color) => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$/.test(color);
};

/** Fundos neutros (sem tom marrom); primária continua vinda do whitelabel */
const LIGHT_BG_DEFAULT = "#f5f5f5";
const LIGHT_BG_PAPER = "#ffffff";
/** Preto neutro (alinhado à Identidade Visual / Opções em modo escuro) */
const DARK_BG_DEFAULT = "#000000";
const DARK_BG_PAPER = "#000000";
const DARK_BG_ELEVATED = "#0a0a0a";

const App = () => {
  const [locale, setLocale] = useState();
  
  const getSafeColor = (color) => {
    if (color && isValidHex(color)) return color;
    return "#131B2D";
  };

  const appColorLocalStorage = getSafeColor(
    localStorage.getItem("primaryColorLight") ||
    localStorage.getItem("primaryColorDark")
  );
  const btnLightStored = localStorage.getItem("buttonPrimaryColorLight");
  const btnDarkStored = localStorage.getItem("buttonPrimaryColorDark");
  const btnSecLightStored = localStorage.getItem("buttonSecondaryColorLight");
  const btnSecDarkStored = localStorage.getItem("buttonSecondaryColorDark");
  const appNameLocalStorage = localStorage.getItem("appName") || "";
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const preferredTheme = window.localStorage.getItem("preferredTheme");
  const [mode, setMode] = useState(
    preferredTheme ? preferredTheme : prefersDarkMode ? "dark" : "light"
  );
  const [primaryColorLight, setPrimaryColorLight] =
    useState(appColorLocalStorage);
  const [primaryColorDark, setPrimaryColorDark] =
    useState(appColorLocalStorage);
  const [buttonPrimaryColorLight, setButtonPrimaryColorLight] = useState(
    btnLightStored && isValidHex(btnLightStored) ? btnLightStored : ""
  );
  const [buttonPrimaryColorDark, setButtonPrimaryColorDark] = useState(
    btnDarkStored && isValidHex(btnDarkStored) ? btnDarkStored : ""
  );
  const [buttonSecondaryColorLight, setButtonSecondaryColorLight] = useState(
    btnSecLightStored && isValidHex(btnSecLightStored) ? btnSecLightStored : ""
  );
  const [buttonSecondaryColorDark, setButtonSecondaryColorDark] = useState(
    btnSecDarkStored && isValidHex(btnSecDarkStored) ? btnSecDarkStored : ""
  );
  const [topbarColorLight, setTopbarColorLight] = useState(
    () => localStorage.getItem("topbarColorLight") || ""
  );
  const [topbarColorDark, setTopbarColorDark] = useState(
    () => localStorage.getItem("topbarColorDark") || ""
  );
  const [sidebarColorLight, setSidebarColorLight] = useState(
    () => localStorage.getItem("sidebarColorLight") || ""
  );
  const [sidebarColorDark, setSidebarColorDark] = useState(
    () => localStorage.getItem("sidebarColorDark") || ""
  );
  const [appLogoLight, setAppLogoLight] = useState(defaultLogoLight);
  const [appLogoDark, setAppLogoDark] = useState(defaultLogoDark);
  const [appLogoFavicon, setAppLogoFavicon] = useState(defaultLogoFavicon);
  const [appLogoTickets, setAppLogoTickets] = useState("");
  const [appName, setAppName] = useState(appNameLocalStorage);
  const { getPublicSetting } = useSettings();

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light";
          window.localStorage.setItem("preferredTheme", newMode); // Persistindo o tema no localStorage
          return newMode;
        });
      },
      setPrimaryColorLight,
      setPrimaryColorDark,
      setButtonPrimaryColorLight,
      setButtonPrimaryColorDark,
      setButtonSecondaryColorLight,
      setButtonSecondaryColorDark,
      setTopbarColorLight,
      setTopbarColorDark,
      setSidebarColorLight,
      setSidebarColorDark,
      setAppLogoLight,
      setAppLogoDark,
      setAppLogoFavicon,
      setAppLogoTickets,
      setAppName,
      appLogoLight,
      appLogoDark,
      appLogoFavicon,
      appLogoTickets,
      appName,
      mode,
    }),
    [appLogoLight, appLogoDark, appLogoFavicon, appLogoTickets, appName, mode]
  );

  const theme = useMemo(() => {
    const brandLight = getSafeColor(primaryColorLight);
    const brandDark = getSafeColor(primaryColorDark);
    const btnMainLight =
      buttonPrimaryColorLight && isValidHex(buttonPrimaryColorLight)
        ? getSafeColor(buttonPrimaryColorLight)
        : brandLight;
    const btnMainDark =
      buttonPrimaryColorDark && isValidHex(buttonPrimaryColorDark)
        ? getSafeColor(buttonPrimaryColorDark)
        : brandDark;

    /** Topbar sem cor explícita segue a identidade (marca), não os botões principais. */
    const topbarLightEff =
      topbarColorLight && isValidHex(topbarColorLight)
        ? getSafeColor(topbarColorLight)
        : brandLight;
    const topbarDarkEff =
      topbarColorDark && isValidHex(topbarColorDark)
        ? getSafeColor(topbarColorDark)
        : brandDark;

    /** Topbar (pesquisa, ícones): só contraste sobre a cor da topbar — não usa botões principais/secundários. */
    const navbarAccentLight = getContrastTextForBackground(topbarLightEff);
    const navbarAccentDark = getContrastTextForBackground(topbarDarkEff);
    const navbarAccent =
      mode === "light" ? navbarAccentLight : navbarAccentDark;

    /** Abas tipo Settings/Atividades (ActivitiesStyleLayout): só "botões secundários" ou identidade. */
    const pageTabsLight =
      buttonSecondaryColorLight && isValidHex(buttonSecondaryColorLight)
        ? getSafeColor(buttonSecondaryColorLight)
        : brandLight;
    const pageTabsDark =
      buttonSecondaryColorDark && isValidHex(buttonSecondaryColorDark)
        ? getSafeColor(buttonSecondaryColorDark)
        : brandDark;
    const pageTabsAccent = mode === "light" ? pageTabsLight : pageTabsDark;
    const sidebarLightEff =
      sidebarColorLight && isValidHex(sidebarColorLight)
        ? getSafeColor(sidebarColorLight)
        : LIGHT_BG_PAPER;
    const sidebarDarkEff =
      sidebarColorDark && isValidHex(sidebarColorDark)
        ? getSafeColor(sidebarColorDark)
        : DARK_BG_PAPER;

    const currentSidebarBg =
      mode === "light" ? sidebarLightEff : sidebarDarkEff;
    const sidebarCx = getSidebarContrast(currentSidebarBg);

    return createTheme(
        {
          // Scrollbar styles melhorados mas usando cores do tema
          scrollbarStyles: {
            "&::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
              backgroundColor:
                mode === "light" ? getSafeColor(primaryColorLight) : getSafeColor(primaryColorDark), // Usa cores do tema
              borderRadius: "4px", // Bordas arredondadas
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor:
                mode === "light" ? LIGHT_BG_DEFAULT : DARK_BG_ELEVATED,
              borderRadius: "4px",
            },
          },

          scrollbarStylesSoft: {
            // Firefox/Edge general properties
            scrollbarWidth: "thin",
            scrollbarColor: `${mode === "light" ? "#BDBDBD" : "#505050"} transparent`,
            "&::-webkit-scrollbar": {
              width: "6px",
              height: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: mode === "light" ? "#E0E0E0" : "#404040",
              borderRadius: "3px",
              "&:hover": {
                backgroundColor: mode === "light" ? "#BDBDBD" : "#5a5a5a",
              }
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
          },

          palette: {
            type: mode,
            background:
              mode === "light"
                ? { default: LIGHT_BG_DEFAULT, paper: LIGHT_BG_PAPER }
                : { default: DARK_BG_DEFAULT, paper: DARK_BG_PAPER },
            text:
              mode === "light"
                ? {
                    primary: "rgba(0, 0, 0, 0.87)",
                    secondary: "rgba(0, 0, 0, 0.6)",
                    disabled: "rgba(0, 0, 0, 0.38)",
                  }
                : {
                    primary: "#f4f4f5",
                    secondary: "#a1a1aa",
                    disabled: "rgba(244, 244, 245, 0.38)",
                  },
            divider:
              mode === "light" ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.08)",
            primary: {
              main: mode === "light" ? btnMainLight : btnMainDark,
              light: mode === "light"
                ? `${btnMainLight}80`
                : `${btnMainDark}80`,
              dark: mode === "light"
                ? `${btnMainLight}CC`
                : `${btnMainDark}CC`,
              contrastText: "#ffffff",
            },
            textPrimary:
              mode === "light" ? getSafeColor(primaryColorLight) : getSafeColor(primaryColorDark),
            borderPrimary:
              mode === "light" ? getSafeColor(primaryColorLight) : getSafeColor(primaryColorDark),
            dark: { main: mode === "light" ? "#333333" : "#F3F3F3" },
            light: { main: mode === "light" ? "#F3F3F3" : "#333333" },
            fontColor: mode === "light" ? getSafeColor(primaryColorLight) : getSafeColor(primaryColorDark),
            tabHeaderBackground:
              mode === "light" ? "#EEE" : DARK_BG_DEFAULT,
            optionsBackground:
              mode === "light" ? "#fafafa" : DARK_BG_PAPER,
            fancyBackground:
              mode === "light" ? "#fafafa" : DARK_BG_DEFAULT,
            total: mode === "light" ? "#fff" : DARK_BG_DEFAULT,
            messageIcons: mode === "light" ? "grey" : "#F3F3F3",
            inputBackground:
              mode === "light" ? "#FFFFFF" : DARK_BG_ELEVATED,
            barraSuperior:
              mode === "light" ? topbarLightEff : topbarDarkEff,
            sidebarMenuBackground:
              mode === "light" ? sidebarLightEff : sidebarDarkEff,
            /** Menu lateral: textos/ícones seguem botões principais em fundo claro; fundo escuro = branco. */
            sidebarMenuTextPrimary: sidebarCx.isDark
              ? sidebarCx.textPrimary
              : mode === "light"
                ? btnMainLight
                : btnMainDark,
            sidebarMenuTextSecondary: sidebarCx.isDark
              ? sidebarCx.textSecondary
              : mode === "light"
                ? "rgba(0, 0, 0, 0.65)"
                : "rgba(255, 255, 255, 0.72)",
            sidebarMenuIcon: sidebarCx.isDark
              ? sidebarCx.icon
              : mode === "light"
                ? btnMainLight
                : btnMainDark,
            sidebarMenuItemHoverBg: sidebarCx.hoverBg,
            sidebarMenuItemActiveBg: sidebarCx.activeBg,
            sidebarMenuHoverAccent:
              sidebarCx.isDark
                ? "#ffffff"
                : mode === "light"
                  ? btnMainLight
                  : btnMainDark,
            /** Menu lateral com fundo escuro (cor custom) → logo branca */
            sidebarMenuIsDarkLogo: sidebarCx.isDark,
          },

          typography: {
            fontFamily: [
              '"Helvetica Neue"',
              'Helvetica',
              'Arial',
              'sans-serif',
            ].join(','),
            h1: {
              fontWeight: 700,
              letterSpacing: '-0.025em',
            },
            h2: {
              fontWeight: 700,
              letterSpacing: '-0.025em',
            },
            h3: {
              fontWeight: 600,
              letterSpacing: '-0.025em',
            },
            h4: {
              fontWeight: 600,
              letterSpacing: '-0.025em',
            },
            h5: {
              fontWeight: 600,
              letterSpacing: '-0.025em',
            },
            h6: {
              fontWeight: 400,
              letterSpacing: '-0.025em',
            },
            button: {
              fontWeight: 600,
              textTransform: 'none',
              letterSpacing: '0.025em',
            },
          },

          shape: {
            borderRadius: 8, // Bordas arredondadas mas não excessivas
          },
          overrides: {
            MuiCssBaseline: {
              "@global": {
                body: {
                  backgroundColor:
                    mode === "light" ? LIGHT_BG_DEFAULT : DARK_BG_DEFAULT,
                  overflowX: "hidden",
                  overflowY: "hidden", // Hide native scrollbar
                  fontFamily: [
                    '"Helvetica Neue"',
                    'Helvetica',
                    'Arial',
                    'sans-serif',
                  ].join(','),
                },
                // Labels e bordas em Modais (Drawer/Dialog)
                ".MuiDrawer-paper .MuiFormLabel-root, .MuiDialog-paper .MuiFormLabel-root, .MuiDrawer-paper .MuiInputLabel-root, .MuiDialog-paper .MuiInputLabel-root": {
                  color: mode === "light" ? "#000" : "#e4e4e7",
                  fontWeight: 400,
                  textTransform: "none",
                  fontSize: "13px"
                },
                ".MuiDrawer-paper .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline, .MuiDialog-paper .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                  borderColor:
                    mode === "light" ? "#E5E7EB" : "rgba(255, 255, 255, 0.12)",
                  borderWidth: "1px"
                },
                ".MuiDrawer-paper .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline, .MuiDialog-paper .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor:
                    mode === "light" ? "#E5E7EB" : "rgba(255, 255, 255, 0.2)",
                  borderWidth: "1px"
                },
                ".MuiDrawer-paper .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline, .MuiDialog-paper .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor:
                    mode === "light" ? "#E5E7EB" : "rgba(255, 255, 255, 0.16)"
                }
              },
            },
            // Botões usando cor do tema
            MuiButton: {
              root: {
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 600,
                letterSpacing: '0.025em',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                }
              },
              contained: {
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                }
              }
            },
          
            // ✅ VOLTAR: Papers com largura total
            MuiPaper: {
              root: {
                backgroundImage: 'none',
                marginLeft: 0,
                marginRight: 0,
                width: '100%',
              },
              rounded: {
                borderRadius: 12,
              },
              elevation1: {
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              },
              elevation2: {
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
              },
              elevation3: {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }
            },

            // ⭐ ADICIONAR: Proteção específica para menus
            MuiMenu: {
              paper: {
                width: 'auto !important',
                maxWidth: '300px !important',
                minWidth: '180px !important',
              }
            },

            // ⭐ ADICIONAR: Proteção específica para popovers
            MuiPopover: {
              paper: {
                width: 'auto !important',
                maxWidth: '300px !important',
                minWidth: 'auto !important',
              }
            },

            // Inputs melhorados
            MuiOutlinedInput: {
              root: {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor:
                    mode === "light" ? "#E5E7EB" : "rgba(255, 255, 255, 0.12)",
                  borderWidth: 1,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor:
                    mode === "light" ? "#E5E7EB" : "rgba(255, 255, 255, 0.22)",
                  borderWidth: 1,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor:
                    mode === "light" ? "#E5E7EB" : "rgba(255, 255, 255, 0.18)",
                },
                outline: 'none',
              },
            },
            MuiTextField: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 8,
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: mode === "light" ? "#ccc" : "#555",
                    }
                  },
                  '&.Mui-focused': {
                    outline: 'none',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor:
                        mode === "light" ? "#E5E7EB" : "rgba(255, 255, 255, 0.22)",
                      borderWidth: 1,
                    }
                  }
                }
              }
            },

            // Tabs usando cor do tema
            MuiTab: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                letterSpacing: '0.025em',
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: mode === "light"
                    ? `${primaryColorLight}08`
                    : `${primaryColorDark}08`,
                },
                '&.Mui-selected': {
                  color: mode === "light" ? primaryColorLight : primaryColorDark,
                }
              }
            },

            // Drawer sem bordas
            MuiDrawer: {
              paper: {
                border: 'none',
                backgroundColor:
                  mode === "light" ? sidebarLightEff : sidebarDarkEff,
              }
            },

            // AppBar transparente
            MuiAppBar: {
              root: {
                boxShadow: 'none',
              }
            }
          },

          mode,
          /** Ícones da topbar do sistema: só contraste com a cor da topbar. */
          navbarAccent,
          /** Cor das abas (nav tabs) em ActivitiesStyleLayout — whitelabel "botões secundários". */
          pageTabsAccent,
          appLogoLight,
          appLogoDark,
          appLogoFavicon,
          appLogoTickets,
          appName,
          /**
           * Logo para fundo escuro (sidebar/tema escuro): appLogoDark ou PNG branca padrão.
           * Se claro e escuro apontam para o mesmo arquivo, não reutilizar — usa o bundle branco.
           */
          calculatedLogoDark: () =>
            logosLookSameUrl(appLogoDark, appLogoLight)
              ? defaultLogoDark
              : appLogoDark,
          /** Logo para fundo claro: só appLogoLight ou default preta */
          calculatedLogoLight: () => appLogoLight,
        },
        locale
      );
  }, [
      appLogoLight,
      appLogoDark,
      appLogoFavicon,
      appLogoTickets,
      appName,
      locale,
      mode,
      primaryColorDark,
      primaryColorLight,
      buttonPrimaryColorLight,
      buttonPrimaryColorDark,
      buttonSecondaryColorLight,
      buttonSecondaryColorDark,
      topbarColorLight,
      topbarColorDark,
      sidebarColorLight,
      sidebarColorDark,
    ]
  );

  useEffect(() => {
    window.localStorage.setItem("preferredTheme", mode);
  }, [mode]);

  useEffect(() => {
    getPublicSetting("primaryColorLight")
      .then((color) => {
        setPrimaryColorLight(color || "#131B2D");
      })
      .catch((error) => {
        console.log("Error reading setting", error);
      });
    getPublicSetting("primaryColorDark")
      .then((color) => {
        setPrimaryColorDark(color || "#131B2D");
      })
      .catch((error) => {
        console.log("Error reading setting", error);
      });
    getPublicSetting("buttonPrimaryColorLight")
      .then((color) => {
        setButtonPrimaryColorLight(
          color && isValidHex(color) ? color : ""
        );
      })
      .catch(() => {
        setButtonPrimaryColorLight("");
      });
    getPublicSetting("buttonPrimaryColorDark")
      .then((color) => {
        setButtonPrimaryColorDark(
          color && isValidHex(color) ? color : ""
        );
      })
      .catch(() => {
        setButtonPrimaryColorDark("");
      });
    getPublicSetting("buttonSecondaryColorLight")
      .then((color) => {
        setButtonSecondaryColorLight(
          color && isValidHex(color) ? color : ""
        );
      })
      .catch(() => setButtonSecondaryColorLight(""));
    getPublicSetting("buttonSecondaryColorDark")
      .then((color) => {
        setButtonSecondaryColorDark(
          color && isValidHex(color) ? color : ""
        );
      })
      .catch(() => setButtonSecondaryColorDark(""));
    getPublicSetting("topbarColorLight")
      .then((color) => {
        setTopbarColorLight(color && isValidHex(color) ? color : "");
      })
      .catch(() => setTopbarColorLight(""));
    getPublicSetting("topbarColorDark")
      .then((color) => {
        setTopbarColorDark(color && isValidHex(color) ? color : "");
      })
      .catch(() => setTopbarColorDark(""));
    getPublicSetting("sidebarColorLight")
      .then((color) => {
        setSidebarColorLight(color && isValidHex(color) ? color : "");
      })
      .catch(() => setSidebarColorLight(""));
    getPublicSetting("sidebarColorDark")
      .then((color) => {
        setSidebarColorDark(color && isValidHex(color) ? color : "");
      })
      .catch(() => setSidebarColorDark(""));
    getPublicSetting("appLogoLight")
      .then((file) => {
        setAppLogoLight(
          file ? getBackendUrl() + "/public/" + file : defaultLogoLight
        );
      })
      .catch((error) => {
        console.log("Error reading setting", error);
      });
    getPublicSetting("appLogoDark")
      .then((file) => {
        setAppLogoDark(
          file ? getBackendUrl() + "/public/" + file : defaultLogoDark
        );
      })
      .catch((error) => {
        console.log("Error reading setting", error);
      });
    getPublicSetting("appLogoFavicon")
      .then((file) => {
        setAppLogoFavicon(
          file ? getBackendUrl() + "/public/" + file : defaultLogoFavicon
        );
      })
      .catch((error) => {
        console.log("Error reading setting", error);
      });
    getPublicSetting("appLogoTickets")
      .then((file) => {
        setAppLogoTickets(file ? getBackendUrl() + "/public/" + file : "");
      })
      .catch((error) => {
        console.log("Error reading setting", error);
      });
    getPublicSetting("appName")
      .then((name) => {
        // Força VBSolution independentemente do que vier do backend
        setAppName("VBSolution");
      })
      .catch((error) => {
        console.log("Error reading setting", error);
        setAppName("VBSolution");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const brandLight = getSafeColor(primaryColorLight);
    const brandDark = getSafeColor(primaryColorDark);
    const btn =
      mode === "light"
        ? buttonPrimaryColorLight && isValidHex(buttonPrimaryColorLight)
          ? getSafeColor(buttonPrimaryColorLight)
          : brandLight
        : buttonPrimaryColorDark && isValidHex(buttonPrimaryColorDark)
          ? getSafeColor(buttonPrimaryColorDark)
          : brandDark;
    root.style.setProperty(
      "--primaryColor",
      mode === "light" ? primaryColorLight : primaryColorDark
    );
    root.style.setProperty("--buttonPrimaryColor", btn);
    root.style.colorScheme = mode === "dark" ? "dark" : "light";
  }, [
    primaryColorLight,
    primaryColorDark,
    buttonPrimaryColorLight,
    buttonPrimaryColorDark,
    topbarColorLight,
    topbarColorDark,
    sidebarColorLight,
    sidebarColorDark,
    mode,
  ]);

  useEffect(() => {
    async function fetchVersionData() {
      try {
        const response = await api.get("/version");
        const { data } = response;
        window.localStorage.setItem("frontendVersion", data.version);
      } catch (error) {
        console.log("Error fetching data", error);
      }
    }
    fetchVersionData();
  }, []);

  return (
    <>
      <Favicon
        url={
          appLogoFavicon
            ? appLogoFavicon
            : defaultLogoFavicon
        }
      />
      <ColorModeContext.Provider value={{ colorMode }}>
        <ThemeProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <ActiveMenuProvider>
              <PageTitleProvider>
                <Routes />
              </PageTitleProvider>
            </ActiveMenuProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </>
  );
};

export default App;
