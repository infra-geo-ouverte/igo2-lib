import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { EntityStore } from '@igo2/common';
import { ContextService } from '@igo2/context';
import { LanguageService, StorageService } from '@igo2/core';
import { Catalog, CatalogService } from '@igo2/geo';

import { forkJoin, zip } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import { ToolState } from '../../tool/tool.state';
import { CatalogState } from '../catalog.state';

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
  styleUrls: ['./catalog-library-tool.component.scss'],
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
    private contextService: ContextService,
    private catalogService: CatalogService,
    private catalogState: CatalogState,
    private toolState: ToolState,
    private storageService: StorageService,
    private languageService: LanguageService
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
    this.catalogService
      .loadCatalogs()
      .pipe(take(1))
      .subscribe((catalogs: Catalog[]) => {
        this.store.clear();
        this.store.load(
          catalogs.concat(
            (this.storageService.get('addedCatalogs') || []) as Catalog[]
          )
        );
      });
  }

  /**
   * Get the item description for getCatalogList
   */
  private getDescription(item: any) {
    if (item.options.metadata.abstract) {
      if (item.options.metadata.abstract.includes('\n')) {
        return item.options.metadata.abstract.replaceAll('\n', '');
      } else {
        return item.options.metadata.abstract;
      }
    } else {
      return '';
    }
  }

  getCatalogList() {
    var catalogRank = 1;
    let bufferArray = [
      [
        this.languageService.translate.instant(
          'igo.integration.catalog.csv.rank'
        ),
        this.languageService.translate.instant(
          'igo.integration.catalog.csv.layerName'
        ),
        this.languageService.translate.instant(
          'igo.integration.catalog.csv.layerGroup'
        ),
        this.languageService.translate.instant(
          'igo.integration.catalog.csv.catalog'
        ),
        this.languageService.translate.instant(
          'igo.integration.catalog.csv.externalProvider'
        ),
        this.languageService.translate.instant(
          'igo.integration.catalog.csv.url'
        ),
        this.languageService.translate.instant(
          'igo.integration.catalog.csv.fileName'
        ),
        this.languageService.translate.instant(
          'igo.integration.catalog.csv.context'
        ),
        this.languageService.translate.instant(
          'igo.integration.catalog.csv.dataDescription'
        )
      ]
    ];
    var dataArray = [];
    zip([
      this.store.entities$.pipe(
        switchMap((catalogs) => {
          return forkJoin(
            catalogs.map((ca) =>
              this.catalogService
                .loadCatalogItems(ca)
                .pipe(map((lci) => [ca, lci]))
            )
          );
        })
      ),
      this.contextService
        .getLocalContexts()
        .pipe(
          switchMap((contextsList) =>
            forkJoin(
              contextsList.ours.map((context) =>
                this.contextService.getLocalContext(context.uri)
              )
            )
          )
        )
    ]).subscribe((returnv) => {
      const res = returnv[0];
      const layersfromContexts = returnv[1];
      res.forEach((catalogs: Object) => {
        var catalogsList = Object.keys(catalogs[1]).map(
          (key) => catalogs[1][key]
        );
        var catalogTitle = catalogs[0].title ? catalogs[0].title : null;
        catalogsList.forEach((catalogItemGroup) => {
          if (catalogItemGroup.items) {
            catalogItemGroup.items.forEach((item: any) => {
              dataArray = [];
              var administrator = item.externalProvider ? 'Externe' : 'MTQ';
              const absUrl =
                item.options.sourceOptions.url.charAt(0) === '/'
                  ? window.location.origin + item.options.sourceOptions.url
                  : item.options.sourceOptions.url;
              dataArray.push(
                catalogRank,
                item.title,
                catalogItemGroup.title,
                catalogTitle,
                administrator,
                absUrl,
                item.options.sourceOptions.params.LAYERS,
                '',
                this.getDescription(item)
              );
              bufferArray.push(dataArray);
              dataArray = [];
              catalogRank++;
            });
          } else {
            var itemGroupWMTS: any = catalogItemGroup;
            if (!itemGroupWMTS.options) {
              dataArray.push(
                Object.keys(catalogItemGroup).map(
                  (key) => catalogItemGroup[key]
                )
              );
              bufferArray.push(dataArray);
              dataArray = [];
            } else {
              dataArray = [];
              var administrator = itemGroupWMTS.externalProvider
                ? 'Externe'
                : 'MTQ';
              dataArray.push(
                catalogRank,
                itemGroupWMTS.title,
                itemGroupWMTS.title,
                catalogTitle,
                administrator,
                itemGroupWMTS.options.sourceOptions.url,
                itemGroupWMTS.options.sourceOptions.layer,
                '',
                this.getDescription(itemGroupWMTS)
              );
              bufferArray.push(dataArray);
              dataArray = [];
              catalogRank++;
            }
          }
        });
      });
      for (var index = 1; index < bufferArray.length; index++) {
        var contextLayersList = [];
        for (var layerContextList of layersfromContexts) {
          layerContextList.layers.forEach((layersName) => {
            if (bufferArray[index][6] === layersName.id) {
              if (layerContextList.title !== undefined) {
                contextLayersList.push(layerContextList.title);
              }
            }
          });
        }
        bufferArray[index][7] = contextLayersList.toString();
      }
      let csvContent = bufferArray.map((e) => e.join(';')).join('\n');
      var encodedUri = encodeURI(csvContent);
      var exportDocument = document.createElement('a');
      exportDocument.setAttribute(
        'href',
        'data:text/csv;charset=utf-8,%EF%BB%BF' + encodedUri
      );
      exportDocument.setAttribute(
        'download',
        this.languageService.translate.instant(
          'igo.integration.catalog.csv.documentName'
        )
      );
      document.body.appendChild(exportDocument);
      exportDocument.click();
      document.body.removeChild(exportDocument);
    });
  }
}
