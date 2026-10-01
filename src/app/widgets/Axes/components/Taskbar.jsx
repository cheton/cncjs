import React from 'react';
import { Box } from '@tonic-ui/react';

/**
 * @param {{ children?: React.ReactNode, style?: object }} props
 * @returns {JSX.Element}
 */
function Taskbar({ children, style, ...props }) {
  return (
    <Box
      {...props}
      style={{
        borderTop: '1px solid #ddd',
        ...style
      }}
    >
      {children}
    </Box>
  );
}

export default Taskbar;
