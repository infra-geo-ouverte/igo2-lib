import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgoWidgetModule } from '@igo2/common';

import { provideOgcFilterWidget } from './widgets/widgets';

import { IgoOgcFilterModule } from './widgets/ogc-filter/ogc-filter.module';
import { IgoWorkspaceSelectorModule } from './workspace-selector/workspace-selector.module';
import { MatIconModule, MatButtonModule, MatTooltipModule } from '@angular/material';
import { WorkspaceButtonComponent } from './workspace-button/workspace-button.component';
import { IgoLanguageModule } from '@igo2/core';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    IgoWidgetModule,
    IgoWorkspaceSelectorModule,
    IgoOgcFilterModule,
    IgoLanguageModule
  ],
  exports: [
    IgoWorkspaceSelectorModule,
    IgoOgcFilterModule,
    WorkspaceButtonComponent
  ],
  declarations: [WorkspaceButtonComponent],
  providers: [
    provideOgcFilterWidget()
  ]
})
export class IgoGeoWorkspaceModule {}