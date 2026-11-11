import { ForcedProperty } from './catalog.interface';

export function computeForcedProperties(
  layerNameFromCatalog: string,
  forcedProperties: ForcedProperty[]
): ForcedProperty | undefined {
  if (!forcedProperties || forcedProperties.length === 0) {
    return undefined;
  }
  const returnProperty: ForcedProperty = {
    layerName: layerNameFromCatalog,
    title: undefined,
    metadataUrl: undefined,
    metadataAbstract: undefined,
    metadataAbstractAll: undefined,
    metadataUrlAll: undefined
  };
  //process wildcard before
  // if there is a * wildcard
  const forcedPropertiesForAllLayers = forcedProperties.find(
    (f) => f.layerName === '*'
  );
  if (forcedPropertiesForAllLayers) {
    // metadataAbstractAll
    if (forcedPropertiesForAllLayers.metadataAbstractAll) {
      returnProperty.metadataAbstractAll =
        forcedPropertiesForAllLayers.metadataAbstractAll;
    }
    // metadataUrlAll
    if (forcedPropertiesForAllLayers.metadataUrlAll) {
      returnProperty.metadataUrlAll =
        forcedPropertiesForAllLayers.metadataUrlAll;
    }
  }
  forcedProperties.map((forcedProperty) => {
    // if match found
    if (layerNameFromCatalog === forcedProperty.layerName) {
      // title
      if (forcedProperty.title) {
        returnProperty.title = forcedProperty.title;
      }
      // metadataUrl
      if (forcedProperty.metadataUrl) {
        returnProperty.metadataUrl = forcedProperty.metadataUrl;
      }
      // metadataAbstract
      if (forcedProperty.metadataAbstract) {
        returnProperty.metadataAbstract = forcedProperty.metadataAbstract;
      }
    }
  });
  return returnProperty;
}

export function testLayerRegexes(
  layerName: string,
  regexes: RegExp[]
): boolean {
  if (regexes.length === 0) {
    return true;
  }
  return regexes.find((regex: RegExp) => regex.test(layerName)) !== undefined;
}
