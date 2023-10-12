import { Feature, FeatureGeometry } from '../../feature';

export interface EditionFeature extends Feature {
  edition?: boolean;
  original_properties?: object;
  original_geometry?: FeatureGeometry;
  idkey?: string;
  newFeature?: boolean;
}
