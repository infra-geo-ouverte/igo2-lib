import { CollapseDirective } from './collapse.directive';
import { CollapsibleComponent } from './collapsible.component';

export * from './collapsible.component';
export * from './collapsible.module';
export * from './collapse.directive';

export const COLLAPSIBLE_DIRECTIVES = [
  CollapsibleComponent,
  CollapseDirective
] as const;
