import { Component, Input } from '@angular/core';
import { OgcFilterableDataSource } from '../../datasource';

@Component({
  selector: 'igo-ogc-filterable-form',
  templateUrl: './ogc-filterable-form.component.html',
  styleUrls: ['./ogc-filterable-form.component.styl']
})
export class OgcFilterableFormComponent {

  @Input()
  get datasource(): OgcFilterableDataSource { return this._dataSource; }
  set datasource(value: OgcFilterableDataSource) {
    this._dataSource = value;
  }
  private _dataSource: OgcFilterableDataSource;

  constructor() {}

}
