import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

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
