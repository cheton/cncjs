import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormInput,
  FormLabel,
  FormTextarea,
  Dropdown,
  DropdownButton,
  MenuGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Space,
  Text,
} from '@tonic-ui/react';
import { ensureArray } from 'ensure-type';
import React, { useRef } from 'react';
import { FORM_ERROR } from 'final-form';
import { Form, Field, FormSpy } from 'react-final-form';
import i18n from '@app/lib/i18n';
import { useCreateMacroMutation } from '@app/queries/macros';
import { composeValidators, required } from '@app/widgets/shared/validations';
import variables from '../shared/variables';

const mapMacroVariablesToMenuItems = variables => ensureArray(variables).flatMap((x) => {
  if (x.role === 'group') {
    return [
      {
        value: x.title,
        type: 'custom',
        content: (
          <MenuGroup title={x.title} />
        ),
      },
      ...mapMacroVariablesToMenuItems(x.children),
    ];
  }

  if (x.role === 'menuitem') {
    return [{ value: x.value, content: x.value, props: { px: '6x' } }];
  }

  return [];
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
                      <FormControl error={Boolean(meta.error && meta.touched)} mb="4x">
                        <FormLabel required>
                          {i18n._('Macro Name')}
                        </FormLabel>
                        <FormInput {...input} />
                        <FormErrorMessage errors={meta.error && meta.touched ? [meta.error] : []} />
                      </FormControl>
                    );
                  }}
                </Field>
                <Field
                  name="content"
                  validate={composeValidators(required)}
                >
                  {({ input, meta }) => {
                    const insertAtCaret = (text) => {
                      const textarea = contentRef.current;
                      if (!textarea) {
                        return;
                      }

                      const caretPos = textarea.selectionStart;
                      const front = (textarea.value).substring(0, caretPos);
                      const back = (textarea.value).substring(textarea.selectionEnd, textarea.value.length);
                      const value = front + text + back;
                      input.onChange(value);
                    };

                    return (
                      <FormControl error={Boolean(meta.error && meta.touched)} mb="4x">
                        <Flex align="center" justify="space-between">
                          <Box>
                            <FormLabel required>
                              {i18n._('Macro Commands')}
                            </FormLabel>
                          </Box>
                          <Box>
                            <Dropdown
                              portalled
                              items={mapMacroVariablesToMenuItems(variables)}
                              onChange={item => insertAtCaret(item.value)}
                              renderItem={item => item?.content}
                              renderToggle={() => (
                                <DropdownButton variant="ghost">
                                  <FontAwesomeIcon icon="plus" fixedWidth />
                                  <Space width={8} />
                                  {i18n._('Macro Variables')}
                                </DropdownButton>
                              )}
                            />
                          </Box>
                        </Flex>
                        <FormTextarea
                          {...input}
                          ref={contentRef}
                          rows={10}
                        />
                        <FormErrorMessage errors={meta.error && meta.touched ? [meta.error] : []} />
                      </FormControl>
                    );
                  }}
                </Field>
              </ModalBody>
              <ModalFooter>
                <FormSpy subscription={{ submitError: true }}>
                  {({ submitError }) => submitError && (
                    <Text color="error.text" mr="auto">
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
