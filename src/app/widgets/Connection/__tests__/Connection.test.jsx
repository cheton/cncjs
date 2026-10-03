import React from 'react';
import {
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderAppUI } from '@app/test/render';

const mockOpen = jest.fn();
const mockClose = jest.fn();
const mockRefetchPorts = jest.fn();
const mockRefetchBaudRates = jest.fn();
const mockConfigSet = jest.fn();
const mockPortalOnClose = jest.fn();
let mockConnection;
let mockPortsQuery;
let mockBaudRatesQuery;

jest.mock('react-redux', () => {
  throw new Error('Connection must not depend on react-redux');
});

jest.mock('@app/hooks/useConnection', () => ({
  __esModule: true,
  default: () => mockConnection,
}));

jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => null,
}));

jest.mock('@app/queries/serialport', () => ({
  useSerialPortsQuery: () => mockPortsQuery,
  useSerialBaudRatesQuery: () => mockBaudRatesQuery,
}));

jest.mock('@app/lib/controller', () => ({
  __esModule: true,
  default: {
    availableControllers: ['grbl', 'marlin'],
  },
}));

jest.mock('@app/lib/i18n', () => ({
  __esModule: true,
  default: {
    _: value => value,
  },
}));

jest.mock('@app/lib/portal', () => ({
  __esModule: true,
  default: callback => {
    const { render: mockRender } = require('@testing-library/react');
    const {
      createTestQueryClient: mockCreateTestQueryClient,
      createTestWrapper: mockCreateTestWrapper,
    } = require('@app/test/render');
    mockRender(callback({ onClose: mockPortalOnClose }), {
      wrapper: mockCreateTestWrapper(mockCreateTestQueryClient()),
    });
    return Promise.resolve();
  },
}));

const configValues = {
  'controller.type': 'grbl',
  'connection.type': 'serial',
  'connection.serial.path': '/dev/ttyUSB0',
  'connection.serial.baudRate': 115200,
  'connection.serial.rtscts': false,
  'connection.serial.pin.dtr': null,
  'connection.serial.pin.rts': null,
  'connection.socket.host': 'localhost',
  'connection.socket.port': 8080,
  autoReconnect: false,
};

const mockConfig = {
  get: path => {
    if (path === 'connection.serial') {
      return {
        path: configValues['connection.serial.path'],
        baudRate: configValues['connection.serial.baudRate'],
        rtscts: configValues['connection.serial.rtscts'],
        pin: {
          dtr: configValues['connection.serial.pin.dtr'],
          rts: configValues['connection.serial.pin.rts'],
        },
      };
    }
    if (path === 'connection.socket') {
      return {
        host: configValues['connection.socket.host'],
        port: configValues['connection.socket.port'],
      };
    }
    return configValues[path];
  },
  set: (path, value) => {
    configValues[path] = value;
    mockConfigSet(path, value);
  },
};

jest.mock('@app/widgets/shared/useWidgetConfig', () => ({
  __esModule: true,
  default: () => mockConfig,
}));

jest.mock('react-spring', () => ({
  animated: { div: 'div' },
  useTransition: () => renderTransition => renderTransition({}, true),
}));

const Connection = require('../Connection').default;

const createConnection = overrides => ({
  state: 'disconnected',
  type: 'serial',
  ident: null,
  options: null,
  error: null,
  isOpening: false,
  isClosing: false,
  open: mockOpen,
  close: mockClose,
  command: jest.fn(),
  write: jest.fn(),
  writeln: jest.fn(),
  ...overrides,
});

beforeEach(() => {
  Object.assign(configValues, {
    'controller.type': 'grbl',
    'connection.type': 'serial',
    'connection.serial.path': '/dev/ttyUSB0',
    'connection.serial.baudRate': 115200,
    'connection.serial.rtscts': false,
    'connection.serial.pin.dtr': null,
    'connection.serial.pin.rts': null,
    'connection.socket.host': 'localhost',
    'connection.socket.port': 8080,
    autoReconnect: false,
  });
  mockConnection = createConnection();
  mockPortsQuery = {
    data: [
      { path: '/dev/ttyUSB0', manufacturer: 'Acme CNC', connected: false },
      { path: '/dev/ttyUSB1', manufacturer: 'Other CNC', connected: true },
    ],
    isFetching: false,
    refetch: mockRefetchPorts,
  };
  mockBaudRatesQuery = {
    data: [115200, 250000],
    isFetching: false,
    refetch: mockRefetchBaudRates,
  };
  jest.clearAllMocks();
  mockOpen.mockResolvedValue(undefined);
  mockClose.mockResolvedValue(undefined);
});

