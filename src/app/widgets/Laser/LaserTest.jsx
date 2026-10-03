import {
  Box,
  Button,
  Collapse,
  Flex,
  Input,
  InputGroup,
  InputGroupAddon,
  Text,
  TextLabel,
} from '@tonic-ui/react';
import { ensurePositiveNumber } from 'ensure-type';
import _get from 'lodash/get';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import Slider from 'rc-slider';
import {
  CONNECTION_STATE_CONNECTED,
} from '@app/constants/connection';
import controller from '@app/lib/controller';
import i18n from '@app/lib/i18n';
import useWidgetConfig from '@app/widgets/shared/useWidgetConfig';

function LaserTest({
  isConnected,
}) {
  const config = useWidgetConfig();
  const [powerDraft, setPowerDraft] = useState(() => (
    String(ensurePositiveNumber(config.get('test.power', 0)))
  ));
  const [durationDraft, setDurationDraft] = useState(() => (
    String(ensurePositiveNumber(config.get('test.duration', 0)))
  ));
  const [maxSDraft, setMaxSDraft] = useState(() => (
    String(ensurePositiveNumber(config.get('test.maxS', 1000)))
  ));
  const [expanded, setExpanded] = useState(() => Boolean(
    config.get('panel.laserTest.expanded')
  ));

  const numericPower = powerDraft === '' ? null : Number(powerDraft);
  const numericDuration = durationDraft === '' ? null : Number(durationDraft);
  const numericMaxS = maxSDraft === '' ? null : Number(maxSDraft);
  const isLaserTestReady = (
    isConnected &&
    [numericPower, numericDuration, numericMaxS].every(value => (
      value !== null && Number.isFinite(value) && value >= 0
    ))
  );

  const updateDraft = (path, setDraft, value) => {
    const draft = String(value);
    setDraft(draft);
    config.set(path, ensurePositiveNumber(value));
  };

  const toggleExpanded = () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    config.set('panel.laserTest.expanded', nextExpanded);
  };

  return (
    <Box
      width="100%"
      border={1}
      borderColor="gray.200"
    >
      <Flex
        alignItems="center"
        justifyContent="space-between"
        padding="2x"
      >
        <TextLabel>{i18n._('Laser Test')}</TextLabel>
        <Button
          type="button"
          variant="ghost"
          aria-label={i18n._(expanded ? 'Collapse' : 'Expand')}
          aria-expanded={expanded}
          onClick={toggleExpanded}
        >
          {expanded ? '−' : '+'}
        </Button>
      </Flex>
      <Collapse in={expanded}>
        <Box padding="2x">
          <Flex alignItems="center" mb="2x">
            <Box width="35%">
              <TextLabel>{i18n._('Power (%)')}</TextLabel>
            </Box>
            <Box width="65%" textAlign="center">
              <Text>{powerDraft}%</Text>
              <Box sx={{ '& .rc-slider': { padding: 0 } }}>
                <Slider
                  ariaLabelForHandle="Laser power"
                  value={numericPower === null ? 0 : numericPower}
                  min={0}
                  max={100}
                  step={1}
                  onChange={value => updateDraft('test.power', setPowerDraft, value)}
                />
              </Box>
            </Box>
          </Flex>
          <Flex alignItems="center" mb="2x">
            <Box width="35%">
              <TextLabel>{i18n._('Test duration')}</TextLabel>
            </Box>
            <Box width="65%">
              <InputGroup size="sm">
                <Input
                  aria-label="Test duration in milliseconds"
                  type="number"
                  value={durationDraft}
                  min={0}
                  step={1}
                  onChange={event => updateDraft(
                    'test.duration',
                    setDurationDraft,
                    event.target.value
                  )}
                />
                <InputGroupAddon>{i18n._('ms')}</InputGroupAddon>
              </InputGroup>
            </Box>
          </Flex>
          <Flex alignItems="center" mb="2x">
            <Box width="35%">
              <TextLabel>{i18n._('Maximum value')}</TextLabel>
            </Box>
            <Box width="65%">
              <InputGroup size="sm">
                <InputGroupAddon>S</InputGroupAddon>
                <Input
                  aria-label="Maximum S value"
                  type="number"
                  value={maxSDraft}
                  min={0}
                  step={1}
                  onChange={event => updateDraft(
                    'test.maxS',
                    setMaxSDraft,
                    event.target.value
                  )}
                />
              </InputGroup>
            </Box>
          </Flex>
          <Flex>
            <Button
              type="button"
              disabled={!isLaserTestReady}
              onClick={() => controller.command(
                'laser_test',
                numericPower,
                numericDuration,
                numericMaxS
              )}
            >
              {i18n._('Laser Test')}
            </Button>
            <Button
              type="button"
              ml="2x"
              disabled={!isConnected}
              onClick={() => controller.command('laser_test', 0)}
            >
              {i18n._('Laser Off')}
            </Button>
          </Flex>
        </Box>
      </Collapse>
    </Box>
  );
}

export default connect(store => {
  const connectionState = _get(store, 'connection.state');
  const isConnected = (connectionState === CONNECTION_STATE_CONNECTED);

  return {
    isConnected,
  };
})(LaserTest);
