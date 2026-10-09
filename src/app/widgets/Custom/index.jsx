import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Dropdown,
  DropdownToggle,
  Space,
} from '@tonic-ui/react';
import React, { useState } from 'react';
import Widget from '@app/components/Widget';
import widgetStyles from '@app/components/Widget/index.styl';
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
          <Button
            className={widgetStyles.widgetButton}
            sx={{
              border: 0,
              minHeight: 0,
              borderRadius: 0,
              backgroundColor: 'inherit',
              color: 'inherit',
              _hover: { backgroundColor: 'actions.hovered', color: 'inherit' },
              _active: { backgroundColor: 'actions.hovered', color: 'inherit' },
              _disabled: { backgroundColor: 'inherit', color: 'text.disabled' },
            }}
            aria-label={i18n._(disabled ? 'Enable widget' : 'Disable widget')}
            title={disabled ? i18n._('Enable') : i18n._('Disable')}
            onClick={() => config.set('disabled', !disabled)}
          >
            <FontAwesomeIcon
              icon={disabled ? 'toggle-off' : 'toggle-on'}
              fixedWidth
            />
          </Button>
          <Button
            className={widgetStyles.widgetButton}
            sx={{
              border: 0,
              minHeight: 0,
              borderRadius: 0,
              backgroundColor: 'inherit',
              color: 'inherit',
              _hover: { backgroundColor: 'actions.hovered', color: 'inherit' },
              _active: { backgroundColor: 'actions.hovered', color: 'inherit' },
              _disabled: { backgroundColor: 'inherit', color: 'text.disabled' },
            }}
            aria-label={i18n._('Refresh content')}
            disabled={disabled}
            onClickCapture={(event) => {
              if (disabled) {
                event.preventDefault();
                event.stopPropagation();
              }
            }}
            title={i18n._('Refresh')}
            onClick={(event) => {
              if (disabled) {
                event.preventDefault();
                event.stopPropagation();
                return;
              }
              emitter.emit('refresh', true);
            }}
          >
            <FontAwesomeIcon icon="redo-alt" fixedWidth />
          </Button>
          <Button
            className={widgetStyles.widgetButton}
            sx={{
              border: 0,
              minHeight: 0,
              borderRadius: 0,
              backgroundColor: 'inherit',
              color: 'inherit',
              _hover: { backgroundColor: 'actions.hovered', color: 'inherit' },
              _active: { backgroundColor: 'actions.hovered', color: 'inherit' },
              _disabled: { backgroundColor: 'inherit', color: 'text.disabled' },
            }}
            aria-label={i18n._(isCollapsed ? 'Expand' : 'Collapse')}
            aria-expanded={!isCollapsed}
            disabled={isFullscreen}
            onClickCapture={(event) => {
              if (isFullscreen) {
                event.preventDefault();
                event.stopPropagation();
              }
            }}
            title={i18n._(isCollapsed ? 'Expand' : 'Collapse')}
            onClick={(event) => {
              if (isFullscreen) {
                event.preventDefault();
                event.stopPropagation();
                return;
              }
              onViewChange(isCollapsed ? 'normal' : 'collapsed');
            }}
          >
            <FontAwesomeIcon
              icon={isCollapsed ? 'chevron-down' : 'chevron-up'}
              fixedWidth
            />
          </Button>
          {isFullscreen && (
            <Button
              className={widgetStyles.widgetButton}
              sx={{
                border: 0,
                minHeight: 0,
                borderRadius: 0,
                backgroundColor: 'inherit',
                color: 'inherit',
                _hover: { backgroundColor: 'actions.hovered', color: 'inherit' },
                _active: { backgroundColor: 'actions.hovered', color: 'inherit' },
                _disabled: { backgroundColor: 'inherit', color: 'text.disabled' },
              }}
              title={i18n._('Exit Full Screen')}
              onClick={() => onViewChange('normal')}
            >
              <FontAwesomeIcon icon="compress" fixedWidth />
            </Button>
          )}
          <Dropdown
            style={{ display: 'flex', alignSelf: 'stretch' }}
            items={[
              {
                value: 'settings',
                label: (
                  <>
                    <FontAwesomeIcon icon="cog" fixedWidth />
                    <Space width={8} />
                    {i18n._('Settings')}
                  </>
                ),
              },
              {
                value: 'fullscreen',
                label: (
                  <>
                    <FontAwesomeIcon
                      icon={isFullscreen ? 'compress' : 'expand'}
                      fixedWidth
                    />
                    <Space width={8} />
                    {isFullscreen ? i18n._('Exit Full Screen') : i18n._('Enter Full Screen')}
                  </>
                ),
              },
              {
                value: 'fork',
                label: (
                  <>
                    <FontAwesomeIcon icon="code-branch" fixedWidth />
                    <Space width={8} />
                    {i18n._('Fork Widget')}
                  </>
                ),
              },
              {
                value: 'remove',
                label: (
                  <>
                    <FontAwesomeIcon icon="times" fixedWidth />
                    <Space width={8} />
                    {i18n._('Remove Widget')}
                  </>
                ),
              },
            ]}
            onChange={({ value }) => select(value)}
            renderToggle={() => (
              <DropdownToggle
                className={widgetStyles.widgetButton}
                aria-label={i18n._('More options')}
                title={i18n._('More')}
              >
                <FontAwesomeIcon icon="ellipsis-v" fixedWidth />
              </DropdownToggle>
            )}
          />
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
