import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { EntityStore } from '@igo2/common';
import { ContextService, DetailedContext } from '@igo2/context';
import { ConfigService, LanguageService, StorageService } from '@igo2/core';
import {
  Catalog,
  CatalogItem,
  CatalogItemGroup,
  CatalogItemLayer,
  CatalogItemType,
  CatalogService,
  InfoFromSourceOptions,
  getInfoFromSourceOptions
} from '@igo2/geo';
import { downloadContent } from '@igo2/utils';

import { Observable, Subscription, combineLatest, forkJoin } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import { ToolState } from '../../tool/tool.state';
import { CatalogState } from '../catalog.state';
import { CsvOutput } from './catalog-library-tool.interface';

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
export class CatalogLibraryToolComponent implements OnInit, OnDestroy {
  public exportAsListButton: boolean;
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
    private languageService: LanguageService,
    private datePipe: DatePipe,
    private configService: ConfigService
  ) {}

  /**
   * @internal
   */
  ngOnInit() {
    if (this.store.count === 0) {
      this.loadCatalogs();
    }
    this.exportAsListButton = this.configService.getConfig(
      'catalog.exportAsListButton',
      true
    );
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
   * Get the item description for getCatalogList
   */
  private getDescription(item: CatalogItemLayer): string {
    return item.options.metadata.abstract?.replaceAll('\n', '') ?? '';
  }

  /**
   * Prepare the observale to produce the layer list extraction
   * @returns An array of catalog and items plus detailed contexts info.
   */
  private getCatalogsAndItemsAndDetailedContexts(): Observable<
    [
      {
        catalog: Catalog;
        loadedCatalogItems: CatalogItem[];
      }[],
      DetailedContext[]
    ]
  > {
    return combineLatest([
      this.store.entities$.pipe(
        switchMap((catalogs) => {
          return forkJoin(
            catalogs.map((catalog) =>
              this.catalogService.loadCatalogItems(catalog).pipe(
                map((loadedCatalogItems) => {
                  return { catalog, loadedCatalogItems };
                })
              )
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
    ]);
  }

  getCatalogList(): void {
    var rank = 1;
    const t = this.languageService.translate;
    let wholeCsvOutputs: CsvOutput[] = [
      {
        id: 'csvHeader',
        rank: t.instant('igo.integration.catalog.csv.rank'),
        layerTitle: t.instant('igo.integration.catalog.csv.layerTitle'),
        layerGroup: t.instant('igo.integration.catalog.csv.layerGroup'),
        catalog: t.instant('igo.integration.catalog.csv.catalog'),
        provider: t.instant('igo.integration.catalog.csv.externalProvider'),
        url: t.instant('igo.integration.catalog.csv.url'),
        layerName: t.instant('igo.integration.catalog.csv.layerName'),
        context: t.instant('igo.integration.catalog.csv.context'),
        dataDescription: t.instant(
          'igo.integration.catalog.csv.dataDescription'
        )
      }
    ];
    this.generatelist$$ =
      this.getCatalogsAndItemsAndDetailedContexts().subscribe(
        (catalogsAndItemsAndDetailedContexts) => {
          const catalogsAndItems = catalogsAndItemsAndDetailedContexts[0];
          const detailedContexts = catalogsAndItemsAndDetailedContexts[1];
          const layerInfosFromDetailedContexts: InfoFromSourceOptions[] = [];
          detailedContexts.forEach((detailedContext) =>
            detailedContext.layers.forEach((layer) =>
              layerInfosFromDetailedContexts.push(
                getInfoFromSourceOptions(
                  layer.sourceOptions,
                  detailedContext.title ?? detailedContext.uri
                )
              )
            )
          );

          catalogsAndItems.forEach((catalogAndItems) => {
            const catalog = catalogAndItems.catalog;
            const loadedCatalogItems = catalogAndItems.loadedCatalogItems;

            const catalogCsvOutputs = loadedCatalogItems.reduce(
              (catalogcsvOutputs, item) => {
                if (item.type === CatalogItemType.Group) {
                  const group = item as CatalogItemGroup;
                  group.items.forEach((layer: CatalogItemLayer) => {
                    catalogCsvOutputs.push(
                      this.catalogItemLayerToCsvOutput(
                        layer,
                        rank,
                        group.title,
                        catalog.title
                      )
                    );
                    rank++;
                  });
                } else {
                  const layer = item as CatalogItemLayer;
                  catalogCsvOutputs.push(
                    this.catalogItemLayerToCsvOutput(
                      layer,
                      rank,
                      '',
                      catalog.title
                    )
                  );
                  rank++;
                }
                return catalogCsvOutputs;
              },
              [] as CsvOutput[]
            );
            wholeCsvOutputs.push(...catalogCsvOutputs);
          });

          wholeCsvOutputs = this.matchLayersWithLayersContext(
            wholeCsvOutputs,
            layerInfosFromDetailedContexts
          );

          this.downloadCsv(wholeCsvOutputs);
        }
      );
  }

  private catalogItemLayerToCsvOutput(
    layer: CatalogItemLayer,
    rank: number,
    groupTitle: string,
    catalogTitle: string
  ) {
    const infos = getInfoFromSourceOptions(
      layer.options.sourceOptions,
      layer.id
    );
    return {
      id: infos.id,
      rank: rank.toString(),
      layerTitle: layer.title,
      layerGroup: groupTitle,
      catalog: catalogTitle,
      provider: layer.externalProvider
        ? this.languageService.translate.instant(
            'igo.integration.catalog.csv.external'
          )
        : this.languageService.translate.instant(
            'igo.integration.catalog.csv.internal'
          ),
      url: infos.url,
      layerName: infos.layerName,
      context: '',
      dataDescription: this.getDescription(layer)
    };
  }

  /**
   * Match a list of layer info with an other list derived from contexts
   * @param csvOutputs The row list to be written into a csv file
   * @param layerInfosFromDetailedContexts Layers info derived from the context
   * @returns An altered list, with layer/context association
   */

  private matchLayersWithLayersContext(
    csvOutputs: CsvOutput[],
    layerInfosFromDetailedContexts: InfoFromSourceOptions[]
  ): CsvOutput[] {
    const sep = this.languageService.getLanguage() === 'fr' ? ',' : ';';
    csvOutputs
      .filter((b) => b.id !== 'csvHeader')
      .forEach((csvOutput) => {
        const matchingLayersFromContext = layerInfosFromDetailedContexts
          .filter(
            (l) =>
              l.id === csvOutput.id ||
              (l.layerName === csvOutput.layerName && l.url === csvOutput.url)
          )
          .map((f) => f.context);
        csvOutput.context = matchingLayersFromContext.join(sep);
      });
    return csvOutputs;
  }

  /**
   * Write a CSV file, the column separator is based on language.
   * @param csvOutputs The row list to be written into a csv file
   */
  private downloadCsv(csvOutput: CsvOutput[]) {
    const sep = this.languageService.getLanguage() === 'fr' ? ';' : ',';
    let csvContent = csvOutput
      .map((e) => {
        return `${e.rank}${sep}${e.layerTitle}${sep}${e.layerGroup}${sep}${e.catalog}${sep}${e.provider}${sep}${e.url}${sep}${e.layerName}${sep}${e.context}${sep}${e.dataDescription}`;
      })
      .join('\n');

    const fn = this.languageService.translate.instant(
      'igo.integration.catalog.csv.documentName',
      { value: this.datePipe.transform(Date.now(), 'YYYY-MM-dd-H_mm') }
    );

    downloadContent(csvContent, 'text/csv;charset=utf-8', fn);
  }
}
