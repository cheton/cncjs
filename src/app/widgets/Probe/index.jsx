import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Space } from '@tonic-ui/react';
import React from 'react';
import Widget from '@app/components/Widget';
import i18n from '@app/lib/i18n';
import WidgetConfigProvider from '@app/widgets/shared/WidgetConfigProvider';
import Probe from './Probe';

/**
 * @param {{widgetId: string, onFork: Function, onRemove: Function, view: string, onViewChange: Function, sortable?: object}} props
 */
function ProbeWidget({
  widgetId,
  onFork,
  onRemove,
  view,
  onViewChange,
  sortable = {},
}) {
  const isCollapsed = view === 'collapsed';
  const isFullscreen = view === 'fullscreen';
  const isForkedWidget = widgetId.match(/\w+:[\w\-]+/);
  const select = (key) => {
    if (key === 'fullscreen') {
      onViewChange(isFullscreen ? 'normal' : 'fullscreen');
    }
    if (key === 'fork') {
      onFork();
    }
    if (key === 'remove') {
      onRemove();
    }
  };
  return (
    <WidgetConfigProvider widgetId={widgetId}>
      <Widget aria-label={i18n._('Probe widget')} fullscreen={isFullscreen}>
        <Widget.Header>
          <Widget.Title>
            <Widget.Sortable className={sortable.handleClassName}>
              <FontAwesomeIcon icon="bars" fixedWidth />
              <Space width={4} />
            </Widget.Sortable>
            {isForkedWidget && (
              <FontAwesomeIcon icon="code-branch" fixedWidth />
            )}
            {i18n._('Probe')}
          </Widget.Title>
          <Widget.Controls className={sortable.filterClassName}>
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
            <Widget.DropdownButton
              aria-label={i18n._('More options')}
              title={i18n._('More')}
              toggle={<FontAwesomeIcon icon="ellipsis-v" fixedWidth />}
              onSelect={select}
            >
              <Widget.DropdownMenuItem eventKey="fullscreen">
                {i18n._('Full Screen')}
              </Widget.DropdownMenuItem>
              <Widget.DropdownMenuItem eventKey="fork">
                {i18n._('Fork Widget')}
              </Widget.DropdownMenuItem>
              <Widget.DropdownMenuItem eventKey="remove">
                {i18n._('Remove Widget')}
              </Widget.DropdownMenuItem>
            </Widget.DropdownButton>
          </Widget.Controls>
        </Widget.Header>
        <Widget.Content
          aria-hidden={isCollapsed}
          sx={{ display: isCollapsed ? 'none' : 'block' }}
        >
          <Box sx={{ width: '100%', padding: '.75rem' }}>
            <Probe />
          </Box>
        </Widget.Content>
      </Widget>
    </WidgetConfigProvider>
  );
}
export default ProbeWidget;
