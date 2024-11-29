import { StopDropPropagationDirective } from './stop-drop-propagation.directive';
import { StopPropagationDirective } from './stop-propagation.directive';

export * from './stop-propagation.module';
export * from './stop-propagation.directive';
export * from './stop-drop-propagation.directive';

export const STOP_PROPAGATION_DIRECTIVES = [
  StopDropPropagationDirective,
  StopPropagationDirective
] as const;
