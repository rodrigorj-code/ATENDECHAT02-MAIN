import React, { useContext, useState, useCallback, useEffect, useLayoutEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { DrawerContext } from "../../context/DrawerContext";
import {
  Paper,
  Typography,
  Button,
  InputBase,
  Select,
  MenuItem,
  IconButton,
  Divider,
  Grid,
  Box
} from '@material-ui/core';
import {
  Add as AddIcon,
  Search as SearchIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarIcon,
  Menu as MenuIcon
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => {
  const isDark = theme.palette.type === 'dark';
  const borderSubtle = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb';
  /** Papel do tema (faixas header/filtros); no escuro = #000 no App.js */
  const chromeSurface = theme.palette.background.paper;
  const pageBg = theme.palette.background.default;
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const mutedIcon = isDark ? '#a1a1aa' : '#9CA3AF';
  const tabHoverBg = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
  const tabActiveBg = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)';
  const scrollHoverBg = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)';
  /** Abas: whitelabel "botões secundários" (pageTabsAccent), não os botões principais. */
  const tabBrand =
    theme.pageTabsAccent != null && theme.pageTabsAccent !== ''
      ? theme.pageTabsAccent
      : theme.palette.primary.main;

  return {
    root: {
      minHeight: '100vh',
      backgroundColor: pageBg,
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      backgroundColor: chromeSurface,
      borderBottom: `1px solid ${borderSubtle}`,
      boxShadow: isDark
        ? '0 1px 2px 0 rgba(0, 0, 0, 0.45)'
        : '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    },
    headerContent: {
      padding: theme.spacing(1, 2, 0.5),
    },
    navRow: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
      paddingBottom: theme.spacing(0.5),
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5),
      borderBottom: `1px solid ${borderSubtle}`,
    },
    tabsContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
      overflowX: 'auto',
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': {
        display: 'none',
      },
      scrollBehavior: 'smooth',
      flex: 1,
      whiteSpace: 'nowrap',
      padding: theme.spacing(0.5, 0),
    },
    scrollButton: {
      minWidth: 'auto',
      padding: 6,
      borderRadius: '50%',
      color: textPrimary,
      '&:hover': {
        backgroundColor: scrollHoverBg,
        color: textPrimary,
      },
    },
    navTab: {
      textTransform: 'none',
      fontSize: '0.875rem',
      /* MUI Button usa typography.button (600) */
      '&&': { fontWeight: 400 },
      color: tabBrand,
      minWidth: 'auto',
      padding: theme.spacing(1, 2),
      borderRadius: '8px',
      backgroundColor: 'transparent',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1.5),
      transition: 'all 0.15s ease',
      '&:hover': {
        backgroundColor: tabHoverBg,
        color: tabBrand,
      },
    },
    navTabIcon: {
      fontSize: '0.875rem',
      opacity: 1,
      color: 'inherit',
      display: 'flex',
      alignItems: 'center',
      marginRight: theme.spacing(1.25),
    },
    navTabActive: {
      '&&': { fontWeight: 400 },
      color: tabBrand,
      backgroundColor: tabActiveBg,
      boxShadow: isDark
        ? '0 2px 4px rgba(0, 0, 0, 0.35)'
        : '0 2px 4px rgba(15, 23, 42, 0.16)',
      border: 'none',
      '&:hover': {
        backgroundColor: tabActiveBg,
        color: tabBrand,
      },
    },
    createButton: {
      display: 'none',
    },
    statsContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(3),
    },
    statItem: {
      textAlign: 'center',
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: 700,
    },
    statLabel: {
      fontSize: '0.75rem',
      color: textSecondary,
    },
    filterBar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 24px',
      backgroundColor: chromeSurface,
      height: 48,
      boxSizing: 'border-box',
      width: '100%',
      marginTop: 8,
      borderTop: isDark ? `1px solid ${borderSubtle}` : 'none',
    },
    leftFilter: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flex: 1,
      maxWidth: 400,
    },
    funnelIcon: {
      color: mutedIcon,
      fontSize: 20,
    },
    filterInput: {
      fontSize: '0.875rem',
      color: textPrimary,
      fontWeight: 400,
      width: '100%',
      '& input::placeholder': {
        color: mutedIcon,
        opacity: 1,
      },
    },
    rightFilter: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    },
    filterItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      cursor: 'pointer',
      padding: '2px 6px',
      borderRadius: 6,
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: tabHoverBg,
      },
    },
    filterLabel: {
      fontSize: '0.75rem',
      color: textSecondary,
      fontWeight: 500,
      lineHeight: '20px',
    },
    chevronIcon: {
      color: mutedIcon,
      fontSize: 14,
    },
    calendarIcon: {
      color: mutedIcon,
      fontSize: 14,
      marginRight: 2,
    },
    viewModeGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1.5),
      backgroundColor: chromeSurface,
      padding: theme.spacing(0.5),
      borderRadius: 8,
      border: `1px solid ${borderSubtle}`,
    },
    viewModeButton: {
      textTransform: 'none',
      fontWeight: 500,
      minWidth: 'auto',
      padding: theme.spacing(0.75, 1.25),
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    content: {
      flex: 1,
      padding: theme.spacing(0.5),
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 112px)',
      backgroundColor: pageBg,
    },
    contentEdgeToEdge: {
      flex: 1,
      width: '100%',
      minHeight: 0,
      padding: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
      maxHeight: 'calc(100vh - 112px)',
      backgroundColor: chromeSurface,
      display: 'flex',
      flexDirection: 'column',
    },
    noScroll: {
      overflowY: 'hidden',
      overflowX: 'hidden',
      maxHeight: 'none',
      height: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      '&::-webkit-scrollbar': {
        display: 'none',
      },
      '& *::-webkit-scrollbar': {
        display: 'none',
      },
      '& *': {
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      },
    },
    fab: {
      position: 'fixed',
      bottom: theme.spacing(3),
      right: theme.spacing(3),
      width: 56,
      height: 56,
      borderRadius: '50%',
      backgroundColor: theme.palette.primary.main,
      color: '#fff',
      boxShadow: `0 8px 24px ${theme.palette.primary.main}4D`,
    },
    searchContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
    searchIcon: {
      display: 'flex',
      color: mutedIcon,
      marginRight: theme.spacing(0.5),
    },
    inputRoot: {
      color: textPrimary,
    },
    inputInput: {
      padding: theme.spacing(1, 0),
      fontSize: '0.875rem',
    },
  };
});

