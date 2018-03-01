import { Injectable } from '@angular/core';

import { MessageService, LanguageService } from '../../core';
import { Layer } from '../../layer/shared';
import { OgcFilterWriter } from '../../filter/shared';

@Injectable()
export class DownloadService {
  public ogcFilterWriter: OgcFilterWriter;

  constructor(private messageService: MessageService,
              private languageService: LanguageService) {
    this.ogcFilterWriter = new OgcFilterWriter;
  }

  open(layer: Layer) {
    if (layer.options['type'] === 'wfs' && layer.dataSource.options['outputFormatDownload']) {
      const translate = this.languageService.translate;
      const title = translate.instant('igo.download.title');
      this.messageService.success(translate.instant('igo.download.start'), title);

      const outputFormatDownload = 'outputformat=' +
        layer.dataSource.options['outputFormatDownload'];

      const baseurl = layer.dataSource.options.download.url
        .replace(/&?outputformat=[^&]*/gi, '')
        .replace(/&?filter=[^&]*/gi, '')
        .replace(/&?bbox=[^&]*/gi, '');

      const rebuildFilter = this.ogcFilterWriter.buildFilter(
        layer.options['filters'],
        layer.map.getExtent(),
        new ol.proj.Projection({code: layer.map.projection}),
        layer.dataSource.options['fieldNameGeometry']
      );

      window.open(`${baseurl}&${rebuildFilter}&${outputFormatDownload}`, '_blank');
    } else {
      window.open(layer.dataSource.options.download.url, '_blank');
    }
  }
}
