import React, { useEffect, useState } from 'react';
import { Typography, Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { getCurrentUsername } from '../services/api';
import HeadBar from './HeadBar';
import FootBar from './FootBar';

const Layout = ({ children, title }) => {
  const location = useLocation();
  const [username, setUsername] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await getCurrentUsername();
        setUsername(response.data.username);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setUsername(null);
        } else {
          setError('Could not retrieve user information');
        }
      }
    };
    fetchUsername();
  }, []);

  return (
    <>
      <Box sx={{ backgroundColor: '#FFCB05', height: '20px', width: '100%' }}></Box>
      <HeadBar username={username} location={location} />

      {/* Main Content */}
      <Box sx={{ padding: '2rem', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {/* Title */}
        {title && (
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontFamily: "'Roboto Slab', serif",
              fontWeight: '400',
              marginBottom: '1rem',
              textAlign: 'center',  // Center align the title
            }}
          >
            {title}
          </Typography>
        )}

        {/* Error Message */}
        {error && <Typography color="error">{error}</Typography>}

        {/* Content */}
        {children}
      </Box>

      <Box sx={{ backgroundColor: '#FFCB05', height: '10px', width: '100%' }}></Box>

      <FootBar />
    </>
  );
};

export default Layout;
