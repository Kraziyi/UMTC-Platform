import React, { useState, useEffect } from 'react';
import { TextField, Typography, Checkbox, FormControlLabel, CircularProgress, Box } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { login, getCurrentUsername } from '../services/api';
import Layout from '../components/Layout';
import CustomButton from '../components/CustomButton';

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
      navigate('/calculation/diffusion');
    } catch (error) {
      setMessage(error.response?.data.error || 'Error logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={`User`} subTitle={`Login`}>
      {isLoggedIn ? (
        <Typography variant="h6" color="primary">
          You are already logged in.
        </Typography>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', marginY: 2 }}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)} 
                />
              }
              label="Remember Me"
            />
          </Box>
          <CustomButton type="submit" color="primary" fullWidth>
            Login
          </CustomButton>
          {message && (
            <Typography color="error" sx={{ marginTop: '10px' }}>
              {message}
            </Typography>
          )}
          <CustomButton
            component={Link}
            to="/forgot-password"
            color="primary"
            fullWidth
            sx={{ marginTop: '10px' }}
          >
            Forgot Password
          </CustomButton>
        </form>
      )}
    </Layout>
  );
};

export default Login;
