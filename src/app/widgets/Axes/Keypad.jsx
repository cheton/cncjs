import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Space,
} from '@tonic-ui/react';
import cx from 'classnames';
import { ensureArray } from 'ensure-type';
import _includes from 'lodash/includes';
import _uniqueId from 'lodash/uniqueId';
import React from 'react';
import styled from 'styled-components';
import RepeatableButton from '@app/components/RepeatableButton';
import {
  IMPERIAL_UNITS,
  IMPERIAL_STEPS,
  METRIC_UNITS,
  METRIC_STEPS
} from '@app/constants';
import controller from '@app/lib/controller';
import i18n from '@app/lib/i18n';
import { useAxes } from './context';
import styles from './index.styl';

const KeypadText = styled(Box)`
    position: relative;
    display: inline-block;
    vertical-align: baseline;
`;

const KeypadDirectionText = styled(KeypadText)`
    min-width: 10px;
`;

const KeypadSubscriptText = styled(KeypadText)`
    min-width: 10px;
    font-size: 80%;
    line-height: 0;
`;

/**
 * @returns {JSX.Element}
 */
function Keypad() {
  const {
    state: { canClick = false, units, axes = [], jog },
    onGetJogDistance,
    onJog,
    onMove,
    onSelectStep,
    onStepBackward,
    onStepForward,
  } = useAxes();
  const renderImperialMenuItems = () => {
    const imperialJogDistances = ensureArray(jog.imperial.distances);
    const imperialJogSteps = [
      ...imperialJogDistances,
      ...IMPERIAL_STEPS
    ];
    const step = jog.imperial.step;

    return imperialJogSteps.map((value, key) => {
      const active = (key === step);

      return (
        <MenuItem
          key={_uniqueId()}
          onClick={() => onSelectStep(key)}
          selected={active}
        >
          {value}
          <Space width={4} />
          <Box as="sub" sx={{ display: 'inline', fontSize: '80%', lineHeight: 0 }}>{i18n._('in')}</Box>
        </MenuItem>
      );
    });
  };

  const renderMetricMenuItems = () => {
    const metricJogDistances = ensureArray(jog.metric.distances);
    const metricJogSteps = [
      ...metricJogDistances,
      ...METRIC_STEPS
    ];
    const step = jog.metric.step;

    return metricJogSteps.map((value, key) => {
      const active = (key === step);

      return (
        <MenuItem
          key={_uniqueId()}
          onClick={() => onSelectStep(key)}
          selected={active}
        >
          {value}
          <Space width={4} />
          <Box as="sub" sx={{ display: 'inline', fontSize: '80%', lineHeight: 0 }}>{i18n._('mm')}</Box>
        </MenuItem>
      );
    });
  };

  const canChangeUnits = canClick;
  const canChangeStep = canClick;
  const imperialJogDistances = ensureArray(jog.imperial.distances);
  const metricJogDistances = ensureArray(jog.metric.distances);
  const imperialJogSteps = [
    ...imperialJogDistances,
    ...IMPERIAL_STEPS
  ];
  const metricJogSteps = [
    ...metricJogDistances,
    ...METRIC_STEPS
  ];
  const canStepForward = canChangeStep && (
    (units === IMPERIAL_UNITS && (jog.imperial.step < imperialJogSteps.length - 1)) ||
            (units === METRIC_UNITS && (jog.metric.step < metricJogSteps.length - 1))
  );
  const canStepBackward = canChangeStep && (
    (units === IMPERIAL_UNITS && (jog.imperial.step > 0)) ||
            (units === METRIC_UNITS && (jog.metric.step > 0))
  );
  const canClickX = canClick && _includes(axes, 'x');
  const canClickY = canClick && _includes(axes, 'y');
  const canClickXY = canClickX && canClickY;
  const canClickZ = canClick && _includes(axes, 'z');
  const highlightX = canClickX && (jog.keypad || jog.axis === 'x');
  const highlightY = canClickY && (jog.keypad || jog.axis === 'y');
  const highlightZ = canClickZ && (jog.keypad || jog.axis === 'z');

  return (
    <Box className={styles.keypad}>
      <Flex>
        <Box flex="8 1 0%">
          <Box className={styles.rowSpace}>
            <Flex>
              <Box flex="1 1 0%">
                <Box className={styles.colSpace}>
                  <Button
                    aria-label="Move X negative Y positive"
                    size="sm"
                    className={styles.btnKeypad}
                    onClick={() => {
                      const distance = onGetJogDistance();
                      onJog({ X: -distance, Y: distance });
                    }}
                    disabled={!canClickXY}
                    title={i18n._('Move X- Y+')}
                  >
                    <i aria-hidden="true" className={cx('fa', 'fa-arrow-circle-up', styles['rotate--45deg'])} style={{ fontSize: 16 }} />
                  </Button>
                </Box>
              </Box>
              <Box flex="1 1 0%">
                <Box className={styles.colSpace}>
                  <Button
                    aria-label="Move Y positive"
                    size="sm"
                    className={cx(
                      styles.btnKeypad,
                      { [styles.highlight]: highlightY }
                    )}
                    onClick={() => {
                      const distance = onGetJogDistance();
                      onJog({ Y: distance });
                    }}
                    disabled={!canClickY}
                    title={i18n._('Move Y+')}
                  >
                    <KeypadText>Y</KeypadText>
                    <KeypadDirectionText>+</KeypadDirectionText>
                  </Button>
                </Box>
              </Box>
              <Box flex="1 1 0%">
                <Box className={styles.colSpace}>
                  <Button
                    aria-label="Move X positive Y positive"
                    size="sm"
                    className={styles.btnKeypad}
                    onClick={() => {
                      const distance = onGetJogDistance();
                      onJog({ X: distance, Y: distance });
                    }}
                    disabled={!canClickXY}
                    title={i18n._('Move X+ Y+')}
                  >
                    <i aria-hidden="true" className={cx('fa', 'fa-arrow-circle-up', styles['rotate-45deg'])} style={{ fontSize: 16 }} />
                  </Button>
                </Box>
              </Box>
              <Box flex="1 1 0%">
                <Box className={styles.colSpace}>
                  <Button
                    aria-label="Move Z positive"
                    size="sm"
                    className={cx(
                      styles.btnKeypad,
                      { [styles.highlight]: highlightZ }
                    )}
                    onClick={() => {
                      const distance = onGetJogDistance();
                      onJog({ Z: distance });
                    }}
                    disabled={!canClickZ}
                    title={i18n._('Move Z+')}
                  >
                    <KeypadText>Z</KeypadText>
                    <KeypadDirectionText>+</KeypadDirectionText>
                  </Button>
                </Box>
              </Box>
            </Flex>
          </Box>
          <Box className={styles.rowSpace}>
            <Flex>
              <Box flex="1 1 0%">
                <Box className={styles.colSpace}>
                  <Button
                    aria-label="Move X negative"
                    size="sm"
                    className={cx(
                      styles.btnKeypad,
                      { [styles.highlight]: highlightX }
                    )}
                    onClick={() => {
                      const distance = onGetJogDistance();
                      onJog({ X: -distance });
                    }}
                    disabled={!canClickX}
                    title={i18n._('Move X-')}
                  >
                    <KeypadText>X</KeypadText>
                    <KeypadDirectionText>-</KeypadDirectionText>
                  </Button>
                </Box>
              </Box>
              <Box flex="1 1 0%">
                <Box className={styles.colSpace}>
                  <Button
                    size="sm"
                    className={styles.btnKeypad}
                    onClick={() => onMove({ X: 0, Y: 0 })}
                    disabled={!canClickXY}
                    title={i18n._('Move To XY Zero (G0 X0 Y0)')}
                  >
                    <KeypadText>X</KeypadText>
                    <KeypadSubscriptText>0</KeypadSubscriptText>
                    <KeypadText>Y</KeypadText>
                    <KeypadSubscriptText>0</KeypadSubscriptText>
                  </Button>
                </Box>
              </Box>
              <Box flex="1 1 0%">
                <Box className={styles.colSpace}>
                  <Button
                    aria-label="Move X positive"
                    size="sm"
                    className={cx(
                      styles.btnKeypad,
                      { [styles.highlight]: highlightX }
                    )}
                    onClick={() => {
                      const distance = onGetJogDistance();
                      onJog({ X: distance });
                    }}
                    disabled={!canClickX}
                    title={i18n._('Move X+')}
                  >
                    <KeypadText>X</KeypadText>
                    <KeypadDirectionText>+</KeypadDirectionText>
                  </Button>
                </Box>
              </Box>
              <Box flex="1 1 0%">
                <Box className={styles.colSpace}>
                  <Button
                    size="sm"
                    className={styles.btnKeypad}
                    onClick={() => onMove({ Z: 0 })}
                    disabled={!canClickZ}
                    title={i18n._('Move To Z Zero (G0 Z0)')}
                  >
                    <KeypadText>Z</KeypadText>
                    <KeypadSubscriptText>0</KeypadSubscriptText>
                  </Button>
                </Box>
              </Box>
            </Flex>
          </Box>
          <Box className={styles.rowSpace}>
            <Flex>
              <Box flex="1 1 0%">
                <Box className={styles.colSpace}>
                  <Button
                    aria-label="Move X negative Y negative"
                    size="sm"
                    className={styles.btnKeypad}
                    onClick={() => {
                      const distance = onGetJogDistance();
                      onJog({ X: -distance, Y: -distance });
                    }}
                    disabled={!canClickXY}
                    title={i18n._('Move X- Y-')}
                  >
                    <i aria-hidden="true" className={cx('fa', 'fa-arrow-circle-down', styles['rotate-45deg'])} style={{ fontSize: 16 }} />
                  </Button>
                </Box>
              </Box>
              <Box flex="1 1 0%">
                <Box className={styles.colSpace}>
                  <Button
                    aria-label="Move Y negative"
                    size="sm"
                    className={cx(
                      styles.btnKeypad,
                      { [styles.highlight]: highlightY }
                    )}
                    onClick={() => {
                      const distance = onGetJogDistance();
                      onJog({ Y: -distance });
                    }}
                    disabled={!canClickY}
                    title={i18n._('Move Y-')}
                  >
                    <KeypadText>Y</KeypadText>
                    <KeypadDirectionText>-</KeypadDirectionText>
                  </Button>
                </Box>
              </Box>
              <Box flex="1 1 0%">
                <Box className={styles.colSpace}>
                  <Button
                    aria-label="Move X positive Y negative"
                    size="sm"
                    className={styles.btnKeypad}
                    onClick={() => {
                      const distance = onGetJogDistance();
                      onJog({ X: distance, Y: -distance });
                    }}
                    disabled={!canClickXY}
                    title={i18n._('Move X+ Y-')}
                  >
                    <i aria-hidden="true" className={cx('fa', 'fa-arrow-circle-down', styles['rotate--45deg'])} style={{ fontSize: 16 }} />
                  </Button>
                </Box>
              </Box>
              <Box flex="1 1 0%">
                <Box className={styles.colSpace}>
                  <Button
                    aria-label="Move Z negative"
                    size="sm"
                    className={cx(
                      styles.btnKeypad,
                      { [styles.highlight]: highlightZ }
                    )}
                    onClick={() => {
                      const distance = onGetJogDistance();
                      onJog({ Z: -distance });
                    }}
                    disabled={!canClickZ}
                    title={i18n._('Move Z-')}
                  >
                    <KeypadText>Z</KeypadText>
                    <KeypadDirectionText>-</KeypadDirectionText>
                  </Button>
                </Box>
              </Box>
            </Flex>
          </Box>
        </Box>
        <Box flex="4 1 0%">
          <Box className={styles.rowSpace}>
            <Menu
              style={{
                width: '100%'
              }}
            >
              <MenuButton
                disabled={!canChangeUnits}
                style={{
                  textAlign: 'right',
                  width: '100%'
                }}
              >
                {units === IMPERIAL_UNITS && i18n._('G20 (inch)')}
                {units === METRIC_UNITS && i18n._('G21 (mm)')}
              </MenuButton>
              <MenuList>
                <Box
                  px="3x"
                  py="2x"
                  role="heading"
                  fontSize="sm"
                  color="text.secondary"
                >
                  {i18n._('Units')}
                </Box>
                <MenuItem
                  selected={units === IMPERIAL_UNITS}
                  onClick={() => {
                    controller.command('gcode', 'G20');
                  }}
                >
                  {i18n._('G20 (inch)')}
                </MenuItem>
                <MenuItem
                  selected={units === METRIC_UNITS}
                  onClick={() => {
                    controller.command('gcode', 'G21');
                  }}
                >
                  {i18n._('G21 (mm)')}
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
          <Box className={styles.rowSpace}>
            {units === IMPERIAL_UNITS && (
              <Menu
                style={{
                  width: '100%'
                }}
              >
                <MenuButton
                  disabled={!canChangeStep}
                  style={{
                    textAlign: 'right',
                    width: '100%'
                  }}
                >
                  {imperialJogSteps[jog.imperial.step]}
                  <Space width={4} />
                  <Box as="sub" sx={{ display: 'inline', fontSize: '80%', lineHeight: 0 }}>{i18n._('in')}</Box>
                </MenuButton>
                <MenuList
                  style={{
                    maxHeight: 150,
                    overflowY: 'auto'
                  }}
                >
                  <Box
                    px="3x"
                    py="2x"
                    role="heading"
                    fontSize="sm"
                    color="text.secondary"
                  >
                    {i18n._('Imperial')}
                  </Box>
                  {renderImperialMenuItems()}
                </MenuList>
              </Menu>
            )}
            {units === METRIC_UNITS && (
              <Menu
                style={{
                  width: '100%'
                }}
              >
                <MenuButton
                  disabled={!canChangeStep}
                  style={{
                    textAlign: 'right',
                    width: '100%'
                  }}
                >
                  {metricJogSteps[jog.metric.step]}
                  <Space width={4} />
                  <Box as="sub" sx={{ display: 'inline', fontSize: '80%', lineHeight: 0 }}>{i18n._('mm')}</Box>
                </MenuButton>
                <MenuList
                  style={{
                    maxHeight: 150,
                    overflowY: 'auto'
                  }}
                >
                  <Box
                    px="3x"
                    py="2x"
                    role="heading"
                    fontSize="sm"
                    color="text.secondary"
                  >
                    {i18n._('Metric')}
                  </Box>
                  {renderMetricMenuItems()}
                </MenuList>
              </Menu>
            )}
          </Box>
          <Box className={styles.rowSpace}>
            <Flex>
              <Box flex="1 1 0%">
                <RepeatableButton
                  aria-label="Decrease step size"
                  disabled={!canStepBackward}
                  style={{ marginRight: 2.5 }}
                  onClick={onStepBackward}
                >
                  <i aria-hidden="true" className="fa fa-minus" />
                </RepeatableButton>
              </Box>
              <Box flex="1 1 0%">
                <RepeatableButton
                  aria-label="Increase step size"
                  disabled={!canStepForward}
                  onClick={onStepForward}
                >
                  <i aria-hidden="true" className="fa fa-plus" />
                </RepeatableButton>
              </Box>
            </Flex>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}

export default Keypad;