const ActivitiesStyleLayout = ({
  title,
  description,
  children,
  onCreateClick,
  createButtonText = "Criar",
  searchPlaceholder = "Buscar...",
  searchValue = "",
  onSearchChange,
  filters = [],
  stats = [],
  viewModes = [],
  currentViewMode,
  onViewModeChange,
  actions,
  navActions,
  showAdvancedFilters = false,
  advancedFiltersComponent,
  disableFilterBar = false,
  hideSearch = false,
  enableTabsScroll = false,
  hideNavDivider = false,
  hideHeaderDivider = false,
  rightFilters,
  hideDefaultRightFilters = false,
  rootBackground,
  compactHeader = false,
  transparentHeader = false,
  scrollContent = true,
  hideLeftIcon = false,
  /** Preenche a área abaixo das abas com fundo papel, sem margem cinza */
  contentEdgeToEdge = false,
  rootClassName = ''
}) => {
  const classes = useStyles();
  const muiTheme = useTheme();
  const contentRef = React.useRef(null);
  const tabsRef = React.useRef(null);
  const context = useContext(DrawerContext);
  const { drawerOpen, setDrawerOpen } = context || {};

  const [tabScrollArrows, setTabScrollArrows] = useState({ left: false, right: false });

  const updateTabScrollArrows = useCallback(() => {
    const el = tabsRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);
    const eps = 2;
    const next = {
      left: scrollLeft > eps,
      right: maxScroll > eps && scrollLeft < maxScroll - eps,
    };
    setTabScrollArrows((prev) =>
      prev.left === next.left && prev.right === next.right ? prev : next
    );
  }, []);

  const tabScrollRafRef = React.useRef(null);
  const scheduleTabScrollUpdate = useCallback(() => {
    if (tabScrollRafRef.current != null) return;
    tabScrollRafRef.current = window.requestAnimationFrame(() => {
      tabScrollRafRef.current = null;
      updateTabScrollArrows();
    });
  }, [updateTabScrollArrows]);

  const handleScroll = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = 300;
      tabsRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
      scheduleTabScrollUpdate();
    }
  };

  useLayoutEffect(() => {
    if (!enableTabsScroll) {
      if (tabScrollRafRef.current != null) {
        window.cancelAnimationFrame(tabScrollRafRef.current);
        tabScrollRafRef.current = null;
      }
      setTabScrollArrows({ left: false, right: false });
      return;
    }
    const el = tabsRef.current;
    if (!el) return;
    scheduleTabScrollUpdate();
    const onScroll = () => scheduleTabScrollUpdate();
    el.addEventListener('scroll', onScroll, { passive: true });
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            /* Deferir evita loop "ResizeObserver loop completed with undelivered notifications" */
            scheduleTabScrollUpdate();
          })
        : null;
    if (ro) ro.observe(el);
    window.addEventListener('resize', scheduleTabScrollUpdate);
    const t = window.setTimeout(scheduleTabScrollUpdate, 150);
    return () => {
      window.clearTimeout(t);
      if (tabScrollRafRef.current != null) {
        window.cancelAnimationFrame(tabScrollRafRef.current);
        tabScrollRafRef.current = null;
      }
      el.removeEventListener('scroll', onScroll);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', scheduleTabScrollUpdate);
    };
  }, [
    enableTabsScroll,
    viewModes.length,
    currentViewMode,
    scheduleTabScrollUpdate,
  ]);

  useEffect(() => {
    if (scrollContent && contentRef.current) {
      contentRef.current.scrollTop = 0;
    } else if (typeof window !== "undefined" && window.scrollTo) {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div
      className={[classes.root, rootClassName].filter(Boolean).join(' ')}
      style={rootBackground ? { backgroundColor: rootBackground } : undefined}
    >
      <div
        className={classes.header}
        style={{
          ...(hideHeaderDivider ? { borderBottom: 'none' } : undefined),
          ...(transparentHeader ? { backgroundColor: 'transparent', boxShadow: 'none', borderBottom: 'none' } : undefined)
        }}
      >
        <div className={classes.headerContent} style={compactHeader ? { padding: 0 } : undefined}>
          {viewModes.length > 0 && (
            <div
              className={classes.navRow}
              style={{
                ...(hideNavDivider ? { borderBottom: 'none' } : undefined),
                ...(compactHeader ? { paddingTop: 4, paddingBottom: 4, paddingLeft: 8, paddingRight: 8 } : undefined)
              }}
            >
              {/* Menu Icon for collapsed state */}
              {!drawerOpen && setDrawerOpen && (
                <IconButton 
                  size="small" 
                  onClick={() => setDrawerOpen(true)}
                  style={{
                    marginRight: 8,
                    color: muiTheme.palette.text.primary,
                    opacity: 1,
                    padding: 2,
                    width: 24,
                    height: 24,
                  }}
                >
                  <MenuIcon style={{ fontSize: 16 }} />
                </IconButton>
              )}

              {enableTabsScroll && tabScrollArrows.left && (
                <IconButton 
                  size="small" 
                  onClick={() => handleScroll('left')} 
                  className={classes.scrollButton}
                  aria-label="Rolar abas para a esquerda"
                >
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
              )}
              
              <div className={classes.tabsContainer} ref={tabsRef}>
                {viewModes.map((mode) => {
                  const active = currentViewMode === mode.value;
                  return (
                    <Button
                      color="inherit"
                      key={mode.value}
                      onClick={() => onViewModeChange && onViewModeChange(mode.value)}
                      className={`${classes.navTab} ${active ? classes.navTabActive : ''}`}
                    >
                      {mode.icon &&
                        React.cloneElement(mode.icon, {
                          className: classes.navTabIcon
                        })}
                      <span>{mode.label}</span>
                    </Button>
                  );
                })}
              </div>

              {enableTabsScroll && tabScrollArrows.right && (
                <IconButton 
                  size="small" 
                  onClick={() => handleScroll('right')} 
                  className={classes.scrollButton}
                  aria-label="Rolar abas para a direita"
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              )}

              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                {disableFilterBar && !hideSearch && (
                   <div className={classes.searchContainer} style={{ width: 'auto', marginRight: 0 }}>
                    <div className={classes.searchIcon}>
                      <SearchIcon fontSize="small" />
                    </div>
                    <InputBase
                      placeholder={searchPlaceholder}
                      classes={{
                        root: classes.inputRoot,
                        input: classes.inputInput,
                      }}
                      value={searchValue}
                      onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                    />
                  </div>
                )}
                {navActions}
              </div>
            </div>
          )}

          {!disableFilterBar && currentViewMode !== "calendar" && (
            <div className={classes.filterBar}>
              {/* Esquerda: Busca */}
              <div className={classes.leftFilter}>
                {!hideLeftIcon && <FilterListIcon className={classes.funnelIcon} />}
                <InputBase
                  placeholder={searchPlaceholder}
                  className={classes.filterInput}
                  value={searchValue}
                  onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                />
              </div>

              {/* Direita: Filtros */}
              <div className={classes.rightFilter}>
                {rightFilters !== undefined && rightFilters !== null
                  ? (typeof rightFilters === "function" ? rightFilters({ classes }) : rightFilters)
                  : (hideDefaultRightFilters ? null : (
                    <>
                      <div className={classes.filterItem}>
                        <Typography className={classes.filterLabel}>Pipeline Ativa</Typography>
                        <ExpandMoreIcon className={classes.chevronIcon} />
                      </div>
                      <div className={classes.filterItem}>
                        <Typography className={classes.filterLabel}>Responsável</Typography>
                        <ExpandMoreIcon className={classes.chevronIcon} />
                      </div>
                      <div className={classes.filterItem}>
                        <Typography className={classes.filterLabel}>Contato/Empr...</Typography>
                        <ExpandMoreIcon className={classes.chevronIcon} />
                      </div>
                      <div className={classes.filterItem}>
                        <CalendarIcon className={classes.calendarIcon} />
                        <Typography className={classes.filterLabel}>Período</Typography>
                      </div>
                      <div className={classes.filterItem}>
                        <Typography className={classes.filterLabel}>Todos</Typography>
                        <ExpandMoreIcon className={classes.chevronIcon} />
                      </div>
                    </>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        ref={contentRef}
        className={
          contentEdgeToEdge
            ? `${classes.contentEdgeToEdge} ${!scrollContent ? classes.noScroll : ''}`
            : `${classes.content} ${!scrollContent ? classes.noScroll : ''}`
        }
        style={
          scrollContent
            ? undefined
            : { overflowY: 'hidden', overflowX: 'hidden', maxHeight: 'none', height: 'auto' }
        }
      >
        {children}
      </div>

      {onCreateClick && (
        <IconButton
          className={classes.fab}
          onClick={onCreateClick}
          aria-label="nova-atividade"
        >
          <AddIcon />
        </IconButton>
      )}
    </div>
  );
};

export default ActivitiesStyleLayout;
