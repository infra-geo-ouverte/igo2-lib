import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EntityStore } from '@igo2/common/entity';
import { ListComponent, ListItemDirective } from '@igo2/common/list';
import { IgoLanguageModule } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';
import { StorageScope, StorageService } from '@igo2/core/storage';
import { ObjectUtils } from '@igo2/utils';

import { Observable, Subscription, catchError } from 'rxjs';
import { Md5 } from 'ts-md5';

import { TypeCapabilitiesStrings } from '../../datasource/shared/capabilities.interface';
import { CapabilitiesService } from '../../datasource/shared/capabilities.service';
import { IgoMap } from '../../map/shared/map';
import { standardizeUrl } from '../../utils/id-generator';
import { Catalog } from '../shared/catalog.abstract';
import { AddCatalogDialogComponent } from './add-catalog-dialog.component';
import { CatalogLibraryItemComponent } from './catalog-library-item.component';

/**
 * Component to browse a list of available catalogs
 */
@Component({
  selector: 'igo-catalog-library',
  templateUrl: './catalog-library.component.html',
  styleUrls: ['./catalog-library.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ListComponent,
    CatalogLibraryItemComponent,
    ListItemDirective,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class CatalogLibraryComponent implements OnInit, OnDestroy {
  private capabilitiesService = inject(CapabilitiesService);
  private messageService = inject(MessageService);
  private storageService = inject(StorageService);
  private dialog = inject(MatDialog);

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
  @Input() addCatalogAllowed = false;

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

  get selectedCatalogId() {
    return this.storageService.get('selectedCatalogId', StorageScope.SESSION);
  }
  set selectedCatalogId(id) {
    this.storageService.set('selectedCatalogId', id, StorageScope.SESSION);
  }

  /**
   * @internal
   */
  ngOnInit() {
    this.store.state.clear();

    if (this.selectedCatalogId) {
      const selectedCatalog = this.store
        .all()
        .find((item) => item.id === this.selectedCatalogId);
      if (selectedCatalog) {
        this.onCatalogSelect(selectedCatalog);
      }
    }
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
    this.store.state.update(catalog, { selected: true, focused: true }, true);
    this.selectedCatalogId = catalog.id;
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
    const id =
      addedCatalog.id ??
      Md5.hashStr(addedCatalog.type + standardizeUrl(addedCatalog.url));

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
        .getCapabilities(
          addedCatalog.type as TypeCapabilitiesStrings,
          addedCatalog.url
        )
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
