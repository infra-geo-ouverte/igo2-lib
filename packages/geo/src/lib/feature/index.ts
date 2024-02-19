import { FEATURE_DETAILS_DIRECTIVES } from './feature-details';
import { FeatureFormComponent } from './feature-form/feature-form.component';

export * from './shared';
export * from './feature-details';
export * from './feature-form/feature-form.component';

export const FEATURE_DIRECTIVES = [
  ...FEATURE_DETAILS_DIRECTIVES,
  FeatureFormComponent
] as const;
