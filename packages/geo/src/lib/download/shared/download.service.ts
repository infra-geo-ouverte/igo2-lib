import { Injectable } from '@angular/core';

import { MessageService } from '@igo2/core/message';

import * as olproj from 'ol/proj';
import olProjection from 'ol/proj/Projection';

import { DataSourceOptions } from '../../datasource/shared/datasources/datasource.interface';
import {
  OgcFilterWriter,
  OgcFilterableDataSourceOptions
} from '../../filter/shared';
import { Layer } from '../../layer';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  constructor(private messageService: MessageService) {}

  open(layer: Layer) {
    this.messageService.success(
      'igo.geo.download.start',
      'igo.geo.download.title'
    );

    const DSOptions: DataSourceOptions = layer.dataSource.options;
    if (Object.keys(DSOptions.download).length > 0) {
      if (
        DSOptions.download.dynamicUrl &&
        DSOptions.download.url === undefined
      ) {
        let wfsOptions;
        let currentProj = new olProjection({ code: layer.map.projection });
        const paramsWFS = (layer.dataSource.options as any).paramsWFS;
        if (paramsWFS && Object.keys(paramsWFS).length > 0) {
          currentProj = paramsWFS.srsName
            ? new olProjection({ code: paramsWFS.srsName })
            : currentProj;
          wfsOptions = (layer.dataSource.options as any).paramsWFS;
        } else {
          wfsOptions = (layer.dataSource.options as any).params;
        }

        const currentExtent = olproj.transformExtent(
          layer.map.viewController.getExtent(),
          new olProjection({ code: layer.map.projection }),
          currentProj
        );
        const outputFormatDownload =
          wfsOptions.outputFormatDownload === undefined
            ? wfsOptions.outputFormat === undefined
              ? ''
              : 'outputformat=' + wfsOptions.outputFormat
            : 'outputformat=' + wfsOptions.outputFormatDownload;

        const baseurl = DSOptions.download.dynamicUrl
          .replace(/&?outputformat=[^&]*/gi, '')
          .replace(/&?filter=[^&]*/gi, '')
          .replace(/&?bbox=[^&]*/gi, '');

        const ogcFilters = (
          layer.dataSource.options as OgcFilterableDataSourceOptions
        ).ogcFilters;

        let filterQueryString;
        filterQueryString = new OgcFilterWriter().handleOgcFiltersAppliedValue(
          layer.dataSource.options,
          ogcFilters.geometryName,
          currentExtent as [number, number, number, number],
          currentProj
        );
        if (!filterQueryString) {
          // Prevent getting all the features for empty filter
          filterQueryString = new OgcFilterWriter().buildFilter(
            undefined,
            currentExtent as [number, number, number, number],
            currentProj,
            ogcFilters.geometryName
          );
        } else {
          filterQueryString = 'filter=' + encodeURIComponent(filterQueryString);
        }
        window.open(
          `${baseurl}&${filterQueryString}&${outputFormatDownload}`,
          '_blank'
        );
      } else if (DSOptions.download) {
        window.open(DSOptions.download.url, '_blank');
      }
    }
  }
}
