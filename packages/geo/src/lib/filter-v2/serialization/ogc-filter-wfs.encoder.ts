import { OgcFilterNode } from '../model';
import {
  DEFAULT_OGC_FILTER_XML_VERSION,
  OgcFilterXmlVersion,
  writeOgcFilterXml
} from './ogc-filter.serializer';

/**
 * Encodes the AST as the `filter=` query string fragment of a WFS
 * `GetFeature` request.
 */
export function encodeWfsOgcFilterParam(
  node: OgcFilterNode | undefined,
  version: OgcFilterXmlVersion = DEFAULT_OGC_FILTER_XML_VERSION
): string | undefined {
  const xml = writeOgcFilterXml(node, version);
  return xml ? `filter=${xml}` : undefined;
}
