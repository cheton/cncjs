import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderAppUI } from '@app/test/render';

const mockCommand = jest.fn();
const mockConfigSet = jest.fn();
let mockSpeed = 1000;

jest.mock('react-redux', () => ({
  connect: () => Component => Component,
}));

jest.mock('@app/lib/controller', () => ({
  __esModule: true,
  default: {
    command: mockCommand,
  },
}));

jest.mock('@app/lib/i18n', () => ({
  __esModule: true,
  default: {
    _: value => value,
  },
}));

jest.mock('@app/widgets/shared/useWidgetConfig', () => ({
  __esModule: true,
  default: () => ({
    get: (path, fallback) => (path === 'speed' ? mockSpeed : fallback),
    set: (path, value) => {
      mockConfigSet(path, value);
      if (path === 'speed') {
        mockSpeed = value;
      }
    },
  }),
}));

jest.mock('@app/components/Buttons', () => {
  throw new Error('Spindle must use Tonic Button primitives directly');
});

jest.mock('@app/components/FormControl/Input', () => {
  throw new Error('Spindle must use Tonic Input directly');
});

jest.mock('@app/components/FormGroup', () => {
  throw new Error('Spindle must use Tonic layout primitives directly');
});

jest.mock('@app/components/GridSystem', () => {
  throw new Error('Spindle must use Tonic layout primitives directly');
});

jest.mock('@app/components/InputGroup', () => {
  throw new Error('Spindle must use Tonic InputGroup primitives directly');
});

jest.mock('@app/components/ImageIcon', () => ({
  __esModule: true,
  default: props => <img alt="" {...props} />,
}));

const Spindle = require('../Spindle').default;

describe('Spindle Tonic primitive pilot', () => {
  beforeEach(() => {
    mockSpeed = 1000;
    jest.clearAllMocks();
  });

  test('preserves M7/M8/M9/M3/M4/M5 command payloads', () => {
    renderAppUI(
      <Spindle
        isActionable
        mistCoolant={false}
        floodCoolant={false}
        spindle={null}
      />
    );

    const buttons = screen.getAllByRole('button');
    ['M7', 'M8', 'M9', 'M3', 'M4', 'M5'].forEach((label, index) => {
      expect(buttons[index]).toHaveTextContent(label);
      fireEvent.click(buttons[index]);
    });

    expect(mockCommand).toHaveBeenNthCalledWith(1, 'gcode', 'M7');
    expect(mockCommand).toHaveBeenNthCalledWith(2, 'gcode', 'M8');
    expect(mockCommand).toHaveBeenNthCalledWith(3, 'gcode', 'M9');
    expect(mockCommand).toHaveBeenNthCalledWith(4, 'gcode', 'M3 S1000');
    expect(mockCommand).toHaveBeenNthCalledWith(5, 'gcode', 'M4 S1000');
    expect(mockCommand).toHaveBeenNthCalledWith(6, 'gcode', 'M5');
  });

  test('disables every command when the controller is not actionable', () => {
    renderAppUI(
      <Spindle
        isActionable={false}
        mistCoolant={false}
        floodCoolant={false}
        spindle={null}
      />
    );

    expect(screen.getAllByRole('button')).toHaveLength(6);
    screen.getAllByRole('button').forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  test('persists positive and non-positive speed values through config', () => {
    renderAppUI(
      <Spindle
        isActionable
        mistCoolant={false}
        floodCoolant={false}
        spindle={null}
      />
    );

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '2400' } });
    expect(mockConfigSet).toHaveBeenLastCalledWith('speed', 2400);

    fireEvent.change(input, { target: { value: '-10' } });
    expect(mockConfigSet).toHaveBeenLastCalledWith('speed', 0);
  });
});
