import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Space } from '@tonic-ui/react';
import React, { useEffect, useState } from 'react';
import Widget from '@app/components/Widget';
import { TINYG } from '@app/constants/controller';
import controller from '@app/lib/controller';
import i18n from '@app/lib/i18n';
import WidgetConfigProvider from '@app/widgets/shared/WidgetConfigProvider';
import Controller from './Controller';
import TinyG from './TinyG';

const getControllerSnapshot = () => ({
  settings: controller.settings || {},
  state: controller.state || {},
  type: controller.type,
});

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
function TinyGWidget({ onFork, onRemove, onViewChange, sortable, view, widgetId }) {
  const [connected, setConnected] = useState(Boolean(controller.connection.ident));
  const [controllerData, setControllerData] = useState(getControllerSnapshot);
  const [isControllerModalOpen, setIsControllerModalOpen] = useState(false);

  useEffect(() => {
    const listeners = {
      'connection:open': () => setConnected(true),
      'connection:change': (connectionState, isConnected) => {
        setConnected(Boolean(isConnected));
        if (!isConnected) {
          setControllerData(getControllerSnapshot());
          setIsControllerModalOpen(false);
        }
      },
      'controller:settings': (type, settings) => {
        if (type !== TINYG) {
          return;
        }
        setControllerData(current => ({
          ...current,
          settings: { ...current.settings, ...settings },
          type,
        }));
      },
      'controller:state': (type, state) => {
        if (type !== TINYG) {
          return;
        }
        setControllerData(current => ({
          ...current,
          state: { ...current.state, ...state },
          type,
        }));
      },
    };

    Object.entries(listeners).forEach(([eventName, callback]) => {
      controller.addListener(eventName, callback);
    });

    return () => {
      Object.entries(listeners).forEach(([eventName, callback]) => {
        controller.removeListener(eventName, callback);
      });
    };
  }, []);

  const isCollapsed = view === 'collapsed';
  const isFullscreen = view === 'fullscreen';
  const isReady = connected && controllerData.type === TINYG;
  const isForkedWidget = widgetId.match(/\w+:[\w\-]+/);

  return (
    <WidgetConfigProvider widgetId={widgetId}>
      <Widget aria-label="TinyG widget" fullscreen={isFullscreen}>
        <Widget.Header>
          <Widget.Title>
            <Widget.Sortable className={sortable.handleClassName}>
              <FontAwesomeIcon icon="bars" fixedWidth />
              <Space width="1x" />
            </Widget.Sortable>
            {isForkedWidget && <FontAwesomeIcon icon="code-branch" fixedWidth />}
            TinyG
          </Widget.Title>
          <Widget.Controls className={sortable.filterClassName}>
            {isReady && (
              <Widget.Button aria-label="TinyG controller info" onClick={() => setIsControllerModalOpen(true)}>
                <i aria-hidden="true" className="fa fa-info" />
              </Widget.Button>
            )}
            {isReady && (
              <Widget.DropdownButton aria-label="TinyG commands" toggle={<i aria-hidden="true" className="fa fa-th-large" />}>
                <Widget.DropdownMenuItem onSelect={() => controller.writeln('?')}>
                  {i18n._('Status Report (?)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem onSelect={() => {
                  controller.writeln('!%');
                  controller.writeln('{"qr":""}');
                }}
                >
                  {i18n._('Queue Flush (%)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem onSelect={() => controller.write('\x04')}>
                  {i18n._('Kill Job (^d)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem onSelect={() => controller.command('unlock')}>
                  {i18n._('Clear Alarm ($clear)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem divider />
                <Widget.DropdownMenuItem onSelect={() => controller.writeln('h')}>{i18n._('Help')}</Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem onSelect={() => controller.writeln('$sys')}>{i18n._('Show System Settings')}</Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem onSelect={() => controller.writeln('$$')}>{i18n._('Show All Settings')}</Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem onSelect={() => controller.writeln('$test')}>{i18n._('List Self Tests')}</Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem divider />
                <Widget.DropdownMenuItem onSelect={() => controller.writeln('$defa=1')}>{i18n._('Restore Defaults')}</Widget.DropdownMenuItem>
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
            <TinyG controllerData={controllerData} />
          </Widget.Content>
        )}
      </Widget>
      {isControllerModalOpen && (
        <Controller controllerData={controllerData} onClose={() => setIsControllerModalOpen(false)} />
      )}
    </WidgetConfigProvider>
  );
}

export default TinyGWidget;
