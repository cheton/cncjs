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
  Spinner,
  Text,
} from '@tonic-ui/react';
import memoize from 'micro-memoize';
import React, { useCallback } from 'react';
import { Form } from 'react-final-form';
import useToast from '@app/hooks/useToast';
import i18n from '@app/lib/i18n';
import FieldInput from '@app/pages/Administration/components/FieldInput';
import * as validations from '@app/pages/Administration/validations';
import {
  DEFAULT_MACHINE_PROFILE_LIMITS,
  MACHINE_PROFILE_LIMIT_FIELDS,
  getMachineProfileLimitLabel,
  normalizeMachineProfileLimits,
  validateMachineProfileLimits,
} from '../limits';
import {
  API_MACHINES_QUERY_KEY,
  useReadMachineQuery,
  useUpdateMachineMutation,
} from '../queries';

const getMemoizedState = memoize(state => ({ ...state }));

/** @param {{ id: string, onClose?: Function }} props */
const UpdateMachineDrawer = ({
  id,
  onClose,
  ...rest
}) => {
  const notifyToast = useToast();
  const queryClient = useQueryClient();
  const readMachineQuery = useReadMachineQuery({
    meta: {
      id,
    },
  });
  const updateMachineMutation = useUpdateMachineMutation({
    onSuccess: () => {
      if (typeof onClose === 'function') {
        onClose();
      }

      // Invalidate `useFetchMachinesQuery`
      queryClient.invalidateQueries({ queryKey: API_MACHINES_QUERY_KEY });
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
    name: readMachineQuery.data?.name,
    limits: {
      ...DEFAULT_MACHINE_PROFILE_LIMITS,
      ...readMachineQuery.data?.limits,
    },
  });

  const handleFormSubmit = useCallback((values) => {
    updateMachineMutation.mutate({
      meta: {
        id,
      },
      data: {
        name: values.name,
        limits: normalizeMachineProfileLimits(values.limits),
      },
    });
  }, [updateMachineMutation, id]);
  const isFormDisabled = (readMachineQuery.isError || readMachineQuery.isFetching || updateMachineMutation.isLoading);

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
          return {
            name: validations.required(values.name),
            ...validateMachineProfileLimits(values),
          };
        }}
        render={({ form }) => (
          <DrawerContent>
            <DrawerHeader>
              <Text>
                {i18n._('Machine Details')}
              </Text>
            </DrawerHeader>
            <DrawerBody>
              {readMachineQuery.isFetching && (
                <Spinner />
              )}
              {!(readMachineQuery.isFetching) && (
                <>
                  <FieldInput
                    name="name"
                    label={i18n._('Machine name:')}
                    required
                    placeholder={i18n._('e.g., CNC Router')}
                  />
                  <Text fontWeight="bold" mb="2x">{i18n._('Limits')}</Text>
                  {MACHINE_PROFILE_LIMIT_FIELDS.map(({ key, axis, bound }) => (
                    <FieldInput
                      key={key}
                      name={`limits.${key}`}
                      label={getMachineProfileLimitLabel(axis, bound)}
                      required
                      type="number"
                      step="any"
                    />
                  ))}
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

export default UpdateMachineDrawer;
