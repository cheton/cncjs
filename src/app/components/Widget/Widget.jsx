import { Box } from '@tonic-ui/react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './index.styl';

function Widget({ borderless, fullscreen, className, ...props }) {
  return (
    <Box
      role="region"
      {...props}
      className={cx(
        className,
        styles.widget,
        { [styles.widgetBorderless]: borderless },
        { [styles.widgetFullscreen]: fullscreen }
      )}
    />
  );
}

Widget.propTypes = {
  borderless: PropTypes.bool,
  fullscreen: PropTypes.bool
};

Widget.defaultProps = {
  borderless: false,
  fullscreen: false
};

export default Widget;
