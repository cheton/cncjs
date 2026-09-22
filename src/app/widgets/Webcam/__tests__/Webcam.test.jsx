import React from 'react';
import { act, render } from '@testing-library/react';
import Webcam from '@app/components/Webcam';

describe('Webcam media owner', () => {
  beforeEach(() => {
    navigator.mediaDevices = { getUserMedia: jest.fn() };
  });

  test('stops a late media request after unmount', async () => {
    let resolve;
    const stop = jest.fn();
    const stream = { getTracks: () => [{ stop }] };
    navigator.mediaDevices.getUserMedia.mockReturnValue(new Promise(done => {
      resolve = done;
    }));
    const view = render(<Webcam audio={false} video />);
    view.unmount();
    await act(() => {
      resolve(stream);
      return Promise.resolve();
    });
    expect(stop).toHaveBeenCalledTimes(1);
  });

  test('releases the active stream on unmount', async () => {
    const stop = jest.fn();
    navigator.mediaDevices.getUserMedia.mockResolvedValue({ getTracks: () => [{ stop }] });
    const view = render(<Webcam audio={false} video />);
    await act(async () => {
      await Promise.resolve();
    });
    view.unmount();
    expect(stop).toHaveBeenCalledTimes(1);
  });

  test('releases the prior stream when the selected device changes', async () => {
    const firstStop = jest.fn();
    const secondStop = jest.fn();
    navigator.mediaDevices.getUserMedia
      .mockResolvedValueOnce({ getTracks: () => [{ stop: firstStop }] })
      .mockResolvedValueOnce({ getTracks: () => [{ stop: secondStop }] });
    const view = render(<Webcam audio={false} video="first" />);

    await act(() => Promise.resolve());
    view.rerender(<Webcam audio={false} video="second" />);
    await act(() => Promise.resolve());

    expect(firstStop).toHaveBeenCalledTimes(1);
    expect(secondStop).not.toHaveBeenCalled();
  });
});
