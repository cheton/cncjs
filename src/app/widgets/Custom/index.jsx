import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Space,
} from '@tonic-ui/react';
import React, { useState } from 'react';
import Widget from '@app/components/Widget';
import i18n from '@app/lib/i18n';
import WidgetConfigProvider from '@app/widgets/shared/WidgetConfigProvider';
import WidgetConfigConsumer from '@app/widgets/shared/WidgetConfigConsumer';
import WidgetEventProvider from '@app/widgets/shared/WidgetEventProvider';
import Custom from './Custom';
import SettingsModal from './modals/SettingsModal';

/**
 * @param {{widgetId: string, onFork: Function, onRemove: Function, view: string, onViewChange: Function, sortable: object, onOpenSettingsModal: Function, config: object, emitter: object}} props
 */
function CustomWidgetBody({
  widgetId,
  onFork,
  onRemove,
  view,
  onViewChange,
  sortable,
  onOpenSettingsModal,
  config,
  emitter,
}) {
  const isCollapsed = view === 'collapsed';
  const isFullscreen = view === 'fullscreen';
  const disabled = Boolean(config.get('disabled'));
  const title = config.get('title', '');
  const isForkedWidget = /\w+:[\w\-]+/.test(widgetId);

  const select = (eventKey) => {
    if (eventKey === 'settings') {
      onOpenSettingsModal();
    } else if (eventKey === 'fullscreen') {
      onViewChange(isFullscreen ? 'normal' : 'fullscreen');
    } else if (eventKey === 'fork') {
      onFork();
    } else if (eventKey === 'remove') {
      onRemove();
    }
  };

  return (
    <Widget aria-label={i18n._('Custom widget')} fullscreen={isFullscreen}>
      <Widget.Header>
        <Widget.Title title={title}>
          <Widget.Sortable className={sortable.handleClassName}>
            <FontAwesomeIcon icon="bars" fixedWidth />
            <Space width={4} />
          </Widget.Sortable>
          {isForkedWidget && (
            <FontAwesomeIcon icon="code-branch" fixedWidth />
          )}
          {title}
        </Widget.Title>
        <Widget.Controls className={sortable.filterClassName}>
          <Widget.Button
            aria-label={i18n._(disabled ? 'Enable widget' : 'Disable widget')}
            title={disabled ? i18n._('Enable') : i18n._('Disable')}
            type="default"
            onClick={() => config.set('disabled', !disabled)}
          >
            <FontAwesomeIcon
              icon={disabled ? 'toggle-off' : 'toggle-on'}
              fixedWidth
            />
          </Widget.Button>
          <Widget.Button
            aria-label={i18n._('Refresh content')}
            disabled={disabled}
            title={i18n._('Refresh')}
            onClick={() => emitter.emit('refresh', true)}
          >
            <FontAwesomeIcon icon="redo-alt" fixedWidth />
          </Widget.Button>
          <Widget.Button
            aria-label={i18n._(isCollapsed ? 'Expand' : 'Collapse')}
            aria-expanded={!isCollapsed}
            disabled={isFullscreen}
            title={i18n._(isCollapsed ? 'Expand' : 'Collapse')}
            onClick={() => onViewChange(isCollapsed ? 'normal' : 'collapsed')}
          >
            <FontAwesomeIcon
              icon={isCollapsed ? 'chevron-down' : 'chevron-up'}
              fixedWidth
            />
          </Widget.Button>
          {isFullscreen && (
            <Widget.Button
              title={i18n._('Exit Full Screen')}
              onClick={() => onViewChange('normal')}
            >
              <FontAwesomeIcon icon="compress" fixedWidth />
            </Widget.Button>
          )}
          <Widget.DropdownButton
            aria-label={i18n._('More options')}
            title={i18n._('More')}
            toggle={<FontAwesomeIcon icon="ellipsis-v" fixedWidth />}
            onSelect={select}
          >
            <Widget.DropdownMenuItem eventKey="settings">
              <FontAwesomeIcon icon="cog" fixedWidth />
              <Space width={8} />
              {i18n._('Settings')}
            </Widget.DropdownMenuItem>
            <Widget.DropdownMenuItem eventKey="fullscreen">
              <FontAwesomeIcon
                icon={isFullscreen ? 'compress' : 'expand'}
                fixedWidth
              />
              <Space width={8} />
              {isFullscreen ? i18n._('Exit Full Screen') : i18n._('Enter Full Screen')}
            </Widget.DropdownMenuItem>
            <Widget.DropdownMenuItem eventKey="fork">
              <FontAwesomeIcon icon="code-branch" fixedWidth />
              <Space width={8} />
              {i18n._('Fork Widget')}
            </Widget.DropdownMenuItem>
            <Widget.DropdownMenuItem eventKey="remove">
              <FontAwesomeIcon icon="times" fixedWidth />
              <Space width={8} />
              {i18n._('Remove Widget')}
            </Widget.DropdownMenuItem>
          </Widget.DropdownButton>
        </Widget.Controls>
      </Widget.Header>
      <Widget.Content
        aria-hidden={isCollapsed}
        sx={{ display: isCollapsed ? 'none' : 'block' }}
      >
        <Custom disabled={disabled} />
      </Widget.Content>
    </Widget>
  );
}

/**
 * @param {{widgetId: string, onFork: Function, onRemove: Function, view: string, onViewChange: Function, sortable?: object}} props
 */
function CustomWidget({
  widgetId,
  onFork,
  onRemove,
  view,
  onViewChange,
  sortable = {},
}) {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  return (
    <WidgetConfigProvider key={widgetId} widgetId={widgetId}>
      <WidgetConfigConsumer>
        {config => (
          <WidgetEventProvider>
            {emitter => (
              <>
                <CustomWidgetBody
                  widgetId={widgetId}
                  onFork={onFork}
                  onRemove={onRemove}
                  view={view}
                  onViewChange={onViewChange}
                  sortable={sortable}
                  onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
                  config={config}
                  emitter={emitter}
                />
                {isSettingsModalOpen && (
                  <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />
                )}
              </>
            )}
          </WidgetEventProvider>
        )}
      </WidgetConfigConsumer>
    </WidgetConfigProvider>
  );
}

export default CustomWidget;
