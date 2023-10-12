import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PanelComponent } from './panel.component';

@NgModule({
  imports: [CommonModule],
  exports: [PanelComponent],
  declarations: [PanelComponent]
})
export class IgoPanelModule {}
