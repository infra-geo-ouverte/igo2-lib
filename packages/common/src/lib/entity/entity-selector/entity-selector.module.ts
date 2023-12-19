import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

import { EntitySelectorComponent } from './entity-selector.component';

/**
 * @ignore
 */
@NgModule({
    imports: [CommonModule, FormsModule, MatSelectModule, EntitySelectorComponent],
    exports: [EntitySelectorComponent]
})
export class IgoEntitySelectorModule {}
