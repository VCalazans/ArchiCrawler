import React from 'react';
import { Box, Typography } from '@mui/material';

const TestFlowBuilderPage: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Construtor de Fluxos
      </Typography>
      <Typography variant="body1">
        Interface visual para criar fluxos de teste drag-and-drop.
      </Typography>
    </Box>
  );
};

export default TestFlowBuilderPage; 