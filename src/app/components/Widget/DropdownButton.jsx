import { Menu, MenuList, MenuToggle } from '@tonic-ui/react';
import React, { Children, cloneElement, isValidElement } from 'react';
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

    const onItemSelect = child.props.onSelect;
    return cloneElement(child, {
      onSelect: (eventKey, event) => {
        onItemSelect?.(eventKey, event);
        onSelect?.(eventKey, event);
      },
    });
  });

  return (
    <Menu
      placement={dropup ? 'top-start' : 'bottom-start'}
      style={{
        ...style,
        float: 'left',
      }}
    >
      <MenuToggle {...toggleProps} className={styles.widgetButton}>
        {toggle}
      </MenuToggle>
      <MenuList>{items}</MenuList>
    </Menu>
  );
}

export default DropdownButton;
