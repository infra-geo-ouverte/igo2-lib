import { Feature } from '../../../feature/shared';

export type EditStatus = 'dirty' | 'saving' | 'saved' | 'failed';

/**
 * Represents an edit on a feature, with a snapshot of the original state and a status.
 */
export class FeatureEdit {
  readonly feature: Feature;
  readonly snapshot: Feature;
  status: EditStatus;

  constructor(feature: Feature) {
    this.feature = feature;
    this.snapshot = {
      ...feature,
      ol: feature.ol ? feature.ol.clone() : undefined
    };

    this.status = 'dirty';
  }
}
