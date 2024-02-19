import { ListItemDirective } from './list-item.directive';
import { ListComponent } from './list.component';

export * from './list.component';
export * from './list-item.directive';

export const LIST_DIRECTIVES = [ListItemDirective, ListComponent] as const;
