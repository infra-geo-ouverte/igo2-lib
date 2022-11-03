import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';

import { Layer } from '../../layer/shared/layers/layer';
import { IgoMap } from '../../map';

@Component({
  selector: 'igo-ogc-filterable-list',
  templateUrl: './ogc-filterable-list.component.html',
  styleUrls: ['./ogc-filterable-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OgcFilterableListComponent {

  @Input() layers: Layer[];

  @Input() map: IgoMap;

  constructor() {}
}
