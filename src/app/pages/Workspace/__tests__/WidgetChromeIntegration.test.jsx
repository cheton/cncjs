import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import AutolevelWidget from '@app/widgets/Autolevel';
import ConnectionWidget from '@app/widgets/Connection';
import Widget from '../Widget';

let mockBodyUnmountCount = 0;

jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => null,
}));

jest.mock('@app/api', () => ({
  loadGCode: jest.fn(),
}));
jest.mock('@app/widgets/Axes', () => 'AxesWidget');
jest.mock('@app/widgets/Console', () => 'ConsoleWidget');
jest.mock('@app/widgets/Custom', () => 'CustomWidget');
jest.mock('@app/widgets/GCode', () => 'GCodeWidget');
jest.mock('@app/widgets/Grbl', () => 'GrblWidget');
jest.mock('@app/widgets/Laser', () => 'LaserWidget');
jest.mock('@app/widgets/Macro', () => 'MacroWidget');
jest.mock('@app/widgets/Marlin', () => 'MarlinWidget');
jest.mock('@app/widgets/Probe', () => 'ProbeWidget');
jest.mock('@app/widgets/Smoothie', () => 'SmoothieWidget');
jest.mock('@app/widgets/Spindle', () => 'SpindleWidget');
jest.mock('@app/widgets/TinyG', () => 'TinyGWidget');
jest.mock('@app/widgets/Tool', () => 'ToolWidget');
jest.mock('@app/widgets/Visualizer', () => 'VisualizerWidget');
jest.mock('@app/widgets/Webcam', () => 'WebcamWidget');

jest.mock('@app/components/Widget', () => {
  const React = require('react');
  const Primitive = ({ children, ...props }) => React.createElement('div', props, children);
  const Button = ({ children, ...props }) => React.createElement('button', { type: 'button', ...props }, children);
  const DropdownMenuItem = ({ children, onSelect, eventKey, ...props }) => React.createElement(
    'button',
    { type: 'button', 'data-event-key': eventKey, onClick: onSelect, ...props },
    children
  );
  const DropdownButton = ({ children, onSelect, toggle, 'aria-label': ariaLabel }) => React.createElement(
    'div',
    null,
    React.createElement('button', { type: 'button', 'aria-label': ariaLabel || 'More' }, toggle),
    React.Children.map(children, child => React.cloneElement(child, {
      onSelect: () => onSelect(child.props.eventKey),
    }))
  );
  const Widget = ({ children, borderless, fullscreen, ...props }) => React.createElement(
    'section',
    {
      ...props,
      'data-borderless': String(Boolean(borderless)),
      'data-fullscreen': String(Boolean(fullscreen)),
    },
    children
  );
  Widget.Header = Primitive;
  Widget.Content = Primitive;
  Widget.Sortable = Primitive;
  Widget.Title = Primitive;
  Widget.Button = Button;
  Widget.DropdownButton = DropdownButton;
  Widget.DropdownMenuItem = DropdownMenuItem;
  Widget.Controls = Primitive;
  return Widget;
});

jest.mock('@app/lib/controller', () => ({
  __esModule: true,
  default: {
    connection: { ident: null },
    type: 'Grbl',
    state: {},
    workflow: { state: 'idle' },
    addListener: jest.fn(),
    removeListener: jest.fn(),
    command: jest.fn((name, params, callback) => {
      if (callback) {
        callback(null, null);
      }
    }),
  },
}));

jest.mock('@app/lib/i18n', () => ({
  __esModule: true,
  default: { _: value => value },
}));

jest.mock('@app/widgets/shared/WidgetConfig', () => {
  return class MockWidgetConfig {
    get(path, defaultValue) {
      return defaultValue;
    }

    set() {}
  };
});

jest.mock('@app/widgets/shared/WidgetConfigProvider', () => {
  return ({ children }) => children;
});

jest.mock('@app/widgets/Connection/Connection', () => {
  const React = require('react');
  return () => React.createElement('div', { 'data-testid': 'connection-content' });
});

jest.mock('@app/widgets/Autolevel/LandingView', () => {
  const React = require('react');
  return () => React.createElement('div', { 'data-testid': 'autolevel-content' });
});
jest.mock('@app/widgets/Autolevel/SetupProbeView', () => () => null);
jest.mock('@app/widgets/Autolevel/ApplyView', () => () => null);
jest.mock('@app/widgets/Autolevel/StartProbeModal', () => () => null);
jest.mock('@app/widgets/Autolevel/StopProbeModal', () => () => null);
jest.mock('@app/widgets/Autolevel/TestProbeModal', () => () => null);

