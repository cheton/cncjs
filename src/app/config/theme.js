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

// Quiet neutral chrome for light mode: soft gray surfaces, muted hairline
// borders, neutral text and focus ring (background #fff, fills #f5f5f5,
// border #e5e5e5, ring #a1a1a1, foreground #0a0a0a). Only the `_light` slots
// are overridden, so dark mode stays untouched. CNCjs identity is retained:
// blue primary/selected, status colors and domain-owned palettes.
const quietLight = {
  background: {
    highest: { _light: '#ffffff' },
    high: { _light: '#fafafa' },
    medium: { _light: '#f5f5f5' },
    low: { _light: '#f2f2f2' },
  },
  text: {
    accent: { _light: 'color-mix(in srgb, #0a0a0a 96%, transparent)' },
    primary: { _light: 'color-mix(in srgb, #0a0a0a 80%, transparent)' },
    secondary: { _light: 'color-mix(in srgb, #0a0a0a 64%, transparent)' },
    tertiary: { _light: 'color-mix(in srgb, #0a0a0a 56%, transparent)' },
  },
  border: {
    accent: { _light: '#e5e5e5' },
    primary: { _light: '#e5e5e5' },
    secondary: { _light: '#e5e5e5' },
    tertiary: { _light: '#d4d4d4' },
    _primary: {
      enabled: { _light: '#e5e5e5' },
      hovered: { _light: '#d4d4d4' },
      active: { _light: '#a1a1a1' },
      focused: { _light: '#a1a1a1' },
    },
  },
  _foreground: {
    secondary: {
      enabled: { _light: '#f5f5f5' },
      hovered: { _light: '#ededed' },
      active: { _light: '#e4e4e4' },
    },
    subtle: {
      hovered: { _light: '#f5f5f5' },
      active: { _light: '#ededed' },
    },
  },
  _component: {
    keyboardFocused: {
      outerFocusRing: { _light: '#a1a1a1' },
    },
  },
};

export default createTheme({ colors: { ...quietLight, riskLevel } });
