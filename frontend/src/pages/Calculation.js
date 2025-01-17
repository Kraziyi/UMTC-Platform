import React, { useEffect, useState } from 'react';
import { Typography, Box, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../components/CustomButton';
import Layout from '../components/Layout';
import { getUploadedFunctions } from '../services/api';

const Calculation = () => {
  const navigate = useNavigate();
  const [functions, setFunctions] = useState([]);
  const [error, setError] = useState(null);

  const handleDiffusionClick = () => {
    navigate('/calculation/diffusion');
  };

  useEffect(() => {
    const fetchFunctions = async () => {
      try {
        const response = await getUploadedFunctions();
        setFunctions(response.data.routes || []);
      } catch (err) {
        setError('Failed to fetch registered functions.');
      }
    };

    fetchFunctions();
  }, []);

  return (
    <Layout title={`Calculation`} subTitle={`List`}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        {/* Existing Diffusion Calculation Section */}
        <Typography variant="h6">Choose a Calculation Method:</Typography>
        <CustomButton onClick={handleDiffusionClick} color="primary">
          Diffusion
        </CustomButton>

        {/* New Section: Uploaded Functions */}
        <Box sx={{ width: '100%', marginTop: 4 }}>
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Uploaded Functions:
          </Typography>

          {error ? (
            <Typography color="error">{error}</Typography>
          ) : functions.length === 0 ? (
            <Typography>No functions uploaded yet.</Typography>
          ) : (
            <List>
              {functions.map((func, index) => (
                <ListItem key={index} sx={{ borderBottom: '1px solid #ddd' }}>
                  <ListItemText primary={func.endpoint} secondary={func.url} />
                  <CustomButton
                    color="secondary"
                    onClick={() => navigate(`/functions/${func.endpoint}`)}
                  >
                    Invoke
                  </CustomButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </Layout>
  );
};

export default Calculation;
