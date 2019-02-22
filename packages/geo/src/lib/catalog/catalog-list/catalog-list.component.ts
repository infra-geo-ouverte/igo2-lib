import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';

import { Catalog } from '../shared';

@Component({
  selector: 'igo-catalog-list',
  templateUrl: './catalog-list.component.html'
})
export class CatalogListComponent {
  @Input()
  get catalogs(): Catalog[] {
    return this._catalogs;
  }
  set catalogs(value: Catalog[]) {
    this._catalogs = value;
  }
  private _catalogs: Catalog[];

  @Input()
  get selectedCatalog(): Catalog {
    return this._selectedCatalog;
  }
  set selectedCatalog(value: Catalog) {
    this._selectedCatalog = value;
    this.cdRef.detectChanges();
  }
  private _selectedCatalog: Catalog;

  @Output() select = new EventEmitter<Catalog>();
  @Output() unselect = new EventEmitter<Catalog>();

  constructor(private cdRef: ChangeDetectorRef) {}
}
