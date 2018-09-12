import { strEnum } from '@igo2/utils';

export const PrintOutputFormat = strEnum(['Pdf', 'Image']);

export type PrintOutputFormat = keyof typeof PrintOutputFormat;

export const PrintPaperFormat = strEnum([
  'A0',
  'A1',
  'A2',
  'A3',
  'A4',
  'A5',
  'Letter',
  'Legal'
]);
export type PrintPaperFormat = keyof typeof PrintPaperFormat;

export const PrintOrientation = strEnum(['landscape', 'portrait']);
export type PrintOrientation = keyof typeof PrintOrientation;

export const PrintResolution = strEnum(['72', '96', '150', '300']);
export type PrintResolution = keyof typeof PrintResolution;

export const PrintDimension = {
  A0: [841, 1189],
  A1: [594, 841],
  A2: [420, 594],
  A3: [297, 420],
  A4: [210, 297],
  A5: [148, 210],
  Letter: [216, 279],
  Legal: [216, 356]
};

export const PrintSaveImageFormat = strEnum(['Jpeg', 'Png', 'Bmp', 'Gif', 'Tiff']);
export type PrintSaveImageFormat = keyof typeof PrintSaveImageFormat;
