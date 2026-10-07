import {
  Box,
  Button,
  Dropdown,
  DropdownButton,
  Flex,
  Space,
} from '@tonic-ui/react';
import classNames from 'classnames';
import colornames from 'colornames';
import _get from 'lodash/get';
import React from 'react';
import controller from '@app/lib/controller';
import i18n from '@app/lib/i18n';
import * as WebGL from '@app/lib/three/WebGL';
import {
  // Grbl
  GRBL,
  GRBL_MACHINE_STATE_IDLE,
  GRBL_MACHINE_STATE_RUN,
  GRBL_MACHINE_STATE_HOLD,
  GRBL_MACHINE_STATE_DOOR,
  GRBL_MACHINE_STATE_HOME,
  GRBL_MACHINE_STATE_SLEEP,
  GRBL_MACHINE_STATE_ALARM,
  GRBL_MACHINE_STATE_CHECK,
  // Marlin
  MARLIN,
  // Smoothie
  SMOOTHIE,
  SMOOTHIE_MACHINE_STATE_IDLE,
  SMOOTHIE_MACHINE_STATE_RUN,
  SMOOTHIE_MACHINE_STATE_HOLD,
  SMOOTHIE_MACHINE_STATE_DOOR,
  SMOOTHIE_MACHINE_STATE_HOME,
  SMOOTHIE_MACHINE_STATE_ALARM,
  SMOOTHIE_MACHINE_STATE_CHECK,
  // TinyG
  TINYG,
  TINYG_MACHINE_STATE_INITIALIZING,
  TINYG_MACHINE_STATE_READY,
  TINYG_MACHINE_STATE_ALARM,
  TINYG_MACHINE_STATE_STOP,
  TINYG_MACHINE_STATE_END,
  TINYG_MACHINE_STATE_RUN,
  TINYG_MACHINE_STATE_HOLD,
  TINYG_MACHINE_STATE_PROBE,
  TINYG_MACHINE_STATE_CYCLE,
  TINYG_MACHINE_STATE_HOMING,
  TINYG_MACHINE_STATE_JOG,
  TINYG_MACHINE_STATE_INTERLOCK,
  TINYG_MACHINE_STATE_SHUTDOWN,
  TINYG_MACHINE_STATE_PANIC,
} from '@app/constants/controller';
import {
  WORKFLOW_STATE_IDLE,
} from '@app/constants/workflow';

const controllerStateStyles = {
  'controller-state-default': {
    color: 'text.primary',
    backgroundColor: 'background.highest',
    border: '1px solid',
    borderColor: 'border.secondary',
  },
  ...Object.fromEntries([
    ['primary', 'info'], ['success', 'success'], ['info', 'info'],
    ['warning', 'warning'], ['danger', 'error'],
  ].map(([state, appearance]) => [`controller-state-${state}`, {
    color: `${appearance}._onOverlay.text`,
    backgroundColor: `${appearance}._overlay`,
    border: '1px solid',
    borderColor: `${appearance}.border`,
  }])),
};

const workCoordinateSystems = [
  ['G54', 'P1'],
  ['G55', 'P2'],
  ['G56', 'P3'],
  ['G57', 'P4'],
  ['G58', 'P5'],
  ['G59', 'P6'],
];

/**
 * @param {{ state?: object, actions?: object }} props
 */
