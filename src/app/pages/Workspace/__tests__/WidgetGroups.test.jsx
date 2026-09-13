import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import set from 'lodash/set';
import unset from 'lodash/unset';
import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

let mockState;
let mockListeners;
let mockSortables;
let mockPubsubSubscriptions;
let mockPortalContent;
let mockConfig;
let mockController;
let mockWidgetRegistry;

const createState = () => ({
  workspace: {
    container: {
      default: { widgets: ['visualizer'] },
      primary: { widgets: ['axes'] },
      secondary: { widgets: ['grbl'] },
    },
  },
  widgets: {
    axes: { minimized: false, axes: ['x', 'y'] },
    grbl: { minimized: false },
    visualizer: { minimized: false },
  },
});

const notifyConfigListeners = () => {
  mockListeners.forEach(listener => listener());
};

mockConfig = {
  get: jest.fn((path, defaultValue) => {
    const value = get(mockState, path);
    return value === undefined ? defaultValue : value;
  }),
  set: jest.fn((path, value) => {
    const nextState = cloneDeep(mockState);
    set(nextState, path, value);
    if (!isEqual(nextState, mockState)) {
      mockState = nextState;
      notifyConfigListeners();
    }
    return mockState;
  }),
  unset: jest.fn(path => {
    const nextState = cloneDeep(mockState);
    unset(nextState, path);
    if (!isEqual(nextState, mockState)) {
      mockState = nextState;
      notifyConfigListeners();
    }
    return mockState;
  }),
  update: jest.fn((path, updater) => {
    const nextState = cloneDeep(mockState);
    set(nextState, path, updater(get(mockState, path)));
    if (!isEqual(nextState, mockState)) {
      mockState = nextState;
      notifyConfigListeners();
    }
    return mockState;
  }),
  on: jest.fn((event, listener) => {
    if (event === 'change') {
      mockListeners.add(listener);
    }
  }),
  off: jest.fn((event, listener) => {
    if (event === 'change') {
      mockListeners.delete(listener);
    }
  }),
  read: () => mockState,
};

mockController = {
  availableControllers: ['Grbl'],
  connected: true,
  workflow: { state: 'idle' },
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

mockWidgetRegistry = {
  axes: {},
  grbl: {},
  visualizer: {},
};

jest.mock('@app/store/config', () => ({
  __esModule: true,
  default: mockConfig,
}));

jest.mock('@app/lib/controller', () => ({
  __esModule: true,
  default: mockController,
}));

jest.mock('@app/lib/i18n', () => ({
  __esModule: true,
  default: { _: value => value },
}));

jest.mock('@app/lib/log', () => ({
  __esModule: true,
  default: { error: jest.fn(), debug: jest.fn() },
}));

jest.mock('@app/lib/portal', () => ({
  __esModule: true,
  default: jest.fn(callback => {
    mockPortalContent = callback({ onClose: jest.fn() });
  }),
}));

jest.mock('@app/api', () => ({
  __esModule: true,
  default: { loadGCode: jest.fn() },
}));

jest.mock('pubsub-js', () => ({
  __esModule: true,
  default: {
    subscribe: jest.fn((topic, handler) => {
      mockPubsubSubscriptions[topic] = handler;
      return topic;
    }),
    unsubscribe: jest.fn(),
    publish: jest.fn(),
  },
}));

jest.mock('react-sortablejs', () => {
  const React = require('react');

  return props => {
    const name = props.options.group.name;
    mockSortables[name] = props;
    return React.createElement(
      'div',
      { 'data-testid': `sortable-${name}` },
      React.createElement(
        'button',
        {
          type: 'button',
          'data-testid': `sort-${name}`,
          onClick: () => props.onChange(name === 'primary' ? ['axes'] : ['grbl']),
        },
        `sort ${name}`
      ),
      props.children
    );
  };
});

jest.mock('../widgetRegistry', () => {
  const React = require('react');
  const WidgetBody = ({
    widgetId,
    view,
    onFork,
    onRemove,
  }) => React.createElement(
    'section',
    {
      'data-testid': `host-${widgetId}`,
      'data-layout': typeof view === 'string' ? view : null,
    },
    React.createElement(
      'button',
      { type: 'button', 'data-testid': `fork-${widgetId}`, onClick: onFork },
      'Fork'
    ),
    React.createElement(
      'button',
      { type: 'button', 'data-testid': `remove-${widgetId}`, onClick: onRemove },
      'Remove'
    )
  );

  mockWidgetRegistry = {
    axes: { Component: WidgetBody, hasFrame: true },
    grbl: { Component: WidgetBody, hasFrame: true, controllerType: 'Grbl' },
    visualizer: { Component: WidgetBody, hasFrame: false },
  };

  return { WIDGET_REGISTRY: mockWidgetRegistry };
});

jest.mock('@app/components/Buttons', () => {
  const React = require('react');
  const Button = ({ children, btnStyle, sm, block, ...props }) => React.createElement(
    'button',
    { type: 'button', ...props },
    children
  );
  const ButtonGroup = ({ children }) => React.createElement('div', null, children);
  return { Button, ButtonGroup };
});

jest.mock('@app/components/GridSystem', () => {
  const React = require('react');
  const Primitive = ({ children, ...props }) => React.createElement('div', props, children);
  return { Row: Primitive, Col: Primitive };
});

jest.mock('@tonic-ui/react', () => {
  const React = require('react');
  const Primitive = ({ as: Tag = 'div', children, ...props }) => React.createElement(Tag, props, children);
  return { Box: Primitive, Flex: Primitive, Space: Primitive, Text: Primitive };
});

jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => null,
}));

