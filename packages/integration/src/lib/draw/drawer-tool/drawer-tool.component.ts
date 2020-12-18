import {
    Component,
    ChangeDetectionStrategy
  } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { FeatureStore, Feature, IgoMap } from '@igo2/geo';
import { MapState } from '../../map/map.state';
import { DrawState } from '../draw.state';

/**
 * Tool to measure lengths and areas
 */
@ToolComponent({
    name: 'drawer',
    title: 'igo.integration.tools.drawer',
    icon: 'pencil'
})
@Component({
    selector: 'igo-drawer-tool',
    templateUrl: './drawer-tool.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DrawerToolComponent {

/**
 * Map to measure on
 * @internal
 */
get store(): FeatureStore<Feature> { return this.drawState.store; }

/**
 * Map to measure on
 * @internal
 */
get map(): IgoMap { return this.mapState.map; }

constructor(
    private drawState: DrawState,
    private mapState: MapState
) {}

}
