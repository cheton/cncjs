import * as THREE from 'three';
import { createVisualizerEngine } from '../VisualizerEngine';
import Visualizer from '../Visualizer';
import { rectangularFixture } from './fixtures';

const mockRenderer = {
  clear: jest.fn(),
  domElement: document.createElement('canvas'),
  render: jest.fn(),
  setClearColor: jest.fn(),
  setPixelRatio: jest.fn(),
  setSize: jest.fn(),
  shadowMap: {},
};

jest.mock('three', () => {
  const actual = jest.requireActual('three');
  return {
    ...actual,
    WebGLRenderer: jest.fn(() => mockRenderer),
  };
});

jest.mock('@app/lib/three/TrackballControls', () => {
  const mockThree = jest.requireActual('three');
  return jest.fn().mockImplementation(() => ({
    addEventListener: jest.fn(),
    dispose: jest.fn(),
    handleResize: jest.fn(),
    noPan: false,
    noZoom: false,
    object: { position: new mockThree.Vector3(), up: new mockThree.Vector3() },
    panSpeed: 1,
    reset: jest.fn(),
    setMouseButtonState: jest.fn(),
    target: new mockThree.Vector3(),
    update: jest.fn(),
    zoomIn: jest.fn(),
    zoomOut: jest.fn(),
  }));
});

jest.mock('@app/store/config', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
  },
}));

jest.mock('@app/lib/three/WebGL', () => ({
  isWebGLAvailable: jest.fn(() => true),
}));

jest.mock('../helpers', () => {
  const actual = jest.requireActual('../helpers');
  return {
    ...actual,
    loadSTL: jest.fn(() => new Promise(() => {})),
    loadTexture: jest.fn(() => new Promise(() => {})),
  };
});

const viewState = {
  cameraMode: 'rotate',
  cameraPosition: '3d',
  gcode: { sent: 0 },
  isAgitated: false,
  machinePosition: { x: 0, y: 0, z: 0 },
  machineProfile: null,
  objects: {
    coordinateSystem: { visible: false },
    cuttingTool: { visible: false },
    gridLineNumbers: { visible: false },
    limits: { visible: true },
  },
  projection: 'perspective',
  show: true,
  units: 'metric',
  workPosition: { x: 0, y: 0, z: 0 },
};

describe('VisualizerEngine', () => {
  beforeAll(() => {
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => ({
      fillText: jest.fn(),
      measureText: () => ({ width: 10 }),
    }));
  });

  afterAll(() => {
    HTMLCanvasElement.prototype.getContext.mockRestore();
  });

  beforeEach(() => {
    Object.values(mockRenderer).forEach(value => value && value.mockClear && value.mockClear());
    mockRenderer.shadowMap = {};
  });

  test('parses G-code synchronously, centers the toolpath, and renders the real scene', () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { value: 640 });
    Object.defineProperty(container, 'clientHeight', { value: 480 });

    const engine = createVisualizerEngine({ container, viewState });
    const result = engine.load({
      name: 'rectangle.gcode',
      content: rectangularFixture,
    });

    expect(result).toEqual({
      bbox: {
        min: { x: 10, y: 20, z: -2 },
        max: { x: 50, y: 60, z: 0 },
      },
    });
    const object = mockRenderer.render.mock.calls.at(-1)[0].getObjectByName('Visualizer');
    expect(object.position).toMatchObject({ x: -30, y: -40, z: 1 });
    expect(mockRenderer.render).toHaveBeenLastCalledWith(
      expect.any(THREE.Scene),
      expect.any(Object),
    );
  });

  test('applies the top-level sent view-state field to the rendered toolpath', () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { value: 640 });
    Object.defineProperty(container, 'clientHeight', { value: 480 });
    const engine = createVisualizerEngine({ container, viewState });

    engine.load({ name: 'rectangle.gcode', content: rectangularFixture });
    const object = mockRenderer.render.mock.calls.at(-1)[0].getObjectByName('Visualizer');
    const workpiece = object.children[0];
    const initialColor = workpiece.geometry.colors[0].clone();

    engine.update({ sent: 3 });

    expect(workpiece.geometry.colors[0]).not.toEqual(initialColor);
  });

  test('applies the initial work position to the cutting pointer', () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { value: 640 });
    Object.defineProperty(container, 'clientHeight', { value: 480 });

    createVisualizerEngine({
      container,
      viewState: {
        ...viewState,
        workPosition: { x: 12, y: 24, z: -3 },
      },
    });

    const pointer = mockRenderer.render.mock.calls.at(-1)[0].getObjectByName('CuttingPointer');
    expect(pointer.position).toMatchObject({ x: 12, y: 24, z: -3 });
  });

  test('keeps the canvas host sized while hidden', () => {
    const visualizer = Visualizer({
      containerRef: jest.fn(),
      show: false,
    });

    expect(visualizer.props.style).toMatchObject({
      height: '100%',
      visibility: 'hidden',
      width: '100%',
    });
  });

  test('exposes only the supplied host ref on the view element', () => {
    const containerRef = jest.fn();
    const visualizer = Visualizer({ containerRef, show: true });

    expect(visualizer.ref).toBe(containerRef);
  });
});
