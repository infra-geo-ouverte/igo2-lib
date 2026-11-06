/**
 * Typed AST describing an OGC filter.
 *
 * Pure TypeScript: no Angular, no OpenLayers. This single representation
 * replaces both the legacy stringly-typed `IgoOgcFilterObject` tree and the
 * flat `OgcInterfaceFilterOptions[]` sequence (`parentLogical`/`level`).
 */

export const OGC_LOGICAL_OPERATORS = ['And', 'Or', 'Not'] as const;
export type OgcFilterLogicalOperator = (typeof OGC_LOGICAL_OPERATORS)[number];

export const OGC_COMPARISON_OPERATORS = [
  'PropertyIsEqualTo',
  'PropertyIsNotEqualTo',
  'PropertyIsGreaterThan',
  'PropertyIsGreaterThanOrEqualTo',
  'PropertyIsLessThan',
  'PropertyIsLessThanOrEqualTo'
] as const;
export type OgcFilterComparisonOperator =
  (typeof OGC_COMPARISON_OPERATORS)[number];

export const OGC_SPATIAL_OPERATORS = [
  'BBox',
  'Intersects',
  'Within',
  'Contains'
] as const;
export type OgcFilterSpatialOperator = (typeof OGC_SPATIAL_OPERATORS)[number];

/** Every operator a rule node can carry (logical operators excluded). */
export type OgcFilterRuleOperator =
  | OgcFilterComparisonOperator
  | OgcFilterSpatialOperator
  | 'PropertyIsLike'
  | 'PropertyIsBetween'
  | 'PropertyIsNull'
  | 'During';

interface OgcFilterNodeBase {
  readonly id: string;
}

export interface OgcLogicalNode extends OgcFilterNodeBase {
  readonly kind: 'logical';
  readonly operator: OgcFilterLogicalOperator;
  readonly children: readonly OgcFilterNode[];
}

interface OgcRuleBase extends OgcFilterNodeBase {
  readonly active: boolean;
}

export interface OgcComparisonRule extends OgcRuleBase {
  readonly kind: 'comparison';
  readonly operator: OgcFilterComparisonOperator;
  readonly propertyName: string;
  readonly value: string | number;
  readonly matchCase?: boolean;
}

export interface OgcLikeRule extends OgcRuleBase {
  readonly kind: 'like';
  readonly propertyName: string;
  readonly pattern: string;
  readonly wildCard?: string;
  readonly singleChar?: string;
  readonly escapeChar?: string;
  readonly matchCase?: boolean;
}

export interface OgcBetweenRule extends OgcRuleBase {
  readonly kind: 'between';
  readonly propertyName: string;
  readonly lowerBoundary?: number;
  readonly upperBoundary?: number;
}

export interface OgcNullRule extends OgcRuleBase {
  readonly kind: 'null';
  readonly propertyName: string;
}

export interface OgcTemporalRule extends OgcRuleBase {
  readonly kind: 'temporal';
  readonly propertyName: string;
  /** ISO 8601 date or a time frame expression such as 'now' or 'today - 1 days'. */
  readonly begin?: string;
  readonly end?: string;
  readonly step?: string;
}

export interface OgcSpatialRule extends OgcRuleBase {
  readonly kind: 'spatial';
  readonly operator: OgcFilterSpatialOperator;
  readonly geometryName: string;
  readonly extent?: readonly [number, number, number, number];
  readonly wktGeometry?: string;
  readonly srsName?: string;
}

export type OgcRuleNode =
  | OgcComparisonRule
  | OgcLikeRule
  | OgcBetweenRule
  | OgcNullRule
  | OgcTemporalRule
  | OgcSpatialRule;

export type OgcFilterNode = OgcLogicalNode | OgcRuleNode;

export function isOgcLogicalNode(node: OgcFilterNode): node is OgcLogicalNode {
  return node.kind === 'logical';
}

export function isOgcRuleNode(node: OgcFilterNode): node is OgcRuleNode {
  return node.kind !== 'logical';
}

/** Flat patch applicable to any rule node; `applyOgcRulePatch` resolves kind changes. */
export interface OgcRulePatch {
  readonly active?: boolean;
  readonly operator?: OgcFilterRuleOperator;
  readonly propertyName?: string;
  readonly value?: string | number;
  readonly matchCase?: boolean;
  readonly pattern?: string;
  readonly wildCard?: string;
  readonly singleChar?: string;
  readonly escapeChar?: string;
  readonly lowerBoundary?: number;
  readonly upperBoundary?: number;
  readonly begin?: string;
  readonly end?: string;
  readonly step?: string;
  readonly geometryName?: string;
  readonly extent?: readonly [number, number, number, number];
  readonly wktGeometry?: string;
  readonly srsName?: string;
}
