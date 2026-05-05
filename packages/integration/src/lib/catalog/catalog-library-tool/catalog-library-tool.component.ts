import { formatDate } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  input
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EntityStore } from '@igo2/common/entity';
import { ToolComponent } from '@igo2/common/tool';
import { ContextService } from '@igo2/context';
import { LanguageService } from '@igo2/core/language';
import { StorageScope, StorageService } from '@igo2/core/storage';
import {
  Catalog,
  CatalogItemGroup,
  CatalogItemLayer,
  CatalogItemType,
  CatalogLibraryComponent,
  CatalogService,
  isLayerItemOptions
} from '@igo2/geo';
import {
  addExcelSheetToWorkBook,
  createExcelWorkBook,
  writeExcelFile
} from '@igo2/utils';

import { TranslateModule } from '@ngx-translate/core';
import { Observable, Subscription, combineLatest, forkJoin } from 'rxjs';
import { concatAll, map, switchMap, take, toArray } from 'rxjs/operators';

import { ToolState } from '../../tool/tool.state';
import { CatalogState } from '../catalog.state';
import {
  InfoFromSourceOptions,
  ListExport
} from './catalog-library-tool.interface';
import { getInfoFromSourceOptions } from './catalog-library-tool.utils';

/**
 * Tool to browse the list of available catalogs.
 */
@ToolComponent({
  name: 'catalog',
  title: 'igo.integration.tools.catalog',
  icon: 'library_add'
})
@Component({
  selector: 'igo-catalog-library-tool',
  templateUrl: './catalog-library-tool.component.html',
  styleUrls: ['./catalog-library-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CatalogLibraryComponent,
    MatButtonModule,
    MatTooltipModule,
    TranslateModule
  ]
})
export class CatalogLibraryToolComponent implements OnInit, OnDestroy {
  private contextService = inject(ContextService);
  private catalogService = inject(CatalogService);
  private catalogState = inject(CatalogState);
  private toolState = inject(ToolState);
  private storageService = inject(StorageService);
  private languageService = inject(LanguageService);

  private generatelist$$: Subscription;
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
  readonly addCatalogAllowed = input(false);

  /**
   * Determine if the export button is shown
   */
  readonly exportButton = input(false);

  /**
   * List of predefined catalogs
   */
  readonly predefinedCatalogs = input<Catalog[]>([]);

  set selectedCatalogId(id) {
    this.storageService.set('selectedCatalogId', id, StorageScope.SESSION);
  }

  get currentTool() {
    return this.toolState.toolbox.getCurrentPreviousToolName()[1];
  }

  get lastTool() {
    return this.toolState.toolbox.getCurrentPreviousToolName()[0];
  }

  /**
   * @internal
   */
  ngOnInit() {
    if (this.lastTool === 'catalogBrowser' && this.currentTool === 'catalog') {
      this.selectedCatalogId = null;
    }

    if (this.store.count === 0) {
      this.loadCatalogs();
    }
  }

