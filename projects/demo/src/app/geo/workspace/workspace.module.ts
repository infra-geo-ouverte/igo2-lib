import { NgModule } from '@angular/core';

import {
  IgoActionModule,
  IgoEntityModule,
  IgoPanelModule,
  IgoWorkspaceModule
} from '@igo2/common';
import { IgoGeoWorkspaceModule, IgoMapModule } from '@igo2/geo';

import { SharedModule } from '../../shared/shared.module';
import { AppWorkspaceRoutingModule } from './workspace-routing.module';
import { AppWorkspaceComponent } from './workspace.component';

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
