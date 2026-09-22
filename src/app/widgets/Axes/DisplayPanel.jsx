import { ensureArray } from 'ensure-type';
import { Box, Tooltip } from '@tonic-ui/react';
import includes from 'lodash/includes';
import noop from 'lodash/noop';
import React from 'react';
import Dropdown, { MenuItem } from '@app/components/Dropdown';
import Image from '@app/components/Image';
import {
  AXIS_E,
  AXIS_X,
  AXIS_Y,
  AXIS_Z,
  AXIS_A,
  AXIS_B,
  AXIS_C,
  METRIC_UNITS,
} from '@app/constants';
import {
  GRBL,
  MARLIN,
  SMOOTHIE,
  TINYG,
} from '@app/constants/controller';
import controller from '@app/lib/controller';
import i18n from '@app/lib/i18n';
import AxisLabel from './components/AxisLabel';
import AxisSubscript from './components/AxisSubscript';
import Panel from './components/Panel';
import PositionLabel from './components/PositionLabel';
import PositionInput from './components/PositionInput';
import Taskbar from './components/Taskbar';
import TaskbarButton from './components/TaskbarButton';
import { useAxes } from './context';
import iconMinus from './images/minus.svg';
import iconPlus from './images/plus.svg';
import iconHome from './images/home.svg';
import iconPin from './images/pin.svg';
import iconPencil from './images/pencil.svg';
import styles from './index.styl';

// Declares which gcode commands each controller supports in the axis dropdown.
// Grouped by dropdown section (Work Coordinate System → Temporary Offsets → Machine Coordinate System).
//
// Command               | G-code          | Description
// --------------------- | --------------- | ----------------------------------------------------
// canGoToWork           | G0              | rapid move to work zero
// canSetWCSOffset       | G10 L20         | set work coordinate offset
// canZeroTempOffset     | G92             | zero out temporary position offset
// canCancelTempOffset   | G92.1           | cancel G92 offsets
// canGoToMachine        | G53 G0          | move in machine coordinates
// canZeroOutMachine     | G28.3           | set axis position without motion (TinyG/g2core only)
const SUPPORTED_COMMANDS = {
  [GRBL]: {
    // Work Coordinate System
    canGoToWork: true,
    canSetWCSOffset: true,
    // Temporary Offsets
    canZeroTempOffset: true,
    canCancelTempOffset: true,
    // Machine Coordinate System
    canGoToMachine: true,
    canZeroOutMachine: false, // Grbl does not support setting machine zero without motion
  },
  [MARLIN]: {
    // Work Coordinate System
    canGoToWork: true,
    canSetWCSOffset: false, // Marlin uses G92 for work offsets, not G10 L20
    // Temporary Offsets
    canZeroTempOffset: true,
    canCancelTempOffset: false, // G92.1 requires CNC_COORDINATE_SYSTEMS compile flag
    // Machine Coordinate System
    canGoToMachine: true,
    canZeroOutMachine: false, // Marlin does not support setting machine zero without motion
  },
  [SMOOTHIE]: {
    // Work Coordinate System
    canGoToWork: true,
    canSetWCSOffset: true,
    // Temporary Offsets
    canZeroTempOffset: true,
    canCancelTempOffset: true,
    // Machine Coordinate System
    canGoToMachine: true,
    canZeroOutMachine: false, // Smoothie does not support setting machine zero without motion
  },
  [TINYG]: {
    // Work Coordinate System
    canGoToWork: true,
    canSetWCSOffset: true,
    // Temporary Offsets
    canZeroTempOffset: true,
    canCancelTempOffset: true,
    // Machine Coordinate System
    canGoToMachine: true,
    canZeroOutMachine: true,
  },
};

// Returns the all-axes homing command for the given controller type and reported axes.
//
// Controller     | Command
// -------------- | ----------------
// Grbl           | $H
// TinyG/g2core   | G28.2 X0 Y0 Z0 (composed from reported axes)
// Marlin         | G28
// Smoothie       | G28
const getHomeCommand = (controllerType, axes = ['x', 'y', 'z']) => {
  if (controllerType === GRBL) {
    return '$H';
  }

  if (controllerType === MARLIN || controllerType === SMOOTHIE) {
    return 'G28';
  }

  if (controllerType === TINYG) {
    // TinyG/g2core requires explicit axis parameters
    const axisParams = axes.map(axis => axis.toUpperCase() + '0').join(' ');
    return 'G28.2 ' + axisParams;
  }

  return '';
};

// Returns the single-axis homing command for the given controller type and axis.
//
// Controller     | Command                        | Notes
// -------------- | ------------------------------ | -----------------------------------
// Grbl           | $HX, $HY, $HZ                  | Requires compile-time flag
// TinyG/g2core   | G28.2 X0, G28.2 Y0, G28.2 Z0   | Value after axis letter is ignored
// Marlin         | G28 X, G28 Y, G28 Z            |
// Smoothie       | G28 X, G28 Y, G28 Z            |
const getAxisHomeCommand = (controllerType, axis) => {
  if (controllerType === GRBL) {
    return `$H${axis.toUpperCase()}`;
  }

  if (controllerType === MARLIN || controllerType === SMOOTHIE) {
    return `G28 ${axis.toUpperCase()}`;
  }

  if (controllerType === TINYG) {
    return `G28.2 ${axis.toUpperCase()}0`;
  }

  return '';
};

