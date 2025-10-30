import { hasLayerStyleType, isRecord } from '../shared/style.guards';
import type { MapboxLayerStyle } from './mapbox.interface';

export function isMapboxLayerStyle(value: unknown): value is MapboxLayerStyle {
  return hasLayerStyleType(value, 'Mapbox') && isRecord(value.style);
}
