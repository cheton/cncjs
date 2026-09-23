import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormInput,
  FormLabel,
  Icon,
} from '@tonic-ui/react';
import { WarningCircleIcon } from '@tonic-ui/react-icons';
import {
  isNullOrUndefined,
} from '@tonic-ui/utils';
import React, { forwardRef } from 'react';
import { Field } from 'react-final-form';
import FieldTextLabel from './FieldTextLabel';

/**
 * @param {object} props
 * @param {string} props.name
 * @param {Function} [props.validate]
 * @param {React.ReactNode} [props.label]
 * @param {boolean} [props.required]
 * @param {React.ReactNode} [props.infoTipLabel]
 * @param {React.ReactNode} [props.labelAction]
 */
const FieldInput = forwardRef((
  {
    name,
    validate,
    label,
    required = false,
    infoTipLabel,
    labelAction,
    ...rest
  },
  ref,
) => (
  <Field name={name} validate={validate}>
    {({ input, meta }) => {
      const error = meta.submitFailed && !isNullOrUndefined(meta.error);

      return (
        <FormControl
          error={error}
          mb="4x"
        >
          {label && (
            <Flex
              alignItems="center"
              justifyContent="space-between"
            >
              <Flex alignItems="center">
                <FormLabel required={required}>{label}</FormLabel>
                {infoTipLabel && <FieldTextLabel infoTipLabel={infoTipLabel} />}
              </Flex>
              {labelAction}
            </Flex>
          )}
          <Flex
            position="relative"
            alignItems="center"
            width="100%"
          >
            <FormInput
              ref={ref}
              {...input}
              name={name}
              pr={error ? '10x' : undefined}
              required={required}
              {...rest}
            />
            {error && (
              <Flex
                position="absolute"
                right={0}
                top={0}
                alignItems="center"
                height="8x"
              >
                <Icon as={WarningCircleIcon} mx="3x" color="red:50" />
              </Flex>
            )}
          </Flex>
          <FormErrorMessage errors={error ? [meta.error] : []} />
        </FormControl>
      );
    }}
  </Field>
));

export default FieldInput;