function PrimaryToolbar({ state = {}, actions = {} }) {
  const connected = Boolean(state.connected);
  const controllerData = state.controller || {};
  const workflow = state.workflow || {};
  const gcode = state.gcode || {};
  const objects = state.objects || {};
  const disabled = Boolean(state.disabled);
  const canSendCommand = connected &&
    Boolean(controllerData.type) &&
    Boolean(controllerData.state) &&
    workflow.state === WORKFLOW_STATE_IDLE;
  const webGLAvailable = WebGL.isWebGLAvailable();
  const canToggleOptions = webGLAvailable && !disabled;
  const wcs = getWorkCoordinateSystem(controllerData);
  const limitsVisible = Boolean(_get(objects, 'limits.visible'));
  const coordinateSystemVisible = Boolean(_get(objects, 'coordinateSystem.visible'));
  const gridLineNumbersVisible = Boolean(_get(objects, 'gridLineNumbers.visible'));
  const cuttingToolVisible = Boolean(_get(objects, 'cuttingTool.visible'));
  const sendWorkCoordinateSystem = code => controller.command('gcode', code);

  return (
    <Flex alignItems="center">
      <Box
        display="inline-block"
        fontSize="14px"
        fontWeight="bold"
        marginRight="10px"
        padding="4px 0"
      >
        {controllerData.type}
      </Box>
      <ControllerState state={controllerData} />
      <Flex alignItems="center" marginLeft="auto" gap="1x">
        <Dropdown
          items={[
            {
              value: 'heading',
              type: 'custom',
              content: (
                <Box px="3x" py="2x" fontWeight="bold">
                  {i18n._('Work Coordinate System')}
                </Box>
              ),
            },
            ...workCoordinateSystems.map(([code, page]) => ({
              value: code,
              content: `${code} (${page})`,
              props: { selected: wcs === code, onClick: () => sendWorkCoordinateSystem(code) },
            })),
          ]}
          renderItem={item => item?.content}
          renderToggle={() => (
            <DropdownButton
              disabled={!canSendCommand}
              title={i18n._('Work Coordinate System')}
            >
              {formatWorkCoordinateSystem(wcs)}
            </DropdownButton>
          )}
        />
        <Dropdown
          items={[
            {
              value: 'webgl-status',
              type: 'custom',
              content: (
                <Box px="3x" py="2x" color="text.primary">
                  <Box as="span">{i18n._('WebGL')}: </Box>
                  <Box
                    as="span"
                    color={webGLAvailable ? colornames('royalblue') : colornames('crimson')}
                  >
                    {webGLAvailable ? i18n._('Enabled') : i18n._('Disabled')}
                  </Box>
                </Box>
              ),
            },
            { type: 'divider' },
            {
              value: 'projection-heading',
              type: 'custom',
              content: (
                <Box px="3x" py="2x" fontWeight="bold">
                  {i18n._('Projection')}
                </Box>
              ),
            },
            {
              value: 'perspective',
              content: (
                <>
                  <i aria-hidden="true" className={classNames('fa', 'fa-fw', { 'fa-check': state.projection !== 'orthographic' })} />
                  <Space width={8} />
                  {i18n._('Perspective Projection')}
                </>
              ),
              props: { disabled: !canToggleOptions, selected: state.projection !== 'orthographic', onClick: actions.toPerspectiveProjection },
            },
            {
              value: 'orthographic',
              content: (
                <>
                  <i aria-hidden="true" className={classNames('fa', 'fa-fw', { 'fa-check': state.projection === 'orthographic' })} />
                  <Space width={8} />
                  {i18n._('Orthographic Projection')}
                </>
              ),
              props: { disabled: !canToggleOptions, selected: state.projection === 'orthographic', onClick: actions.toOrthographicProjection },
            },
            { type: 'divider' },
            {
              value: 'filename',
              content: (
                <>
                  <i aria-hidden="true" className={gcode.displayName ? 'fa fa-toggle-on fa-fw' : 'fa fa-toggle-off fa-fw'} />
                  <Space width={8} />
                  {i18n._('Display G-code Filename')}
                </>
              ),
              props: { disabled: !canToggleOptions, onClick: actions.toggleGCodeFilename },
            },
            {
              value: 'limits',
              content: (
                <>
                  <i aria-hidden="true" className={limitsVisible ? 'fa fa-toggle-on fa-fw' : 'fa fa-toggle-off fa-fw'} />
                  <Space width={8} />
                  {limitsVisible ? i18n._('Hide Limits') : i18n._('Show Limits')}
                </>
              ),
              props: { disabled: !canToggleOptions, onClick: actions.toggleLimitsVisibility },
            },
            {
              value: 'coordinate-system',
              content: (
                <>
                  <i aria-hidden="true" className={coordinateSystemVisible ? 'fa fa-toggle-on fa-fw' : 'fa fa-toggle-off fa-fw'} />
                  <Space width={8} />
                  {coordinateSystemVisible ? i18n._('Hide Coordinate System') : i18n._('Show Coordinate System')}
                </>
              ),
              props: { disabled: !canToggleOptions, onClick: actions.toggleCoordinateSystemVisibility },
            },
            {
              value: 'grid-line-numbers',
              content: (
                <>
                  <i aria-hidden="true" className={gridLineNumbersVisible ? 'fa fa-toggle-on fa-fw' : 'fa fa-toggle-off fa-fw'} />
                  <Space width={8} />
                  {gridLineNumbersVisible ? i18n._('Hide Grid Line Numbers') : i18n._('Show Grid Line Numbers')}
                </>
              ),
              props: { disabled: !canToggleOptions, onClick: actions.toggleGridLineNumbersVisibility },
            },
            {
              value: 'cutting-tool',
              content: (
                <>
                  <i aria-hidden="true" className={cuttingToolVisible ? 'fa fa-toggle-on fa-fw' : 'fa fa-toggle-off fa-fw'} />
                  <Space width={8} />
                  {cuttingToolVisible ? i18n._('Hide Cutting Tool') : i18n._('Show Cutting Tool')}
                </>
              ),
              props: { disabled: !canToggleOptions, onClick: actions.toggleCuttingToolVisibility },
            },
          ]}
          renderItem={item => item?.content}
          renderToggle={() => (
            <Flex alignItems="center">
              <Button
                aria-label={i18n._('3D View')}
                title={(!webGLAvailable || disabled)
                  ? i18n._('Enable 3D View')
                  : i18n._('Disable 3D View')}
                onClick={actions.toggle3DView}
                variant="default"
              >
                <i aria-hidden="true" className={webGLAvailable && !disabled ? 'fa fa-toggle-on' : 'fa fa-toggle-off'} />
                <Space width={8} />
                {i18n._('3D View')}
              </Button>
              <DropdownButton
                aria-label={i18n._('3D View options')}
                title={i18n._('3D View options')}
                variant="default"
              />
            </Flex>
          )}
        />
      </Flex>
    </Flex>
  );
}

