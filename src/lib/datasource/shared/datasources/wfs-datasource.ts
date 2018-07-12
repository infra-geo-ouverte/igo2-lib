import { HttpClient } from '@angular/common/http';
import * as ol from 'openlayers';

import { uuid } from '../../../utils';
import {
  IgoOgcFilterObject, OgcFilter, WFSWriteGetFeatureOptions,
  AnyBaseOgcFilterOptions, OgcFilterWriter
} from '../../../filter/shared';

import { DataSource } from './datasource';
import { OgcFilterableDataSource } from './datasource.interface';
import { WFSDataSourceOptions } from './wfs-datasource.interface';
import { WFSDataSourceService } from './wfs-datasource.service';


export class WFSDataSource extends DataSource implements OgcFilterableDataSource {

  public ol: ol.source.Vector;
  public igoFilterArray: IgoOgcFilterObject;
  public ogcFilter: OgcFilter;
  public wfsWriteGetFeatureOptions: WFSWriteGetFeatureOptions;
  public anyBaseOgcFilterOptions: AnyBaseOgcFilterOptions;
  public ogcFilterWriter: OgcFilterWriter;
  public httpClient: HttpClient;

  constructor(
    public options: WFSDataSourceOptions,
    protected dataSourceService: WFSDataSourceService
  ) {

    super(options, dataSourceService);
    this.ogcFilterWriter = new OgcFilterWriter;

    this.dataSourceService.checkWfsOptions(options);
    if (options['sourceFields'] === undefined ||
    Object.keys(options['sourceFields']).length === 0) {
      options['sourceFields'] = []
      this.dataSourceService.wfsGetCapabilities(options)
        .map(wfsCapabilities => options['wfsCapabilities'] = {
          'xml': wfsCapabilities.body,
          'GetPropertyValue': /GetPropertyValue/gi.test(wfsCapabilities.body) ? true : false
        })
        .subscribe(val => options['sourceFields'] =
          this.dataSourceService.defineFieldAndValuefromWFS(options));
    } else {
      options['sourceFields'].filter(
        (field) => (field.values === undefined || field.values.length === 0)).forEach(f => {
          f.values = this.dataSourceService
            .getValueFromWfsGetPropertyValues(options, f.name, 200, 0, 0);
        });
    }

    if (options.ogcFilters.filters) {
      options.ogcFilters.filters = this.ogcFilterWriter.checkIgoFiltersProperties(
        options.ogcFilters.filters, options.fieldNameGeometry, true);
      options.ogcFilters.interfaceOgcFilters = this.ogcFilterWriter.defineInterfaceFilterSequence(
        options.ogcFilters.filters, options.fieldNameGeometry);

    } else {
      options.ogcFilters.filters = undefined;
      options.ogcFilters.interfaceOgcFilters = [];
    }

    options.isOgcFilterable = options.isOgcFilterable === undefined ?
      true : options.isOgcFilterable;
    options.ogcFilters.filtersAreEditable = options.ogcFilters.filtersAreEditable === undefined ?
      true : options.ogcFilters.filtersAreEditable;

  }

  protected generateId() {
    return uuid();
  }

  protected createOlSource(): ol.source.Vector {
    const wfsOptions: WFSDataSourceOptions = this.options

    this.dataSourceService.checkWfsOptions(wfsOptions);

    return new ol.source.Vector({
      format: this.dataSourceService.getFormatFromOptions(wfsOptions),
      overlaps: false,
      url: function(extent: ol.Extent, resolution, proj) {
        const baseWfsQuery = 'service=WFS&request=GetFeature';
        // Mandatory
        const url = wfsOptions.url;
        // Optional
        const outputFormat = wfsOptions.outputFormat
          ? 'outputFormat=' + wfsOptions.outputFormat : '';
        const wfsVersion = wfsOptions.version
          ? 'version=' + wfsOptions.version : 'version=' + '2.0.0';

        let paramTypename = 'typename'
        let paramMaxFeatures = 'maxFeatures'
        if (wfsOptions.version === '2.0.0' || !wfsOptions.version) {
          paramTypename = 'typenames';
          paramMaxFeatures = 'count';
        }

        const featureTypes = paramTypename + '=' + wfsOptions.featureTypes;

        const maxFeatures = wfsOptions.maxFeatures
          ? paramMaxFeatures + '=' + wfsOptions.maxFeatures : paramMaxFeatures + '=5000';
        const srsname = wfsOptions.srsname
          ? 'srsname=' + wfsOptions.srsname : 'srsname=' + proj.getCode();
        const filterXML = this.ogcFilterWriter.buildFilter(
          this.options.ogcFilters.filters, extent, proj,
          this.options.fieldNameGeometry);

        const patternFilter = /filter=.*/gi;
        if (patternFilter.test(filterXML)) {
          this.options['ogcFiltered'] = true;
        } else {
          this.options['ogcFiltered'] = false;
        }

        let baseUrl = `${url}?${baseWfsQuery}&${wfsVersion}&${featureTypes}&`;
        baseUrl += `${outputFormat}&${srsname}&${filterXML}&${maxFeatures}`;

        this.options['download'] = Object.assign({},
          this.options['download'], { 'dynamicUrl': baseUrl });
        return baseUrl;
      }.bind(this),
      strategy: ol.loadingstrategy.bbox
    });

  }

  public filterByOgc(igoOgcFilterObject: IgoOgcFilterObject) { }

}
