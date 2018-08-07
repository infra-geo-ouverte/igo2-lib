import { Component, Input } from '@angular/core';
import { OgcFilterableDataSource } from '../shared/ogc-filter.interface';

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
  private _dataSource: OgcFilterableDataSource;

  public color = 'primary';

  constructor() {}
}
