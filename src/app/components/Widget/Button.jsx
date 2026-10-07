import { ButtonLink, LinkButton } from '@tonic-ui/react';
import cx from 'classnames';
import React from 'react';
import styles from './index.styl';

/**
 * @param {{ className?: string, disabled?: boolean, href?: string, inverted?: boolean, onClick?: Function, sx?: object }} props
 * @returns {JSX.Element}
 */
function Button({ className, disabled, href, inverted = false, onClick, sx, ...props }) {
  const Component = href ? ButtonLink : LinkButton;

  return (
    <Component
      {...props}
      className={cx(className, styles.widgetButton)}
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
