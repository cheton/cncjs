import { Box } from '@tonic-ui/react';
import React from 'react';

const OverrideReadout = ({ children }) => (
  <Box
    sx={{
      width: '45px',
      padding: '1x',
      textAlign: 'right',
      display: 'inline-block',
      fontSize: '.75rem',
      fontWeight: 'bold',
      backgroundColor: 'rgba(0, 0, 0, 0.03)',
    }}
  >
    {children}
  </Box>
);

export default OverrideReadout;
