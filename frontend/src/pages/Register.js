import React, { useState } from "react";
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  MenuItem,
  Paper,
  InputAdornment,
  Alert,
  LinearProgress,
  styled,
  Container,
  Link,
  IconButton
} from "@mui/material";
import { register } from "../services/authService";
import { useNavigate } from "react-router-dom";
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import BadgeIcon from '@mui/icons-material/Badge';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Styled Components
const RegisterContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 50%, #6366f1 100%)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    top: '-50%',
    left: '-50%',
    animation: 'pulse 8s ease-in-out infinite',
  },
  '@keyframes pulse': {
    '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
    '50%': { transform: 'scale(1.05) rotate(180deg)' },
  },
}));

const RegisterCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: theme.spacing(3),
  maxWidth: 500,
  width: '100%',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  backdropFilter: 'blur(10px)',
  background: 'rgba(255, 255, 255, 0.95)',
  position: 'relative',
  zIndex: 1,
}));

const LogoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
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

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1.5, 3),
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 15px rgba(118, 75, 162, 0.3)',
  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
  '&:hover': {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 6px 20px rgba(118, 75, 162, 0.4)',
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease',
}));

const BackButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
}));

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "employee" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error when typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  return (
    <RegisterContainer>
      <BackButton onClick={() => navigate('/login')}>
        <ArrowBackIcon />
      </BackButton>
      
      <Container maxWidth="sm">
        <RegisterCard elevation={3}>
          <LogoSection>
            <AccessTimeIcon sx={{ fontSize: 48, color: '#764ba2', mb: 2 }} />
            <Typography 
              variant="h4" 
              fontWeight="700" 
              color="#764ba2"
              gutterBottom
            >
              Create Account
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              textAlign="center"
            >
              Join Timesheet Pro to manage your work hours
            </Typography>
          </LogoSection>

          {loading && <LinearProgress sx={{ mb: 3 }} />}
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <StyledTextField
              label="Full Name"
              name="name"
              type="text"
              fullWidth
              margin="normal"
              onChange={handleChange}
              value={form.name}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
              required
            />
            
            <StyledTextField
              label="Email Address"
              name="email"
              type="email"
              fullWidth
              margin="normal"
              onChange={handleChange}
              value={form.email}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              required
            />
            
            <StyledTextField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              onChange={handleChange}
              value={form.password}
              disabled={loading}
              helperText="Password must be at least 6 characters"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              required
            />
            
            <StyledTextField
              select
              label="Role"
              name="role"
              fullWidth
              margin="normal"
              value={form.role}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon color="action" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="employee">
                <Box display="flex" alignItems="center" gap={1}>
                  <PersonIcon fontSize="small" />
                  Employee
                </Box>
              </MenuItem>
              <MenuItem value="manager">
                <Box display="flex" alignItems="center" gap={1}>
                  <BadgeIcon fontSize="small" />
                  Manager
                </Box>
              </MenuItem>
            </StyledTextField>
            
            <StyledButton
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              disabled={loading}
              startIcon={<AppRegistrationIcon />}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </StyledButton>
          </form>

          <Box textAlign="center" mt={3}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link 
                component="button" 
                variant="body2" 
                onClick={() => navigate('/login')}
                sx={{ 
                  color: '#764ba2', 
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Sign in here
              </Link>
            </Typography>
          </Box>

          <Box textAlign="center" mt={3}>
            <Typography variant="caption" color="text.secondary">
              © 2024 Timesheet Pro. All rights reserved.
            </Typography>
          </Box>
        </RegisterCard>
      </Container>
    </RegisterContainer>
  );
};

export default Register;