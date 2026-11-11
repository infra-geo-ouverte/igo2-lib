import Style, { type StyleFunction, type StyleLike } from 'ol/style/Style';
import { type FlatStyleLike, type Rule } from 'ol/style/flat';

import type { AnyOlStyle, EngineLayerStyle } from './style.interface';

const FLAT_STYLE_KEYS = [
  'fill-color',
  'fill-opacity',
  'stroke-color',
  'stroke-width',
  'stroke-opacity',
  'circle-radius',
  'circle-fill-color',
  'icon-src',
  'icon-scale',
  'text-field',
  'text-font',
  'text-size'
] as const satisfies readonly string[];

export function isEngineLayerStyle(value: unknown): value is EngineLayerStyle {
  return isRecord(value) && typeof value['type'] === 'string';
}

export function isOlFlatStyleLike(value: unknown): value is FlatStyleLike {
  if (!value) return false;

  if (isOlRuleArray(value)) return true;

  if (Array.isArray(value)) {
    return value.length > 0 && value.every(isOlFlatStyleLike);
  }

  return isRecord(value) && hasAnyFlatStyleKey(value);
}

export function isAnyOlStyle(value: unknown): value is AnyOlStyle {
  return (
    !isEngineLayerStyle(value) &&
    (isOlStyleLike(value) || isOlFlatStyleLike(value))
  );
}

// Analyser les méthodes exporter ou non, enlever les export si elles sont utilisé localement.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isOlStyleInstance(value: unknown): value is Style {
  return value instanceof Style;
}

function isOlStyleInstanceArray(value: unknown): value is Style[] {
  return Array.isArray(value) && value.every(isOlStyleInstance);
}

function isOlStyleFunction(value: unknown): value is StyleFunction {
  return typeof value === 'function';
}

function isOlRule(value: unknown): value is Rule {
  if (!isRecord(value) || !('style' in value)) return false;

  const styleValue = value.style;
  return (
    isOlFlatStyleLike(styleValue) ||
    (Array.isArray(styleValue) && styleValue.every(isOlFlatStyleLike))
  );
}

function isOlRuleArray(value: unknown): value is Rule[] {
  return Array.isArray(value) && value.every(isOlRule);
}

function hasAnyFlatStyleKey(value: Record<string, unknown>): boolean {
  return FLAT_STYLE_KEYS.some((key) =>
    Object.prototype.hasOwnProperty.call(value, key)
  );
}

function isOlStyleLike(value: unknown): value is StyleLike {
  return (
    !!value &&
    (isOlStyleInstance(value) ||
      isOlStyleInstanceArray(value) ||
      isOlStyleFunction(value))
  );
}
