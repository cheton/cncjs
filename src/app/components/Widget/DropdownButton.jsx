import { Box, Dropdown, DropdownToggle } from '@tonic-ui/react';
import React, { Children, isValidElement } from 'react';
import styles from './index.styl';

/**
 * @param {{
 *   children: React.ReactNode,
 *   dropup?: boolean,
 *   onSelect?: (eventKey: unknown, event: React.SyntheticEvent) => void,
 *   style?: object,
 *   toggle: React.ReactNode,
 * }} props
 */
function DropdownButton({ children, dropup = false, onSelect, style, toggle, ...toggleProps }) {
  const items = Children.map(children, child => {
    if (!isValidElement(child)) {
      return child;
    }

    const {
      active = false,
      divider = false,
      header = false,
      eventKey,
      onClick,
      onSelect: onItemSelect,
      children: content,
      ...rest
    } = child.props;

    if (divider) {
      return { ...rest, type: 'divider' };
    }

    if (header) {
      return {
        ...rest,
        type: 'custom',
        content: (
          <Box
            {...rest}
            px="3x"
            py="2x"
            role="heading"
            fontSize="sm"
            color="text.secondary"
          >
            {content}
          </Box>
        ),
      };
    }

    return {
      ...rest,
      key: child.key,
      value: eventKey,
      content,
      props: {
        ...rest,
        selected: active,
        onClick: (event) => {
          onClick?.(event);
          onItemSelect?.(eventKey, event);
          onSelect?.(eventKey, event);
        },
      },
    };
  });

  return (
    <Dropdown
      placement={dropup ? 'top-start' : 'bottom-start'}
      style={{
        ...style,
        display: 'flex',
        alignSelf: 'stretch',
      }}
      items={items}
      renderItem={(item) => item?.content}
      renderToggle={() => (
        <DropdownToggle {...toggleProps} className={styles.widgetButton}>
          {toggle}
        </DropdownToggle>
      )}
    />
  );
}

export default DropdownButton;
