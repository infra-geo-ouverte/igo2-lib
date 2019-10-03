import { strEnum } from '@igo2/utils';

export const ExportFormat = strEnum(['GeoJSON', 'GML', 'GPX', 'KML', 'Shapefile', 'CSV']);
export type ExportFormat = keyof typeof ExportFormat;
