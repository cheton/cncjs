import { Button, Space, Text } from '@tonic-ui/react';
import React from 'react';
import controller from '@app/lib/controller';
import DigitalReadout from './DigitalReadout';
import RepeatableButton from './RepeatableButton';

const adjustmentSx = { flex: 1, px: '1x' };

/**
 * @param {{ ovF?: number, ovS?: number, ovT?: number }} props
 */
function Overrides({ ovF = 0, ovS = 0, ovT = 0 }) {
  if (!ovF && !ovS && !ovT) {
    return null;
  }

  return (
    <>
      {!!ovF && (
        <OverrideButtons
          commandName="feed_override"
          label="F"
          resetLabel="Reset feed rate override"
          value={ovF}
        />
      )}
      {!!ovS && (
        <OverrideButtons
          commandName="spindle_override"
          label="S"
          resetLabel="Reset spindle override"
          value={ovS}
        />
      )}
      {!!ovT && (
        <DigitalReadout label="T" value={`${ovT}%`}>
          {[
            ['fa-battery-full', 100],
            ['fa-battery-half', 50],
            ['fa-battery-quarter', 25],
          ].map(([icon, value]) => (
            <Button
              aria-label={`Trajectory planner ${value}%`}
              key={value}
              onClick={() => controller.command('rapid_override', value)}
              sx={adjustmentSx}
            >
              <i aria-hidden="true" className={`fa ${icon}`} />
              <Space width="2x" />
              {value}%
            </Button>
          ))}
        </DigitalReadout>
      )}
    </>
  );
}

/**
 * @param {{ commandName: string, label: string, resetLabel: string, value: number }} props
 */
function OverrideButtons({ commandName, label, resetLabel, value }) {
  return (
    <DigitalReadout label={label} value={`${value}%`}>
      {[-10, -1, 1, 10].map(adjustment => (
        <RepeatableButton
          key={adjustment}
          onClick={() => controller.command(commandName, adjustment)}
          sx={adjustmentSx}
        >
          <i
            aria-hidden="true"
            className={`fa fa-arrow-${adjustment < 0 ? 'down' : 'up'}`}
          />
          <Space width="1x" />
          <Text>{adjustment}%</Text>
        </RepeatableButton>
      ))}
      <Button
        aria-label={resetLabel}
        onClick={() => controller.command(commandName, 0)}
        sx={{ px: '1x' }}
      >
        <i aria-hidden="true" className="fa fa-undo fa-fw" />
      </Button>
    </DigitalReadout>
  );
}

export default Overrides;
