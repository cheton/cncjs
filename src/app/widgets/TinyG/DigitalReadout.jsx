import { Box, Text } from '@tonic-ui/react';
import React from 'react';

/**
 * @param {{ children?: React.ReactNode, label: string, value: string }} props
 */
function DigitalReadout({ children, label, value }) {
  return (
    <Box alignItems="center" display="flex" mb="2x">
      <Text fontSize="2xl" width="8%">{label}</Text>
      <Box
        mr="2x"
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          borderRadius: '.25rem',
          fontSize: '.875rem',
          padding: '.25rem .375rem',
          textAlign: 'right',
        }}
        width="17%"
      >
        {value}
      </Box>
      <Box display="flex" sx={{ '> *': { minWidth: 0 } }} width="75%">
        {children}
      </Box>
    </Box>
  );
}

export default DigitalReadout;
