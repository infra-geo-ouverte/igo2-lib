import {
  OgcFilterJson,
  OgcFilterLogicalOperator,
  OgcFilterNode,
  OgcRuleNode,
  createOgcFilterId,
  getOgcRuleOperator,
  isOgcLogicalNode
} from '../model';

const LOGICAL_OPERATORS: Record<string, OgcFilterLogicalOperator> = {
  and: 'And',
  or: 'Or',
  not: 'Not'
};

/**
 * Parses the declarative JSON contract (contexts, legacy `ogcFilters.filters`)
 * into the typed AST. Unknown operators are rejected with a console error
 * instead of producing a corrupted tree.
 */
export function parseOgcFilterJson(
  json: OgcFilterJson | undefined,
  defaultGeometryName = 'geometry'
): OgcFilterNode | undefined {
  if (!json) {
    return undefined;
  }

  const logical =
    LOGICAL_OPERATORS[(json.logical ?? '').toLowerCase()] ??
    LOGICAL_OPERATORS[(json.operator ?? '').toLowerCase()];

  if (logical) {
    const filters = Array.isArray(json.filters)
      ? json.filters
      : json.filters
        ? [json.filters]
        : [];
    const children = filters
      .map((child) => parseOgcFilterJson(child, defaultGeometryName))
      .filter((child): child is OgcFilterNode => child !== undefined);
    if (children.length === 0) {
      return undefined;
    }
    return {
      kind: 'logical',
      id: createOgcFilterId(),
      operator: logical,
      children
    };
  }

  return parseRule(json, defaultGeometryName);
}

function parseRule(
  json: OgcFilterJson,
  defaultGeometryName: string
): OgcRuleNode | undefined {
  const base = {
    id: createOgcFilterId(),
    active: json.active ?? true
  };
  const propertyName = json.propertyName ?? '';

  switch ((json.operator ?? '').toLowerCase()) {
    case 'propertyisequalto':
      return {
        ...base,
        kind: 'comparison',
        operator: 'PropertyIsEqualTo',
        propertyName,
        value: json.expression ?? '',
        matchCase: json.matchCase
      };
    case 'propertyisnotequalto':
      return {
        ...base,
        kind: 'comparison',
        operator: 'PropertyIsNotEqualTo',
        propertyName,
        value: json.expression ?? '',
        matchCase: json.matchCase
      };
    case 'propertyisgreaterthan':
      return {
        ...base,
        kind: 'comparison',
        operator: 'PropertyIsGreaterThan',
        propertyName,
        value: json.expression ?? ''
      };
    case 'propertyisgreaterthanorequalto':
      return {
        ...base,
        kind: 'comparison',
        operator: 'PropertyIsGreaterThanOrEqualTo',
        propertyName,
        value: json.expression ?? ''
      };
    case 'propertyislessthan':
      return {
        ...base,
        kind: 'comparison',
        operator: 'PropertyIsLessThan',
        propertyName,
        value: json.expression ?? ''
      };
    case 'propertyislessthanorequalto':
      return {
        ...base,
        kind: 'comparison',
        operator: 'PropertyIsLessThanOrEqualTo',
        propertyName,
        value: json.expression ?? ''
      };
    case 'propertyislike':
      return {
        ...base,
        kind: 'like',
        propertyName,
        pattern: json.pattern ?? '',
        wildCard: json.wildCard,
        singleChar: json.singleChar,
        escapeChar: json.escapeChar,
        matchCase: json.matchCase
      };
    case 'propertyisbetween':
      return {
        ...base,
        kind: 'between',
        propertyName,
        lowerBoundary: json.lowerBoundary,
        upperBoundary: json.upperBoundary
      };
    case 'propertyisnull':
      return { ...base, kind: 'null', propertyName };
    case 'during':
      return {
        ...base,
        kind: 'temporal',
        propertyName,
        begin: json.begin,
        end: json.end,
        step: json.step
      };
    case 'bbox':
      return {
        ...base,
        kind: 'spatial',
        operator: 'BBox',
        geometryName: json.geometryName ?? defaultGeometryName,
        extent: json.extent,
        srsName: json.srsName
      };
    case 'intersects':
      return {
        ...base,
        kind: 'spatial',
        operator: 'Intersects',
        geometryName: json.geometryName ?? defaultGeometryName,
        wktGeometry: json.wkt_geometry,
        extent: json.extent,
        srsName: json.srsName
      };
    case 'within':
      return {
        ...base,
        kind: 'spatial',
        operator: 'Within',
        geometryName: json.geometryName ?? defaultGeometryName,
        wktGeometry: json.wkt_geometry,
        extent: json.extent,
        srsName: json.srsName
      };
    case 'contains':
      return {
        ...base,
        kind: 'spatial',
        operator: 'Contains',
        geometryName: json.geometryName ?? defaultGeometryName,
        wktGeometry: json.wkt_geometry,
        extent: json.extent,
        srsName: json.srsName
      };
    default:
      console.error('Unsupported OGC filter operator', json);
      return undefined;
  }
}

/** Inverse of `parseOgcFilterJson`; used for persistence and legacy bridging. */
export function ogcFilterNodeToJson(node: OgcFilterNode): OgcFilterJson {
  if (isOgcLogicalNode(node)) {
    return {
      logical: node.operator,
      filters: node.children.map((child) => ogcFilterNodeToJson(child))
    };
  }
  const operator = getOgcRuleOperator(node);
  switch (node.kind) {
    case 'comparison':
      return {
        operator,
        propertyName: node.propertyName,
        expression: node.value,
        matchCase: node.matchCase,
        active: node.active
      };
    case 'like':
      return {
        operator,
        propertyName: node.propertyName,
        pattern: node.pattern,
        wildCard: node.wildCard,
        singleChar: node.singleChar,
        escapeChar: node.escapeChar,
        matchCase: node.matchCase,
        active: node.active
      };
    case 'between':
      return {
        operator,
        propertyName: node.propertyName,
        lowerBoundary: node.lowerBoundary,
        upperBoundary: node.upperBoundary,
        active: node.active
      };
    case 'null':
      return {
        operator,
        propertyName: node.propertyName,
        active: node.active
      };
    case 'temporal':
      return {
        operator,
        propertyName: node.propertyName,
        begin: node.begin,
        end: node.end,
        step: node.step,
        active: node.active
      };
    case 'spatial':
      return {
        operator,
        geometryName: node.geometryName,
        extent: node.extent,
        wkt_geometry: node.wktGeometry,
        srsName: node.srsName,
        active: node.active
      };
  }
}
