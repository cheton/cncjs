import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, Dropdown, DropdownToggle, Space } from '@tonic-ui/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Widget from '@app/components/Widget';
import widgetStyles from '@app/components/Widget/index.styl';
import { SMOOTHIE } from '@app/constants/controller';
import controller from '@app/lib/controller';
import i18n from '@app/lib/i18n';
import WidgetConfig from '@app/widgets/shared/WidgetConfig';
import WidgetConfigProvider from '@app/widgets/shared/WidgetConfigProvider';
import Controller from './Controller';
import Smoothie from './Smoothie';

const widgetActionSx = {
  alignSelf: 'stretch',
  border: 0,
  borderRadius: 0,
  minHeight: 'auto',
  backgroundColor: 'inherit',
  color: 'inherit',
  _hover: { backgroundColor: 'actions.hovered', color: 'inherit' },
  _disabled: { backgroundColor: 'inherit', color: 'text.disabled' },
};

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
function SmoothieWidget({ onFork, onRemove, onViewChange, sortable, view, widgetId }) {
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
      if (type !== SMOOTHIE) {
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
      if (type !== SMOOTHIE) {
        return;
      }
      setState(current => ({
        ...current,
        controller: {
          ...current.controller,
          state: mergeControllerState(current.controller.state, controllerState),
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

  const isCollapsed = view === 'collapsed';
  const isFullscreen = view === 'fullscreen';
  const isReady = state.connected && state.controller.type === SMOOTHIE;
  const isForkedWidget = widgetId.match(/\w+:[\w\-]+/);

  return (
    <WidgetConfigProvider widgetId={widgetId}>
      <Widget aria-label="Smoothie widget" fullscreen={isFullscreen}>
        <Widget.Header>
          <Widget.Title>
            <Widget.Sortable className={sortable.handleClassName}>
              <FontAwesomeIcon icon="bars" fixedWidth />
              <Space width="1x" />
            </Widget.Sortable>
            {isForkedWidget && <FontAwesomeIcon icon="code-branch" fixedWidth />}
            Smoothie
          </Widget.Title>
          <Widget.Controls className={sortable.filterClassName}>
            {isReady && (
              <Button variant="ghost" className={widgetStyles.widgetButton} sx={widgetActionSx} aria-label="Smoothie controller info" onClick={() => setIsControllerModalOpen(true)}>
                <i aria-hidden="true" className="fa fa-info" />
              </Button>
            )}
            {isReady && (
              <Dropdown
                style={{ display: 'flex', alignSelf: 'stretch' }}
                items={[
                  {
                    label: i18n._('Status Report (?)'),
                    action: () => controller.write('?'),
                  },
                  {
                    label: i18n._('Homing ($H)'),
                    action: () => controller.command('homing'),
                  },
                  {
                    label: i18n._('Kill Alarm Lock ($X)'),
                    action: () => controller.command('unlock'),
                  },
                  { type: 'divider' },
                  {
                    label: i18n._('Help'),
                    action: () => controller.writeln('help'),
                  },
                  {
                    label: i18n._('View G-code Parameters ($#)'),
                    action: () => controller.writeln('$#'),
                  },
                  {
                    label: i18n._('View G-code Parser State ($G)'),
                    action: () => controller.writeln('$G'),
                  },
                ]}
                onChange={(item) => item.action?.()}
                renderToggle={() => (
                  <DropdownToggle aria-label="Smoothie commands" className={widgetStyles.widgetButton}>
                    <i aria-hidden="true" className="fa fa-th-large" />
                  </DropdownToggle>
                )}
              />
            )}
            {isReady && (
              <Button
                variant="ghost"
                className={widgetStyles.widgetButton}
                sx={widgetActionSx}
                aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                aria-expanded={!isCollapsed}
                disabled={isFullscreen}
                title={isCollapsed ? i18n._('Expand') : i18n._('Collapse')}
                onClick={() => onViewChange(isCollapsed ? 'normal' : 'collapsed')}
              >
                <FontAwesomeIcon icon={isCollapsed ? 'chevron-down' : 'chevron-up'} fixedWidth />
              </Button>
            )}
            {isFullscreen && (
              <Button variant="ghost" className={widgetStyles.widgetButton} sx={widgetActionSx} title={i18n._('Exit Full Screen')} onClick={() => onViewChange('normal')}>
                <FontAwesomeIcon icon="compress" fixedWidth />
              </Button>
            )}
            <Dropdown
              style={{ display: 'flex', alignSelf: 'stretch' }}
              items={[
                {
                  value: 'fullscreen',
                  label: (
                    <>
                      <FontAwesomeIcon icon={isFullscreen ? 'compress' : 'expand'} fixedWidth />
                      <Space width="2x" />
                      {isFullscreen ? i18n._('Exit Full Screen') : i18n._('Enter Full Screen')}
                    </>
                  ),
                  props: { disabled: !isReady },
                },
                {
                  value: 'fork',
                  label: (
                    <>
                      <FontAwesomeIcon icon="code-branch" fixedWidth />
                      <Space width="2x" />
                      {i18n._('Fork Widget')}
                    </>
                  ),
                },
                {
                  value: 'remove',
                  label: (
                    <>
                      <FontAwesomeIcon icon="times" fixedWidth />
                      <Space width="2x" />
                      {i18n._('Remove Widget')}
                    </>
                  ),
                },
              ]}
              onChange={({ value: eventKey }) => {
                if (eventKey === 'fullscreen') {
                  onViewChange(isFullscreen ? 'normal' : 'fullscreen');
                } else if (eventKey === 'fork') {
                  onFork();
                } else if (eventKey === 'remove') {
                  onRemove();
                }
              }}
              renderToggle={() => (
                <DropdownToggle aria-label="More options" title={i18n._('More')} className={widgetStyles.widgetButton}>
                  <FontAwesomeIcon icon="ellipsis-v" fixedWidth />
                </DropdownToggle>
              )}
            />
          </Widget.Controls>
        </Widget.Header>
        {isReady && (
          <Widget.Content aria-hidden={isCollapsed} sx={{ display: isCollapsed ? 'none' : 'block' }}>
            <Box p="3x">
              <Smoothie
                controllerState={state.controller.state}
                panel={state.panel}
                setPanelExpanded={setPanelExpanded}
              />
            </Box>
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
    panel: {
      modalGroups: { expanded: config.get('panel.modalGroups.expanded') },
      statusReports: { expanded: config.get('panel.statusReports.expanded') },
    },
  };
}

/**
 * @param {object} currentState
 * @param {object} nextState
 */
function mergeControllerState(currentState, nextState) {
  return {
    ...currentState,
    ...nextState,
    ...(nextState.parserstate && {
      parserstate: { ...currentState.parserstate, ...nextState.parserstate },
    }),
    ...(nextState.status && {
      status: { ...currentState.status, ...nextState.status },
    }),
  };
}

export default SmoothieWidget;
