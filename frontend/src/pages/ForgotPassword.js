import React, { useState } from 'react';
import { TextField, Button, Typography, CircularProgress } from '@mui/material';
import Layout from '../components/Layout';
import { forgotPassword } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await forgotPassword(email);
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data.error || 'Error sending reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Forgot Password">
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
        </Button>
        {message && (
          <Typography color={message.includes('Error') ? 'error' : 'primary'} style={{ marginTop: '10px' }}>
            {message}
          </Typography>
        )}
      </form>
    </Layout>
  );
};

export default ForgotPassword;
