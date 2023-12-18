import { NgModule } from '@angular/core';

import {
  IgoActionModule,
  IgoEntityModule,
  IgoPanelModule,
  IgoWorkspaceModule
} from '@igo2/common';
import { IgoGeoWorkspaceModule, IgoMapModule } from '@igo2/geo';


import { AppWorkspaceRoutingModule } from './workspace-routing.module';
import { AppWorkspaceComponent } from './workspace.component';

@NgModule({
  imports: [
    AppWorkspaceRoutingModule,
    IgoActionModule,
    IgoEntityModule,
    IgoWorkspaceModule,
    IgoPanelModule,
    IgoMapModule,
    IgoGeoWorkspaceModule,
    AppWorkspaceComponent
],
  exports: [AppWorkspaceComponent]
})
export class AppWorkspaceModule {}
