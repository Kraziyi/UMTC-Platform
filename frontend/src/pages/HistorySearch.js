import React, { useState, useEffect } from 'react';
import {
  Typography, Button, TextField, CircularProgress,
  List, ListItem, ListItemText, Box
} from '@mui/material';
import Layout from '../components/Layout';
import { getHistoriesByName } from '../services/api';
import { useNavigate } from 'react-router-dom';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const HistorySearch = () => {
  const [searchName, setSearchName] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchName.trim()) return;
    
    setLoading(true);
    try {
      const res = await getHistoriesByName(searchName);
      setResults(res.data.map(history => ({
        ...history,
        type: 'history',
        icon: <InsertDriveFileIcon sx={{ color: '#00274C' }} />,
        timestamp: new Date(history.timestamp).toLocaleDateString(),
        calculation_type: history.calculation_type
      })));
    } catch (err) {
      setError(`Search failed: ${err.response?.data?.error || 'Server error'}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Search Histories" subTitle="Find by Name">
      {/* 错误提示 */}
      {error && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* 搜索框 */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 3,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1
      }}>
        <TextField
          label="History Name"
          variant="outlined"
          fullWidth
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={!searchName.trim() || loading}
          sx={{
            bgcolor: '#00274C',
            color: 'white',
            '&:hover': { bgcolor: '#001a33' },
            minWidth: 120
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Search'}
        </Button>
      </Box>

      {/* 搜索结果 */}
      <List sx={{ 
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
        p: 2
      }}>
        {results.length === 0 && !loading && (
          <Typography variant="body1" sx={{ p: 2 }}>
            No histories found matching "{searchName}"
          </Typography>
        )}
        
        {results.map((item) => (
          <ListItem
            key={item.id}
            button
            onClick={() => navigate(`/history/${item.id}`)}
            sx={{
              mb: 1,
              borderRadius: 1,
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            {item.icon}
            <ListItemText
              primary={item.name || `${item.calculation_type}_${item.timestamp}_${item.id}`}
              secondary={`Created: ${item.timestamp}`}
              sx={{ ml: 2 }}
            />
          </ListItem>
        ))}
      </List>

      {/* 返回按钮 */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          sx={{
            color: '#00274C',
            borderColor: '#00274C',
            '&:hover': { borderColor: '#001a33' }
          }}
        >
          Back to Previous
        </Button>
      </Box>
    </Layout>
  );
};

export default HistorySearch;