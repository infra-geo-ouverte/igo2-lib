import { Injectable } from '@angular/core';

import { IgoMap } from '../../map';

import { PrintOptions } from './print.interface';
import { PrintDimension } from './print.type';


declare var jsPDF: any;

@Injectable()
export class PrintService {

  private interval: any;

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

    let interval = this.interval;
    olMap.once('postcompose', function(event: any) {
      interval = setInterval(function () {
        clearInterval(interval);

        const canvas = event.context.canvas;
        const data = canvas.toDataURL('image/jpeg');
        const pdf = new jsPDF(orientation, undefined, format);
        pdf.addImage(data, 'JPEG', 0, 0, dim[0], dim[1]);
        pdf.save('map.pdf');

        olMap.setSize(size);
        olMap.getView().fit(extent);
        olMap.renderSync();
      }, 100);
    });

    olMap.setSize([width, height]);
    olMap.getView().fit(extent);
    olMap.renderSync();
  }

}
