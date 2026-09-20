import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderAppUI } from '@app/test/render';
import { MEDIA_SOURCE_LOCAL, MEDIA_SOURCE_STREAM } from '../constants';

const mockValues = {
  mediaSource: MEDIA_SOURCE_LOCAL,
  deviceId: '__default__',
  url: '',
};
const mockSetConfig = jest.fn();

jest.mock('@app/lib/i18n', () => ({
  __esModule: true,
  default: { _: value => value },
}));

jest.mock('@app/widgets/shared/useWidgetConfig', () => ({
  __esModule: true,
  default: () => ({
    get: (path, fallback) => (mockValues[path] === undefined ? fallback : mockValues[path]),
    set: (path, value) => {
      mockValues[path] = value;
      mockSetConfig(path, value);
    },
  }),
}));

const SettingsModal = require('../modals/SettingsModal').default;

describe('Webcam settings draft', () => {
  beforeEach(() => {
    Object.assign(mockValues, {
      mediaSource: MEDIA_SOURCE_LOCAL,
      deviceId: '__default__',
      url: 'http://saved.example/stream',
    });
    mockSetConfig.mockClear();
  });

  test('does not write the draft when cancelled', () => {
    const onClose = jest.fn();
    renderAppUI(<SettingsModal onClose={onClose} />);

    fireEvent.click(screen.getByLabelText('Connect to an IP camera'));
    fireEvent.change(screen.getByRole('textbox', { name: 'Stream URL' }), {
      target: { value: 'http://cancelled.example/stream' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockSetConfig).not.toHaveBeenCalled();
    expect(mockValues.url).toBe('http://saved.example/stream');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('writes all settings only when saved', () => {
    const onClose = jest.fn();
    renderAppUI(<SettingsModal onClose={onClose} />);

    fireEvent.click(screen.getByLabelText('Connect to an IP camera'));
    fireEvent.change(screen.getByRole('textbox', { name: 'Stream URL' }), {
      target: { value: 'http://camera.example/stream' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(mockSetConfig).toHaveBeenCalledWith('mediaSource', MEDIA_SOURCE_STREAM);
    expect(mockSetConfig).toHaveBeenCalledWith('deviceId', '__default__');
    expect(mockSetConfig).toHaveBeenCalledWith('url', 'http://camera.example/stream');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
