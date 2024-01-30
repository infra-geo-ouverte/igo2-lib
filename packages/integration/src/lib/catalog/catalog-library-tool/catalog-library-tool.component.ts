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
import { LanguageService, StorageService } from '@igo2/core';
import {
  AnyDataSourceOptions,
  ArcGISRestDataSourceOptions,
  CartoDataSourceOptions,
  Catalog,
  CatalogItem,
  CatalogItemGroup,
  CatalogItemLayer,
  CatalogItemType,
  CatalogService,
  ClusterDataSourceOptions,
  FeatureDataSourceOptions,
  MVTDataSourceOptions,
  OSMDataSourceOptions,
  WFSDataSourceOptions,
  WMSDataSourceOptions,
  WMTSDataSourceOptions,
  XYZDataSourceOptions,
  generateIdFromSourceOptions
} from '@igo2/geo';

import { Subscription, forkJoin, zip } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import { ToolState } from '../../tool/tool.state';
import { CatalogState } from '../catalog.state';
import {
  CsvOutput,
  InfoFromSourceOptions
} from './catalog-library-tool.interface';

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
    private datePipe: DatePipe
  ) {}

  /**
   * @internal
   */
  ngOnInit() {
    if (this.store.count === 0) {
      this.loadCatalogs();
    }
  }

  ngOnDestroy() {
    if (this.generatelist$$) {
      this.generatelist$$.unsubscribe();
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
  private getDescription(item: CatalogItemLayer) {
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

  private getLayerInfosFromSourceOptions(
    so: AnyDataSourceOptions,
    context?: string
  ): InfoFromSourceOptions {
    const rv: InfoFromSourceOptions = {
      id: undefined,
      layerName: undefined,
      url: undefined,
      so: undefined,
      context
    };

    switch (so.type) {
      case 'imagearcgisrest':
      case 'arcgisrest':
      case 'tilearcgisrest':
        const argisSo = so as ArcGISRestDataSourceOptions;
        rv.layerName = argisSo.layer;
        rv.url = argisSo.url;
        rv.so = argisSo;
        break;
      case 'wmts':
        const wmtsSo = so as WMTSDataSourceOptions;
        rv.layerName = wmtsSo.layer;
        rv.url = wmtsSo.url;
        rv.so = wmtsSo;
        break;
      case 'xyz':
        const xyzSo = so as XYZDataSourceOptions;
        rv.layerName = '';
        rv.url = xyzSo.url;
        rv.so = xyzSo;
        break;
      case 'wms':
        const wmsSo = so as WMSDataSourceOptions;
        wmsSo.params.LAYERS =
          wmsSo.params.LAYERS ?? (wmsSo.params as any).layers;
        rv.layerName = wmsSo.params.LAYERS;

        rv.url = wmsSo.url;
        rv.so = wmsSo;
        break;
      case 'osm':
        const osmSo = so as OSMDataSourceOptions;
        rv.layerName = '';
        rv.url = osmSo.url
          ? osmSo.url
          : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
        rv.so = osmSo;
        break;
      case 'wfs':
        const wfsSo = so as WFSDataSourceOptions;
        rv.layerName = wfsSo.params.featureTypes;
        rv.url = wfsSo.url;
        rv.so = wfsSo;
        break;
      case 'vector':
        const featureSo = so as FeatureDataSourceOptions;
        rv.layerName = '';
        rv.url = featureSo.url;
        rv.so = featureSo;
        break;
      case 'cluster':
        const clusterSo = so as ClusterDataSourceOptions;
        rv.layerName = '';
        rv.url = clusterSo.url;
        rv.so = clusterSo;
        break;
      case 'mvt':
        const mvtSo = so as MVTDataSourceOptions;
        rv.layerName = '';
        rv.url = mvtSo.url;
        rv.so = mvtSo;
        break;
      case 'carto':
        const cartoSo = so as CartoDataSourceOptions;
        rv.layerName = cartoSo.config.layers
          .map((layer) => layer.options.sql)
          .join(' ');
        rv.url = `https://${cartoSo.account}.carto.com/api/v1/map`;
        rv.so = cartoSo;
        break;
      default:
        break;
    }
    if (rv.so) {
      rv.id = generateIdFromSourceOptions(rv.so);
      rv.url = rv.url?.startsWith('/')
        ? window.location.origin + rv.url
        : rv.url;
    }

    return rv;
  }

  getCatalogList(): void {
    var catalogRank = 1;
    const t = this.languageService.translate;
    let bufferArray: CsvOutput[] = [
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
    this.generatelist$$ = zip([
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
    ]).subscribe(
      (
        returnv: [
          {
            catalog: Catalog;
            loadedCatalogItems: CatalogItem[];
          }[],
          DetailedContext[]
        ]
      ) => {
        const catalogsAndItems = returnv[0];
        const detailedContexts = returnv[1];

        const layerInfosFromDetailedContexts: InfoFromSourceOptions[] = [];
        detailedContexts.map((detailedContext) =>
          detailedContext.layers.map((layer) =>
            layerInfosFromDetailedContexts.push(
              this.getLayerInfosFromSourceOptions(
                layer.sourceOptions,
                detailedContext.title ?? detailedContext.uri
              )
            )
          )
        );
        console.log(layerInfosFromDetailedContexts);

        catalogsAndItems.map((catalogAndItems) => {
          const catalog = catalogAndItems.catalog;
          const loadedCatalogItems = catalogAndItems.loadedCatalogItems;

          let groups = loadedCatalogItems.filter(
            (i) => i.type === CatalogItemType.Group
          );
          let layers = loadedCatalogItems.filter(
            (i) => i.type === CatalogItemType.Layer
          );

          let layersToProcess: CatalogItemLayer[];
          let groupsToProcess: CatalogItemGroup[];

          layersToProcess = layers.map((layer) => layer as CatalogItemLayer);
          groupsToProcess = groups.map((group) => group as CatalogItemGroup);

          layersToProcess.map((layer) => {
            const infos = this.getLayerInfosFromSourceOptions(
              layer.options.sourceOptions
            );
            bufferArray.push({
              id: infos.id,
              rank: catalogRank.toString(),
              layerTitle: layer.title,
              layerGroup: '',
              catalog: catalog.title,
              provider:
                layer.externalProvider ?? catalog.externalProvider
                  ? t.instant('igo.integration.catalog.csv.external')
                  : t.instant('igo.integration.catalog.csv.internal'),
              url: infos.url,
              layerName: infos.layerName,
              context: '',
              dataDescription: this.getDescription(layer)
            });
            catalogRank++;
          });

          groupsToProcess.map((group) => {
            group.items.map((layer) => {
              const layerToProcess = layer as CatalogItemLayer;
              const infos = this.getLayerInfosFromSourceOptions(
                layerToProcess.options.sourceOptions,
                layer.id
              );
              bufferArray.push({
                id: infos.id,
                rank: catalogRank.toString(),
                layerTitle: layerToProcess.title,
                layerGroup: group.title,
                catalog: catalog.title,
                provider: layerToProcess.externalProvider
                  ? t.instant('igo.integration.catalog.csv.external')
                  : t.instant('igo.integration.catalog.csv.internal'),
                url: infos.url,
                layerName: infos.layerName,
                context: '',
                dataDescription: this.getDescription(layerToProcess)
              });
              catalogRank++;
            });
          });
        });

        const sep = this.languageService.getLanguage() === 'fr' ? ',' : ';';
        bufferArray
          .filter((b) => b.id !== 'csvHeader')
          .map((buff) => {
            const matchingLayersFromContext = layerInfosFromDetailedContexts
              .filter((l) => l.id === buff.id)
              // TODO
              .map((f) => f.context);
            buff.context = matchingLayersFromContext.join(sep);
          });

        this.downloadCsv(bufferArray);
      }
    );
  }

  private downloadCsv(csvOutput: CsvOutput[]) {
    const sep = this.languageService.getLanguage() === 'fr' ? ';' : ',';
    let csvContent = csvOutput
      .map((e) => {
        return `${e.rank}${sep}${e.layerTitle}${sep}${e.layerGroup}${sep}${e.catalog}${sep}${e.provider}${sep}${e.url}${sep}${e.layerName}${sep}${e.context}${sep}${e.dataDescription}`;
      })
      .join('\n');

    const encodedUri = encodeURI(csvContent);
    const exportDocument = document.createElement('a');
    exportDocument.setAttribute(
      'href',
      'data:text/csv;charset=utf-8,%EF%BB%BF' + encodedUri
    );
    exportDocument.setAttribute(
      'download',
      this.languageService.translate.instant(
        'igo.integration.catalog.csv.documentName',
        { value: this.datePipe.transform(Date.now(), 'YYYY-MM-dd-H_mm') }
      )
    );
    document.body.appendChild(exportDocument);
    exportDocument.click();
    document.body.removeChild(exportDocument);
  }
}
