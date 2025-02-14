import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ListComponent, ListItemDirective } from '@igo2/common/list';

import { AnyLayerOptions, LayerService } from '../../shared';
import { LayerUnavailableComponent } from '../layer-unavailable.component';

@Component({
  selector: 'igo-layer-unavailable-list',
  templateUrl: './layer-unavailable-list.component.html',
  styleUrls: ['./layer-unavailable-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ListComponent, ListItemDirective, LayerUnavailableComponent]
})
export class LayerUnavailableListComponent {
  @Input() layersOptions: AnyLayerOptions[];

  constructor(private layerService: LayerService) {}

  deleteUnavailableLayer(options: AnyLayerOptions): void {
    this.layerService.deleteUnavailableLayers(options);
  }
}
