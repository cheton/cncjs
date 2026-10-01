import { Box } from '@tonic-ui/react';
import cx from 'classnames';
import React from 'react';
import styles from './index.styl';

/** @param {{ fixed?: boolean, className?: string, children?: React.ReactNode, [key: string]: unknown }} props */
function Header({ fixed = false, className, ...props }) {
  return (
    <Box
      {...props}
      className={cx(
        className,
        styles.widgetHeader,
        { [styles.widgetHeaderFixed]: fixed }
      )}
    />
  );
}

export default Header;
