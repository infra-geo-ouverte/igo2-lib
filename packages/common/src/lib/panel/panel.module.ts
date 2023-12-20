import { NgModule } from '@angular/core';

import { PanelComponent } from './panel.component';

/**
 * @deprecated import the PanelComponent directly
 */
@NgModule({
  imports: [PanelComponent],
  exports: [PanelComponent]
})
export class IgoPanelModule {}
