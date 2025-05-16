import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  MenuItem,
  TextField,
  Paper,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Divider,
  Alert,
  Fade,
  Tooltip,
  styled,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import {
  fetchAllUsers,
  fetchUserTimesheets,
} from "../services/adminService";
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DownloadIcon from '@mui/icons-material/Download';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import TimelineIcon from '@mui/icons-material/Timeline';
import GroupIcon from '@mui/icons-material/Group';

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
  background: 'linear-gradient(145deg, #ffffff 0%, #f8fafb 100%)',
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  gap: theme.spacing(2),
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
  '& .MuiSelect-select': {
    minHeight: '1.5em',
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
}));

// Custom chart colors
const CHART_COLORS = ['#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50', '#8bc34a'];

const ManagerPanel = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // fetch users once
  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      try {
        const res = await fetchAllUsers();
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, []);

  // fetch timesheets based on selectedUser + dates
  useEffect(() => {
    const getUserData = async () => {
      if (!selectedUser) return;

      setLoading(true);
      setError("");

      let url = `/admin/timesheets?userId=${selectedUser}`;
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      try {
        const res = await fetchUserTimesheets(selectedUser, url);
        setEntries(res.data);
      } catch (err) {
        console.error("Failed to fetch timesheets:", err);
        setError("Failed to load timesheets. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, [selectedUser, startDate, endDate]);

  const groupByProject = () => {
    const totals = {};
    entries.forEach((entry) => {
      const project = entry.project;
      totals[project] = (totals[project] || 0) + entry.hours;
    });
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const chartData = groupByProject();
  const totalHours = chartData.reduce((acc, curr) => acc + curr.value, 0);
  const selectedUserData = users.find(u => u._id === selectedUser);

  const exportToExcel = () => {
    if (entries.length === 0) {
      alert("No data to export.");
      return;
    }

    const sheetData = entries.map((entry) => ({
      Date: entry.date?.slice(0, 10),
      Project: entry.project,
      Hours: entry.hours,
      Description: entry.description,
      User: entry.user?.name || "Unknown",
    }));

    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Timesheets");

    const blob = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([blob]), `${selectedUserData?.name || 'timesheet'}_export.xlsx`);
  };

  const exportAllToZip = async () => {
    setLoading(true);
    const zip = new JSZip();

    for (const user of users) {
      try {
        const res = await fetchUserTimesheets(user._id);
        const timesheets = res.data;

        const sheetData = timesheets.map((entry) => ({
          Date: entry.date?.slice(0, 10),
          Project: entry.project,
          Hours: entry.hours,
          Description: entry.description,
          User: entry.user?.name || "Unknown",
        }));

        const worksheet = XLSX.utils.json_to_sheet(sheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Timesheets");

        const fileBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });
        zip.file(
          `${user.name.replace(/\s/g, "_")}_timesheet.xlsx`,
          fileBuffer
        );
      } catch (err) {
        console.error(`Failed for ${user.name}`, err);
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "all_timesheets.zip");
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: 3 }}>
      <StyledPaper>
        <HeaderBox>
          <GroupIcon sx={{ fontSize: 40, color: "#3f51b5" }} />
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary.dark">
              Manager Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and export employee timesheets
            </Typography>
          </Box>
        </HeaderBox>

        {loading && <LinearProgress sx={{ mb: 3 }} />}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <StyledCard>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <PersonIcon color="primary" />
                  <Typography variant="h6" fontWeight="600">
                    Select Employee
                  </Typography>
                </Box>
                <StyledTextField
                  select
                  fullWidth
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  label="Choose an employee"
                  SelectProps={{ 
                    MenuProps: { 
                      PaperProps: {
                        style: {
                          maxHeight: 400,
                          backgroundColor: '#ffffff'
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="">
                    <em>Select an employee</em>
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      <Box display="flex" alignItems="center" gap={2} width="100%">
                        <PersonIcon fontSize="small" color="action" />
                        <Box flex={1}>
                          <Typography variant="body2" fontWeight={500}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </StyledTextField>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid item xs={12} md={7}>
            <StyledCard>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <CalendarMonthIcon color="primary" />
                  <Typography variant="h6" fontWeight="600">
                    Date Range Filter
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      type="date"
                      label="Start Date"
                      InputLabelProps={{ shrink: true }}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      type="date"
                      label="End Date"
                      InputLabelProps={{ shrink: true }}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        {selectedUser && chartData.length > 0 && (
          <Fade in timeout={500}>
            <Box mt={4}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <StyledCard>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <TimelineIcon color="primary" />
                          <Typography variant="h6" fontWeight="600">
                            Project Distribution
                          </Typography>
                        </Box>
                        <Chip 
                          label={`Total: ${totalHours} hours`} 
                          color="primary" 
                          size="medium"
                          icon={<TimelineIcon />}
                        />
                      </Box>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                          <XAxis 
                            dataKey="name" 
                            angle={-45} 
                            textAnchor="end"
                            height={100}
                          />
                          <YAxis />
                          <ChartTooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              borderRadius: '8px',
                              border: '1px solid #e0e0e0',
                            }}
                          />
                          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </StyledCard>
                </Grid>

                <Grid item xs={12} md={4}>
                  <StyledCard>
                    <CardContent>
                      <Typography variant="h6" fontWeight="600" mb={3}>
                        Export Options
                      </Typography>
                      <Box display="flex" flexDirection="column" gap={2}>
                        <Tooltip title={`Export ${selectedUserData?.name || 'selected user'}'s data`}>
                          <ActionButton
                            variant="contained"
                            color="primary"
                            startIcon={<DownloadIcon />}
                            onClick={exportToExcel}
                            fullWidth
                          >
                            Export Selected User
                          </ActionButton>
                        </Tooltip>
                        <Divider>or</Divider>
                        <Tooltip title="Export all users' data as ZIP">
                          <ActionButton
                            variant="contained"
                            color="secondary"
                            startIcon={<FolderZipIcon />}
                            onClick={exportAllToZip}
                            disabled={users.length === 0 || loading}
                            fullWidth
                          >
                            Export All Users (ZIP)
                          </ActionButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        )}

        {selectedUser && chartData.length === 0 && !loading && (
          <Box textAlign="center" py={8}>
            <TimelineIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No timesheet data available for the selected criteria
            </Typography>
          </Box>
        )}
      </StyledPaper>
    </Box>
  );
};

export default ManagerPanel;