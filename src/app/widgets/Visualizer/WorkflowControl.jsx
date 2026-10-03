import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Space,
} from '@tonic-ui/react';
import get from 'lodash/get';
import includes from 'lodash/includes';
import pick from 'lodash/pick';
import React, { useCallback, useRef } from 'react';
import i18n from '@app/lib/i18n';
import log from '@app/lib/log';
import {
  // Grbl
  GRBL,
  GRBL_MACHINE_STATE_ALARM,
  // Marlin
  MARLIN,
  // Smoothie
  SMOOTHIE,
  SMOOTHIE_MACHINE_STATE_ALARM,
  // TinyG
  TINYG,
  TINYG_MACHINE_STATE_ALARM,
} from '@app/constants/controller';
import {
  WORKFLOW_STATE_IDLE,
  WORKFLOW_STATE_PAUSED,
  WORKFLOW_STATE_RUNNING,
} from '@app/constants/workflow';
import {
  MODAL_WATCH_DIRECTORY,
} from './constants';
import styles from './workflow-control.styl';

/**
 * @param {{ state?: object, actions?: object }} props
 */
function WorkflowControl({ state = {}, actions = {} }) {
  const fileInputRef = useRef(null);
  const { connected = false, gcode = {}, workflow = {} } = state;
  const canClick = Boolean(connected);
  const isReady = canClick && Boolean(gcode.ready);
  const canRun = canRunWorkflow(state);
  const canPause = isReady && includes([WORKFLOW_STATE_RUNNING], workflow.state);
  const canStop = isReady && includes([WORKFLOW_STATE_PAUSED], workflow.state);
  const canClose = isReady && includes([WORKFLOW_STATE_IDLE], workflow.state);
  const canUpload = isReady ? canClose : (canClick && !gcode.loading);

  const handleClickUpload = useCallback(() => {
    if (!fileInputRef.current) {
      return;
    }
    fileInputRef.current.value = null;
    fileInputRef.current.click();
  }, []);

  const handleChangeFile = useCallback((event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = (loadEvent) => {
      const { result, error } = loadEvent.target;

      if (error) {
        log.error(error);
        return;
      }

      log.debug('FileReader:', pick(file, [
        'lastModified',
        'lastModifiedDate',
        'meta',
        'name',
        'size',
        'type',
      ]));

      const meta = {
        name: file.name,
        content: result,
      };

      if (typeof actions.uploadFile === 'function') {
        actions.uploadFile(meta);
      }
    };

    try {
      reader.readAsText(file);
    } catch (err) {
      // Ignore invalid browser file input values.
    }
  }, [actions]);

  return (
    <Box className={styles.workflowControl}>
      <Box
        ref={fileInputRef}
        as="input"
        type="file"
        style={{ display: 'none' }}
        multiple={false}
        onChange={handleChangeFile}
      />
      <Flex alignItems="center" gap="2x">
        <ButtonGroup>
          <Button
            variant="primary"
            title={i18n._('Upload G-code')}
            onClick={handleClickUpload}
            disabled={!canUpload}
          >
            {i18n._('Upload G-code')}
          </Button>
          <Menu>
            <MenuButton
              id="upload-dropdown"
              aria-label={i18n._('Upload G-code options')}
              variant="primary"
              disabled={!canUpload}
            />
            <MenuList>
              <Box px="3x" py="2x" fontWeight="bold">
                {i18n._('Watch Directory')}
              </Box>
              <MenuItem
                onClick={() => {
                  if (typeof actions.openModal === 'function') {
                    actions.openModal(MODAL_WATCH_DIRECTORY);
                  }
                }}
              >
                <i aria-hidden="true" className="fa fa-search" />
                <Space width={8} />
                {i18n._('Browse...')}
              </MenuItem>
            </MenuList>
          </Menu>
        </ButtonGroup>
        <ButtonGroup>
          <Button
            aria-label={i18n._('Run')}
            variant="default"
            title={workflow.state === WORKFLOW_STATE_PAUSED ? i18n._('Resume') : i18n._('Run')}
            onClick={actions.handleRun}
            disabled={!canRun}
          >
            <i aria-hidden="true" className="fa fa-play" />
          </Button>
          <Button
            aria-label={i18n._('Pause')}
            variant="default"
            title={i18n._('Pause')}
            onClick={actions.handlePause}
            disabled={!canPause}
          >
            <i aria-hidden="true" className="fa fa-pause" />
          </Button>
          <Button
            aria-label={i18n._('Stop')}
            variant="default"
            title={i18n._('Stop')}
            onClick={actions.handleStop}
            disabled={!canStop}
          >
            <i aria-hidden="true" className="fa fa-stop" />
          </Button>
          <Button
            aria-label={i18n._('Close G-code file')}
            variant="default"
            title={i18n._('Close')}
            onClick={actions.handleClose}
            disabled={!canClose}
          >
            <i aria-hidden="true" className="fa fa-close" />
          </Button>
        </ButtonGroup>
      </Flex>
    </Box>
  );
}

/**
 * @param {object} state
 * @returns {boolean}
 */
export function canRunWorkflow(state = {}) {
  const { connected = false, controller = {}, gcode = {}, workflow = {} } = state;
  const controllerType = controller.type;
  const controllerState = controller.state;

  if (!connected || !gcode.ready) {
    return false;
  }
  if (!includes([WORKFLOW_STATE_IDLE, WORKFLOW_STATE_PAUSED], workflow.state)) {
    return false;
  }
  if (controllerType === GRBL) {
    const machineState = get(controllerState, 'status.machineState');
    if (includes([GRBL_MACHINE_STATE_ALARM], machineState)) {
      return false;
    }
  }
  if (controllerType === MARLIN) {
    // Marlin does not have machine state.
  }
  if (controllerType === SMOOTHIE) {
    const machineState = get(controllerState, 'status.machineState');
    if (includes([SMOOTHIE_MACHINE_STATE_ALARM], machineState)) {
      return false;
    }
  }
  if (controllerType === TINYG) {
    const machineState = get(controllerState, 'machineState');
    if (includes([TINYG_MACHINE_STATE_ALARM], machineState)) {
      return false;
    }
  }

  return true;
}

export default WorkflowControl;
