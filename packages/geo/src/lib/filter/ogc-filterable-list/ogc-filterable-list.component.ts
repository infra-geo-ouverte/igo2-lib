import { ChangeDetectionStrategy, Component, model } from '@angular/core';

import { ListComponent, ListItemDirective } from '@igo2/common/list';
import { IgoLanguageModule } from '@igo2/core/language';

import type { AnyLayer } from '../../layer';
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
  readonly layers = model.required<AnyLayer[]>();

  setLayers(layers: AnyLayer[]): void {
    this.layers.set(layers);
  }
}
