import React, { useState, useEffect, useContext, useMemo } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  List as ListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarIcon
} from "@material-ui/icons";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Grid,
  TextField,
  Popover,
  Button,
  Typography
} from "@material-ui/core";

import ActivitiesStyleLayout from "../../components/ActivitiesStyleLayout";
import LeadCompanyModal from "../../components/LeadCompanyModal";
import toastError from "../../errors/toastError";
import convertedLeadsService from "../../services/convertedLeadsService";
import Autocomplete from "@material-ui/lab/Autocomplete";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    height: "100%",
    overflow: "hidden",
  },
  container: {
    maxWidth: "100%",
    margin: 0,
    padding: theme.spacing(1),
  },
}));

const LeadsList = ({ leads, onEdit, onDelete }) => {
  const theme = useTheme();
  return (
    <TableContainer
      component={Paper}
      style={{
        height: "100%",
        overflow: "auto",
        backgroundColor: theme.palette.listScrollArea,
      }}
    >
      <Table stickyHeader aria-label="converted leads table">
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Setor</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Contato</TableCell>
            <TableCell>Responsável</TableCell>
            <TableCell>Data</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leads.length > 0 ? (
            leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell component="th" scope="row">
                  {lead.name}
                </TableCell>
                <TableCell>{lead.sector || "-"}</TableCell>
                <TableCell>{lead.email || "-"}</TableCell>
                <TableCell>{lead.contact?.name || lead.contactId || "-"}</TableCell>
                <TableCell>{lead.responsible?.name || lead.responsibleId || "-"}</TableCell>
                <TableCell>{lead.date ? new Date(lead.date).toLocaleDateString() : "-"}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => onEdit(lead)}>
                    <EditIcon color="primary" />
                  </IconButton>
                  <IconButton size="small" onClick={() => onDelete(lead)}>
                    <DeleteIcon color="secondary" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} align="center">
                Nenhum lead convertido encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const LeadsConvertidos = () => {
  const classes = useStyles();
  const [viewMode, setViewMode] = useState("list");
  const [searchParam, setSearchParam] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [sector, setSector] = useState("");
  const [responsible, setResponsible] = useState(null);
  const [contact, setContact] = useState(null);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [contactsList, setContactsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const { user, socket } = useContext(AuthContext);
  const [anchorSector, setAnchorSector] = useState(null);
  const [anchorResp, setAnchorResp] = useState(null);
  const [anchorContact, setAnchorContact] = useState(null);
  const [anchorPeriodo, setAnchorPeriodo] = useState(null);

  useEffect(() => {
    async function fetchFilters() {
      try {
        const { data: contactsData } = await api.get("/contacts/list");
        setContactsList(contactsData || []);
        const { data: usersResp } = await api.get("/users", { params: { searchParam: "" } });
        setUsersList(usersResp?.users || []);
      } catch (err) {
        // ignore
      }
    }
    fetchFilters();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = {
          searchParam,
          pageNumber,
          sector: sector || undefined,
          responsibleId: responsible?.id || undefined,
          contactId: contact?.id || undefined,
          dateStart: dateStart || undefined,
          dateEnd: dateEnd || undefined
        };
        const data = await convertedLeadsService.list(params);
        setLeads(data.leads || []);
        setHasMore(data.hasMore);
        setTotal(data.count || 0);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [searchParam, pageNumber, sector, responsible, contact, dateStart, dateEnd]);

  useEffect(() => {
    if (!socket || !user || !user.companyId) return;
    const onLeadEvent = (data) => {
      if (data?.action === "create" || data?.action === "update") {
        setLeads((prev) => {
          const idx = prev.findIndex((x) => String(x.id) === String(data.lead.id));
          if (idx >= 0) {
            const clone = [...prev];
            clone[idx] = data.lead;
            return clone;
          }
          return [data.lead, ...prev];
        });
      }
      if (data?.action === "delete") {
        setLeads((prev) => prev.filter((x) => String(x.id) !== String(data.id)));
      }
    };
    socket.on(`company-${user.companyId}-converted-lead`, onLeadEvent);
    return () => {
      socket.off(`company-${user.companyId}-converted-lead`, onLeadEvent);
    };
  }, [socket, user]);

  const viewModes = [
    { value: "list", label: "Lista", icon: <ListIcon /> },
  ];

  const handleSearch = (value) => setSearchParam(value);

  const handleOpenCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (lead) => {
    setEditing(lead);
    setModalOpen(true);
  };

  const handleDelete = async (lead) => {
    try {
      await convertedLeadsService.remove(lead.id);
      setLeads((prev) => prev.filter((x) => x.id !== lead.id));
    } catch (err) {
      toastError(err);
    }
  };

  const actionsRight = (
    <>
    </>
  );

  const rightFilters = ({ classes }) => (
    <>
      <div
        className={classes.filterItem}
        onClick={(e) => setAnchorSector(e.currentTarget)}
      >
        <Typography className={classes.filterLabel}>
          {sector ? `Setor: ${sector}` : "Setor"}
        </Typography>
        <ExpandMoreIcon className={classes.chevronIcon} />
      </div>
      <div
        className={classes.filterItem}
        onClick={(e) => setAnchorResp(e.currentTarget)}
      >
        <Typography className={classes.filterLabel}>
          {responsible ? `Responsável: ${responsible.name}` : "Responsável"}
        </Typography>
        <ExpandMoreIcon className={classes.chevronIcon} />
      </div>
      <div
        className={classes.filterItem}
        onClick={(e) => setAnchorContact(e.currentTarget)}
      >
        <Typography className={classes.filterLabel}>
          {contact ? `Contato: ${contact.name}` : "Contato"}
        </Typography>
        <ExpandMoreIcon className={classes.chevronIcon} />
      </div>
      <div
        className={classes.filterItem}
        onClick={(e) => setAnchorPeriodo(e.currentTarget)}
      >
        <CalendarIcon className={classes.calendarIcon} />
        <Typography className={classes.filterLabel}>Período</Typography>
      </div>
    </>
  );

  return (
    <>
      <ActivitiesStyleLayout
        title="Leads Convertidos"
        description="Gerencie seus leads convertidos"
        onCreateClick={handleOpenCreate}
        searchPlaceholder="Buscar empresas..."
        searchValue={searchParam}
        onSearchChange={handleSearch}
        rightFilters={rightFilters}
        stats={[]}
        navActions={actionsRight}
        viewModes={viewModes}
        currentViewMode={viewMode}
        onViewModeChange={setViewMode}
      >
        <div className={classes.container}>
          {loading ? (
            <div style={{ padding: 20, textAlign: "center" }}>Carregando...</div>
          ) : (
            viewMode === "list" && (
              <LeadsList leads={leads} onEdit={handleEdit} onDelete={handleDelete} />
            )
          )}
        </div>
      </ActivitiesStyleLayout>

      <Popover
        open={Boolean(anchorSector)}
        anchorEl={anchorSector}
        onClose={() => setAnchorSector(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <div style={{ padding: 12, width: 260 }}>
          <TextField
            label="Setor"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <Button size="small" onClick={() => { setSector(""); setAnchorSector(null); }}>Limpar</Button>
            <Button size="small" color="primary" variant="contained" onClick={() => setAnchorSector(null)}>Aplicar</Button>
          </div>
        </div>
      </Popover>

      <Popover
        open={Boolean(anchorResp)}
        anchorEl={anchorResp}
        onClose={() => setAnchorResp(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <div style={{ padding: 12, width: 280 }}>
          <Autocomplete
            options={usersList}
            getOptionLabel={(opt) => opt?.name || ""}
            value={responsible}
            onChange={(_, v) => setResponsible(v)}
            renderInput={(params) => (
              <TextField {...params} label="Responsável" variant="outlined" size="small" />
            )}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <Button size="small" onClick={() => { setResponsible(null); setAnchorResp(null); }}>Limpar</Button>
            <Button size="small" color="primary" variant="contained" onClick={() => setAnchorResp(null)}>Aplicar</Button>
          </div>
        </div>
      </Popover>

      <Popover
        open={Boolean(anchorContact)}
        anchorEl={anchorContact}
        onClose={() => setAnchorContact(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <div style={{ padding: 12, width: 280 }}>
          <Autocomplete
            options={contactsList}
            getOptionLabel={(opt) => opt?.name || ""}
            value={contact}
            onChange={(_, v) => setContact(v)}
            renderInput={(params) => (
              <TextField {...params} label="Contato" variant="outlined" size="small" />
            )}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <Button size="small" onClick={() => { setContact(null); setAnchorContact(null); }}>Limpar</Button>
            <Button size="small" color="primary" variant="contained" onClick={() => setAnchorContact(null)}>Aplicar</Button>
          </div>
        </div>
      </Popover>

      <Popover
        open={Boolean(anchorPeriodo)}
        anchorEl={anchorPeriodo}
        onClose={() => setAnchorPeriodo(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <div style={{ padding: 12, width: 300 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="De"
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Até"
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <Button size="small" onClick={() => { setDateStart(""); setDateEnd(""); setAnchorPeriodo(null); }}>Limpar</Button>
            <Button size="small" color="primary" variant="contained" onClick={() => setAnchorPeriodo(null)}>Aplicar</Button>
          </div>
        </div>
      </Popover>

      <LeadCompanyModal
        open={modalOpen}
        initialValues={editing}
        onClose={() => setModalOpen(false)}
        onSave={async (payload) => {
          try {
            if (editing?.id) {
              const record = await convertedLeadsService.update(editing.id, payload);
              setLeads((prev) =>
                prev.map((x) => (String(x.id) === String(record.id) ? record : x))
              );
            } else {
              const record = await convertedLeadsService.create(payload);
              setLeads((prev) => {
                const filtered = prev.filter((x) => String(x.id) !== String(record.id));
                return [record, ...filtered];
              });
            }
            setModalOpen(false);
          } catch (err) {
            toastError(err);
          }
        }}
      />
    </>
  );
};

export default LeadsConvertidos;
