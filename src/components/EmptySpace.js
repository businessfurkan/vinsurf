import React from 'react';
import { Paper, Box } from '@mui/material';

const EmptySpace = () => {
  return (
    <Paper elevation={0} sx={{ 
      width: '48%', 
      maxWidth: '500px',
      borderRadius: 2,
      p: 2,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Box sx={{ height: '100%', minHeight: '300px' }} />
    </Paper>
  );
};

export default EmptySpace;
