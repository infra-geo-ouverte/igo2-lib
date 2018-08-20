import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';
import { WFSDataSourceOptions } from '../../datasource/shared/datasources/wfs-datasource.interface';
import { WFSService } from '../../datasource/shared/wfs.service';
import { OgcFilterWriter } from './ogc-filter';
import { OgcFilterableDataSource } from './ogc-filter.interface';

@Injectable()
export class OGCFilterService {
  constructor(private wfsService: WFSService) {}

  public filterByOgc(wmsDatasource: WMSDataSource, filterString: string) {
    const wmsFilterValue =
      filterString.length > 0
        ? filterString.substr(7, filterString.length + 1)
        : undefined;
    wmsDatasource.ol.updateParams({ filter: wmsFilterValue });
  }

  public getSourceFields(wfsDatasource: OgcFilterableDataSource) {
    if (
      wfsDatasource.options['sourceFields'] === undefined ||
      Object.keys(wfsDatasource.options['sourceFields']).length === 0
    ) {
      wfsDatasource.options['sourceFields'] = [];
      this.wfsService
        .wfsGetCapabilities(wfsDatasource.options)
        .subscribe(wfsCapabilities => {
          wfsDatasource.options['wfsCapabilities'] = {
            xml: wfsCapabilities.body,
            GetPropertyValue: /GetPropertyValue/gi.test(wfsCapabilities.body)
              ? true
              : false
          };

          this.wfsService
            .defineFieldAndValuefromWFS(
              wfsDatasource.options as WFSDataSourceOptions
            )
            .subscribe(sourceFields => {
              wfsDatasource.options['sourceFields'] = sourceFields;
            });
        });
    } else {
      wfsDatasource.options['sourceFields']
        .filter(
          field => field.values === undefined || field.values.length === 0
        )
        .forEach(f => {
          this.wfsService
            .getValueFromWfsGetPropertyValues(
              wfsDatasource.options as WFSDataSourceOptions,
              f.name,
              200,
              0,
              0
            )
            .subscribe(rep => (f.values = rep));
        });
    }
  }

  public setOgcWFSFiltersOptions(wfsDatasource: OgcFilterableDataSource) {
    const options: any = wfsDatasource.options;
    const ogcFilterWriter = new OgcFilterWriter();
    if (options.ogcFilters.filters) {
      options.ogcFilters.filters = ogcFilterWriter.checkIgoFiltersProperties(
        options.ogcFilters.filters,
        options.params.fieldNameGeometry,
        true
      );
      options.ogcFilters.interfaceOgcFilters = ogcFilterWriter.defineInterfaceFilterSequence(
        options.ogcFilters.filters,
        options.params.fieldNameGeometry
      );
    } else {
      options.ogcFilters.filters = undefined;
      options.ogcFilters.interfaceOgcFilters = [];
    }

    options.isOgcFilterable =
      options.isOgcFilterable === undefined ? true : options.isOgcFilterable;
    options.ogcFilters.filtersAreEditable =
      options.ogcFilters.filtersAreEditable === undefined
        ? true
        : options.ogcFilters.filtersAreEditable;
  }

