import { createTheme } from '@tonic-ui/react';

// alpha.1 still points these three gradients at the retired `alert` namespace.
// Resolve them against the v3 chart tokens before generating global variables.
const riskLevel = Object.fromEntries(['high', 'medium', 'low'].map(level => [level, {
  _gradient: {
    opaque: {
      _dark: `{colors.riskLevel.${level}.chart._dark}`,
      _light: `{colors.riskLevel.${level}.chart._light}`,
    },
  },
}]));

export default createTheme({ colors: { riskLevel } });
