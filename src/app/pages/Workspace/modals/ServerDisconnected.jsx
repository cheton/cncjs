import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
} from '@tonic-ui/react';
import React from 'react';
import ModalTemplate from '@app/components/ModalTemplate';
import i18n from '@app/lib/i18n';

const reloadPage = (forcedReload = true) => {
  window.location.reload(forcedReload);
};

/**
 * @returns {JSX.Element}
 */
function ServerDisconnected() {
  return (
    <Modal
      autoFocus
      closeOnEsc={false}
      closeOnInteractOutside={false}
      ensureFocus
      isClosable={false}
      isOpen
      onClose={() => {}}
      size="xs"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <ModalTemplate type="error">
            {({ PrimaryMessage, DescriptiveMessage }) => (
              <>
                <PrimaryMessage>
                  {i18n._('Server has stopped working')}
                </PrimaryMessage>
                <DescriptiveMessage>
                  {i18n._('A problem caused the server to stop working correctly. Check out the server status and try again.')}
                </DescriptiveMessage>
              </>
            )}
          </ModalTemplate>
        </ModalBody>
        <ModalFooter>
          <Button onClick={reloadPage} variant="primary">
            {i18n._('Reload')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ServerDisconnected;
