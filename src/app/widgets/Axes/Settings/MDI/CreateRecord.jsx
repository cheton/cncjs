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
  Space,
  Text,
  Textarea,
  TextLabel,
} from '@tonic-ui/react';
import Slider from 'rc-slider';
import React, { useState } from 'react';
import i18n from '@app/lib/i18n';

/**
 * @param {{ onSave: (record: object) => void, onCancel: () => void }} props
 * @returns {JSX.Element}
 */
function CreateRecord({ onSave, onCancel }) {
  const [name, setName] = useState('');
  const [command, setCommand] = useState('');
  const [grid, setGrid] = useState(6);
  const [error, setError] = useState(false);
  const submit = () => {
    if (!name.trim() || !command.trim()) {
      setError(true);
      return;
    }

    onSave({ name, command, grid: { xs: grid } });
  };

  return (
    <Modal
      closeOnInteractOutside={false}
      isClosable
      isOpen
      onClose={onCancel}
      size="sm"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {i18n._('Custom Commands')}
          <Space width="2x" />
          &rsaquo;
          <Space width="2x" />
          {i18n._('New')}
        </ModalHeader>
        <ModalBody>
          {error && <Text color="danger">{i18n._('This field is required.')}</Text>}
          <Box>
            <Box mb="3x">
              <TextLabel mb="2x">{i18n._('Name')}</TextLabel>
              <Input
                aria-label={i18n._('Name')}
                value={name}
                onChange={event => setName(event.target.value)}
              />
            </Box>
            <Box mb="3x">
              <TextLabel mb="2x">{i18n._('Command')}</TextLabel>
              <Textarea
                aria-label={i18n._('Command')}
                value={command}
                rows={5}
                onChange={event => setCommand(event.target.value)}
              />
            </Box>
            <Box>
              <TextLabel mb="2x">{i18n._('Button Width')}</TextLabel>
              <Slider
                ariaLabelForHandle={i18n._('Button width')}
                value={grid}
                min={1}
                max={12}
                step={1}
                dots
                included={false}
                onChange={setGrid}
              />
            </Box>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onCancel}>{i18n._('Cancel')}</Button>
          <Button variant="primary" onClick={submit}>{i18n._('OK')}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CreateRecord;
