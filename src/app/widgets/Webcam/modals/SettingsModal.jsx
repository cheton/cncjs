import {
  Box,
  Button,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  TextLabel,
} from '@tonic-ui/react';
import { ensureArray } from 'ensure-type';
import React, { useEffect, useState } from 'react';
import { Form, Field } from 'react-final-form';
import i18n from '@app/lib/i18n';
import log from '@app/lib/log';
import useWidgetConfig from '@app/widgets/shared/useWidgetConfig';
import {
  MEDIA_SOURCE_LOCAL,
  MEDIA_SOURCE_STREAM,
} from '../constants';

function useVideoDevices() {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    let active = true;
    const enumerateDevices = navigator.mediaDevices?.enumerateDevices;
    if (!enumerateDevices) {
      return undefined;
    }
    enumerateDevices.call(navigator.mediaDevices)
      .then(items => active && setDevices(ensureArray(items).filter(item => item.kind === 'videoinput')))
      .catch(error => log.error(`${error.name}: ${error.message}`));
    return () => {
      active = false;
    };
  }, []);

  return devices;
}

function SettingsModal({ onClose }) {
  const config = useWidgetConfig();
  const devices = useVideoDevices();
  const initialValues = {
    mediaSource: config.get('mediaSource', MEDIA_SOURCE_LOCAL),
    deviceId: config.get('deviceId', '__default__'),
    url: config.get('url', ''),
  };

  return (
    <Modal
      autoFocus closeOnEsc closeOnInteractOutside={false}
      ensureFocus isClosable isOpen
      size="sm" onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <Form
          initialValues={initialValues}
          onSubmit={({ mediaSource, deviceId, url }) => {
            config.set('mediaSource', mediaSource);
            config.set('deviceId', deviceId);
            config.set('url', url);
            onClose();
          }}
        >
          {({ form, values }) => (
            <>
              <ModalHeader>{i18n._('Webcam Settings')}</ModalHeader>
              <ModalBody>
                <FormControl mb="4x">
                  <TextLabel>{i18n._('Media Source')}</TextLabel>
                  <Field name="mediaSource" type="radio" value={MEDIA_SOURCE_LOCAL}>{({ input }) => <label><input {...input} /> {i18n._('Use a built-in camera or a connected webcam')}</label>}</Field>
                  <Box mt="2x" ml="5x">
                    <Field name="deviceId">{({ input }) => (
                      <select {...input} disabled={values.mediaSource !== MEDIA_SOURCE_LOCAL}>
                        <option value="__default__">{i18n._('Automatic detection')}</option>
                        {devices.map(device => <option key={device.deviceId} value={device.deviceId}>{device.label || device.deviceId}</option>)}
                      </select>
                    )}
                    </Field>
                  </Box>
                </FormControl>
                <FormControl>
                  <Field name="mediaSource" type="radio" value={MEDIA_SOURCE_STREAM}>{({ input }) => <label><input {...input} /> {i18n._('Connect to an IP camera')}</label>}</Field>
                  <Box mt="2x" ml="5x">
                    <Field name="url">{({ input }) => (
                      <Input
                        {...input} aria-label={i18n._('Stream URL')} disabled={values.mediaSource !== MEDIA_SOURCE_STREAM}
                        placeholder="http://0.0.0.0:8080/?action=stream" type="url"
                      />
                    )}
                    </Field>
                    <Text color="gray:60" fontSize="sm" mt="1x">{i18n._('The URL should point to a stream in one of the following formats: Motion JPEG (mjpeg), RTSP, or H264 (MP4).')}</Text>
                  </Box>
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button onClick={onClose}>{i18n._('Cancel')}</Button>
                <Button variant="primary" onClick={() => form.submit()}>{i18n._('Save Changes')}</Button>
              </ModalFooter>
            </>
          )}
        </Form>
      </ModalContent>
    </Modal>
  );
}

export default SettingsModal;
