import React, { useState } from 'react';
import { 
  Typography, Box, Paper, List, ListItem, 
  ListItemText, ListItemIcon, Divider, IconButton,
  Tooltip, Badge
} from '@mui/material';
import Layout from '../components/Layout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';

const Notifications = () => {
  // This would be replaced with actual API calls
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Calculation Completed',
      message: 'Your diffusion calculation has been completed successfully.',
      timestamp: '2024-03-20 14:30',
      read: false
    },
    {
      id: 2,
      type: 'error',
      title: 'Upload Failed',
      message: 'Failed to upload file: example.csv. Please try again.',
      timestamp: '2024-03-20 13:15',
      read: false
    },
    {
      id: 3,
      type: 'info',
      title: 'System Update',
      message: 'New features have been added to the ECM calculation module.',
      timestamp: '2024-03-19 16:45',
      read: true
    }
  ]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#f44336' }} />;
      case 'info':
        return <InfoIcon sx={{ color: '#2196f3' }} />;
      default:
        return <NotificationsIcon />;
    }
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  return (
    <Layout title="Notifications" subTitle="Stay Updated with Your Activities">
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          {notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <NotificationsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You're all caught up! Check back later for updates.
              </Typography>
            </Box>
          ) : (
            <List>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                      '&:hover': {
                        bgcolor: 'action.selected'
                      }
                    }}
                    secondaryAction={
                      <Box>
                        <Tooltip title="Mark as read">
                          <IconButton 
                            edge="end" 
                            onClick={() => handleMarkAsRead(notification.id)}
                            sx={{ mr: 1 }}
                          >
                            <Badge color="primary" variant="dot" invisible={notification.read}>
                              <NotificationsIcon />
                            </Badge>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            edge="end" 
                            onClick={() => handleDelete(notification.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  >
                    <ListItemIcon>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notification.timestamp}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Layout>
  );
};

export default Notifications; 