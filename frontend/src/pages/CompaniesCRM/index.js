import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import {
  Dashboard as DashboardIcon,
  List as ListIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
} from "@material-ui/icons";
import KanbanIcon from "@mui/icons-material/ViewKanban";

import MainContainer from "../../components/MainContainer";
import InternalNavbar from "../../components/InternalNavbar";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { Button, CircularProgress, Chip, Avatar } from "@material-ui/core";
import api from "../../services/api";
import { toast } from "react-toastify";
import useCompanies from "../../hooks/useCompanies";

// Placeholders for views
import { Grid, Paper, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";

const CompaniesBoard = ({ data, loading }) => {
  if (loading) return <CircularProgress />;
  
  return (
    <Grid container spacing={2} style={{ height: '100%', overflowX: 'auto', flexWrap: 'nowrap' }}>
      {['Prospect', 'Cliente', 'Parceiro'].map((status) => (
        <Grid item xs={12} sm={6} md={4} key={status} style={{ minWidth: 300 }}>
          <Paper style={{ height: '100%', padding: 16, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom style={{ color: '#333' }}>
              {status}
            </Typography>
            {data && data.length > 0 ? (
                data.filter(item => item.status === status || (!item.status && status === 'Prospect')).map(item => (
                    <Card key={item.id} style={{ marginBottom: 8 }}>
                        <CardContent>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                             <Avatar style={{ marginRight: 10, width: 30, height: 30 }}>{item.name ? item.name[0] : '?'}</Avatar>
                             <Typography variant="subtitle1">{item.name || "Sem nome"}</Typography>
                        </div>
                        <Typography variant="body2" color="textSecondary">{item.email || "Sem email"}</Typography>
                        <Typography variant="caption" display="block">{item.phone || "Sem telefone"}</Typography>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div style={{ padding: 10, textAlign: "center", color: "#999" }}>
                    Vazio
                </div>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

const CompaniesList = ({ data, loading }) => {
    if (loading) return <CircularProgress />;
    
    return (
        <TableContainer component={Paper}>
            <Table>
            <TableHead>
                <TableRow>
                <TableCell>Empresa</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Status</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {data && data.length > 0 ? (
                    data.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar style={{ marginRight: 10, width: 30, height: 30 }}>{item.name ? item.name[0] : '?'}</Avatar>
                                    {item.name}
                                </div>
                            </TableCell>
                            <TableCell>{item.email}</TableCell>
                            <TableCell>{item.phone}</TableCell>
                            <TableCell>
                                <Chip label={item.status || "Prospect"} color="primary" size="small" />
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} align="center">Nenhuma empresa encontrada</TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </TableContainer>
    );
};

const CompaniesCalendar = ({ data }) => (
  <Paper style={{ padding: 16, height: '100%' }}>
    <Typography variant="h6">Agendamentos com Empresas</Typography>
    <div style={{ marginTop: 20, textAlign: 'center', color: '#666' }}>
      Componente de calendário será integrado aqui.
      {data && data.length > 0 && <div>{data.length} empresas listadas.</div>}
    </div>
  </Paper>
);

const CompaniesDashboard = ({ count }) => (
  <Grid container spacing={3}>
    <Grid item xs={12} sm={4}>
      <Paper style={{ padding: 16, textAlign: 'center' }}>
        <Typography variant="h4" color="primary">{count || 0}</Typography>
        <Typography variant="subtitle1">Total de Empresas</Typography>
      </Paper>
    </Grid>
    <Grid item xs={12} sm={4}>
      <Paper style={{ padding: 16, textAlign: 'center' }}>
        <Typography variant="h4" style={{ color: '#f50057' }}>0</Typography>
        <Typography variant="subtitle1">Novos Leads (Mês)</Typography>
      </Paper>
    </Grid>
    <Grid item xs={12} sm={4}>
      <Paper style={{ padding: 16, textAlign: 'center' }}>
        <Typography variant="h4" style={{ color: '#4caf50' }}>0</Typography>
        <Typography variant="subtitle1">Clientes Ativos</Typography>
      </Paper>
    </Grid>
  </Grid>
);

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(0.5),
  },
  content: {
    flex: 1,
    marginTop: theme.spacing(1),
    overflowY: "visible",
    width: "100%",
    maxWidth: "100%",
  },
}));

const CompaniesCRM = ({ renderAsTab }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("board");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  
  const { findAll } = useCompanies();

  useEffect(() => {
    setLoading(true);
    const fetchCompanies = async () => {
      try {
        const data = await findAll();
        setCompanies(data);
        setCount(data.length);
      } catch (err) {
        toast.error("Erro ao carregar empresas");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []); // Executa apenas na montagem, pois useCompanies não tem dependências de paginação no findAll por padrão aqui

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabs = [
    { label: "Dashboard", value: "dashboard", icon: <DashboardIcon /> },
    { label: "Kanban", value: "board", icon: <KanbanIcon /> },
    { label: "Lista", value: "list", icon: <ListIcon /> },
    { label: "Calendário", value: "calendar", icon: <CalendarIcon /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <CompaniesDashboard count={count} />;
      case "board":
        return <CompaniesBoard data={companies} loading={loading} />;
      case "list":
        return <CompaniesList data={companies} loading={loading} />;
      case "calendar":
        return <CompaniesCalendar data={companies} />;
      default:
        return <CompaniesBoard data={companies} loading={loading} />;
    }
  };

  const Container = renderAsTab ? ({ children }) => <>{children}</> : MainContainer;

  return (
    <Container>
      {!renderAsTab && (
      <MainHeader>
        <Title>Leads Convertidos</Title>
        <MainHeaderButtonsWrapper>
          <Button variant="contained" color="primary">Nova Empresa</Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      )}
      
      <div className={classes.root}>
        <InternalNavbar
          tabs={tabs}
          activeTab={activeTab}
          onChange={handleTabChange}
        />
        <div className={classes.content}>
          {renderContent()}
        </div>
      </div>
    </Container>
  );
};

export default CompaniesCRM;
