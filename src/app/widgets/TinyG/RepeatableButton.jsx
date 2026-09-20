import { Button } from '@tonic-ui/react';
import React from 'react';
import Repeatable from 'react-repeatable';

/**
 * @param {{ children: React.ReactNode, onClick: () => void, sx?: object }} props
 */
function RepeatableButton({ children, onClick, sx = {} }) {
  return (
    <Repeatable
      tag={Button}
      repeatDelay={500}
      repeatInterval={Math.floor(1000 / 15)}
      onHold={onClick}
      onRelease={onClick}
      sx={sx}
    >
      {children}
    </Repeatable>
  );
}

export default RepeatableButton;
