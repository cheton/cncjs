import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Space,
} from '@tonic-ui/react';
import axios from '@app/api/axios';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { interpret } from 'xstate';
import { ModalProvider, ModalRoot } from '@app/components/Modal';
import Widget from '@app/components/Widget';
import i18n from '@app/lib/i18n';
import { createFetchMachine } from '@app/machines';
import WidgetConfigProvider from '@app/widgets/shared/WidgetConfigProvider';
import Macro from './Macro';
import { ServiceContext } from './context';

const fetchMachine = createFetchMachine();

class MacroWidget extends Component {
  static propTypes = {
    widgetId: PropTypes.string.isRequired,
    onFork: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    chrome: PropTypes.object.isRequired,
    sortable: PropTypes.object
  };

  serviceContext = {
    fetchMacrosService: interpret(
      fetchMachine,
      {
        services: {
          fetch: (context, event) => {
            const url = '/api/macros';
            return axios.get(url, event?.config);
          },
        },
      },
    ),
  };

  componentDidMount() {
    this.serviceContext.fetchMacrosService.start();
  }

  componentWillUnmount() {
    this.serviceContext.fetchMacrosService.stop();
  }

  render() {
    const { widgetId, chrome } = this.props;
    const { minimized, isFullscreen } = chrome;
    const isForkedWidget = widgetId.match(/\w+:[\w\-]+/);

    return (
      <WidgetConfigProvider widgetId={widgetId}>
        <ServiceContext.Provider value={this.serviceContext}>
          <ModalProvider>
            <ModalRoot />
            <Widget aria-label="Macro widget" fullscreen={isFullscreen}>
              <Widget.Header>
                <Widget.Title>
                  <Widget.Sortable className={this.props.sortable.handleClassName}>
                    <FontAwesomeIcon icon="bars" fixedWidth />
                    <Space width={4} />
                  </Widget.Sortable>
                  {isForkedWidget &&
                    <FontAwesomeIcon icon="code-branch" fixedWidth />}
                  {i18n._('Macro')}
                </Widget.Title>
                <Widget.Controls className={this.props.sortable.filterClassName}>
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
                      if (eventKey === 'fullscreen') {
                        chrome.onToggleFullscreen();
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
                aria-hidden={minimized}
                style={{
                  display: (minimized ? 'none' : 'block'),
                }}
              >
                <Macro />
              </Widget.Content>
            </Widget>
          </ModalProvider>
        </ServiceContext.Provider>
      </WidgetConfigProvider>
    );
  }
}

export default MacroWidget;
