import { Box } from '@tonic-ui/react';
import React from 'react';

/**
 * @param {{ children?: React.ReactNode }} props
 */
function Readout(props) {
  return (
    <Box
      {...props}
      sx={{
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: '.25rem',
        fontSize: '.75rem',
        padding: '.125rem .5rem',
      }}
    />
  );
}

export default Readout;
