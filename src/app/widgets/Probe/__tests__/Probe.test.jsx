import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderAppUI } from '@app/test/render';

const mockCommand = jest.fn();
const mockConfigSet = jest.fn();
const configValues = {
  useTLO: false,
};

jest.mock('@app/lib/controller', () => ({
  __esModule: true,
  default: { command: mockCommand },
}));

jest.mock('@app/lib/i18n', () => ({
  __esModule: true,
  default: { _: value => value },
}));

jest.mock('@app/widgets/shared/useWidgetConfig', () => ({
  __esModule: true,
  default: () => ({
    get: (path, fallback) => (
      Object.prototype.hasOwnProperty.call(configValues, path)
        ? configValues[path]
        : fallback
    ),
    set: (path, value) => {
      configValues[path] = value;
      mockConfigSet(path, value);
    },
  }),
}));

jest.mock('@app/components/Buttons', () => {
  throw new Error('ProbeModal must use Tonic Button directly');
});

jest.mock('@app/components/FormGroup', () => {
  throw new Error('ProbeModal must use Tonic layout primitives directly');
});

jest.mock('@app/components/Modal', () => {
  throw new Error('ProbeModal must use Tonic modal primitives directly');
});

jest.mock('@app/components/CodePreview', () => ({
  __esModule: true,
  default: ({ data }) => <pre>{data}</pre>,
}));

const ProbeModal = require('../modals/ProbeModal').default;

const probeData = {
  probeAxis: 'Z',
  probeCommand: 'G38.2',
  probeDepth: 10,
  probeFeedrate: 100,
  touchPlateHeight: 1,
  retractionDistance: 2,
  wcs: 'G54',
};

describe('Probe modal command contract', () => {
  beforeEach(() => {
    configValues.useTLO = false;
    jest.clearAllMocks();
  });

  test('cancels without sending a probe command', () => {
    const onClose = jest.fn();

    renderAppUI(<ProbeModal onClose={onClose} probeData={probeData} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockCommand).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('sends exactly one WCS probe command from the preview', () => {
    const onClose = jest.fn();

    renderAppUI(<ProbeModal onClose={onClose} probeData={probeData} />);
    fireEvent.click(screen.getByRole('button', { name: 'Run Probe' }));

    expect(mockCommand).toHaveBeenCalledTimes(1);
    expect(mockCommand).toHaveBeenCalledWith(
      'gcode',
      expect.stringContaining('G38.2 Z-10 F100')
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
