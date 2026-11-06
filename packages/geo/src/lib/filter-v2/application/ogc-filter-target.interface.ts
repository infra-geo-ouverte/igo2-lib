import { OgcFilterNode } from '../model';
import { OgcFilterXmlVersion } from '../serialization';

/**
 * The filter payload handed to a target: the protocol-specific encoding plus
 * the AST itself, for targets whose request pipeline rebuilds its own URL
 * (ex: the WFS loading strategy).
 */
export interface OgcAppliedFilter {
  readonly node: OgcFilterNode | undefined;
  readonly encoded: string | undefined;
}

/**
 * Port implemented by anything able to receive an OGC filter (WMS or WFS
 * datasources). This inverts the legacy dependency: the filter domain no
 * longer imports any datasource.
 */
export interface OgcFilterTarget {
  readonly protocol: 'wms' | 'wfs';
  /** Layer or feature-type names targeted by the request. */
  readonly layerNames: readonly string[];
  readonly filterVersion?: OgcFilterXmlVersion;
  applyOgcFilter(filter: OgcAppliedFilter): void;
}
