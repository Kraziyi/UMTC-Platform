import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, TextField, Typography } from '@mui/material';
import { resetPassword } from '../services/api';
import Layout from '../components/Layout';

const ResetPassword = () => {
  const { token } = useParams(); // 获取 URL 中的 token 参数
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await resetPassword(token, newPassword);
      setMessage(response.data.message);
      setError(''); // Clear any previous error
    } catch (error) {
      setMessage('');
      setError(error.response?.data.error || 'Failed to reset password');
    }
  };

  return (
    <Layout title={`User`} subTitle={`Reset Password`}>
      <TextField
        label="New Password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Confirm New Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handlePasswordReset}
        fullWidth
        style={{ marginTop: '10px' }}
      >
        Reset Password
      </Button>
      {error && <Typography color="error" style={{ marginTop: '10px' }}>{error}</Typography>}
      {message && <Typography color="primary" style={{ marginTop: '10px' }}>{message}</Typography>}
    </Layout>
  );
};

export default ResetPassword;
