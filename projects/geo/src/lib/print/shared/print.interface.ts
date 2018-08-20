import {
  PrintFormat,
  PrintOrientation,
  PrintResolution,
  PrintSaveImageFormat
} from './print.type';

export interface PrintOptions {
  format: PrintFormat;
  orientation: PrintOrientation;
  resolution: PrintResolution;
  title?: string;
  comment?: string;
  imageFormat?: PrintSaveImageFormat;
  showLegend?: boolean;
  showProjection?: boolean;
  showScale?: boolean;
  isPrintService: boolean;
}
