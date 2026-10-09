import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Dropdown,
  DropdownToggle,
  Space,
} from '@tonic-ui/react';
import PropTypes from 'prop-types';
import React from 'react';
import Widget from '@app/components/Widget';
import widgetStyles from '@app/components/Widget/index.styl';
import i18n from '@app/lib/i18n';
import WidgetConfigProvider from '@app/widgets/shared/WidgetConfigProvider';
import Connection from './Connection';

function ConnectionWidget({
  widgetId,
  view,
  onViewChange,
  sortable,
}) {
  const isCollapsed = view === 'collapsed';
  const isFullscreen = view === 'fullscreen';
  const isForkedWidget = widgetId.match(/\w+:[\w\-]+/);

  return (
    <WidgetConfigProvider widgetId={widgetId}>
      <Widget aria-label="Connection widget" fullscreen={isFullscreen}>
        <Widget.Header>
          <Widget.Title>
            <Widget.Sortable className={sortable.handleClassName}>
              <FontAwesomeIcon icon="bars" fixedWidth />
              <Space width={4} />
            </Widget.Sortable>
            {isForkedWidget &&
            <FontAwesomeIcon icon="code-branch" fixedWidth />}
            {i18n._('Connection')}
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
                onClick={() => onViewChange(isFullscreen ? 'normal' : 'fullscreen')}
              >
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
              ]}
              onChange={({ value: eventKey }) => {
                if (eventKey === 'fullscreen') {
                  onViewChange(isFullscreen ? 'normal' : 'fullscreen');
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
          style={{
            display: (isCollapsed ? 'none' : 'block'),
          }}
        >
          <Connection />
        </Widget.Content>
      </Widget>
    </WidgetConfigProvider>
  );
}

ConnectionWidget.propTypes = {
  widgetId: PropTypes.string.isRequired,
  view: PropTypes.oneOf(['normal', 'collapsed', 'fullscreen']).isRequired,
  onViewChange: PropTypes.func.isRequired,
  sortable: PropTypes.object
};

export default ConnectionWidget;
