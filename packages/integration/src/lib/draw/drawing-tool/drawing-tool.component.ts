import {
    Component,
    ChangeDetectionStrategy
  } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { FeatureStore, Feature, IgoMap, DrawControl} from '@igo2/geo';
import { MapState } from '../../map/map.state';
import { DrawState } from '../draw.state';

/**
 * Tool to measure lengths and areas
 */
@ToolComponent({
    name: 'draw',
    title: 'igo.integration.tools.draw',
    icon: 'draw'
})
@Component({
    selector: 'igo-drawing-tool',
    templateUrl: './drawing-tool.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DrawingToolComponent {

/**
 * Map to measure on
 * @internal
 */
get stores(): FeatureStore<Feature>[] { return this.drawState.stores; }

/**
 * Map to measure on
 * @internal
 */
get map(): IgoMap { return this.mapState.map; }

get drawControls(): DrawControl[] { return this.drawState.drawControls}

constructor(
    private drawState: DrawState,
    private mapState: MapState
) {}

}
