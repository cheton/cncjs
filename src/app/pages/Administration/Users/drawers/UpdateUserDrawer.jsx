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
  Spinner,
  Switch,
  Text,
  TextLabel,
} from '@tonic-ui/react';
import memoize from 'micro-memoize';
import React, { useCallback } from 'react';
import { Field, Form } from 'react-final-form';
import useToast from '@app/hooks/useToast';
import i18n from '@app/lib/i18n';
import FieldInput from '@app/pages/Administration/components/FieldInput';
import FieldTextarea from '@app/pages/Administration/components/FieldTextarea';
import FieldTextLabel from '@app/pages/Administration/components/FieldTextLabel';
import * as validations from '@app/pages/Administration/validations';
import {
  API_USERS_QUERY_KEY,
  useReadUserQuery,
  useUpdateUserMutation,
} from '../queries';

const getMemoizedState = memoize(state => ({ ...state }));

const UpdateUserDrawer = ({
  id,
  onClose,
  ...rest
}) => {
  const notifyToast = useToast();
  const queryClient = useQueryClient();
  const readUserQuery = useReadUserQuery({
    meta: {
      id,
    },
  });
  const updateUserMutation = useUpdateUserMutation({
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
  const initialValues = getMemoizedState({
    enabled: readUserQuery.data?.enabled,
    title: readUserQuery.data?.title,
    commands: readUserQuery.data?.commands,
  });
  const handleFormSubmit = useCallback((values) => {
    updateUserMutation.mutate({
      meta: {
        id,
      },
      data: values,
    });
  }, [updateUserMutation, id]);
  const isFormDisabled = (readUserQuery.isError || readUserQuery.isFetching || updateUserMutation.isLoading);

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
          errors.data = validations.required(values.data);
          return errors;
        }}
        render={({ form }) => (
          <DrawerContent>
            <DrawerHeader>
              <Text>
                {i18n._('User Details')}
              </Text>
            </DrawerHeader>
            <DrawerBody>
              {readUserQuery.isFetching && (
                <Spinner />
              )}
              {!(readUserQuery.isFetching) && (
                <>
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
                    name="title"
                    label={i18n._('User name:')}
                    required
                    placeholder={i18n._('e.g., Activate Air Purifier')}
                  />
                  <FieldTextarea
                    name="commands"
                    label={i18n._('Shell commands:')}
                    required
                    infoTipLabel={i18n._('Enter the shell commands to be executed when this command runs. Each line will be executed sequentially.')}
                    rows="10"
                    placeholder="/home/cncjs/bin/activate-air-purifier"
                  />
                </>
              )}
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
                  {i18n._('Save')}
                </Button>
              </Flex>
            </DrawerFooter>
          </DrawerContent>
        )}
      />
    </Drawer>
  );
};

export default UpdateUserDrawer;
