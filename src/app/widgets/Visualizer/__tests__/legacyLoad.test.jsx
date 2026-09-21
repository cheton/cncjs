import { UPDATE_BOUNDING_BOX } from '@app/actions/controller';
import controller from '@app/lib/controller';
import reduxStore from '@app/store/redux';
import GCodeVisualizer from '../GCodeVisualizer';
import Visualizer from '../Visualizer';
import { VisualizerWidgetClass } from '../index';
import {
  disposeGCodeVisualizer,
  rectangularFixture,
} from './fixtures';

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

const createVisualizerState = () => ({
  cameraMode: 'rotate',
  gcode: { sent: 0 },
  isAgitated: false,
  machinePosition: { x: 0, y: 0, z: 0 },
  objects: {
    coordinateSystem: { visible: false },
    cuttingTool: { visible: false },
    gridLineNumbers: { visible: false },
    limits: { visible: true },
  },
  projection: 'perspective',
  units: 'metric',
  workPosition: { x: 0, y: 0, z: 0 },
});

const expectedBoundingBox = {
  min: { x: 10, y: 20, z: -2 },
  max: { x: 50, y: 60, z: 0 },
};

describe('VisualizerWidget legacy G-code loading', () => {
  let widget;
  let visualizer;
  let render;
  let stateUpdates;

  beforeEach(() => {
    jest.useFakeTimers();
    controller.context = {};
    reduxStore.dispatch.mockClear();

    widget = new VisualizerWidgetClass({
      widgetId: 'visualizer',
    });
    visualizer = new Visualizer({
      show: true,
      state: createVisualizerState(),
    });

    // load() does not need a mounted renderer for this characterization. Its
    // scene setup and asset loaders are intentionally outside this test.
    visualizer.rebuildCoordinateSystems = jest.fn();
    widget.visualizer = visualizer;

    stateUpdates = [];
    widget.setState = (updater, callback) => {
      const nextState = typeof updater === 'function' ? updater(widget.state) : updater;
      stateUpdates.push(nextState);
      widget.state = {
        ...widget.state,
        ...nextState,
      };
      if (callback) {
        callback();
      }
    };

    // This spy calls the real method, including the real Toolpath parser.
    render = jest.spyOn(GCodeVisualizer.prototype, 'render');
  });

  afterEach(() => {
    render.mockRestore();
    if (visualizer && visualizer.gcodeVisualizer) {
      disposeGCodeVisualizer(visualizer.gcodeVisualizer);
    }
    jest.useRealTimers();
  });

  test('passes the exact load contract to the real parser and completes once', () => {
    const load = jest.spyOn(visualizer, 'load');

    widget.actions.loadGCode({
      name: 'rectangle.gcode',
      content: rectangularFixture,
    });

    expect(widget.state.gcode).toMatchObject({
      content: rectangularFixture,
      rendering: true,
      ready: false,
    });

    jest.runOnlyPendingTimers();

    expect(load).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledWith(
      'rectangle.gcode',
      rectangularFixture,
      expect.any(Function)
    );
    expect(render).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledWith(rectangularFixture);

    // These values come from the real parser output, not a mocked load bbox.
    expect(widget.state.gcode).toMatchObject({
      loading: false,
      rendering: false,
      ready: true,
      bbox: expectedBoundingBox,
    });
    expect(controller.context).toMatchObject({
      xmin: 10,
      xmax: 50,
      ymin: 20,
      ymax: 60,
      zmin: -2,
      zmax: 0,
    });
    expect(reduxStore.dispatch).toHaveBeenCalledTimes(1);
    expect(reduxStore.dispatch).toHaveBeenCalledWith({
      type: UPDATE_BOUNDING_BOX,
      payload: { boundingBox: expectedBoundingBox },
    });
    expect(stateUpdates).toHaveLength(2);
    expect(jest.getTimerCount()).toBe(0);
  });
});
