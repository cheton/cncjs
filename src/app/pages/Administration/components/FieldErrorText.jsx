import {
  Text,
} from '@tonic-ui/react';
import {
  isNullOrUndefined,
} from '@tonic-ui/utils';
import React, { forwardRef } from 'react';
import { Field } from 'react-final-form';

const FieldErrorText = forwardRef((
  {
    name,
    ...rest
  },
  ref,
) => {
  return (
    <Field
      name={name}
      subscription={{
        error: true,
        submitFailed: true,
      }}
      render={({ meta }) => {
        const isEmpty = !meta.error;
        const isInvalid = meta.submitFailed && !isNullOrUndefined(meta.error);
        const isValid = !isInvalid;

        if (isEmpty || isValid) {
          return null;
        }

        return (
          <Text
            ref={ref}
            color="error.text"
            mt="1x"
            {...rest}
          >
            {meta.error}
          </Text>
        );
      }}
    />
  );
});

export default FieldErrorText;
