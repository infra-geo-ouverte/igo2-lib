import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCardModule,
  MatButtonModule,
  MatIconModule
} from '@angular/material';

import {
  IgoActionModule,
  IgoEntityModule,
  IgoWorkspaceModule,
  IgoPanelModule
} from '@igo2/common';
import {
  IgoMapModule,
  IgoGeoWorkspaceModule
} from '@igo2/geo';

import { AppWorkspaceComponent } from './workspace.component';
import { AppWorkspaceRoutingModule } from './workspace-routing.module';

@NgModule({
  declarations: [AppWorkspaceComponent],
  imports: [
    CommonModule,
    AppWorkspaceRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
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
