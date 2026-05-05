import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input
} from '@angular/core';

import { ListComponent, ListItemDirective } from '@igo2/common/list';

import { AnyLayerOptions, LayerService } from '../../shared';
import { LayerUnavailableComponent } from '../layer-unavailable.component';

@Component({
  selector: 'igo-layer-unavailable-list',
  templateUrl: './layer-unavailable-list.component.html',
  styleUrls: ['./layer-unavailable-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ListComponent, ListItemDirective, LayerUnavailableComponent]
})
export class LayerUnavailableListComponent {
  private layerService = inject(LayerService);

  readonly layersOptions = input<AnyLayerOptions[]>(undefined);

  deleteUnavailableLayer(options: AnyLayerOptions): void {
    this.layerService.deleteUnavailableLayers(options);
  }
}
