import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Box,
  Button,
  Flex,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuGroup,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Space,
  Text,
  Textarea,
  TextLabel,
} from '@tonic-ui/react';
import { ensureArray } from 'ensure-type';
import _uniqueId from 'lodash/uniqueId';
import React, { useRef } from 'react';
import { FORM_ERROR } from 'final-form';
import { Form, Field, FormSpy } from 'react-final-form';
import FormGroup from '@app/components/FormGroup';
import InlineError from '@app/components/InlineError';
import i18n from '@app/lib/i18n';
import { useCreateMacroMutation } from '@app/queries/macros';
import { composeValidators, required } from '@app/widgets/shared/validations';
import variables from '../shared/variables';

const mapMacroVariablesToMenuGroupItems = (variables) => ensureArray(variables).map(x => {
  if (x.role === 'group') {
    return (
      <MenuGroup key={_uniqueId()} role="group" title={x.title}>
        {mapMacroVariablesToMenuGroupItems(x.children)}
      </MenuGroup>
    );
  }

  if (x.role === 'menuitem') {
    return (
      <MenuItem key={_uniqueId()} role="menuitem" px="6x">
        {x.value}
      </MenuItem>
    );
  }

  return null;
});

function NewMacro({
  onClose,
}) {
  const contentRef = useRef();
  const submitLockRef = useRef(false);
  const createMacroMutation = useCreateMacroMutation();
  const initialValues = {
    name: '',
    content: '',
  };
  const handleClose = () => {
    if (submitLockRef.current || createMacroMutation.isLoading) {
      return;
    }
    onClose();
  };

  return (
    <Modal
      isClosable
      isOpen
      onClose={handleClose}
      size="md"
    >
      <Form
        initialValues={initialValues}
        onSubmit={async (values) => {
          if (submitLockRef.current) {
            return undefined;
          }
          submitLockRef.current = true;
          const { name, content } = values;
          try {
            await createMacroMutation.mutateAsync({
              data: { name, content },
            });
            onClose();
          } catch (error) {
            submitLockRef.current = false;
            return {
              [FORM_ERROR]: error.message || i18n._('An unexpected error has occurred.'),
            };
          }
          return undefined;
        }}
        subscription={{}}
      >
        {({ form }) => (
          <>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                {i18n._('New Macro')}
              </ModalHeader>
              <ModalBody>
                <Field
                  name="name"
                  validate={composeValidators(required)}
                >
                  {({ input, meta }) => {
                    return (
                      <FormGroup>
                        <TextLabel mb="2x">
                          {i18n._('Macro Name')}
                        </TextLabel>
                        <Box>
                          <Input {...input} />
                        </Box>
                        {(meta.error && meta.touched) && (
                          <InlineError>{meta.error}</InlineError>
                        )}
                      </FormGroup>
                    );
                  }}
                </Field>
                <Field
                  name="content"
                  validate={composeValidators(required)}
                >
                  {({ input, meta }) => {
                    return (
                      <FormGroup>
                        <Flex align="center" justify="space-between">
                          <Box>
                            <TextLabel mb="2x">
                              {i18n._('Macro Commands')}
                            </TextLabel>
                          </Box>
                          <Box>
                            <Menu>
                              <MenuButton variant="ghost">
                                <FontAwesomeIcon icon="plus" fixedWidth />
                                <Space width={8} />
                                {i18n._('Macro Variables')}
                              </MenuButton>
                              <MenuList
                                onClick={(event) => {
                                  if (event.target.getAttribute('role') !== 'menuitem') {
                                    return;
                                  }

                                  const textarea = contentRef.current;
                                  if (!textarea) {
                                    return;
                                  }

                                  const textToInsert = event.target.innerHTML;
                                  const caretPos = textarea.selectionStart;
                                  const front = (textarea.value).substring(0, caretPos);
                                  const back = (textarea.value).substring(textarea.selectionEnd, textarea.value.length);
                                  const value = front + textToInsert + back;
                                  input.onChange(value);
                                }}
                                maxHeight={180}
                                overflowY="auto"
                              >
                                {mapMacroVariablesToMenuGroupItems(variables)}
                              </MenuList>
                            </Menu>
                          </Box>
                        </Flex>
                        <Textarea
                          {...input}
                          ref={contentRef}
                          rows={10}
                        />
                        {(meta.error && meta.touched) && (
                          <InlineError>{meta.error}</InlineError>
                        )}
                      </FormGroup>
                    );
                  }}
                </Field>
              </ModalBody>
              <ModalFooter>
                <FormSpy subscription={{ submitError: true }}>
                  {({ submitError }) => submitError && (
                    <Text color="red:50" mr="auto">
                      {submitError}
                    </Text>
                  )}
                </FormSpy>
                <Button
                  variant="default"
                  disabled={createMacroMutation.isLoading}
                  onClick={handleClose}
                  minWidth="20x"
                >
                  {i18n._('Cancel')}
                </Button>
                <Button
                  variant="primary"
                  disabled={createMacroMutation.isLoading}
                  onClick={() => form.submit()}
                  minWidth="20x"
                >
                  {i18n._('OK')}
                </Button>
              </ModalFooter>
            </ModalContent>
          </>
        )}
      </Form>
    </Modal>
  );
}

export default NewMacro;
