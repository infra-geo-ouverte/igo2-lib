import {
  PrintOutputFormat,
  PrintPaperFormat,
  PrintOrientation,
  PrintResolution,
  PrintSaveImageFormat,
  PrintLegendPosition
} from './print.type';

export interface PrintOptions {
  outputFormat: PrintOutputFormat;
  paperFormat: PrintPaperFormat;
  orientation: PrintOrientation;
  resolution: PrintResolution;
  legendPosition: PrintLegendPosition;
  title?: string;
  subtitle?: string;
  comment?: string;
  imageFormat?: PrintSaveImageFormat;
  showLegend?: boolean;
  showProjection?: boolean;
  showScale?: boolean;
  isPrintService: boolean;
  doZipFile: boolean;
}
