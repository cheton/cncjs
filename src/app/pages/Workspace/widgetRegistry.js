import AutolevelWidget from '@app/widgets/Autolevel';
import AxesWidget from '@app/widgets/Axes';
import ConnectionWidget from '@app/widgets/Connection';
import ConsoleWidget from '@app/widgets/Console';
import CustomWidget from '@app/widgets/Custom';
import GCodeWidget from '@app/widgets/GCode';
import GrblWidget from '@app/widgets/Grbl';
import LaserWidget from '@app/widgets/Laser';
import MacroWidget from '@app/widgets/Macro';
import MarlinWidget from '@app/widgets/Marlin';
import ProbeWidget from '@app/widgets/Probe';
import SmoothieWidget from '@app/widgets/Smoothie';
import SpindleWidget from '@app/widgets/Spindle';
import TinyGWidget from '@app/widgets/TinyG';
import ToolWidget from '@app/widgets/Tool';
import VisualizerWidget from '@app/widgets/Visualizer';
import WebcamWidget from '@app/widgets/Webcam';
import {
  GRBL,
  MARLIN,
  SMOOTHIE,
  TINYG,
} from '@app/constants/controller';

export const WIDGET_REGISTRY = {
  autolevel: { Component: AutolevelWidget, supportsChrome: true },
  axes: { Component: AxesWidget, supportsChrome: true },
  connection: { Component: ConnectionWidget, supportsChrome: true },
  console: { Component: ConsoleWidget, supportsChrome: true },
  custom: { Component: CustomWidget, supportsChrome: true },
  gcode: { Component: GCodeWidget, supportsChrome: true },
  grbl: { Component: GrblWidget, supportsChrome: true, controllerType: GRBL },
  laser: { Component: LaserWidget, supportsChrome: true },
  macro: { Component: MacroWidget, supportsChrome: true },
  marlin: { Component: MarlinWidget, supportsChrome: true, controllerType: MARLIN },
  probe: { Component: ProbeWidget, supportsChrome: true },
  smoothie: { Component: SmoothieWidget, supportsChrome: true, controllerType: SMOOTHIE },
  spindle: { Component: SpindleWidget, supportsChrome: true },
  tinyg: { Component: TinyGWidget, supportsChrome: true, controllerType: TINYG },
  tool: { Component: ToolWidget, supportsChrome: true },
  visualizer: { Component: VisualizerWidget, supportsChrome: false },
  webcam: { Component: WebcamWidget, supportsChrome: true },
};
