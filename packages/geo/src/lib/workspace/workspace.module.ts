import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { IgoWidgetModule } from '@igo2/common';

import { provideOgcFilterWidget } from './widgets/widgets';

import { IgoLanguageModule } from '@igo2/core';
import { IgoOgcFilterModule } from './widgets/ogc-filter/ogc-filter.module';
import { IgoWorkspaceSelectorModule } from './workspace-selector/workspace-selector.module';
import { IgoWorkspaceUpdatorModule } from './workspace-updator/workspace-updator.module';
import { IgoConfirmationPopupModule } from './confirmation-popup/confirmation-popup.module';

@NgModule({
  imports: [
    CommonModule,
    IgoLanguageModule,
    IgoWidgetModule,
    IgoWorkspaceSelectorModule,
    IgoWorkspaceUpdatorModule,
    IgoOgcFilterModule,
    MatDialogModule
  ],
  exports: [
    IgoWorkspaceSelectorModule,
    IgoWorkspaceUpdatorModule,
    IgoOgcFilterModule,
    IgoConfirmationPopupModule
  ],
  declarations: [],
  providers: [
    provideOgcFilterWidget()
  ]
})
export class IgoGeoWorkspaceModule {}
