import React, { useState } from 'react';
import { Typography, CircularProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/api';
import Layout from '../components/Layout';
import CustomButton from '../components/CustomButton';

const Logout = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setMessage("Logged out successfully.");
      navigate('/');
    } catch (error) {
      setMessage("Error logging out.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={`User`} subTitle={`Logout`}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ marginTop: '20px', textAlign: 'center' }}>
          <CustomButton color="secondary" onClick={handleLogout} fullWidth>
            Logout
          </CustomButton>
          {message && (
            <Typography color="error" sx={{ marginTop: '10px' }}>
              {message}
            </Typography>
          )}
        </Box>
      )}
    </Layout>
  );
};

export default Logout;
