import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Space,
} from '@tonic-ui/react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { ModalProvider, ModalConsumer, ModalRoot } from '@app/components/Modal';
import Widget from '@app/components/Widget';
import i18n from '@app/lib/i18n';
import WidgetConfig from '@app/widgets/shared/WidgetConfig';
import WidgetConfigProvider from '@app/widgets/shared/WidgetConfigProvider';
import WidgetConfigConsumer from '@app/widgets/shared/WidgetConfigConsumer';
import WidgetEventProvider from '@app/widgets/shared/WidgetEventProvider';
import Custom from './Custom';
import SettingsModal from './modals/SettingsModal';

class CustomWidget extends Component {
  static propTypes = {
    widgetId: PropTypes.string.isRequired,
    onFork: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    chrome: PropTypes.object.isRequired,
    sortable: PropTypes.object
  };

  config = new WidgetConfig(this.props.widgetId);

  state = this.getInitialState();

  toggleDisabled = () => {
    this.setState(state => ({
      disabled: !state.disabled,
    }));
  };

  componentDidUpdate(prevProps, prevState) {
    const {
      disabled,
    } = this.state;

    this.config.set('disabled', disabled);
  }

  getInitialState() {
    return {
      disabled: this.config.get('disabled'),
    };
  }

  render() {
    const { widgetId, chrome } = this.props;
    const { minimized, isFullscreen } = chrome;
    const { disabled } = this.state;
    const isForkedWidget = widgetId.match(/\w+:[\w\-]+/);

    return (
      <WidgetConfigProvider widgetId={widgetId}>
        <WidgetEventProvider>
          {(emitter) => (
            <ModalProvider>
              <ModalRoot />
              <ModalConsumer>
                {({ openModal }) => (
                  <Widget aria-label="Custom widget" fullscreen={isFullscreen}>
                    <Widget.Header>
                      <WidgetConfigConsumer>
                        {(config) => {
                          const title = config.get('title');

                          return (
                            <Widget.Title
                              title={title}
                            >
                              <Widget.Sortable className={this.props.sortable.handleClassName}>
                                <FontAwesomeIcon icon="bars" fixedWidth />
                                <Space width={4} />
                              </Widget.Sortable>
                              {isForkedWidget &&
                                <FontAwesomeIcon icon="code-branch" fixedWidth />}
                              {title}
                            </Widget.Title>
                          );
                        }}
                      </WidgetConfigConsumer>
                      <Widget.Controls className={this.props.sortable.filterClassName}>
                        <Widget.Button
                          aria-label={disabled ? 'Enable widget' : 'Disable widget'}
                          title={disabled ? i18n._('Enable') : i18n._('Disable')}
                          type="default"
                          onClick={this.toggleDisabled}
                        >
                          {disabled &&
                            <FontAwesomeIcon icon="toggle-off" fixedWidth />}
                          {!disabled &&
                            <FontAwesomeIcon icon="toggle-on" fixedWidth />}
                        </Widget.Button>
                        <Widget.Button
                          aria-label="Refresh content"
                          disabled={disabled}
                          title={i18n._('Refresh')}
                          onClick={() => {
                            const forceGet = true;
                            emitter.emit('refresh', forceGet);
                          }}
                        >
                          <FontAwesomeIcon icon="redo-alt" fixedWidth />
                        </Widget.Button>
                        <Widget.Button
                          aria-label={minimized ? 'Expand' : 'Collapse'}
                          aria-expanded={!minimized}
                          disabled={isFullscreen}
                          title={minimized ? i18n._('Expand') : i18n._('Collapse')}
                          onClick={() => chrome.onMinimizedChange(!minimized)}
                        >
                          {minimized &&
                            <FontAwesomeIcon icon="chevron-down" fixedWidth />}
                          {!minimized &&
                            <FontAwesomeIcon icon="chevron-up" fixedWidth />}
                        </Widget.Button>
                        {isFullscreen && (
                          <Widget.Button
                            title={i18n._('Exit Full Screen')}
                            onClick={chrome.onToggleFullscreen}
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
                            if (eventKey === 'settings') {
                              openModal(SettingsModal);
                            } else if (eventKey === 'fullscreen') {
                              chrome.onToggleFullscreen();
                            } else if (eventKey === 'fork') {
                              this.props.onFork();
                            } else if (eventKey === 'remove') {
                              this.props.onRemove();
                            }
                          }}
                        >
                          <Widget.DropdownMenuItem eventKey="settings">
                            <FontAwesomeIcon icon="cog" fixedWidth />
                            <Space width={8} />
                            {i18n._('Settings')}
                          </Widget.DropdownMenuItem>
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
                      aria-hidden={minimized}
                      style={{
                        display: (minimized ? 'none' : 'block'),
                      }}
                    >
                      <Custom
                        disabled={disabled}
                      />
                    </Widget.Content>
                  </Widget>
                )}
              </ModalConsumer>
            </ModalProvider>
          )}
        </WidgetEventProvider>
      </WidgetConfigProvider>
    );
  }
}

export default CustomWidget;
