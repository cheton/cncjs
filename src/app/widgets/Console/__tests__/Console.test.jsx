import React from 'react';
import { render } from '@testing-library/react';

const mockTerminalClear = jest.fn();
const mockTerminalResize = jest.fn();
const mockTerminalClearSelection = jest.fn();
const mockTerminalRefresh = jest.fn();
const mockTerminalSelectAll = jest.fn();
const mockTerminalWriteln = jest.fn();
const mockListeners = {};
const mockEmitter = {
  on: jest.fn(),
  off: jest.fn(),
};

jest.mock('react-redux', () => ({
  connect: () => Component => Component,
}));

jest.mock('@app/lib/controller', () => ({
  __esModule: true,
  default: {
    addListener: jest.fn((event, listener) => {
      mockListeners[event] = listener;
    }),
    removeListener: jest.fn(),
    type: 'Grbl',
    write: jest.fn(),
  },
}));

jest.mock('@app/widgets/shared/useWidgetEvent', () => ({
  __esModule: true,
  default: () => mockEmitter,
}));

jest.mock('../Terminal', () => {
  const React = require('react');

  return {
    __esModule: true,
    default: React.forwardRef((props, ref) => {
      React.useImperativeHandle(ref, () => ({
        clear: mockTerminalClear,
        clearSelection: mockTerminalClearSelection,
        prompt: '> ',
        refresh: mockTerminalRefresh,
        resize: mockTerminalResize,
        selectAll: mockTerminalSelectAll,
        writeln: mockTerminalWriteln,
      }), []);

      return React.createElement('div');
    }),
  };
});

const Console = require('../Console').default;

describe('Console connection lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockListeners).forEach(event => delete mockListeners[event]);
  });

  test('clears the terminal once when the connection closes', () => {
    const view = render(<Console isConnected={true} isFullscreen={false} />);

    try {
      expect(mockListeners['connection:close']).toEqual(expect.any(Function));
      expect(() => mockListeners['connection:close']({})).not.toThrow();
      expect(mockTerminalClear).toHaveBeenCalledTimes(1);
    } finally {
      view.unmount();
    }
  });
});
