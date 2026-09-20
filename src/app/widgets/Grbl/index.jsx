import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Box,
  Space,
} from '@tonic-ui/react';
import _get from 'lodash/get';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import Widget from '@app/components/Widget';
import i18n from '@app/lib/i18n';
import controller from '@app/lib/controller';
import WidgetConfigProvider from '@app/widgets/shared/WidgetConfigProvider';
import {
  GRBL,
} from '@app/constants/controller';
import {
  CONNECTION_STATE_CONNECTED,
} from '@app/constants/connection';
import QueueReports from './QueueReports';
import StatusReports from './StatusReports';
import ModalGroups from './ModalGroups';
import FeedOverride from './FeedOverride';
import SpindleOverride from './SpindleOverride';
import RapidOverride from './RapidOverride';
import ControllerModal from './modals/ControllerModal';

/**
 * @param {{
 *   isReady?: boolean,
 *   onFork: () => void,
 *   onRemove: () => void,
 *   onViewChange: (view: 'normal' | 'collapsed' | 'fullscreen') => void,
 *   sortable: { filterClassName: string, handleClassName: string },
 *   view: 'normal' | 'collapsed' | 'fullscreen',
 *   widgetId: string,
 * }} props
 */
function GrblWidget({
  isReady,
  onFork,
  onRemove,
  onViewChange,
  sortable,
  view,
  widgetId,
}) {
  const [isControllerModalOpen, setIsControllerModalOpen] = useState(false);
  const isCollapsed = view === 'collapsed';
  const isFullscreen = view === 'fullscreen';
  const isForkedWidget = widgetId.match(/\w+:[\w\-]+/);

  return (
    <WidgetConfigProvider widgetId={widgetId}>
      <Widget aria-label="Grbl widget" fullscreen={isFullscreen}>
        <Widget.Header>
          <Widget.Title>
            <Widget.Sortable className={sortable.handleClassName}>
              <FontAwesomeIcon icon="bars" fixedWidth />
              <Space width="1x" />
            </Widget.Sortable>
            {isForkedWidget &&
            <FontAwesomeIcon icon="code-branch" fixedWidth />}
            Grbl
          </Widget.Title>
          <Widget.Controls className={sortable.filterClassName}>
            {isReady && (
              <Widget.Button
                aria-label="Grbl controller info"
                onClick={(event) => {
                  setIsControllerModalOpen(true);
                }}
              >
                <i className="fa fa-info" />
              </Widget.Button>
            )}
            {isReady && (
              <Widget.DropdownButton
                aria-label="Grbl commands"
                toggle={<i className="fa fa-th-large" />}
              >
                <Widget.DropdownMenuItem
                  onSelect={() => controller.write('?')}
                >
                  {i18n._('Status Report (?)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem
                  onSelect={() => controller.writeln('$C')}
                >
                  {i18n._('Check G-code Mode ($C)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem
                  onSelect={() => controller.command('homing')}
                >
                  {i18n._('Homing ($H)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem
                  onSelect={() => controller.command('unlock')}
                >
                  {i18n._('Kill Alarm Lock ($X)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem
                  onSelect={() => controller.command('sleep')}
                >
                  {i18n._('Sleep ($SLP)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem divider />
                <Widget.DropdownMenuItem
                  onSelect={() => controller.writeln('$')}
                >
                  {i18n._('Help ($)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem
                  onSelect={() => controller.writeln('$$')}
                >
                  {i18n._('Settings ($$)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem
                  onSelect={() => controller.writeln('$#')}
                >
                  {i18n._('View G-code Parameters ($#)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem
                  onSelect={() => controller.writeln('$G')}
                >
                  {i18n._('View G-code Parser State ($G)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem
                  onSelect={() => controller.writeln('$I')}
                >
                  {i18n._('View Build Info ($I)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem
                  onSelect={() => controller.writeln('$N')}
                >
                  {i18n._('View Startup Blocks ($N)')}
                </Widget.DropdownMenuItem>
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
                {isCollapsed &&
                <FontAwesomeIcon icon="chevron-down" fixedWidth />}
                {!isCollapsed &&
                <FontAwesomeIcon icon="chevron-up" fixedWidth />}
              </Widget.Button>
            )}
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
                  onFork();
                } else if (eventKey === 'remove') {
                  onRemove();
                }
              }}
            >
              <Widget.DropdownMenuItem eventKey="fullscreen" disabled={!isReady}>
                {!isFullscreen && (
                  <FontAwesomeIcon icon="expand" fixedWidth />
                )}
                {isFullscreen && (
                  <FontAwesomeIcon icon="compress" fixedWidth />
                )}
                <Space width="2x" />
                {!isFullscreen ? i18n._('Enter Full Screen') : i18n._('Exit Full Screen')}
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
          <Widget.Content
            aria-hidden={isCollapsed}
            sx={{ display: (isCollapsed ? 'none' : 'block') }}
          >
            <Box p="3x">
              <Box mb="3x">
                <FeedOverride />
                <SpindleOverride />
                <RapidOverride />
              </Box>
              <Box sx={{ '> :not(:first-child)': { borderTop: 0 } }}>
                <QueueReports />
                <StatusReports />
                <ModalGroups />
              </Box>
            </Box>
          </Widget.Content>
        )}
      </Widget>
      {isControllerModalOpen && (
        <ControllerModal onClose={() => setIsControllerModalOpen(false)} />
      )}
    </WidgetConfigProvider>
  );
}

export default connect(store => {
  const controllerType = _get(store, 'controller.type');
  const connectionState = _get(store, 'connection.state');
  const isReady = (controllerType === GRBL) && (connectionState === CONNECTION_STATE_CONNECTED);

  return {
    isReady,
  };
})(GrblWidget);
