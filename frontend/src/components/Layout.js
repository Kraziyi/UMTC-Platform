import React, { useEffect, useState } from 'react';
import { Typography, Box } from '@mui/material';
import HeadBar from './HeadBar';
import FootBar from './FootBar';
import { checkIfUserIsAdmin, getCurrentUsername } from '../services/api';

const Layout = ({ children, title, subTitle }) => {
  const [username, setUsername] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const usernameResponse = await getCurrentUsername();
        setUsername(usernameResponse.data.username);
        
        const adminResponse = await checkIfUserIsAdmin();
        setIsAdmin(adminResponse.data.is_admin);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setUsername(null);
          setIsAdmin(false);
        } else {
          setError('Could not retrieve user information');
        }
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <>
      <Box sx={{ backgroundColor: '#FFCB05', height: '20px', width: '100%' }}></Box>
      <HeadBar username={username} isAdmin={isAdmin} />

      {/* Main Content */}
      <Box sx={{ padding: '2rem', minHeight: '60vh', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        {/* Title Box */}
        {title && (
          <Box
            sx={{
              padding: '0.5rem',
              backgroundColor: '#FFCB05',
              borderRadius: '2px',
              width: 'auto',
              maxWidth: '20%',
              height: '40px',
              minWidth: '100px',
              marginLeft: '5rem',
              paddingTop: '18px',
              display: 'flex',
              justifyContent: 'space-between', 
              alignItems: 'center',
              boxSizing: 'border-box'
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontFamily: "'Open Sans', sans-serif",
                fontWeight: '1000',
                fontSize: '1.5rem',
                textAlign: 'center',
              }}
            >
              {title}
            </Typography>
          </Box>
        )}


        {/* Right Side Content (SubTitle and Content) */}
        <Box sx={{ flexBasis: '70%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
          {/* SubTitle */}
          {subTitle && (
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontFamily: "'Roboto', sans-serif",
                fontWeight: '1500',
                fontSize: '2rem',
                marginBottom: '0.5rem',
                color: '#00274C',
              }}
            >
              {subTitle}
            </Typography>
          )}
          <Box sx={{ backgroundColor: '#00274C', height: '3px', width: '100%', marginBottom: '20px' }}></Box>
          {/* Content */}
          {error && <Typography color="error">{error}</Typography>}
          {children}
        </Box>
      </Box>

      <Box sx={{ backgroundColor: '#FFCB05', height: '3px', width: '100%' }}></Box>

      <FootBar />
    </>
  );
};

export default Layout;
