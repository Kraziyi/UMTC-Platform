import React from 'react';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

const CustomButton = ({ to, onClick, children, variant = 'contained', color = 'primary', sx = {}, ...props }) => {
  return (
    <Button
      component={to ? Link : 'button'}
      to={to || undefined}
      onClick={onClick}
      variant={variant}
      color={color}
      sx={{
        backgroundColor: color === 'primary' ? '#FFCB05' : color === 'secondary' ? '#F9B500' : '#E57373',
        color: '#00274C',
        textTransform: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '5px',
        ':hover': {
          backgroundColor: color === 'primary' ? '#F9B500' : color === 'secondary' ? '#FFC107' : '#EF5350',
        },
        whiteSpace: 'nowrap',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
