import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core';

import { WorkspaceButtonComponent } from './workspace-button/workspace-button.component';

@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        IgoLanguageModule,
        WorkspaceButtonComponent
    ],
    exports: [WorkspaceButtonComponent],
    providers: [DatePipe]
})
export class IgoAppWorkspaceModule {}
