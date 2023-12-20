import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoAuthModule } from '@igo2/auth';
import { IgoConfirmDialogModule, IgoStopPropagationModule } from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { BookmarkButtonComponent } from './bookmark-button/bookmark-button.component';
import { BookmarkDialogComponent } from './bookmark-button/bookmark-dialog.component';
import { PoiButtonComponent } from './poi-button/poi-button.component';
import { PoiDialogComponent } from './poi-button/poi-dialog.component';
import { PoiService } from './poi-button/shared/poi.service';
import { UserButtonComponent } from './user-button/user-button.component';
import { UserDialogComponent } from './user-button/user-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IgoAuthModule,
    IgoConfirmDialogModule,
    IgoLanguageModule,
    IgoStopPropagationModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatTooltipModule,
    BookmarkButtonComponent,
    BookmarkDialogComponent,
    PoiButtonComponent,
    PoiDialogComponent,
    UserButtonComponent,
    UserDialogComponent
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
