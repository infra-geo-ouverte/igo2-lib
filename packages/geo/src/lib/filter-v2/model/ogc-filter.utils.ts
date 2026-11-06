import { uuid } from '@igo2/utils';

import {
  OGC_COMPARISON_OPERATORS,
  OGC_SPATIAL_OPERATORS,
  OgcBetweenRule,
  OgcComparisonRule,
  OgcFilterComparisonOperator,
  OgcFilterLogicalOperator,
  OgcFilterNode,
  OgcFilterRuleOperator,
  OgcFilterSpatialOperator,
  OgcLikeRule,
  OgcLogicalNode,
  OgcNullRule,
  OgcRuleNode,
  OgcRulePatch,
  OgcSpatialRule,
  OgcTemporalRule,
  isOgcLogicalNode
} from './ogc-filter.model';

export function createOgcFilterId(): string {
  return uuid();
}

/** Depth-first collection of every rule node of the tree. */
export function collectOgcRules(
  node: OgcFilterNode | undefined
): OgcRuleNode[] {
  if (!node) {
    return [];
  }
  if (isOgcLogicalNode(node)) {
    return node.children.flatMap((child) => collectOgcRules(child));
  }
  return [node];
}

export function findOgcNode(
  node: OgcFilterNode | undefined,
  id: string
): OgcFilterNode | undefined {
  if (!node) {
    return undefined;
  }
  if (node.id === id) {
    return node;
  }
  if (isOgcLogicalNode(node)) {
    for (const child of node.children) {
      const found = findOgcNode(child, id);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

/** Immutable node replacement; untouched branches keep their identity. */
export function updateOgcNode(
  root: OgcFilterNode,
  id: string,
  update: (node: OgcFilterNode) => OgcFilterNode
): OgcFilterNode {
  if (root.id === id) {
    return update(root);
  }
  if (isOgcLogicalNode(root)) {
    let changed = false;
    const children = root.children.map((child) => {
      const next = updateOgcNode(child, id, update);
      if (next !== child) {
        changed = true;
      }
      return next;
    });
    return changed ? { ...root, children } : root;
  }
  return root;
}

export function removeOgcNode(
  root: OgcFilterNode,
  id: string
): OgcFilterNode | undefined {
  if (root.id === id) {
    return undefined;
  }
  if (isOgcLogicalNode(root)) {
    const children = root.children
      .map((child) => removeOgcNode(child, id))
      .filter((child): child is OgcFilterNode => child !== undefined);
    return { ...root, children };
  }
  return root;
}

/**
 * Keeps only active rules. Empty logical nodes are dropped and single-child
 * logical nodes (except `Not`) are collapsed into their child, so the result
 * is always serializable.
 */
export function pruneInactiveOgcNodes(
  node: OgcFilterNode | undefined
): OgcFilterNode | undefined {
  if (!node) {
    return undefined;
  }
  if (!isOgcLogicalNode(node)) {
    return node.active ? node : undefined;
  }
  const children = node.children
    .map((child) => pruneInactiveOgcNodes(child))
    .filter((child): child is OgcFilterNode => child !== undefined);
  if (children.length === 0) {
    return undefined;
  }
  if (children.length === 1 && node.operator !== 'Not') {
    return children[0];
  }
  return { ...node, children };
}

/** Appends a rule to the tree, wrapping into a logical node when needed. */
export function appendOgcRule(
  root: OgcFilterNode | undefined,
  rule: OgcRuleNode,
  logical: OgcFilterLogicalOperator = 'And'
): OgcFilterNode {
  if (!root) {
    return rule;
  }
  if (isOgcLogicalNode(root) && root.operator === logical) {
    return { ...root, children: [...root.children, rule] };
  }
  return {
    kind: 'logical',
    id: createOgcFilterId(),
    operator: logical,
    children: [root, rule]
  };
}

function isComparisonOperator(
  operator: OgcFilterRuleOperator
): operator is OgcFilterComparisonOperator {
  return (OGC_COMPARISON_OPERATORS as readonly string[]).includes(operator);
}

function isSpatialOperator(
  operator: OgcFilterRuleOperator
): operator is OgcFilterSpatialOperator {
  return (OGC_SPATIAL_OPERATORS as readonly string[]).includes(operator);
}

export function getOgcRuleOperator(rule: OgcRuleNode): OgcFilterRuleOperator {
  switch (rule.kind) {
    case 'comparison':
    case 'spatial':
      return rule.operator;
    case 'like':
      return 'PropertyIsLike';
    case 'between':
      return 'PropertyIsBetween';
    case 'null':
      return 'PropertyIsNull';
    case 'temporal':
      return 'During';
  }
}

/**
 * Applies a flat patch to a rule, converting its kind when the requested
 * operator belongs to another rule family (ex: PropertyIsEqualTo →
 * PropertyIsLike).
 */
export function applyOgcRulePatch(
  rule: OgcRuleNode,
  patch: OgcRulePatch
): OgcRuleNode {
  const operator = patch.operator ?? getOgcRuleOperator(rule);
  const base = {
    id: rule.id,
    active: patch.active ?? rule.active
  };
  const propertyName =
    patch.propertyName ??
    ('propertyName' in rule ? rule.propertyName : undefined) ??
    '';

  if (isComparisonOperator(operator)) {
    const previous = rule.kind === 'comparison' ? rule : undefined;
    return {
      ...base,
      kind: 'comparison',
      operator,
      propertyName,
      value: patch.value ?? previous?.value ?? '',
      matchCase: patch.matchCase ?? previous?.matchCase
    } satisfies OgcComparisonRule;
  }
  if (isSpatialOperator(operator)) {
    const previous = rule.kind === 'spatial' ? rule : undefined;
    return {
      ...base,
      kind: 'spatial',
      operator,
      geometryName: patch.geometryName ?? previous?.geometryName ?? 'geometry',
      extent: patch.extent ?? previous?.extent,
      wktGeometry: patch.wktGeometry ?? previous?.wktGeometry,
      srsName: patch.srsName ?? previous?.srsName
    } satisfies OgcSpatialRule;
  }
  switch (operator) {
    case 'PropertyIsLike': {
      const previous = rule.kind === 'like' ? rule : undefined;
      return {
        ...base,
        kind: 'like',
        propertyName,
        pattern: patch.pattern ?? previous?.pattern ?? '',
        wildCard: patch.wildCard ?? previous?.wildCard,
        singleChar: patch.singleChar ?? previous?.singleChar,
        escapeChar: patch.escapeChar ?? previous?.escapeChar,
        matchCase: patch.matchCase ?? previous?.matchCase
      } satisfies OgcLikeRule;
    }
    case 'PropertyIsBetween': {
      const previous = rule.kind === 'between' ? rule : undefined;
      return {
        ...base,
        kind: 'between',
        propertyName,
        lowerBoundary: patch.lowerBoundary ?? previous?.lowerBoundary,
        upperBoundary: patch.upperBoundary ?? previous?.upperBoundary
      } satisfies OgcBetweenRule;
    }
    case 'PropertyIsNull':
      return {
        ...base,
        kind: 'null',
        propertyName
      } satisfies OgcNullRule;
    case 'During': {
      const previous = rule.kind === 'temporal' ? rule : undefined;
      return {
        ...base,
        kind: 'temporal',
        propertyName,
        begin: patch.begin ?? previous?.begin,
        end: patch.end ?? previous?.end,
        step: patch.step ?? previous?.step
      } satisfies OgcTemporalRule;
    }
  }
}

/** Creates a logical node; mostly useful for tests and selectors. */
export function createOgcLogicalNode(
  operator: OgcFilterLogicalOperator,
  children: readonly OgcFilterNode[]
): OgcLogicalNode {
  return { kind: 'logical', id: createOgcFilterId(), operator, children };
}
