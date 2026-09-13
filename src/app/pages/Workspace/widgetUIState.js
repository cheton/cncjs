const EMPTY_OBJECT = {};

export const selectVisibleWidgetIds = (ids, availableControllers, registry) => {
  return ids.filter(id => {
    const entry = registry[id.split(':')[0]];
    return entry && (!entry.controllerType || availableControllers.includes(entry.controllerType));
  });
};

export const setWidgetsMinimized = (widgets, ids, minimized) => {
  let next = widgets;
  ids.forEach(id => {
    const previous = widgets[id] || {};
    if (Boolean(previous.minimized) === minimized) {
      return;
    }
    if (next === widgets) {
      next = { ...widgets };
    }
    next[id] = { ...previous, minimized };
  });
  return next;
};

export const createMinimizedSnapshotReader = (config) => {
  let previousIds = [];
  let previousSnapshot = EMPTY_OBJECT;

  return () => {
    const widgets = config.get('widgets', EMPTY_OBJECT) || EMPTY_OBJECT;
    const minimizedIds = Object.keys(widgets)
      .filter(id => Boolean(widgets[id]?.minimized))
      .sort();

    if (
      minimizedIds.length === previousIds.length &&
      minimizedIds.every((id, index) => id === previousIds[index])
    ) {
      return previousSnapshot;
    }

    previousIds = minimizedIds;
    previousSnapshot = minimizedIds.reduce((snapshot, id) => {
      snapshot[id] = true;
      return snapshot;
    }, {});
    return previousSnapshot;
  };
};
