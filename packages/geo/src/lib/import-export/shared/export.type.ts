import { strEnum } from '@igo2/utils';

export const ExportFormat = strEnum(['GeoJSON', 'GML', 'GPX', 'KML', 'Shapefile', 'CSVcomma', 'CSVsemicolon', 'URL']);
export type ExportFormat = keyof typeof ExportFormat;

export const EncodingFormat = strEnum(['UTF8', 'LATIN1']);
export type EncodingFormat = keyof typeof EncodingFormat;
