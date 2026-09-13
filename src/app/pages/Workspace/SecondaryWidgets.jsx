import chainedFunction from 'chained-function';
import classNames from 'classnames';
import { ensureArray } from 'ensure-type';
import pubsub from 'pubsub-js';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import Sortable from 'react-sortablejs';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@app/components/Buttons';
import Modal from '@app/components/Modal';
import controller from '@app/lib/controller';
import i18n from '@app/lib/i18n';
import log from '@app/lib/log';
import portal from '@app/lib/portal';
import config from '@app/store/config';
import Widget from './Widget';
import { useWorkspaceWidgetIds } from './useWorkspaceWidgetIds';
import { WIDGET_REGISTRY } from './widgetRegistry';
import { selectVisibleWidgetIds } from './widgetUIState';
import styles from './widgets.styl';

const SecondaryWidgets = ({
  className,
  onForkWidget,
  onRemoveWidget,
  onDragStart,
  onDragEnd,
}) => {
  const { ids, setWidgetIds } = useWorkspaceWidgetIds('secondary');

  useEffect(() => {
    const token = pubsub.subscribe('updateSecondaryWidgets', (msg, widgets) => {
      setWidgetIds(ensureArray(widgets));
    });

    return () => {
      pubsub.unsubscribe(token);
    };
  }, [setWidgetIds]);

  const forkWidget = widgetId => () => {
    portal(({ onClose }) => (
      <Modal size="xs" onClose={onClose}>
        <Modal.Header>
          <Modal.Title>
            {i18n._('Fork Widget')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {i18n._('Are you sure you want to fork this widget?')}
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={onClose}
          >
            {i18n._('Cancel')}
          </Button>
          <Button
            btnStyle="primary"
            onClick={chainedFunction(
              () => {
                const name = widgetId.split(':')[0];
                if (!name) {
                  log.error(`Failed to fork widget: widgetId=${widgetId}`);
                  return;
                }

                // Use the same widget settings in a new widget
                const forkedWidgetId = `${name}:${uuidv4()}`;
                const defaultSettings = config.get(['widgets', name]);
                const clonedSettings = config.get(['widgets', widgetId], defaultSettings);
                config.set(['widgets', forkedWidgetId], clonedSettings);

                setWidgetIds([...ids, forkedWidgetId]);
                onForkWidget(widgetId);
              },
              onClose
            )}
          >
            {i18n._('OK')}
          </Button>
        </Modal.Footer>
      </Modal>
    ));
  };

  const removeWidget = widgetId => () => {
    portal(({ onClose }) => (
      <Modal size="xs" onClose={onClose}>
        <Modal.Header>
          <Modal.Title>
            {i18n._('Remove Widget')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {i18n._('Are you sure you want to remove this widget?')}
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={onClose}
          >
            {i18n._('Cancel')}
          </Button>
          <Button
            btnStyle="primary"
            onClick={chainedFunction(
              () => {
                setWidgetIds(ids.filter(id => id !== widgetId));

                if (widgetId.match(/\w+:[\w\-]+/)) {
                  // Remove forked widget settings
                  config.unset(['widgets', widgetId]);
                }

                onRemoveWidget(widgetId);
              },
              onClose
            )}
          >
            {i18n._('OK')}
          </Button>
        </Modal.Footer>
      </Modal>
    ));
  };

  const widgets = selectVisibleWidgetIds(
    ids,
    controller.availableControllers,
    WIDGET_REGISTRY
  ).map(widgetId => (
    <div data-widget-id={widgetId} key={widgetId}>
      <Widget
        widgetId={widgetId}
        onFork={forkWidget(widgetId)}
        onRemove={removeWidget(widgetId)}
        sortable={{
          handleClassName: 'sortable-handle',
          filterClassName: 'sortable-filter'
        }}
      />
    </div>
  ));

  return (
    <Sortable
      className={classNames(className, styles.widgets)}
      options={{
        animation: 150,
        delay: 0, // Touch and hold delay
        group: {
          name: 'secondary',
          pull: true,
          put: ['primary']
        },
        handle: '.sortable-handle', // Selectors that do not lead to dragging
        filter: '.sortable-filter', // Selectors that do not lead to dragging
        chosenClass: 'sortable-chosen', // Class name for the chosen item
        ghostClass: 'sortable-ghost', // Class name for the drop placeholder
        dataIdAttr: 'data-widget-id',
        onStart: onDragStart,
        onEnd: onDragEnd
      }}
      onChange={order => {
        setWidgetIds(ensureArray(order));
      }}
    >
      {widgets}
    </Sortable>
  );
};

SecondaryWidgets.propTypes = {
  className: PropTypes.string,
  onForkWidget: PropTypes.func.isRequired,
  onRemoveWidget: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired
};

export default SecondaryWidgets;
