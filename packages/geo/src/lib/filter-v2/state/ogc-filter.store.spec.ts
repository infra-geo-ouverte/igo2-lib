import { describe, expect, it } from 'vitest';

import { OgcComparisonRule, OgcFilterConfig, OgcLogicalNode } from '../model';
import { encodeWmsOgcFilterParam } from '../serialization';
import { OgcFilterStore } from './ogc-filter.store';

const ADVANCED_CONFIG: OgcFilterConfig = {
  enabled: true,
  editable: true,
  geometryName: 'geometry',
  filters: {
    operator: 'PropertyIsEqualTo',
    propertyName: 'num_route',
    expression: '00020'
  },
  fields: [{ name: 'num_route', type: 'string' }]
};

const SELECTOR_CONFIG: OgcFilterConfig = {
  enabled: true,
  editable: false,
  geometryName: 'geometry',
  selectors: [
    {
      id: 'routes',
      presentation: 'checkbox',
      multiple: true,
      logical: 'Or',
      items: [
        {
          title: 'Route 20',
          enabled: true,
          filters: {
            operator: 'PropertyIsEqualTo',
            propertyName: 'num_route',
            expression: '00020'
          }
        },
        {
          title: 'Route 40',
          enabled: false,
          filters: {
            operator: 'PropertyIsEqualTo',
            propertyName: 'num_route',
            expression: '00040'
          }
        }
      ]
    }
  ]
};

describe('OgcFilterStore (advanced mode)', () => {
  it('seeds its state from the configuration at construction', () => {
    const store = new OgcFilterStore(ADVANCED_CONFIG);
    expect(store.mode).toBe('advanced');
    expect(store.rules()).toHaveLength(1);
    expect(store.effectiveFilter()).toBeDefined();
    // The configuration itself is never mutated.
    expect(ADVANCED_CONFIG.filters!.expression).toBe('00020');
  });

  it('produces no effective filter when disabled', () => {
    const store = new OgcFilterStore(ADVANCED_CONFIG);
    store.enabled.set(false);
    expect(store.effectiveFilter()).toBeUndefined();
  });

  it('excludes inactive rules from the effective filter', () => {
    const store = new OgcFilterStore(ADVANCED_CONFIG);
    const rule = store.rules()[0];
    store.toggleRule(rule.id, false);
    expect(store.effectiveFilter()).toBeUndefined();
    store.toggleRule(rule.id);
    expect(store.effectiveFilter()).toBeDefined();
  });

  it('converts the rule kind when the operator family changes', () => {
    const store = new OgcFilterStore(ADVANCED_CONFIG);
    const rule = store.rules()[0];
    store.updateRule(rule.id, {
      operator: 'PropertyIsLike',
      pattern: '0002*'
    });
    const updated = store.rules()[0];
    expect(updated.kind).toBe('like');
    expect(updated.id).toBe(rule.id);
  });

  it('adds and removes rules immutably', () => {
    const store = new OgcFilterStore(ADVANCED_CONFIG);
    store.addRule();
    expect(store.rules()).toHaveLength(2);
    const added = store.rules()[1];
    expect((added as OgcComparisonRule).propertyName).toBe('num_route');
    store.removeRule(added.id);
    expect(store.rules()).toHaveLength(1);
  });

  it('resets to the configuration state', () => {
    const store = new OgcFilterStore(ADVANCED_CONFIG);
    store.addRule();
    store.enabled.set(false);
    store.reset();
    expect(store.rules()).toHaveLength(1);
    expect(store.enabled()).toBe(true);
  });

  it('projects its state back to a persistable configuration', () => {
    const store = new OgcFilterStore(ADVANCED_CONFIG);
    const rule = store.rules()[0];
    store.updateRule(rule.id, { value: '00040' });
    const saved = store.toConfig();
    expect(saved.filters?.expression).toBe('00040');
    expect(saved.enabled).toBe(true);
  });
});

describe('OgcFilterStore (selector mode)', () => {
  it('combines enabled selector items with the configured logical operator', () => {
    const store = new OgcFilterStore(SELECTOR_CONFIG);
    expect(store.mode).toBe('selector');
    expect(store.effectiveFilter()!.kind).toBe('comparison');

    store.toggleSelectorItem('routes', 'Route 40', true);
    const combined = store.effectiveFilter() as OgcLogicalNode;
    expect(combined.kind).toBe('logical');
    expect(combined.operator).toBe('Or');
    expect(combined.children).toHaveLength(2);
  });

  it('enforces single choice when multiple is false', () => {
    const store = new OgcFilterStore({
      ...SELECTOR_CONFIG,
      selectors: [{ ...SELECTOR_CONFIG.selectors![0], multiple: false }]
    });
    store.toggleSelectorItem('routes', 'Route 40', true);
    const selector = store.selectors()[0];
    expect(selector.items.map((item) => [item.title, item.enabled])).toEqual([
      ['Route 20', false],
      ['Route 40', true]
    ]);
  });
});

describe('encodeWmsOgcFilterParam', () => {
  it('wraps the filter once per requested layer', () => {
    const store = new OgcFilterStore(ADVANCED_CONFIG);
    const encoded = encodeWmsOgcFilterParam(store.effectiveFilter(), [
      'layer_a',
      'layer_b'
    ]);
    expect(encoded!.startsWith('(<Filter')).toBe(true);
    expect(encoded!.match(/\(<Filter/g)).toHaveLength(2);
    expect(encoded).not.toContain('filter=');
  });

  it('returns undefined when there is nothing to encode', () => {
    expect(encodeWmsOgcFilterParam(undefined, ['layer_a'])).toBeUndefined();
  });
});
