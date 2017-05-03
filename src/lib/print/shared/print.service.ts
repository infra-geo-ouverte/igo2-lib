import { Injectable } from '@angular/core';

import { IgoMap } from '../../map';
import { SourceQueue } from '../../utils/sourcequeue';

import { PrintOptions } from './print.interface';
import { PrintDimension } from './print.type';


declare var jsPDF: any;

@Injectable()
export class PrintService {

  constructor() {}

  print(map: IgoMap, options: PrintOptions) {
    const format = options.format;
    const resolution = +options.resolution;
    const orientation = options.orientation;

    const olMap = map.olMap;
    const dim = PrintDimension[format];
    const width = Math.round(dim[0] * resolution / 25.4);
    const height = Math.round(dim[1] * resolution / 25.4);
    const size = olMap.getSize();
    const extent = olMap.getView().calculateExtent(size);

    olMap.once('postcompose', function(event: any) {
      const canvas = event.context.canvas;

      new SourceQueue(olMap).subscribe(() => {
        window.setTimeout(function() {
          const pdf = new jsPDF(orientation, undefined, format);

          let image;
          try {
            image = canvas.toDataURL('image/jpeg');
          } catch (err) {
            // TODO: Handle CORS errors
            console.log('Security error: This map cannot be printed.');
          }

          if (image !== undefined) {
            pdf.addImage(image, 'JPEG', 0, 0, dim[0], dim[1]);
            pdf.save('map.pdf');
          }

          olMap.setSize(size);
          olMap.getView().fit(extent);
          olMap.renderSync();
        }, 100);
      }, this);
    });

    olMap.setSize([width, height]);
    olMap.getView().fit(extent);
    olMap.renderSync();
  }

}
