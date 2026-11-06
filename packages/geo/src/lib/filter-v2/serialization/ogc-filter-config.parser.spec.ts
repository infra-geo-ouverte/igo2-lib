import { describe, expect, it } from 'vitest';

import { OgcComparisonRule, OgcFilterNode, OgcLogicalNode } from '../model';
import {
  ogcFilterNodeToJson,
  parseOgcFilterJson
} from './ogc-filter-config.parser';

describe('parseOgcFilterJson', () => {
  it('parses the context JSON contract into a comparison rule', () => {
    const node = parseOgcFilterJson({
      operator: 'PropertyIsEqualTo',
      propertyName: 'num_route',
      expression: '00020'
    }) as OgcComparisonRule;

    expect(node.kind).toBe('comparison');
    expect(node.operator).toBe('PropertyIsEqualTo');
    expect(node.propertyName).toBe('num_route');
    expect(node.value).toBe('00020');
    expect(node.active).toBe(true);
    expect(node.id).toBeTruthy();
  });

  it('parses a logical tree and keeps the nesting', () => {
    const node = parseOgcFilterJson({
      logical: 'Or',
      filters: [
        {
          operator: 'PropertyIsEqualTo',
          propertyName: 'a',
          expression: 1
        },
        {
          logical: 'And',
          filters: [
            { operator: 'PropertyIsNull', propertyName: 'b' },
            {
              operator: 'PropertyIsLike',
              propertyName: 'c',
              pattern: 'x*'
            }
          ]
        }
      ]
    }) as OgcLogicalNode;

    expect(node.kind).toBe('logical');
    expect(node.operator).toBe('Or');
    expect(node.children).toHaveLength(2);
    const nested = node.children[1] as OgcLogicalNode;
    expect(nested.operator).toBe('And');
    expect(nested.children.map((child) => child.kind)).toEqual([
      'null',
      'like'
    ]);
  });

  it('accepts `operator` as the logical discriminator', () => {
    const node = parseOgcFilterJson({
      operator: 'And',
      filters: [
        { operator: 'PropertyIsEqualTo', propertyName: 'a', expression: 1 },
        { operator: 'PropertyIsEqualTo', propertyName: 'b', expression: 2 }
      ]
    }) as OgcLogicalNode;
    expect(node.kind).toBe('logical');
    expect(node.operator).toBe('And');
  });

  it('rejects unknown operators without corrupting the tree', () => {
    expect(
      parseOgcFilterJson({ operator: 'NoSuchOperator', propertyName: 'a' })
    ).toBeUndefined();
  });

  it('round-trips through ogcFilterNodeToJson', () => {
    const source = {
      logical: 'And',
      filters: [
        {
          operator: 'PropertyIsEqualTo',
          propertyName: 'num_route',
          expression: '00020'
        },
        {
          operator: 'During',
          propertyName: 'date_obs',
          begin: '2020-01-01',
          end: '2020-12-31'
        }
      ]
    };
    const node = parseOgcFilterJson(source) as OgcFilterNode;
    const json = ogcFilterNodeToJson(node);
    const reparsed = parseOgcFilterJson(json) as OgcLogicalNode;

    expect(reparsed.kind).toBe('logical');
    expect(reparsed.operator).toBe('And');
    expect(reparsed.children.map((child) => child.kind)).toEqual([
      'comparison',
      'temporal'
    ]);
  });
});
