import { Box, Space, Text } from '@tonic-ui/react';
import React from 'react';

/**
 * @param {{ children?: React.ReactNode, label: string, value: number | string }} props
 */
function DigitalReadout({ children, label, value }) {
  return (
    <Box alignItems="center" display="flex" justifyContent="center">
      <Text fontFamily="mono" fontSize="1.5rem">{label}</Text>
      <Space width="2x" />
      <Box
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          fontSize: '.75rem',
          fontWeight: 'bold',
          padding: '.25rem',
          textAlign: 'right',
          width: '45px',
        }}
      >
        {value}
      </Box>
      <Space width="2x" />
      {children}
    </Box>
  );
}

export default DigitalReadout;
