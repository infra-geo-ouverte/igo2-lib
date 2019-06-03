import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgoWidgetModule } from '@igo2/common';

import { provideOgcFilterWidget } from './widgets/widgets';

import { IgoOgcFilterModule } from './widgets/ogc-filter/ogc-filter.module';
import { IgoWorkspaceSelectorModule } from './workspace-selector/workspace-selector.module';

@NgModule({
  imports: [
    CommonModule,
    IgoWidgetModule,
    IgoWorkspaceSelectorModule,
    IgoOgcFilterModule
  ],
  exports: [
    IgoWorkspaceSelectorModule,
    IgoOgcFilterModule
  ],
  declarations: [],
  providers: [
    provideOgcFilterWidget()
  ]
})
export class IgoGeoWorkspaceModule {}
