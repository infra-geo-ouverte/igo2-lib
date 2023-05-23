import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { EntityStore } from '@igo2/common';
import { MessageService, StorageService } from '@igo2/core';
import { ObjectUtils } from '@igo2/utils';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Md5 } from 'ts-md5';
import { CapabilitiesService } from '../../datasource';
import { IgoMap } from '../../map';
import { standardizeUrl } from '../../utils/id-generator';

import { Catalog } from '../shared/catalog.abstract';
import { CatalogItemType } from '../shared/catalog.enum';
import { CatalogItem, CatalogItemGroup } from '../shared/catalog.interface';
import { CatalogService } from '../shared/catalog.service';
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
    private dialog: MatDialog,
    private catalogService: CatalogService
  ) {}

  /**
   * @internal
   */
  ngOnInit() {
    this.store.state.clear();

    this.predefinedCatalogs = this.predefinedCatalogs.map(c => {
      c.id = Md5.hashStr(
        (c.type || 'wms') + standardizeUrl(c.url)
      ) as string;
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
    let id = Md5.hashStr(
      addedCatalog.type + standardizeUrl(addedCatalog.url)
    ) as string;
    const predefinedCatalog = this.predefinedCatalogs.find(
      (c) => c.id === addedCatalog.id
    );

    if (predefinedCatalog) {
      addedCatalog.version = predefinedCatalog.version;
      addedCatalog.externalProvider = predefinedCatalog.externalProvider;
      id = predefinedCatalog.id;
    }

    if (this.store.get(id)) {
      this.messageService.alert('igo.geo.catalog.library.inlist.message', 'igo.geo.catalog.library.inlist.title');
      return;
    }
    this.unsubscribeAddingCatalog();

    this.addingCatalog$$ = this.capabilitiesService
    .getCapabilities(addedCatalog.type as any, addedCatalog.url, addedCatalog.version)
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
            { value: addedCatalog.url });
          throw e;
        })
      )
      .subscribe((capabilities) => {
        let title;
        let version;
        switch (addedCatalog.type) {
          case 'wms':
            title = addedCatalog.title || capabilities.Service.Title;
            version = addedCatalog.version || capabilities.version;
            break;
          case 'arcgisrest':
          case 'imagearcgisrest':
          case 'tilearcgisrest':
            title = addedCatalog.title || capabilities.mapName;
            break;
          case 'wmts':
            title =
              addedCatalog.title ||
              capabilities.ServiceIdentification.ServiceType;
            break;
          default:
            title = addedCatalog.title;
        }

        const catalogToAdd = ObjectUtils.removeUndefined(
          Object.assign({},
            predefinedCatalog,
            ObjectUtils.removeUndefined({
              id,
              title,
              url: addedCatalog.url,
              type: addedCatalog.type || 'wms',
              externalProvider: addedCatalog.externalProvider || false,
              removable: true,
              version
            })) as Catalog);
        this.store.insert(catalogToAdd);
        const newCatalogs = this.addedCatalogs.slice(0);
        newCatalogs.push(catalogToAdd);
        this.addedCatalogs = newCatalogs;
        this.unsubscribeAddingCatalog();
      });
  }

  ngOnDestroy() {
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

  getCatalogList(){
    var catalogRank = 1;
    let bufferArray = [["rang Catalog", "Nom de la couche - Catalogue", "Nom du groupe de couche - Catalogue",
      "Nom de la thématique", "Gestionnaire du service", "URL (Intranet/Internet", "Nom du fichier - Service Web",
      "Contexte/Thématique PlaniActifs", "Description de la donnée"]];
    var dataArray = [];
    this.store.entities$.pipe(switchMap(catalogs => {
        return forkJoin(catalogs.map(ca => this.catalogService.loadCatalogItems(ca)));
    })).subscribe(res => {
        console.log('res', res);
        res.forEach(element => {
            element.forEach((catalogItemGroup: CatalogItemGroup) => {
              if (catalogItemGroup.items) {
                catalogItemGroup.items.forEach((item: any) => {
                  //à l'intérieur du array(22) Dans GouvOuvert
                    dataArray = [];
                    var gestionnaire = "MTQ";
                    if(item.externalProvider !== undefined){
                        if(item.externalProvider === true)
                            gestionnaire = "Externe";
                    }
                    dataArray.push(catalogRank, item.title, catalogItemGroup.address, "thématique", gestionnaire, item.options.sourceOptions.url, 
                      item.options.sourceOptions.layer, "contexte/thematique planiactifs", item.options.metadata.abstract);
                  bufferArray.push(dataArray);
                  catalogRank++;
                });
              }
              else{ //is directly an item
                var itemGroupWMTS: any = catalogItemGroup;
                if(!itemGroupWMTS.options){
                  dataArray.push(Object.keys(catalogItemGroup).map(key => catalogItemGroup[key]));
                  bufferArray.push(dataArray);
                }
                else{ 
                  //wmts, items directement, avec options 
                  dataArray = [];
                  var gestionnaire = "MTQ";
                  if(itemGroupWMTS.externalProvider !== undefined){
                      if(itemGroupWMTS.externalProvider === true)
                          gestionnaire = "Externe";
                  }
                  dataArray.push(catalogRank, itemGroupWMTS.title, itemGroupWMTS.address, "thématique", gestionnaire, itemGroupWMTS.options.sourceOptions.url, 
                    itemGroupWMTS.options.sourceOptions.layer, "contextethematique planiactifs", itemGroupWMTS.options.metadata.abstract);

                  bufferArray.push(dataArray);
                  catalogRank++;
                }
              }
            });
        });
        console.log("bufferArray", bufferArray);

        let csvContent = bufferArray.map(e => e.join(";")).join("\n");
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", "data:text/csv;charset=utf-8,%EF%BB%BF" + encodedUri);
        link.setAttribute("download", "liste_couches.csv");
        document.body.appendChild(link); // Required for FF
        link.click(); // This will download the data file named "my_data.csv".
        document.body.removeChild(link);
    });
  }
}
