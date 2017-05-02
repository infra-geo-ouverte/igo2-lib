import { PrintFormat, PrintOrientation, PrintResolution } from './print.type';

export interface PrintOptions {
  format: PrintFormat;
  orientation: PrintOrientation;
  resolution: PrintResolution;
}
