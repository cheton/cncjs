import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  createTestQueryClient,
  createTestWrapper,
  renderAppUI,
} from '@app/test/render';

const mockOpenConnection = jest.fn();
const mockCloseConnection = jest.fn();
const mockFetchSerialPorts = jest.fn();
const mockFetchSerialBaudRates = jest.fn();
const mockConfigSet = jest.fn();
const mockPortalOnClose = jest.fn();
const mockRender = ui => render(ui, {
  wrapper: createTestWrapper(createTestQueryClient()),
});
const mockReact = React;
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

const makeWidgetPrimitive = tag => ({ children, ...props }) => (
  React.createElement(tag, props, children)
);

jest.mock('react-redux', () => ({
  connect: () => Component => Component,
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
    mockRender(callback({ onClose: mockPortalOnClose }));
    return Promise.resolve();
  },
}));

jest.mock('@app/widgets/shared/useWidgetConfig', () => ({
  __esModule: true,
  default: () => mockConfig,
}));

jest.mock('@app/widgets/shared/WidgetConfigProvider', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

jest.mock('@app/components/Checkbox', () => {
  throw new Error('Connection must use Tonic Checkbox directly');
});

jest.mock('@app/components/Clickable', () => {
  throw new Error('Connection must use Tonic Button directly');
});

jest.mock('@app/components/FormControl/Input', () => {
  throw new Error('Connection must use Tonic Input directly');
});

jest.mock('@app/components/FormGroup', () => {
  throw new Error('Connection must use Tonic layout primitives directly');
});

jest.mock('@app/components/GridSystem', () => {
  throw new Error('Connection must use Tonic layout primitives directly');
});

jest.mock('@app/components/InlineError', () => {
  throw new Error('Connection must use Tonic form error primitives directly');
});

jest.mock('@app/components/ModalTemplate', () => {
  throw new Error('Connection must use Tonic modal primitives directly');
});

jest.mock('@app/components/Widget', () => {
  const Widget = makeWidgetPrimitive('section');
  Widget.Header = makeWidgetPrimitive('header');
  Widget.Content = makeWidgetPrimitive('div');
  Widget.Title = makeWidgetPrimitive('h2');
  Widget.Controls = makeWidgetPrimitive('div');
  Widget.Sortable = makeWidgetPrimitive('div');
  Widget.Button = makeWidgetPrimitive('button');
  Widget.DropdownButton = makeWidgetPrimitive('div');
  Widget.DropdownMenuItem = makeWidgetPrimitive('button');
  return {
    __esModule: true,
    default: Widget,
  };
});

jest.mock('react-select', () => {
  const Select = ({ options, value, onChange, components, ...props }) => (
    <>
      <select
        {...props}
        value={value?.value || ''}
        onChange={event => {
          const option = options.find(item => String(item.value) === event.target.value);
          onChange(option);
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {options.map(option => mockReact.createElement(
        components?.Option || 'div',
        { key: `metadata-${option.value}`, data: option },
        option.label,
      ))}
    </>
  );
  Select.components = {
    Option: makeWidgetPrimitive('div'),
    SingleValue: makeWidgetPrimitive('div'),
  };
  return {
    __esModule: true,
    default: Select,
    components: Select.components,
  };
});

jest.mock('react-spring', () => ({
  animated: {
    div: 'div',
  },
  useTransition: () => render => render({}, true),
}));

jest.mock('../Connection', () => ({
  __esModule: true,
  default: () => <div data-testid="connection-content" />,
}));

const ConnectionWidget = require('../index').default;

const Connection = jest.requireActual('../Connection').default;

const defaultProps = overrides => ({
  connection: {
    type: 'serial',
    error: null,
  },
  isConnected: false,
  isConnecting: false,
  isDisconnected: true,
  isDisconnecting: false,
  isFetchingSerialPorts: false,
  isFetchingSerialBaudRates: false,
  serialPorts: [
    {
      path: '/dev/ttyUSB0',
      manufacturer: 'Acme CNC',
      connected: false,
    },
    {
      path: '/dev/ttyUSB1',
      manufacturer: 'Other CNC',
      connected: true,
    },
  ],
  serialBaudRates: [115200, 250000],
  openConnection: mockOpenConnection,
  closeConnection: mockCloseConnection,
  fetchSerialPorts: mockFetchSerialPorts,
  fetchSerialBaudRates: mockFetchSerialBaudRates,
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
  jest.clearAllMocks();
});

describe('Connection widget shell', () => {
  test('uses the controlled view contract without fork or remove controls', () => {
    const onViewChange = jest.fn();

    renderAppUI(
      <ConnectionWidget
        widgetId="Connection:one"
        view="normal"
        onViewChange={onViewChange}
        sortable={{
          handleClassName: 'handle',
          filterClassName: 'filter',
        }}
      />
    );

    expect(ConnectionWidget.prototype?.render).toBeUndefined();
    expect(screen.getByTestId('connection-content')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Collapse' }));
    expect(onViewChange).toHaveBeenCalledWith('collapsed');
  });
});

describe('Connection form', () => {
  test('preserves serial port and baud-rate selection metadata', () => {
    renderAppUI(<Connection {...defaultProps()} />);

    const serialPort = screen.getByRole('combobox', { name: 'Serial port' });
    const baudRate = screen.getByRole('combobox', { name: 'Baud rate' });

    expect(serialPort).toHaveValue('/dev/ttyUSB0');
    expect(baudRate).toHaveValue('115200');
    expect(screen.getAllByText('Manufacturer: {{manufacturer}}')).toHaveLength(2);

    fireEvent.change(serialPort, { target: { value: '/dev/ttyUSB1' } });
    fireEvent.change(baudRate, { target: { value: '250000' } });

    expect(mockConfigSet).toHaveBeenCalledWith('connection.serial.path', '/dev/ttyUSB1');
    expect(mockConfigSet).toHaveBeenCalledWith('connection.serial.baudRate', 250000);
  });

  test('sends the complete serial connection payload', () => {
    renderAppUI(<Connection {...defaultProps()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(mockOpenConnection).toHaveBeenCalledWith({
      controller: { type: 'grbl' },
      connection: {
        type: 'serial',
        options: {
          path: '/dev/ttyUSB0',
          baudRate: 115200,
          rtscts: false,
          pin: {
            dtr: null,
            rts: null,
          },
        },
      },
    });
  });

  test('refreshes serial options when disconnected', () => {
    renderAppUI(<Connection {...defaultProps()} />);
    jest.clearAllMocks();

    fireEvent.click(screen.getAllByRole('button', { name: 'Refresh' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Refresh' })[1]);

    expect(mockFetchSerialPorts).toHaveBeenCalledTimes(1);
    expect(mockFetchSerialBaudRates).toHaveBeenCalledTimes(1);
  });

  test('disables serial refresh while connected', () => {
    renderAppUI(
      <Connection
        {...defaultProps({
          isConnected: true,
          isDisconnected: false,
        })}
      />
    );

    expect(screen.getAllByRole('button', { name: 'Refresh' })[0]).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'Refresh' })[1]).toBeDisabled();
  });

  test('preserves network selection and sends the socket port in the open payload', () => {
    renderAppUI(<Connection {...defaultProps()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Wi-Fi' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'cnc.local' } });
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '9010' } });
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(mockOpenConnection).toHaveBeenCalledWith({
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

  test('disables duplicate open and close actions while connection changes are pending', () => {
    const { rerender } = renderAppUI(
      <Connection {...defaultProps({ isConnecting: true, isDisconnected: false })} />
    );

    expect(screen.getByRole('button', { name: 'Open' })).toBeDisabled();

    rerender(
      <Connection {...defaultProps({
        isConnected: false,
        isConnecting: false,
        isDisconnected: false,
        isDisconnecting: true,
      })}
      />
    );

    expect(screen.getByRole('button', { name: 'Close' })).toBeDisabled();
  });

  test('keeps a close control in the confirmation modal', () => {
    renderAppUI(
      <Connection
        {...defaultProps({
          connection: {
            type: 'serial',
            error: null,
          },
          isConnected: true,
          isDisconnected: false,
        })}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.getAllByRole('button', { name: 'Close' })).toHaveLength(2);
    expect(mockCloseConnection).not.toHaveBeenCalled();
  });

  test('closes the connection and refreshes serial options after confirmation', () => {
    renderAppUI(
      <Connection
        {...defaultProps({
          connection: {
            type: 'serial',
            error: null,
          },
          isConnected: true,
          isDisconnected: false,
        })}
      />
    );
    jest.clearAllMocks();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(mockCloseConnection).toHaveBeenCalledTimes(1);
    expect(mockFetchSerialPorts).toHaveBeenCalledTimes(1);
    expect(mockFetchSerialBaudRates).toHaveBeenCalledTimes(1);
    expect(mockPortalOnClose).toHaveBeenCalledTimes(1);
  });

  test('shows connection errors without reconnecting on rerender', async () => {
    configValues.autoReconnect = true;
    const props = defaultProps({
      connection: {
        type: 'serial',
        error: 'Port is busy',
      },
    });
    const { rerender } = renderAppUI(<Connection {...props} />);

    await waitFor(() => {
      expect(screen.getByText('Port is busy')).toBeInTheDocument();
    });
    expect(mockOpenConnection).toHaveBeenCalledTimes(1);

    rerender(<Connection {...props} />);

    expect(mockOpenConnection).toHaveBeenCalledTimes(1);
    expect(mockFetchSerialPorts).toHaveBeenCalledTimes(1);
    expect(mockFetchSerialBaudRates).toHaveBeenCalledTimes(1);
  });
});
