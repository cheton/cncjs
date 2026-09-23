import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Flex,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  Space,
  Text,
  TextLabel,
} from '@tonic-ui/react';
import chainedFunction from 'chained-function';
import { ensureArray, ensurePositiveNumber } from 'ensure-type';
import _find from 'lodash/find';
import _get from 'lodash/get';
import _includes from 'lodash/includes';
import _isEqual from 'lodash/isEqual';
import _set from 'lodash/set';
import memoize from 'micro-memoize';
import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import { Form, Field, FormSpy } from 'react-final-form';
import { useTransition, animated } from 'react-spring'; // TODO: remove
import {
  GRBL,
  MARLIN,
  SMOOTHIE,
  TINYG,
} from '@app/constants/controller';
import {
  CONNECTION_TYPE_SERIAL,
  CONNECTION_TYPE_SOCKET,
  CONNECTION_STATE_CONNECTED,
  CONNECTION_STATE_DISCONNECTED,
} from '@app/constants/connection';
import useConnection from '@app/hooks/useConnection';
import usePrevious from '@app/hooks/usePrevious';
import controller from '@app/lib/controller';
import i18n from '@app/lib/i18n';
import portal from '@app/lib/portal';
import {
  useSerialBaudRatesQuery,
  useSerialPortsQuery,
} from '@app/queries/serialport';
import useWidgetConfig from '@app/widgets/shared/useWidgetConfig';
import { composeValidators, required } from '@app/widgets/shared/validations';

// @param {string} options.path
// @param {number} options.baudRate
// @param {boolean} options.rtscts
// @param {boolean} options.pin.dtr
// @param {boolean} options.pin.rts
const validateSerialConnectionOptions = (options) => {
  const { path, baudRate, rtscts, pin } = { ...options };
  return (!!path) && (baudRate > 0) && (rtscts !== undefined) && (pin?.dtr !== undefined) && (pin?.rts !== undefined);
};

// @param {string} options.host
// @param {number} options.port
const validateSocketConnectionOptions = (options) => {
  const { host, port } = { ...options };
  return !!host && (port > 0);
};

// [Hook] The useReady hook returns a boolean value that indicates whether it is ready to connect.
// @param {array} ports
// @param {array} baudRates
const useSerialConnectivity = ({ ports, baudRates }) => {
  const isPortReadyRef = useRef(false);
  const isBaudRateReadyRef = useRef(false);
  const prevPorts = usePrevious(ports, []);
  const prevBaudRates = usePrevious(baudRates, []);

  if (prevPorts.length === 0 && ports.length > 0) {
    isPortReadyRef.current = true;
  }
  if (prevBaudRates.length === 0 && baudRates.length > 0) {
    isBaudRateReadyRef.current = true;
  }

  const isPortReady = isPortReadyRef.current;
  const isBaudRateReady = isBaudRateReadyRef.current;
  const isReady = (isPortReady && isBaudRateReady);

  return isReady;
};

const validatePortNumber = (min = 1, max = 65535) => value => {
  const port = Number(value);

  return Number.isFinite(port) && port >= min && port <= max
    ? undefined
    : i18n._('Invalid port number. Specify a port number from {{min}} to {{max}}.', { min, max });
};

const getMemoizedInitialValues = memoize((options) => {
  const {
    config,
    serialPorts,
    serialBaudRates,
  } = { ...options };

  const initialValues = {
    controller: {
      type: config.get('controller.type'),
    },
    connection: {
      type: config.get('connection.type'),
      serial: {
        path: config.get('connection.serial.path'),
        baudRate: config.get('connection.serial.baudRate'),
        rtscts: config.get('connection.serial.rtscts'),
        pin: {
          dtr: config.get('connection.serial.pin.dtr'),
          rts: config.get('connection.serial.pin.rts'),
        },
      },
      socket: {
        host: config.get('connection.socket.host'),
        port: config.get('connection.socket.port'),
      },
    },
    autoReconnect: config.get('autoReconnect'),
  };

  if (!_find(serialPorts, { path: _get(initialValues, 'connection.serial.path') })) {
    _set(initialValues, 'connection.serial.path', null);
  }

  if (!_includes(serialBaudRates, _get(initialValues, 'connection.serial.baudRate'))) {
    _set(initialValues, 'connection.serial.baudRate', null);
  }

  return initialValues;
}, {
  isEqual: _isEqual,
});

