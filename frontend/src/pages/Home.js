import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Home = () => {
  return (
    <Layout title="Welcome to UMTC">
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Welcome to the UMTC Platform
        </Typography>
        <Typography variant="body1" gutterBottom>
          This is the main portal to access calculations, user profile, and more.
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button
            component={Link}
            to="/login"
            variant="contained"
            color="primary"
            sx={{ mr: 2 }}
          >
            Login
          </Button>
          <Button
            component={Link}
            to="/register"
            variant="outlined"
            color="primary"
          >
            Register
          </Button>
        </Box>
      </Box>
    </Layout>
  );
};

export default Home;
