import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

import { IgoWidgetModule } from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { IgoConfirmationPopupModule } from './confirmation-popup/confirmation-popup.module';
import { IgoInteractiveSelectionFormModule } from './widgets/interactive-selection/interactive-selection.module';
import { IgoOgcFilterModule } from './widgets/ogc-filter/ogc-filter.module';
import {
  provideInteractiveSelectionFormWidget,
  provideOgcFilterWidget
} from './widgets/widgets';
import { IgoWorkspaceSelectorModule } from './workspace-selector/workspace-selector.module';
import { IgoWorkspaceUpdatorModule } from './workspace-updator/workspace-updator.module';

@NgModule({
  imports: [
    CommonModule,
    IgoLanguageModule,
    IgoWidgetModule,
    IgoWorkspaceSelectorModule,
    IgoWorkspaceUpdatorModule,
    IgoOgcFilterModule,
    IgoInteractiveSelectionFormModule,
    MatDialogModule
  ],
  exports: [
    IgoWorkspaceSelectorModule,
    IgoWorkspaceUpdatorModule,
    IgoOgcFilterModule,
    IgoConfirmationPopupModule
  ],
  declarations: [],
  providers: [provideOgcFilterWidget(), provideInteractiveSelectionFormWidget()]
})
export class IgoGeoWorkspaceModule {}
