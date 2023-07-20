import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

import { EntitySelectorComponent } from './entity-selector.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule
  ],
  exports: [EntitySelectorComponent],
  declarations: [EntitySelectorComponent]
})
export class IgoEntitySelectorModule {}
