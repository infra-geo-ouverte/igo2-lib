import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PanelComponent } from './panel.component';

@NgModule({
    imports: [CommonModule, PanelComponent],
    exports: [PanelComponent]
})
export class IgoPanelModule {}
