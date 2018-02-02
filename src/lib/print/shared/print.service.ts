import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { IgoMap } from '../../map';
import { SubjectStatus } from '../../utils';
import { MessageService, ActivityService } from '../../core';

import { PrintOptions } from './print.interface';
import { PrintDimension, PrintOrientation } from './print.type';


declare var jsPDF: any;

@Injectable()
export class PrintService {

  constructor(private messageService: MessageService,
              private activityService: ActivityService) {}

  print(map: IgoMap, options: PrintOptions): Subject<any> {
    const status$ = new Subject();

    const format = options.format;
    const resolution = +options.resolution;
    const orientation = options.orientation;
    const dimensions = orientation === PrintOrientation.portrait ?
      PrintDimension[format] : PrintDimension[format].slice().reverse();

    const margins = [20, 10, 20, 10];
    const width = dimensions[0] - margins[3] - margins[1];
    const height = dimensions[1] - margins[0] - margins[2];
    const size = [width, height];

    const activityId = this.activityService.register();
    const doc = new jsPDF(options.orientation, undefined, format);

    if (options.title !== undefined) {
      this.addTitle(doc, options.title, dimensions[0]);
    }

    this.addMap(doc, map, resolution, size, margins)
      .subscribe((status: SubjectStatus) => {
        if (status === SubjectStatus.Done) {
          doc.save('map.pdf');
        }

        if (status === SubjectStatus.Done || status === SubjectStatus.Error) {
          this.activityService.unregister(activityId);
          status$.next(SubjectStatus.Done);
        }
      });

    return status$;
  }

  private addTitle(doc: typeof jsPDF, title: string, pageWidth: number) {
    const pdfResolution = 96;
    const titleSize = 32;
    const titleWidth = (titleSize * 25.4 / pdfResolution) * title.length;

    let titleMarginLeft;
    if (titleWidth > pageWidth) {
      titleMarginLeft = 0;
    } else {
      titleMarginLeft = (pageWidth - titleWidth) / 2;
    }

    doc.setFont('courier');
    doc.setFontSize(32);
    doc.text(titleMarginLeft, 15, title);
  }

  private addCanvas(doc: typeof jsPDF, canvas: HTMLCanvasElement,
                    size: Array<number>, margins: Array<number>) {

    let image;
    try {
      image = canvas.toDataURL('image/jpeg');
    } catch (err) {
      this.messageService.error(
        'Security error: This map cannot be printed.',
        'Print', 'print');

      throw new Error(err);
    }

    if (image !== undefined) {
      doc.addImage(image, 'JPEG', margins[3], margins[0], size[0], size[1]);
      doc.rect(margins[3], margins[0], size[0], size[1]);
    }
  }

  private addMap(doc: typeof jsPDF, map: IgoMap, resolution: number,
                 size: Array<number>, margins: Array<number>) {

    const status$ = new Subject();

    const mapSize = map.ol.getSize();
    const extent = map.ol.getView().calculateExtent(mapSize);

    const widthPixels = Math.round(size[0] * resolution / 25.4);
    const heightPixels = Math.round(size[1] * resolution / 25.4);

    let timeout;

    map.ol.once('postcompose', (event: any) => {
      const canvas = event.context.canvas;
      const mapStatus$$ = map.status$.subscribe((mapStatus: SubjectStatus) => {
        clearTimeout(timeout);

        if (mapStatus !== SubjectStatus.Done) { return; }

        mapStatus$$.unsubscribe();

        let status = SubjectStatus.Done;
        try {
          this.addCanvas(doc, canvas, size, margins);
        } catch (err) {
          status = SubjectStatus.Error;
        }

        this.renderMap(map, mapSize, extent);
        status$.next(status);
      });

      // If no loading as started after 200ms, then probably no loading
      // is required.
      timeout = window.setTimeout(() => {
        mapStatus$$.unsubscribe();

        let status = SubjectStatus.Done;
        try {
          this.addCanvas(doc, canvas, size, margins);
        } catch (err) {
          status = SubjectStatus.Error;
        }

        this.renderMap(map, mapSize, extent);
        status$.next(status);
      }, 200);
    });

    this.renderMap(map, [widthPixels, heightPixels], extent);

    return status$;
  }

  private renderMap(map, size, extent) {
    map.ol.setSize(size);
    map.ol.getView().fit(extent);
    map.ol.renderSync();
  }

}