  public setOgcWMSFiltersOptions(wmsDatasource: WMSDataSource) {
    const options: any = wmsDatasource.options;
    if (
      options['sourceFields'] === undefined ||
      Object.keys(options['sourceFields']).length === 0
    ) {
      options['sourceFields'] = [{ name: '', alias: '' }];
    }
    // WMS With linked wfs
    if (options.wfsSource && Object.keys(options.wfsSource).length > 0) {
      options.wfsSource = this.checkWfsOptions(options.wfsSource);
      delete options.wfsSource.ogcFilters;
      options['fieldNameGeometry'] = options.wfsSource['fieldNameGeometry'];
      if (
        options['sourceFields'].length === 1 &&
        options['sourceFields'][0].name === ''
      ) {
        options['sourceFields'] = [];
        this.wfsService
          .wfsGetCapabilities(options)
          .subscribe(wfsCapabilities => {
            options.wfsSource['wfsCapabilities'] = {
              xml: wfsCapabilities.body,
              GetPropertyValue: /GetPropertyValue/gi.test(wfsCapabilities.body)
                ? true
                : false
            };
            this.wfsService
              .defineFieldAndValuefromWFS(options.wfsSource)
              .subscribe(sourceFields => {
                options.wfsSource['sourceFields'] = sourceFields;
              });
          });
      } else {
        options['sourceFields']
          .filter(
            field => field.values === undefined || field.values.length === 0
          )
          .forEach(f => {
            this.wfsService
              .getValueFromWfsGetPropertyValues(
                options.wfsSource,
                f.name,
                200,
                0,
                0
              )
              .subscribe(rep => (f.values = rep));
          });
      }

      const outputFormat =
        options.wfsSource.outputFormat !== undefined
          ? 'outputFormat=' + options.wfsSource.outputFormat
          : '';

      let paramMaxFeatures = 'maxFeatures';
      if (options.wfsSource.version === '2.0.0' || !options.wfsSource.version) {
        paramMaxFeatures = 'count';
      }
      const maxFeatures = options.wfsSource.maxFeatures
        ? paramMaxFeatures + '=' + options.wfsSource.maxFeatures
        : paramMaxFeatures + '=5000';
      const srsname = options.wfsSource.srsname
        ? 'srsname=' + options.wfsSource.srsname
        : 'srsname=EPSG:3857';
      const baseWfsQuery = this.wfsService.buildBaseWfsUrl(
        options.wfsSource,
        'GetFeature'
      );
      options.download = Object.assign({}, options.download, {
        dynamicUrl: `${baseWfsQuery}&${outputFormat}&${srsname}&${maxFeatures}`
      });
    }

    if (options.isOgcFilterable) {
      const ogcFilterWriter = new OgcFilterWriter();
      if (options.ogcFilters && options.ogcFilters.filters) {
        options.ogcFilters.filters = ogcFilterWriter.checkIgoFiltersProperties(
          options.ogcFilters.filters,
          options['fieldNameGeometry'],
          true
        );
        options.ogcFilters.interfaceOgcFilters = ogcFilterWriter.defineInterfaceFilterSequence(
          // With some wms server, this param must be set to make spatials call.
          options.ogcFilters.filters,
          options['fieldNameGeometry']
        );
        this.filterByOgc(
          wmsDatasource,
          ogcFilterWriter.buildFilter(options.ogcFilters.filters)
        );
        options['ogcFiltered'] = true;
      } else {
        options.ogcFilters.filters = undefined;
        options.ogcFilters.interfaceOgcFilters = [];
        options['ogcFiltered'] = false;
      }
    }
  }

  private checkWfsOptions(
    wfsDataSourceOptions: WFSDataSourceOptions
  ): WFSDataSourceOptions {
    const mandatoryParamMissing: any[] = [];

    if (!wfsDataSourceOptions.url) {
      mandatoryParamMissing.push('url');
    }
    ['featureTypes', 'fieldNameGeometry', 'outputFormat'].forEach(element => {
      if (wfsDataSourceOptions.params[element] === undefined) {
        mandatoryParamMissing.push(element);
      }
    });

    if (mandatoryParamMissing.length > 0) {
      throw new Error(
        `A mandatory parameter is missing
          for your WFS datasource source.
          (Mandatory parameter(s) missing :` + mandatoryParamMissing
      );
    }

    // Look at https://github.com/openlayers/openlayers/pull/6400
    const patternGml = new RegExp('.*?gml.*?');

    if (patternGml.test(wfsDataSourceOptions.params.outputFormat)) {
      wfsDataSourceOptions.params.version = '1.1.0';
    }

    return Object.assign({}, wfsDataSourceOptions, {
      wfsCapabilities: { xml: '', GetPropertyValue: false }
    });
  }
}
