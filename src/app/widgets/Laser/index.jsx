import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Space,
} from '@tonic-ui/react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Container } from '@app/components/GridSystem';
import Widget from '@app/components/Widget';
import i18n from '@app/lib/i18n';
import WidgetConfigProvider from '@app/widgets/shared/WidgetConfigProvider';
import LaserIntensityOverride from './LaserIntensityOverride';
import LaserTest from './LaserTest';

class LaserWidget extends Component {
  static propTypes = {
    widgetId: PropTypes.string.isRequired,
    onFork: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    view: PropTypes.oneOf(['normal', 'collapsed', 'fullscreen']).isRequired,
    onViewChange: PropTypes.func.isRequired,
    sortable: PropTypes.object
  };

  render() {
    const { widgetId, view, onViewChange } = this.props;
    const isCollapsed = view === 'collapsed';
    const isFullscreen = view === 'fullscreen';
    const isForkedWidget = widgetId.match(/\w+:[\w\-]+/);

    return (
      <WidgetConfigProvider widgetId={widgetId}>
        <Widget aria-label="Laser widget" fullscreen={isFullscreen}>
          <Widget.Header>
            <Widget.Title>
              <Widget.Sortable className={this.props.sortable.handleClassName}>
                <FontAwesomeIcon icon="bars" fixedWidth />
                <Space width={4} />
              </Widget.Sortable>
              {isForkedWidget &&
                <FontAwesomeIcon icon="code-branch" fixedWidth />}
              {i18n._('Laser')}
            </Widget.Title>
            <Widget.Controls className={this.props.sortable.filterClassName}>
              <Widget.Button
                aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                aria-expanded={!isCollapsed}
                disabled={isFullscreen}
                title={isCollapsed ? i18n._('Expand') : i18n._('Collapse')}
                onClick={() => onViewChange(isCollapsed ? 'normal' : 'collapsed')}
              >
                {isCollapsed &&
                  <FontAwesomeIcon icon="chevron-down" fixedWidth />}
                {!isCollapsed &&
                  <FontAwesomeIcon icon="chevron-up" fixedWidth />}
              </Widget.Button>
              {isFullscreen && (
                <Widget.Button
                  title={i18n._('Exit Full Screen')}
                  onClick={() => onViewChange(isFullscreen ? 'normal' : 'fullscreen')}
                >
                  <FontAwesomeIcon icon="compress" fixedWidth />
                </Widget.Button>
              )}
              <Widget.DropdownButton
                aria-label="More options"
                title={i18n._('More')}
                toggle={(
                  <FontAwesomeIcon icon="ellipsis-v" fixedWidth />
                )}
                onSelect={(eventKey) => {
                  if (eventKey === 'fullscreen') {
                    onViewChange(isFullscreen ? 'normal' : 'fullscreen');
                  } else if (eventKey === 'fork') {
                    this.props.onFork();
                  } else if (eventKey === 'remove') {
                    this.props.onRemove();
                  }
                }}
              >
                <Widget.DropdownMenuItem eventKey="fullscreen">
                  {!isFullscreen && (
                    <FontAwesomeIcon icon="expand" fixedWidth />
                  )}
                  {isFullscreen && (
                    <FontAwesomeIcon icon="compress" fixedWidth />
                  )}
                  <Space width={8} />
                  {!isFullscreen ? i18n._('Enter Full Screen') : i18n._('Exit Full Screen')}
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
            style={{
              display: (isCollapsed ? 'none' : 'block'),
            }}
          >
            <Container
              fluid
              style={{
                padding: '.75rem',
              }}
            >
              <LaserIntensityOverride />
              <LaserTest />
            </Container>
          </Widget.Content>
        </Widget>
      </WidgetConfigProvider>
    );
  }
}

export default LaserWidget;
