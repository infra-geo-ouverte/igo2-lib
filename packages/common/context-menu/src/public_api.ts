import { ContextMenuDirective } from './context-menu.directive';
import { LongPressDirective } from './long-press.directive';

export * from './context-menu.module';
export * from './context-menu.directive';
export * from './long-press.directive';

export const CONTEXT_MENU_DIRECTIVES = [
  ContextMenuDirective,
  LongPressDirective
] as const;
