import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography, Checkbox, FormControlLabel, CircularProgress } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { login, getCurrentUsername } from '../services/api';
import Layout from '../components/Layout';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await getCurrentUsername();
        if (response.data.username) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await login(username, password, rememberMe);
      setMessage(response.data.message);
      navigate('/calculation/diffusion'); // Redirect to a protected page or home page
    } catch (error) {
      setMessage(error.response?.data.error || 'Error logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Login">
      {isLoggedIn ? (
        <Typography variant="h6" color="primary">
          You are already logged in.
        </Typography>
      ) : loading ? (
        <CircularProgress />
      ) : (
        <form onSubmit={handleSubmit}>
          <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth margin="normal" />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth margin="normal" />
          <FormControlLabel
            control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
            label="Remember Me"
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Login
          </Button>
          {message && <Typography color="error" style={{ marginTop: '10px' }}>{message}</Typography>}
          <Button
            component={Link}
            to="/register"
            variant="outlined"
            color="secondary"
            fullWidth
            sx={{ marginTop: '10px' }}
          >
            Register
          </Button>
          <Button
            component={Link}
            to="/forgot-password"
            variant="outlined"
            color="tertiary"
            fullWidth
            sx={{ marginTop: '10px' }}
          > Forgot Password </Button>
        </form>
      )}
    </Layout>
  );
};

export default Login;
