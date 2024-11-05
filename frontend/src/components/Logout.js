// LogoutPage.js
import React, { useState } from 'react';
import { Button, Typography, CircularProgress } from '@mui/material';
import { logout } from '../services/api';
import Layout from './Layout';

const Logout = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setMessage("Logged out successfully.");
    } catch (error) {
      setMessage("Error logging out.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Logout">
      {loading ? (
        <CircularProgress />
      ) : (
        <div>
          <Button variant="contained" color="secondary" onClick={handleLogout} fullWidth>Logout</Button>
          {message && <Typography color="error" style={{ marginTop: '10px' }}>{message}</Typography>}
        </div>
      )}
    </Layout>
  );
};

export default Logout;
