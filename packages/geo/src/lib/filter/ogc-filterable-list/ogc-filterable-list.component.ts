import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ListComponent, ListItemDirective } from '@igo2/common';

import { TranslateModule } from '@ngx-translate/core';

import { Layer } from '../../layer/shared/layers/layer';
import { IgoMap } from '../../map/shared/map';
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
    TranslateModule,
    FilterableDataSourcePipe
  ]
})
export class OgcFilterableListComponent {
  @Input() layers: Layer[];

  @Input() map: IgoMap;

  constructor() {}
}
