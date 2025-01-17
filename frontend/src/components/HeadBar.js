import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { ReactComponent as HeadLogo } from '../logo.svg';

const HeadBar = ({ username, isAdmin }) => {
  const location = useLocation();

  return (
    <AppBar position="static" sx={{ backgroundColor: '#00274C', height: '65px' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Logo and Text Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '100px',
          }}
        >
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <HeadLogo
              style={{
                height: '50px',
                width: '50px',
                marginRight: '15px',
                cursor: 'pointer',
              }}
            />
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontFamily: "'Playfair Display', serif",
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '1.5rem',
              }}
            >
              UMTC
            </Typography>
          </Link>
        </Box>

        {/* User or Login Button */}
        {username ? (
          <Button
            color="inherit"
            component={Link}
            to="/user"
            sx={{
              color: location.pathname === '/user' ? '#f0f0f0' : 'white',
              textTransform: 'none',
              marginLeft: '800px',
              marginRight: '60px',
            }}
          >
            {username}
          </Button>
        ) : (
          <Button
            color="inherit"
            component={Link}
            to="/login"
            sx={{
              color: location.pathname === '/login' ? '#f0f0f0' : 'white',
              textTransform: 'none',
              marginLeft: '900px',
              marginRight: '40px',
            }}
          >
            Login
          </Button>
        )}

        {/* Calculation Button */}
        <Button
          color="inherit"
          component={Link}
          to="/calculation"
          sx={{
            color: location.pathname === '/calculation' ? '#f0f0f0' : 'white',
            textTransform: 'none',
            marginRight: '60px',
          }}
        >
          Calculation
        </Button>

        {/* File Upload Button (visible only for admins) */}
        {isAdmin && (
          <Button
            color="inherit"
            component={Link}
            to="/file-upload"
            sx={{
              color: 'white',
              textTransform: 'none',
              marginRight: '60px',
            }}
          >
            Upload File
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default HeadBar;
