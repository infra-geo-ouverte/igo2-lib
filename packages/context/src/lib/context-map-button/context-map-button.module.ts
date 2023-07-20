import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyOptionModule as MatOptionModule } from '@angular/material/legacy-core';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { IgoLanguageModule } from '@igo2/core';
import { IgoConfirmDialogModule, IgoStopPropagationModule } from '@igo2/common';
import { IgoAuthModule } from '@igo2/auth';

import { BookmarkButtonComponent } from './bookmark-button/bookmark-button.component';
import { BookmarkDialogComponent } from './bookmark-button/bookmark-dialog.component';
import { PoiButtonComponent } from './poi-button/poi-button.component';
import { PoiDialogComponent } from './poi-button/poi-dialog.component';
import { PoiService } from './poi-button/shared/poi.service';
import { UserDialogComponent } from './user-button/user-dialog.component';
import { UserButtonComponent } from './user-button/user-button.component';

@NgModule({
  imports: [
    CommonModule,
    IgoLanguageModule,
    IgoConfirmDialogModule,
    IgoStopPropagationModule,
    IgoAuthModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatDialogModule,
    MatInputModule
  ],
  exports: [BookmarkButtonComponent, PoiButtonComponent, UserButtonComponent, BookmarkDialogComponent],
  declarations: [
    BookmarkButtonComponent,
    BookmarkDialogComponent,
    PoiButtonComponent,
    PoiDialogComponent,
    UserButtonComponent,
    UserDialogComponent
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
