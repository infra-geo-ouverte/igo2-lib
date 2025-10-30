import { hasLayerStyleType, isRecord } from '../shared/style.guards';
import type { GeostylerLayerStyle } from './geostyler.interface';

export function isGeostylerLayerStyle(
  value: unknown
): value is GeostylerLayerStyle {
  return hasLayerStyleType(value, 'Geostyler') && isRecord(value.style);
}
