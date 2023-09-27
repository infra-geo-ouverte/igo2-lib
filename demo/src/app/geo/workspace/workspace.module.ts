import { NgModule } from '@angular/core';

import {
  IgoActionModule,
  IgoEntityModule,
  IgoWorkspaceModule,
  IgoPanelModule
} from '@igo2/common';
import { IgoMapModule, IgoGeoWorkspaceModule } from '@igo2/geo';

import { AppWorkspaceComponent } from './workspace.component';
import { AppWorkspaceRoutingModule } from './workspace-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppWorkspaceComponent],
  imports: [
    SharedModule,
    AppWorkspaceRoutingModule,
    IgoActionModule,
    IgoEntityModule,
    IgoWorkspaceModule,
    IgoPanelModule,
    IgoMapModule,
    IgoGeoWorkspaceModule
  ],
  exports: [AppWorkspaceComponent]
})
export class AppWorkspaceModule {}
