// src/pages/Calculation.js
import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const Calculation = () => {
  const navigate = useNavigate();

  const handleDiffusionClick = () => {
    navigate('/calculation/diffusion');
  };

  return (
    <Layout title="Calculation">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6">Choose a Calculation Method:</Typography>
        
        {/* Diffusion Calculation Button */}
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleDiffusionClick}
          fullWidth
          sx={{ maxWidth: '300px' }}
        >
          Diffusion
        </Button>

        {/* Add more calculation buttons here as needed */}
        
      </Box>
    </Layout>
  );
};

export default Calculation;
