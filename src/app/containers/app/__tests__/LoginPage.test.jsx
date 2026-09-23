import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { renderAppUI } from '@app/test/render';

const mockMutateAsync = jest.fn();
const mockUseSigninMutation = jest.fn(() => ({
  isLoading: false,
  mutateAsync: mockMutateAsync,
}));
const mockControllerConnect = jest.fn((host, options, callback) => callback());
const mockController = {
  connect: mockControllerConnect,
  disconnect: jest.fn(),
};

jest.mock('@app/queries/session', () => ({
  __esModule: true,
  useSigninMutation: mockUseSigninMutation,
}));

jest.mock('@app/lib/user', () => ({
  __esModule: true,
  isAuthenticated: jest.fn(() => false),
  signin: jest.fn(),
}));

jest.mock('@app/lib/controller', () => ({
  __esModule: true,
  default: mockController,
}));

jest.mock('@app/api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({
      data: { allowAnonymousUsageDataCollection: false },
    })),
  },
}));

jest.mock('@app/lib/analytics', () => ({
  initialize: jest.fn(),
}));

jest.mock('@app/lib/i18n', () => ({
  __esModule: true,
  default: {
    _: value => value,
  },
}));

jest.mock('@app/lib/log', () => ({
  debug: jest.fn(),
}));

jest.mock('@app/config/settings', () => ({
  productName: 'CNCjs',
}));

jest.mock('@app/store/config', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => 'session-token'),
  },
}));

const LoginPage = require('../LoginPage').default;

const renderLogin = () => renderAppUI(
  <MemoryRouter>
    <LoginPage />
  </MemoryRouter>
);

describe('LoginPage session mutation boundary', () => {
  beforeEach(() => {
    mockMutateAsync.mockReset();
    mockUseSigninMutation.mockClear();
    mockControllerConnect.mockClear();
  });

  test('uses mutateAsync and preserves the authenticated connection flow', async () => {
    mockMutateAsync.mockResolvedValue({ authenticated: true, token: 'session-token' });

    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'user' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledWith({
      name: 'user',
      password: 'password',
    }));
    expect(mockControllerConnect).toHaveBeenCalledWith(
      '',
      { query: 'token=session-token' },
      expect.any(Function)
    );
  });

  test('keeps the login page in an error state after authentication failure', async () => {
    mockMutateAsync.mockResolvedValue({ authenticated: false, token: null });

    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'user' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(await screen.findByText('Authentication failed.')).toBeInTheDocument();
    expect(mockControllerConnect).not.toHaveBeenCalled();
  });

  test('does not submit twice while the first mutation is pending', async () => {
    mockMutateAsync.mockReturnValue(new Promise(() => {}));

    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'user' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(1));
  });

  test('links required field errors to their controls and blocks invalid sign-in', async () => {
    renderLogin();

    const name = screen.getByRole('textbox', { name: 'Username' });
    const password = screen.getByLabelText('Password');
    fireEvent.blur(name);
    fireEvent.blur(password);

    const errors = await screen.findAllByRole('alert');
    expect(errors).toHaveLength(2);
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(password).toHaveAttribute('aria-invalid', 'true');
    expect(name.getAttribute('aria-describedby')).toContain(errors[0].id);
    expect(password.getAttribute('aria-describedby')).toContain(errors[1].id);

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });
});
