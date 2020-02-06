import { Injectable } from '@angular/core';

import olProjection from 'ol/proj/Projection';

import { MessageService, LanguageService } from '@igo2/core';

import { Layer } from '../../layer/shared';
import { OgcFilterWriter, OgcFilterableDataSourceOptions } from '../../filter/shared';

import { DataSourceOptions } from '../../datasource/shared/datasources/datasource.interface';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  constructor(
    private messageService: MessageService,
    private languageService: LanguageService
  ) {}

  open(layer: Layer) {
    const translate = this.languageService.translate;
    const title = translate.instant('igo.geo.download.title');
    this.messageService.success(
      translate.instant('igo.geo.download.start'),
      title
    );

    const DSOptions: DataSourceOptions = layer.dataSource.options;
    if (Object.keys(DSOptions.download).length > 0) {
      if (
        DSOptions.download.dynamicUrl &&
        DSOptions.download.url === undefined
      ) {
        let wfsOptions;
        if (
          (layer.dataSource.options as any).paramsWFS &&
          Object.keys((layer.dataSource.options as any).paramsWFS).length > 0
        ) {
          wfsOptions = (layer.dataSource.options as any).paramsWFS;
        } else {
          wfsOptions = (layer.dataSource.options as any).params;
        }

        const outputFormatDownload =
          wfsOptions.outputFormatDownload === undefined
            ? 'outputformat=' + wfsOptions.outputFormat
            : 'outputformat=' + wfsOptions.outputFormatDownload;

        const baseurl = DSOptions.download.dynamicUrl
          .replace(/&?outputformat=[^&]*/gi, '')
          .replace(/&?filter=[^&]*/gi, '')
          .replace(/&?bbox=[^&]*/gi, '');

        const ogcFilters = (layer.dataSource.options as OgcFilterableDataSourceOptions).ogcFilters;

        let filterQueryString;
        filterQueryString = new OgcFilterWriter()
        .handleOgcFiltersAppliedValue(
          layer.dataSource.options,
          ogcFilters.geometryName,
          layer.map.viewController.getExtent(),
          new olProjection({ code: layer.map.projection }));
        if (!filterQueryString) {
          // Prevent getting all the features for empty filter
            filterQueryString = new OgcFilterWriter().buildFilter(
            undefined,
            layer.map.viewController.getExtent(),
            new olProjection({ code: layer.map.projection }),
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
