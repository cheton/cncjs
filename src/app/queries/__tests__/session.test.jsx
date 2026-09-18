import React, { useEffect } from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderAppUI } from '@app/test/render';

const mockSignin = jest.fn();
const mockSignout = jest.fn();

jest.mock('@app/lib/user', () => ({
  __esModule: true,
  signin: mockSignin,
  signout: mockSignout,
}));

const {
  clearSessionQueryCache,
  signoutAndClearSession,
  useSigninMutation,
} = require('../session');

const getMutationStatus = mutation => {
  if (mutation.isSuccess) {
    return 'success';
  }
  if (mutation.isError) {
    return 'error';
  }
  return 'idle';
};

const MutationProbe = ({ onMutation }) => {
  const mutation = useSigninMutation();

  useEffect(() => {
    onMutation(mutation);
  }, [mutation, onMutation]);

  const submit = async () => {
    try {
      await mutation.mutateAsync({ name: 'user', password: 'password' });
    } catch (error) {
      // The status assertion below observes the mutation failure.
    }
  };

  return (
    <>
      <button type="button" onClick={submit}>Sign in</button>
      <output data-testid="mutation-status">
        {getMutationStatus(mutation)}
      </output>
    </>
  );
};

describe('session query boundary', () => {
  beforeEach(() => {
    mockSignin.mockReset();
    mockSignout.mockReset();
  });

  test('uses the pure signin transport and resolves successful mutations', async () => {
    mockSignin.mockResolvedValue({ authenticated: true, token: 'session-token' });
    const onMutation = jest.fn();

    renderAppUI(<MutationProbe onMutation={onMutation} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(screen.getByTestId('mutation-status')).toHaveTextContent('success'));
    expect(mockSignin).toHaveBeenCalledWith({ name: 'user', password: 'password' });
    expect(onMutation).toHaveBeenCalled();
  });

  test('does not retry failed sign-in mutations', async () => {
    mockSignin.mockRejectedValue(new Error('authentication failed'));

    renderAppUI(<MutationProbe onMutation={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(screen.getByTestId('mutation-status')).toHaveTextContent('error'));
    expect(mockSignin).toHaveBeenCalledTimes(1);
  });

  test('cancels queries before clearing the session cache', async () => {
    const calls = [];
    const queryClient = {
      cancelQueries: jest.fn(() => {
        calls.push('cancel');
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        calls.push('clear');
      }),
    };

    await clearSessionQueryCache(queryClient);

    expect(calls).toEqual(['cancel', 'clear']);
  });

  test('clears the session cache only after sign-out succeeds', async () => {
    const calls = [];
    mockSignout.mockImplementation(() => {
      calls.push('signout');
      return Promise.resolve();
    });
    const queryClient = {
      cancelQueries: jest.fn(() => {
        calls.push('cancel');
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        calls.push('clear');
      }),
    };

    await signoutAndClearSession(queryClient);

    expect(calls).toEqual(['signout', 'cancel', 'clear']);
  });
});
