import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text,
} from '@tonic-ui/react';
import React from 'react';
import ModalTemplate from '@app/components/ModalTemplate';
import controller from '@app/lib/controller';
import i18n from '@app/lib/i18n';

/**
 * @param {{ message?: string, onClose?: () => void, title?: string }} props
 * @returns {JSX.Element}
 */
function FeederWait({ title = '', message = '', onClose = () => {} }) {
  const stop = () => {
    controller.command('feeder_stop');
    onClose();
  };

  return (
    <Modal
      autoFocus
      closeOnEsc={false}
      closeOnInteractOutside={false}
      ensureFocus
      isClosable={false}
      isOpen
      onClose={onClose}
      size="xs"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <ModalTemplate type="warning">
            {({ PrimaryMessage, DescriptiveMessage }) => (
              <>
                <PrimaryMessage>
                  <Text as="h5">{title}</Text>
                  {message && <Text as="p">{message}</Text>}
                </PrimaryMessage>
                <DescriptiveMessage>
                  {i18n._('Waiting for the planner to empty...')}
                </DescriptiveMessage>
              </>
            )}
          </ModalTemplate>
        </ModalBody>
        <ModalFooter>
          <Button onClick={stop} variant="danger">
            {i18n._('Stop')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default FeederWait;
