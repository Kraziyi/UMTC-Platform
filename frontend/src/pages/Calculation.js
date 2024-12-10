// src/pages/Calculation.js
import React from 'react';
import { Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../components/CustomButton';
import Layout from '../components/Layout';

const Calculation = () => {
  const navigate = useNavigate();

  const handleDiffusionClick = () => {
    navigate('/calculation/diffusion');
  };

  return (
    <Layout title={`Calculation`} subTitle={`List`}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6">Choose a Calculation Method:</Typography>
        
        {/* Diffusion Calculation Button */}
        <CustomButton onClick={handleDiffusionClick} color="primary">
          Diffusion
        </CustomButton>

        {/* Add more calculation buttons here as needed */}
        
      </Box>
    </Layout>
  );
};

export default Calculation;
