import {
  Box,
  Button,
  Checkbox,
  FormControl,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@tonic-ui/react';
import React, { useRef, useState } from 'react';
import { Field, Form } from 'react-final-form';
import i18n from '@app/lib/i18n';
import ProbeAreaDiagram from './ProbeAreaDiagram';
import ZProbeDiagram from './ZProbeDiagram';

/**
 * @param {{canConfirm?: boolean, onCancel?: Function, onConfirm?: Function, value?: object}} props
 */
function StartProbeModal({
  canConfirm = false,
  onCancel = () => {},
  onConfirm = () => {},
  value = {},
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLock = useRef(false);
  const {
    startX, startY, endX, endY, stepX, stepY,
    clearanceZ, startZ, endZ, feedrate, units,
  } = value;
  const numPointsX = Math.floor((endX - startX) / stepX) + 1;
  const numPointsY = Math.floor((endY - startY) / stepY) + 1;
  const totalPoints = numPointsX * numPointsY;

  const submit = () => {
    if (submitLock.current) {
      return;
    }
    submitLock.current = true;
    setIsSubmitting(true);
    onConfirm();
  };

  return (
    <Modal
      closeOnInteractOutside={false} isClosable isOpen
      onClose={onCancel} size="md"
    >
      <ModalOverlay />
      <ModalContent>
        <Form initialValues={{ safetyConfirmed: false }} onSubmit={() => {}} subscription={{ values: true }}>
          {({ values }) => (
            <>
              <ModalHeader>{i18n._('Start Probing')}</ModalHeader>
              <ModalBody>
                <Box mb="4x">
                  <Text color="red:60">
                    {i18n._('The Z-axis will descend until electrical contact is detected. If probe wires are not connected, the tool, workpiece, or machine may be damaged.')}
                  </Text>
                </Box>
                <Text mb="4x">{i18n._('You are about to probe your workpiece surface.')}</Text>
                <Box display="flex" gap="4x" mb="4x">
                  <Box flex="1">
                    <ZProbeDiagram
                      clearanceZ={clearanceZ} endZ={endZ} feedrate={feedrate}
                      startZ={startZ} units={units}
                    />
                  </Box>
                  <Box flex="1">
                    <Text color="gray:60" mb="1x" textAlign="center">
                      {i18n._('{{count}} points', { count: totalPoints })}
                    </Text>
                    <ProbeAreaDiagram
                      endX={endX} endY={endY} startX={startX}
                      startY={startY} stepX={stepX} stepY={stepY}
                      units={units}
                    />
                  </Box>
                </Box>
                <Field name="safetyConfirmed" type="checkbox">
                  {({ input }) => (
                    <FormControl>
                      <Checkbox {...input} checked={input.checked}>
                        {i18n._('I confirm probe wires are correctly connected')}
                      </Checkbox>
                    </FormControl>
                  )}
                </Field>
              </ModalBody>
              <ModalFooter>
                <Button onClick={onCancel} variant="secondary">{i18n._('Cancel')}</Button>
                <Button disabled={!canConfirm || !values.safetyConfirmed || isSubmitting} onClick={submit} variant="primary">
                  {i18n._('Start Probing')}
                </Button>
              </ModalFooter>
            </>
          )}
        </Form>
      </ModalContent>
    </Modal>
  );
}

export default StartProbeModal;
