import {
  Box,
  Space,
} from '@tonic-ui/react';
import React from 'react';
import Infotip from '@app/components/Infotip';
import i18n from '@app/lib/i18n';

const keypadInfotip = () => {
  const styles = {
    container: {
      fontFamily: 'Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif',
      textAlign: 'left',
    },
    axisDirection: {
      display: 'inline-block',
      marginRight: 10
    },
    divider: {
      borderTop: '1px solid #ccc',
      marginTop: 5,
      paddingTop: 5
    },
    kbd: {
      border: '1px solid #aaa',
      padding: '1px 4px',
      fontFamily: 'sans-serif',
      whiteSpace: 'nowrap'
    },
    icon: {
      minWidth: 10,
      textAlign: 'center'
    }
  };

  return (
    <Box style={styles.container}>
      <Box style={{ textAlign: 'left' }}>
        <Box>
          <Box sx={styles.axisDirection}>X+</Box>
          <kbd style={styles.kbd}>
            <i className="fa fa-angle-right" style={styles.icon} />
          </kbd>
          <Space width={8} />
          {i18n._('Right')}
        </Box>
        <Box>
          <Box sx={styles.axisDirection}>X-</Box>
          <kbd style={styles.kbd}>
            <i className="fa fa-angle-left" style={styles.icon} />
          </kbd>
          <Space width={8} />
          {i18n._('Left')}
        </Box>
        <Box>
          <Box sx={styles.axisDirection}>Y+</Box>
          <kbd style={styles.kbd}>
            <i className="fa fa-angle-up" style={styles.icon} />
          </kbd>
          <Space width={8} />
          {i18n._('Up')}
        </Box>
        <Box>
          <Box sx={styles.axisDirection}>Y-</Box>
          <kbd style={styles.kbd}>
            <i className="fa fa-angle-down" style={styles.icon} />
          </kbd>
          <Space width={8} />
          {i18n._('Down')}
        </Box>
        <Box>
          <Box sx={styles.axisDirection}>Z+</Box>
          <kbd style={styles.kbd}>
            <i className="fa fa-long-arrow-up" style={styles.icon} />
          </kbd>
          <Space width={8} />
          {i18n._('Page Up')}
        </Box>
        <Box>
          <Box sx={styles.axisDirection}>Z-</Box>
          <kbd style={styles.kbd}>
            <i className="fa fa-long-arrow-down" style={styles.icon} />
          </kbd>
          <Space width={8} />
          {i18n._('Page Down')}
        </Box>
        <Box>
          <Box sx={styles.axisDirection}>A+</Box>
          <kbd style={styles.kbd}>
            {' ] '}
          </kbd>
          <Space width={8} />
          {i18n._('Right Square Bracket')}
        </Box>
        <Box>
          <Box sx={styles.axisDirection}>A-</Box>
          <kbd style={styles.kbd}>
            {' [ '}
          </kbd>
          <Space width={8} />
          {i18n._('Left Square Bracket')}
        </Box>
      </Box>
      <Box>
        <Box style={styles.divider} />
      </Box>
      <Box>
        <Box>
          <Box className="table-form">
            <Box className="table-form-row table-form-row-dense">
              <Box className="table-form-col table-form-col-label">{i18n._('0.1x Move')}</Box>
              <Box className="table-form-col">
                <kbd style={styles.kbd}>{i18n._('Alt')}</kbd>
              </Box>
            </Box>
            <Box className="table-form-row table-form-row-dense">
              <Box className="table-form-col table-form-col-label">{i18n._('10x Move')}</Box>
              <Box className="table-form-col">
                <kbd style={styles.kbd}>{i18n._('⇧ Shift')}</kbd>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

/**
 * @param {{ show?: boolean, children?: React.ReactNode }} props
 * @returns {JSX.Element|React.ReactNode}
 */
function KeypadOverlay({ show = false, children }) {
  if (!show) {
    return children;
  }

  return (
    <Infotip
      content={keypadInfotip()}
      hideOnClick
      placement="bottom"
      style={{ padding: 0 }}
    >
      {children}
    </Infotip>
  );
}

export default KeypadOverlay;
