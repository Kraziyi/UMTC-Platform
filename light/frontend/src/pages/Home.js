import React from 'react';
import { Typography, Box, Grid, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import CalculateIcon from '@mui/icons-material/Calculate';

const Home = () => {
  const features = [
    {
      title: 'Diffusion Calculation',
      description: 'Calculate diffusion coefficients and analyze concentration profiles with advanced numerical methods.',
      icon: <CalculateIcon sx={{ fontSize: 40, color: '#00274C' }} />,
      path: '/calculation/diffusion'
    },
    {
      title: 'Diffusion Animation',
      description: 'Visualize diffusion processes with interactive 2D animations and real-time parameter adjustments.',
      icon: <CalculateIcon sx={{ fontSize: 40, color: '#00274C' }} />,
      path: '/calculation/diffusion-animation'
    },
    {
      title: 'ECM Calculation',
      description: 'Perform Equivalent Circuit Model calculations for battery systems with customizable parameters.',
      icon: <CalculateIcon sx={{ fontSize: 40, color: '#00274C' }} />,
      path: '/calculation/ecm'
    },
    {
      title: '3D Point Cloud',
      description: 'Create and visualize 3D point clouds with interactive controls and real-time rendering.',
      icon: <CalculateIcon sx={{ fontSize: 40, color: '#00274C' }} />,
      path: '/3d-demo'
    }
  ];

  return (
    <Layout title="UMTC Platform" subTitle="Unified Materials and Transport Calculations">
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        {/* Welcome Section */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(45deg, #00274C 30%, #1a4d7c 90%)',
            color: 'white',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Welcome to UMTC Platform
          </Typography>
          <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
            Your Integrated Solution for Materials Science Calculations
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.8 }}>
            UMTC Platform provides advanced tools for diffusion calculations, battery modeling, 
            and materials analysis. Whether you're researching battery materials, studying diffusion 
            processes, or analyzing transport phenomena, our platform offers the computational tools 
            you need.
          </Typography>
        </Paper>

        {/* Features Grid */}
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 3
                  }
                }}
              >
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  {feature.icon}
                  <Typography variant="h6" sx={{ ml: 2, color: '#00274C' }}>
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2, flexGrow: 1, color: 'text.secondary' }}>
                  {feature.description}
                </Typography>
                <Button
                  component={Link}
                  to={feature.path}
                  variant="outlined"
                  sx={{
                    mt: 'auto',
                    borderColor: '#00274C',
                    color: '#00274C',
                    '&:hover': {
                      borderColor: '#1a4d7c',
                      bgcolor: 'rgba(0, 39, 76, 0.04)'
                    }
                  }}
                >
                  Learn More
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Layout>
  );
};

export default Home;
