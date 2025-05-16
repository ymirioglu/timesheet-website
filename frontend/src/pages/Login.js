import { useState } from "react";
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper,
  IconButton,
  InputAdornment,
  Alert,
  LinearProgress,
  styled,
  Container
} from "@mui/material";
import { login as loginUser } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useContext } from "react";
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Styled Components
const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6366f1 100%)',
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

const LoginCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: theme.spacing(3),
  maxWidth: 450,
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
  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
  background: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
  '&:hover': {
    background: 'linear-gradient(135deg, #5c6bc0 0%, #3f51b5 100%)',
    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease',
}));

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      if (user.role === "manager") {
        navigate("/manager");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error when typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await loginUser(form);
      login(res.data.user, res.data.token);

      // Role-based navigation
      const role = res.data.user.role;
      if (role === "manager") {
        navigate("/manager");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  return (
    <LoginContainer>
      <Container maxWidth="sm">
        <LoginCard elevation={3}>
          <LogoSection>
            <AccessTimeIcon sx={{ fontSize: 48, color: '#3f51b5', mb: 2 }} />
            <Typography 
              variant="h4" 
              fontWeight="700" 
              color="#3f51b5"
              gutterBottom
            >
              Timesheet Pro
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              textAlign="center"
            >
              Sign in to manage your timesheets
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
            
            <StyledButton
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              disabled={loading}
              startIcon={<LoginIcon />}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </StyledButton>
          </form>

          <Box textAlign="center" mt={3}>
            <Typography variant="caption" color="text.secondary">
              © 2024 Timesheet Pro. All rights reserved.
            </Typography>
          </Box>
        </LoginCard>
      </Container>
    </LoginContainer>
  );
};

export default Login;