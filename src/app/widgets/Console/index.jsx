import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Dropdown,
  DropdownToggle,
  Space,
} from '@tonic-ui/react';
import cx from 'classnames';
import React from 'react';
import Widget from '@app/components/Widget';
import widgetStyles from '@app/components/Widget/index.styl';
import i18n from '@app/lib/i18n';
import WidgetConfigProvider from '@app/widgets/shared/WidgetConfigProvider';
import WidgetEventProvider from '@app/widgets/shared/WidgetEventProvider';
import Console from './Console';
import styles from './index.styl';

/**
 * @param {{ widgetId: string, onFork: () => void, onRemove: () => void,
 * view: 'normal'|'collapsed'|'fullscreen', onViewChange: (view: string) => void,
 * sortable?: {handleClassName?: string, filterClassName?: string} }} props
 */
function ConsoleWidget({ widgetId, view, onViewChange, onFork, onRemove, sortable = {} }) {
  const isCollapsed = view === 'collapsed';
  const isFullscreen = view === 'fullscreen';
  const isForkedWidget = widgetId.match(/\w+:[\w\-]+/);

  return (
    <WidgetConfigProvider widgetId={widgetId}>
      <WidgetEventProvider>
        {(emitter) => (
          <Widget aria-label="Console widget" fullscreen={isFullscreen}>
            <Widget.Header>
              <Widget.Title>
                <Widget.Sortable className={sortable.handleClassName}>
                  <FontAwesomeIcon icon="bars" fixedWidth />
                  <Space width={4} />
                </Widget.Sortable>
                {isForkedWidget &&
                <FontAwesomeIcon icon="code-branch" fixedWidth />}
                {i18n._('Console')}
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
                  aria-label="Clear console"
                  title={i18n._('Clear all')}
                  onClick={() => emitter.emit('terminal:clear')}
                >
                  <FontAwesomeIcon icon="trash-alt" fixedWidth />
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
                  aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                  aria-expanded={!isCollapsed}
                  disabled={isFullscreen}
                  onClickCapture={(event) => {
                    if (isFullscreen) {
                      event.preventDefault();
                      event.stopPropagation();
                    }
                  }}
                  title={isCollapsed ? i18n._('Expand') : i18n._('Collapse')}
                  onClick={(event) => {
                    if (isFullscreen) {
                      event.preventDefault();
                      event.stopPropagation();
                      return;
                    }
                    onViewChange(isCollapsed ? 'normal' : 'collapsed');
                  }}
                >
                  {isCollapsed &&
                  <FontAwesomeIcon icon="chevron-down" fixedWidth />}
                  {!isCollapsed &&
                  <FontAwesomeIcon icon="chevron-up" fixedWidth />}
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
                  aria-label={!isFullscreen ? 'Enter full screen' : 'Exit full screen'}
                  title={!isFullscreen ? i18n._('Enter Full Screen') : i18n._('Exit Full Screen')}
                  onClick={() => onViewChange(isFullscreen ? 'normal' : 'fullscreen')}
                >
                  {isFullscreen &&
                  <FontAwesomeIcon icon="compress" fixedWidth />}
                  {!isFullscreen &&
                  <FontAwesomeIcon icon="expand" fixedWidth />}
                </Button>
                <Dropdown
                  style={{ display: 'flex', alignSelf: 'stretch' }}
                  items={[
                    {
                      value: 'refresh',
                      label: (
                        <>
                          <FontAwesomeIcon icon="undo-alt" fixedWidth />
                          <Space width={8} />
                          {i18n._('Refresh')}
                        </>
                      ),
                    },
                    {
                      value: 'selectAll',
                      label: (
                        <>
                          <i
                            className={cx(
                              styles.icon,
                              styles.selectAll
                            )}
                          />
                          <Space width={8} />
                          {i18n._('Select All')}
                        </>
                      ),
                    },
                    {
                      value: 'copySelection',
                      label: (
                        <>
                          <FontAwesomeIcon icon="copy" fixedWidth />
                          <Space width={8} />
                          {i18n._('Copy Selection')}
                        </>
                      ),
                    },
                    {
                      value: 'clearSelection',
                      label: (
                        <>
                          <FontAwesomeIcon icon="eraser" fixedWidth />
                          <Space width={8} />
                          {i18n._('Clear Selection')}
                        </>
                      ),
                    },
                    {
                      value: 'fullscreen',
                      label: (
                        <>
                          {!isFullscreen && (
                            <FontAwesomeIcon icon="expand" fixedWidth />
                          )}
                          {isFullscreen && (
                            <FontAwesomeIcon icon="compress" fixedWidth />
                          )}
                          <Space width={8} />
                          {!isFullscreen ? i18n._('Enter Full Screen') : i18n._('Exit Full Screen')}
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
                  onChange={({ value: eventKey }) => {
                    if (eventKey === 'refresh') {
                      emitter.emit('terminal:refresh');
                    } else if (eventKey === 'selectAll') {
                      emitter.emit('terminal:selectAll');
                    } else if (eventKey === 'copySelection') {
                      if (typeof document.execCommand === 'function') {
                        document.execCommand('copy');
                      }
                    } else if (eventKey === 'clearSelection') {
                      emitter.emit('terminal:clearSelection');
                    } else if (eventKey === 'fullscreen') {
                      onViewChange(isFullscreen ? 'normal' : 'fullscreen');
                    } if (eventKey === 'fork') {
                      onFork();
                    } else if (eventKey === 'remove') {
                      onRemove();
                    }
                  }}
                  renderToggle={() => (
                    <DropdownToggle
                      className={widgetStyles.widgetButton}
                      aria-label="More options"
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
              className={cx(
                styles.widgetContent,
                { [styles.hidden]: isCollapsed },
                { [styles.fullscreen]: isFullscreen }
              )}
            >
              <Console
                isFullscreen={isFullscreen}
              />
            </Widget.Content>
          </Widget>
        )}
      </WidgetEventProvider>
    </WidgetConfigProvider>
  );
}

export default ConsoleWidget;
