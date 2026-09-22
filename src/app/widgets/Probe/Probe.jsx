import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormHelperText,
  Input,
  InputGroup,
  InputGroupAddon,
  Space,
  TextLabel,
  Tooltip,
} from '@tonic-ui/react';
import _get from 'lodash/get';
import _includes from 'lodash/includes';
import React from 'react';
import { Field, Form, FormSpy } from 'react-final-form';
import { connect } from 'react-redux';
import { IMPERIAL_UNITS, METRIC_UNITS } from '@app/constants';
import { CONNECTION_STATE_CONNECTED } from '@app/constants/connection';
import { MACHINE_STATE_NONE, REFORMED_MACHINE_STATE_IDLE } from '@app/constants/controller';
import { WORKFLOW_STATE_IDLE } from '@app/constants/workflow';
import i18n from '@app/lib/i18n';
import portal from '@app/lib/portal';
import { in2mm, mapValueToUnits } from '@app/lib/units';
import useWidgetConfig from '@app/widgets/shared/useWidgetConfig';
import { composeValidators, minValue, required } from '@app/widgets/shared/validations';
import ProbeModal from './modals/ProbeModal';

const mapProbeCommandToDescription = probeCommand => ({
  'G38.2': i18n._('G38.2 probe toward workpiece, stop on contact, signal error if failure'),
  'G38.3': i18n._('G38.3 probe toward workpiece, stop on contact'),
  'G38.4': i18n._('G38.4 probe away from workpiece, stop on loss of contact, signal error if failure'),
  'G38.5': i18n._('G38.5 probe away from workpiece, stop on loss of contact'),
}[probeCommand] || '');

