import {
  Directive,
  Self,
  OnInit,
  OnDestroy,
  HostListener
} from '@angular/core';
import { Subscription } from 'rxjs';

import { CatalogService } from '../shared/catalog.service';
import { Catalog } from '../shared/catalog.interface';
import { CatalogListComponent } from './catalog-list.component';

@Directive({
  selector: '[igoCatalogListBinding]'
})
export class CatalogListBindingDirective implements OnInit, OnDestroy {
  private component: CatalogListComponent;
  private catalogs$$: Subscription;

  @HostListener('select', ['$event'])
  onSelect(catalog: Catalog) {
    this.catalogService.selectCatalog(catalog);
  }

  constructor(
    @Self() component: CatalogListComponent,
    private catalogService: CatalogService
  ) {
    this.component = component;
  }

  ngOnInit() {
    // Override input catalogs
    this.catalogs$$ = this.catalogService.catalogs$.subscribe(catalogs =>
      this.handleCatalogsChange(catalogs)
    );

    this.catalogService.load();
  }

  ngOnDestroy() {
    this.catalogs$$.unsubscribe();
  }

  private handleCatalogsChange(catalogs: Catalog[]) {
    this.component.catalogs = catalogs;
  }
}
