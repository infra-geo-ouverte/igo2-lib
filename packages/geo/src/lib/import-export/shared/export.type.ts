import { strEnum } from '@igo2/utils';

export const ExportFormat = strEnum(['GeoJSON', 'GML', 'GPX', 'KML', 'Shapefile']);
export type ExportFormat = keyof typeof ExportFormat;
