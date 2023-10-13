import {
  PrintLegendPosition,
  PrintOrientation,
  PrintOutputFormat,
  PrintPaperFormat,
  PrintResolution,
  PrintSaveImageFormat
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
  showProjection?: boolean;
  showLegend?: boolean;
  showScale?: boolean;
  isPrintService: boolean;
  doZipFile: boolean;
}

export interface TextPdfSizeAndMargin {
  fontSize: number;
  marginLeft: number;
  height: number;
}