function Probe({ isActionable, units, wcs }) {
  const config = useWidgetConfig();
  const initialValues = {
    probeAxis: config.get('probeAxis', 'Z'),
    probeCommand: config.get('probeCommand', 'G38.2'),
    probeDepth: mapValueToUnits(config.get('probeDepth'), units),
    probeFeedrate: mapValueToUnits(config.get('probeFeedrate'), units),
    touchPlateHeight: mapValueToUnits(config.get('touchPlateHeight'), units),
    retractionDistance: mapValueToUnits(config.get('retractionDistance'), units),
  };
  const displayUnits = units === METRIC_UNITS ? i18n._('mm') : i18n._('in');
  const feedrateUnits = units === METRIC_UNITS ? i18n._('mm/min') : i18n._('in/min');
  const step = units === METRIC_UNITS ? 1 : 0.1;
  const openProbeModal = probeData => {
    portal(({ onClose }) => (
      <ProbeModal onClose={onClose} probeData={probeData} />
    ));
  };
  const renderNumberField = ({ name, label, unit }) => (
    <Field name={name} validate={composeValidators(required, minValue(0))}>
      {({ input, meta }) => {
        const changeValue = event => {
          const value = event.target.value;
          input.onChange(value);
          const metricValue = Number(units === IMPERIAL_UNITS ? in2mm(value) : value);
          if (Number.isFinite(metricValue) && metricValue >= 0) {
            config.set(name, metricValue);
          }
        };

        return (
          <FormControl>
            <TextLabel htmlFor={name} mb="2x">{label}</TextLabel>
            <InputGroup size="sm">
              <Input
                {...input}
                aria-label={label}
                id={name}
                min={0}
                step={step}
                type="number"
                onChange={changeValue}
              />
              <InputGroupAddon>{unit}</InputGroupAddon>
            </InputGroup>
            {(meta.error && meta.touched) && <FormHelperText>{meta.error}</FormHelperText>}
          </FormControl>
        );
      }}
    </Field>
  );

  return (
    <Form
      initialValues={initialValues}
      subscription={{}}
      onSubmit={values => {
        const {
          probeAxis,
          probeCommand,
          probeDepth,
          probeFeedrate,
          touchPlateHeight,
          retractionDistance,
        } = values;
        openProbeModal({
          probeAxis,
          probeCommand,
          probeDepth,
          probeFeedrate,
          touchPlateHeight,
          retractionDistance,
          wcs,
        });
      }}
    >
      {({ form }) => (
        <Box>
          <Box mb="4x">
            <Field name="probeAxis">
              {({ input }) => {
                const probeAxis = input.value;
                const changeValue = value => () => {
                  input.onChange(value);
                  config.set('probeAxis', value);
                };

                return (
                  <FormControl>
                    <TextLabel mb="2x">{i18n._('Probe Axis')}</TextLabel>
                    <ButtonGroup size="sm" sx={{ minWidth: '50%' }}>
                      {['Z', 'X', 'Y'].map(axis => (
                        <Button
                          key={axis}
                          selected={probeAxis === axis}
                          title={i18n._(`Probe ${axis} axis`)}
                          onClick={changeValue(axis)}
                        >
                          {axis}
                        </Button>
                      ))}
                    </ButtonGroup>
                  </FormControl>
                );
              }}
            </Field>
          </Box>
          <Box mb="4x">
            <Field name="probeCommand">
              {({ input }) => {
                const probeCommand = input.value;
                const changeValue = value => () => {
                  input.onChange(value);
                  config.set('probeCommand', value);
                };

                return (
                  <FormControl>
                    <Box alignItems="center" display="flex" mb="2x">
                      <TextLabel>{i18n._('Probe Command: {{probeCommand}}', { probeCommand })}</TextLabel>
                      <Space width={8} />
                      <Tooltip label={mapProbeCommandToDescription(probeCommand)} shouldWrapChildren>
                        <Box
                          as="span"
                          className="fa-layers fa-fw"
                          sx={{ color: '#222', cursor: 'help', opacity: 0.5 }}
                        >
                          <FontAwesomeIcon icon={['far', 'circle']} />
                          <FontAwesomeIcon icon="info" transform="shrink-8" />
                        </Box>
                      </Tooltip>
                    </Box>
                    <ButtonGroup size="sm" sx={{ minWidth: '80%' }}>
                      {['G38.2', 'G38.3', 'G38.4', 'G38.5'].map(command => (
                        <Button
                          key={command}
                          selected={probeCommand === command}
                          title={mapProbeCommandToDescription(command)}
                          onClick={changeValue(command)}
                        >
                          {command}
                        </Button>
                      ))}
                    </ButtonGroup>
                  </FormControl>
                );
              }}
            </Field>
          </Box>
          <Box mb="4x">{renderNumberField({ name: 'probeDepth', label: i18n._('Probe Depth'), unit: displayUnits })}</Box>
          <Box mb="4x">{renderNumberField({ name: 'probeFeedrate', label: i18n._('Probe Feedrate'), unit: feedrateUnits })}</Box>
          <Box mb="4x">{renderNumberField({ name: 'touchPlateHeight', label: i18n._('Touch Plate Thickness'), unit: displayUnits })}</Box>
          <Box mb="4x">{renderNumberField({ name: 'retractionDistance', label: i18n._('Retraction Distance'), unit: displayUnits })}</Box>
          <FormSpy subscription={{ invalid: true, values: true }}>
            {({ values, invalid }) => {
              const probeAxis = _get(values, 'probeAxis');
              return (
                <Box mb="2x">
                  <Button
                    disabled={!isActionable || invalid}
                    size="md"
                    variant="secondary"
                    onClick={() => form.submit()}
                  >
                    {i18n._('Probe Axis {{axis}}', { axis: probeAxis })}
                  </Button>
                </Box>
              );
            }}
          </FormSpy>
        </Box>
      )}
    </Form>
  );
}

export default connect(store => {
  const isActionable = (() => {
    if (_get(store, 'connection.state') !== CONNECTION_STATE_CONNECTED) {
      return false;
    }
    if (_get(store, 'controller.workflow.state') !== WORKFLOW_STATE_IDLE) {
      return false;
    }
    return _includes([
      MACHINE_STATE_NONE,
      REFORMED_MACHINE_STATE_IDLE,
    ], _get(store, 'controller.reformedMachineState'));
  })();
  const modalUnits = _get(store, 'controller.modal.units');
  const units = {
    G20: IMPERIAL_UNITS,
    G21: METRIC_UNITS,
  }[modalUnits];
  const wcs = _get(store, 'controller.modal.wcs') || 'G54';

  return { isActionable, units, wcs };
})(Probe);
