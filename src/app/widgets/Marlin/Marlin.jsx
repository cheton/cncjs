import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Box,
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  LinearProgress,
  Space,
  Text,
} from '@tonic-ui/react';
import { ensureArray, ensurePositiveNumber } from 'ensure-type';
import _get from 'lodash/get';
import _mapValues from 'lodash/mapValues';
import React, { useRef } from 'react';
import controller from '@app/lib/controller';
import mapGCodeToText from '@app/lib/gcode-text';
import i18n from '@app/lib/i18n';
import FadeInOut from './FadeInOut';
import Overrides from './Overrides';
import IconExtruder from './icons/extruder';
import IconHeatedBed from './icons/heated-bed';

/**
 * @param {{
 *   actions: {
 *     changeExtruderTemperature: (event: React.ChangeEvent<HTMLInputElement>) => void,
 *     changeHeatedBedTemperature: (event: React.ChangeEvent<HTMLInputElement>) => void,
 *     setPanelExpanded: (panelName: string, isExpanded: boolean) => void,
 *   },
 *   state: object,
 * }} props
 */
function Marlin({ actions, state }) {
  const extruderPowerMax = useRef(127);
  const heatedBedPowerMax = useRef(127);
  const none = '–';
  const controllerState = state.controller.state || {};
  const ovF = _get(controllerState, 'ovF', 0);
  const ovS = _get(controllerState, 'ovS', 0);
  const feedrate = _get(controllerState, 'feedrate') || none;
  const spindle = _get(controllerState, 'spindle') || none;
  const extruder = _get(controllerState, 'extruder') || {};
  const heatedBed = _get(controllerState, 'heatedBed') || {};
  const showExtruderTemperature = extruder.deg !== undefined && extruder.degTarget !== undefined;
  const showExtruderPower = extruder.power !== undefined;
  const showHeatedBedTemperature = heatedBed.deg !== undefined && heatedBed.degTarget !== undefined;
  const showHeatedBedPower = heatedBed.power !== undefined;
  const showHeaterStatus = [
    showExtruderTemperature,
    showExtruderPower,
    showHeatedBedTemperature,
    showHeatedBedPower,
  ].some(Boolean);
  const modal = _mapValues(controllerState.modal || {}, mapGCodeToText);
  const extruderIsHeating = ensurePositiveNumber(extruder.degTarget) > ensurePositiveNumber(extruder.deg);
  const heatedBedIsHeating = ensurePositiveNumber(heatedBed.degTarget) > ensurePositiveNumber(heatedBed.deg);
  const extruderPower = ensurePositiveNumber(extruder.power);
  const heatedBedPower = ensurePositiveNumber(heatedBed.power);

  extruderPowerMax.current = Math.max(extruderPowerMax.current, extruderPower);
  heatedBedPowerMax.current = Math.max(heatedBedPowerMax.current, heatedBedPower);

  return (
    <Box>
      <Overrides ovF={ovF} ovS={ovS} />
      <Box sx={{ '> :not(:first-child)': { borderTop: 0 } }}>
        <ReportSection
          isExpanded={state.panel.heaterControl.expanded}
          title={i18n._('Heater Control')}
          onToggle={({ isExpanded }) => actions.setPanelExpanded('heaterControl', isExpanded)}
        >
          <Box mb={showHeaterStatus ? '3x' : 0}>
            <HeaterInput
              icon={(
                <FadeInOut disabled={!extruderIsHeating} from={0.3} to={1}>
                  <IconExtruder color={extruderIsHeating ? '#000' : '#666'} size={24} />
                </FadeInOut>
              )}
              label={i18n._('Extruder')}
              value={state.heater.extruder}
              onChange={actions.changeExtruderTemperature}
              onCancel={() => setExtruderTemperature(0)}
              onSubmit={() => setExtruderTemperature(state.heater.extruder)}
              submitTitle={i18n._('Set the target temperature for the extruder')}
            />
            <HeaterInput
              icon={(
                <FadeInOut disabled={!heatedBedIsHeating} from={0.3} to={1}>
                  <IconHeatedBed color={heatedBedIsHeating ? '#000' : '#666'} size={24} />
                </FadeInOut>
              )}
              label={i18n._('Heated Bed')}
              value={state.heater.heatedBed}
              onChange={actions.changeHeatedBedTemperature}
              onCancel={() => setHeatedBedTemperature(0)}
              onSubmit={() => setHeatedBedTemperature(state.heater.heatedBed)}
              submitTitle={i18n._('Set the target temperature for the heated bed')}
            />
          </Box>
          {showExtruderTemperature && (
            <ReportRow label={i18n._('Extruder Temperature')}>
              {`${extruder.deg}°C / ${extruder.degTarget}°C`}
            </ReportRow>
          )}
          {showHeatedBedTemperature && (
            <ReportRow label={i18n._('Heated Bed Temperature')}>
              {`${heatedBed.deg}°C / ${heatedBed.degTarget}°C`}
            </ReportRow>
          )}
          {showExtruderPower && (
            <ReportRow label={i18n._('Extruder Power')}>
              <PowerProgress max={extruderPowerMax.current} value={extruderPower} />
            </ReportRow>
          )}
          {showHeatedBedPower && (
            <ReportRow label={i18n._('Heated Bed Power')}>
              <PowerProgress max={heatedBedPowerMax.current} value={heatedBedPower} />
            </ReportRow>
          )}
        </ReportSection>
        <ReportSection
          isExpanded={state.panel.statusReports.expanded}
          title={i18n._('Status Reports')}
          onToggle={({ isExpanded }) => actions.setPanelExpanded('statusReports', isExpanded)}
        >
          <ReportRow label={i18n._('Feed Rate')}>{feedrate}</ReportRow>
          <ReportRow label={i18n._('Spindle')}>{spindle}</ReportRow>
        </ReportSection>
        <ReportSection
          isExpanded={state.panel.modalGroups.expanded}
          title={i18n._('Modal Groups')}
          onToggle={({ isExpanded }) => actions.setPanelExpanded('modalGroups', isExpanded)}
        >
          <ReportRow label={i18n._('Motion')}>{modal.motion || none}</ReportRow>
          <ReportRow label={i18n._('Coordinate')}>{modal.wcs || none}</ReportRow>
          <ReportRow label={i18n._('Plane')}>{modal.plane || none}</ReportRow>
          <ReportRow label={i18n._('Distance')}>{modal.distance || none}</ReportRow>
          <ReportRow label={i18n._('Feed Rate')}>{modal.feedrate || none}</ReportRow>
          <ReportRow label={i18n._('Units')}>{modal.units || none}</ReportRow>
          <ReportRow label={i18n._('Program')}>{modal.program || none}</ReportRow>
          <ReportRow label={i18n._('Spindle')}>{modal.spindle || none}</ReportRow>
          <ReportRow label={i18n._('Coolant')}>
            {ensureArray(modal.coolant).map(coolant => (
              <Box key={coolant} title={coolant}>{coolant || none}</Box>
            ))}
          </ReportRow>
        </ReportSection>
      </Box>
    </Box>
  );
}

