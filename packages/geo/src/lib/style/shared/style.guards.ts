import type { BaseLayerStyle } from './style.interface';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function hasLayerStyleType<TType extends string>(
  value: unknown,
  type: TType
): value is BaseLayerStyle<TType, unknown> {
  return isRecord(value) && value['type'] === type;
}
