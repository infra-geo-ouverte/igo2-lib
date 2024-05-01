import { FeatureDetailsComponent } from './feature-details.component';
import { FeatureDetailsDirective } from './feature-details.directive';

export * from './feature-details.component';
export * from './feature-details.directive';

export const FEATURE_DETAILS_DIRECTIVES = [
  FeatureDetailsComponent,
  FeatureDetailsDirective
] as const;
