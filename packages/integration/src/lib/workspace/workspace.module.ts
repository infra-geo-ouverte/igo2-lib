import { NgModule } from '@angular/core';
import { WorkspaceButtonComponent } from './workspace-button/workspace-button.component';
import { MatIconModule, MatButtonModule, MatTooltipModule } from '@angular/material';
import { IgoLanguageModule } from '@igo2/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    IgoLanguageModule
  ],
  declarations: [WorkspaceButtonComponent],
  exports: [WorkspaceButtonComponent]
})
export class IgoAppWorkspaceModule {}
