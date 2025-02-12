import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ListComponent, ListItemDirective } from '@igo2/common/list';
import { IgoLanguageModule } from '@igo2/core/language';

import { AnyLayer } from '../../layer';
import { MapBase } from '../../map/shared/map.abstract';
import { OgcFilterableItemComponent } from '../ogc-filterable-item/ogc-filterable-item.component';
import { FilterableDataSourcePipe } from '../shared/filterable-datasource.pipe';

@Component({
  selector: 'igo-ogc-filterable-list',
  templateUrl: './ogc-filterable-list.component.html',
  styleUrls: ['./ogc-filterable-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ListComponent,
    NgIf,
    NgFor,
    OgcFilterableItemComponent,
    ListItemDirective,
    IgoLanguageModule,
    FilterableDataSourcePipe
  ]
})
export class OgcFilterableListComponent {
  @Input() layers: AnyLayer[];

  @Input() map: MapBase;
}