function setExtruderTemperature(deg) {
  controller.command('gcode', `M104 S${deg}`);
  controller.command('gcode', 'M105');
}

function setHeatedBedTemperature(deg) {
  controller.command('gcode', `M140 S${deg}`);
  controller.command('gcode', 'M105');
}

/**
 * @param {{ children?: React.ReactNode, isExpanded: boolean, onToggle: Function, title: string }} props
 */
function ReportSection({ children, isExpanded, onToggle, title }) {
  return (
    <Accordion>
      <AccordionItem isExpanded={isExpanded} onToggle={onToggle}>
        <AccordionHeader>{title}</AccordionHeader>
        <AccordionBody>{children}</AccordionBody>
      </AccordionItem>
    </Accordion>
  );
}

/**
 * @param {{ children?: React.ReactNode, label: string }} props
 */
function ReportRow({ children, label }) {
  return (
    <Box alignItems="center" display="flex" mb="1x">
      <Text
        flex="0 0 40%" overflow="hidden" textOverflow="ellipsis"
        title={label} whiteSpace="nowrap"
      >
        {label}
      </Text>
      <Box
        flex="1"
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          borderRadius: '.25rem',
          fontSize: '.75rem',
          minHeight: '22px',
          overflow: 'hidden',
          padding: '.125rem .5rem',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

/**
 * @param {{ max: number, value: number }} props
 */
function PowerProgress({ max, value }) {
  return (
    <Box position="relative">
      <LinearProgress
        aria-label={String(value)} max={max} min={0}
        value={value} variant="determinate"
      />
      <Text
        left="2x" position="absolute" top="50%"
        transform="translateY(-50%)"
      >{value}
      </Text>
    </Box>
  );
}

/**
 * @param {{
 *   icon: React.ReactNode,
 *   label: string,
 *   onCancel: () => void,
 *   onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
 *   onSubmit: () => void,
 *   submitTitle: string,
 *   value: number | string,
 * }} props
 */
function HeaterInput({ icon, label, onCancel, onChange, onSubmit, submitTitle, value }) {
  return (
    <Box alignItems="center" display="flex" mb="2x">
      <Box alignItems="center" display="flex" flex="1">
        {icon}
        <Space width="2x" />
        <Text>{label}</Text>
      </Box>
      <InputGroup size="sm" width="120px">
        <Input
          aria-label={label} min="0" step="1"
          type="number" value={value} onChange={onChange}
        />
        <InputGroupAddon>{i18n._('°C')}</InputGroupAddon>
      </InputGroup>
      <Space width="2x" />
      <Button
        disabled={!Number.isFinite(value)} size="xs" title={submitTitle}
        onClick={onSubmit}
      >
        <i aria-hidden="true" className="fa fa-fw fa-check" />
      </Button>
      <Space width="2x" />
      <Button
        size="xs" title={i18n._('Cancel')} variant="ghost"
        onClick={onCancel}
      >
        <i aria-hidden="true" className="fa fa-fw fa-close" />
      </Button>
    </Box>
  );
}

export default Marlin;
