import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { DataSource } from '../../datasource/shared/datasources/datasource';

@Component({
  selector: 'igo-ogc-filterable-list',
  templateUrl: './ogc-filterable-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OgcFilterableListComponent {
  @Input()
  get datasources(): DataSource[] {
    return this._dataSources;
  }
  set datasources(value: DataSource[]) {
    this._dataSources = value;
    this.cdRef.detectChanges();
  }
  private _dataSources: DataSource[] = [];

  constructor(private cdRef: ChangeDetectorRef) {}
}
