import React, { useEffect, useState } from 'react';
import { Typography, CircularProgress, List, ListItem, ListItemText, Paper } from '@mui/material';
import Layout from '../components/Layout';
import { viewHistory } from '../services/api';

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await viewHistory();
        setHistoryData(response.data);
      } catch (error) {
        setError('Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <Layout title="History">
        <CircularProgress />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="History">
        <Typography color="error">{error}</Typography>
      </Layout>
    );
  }

  return (
    <Layout title="User History">
      <Typography variant="h5" gutterBottom>User History</Typography>
      {historyData.length === 0 ? (
        <Typography>No history found.</Typography>
      ) : (
        <List>
          {historyData.map((item, index) => (
            <ListItem key={index}>
              <Paper sx={{ padding: 2, width: '100%' }}>
                <ListItemText
                  primary={`Input: ${item.input}`}
                  secondary={`Output: ${item.output} | Timestamp: ${item.timestamp}`}
                />
              </Paper>
            </ListItem>
          ))}
        </List>
      )}
    </Layout>
  );
};

export default History;
