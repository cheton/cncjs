import {
  Box, Button, ButtonGroup, FormControl, FormInput, FormLabel, FormTextarea,
  Image, InputGroup, InputGroupAddon, Menu, MenuButton, MenuItem, MenuList,
  Select, Text, Tooltip,
} from '@tonic-ui/react';
import { ensureNumber, ensureString } from 'ensure-type';
import React, { useEffect, useRef, useState } from 'react';
import { Field, Form, FormSpy } from 'react-final-form';
import { METRIC_UNITS } from '@app/constants';
import { GRBL, MARLIN, SMOOTHIE, TINYG } from '@app/constants/controller';
import i18n from '@app/lib/i18n';
import { mapValueToUnits } from '@app/lib/units';
import {
  TOOL_CHANGE_POLICY_IGNORE_M6_COMMANDS,
  TOOL_CHANGE_POLICY_MANUAL_TOOL_CHANGE_CUSTOM_PROBING,
  TOOL_CHANGE_POLICY_MANUAL_TOOL_CHANGE_TLO,
  TOOL_CHANGE_POLICY_MANUAL_TOOL_CHANGE_WCS,
  TOOL_CHANGE_POLICY_SEND_M6_COMMANDS,
} from './constants';
import iconPin from './images/pin.svg';
import insertAtCaret from './insertAtCaret';
import variables from './variables';

const TOOL_PROBE_OVERRIDE_WCS_EXAMPLE = `
; Probe the tool
G91 [tool_probe_command] F[tool_probe_feedrate] Z[tool_probe_z - mposz - tool_probe_distance]
; Set coordinate system offset
G10 L20 P[mapWCSToPValue(modal.wcs)] Z[touch_plate_height]
`.trim();
const TOOL_PROBE_OVERRIDE_TLO_EXAMPLE = `
; Probe the tool
G91 [tool_probe_command] F[tool_probe_feedrate] Z[tool_probe_z - mposz - tool_probe_distance]
; Pause for 1 second
%wait 1
; Set tool length offset
G43.1 Z[posz - touch_plate_height]
`.trim();

const copyToClipboard = value => {
  const el = document.createElement('textarea');
  el.value = value;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  const selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false;
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  if (selected) {
    document.getSelection().removeAllRanges();
    document.getSelection().addRange(selected);
  }
};

export const getToolProbeCommands = (controllerType, toolChangePolicy) => {
  const lines = ['; Probe the tool'];
  if (controllerType === MARLIN) {
    lines.push('G91 [tool_probe_command] F[tool_probe_feedrate] Z[tool_probe_z - posz - tool_probe_distance]');
    if (toolChangePolicy === TOOL_CHANGE_POLICY_MANUAL_TOOL_CHANGE_WCS) {
      lines.push('; Set the current work Z position (posz) to the touch plate height');
      lines.push('G92 Z[touch_plate_height]');
    } else if (toolChangePolicy === TOOL_CHANGE_POLICY_MANUAL_TOOL_CHANGE_TLO) {
      lines.push('; Pause for 1 second');
      lines.push('%wait 1');
      lines.push('; Adjust the work Z position by subtracting the touch plate height from the current work Z position (posz)');
      lines.push('G92 Z[posz - touch_plate_height]');
    }
    return lines.join('\n');
  }
  if ([GRBL, SMOOTHIE, TINYG].includes(controllerType)) {
    lines.push('G91 [tool_probe_command] F[tool_probe_feedrate] Z[tool_probe_z - mposz - tool_probe_distance]');
    if (toolChangePolicy === TOOL_CHANGE_POLICY_MANUAL_TOOL_CHANGE_WCS) {
      lines.push('; Set coordinate system offset');
      lines.push('G10 L20 P[mapWCSToPValue(modal.wcs)] Z[touch_plate_height]');
    } else if (toolChangePolicy === TOOL_CHANGE_POLICY_MANUAL_TOOL_CHANGE_TLO) {
      lines.push('; Pause for 1 second');
      lines.push('%wait 1');
      lines.push('; Set tool length offset');
      lines.push(controllerType === TINYG ? '{tofz:[posz - touch_plate_height]}' : 'G43.1 Z[posz - touch_plate_height]');
    }
    return lines.join('\n');
  }
  return '';
};

