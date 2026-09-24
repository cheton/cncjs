import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderAppUI } from '@app/test/render';
import General from '../Settings/General';
import Settings from '../Settings';
import ShuttleXpress from '../Settings/ShuttleXpress';
import CreateRecord from '../Settings/MDI/CreateRecord';
import UpdateRecord from '../Settings/MDI/UpdateRecord';
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

  test('ShuttleXpress preserves slider ranges, steps, and keyboard changes', () => {
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

    const minimumFeed = screen.getByRole('slider', { name: 'Minimum feed rate' });
    expect(minimumFeed).toHaveAttribute('aria-valuemin', '100');
    expect(minimumFeed).toHaveAttribute('aria-valuemax', '2500');
    minimumFeed.closest('.rc-slider').getBoundingClientRect = () => ({
      bottom: 0,
      height: 0,
      left: 0,
      right: 100,
      top: 0,
      width: 100,
    });
    fireEvent.focus(minimumFeed);
    fireEvent.keyDown(minimumFeed, { key: 'ArrowRight', keyCode: 39, which: 39 });
    expect(onChange).toHaveBeenLastCalledWith({ ...value, feedrateMin: 150, feedrateMax: 2500 });

    const overshoot = screen.getByRole('slider', { name: 'Distance Overshoot' });
    expect(overshoot).toHaveAttribute('aria-valuemin', '1');
    expect(overshoot).toHaveAttribute('aria-valuemax', '1.5');
    fireEvent.keyDown(overshoot, { key: 'ArrowRight', keyCode: 39, which: 39 });
    expect(onChange).toHaveBeenLastCalledWith({ ...value, overshoot: 1.01 });
  });
});

describe('Axes MDI record form accessibility', () => {
  test.each([
    ['CreateRecord', CreateRecord, {}],
    ['UpdateRecord', UpdateRecord, {
      initialValues: { name: '', command: '', grid: { xs: 6 } },
    }],
  ])('%s blocks invalid keyboard submission', async (name, Component, props) => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    const view = renderAppUI(
      <Component
        {...props}
        onSave={onSave}
        onCancel={jest.fn()}
      />
    );

    try {
      const submit = screen.getByRole('button', { name: 'OK' });
      submit.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByText('This field is required.')).toBeInTheDocument();
      expect(onSave).not.toHaveBeenCalled();
    } finally {
      view.dispose();
    }
  });

  test.each([
    ['CreateRecord', CreateRecord, {}],
    ['UpdateRecord', UpdateRecord, {
      initialValues: { name: 'Home', command: 'G28', grid: { xs: 6 } },
    }],
  ])('%s preserves the slider range and keyboard commit', async (name, Component, props) => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    const view = renderAppUI(
      <Component
        {...props}
        onSave={onSave}
        onCancel={jest.fn()}
      />
    );

    try {
      if (name === 'CreateRecord') {
        await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Home');
        await user.type(screen.getByRole('textbox', { name: 'Command' }), 'G28');
      }

      const slider = screen.getByRole('slider', { name: 'Button width' });
      expect(slider).toHaveAttribute('aria-valuemin', '1');
      expect(slider).toHaveAttribute('aria-valuemax', '12');
      fireEvent.keyDown(slider, { key: 'ArrowRight', keyCode: 39, which: 39 });

      const submit = screen.getByRole('button', { name: 'OK' });
      submit.focus();
      await user.keyboard('{Enter}');
      expect(onSave).toHaveBeenCalledWith({
        name: 'Home',
        command: 'G28',
        grid: { xs: 7 },
      });
    } finally {
      view.dispose();
    }
  });
});