jest.mock('react-dropzone', () => {
  const Dropzone = ({ children }) => children({
    getRootProps: () => ({}),
    isDragActive: false,
  });
  return { __esModule: true, default: Dropzone };
});

jest.mock('styled-components', () => {
  const React = require('react');
  const styled = Component => () => props => React.createElement(Component, props);
  return { __esModule: true, default: styled };
});

jest.mock('../widget-manager', () => ({
  getInactiveWidgets: jest.fn(() => []),
  show: jest.fn(),
}));

jest.mock('../modals/FeederPaused', () => () => null);
jest.mock('../modals/FeederWait', () => () => null);
jest.mock('../modals/ServerDisconnected', () => () => null);

jest.mock('@app/components/Modal', () => {
  const React = require('react');
  const Primitive = ({ children }) => React.createElement('div', null, children);
  const Modal = Primitive;
  Modal.Header = Primitive;
  Modal.Title = Primitive;
  Modal.Body = Primitive;
  Modal.Footer = Primitive;
  return { __esModule: true, default: Modal };
});

const PrimaryWidgets = require('../PrimaryWidgets').default;
const SecondaryWidgets = require('../SecondaryWidgets').default;
const { WorkspaceLayoutProvider } = require('../WorkspaceLayoutProvider');
const { useWidgetGroup } = require('../useWidgetGroup');
const { useWorkspaceLayout } = require('../useWorkspaceLayout');
const { WorkspaceWithLayout } = require('../Workspace');

const FullscreenHarness = () => {
  const { ids, setWidgetIds } = useWidgetGroup('primary');
  const { getWidgetView, setWidgetView } = useWorkspaceLayout();
  const view = getWidgetView('axes');

  return (
    <>
      <output data-testid="fullscreen-layout">{view}</output>
      <button
        type="button"
        onClick={() => setWidgetView('axes', view === 'fullscreen' ? 'normal' : 'fullscreen')}
      >
        Toggle fullscreen
      </button>
      <button
        type="button"
        onClick={() => setWidgetIds(ids.filter(id => id !== 'axes'))}
      >
        Remove axes
      </button>
    </>
  );
};

const groupProps = () => ({
  onForkWidget: jest.fn(),
  onRemoveWidget: jest.fn(),
  onDragStart: jest.fn(),
  onDragEnd: jest.fn(),
});

const renderGroups = () => render(
  <WorkspaceLayoutProvider config={mockConfig}>
    <PrimaryWidgets {...groupProps()} />
    <SecondaryWidgets {...groupProps()} />
  </WorkspaceLayoutProvider>
);

const reset = () => {
  cleanup();
  mockState = createState();
  mockListeners = new Set();
  mockSortables = {};
  mockPubsubSubscriptions = {};
  mockPortalContent = null;
  mockController.availableControllers = ['Grbl'];
  jest.clearAllMocks();
};

beforeEach(reset);
afterEach(cleanup);

