import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Container, Paper, Button } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { getCurrentUsername } from '../services/api'; // 引入API服务

const Layout = ({ children, title }) => {
  const location = useLocation();
  const [username, setUsername] = useState(null);
  const [error, setError] = useState(null); // 用于存储错误信息

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await getCurrentUsername(); // 调用API服务
        setUsername(response.data.username); // 设置用户名
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

  const menuItems = [
    { text: 'Calculation', path: '/calculation' },
  ];

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ color: 'white', textDecoration: 'none', flexGrow: 1 }}
          >
            UMTC
          </Typography>
          {/* 显示用户名或登录按钮 */}
          {username ? (
            <Button
              color="inherit"
              component={Link}
              to="/user-info"
              sx={{
                color: location.pathname === '/user-info' ? '#f0f0f0' : 'white',
                textTransform: 'none',
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
              }}
            >
              Login
            </Button>
          )}
          {menuItems.map((item) => (
            <Button
              key={item.text}
              component={Link}
              to={item.path}
              color="inherit"
              sx={{
                color: location.pathname === item.path ? '#f0f0f0' : 'white',
                textTransform: 'none',
              }}
            >
              {item.text}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ marginTop: '2rem', padding: '2rem' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
          {error && <Typography color="error">{error}</Typography>} {/* 显示错误信息 */}
          {children}
        </Paper>
      </Container>
    </>
  );
};

export default Layout;
