import { ButtonBase } from '@tonic-ui/react';
import React, { useContext, useState } from 'react';
import Card from '@app/components/Card';
import { CollapsibleCardContext } from './context';

function Header({ children, style, ...props }) {
  const { collapsed, collapsing, toggle } = useContext(CollapsibleCardContext);
  const [hovered, setHovered] = useState(false);

  return (
    <ButtonBase
      aria-expanded={!collapsed}
      onClick={toggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width: '100%' }}
    >
      <Card.Header
        {...props}
        style={{
          backgroundColor: hovered ? 'rgba(0, 0, 0, 0.075)' : 'rgba(0, 0, 0, 0.05)',
          borderBottomWidth: (collapsed && !collapsing) ? 0 : 1,
          ...style,
        }}
      >
        {typeof children === 'function'
          ? children({ collapsed, collapsing, toggle, hovered })
          : children}
      </Card.Header>
    </ButtonBase>
  );
}

export default Header;