/**
 * @returns {JSX.Element}
 */
function DisplayPanel() {
  const context = useAxes();
  const handleSelect = (eventKey) => {
    const commands = ensureArray(eventKey);
    commands.forEach(command => controller.command('gcode', command));
  };

  const showPositionInput = (axis, reportedValue) => () => {
    context.onSetPositionInput({ axis, value: reportedValue });
  };

  const hidePositionInput = () => {
    context.onSetPositionInput(null);
  };

  const renderActionDropdown = ({ wcs }) => {
    const { canClick, controllerType, axes } = context.state;
    const {
      canGoToWork,
      canSetWCSOffset,
      canZeroTempOffset,
      canCancelTempOffset,
      canGoToMachine,
      canZeroOutMachine,
    } = SUPPORTED_COMMANDS[controllerType] || {};
    const homingCommand = getHomeCommand(controllerType, axes);

    return (
      <Dropdown
        disabled={!canClick}
        onSelect={handleSelect}
      >
        <Dropdown.Toggle
          aria-label="Select work coordinate system"
          className={styles.actionDropdown}
          btnStyle="link"
          compact
          noCaret
        >
          <i aria-hidden="true" className="fa fa-fw fa-caret-down" />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {wcs === 'G54' &&
            <MenuItem header>{i18n._('Work Coordinate System (G54)')}</MenuItem>}
          {wcs === 'G55' &&
            <MenuItem header>{i18n._('Work Coordinate System (G55)')}</MenuItem>}
          {wcs === 'G56' &&
            <MenuItem header>{i18n._('Work Coordinate System (G56)')}</MenuItem>}
          {wcs === 'G57' &&
            <MenuItem header>{i18n._('Work Coordinate System (G57)')}</MenuItem>}
          {wcs === 'G58' &&
            <MenuItem header>{i18n._('Work Coordinate System (G58)')}</MenuItem>}
          {wcs === 'G59' &&
            <MenuItem header>{i18n._('Work Coordinate System (G59)')}</MenuItem>}
          {canGoToWork && (
            <MenuItem
              eventKey="G0 X0 Y0 Z0"
              disabled={!canClick}
            >
              {i18n._('Go To Work Zero (G0 X0 Y0 Z0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G54' && (
            <MenuItem
              eventKey="G10 L20 P1 X0 Y0 Z0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work Offsets (G10 L20 P1 X0 Y0 Z0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G55' && (
            <MenuItem
              eventKey="G10 L20 P2 X0 Y0 Z0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work Offsets (G10 L20 P2 X0 Y0 Z0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G56' && (
            <MenuItem
              eventKey="G10 L20 P3 X0 Y0 Z0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work Offsets (G10 L20 P3 X0 Y0 Z0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G57' && (
            <MenuItem
              eventKey="G10 L20 P4 X0 Y0 Z0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work Offsets (G10 L20 P4 X0 Y0 Z0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G58' && (
            <MenuItem
              eventKey="G10 L20 P5 X0 Y0 Z0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work Offsets (G10 L20 P5 X0 Y0 Z0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G59' && (
            <MenuItem
              eventKey="G10 L20 P6 X0 Y0 Z0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work Offsets (G10 L20 P6 X0 Y0 Z0)')}
            </MenuItem>
          )}
          <MenuItem divider />
          <MenuItem header>{i18n._('Temporary Offsets (G92)')}</MenuItem>
          {canZeroTempOffset && (
            <MenuItem
              eventKey="G92 X0 Y0 Z0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Temporary Offsets (G92 X0 Y0 Z0)')}
            </MenuItem>
          )}
          {canCancelTempOffset && (
            <MenuItem
              eventKey="G92.1 X0 Y0 Z0"
              disabled={!canClick}
            >
              {i18n._('Un-Zero Out Temporary Offsets (G92.1 X0 Y0 Z0)')}
            </MenuItem>
          )}
          <MenuItem divider />
          <MenuItem header>{i18n._('Machine Coordinate System (G53)')}</MenuItem>
          {canGoToMachine && (
            <MenuItem
              eventKey="G53 G0 X0 Y0 Z0"
              disabled={!canClick}
            >
              {i18n._('Go To Machine Zero (G53 G0 X0 Y0 Z0)')}
            </MenuItem>
          )}
          {canZeroOutMachine && (
            <MenuItem
              eventKey="G28.3 X0 Y0 Z0"
              disabled={!canClick}
            >
              {i18n._('Set Machine Zero (G28.3 X0 Y0 Z0)')}
            </MenuItem>
          )}
          <MenuItem
            eventKey={homingCommand}
            disabled={!canClick}
          >
            {i18n._('Home Machine ({{command}})', { command: homingCommand })}
          </MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const renderActionDropdownForAxisE = ({ wcs }) => {
    // TODO
    return null;
  };

  const renderActionDropdownForAxisX = ({ wcs }) => {
    const { canClick, controllerType } = context.state;
    const {
      canGoToWork,
      canSetWCSOffset,
      canZeroTempOffset,
      canCancelTempOffset,
      canGoToMachine,
      canZeroOutMachine,
    } = SUPPORTED_COMMANDS[controllerType] || {};
    const axisHomingCommand = getAxisHomeCommand(controllerType, 'X');

    return (
      <Dropdown
        disabled={!canClick}
        onSelect={handleSelect}
      >
        <Dropdown.Toggle
          aria-label="X axis actions"
          className={styles.actionDropdown}
          btnStyle="link"
          compact
          noCaret
        >
          <i aria-hidden="true" className="fa fa-fw fa-ellipsis-v" />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {wcs === 'G54' &&
            <MenuItem header>{i18n._('Work Coordinate System (G54)')}</MenuItem>}
          {wcs === 'G55' &&
            <MenuItem header>{i18n._('Work Coordinate System (G55)')}</MenuItem>}
          {wcs === 'G56' &&
            <MenuItem header>{i18n._('Work Coordinate System (G56)')}</MenuItem>}
          {wcs === 'G57' &&
            <MenuItem header>{i18n._('Work Coordinate System (G57)')}</MenuItem>}
          {wcs === 'G58' &&
            <MenuItem header>{i18n._('Work Coordinate System (G58)')}</MenuItem>}
          {wcs === 'G59' &&
            <MenuItem header>{i18n._('Work Coordinate System (G59)')}</MenuItem>}
          {canGoToWork && (
            <MenuItem
              eventKey="G0 X0"
              disabled={!canClick}
            >
              {i18n._('Go To Work Zero On X Axis (G0 X0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G54' && (
            <MenuItem
              eventKey="G10 L20 P1 X0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work X Axis (G10 L20 P1 X0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G55' && (
            <MenuItem
              eventKey="G10 L20 P2 X0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work X Axis (G10 L20 P2 X0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G56' && (
            <MenuItem
              eventKey="G10 L20 P3 X0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work X Axis (G10 L20 P3 X0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G57' && (
            <MenuItem
              eventKey="G10 L20 P4 X0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work X Axis (G10 L20 P4 X0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G58' && (
            <MenuItem
              eventKey="G10 L20 P5 X0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work X Axis (G10 L20 P5 X0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G59' && (
            <MenuItem
              eventKey="G10 L20 P6 X0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work X Axis (G10 L20 P6 X0)')}
            </MenuItem>
          )}
          <MenuItem divider />
          <MenuItem header>{i18n._('Temporary Offsets (G92)')}</MenuItem>
          {canZeroTempOffset && (
            <MenuItem
              eventKey="G92 X0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Temporary X Axis (G92 X0)')}
            </MenuItem>
          )}
          {canCancelTempOffset && (
            <MenuItem
              eventKey="G92.1 X0"
              disabled={!canClick}
            >
              {i18n._('Un-Zero Out Temporary X Axis (G92.1 X0)')}
            </MenuItem>
          )}
          <MenuItem divider />
          <MenuItem header>{i18n._('Machine Coordinate System (G53)')}</MenuItem>
          {canGoToMachine && (
            <MenuItem
              eventKey="G53 G0 X0"
              disabled={!canClick}
            >
              {i18n._('Go To Machine Zero On X Axis (G53 G0 X0)')}
            </MenuItem>
          )}
          {canZeroOutMachine && (
            <MenuItem
              eventKey="G28.3 X0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Machine X Axis (G28.3 X0)')}
            </MenuItem>
          )}
          <MenuItem
            eventKey={axisHomingCommand}
            disabled={!canClick}
          >
            {i18n._('Home Machine X Axis ({{command}})', { command: axisHomingCommand })}
          </MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const renderActionDropdownForAxisY = ({ wcs }) => {
    const { canClick, controllerType } = context.state;
    const {
      canGoToWork,
      canSetWCSOffset,
      canZeroTempOffset,
      canCancelTempOffset,
      canGoToMachine,
      canZeroOutMachine,
    } = SUPPORTED_COMMANDS[controllerType] || {};
    const axisHomingCommand = getAxisHomeCommand(controllerType, 'Y');

    return (
      <Dropdown
        disabled={!canClick}
        onSelect={handleSelect}
      >
        <Dropdown.Toggle
          aria-label="Y axis actions"
          className={styles.actionDropdown}
          btnStyle="link"
          compact
          noCaret
        >
          <i aria-hidden="true" className="fa fa-fw fa-ellipsis-v" />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {wcs === 'G54' &&
            <MenuItem header>{i18n._('Work Coordinate System (G54)')}</MenuItem>}
          {wcs === 'G55' &&
            <MenuItem header>{i18n._('Work Coordinate System (G55)')}</MenuItem>}
          {wcs === 'G56' &&
            <MenuItem header>{i18n._('Work Coordinate System (G56)')}</MenuItem>}
          {wcs === 'G57' &&
            <MenuItem header>{i18n._('Work Coordinate System (G57)')}</MenuItem>}
          {wcs === 'G58' &&
            <MenuItem header>{i18n._('Work Coordinate System (G58)')}</MenuItem>}
          {wcs === 'G59' &&
            <MenuItem header>{i18n._('Work Coordinate System (G59)')}</MenuItem>}
          {canGoToWork && (
            <MenuItem
              eventKey="G0 Y0"
              disabled={!canClick}
            >
              {i18n._('Go To Work Zero On Y Axis (G0 Y0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G54' && (
            <MenuItem
              eventKey="G10 L20 P1 Y0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work Y Axis (G10 L20 P1 Y0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G55' && (
            <MenuItem
              eventKey="G10 L20 P2 Y0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work Y Axis (G10 L20 P2 Y0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G56' && (
            <MenuItem
              eventKey="G10 L20 P3 Y0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work Y Axis (G10 L20 P3 Y0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G57' && (
            <MenuItem
              eventKey="G10 L20 P4 Y0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work Y Axis (G10 L20 P4 Y0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G58' && (
            <MenuItem
              eventKey="G10 L20 P5 Y0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work Y Axis (G10 L20 P5 Y0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G59' && (
            <MenuItem
              eventKey="G10 L20 P6 Y0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work Y Axis (G10 L20 P6 Y0)')}
            </MenuItem>
          )}
          <MenuItem divider />
          <MenuItem header>{i18n._('Temporary Offsets (G92)')}</MenuItem>
          {canZeroTempOffset && (
            <MenuItem
              eventKey="G92 Y0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Temporary Y Axis (G92 Y0)')}
            </MenuItem>
          )}
          {canCancelTempOffset && (
            <MenuItem
              eventKey="G92.1 Y0"
              disabled={!canClick}
            >
              {i18n._('Un-Zero Out Temporary Y Axis (G92.1 Y0)')}
            </MenuItem>
          )}
          <MenuItem divider />
          <MenuItem header>{i18n._('Machine Coordinate System (G53)')}</MenuItem>
          {canGoToMachine && (
            <MenuItem
              eventKey="G53 G0 Y0"
              disabled={!canClick}
            >
              {i18n._('Go To Machine Zero On Y Axis (G53 G0 Y0)')}
            </MenuItem>
          )}
          {canZeroOutMachine && (
            <MenuItem
              eventKey="G28.3 Y0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Machine Y Axis (G28.3 Y0)')}
            </MenuItem>
          )}
          <MenuItem
            eventKey={axisHomingCommand}
            disabled={!canClick}
          >
            {i18n._('Home Machine Y Axis ({{command}})', { command: axisHomingCommand })}
          </MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const renderActionDropdownForAxisZ = ({ wcs }) => {
    const { canClick, controllerType } = context.state;
    const {
      canGoToWork,
      canSetWCSOffset,
      canZeroTempOffset,
      canCancelTempOffset,
      canGoToMachine,
      canZeroOutMachine,
    } = SUPPORTED_COMMANDS[controllerType] || {};
    const axisHomingCommand = getAxisHomeCommand(controllerType, 'Z');

    return (
      <Dropdown
        disabled={!canClick}
        onSelect={handleSelect}
      >
        <Dropdown.Toggle
          aria-label="Z axis actions"
          className={styles.actionDropdown}
          btnStyle="link"
          compact
          noCaret
        >
          <i aria-hidden="true" className="fa fa-fw fa-ellipsis-v" />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {wcs === 'G54' &&
            <MenuItem header>{i18n._('Work Coordinate System (G54)')}</MenuItem>}
          {wcs === 'G55' &&
            <MenuItem header>{i18n._('Work Coordinate System (G55)')}</MenuItem>}
          {wcs === 'G56' &&
            <MenuItem header>{i18n._('Work Coordinate System (G56)')}</MenuItem>}
          {wcs === 'G57' &&
            <MenuItem header>{i18n._('Work Coordinate System (G57)')}</MenuItem>}
          {wcs === 'G58' &&
            <MenuItem header>{i18n._('Work Coordinate System (G58)')}</MenuItem>}
          {wcs === 'G59' &&
            <MenuItem header>{i18n._('Work Coordinate System (G59)')}</MenuItem>}
          {canGoToWork && (
            <MenuItem
              eventKey="G0 Z0"
              disabled={!canClick}
            >
              {i18n._('Go To Work Zero On Z Axis (G0 Z0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G54' && (
            <MenuItem
              eventKey="G10 L20 P1 Z0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work Z Axis (G10 L20 P1 Z0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G55' && (
            <MenuItem
              eventKey="G10 L20 P2 Z0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work Z Axis (G10 L20 P2 Z0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G56' && (
            <MenuItem
              eventKey="G10 L20 P3 Z0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work Z Axis (G10 L20 P3 Z0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G57' && (
            <MenuItem
              eventKey="G10 L20 P4 Z0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work Z Axis (G10 L20 P4 Z0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G58' && (
            <MenuItem
              eventKey="G10 L20 P5 Z0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work Z Axis (G10 L20 P5 Z0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G59' && (
            <MenuItem
              eventKey="G10 L20 P6 Z0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work Z Axis (G10 L20 P6 Z0)')}
            </MenuItem>
          )}
          <MenuItem divider />
          <MenuItem header>{i18n._('Temporary Offsets (G92)')}</MenuItem>
          {canZeroTempOffset && (
            <MenuItem
              eventKey="G92 Z0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Temporary Z Axis (G92 Z0)')}
            </MenuItem>
          )}
          {canCancelTempOffset && (
            <MenuItem
              eventKey="G92.1 Z0"
              disabled={!canClick}
            >
              {i18n._('Un-Zero Out Temporary Z Axis (G92.1 Z0)')}
            </MenuItem>
          )}
          <MenuItem divider />
          <MenuItem header>{i18n._('Machine Coordinate System (G53)')}</MenuItem>
          {canGoToMachine && (
            <MenuItem
              eventKey="G53 G0 Z0"
              disabled={!canClick}
            >
              {i18n._('Go To Machine Zero On Z Axis (G53 G0 Z0)')}
            </MenuItem>
          )}
          {canZeroOutMachine && (
            <MenuItem
              eventKey="G28.3 Z0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Machine Z Axis (G28.3 Z0)')}
            </MenuItem>
          )}
          <MenuItem
            eventKey={axisHomingCommand}
            disabled={!canClick}
          >
            {i18n._('Home Machine Z Axis ({{command}})', { command: axisHomingCommand })}
          </MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const renderActionDropdownForAxisA = ({ wcs }) => {
    const { canClick, controllerType } = context.state;
    const {
      canGoToWork,
      canSetWCSOffset,
      canZeroTempOffset,
      canCancelTempOffset,
      canGoToMachine,
      canZeroOutMachine,
    } = SUPPORTED_COMMANDS[controllerType] || {};
    const axisHomingCommand = getAxisHomeCommand(controllerType, 'A');

    return (
      <Dropdown
        disabled={!canClick}
        onSelect={handleSelect}
      >
        <Dropdown.Toggle
          aria-label="A axis actions"
          className={styles.actionDropdown}
          btnStyle="link"
          compact
          noCaret
        >
          <i aria-hidden="true" className="fa fa-fw fa-ellipsis-v" />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {wcs === 'G54' &&
            <MenuItem header>{i18n._('Work Coordinate System (G54)')}</MenuItem>}
          {wcs === 'G55' &&
            <MenuItem header>{i18n._('Work Coordinate System (G55)')}</MenuItem>}
          {wcs === 'G56' &&
            <MenuItem header>{i18n._('Work Coordinate System (G56)')}</MenuItem>}
          {wcs === 'G57' &&
            <MenuItem header>{i18n._('Work Coordinate System (G57)')}</MenuItem>}
          {wcs === 'G58' &&
            <MenuItem header>{i18n._('Work Coordinate System (G58)')}</MenuItem>}
          {wcs === 'G59' &&
            <MenuItem header>{i18n._('Work Coordinate System (G59)')}</MenuItem>}
          {canGoToWork && (
            <MenuItem
              eventKey="G0 A0"
              disabled={!canClick}
            >
              {i18n._('Go To Work Zero On A Axis (G0 A0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G54' && (
            <MenuItem
              eventKey="G10 L20 P1 A0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work A Axis (G10 L20 P1 A0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G55' && (
            <MenuItem
              eventKey="G10 L20 P2 A0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work A Axis (G10 L20 P2 A0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G56' && (
            <MenuItem
              eventKey="G10 L20 P3 A0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work A Axis (G10 L20 P3 A0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G57' && (
            <MenuItem
              eventKey="G10 L20 P4 A0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work A Axis (G10 L20 P4 A0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G58' && (
            <MenuItem
              eventKey="G10 L20 P5 A0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work A Axis (G10 L20 P5 A0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G59' && (
            <MenuItem
              eventKey="G10 L20 P6 A0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work A Axis (G10 L20 P6 A0)')}
            </MenuItem>
          )}
          <MenuItem divider />
          <MenuItem header>{i18n._('Temporary Offsets (G92)')}</MenuItem>
          {canZeroTempOffset && (
            <MenuItem
              eventKey="G92 A0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Temporary A Axis (G92 A0)')}
            </MenuItem>
          )}
          {canCancelTempOffset && (
            <MenuItem
              eventKey="G92.1 A0"
              disabled={!canClick}
            >
              {i18n._('Un-Zero Out Temporary A Axis (G92.1 A0)')}
            </MenuItem>
          )}
          <MenuItem divider />
          <MenuItem header>{i18n._('Machine Coordinate System (G53)')}</MenuItem>
          {canGoToMachine && (
            <MenuItem
              eventKey="G53 G0 A0"
              disabled={!canClick}
            >
              {i18n._('Go To Machine Zero On A Axis (G53 G0 A0)')}
            </MenuItem>
          )}
          {canZeroOutMachine && (
            <MenuItem
              eventKey="G28.3 A0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Machine A Axis (G28.3 A0)')}
            </MenuItem>
          )}
          <MenuItem
            eventKey={axisHomingCommand}
            disabled={!canClick}
          >
            {i18n._('Home Machine A Axis ({{command}})', { command: axisHomingCommand })}
          </MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const renderActionDropdownForAxisB = ({ wcs }) => {
    const { canClick, controllerType } = context.state;
    const {
      canGoToWork,
      canSetWCSOffset,
      canZeroTempOffset,
      canCancelTempOffset,
      canGoToMachine,
      canZeroOutMachine,
    } = SUPPORTED_COMMANDS[controllerType] || {};
    const axisHomingCommand = getAxisHomeCommand(controllerType, 'B');

    return (
      <Dropdown
        disabled={!canClick}
        onSelect={handleSelect}
      >
        <Dropdown.Toggle
          aria-label="B axis actions"
          className={styles.actionDropdown}
          btnStyle="link"
          compact
          noCaret
        >
          <i aria-hidden="true" className="fa fa-fw fa-ellipsis-v" />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {wcs === 'G54' &&
            <MenuItem header>{i18n._('Work Coordinate System (G54)')}</MenuItem>}
          {wcs === 'G55' &&
            <MenuItem header>{i18n._('Work Coordinate System (G55)')}</MenuItem>}
          {wcs === 'G56' &&
            <MenuItem header>{i18n._('Work Coordinate System (G56)')}</MenuItem>}
          {wcs === 'G57' &&
            <MenuItem header>{i18n._('Work Coordinate System (G57)')}</MenuItem>}
          {wcs === 'G58' &&
            <MenuItem header>{i18n._('Work Coordinate System (G58)')}</MenuItem>}
          {wcs === 'G59' &&
            <MenuItem header>{i18n._('Work Coordinate System (G59)')}</MenuItem>}
          {canGoToWork && (
            <MenuItem
              eventKey="G0 B0"
              disabled={!canClick}
            >
              {i18n._('Go To Work Zero On B Axis (G0 B0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G54' && (
            <MenuItem
              eventKey="G10 L20 P1 B0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work B Axis (G10 L20 P1 B0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G55' && (
            <MenuItem
              eventKey="G10 L20 P2 B0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work B Axis (G10 L20 P2 B0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G56' && (
            <MenuItem
              eventKey="G10 L20 P3 B0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work B Axis (G10 L20 P3 B0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G57' && (
            <MenuItem
              eventKey="G10 L20 P4 B0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work B Axis (G10 L20 P4 B0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G58' && (
            <MenuItem
              eventKey="G10 L20 P5 B0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work B Axis (G10 L20 P5 B0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G59' && (
            <MenuItem
              eventKey="G10 L20 P6 B0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work B Axis (G10 L20 P6 B0)')}
            </MenuItem>
          )}
          <MenuItem divider />
          <MenuItem header>{i18n._('Temporary Offsets (G92)')}</MenuItem>
          {canZeroTempOffset && (
            <MenuItem
              eventKey="G92 B0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Temporary B Axis (G92 B0)')}
            </MenuItem>
          )}
          {canCancelTempOffset && (
            <MenuItem
              eventKey="G92.1 B0"
              disabled={!canClick}
            >
              {i18n._('Un-Zero Out Temporary B Axis (G92.1 B0)')}
            </MenuItem>
          )}
          <MenuItem divider />
          <MenuItem header>{i18n._('Machine Coordinate System (G53)')}</MenuItem>
          {canGoToMachine && (
            <MenuItem
              eventKey="G53 G0 B0"
              disabled={!canClick}
            >
              {i18n._('Go To Machine Zero On B Axis (G53 G0 B0)')}
            </MenuItem>
          )}
          {canZeroOutMachine && (
            <MenuItem
              eventKey="G28.3 B0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Machine B Axis (G28.3 B0)')}
            </MenuItem>
          )}
          <MenuItem
            eventKey={axisHomingCommand}
            disabled={!canClick}
          >
            {i18n._('Home Machine B Axis ({{command}})', { command: axisHomingCommand })}
          </MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const renderActionDropdownForAxisC = ({ wcs }) => {
    const { canClick, controllerType } = context.state;
    const {
      canGoToWork,
      canSetWCSOffset,
      canZeroTempOffset,
      canCancelTempOffset,
      canGoToMachine,
      canZeroOutMachine,
    } = SUPPORTED_COMMANDS[controllerType] || {};
    const axisHomingCommand = getAxisHomeCommand(controllerType, 'C');

    return (
      <Dropdown
        disabled={!canClick}
        onSelect={handleSelect}
      >
        <Dropdown.Toggle
          aria-label="C axis actions"
          className={styles.actionDropdown}
          btnStyle="link"
          compact
          noCaret
        >
          <i aria-hidden="true" className="fa fa-fw fa-ellipsis-v" />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {wcs === 'G54' &&
            <MenuItem header>{i18n._('Work Coordinate System (G54)')}</MenuItem>}
          {wcs === 'G55' &&
            <MenuItem header>{i18n._('Work Coordinate System (G55)')}</MenuItem>}
          {wcs === 'G56' &&
            <MenuItem header>{i18n._('Work Coordinate System (G56)')}</MenuItem>}
          {wcs === 'G57' &&
            <MenuItem header>{i18n._('Work Coordinate System (G57)')}</MenuItem>}
          {wcs === 'G58' &&
            <MenuItem header>{i18n._('Work Coordinate System (G58)')}</MenuItem>}
          {wcs === 'G59' &&
            <MenuItem header>{i18n._('Work Coordinate System (G59)')}</MenuItem>}
          {canGoToWork && (
            <MenuItem
              eventKey="G0 C0"
              disabled={!canClick}
            >
              {i18n._('Go To Work Zero On C Axis (G0 C0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G54' && (
            <MenuItem
              eventKey="G10 L20 P1 C0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work C Axis (G10 L20 P1 C0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G55' && (
            <MenuItem
              eventKey="G10 L20 P2 C0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work C Axis (G10 L20 P2 C0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G56' && (
            <MenuItem
              eventKey="G10 L20 P3 C0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work C Axis (G10 L20 P3 C0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G57' && (
            <MenuItem
              eventKey="G10 L20 P4 C0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work C Axis (G10 L20 P4 C0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G58' && (
            <MenuItem
              eventKey="G10 L20 P5 C0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work C Axis (G10 L20 P5 C0)')}
            </MenuItem>
          )}
          {canSetWCSOffset && wcs === 'G59' && (
            <MenuItem
              eventKey="G10 L20 P6 C0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Work C Axis (G10 L20 P6 C0)')}
            </MenuItem>
          )}
          <MenuItem divider />
          <MenuItem header>{i18n._('Temporary Offsets (G92)')}</MenuItem>
          {canZeroTempOffset && (
            <MenuItem
              eventKey="G92 C0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Temporary C Axis (G92 C0)')}
            </MenuItem>
          )}
          {canCancelTempOffset && (
            <MenuItem
              eventKey="G92.1 C0"
              disabled={!canClick}
            >
              {i18n._('Un-Zero Out Temporary C Axis (G92.1 C0)')}
            </MenuItem>
          )}
          <MenuItem divider />
          <MenuItem header>{i18n._('Machine Coordinate System (G53)')}</MenuItem>
          {canGoToMachine && (
            <MenuItem
              eventKey="G53 G0 C0"
              disabled={!canClick}
            >
              {i18n._('Go To Machine Zero On C Axis (G53 G0 C0)')}
            </MenuItem>
          )}
          {canZeroOutMachine && (
            <MenuItem
              eventKey="G28.3 C0"
              disabled={!canClick}
            >
              {i18n._('Zero Out Machine C Axis (G28.3 C0)')}
            </MenuItem>
          )}
          <MenuItem
            eventKey={axisHomingCommand}
            disabled={!canClick}
          >
            {i18n._('Home Machine C Axis ({{command}})', { command: axisHomingCommand })}
          </MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const renderAxis = (axis) => {
    const { canClick, units, machinePosition, workPosition, jog, controllerType, positionInput } = context.state;
    const supportedCommands = SUPPORTED_COMMANDS[controllerType] || {};
    const {
      onGetJogDistance,
      onGetWorkCoordinateSystem,
      onJog,
      onSetWorkOffsets,
    } = context;
    const wcs = onGetWorkCoordinateSystem();
    const lengthUnits = (units === METRIC_UNITS) ? i18n._('mm') : i18n._('in');
    const degreeUnits = i18n._('deg');
    const mpos = machinePosition[axis] || '0.000';
    const wpos = workPosition[axis] || '0.000';
    const axisLabel = axis.toUpperCase();
    const displayUnits = {
      [AXIS_E]: lengthUnits,
      [AXIS_X]: lengthUnits,
      [AXIS_Y]: lengthUnits,
      [AXIS_Z]: lengthUnits,
      [AXIS_A]: degreeUnits,
      [AXIS_B]: degreeUnits,
      [AXIS_C]: degreeUnits
    }[axis] || '';
    const renderActionDropdown = {
      [AXIS_E]: renderActionDropdownForAxisE,
      [AXIS_X]: renderActionDropdownForAxisX,
      [AXIS_Y]: renderActionDropdownForAxisY,
      [AXIS_Z]: renderActionDropdownForAxisZ,
      [AXIS_A]: renderActionDropdownForAxisA,
      [AXIS_B]: renderActionDropdownForAxisB,
      [AXIS_C]: renderActionDropdownForAxisC
    }[axis] || noop;
    const canZeroOutMachine = canClick && supportedCommands.canZeroOutMachine;
    const axisHomingCommand = getAxisHomeCommand(controllerType, axisLabel);
    const canMoveBackward = canClick;
    const canMoveForward = canClick;
    const canZeroOutWorkOffsets = canClick;
    const canModifyWorkPosition = canClick && positionInput?.axis !== axis;
    const isPositionInputVisible = canClick && positionInput?.axis === axis;
    const highlightAxis = canClick && (jog.keypad || jog.axis === axis);

    return (
      <tr>
        <td className={styles.coordinate}>
          <AxisLabel highlight={highlightAxis}>
            {axisLabel}
          </AxisLabel>
          <AxisSubscript>{displayUnits}</AxisSubscript>
        </td>
        <td className={styles.machinePosition}>
          <PositionLabel value={mpos} />
          <Taskbar>
            <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Tooltip
                label={i18n._('Zero Out Machine')}
                disabled={!canZeroOutMachine}
                closeOnClick
                enterDelay={0}
                placement="bottom"
              >
                <TaskbarButton
                  aria-label={`Go to zero: ${axisLabel}`}
                  disabled={!canZeroOutMachine}
                  onClick={() => {
                    controller.command('gcode', `G28.3 ${axisLabel}0`);
                  }}
                >
                  <Image src={iconPin} width="14" height="14" />
                </TaskbarButton>
              </Tooltip>
              <Tooltip
                label={i18n._('Home Machine')}
                disabled={!canClick}
                closeOnClick
                enterDelay={0}
                placement="bottom"
              >
                <TaskbarButton
                  aria-label={`Home: ${axisLabel}`}
                  disabled={!canClick}
                  onClick={() => {
                    controller.command('gcode', axisHomingCommand);
                  }}
                >
                  <Image src={iconHome} width="14" height="14" />
                </TaskbarButton>
              </Tooltip>
            </Box>
          </Taskbar>
        </td>
        <td className={styles.workPosition}>
          {isPositionInputVisible && (
            <PositionInput
              style={{ margin: '5px 0' }}
              value={positionInput.value}
              onChange={(value) => context.onSetPositionInput({ axis, value })}
              onSave={(value) => {
                onSetWorkOffsets(axis, value);
                hidePositionInput();
              }}
              onCancel={hidePositionInput}
            />
          )}
          {!isPositionInputVisible &&
            <PositionLabel value={wpos} />}
          <Taskbar>
            <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Tooltip
                label={i18n._('Move Backward')}
                disabled={!canMoveBackward}
                closeOnClick
                enterDelay={0}
                placement="bottom"
              >
                <TaskbarButton
                  aria-label={`Move ${axisLabel} backward`}
                  disabled={!canMoveBackward}
                  onClick={() => {
                    const distance = onGetJogDistance();
                    onJog({ [axis]: -distance });
                  }}
                >
                  <Image src={iconMinus} width="14" height="14" />
                </TaskbarButton>
              </Tooltip>
              <Tooltip
                label={i18n._('Move Forward')}
                disabled={!canMoveForward}
                closeOnClick
                enterDelay={0}
                placement="bottom"
              >
                <TaskbarButton
                  aria-label={`Move ${axisLabel} forward`}
                  disabled={!canMoveForward}
                  onClick={() => {
                    const distance = onGetJogDistance();
                    onJog({ [axis]: distance });
                  }}
                >
                  <Image src={iconPlus} width="14" height="14" />
                </TaskbarButton>
              </Tooltip>
              <Tooltip
                label={i18n._('Zero Out Work Offsets')}
                disabled={!canZeroOutWorkOffsets}
                closeOnClick
                enterDelay={0}
                placement="bottom"
              >
                <TaskbarButton
                  aria-label={`Zero out ${axisLabel} work offsets`}
                  disabled={!canZeroOutWorkOffsets}
                  onClick={() => {
                    onSetWorkOffsets(axis, 0);
                  }}
                >
                  <Image src={iconPin} width="14" height="14" />
                </TaskbarButton>
              </Tooltip>
              <Tooltip
                label={i18n._('Set Work Offsets')}
                disabled={!canModifyWorkPosition}
                closeOnClick
                enterDelay={0}
                placement="bottom"
              >
                <TaskbarButton
                  aria-label={`Set ${axisLabel} work offsets`}
                  active={isPositionInputVisible}
                  disabled={!canModifyWorkPosition}
                  onClick={showPositionInput(axis, wpos)}
                >
                  <Image src={iconPencil} width="14" height="14" />
                </TaskbarButton>
              </Tooltip>
            </Box>
          </Taskbar>
        </td>
        <td className={styles.action}>
          {renderActionDropdown({ wcs })}
        </td>
      </tr>
    );
  };

  const { axes, machinePosition, workPosition } = context.state;
  const wcs = context.onGetWorkCoordinateSystem();
  const hasAxisE = (machinePosition.e !== undefined && workPosition.e !== undefined);
  const hasAxisX = includes(axes, AXIS_X);
  const hasAxisY = includes(axes, AXIS_Y);
  const hasAxisZ = includes(axes, AXIS_Z);
  const hasAxisA = includes(axes, AXIS_A);
  const hasAxisB = includes(axes, AXIS_B);
  const hasAxisC = includes(axes, AXIS_C);

  return (
    <Panel className={styles.displayPanel}>
      <table className="table-bordered">
        <thead>
          <tr>
            <th title={i18n._('Axis')}>{i18n._('Axis')}</th>
            <th title={i18n._('Machine Position')}>{i18n._('Machine Position')}</th>
            <th title={i18n._('Work Position')}>{i18n._('Work Position')}</th>
            <th className={styles.action}>
              {renderActionDropdown({ wcs })}
            </th>
          </tr>
        </thead>
        <tbody>
          {hasAxisE && renderAxis(AXIS_E)}
          {hasAxisX && renderAxis(AXIS_X)}
          {hasAxisY && renderAxis(AXIS_Y)}
          {hasAxisZ && renderAxis(AXIS_Z)}
          {hasAxisA && renderAxis(AXIS_A)}
          {hasAxisB && renderAxis(AXIS_B)}
          {hasAxisC && renderAxis(AXIS_C)}
        </tbody>
      </table>
    </Panel>
  );
}

export default DisplayPanel;
