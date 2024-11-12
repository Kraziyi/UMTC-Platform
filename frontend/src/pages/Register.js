import React, { useState } from 'react';
import { Button, TextField, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import Layout from '../components/Layout';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await register(username, email, password);
      setMessage(response.data.message);
      navigate('/login');
    } catch (error) {
      setMessage(error.response?.data.error || 'Error registering');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Register">
      {loading ? (
        <CircularProgress />
      ) : (
        <form onSubmit={handleSubmit}>
          <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth margin="normal" />
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth margin="normal" />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth margin="normal" />
          <TextField label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} fullWidth margin="normal" />
          
          <Button type="submit" variant="contained" color="primary" fullWidth>Register</Button>
          {message && <Typography color="error" style={{ marginTop: '10px' }}>{message}</Typography>}
        </form>
      )}
    </Layout>
  );
};

export default Register;
