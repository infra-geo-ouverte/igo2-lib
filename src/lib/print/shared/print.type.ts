import { strEnum } from '../../utils/strenum';

export const PrintFormat = strEnum(
  ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'Letter', 'Legal', 'Image']);
export type PrintFormat = keyof typeof PrintFormat;

export const PrintOrientation = strEnum(['landscape', 'portrait']);
export type PrintOrientation = keyof typeof PrintOrientation;

export const PrintResolution = strEnum(['72', '96', '150', '300']);
export type PrintResolution = keyof typeof PrintResolution;

export const PrintDimension = {
  'A0': [1189, 841],
  'A1': [841, 594],
  'A2': [594, 420],
  'A3': [420, 297],
  'A4': [297, 210],
  'A5': [210, 148],
  'Letter': [216, 279],
  'Legal': [216, 356]
};

export const PrintSaveImageFormat = strEnum(['Jpeg', 'Png', 'Bmp', 'Gif']);
export type PrintSaveImageFormat = keyof typeof PrintSaveImageFormat;
