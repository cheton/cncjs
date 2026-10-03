import { Box, MenuDivider, MenuItem } from '@tonic-ui/react';
import React from 'react';

/**
 * @param {{
 *   active?: boolean,
 *   children?: React.ReactNode,
 *   disabled?: boolean,
 *   divider?: boolean,
 *   eventKey?: unknown,
 *   header?: boolean,
 *   onClick?: (event: React.SyntheticEvent) => void,
 *   onSelect?: (eventKey: unknown, event: React.SyntheticEvent) => void,
 * }} props
 */
function DropdownMenuItem({
  active = false,
  children,
  disabled = false,
  divider = false,
  eventKey,
  header = false,
  onClick,
  onSelect,
  ...props
}) {
  if (divider) {
    return <MenuDivider {...props} />;
  }

  if (header) {
    return (
      <Box
        {...props}
        px="3x"
        py="2x"
        role="heading"
        fontSize="sm"
        color="text.secondary"
      >
        {children}
      </Box>
    );
  }

  return (
    <MenuItem
      {...props}
      disabled={disabled}
      selected={active}
      onClick={event => {
        onClick?.(event);
        onSelect?.(eventKey, event);
      }}
    >
      {children}
    </MenuItem>
  );
}

export default DropdownMenuItem;
