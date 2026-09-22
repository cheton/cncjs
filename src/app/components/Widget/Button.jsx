import { ButtonLink, LinkButton } from '@tonic-ui/react';
import PropTypes from 'prop-types';
import React from 'react';

function Button({ disabled, href, inverted, onClick, sx, ...props }) {
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
          backgroundColor: 'gray:80',
          color: 'white:primary',
          _disabled: { opacity: 0.4 },
          _hover: { backgroundColor: 'gray:90' },
        }),
        ...sx,
      }}
    />
  );
}

Button.propTypes = {
  disabled: PropTypes.bool,
  href: PropTypes.string,
  onClick: PropTypes.func,
  role: PropTypes.string,
  style: PropTypes.object,
  tabIndex: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  inverted: PropTypes.bool
};

Button.defaultProps = {
  inverted: false
};

export default Button;
