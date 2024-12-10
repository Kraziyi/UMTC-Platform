import React from 'react';
import { Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import CustomButton from '../components/CustomButton';

const Home = () => {
  return (
    <Layout title={`UMTC`} subTitle={`Dashboard`}>
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Welcome to the UMTC Platform
        </Typography>
        <Typography variant="body1" gutterBottom>
          This is the main portal to access calculations, user profile, and more.
        </Typography>
        <Box sx={{ mt: 3 }}>
          <CustomButton
            component={Link}
            to="/login"
            color="primary"
            sx={{ mr: 2 }}
          >
            Login
          </CustomButton>
          <CustomButton
            component={Link}
            to="/register"
            color="primary"
            sx={{ mr: 2 }}
          >
            Register
          </CustomButton>
        </Box>
      </Box>
    </Layout>
  );
};

export default Home;
