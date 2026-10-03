import { ButtonLink, LinkButton } from '@tonic-ui/react';
import React from 'react';

/**
 * @param {{ disabled?: boolean, href?: string, inverted?: boolean, onClick?: Function, sx?: object }} props
 * @returns {JSX.Element}
 */
function Button({ disabled, href, inverted = false, onClick, sx, ...props }) {
  const Component = href ? ButtonLink : LinkButton;

  return (
    <Component
      {...props}
      disabled={disabled}
      href={href}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        onClick?.(event);
      }}
      sx={{
        alignItems: 'center',
        display: 'inline-flex',
        justifyContent: 'center',
        padding: '2px 8px',
        ...(inverted && {
          backgroundColor: 'actions.selected',
          color: 'text.primary',
          _disabled: { opacity: 0.4 },
          _hover: { backgroundColor: 'actions.selectedHovered' },
        }),
        ...sx,
      }}
    />
  );
}

export default Button;
