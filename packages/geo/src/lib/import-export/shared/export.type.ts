export type AnyExportFormat = ExportFormat | ExportFormatLegacy;

export const ExportFormat = [
  'GeoJSON',
  'Excel',
  'Shapefile',
  'GML',
  'GPX',
  'KML',
  'CSV',
  'URL'
] as const;
export type ExportFormat = (typeof ExportFormat)[number];

export const ExportFormatLegacy = ['CSVcomma', 'CSVsemicolon'] as const;
export type ExportFormatLegacy = (typeof ExportFormatLegacy)[number];

export const CsvSeparator = ['auto', 'comma', 'semicolon'] as const;
export type CsvSeparator = (typeof CsvSeparator)[number];

export type ExportOgreFormat = Extract<
  AnyExportFormat,
  'GML' | 'GPX' | 'KML' | 'Shapefile' | 'CSVcomma' | 'CSVsemicolon' | 'CSV'
>;
