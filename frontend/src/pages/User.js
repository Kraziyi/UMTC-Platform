import React, { useEffect, useState } from 'react';
import { Typography, CircularProgress, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import CustomButton from '../components/CustomButton';
import { getUserInfo } from '../services/api';

const User = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await getUserInfo();
        setUserInfo(response.data);
      } catch (error) {
        setError('Failed to load user information');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) {
    return (
      <Layout title={`User`} subTitle={`Profile`}>
        <CircularProgress />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title={`User`} subTitle={`Profile`}>
        <Typography color="error">{error}</Typography>
      </Layout>
    );
  }

  return (
    <Layout title={`User`} subTitle={`Profile`}>
      {/* <Typography variant="h5">User Information</Typography> */}
      {userInfo && (
        <>
          <Typography variant="body1"><strong>Username:</strong> {userInfo.username}</Typography>
          <Typography variant="body1"><strong>Email:</strong> {userInfo.email}</Typography>
          <Typography variant="body1"><strong>Subscription End:</strong> {userInfo.subscription_end || 'Not Subscribed'}</Typography>
        </>
      )}
      <Stack direction="row" spacing={2} sx={{ marginTop: 2 }}>
        <CustomButton color="primary" onClick={() => navigate('/history')}>
          View History
        </CustomButton>
        <CustomButton color="primary" onClick={() => navigate('/subscription')}>
          {userInfo?.subscription_end ? 'Extend Subscription' : 'Subscribe'}
        </CustomButton>
        <CustomButton color="primary" onClick={() => navigate('/logout')}>
          Logout
        </CustomButton>
      </Stack>
    </Layout>
  );
};

export default User;
