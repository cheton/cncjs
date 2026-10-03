import {
  Box,
  Button,
  ButtonGroup,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@tonic-ui/react';
import React, { useRef } from 'react';
import { Form, Field } from 'react-final-form';
import CodePreview from '@app/components/CodePreview';
import controller from '@app/lib/controller';
import i18n from '@app/lib/i18n';
import useWidgetConfig from '@app/widgets/shared/useWidgetConfig';
import {
  populateTLOProbeCommands,
  populateWCSProbeCommands,
} from './utils';

const PROBE_SETTER_TLO = 'tlo';
const PROBE_SETTER_WCS = 'wcs';

function ProbeModal({
  onClose,
  probeData,
}) {
  const config = useWidgetConfig();
  const contentRef = useRef();
  const {
    probeAxis,
    probeCommand,
    probeDepth,
    probeFeedrate,
    touchPlateHeight,
    retractionDistance,
    wcs,
  } = probeData;
  const initialValues = {
    probeSetter: !!config.get('useTLO') ? PROBE_SETTER_TLO : PROBE_SETTER_WCS,
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
      <ModalOverlay />
      <ModalContent>
        <Form
          initialValues={initialValues}
          onSubmit={(values) => {
            const content = contentRef.current;
            controller.command('gcode', content);
            onClose();
          }}
          subscription={{}}
        >
          {({ form }) => (
            <>
              <ModalHeader>{i18n._('Probe')}</ModalHeader>
              <ModalBody>
                <Field name="probeSetter">
                  {({ input }) => {
                    const handleClickTLO = (event) => {
                      input.onChange(PROBE_SETTER_TLO);

                      config.set('useTLO', true);
                    };
                    const handleClickWCS = (event) => {
                      input.onChange(PROBE_SETTER_WCS);

                      config.set('useTLO', false);
                    };
                    const probeSetter = input.value;

                    let probeCommands = [];
                    if (probeSetter === PROBE_SETTER_TLO) {
                      probeCommands = populateTLOProbeCommands({
                        probeAxis,
                        probeCommand,
                        probeDepth,
                        probeFeedrate,
                        touchPlateHeight,
                        retractionDistance,
                      });
                    } else if (probeSetter === PROBE_SETTER_WCS) {
                      probeCommands = populateWCSProbeCommands({
                        probeAxis,
                        probeCommand,
                        probeDepth,
                        probeFeedrate,
                        touchPlateHeight,
                        retractionDistance,
                        wcs,
                      });
                    }

                    const content = probeCommands.join('\n');
                    contentRef.current = content;

                    return (
                      <>
                        <Box mb="4x">
                          <ButtonGroup
                            size="sm"
                            sx={{ minWidth: '50%' }}
                          >
                            <Button
                              selected={probeSetter === PROBE_SETTER_TLO}
                              onClick={handleClickTLO}
                            >
                              {i18n._('Tool Length Offset')}
                            </Button>
                            <Button
                              selected={probeSetter === PROBE_SETTER_WCS}
                              onClick={handleClickWCS}
                            >
                              {i18n._('Work Coordinate System')}
                            </Button>
                          </ButtonGroup>
                        </Box>
                        <CodePreview
                          data={content}
                          language="gcode"
                        />
                      </>
                    );
                  }}
                </Field>
              </ModalBody>
              <ModalFooter>
                <Button
                  onClick={onClose}
                >
                  {i18n._('Cancel')}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => form.submit()}
                >
                  {i18n._('Run Probe')}
                </Button>
              </ModalFooter>
            </>
          )}
        </Form>
      </ModalContent>
    </Modal>
  );
}

export default ProbeModal;