const policyOptions = [
  [TOOL_CHANGE_POLICY_IGNORE_M6_COMMANDS, 'Ignore M6 commands (Default)'],
  [TOOL_CHANGE_POLICY_SEND_M6_COMMANDS, 'Send M6 commands'],
  [TOOL_CHANGE_POLICY_MANUAL_TOOL_CHANGE_WCS, 'Manual Tool Change (WCS)'],
  [TOOL_CHANGE_POLICY_MANUAL_TOOL_CHANGE_TLO, 'Manual Tool Change (TLO)'],
  [TOOL_CHANGE_POLICY_MANUAL_TOOL_CHANGE_CUSTOM_PROBING, 'Manual Tool Change (Custom Probing)'],
];

/**
 * @param {{canClick?: boolean, connected?: boolean, controller?: object, machinePosition?: object, units?: string, value?: object, onChange?: Function}} props
 */
function Tool({
  canClick = false,
  connected = false,
  controller = {},
  machinePosition = {},
  units = METRIC_UNITS,
  value = null,
  onChange = () => {},
}) {
  const [editable, setEditable] = useState(false);
  const [customCommands, setCustomCommands] = useState('');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  if (!value) {
    return <Box color="gray:60">{i18n._('No available tool configuration')}</Box>;
  }

  const displayUnits = units === METRIC_UNITS ? i18n._('mm') : i18n._('in');
  const feedrateUnits = units === METRIC_UNITS ? i18n._('mm/min') : i18n._('in/min');
  const step = units === METRIC_UNITS ? 1 : 1 / 16;
  const policy = value.toolChangePolicy;
  const isManual = [
    TOOL_CHANGE_POLICY_MANUAL_TOOL_CHANGE_WCS,
    TOOL_CHANGE_POLICY_MANUAL_TOOL_CHANGE_TLO,
    TOOL_CHANGE_POLICY_MANUAL_TOOL_CHANGE_CUSTOM_PROBING,
  ].includes(policy);
  const isDefaultProbe = [
    TOOL_CHANGE_POLICY_MANUAL_TOOL_CHANGE_WCS,
    TOOL_CHANGE_POLICY_MANUAL_TOOL_CHANGE_TLO,
  ].includes(policy);
  const isCustomProbe = policy === TOOL_CHANGE_POLICY_MANUAL_TOOL_CHANGE_CUSTOM_PROBING;
  const commands = getToolProbeCommands(controller.type, policy);

  const numberField = (name, label, unit, change) => (
    <Field name={name}>{({ input }) => (
      <FormControl>
        <FormLabel>{label}</FormLabel>
        <InputGroup size="sm">
          <FormInput
            {...input} aria-label={label} min={0}
            step={step} type="number" onChange={event => change(input, event.target.value)}
          />
          <InputGroupAddon>{unit}</InputGroupAddon>
        </InputGroup>
      </FormControl>
    )}
    </Field>
  );

  return (
    <Form
      initialValues={value} keepDirtyOnReinitialize onSubmit={() => {}}
      subscription={{}}
    >
      {({ form }) => (
        <Box>
          <FormSpy subscription={{ values: true }} onChange={({ values }) => onChange(values)} />
          <Box mb="4x">
            <Field name="toolChangePolicy">{({ input }) => (
              <FormControl>
                <FormLabel>{i18n._('Tool Change Policy')}</FormLabel>
                <Select {...input} aria-label={i18n._('Tool Change Policy')} onChange={event => input.onChange(ensureNumber(event.target.value))}>
                  {policyOptions.map(([option, label]) => <option key={option} value={option}>{i18n._(label)}</option>)}
                </Select>
                {policy === TOOL_CHANGE_POLICY_IGNORE_M6_COMMANDS && <Text fontStyle="italic">{i18n._('This option skips the M6 command and pauses controller operations, giving you full manual control over the tool change process.')}</Text>}
                {policy === TOOL_CHANGE_POLICY_SEND_M6_COMMANDS && <Text fontStyle="italic">{i18n._('This will send the line exactly as it is to the controller.')}</Text>}
              </FormControl>
            )}
            </Field>
          </Box>
          {isManual && (
            <Box>
              <FormControl mb="4x">
                <FormLabel>{i18n._('Tool Change Position')}</FormLabel>
                {['x', 'y', 'z'].map(axis => (
                  <Field key={axis} name={`toolChange${axis.toUpperCase()}`}>{({ input }) => (
                    <InputGroup size="sm" mb="2x">
                      <InputGroupAddon>{axis.toUpperCase()}</InputGroupAddon>
                      <FormInput {...input} aria-label={i18n._(`Tool Change ${axis.toUpperCase()}`)} type="number" />
                      <InputGroupAddon>{displayUnits}</InputGroupAddon>
                      <Button
                        aria-label={i18n._(`Use machine ${axis.toUpperCase()} position`)} disabled={!canClick} onClick={() => machinePosition[axis] !== undefined && input.onChange(machinePosition[axis])}
                        variant="secondary"
                      >
                        <Image
                          alt="" height="14" src={iconPin}
                          width="14"
                        />
                      </Button>
                    </InputGroup>
                  )}
                  </Field>
                ))}
              </FormControl>
              <FormControl mb="4x">
                <FormLabel>{i18n._('Tool Probe Position')}</FormLabel>
                {['x', 'y', 'z'].map(axis => (
                  <Field key={axis} name={`toolProbe${axis.toUpperCase()}`}>{({ input }) => (
                    <InputGroup size="sm" mb="2x">
                      <InputGroupAddon>{axis.toUpperCase()}</InputGroupAddon>
                      <FormInput {...input} aria-label={i18n._(`Tool Probe ${axis.toUpperCase()}`)} type="number" />
                      <InputGroupAddon>{displayUnits}</InputGroupAddon>
                      <Button
                        aria-label={i18n._(`Use machine probe ${axis.toUpperCase()} position`)} disabled={!canClick} onClick={() => machinePosition[axis] !== undefined && input.onChange(machinePosition[axis])}
                        variant="secondary"
                      >
                        <Image
                          alt="" height="14" src={iconPin}
                          width="14"
                        />
                      </Button>
                    </InputGroup>
                  )}
                  </Field>
                ))}
              </FormControl>
              {isCustomProbe && (
                <FormControl mb="4x">
                  <Box alignItems="center" display="flex" gap="2x">
                    <FormLabel>{i18n._('Custom Tool Probe Commands')}</FormLabel>
                    {!editable && (
                      <Button
                        aria-label={i18n._('Edit custom tool probe commands')} onClick={() => {
                          setCustomCommands(ensureString(value.toolProbeCustomCommands)); setEditable(true);
                        }} size="sm"
                        variant="ghost"
                      ><i aria-hidden="true" className="fa fa-fw fa-edit" />
                      </Button>
                    )}
                  </Box>
                  {!editable && ensureString(value.toolProbeCustomCommands).length > 0 && <Text as="pre" maxHeight="150px" overflow="auto">{value.toolProbeCustomCommands}</Text>}
                  {!editable && ensureString(value.toolProbeCustomCommands).length === 0 && <Text color="red:60">{i18n._('Warning: No custom tool probe commands are defined')}</Text>}
                  {editable && (
                    <Box>
                      <Box mb="2x">
                        <Button onClick={() => setCustomCommands(TOOL_PROBE_OVERRIDE_WCS_EXAMPLE)} size="sm" variant="secondary">WCS</Button>
                        <Button
                          ml="2x" onClick={() => setCustomCommands(TOOL_PROBE_OVERRIDE_TLO_EXAMPLE)} size="sm"
                          variant="secondary"
                        >TLO
                        </Button>
                        <Menu placement="bottom-start">
                          <MenuButton ml="2x" size="sm" variant="secondary">
                            {i18n._('Insert variable')}
                          </MenuButton>
                          <MenuList maxHeight="180px" overflow="auto">
                            {variables.map(variable => (typeof variable === 'object' ? (
                              <Text
                                key={variable.text} color="gray:60" px="3x"
                                py="2x"
                              >{variable.text}
                              </Text>
                            ) : (
                              <MenuItem
                                key={variable} onClick={() => {
                                  const textarea = textareaRef.current; if (textarea) {
                                    insertAtCaret(textarea, variable); setCustomCommands(textarea.value);
                                  }
                                }}
                              >{variable}
                              </MenuItem>
                            )))}
                          </MenuList>
                        </Menu>
                      </Box>
                      <FormTextarea
                        aria-label={i18n._('Custom Tool Probe Commands')} ref={textareaRef} value={customCommands}
                        onChange={event => setCustomCommands(event.target.value)} minHeight="150px" resize="vertical"
                      />
                      <Box display="flex" gap="2x" mt="2x">
                        <Button
                          aria-label={i18n._('Save custom tool probe commands')} onClick={() => {
                            form.change('toolProbeCustomCommands', customCommands); setEditable(false);
                          }} variant="primary"
                        >{i18n._('OK')}
                        </Button>
                        <Button
                          aria-label={i18n._('Cancel custom tool probe commands')} onClick={() => {
                            setCustomCommands(ensureString(value.toolProbeCustomCommands)); setEditable(false);
                          }} variant="secondary"
                        >{i18n._('Cancel')}
                        </Button>
                      </Box>
                    </Box>
                  )}
                </FormControl>
              )}
              {isDefaultProbe && (
                <Box>
                  <Field name="toolProbeCommand">
                    {({ input }) => (
                      <FormControl mb="4x">
                        <FormLabel>{i18n._('Probe Command')}</FormLabel>
                        <ButtonGroup size="sm">
                          {['G38.2', 'G38.3', 'G38.4', 'G38.5'].map(command => (
                            <Button
                              key={command}
                              onClick={() => input.onChange(command)}
                              selected={input.value === command}
                            >
                              {command}
                            </Button>
                          ))}
                        </ButtonGroup>
                      </FormControl>
                    )}
                  </Field>
                  <Box
                    display="grid" gap="4x" gridTemplateColumns="repeat(2, minmax(0, 1fr))"
                    mb="4x"
                  >
                    {numberField('toolProbeDistance', i18n._('Probe Distance'), displayUnits, (input, raw) => input.onChange(ensureNumber(raw) > 0 ? ensureNumber(raw) : mapValueToUnits(1, units)))}
                    {numberField('toolProbeFeedrate', i18n._('Probe Feedrate'), feedrateUnits, (input, raw) => input.onChange(ensureNumber(raw) > 0 ? raw : mapValueToUnits(10, units)))}
                    {numberField('touchPlateHeight', i18n._('Touch Plate Height'), displayUnits, (input, raw) => input.onChange(raw))}
                  </Box>
                  <FormControl>
                    <Box alignItems="center" display="flex" gap="2x">
                      <FormLabel>{i18n._('Tool Probe Commands')}</FormLabel>
                      {connected && (
                        <Tooltip label={copied ? i18n._('Copied') : i18n._('Copy')}>
                          <Button
                            aria-label={i18n._('Copy tool probe commands')}
                            onClick={() => {
                              copyToClipboard(commands);
                              setCopied(true);
                              if (timerRef.current) {
                                clearTimeout(timerRef.current);
                              }
                              timerRef.current = setTimeout(() => {
                                timerRef.current = null;
                                setCopied(false);
                              }, 1500);
                            }}
                            size="sm"
                            variant="ghost"
                          >
                            <i aria-hidden="true" className="fa fa-copy" />
                          </Button>
                        </Tooltip>
                      )}
                    </Box>
                    {connected ? <Text as="pre" maxHeight="150px" overflow="auto">{commands}</Text> : <Text fontStyle="italic">{i18n._('Connect to the controller to view the tool probe commands.')}</Text>}
                  </FormControl>
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}
    </Form>
  );
}

export default Tool;
