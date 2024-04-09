import { SpinnerActivityDirective } from './spinner-activity.directive';
import { SpinnerComponent } from './spinner.component';

export * from './spinner.component';
export * from './spinner-activity.directive';

export const SPINNER_DIRECTIVES = [
  SpinnerActivityDirective,
  SpinnerComponent
] as const;
