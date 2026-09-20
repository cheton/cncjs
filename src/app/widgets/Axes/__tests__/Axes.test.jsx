import React, { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderAppUI } from '@app/test/render';
import DisplayPanel from '../DisplayPanel';
import Keypad from '../Keypad';
import PositionInput from '../components/PositionInput';
import {
  axesReducer,
  createAxesState,
  getJogDistance,
  shouldHandleJogEvent,
} from '../state';
import MDI from '../MDI';

const mockCommand = jest.fn();

jest.mock('@app/lib/controller', () => ({
  __esModule: true,
  default: { command: (...args) => mockCommand(...args) },
}));

jest.mock('@app/lib/i18n', () => ({
  __esModule: true,
  default: { _: value => value },
}));

describe('Axes position input', () => {
  test('keeps a focused draft when the reported position changes', () => {
    function DraftHarness() {
      const [draft, setDraft] = useState('1.000');
      const [reported, setReported] = useState('1.000');
      return (
        <>
          <button type="button" onClick={() => setReported('3.000')}>Report update</button>
          <output>{reported}</output>
          <PositionInput
            value={draft} onChange={setDraft} onSave={jest.fn()}
            onCancel={jest.fn()}
          />
        </>
      );
    }

    const view = renderAppUI(<DraftHarness />);

    try {
      const input = screen.getByRole('spinbutton', { name: 'Position value' });
      fireEvent.change(input, { target: { value: '2.5' } });
      fireEvent.click(screen.getByRole('button', { name: 'Report update' }));

      expect(input).toHaveValue(2.5);
    } finally {
      view.dispose();
    }
  });

  test('reports position-draft changes to its owner instead of retaining child state', () => {
    const onPositionInputChange = jest.fn();
    const view = renderAppUI(
      <DisplayPanel
        canClick
        units="mm"
        axes={['x']}
        machinePosition={{ x: '1.000' }}
        workPosition={{ x: '1.000' }}
        jog={{ axis: '', keypad: false }}
        controllerType="Grbl"
        positionInput={null}
        onPositionInputChange={onPositionInputChange}
        actions={{
          getWorkCoordinateSystem: () => 'G54',
          getJogDistance: () => 1,
          jog: jest.fn(),
          move: jest.fn(),
          setWorkOffsets: jest.fn(),
        }}
      />
    );

    try {
      fireEvent.click(screen.getByRole('button', { name: 'Set X work offsets' }));
      expect(onPositionInputChange).toHaveBeenCalledWith({ axis: 'x', value: '1.000' });
    } finally {
      view.dispose();
    }
  });
});

describe('Axes reported-position reducer', () => {
  test('merges reports without replacing an active position draft', () => {
    const state = {
      ...createAxesState({ get: (_key, fallback) => fallback }),
      positionInput: { axis: 'x', value: '2.5' },
    };

    expect(axesReducer(state, {
      type: 'REPORT_POSITION',
      payload: { workPosition: { x: 3, y: 4 } },
    })).toMatchObject({
      workPosition: { x: 3, y: 4 },
      positionInput: { axis: 'x', value: '2.5' },
    });
  });
});

describe('Axes jog settings', () => {
  test('uses the configured metric or imperial step for the active units', () => {
    const jog = {
      imperial: { step: 1, distances: ['0.01', '0.1'] },
      metric: { step: 0, distances: ['0.25', '1'] },
    };

    expect(getJogDistance(jog, 'mm')).toBe(0.25);
    expect(getJogDistance(jog, 'in')).toBe(0.1);
  });
});

describe('Axes keypad', () => {
  test('sends the selected metric distance to the X positive jog action', () => {
    const actions = {
      getJogDistance: () => 0.25,
      jog: jest.fn(),
      move: jest.fn(),
      selectStep: jest.fn(),
      stepBackward: jest.fn(),
      stepForward: jest.fn(),
    };
    const view = renderAppUI(
      <Keypad
        canClick
        units="mm"
        axes={['x', 'y', 'z']}
        jog={{
          axis: '',
          keypad: false,
          imperial: { step: 0, distances: [] },
          metric: { step: 0, distances: [] },
        }}
        actions={actions}
      />
    );

    try {
      fireEvent.click(screen.getByRole('button', { name: 'Move X positive' }));
      expect(actions.jog).toHaveBeenCalledWith({ X: 0.25 });
    } finally {
      view.dispose();
    }
  });
});

describe('Axes MDI command contract', () => {
  beforeEach(() => mockCommand.mockClear());

  test('submits the configured MDI command once', () => {
    const view = renderAppUI(
      <MDI canClick mdi={{ disabled: false, commands: [{ id: 'home', name: 'Home', command: 'G28', grid: {} }] }} />
    );

    try {
      fireEvent.click(screen.getByRole('button', { name: 'Home' }));
      expect(mockCommand).toHaveBeenCalledTimes(1);
      expect(mockCommand).toHaveBeenCalledWith('gcode', 'G28');
    } finally {
      view.dispose();
    }
  });
});

describe('Axes hotkey gate', () => {
  test('rejects key events from an input, modal, blur, and keyup', () => {
    const input = document.createElement('input');
    const modalButton = document.createElement('button');
    modalButton.setAttribute('role', 'dialog');

    expect(shouldHandleJogEvent({ type: 'keydown', target: input }, false)).toBe(false);
    expect(shouldHandleJogEvent({ type: 'keydown', target: modalButton }, true)).toBe(false);
    expect(shouldHandleJogEvent({ type: 'keyup', target: document.body }, false)).toBe(false);
    expect(shouldHandleJogEvent({ type: 'blur', target: document.body }, false)).toBe(false);
  });

  test('accepts a keydown from the widget background when no modal is open', () => {
    expect(shouldHandleJogEvent({ type: 'keydown', target: document.body }, false)).toBe(true);
  });
});
