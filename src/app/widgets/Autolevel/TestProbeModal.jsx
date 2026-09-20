import React, { PureComponent } from 'react';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@tonic-ui/react';
import { Checkbox } from '@app/components/Checkbox';
import { ToastNotification } from '@app/components/Notifications';
import { Button } from '@app/components/Buttons';
import i18n from '@app/lib/i18n';
import ZProbeDiagram from './ZProbeDiagram';

/** @extends {PureComponent<{state: object, actions: object}>} */
class TestProbeModal extends PureComponent {
  state = {
    safetyConfirmed: false,
  };

  handleCheckboxChange = () => {
    this.setState({ safetyConfirmed: !this.state.safetyConfirmed });
  };

  handleStartTestProbe = () => {
    this.props.actions.startTestProbe();
  };

  render() {
    const { state, actions } = this.props;
    const { clearanceZ, startZ, endZ, feedrate, units } = state;
    const { safetyConfirmed } = this.state;

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
          <ModalHeader>{i18n._('Test Probe')}</ModalHeader>
          <ModalBody>
            <div className="form-group">
              <ToastNotification
                type="warning"
                style={{ marginBottom: 16 }}
              >
                {i18n._('The Z-axis will descend until electrical contact is detected. If probe wires are not connected, the tool, workpiece, or machine may be damaged.')}
              </ToastNotification>
            </div>
            <div className="form-group">
              {i18n._('A single probe test will be performed at the current XY position.')}
            </div>
            <div className="form-group" style={{ width: 320 }}>
              <ZProbeDiagram
                clearanceZ={clearanceZ}
                startZ={startZ}
                endZ={endZ}
                feedrate={feedrate}
                units={units}
              />
            </div>
            <Checkbox
              checked={safetyConfirmed}
              onChange={this.handleCheckboxChange}
            >
              {i18n._('I confirm probe wires are correctly connected')}
            </Checkbox>
          </ModalBody>
          <ModalFooter>
            <Button
              btnStyle="default"
              onClick={actions.closeModal}
            >
              {i18n._('Cancel')}
            </Button>
            <Button
              btnStyle="primary"
              onClick={this.handleStartTestProbe}
              disabled={!safetyConfirmed}
            >
              {i18n._('Start Test Probe')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }
}

export default TestProbeModal;
