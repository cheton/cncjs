import React, { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { GRBL, MARLIN, SMOOTHIE, TINYG } from '@app/constants/controller';
import { renderAppUI } from '@app/test/render';
import DisplayPanel from '../DisplayPanel';
import Keypad from '../Keypad';
import PositionInput from '../components/PositionInput';
import {
  axesReducer,
  createAxesState,
  createControllerReportAction,
  getJogDistance,
  shouldHandleJogEvent,
} from '../state';
import MDI from '../MDI';
import { subscribeAxesEvents } from '../subscriptions';
import { AxesProvider, useAxes } from '../context';

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
      <AxesProvider value={{
        state: {
          canClick: true,
          units: 'mm',
          axes: ['x'],
          machinePosition: { x: '1.000' },
          workPosition: { x: '1.000' },
          jog: { axis: '', keypad: false },
          controller: { type: 'Grbl' },
          positionInput: null,
        },
        onGetWorkCoordinateSystem: () => 'G54',
        onGetJogDistance: () => 1,
        onJog: jest.fn(),
        onSetPositionInput: onPositionInputChange,
        onSetWorkOffsets: jest.fn(),
      }}
      >
        <DisplayPanel />
      </AxesProvider>
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

  test('normalizes reports for each supported controller without touching the active draft', () => {
    const state = {
      ...createAxesState({ get: (_key, fallback) => fallback }),
      positionInput: { axis: 'x', value: '2.5' },
    };
    const cases = [
      [GRBL, { status: { mpos: { x: 1, a: 2 }, wpos: { x: 3, a: 4 } }, parserstate: { modal: { units: 'G21' } } }, { x: 1, a: 2 }],
      [MARLIN, { pos: { y: 5, b: 6 }, modal: { units: 'G21' } }, { y: 5, b: 6 }],
      [SMOOTHIE, { status: { mpos: { z: 7, c: 8 }, wpos: { z: 9, c: 10 } }, parserstate: { modal: { units: 'G21' } } }, { z: 7, c: 8 }],
      [TINYG, { sr: { mpos: { x: 11, a: 12 }, wpos: { x: 13, a: 14 }, modal: { units: 'G21' } } }, { x: 11, a: 12 }],
    ];

    cases.forEach(([type, controllerState, machinePosition]) => {
      const action = createControllerReportAction(state, type, controllerState, {});
      expect(action).toMatchObject({ type: 'REPORT_POSITION', payload: { machinePosition } });
      expect(axesReducer(state, action).positionInput).toEqual({ axis: 'x', value: '2.5' });
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
    const onJog = jest.fn();
    const view = renderAppUI(
      <AxesProvider value={{
        state: {
          canClick: true,
          units: 'mm',
          axes: ['x', 'y', 'z'],
          jog: {
            axis: '',
            keypad: false,
            imperial: { step: 0, distances: [] },
            metric: { step: 0, distances: [] },
          },
        },
        onGetJogDistance: () => 0.25,
        onJog,
        onMove: jest.fn(),
        onSelectStep: jest.fn(),
        onStepBackward: jest.fn(),
        onStepForward: jest.fn(),
      }}
      >
        <Keypad />
      </AxesProvider>
    );

    try {
      fireEvent.click(screen.getByRole('button', { name: 'Move X positive' }));
      expect(onJog).toHaveBeenCalledWith({ X: 0.25 });
    } finally {
      view.dispose();
    }
  });
});

describe('Axes MDI command contract', () => {
  beforeEach(() => mockCommand.mockClear());

  test('submits the configured MDI command once', () => {
    const view = renderAppUI(
      <AxesProvider value={{
        state: { canClick: true, mdi: { disabled: false, commands: [{ id: 'home', name: 'Home', command: 'G28', grid: {} }] } },
      }}
      >
        <MDI />
      </AxesProvider>
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

describe('Axes event cleanup', () => {
  test('removes controller and hotkey callbacks and clears pending shuttle work', () => {
    const controllerEvents = { 'connection:open': jest.fn() };
    const shuttleControlEvents = { JOG: jest.fn() };
    const controllerClient = { addListener: jest.fn(), removeListener: jest.fn() };
    const hotkeys = { on: jest.fn(), removeListener: jest.fn() };
    const shuttleControl = { clear: jest.fn(), removeAllListeners: jest.fn() };

    const cleanup = subscribeAxesEvents({
      controller: controllerClient,
      combokeys: hotkeys,
      controllerEvents,
      shuttleControlEvents,
      shuttleControl,
    });

    expect(controllerClient.addListener).toHaveBeenCalledWith('connection:open', controllerEvents['connection:open']);
    expect(hotkeys.on).toHaveBeenCalledWith('JOG', shuttleControlEvents.JOG);

    cleanup();

    expect(controllerClient.removeListener).toHaveBeenCalledWith('connection:open', controllerEvents['connection:open']);
    expect(hotkeys.removeListener).toHaveBeenCalledWith('JOG', shuttleControlEvents.JOG);
    expect(shuttleControl.clear).toHaveBeenCalledTimes(1);
    expect(shuttleControl.removeAllListeners).toHaveBeenCalledWith('flush');
  });
});

describe('Axes provider', () => {
  test('provides state and named commands to a child consumer', () => {
    function Consumer() {
      const { state, onJog } = useAxes();
      return <button type="button" onClick={() => onJog({ X: state.distance })}>Jog</button>;
    }

    const onJog = jest.fn();
    const view = renderAppUI(
      <AxesProvider value={{ state: { distance: 0.25 }, onJog }}>
        <Consumer />
      </AxesProvider>
    );

    try {
      fireEvent.click(screen.getByRole('button', { name: 'Jog' }));
      expect(onJog).toHaveBeenCalledWith({ X: 0.25 });
    } finally {
      view.dispose();
    }
  });
});
