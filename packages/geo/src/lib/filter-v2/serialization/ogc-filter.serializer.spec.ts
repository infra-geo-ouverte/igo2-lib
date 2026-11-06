import { describe, expect, it } from 'vitest';

import { OgcFilterWriter } from '../../filter/shared/ogc-filter';
import { IgoOgcFilterObject } from '../../filter/shared/ogc-filter.interface';
import { OgcFilterJson, OgcFilterNode } from '../model';
import { parseOgcFilterJson } from './ogc-filter-config.parser';
import { writeOgcFilterXml } from './ogc-filter.serializer';

/**
 * Golden tests: the v2 serializer must produce the same OGC `<Filter>` body
 * as the legacy `OgcFilterWriter` for the declarative JSON contract used in
 * contexts. Namespace declarations are stripped before comparison because
 * the legacy regex extraction leaves them on removed ancestor nodes.
 */
function normalizeXml(xml: string): string {
  return xml.replace(/\s?xmlns(:\w+)?="[^"]*"/g, '').replace(/\s+/g, '');
}

function legacyFilterXml(filters: OgcFilterJson): string {
  const legacy = new OgcFilterWriter().buildFilter(
    filters as unknown as IgoOgcFilterObject
  )!;
  return legacy.replace(/^filter=/, '');
}

function v2FilterXml(json: OgcFilterJson): string {
  const node = parseOgcFilterJson(json, 'geometry') as OgcFilterNode;
  return writeOgcFilterXml(node, '1.1.0')!;
}

describe('writeOgcFilterXml (golden vs legacy OgcFilterWriter)', () => {
  it('serializes a PropertyIsEqualTo filter identically', () => {
    const json: OgcFilterJson = {
      operator: 'PropertyIsEqualTo',
      propertyName: 'num_route',
      expression: '00020'
    };
    expect(normalizeXml(v2FilterXml(json))).toEqual(
      normalizeXml(legacyFilterXml(json))
    );
  });

  it('serializes a logical And of two conditions identically', () => {
    const json: OgcFilterJson = {
      logical: 'And',
      filters: [
        {
          operator: 'PropertyIsEqualTo',
          propertyName: 'num_route',
          expression: '00020'
        },
        {
          operator: 'PropertyIsGreaterThan',
          propertyName: 'longueur',
          expression: 100
        }
      ]
    };
    expect(normalizeXml(v2FilterXml(json))).toEqual(
      normalizeXml(legacyFilterXml(json))
    );
  });

  it('serializes a PropertyIsLike filter identically', () => {
    const json: OgcFilterJson = {
      operator: 'PropertyIsLike',
      propertyName: 'nom',
      pattern: 'Mont*',
      matchCase: true
    };
    expect(normalizeXml(v2FilterXml(json))).toEqual(
      normalizeXml(legacyFilterXml(json))
    );
  });

  it('honors matchCase=false on PropertyIsLike (fixed legacy coercion bug)', () => {
    // The legacy writer coerced `matchCase: false` to `true`
    // (`matchCase ? matchCase : true`); the v2 serializer must not.
    const xml = v2FilterXml({
      operator: 'PropertyIsLike',
      propertyName: 'nom',
      pattern: 'Mont*',
      matchCase: false
    });
    expect(xml).toContain('matchCase="false"');
  });

  it('serializes a PropertyIsBetween filter identically', () => {
    const json: OgcFilterJson = {
      operator: 'PropertyIsBetween',
      propertyName: 'longueur',
      lowerBoundary: 10,
      upperBoundary: 20
    };
    expect(normalizeXml(v2FilterXml(json))).toEqual(
      normalizeXml(legacyFilterXml(json))
    );
  });

  it('serializes a PropertyIsNull filter identically', () => {
    const json: OgcFilterJson = {
      operator: 'PropertyIsNull',
      propertyName: 'nom'
    };
    expect(normalizeXml(v2FilterXml(json))).toEqual(
      normalizeXml(legacyFilterXml(json))
    );
  });
});

describe('writeOgcFilterXml', () => {
  it('serializes a During filter with explicit ISO boundaries', () => {
    const xml = writeOgcFilterXml(
      {
        kind: 'temporal',
        id: 't1',
        active: true,
        propertyName: 'date_observation',
        begin: '2020-01-01T00:00:00Z',
        end: '2020-12-31T23:59:59Z'
      },
      '2.0.0'
    );
    expect(xml).toContain('During');
    expect(xml).toContain('2020-01-01T00:00:00Z');
    expect(xml).toContain('2020-12-31T23:59:59Z');
  });

  it('returns undefined for a temporal rule without boundaries', () => {
    const xml = writeOgcFilterXml({
      kind: 'temporal',
      id: 't2',
      active: true,
      propertyName: 'date_observation'
    });
    expect(xml).toBeUndefined();
  });

  it('collapses single-child logical nodes instead of emitting invalid XML', () => {
    const xml = writeOgcFilterXml({
      kind: 'logical',
      id: 'l1',
      operator: 'And',
      children: [
        {
          kind: 'comparison',
          id: 'c1',
          active: true,
          operator: 'PropertyIsEqualTo',
          propertyName: 'num_route',
          value: '00020'
        }
      ]
    });
    expect(xml).toContain('PropertyIsEqualTo');
    expect(xml).not.toContain('<And>');
  });
});
