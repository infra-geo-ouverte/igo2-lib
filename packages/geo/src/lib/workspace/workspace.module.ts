import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

import { IgoWidgetModule } from '@igo2/common';

import { IgoOgcFilterModule } from './widgets/ogc-filter/ogc-filter.module';
import { provideOgcFilterWidget } from './widgets/widgets';
import { IgoWorkspaceSelectorModule } from './workspace-selector/workspace-selector.module';

@NgModule({
  imports: [
    IgoWidgetModule,
    IgoOgcFilterModule,
    IgoWorkspaceSelectorModule,
    MatDialogModule
  ],
  exports: [IgoOgcFilterModule],
  providers: [provideOgcFilterWidget()]
})
export class IgoGeoWorkspaceModule {}
