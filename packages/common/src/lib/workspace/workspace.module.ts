import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IgoWorkspaceSelectorModule } from './workspace-selector/workspace-selector.module';
import { IgoWorkspaceWidgetOutletModule } from './workspace-widget-outlet/workspace-widget-outlet.module';

@NgModule({
  imports: [CommonModule],
  exports: [IgoWorkspaceSelectorModule, IgoWorkspaceWidgetOutletModule],
  declarations: []
})
export class IgoWorkspaceModule {}
