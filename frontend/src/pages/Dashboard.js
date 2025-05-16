import React, { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  TextField, 
  MenuItem, 
  Button, 
  Paper, 
  IconButton,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Alert,
  InputAdornment,
  Avatar,
  styled,
  Tabs,
  Tab,
  Divider
} from "@mui/material";
import { fetchTimesheets, addTimesheet, deleteTimesheet, updateTimesheet } from "../services/timesheetService";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import WorkIcon from "@mui/icons-material/Work";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TimelineIcon from "@mui/icons-material/Timeline";
import ListAltIcon from '@mui/icons-material/ListAlt';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Cell
} from "recharts";

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
  background: 'linear-gradient(145deg, #ffffff 0%, #f8fafb 100%)',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
  },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  gap: theme.spacing(2),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.5),
    backgroundColor: '#fafafa',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
    },
  },
}));

const TimeEntryCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  border: '1px solid transparent',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    borderColor: theme.palette.primary.light,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1.2, 3),
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: '1px solid #e0e0e0',
  marginBottom: theme.spacing(3),
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    marginRight: theme.spacing(4),
    color: '#757575',
    '&.Mui-selected': {
      color: theme.palette.primary.main,
    },
  },
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
}));

// Chart colors
const CHART_COLORS = ['#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50', '#8bc34a'];

// Project colors for chips
const PROJECT_COLORS = {
  "Firma A": "#3f51b5",
  "Firma B": "#2196f3",
  "Firma C": "#00bcd4",
  "Internal": "#4caf50",
  "Resmî Tatil": "#ff9800",
  "İzin": "#9c27b0"
};

