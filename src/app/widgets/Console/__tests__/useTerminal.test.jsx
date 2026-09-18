import React from 'react';
import { act, render } from '@testing-library/react';
import useTerminal from '../useTerminal';

const mockXtermInstances = [];
const mockFitAddons = [];
const mockScrollbars = [];

jest.mock('xterm', () => ({
  Terminal: jest.fn(options => {
    const line = {
      length: 80,
      loadCell: jest.fn(),
      setCell: jest.fn(),
      translateToString: jest.fn(() => '> '),
    };
    const instance = {
      cols: 80,
      element: {},
      onKey: jest.fn(),
      onResize: jest.fn(),
      options,
      prompt: null,
      refresh: jest.fn(),
      resize: jest.fn(),
      rows: 24,
      setOption: jest.fn(),
      textarea: {},
      write: jest.fn(),
      clear: jest.fn(),
      clearSelection: jest.fn(),
      selectAll: jest.fn(),
      _core: {
        buffer: {
          getNullCell: jest.fn(() => ({})),
          lines: { get: jest.fn(() => line) },
          x: 2,
          y: 0,
          ybase: 0,
        },
        refresh: jest.fn(),
      },
      keyDisposable: { dispose: jest.fn() },
      resizeDisposable: { dispose: jest.fn() },
      loadAddon: jest.fn(),
      open: jest.fn(),
      focus: jest.fn(),
      dispose: jest.fn(),
    };
    instance.onKey.mockImplementation(handler => {
      instance.keyHandler = handler;
      return instance.keyDisposable;
    });
    instance.onResize.mockImplementation(handler => {
      instance.resizeHandler = handler;
      return instance.resizeDisposable;
    });
    mockXtermInstances.push(instance);
    return instance;
  }),
}));

jest.mock('xterm-addon-fit', () => ({
  FitAddon: jest.fn(() => {
    const addon = {
      dispose: jest.fn(),
      proposeDimensions: jest.fn(() => ({ cols: 80, rows: 24 })),
    };
    mockFitAddons.push(addon);
    return addon;
  }),
}));

jest.mock('perfect-scrollbar', () => jest.fn(() => {
  const scrollbar = {
    destroy: jest.fn(),
    update: jest.fn(),
  };
  mockScrollbars.push(scrollbar);
  return scrollbar;
}));

let latestApi;

function Harness(props) {
  latestApi = useTerminal(props);
  return <div ref={latestApi.containerRef} />;
}

describe('useTerminal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockXtermInstances.length = 0;
    mockFitAddons.length = 0;
    mockScrollbars.length = 0;
    latestApi = undefined;
  });

  test('creates no resource while disabled and disposes every owned resource', () => {
    const view = render(
      <Harness
        enabled={false}
        cols={254}
        rows={15}
        cursorBlink={true}
        scrollback={1000}
        tabStopWidth={2}
        onData={jest.fn()}
      />,
    );

    expect(mockXtermInstances).toHaveLength(0);

    view.rerender(
      <Harness
        enabled={true}
        cols={254}
        rows={15}
        cursorBlink={true}
        scrollback={1000}
        tabStopWidth={2}
        onData={jest.fn()}
      />,
    );

    expect(mockXtermInstances).toHaveLength(1);
    const [term] = mockXtermInstances;
    const [addon] = mockFitAddons;
    view.unmount();

    expect(term.keyDisposable.dispose).toHaveBeenCalledTimes(1);
    expect(term.resizeDisposable.dispose).toHaveBeenCalledTimes(1);
    expect(addon.dispose).toHaveBeenCalledTimes(1);
    expect(term.dispose).toHaveBeenCalledTimes(1);
  });

  test('keeps one xterm resource while options, dimensions, and onData change', () => {
    const firstOnData = jest.fn();
    const secondOnData = jest.fn();
    const view = render(
      <Harness
        enabled={true}
        cols={254}
        rows={15}
        cursorBlink={true}
        scrollback={1000}
        tabStopWidth={2}
        onData={firstOnData}
      />,
    );

    const [term] = mockXtermInstances;
    act(() => {
      term.keyHandler({
        key: '\u0003',
        domEvent: {
          altGraphKey: false,
          altKey: false,
          ctrlKey: true,
          key: 'c',
          metaKey: false,
        },
      });
    });
    expect(firstOnData).toHaveBeenCalledWith('\u0003');

    view.rerender(
      <Harness
        enabled={true}
        cols={254}
        rows={20}
        cursorBlink={false}
        scrollback={500}
        tabStopWidth={4}
        onData={secondOnData}
      />,
    );

    expect(mockXtermInstances).toHaveLength(1);
    expect(term.setOption).toHaveBeenCalledWith('cursorBlink', false);
    expect(term.setOption).toHaveBeenCalledWith('scrollback', 500);
    expect(term.setOption).toHaveBeenCalledWith('tabStopWidth', 4);
    expect(term.resize).toHaveBeenCalledWith(254, 20);

    act(() => {
      term.keyHandler({
        key: '\u0004',
        domEvent: {
          altGraphKey: false,
          altKey: false,
          ctrlKey: true,
          key: 'd',
          metaKey: false,
        },
      });
    });
    expect(secondOnData).toHaveBeenCalledWith('\u0004');
    view.unmount();
  });

  test('preserves prompt, paste, and owner actions', () => {
    const onData = jest.fn();
    const view = render(
      <Harness
        enabled={true}
        cols={254}
        rows={15}
        cursorBlink={true}
        scrollback={1000}
        tabStopWidth={2}
        onData={onData}
      />,
    );

    const [term] = mockXtermInstances;
    expect(latestApi.prompt).toBe('> ');
    term.prompt();
    expect(term.write).toHaveBeenCalledWith('\r\n');
    expect(term.write).toHaveBeenCalledWith(expect.stringContaining('> '));

    act(() => {
      term.textarea.onpaste({
        clipboardData: { getData: jest.fn(() => 'G0\n\nG1') },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      });
    });
    expect(onData).toHaveBeenCalledWith('G0\n');
    expect(onData).toHaveBeenCalledWith('G1\n');

    latestApi.actions.clear();
    latestApi.actions.clearSelection();
    latestApi.actions.refresh();
    latestApi.actions.selectAll();
    latestApi.actions.writeln('response');
    expect(term.clear).toHaveBeenCalledTimes(1);
    expect(term.clearSelection).toHaveBeenCalledTimes(1);
    expect(term.refresh).toHaveBeenCalled();
    expect(term.selectAll).toHaveBeenCalledTimes(1);
    expect(term.write).toHaveBeenCalledWith(expect.stringContaining('response'), undefined);

    view.unmount();
  });
});
