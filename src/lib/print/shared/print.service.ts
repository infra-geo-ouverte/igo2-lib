import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { IgoMap } from '../../map';
import { SourceQueue } from '../../utils/sourcequeue';
import { MessageService, MessageType, RequestService } from '../../core';

import { PrintOptions } from './print.interface';
import { PrintDimension, PrintOrientation } from './print.type';


declare var jsPDF: any;

@Injectable()
export class PrintService {

  constructor(private messageService: MessageService,
              private requestService: RequestService) {}

  print(map: IgoMap, options: PrintOptions): Subject<MessageType> {
    const status$ = new Subject();
    this.requestService.increment();

    const format = options.format;
    const resolution = +options.resolution;
    const orientation = options.orientation;
    const dim = orientation === PrintOrientation.portrait ?
      PrintDimension[format] : PrintDimension[format].slice().reverse();
    const title = options.title;

    const pdfResolution = 96;
    const marginLeft = 20;
    const marginRight = 20;
    const marginTop = 20;
    const marginBottom = 20;

    const width = dim[0] - marginLeft - marginRight;
    const height = dim[1] - marginTop - marginBottom;
    const widthPixels = Math.round(width * resolution / 25.4);
    const heightPixels = Math.round(height * resolution / 25.4);

    const olMap = map.olMap;
    const size = olMap.getSize();
    const extent = olMap.getView().calculateExtent(size);

    olMap.once('postcompose', (event: any) => {
      const canvas = event.context.canvas;

      new SourceQueue(olMap).subscribe(() => window.setTimeout(() => {
        let status = MessageType.SUCCESS;
        const pdf = new jsPDF(orientation, undefined, format);

        let image;
        try {
          image = canvas.toDataURL('image/jpeg');
        } catch (err) {
          console.log(err);
          this.messageService.error(
            'Security error: This map cannot be printed.', 'Print');
          status = MessageType.ERROR;
        }

        if (status === MessageType.SUCCESS) {
          if (image !== undefined) {
            pdf.addImage(image, 'JPEG', marginLeft, marginTop,
                         width, height);
          }

          if (title !== undefined) {
            const titleSize = 32;
            const titleWidth = (titleSize * 25.4 / pdfResolution) * title.length;

            let titleMarginLeft;
            if (titleWidth > dim[0]) {
              titleMarginLeft = 0;
            } else {
              titleMarginLeft = (dim[0] - titleWidth) / 2;
            }

            pdf.setFontSize(32);
            pdf.text(titleMarginLeft, 15, title);
          }

          pdf.save('map.pdf');
        }

        olMap.setSize(size);
        olMap.getView().fit(extent);
        olMap.renderSync();

        this.requestService.decrement();
        status$.next(status);
      }, 100));

    });

    olMap.setSize([widthPixels, heightPixels]);
    olMap.getView().fit(extent);
    olMap.renderSync();

    return status$;
  }

}
