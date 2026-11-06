import { Signal, WritableSignal, computed, signal } from '@angular/core';

import {
  OgcComparisonRule,
  OgcFilterConfig,
  OgcFilterMode,
  OgcFilterNode,
  OgcFilterSelectorConfig,
  OgcFilterSelectorItemConfig,
  OgcLogicalNode,
  OgcRuleNode,
  OgcRulePatch,
  appendOgcRule,
  applyOgcRulePatch,
  collectOgcRules,
  createOgcFilterId,
  findOgcNode,
  isOgcRuleNode,
  pruneInactiveOgcNodes,
  removeOgcNode,
  updateOgcNode
} from '../model';
import {
  ogcFilterNodeToJson,
  parseOgcFilterJson
} from '../serialization/ogc-filter-config.parser';

export interface OgcFilterSelectorItemState extends OgcFilterSelectorItemConfig {
  readonly enabled: boolean;
  readonly node: OgcFilterNode | undefined;
}

export interface OgcFilterSelectorState extends Omit<
  OgcFilterSelectorConfig,
  'items'
> {
  readonly items: readonly OgcFilterSelectorItemState[];
}

/**
 * Single source of truth of the runtime filter state for one datasource.
 *
 * The declarative `OgcFilterConfig` (from a context) is parsed once at
 * construction and never mutated; every change goes through immutable
 * updates of the signal state. Protocol encoding is NOT done here: the
 * store stays protocol-agnostic and exposes `effectiveFilter` instead.
 */
export class OgcFilterStore {
  readonly mode: OgcFilterMode;
  readonly enabled: WritableSignal<boolean>;

  private readonly _root: WritableSignal<OgcFilterNode | undefined>;
  private readonly _selectors: WritableSignal<
    readonly OgcFilterSelectorState[]
  >;

  /** Full editable tree (advanced mode). */
  readonly root: Signal<OgcFilterNode | undefined>;
  /** Flat view of the rules, for UI iteration. */
  readonly rules: Signal<readonly OgcRuleNode[]>;
  readonly selectors: Signal<readonly OgcFilterSelectorState[]>;
  /** What must effectively be sent to the server; `undefined` = no filter. */
  readonly effectiveFilter: Signal<OgcFilterNode | undefined>;

  constructor(readonly config: OgcFilterConfig) {
    this.mode = config.selectors?.length ? 'selector' : 'advanced';
    this.enabled = signal(config.enabled);
    this._root = signal(
      parseOgcFilterJson(config.filters, config.geometryName)
    );
    this._selectors = signal(parseSelectors(config));

    this.root = this._root.asReadonly();
    this.selectors = this._selectors.asReadonly();
    this.rules = computed(() => collectOgcRules(this._root()));

    const selectorFilter = computed(() =>
      combineSelectorFilters(this._selectors())
    );
    this.effectiveFilter = computed(() => {
      if (!this.enabled()) {
        return undefined;
      }
      return this.mode === 'selector'
        ? selectorFilter()
        : pruneInactiveOgcNodes(this._root());
    });
  }

  setRoot(node: OgcFilterNode | undefined): void {
    this._root.set(node);
  }

  updateRule(id: string, patch: OgcRulePatch): void {
    this._root.update((root) =>
      root
        ? updateOgcNode(root, id, (node) =>
            isOgcRuleNode(node) ? applyOgcRulePatch(node, patch) : node
          )
        : root
    );
  }

  toggleRule(id: string, active?: boolean): void {
    const current = findOgcNode(this._root(), id);
    if (!current || !isOgcRuleNode(current)) {
      return;
    }
    this.updateRule(id, { active: active ?? !current.active });
  }

  addRule(rule?: OgcRuleNode): void {
    const added = rule ?? this.createDefaultRule();
    this._root.update((root) => appendOgcRule(root, added));
  }

  removeRule(id: string): void {
    this._root.update((root) => (root ? removeOgcNode(root, id) : root));
  }

  toggleSelectorItem(
    selectorId: string,
    itemTitle: string,
    enabled?: boolean
  ): void {
    this._selectors.update((selectors) =>
      selectors.map((selector) => {
        if (selector.id !== selectorId) {
          return selector;
        }
        const current = selector.items.find((item) => item.title === itemTitle);
        if (!current) {
          return selector;
        }
        const nextEnabled = enabled ?? !current.enabled;
        const items = selector.items.map((item) => {
          if (item.title === itemTitle) {
            return { ...item, enabled: nextEnabled };
          }
          // Single-choice selectors disable the other items on activation.
          return selector.multiple || !nextEnabled
            ? item
            : { ...item, enabled: false };
        });
        return { ...selector, items };
      })
    );
  }

  /** Restores the state parsed from the original configuration. */
  reset(): void {
    this.enabled.set(this.config.enabled);
    this._root.set(
      parseOgcFilterJson(this.config.filters, this.config.geometryName)
    );
    this._selectors.set(parseSelectors(this.config));
  }

  /** Projection of the current state for persistence (contexts). */
  toConfig(): OgcFilterConfig {
    const root = this._root();
    return {
      ...this.config,
      enabled: this.enabled(),
      filters: root ? ogcFilterNodeToJson(root) : undefined,
      selectors: this._selectors().map((selector) => ({
        ...selector,
        items: selector.items.map((item) => ({
          title: item.title,
          tooltip: item.tooltip,
          enabled: item.enabled,
          filters: item.filters
        }))
      }))
    };
  }

  private createDefaultRule(): OgcComparisonRule {
    return {
      kind: 'comparison',
      id: createOgcFilterId(),
      active: true,
      operator: 'PropertyIsEqualTo',
      propertyName: this.config.fields?.[0]?.name ?? '',
      value: ''
    };
  }
}

export function createOgcFilterStore(config: OgcFilterConfig): OgcFilterStore {
  return new OgcFilterStore(config);
}

function parseSelectors(
  config: OgcFilterConfig
): readonly OgcFilterSelectorState[] {
  return (config.selectors ?? []).map((selector) => ({
    ...selector,
    items: selector.items.map((item) => ({
      ...item,
      enabled: item.enabled ?? false,
      node: parseOgcFilterJson(item.filters, config.geometryName)
    }))
  }));
}

function combineSelectorFilters(
  selectors: readonly OgcFilterSelectorState[]
): OgcFilterNode | undefined {
  const conditions: OgcFilterNode[] = [];
  for (const selector of selectors) {
    const activeNodes = selector.items
      .filter((item) => item.enabled && item.node)
      .map((item) => item.node!);
    if (activeNodes.length === 0) {
      continue;
    }
    conditions.push(
      activeNodes.length === 1
        ? activeNodes[0]
        : logicalNode(selector.logical ?? 'Or', activeNodes)
    );
  }
  if (conditions.length === 0) {
    return undefined;
  }
  return conditions.length === 1
    ? conditions[0]
    : logicalNode('And', conditions);
}

function logicalNode(
  operator: 'And' | 'Or',
  children: OgcFilterNode[]
): OgcLogicalNode {
  return { kind: 'logical', id: createOgcFilterId(), operator, children };
}
