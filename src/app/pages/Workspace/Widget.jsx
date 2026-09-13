import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { WIDGET_REGISTRY } from './widgetRegistry';
import { useWorkspaceWidgetUI } from './useWorkspaceWidgetUI';

const WidgetWithChrome = ({ Component, widgetId, ...props }) => {
  const {
    getChrome,
    setMinimized,
    toggleFullscreen,
  } = useWorkspaceWidgetUI();
  const { minimized, isFullscreen } = getChrome(widgetId);
  const chrome = useMemo(() => ({
    minimized,
    isFullscreen,
    onMinimizedChange: next => setMinimized(widgetId, next),
    onToggleFullscreen: () => toggleFullscreen(widgetId),
  }), [isFullscreen, minimized, setMinimized, toggleFullscreen, widgetId]);

  return (
    <Component
      {...props}
      widgetId={widgetId}
      chrome={chrome}
    />
  );
};

WidgetWithChrome.propTypes = {
  Component: PropTypes.elementType.isRequired,
  widgetId: PropTypes.string.isRequired,
};

const WidgetWrapper = ({ widgetId, ...props }) => {
  if (typeof widgetId !== 'string') {
    return null;
  }

  const name = widgetId.split(':')[0];
  const entry = WIDGET_REGISTRY[name];

  if (!entry) {
    return null;
  }

  if (!entry.supportsChrome) {
    return <entry.Component {...props} widgetId={widgetId} />;
  }

  return (
    <WidgetWithChrome
      {...props}
      Component={entry.Component}
      widgetId={widgetId}
    />
  );
};

WidgetWrapper.propTypes = {
  widgetId: PropTypes.string.isRequired,
};

export default WidgetWrapper;
