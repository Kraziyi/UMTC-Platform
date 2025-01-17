import React, { useEffect, useState } from 'react';
import { Typography, Box, List, ListItem, ListItemText, Switch } from '@mui/material';
import Layout from '../components/Layout';
import { getUploadedFunctions, updateFunctionVisibility, checkIfUserIsAdmin } from '../services/api';

const ManageCalculation = () => {
  const [functions, setFunctions] = useState([]);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const response = await checkIfUserIsAdmin();
        setIsAdmin(response.data.is_admin);

        if (!response.data.is_admin) {
          setError('You need admin privileges to perform this action.');
        } else {
          await fetchFunctions();
        }
      } catch (err) {
        setError('Failed to verify admin privileges.');
      } finally {
        setLoading(false);
      }
    };

    const fetchFunctions = async () => {
      try {
        const response = await getUploadedFunctions();
        setFunctions(response.data.routes || []);
      } catch (err) {
        setError('Failed to fetch functions.');
      }
    };

    verifyAdmin();
  }, []);

  const handleToggle = async (endpoint, visible) => {
    try {
      await updateFunctionVisibility(endpoint, visible);
      setFunctions(prev =>
        prev.map(func =>
          func.endpoint === endpoint ? { ...func, visible } : func
        )
      );
    } catch (err) {
      setError('Failed to update function visibility.');
    }
  };

  if (loading) {
    return (
      <Layout title="Manage Calculation">
        <Typography>Loading...</Typography>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout title="Access Denied">
        <Typography color="error">{error}</Typography>
      </Layout>
    );
  }

  return (
    <Layout title="Manage Calculation" subTitle="Control Accessible Functions">
      <Box>
        <Typography variant="h6">Manage Functions:</Typography>
        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <List>
            {functions.map(func => (
              <ListItem key={func.endpoint}>
                <ListItemText primary={func.endpoint} secondary={func.url} />
                <Switch
                  checked={func.visible}
                  onChange={e => handleToggle(func.endpoint, e.target.checked)}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Layout>
  );
};

export default ManageCalculation;
