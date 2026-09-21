import {
  Box,
  Flex,
  Image,
  LinearProgress,
  LinkButton,
} from '@tonic-ui/react';
import { ensurePositiveNumber } from 'ensure-type';
import escape from 'lodash/escape';
import throttle from 'lodash/throttle';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import VirtualList from 'react-tiny-virtual-list';
import api from '@app/api';
import i18n from '@app/lib/i18n';
import { formatBytes } from '@app/lib/numeral';
import styles from './dashboard.styl';

/**
 * @param {{ show?: boolean, state?: object }} props
 */
function Dashboard({ show = false, state = {} }) {
  const viewerRef = useRef(null);
  const [visibleHeight, setVisibleHeight] = useState(0);
  const content = state.gcode?.content || '';
  const lines = useMemo(() => content
    .split('\n')
    .filter(line => line.trim().length > 0), [content]);

  const resizeVirtualList = useMemo(() => throttle(() => {
    const element = viewerRef.current;
    if (!element) {
      return;
    }

    const clientHeight = ensurePositiveNumber(element.clientHeight);
    if (clientHeight > 0) {
      setVisibleHeight(clientHeight);
    }
  }, 32), []);

  useEffect(() => {
    resizeVirtualList();
    window.addEventListener('resize', resizeVirtualList);
    return () => {
      window.removeEventListener('resize', resizeVirtualList);
      resizeVirtualList.cancel();
    };
  }, [resizeVirtualList]);

  useEffect(() => {
    if (show) {
      resizeVirtualList();
    }
  }, [resizeVirtualList, show]);

  const renderItem = useCallback(({ index, style }) => (
    <Box key={index} style={style}>
      <Box className={styles.line}>
        <Box as="span" className={`${styles.label} ${styles.labelDefault}`}>
          {index + 1}
        </Box>
        {escape(lines[index])}
      </Box>
    </Box>
  ), [lines]);

  const gcode = state.gcode || {};
  const filename = gcode.name || 'noname.nc';
  const filesize = gcode.ready ? formatBytes(gcode.size, 0) : '';
  const sent = gcode.sent || 0;
  const total = gcode.total || 0;
  const viewerStyle = {
    backgroundColor: '#fff',
    border: '1px solid transparent',
    borderColor: '#ccc',
    boxShadow: '0 1px 1px rgba(0, 0, 0, .05)',
    marginBottom: 10,
    display: show ? 'block' : 'none',
  };

  return (
    <Box className={styles.dashboard} style={viewerStyle}>
      <Box
        style={{
          backgroundColor: '#fafafa',
          borderBottom: '1px solid #ccc',
          color: '#333',
          height: 30,
          padding: '5px 10px',
        }}
      >
        {i18n._('G-code')}
      </Box>
      <Box style={{ height: 'calc(100% - 30px)', padding: 10 }}>
        <Flex justifyContent="space-between" style={{ marginBottom: 10 }}>
          <Box as="span" whiteSpace="nowrap">
            {gcode.ready && (
              <LinkButton
                onClick={() => {
                  api.downloadGCode();
                }}
                variant="inline"
              >
                <Box as="strong">{filename}</Box>
              </LinkButton>
            )}
            {!gcode.ready && i18n._('G-code not loaded')}
          </Box>
          <Box as="span" whiteSpace="nowrap">
            {filesize}
          </Box>
        </Flex>
        <Box position="relative" style={{ marginBottom: 10 }}>
          <LinearProgress
            aria-label={i18n._('G-code progress')}
            min={0}
            max={total}
            value={sent}
            variant="determinate"
          />
          {total > 0 && (
            <Box
              as="span"
              position="absolute"
              top={0}
              right={0}
              bottom={0}
              left={0}
              textAlign="center"
              className={styles.progressbarLabel}
            >
              {sent}&nbsp;/&nbsp;{total}
            </Box>
          )}
        </Box>
        <Box
          ref={viewerRef}
          className={`${styles.gcodeViewer} ${lines.length === 0 ? styles.gcodeViewerDisabled : ''}`}
        >
          {lines.length > 0 && (
            <VirtualList
              width="100%"
              height={visibleHeight}
              style={{ padding: '0 5px' }}
              itemCount={lines.length}
              itemSize={20}
              renderItem={renderItem}
              scrollToIndex={sent}
            />
          )}
          {lines.length === 0 && (
            <Box className={styles.absoluteCenter}>
              <Image src="images/logo-square-256x256.png" alt="" />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;
