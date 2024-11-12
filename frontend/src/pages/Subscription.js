import React from 'react';
import { Typography, Button, Stack } from '@mui/material';
import Layout from '../components/Layout';
import { subscribe } from '../services/api';

const Subscription = () => {
  const handleSubscribe = async (period) => {
    try {
      const response = await subscribe(period);
      alert(response.data.message);
    } catch (error) {
      alert('Failed to subscrbe');
    }
  };

  return (
    <Layout title="Subscribe">
      <Typography variant="h5" gutterBottom>Choose Subscription Period</Typography>
      <Stack spacing={2} direction="column">
        <Button variant="contained" onClick={() => handleSubscribe('1month')}>
          Subscribe for 1 Month
        </Button>
        <Button variant="contained" onClick={() => handleSubscribe('3months')}>
          Subscribe for 3 Months
        </Button>
        <Button variant="contained" onClick={() => handleSubscribe('1year')}>
          Subscribe for 1 Year
        </Button>
      </Stack>
    </Layout>
  );
};

export default Subscription;
