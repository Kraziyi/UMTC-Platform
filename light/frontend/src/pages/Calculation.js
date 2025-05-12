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

  const handleDiffusionAnimationClick = () => {
    navigate('/calculation/diffusion-animation');
  };

  const handleECMClick = () => {
    navigate('/calculation/ecm');
  };

  return (
    <Layout title={`Calculation`} subTitle={`List`}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6">Choose a Calculation Method:</Typography>
        <CustomButton onClick={handleDiffusionClick} color="primary">
          Diffusion
        </CustomButton>
        <CustomButton onClick={handleDiffusionAnimationClick} color="primary">
          Diffusion Animation
        </CustomButton>
        <CustomButton onClick={handleECMClick} color="primary">
          ECM
        </CustomButton>
      </Box>
    </Layout>
  );
};

export default Calculation;
