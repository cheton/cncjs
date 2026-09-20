import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Space } from '@tonic-ui/react';
import React from 'react';
import Widget from '@app/components/Widget';
import i18n from '@app/lib/i18n';
import portal from '@app/lib/portal';
import WidgetConfigProvider from '@app/widgets/shared/WidgetConfigProvider';
import WidgetConfigConsumer from '@app/widgets/shared/WidgetConfigConsumer';
import WidgetEventProvider from '@app/widgets/shared/WidgetEventProvider';
import SettingsModal from './modals/SettingsModal';
import Webcam from './Webcam';

/**
 * @param {{ widgetId: string, onFork: () => void, onRemove: () => void, view: 'normal'|'collapsed'|'fullscreen', onViewChange: (view: string) => void, sortable: object, config: object, emitter: object }} props
 */
function WebcamWidgetBody({ widgetId, onFork, onRemove, view, onViewChange, sortable, config, emitter }) {
  const isCollapsed = view === 'collapsed';
  const isFullscreen = view === 'fullscreen';
  const disabled = Boolean(config.get('disabled', true));
  const isForkedWidget = /\w+:[\w\-]+/.test(widgetId);

  const onSelect = (eventKey) => {
    if (eventKey === 'settings') {
      portal(({ onClose }) => <SettingsModal onClose={onClose} />);
    } else if (eventKey === 'fullscreen') {
      onViewChange(isFullscreen ? 'normal' : 'fullscreen');
    } else if (eventKey === 'fork') {
      onFork();
    } else if (eventKey === 'remove') {
      onRemove();
    }
  };

  return (
    <Widget aria-label={i18n._('Webcam widget')} fullscreen={isFullscreen}>
      <Widget.Header>
        <Widget.Title>
          <Widget.Sortable className={sortable.handleClassName}>
            <FontAwesomeIcon icon="bars" fixedWidth />
            <Space width={4} />
          </Widget.Sortable>
          {isForkedWidget && <FontAwesomeIcon icon="code-branch" fixedWidth />}
          {i18n._('Webcam')}
        </Widget.Title>
        <Widget.Controls className={sortable.filterClassName}>
          <Widget.Button
            aria-label={disabled ? 'Enable Webcam' : 'Disable Webcam'}
            title={disabled ? i18n._('Enable') : i18n._('Disable')}
            type="default"
            onClick={() => config.set('disabled', !disabled)}
          >
            <FontAwesomeIcon icon={disabled ? 'toggle-off' : 'toggle-on'} fixedWidth />
          </Widget.Button>
          <Widget.Button
            aria-label="Refresh webcam" disabled={disabled} title={i18n._('Refresh')}
            onClick={() => emitter.emit('refresh')}
          >
            <FontAwesomeIcon icon="sync-alt" fixedWidth />
          </Widget.Button>
          <Widget.Button
            aria-label={isCollapsed ? 'Expand' : 'Collapse'}
            aria-expanded={!isCollapsed}
            disabled={isFullscreen}
            title={isCollapsed ? i18n._('Expand') : i18n._('Collapse')}
            onClick={() => onViewChange(isCollapsed ? 'normal' : 'collapsed')}
          >
            <FontAwesomeIcon icon={isCollapsed ? 'chevron-down' : 'chevron-up'} fixedWidth />
          </Widget.Button>
          {isFullscreen && <Widget.Button title={i18n._('Exit Full Screen')} onClick={() => onViewChange('normal')}><FontAwesomeIcon icon="compress" fixedWidth /></Widget.Button>}
          <Widget.DropdownButton
            aria-label="More options" title={i18n._('More')} toggle={<FontAwesomeIcon icon="ellipsis-v" fixedWidth />}
            onSelect={onSelect}
          >
            <Widget.DropdownMenuItem eventKey="settings"><FontAwesomeIcon icon="cog" fixedWidth /><Space width={8} />{i18n._('Settings')}</Widget.DropdownMenuItem>
            <Widget.DropdownMenuItem eventKey="fullscreen"><FontAwesomeIcon icon={isFullscreen ? 'compress' : 'expand'} fixedWidth /><Space width={8} />{i18n._(isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen')}</Widget.DropdownMenuItem>
            <Widget.DropdownMenuItem eventKey="fork"><FontAwesomeIcon icon="code-branch" fixedWidth /><Space width={8} />{i18n._('Fork Widget')}</Widget.DropdownMenuItem>
            <Widget.DropdownMenuItem eventKey="remove"><FontAwesomeIcon icon="times" fixedWidth /><Space width={8} />{i18n._('Remove Widget')}</Widget.DropdownMenuItem>
          </Widget.DropdownButton>
        </Widget.Controls>
      </Widget.Header>
      <Widget.Content aria-hidden={isCollapsed} sx={{ display: isCollapsed ? 'none' : 'block' }}>
        <Webcam disabled={disabled} isFullscreen={isFullscreen} />
      </Widget.Content>
    </Widget>
  );
}

/**
 * @param {{ widgetId: string, onFork: () => void, onRemove: () => void, view: 'normal'|'collapsed'|'fullscreen', onViewChange: (view: string) => void, sortable?: object }} props
 */
function WebcamWidget({ widgetId, onFork, onRemove, view, onViewChange, sortable = {} }) {
  return (
    <WidgetConfigProvider key={widgetId} widgetId={widgetId}>
      <WidgetConfigConsumer>
        {config => (
          <WidgetEventProvider>
            {emitter => (
              <WebcamWidgetBody
                widgetId={widgetId} onFork={onFork} onRemove={onRemove}
                view={view} onViewChange={onViewChange} sortable={sortable}
                config={config} emitter={emitter}
              />
            )}
          </WidgetEventProvider>
        )}
      </WidgetConfigConsumer>
    </WidgetConfigProvider>
  );
}

export default WebcamWidget;
