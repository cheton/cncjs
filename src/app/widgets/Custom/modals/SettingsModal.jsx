import {
  Box,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  TextLabel,
} from '@tonic-ui/react';
import React from 'react';
import { FORM_ERROR } from 'final-form';
import { Form, Field, FormSpy } from 'react-final-form';
import useWidgetConfig from '@app/widgets/shared/useWidgetConfig';
import i18n from '@app/lib/i18n';

function SettingsModal({
  onClose,
}) {
  const config = useWidgetConfig();
  const initialValues = {
    title: config.get('title'),
    url: config.get('url'),
  };

  return (
    <Modal
      autoFocus
      closeOnEsc
      closeOnInteractOutside={false}
      ensureFocus
      isClosable
      isOpen
      size="sm"
      onClose={onClose}
    >
      <ModalOverlay data-testid="settings-modal-overlay" />
      <ModalContent>
        <Form
          initialValues={initialValues}
          onSubmit={(values) => {
            try {
              const { title, url } = values;
              config.set('title', title);
              config.set('url', url);
              onClose();
            } catch (error) {
              return { [FORM_ERROR]: error.message };
            }
            return undefined;
          }}
          subscription={{}}
        >
          {({ form }) => {
            const handleSubmit = () => {
              form.submit();
            };

            return (
              <>
                <ModalHeader>{i18n._('Settings')}</ModalHeader>
                <ModalBody>
                  <Field name="title">
                    {({ input, meta }) => (
                      <Box mb="4x">
                        <TextLabel htmlFor="custom-settings-title" mb="2x">
                          {i18n._('Title')}
                        </TextLabel>
                        <Input
                          {...input}
                          id="custom-settings-title"
                          type="url"
                          maxLength={256}
                        />
                        {(meta.error && meta.touched) && (
                          <Text fontSize="sm" lineHeight="sm" color="red:50">
                            {meta.error}
                          </Text>
                        )}
                      </Box>
                    )}
                  </Field>
                  <Field name="url">
                    {({ input, meta }) => (
                      <Box mb="4x">
                        <TextLabel htmlFor="custom-settings-url" mb="2x">
                          {i18n._('URL')}
                        </TextLabel>
                        <Input
                          {...input}
                          id="custom-settings-url"
                          type="url"
                          placeholder="/widget/"
                        />
                        {(meta.error && meta.touched) && (
                          <Text fontSize="sm" lineHeight="sm" color="red:50">
                            {meta.error}
                          </Text>
                        )}
                      </Box>
                    )}
                  </Field>
                </ModalBody>
                <FormSpy subscription={{ invalid: true, submitError: true }}>
                  {({ invalid, submitError }) => (
                    <ModalFooter>
                      {submitError && (
                        <Text fontSize="sm" lineHeight="sm" color="red:50">
                          {submitError}
                        </Text>
                      )}
                      <Button onClick={onClose}>
                        {i18n._('Cancel')}
                      </Button>
                      <Button
                        variant="primary"
                        disabled={invalid}
                        onClick={handleSubmit}
                      >
                        {i18n._('Save Changes')}
                      </Button>
                    </ModalFooter>
                  )}
                </FormSpy>
              </>
            );
          }}
        </Form>
      </ModalContent>
    </Modal>
  );
}

export default SettingsModal;
