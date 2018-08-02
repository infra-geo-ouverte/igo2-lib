import { Injectable } from '@angular/core';

import olProjection from 'ol/proj/Projection';

import { MessageService, LanguageService } from '@igo2/core';

import { Layer } from '../../layer/shared';
import { OgcFilterWriter } from '../../filter/shared';

import { DownloadDataSourceOptions } from './download.interface';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  private ogcFilterWriter: OgcFilterWriter;

  constructor(
    private messageService: MessageService,
    private languageService: LanguageService
  ) {
    this.ogcFilterWriter = new OgcFilterWriter();
  }

  open(layer: Layer) {
    const translate = this.languageService.translate;
    const title = translate.instant('igo.geo.download.title');
    this.messageService.success(
      translate.instant('igo.geo.download.start'),
      title
    );

    const DSOptions: DownloadDataSourceOptions = layer.dataSource.options;
    if (Object.keys(DSOptions.download).length > 0) {
      if (
        DSOptions.download['dynamicUrl'] &&
        DSOptions.download.url === undefined
      ) {
        let wfsOptions;
        if (
          layer.dataSource.options['wfsSource'] &&
          Object.keys(layer.dataSource.options['wfsSource']).length > 0
        ) {
          wfsOptions = layer.dataSource.options['wfsSource'];
        } else {
          wfsOptions = layer.dataSource.options;
        }

        const outputFormatDownload =
          wfsOptions['outputFormatDownload'] === undefined
            ? 'outputformat=' + wfsOptions['outputFormat']
            : 'outputformat=' + wfsOptions['outputFormatDownload'];

        const baseurl = DSOptions.download['dynamicUrl']
          .replace(/&?outputformat=[^&]*/gi, '')
          .replace(/&?filter=[^&]*/gi, '')
          .replace(/&?bbox=[^&]*/gi, '');

        const rebuildFilter = this.ogcFilterWriter.buildFilter(
          layer.dataSource.options['ogcFilters']['filters'],
          layer.map.getExtent(),
          new olProjection({ code: layer.map.projection }),
          wfsOptions['fieldNameGeometry']
        );
        window.open(
          `${baseurl}&${rebuildFilter}&${outputFormatDownload}`,
          '_blank'
        );
      } else if (DSOptions.download) {
        window.open(DSOptions.download.url, '_blank');
      }
    }
  }
}