  ngOnDestroy() {
    this.generatelist$$?.unsubscribe();
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
   * Get the item abstract for getCatalogList
   */
  private getMetadataAbstract(item: CatalogItemLayer): string {
    return item.options.metadata.abstract?.replaceAll('\n', '') ?? '';
  }
  /**
   * Get the item url metadata for getCatalogList
   */
  private getMetadataUrl(item: CatalogItemLayer): string {
    return item.options.metadata.url;
  }

  private layersInfoFromContexts(): Observable<InfoFromSourceOptions[]> {
    return this.contextService.getLocalContexts().pipe(
      switchMap((contextsList) =>
        forkJoin(
          contextsList.ours.map((context) =>
            this.contextService.getLocalContext(context.uri)
          )
        )
      ),
      concatAll(),
      map((detailedContext) => {
        return detailedContext.layers
          .filter((layer) => isLayerItemOptions(layer))
          .map((layer) =>
            getInfoFromSourceOptions(
              layer.sourceOptions,
              detailedContext.title ?? detailedContext.uri
            )
          );
      }),
      concatAll(),
      toArray()
    );
  }

  private listExportFromCatalogs(): Observable<ListExport[]> {
    let rank = 1;
    const finalListExportOutputs: ListExport[] = [];
    return this.store.entities$.pipe(
      switchMap((catalogs) =>
        combineLatest(
          catalogs.map((catalog) =>
            this.catalogService.loadCatalogItems(catalog).pipe(
              map((items) => {
                return { catalog, items };
              })
            )
          )
        )
      ),
      map((catalogsWithItems) => {
        catalogsWithItems.forEach((catalogAndItems) => {
          const catalog = catalogAndItems.catalog;
          const loadedCatalogItems = catalogAndItems.items;

          const catalogListExports = loadedCatalogItems.reduce(
            (catalogListExports, item) => {
              if (item.type === CatalogItemType.Group) {
                const group = item as CatalogItemGroup;
                group.items.forEach((layer: CatalogItemLayer) => {
                  catalogListExports.push(
                    this.formatLayer(layer, rank, group.title, catalog.title)
                  );
                  rank++;
                });
              } else {
                const layer = item as CatalogItemLayer;
                catalogListExports.push(
                  this.formatLayer(layer, rank, '', catalog.title)
                );
                rank++;
              }
              return catalogListExports;
            },
            [] as ListExport[]
          );
          finalListExportOutputs.push(...catalogListExports);
        });
        return finalListExportOutputs;
      })
    );
  }

  async getCatalogList(): Promise<void> {
    this.generatelist$$ = combineLatest([
      this.layersInfoFromContexts(),
      this.listExportFromCatalogs()
    ]).subscribe(([layersInfoFromContexts, listExportFromCatalogs]) => {
      const listExport = this.matchLayersWithLayersFromContext(
        listExportFromCatalogs,
        layersInfoFromContexts
      );

      this.exportExcel(listExport);
    });
  }

  private formatLayer(
    layer: CatalogItemLayer,
    rank: number,
    groupTitle: string,
    catalogTitle: string
  ): ListExport {
    const infos = getInfoFromSourceOptions(
      layer.options.sourceOptions,
      layer.id
    );
    const t = this.languageService.translate;
    return {
      id: infos.id,
      rank: rank.toString(),
      layerTitle: layer.title,
      layerGroup: groupTitle,
      catalog: catalogTitle,
      provider: layer.externalProvider
        ? t.instant('igo.integration.catalog.listExport.external')
        : t.instant('igo.integration.catalog.listExport.internal'),
      url: infos.url,
      layerName: infos.layerName,
      context: '',
      metadataAbstract: this.getMetadataAbstract(layer),
      metadataUrl: this.getMetadataUrl(layer)
    };
  }

  /**
   * Match a list of layer info with an other list derived from contexts
   * @param catalogOutputs The row list to be written into a file
   * @param layerInfosFromDetailedContexts Layers info derived from the context
   * @returns An altered list, with layer/context association
   */

  private matchLayersWithLayersFromContext(
    listExport: ListExport[],
    layerInfosFromDetailedContexts: InfoFromSourceOptions[]
  ): ListExport[] {
    listExport.map((catalogOutput) => {
      const matchingLayersFromContext = layerInfosFromDetailedContexts
        .filter(
          (l) =>
            l.id === catalogOutput.id ||
            (l.layerName === catalogOutput.layerName &&
              l.url === catalogOutput.url)
        )
        .map((f) => f.context);
      catalogOutput.context = matchingLayersFromContext.join(',');
    });
    return listExport;
  }

  /**
   * Write a Excel file
   * @param catalogOutputs The row list to be written into a excel file
   */
  async exportExcel(catalogOutputs: ListExport[]) {
    const translateCatalogKey = (key: TemplateStringsArray) =>
      this.languageService.translate.instant(
        `igo.integration.catalog.listExport.${key}`
      );

    catalogOutputs.unshift({
      id: 'catalogIdHeader',
      rank: translateCatalogKey`rank`,
      layerTitle: translateCatalogKey`layerTitle`,
      layerGroup: translateCatalogKey`layerGroup`,
      catalog: translateCatalogKey`catalog`,
      provider: translateCatalogKey`externalProvider`,
      url: translateCatalogKey`url`,
      layerName: translateCatalogKey`layerName`,
      context: translateCatalogKey`context`,
      metadataAbstract: translateCatalogKey`metadataAbstract`,
      metadataUrl: translateCatalogKey`metadataUrl`
    });

    const catalogOutput = catalogOutputs.map((catalogOutput) => {
      delete catalogOutput.id;
      return catalogOutput;
    });

    const workBook = await createExcelWorkBook();

    await addExcelSheetToWorkBook('Informations', catalogOutput, workBook, {
      json2SheetOpts: { skipHeader: true }
    });

    const documentName = this.languageService.translate.instant(
      'igo.integration.catalog.listExport.documentName',
      { value: formatDate(Date.now(), 'YYYY-MM-dd-H_mm', 'en-US') }
    );
    writeExcelFile(workBook, documentName, { compression: true });
  }
}
