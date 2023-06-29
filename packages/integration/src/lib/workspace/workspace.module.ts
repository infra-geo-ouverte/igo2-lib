import { NgModule } from '@angular/core';
import { WorkspaceButtonComponent } from './workspace-button/workspace-button.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatIconModule } from '@angular/material/icon';
import { IgoLanguageModule } from '@igo2/core';
import { CommonModule, DatePipe } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    IgoLanguageModule
  ],
  declarations: [WorkspaceButtonComponent],
  exports: [WorkspaceButtonComponent],
  providers: [DatePipe]
})
export class IgoAppWorkspaceModule {}
