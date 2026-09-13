import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import Anchor from '../Anchor';
import styles from './index.styl';

function Button({ inverted, className, ...props }) {
  return (
    <Anchor
      {...props}
      className={cx(className, styles.widgetButton, {
        [styles.disabled]: !!props.disabled,
        [styles.inverted]: inverted
      })}
    />
  );
}

Button.propTypes = {
  ...Anchor.propTypes,
  inverted: PropTypes.bool
};

Button.defaultProps = {
  ...Anchor.defaultProps,
  inverted: false
};

export default Button;
