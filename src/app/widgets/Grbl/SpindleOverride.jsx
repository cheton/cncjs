import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Box,
  Button,
  ButtonGroup,
  Space,
  Text,
} from '@tonic-ui/react';
import { ensurePositiveNumber } from 'ensure-type';
import _get from 'lodash/get';
import React from 'react';
import { connect } from 'react-redux';
import controller from '@app/lib/controller';
import i18n from '@app/lib/i18n';
import { none } from '@app/lib/utils';
import OverrideReadout from './components/OverrideReadout';
import RepeatableButton from './components/RepeatableButton';

/**
 * @param {{ value?: number }} props
 */
function SpindleOverride({
  value,
}) {
  if (!value) {
    return null;
  }

  return (
    <Box alignItems="center" display="flex" justifyContent="center">
      <Text fontFamily="mono" fontSize="1.5rem">
        S
      </Text>
      <Space width="2x" />
      <OverrideReadout>
        {(value >= 0) ? `${value}%` : none}
      </OverrideReadout>
      <Space width="2x" />
      <ButtonGroup size="sm">
        <RepeatableButton
          onClick={() => {
            controller.command('spindle_override', -10);
          }}
          sx={{ fontSize: '.75rem' }}
        >
          <FontAwesomeIcon icon="arrow-down" fixedWidth />
          <Text>{i18n._('-10%')}</Text>
        </RepeatableButton>
        <RepeatableButton
          onClick={() => {
            controller.command('spindle_override', -1);
          }}
          sx={{ fontSize: '.66rem' }}
        >
          <FontAwesomeIcon icon="arrow-down" fixedWidth />
          <Text>{i18n._('-1%')}</Text>
        </RepeatableButton>
        <RepeatableButton
          onClick={() => {
            controller.command('spindle_override', 1);
          }}
          sx={{ fontSize: '.66rem' }}
        >
          <FontAwesomeIcon icon="arrow-up" fixedWidth />
          <Text>{i18n._('1%')}</Text>
        </RepeatableButton>
        <RepeatableButton
          onClick={() => {
            controller.command('spindle_override', 10);
          }}
          sx={{ fontSize: '.75rem' }}
        >
          <FontAwesomeIcon icon="arrow-up" fixedWidth />
          <Text>{i18n._('10%')}</Text>
        </RepeatableButton>
      </ButtonGroup>
      <Space width="2x" />
      <Button
        aria-label="Reset spindle override"
        variant="ghost"
        onClick={() => {
          controller.command('spindle_override', 0);
        }}
      >
        <FontAwesomeIcon icon="undo" fixedWidth />
      </Button>
    </Box>
  );
}

export default connect(store => {
  const controllerState = _get(store, 'controller.state');
  const value = ensurePositiveNumber(_get(controllerState, 'status.ov[2]')); // [ovF, ovR, ovS]

  return {
    value,
  };
})(SpindleOverride);
