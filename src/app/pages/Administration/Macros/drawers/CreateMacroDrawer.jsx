import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerOverlay,
  LinkButton,
  Menu,
  MenuToggle,
  MenuList,
  MenuGroup,
  MenuItem,
  Flex,
  Text,
} from '@tonic-ui/react';
import {
  useConst,
} from '@tonic-ui/react-hooks';
import React, { useCallback, useRef } from 'react';
import { Form } from 'react-final-form';
import useToast from '@app/hooks/useToast';
import i18n from '@app/lib/i18n';
import FieldInput from '@app/pages/Administration/components/FieldInput';
import FieldTextarea from '@app/pages/Administration/components/FieldTextarea';
import * as validations from '@app/pages/Administration/validations';
import {
  useCreateMacroMutation,
} from '@app/queries/macros';
import {
  MACRO_VARIABLE_EXAMPLES,
} from '../constants';
import {
  insertAtCaret,
} from '../utils';

const CreateMacroDrawer = ({
  onClose,
  ...rest
}) => {
  const gcodeInputRef = useRef();
  const notifyToast = useToast();
  const createMacroMutation = useCreateMacroMutation({
    onSuccess: () => {
      if (typeof onClose === 'function') {
        onClose();
      }
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
    name: '',
    action: '',
  }));
  const handleFormSubmit = useCallback((values) => {
    createMacroMutation.mutate({
      data: values,
    });
  }, [createMacroMutation]);
  const isFormDisabled = createMacroMutation.isLoading;

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
          errors.action = validations.required(values.action);
          return errors;
        }}
        render={({ form }) => (
          <DrawerContent>
            <DrawerHeader>
              <Text>
                {i18n._('New Macro')}
              </Text>
            </DrawerHeader>
            <DrawerBody>
              <FieldInput
                name="name"
                label={i18n._('Macro name:')}
                required
              />
              <FieldTextarea
                ref={gcodeInputRef}
                name="action"
                label={i18n._('G-code commands:')}
                required
                infoTipLabel={i18n._('Input the G-code commands to execute with this macro.')}
                rows="10"
                labelAction={(
                  <Menu placement="bottom-end">
                    <MenuToggle>
                      <LinkButton>
                        {i18n._('Select variables')}
                      </LinkButton>
                    </MenuToggle>
                    <MenuList
                      maxHeight="50vh"
                      overflow="auto"
                    >
                      {MACRO_VARIABLE_EXAMPLES.map(group => (
                        <MenuGroup
                          key={group.title}
                          title={group.title}
                        >
                          {group.data.map(item => (
                            <MenuItem
                              key={item}
                              value={item}
                              onClick={(event) => {
                                const el = gcodeInputRef.current;
                                const value = event.currentTarget.value;
                                const textareaValue = insertAtCaret(el, value);
                                form.change('action', textareaValue);
                              }}
                            >
                              {item}
                            </MenuItem>
                          ))}
                        </MenuGroup>
                      ))}
                    </MenuList>
                  </Menu>
                )}
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

export default CreateMacroDrawer;
