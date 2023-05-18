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

  private getItemList(itemObject){
    var returnItemObjectList = [];
    for(var itemObjectList of Object.keys(itemObject).map(key => itemObject[key])){
      if(typeof itemObjectList === 'object'){
        returnItemObjectList.push(this.getItemList(itemObjectList));
      }else
        returnItemObjectList.push(itemObjectList);
    }
    return returnItemObjectList;
  }

  getCatalogList2(){
    console.log("gatCatalogList() accessed");
    // id | url_igo | source | index | layer | minscaledenom | maxscaledenom | extern | catalog | sort_s | parent | sort_p | title | abstract | ressource

    let bufferArray = [["id", "Group type", "Group title", "Group address", "external provider", 
        "item id", "item type", "item title", "item address", "external provider", "MaxRes", "MinRes", "Metadata url", 
            "Extern", "abstract", "type", "source type", "source url", "optionsFromCapabilities", "params"]];
    var dataArray = [];
    this.store.entities$.pipe(switchMap(catalogs => {
        return forkJoin(catalogs.map(ca => this.catalogService.loadCatalogItems(ca)));
    })).subscribe(res => {
        console.log('res', res);
        res.forEach(element => {
            element.forEach(catalogItemGroup => {
              var itemGroup: CatalogItemGroup = catalogItemGroup;
                if (itemGroup.items) {
                  itemGroup.items.forEach(item => {
                    dataArray = [];
                    //push data de catalogItemGroup
                    var dataCatalogGroup = Object.keys(catalogItemGroup).map(key => catalogItemGroup[key]);
                    for(var dataCatalogGroupUnique of dataCatalogGroup){
                        if((typeof dataCatalogGroupUnique != 'object') && (dataCatalogGroupUnique != undefined)){
                            dataArray.push(dataCatalogGroupUnique);
                        }
                    }
                    // max res, minRes, metadata, tooltip, sourceOptions
                    var data = Object.keys(item).map(key => item[key]);
                    for (var a of data) {
                        if (typeof a === 'object') {
                            var metadata = Object.keys(a).map(key => a[key]);
                            //Metadata and SourceOptions
                            for (var metadataList of metadata) {
                                if (typeof metadataList === 'object') {

                                  //ajout de metadata et sourceoptions spécifiquement
                                  //metadata
                                  if(metadataList.abstract || metadataList.extern){
                                    if(metadataList.url)
                                      dataArray.push(metadataList.url, metadataList.extern, metadataList.abstract, metadataList.type);
                                    else
                                      dataArray.push(null, metadataList.extern, metadataList.abstract, metadataList.type);
                                  }

                                  //sourceOptions
                                  if(metadataList.optionsFromCapabilities || metadataList.params){
                                    dataArray.push(metadataList.type, metadataList.url, metadataList.optionsFromCapabilities);
                                    //params
                                    //var params = Object.keys(metadataList.params).map(key => metadataList.params[key]);
                                    for(var params of (Object.keys(metadataList.params).map(key => metadataList.params[key]))){
                                      dataArray.push(params);
                                    }
                                  }

                                  /*
                                    for (var metadataItem of Object.keys(metadataList).map(key => metadataList[key])) {
                                        dataArray.push(metadataItem);     
                                    }*/
                                }
                                else
                                    dataArray.push(metadataList);
                            }//Metadata and SourceOptions end
                        }
                        else {
                            dataArray.push(a);
                        }
                    }
                  });
                  bufferArray.push(dataArray);
                }
                else {
                    dataArray.push(Object.keys(catalogItemGroup).map(key => catalogItemGroup[key]));
                }
            });
        });
        console.log("bufferArray", bufferArray);

        let csvContent = bufferArray.map(e => e.join(";")).join("\n");
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", "data:text/csv;charset=utf-8,%EF%BB%BF" + encodedUri);
        link.setAttribute("download", "demo.csv");
        document.body.appendChild(link); // Required for FF
        link.click(); // This will download the data file named "my_data.csv".
        document.body.removeChild(link);
    });
}

  getCatalogList() {
    let bufferArray = [["id", "Group type", "Group title", "Group address", "external provider", 
        "item id", "item type", "item title", "item address", "external provider", "MaxRes", "MinRes", "Metadata url", 
            "Extern", "abstract", "type", "source type", "source url", "optionsFromCapabilities", "params"]];
    var dataArray = [];
    this.store.entities$.pipe(switchMap(catalogs => {
        return forkJoin(catalogs.map(ca => this.catalogService.loadCatalogItems(ca)));
    })).subscribe(res => {
        console.log('res', res);
        res.forEach(element => {
            element.forEach(catalogItemGroup => {
              var itemGroup: CatalogItemGroup = catalogItemGroup;
              if (itemGroup.items) {
                itemGroup.items.forEach(item => {
                    
                    //à l'intérieur du array(22) Dans GouvOuvert
                    dataArray = [];
                    //push data de catalogItemGroup
                    var dataCatalogGroup = Object.keys(catalogItemGroup).map(key => catalogItemGroup[key]);
                    for (var dataCatalogGroupUnique of dataCatalogGroup) {
                        if ((typeof dataCatalogGroupUnique != 'object') && (dataCatalogGroupUnique != undefined)) {
                            dataArray.push(dataCatalogGroupUnique);
                        }
                    }
                    // max res, minRes, metadata, tooltip, sourceOptions
                    var data = Object.keys(item).map(key => item[key]);
                    for (var a of data) { // intérieur d'un item: address, external provider, id, options, title, type
                        if(a === 'a8401b172111523b6b8bc3285b49b19f'){
                            console.log("s");
                        }
                        if (typeof a === 'object') { // si c'est options
                            var options = Object.keys(a).map(key => a[key]);
                            for (var optionsObject of options) {
                                if(typeof optionsObject === 'object'){
                                    if (optionsObject.abstract || optionsObject.extern) {
                                        //metadata
                                        if (optionsObject.url)
                                            dataArray.push(optionsObject.url, optionsObject.extern, optionsObject.abstract, optionsObject.type);
                                        else
                                            dataArray.push(null, optionsObject.extern, optionsObject.abstract, optionsObject.type);
                                    }
                                    else if (optionsObject.optionsFromCapabilities || optionsObject.params) {
                                        //sourceOptions
                                        if (optionsObject.url)
                                            dataArray.push(optionsObject.type, optionsObject.url, optionsObject.optionsFromCapabilities, optionsObject.params);
                                        else
                                            dataArray.push(optionsObject.type, null, optionsObject.optionsFromCapabilities, optionsObject.params);
                                    }
                                }
                                else
                                    dataArray.push(optionsObject); // minRes, maxRes
                            }
                            
                        } //Metadata and SourceOptions end
                        else {
                            dataArray.push(a);
                        }
                    }
                    bufferArray.push(dataArray);
                });
            }
            else {
                  var itemGroupWMTS: any = itemGroup;
                  if(!itemGroupWMTS.options){
                    dataArray.push(Object.keys(catalogItemGroup).map(key => catalogItemGroup[key]));
                    bufferArray.push(dataArray);
                }
                else{ //wmts, items directement, avec options et 
                    /*["id", "Group type", "Group title", "Group address", "external provider",
                        "item id", "item type", "item title", "item address", "external provider", "MaxRes", "MinRes", "Metadata url",
                        "Extern", "abstract", "type", "source type", "source url", "optionsFromCapabilities", "params"]*/
                    dataArray = [];
                    dataArray.push(null, null, null, null, null, itemGroup.id, itemGroup.type, itemGroup.title, itemGroup.address, 
                        null, null, null, null, itemGroupWMTS.options.metadata.extern, null, itemGroupWMTS.options.metadata.type, itemGroupWMTS.options.sourceOptions.type, 
                        null, itemGroupWMTS.options.sourceOptions.optionsFromCapabilities, itemGroupWMTS.options.sourceOptions.params);
                    bufferArray.push(dataArray);
                }
                }
            });
        });
        console.log("bufferArray", bufferArray);

        let csvContent = bufferArray.map(e => e.join(";")).join("\n");
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", "data:text/csv;charset=utf-8,%EF%BB%BF" + encodedUri);
        link.setAttribute("download", "demo.csv");
        document.body.appendChild(link); // Required for FF
        link.click(); // This will download the data file named "my_data.csv".
        document.body.removeChild(link);
    });
}
}
