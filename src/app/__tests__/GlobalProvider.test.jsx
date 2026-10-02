import { useColorMode } from '@tonic-ui/react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import config from '@app/store/config';
import { GlobalProvider } from '../context';

let mockAppearance = 'auto';

jest.mock('@app/runtime/connectionRuntimeSingleton', () => ({}));
jest.mock('@app/store/redux', () => require('redux').createStore(() => ({})));
jest.mock('@app/store/config', () => {
  const EventEmitter = require('events');
  const store = new EventEmitter();
  store.get = () => mockAppearance;
  store.set = (_key, value) => {
    mockAppearance = value;
    store.emit('change');
  };
  return store;
});
jest.mock('@tonic-ui/react', () => ({
  ...jest.requireActual('@tonic-ui/react'),
  ToastManager: ({ children }) => children,
}));

function ThemeControls() {
  const [mode, setMode] = useColorMode();

  return (
    <>
      <output aria-label="Current theme">{mode}</output>
      <button
        type="button"
        onClick={() => {
          setMode('light');
          config.set('settings.appearance', 'light');
        }}
      >
        Light
      </button>
      <button onClick={() => config.set('settings.appearance', 'auto')} type="button">
        Follow system
      </button>
    </>
  );
}

function installSystemTheme() {
  let dark = false;
  const queries = new Map();

  jest.spyOn(window, 'matchMedia').mockImplementation(query => {
    if (!queries.has(query)) {
      const listeners = new Set();
      queries.set(query, {
        media: query,
        get matches() {
          return query.includes('dark') ? dark : !dark;
        },
        addEventListener: (_event, callback) => listeners.add(callback),
        removeEventListener: (_event, callback) => listeners.delete(callback),
        listeners,
      });
    }
    return queries.get(query);
  });

  return nextDark => {
    act(() => {
      dark = nextDark;
      queries.forEach(query => {
        query.listeners.forEach(callback => callback({ matches: query.matches, media: query.media }));
      });
    });
  };
}

afterEach(() => {
  jest.restoreAllMocks();
});

test('returns to the live system theme after leaving an initially automatic appearance', () => {
  mockAppearance = 'auto';
  const changeSystemTheme = installSystemTheme();
  render(<GlobalProvider><ThemeControls /></GlobalProvider>);

  fireEvent.click(screen.getByRole('button', { name: 'Light', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Follow system', exact: true }));
  changeSystemTheme(true);

  expect(screen.getByLabelText('Current theme')).toHaveTextContent('dark');
});

test('stops following the system when returning to an initially explicit appearance', () => {
  mockAppearance = 'light';
  const changeSystemTheme = installSystemTheme();
  render(<GlobalProvider><ThemeControls /></GlobalProvider>);

  fireEvent.click(screen.getByRole('button', { name: 'Follow system', exact: true }));
  changeSystemTheme(true);
  expect(screen.getByLabelText('Current theme')).toHaveTextContent('dark');

  fireEvent.click(screen.getByRole('button', { name: 'Light', exact: true }));
  changeSystemTheme(false);
  changeSystemTheme(true);

  expect(screen.getByLabelText('Current theme')).toHaveTextContent('light');
});