jest.mock('../widgetRegistry', () => {
  const React = require('react');
  const Body = props => {
    React.useEffect(() => () => {
      mockBodyUnmountCount += 1;
    }, []);

    return React.createElement(
      'output',
      {
        'data-testid': 'body',
        'data-chrome': JSON.stringify(props.chrome || null),
        'data-has-chrome-actions': String(
          typeof props.chrome?.onMinimizedChange === 'function' &&
          typeof props.chrome?.onToggleFullscreen === 'function'
        ),
      },
      <>
        {props.children}
        {props.chrome && (
          <>
            <button type="button" onClick={() => props.chrome.onMinimizedChange(false)}>Change minimized</button>
            <button type="button" onClick={() => props.chrome.onToggleFullscreen()}>Toggle fullscreen</button>
          </>
        )}
      </>
    );
  };
  return {
    WIDGET_REGISTRY: {
      axes: { Component: Body, supportsChrome: true },
      visualizer: { Component: Body, supportsChrome: false },
    },
  };
});

jest.mock('../useWorkspaceWidgetUI', () => {
  const React = require('react');
  return {
    useWorkspaceWidgetUI: () => {
      const [minimized, setMinimized] = React.useState(true);
      const [isFullscreen, setFullscreen] = React.useState(false);

      return {
        getChrome: () => ({ minimized, isFullscreen }),
        setMinimized: (widgetId, next) => {
          if (widgetId) {
            setMinimized(next);
          }
        },
        toggleFullscreen: () => setFullscreen(value => !value),
      };
    },
  };
});

test('chrome widget receives declarative chrome props without a component ref', () => {
  mockBodyUnmountCount = 0;
  render(<Widget widgetId="axes" />);

  const body = screen.getByTestId('body');
  const chrome = JSON.parse(body.getAttribute('data-chrome'));
  expect(chrome.minimized).toBe(true);
  expect(chrome.isFullscreen).toBe(false);
  expect(body).toHaveAttribute('data-has-chrome-actions', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Change minimized' }));
  fireEvent.click(screen.getByRole('button', { name: 'Toggle fullscreen' }));
  expect(JSON.parse(body.getAttribute('data-chrome'))).toEqual({
    minimized: false,
    isFullscreen: true,
  });
  expect(mockBodyUnmountCount).toBe(0);
});

test('Visualizer bypasses chrome context and unknown widget returns null', () => {
  const view = render(<Widget widgetId="visualizer" />);
  expect(screen.getByTestId('body')).toHaveAttribute('data-chrome', 'null');

  view.rerender(<Widget widgetId="unknown" />);
  expect(screen.queryByTestId('body')).not.toBeInTheDocument();
});

test('host passes widget props through unchanged', () => {
  render(<Widget widgetId="axes:fork-1" sortable={{ handleClassName: 'handle' }} />);
  expect(screen.getByTestId('body')).toBeInTheDocument();
});

test('Connection shell dispatches chrome actions through props', () => {
  const chrome = {
    minimized: true,
    isFullscreen: false,
    onMinimizedChange: jest.fn(),
    onToggleFullscreen: jest.fn(),
  };

  render(
    <ConnectionWidget
      widgetId="connection"
      chrome={chrome}
      onFork={jest.fn()}
      onRemove={jest.fn()}
      sortable={{}}
    />
  );

  fireEvent.click(screen.getByRole('button', { name: 'Expand' }));
  expect(chrome.onMinimizedChange).toHaveBeenCalledWith(false);
  expect(screen.getByTestId('connection-content')).toBeInTheDocument();
});

test('Autolevel shell forwards chrome actions without local chrome state', () => {
  const chrome = {
    minimized: false,
    isFullscreen: false,
    onMinimizedChange: jest.fn(),
    onToggleFullscreen: jest.fn(),
  };

  render(
    <AutolevelWidget
      widgetId="autolevel"
      chrome={chrome}
      onFork={jest.fn()}
      onRemove={jest.fn()}
      sortable={{}}
    />
  );

  fireEvent.click(screen.getByRole('button', { name: 'Collapse' }));
  expect(chrome.onMinimizedChange).toHaveBeenCalledWith(true);

  fireEvent.click(screen.getByRole('button', { name: 'More' }));
  fireEvent.click(screen.getByRole('button', { name: 'Enter Full Screen' }));
  expect(chrome.onToggleFullscreen).toHaveBeenCalledTimes(1);
});