// TODO: use transition component
function DismissibleTransition({
  dismissOnTimeout = 0,
  onShowStart = () => {}, // Triggered when the show animation start.
  onShowEnd = () => {}, // Triggered when the show animation finish.
  onDismissStart = () => {}, // Triggered when the dismiss animation start.
  onDismissEnd = () => {}, // Triggered when the dismiss animation finish.
  children,
}) {
  const containerRef = useRef(null);
  const timerIdRef = useRef(null);
  const [isShow, setShow] = useState(true);
  const transitions = useTransition(isShow, {
    from: {
      opacity: 0,
      height: 0,
      transform: 'translateY(0) scale(1)',
    },
    enter: () => (next) => {
      return next({
        opacity: 1,
        height: containerRef.current?.getBoundingClientRect().height,
        transform: 'translateY(0) scale(1)',
      });
    },
    leave: {
      opacity: 0,
      height: 0,
      transform: 'translateY(0) scale(0.9)',
    },
    config: {
      duration: 150,
    },
    onStart: () => {
      if (isShow) {
        onShowStart();
      } else {
        onDismissStart();
      }
    },
    onRest: () => {
      if (isShow) {
        onShowEnd();
      } else {
        onDismissEnd();
      }
    },
  });
  useEffect(() => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }

    if (dismissOnTimeout > 0) {
      timerIdRef.current = setTimeout(() => {
        setShow(false);
      }, dismissOnTimeout);
    }

    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, [dismissOnTimeout]);
  const onMouseEnter = () => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  };
  const onMouseLeave = () => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }

    if (dismissOnTimeout > 0) {
      timerIdRef.current = setTimeout(() => {
        setShow(false);
      }, dismissOnTimeout);
    }
  };
  const show = () => {
    setShow(true);
  };
  const dismiss = () => {
    setShow(false);
  };

  return (
    <>
      {transitions(({ opacity, height, transform }, item) => (
        item && (
          <animated.div
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{
              height,
              opacity,
            }}
          >
            <animated.div
              ref={containerRef}
              style={{
                transform,
                pointerEvents: 'auto',
              }}
            >
              {typeof children === 'function' ? children({ isShow, show, dismiss }) : children}
            </animated.div>
          </animated.div>
        )
      ))}
    </>
  );
}

