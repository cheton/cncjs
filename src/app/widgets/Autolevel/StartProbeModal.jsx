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
import ProbeAreaDiagram from './ProbeAreaDiagram';
import ZProbeDiagram from './ZProbeDiagram';

/** @extends {PureComponent<{state: object, actions: object}>} */
class StartProbeModal extends PureComponent {
  state = {
    safetyConfirmed: false,
  };

  handleCheckboxChange = () => {
    this.setState({ safetyConfirmed: !this.state.safetyConfirmed });
  };

  handleStartProbing = () => {
    this.props.actions.startProbing();
  };

  render() {
    const { state, actions } = this.props;
    const {
      startX, startY, endX, endY, stepX, stepY,
      clearanceZ, startZ, endZ, feedrate,
      units,
    } = state;
    const numPointsX = Math.floor((endX - startX) / stepX) + 1;
    const numPointsY = Math.floor((endY - startY) / stepY) + 1;
    const totalPoints = numPointsX * numPointsY;
    const { safetyConfirmed } = this.state;

    return (
      <Modal
        closeOnInteractOutside={false}
        isClosable
        isOpen
        onClose={actions.closeModal}
        size="md"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{i18n._('Start Probing')}</ModalHeader>
          <ModalBody>
            <ToastNotification
              type="warning"
              style={{ marginBottom: 16 }}
            >
              {i18n._('The Z-axis will descend until electrical contact is detected. If probe wires are not connected, the tool, workpiece, or machine may be damaged.')}
            </ToastNotification>
            <div className="form-group">
              {i18n._('You are about to probe your workpiece surface.')}
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <ZProbeDiagram
                    clearanceZ={clearanceZ}
                    startZ={startZ}
                    endZ={endZ}
                    feedrate={feedrate}
                    units={units}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ textAlign: 'center', color: '#666', marginBottom: 4 }}>
                    {i18n._('{{count}} points', { count: totalPoints })}
                  </div>
                  <ProbeAreaDiagram
                    startX={startX}
                    startY={startY}
                    endX={endX}
                    endY={endY}
                    stepX={stepX}
                    stepY={stepY}
                    units={units}
                  />
                </div>
              </div>
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
              onClick={this.handleStartProbing}
              disabled={!safetyConfirmed}
            >
              {i18n._('Start Probing')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }
}

export default StartProbeModal;
