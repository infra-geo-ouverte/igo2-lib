import {
  BookmarkButtonComponent,
  BookmarkDialogComponent
} from './bookmark-button';
import { PoiButtonComponent } from './poi-button';
import { UserButtonComponent } from './user-button';

export * from './bookmark-button';
export * from './poi-button';
export * from './user-button';

export const CONTEXT_MAP_BUTTON_DIRECTIVES = [
  BookmarkButtonComponent,
  BookmarkDialogComponent,
  PoiButtonComponent,
  UserButtonComponent
] as const;
