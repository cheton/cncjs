import _get from 'lodash/get';
import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@tonic-ui/react';
import React from 'react';
import { connect } from 'react-redux';
import controller from '@app/lib/controller';
import i18n from '@app/lib/i18n';
import PreviewCode from './PreviewCode';

/**
 * @param {{
 *   onClose?: () => void,
 *   stringifiedControllerState?: string,
 *   stringifiedControllerSettings?: string,
 * }} props
 */
function ControllerModal({
  onClose,
  stringifiedControllerState,
  stringifiedControllerSettings,
}) {
  return (
    <Modal
      autoFocus closeOnEsc closeOnInteractOutside={false}
      ensureFocus isClosable isOpen
      size="lg" onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Grbl</ModalHeader>
        <ModalBody>
          <Tabs>
            <TabList aria-label={i18n._('Grbl controller data')} mb="2x">
              <Tab>{i18n._('Controller State')}</Tab>
              <Tab>{i18n._('Controller Settings')}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Box sx={previewSx}>
                  <PreviewCode>{stringifiedControllerState}</PreviewCode>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box sx={previewSx}>
                  <Box sx={{ position: 'absolute', right: 10, top: 10 }}>
                    <Button
                      size="xs"
                      onClick={() => {
                        controller.writeln('$#'); // Parameters
                        controller.writeln('$$'); // Settings
                      }}
                    >
                      <i className="fa fa-refresh" />
                      {i18n._('Refresh')}
                    </Button>
                  </Box>
                  <PreviewCode>{stringifiedControllerSettings}</PreviewCode>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>{i18n._('Close')}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

const previewSx = {
  background: '#000',
  border: '1px solid #ddd',
  color: '#fff',
  height: 'max(50vh, 200px)',
  overflowY: 'auto',
  position: 'relative',
};

export default connect(store => {
  const controllerState = _get(store, 'controller.state');
  const controllerSettings = _get(store, 'controller.settings');

  return {
    stringifiedControllerState: JSON.stringify(controllerState, null, 2),
    stringifiedControllerSettings: JSON.stringify(controllerSettings, null, 2),
  };
})(ControllerModal);
