import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ListItemDirective } from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core/language';

import { TimeFilterableDataSourceOptions } from '../../datasource/shared/datasources/wms-datasource.interface';
import { WMSDataSourceOptions } from '../../datasource/shared/datasources/wms-datasource.interface';
import { Layer } from '../../layer/shared/layers/layer';
import { IgoMap } from '../../map/shared/map';
import { TimeFilterItemComponent } from '../time-filter-item/time-filter-item.component';

@Component({
  selector: 'igo-time-filter-button',
  templateUrl: './time-filter-button.component.html',
  styleUrls: ['./time-filter-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatBadgeModule,
    TimeFilterItemComponent,
    ListItemDirective,
    IgoLanguageModule
  ]
})
export class TimeFilterButtonComponent implements OnInit {
  public options: TimeFilterableDataSourceOptions;

  get badge() {
    const filter = this.options.timeFilter as any;
    if (filter && filter.enabled) {
      return 1;
    } else {
      return;
    }
  }

  @Input()
  get layer(): Layer {
    return this._layer;
  }
  set layer(value: Layer) {
    this._layer = value;
    if (value) {
      this.options = this.layer.dataSource.options as WMSDataSourceOptions;
    }
  }
  private _layer;

  @Input() map: IgoMap;

  @Input() color: string = 'primary';

  @Input() header: boolean = true;

  public timeFilterCollapse = false;

  constructor() {}

  ngOnInit() {
    this.options = this.layer.dataSource.options as WMSDataSourceOptions;
  }
}