const Dashboard = () => {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    project: "Firma A",
    hours: 1,
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    project: "All"
  });

  const getData = async () => {
    setLoading(true);
    try {
      const res = await fetchTimesheets();
      setEntries(res.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch timesheets:", err);
      setError("Failed to load timesheets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const groupByProject = () => {
    const totals = {};
    getFilteredEntries().forEach((entry) => {
      const project = entry.project;
      totals[project] = (totals[project] || 0) + entry.hours;
    });
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const getFilteredEntries = () => {
    return entries.filter(entry => {
      const dateInRange = (!filters.startDate || entry.date >= filters.startDate) && 
                         (!filters.endDate || entry.date <= filters.endDate);
      const projectMatch = filters.project === "All" || entry.project === filters.project;
      return dateInRange && projectMatch;
    });
  };

  const chartData = groupByProject();
  const filteredEntries = getFilteredEntries();
  const totalHours = filteredEntries.reduce((acc, curr) => acc + curr.hours, 0);

  useEffect(() => {
    getData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateTimesheet(editingId, form);
        setEditingId(null);
      } else {
        await addTimesheet(form);
      }
      setForm({ project: "Firma A", hours: 1, description: "", date: new Date().toISOString().split("T")[0] });
      getData();
      setTabValue(1); // Switch to list tab after adding
    } catch (err) {
      setError("Failed to save timesheet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      setLoading(true);
      try {
        await deleteTimesheet(id);
        getData();
      } catch (err) {
        setError("Failed to delete timesheet.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (entry) => {
    setForm({
      project: entry.project,
      hours: entry.hours,
      description: entry.description,
      date: entry.date.slice(0, 10),
    });
    setEditingId(entry._id);
    setTabValue(0); // Switch to add tab for editing
  };

  const cancelEdit = () => {
    setForm({ project: "Firma A", hours: 1, description: "", date: new Date().toISOString().split("T")[0] });
    setEditingId(null);
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const clearFilters = () => {
    setFilters({ startDate: "", endDate: "", project: "All" });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <StyledPaper>
        <HeaderBox>
          <AccessTimeIcon sx={{ fontSize: 40, color: "#3f51b5" }} />
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary.dark">
              My Timesheets
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track your work hours and projects
            </Typography>
          </Box>
        </HeaderBox>

        {loading && <LinearProgress sx={{ mb: 3 }} />}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <StyledTabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab 
            label="Add Timesheet" 
            icon={<AddIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="View Timesheets" 
            icon={<ListAltIcon />} 
            iconPosition="start"
          />
        </StyledTabs>

        {/* Tab 1: Add Timesheet */}
        {tabValue === 0 && (
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={6}>
              <StyledCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                    <Typography variant="h6" fontWeight="600">
                      {editingId ? "Edit Entry" : "New Timesheet Entry"}
                    </Typography>
                    {editingId && (
                      <Button size="small" onClick={cancelEdit} color="secondary">
                        Cancel Edit
                      </Button>
                    )}
                  </Box>
                  
                  <form onSubmit={handleSubmit}>
                    <StyledTextField
                      select
                      name="project"
                      label="Project"
                      value={form.project}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <WorkIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    >
                      {["Firma A", "Firma B", "Firma C", "Internal", "Resmî Tatil", "İzin"].map((option) => (
                        <MenuItem key={option} value={option}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: PROJECT_COLORS[option],
                              }}
                            />
                            {option}
                          </Box>
                        </MenuItem>
                      ))}
                    </StyledTextField>

                    <StyledTextField
                      name="hours"
                      label="Hours"
                      type="number"
                      inputProps={{ min: 1, max: 8, step: 0.5 }}
                      value={form.hours}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccessTimeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <StyledTextField
                      name="description"
                      label="Description"
                      value={form.description}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      multiline
                      rows={3}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DescriptionIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <StyledTextField
                      name="date"
                      label="Date"
                      type="date"
                      value={form.date}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <ActionButton 
                      type="submit" 
                      variant="contained" 
                      fullWidth
                      sx={{ mt: 3 }}
                      startIcon={editingId ? <SaveIcon /> : <AddIcon />}
                      disabled={loading}
                    >
                      {editingId ? "Update Entry" : "Add Entry"}
                    </ActionButton>
                  </form>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        )}

        {/* Tab 2: View Timesheets */}
        {tabValue === 1 && (
          <Grid container spacing={3}>
            {/* Filters Section */}
            <Grid item xs={12}>
              <StyledCard>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <FilterListIcon color="primary" />
                    <Typography variant="h6" fontWeight="600">
                      Filters
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <StyledTextField
                        type="date"
                        label="Start Date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <StyledTextField
                        type="date"
                        label="End Date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <StyledTextField
                        select
                        label="Project"
                        name="project"
                        value={filters.project}
                        onChange={handleFilterChange}
                        fullWidth
                      >
                        <MenuItem value="All">All Projects</MenuItem>
                        {["Firma A", "Firma B", "Firma C", "Internal", "Resmî Tatil", "İzin"].map((option) => (
                          <MenuItem key={option} value={option}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: PROJECT_COLORS[option],
                                }}
                              />
                              {option}
                            </Box>
                          </MenuItem>
                        ))}
                      </StyledTextField>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Button 
                        onClick={clearFilters}
                        variant="outlined"
                        fullWidth
                      >
                        Clear Filters
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </StyledCard>
            </Grid>

            {/* Chart Section */}
            <Grid item xs={12} md={8}>
              <StyledCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TimelineIcon color="primary" />
                      <Typography variant="h6" fontWeight="600">
                        Hours Overview
                      </Typography>
                    </Box>
                    <Chip 
                      label={`Total: ${totalHours} hours`} 
                      color="primary" 
                      size="medium"
                      icon={<AccessTimeIcon />}
                    />
                  </Box>
                  
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis 
                        label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                      />
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0',
                        }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PROJECT_COLORS[entry.name] || CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </StyledCard>
            </Grid>

            {/* Stats Section */}
            <Grid item xs={12} md={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <StyledCard>
                    <CardContent>
                      <Typography variant="h6" fontWeight="600" gutterBottom>
                        Summary
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Total Entries
                        </Typography>
                        <Typography variant="h4" color="primary">
                          {filteredEntries.length}
                        </Typography>
                      </Box>
                      <Box mt={2}>
                        <Typography variant="body2" color="text.secondary">
                          Total Hours
                        </Typography>
                        <Typography variant="h4" color="primary">
                          {totalHours}
                        </Typography>
                      </Box>
                      <Box mt={2}>
                        <Typography variant="body2" color="text.secondary">
                          Average Hours/Entry
                        </Typography>
                        <Typography variant="h4" color="primary">
                          {filteredEntries.length > 0 ? (totalHours / filteredEntries.length).toFixed(1) : 0}
                        </Typography>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              </Grid>
            </Grid>

            {/* Entries List */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="600" mb={2} display="flex" alignItems="center" gap={1}>
                <ListAltIcon color="primary" />
                Timesheet Entries ({filteredEntries.length})
              </Typography>
              
              <Box>
                {filteredEntries.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      No timesheets found with the selected filters.
                    </Typography>
                  </Paper>
                ) : (
                  filteredEntries.map((entry) => (
                    <TimeEntryCard key={entry._id}>
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar 
                              sx={{ 
                                bgcolor: PROJECT_COLORS[entry.project] || '#3f51b5',
                                width: 48,
                                height: 48
                              }}
                            >
                              {entry.hours}h
                            </Avatar>
                            <Box>
                              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                <Typography variant="h6" fontWeight="500">
                                  {entry.project}
                                </Typography>
                                <Chip 
                                  label={formatDate(entry.date)} 
                                  size="small" 
                                  variant="outlined"
                                  icon={<CalendarTodayIcon />}
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {entry.description || 'No description'}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box>
                            <IconButton 
                              onClick={() => handleEdit(entry)}
                              color="primary"
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              onClick={() => handleDelete(entry._id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </TimeEntryCard>
                  ))
                )}
              </Box>
            </Grid>
          </Grid>
        )}
      </StyledPaper>
    </Box>
  );
};

export default Dashboard;