import { NgModule } from '@angular/core';
import { WorkspaceButtonComponent } from './workspace-button/workspace-button.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
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
