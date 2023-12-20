import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Layer } from '../../layer/shared/layers/layer';
import { IgoMap } from '../../map/shared/map';
import { FilterableDataSourcePipe } from '../shared/filterable-datasource.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { ListItemDirective } from '../../../../../common/src/lib/list/list-item.directive';
import { OgcFilterableItemComponent } from '../ogc-filterable-item/ogc-filterable-item.component';
import { NgIf, NgFor } from '@angular/common';
import { ListComponent } from '../../../../../common/src/lib/list/list.component';

@Component({
    selector: 'igo-ogc-filterable-list',
    templateUrl: './ogc-filterable-list.component.html',
    styleUrls: ['./ogc-filterable-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ListComponent, NgIf, NgFor, OgcFilterableItemComponent, ListItemDirective, TranslateModule, FilterableDataSourcePipe]
})
export class OgcFilterableListComponent {
  @Input() layers: Layer[];

  @Input() map: IgoMap;

  constructor() {}
}
