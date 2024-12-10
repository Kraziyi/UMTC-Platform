import React from 'react';
import { Typography, Stack } from '@mui/material';
import Layout from '../components/Layout';
import CustomButton from '../components/CustomButton';
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
    <Layout title={`User`} subTitle={`Subscribe`}>
      <Typography variant="h5" gutterBottom>Choose Subscription Period</Typography>
      <Stack spacing={2} direction="column">
        <CustomButton onClick={() => handleSubscribe('1month')} color="primary">
          Subscribe for 1 Month
        </CustomButton>
        <CustomButton onClick={() => handleSubscribe('3months')} color="primary">
          Subscribe for 3 Months
        </CustomButton>
        <CustomButton onClick={() => handleSubscribe('1year')} color="primary">
          Subscribe for 1 Year
        </CustomButton>

      </Stack>
    </Layout>
  );
};

export default Subscription;
