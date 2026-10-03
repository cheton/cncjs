import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  FormControl,
  Switch,
  Text,
  TextLabel,
} from '@tonic-ui/react';
import {
  useConst,
} from '@tonic-ui/react-hooks';
import React, { useCallback } from 'react';
import { Field, Form } from 'react-final-form';
import useToast from '@app/hooks/useToast';
import i18n from '@app/lib/i18n';
import FieldInput from '@app/pages/Administration/components/FieldInput';
import FieldTextLabel from '@app/pages/Administration/components/FieldTextLabel';
import * as validations from '@app/pages/Administration/validations';
import {
  API_USERS_QUERY_KEY,
  useCreateUserMutation,
} from '../queries';

/** @param {{ onClose?: Function, id?: string }} props */
const CreateUserDrawer = ({
  onClose,
  ...rest
}) => {
  const notifyToast = useToast();
  const queryClient = useQueryClient();
  const createUserMutation = useCreateUserMutation({
    onSuccess: () => {
      if (typeof onClose === 'function') {
        onClose();
      }

      // Invalidate `useFetchUsersQuery`
      queryClient.invalidateQueries({ queryKey: API_USERS_QUERY_KEY });
    },
    onError: () => {
      notifyToast({
        appearance: 'error',
        content: (
          <Text>{i18n._('An unexpected error has occurred.')}</Text>
        ),
        duration: undefined,
      });
    },
  });
  const initialValues = useConst(() => ({
    enabled: true,
    name: '',
    password: '',
  }));
  const handleFormSubmit = useCallback((values) => {
    createUserMutation.mutate({
      data: values,
    });
  }, [createUserMutation]);
  const isFormDisabled = createUserMutation.isLoading;

  return (
    <Drawer
      backdrop
      closeOnEsc
      isClosable
      isOpen={true}
      onClose={onClose}
      size="md"
      {...rest}
    >
      <DrawerOverlay />
      <Form
        initialValues={initialValues}
        onSubmit={handleFormSubmit}
        validate={(values) => {
          const errors = {};
          errors.name = validations.required(values.name);
          errors.password = validations.required(values.password);
          return errors;
        }}
        render={({ form }) => (
          <DrawerContent>
            <DrawerHeader>
              <Text>
                {i18n._('New User')}
              </Text>
            </DrawerHeader>
            <DrawerBody>
              <FormControl mb="4x">
                <Flex
                  alignItems="center"
                  columnGap="3x"
                >
                  <FieldTextLabel>
                    {i18n._('Status:')}
                  </FieldTextLabel>
                  <Field name="enabled">
                    {({ input, meta }) => {
                      return (
                        <Flex
                          alignItems="center"
                          columnGap="2x"
                        >
                          <Switch
                            aria-label="Enable account"
                            {...input}
                            checked={input.value}
                          />
                          <TextLabel>
                            {input.value === true ? i18n._('ON') : i18n._('OFF')}
                          </TextLabel>
                        </Flex>
                      );
                    }}
                  </Field>
                </Flex>
              </FormControl>
              <FieldInput
                name="name"
                label={i18n._('User name:')}
                required
                autoComplete="username"
              />
              <FieldInput
                name="password"
                type="password"
                autoComplete="new-password"
                label={i18n._('Password:')}
                required
              />
            </DrawerBody>
            <DrawerFooter>
              <Flex
                alignItems="center"
                columnGap="2x"
              >
                <Button
                  onClick={onClose}
                  sx={{
                    minWidth: 80,
                  }}
                >
                  {i18n._('Cancel')}
                </Button>
                <Button
                  variant="primary"
                  disabled={isFormDisabled}
                  onClick={() => {
                    form.submit();
                  }}
                  sx={{
                    minWidth: 80,
                  }}
                >
                  {i18n._('Add')}
                </Button>
              </Flex>
            </DrawerFooter>
          </DrawerContent>
        )}
      />
    </Drawer>
  );
};

export default CreateUserDrawer;
