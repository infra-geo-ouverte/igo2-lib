import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { OgcFilterableDataSource } from '../../datasource';
import { Subscription } from 'rxjs/Subscription';
import { MapService } from '../../map';
import { DownloadService } from '../../download';


@Component({
  selector: 'igo-ogc-filterable-item',
  templateUrl: './ogc-filterable-item.component.html',
  styleUrls: ['./ogc-filterable-item.component.styl']
})
export class OgcFilterableItemComponent implements OnInit, OnDestroy {
  public color = 'primary';
  public layers;
  private layers$$: Subscription;
  private lastRunOgcFilter;
  private defaultLogicalParent = 'And';

  @Input()
  get datasource(): OgcFilterableDataSource { return this._dataSource; }
  set datasource(value: OgcFilterableDataSource) {
    this._dataSource = value;
  }
  private _dataSource: OgcFilterableDataSource;

  @Input()
  get ogcFiltersHeaderShown(): boolean { return this._ogcFiltersHeaderShown; }
  set ogcFiltersHeaderShown(value: boolean) {
    this._ogcFiltersHeaderShown = value;
  }
  private _ogcFiltersHeaderShown: boolean;

  constructor(
    private mapService: MapService,
    private downloadService: DownloadService) { }

  ngOnInit() {
    this.layers$$ = this.mapService.getMap().layers$.subscribe(layers => {
      this.layers = layers
        .filter((layer) => {
          if (layer.dataSource.options['id']) {
            return layer.dataSource.options['id'] === this.datasource.options['id']
          } else {
            return layer.dataSource['id'] === this.datasource['id']
          }
        }
        )
    });

    this.lastRunOgcFilter = JSON
      .parse(JSON.stringify(this.datasource.options.ogcFilters.interfaceOgcFilters));
    this.datasource.options['disableRefreshFilter'] = true;
  }

  ngOnDestroy() {
    this.layers$$.unsubscribe();
  }

  addFilterToSequence() {
    const arr = this.datasource.options.ogcFilters.interfaceOgcFilters
    const lastLevel = arr.length === 0 ? 0 : arr[arr.length - 1].level;
    let firstFieldName = '';
    if (this.datasource.options['sourceFields'].length > 0) {
      firstFieldName = this.datasource.options['sourceFields'][0].name === undefined ?
      '' : this.datasource.options['sourceFields'][0].name;
    }
    let fieldNameGeometry = undefined;
    if (this.datasource.options['fieldNameGeometry']) {
      fieldNameGeometry = this.datasource.options['fieldNameGeometry'];
    } else if (this.datasource.options['wfsSource'] &&
      this.datasource.options['wfsSource']['fieldNameGeometry']) {
      fieldNameGeometry = this.datasource.options['wfsSource']['fieldNameGeometry'];
    }
    const status = arr.length === 0 ? true : false;
    arr.push(this.datasource['ogcFilterWriter']
      .addInterfaceFilter(
        {
          'propertyName': firstFieldName,
          'operator': 'PropertyIsEqualTo',
          'active': status,
          'igoSpatialSelector': 'fixedExtent'
        }, fieldNameGeometry, lastLevel, this.defaultLogicalParent));
    this.datasource.options.ogcFilters.interfaceOgcFilters = arr;
  }

  openDownload() {
    this.downloadService.open(this.layers[0]);
  }

  refreshFilters() {
    const activeFilters = this.datasource.options.ogcFilters.interfaceOgcFilters
      .filter((f) => f.active === true);
    if (activeFilters.length > 1) {
      activeFilters[0].parentLogical = activeFilters[1].parentLogical;
    }
    if (!(JSON.stringify(this.lastRunOgcFilter) === JSON.stringify(activeFilters))) {


      if (this.layers[0].dataSource.options.type === 'wfs') {
        this.layers[0].dataSource.options.ogcFilters.filters =
          this.layers[0].dataSource.ogcFilterWriter
            .rebuiltIgoOgcFilterObjectFromSequence(activeFilters);
        this.layers[0].dataSource.ol.clear();

      } else if (this.layers[0].dataSource.options.type === 'wms' &&
        this.layers[0].dataSource.options.isOgcFilterable) {

        let rebuildFilter = '';
        if (activeFilters.length >= 1) {
          this.layers[0].dataSource.options.ogcFilters.filters =
            this.layers[0].dataSource.ogcFilterWriter
              .rebuiltIgoOgcFilterObjectFromSequence(activeFilters);
          rebuildFilter =
            this.layers[0].dataSource.ogcFilterWriter
              .buildFilter(this.layers[0].dataSource.options.ogcFilters.filters,
                undefined,
                undefined,
                this.layers[0].dataSource.options['fieldNameGeometry']);
        }
        this.layers[0].dataSource.filterByOgc(rebuildFilter);
        this.datasource.options['ogcFiltered'] = activeFilters.length === 0 ? false : true;

      }

      this.lastRunOgcFilter = JSON.parse(JSON.stringify(activeFilters));
      this.datasource.options['disableRefreshFilter'] = true;

    } else {
      // identical filter. Nothing triggered
      this.datasource.options['disableRefreshFilter'] = true;
    }
  }

}
