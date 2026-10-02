import { Box, useColorStyle } from '@tonic-ui/react';
import cx from 'classnames';
import React from 'react';
import styles from './index.styl';

/** @param {{ fixed?: boolean, className?: string, children?: React.ReactNode, [key: string]: unknown }} props */
function Header({ fixed = false, className, ...props }) {
  const [colorStyle] = useColorStyle();

  return (
    <Box
      {...props}
      backgroundColor={colorStyle.background.secondary}
      border={`1px solid ${colorStyle.divider}`}
      color={colorStyle.color.primary}
      className={cx(
        className,
        styles.widgetHeader,
        { [styles.widgetHeaderFixed]: fixed }
      )}
    />
  );
}

export default Header;
