import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Box,
  Button,
  ButtonGroup,
  Space,
  Text,
} from '@tonic-ui/react';
import React from 'react';
import controller from '@app/lib/controller';
import i18n from '@app/lib/i18n';
import DigitalReadout from './DigitalReadout';
import RepeatableButton from './RepeatableButton';

/**
 * @param {{ ovF?: number, ovS?: number }} props
 */
function Overrides({ ovF, ovS }) {
  if (!ovF && !ovS) {
    return null;
  }

  return (
    <Box mb="3x" sx={{ '> :not(:first-child)': { marginTop: '8px' } }}>
      {!!ovF && (
        <DigitalReadout label="F" value={`${ovF}%`}>
          <OverrideButtons command="feed_override" />
          <Space width="2x" />
          <Button
            aria-label="Reset feed rate override"
            variant="ghost"
            onClick={() => controller.command('feed_override', 0)}
          >
            <FontAwesomeIcon icon="undo" fixedWidth />
          </Button>
        </DigitalReadout>
      )}
      {!!ovS && (
        <DigitalReadout label="E" value={`${ovS}%`}>
          <OverrideButtons command="spindle_override" />
          <Space width="2x" />
          <Button
            aria-label="Reset spindle override"
            variant="ghost"
            onClick={() => controller.command('spindle_override', 0)}
          >
            <FontAwesomeIcon icon="undo" fixedWidth />
          </Button>
        </DigitalReadout>
      )}
    </Box>
  );
}

/**
 * @param {{ command: 'feed_override' | 'spindle_override' }} props
 */
function OverrideButtons({ command }) {
  return (
    <ButtonGroup size="sm">
      {[
        { icon: 'arrow-down', label: '-10%', value: -10 },
        { icon: 'arrow-down', label: '-1%', value: -1 },
        { icon: 'arrow-up', label: '1%', value: 1 },
        { icon: 'arrow-up', label: '10%', value: 10 },
      ].map(({ icon, label, value }) => (
        <RepeatableButton
          key={value}
          onClick={() => controller.command(command, value)}
          sx={{ fontSize: Math.abs(value) === 1 ? '.66rem' : '.75rem' }}
        >
          <FontAwesomeIcon icon={icon} fixedWidth />
          <Text>{i18n._(label)}</Text>
        </RepeatableButton>
      ))}
    </ButtonGroup>
  );
}

export default Overrides;
