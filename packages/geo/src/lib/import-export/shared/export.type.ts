import { strEnum } from '@igo2/utils';

export const ExportFormat = strEnum([
  'URL',
  'GeoJSON',
  'GML',
  'GPX',
  'KML',
  'Shapefile',
  'CSVcomma',
  'CSVsemicolon'
]);
export type ExportFormat = keyof typeof ExportFormat;

export const EncodingFormat = strEnum(['UTF8', 'LATIN1']);
export type EncodingFormat = keyof typeof EncodingFormat;
