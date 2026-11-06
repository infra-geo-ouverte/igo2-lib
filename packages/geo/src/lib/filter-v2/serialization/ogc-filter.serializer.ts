import { writeFilter } from 'ol/format/WFS';
import olFormatWKT from 'ol/format/WKT';
import * as olFilter from 'ol/format/filter';
import type OlFilter from 'ol/format/filter/Filter';

// Transitional import of a pure helper; it moves to a shared utility
// package when the legacy `filter/` domain is removed.
import { parseDateOperation } from '../../filter/shared/filter.utils';
import { OgcFilterNode, OgcTemporalRule } from '../model';

export type OgcFilterXmlVersion = '1.1.0' | '2.0.0';
export const DEFAULT_OGC_FILTER_XML_VERSION: OgcFilterXmlVersion = '1.1.0';

const DEFAULT_SRS_NAME = 'EPSG:3857';

/**
 * Converts the typed AST into an OpenLayers filter object. Returns
 * `undefined` for nodes that cannot produce a valid filter (ex: a temporal
 * rule without boundaries) instead of emitting invalid XML.
 */
export function ogcFilterNodeToOlFilter(
  node: OgcFilterNode
): OlFilter | undefined {
  switch (node.kind) {
    case 'logical': {
      const children = node.children
        .map((child) => ogcFilterNodeToOlFilter(child))
        .filter((child): child is OlFilter => child !== undefined);
      if (children.length === 0) {
        return undefined;
      }
      if (node.operator === 'Not') {
        return olFilter.not(children[0]);
      }
      if (children.length === 1) {
        return children[0];
      }
      return node.operator === 'And'
        ? olFilter.and(...children)
        : olFilter.or(...children);
    }
    case 'comparison': {
      switch (node.operator) {
        case 'PropertyIsEqualTo':
          return olFilter.equalTo(
            node.propertyName,
            node.value,
            node.matchCase ?? true
          );
        case 'PropertyIsNotEqualTo':
          return olFilter.notEqualTo(
            node.propertyName,
            node.value,
            node.matchCase ?? true
          );
        case 'PropertyIsGreaterThan':
          return olFilter.greaterThan(node.propertyName, Number(node.value));
        case 'PropertyIsGreaterThanOrEqualTo':
          return olFilter.greaterThanOrEqualTo(
            node.propertyName,
            Number(node.value)
          );
        case 'PropertyIsLessThan':
          return olFilter.lessThan(node.propertyName, Number(node.value));
        case 'PropertyIsLessThanOrEqualTo':
          return olFilter.lessThanOrEqualTo(
            node.propertyName,
            Number(node.value)
          );
      }
      return undefined;
    }
    case 'like':
      return olFilter.like(
        node.propertyName,
        node.pattern,
        node.wildCard ?? '*',
        node.singleChar ?? '.',
        node.escapeChar ?? '!',
        node.matchCase ?? true
      );
    case 'between':
      return olFilter.between(
        node.propertyName,
        node.lowerBoundary ?? -1e40,
        node.upperBoundary ?? 1e40
      );
    case 'null':
      return olFilter.isNull(node.propertyName);
    case 'temporal':
      return temporalRuleToOlFilter(node);
    case 'spatial': {
      const srsName = node.srsName ?? DEFAULT_SRS_NAME;
      if (node.operator === 'BBox') {
        return node.extent
          ? olFilter.bbox(node.geometryName, [...node.extent], srsName)
          : undefined;
      }
      if (!node.wktGeometry) {
        return undefined;
      }
      const geometry = new olFormatWKT().readGeometry(node.wktGeometry, {
        dataProjection: srsName,
        featureProjection: srsName
      });
      switch (node.operator) {
        case 'Intersects':
          return olFilter.intersects(node.geometryName, geometry, srsName);
        case 'Within':
          return olFilter.within(node.geometryName, geometry, srsName);
        case 'Contains':
          return olFilter.contains(node.geometryName, geometry, srsName);
      }
      return undefined;
    }
  }
}

function temporalRuleToOlFilter(rule: OgcTemporalRule): OlFilter | undefined {
  const begin = resolveTemporalBoundary(rule.begin);
  const end = resolveTemporalBoundary(rule.end);
  if (!begin || !end) {
    return undefined;
  }
  return olFilter.during(rule.propertyName, begin, end);
}

function resolveTemporalBoundary(
  value: string | undefined
): string | undefined {
  if (!value) {
    return undefined;
  }
  return /now|today/i.test(value) ? parseDateOperation(value) : value;
}

/**
 * Serializes the AST to an OGC `<Filter>` XML string through OpenLayers'
 * `writeFilter`. No regex extraction, no `filter=` prefix leakage.
 */
export function writeOgcFilterXml(
  node: OgcFilterNode | undefined,
  version: OgcFilterXmlVersion = DEFAULT_OGC_FILTER_XML_VERSION
): string | undefined {
  if (!node) {
    return undefined;
  }
  const filter = ogcFilterNodeToOlFilter(node);
  if (!filter) {
    return undefined;
  }
  return new XMLSerializer().serializeToString(writeFilter(filter, version));
}