/**
 * @param {object} controllerData
 * @returns {React.ReactNode}
 */
function ControllerState({ state = {} }) {
  const controllerType = state.type;
  const controllerState = state.state;
  let stateStyle = '';
  let stateText = '';

  if (controllerType === GRBL) {
    const machineState = _get(controllerState, 'status.machineState');
    stateStyle = {
      [GRBL_MACHINE_STATE_IDLE]: 'controller-state-default',
      [GRBL_MACHINE_STATE_RUN]: 'controller-state-primary',
      [GRBL_MACHINE_STATE_HOLD]: 'controller-state-warning',
      [GRBL_MACHINE_STATE_DOOR]: 'controller-state-warning',
      [GRBL_MACHINE_STATE_HOME]: 'controller-state-primary',
      [GRBL_MACHINE_STATE_SLEEP]: 'controller-state-success',
      [GRBL_MACHINE_STATE_ALARM]: 'controller-state-danger',
      [GRBL_MACHINE_STATE_CHECK]: 'controller-state-info',
    }[machineState];
    stateText = {
      [GRBL_MACHINE_STATE_IDLE]: i18n.t('controller:Grbl.machineState.idle'),
      [GRBL_MACHINE_STATE_RUN]: i18n.t('controller:Grbl.machineState.run'),
      [GRBL_MACHINE_STATE_HOLD]: i18n.t('controller:Grbl.machineState.hold'),
      [GRBL_MACHINE_STATE_DOOR]: i18n.t('controller:Grbl.machineState.door'),
      [GRBL_MACHINE_STATE_HOME]: i18n.t('controller:Grbl.machineState.home'),
      [GRBL_MACHINE_STATE_SLEEP]: i18n.t('controller:Grbl.machineState.sleep'),
      [GRBL_MACHINE_STATE_ALARM]: i18n.t('controller:Grbl.machineState.alarm'),
      [GRBL_MACHINE_STATE_CHECK]: i18n.t('controller:Grbl.machineState.check'),
    }[machineState];
  }

  if (controllerType === MARLIN) {
    // Marlin does not have machine state.
  }

  if (controllerType === SMOOTHIE) {
    const machineState = _get(controllerState, 'status.machineState');
    stateStyle = {
      [SMOOTHIE_MACHINE_STATE_IDLE]: 'controller-state-default',
      [SMOOTHIE_MACHINE_STATE_RUN]: 'controller-state-primary',
      [SMOOTHIE_MACHINE_STATE_HOLD]: 'controller-state-warning',
      [SMOOTHIE_MACHINE_STATE_DOOR]: 'controller-state-warning',
      [SMOOTHIE_MACHINE_STATE_HOME]: 'controller-state-primary',
      [SMOOTHIE_MACHINE_STATE_ALARM]: 'controller-state-danger',
      [SMOOTHIE_MACHINE_STATE_CHECK]: 'controller-state-info',
    }[machineState];
    stateText = {
      [SMOOTHIE_MACHINE_STATE_IDLE]: i18n.t('controller:Smoothie.machineState.idle'),
      [SMOOTHIE_MACHINE_STATE_RUN]: i18n.t('controller:Smoothie.machineState.run'),
      [SMOOTHIE_MACHINE_STATE_HOLD]: i18n.t('controller:Smoothie.machineState.hold'),
      [SMOOTHIE_MACHINE_STATE_DOOR]: i18n.t('controller:Smoothie.machineState.door'),
      [SMOOTHIE_MACHINE_STATE_HOME]: i18n.t('controller:Smoothie.machineState.home'),
      [SMOOTHIE_MACHINE_STATE_ALARM]: i18n.t('controller:Smoothie.machineState.alarm'),
      [SMOOTHIE_MACHINE_STATE_CHECK]: i18n.t('controller:Smoothie.machineState.check'),
    }[machineState];
  }

  if (controllerType === TINYG) {
    const machineState = _get(controllerState, 'machineState');
    stateStyle = {
      [TINYG_MACHINE_STATE_INITIALIZING]: 'controller-state-warning',
      [TINYG_MACHINE_STATE_READY]: 'controller-state-default',
      [TINYG_MACHINE_STATE_ALARM]: 'controller-state-danger',
      [TINYG_MACHINE_STATE_STOP]: 'controller-state-default',
      [TINYG_MACHINE_STATE_END]: 'controller-state-default',
      [TINYG_MACHINE_STATE_RUN]: 'controller-state-primary',
      [TINYG_MACHINE_STATE_HOLD]: 'controller-state-warning',
      [TINYG_MACHINE_STATE_PROBE]: 'controller-state-primary',
      [TINYG_MACHINE_STATE_CYCLE]: 'controller-state-primary',
      [TINYG_MACHINE_STATE_HOMING]: 'controller-state-primary',
      [TINYG_MACHINE_STATE_JOG]: 'controller-state-primary',
      [TINYG_MACHINE_STATE_INTERLOCK]: 'controller-state-warning',
      [TINYG_MACHINE_STATE_SHUTDOWN]: 'controller-state-danger',
      [TINYG_MACHINE_STATE_PANIC]: 'controller-state-danger',
    }[machineState];
    stateText = {
      [TINYG_MACHINE_STATE_INITIALIZING]: i18n.t('controller:TinyG.machineState.initializing'),
      [TINYG_MACHINE_STATE_READY]: i18n.t('controller:TinyG.machineState.ready'),
      [TINYG_MACHINE_STATE_ALARM]: i18n.t('controller:TinyG.machineState.alarm'),
      [TINYG_MACHINE_STATE_STOP]: i18n.t('controller:TinyG.machineState.stop'),
      [TINYG_MACHINE_STATE_END]: i18n.t('controller:TinyG.machineState.end'),
      [TINYG_MACHINE_STATE_RUN]: i18n.t('controller:TinyG.machineState.run'),
      [TINYG_MACHINE_STATE_HOLD]: i18n.t('controller:TinyG.machineState.hold'),
      [TINYG_MACHINE_STATE_PROBE]: i18n.t('controller:TinyG.machineState.probe'),
      [TINYG_MACHINE_STATE_CYCLE]: i18n.t('controller:TinyG.machineState.cycle'),
      [TINYG_MACHINE_STATE_HOMING]: i18n.t('controller:TinyG.machineState.homing'),
      [TINYG_MACHINE_STATE_JOG]: i18n.t('controller:TinyG.machineState.jog'),
      [TINYG_MACHINE_STATE_INTERLOCK]: i18n.t('controller:TinyG.machineState.interlock'),
      [TINYG_MACHINE_STATE_SHUTDOWN]: i18n.t('controller:TinyG.machineState.shutdown'),
      [TINYG_MACHINE_STATE_PANIC]: i18n.t('controller:TinyG.machineState.panic'),
    }[machineState];
  }

  if (!stateStyle) {
    return null;
  }

  return (
    <Box
      display="inline-block"
      minWidth="50px"
      textAlign="center"
      padding="4px 12px"
      fontSize="12px"
      lineHeight="18px"
      borderRadius="3px"
      {...controllerStateStyles[stateStyle]}
    >
      {stateText}
    </Box>
  );
}

/**
 * @param {object} controllerData
 * @returns {string}
 */
export function getWorkCoordinateSystem(controllerData = {}) {
  const controllerType = controllerData.type;
  const controllerState = controllerData.state;
  const defaultWCS = 'G54';

  if (controllerType === GRBL || controllerType === SMOOTHIE) {
    return _get(controllerState, 'parserstate.modal.wcs') || defaultWCS;
  }
  if (controllerType === MARLIN || controllerType === TINYG) {
    return _get(controllerState, 'modal.wcs') || defaultWCS;
  }
  return defaultWCS;
}

/**
 * @param {string} wcs
 * @returns {string}
 */
function formatWorkCoordinateSystem(wcs) {
  const page = workCoordinateSystems.find(([code]) => code === wcs);
  return page ? `${page[0]} (${page[1]})` : wcs;
}

export default PrimaryToolbar;
