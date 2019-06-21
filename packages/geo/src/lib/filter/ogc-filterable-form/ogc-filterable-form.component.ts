import { Component, Input } from '@angular/core';
import { OgcFilterableDataSource } from '../shared/ogc-filter.interface';
import { IgoMap } from '../../map';

@Component({
  selector: 'igo-ogc-filterable-form',
  templateUrl: './ogc-filterable-form.component.html'
})
export class OgcFilterableFormComponent {
  set datasource(value: OgcFilterableDataSource) {
    this._dataSource = value;
  }

  @Input()
  get datasource(): OgcFilterableDataSource {
    return this._dataSource;
  }

  set map(value: IgoMap) {
    this._map = value;
  }

  @Input()
  get map(): IgoMap {
    return this._map;
  }

  @Input() refreshFilters: () => void;

  get refreshFunc() {
    return this.refreshFilters;
  }

  set showFeatureOnMap(value: boolean) {
    this._showFeatureOnMap = value;
  }

  @Input()
  get showFeatureOnMap(): boolean {
    return this._showFeatureOnMap;
  }

  get advancedOgcFilters(): boolean {
    if (this.datasource.options.ogcFilters) {
      return this.datasource.options.ogcFilters.advancedOgcFilters;
    }
    return;
  }

  private _showFeatureOnMap: boolean;
  private _map: IgoMap;
  private _dataSource: OgcFilterableDataSource;

  public color = 'primary';

  constructor() {}
}
