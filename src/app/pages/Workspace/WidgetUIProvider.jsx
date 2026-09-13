import PropTypes from 'prop-types';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
const WIDGET_GROUPS = ['default', 'primary', 'secondary'];

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

const createActiveWidgetIdsReader = config => {
  let previousIds = EMPTY_ARRAY;

  return () => {
    const ids = WIDGET_GROUPS.reduce((activeIds, group) => {
      const groupIds = config.get(
        ['workspace', 'container', group, 'widgets'],
        EMPTY_ARRAY
      );
      return activeIds.concat(Array.isArray(groupIds) ? groupIds : []);
    }, []);

    if (
      ids.length === previousIds.length &&
      ids.every((id, index) => id === previousIds[index])
    ) {
      return previousIds;
    }

    previousIds = ids;
    return previousIds;
  };
};

const createWidgetSnapshotReader = config => {
  const minimizedReader = createMinimizedSnapshotReader(config);
  const activeWidgetIdsReader = createActiveWidgetIdsReader(config);
  let previousSnapshot = null;

  return () => {
    const minimized = minimizedReader();
    const activeWidgetIds = activeWidgetIdsReader();

    if (
      previousSnapshot &&
      previousSnapshot.minimized === minimized &&
      previousSnapshot.activeWidgetIds === activeWidgetIds
    ) {
      return previousSnapshot;
    }

    previousSnapshot = {
      minimized,
      activeWidgetIds,
    };
    return previousSnapshot;
  };
};

export const WidgetUIProvider = ({ children, config = configSingleton }) => {
  const snapshotReader = useMemo(
    () => createWidgetSnapshotReader(config),
    [config]
  );
  const subscribe = useCallback(
    listener => subscribeToConfig(config, listener),
    [config]
  );
  const snapshot = useSyncExternalStore(subscribe, snapshotReader, snapshotReader);
  const { minimized, activeWidgetIds } = snapshot;
  const [fullscreenById, setFullscreenById] = useState({});
  const fullscreenRef = useRef({});

  useEffect(() => {
    const activeIds = new Set(activeWidgetIds);
    const current = fullscreenRef.current;
    const next = Object.keys(current).reduce((fullscreen, id) => {
      if (activeIds.has(id)) {
        fullscreen[id] = true;
      }
      return fullscreen;
    }, {});

    if (Object.keys(next).length === Object.keys(current).length) {
      return;
    }

    fullscreenRef.current = next;
    setFullscreenById(next);
  }, [activeWidgetIds]);

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
