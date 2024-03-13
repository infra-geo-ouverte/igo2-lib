import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { EntityStore } from '@igo2/common';
import { MessageService, StorageService } from '@igo2/core';
import { ObjectUtils } from '@igo2/utils';

import { Observable, Subscription, catchError } from 'rxjs';
import { Md5 } from 'ts-md5';

import { CapabilitiesService } from '../../datasource/shared/capabilities.service';
import { IgoMap } from '../../map/shared/map';
import { standardizeUrl } from '../../utils/id-generator';
import { Catalog } from '../shared/catalog.abstract';
import { AddCatalogDialogComponent } from './add-catalog-dialog.component';

/**
 * Component to browse a list of available catalogs
 */
@Component({
  selector: 'igo-catalog-library',
  templateUrl: './catalog-library.component.html',
  styleUrls: ['./catalog-library.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogLibaryComponent implements OnInit, OnDestroy {
  /**
   * Store holding the catalogs
   */
  @Input() store: EntityStore<Catalog>;

  /**
   * Map to add the catalog items to
   */
  @Input() map: IgoMap;

  /**
   * Determine if the form to add a catalog is allowed
   */
  @Input() addCatalogAllowed: boolean = false;

  /**
   * Determine if the form to add a catalog is allowed
   */
  @Input() predefinedCatalogs: Catalog[] = [];

  /**
   * Event emitted a catalog is selected or unselected
   */
  @Output() catalogSelectChange = new EventEmitter<{
    selected: boolean;
    catalog: Catalog;
  }>();

  submitDisabled = true;
  private addingCatalog$$: Subscription;

  get addedCatalogs(): Catalog[] {
    return (this.storageService.get('addedCatalogs') || []) as Catalog[];
  }
  set addedCatalogs(catalogs: Catalog[]) {
    this.storageService.set('addedCatalogs', catalogs);
  }

  constructor(
    private capabilitiesService: CapabilitiesService,
    private messageService: MessageService,
    private storageService: StorageService,
    private dialog: MatDialog
  ) {}

  /**
   * @internal
   */
  ngOnInit() {
    this.store.state.clear();

    this.predefinedCatalogs = this.predefinedCatalogs.map((c) => {
      c.id = c.id ?? Md5.hashStr((c.type || 'wms') + standardizeUrl(c.url));
      c.title = c.title === '' || !c.title ? c.url : c.title;
      return c;
    });
  }

  getCatalogs(): Observable<Catalog[]> {
    return this.store.view.all$();
  }

  /**
   * When a catalog is selected, update it's state in the store
   * and emit the catalog select change event
   * @internal
   */
  onCatalogSelect(catalog: Catalog) {
    this.store.state.update(
      catalog,
      {
        selected: true,
        focused: true
      },
      true
    );
    this.catalogSelectChange.emit({ selected: true, catalog });
  }

  private unsubscribeAddingCatalog() {
    if (this.addingCatalog$$) {
      this.addingCatalog$$.unsubscribe();
    }
  }

  addCatalog(addedCatalog: Catalog) {
    if (!addedCatalog) {
      return;
    }
    let id =
      addedCatalog.id ??
      (Md5.hashStr(
        addedCatalog.type + standardizeUrl(addedCatalog.url)
      ) as string);

    const predefinedCatalog = this.predefinedCatalogs.find(
      (c) => c.id === addedCatalog.id
    );

    if (this.store.get(id)) {
      this.messageService.alert(
        'igo.geo.catalog.library.inlist.message',
        'igo.geo.catalog.library.inlist.title'
      );
      return;
    }
    this.unsubscribeAddingCatalog();
    if (predefinedCatalog) {
      predefinedCatalog.removable ??= true;
      this.handleAddCatalogToStore(predefinedCatalog);
    } else {
      this.addingCatalog$$ = this.capabilitiesService
        .getCapabilities(addedCatalog.type as any, addedCatalog.url)
        .pipe(
          catchError((e) => {
            if (e.error) {
              this.addCatalogDialog(true, addedCatalog);
              e.error.caught = true;
              return e;
            }
            this.messageService.error(
              'igo.geo.catalog.unavailable',
              'igo.geo.catalog.unavailableTitle',
              undefined,
              { value: addedCatalog.url }
            );
            throw e;
          })
        )
        .subscribe((capabilities) => {
          const catalogToAdd: Catalog = ObjectUtils.removeUndefined(
            Object.assign(
              {},
              {
                id,
                title: addedCatalog.title,
                url: addedCatalog.url,
                type: addedCatalog.type || 'wms',
                externalProvider: true,
                removable: true,
                version:
                  addedCatalog.type === 'wms' ? capabilities.version : '1.3.0'
              }
            )
          );
          this.handleAddCatalogToStore(catalogToAdd);
        });
    }
  }

  ngOnDestroy() {
    this.unsubscribeAddingCatalog();
  }

  private handleAddCatalogToStore(catalogToAdd: Catalog) {
    this.store.insert(catalogToAdd);
    this.addedCatalogs = [...this.addedCatalogs, catalogToAdd];
    this.unsubscribeAddingCatalog();
  }

  onCatalogRemove(catalog) {
    this.store.delete(catalog);
    this.addedCatalogs = this.addedCatalogs
      .slice(0)
      .filter((c) => c.id !== catalog.id);
  }

  addCatalogDialog(error?, addedCatalog?: Catalog) {
    const dialogRef = this.dialog.open(AddCatalogDialogComponent, {
      width: '700px',
      data: {
        predefinedCatalogs: this.predefinedCatalogs,
        store: this.store,
        error,
        addedCatalog
      }
    });

    dialogRef.afterClosed().subscribe((catalog) => {
      this.addCatalog(catalog);
    });
  }
}
