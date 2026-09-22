import { Box, Flex } from '@tonic-ui/react';
import React from 'react';
import iconError from './icon-error-48.png';
import iconInfo from './icon-info-48.png';
import iconSuccess from './icon-success-48.png';
import iconWarning from './icon-warning-48.png';

const iconByType = {
  error: iconError,
  info: iconInfo,
  success: iconSuccess,
  warning: iconWarning,
};

/**
 * @param {{ children?: React.ReactNode }} props
 * @returns {JSX.Element}
 */
function PrimaryMessage({ children = null }) {
  return <Box fontWeight="bold" pb="1x">{children}</Box>;
}

/**
 * @param {{ children?: React.ReactNode }} props
 * @returns {JSX.Element}
 */
function DescriptiveMessage({ children = null }) {
  return <Box>{children}</Box>;
}

/**
 * @param {{ children?: React.ReactNode|Function, style?: Object, type?: 'error'|'warning'|'info'|'success' }} props
 * @returns {JSX.Element}
 */
function ModalTemplate({ children = null, style = {}, type = undefined }) {
  const icon = iconByType[type];

  return (
    <Flex align="flex-start" gap="4x">
      {icon && (
        <Box
          aria-hidden="true"
          as="i"
          flex="none"
          height="48px"
          sx={{ backgroundImage: `url(${icon})`, backgroundRepeat: 'no-repeat' }}
          width="48px"
        />
      )}
      <Box flex="auto" pt="1x" sx={style}>
        {typeof children === 'function'
          ? children({ PrimaryMessage, DescriptiveMessage })
          : children}
      </Box>
    </Flex>
  );
}

export default ModalTemplate;
