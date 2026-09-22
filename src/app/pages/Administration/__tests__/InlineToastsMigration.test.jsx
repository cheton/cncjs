import React from 'react';
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
  ['CreateCommandDrawer', require('../Commands/drawers/CreateCommandDrawer').default, 'createCommand', false],
  ['UpdateCommandDrawer', require('../Commands/drawers/UpdateCommandDrawer').default, 'updateCommand', true],
  ['CreateEventDrawer', require('../Events/drawers/CreateEventDrawer').default, 'createEvent', false],
  ['UpdateEventDrawer', require('../Events/drawers/UpdateEventDrawer').default, 'updateEvent', true],
  ['CreateMachineDrawer', require('../Machines/drawers/CreateMachineDrawer').default, 'createMachine', false],
  ['UpdateMachineDrawer', require('../Machines/drawers/UpdateMachineDrawer').default, 'updateMachine', true],
  ['CreateMacroDrawer', require('../Macros/drawers/CreateMacroDrawer').default, 'createMacro', false],
  ['UpdateMacroDrawer', require('../Macros/drawers/UpdateMacroDrawer').default, 'updateMacro', true],
  ['CreateUserDrawer', require('../Users/drawers/CreateUserDrawer').default, 'createUser', false],
  ['UpdateUserDrawer', require('../Users/drawers/UpdateUserDrawer').default, 'updateUser', true],
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
