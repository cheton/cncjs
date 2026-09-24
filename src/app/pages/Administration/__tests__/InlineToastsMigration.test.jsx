import React from 'react';
import {
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderAppUI } from '@app/test/render';

const mockMutationOptions = {};
const mockNotifyToast = jest.fn();
const mockUseToast = jest.fn(() => mockNotifyToast);

const mockMutationResult = () => ({
  isLoading: false,
  mutate: jest.fn(),
});

const mockCreateCommandMutation = jest.fn(options => {
  mockMutationOptions.createCommand = options;
  return mockMutationResult();
});
const mockUpdateCommandMutation = jest.fn(options => {
  mockMutationOptions.updateCommand = options;
  return mockMutationResult();
});
const mockCreateEventMutation = jest.fn(options => {
  mockMutationOptions.createEvent = options;
  return mockMutationResult();
});
const mockUpdateEventMutation = jest.fn(options => {
  mockMutationOptions.updateEvent = options;
  return mockMutationResult();
});
const mockCreateMachineMutation = jest.fn(options => {
  mockMutationOptions.createMachine = options;
  return mockMutationResult();
});
const mockUpdateMachineMutation = jest.fn(options => {
  mockMutationOptions.updateMachine = options;
  return mockMutationResult();
});
const mockCreateMacroMutation = jest.fn(options => {
  mockMutationOptions.createMacro = options;
  return mockMutationResult();
});
const mockUpdateMacroMutation = jest.fn(options => {
  mockMutationOptions.updateMacro = options;
  return mockMutationResult();
});
const mockCreateUserMutation = jest.fn(options => {
  mockMutationOptions.createUser = options;
  return mockMutationResult();
});
const mockUpdateUserMutation = jest.fn(options => {
  mockMutationOptions.updateUser = options;
  return mockMutationResult();
});

const mockReadQuery = jest.fn(() => ({
  data: {
    action: 'G0 X1',
    commands: 'G0 X1',
    enabled: true,
    name: 'Fixture name',
    title: 'Fixture user',
    trigger: 'manual',
  },
  isError: false,
  isFetching: false,
}));

jest.mock('@app/hooks/useToast', () => ({
  __esModule: true,
  default: (...args) => mockUseToast(...args),
}));

jest.mock('@app/lib/i18n', () => ({
  __esModule: true,
  default: { _: value => value },
}));

jest.mock('../Commands/queries', () => ({
  API_COMMANDS_QUERY_KEY: ['api/commands'],
  useCreateCommandMutation: (...args) => mockCreateCommandMutation(...args),
  useReadCommandQuery: (...args) => mockReadQuery(...args),
  useUpdateCommandMutation: (...args) => mockUpdateCommandMutation(...args),
}));

jest.mock('../Events/queries', () => ({
  API_EVENTS_QUERY_KEY: ['api/events'],
  useCreateEventMutation: (...args) => mockCreateEventMutation(...args),
  useReadEventQuery: (...args) => mockReadQuery(...args),
  useUpdateEventMutation: (...args) => mockUpdateEventMutation(...args),
}));

jest.mock('../Machines/queries', () => ({
  API_MACHINES_QUERY_KEY: ['api/machines'],
  useCreateMachineMutation: (...args) => mockCreateMachineMutation(...args),
  useReadMachineQuery: (...args) => mockReadQuery(...args),
  useUpdateMachineMutation: (...args) => mockUpdateMachineMutation(...args),
}));

jest.mock('@app/queries/macros', () => ({
  useCreateMacroMutation: (...args) => mockCreateMacroMutation(...args),
  useReadMacroQuery: (...args) => mockReadQuery(...args),
  useUpdateMacroMutation: (...args) => mockUpdateMacroMutation(...args),
}));

jest.mock('../Users/queries', () => ({
  API_USERS_QUERY_KEY: ['api/users'],
  useCreateUserMutation: (...args) => mockCreateUserMutation(...args),
  useReadUserQuery: (...args) => mockReadQuery(...args),
  useUpdateUserMutation: (...args) => mockUpdateUserMutation(...args),
}));

const drawerCases = [
  ['CreateCommandDrawer', require('../Commands/drawers/CreateCommandDrawer').default, 'createCommand', false, 'Add', ['Command name:', 'Command action:']],
  ['UpdateCommandDrawer', require('../Commands/drawers/UpdateCommandDrawer').default, 'updateCommand', true, 'Save', ['Command name:', 'Command action:']],
  ['CreateEventDrawer', require('../Events/drawers/CreateEventDrawer').default, 'createEvent', false, 'Add', ['Event name:', 'Event trigger:', 'Event action:']],
  ['UpdateEventDrawer', require('../Events/drawers/UpdateEventDrawer').default, 'updateEvent', true, 'Save', ['Event name:', 'Event trigger:', 'Event action:']],
  ['CreateMachineDrawer', require('../Machines/drawers/CreateMachineDrawer').default, 'createMachine', false, 'Add', ['Machine name:', 'Shell commands:']],
  ['UpdateMachineDrawer', require('../Machines/drawers/UpdateMachineDrawer').default, 'updateMachine', true, 'Save', ['Machine name:', 'Shell commands:']],
  ['CreateMacroDrawer', require('../Macros/drawers/CreateMacroDrawer').default, 'createMacro', false, 'Add', ['Macro name:', 'G-code commands:']],
  ['UpdateMacroDrawer', require('../Macros/drawers/UpdateMacroDrawer').default, 'updateMacro', true, 'Save', ['Macro name:', 'G-code commands:']],
  ['CreateUserDrawer', require('../Users/drawers/CreateUserDrawer').default, 'createUser', false, 'Add', ['User name:', 'Shell commands:']],
  ['UpdateUserDrawer', require('../Users/drawers/UpdateUserDrawer').default, 'updateUser', true, 'Save', ['User name:', 'Shell commands:']],
];

