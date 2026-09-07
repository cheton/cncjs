jest.mock('@app/lib/portal', () => jest.fn());
jest.mock('@app/store/config', () => ({
  __esModule: true,
  default: {
    get: jest.fn((path, defaultValue) => defaultValue),
    set: jest.fn(),
    unset: jest.fn(),
    updater: jest.fn(),
  },
}));
jest.mock('@app/store/redux', () => ({
  __esModule: true,
  default: { dispatch: jest.fn() },
}));
jest.mock('@app/lib/controller', () => ({
  __esModule: true,
  default: {
    connection: {},
    context: {},
    settings: {},
    state: {},
    type: '',
    workflow: { state: '' },
  },
}));

global.TextEncoder = require('util').TextEncoder;

const { VisualizerWidget } = require('../index');

describe('VisualizerWidget G-code loading', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('passes the file name and G-code string to the visualizer', () => {
    const widget = new VisualizerWidget({ widgetId: 'visualizer' });
    const bbox = {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 10, y: 10, z: 0 },
    };
    const load = jest.fn((name, gcode, callback) => callback({ bbox }));

    widget.setState = (updater, callback) => {
      widget.state = updater(widget.state);
      if (callback) {
        callback();
      }
    };
    widget.visualizer = { load };

    widget.actions.loadGCode({
      name: 'small.gcode',
      content: 'G21\nG90\nM2',
    });
    jest.runOnlyPendingTimers();

    expect(load).toHaveBeenCalledWith(
      'small.gcode',
      'G21\nG90\nM2',
      expect.any(Function)
    );
  });
});
