import {
  ChangeDetectionStrategy,
  Component,
  input,
  model
} from '@angular/core';

import { ListComponent, ListItemDirective } from '@igo2/common/list';
import { IgoLanguageModule } from '@igo2/core/language';

import type { AnyLayer } from '../../layer';
import type { MapBase } from '../../map/shared/map.abstract';
import { OgcFilterableItemComponent } from '../ogc-filterable-item/ogc-filterable-item.component';
import { FilterableDataSourcePipe } from '../shared/filterable-datasource.pipe';

@Component({
  selector: 'igo-ogc-filterable-list',
  templateUrl: './ogc-filterable-list.component.html',
  styleUrls: ['./ogc-filterable-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ListComponent,
    OgcFilterableItemComponent,
    ListItemDirective,
    IgoLanguageModule,
    FilterableDataSourcePipe
  ]
})
export class OgcFilterableListComponent {
  readonly layers = model<AnyLayer[]>(undefined);

  readonly map = input<MapBase>(undefined);

  setLayers(layers: AnyLayer[]): void {
    this.layers.set(layers);
  }
}
