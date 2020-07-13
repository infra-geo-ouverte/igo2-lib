import { Injectable } from '@angular/core';

import { ConfigService } from '@igo2/core';

import { Observer } from 'rxjs';

import * as olformat from 'ol/format';
import OlFeature from 'ol/Feature';

import { ExportFormat } from './export.type';

import { Platform } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { ExportService } from './export.service';

@Injectable({
  providedIn: 'root'
})
export class ExportIonicService extends ExportService {

  constructor(
      config: ConfigService,
      private platform: Platform,
      private fileOpener: FileOpener,
      private file: File
    ) {
      super(config);
    }

    protected exportToFile(
      olFeatures: OlFeature[],
      observer: Observer<void>,
      format: ExportFormat,
      title: string,
      projectionIn: string,
      projectionOut: string
    ) {
      if (this.platform.is('cordova')) {
        const olFormat = new olformat[format]();
        const featuresText = olFormat.writeFeatures(olFeatures, {
          dataProjection: projectionOut,
          featureProjection: projectionIn,
          featureType: 'feature',
          featureNS: 'http://example.com/feature'
        });

        const fileName = `${title}.${format.toLowerCase()}`;
        const directory = this.file.externalRootDirectory + 'Download';
        this.file.writeFile(directory, fileName, featuresText, { replace: true }).then((success) =>
        this.fileOpener.open(directory + '/' + fileName, 'text/plain'));
        observer.complete();
      } else {
        super.exportToFile(
          olFeatures,
          observer,
          format,
          title,
          projectionIn,
          projectionOut
        );
      }
    }
}
