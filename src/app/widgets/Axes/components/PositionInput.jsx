import noop from 'lodash/noop';
import React, { useEffect, useRef } from 'react';
import {
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
} from '@tonic-ui/react';
import i18n from '@app/lib/i18n';

/**
 * @param {{ value?: string, onChange?: (value: string) => void, onSave?: (value: string) => void, onCancel?: () => void, min?: number, max?: number, className?: string, style?: object }} props
 * @returns {JSX.Element}
 */
function PositionInput({
  value = '',
  onChange = noop,
  onSave = noop,
  onCancel = noop,
  min = -10000,
  max = 10000,
  className,
  style,
}) {
  const node = useRef(null);

  useEffect(() => {
    node.current?.focus();
  }, []);

  const isNumber = value !== '';

  return (
    <InputGroup
      className={className}
      size="sm"
      style={{ ...style, width: '100%' }}
    >
      <Input
        aria-label={i18n._('Position value')}
        ref={node}
        type="number"
        className="form-control"
        placeholder=""
        style={{ borderRight: 'none' }}
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;

          if (nextValue === '') {
            onChange('');
            return;
          }
          if (nextValue >= min && nextValue <= max) {
            onChange(nextValue);
          }
        }}
        onKeyDown={(event) => {
          if (event.keyCode === 13) { // ENTER
            onSave(value);
          }
          if (event.keyCode === 27) { // ESC
            onCancel();
          }
        }}
      />
      <InputGroupAddon>
        <Button
          aria-label={i18n._('Save position')}
          disabled={!isNumber}
          onClick={() => {
            onSave(value);
          }}
        >
          <i aria-hidden="true" className="fa fa-fw fa-check" />
        </Button>
        <Button
          aria-label={i18n._('Cancel')}
          onClick={() => {
            onCancel();
          }}
        >
          <i aria-hidden="true" className="fa fa-fw fa-close" />
        </Button>
      </InputGroupAddon>
    </InputGroup>
  );
}

export default PositionInput;