function Connection() {
  const {
    state: connectionState,
    type,
    ident,
    options,
    error,
    isOpening,
    isClosing,
    open: openConnection,
    close: closeConnection,
  } = useConnection();
  const {
    data: ports,
    isFetching: isFetchingSerialPorts,
    refetch: fetchSerialPorts,
  } = useSerialPortsQuery();
  const {
    data: baudRates,
    isFetching: isFetchingSerialBaudRates,
    refetch: fetchSerialBaudRates,
  } = useSerialBaudRatesQuery();
  const connection = { type, ident, options, error };
  const serialPorts = ensureArray(ports);
  const serialBaudRates = ensureArray(baudRates);
  const isConnected = (connectionState === CONNECTION_STATE_CONNECTED);
  const isConnecting = isOpening;
  const isDisconnected = (connectionState === CONNECTION_STATE_DISCONNECTED) ||
    (connectionState === 'error' && !isOpening && !isClosing);
  const isDisconnecting = isClosing;
  const config = useWidgetConfig();
  const initialValues = getMemoizedInitialValues({ config, serialPorts, serialBaudRates });
  const canRefreshSerialPorts = isDisconnected && !isFetchingSerialPorts;
  const canRefreshSerialBaudRates = isDisconnected && !isFetchingSerialBaudRates;
  const autoReconnectedRef = useRef(false);
  const isSerialConnectionReady = useSerialConnectivity({
    ports: serialPorts,
    baudRates: serialBaudRates,
  });
  const isSocketConnectionReady = true;

  // Alert notification
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (!connection.error) {
      return;
    }

    if (connection.type === CONNECTION_TYPE_SERIAL) {
      setAlert({
        severity: 'error',
        title: i18n._('Error opening serial port'),
        message: connection.error,
        duration: 5000,
      });
    } else if (connection.type === CONNECTION_TYPE_SOCKET) {
      setAlert({
        severity: 'error',
        title: i18n._('Error opening socket'),
        message: connection.error,
        duration: 5000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection.error]);

  { // Auto reconnect for serial connection
    useEffect(() => {
      const connectionType = config.get('connection.type');
      if (connectionType !== CONNECTION_TYPE_SERIAL) {
        return;
      }

      if (!isSerialConnectionReady) {
        return;
      }

      if (autoReconnectedRef.current) {
        return;
      }

      const autoReconnect = config.get('autoReconnect');
      if (!autoReconnect) {
        return;
      }

      const { path, baudRate, rtscts, pin } = config.get('connection.serial');
      if (!validateSerialConnectionOptions({ path, baudRate, rtscts, pin })) {
        return;
      }

      const controllerType = config.get('controller.type');
      const options = {};
      _set(options, 'controller.type', controllerType);
      _set(options, 'connection.type', connectionType);
      _set(options, 'connection.options', { path, baudRate, rtscts, pin });

      openConnection(options).catch(() => {});

      // Set autoReconnectedRef.current to true when attempting to connect.
      autoReconnectedRef.current = true;
    }, [isSerialConnectionReady, config, openConnection]);
  }

  { // Auto reconnect for socket connection
    useEffect(() => {
      const connectionType = config.get('connection.type');
      if (connectionType !== CONNECTION_TYPE_SOCKET) {
        return;
      }

      if (!isSocketConnectionReady) {
        return;
      }

      if (autoReconnectedRef.current) {
        return;
      }

      const autoReconnect = config.get('autoReconnect');
      if (!autoReconnect) {
        return;
      }

      const { host, port } = config.get('connection.socket');
      if (!validateSocketConnectionOptions({ host, port })) {
        return;
      }

      const options = {};
      const controllerType = config.get('controller.type');
      _set(options, 'controller.type', controllerType);
      _set(options, 'connection.type', connectionType);
      _set(options, 'connection.options', { host, port });

      openConnection(options).catch(() => {});

      // Set autoReconnectedRef.current to true when attempting to connect.
      autoReconnectedRef.current = true;
    }, [isSocketConnectionReady, config, openConnection]);
  }

  return (
    <>
      <Box>
        {alert && (
          <DismissibleTransition
            dismissOnTimeout={alert?.duration}
            onDismissEnd={() => {
              setAlert(null);
            }}
          >
            {({ isShow, show, dismiss }) => {
              return (
                <Alert
                  severity={alert?.severity}
                  isClosable
                  onClose={dismiss}
                >
                  <Box mb="1x">
                    <Text fontWeight="bold">{alert?.title}</Text>
                  </Box>
                  <Text mr="-9x">
                    {alert?.message}
                  </Text>
                </Alert>
              );
            }}
          </DismissibleTransition>
        )}
      </Box>
      <Box
        p="3x"
        style={{
          width: '100%',
        }}
      >
        <Form
          initialValues={initialValues}
          onSubmit={(values) => {
            // No submit handler required
          }}
          subscription={{}}
        >
          {({ form }) => (
            <>
              <Field name="controller.type">
                {({ input, meta }) => {
                  const canSelectControllers = (controller.availableControllers.length > 1);
                  if (!canSelectControllers) {
                    return null;
                  }

                  const canSelectGrbl = _includes(controller.availableControllers, GRBL);
                  const canSelectMarlin = _includes(controller.availableControllers, MARLIN);
                  const canSelectSmoothie = _includes(controller.availableControllers, SMOOTHIE);
                  const canSelectTinyG = _includes(controller.availableControllers, TINYG);
                  const isGrblDisabled = !isDisconnected;
                  const isMarlinDisabled = !isDisconnected;
                  const isSmoothieDisabled = !isDisconnected;
                  const isTinyGDisabled = !isDisconnected;
                  const isGrblSelected = input.value === GRBL;
                  const isMarlinSelected = input.value === MARLIN;
                  const isSmoothieSelected = input.value === SMOOTHIE;
                  const isTinyGSelected = input.value === TINYG;
                  const handleChangeByValue = (value) => (e) => {
                    input.onChange(value);

                    if (!!value) {
                      config.set('controller.type', value);
                    }
                  };

                  return (
                    <Box mb="4x">
                      <ButtonGroup variant="default">
                        {canSelectGrbl && (
                          <Button
                            disabled={isGrblDisabled}
                            selected={isGrblSelected}
                            onClick={handleChangeByValue(GRBL)}
                          >
                            {GRBL}
                          </Button>
                        )}
                        {canSelectMarlin && (
                          <Button
                            disabled={isMarlinDisabled}
                            selected={isMarlinSelected}
                            onClick={handleChangeByValue(MARLIN)}
                          >
                            {MARLIN}
                          </Button>
                        )}
                        {canSelectSmoothie && (
                          <Button
                            disabled={isSmoothieDisabled}
                            selected={isSmoothieSelected}
                            onClick={handleChangeByValue(SMOOTHIE)}
                          >
                            {SMOOTHIE}
                          </Button>
                        )}
                        {canSelectTinyG && (
                          <Button
                            disabled={isTinyGDisabled}
                            selected={isTinyGSelected}
                            onClick={handleChangeByValue(TINYG)}
                          >
                            {TINYG}
                          </Button>
                        )}
                      </ButtonGroup>
                    </Box>
                  );
                }}
              </Field>
              <Box mb="4x">
                <Field name="connection.type">
                  {({ input, meta }) => {
                    const isSerialDisabled = !isDisconnected;
                    const isSocketDisabled = !isDisconnected;
                    const isSerialSelected = input.value === CONNECTION_TYPE_SERIAL;
                    const isSocketSelected = input.value === CONNECTION_TYPE_SOCKET;
                    const handleChangeByValue = (value) => (e) => {
                      input.onChange(value);

                      if (!!value) {
                        config.set('connection.type', value);
                      }
                    };

                    return (
                      <ButtonGroup variant="default">
                        <Button
                          disabled={isSerialDisabled}
                          selected={isSerialSelected}
                          onClick={handleChangeByValue(CONNECTION_TYPE_SERIAL)}
                        >
                          <FontAwesomeIcon icon={['fab', 'usb']} fixedWidth />
                          <Space width={8} />
                          {i18n._('Serial Port')}
                        </Button>
                        <Button
                          disabled={isSocketDisabled}
                          selected={isSocketSelected}
                          onClick={handleChangeByValue(CONNECTION_TYPE_SOCKET)}
                        >
                          <FontAwesomeIcon icon="network-wired" fixedWidth />
                          <Space width={8} />
                          {i18n._('Wi-Fi')}
                        </Button>
                      </ButtonGroup>
                    );
                  }}
                </Field>
              </Box>
              <Field name="connection.type" subscription={{ value: true }}>
                {({ input, meta }) => {
                  const connectionType = input.value;

                  if (connectionType === CONNECTION_TYPE_SERIAL) {
                    return (
                      <>
                        <Box mb="4x">
                          <TextLabel htmlFor="connection-serial-port" mb="2x">
                            {i18n._('Serial port')}
                          </TextLabel>
                          <Flex align="center">
                            <Box flex="auto">
                              <Field name="connection.serial.path">
                                {({ input, meta }) => {
                                  const canSelectSerialPort = isDisconnected && !isFetchingSerialPorts;
                                  const isDisabled = !canSelectSerialPort;
                                  const options = serialPorts.map(port => ({
                                    value: port.path,
                                    label: port.path,
                                    manufacturer: port.manufacturer,
                                    connected: port.connected,
                                  }));
                                  const value = _find(options, { value: input.value }) || null;

                                  return (
                                    <Box data-test="connection-serial-port">
                                      <SerialConnectionMenu
                                        id="connection-serial-port"
                                        label={i18n._('Serial port')}
                                        options={options}
                                        value={value}
                                        disabled={isDisabled}
                                        placeholder={i18n._('Choose a port')}
                                        emptyText={i18n._('No ports available')}
                                        onSelect={(selected) => {
                                          input.onChange(selected);
                                          config.set('connection.serial.path', selected);
                                        }}
                                      />
                                    </Box>
                                  );
                                }}
                              </Field>
                            </Box>
                            <Box flex="none" width="30px">
                              <Space width={12} />
                              <Button
                                aria-label={i18n._('Refresh')}
                                variant="ghost"
                                disabled={!canRefreshSerialPorts}
                                onClick={() => {
                                  fetchSerialPorts();
                                }}
                                title={i18n._('Refresh')}
                              >
                                <FontAwesomeIcon
                                  icon="sync"
                                  fixedWidth
                                  spin={isFetchingSerialPorts}
                                />
                              </Button>
                            </Box>
                          </Flex>
                        </Box>
                        <Box mb="4x">
                          <TextLabel htmlFor="connection-baud-rate" mb="2x">
                            {i18n._('Baud rate')}
                          </TextLabel>
                          <Flex align="center">
                            <Box flex="auto">
                              <Field name="connection.serial.baudRate">
                                {({ input, meta }) => {
                                  const canSelectSerialBaudRate = isDisconnected && !isFetchingSerialBaudRates;
                                  const isDisabled = !canSelectSerialBaudRate;
                                  const options = serialBaudRates.map(value => ({
                                    value: ensurePositiveNumber(value),
                                    label: ensurePositiveNumber(value).toString(),
                                  }));
                                  const value = _find(options, { value: input.value }) || null;

                                  return (
                                    <Box data-test="connection-baud-rate">
                                      <SerialConnectionMenu
                                        id="connection-baud-rate"
                                        label={i18n._('Baud rate')}
                                        options={options}
                                        value={value}
                                        disabled={isDisabled}
                                        placeholder={i18n._('Choose a baud rate')}
                                        onSelect={(selected) => {
                                          input.onChange(selected);
                                          config.set('connection.serial.baudRate', selected);
                                        }}
                                      />
                                    </Box>
                                  );
                                }}
                              </Field>
                            </Box>
                            <Box flex="none" width="30px">
                              <Space width={12} />
                              <Button
                                aria-label={i18n._('Refresh')}
                                variant="ghost"
                                disabled={!canRefreshSerialBaudRates}
                                onClick={() => {
                                  fetchSerialBaudRates();
                                }}
                                title={i18n._('Refresh')}
                              >
                                <FontAwesomeIcon
                                  icon="sync"
                                  fixedWidth
                                  spin={isFetchingSerialBaudRates}
                                />
                              </Button>
                            </Box>
                          </Flex>
                        </Box>
                        <Box mb="4x">
                          <Field name="connection.serial.pin.dtr">
                            {({ input, meta }) => {
                              const canChange = isDisconnected;
                              const isChecked = (typeof input.value === 'boolean');
                              const isDisabled = !canChange;

                              return (
                                <Checkbox
                                  checked={isChecked}
                                  disabled={isDisabled}
                                  onChange={(event) => {
                                    const checked = !!event.target.checked;
                                    input.onChange(checked);

                                    // Set DTR pin to `true` when checked and `null` when unchecked
                                    config.set('connection.serial.pin.dtr', checked ? true : null);
                                  }}
                                >
                                  <Space width={8} />
                                  {i18n._('Set DTR line status upon opening')}
                                </Checkbox>
                              );
                            }}
                          </Field>
                          <Field name="connection.serial.pin.dtr" subscription={{ value: true }}>
                            {({ input, meta }) => {
                              const canChange = isDisconnected;
                              const isChecked = (typeof input.value === 'boolean');
                              const isDisabled = !canChange;
                              const isSETSelected = (input.value === true);
                              const isCLRSelected = (input.value === false);

                              if (!isChecked) {
                                return null;
                              }

                              return (
                                <ButtonGroup variant="default">
                                  <Button
                                    disabled={isDisabled}
                                    selected={isSETSelected}
                                    onClick={(event) => {
                                      // Set DTR pin to `true`
                                      const value = true;
                                      input.onChange(value);
                                      config.set('connection.serial.pin.dtr', value);
                                    }}
                                  >
                                    {i18n._('SET')}
                                  </Button>
                                  <Button
                                    disabled={isDisabled}
                                    selected={isCLRSelected}
                                    onClick={(event) => {
                                      // Set DTR pin to `false`
                                      const value = false;
                                      input.onChange(value);
                                      config.set('connection.serial.pin.dtr', value);
                                    }}
                                  >
                                    {i18n._('CLR')}
                                  </Button>
                                </ButtonGroup>
                              );
                            }}
                          </Field>
                        </Box>
                        <Box mb="4x">
                          <Field name="connection.serial.pin.rts">
                            {({ input, meta }) => {
                              const canChange = isDisconnected;
                              const isChecked = (typeof input.value === 'boolean');
                              const isDisabled = !canChange;

                              return (
                                <Checkbox
                                  checked={isChecked}
                                  disabled={isDisabled}
                                  onChange={(event) => {
                                    const checked = !!event.target.checked;
                                    input.onChange(checked);

                                    // Set RTS pin to `true` when checked and `null` when unchecked
                                    config.set('connection.serial.pin.rts', checked ? true : null);
                                  }}
                                >
                                  <Space width={8} />
                                  {i18n._('Set RTS line status upon opening')}
                                </Checkbox>
                              );
                            }}
                          </Field>
                          <Field name="connection.serial.pin.rts" subscription={{ value: true }}>
                            {({ input, meta }) => {
                              const canChange = isDisconnected;
                              const isChecked = (typeof input.value === 'boolean');
                              const isDisabled = !canChange;
                              const isSETSelected = (input.value === true);
                              const isCLRSelected = (input.value === false);

                              if (!isChecked) {
                                return null;
                              }

                              return (
                                <ButtonGroup variant="default">
                                  <Button
                                    disabled={isDisabled}
                                    selected={isSETSelected}
                                    onClick={(event) => {
                                      // Set RTS pin to `true`
                                      const value = true;
                                      input.onChange(value);
                                      config.set('connection.serial.pin.rts', value);
                                    }}
                                  >
                                    {i18n._('SET')}
                                  </Button>
                                  <Button
                                    disabled={isDisabled}
                                    selected={isCLRSelected}
                                    onClick={(event) => {
                                      // Set RTS pin to `false`
                                      const value = false;
                                      input.onChange(value);
                                      config.set('connection.serial.pin.rts', value);
                                    }}
                                  >
                                    {i18n._('CLR')}
                                  </Button>
                                </ButtonGroup>
                              );
                            }}
                          </Field>
                        </Box>
                        <Box mb="4x">
                          <Field name="connection.serial.rtscts">
                            {({ input, meta }) => {
                              const canChange = isDisconnected;
                              const isDisabled = !canChange;

                              return (
                                <Checkbox
                                  checked={input.value}
                                  disabled={isDisabled}
                                  onChange={(event) => {
                                    const checked = !!event.target.checked;
                                    input.onChange(checked);

                                    config.set('connection.serial.rtscts', checked);
                                  }}
                                >
                                  <Space width={8} />
                                  {i18n._('Use RTS/CTS flow control')}
                                </Checkbox>
                              );
                            }}
                          </Field>
                        </Box>
                      </>
                    );
                  }

                  if (connectionType === CONNECTION_TYPE_SOCKET) {
                    return (
                      <>
                        <Box mb="4x">
                          <TextLabel mb="2x">
                            {i18n._('Host')}
                          </TextLabel>
                          <Box>
                            <Field
                              name="connection.socket.host"
                              validate={required}
                            >
                              {({ input, meta }) => {
                                const canChange = isDisconnected;
                                const isDisabled = !canChange;

                                return (
                                  <>
                                    <Input
                                      {...input}
                                      type="text"
                                      disabled={isDisabled}
                                      onChange={(event) => {
                                        const value = event.target.value;
                                        input.onChange(value);

                                        config.set('connection.socket.host', value);
                                      }}
                                    />
                                    {(meta.error && meta.touched) && (
                                      <Text fontSize="sm" lineHeight="sm" color="red:50">
                                        {meta.error}
                                      </Text>
                                    )}
                                  </>
                                );
                              }}
                            </Field>
                          </Box>
                        </Box>
                        <Box mb="4x">
                          <TextLabel mb="2x">
                            {i18n._('Port')}
                          </TextLabel>
                          <Box>
                            <Field
                              name="connection.socket.port"
                              validate={composeValidators(required, validatePortNumber(1, 65535))}
                            >
                              {({ input, meta }) => {
                                const canChange = isDisconnected;
                                const isDisabled = !canChange;

                                return (
                                  <>
                                    <Input
                                      {...input}
                                      type="number"
                                      min={0}
                                      max={65535}
                                      step={1}
                                      disabled={isDisabled}
                                      onChange={(event) => {
                                        const value = event.target.value;
                                        input.onChange(value);

                                        const port = Number(value);
                                        if (Number.isFinite(port) && port >= 1 && port <= 65535) {
                                          config.set('connection.socket.port', port);
                                        }
                                      }}
                                    />
                                    {(meta.error && meta.touched) && (
                                      <Text fontSize="sm" lineHeight="sm" color="red:50">
                                        {meta.error}
                                      </Text>
                                    )}
                                  </>
                                );
                              }}
                            </Field>
                          </Box>
                        </Box>
                      </>
                    );
                  }

                  return null;
                }}
              </Field>
              <Box mb="4x">
                <Field name="autoReconnect">
                  {({ input, meta }) => {
                    const canChange = isDisconnected;
                    const isDisabled = !canChange;

                    return (
                      <Checkbox
                        checked={input.value}
                        disabled={isDisabled}
                        onChange={(event) => {
                          const checked = !!event.target.checked;
                          input.onChange(checked);

                          config.set('autoReconnect', checked);
                        }}
                      >
                        <Space width={8} />
                        {i18n._('Connect automatically')}
                      </Checkbox>
                    );
                  }}
                </Field>
              </Box>
              <FormSpy
                subscription={{
                  values: true,
                  invalid: true,
                }}
              >
                {({ values, invalid }) => {
                  const canOpenConnection = isDisconnected && (() => {
                    const connectionType = _get(values, 'connection.type');

                    if (connectionType === CONNECTION_TYPE_SERIAL) {
                      const path = _get(values, 'connection.serial.path');
                      const baudRate = _get(values, 'connection.serial.baudRate');
                      const rtscts = _get(values, 'connection.serial.rtscts');
                      const pin = _get(values, 'connection.serial.pin');

                      return validateSerialConnectionOptions({ path, baudRate, rtscts, pin });
                    }

                    if (connectionType === CONNECTION_TYPE_SOCKET) {
                      const host = _get(values, 'connection.socket.host');
                      const port = _get(values, 'connection.socket.port');

                      return validateSocketConnectionOptions({ host, port });
                    }

                    return false;
                  })();
                  const canCloseConnection = isConnected;
                  const handleOpenConnection = (e) => {
                    const controllerType = _get(values, 'controller.type');
                    const connectionType = _get(values, 'connection.type');

                    const options = {};
                    _set(options, 'controller.type', controllerType);
                    _set(options, 'connection.type', connectionType);
                    _set(options, 'connection.options', ({
                      [CONNECTION_TYPE_SERIAL]: {
                        path: _get(values, 'connection.serial.path'),
                        baudRate: _get(values, 'connection.serial.baudRate'),
                        rtscts: _get(values, 'connection.serial.rtscts'),
                        pin: _get(values, 'connection.serial.pin'),
                      },
                      [CONNECTION_TYPE_SOCKET]: {
                        host: _get(values, 'connection.socket.host'),
                        port: Number(_get(values, 'connection.socket.port')),
                      },
                    }[connectionType]));

                    openConnection(options).catch(() => {});
                  };
                  const confirmCloseConnection = (e) => {
                    portal(({ onClose }) => (
                      <Modal
                        autoFocus
                        closeOnEsc={false}
                        closeOnInteractOutside
                        ensureFocus
                        isClosable
                        isOpen={true}
                        onClose={onClose}
                      >
                        <ModalOverlay />
                        <ModalContent>
                          <ModalBody>
                            <Alert severity="warning">
                              {i18n._('Are you sure you want to close the connection?')}
                            </Alert>
                          </ModalBody>
                          <ModalFooter>
                            <Button onClick={onClose}>
                              {i18n._('Cancel')}
                            </Button>
                            <Button
                              variant="primary"
                              onClick={chainedFunction(
                                (e) => {
                                  closeConnection().catch(() => {});
                                  fetchSerialPorts();
                                  fetchSerialBaudRates();
                                },
                                onClose,
                              )}
                            >
                              {i18n._('OK')}
                            </Button>
                          </ModalFooter>
                        </ModalContent>
                      </Modal>
                    ));
                  };

                  return (
                    <>
                      {(isDisconnected || isConnecting) && (
                        <Button
                          variant={canOpenConnection ? 'primary' : 'secondary'}
                          disabled={!canOpenConnection}
                          onClick={handleOpenConnection}
                          style={{
                            cursor: canOpenConnection ? 'pointer' : 'not-allowed',
                          }}
                        >
                          {isConnecting
                            ? <FontAwesomeIcon icon="circle-notch" spin />
                            : <FontAwesomeIcon icon="toggle-off" />}
                          <Space width={8} />
                          {i18n._('Open')}
                        </Button>
                      )}
                      {(isConnected || isDisconnecting) && (
                        <Button
                          variant="emphasis"
                          disabled={!canCloseConnection}
                          onClick={confirmCloseConnection}
                          style={{
                            cursor: canCloseConnection ? 'pointer' : 'not-allowed',
                          }}
                        >
                          {isDisconnecting
                            ? <FontAwesomeIcon icon="circle-notch" spin />
                            : <FontAwesomeIcon icon="toggle-on" />}
                          <Space width={8} />
                          {i18n._('Close')}
                        </Button>
                      )}
                    </>
                  );
                }}
              </FormSpy>
            </>
          )}
        </Form>
      </Box>
    </>
  );
}

export default Connection;

/**
 * @param {{id: string, label: string, options: Array, value: object | null, disabled: boolean, placeholder: string, emptyText?: string, onSelect: Function}} props
 */
function SerialConnectionMenu({ id, label, options, value, disabled, placeholder, emptyText, onSelect }) {
  return (
    <Menu matchWidth>
      <MenuButton
        id={id}
        aria-label={label}
        disabled={disabled}
        width="100%"
        variant="secondary"
      >
        {value?.connected && <FontAwesomeIcon icon="lock" fixedWidth />}
        {value?.connected && <Space width={8} />}
        {value?.label || placeholder}
      </MenuButton>
      <MenuList maxHeight={200} overflowY="auto">
        {options.length === 0 && <Text px="3x" py="2x">{emptyText || i18n._('No options available')}</Text>}
        {options.map(option => (
          <MenuItem
            key={option.value}
            aria-current={option.value === value?.value ? 'true' : undefined}
            onClick={() => onSelect(option.value)}
            onKeyDown={(event) => {
              if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
                onSelect(option.value);
              }
            }}
            width="100%"
          >
            <Flex align="center">
              <Box flex="auto" style={{ wordBreak: 'break-all' }}>{option.label}</Box>
              {option.connected && <FontAwesomeIcon icon="lock" fixedWidth />}
            </Flex>
            {option.manufacturer && (
              <Text ml="6x">{i18n._('Manufacturer: {{manufacturer}}', { manufacturer: option.manufacturer })}</Text>
            )}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
