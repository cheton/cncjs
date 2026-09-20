import React, { PureComponent } from 'react';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@tonic-ui/react';
import ModalTemplate from '@app/components/ModalTemplate';
import { Button } from '@app/components/Buttons';
import i18n from '@app/lib/i18n';

/** @extends {PureComponent<{actions: object}>} */
class StopProbeModal extends PureComponent {
  render() {
    const { actions } = this.props;

    return (
      <Modal
        closeOnInteractOutside={false}
        isClosable
        isOpen
        onClose={actions.closeModal}
        size="sm"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{i18n._('Stop Probing')}</ModalHeader>
          <ModalBody>
            <ModalTemplate type="warning">
              <p>{i18n._('Are you sure you want to stop probing?')}</p>
              <p>{i18n._('This will reset the controller and cancel the probe cycle.')}</p>
            </ModalTemplate>
          </ModalBody>
          <ModalFooter>
            <Button
              btnStyle="flat"
              onClick={actions.closeModal}
            >
              {i18n._('Continue Probing')}
            </Button>
            <Button
              btnStyle="danger"
              onClick={actions.stopProbing}
            >
              <i className="fa fa-stop" /> {i18n._('Stop Probing')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }
}

export default StopProbeModal;
