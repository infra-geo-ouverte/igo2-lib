import { ModuleWithProviders, NgModule } from '@angular/core';

import { BookmarkButtonComponent } from './bookmark-button/bookmark-button.component';
import { BookmarkDialogComponent } from './bookmark-button/bookmark-dialog.component';
import { PoiButtonComponent } from './poi-button/poi-button.component';
import { PoiService } from './poi-button/shared/poi.service';
import { UserButtonComponent } from './user-button/user-button.component';

/**
 * @deprecated import the components/directives directly or CONTEXT_MAP_BUTTON_DIRECTIVES for the set
 */
@NgModule({
  imports: [
    BookmarkButtonComponent,
    BookmarkDialogComponent,
    PoiButtonComponent,
    UserButtonComponent
  ],
  exports: [
    BookmarkButtonComponent,
    PoiButtonComponent,
    UserButtonComponent,
    BookmarkDialogComponent
  ],
  providers: [PoiService]
})
export class IgoContextMapButtonModule {
  static forRoot(): ModuleWithProviders<IgoContextMapButtonModule> {
    return {
      ngModule: IgoContextMapButtonModule
    };
  }
}
