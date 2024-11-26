import React from 'react';
import { Box, Container, Link, Typography } from '@mui/material';
import footLogo from '../logo-horizontal-hex.png';

const FootBar = () => {
  return (
    <Box component="footer" sx={{ backgroundColor: '#f5f5f5', color: 'black', py: 6 }}>
      <Container>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 4,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flex: '1 1 150px',
              minWidth: '150px',
              flexDirection: 'column',
              textAlign: 'center',
            }}
          >
            <img
              src={footLogo}
              alt="Foot Logo"
              style={{
                transform: 'scale(2.5)',
                marginBottom: '10px',
                width: '150px',
                height: 'auto',
              }}
            />
            <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
              MECHANICAL ENGINEERING
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
              G.G. Brown Laboratory
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
              2350 Hayward
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
              Ann Arbor MI 48109
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
              Phone: +1 (734) 647-7000
            </Typography>
          </Box>


          <Box sx={{ flex: '1 1 200px', minWidth: '200px', paddingLeft: '200px' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#00274C' }}>
              MENU
            </Typography>
            <Box sx={{ marginY: 1 }}>
              <Link href="/login" color="inherit" underline="hover">
                Login
              </Link>
            </Box>
            <Box sx={{ marginY: 1 }}>
              <Link href="/calculation" color="inherit" underline="hover">
                Calculation
              </Link>
            </Box>
          </Box>

          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#00274C' }}>
              MORE LINKS
            </Typography>
            <Box sx={{ marginY: 1 }}>
              <Link href="https://www.umich.edu" color="inherit" underline="hover">
                U-M Home
              </Link>
            </Box>
            <Box sx={{ marginY: 1 }}>
              <Link href="https://lu.engin.umich.edu" color="inherit" underline="hover">
                Research Group
              </Link>
            </Box>
          </Box>


          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#00274C' }}>
              SOCIAL
            </Typography>
            <Box sx={{ marginY: 1 }}>
              <Link href="https://www.linkedin.com" color="inherit" underline="hover">
                LinkedIn
              </Link>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Footer copyright section */}
      <Box
        sx={{
          textAlign: 'center',
          py: 2,
          backgroundColor: '#f5f5f5',
        }}
      >
        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
          © 2024 UMTC - All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default FootBar;
