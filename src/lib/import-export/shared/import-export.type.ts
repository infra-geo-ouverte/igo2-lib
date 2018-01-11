import { strEnum } from '../../utils/strenum';

export const ExportFormat = strEnum(['GeoJSON', 'KML', 'GML', 'shapefile']);
export type ExportFormat = keyof typeof ExportFormat;
