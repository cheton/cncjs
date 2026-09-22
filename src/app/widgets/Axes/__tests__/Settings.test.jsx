import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderAppUI } from '@app/test/render';
import General from '../Settings/General';
import Settings from '../Settings';
import ShuttleXpress from '../Settings/ShuttleXpress';
import { useMdiQuery, useSaveMdiMutation } from '../queries';

jest.mock('../queries', () => ({
  useMdiQuery: jest.fn(),
  useSaveMdiMutation: jest.fn(),
}));

jest.mock('@app/lib/i18n', () => ({
  __esModule: true,
  default: {
    _: value => value,
  },
}));

jest.mock('rc-slider', () => {
  const Slider = props => (
    <input
      type="range"
      {...props}
      onChange={event => props.onChange(Number(event.target.value))}
    />
  );

  Slider.Range = props => (
    <input
      type="range"
      {...props}
      onChange={event => props.onChange([Number(event.target.value), props.value[1]])}
    />
  );

  return Slider;
});

describe('Axes controlled Settings tabs', () => {
  const createConfig = () => ({
    get: jest.fn((key, fallback) => ({
      axes: ['x', 'y'],
      'jog.imperial.distances': ['0.1'],
      'jog.metric.distances': ['1'],
      'shuttle.feedrateMin': 100,
      'shuttle.feedrateMax': 2500,
      'shuttle.hertz': 10,
      'shuttle.overshoot': 1,
    }[key] ?? fallback)),
    set: jest.fn(),
  });

  beforeEach(() => {
    useMdiQuery.mockReturnValue({
      data: { records: [{ id: 'mdi-1', name: 'Home', action: 'G28', grid: {} }] },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    useSaveMdiMutation.mockReturnValue({
      isPending: false,
      mutateAsync: jest.fn().mockResolvedValue({}),
    });
  });

  test('saves the MDI snapshot before writing normalized local settings', async () => {
    const config = createConfig();
    const onSave = jest.fn();
    const mutateAsync = jest.fn().mockResolvedValue({});
    useSaveMdiMutation.mockReturnValue({ isPending: false, mutateAsync });

    const view = renderAppUI(<Settings config={config} onSave={onSave} />);

    try {
      fireEvent.change(screen.getByRole('spinbutton', { name: 'Custom Jog Distance (mm) 1' }), {
        target: { value: '2.5' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

      await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({
        records: [{ id: 'mdi-1', name: 'Home', action: 'G28', grid: {} }],
      }));
      expect(config.set.mock.calls).toEqual([
        ['axes', ['x', 'y']],
        ['jog.imperial.distances', [0.1]],
        ['jog.metric.distances', [2.5]],
        ['shuttle.feedrateMin', 100],
        ['shuttle.feedrateMax', 2500],
        ['shuttle.hertz', 10],
        ['shuttle.overshoot', 1],
      ]);
      expect(onSave).toHaveBeenCalledTimes(1);
    } finally {
      view.dispose();
    }
  });

  test('keeps the draft and writes nothing locally when the MDI save fails', async () => {
    const config = createConfig();
    const onSave = jest.fn();
    const mutateAsync = jest.fn().mockRejectedValue(new Error('MDI save failed'));
    useSaveMdiMutation.mockReturnValue({ isPending: false, mutateAsync });

    const view = renderAppUI(<Settings config={config} onSave={onSave} />);

    try {
      fireEvent.change(screen.getByRole('spinbutton', { name: 'Custom Jog Distance (mm) 1' }), {
        target: { value: '2.5' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

      await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('MDI save failed'));
      expect(config.set).not.toHaveBeenCalled();
      expect(onSave).not.toHaveBeenCalled();
      expect(screen.getByRole('spinbutton', { name: 'Custom Jog Distance (mm) 1' })).toHaveValue(2.5);
    } finally {
      view.dispose();
    }
  });

  test('General reports controlled axis and jog draft changes', () => {
    const onChange = jest.fn();
    const value = {
      axes: ['x', 'y'],
      imperialJogDistances: ['0.1'],
      metricJogDistances: ['1'],
    };

    renderAppUI(<General value={value} onChange={onChange} />);

    fireEvent.click(screen.getByRole('checkbox', { name: 'Y-axis' }));
    expect(onChange).toHaveBeenLastCalledWith({
      ...value,
      axes: ['x'],
    });

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Custom Jog Distance (mm) 1' }), {
      target: { value: '2.5' },
    });
    expect(onChange).toHaveBeenLastCalledWith({
      ...value,
      metricJogDistances: ['2.5'],
    });
  });

  test('ShuttleXpress reports controlled slider and select changes', () => {
    const onChange = jest.fn();
    const value = {
      feedrateMin: 100,
      feedrateMax: 2500,
      hertz: 10,
      overshoot: 1,
    };

    renderAppUI(<ShuttleXpress value={value} onChange={onChange} />);

    fireEvent.change(screen.getByRole('combobox', { name: 'Repeat Rate' }), {
      target: { value: '5' },
    });
    expect(onChange).toHaveBeenLastCalledWith({ ...value, hertz: 5 });

    fireEvent.change(screen.getByRole('slider', { name: 'Distance Overshoot' }), {
      target: { value: '1.25' },
    });
    expect(onChange).toHaveBeenLastCalledWith({ ...value, overshoot: 1.25 });
  });
});
