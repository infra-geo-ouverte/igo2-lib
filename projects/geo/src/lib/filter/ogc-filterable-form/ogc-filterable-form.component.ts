import { Component, Input } from '@angular/core';
import { OgcFilterableDataSource } from '../shared/ogc-filter.interface';
import { IgoMap } from '../../map';

@Component({
  selector: 'igo-ogc-filterable-form',
  templateUrl: './ogc-filterable-form.component.html'
})
export class OgcFilterableFormComponent {
  @Input()
  get datasource(): OgcFilterableDataSource {
    return this._dataSource;
  }
  set datasource(value: OgcFilterableDataSource) {
    this._dataSource = value;
  }

  @Input()
  get map(): IgoMap {
    return this._map;
  }
  set map(value: IgoMap) {
    this._map = value;
  }

  @Input() refreshFilters: Function;

  get refreshFunc() {
    return this.refreshFilters;
  }
  @Input()
  get showFeatureOnMap(): Boolean {
    return this._showFeatureOnMap;
  }
  set showFeatureOnMap(value: Boolean) {
    this._showFeatureOnMap = value;
  }

  private _showFeatureOnMap: Boolean;
  private _map: IgoMap;
  private _dataSource: OgcFilterableDataSource;

  public color = 'primary';

  constructor() {}
}