const mutationMocks = [
  mockCreateCommandMutation,
  mockUpdateCommandMutation,
  mockCreateEventMutation,
  mockUpdateEventMutation,
  mockCreateMachineMutation,
  mockUpdateMachineMutation,
  mockCreateMacroMutation,
  mockUpdateMacroMutation,
  mockCreateUserMutation,
  mockUpdateUserMutation,
];

const mutationMocksByKey = {
  createCommand: mockCreateCommandMutation,
  updateCommand: mockUpdateCommandMutation,
  createEvent: mockCreateEventMutation,
  updateEvent: mockUpdateEventMutation,
  createMachine: mockCreateMachineMutation,
  updateMachine: mockUpdateMachineMutation,
  createMacro: mockCreateMacroMutation,
  updateMacro: mockUpdateMacroMutation,
  createUser: mockCreateUserMutation,
  updateUser: mockUpdateUserMutation,
};

const getLatestMutation = (mutationKey) => {
  const results = mutationMocksByKey[mutationKey].mock.results;
  return results[results.length - 1].value.mutate;
};

beforeEach(() => {
  mockNotifyToast.mockClear();
  mockUseToast.mockClear();
  mockReadQuery.mockClear();
  mutationMocks.forEach(mock => mock.mockClear());
  Object.keys(mockMutationOptions).forEach(key => {
    delete mockMutationOptions[key];
  });
});

test('Administration drawers route mutation failures to the global persistent toast', () => {
  drawerCases.forEach(([name, Drawer, mutationKey, isUpdate]) => {
    const view = renderAppUI(
      <Drawer
        id={isUpdate ? 'fixture-id' : undefined}
        onClose={jest.fn()}
      />
    );

    try {
      expect(mockMutationOptions[mutationKey]).toBeDefined();
      mockMutationOptions[mutationKey].onError(new Error(`${name} failed`));
    } finally {
      view.dispose();
    }
  });

  expect(mockUseToast).toHaveBeenCalledTimes(10);
  expect(mockNotifyToast).toHaveBeenCalledTimes(10);
  mockNotifyToast.mock.calls.forEach(([options]) => {
    expect(options.appearance).toBe('error');
    expect(options.duration).toBeUndefined();
    expect(options.content.props.children).toBe('An unexpected error has occurred.');
  });
});

test.each(drawerCases)(
  '%s links every required error and blocks invalid keyboard submission',
  async (name, Drawer, mutationKey, isUpdate, submitLabel, fieldLabels) => {
    const user = userEvent.setup();
    const view = renderAppUI(
      <Drawer
        id={isUpdate ? 'fixture-id' : undefined}
        onClose={jest.fn()}
      />
    );

    try {
      const fields = fieldLabels.map(label => screen.getByRole('textbox', {
        name: new RegExp(`^${label}`),
      }));
      await fields.reduce(
        (promise, field) => promise.then(() => user.clear(field)),
        Promise.resolve()
      );

      const submit = screen.getByRole('button', { name: submitLabel });
      submit.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => fields.forEach((field) => {
        const describedBy = field.getAttribute('aria-describedby');
        const associatedError = describedBy
          .split(/\s+/)
          .map(id => document.getElementById(id))
          .find(element => element && element.getAttribute('role') === 'alert');

        expect(associatedError).toHaveTextContent(/\S/);
      }));
      expect(getLatestMutation(mutationKey)).not.toHaveBeenCalled();
    } finally {
      view.dispose();
    }
  }
);

test.each(drawerCases)(
  '%s accepts keyboard-only field entry and primary-button submission',
  async (name, Drawer, mutationKey, isUpdate, submitLabel, fieldLabels) => {
    const user = userEvent.setup();
    const view = renderAppUI(
      <Drawer
        id={isUpdate ? 'fixture-id' : undefined}
        onClose={jest.fn()}
      />
    );

    try {
      const fields = fieldLabels.map(label => screen.getByRole('textbox', {
        name: new RegExp(`^${label}`),
      }));
      await fields.reduce(
        (promise, field, index) => promise
          .then(() => user.clear(field))
          .then(() => user.type(field, `value-${index + 1}`)),
        Promise.resolve()
      );

      const submit = screen.getByRole('button', { name: submitLabel });
      submit.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => expect(getLatestMutation(mutationKey)).toHaveBeenCalledTimes(1));
    } finally {
      view.dispose();
    }
  }
);
