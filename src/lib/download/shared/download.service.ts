import { Injectable } from '@angular/core';
import * as ol from 'openlayers';

import { Layer } from '../../layer/shared';
import { MessageService, LanguageService } from '../../core';
import { OgcFilterWriter } from '../../filter/shared';


@Injectable()
export class DownloadService {

  private ogcFilterWriter: OgcFilterWriter;

  constructor(private messageService: MessageService,
    private languageService: LanguageService) {
    this.ogcFilterWriter = new OgcFilterWriter;
  }

  open(layer: Layer) {
    const translate = this.languageService.translate;
    const title = translate.instant('igo.download.title');
    this.messageService.success(translate.instant('igo.download.start'), title);
    if (Object.keys(layer.dataSource.options.download).length > 0 ) {
      if (
        layer.dataSource.options.download['dynamicUrl'] &&
        layer.dataSource.options.download.url === undefined) {
        let wfsOptions;
        if (layer.dataSource.options['wfsSource'] &&
        Object.keys(layer.dataSource.options['wfsSource']).length > 0) {
          wfsOptions = layer.dataSource.options['wfsSource'];
        } else {
          wfsOptions = layer.dataSource.options;
        }

        const outputFormatDownload =
          wfsOptions['outputFormatDownload'] === undefined ?
            'outputformat=' + wfsOptions['outputFormat'] :
            'outputformat=' + wfsOptions['outputFormatDownload'];

        const baseurl = layer.dataSource.options.download['dynamicUrl']
          .replace(/&?outputformat=[^&]*/gi, '')
          .replace(/&?filter=[^&]*/gi, '')
          .replace(/&?bbox=[^&]*/gi, '');

        const rebuildFilter = this.ogcFilterWriter.buildFilter(
          layer.dataSource.options['ogcFilters']['filters'],
          layer.map.getExtent(),
          new ol.proj.Projection({ code: layer.map.projection }),
          wfsOptions['fieldNameGeometry']);
        window.open(`${baseurl}&${rebuildFilter}&${outputFormatDownload}`, '_blank');
      } else if (layer.dataSource.options.download) {
        window.open(layer.dataSource.options.download.url, '_blank');
    }
  }
  }
}
