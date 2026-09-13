import PropTypes from 'prop-types';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import configSingleton from '@app/store/config';
import { WIDGET_REGISTRY } from './widgetRegistry';
import {
  createMinimizedSnapshotReader,
  setWidgetsMinimized,
} from './widgetUIState';

const EMPTY_ARRAY = [];
const WidgetUIContext = createContext(null);

const createWidgetIdsReader = (config, group) => {
  let previousIds = EMPTY_ARRAY;

  return () => {
    const ids = config.get(
      ['workspace', 'container', group, 'widgets'],
      EMPTY_ARRAY
    ) || EMPTY_ARRAY;

    if (
      Array.isArray(ids) &&
      ids.length === previousIds.length &&
      ids.every((id, index) => id === previousIds[index])
    ) {
      return previousIds;
    }

    previousIds = Array.isArray(ids) ? ids.slice() : EMPTY_ARRAY;
    return previousIds;
  };
};

const subscribeToConfig = (config, listener) => {
  config.on('change', listener);
  return () => config.off('change', listener);
};

export const WidgetUIProvider = ({ children, config = configSingleton }) => {
  const minimizedReader = useMemo(
    () => createMinimizedSnapshotReader(config),
    [config]
  );
  const subscribe = useCallback(
    listener => subscribeToConfig(config, listener),
    [config]
  );
  const minimized = useSyncExternalStore(subscribe, minimizedReader, minimizedReader);
  const [fullscreenById, setFullscreenById] = useState({});
  const fullscreenRef = useRef({});

  const setManyMinimized = useCallback((ids, next) => {
    const filteredIds = (ids || []).filter(id => {
      const entry = WIDGET_REGISTRY[id.split(':')[0]];
      return entry?.supportsChrome && !fullscreenRef.current[id];
    });

    if (filteredIds.length === 0) {
      return;
    }

    config.update('widgets', widgets => setWidgetsMinimized(widgets || {}, filteredIds, next));
  }, [config]);

  const setMinimized = useCallback((id, next) => {
    setManyMinimized([id], next);
  }, [setManyMinimized]);

  const toggleFullscreen = useCallback((id) => {
    const entry = WIDGET_REGISTRY[id.split(':')[0]];
    if (!entry?.supportsChrome) {
      return;
    }

    const isFullscreen = Boolean(fullscreenRef.current[id]);
    if (!isFullscreen) {
      setMinimized(id, false);
    }

    const nextFullscreen = { ...fullscreenRef.current };
    if (isFullscreen) {
      delete nextFullscreen[id];
    } else {
      nextFullscreen[id] = true;
    }
    fullscreenRef.current = nextFullscreen;
    setFullscreenById(nextFullscreen);
  }, [setMinimized]);

  const getChrome = useCallback((id) => ({
    minimized: Boolean(minimized[id]),
    isFullscreen: Boolean(fullscreenById[id]),
  }), [fullscreenById, minimized]);

  const value = useMemo(() => ({
    config,
    getChrome,
    setMinimized,
    setManyMinimized,
    toggleFullscreen,
  }), [config, getChrome, setManyMinimized, setMinimized, toggleFullscreen]);

  return (
    <WidgetUIContext.Provider value={value}>
      {children}
    </WidgetUIContext.Provider>
  );
};

WidgetUIProvider.propTypes = {
  children: PropTypes.node,
  config: PropTypes.object,
};

export const useWorkspaceWidgetUI = () => {
  const context = useContext(WidgetUIContext);
  if (!context) {
    throw new Error('useWorkspaceWidgetUI must be used within WidgetUIProvider');
  }
  return context;
};

export const useWorkspaceWidgetIds = (group) => {
  const { config } = useWorkspaceWidgetUI();
  const reader = useMemo(() => createWidgetIdsReader(config, group), [config, group]);
  const subscribe = useCallback(
    listener => subscribeToConfig(config, listener),
    [config]
  );
  const ids = useSyncExternalStore(subscribe, reader, reader);
  const setWidgetIds = useCallback((nextIds) => {
    config.set(['workspace', 'container', group, 'widgets'], nextIds);
  }, [config, group]);

  return { ids, setWidgetIds };
};
