import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { DrawComponent } from '@igo2/geo';

import { DrawingToolComponent } from './drawing-tool.component';

/**
 * @ignore
 */
@NgModule({
    imports: [DrawComponent, DrawingToolComponent],
    exports: [DrawingToolComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppDrawingToolModule {}
