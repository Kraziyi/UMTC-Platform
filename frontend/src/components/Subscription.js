// SubscriptionPage.js
import React, { useState } from 'react';
import { Button, Select, MenuItem, Typography, CircularProgress, FormControl, InputLabel } from '@mui/material';
import { subscribe } from '../services/api';
import Layout from './Layout';

const Subscription = () => {
  const [subscriptionPeriod, setSubscriptionPeriod] = useState('1month');
  const [autoRenew, setAutoRenew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await subscribe(subscriptionPeriod, autoRenew);
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data.error || 'Error subscribing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Subscription">
      {loading ? (
        <CircularProgress />
      ) : (
        <div>
          <FormControl fullWidth margin="normal">
            <InputLabel>Subscription Period</InputLabel>
            <Select value={subscriptionPeriod} onChange={(e) => setSubscriptionPeriod(e.target.value)}>
              <MenuItem value="1month">1 Month</MenuItem>
              <MenuItem value="3months">3 Months</MenuItem>
              <MenuItem value="1year">1 Year</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Auto Renew</InputLabel>
            <Select value={autoRenew} onChange={(e) => setAutoRenew(e.target.value)}>
              <MenuItem value={true}>Yes</MenuItem>
              <MenuItem value={false}>No</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={handleSubscribe} fullWidth>Subscribe</Button>
          {message && <Typography color="error" style={{ marginTop: '10px' }}>{message}</Typography>}
        </div>
      )}
    </Layout>
  );
};

export default Subscription;
