import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, ButtonGroup, Space, Text } from '@tonic-ui/react';
import React from 'react';
import controller from '@app/lib/controller';
import i18n from '@app/lib/i18n';
import DigitalReadout from './DigitalReadout';
import RepeatableButton from './RepeatableButton';

const overrideSteps = [
  { icon: 'arrow-down', value: -10 },
  { icon: 'arrow-down', value: -1 },
  { icon: 'arrow-up', value: 1 },
  { icon: 'arrow-up', value: 10 },
];

/**
 * @param {{ ovF?: number, ovS?: number }} props
 */
function Overrides({ ovF, ovS }) {
  if (!ovF && !ovS) {
    return null;
  }

  return (
    <Box>
      {!!ovF && (
        <OverrideControl
          commandName="feed_override"
          label="F"
          resetLabel="Reset feed rate override"
          value={ovF}
        />
      )}
      {!!ovS && (
        <OverrideControl
          commandName="spindle_override"
          label="S"
          resetLabel="Reset spindle override"
          value={ovS}
        />
      )}
    </Box>
  );
}

/**
 * @param {{ commandName: string, label: string, resetLabel: string, value: number }} props
 */
function OverrideControl({ commandName, label, resetLabel, value }) {
  return (
    <DigitalReadout label={label} value={`${value}%`}>
      <ButtonGroup size="sm">
        {overrideSteps.map(step => (
          <RepeatableButton
            key={step.value}
            onClick={() => controller.command(commandName, step.value)}
            sx={{ fontSize: Math.abs(step.value) === 1 ? '.66rem' : '.75rem' }}
          >
            <FontAwesomeIcon icon={step.icon} fixedWidth />
            <Text>{i18n._(`${step.value}%`)}</Text>
          </RepeatableButton>
        ))}
      </ButtonGroup>
      <Space width="2x" />
      <Button
        aria-label={resetLabel}
        variant="ghost"
        onClick={() => controller.command(commandName, 0)}
      >
        <FontAwesomeIcon icon="undo" fixedWidth />
      </Button>
    </DigitalReadout>
  );
}

export default Overrides;
