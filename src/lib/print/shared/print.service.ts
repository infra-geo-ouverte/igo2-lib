import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { IgoMap } from '../../map';
import { SourceQueue } from '../../utils/sourcequeue';
import { MessageService, MessageType, RequestService } from '../../core';

import { PrintOptions } from './print.interface';
import { PrintDimension } from './print.type';


declare var jsPDF: any;

@Injectable()
export class PrintService {

  constructor(private messageService: MessageService,
              private requestService: RequestService) {}

  print(map: IgoMap, options: PrintOptions): Subject<MessageType> {
    const status$ = new Subject();
    const messageService = this.messageService;
    const requestService = this.requestService;
    requestService.increment();

    const format = options.format;
    const resolution = +options.resolution;
    const orientation = options.orientation;
    const dim = PrintDimension[format];
    const width = Math.round(dim[0] * resolution / 25.4);
    const height = Math.round(dim[1] * resolution / 25.4);

    const olMap = map.olMap;
    const size = olMap.getSize();
    const extent = olMap.getView().calculateExtent(size);

    olMap.once('postcompose', function(event: any) {
      const canvas = event.context.canvas;

      new SourceQueue(olMap).subscribe(() => window.setTimeout(function() {
        const pdf = new jsPDF(orientation, undefined, format);

        let image;
        try {
          image = canvas.toDataURL('image/jpeg');
        } catch (err) {
          console.log(err);
          messageService.error(
            'Security error: This map cannot be printed.', 'Print');
        }

        let status;
        if (image !== undefined) {
          pdf.addImage(image, 'JPEG', 0, 0, dim[0], dim[1]);
          pdf.save('map.pdf');
          status = MessageType.SUCCESS;
        } else {
          status = MessageType.ERROR;
        }

        olMap.setSize(size);
        olMap.getView().fit(extent);
        olMap.renderSync();

        requestService.decrement();
        status$.next(status);
      }, 100));

    });

    olMap.setSize([width, height]);
    olMap.getView().fit(extent);
    olMap.renderSync();

    return status$;
  }

}
