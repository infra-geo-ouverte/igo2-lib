import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { catchError, map, switchMap, take } from 'rxjs/operators';

import { ToolComponent } from '@igo2/common';

import { EntityStore } from '@igo2/common';
import { Catalog, CatalogItem, CatalogItemGroup, CatalogService, DDtoDMS } from '@igo2/geo';
import { StorageService } from '@igo2/core';

import { ToolState } from '../../tool/tool.state';
import { CatalogState } from '../catalog.state';
import { forkJoin, of, zip } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ContextService, DetailedContext } from '@igo2/context';

/**
 * Tool to browse the list of available catalogs.
 */
@ToolComponent({
  name: 'catalog',
  title: 'igo.integration.tools.catalog',
  icon: 'layers-plus'
})
@Component({
  selector: 'igo-catalog-library-tool',
  templateUrl: './catalog-library-tool.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogLibraryToolComponent implements OnInit {
  /**
   * Store that contains the catalogs
   * @internal
   */
  get store(): EntityStore<Catalog> {
    return this.catalogState.catalogStore;
  }

  /**
   * Determine if the form to add a catalog is allowed
   */
  @Input() addCatalogAllowed: boolean = false;

  /**
   * List of predefined catalogs
   */
  @Input() predefinedCatalogs: Catalog[] = [];

  constructor(
    private http: HttpClient,
    private contextService: ContextService,
    private catalogService: CatalogService,
    private catalogState: CatalogState,
    private toolState: ToolState,
    private storageService: StorageService
  ) {}

  /**
   * @internal
   */
  ngOnInit() {
    if (this.store.count === 0) {
      this.loadCatalogs();
    }
  }

  /**
   * When the selected catalog changes, toggle the the CatalogBrowser tool.
   * @internal
   * @param event Select event
   */
  onCatalogSelectChange(event: { selected: boolean; catalog: Catalog }) {
    if (event.selected === false) {
      return;
    }
    this.toolState.toolbox.activateTool('catalogBrowser');
  }

  /**
   * Get all the available catalogs from the CatalogService and
   * load them into the store.
   */
  private loadCatalogs() {
    this.catalogService.loadCatalogs().pipe(take(1)).subscribe((catalogs: Catalog[]) => {
      this.store.clear();
      this.store.load(catalogs.concat((this.storageService.get('addedCatalogs') || []) as Catalog[]));
    });
  }

  private getThematic(itemTitle: string){
    this.contextService.getLocalContexts().pipe(
      switchMap(contextsList => 
        forkJoin(contextsList.ours.map(context => this.contextService.getLocalContext(context.uri)))
      )).subscribe(contextLayers =>{
          contextLayers.forEach(layerContextList=>{
            layerContextList.layers.forEach(layersName=>{
              if(itemTitle === layersName.title){
                console.log("itemTitle === layersName");
                return layersName.title;
              }
            });
          });
        });
        return null;
  }

  getCatalogList(){
    var catalogRank = 1;
    let bufferArray = [["rang Catalog", "Nom de la couche - Catalogue", "Nom du groupe de couche - Catalogue",
      "Nom de la thématique - Catalogue", "Gestionnaire du service", "URL (Intranet/Internet", "Nom du fichier - Service Web",
      "Contexte/Thématique PlaniActifs", "Description de la donnée"]];
    var dataArray = [];
    this.store.entities$.pipe(switchMap(catalogs => {
        return forkJoin(catalogs.map(ca => this.catalogService.loadCatalogItems(ca).pipe(map(lci => [ca, lci]))    ));
    })).subscribe(res=> {

        console.log('res', res);
        res.forEach((catalogs:Object) => {
          //console.log(catalogs[1])
          var catalogsList = Object.keys(catalogs[1]).map(key => catalogs[1][key]);
          var catalogTitle = Object.keys(catalogs[0]).map(key => catalogs[0][key])[1];
          console.log(catalogs[0], catalogs[0].title);
          catalogsList.forEach(catalogItemGroup=>{
            //console.log(catalogItemGroup);
            if (catalogItemGroup.items) {
              catalogItemGroup.items.forEach((item: any) => {
                //à l'intérieur du array(22) Dans GouvOuvert
                dataArray = [];
                var gestionnaire = "MTQ";
                if(item.externalProvider !== undefined){
                    if(item.externalProvider === true)
                        gestionnaire = "Externe";
                }//cataloggroup.address
                //catalogs[0].title
                
                const absUrl = item.options.sourceOptions.url.charAt(0) === '/' ? window.location.origin + item.options.sourceOptions.url : item.options.sourceOptions.url;
                dataArray.push(catalogRank, item.title, catalogItemGroup.title, catalogTitle, gestionnaire, absUrl, 
                  item.options.sourceOptions.params.LAYERS, "", item.options.metadata.abstract);
                bufferArray.push(dataArray);
                dataArray = [];
                catalogRank++;
              });
            }
            else{ //is directly an item
              var itemGroupWMTS: any = catalogItemGroup;
              if(!itemGroupWMTS.options){
                dataArray.push(Object.keys(catalogItemGroup).map(key => catalogItemGroup[key]));
                bufferArray.push(dataArray);
                dataArray = [];
              }
              else{ 
                //wmts, items directement, avec options 
                dataArray = [];
                var gestionnaire = "MTQ";
                if(itemGroupWMTS.externalProvider !== undefined){
                    if(itemGroupWMTS.externalProvider === true)
                        gestionnaire = "Externe";
                }
                dataArray.push(catalogRank, itemGroupWMTS.title, itemGroupWMTS.title, itemGroupWMTS.address, gestionnaire, itemGroupWMTS.options.sourceOptions.url, 
                  itemGroupWMTS.options.sourceOptions.layer, "contextethematique planiactifs", itemGroupWMTS.options.metadata.abstract);

                bufferArray.push(dataArray);
                dataArray = [];
                catalogRank++;
              }
            }

          });
        });

        this.contextService.getLocalContexts().pipe(switchMap(contextsList => forkJoin(contextsList.ours.map(context => 
          this.contextService.getLocalContext(context.uri))))).subscribe(contextLayers => {
          
            console.log("contextLayers", contextLayers);
          //itérer bufferArray
          for (var index in bufferArray) {
              for(var layerContextList of contextLayers){
              //contextLayers.forEach(layerContextList => {
                  layerContextList.layers.forEach(layersName => {
                      if (bufferArray[index][6] === layersName.title) {
                          console.log("bufferArrayElement === layersName");
                          bufferArray[index][7] = layersName.title;
                      }
                  });
              };
          }
          let csvContent = bufferArray.map(e => e.join(";")).join("\n");
          var encodedUri = encodeURI(csvContent);
          var link = document.createElement("a");
          link.setAttribute("href", "data:text/csv;charset=utf-8,%EF%BB%BF" + encodedUri);
          link.setAttribute("download", "liste_couches.csv");
          document.body.appendChild(link); // Required for FF
          link.click(); // This will download the data file named "my_data.csv".
          document.body.removeChild(link);
      }); //end subscribe
    });
  }
}
