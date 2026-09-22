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
import controller from '@app/lib/controller';
import i18n from '@app/lib/i18n';

/**
 * @param {{
 *   controllerSettings?: object,
 *   controllerState?: object,
 *   onClose: () => void,
 * }} props
 */
function Controller({ controllerSettings = {}, controllerState = {}, onClose }) {
  return (
    <Modal
      autoFocus
      closeOnEsc
      closeOnInteractOutside={false}
      ensureFocus
      isClosable
      isOpen
      size="lg"
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Smoothie</ModalHeader>
        <ModalBody>
          <Tabs>
            <TabList aria-label={i18n._('Smoothie controller data')} mb="2x">
              <Tab>{i18n._('Controller State')}</Tab>
              <Tab>{i18n._('Controller Settings')}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <PreviewCode>{JSON.stringify(controllerState, null, 2)}</PreviewCode>
              </TabPanel>
              <TabPanel>
                <Box sx={previewSx}>
                  <Box sx={{ position: 'absolute', right: 10, top: 10 }}>
                    <Button size="xs" onClick={() => controller.writeln('$#')}>
                      <i aria-hidden="true" className="fa fa-refresh" />
                      {i18n._('Refresh')}
                    </Button>
                  </Box>
                  <Box
                    as="pre" m={0} p="3x"
                    whiteSpace="pre-wrap"
                  >
                    <code>{JSON.stringify(controllerSettings, null, 2)}</code>
                  </Box>
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

/**
 * @param {{ children: React.ReactNode }} props
 */
function PreviewCode({ children }) {
  return (
    <Box sx={previewSx}>
      <Box
        as="pre" m={0} p="3x"
        whiteSpace="pre-wrap"
      ><code>{children}</code>
      </Box>
    </Box>
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

export default Controller;
