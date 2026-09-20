import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderAppUI } from '@app/test/render';
import StartProbeModal from '../StartProbeModal';
import StopProbeModal from '../StopProbeModal';
import TestProbeModal from '../TestProbeModal';

jest.mock('@app/lib/i18n', () => ({
  __esModule: true,
  default: { _: (value, options = {}) => value.replace('{{count}}', options.count) },
}));

jest.mock('../ProbeAreaDiagram', () => () => null);
jest.mock('../ZProbeDiagram', () => () => null);

const value = {
  clearanceZ: 5,
  endX: 10,
  endY: 10,
  endZ: -1,
  feedrate: 100,
  startX: 0,
  startY: 0,
  startZ: 0,
  stepX: 5,
  stepY: 5,
  units: 'mm',
};

describe('Autolevel probe dialogs', () => {
  test('cancels a start probe without invoking the command callback', () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    const view = renderAppUI(
      <StartProbeModal
        canConfirm onCancel={onCancel} onConfirm={onConfirm}
        value={value}
      />,
    );

    try {
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    } finally {
      view.dispose();
    }
  });

  test('requires confirmation and invokes start probing only once', () => {
    const onConfirm = jest.fn();
    const view = renderAppUI(
      <StartProbeModal
        canConfirm onCancel={jest.fn()} onConfirm={onConfirm}
        value={value}
      />,
    );

    try {
      const confirm = screen.getByRole('button', { name: 'Start Probing' });
      expect(confirm).toBeDisabled();
      fireEvent.click(screen.getByRole('checkbox', { name: 'I confirm probe wires are correctly connected' }));
      fireEvent.click(confirm);
      fireEvent.click(confirm);

      expect(onConfirm).toHaveBeenCalledTimes(1);
    } finally {
      view.dispose();
    }
  });

  test('blocks invalid probe values before command callbacks can run', () => {
    const onStart = jest.fn();
    const onTest = jest.fn();
    const start = renderAppUI(
      <StartProbeModal
        canConfirm={false} onCancel={jest.fn()} onConfirm={onStart}
        value={value}
      />,
    );
    const test = renderAppUI(
      <TestProbeModal
        canConfirm={false} onCancel={jest.fn()} onConfirm={onTest}
        value={value}
      />,
    );

    try {
      fireEvent.click(screen.getAllByRole('checkbox', { name: 'I confirm probe wires are correctly connected' })[0]);
      fireEvent.click(screen.getAllByRole('checkbox', { name: 'I confirm probe wires are correctly connected' })[1]);
      expect(screen.getByRole('button', { name: 'Start Probing' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Start Test Probe' })).toBeDisabled();
      expect(onStart).not.toHaveBeenCalled();
      expect(onTest).not.toHaveBeenCalled();
    } finally {
      start.dispose();
      test.dispose();
    }
  });

  test('continues probing without stopping and stops at most once after confirmation', () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    const view = renderAppUI(<StopProbeModal onCancel={onCancel} onConfirm={onConfirm} />);

    try {
      fireEvent.click(screen.getByRole('button', { name: 'Continue Probing' }));
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'Stop Probing' }));
      fireEvent.click(screen.getByRole('button', { name: 'Stop Probing' }));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    } finally {
      view.dispose();
    }
  });
});