describe('Connection form', () => {
  test('reads serial metadata from TanStack Query and commits menu selection', async () => {
    renderAppUI(<Connection />);

    const serialPort = screen.getByRole('button', { name: 'Serial port' });
    const baudRate = screen.getByRole('button', { name: 'Baud rate' });

    expect(serialPort).toHaveTextContent('/dev/ttyUSB0');
    expect(baudRate).toHaveTextContent('115200');

    fireEvent.click(serialPort);
    expect(screen.getByRole('menuitem', { name: /\/dev\/ttyUSB1/ })).toHaveTextContent('Manufacturer: {{manufacturer}}');
    fireEvent.click(screen.getByRole('menuitem', { name: /\/dev\/ttyUSB1/ }));
    fireEvent.click(baudRate);
    fireEvent.click(screen.getByRole('menuitem', { name: '250000' }));

    expect(mockConfigSet).toHaveBeenCalledWith('connection.serial.path', '/dev/ttyUSB1');
    expect(mockConfigSet).toHaveBeenCalledWith('connection.serial.baudRate', 250000);
    await waitFor(() => expect(baudRate).toHaveFocus());
    expect(serialPort).toHaveTextContent('/dev/ttyUSB1');
    expect(baudRate).toHaveTextContent('250000');
  });

  test('serial menus are disabled while connected and show an empty port message', () => {
    mockPortsQuery.data = [];
    const { rerender } = renderAppUI(<Connection />);
    fireEvent.click(screen.getByRole('button', { name: 'Serial port' }));
    expect(screen.getByText('No ports available')).toBeInTheDocument();

    mockConnection = createConnection({ state: 'connected', ident: 'serial:/dev/ttyUSB0' });
    rerender(<Connection />);
    expect(screen.getByRole('button', { name: 'Serial port' })).toBeDisabled();
  });

  test('serial menu supports keyboard selection, Escape, and focus return', async () => {
    renderAppUI(<Connection />);
    const serialPort = screen.getByRole('button', { name: 'Serial port' });

    serialPort.focus();
    fireEvent.keyDown(serialPort, { key: 'Enter' });
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /\/dev\/ttyUSB0/ })).toHaveFocus());
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /\/dev\/ttyUSB1/ })).toHaveFocus());
    fireEvent.keyDown(document.activeElement, { key: 'Enter' });

    expect(mockConfigSet).toHaveBeenCalledWith('connection.serial.path', '/dev/ttyUSB1');
    await waitFor(() => expect(serialPort).toHaveFocus());

    fireEvent.click(serialPort);
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(serialPort).toHaveFocus();
    });
  });

  test('sends the complete serial connection payload through useConnection', () => {
    renderAppUI(<Connection />);

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(mockOpen).toHaveBeenCalledWith({
      controller: { type: 'grbl' },
      connection: {
        type: 'serial',
        options: {
          path: '/dev/ttyUSB0',
          baudRate: 115200,
          rtscts: false,
          pin: { dtr: null, rts: null },
        },
      },
    });
  });

  test('refreshes serial metadata when disconnected', () => {
    renderAppUI(<Connection />);
    jest.clearAllMocks();

    fireEvent.click(screen.getAllByRole('button', { name: 'Refresh' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Refresh' })[1]);

    expect(mockRefetchPorts).toHaveBeenCalledTimes(1);
    expect(mockRefetchBaudRates).toHaveBeenCalledTimes(1);
  });

  test('disables serial refresh while connected', () => {
    mockConnection = createConnection({
      state: 'connected',
      ident: 'serial:/dev/ttyUSB0',
    });

    renderAppUI(<Connection />);

    expect(screen.getAllByRole('button', { name: 'Refresh' })[0]).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'Refresh' })[1]).toBeDisabled();
  });

  test('preserves network selection and sends the socket port in the open payload', async () => {
    const user = userEvent.setup();
    renderAppUI(<Connection />);

    fireEvent.click(screen.getByRole('button', { name: 'Wi-Fi' }));

    const host = screen.getByRole('textbox', { name: 'Host' });
    host.focus();
    await user.clear(host);
    await user.keyboard('cnc.local');

    const port = screen.getByRole('spinbutton', { name: 'Port' });
    port.focus();
    await user.clear(port);
    await user.keyboard('9010');

    const open = screen.getByRole('button', { name: 'Open' });
    open.focus();
    await user.keyboard('{Enter}');

    expect(mockOpen).toHaveBeenCalledWith({
      controller: { type: 'grbl' },
      connection: {
        type: 'socket',
        options: {
          host: 'cnc.local',
          port: 9010,
        },
      },
    });
  });

  test('disables a duplicate open while the runtime is awaiting confirmation', () => {
    mockConnection = createConnection({
      state: 'error',
      isOpening: true,
      error: 'Connection timeout',
    });

    renderAppUI(<Connection />);

    expect(screen.getByRole('button', { name: 'Open' })).toBeDisabled();
  });

  test('closes through useConnection and refreshes metadata after confirmation', () => {
    mockConnection = createConnection({
      state: 'connected',
      ident: 'serial:/dev/ttyUSB0',
    });

    renderAppUI(<Connection />);
    jest.clearAllMocks();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(mockRefetchPorts).toHaveBeenCalledTimes(1);
    expect(mockRefetchBaudRates).toHaveBeenCalledTimes(1);
    expect(mockPortalOnClose).toHaveBeenCalledTimes(1);
  });

  test('shows a runtime connection error without a duplicate auto reconnect', async () => {
    configValues.autoReconnect = true;
    mockConnection = createConnection({
      state: 'error',
      error: 'Port is busy',
    });

    renderAppUI(<Connection />);

    await waitFor(() => expect(screen.getByText('Port is busy')).toBeInTheDocument());
    expect(mockOpen).toHaveBeenCalledTimes(1);
  });
});
