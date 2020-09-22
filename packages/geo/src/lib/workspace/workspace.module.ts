import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgoWidgetModule } from '@igo2/common';

import { provideOgcFilterWidget } from './widgets/widgets';

import { IgoOgcFilterModule } from './widgets/ogc-filter/ogc-filter.module';
import { IgoWorkspaceSelectorModule } from './workspace-selector/workspace-selector.module';
import { IgoWorkspaceUpdatorModule } from './workspace-updator/workspace-updator.module';

@NgModule({
  imports: [
    CommonModule,
    IgoWidgetModule,
    IgoWorkspaceSelectorModule,
    IgoWorkspaceUpdatorModule,
    IgoOgcFilterModule
  ],
  exports: [
    IgoWorkspaceSelectorModule,
    IgoWorkspaceUpdatorModule,
    IgoOgcFilterModule
  ],
  declarations: [],
  providers: [
    provideOgcFilterWidget()
  ]
})
export class IgoGeoWorkspaceModule {}
