import * as THREE from 'three';
import config from '@app/store/config';
import Visualizer from '../Visualizer';
import {
  disposeThreeObject,
  rectangularFixture,
} from './fixtures';

jest.mock('@app/store/config', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const PROFILE_A = {
  id: 'profile-a',
  limits: {
    xmin: 0,
    xmax: 200,
    ymin: -100,
    ymax: 100,
    zmin: -10,
    zmax: 10,
  },
};

const PROFILE_B = {
  id: 'profile-b',
  limits: {
    xmin: -100,
    xmax: 0,
    ymin: 50,
    ymax: 100,
    zmin: -10,
    zmax: 10,
  },
};

const createState = () => ({
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

const createHarness = () => {
  const renderedScenes = [];
  const visualizer = new Visualizer({
    show: true,
    state: createState(),
  });

  visualizer.scene = new THREE.Scene();
  visualizer.scene.add(visualizer.group);
  visualizer.renderer = {
    render: jest.fn((scene) => {
      renderedScenes.push(scene);
    }),
  };
  visualizer.controls = {
    reset: jest.fn(),
  };
  visualizer.viewport = {
    reset: jest.fn(),
    set: jest.fn(),
  };
  visualizer.rebuildCoordinateSystems = jest.fn();

  return { renderedScenes, visualizer };
};

const setMachineProfile = profile => {
  config.get.mockImplementation(path => (
    path === 'workspace.machineProfile' ? profile : undefined
  ));
};

const expectPivot = (visualizer, expected) => {
  const actual = visualizer.pivotPoint.get();

  expect(actual.x).toBeCloseTo(expected.x, 6);
  expect(actual.y).toBeCloseTo(expected.y, 6);
  expect(actual.z).toBeCloseTo(expected.z, 6);
};

const expectWorldCenter = (scene, expected) => {
  const object = scene.getObjectByName('Visualizer');
  expect(object).toBeDefined();

  scene.updateMatrixWorld(true);
  const center = new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3());

  expect(center.x).toBeCloseTo(expected.x, 6);
  expect(center.y).toBeCloseTo(expected.y, 6);
  expect(center.z).toBeCloseTo(expected.z, 6);
};

describe('Visualizer pivot geometry baseline', () => {
  let harness;
  let models;
  let detachedObjects;

  beforeEach(() => {
    config.get.mockReset();
    harness = createHarness();
    models = [];
    detachedObjects = [];
  });

  afterEach(() => {
    detachedObjects.forEach(disposeThreeObject);

    models.forEach((model) => {
      disposeThreeObject(model.group);
      if (model.geometry && typeof model.geometry.dispose === 'function') {
        model.geometry.dispose();
      }
    });

    if (harness) {
      disposeThreeObject(harness.visualizer.group);
    }
    config.get.mockReset();
  });

  test('machine profile and G-code transitions preserve the pivot contract', () => {
    const { renderedScenes, visualizer } = harness;

    const changeProfile = (profile) => {
      if (visualizer.limits && !detachedObjects.includes(visualizer.limits)) {
        detachedObjects.push(visualizer.limits);
      }
      setMachineProfile(profile);
      visualizer.changeMachineProfile();
    };

    changeProfile(PROFILE_A);
    expectPivot(visualizer, { x: 100, y: 0, z: 0 });
    expect(visualizer.scene.getObjectByName('Visualizer')).toBeUndefined();

    visualizer.load('rectangle.gcode', rectangularFixture);
    models.push(visualizer.gcodeVisualizer);
    expectPivot(visualizer, { x: 30, y: 40, z: -1 });
    expectWorldCenter(renderedScenes[renderedScenes.length - 1], { x: 0, y: 0, z: 0 });

    changeProfile(PROFILE_A);
    expectPivot(visualizer, { x: 30, y: 40, z: -1 });
    changeProfile(null);
    expectPivot(visualizer, { x: 30, y: 40, z: -1 });
    expectWorldCenter(renderedScenes[renderedScenes.length - 1], { x: 0, y: 0, z: 0 });

    changeProfile(PROFILE_B);
    expectPivot(visualizer, { x: 30, y: 40, z: -1 });
    expectWorldCenter(renderedScenes[renderedScenes.length - 1], { x: 0, y: 0, z: 0 });

    visualizer.unload();
    expectPivot(visualizer, { x: -50, y: 75, z: 0 });
    expect(visualizer.scene.getObjectByName('Visualizer')).toBeUndefined();

    changeProfile(null);
    expectPivot(visualizer, { x: 0, y: 0, z: 0 });
    expect(visualizer.scene.getObjectByName('Visualizer')).toBeUndefined();

    visualizer.load('rectangle.gcode', rectangularFixture);
    models.push(visualizer.gcodeVisualizer);
    expectPivot(visualizer, { x: 30, y: 40, z: -1 });
    expectWorldCenter(renderedScenes[renderedScenes.length - 1], { x: 0, y: 0, z: 0 });
  });

  test('same-content and different-content reloads replace one centered object', () => {
    const { renderedScenes, visualizer } = harness;
    const shorterFixture = [
      'G21', 'G90',
      'G0 X0 Y0 Z0',
      'G1 X5 Y5 Z0',
    ].join('\n');

    setMachineProfile(PROFILE_A);
    visualizer.changeMachineProfile();

    visualizer.load('first.gcode', rectangularFixture);
    const firstModel = visualizer.gcodeVisualizer;
    const firstObject = visualizer.scene.getObjectByName('Visualizer');
    models.push(firstModel);

    let secondBounds;
    visualizer.load('same.gcode', rectangularFixture, ({ bbox }) => {
      secondBounds = bbox;
    });
    const secondModel = visualizer.gcodeVisualizer;
    const secondObject = visualizer.scene.getObjectByName('Visualizer');
    models.push(secondModel);

    expect(secondObject).toBeDefined();
    expect(secondObject).not.toBe(firstObject);
    expect(secondObject.parent).toBe(visualizer.group);
    expect(visualizer.group.children.filter(child => child.name === 'Visualizer')).toHaveLength(1);
    expect(secondBounds).toEqual({
      min: { x: 10, y: 20, z: -2 },
      max: { x: 50, y: 60, z: 0 },
    });
    expect(secondModel.geometry.vertices).toHaveLength(5);
    expectWorldCenter(renderedScenes[renderedScenes.length - 1], { x: 0, y: 0, z: 0 });

    let thirdBounds;
    visualizer.load('different.gcode', shorterFixture, ({ bbox }) => {
      thirdBounds = bbox;
    });
    const thirdModel = visualizer.gcodeVisualizer;
    const thirdObject = visualizer.scene.getObjectByName('Visualizer');
    models.push(thirdModel);

    expect(thirdObject).toBeDefined();
    expect(thirdObject).not.toBe(secondObject);
    expect(visualizer.group.children.filter(child => child.name === 'Visualizer')).toHaveLength(1);
    expect(thirdBounds).toEqual({
      min: { x: 0, y: 0, z: 0 },
      max: { x: 5, y: 5, z: 0 },
    });
    expect(thirdModel.geometry.vertices).toHaveLength(2);
    expectWorldCenter(renderedScenes[renderedScenes.length - 1], { x: 0, y: 0, z: 0 });
  });
});
