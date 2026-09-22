import { Button } from '@tonic-ui/react';
import React from 'react';
import Repeatable from 'react-repeatable';

function RepeatableButton({ tag = Button, onClick, ...props }) {
  return (
    <Repeatable
      tag={tag}
      repeatDelay={500}
      repeatInterval={Math.floor(1000 / 15)}
      onHold={onClick}
      onRelease={onClick}
      {...props}
    />
  );
}

export default RepeatableButton;
