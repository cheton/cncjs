import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Space } from '@tonic-ui/react';
import { ensurePositiveNumber } from 'ensure-type';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Widget from '@app/components/Widget';
import { MARLIN } from '@app/constants/controller';
import controller from '@app/lib/controller';
import i18n from '@app/lib/i18n';
import WidgetConfig from '@app/widgets/shared/WidgetConfig';
import WidgetConfigProvider from '@app/widgets/shared/WidgetConfigProvider';
import Controller from './Controller';
import Marlin from './Marlin';

/**
 * @param {{
 *   onFork: () => void,
 *   onRemove: () => void,
 *   onViewChange: (view: 'normal' | 'collapsed' | 'fullscreen') => void,
 *   sortable: { filterClassName: string, handleClassName: string },
 *   view: 'normal' | 'collapsed' | 'fullscreen',
 *   widgetId: string,
 * }} props
 */
function MarlinWidget({ onFork, onRemove, onViewChange, sortable, view, widgetId }) {
  const config = useMemo(() => new WidgetConfig(widgetId), [widgetId]);
  const [state, setState] = useState(() => getInitialState(config));
  const [isControllerModalOpen, setIsControllerModalOpen] = useState(false);

  useEffect(() => {
    const onConnectionOpen = () => setState(current => ({ ...current, connected: true }));
    const onConnectionChange = (connectionState, connected) => {
      if (!connected) {
        setState({ ...getInitialState(config), connected: false });
        setIsControllerModalOpen(false);
        return;
      }
      setState(current => ({ ...current, connected: true }));
    };
    const onControllerSettings = (type, controllerSettings) => {
      if (type !== MARLIN) {
        return;
      }
      setState(current => ({
        ...current,
        controller: {
          ...current.controller,
          settings: { ...current.controller.settings, ...controllerSettings },
          type,
        },
      }));
    };
    const onControllerState = (type, controllerState) => {
      if (type !== MARLIN) {
        return;
      }
      setState(current => ({
        ...current,
        controller: {
          ...current.controller,
          state: { ...current.controller.state, ...controllerState },
          type,
        },
      }));
    };
    const listeners = {
      'connection:change': onConnectionChange,
      'connection:open': onConnectionOpen,
      'controller:settings': onControllerSettings,
      'controller:state': onControllerState,
    };

    Object.entries(listeners).forEach(([eventName, listener]) => {
      controller.addListener(eventName, listener);
    });
    return () => {
      Object.entries(listeners).forEach(([eventName, listener]) => {
        controller.removeListener(eventName, listener);
      });
    };
  }, [config]);

  const setPanelExpanded = useCallback((panelName, isExpanded) => {
    setState(current => ({
      ...current,
      panel: {
        ...current.panel,
        [panelName]: { ...current.panel[panelName], expanded: isExpanded },
      },
    }));
    config.set(`panel.${panelName}.expanded`, isExpanded);
  }, [config]);

  const changeHeaterTemperature = useCallback((heaterName, event) => {
    const inputValue = event.target.value;
    const value = typeof inputValue === 'string' && inputValue.trim() === ''
      ? inputValue
      : ensurePositiveNumber(inputValue);

    setState(current => ({
      ...current,
      heater: { ...current.heater, [heaterName]: value },
    }));
    if (Number.isFinite(value)) {
      config.set(`heater.${heaterName}`, value);
    }
  }, [config]);

  const isCollapsed = view === 'collapsed';
  const isFullscreen = view === 'fullscreen';
  const isReady = state.connected && state.controller.type === MARLIN;
  const isForkedWidget = widgetId.match(/\w+:[\w\-]+/);
  const actions = {
    changeExtruderTemperature: event => changeHeaterTemperature('extruder', event),
    changeHeatedBedTemperature: event => changeHeaterTemperature('heatedBed', event),
    setPanelExpanded,
  };

  return (
    <WidgetConfigProvider widgetId={widgetId}>
      <Widget aria-label="Marlin widget" fullscreen={isFullscreen}>
        <Widget.Header>
          <Widget.Title>
            <Widget.Sortable className={sortable.handleClassName}>
              <FontAwesomeIcon icon="bars" fixedWidth />
              <Space width="1x" />
            </Widget.Sortable>
            {isForkedWidget && <FontAwesomeIcon icon="code-branch" fixedWidth />}
            Marlin
          </Widget.Title>
          <Widget.Controls className={sortable.filterClassName}>
            {isReady && (
              <Widget.Button aria-label="Marlin controller info" onClick={() => setIsControllerModalOpen(true)}>
                <i aria-hidden="true" className="fa fa-info" />
              </Widget.Button>
            )}
            {isReady && (
              <Widget.DropdownButton aria-label="Marlin commands" toggle={<i aria-hidden="true" className="fa fa-th-large" />}>
                <Widget.DropdownMenuItem onSelect={() => controller.writeln('M105')}>
                  {i18n._('Get Extruder Temperature (M105)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem onSelect={() => controller.writeln('M114')}>
                  {i18n._('Get Current Position (M114)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem onSelect={() => controller.writeln('M115')}>
                  {i18n._('Get Firmware Version and Capabilities (M115)')}
                </Widget.DropdownMenuItem>
              </Widget.DropdownButton>
            )}
            {isReady && (
              <Widget.Button
                aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                aria-expanded={!isCollapsed}
                disabled={isFullscreen}
                title={isCollapsed ? i18n._('Expand') : i18n._('Collapse')}
                onClick={() => onViewChange(isCollapsed ? 'normal' : 'collapsed')}
              >
                <FontAwesomeIcon icon={isCollapsed ? 'chevron-down' : 'chevron-up'} fixedWidth />
              </Widget.Button>
            )}
            {isFullscreen && (
              <Widget.Button title={i18n._('Exit Full Screen')} onClick={() => onViewChange('normal')}>
                <FontAwesomeIcon icon="compress" fixedWidth />
              </Widget.Button>
            )}
            <Widget.DropdownButton
              aria-label="More options"
              title={i18n._('More')}
              toggle={<FontAwesomeIcon icon="ellipsis-v" fixedWidth />}
              onSelect={(eventKey) => {
                if (eventKey === 'fullscreen') {
                  onViewChange(isFullscreen ? 'normal' : 'fullscreen');
                } else if (eventKey === 'fork') {
                  onFork();
                } else if (eventKey === 'remove') {
                  onRemove();
                }
              }}
            >
              <Widget.DropdownMenuItem eventKey="fullscreen" disabled={!isReady}>
                <FontAwesomeIcon icon={isFullscreen ? 'compress' : 'expand'} fixedWidth />
                <Space width="2x" />
                {isFullscreen ? i18n._('Exit Full Screen') : i18n._('Enter Full Screen')}
              </Widget.DropdownMenuItem>
              <Widget.DropdownMenuItem eventKey="fork">
                <FontAwesomeIcon icon="code-branch" fixedWidth />
                <Space width="2x" />
                {i18n._('Fork Widget')}
              </Widget.DropdownMenuItem>
              <Widget.DropdownMenuItem eventKey="remove">
                <FontAwesomeIcon icon="times" fixedWidth />
                <Space width="2x" />
                {i18n._('Remove Widget')}
              </Widget.DropdownMenuItem>
            </Widget.DropdownButton>
          </Widget.Controls>
        </Widget.Header>
        {isReady && (
          <Widget.Content aria-hidden={isCollapsed} sx={{ display: isCollapsed ? 'none' : 'block' }}>
            <Box p="3x"><Marlin actions={actions} state={state} /></Box>
          </Widget.Content>
        )}
      </Widget>
      {isControllerModalOpen && (
        <Controller
          controllerSettings={state.controller.settings}
          controllerState={state.controller.state}
          onClose={() => setIsControllerModalOpen(false)}
        />
      )}
    </WidgetConfigProvider>
  );
}

/**
 * @param {{ get: (path: string, defaultValue?: unknown) => unknown }} config
 */
function getInitialState(config) {
  return {
    connected: !!controller.connection.ident,
    controller: {
      settings: controller.settings || {},
      state: controller.state || {},
      type: controller.type,
    },
    heater: {
      extruder: config.get('heater.extruder', 0),
      heatedBed: config.get('heater.heatedBed', 0),
    },
    panel: {
      heaterControl: { expanded: config.get('panel.heaterControl.expanded') },
      modalGroups: { expanded: config.get('panel.modalGroups.expanded') },
      statusReports: { expanded: config.get('panel.statusReports.expanded') },
    },
  };
}

export default MarlinWidget;
