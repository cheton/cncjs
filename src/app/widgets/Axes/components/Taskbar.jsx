import React from 'react';
import { Box } from '@tonic-ui/react';
import TaskbarButton from './TaskbarButton';

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

Taskbar.Button = TaskbarButton;

export default Taskbar;
