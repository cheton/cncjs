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
import portal from '@app/lib/portal';
import {
  useDeleteMacroMutation,
  useUpdateMacroMutation,
} from '@app/queries/macros';
import { composeValidators, required } from '@app/widgets/shared/validations';
import variables from '../shared/variables';
import ConfirmDeleteMacro from './ConfirmDeleteMacro';

const mapMacroVariablesToMenuItems = (variables, onInsert) => ensureArray(variables).flatMap((x) => {
  if (x.role === 'group') {
    return [
      {
        value: x.title,
        type: 'custom',
        content: (
          <MenuGroup title={x.title} />
        ),
      },
      ...mapMacroVariablesToMenuItems(x.children, onInsert),
    ];
  }

  if (x.role === 'menuitem') {
    return [{ value: x.value, props: { px: '6x', onClick: () => onInsert(x.value) } }];
  }

  return [];
});

function EditMacro({
  onClose,
  id,
  name,
  content,
}) {
  const contentRef = useRef();
  const submitLockRef = useRef(false);
  const updateMacroMutation = useUpdateMacroMutation();
  const deleteMacroMutation = useDeleteMacroMutation();
  const initialValues = {
    name,
    content,
  };
  const handleClose = () => {
    if (
      submitLockRef.current ||
      updateMacroMutation.isLoading ||
      deleteMacroMutation.isLoading
    ) {
      return;
    }
    onClose();
  };

  const handleClickDelete = () => {
    if (
      submitLockRef.current ||
      updateMacroMutation.isLoading ||
      deleteMacroMutation.isLoading
    ) {
      return;
    }
    const closeEdit = onClose;
    const onConfirm = async (closeConfirm) => {
      await deleteMacroMutation.mutateAsync({ meta: { id } });
      closeConfirm();
      closeEdit();
    };

    portal(({ onClose: closeConfirm }) => (
      // TODO
      <ConfirmDeleteMacro
        onClose={closeConfirm}
        name={name}
        onConfirm={() => onConfirm(closeConfirm)}
      />
    ));
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
            await updateMacroMutation.mutateAsync({
              meta: { id },
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
                {i18n._('Edit Macro')}
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
                              items={mapMacroVariablesToMenuItems(variables, insertAtCaret)}
                              slotProps={{ content: { maxHeight: 180, overflowY: 'auto' } }}
                              renderItem={item => item?.content}
                            >
                              <DropdownButton variant="ghost">
                                <FontAwesomeIcon icon="plus" fixedWidth />
                                <Space width={8} />
                                {i18n._('Macro Variables')}
                              </DropdownButton>
                            </Dropdown>
                          </Box>
                        </Flex>
                        <FormTextarea
                          {...input}
                          ref={contentRef}
                          rows={8}
                        />
                        <FormErrorMessage errors={meta.error && meta.touched ? [meta.error] : []} />
                      </FormControl>
                    );
                  }}
                </Field>
              </ModalBody>
              <ModalFooter justify="space-between">
                <FormSpy subscription={{ submitError: true }}>
                  {({ submitError }) => submitError && (
                    <Text color="error.text" mr="auto">
                      {submitError}
                    </Text>
                  )}
                </FormSpy>
                <Box>
                  <Button
                    variant="emphasis"
                    minWidth="20x"
                    disabled={updateMacroMutation.isLoading || deleteMacroMutation.isLoading}
                    onClick={handleClickDelete}
                  >
                    {i18n._('Delete')}
                  </Button>
                </Box>
                <Box>
                  <Button
                    variant="default"
                    disabled={updateMacroMutation.isLoading || deleteMacroMutation.isLoading}
                    onClick={handleClose}
                    minWidth="20x"
                  >
                    {i18n._('Cancel')}
                  </Button>
                  <Button
                    variant="primary"
                    disabled={updateMacroMutation.isLoading}
                    onClick={() => form.submit()}
                    minWidth="20x"
                  >
                    {i18n._('Save Changes')}
                  </Button>
                </Box>
              </ModalFooter>
            </ModalContent>
          </>
        )}
      </Form>
    </Modal>
  );
}

export default EditMacro;
