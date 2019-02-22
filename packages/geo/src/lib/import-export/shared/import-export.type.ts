import { strEnum } from '@igo2/utils';

export const ExportFormat = strEnum(['GeoJSON', 'KML', 'GPX', 'GML', 'shapefile']);
export type ExportFormat = keyof typeof ExportFormat;
