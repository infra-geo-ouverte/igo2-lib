import { OgcFilterNode } from '../model';
import {
  DEFAULT_OGC_FILTER_XML_VERSION,
  OgcFilterXmlVersion,
  writeOgcFilterXml
} from './ogc-filter.serializer';

/**
 * Encodes the AST as the WMS vendor `FILTER` parameter: one parenthesized
 * `<Filter>` per requested layer, ex: `(<Filter>…</Filter>)`.
 */
export function encodeWmsOgcFilterParam(
  node: OgcFilterNode | undefined,
  layerNames: readonly string[],
  version: OgcFilterXmlVersion = DEFAULT_OGC_FILTER_XML_VERSION
): string | undefined {
  const xml = writeOgcFilterXml(node, version);
  if (!xml) {
    return undefined;
  }
  const count = Math.max(layerNames.length, 1);
  return Array.from({ length: count }, () => `(${xml})`).join('');
}