test('group containers persist current sortable order and retain cross-column options', () => {
  renderGroups();

  expect(mockPubsubSubscriptions.updatePrimaryWidgets).toEqual(expect.any(Function));
  expect(mockPubsubSubscriptions.updateSecondaryWidgets).toEqual(expect.any(Function));
  expect(mockSortables.primary.options.group).toEqual({
    name: 'primary',
    pull: true,
    put: ['secondary'],
  });
  expect(mockSortables.secondary.options.group).toEqual({
    name: 'secondary',
    pull: true,
    put: ['primary'],
  });

  fireEvent.click(screen.getByTestId('sort-primary'));
  fireEvent.click(screen.getByTestId('sort-secondary'));

  expect(mockConfig.set).toHaveBeenCalledWith(
    ['workspace', 'container', 'primary', 'widgets'],
    ['axes']
  );
  expect(mockConfig.set).toHaveBeenCalledWith(
    ['workspace', 'container', 'secondary', 'widgets'],
    ['grbl']
  );

  act(() => {
    mockPubsubSubscriptions.updatePrimaryWidgets('updatePrimaryWidgets', ['grbl']);
  });
  expect(mockConfig.read().workspace.container.primary.widgets).toEqual(['grbl']);
  expect(mockConfig.set).toHaveBeenLastCalledWith(
    ['workspace', 'container', 'primary', 'widgets'],
    ['grbl']
  );
});

test('group registry filtering hides unavailable controller widgets', () => {
  mockController.availableControllers = [];
  renderGroups();

  expect(screen.queryByTestId('host-grbl')).not.toBeInTheDocument();
  expect(screen.getByTestId('host-axes')).toBeInTheDocument();
});

test('fork and remove persist settings while native widget settings remain untouched', () => {
  const props = groupProps();
  render(
    <WorkspaceLayoutProvider config={mockConfig}>
      <PrimaryWidgets {...props} />
    </WorkspaceLayoutProvider>
  );

  fireEvent.click(screen.getByTestId('fork-axes'));
  const forkModal = render(mockPortalContent);
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  forkModal.unmount();

  const forkedWidgetId = mockConfig.read().workspace.container.primary.widgets[1];
  expect(forkedWidgetId).toMatch(/^axes:/);
  expect(mockConfig.read().widgets[forkedWidgetId]).toEqual(mockConfig.read().widgets.axes);
  expect(props.onForkWidget).toHaveBeenCalledWith('axes');

  fireEvent.click(screen.getByTestId(`remove-${forkedWidgetId}`));
  const removeModal = render(mockPortalContent);
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  removeModal.unmount();

  expect(mockConfig.read().workspace.container.primary.widgets).toEqual(['axes']);
  expect(mockConfig.read().widgets[forkedWidgetId]).toBeUndefined();
  expect(mockConfig.read().widgets.axes).toEqual({ minimized: false, axes: ['x', 'y'] });
  expect(props.onRemoveWidget).toHaveBeenCalledWith(forkedWidgetId);
});

test('Workspace toolbar drives the real group host and ignores visualizer layout', () => {
  mockState.workspace.container.primary.widgets = ['axes', 'visualizer'];
  render(
    <WorkspaceLayoutProvider config={mockConfig}>
      <WorkspaceWithLayout
        isConnected={true}
        location={{ pathname: '/workspace' }}
      />
    </WorkspaceLayoutProvider>
  );

  expect(screen.getByTestId('host-axes')).toHaveAttribute(
    'data-layout',
    'normal'
  );
  screen.getAllByTestId('host-visualizer').forEach(host => {
    expect(host).not.toHaveAttribute('data-layout');
  });

  fireEvent.click(screen.getByRole('button', { name: 'Collapse all left panel widgets' }));

  expect(mockConfig.update).toHaveBeenCalledTimes(1);
  expect(mockConfig.read().widgets.axes.minimized).toBe(true);
  expect(mockConfig.read().widgets.visualizer.minimized).toBe(false);
  expect(screen.getByTestId('host-axes')).toHaveAttribute(
    'data-layout',
    'collapsed'
  );

  fireEvent.click(screen.getByRole('button', { name: 'Expand all left panel widgets' }));
  expect(mockConfig.read().widgets.axes.minimized).toBe(false);
});

test('removing an active widget clears its transient fullscreen entry', () => {
  render(
    <WorkspaceLayoutProvider config={mockConfig}>
      <FullscreenHarness />
    </WorkspaceLayoutProvider>
  );

  fireEvent.click(screen.getByRole('button', { name: 'Toggle fullscreen' }));
  expect(screen.getByTestId('fullscreen-layout')).toHaveTextContent(
    'fullscreen'
  );

  fireEvent.click(screen.getByRole('button', { name: 'Remove axes' }));
  expect(screen.getByTestId('fullscreen-layout')).toHaveTextContent(
    'normal'
  );
});
