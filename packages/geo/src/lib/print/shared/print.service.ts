import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { SecureImagePipe } from '@igo2/common';
import { ActivityService } from '@igo2/core/activity';
import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';
import { SubjectStatus } from '@igo2/utils';

import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { default as JSZip } from 'jszip';
import { Observable, Subject, forkJoin } from 'rxjs';
import { map as rxMap } from 'rxjs/operators';

import { LegendMapViewOptions } from '../../layer/shared/layers/legend.interface';
import { getLayersLegends } from '../../layer/utils/outputLegend';
import { IgoMap } from '../../map/shared/map';
import { formatScale } from '../../map/shared/map.utils';
import GeoPdfPlugin from './geopdf';
import { PrintOptions, TextPdfSizeAndMargin } from './print.interface';
import {
  PrintLegendPosition,
  PrintPaperFormat,
  PrintResolution
} from './print.type';

declare global {
  interface Navigator {
    msSaveBlob?: (blob: any, defaultName?: string) => boolean;
  }
}

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  zipFile: JSZip;
  nbFileToProcess: number;
  activityId: string;
  mapPrintExtent: Array<number>;
  imgSizeAdded: Array<number>;

  TEXTPDFFONT = {
    titleFont: 'times',
    titleFontStyle: 'bold',
    subtitleFont: 'times',
    subtitleFontStyle: 'bold',
    commentFont: 'times',
    commentFontStyle: 'normal',
    commentFontSize: 12
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private activityService: ActivityService,
    private languageService: LanguageService,
    private configService: ConfigService
  ) {}

  print(map: IgoMap, options: PrintOptions): Subject<any> {
    const status$ = new Subject();
    const paperFormat: string = options.paperFormat;
    const resolution = +options.resolution; // Default is 96
    const orientation = options.orientation;
    const legendPostion = options.legendPosition;
    this.activityId = this.activityService.register();

    GeoPdfPlugin(jsPDF.API);

    const doc = new jsPDF({
      orientation,
      format: paperFormat.toLowerCase(),
      unit: 'mm' // default
    });

    const { width: pageWidth, height: pageHeight } = doc.internal.pageSize;

    /** top | right | bottom | left */
    const baseMargins: [number, number, number, number] = [10, 10, 10, 10];

    let titleSizes: TextPdfSizeAndMargin;
    let subtitleSizes: TextPdfSizeAndMargin;

    // if paper format A1 or A0 add margin top
    if (
      (options.title !== '' || options.subtitle !== '') &&
      (paperFormat === PrintPaperFormat.A1 ||
        paperFormat === PrintPaperFormat.A0)
    ) {
      baseMargins[0] += 10;
    }
    // PDF title
    const fontSizeInPt = Math.round(2 * (pageHeight + 145) * 0.05) / 2; //calculate the fontSize title from the page height.
    if (options.title !== undefined && options.title !== '') {
      titleSizes = this.getTextPdfObjectSizeAndMarg(
        options.title,
        baseMargins,
        this.TEXTPDFFONT.titleFont,
        fontSizeInPt,
        this.TEXTPDFFONT.titleFontStyle,
        doc
      );

      this.addTextInPdfDoc(
        doc,
        options.title,
        this.TEXTPDFFONT.titleFont,
        this.TEXTPDFFONT.titleFontStyle,
        titleSizes.fontSize,
        titleSizes.marginLeft + baseMargins[3],
        baseMargins[0]
      );

      baseMargins[0] = titleSizes.height + baseMargins[0]; // cumulative margin top for next elem to place in pdf doc
    }

    // PDF subtitle
    if (options.subtitle !== undefined && options.subtitle !== '') {
      subtitleSizes = this.getTextPdfObjectSizeAndMarg(
        options.subtitle,
        baseMargins,
        this.TEXTPDFFONT.subtitleFont,
        options.title !== '' ? titleSizes.fontSize * 0.7 : fontSizeInPt * 0.7, // 70% size of title
        this.TEXTPDFFONT.subtitleFontStyle,
        doc
      );

      this.addTextInPdfDoc(
        doc,
        options.subtitle,
        this.TEXTPDFFONT.subtitleFont,
        this.TEXTPDFFONT.subtitleFontStyle,
        subtitleSizes.fontSize,
        subtitleSizes.marginLeft + baseMargins[3],
        baseMargins[0]
      );

      baseMargins[0] += 5; // cumulative marg top for next elem to place in pdf doc. 5 is a fix it could be adjust
    }

    const verticalSpacing: number = 5;
    if (options.comment !== undefined && options.comment !== '') {
      this.addComment(doc, options.comment, baseMargins, verticalSpacing);
    }

    if (options.showProjection === true || options.showScale === true) {
      this.addProjScale(
        doc,
        map,
        resolution,
        options.showProjection,
        options.showScale,
        baseMargins,
        verticalSpacing
      );
    }

    const width = pageWidth - baseMargins[3] - baseMargins[1];
    const height = pageHeight - baseMargins[0] - baseMargins[2];
    const size: [number, number] = [width, height];

    this.addMap(
      doc,
      map,
      resolution,
      size,
      baseMargins,
      legendPostion
    ).subscribe(async (status: SubjectStatus) => {
      if (status === SubjectStatus.Done) {
        await this.handleMeasureLayer(doc, map, baseMargins);
        const width = this.imgSizeAdded[0];
        const height = this.imgSizeAdded[1];
        this.addGeoRef(doc, map, width, height, baseMargins);

        if (options.legendPosition !== 'none') {
          if (
            ['topleft', 'topright', 'bottomleft', 'bottomright'].indexOf(
              options.legendPosition
            ) > -1
          ) {
            await this.addLegendSamePage(
              doc,
              map,
              baseMargins,
              resolution,
              options.legendPosition
            );
          } else if (options.legendPosition === 'newpage') {
            await this.addLegend(doc, map, baseMargins, resolution);
          }
        } else {
          await this.saveDoc(doc);
        }
      }

      if (status === SubjectStatus.Done || status === SubjectStatus.Error) {
        this.activityService.unregister(this.activityId);
        status$.next(SubjectStatus.Done);
      }
    });

    return status$;
  }
  // ref GeoMoose https://github.com/geomoose/gm3/tree/main/src/gm3/components/print
  addGeoRef(
    doc,
    map: IgoMap,
    width: number,
    height: number,
    baseMargins: [number, number, number, number]
  ) {
    const unit = 'mm';
    const docHeight = doc.internal.pageSize.getHeight();

    // x,y = margin left-bottom corner for img in pdf doc
    const x = baseMargins[3];
    const y = docHeight - baseMargins[0] - height;

    let pdf_extents = [x, y, x + width, y + height];
    for (let i = 0; i < pdf_extents.length; i++) {
      pdf_extents[i] = this.pdf_units2points(pdf_extents[i], unit);
    }
    doc.setGeoArea(pdf_extents, this.mapPrintExtent);
  }

  /**
   * Add measure overlay on the map on the document when the measure layer is present
   * @param  doc - Pdf document where measure tooltip will be added
   * @param  map - Map of the app
   * @param  baseMargins - Page margins
   */
  private async handleMeasureLayer(
    doc: jsPDF,
    map: IgoMap,
    baseMargins: [number, number, number, number]
  ) {
    if (
      map.layers.find(
        (layer) => layer.visible && layer.id.startsWith('igo-measures-')
      )
    ) {
      let canvasOverlayHTMLMeasures;
      const mapOverlayMeasuresHTML = map.ol.getOverlayContainer();
      await html2canvas(mapOverlayMeasuresHTML, {
        scale: 1,
        backgroundColor: null
      }).then((e) => {
        canvasOverlayHTMLMeasures = e;
      });
      this.addCanvas(doc, canvasOverlayHTMLMeasures, baseMargins); // this adds measure overlays
    }
  }

  /**
   * Get html code for all layers legend
   * @param  map IgoMap
   * @param  width The width that the legend need to be
   * @return Html code for the legend
   */
  getLayersLegendHtml(
    map: IgoMap,
    width: number,
    resolution: number
  ): Observable<string> {
    return new Observable((observer) => {
      let html = '';
      const legends = getLayersLegends(map.layers, {
        resolution: map.viewController.getResolution(),
        extent: map.viewController.getExtent(),
        projection: map.viewController.getOlProjection().getCode(),
        // scale: map.viewController.getScale(resolution),
        size: map.ol.getSize()
      } as LegendMapViewOptions);

      if (legends.filter((l) => l.display === true).length === 0) {
        observer.next(html);
        observer.complete();
        return;
      }
      // Define important style to be sure that all container is convert
      // to image not just visible part
      html += '<style media="screen" type="text/css">';
      html +=
        '.html2canvas-container { width: ' +
        width +
        'mm !important; height: 2000px !important; }';
      html += 'table.tableLegend {table-layout: auto;}';
      html +=
        'div.styleLegend {padding-top: 5px; padding-right:5px;padding-left:5px;padding-bottom:5px;}';
      html += '</style>';
      // The font size will also be lowered afterwards (globally along the legend size)
      // this allows having a good relative font size here and to keep ajusting the legend size
      // while keeping good relative font size
      html += '<font size="3" face="Times" >';
      html += '<div class="styleLegend">';
      html += '<table class="tableLegend" >';

      // For each legend, define an html table cell
      const images$ = legends
        .filter((l) => l.display && l.isInResolutionsRange === true)
        .map((legend) =>
          this.getDataImage(legend.url).pipe(
            rxMap((dataImage) => {
              let htmlImg =
                '<tr><td>' + legend.title.toUpperCase() + '</td></tr>';
              htmlImg += '<tr><td><img src="' + dataImage + '"></td></tr>';
              return htmlImg;
            })
          )
        );
      forkJoin(images$).subscribe((dataImages) => {
        html = dataImages.reduce((acc, current) => (acc += current), html);
        html += '</table>';
        html += '</div>';
        observer.next(html);
        observer.complete();
      });
    });
  }

  getDataImage(url: string): Observable<string> {
    const secureIMG = new SecureImagePipe(this.http, this.configService);
    return secureIMG.transform(url);
  }

  /**
   * Get all the legend in a single image
   * * @param  format - Image format. default value to "png"
   * @return The image of the legend
   */
  async getLayersLegendImage(
    map,
    format: string = 'png',
    doZipFile: boolean,
    resolution: number
  ) {
    const status$ = new Subject();
    // Get html code for the legend
    const width = 200; // milimeters unit, originally define for document pdf
    let html = await this.getLayersLegendHtml(
      map,
      width,
      resolution
    ).toPromise();
    format = format.toLowerCase();

    // If no legend show No LEGEND in an image
    if (html.length === 0) {
      html = '<font size="12" face="Courier New" >';
      html += '<div align="center"><b>NO LEGEND</b></div>';
    }
    // Create div to contain html code for legend
    const div = window.document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.zIndex = '-1';
    // Add html code to convert in the new window
    window.document.body.appendChild(div);
    div.innerHTML = html;

    await this.timeout(1);
    const canvas = await html2canvas(div, { useCORS: true }).catch((e) => {
      console.log(e);
    });
    this.removeHtmlElement(div);
    if (canvas) {
      let status = SubjectStatus.Done;
      try {
        if (!doZipFile) {
          // Save the canvas as file
          this.saveCanvasImageAsFile(canvas, 'legendImage', format);
        } else {
          // Add the canvas to zip
          this.generateCanvaFileToZip(canvas, 'legendImage' + '.' + format);
        }
      } catch (err) {
        status = SubjectStatus.Error;
      }
      status$.next(status);
    }

    return status$;
  }

  private removeHtmlElement(element: HTMLElement) {
    element.parentNode.removeChild(element);
  }

  getTextPdfObjectSizeAndMarg(
    text: string,
    margins,
    font: string,
    fontSizeInPt: number,
    fontStyle: string,
    doc: jsPDF
  ): TextPdfSizeAndMargin {
    const pdfResolution = 96;
    const docWidth = doc.internal.pageSize.getWidth();
    const pageWidth = docWidth - margins[1] - margins[3];

    // important to set it first, the textDimension change when font change!
    doc.setFont(font, fontStyle);
    doc.setFontSize(fontSizeInPt);

    let textDimensions = doc.getTextDimensions(text);
    let textMarginLeft: number;

    if (textDimensions.w > pageWidth) {
      // if the text is to long, reduce fontSize 70% and the overflow with be cut in print...
      textMarginLeft = 0;
      fontSizeInPt = fontSizeInPt * 0.7;
      doc.setFontSize(fontSizeInPt);
      textDimensions = doc.getTextDimensions(text);
    } else {
      textMarginLeft = (pageWidth - textDimensions.w) / 2;
    }

    return {
      fontSize: fontSizeInPt,
      marginLeft: textMarginLeft,
      height: textDimensions.h
    };
  }

  /**
   * Add comment to the document
   * @param  doc - pdf document
   * @param  comment - Comment to add in the document
   * @param baseMargins - top | right | bottom | left
   * @param verticalSpacing - calculate text position and map height
   */
  private addComment(
    doc: jsPDF,
    comment: string,
    baseMargins: [number, number, number, number],
    verticalSpacing: number
  ) {
    // calculate map image height
    baseMargins[2] += verticalSpacing;

    const xPosition = baseMargins[3]; //margin left and bottom is fix
    const marginBottom = baseMargins[2];
    // calculate text position Y
    const yPosition =
      doc.internal.pageSize.height - marginBottom + verticalSpacing;

    this.addTextInPdfDoc(
      doc,
      comment,
      this.TEXTPDFFONT.commentFont,
      this.TEXTPDFFONT.commentFontStyle,
      this.TEXTPDFFONT.commentFontSize,
      xPosition,
      yPosition,
      true
    );
  }

  private addTextInPdfDoc(
    doc: jsPDF,
    textToAdd: string,
    textFont: string,
    textFontStyle: string,
    textFontSize: number,
    textMarginLeft: number,
    textMarginTop: number,
    isComment: boolean = false
  ) {
    doc.setFont(textFont, textFontStyle);
    doc.setFontSize(textFontSize);

    if (isComment) {
      textToAdd = doc.splitTextToSize(
        textToAdd,
        doc.internal.pageSize.getWidth() - textMarginLeft * 3
      );
    }
    doc.text(textToAdd, textMarginLeft, textMarginTop);
  }

  /**
   * Add projection and/or scale to the document
   * @param  doc - pdf document
   * @param  map - Map of the app
   * @param  dpi - DPI resolution of the document
   * @param  projection - Bool to indicate if projection need to be added
   * @param  scale - Bool to indicate if scale need to be added
   * @param baseMargins - top | right | bottom | left
   * @param verticalSpacing - calculate text position and map height
   */
  private addProjScale(
    doc: jsPDF,
    map: IgoMap,
    dpi: number,
    projection: boolean,
    scale: boolean,
    baseMargins: [number, number, number, number],
    verticalSpacing: number
  ) {
    // calculate map image height
    baseMargins[2] += verticalSpacing;
    const translate = this.languageService.translate;
    const projScaleSize = 12;
    const xPosition = baseMargins[3];
    const marginBottom = baseMargins[2];
    // calculate text position Y
    const yPosition =
      doc.internal.pageSize.height - marginBottom + verticalSpacing;

    let textProjScale: string = '';
    if (projection === true) {
      const projText = translate.instant('igo.geo.printForm.projection');
      textProjScale += projText + ': ' + map.projection;
    }
    if (scale === true) {
      if (projection === true) {
        textProjScale += '   ';
      }
      const scaleText = translate.instant('igo.geo.printForm.scale');
      const mapScale = map.viewController.getScale(dpi);
      textProjScale += scaleText + ': ~ 1 / ' + formatScale(mapScale);
    }
    doc.setFont(this.TEXTPDFFONT.commentFont);
    doc.setFontSize(projScaleSize);
    doc.text(textProjScale, xPosition, yPosition);
  }

  /**
   * Add the legend to the document
   * @param  doc - Pdf document where legend will be added
   * @param  map - Map of the app
   * @param  margins - Page margins
   */
  private async addLegend(
    doc: jsPDF,
    map: IgoMap,
    margins: Array<number>,
    resolution: number
  ) {
    // Get html code for the legend
    const width = doc.internal.pageSize.width;
    const html = await this.getLayersLegendHtml(
      map,
      width,
      resolution
    ).toPromise();
    // If no legend, save the map directly
    if (html === '') {
      await this.saveDoc(doc);
      return true;
    }
    // Create div to contain html code for legend
    const div = window.document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.zIndex = '-1';

    // Add html code to convert in the new window
    window.document.body.appendChild(div);
    div.innerHTML = html;

    await this.timeout(1);
    const canvas = await html2canvas(div, { useCORS: true }).catch((e) => {
      console.log(e);
    });
    this.removeHtmlElement(div);
    if (canvas) {
      const pourcentageReduction = 0.85;
      const imageSize = [
        (pourcentageReduction * (25.4 * canvas.width)) / resolution,
        (pourcentageReduction * (25.4 * canvas.height)) / resolution
      ];
      let imgData;
      doc.addPage();
      imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 10, 10, imageSize[0], imageSize[1]);
    }

    await this.saveDoc(doc);
  }

  /**
   * Add the legend to the document
   * @param  doc - Pdf document where legend will be added
   * @param  map - Map of the app
   * @param  baseMargins - Page margins
   */
  private async addLegendSamePage(
    doc: jsPDF,
    map: IgoMap,
    baseMargins: [number, number, number, number],
    resolution: number,
    legendPosition: string
  ) {
    // Get html code for the legend
    const width = doc.internal.pageSize.width;
    const html = await this.getLayersLegendHtml(
      map,
      width,
      resolution
    ).toPromise();
    // If no legend, save the map directly
    if (html === '') {
      await this.saveDoc(doc);
      return true;
    }
    // Create div to contain html code for legend
    const div = window.document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.zIndex = '-1';
    // Add html code to convert in the new window
    window.document.body.appendChild(div);
    div.innerHTML = html;
    await this.timeout(1);
    const canvas = await html2canvas(div, { useCORS: true }).catch((e) => {
      console.log(e);
    });
    this.removeHtmlElement(div);
    let marginsLegend;
    if (canvas) {
      const pourcentageReduction = 0.85;
      const imageSize = [
        (pourcentageReduction * (25.4 * canvas.width)) / resolution,
        (pourcentageReduction * (25.4 * canvas.height)) / resolution
      ];
      // Move the legend to the correct position on the page
      if (legendPosition === 'bottomright') {
        marginsLegend = [
          doc.internal.pageSize.height - baseMargins[2] - imageSize[1],
          baseMargins[1],
          baseMargins[2],
          doc.internal.pageSize.width - baseMargins[1] - imageSize[0]
        ];
      } else if (legendPosition === 'topright') {
        marginsLegend = [
          baseMargins[0],
          baseMargins[1],
          doc.internal.pageSize.height - baseMargins[0] - imageSize[1],
          doc.internal.pageSize.width - baseMargins[1] - imageSize[0]
        ];
      } else if (legendPosition === 'bottomleft') {
        // When the legend is in the bottom left, raise the legend slightly upward so that attributions are visible
        marginsLegend = [
          doc.internal.pageSize.height - baseMargins[2] - imageSize[1],
          doc.internal.pageSize.width - baseMargins[3] - imageSize[0],
          baseMargins[2],
          baseMargins[3]
        ];
      } else if (legendPosition === 'topleft') {
        marginsLegend = [
          baseMargins[0],
          doc.internal.pageSize.width - baseMargins[3] - imageSize[0],
          doc.internal.pageSize.height - baseMargins[0] - imageSize[1],
          baseMargins[3]
        ];
      }
      this.addCanvas(doc, canvas, marginsLegend); // this adds the legend
      await this.saveDoc(doc);
    }
  }

  defineNbFileToProcess(nbFileToProcess) {
    this.nbFileToProcess = nbFileToProcess;
  }

  private timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private addCanvas(
    doc: jsPDF,
    canvas: HTMLCanvasElement,
    baseMargins: [number, number, number, number]
  ) {
    let image;
    if (canvas) {
      image = canvas.toDataURL('image/png');
    }

    if (image !== undefined) {
      if (image.length < 20) {
        console.log('Warning: An image cannot be print in pdf file');
        return;
      }
      const imageSize = this.getImageSizeToFitPdf(doc, canvas, baseMargins);
      doc.addImage(
        image,
        'PNG',
        baseMargins[3],
        baseMargins[0],
        imageSize[0],
        imageSize[1]
      );
      doc.rect(baseMargins[3], baseMargins[0], imageSize[0], imageSize[1]);
      this.imgSizeAdded = imageSize; // keep img size for georef later
    }
  }

  // TODO fix printing with image resolution
  addMap(
    doc: jsPDF,
    map: IgoMap,
    resolution: number,
    imageDimensions: [number, number],
    baseMargins: [number, number, number, number],
    legendPostion: PrintLegendPosition
  ) {
    const mapSize = map.ol.getSize() as [number, number];
    const viewResolution = map.ol.getView().getResolution();
    const dimensionPixels = this.setMapResolution(
      map,
      imageDimensions,
      resolution,
      viewResolution
    );
    const status$ = new Subject();

    let timeout;
    map.ol.once('rendercomplete', async (event: any) => {
      const mapCanvas = event.target
        .getViewport()
        .getElementsByTagName('canvas') as HTMLCollectionOf<HTMLCanvasElement>;

      const mapResultCanvas = await this.drawMap(dimensionPixels, mapCanvas);

      this.mapPrintExtent = map.viewController.getExtent('EPSG:3857');

      this.resetOriginalMapSize(map, mapSize, viewResolution);

      await this.drawMapControls(map, mapResultCanvas, legendPostion);

      const mapStatus$$ = map.status$.subscribe((mapStatus: SubjectStatus) => {
        clearTimeout(timeout);
        if (mapStatus !== SubjectStatus.Done) {
          return;
        }
        mapStatus$$.unsubscribe();
        let status = SubjectStatus.Done;
        try {
          if (mapResultCanvas.width !== 0) {
            this.addCanvas(doc, mapResultCanvas, baseMargins);
          }
        } catch (err) {
          status = SubjectStatus.Error;
          this.messageService.error(
            'igo.geo.printForm.corsErrorMessageBody',
            'igo.geo.printForm.corsErrorMessageHeader'
          );
        }
        status$.next(status);
      });

      // If no loading as started after 200ms, then probably no loading
      // is required.
      timeout = window.setTimeout(() => {
        mapStatus$$.unsubscribe();

        let status = SubjectStatus.Done;
        try {
          if (mapResultCanvas.width !== 0) {
            this.addCanvas(doc, mapResultCanvas, baseMargins);
          }
        } catch (err) {
          status = SubjectStatus.Error;
          this.messageService.error(
            'igo.geo.printForm.corsErrorMessageBody',
            'igo.geo.printForm.corsErrorMessageHeader'
          );
        }
        this.resetOriginalMapSize(map, mapSize, viewResolution);
        status$.next(status);
      }, 200);
    });

    return status$;
  }

  private setMapResolution(
    map: IgoMap,
    initialSize: [number, number],
    resolution: number,
    viewResolution: number
  ): [number, number] {
    const mapSize = map.ol.getSize();
    const widthPixels = Math.round((initialSize[0] * resolution) / 25.4);
    const heightPixels = Math.round((initialSize[1] * resolution) / 25.4);

    // Set print size
    const printSize = [widthPixels, heightPixels];
    map.ol.setSize(printSize);
    const scaling = Math.min(
      widthPixels / mapSize[0],
      heightPixels / mapSize[1]
    );
    map.ol.getView().setResolution(viewResolution / scaling);

    return [widthPixels, heightPixels];
  }

  private resetOriginalMapSize(
    map: IgoMap,
    initialSize: [number, number],
    viewResolution: number
  ) {
    map.ol.setSize(initialSize);
    map.ol.getView().setResolution(viewResolution);
    map.ol.updateSize();
    map.ol.renderSync();
  }

  async drawMap(
    size: Array<number>,
    mapCanvas: HTMLCollectionOf<HTMLCanvasElement>
  ): Promise<HTMLCanvasElement> {
    const mapResultCanvas = document.createElement('canvas');
    mapResultCanvas.width = size[0];
    mapResultCanvas.height = size[1];

    for (let index = 0; index < mapCanvas.length; index++) {
      const canvas = mapCanvas[index];
      if (canvas.width > 0) {
        this.handleCanvas(canvas, mapResultCanvas);
      }
    }
    return mapResultCanvas;
  }

  private handleCanvas(
    canvas: HTMLCanvasElement,
    mapResultCanvas: HTMLCanvasElement
  ) {
    const mapContextResult = mapResultCanvas.getContext('2d');
    const opacity = canvas.parentElement.style.opacity || canvas.style.opacity;
    mapContextResult.globalAlpha = opacity === '' ? 1 : Number(opacity);
    const transform = canvas.style.transform;
    let matrix: number[];
    if (transform) {
      // Get the transform parameters from the style's transform matrix
      matrix = transform
        .match(/^matrix\(([^\(]*)\)$/)[1]
        .split(',')
        .map(Number);
    } else {
      matrix = [
        parseFloat(canvas.style.width) / canvas.width,
        0,
        0,
        parseFloat(canvas.style.height) / canvas.height,
        0,
        0
      ];
    }
    CanvasRenderingContext2D.prototype.setTransform.apply(
      mapContextResult,
      matrix
    );
    const backgroundColor = canvas.parentElement.style.backgroundColor;
    if (backgroundColor) {
      mapContextResult.fillStyle = backgroundColor;
      mapContextResult.fillRect(0, 0, canvas.width, canvas.height);
    }
    mapContextResult.drawImage(canvas, 0, 0);
    mapContextResult.globalAlpha = 1;
    // reset canvas transform to initial
    mapContextResult.setTransform(1, 0, 0, 1, 0, 0);
  }

  async drawMapControls(
    map: IgoMap,
    canvas: HTMLCanvasElement,
    position: PrintLegendPosition
  ): Promise<void> {
    const context = canvas.getContext('2d');
    // Get the scale and attribution
    // we use cloneNode to modify the nodes to print without modifying it on the page, using deep:true to get children
    const mapOverlayHTML = map.ol
      .getOverlayContainerStopEvent()
      .cloneNode(true) as HTMLElement;
    // add North Direction to mapOverly
    await this.addNorthDirection(mapOverlayHTML, position);
    // add map Attribution designe to print
    await this.addAttribution(mapOverlayHTML);

    // set 'OverlayContainer' size to print size
    mapOverlayHTML.style.width = canvas.width + 'px';
    mapOverlayHTML.style.height = canvas.height + 'px';
    // we add zindex -1 to not show modification to the user
    mapOverlayHTML.style.zIndex = '-1';
    // and make sure html2canvas to render the image correctly
    document
      .getElementsByClassName('ol-viewport')[0]
      .appendChild(mapOverlayHTML);
    // Change the styles of hyperlink in the printed version
    // Transform the Overlay into a canvas
    // scale is necessary to make it in google chrome
    // background as null because otherwise it is white and cover the map
    // allowtaint is to allow rendering images in the attributions
    // useCORS: true pour permettre de renderer les images (ne marche pas en local)
    const canvasOverlayHTML = await html2canvas(mapOverlayHTML, {
      scale: 1,
      backgroundColor: null,
      allowTaint: true,
      useCORS: true
    });

    if (canvasOverlayHTML.width !== 0 && canvasOverlayHTML.height !== 0) {
      context.drawImage(canvasOverlayHTML, 0, 0);
    }

    // remove 'mapOverlayHTML' after generating canvas
    mapOverlayHTML.remove();
  }

  private async addNorthDirection(
    mapOverlayHTML: HTMLElement,
    position: PrintLegendPosition
  ): Promise<void> {
    const northDirection = document
      .getElementsByTagName('igo-rotation-button')[0]
      .cloneNode(true) as HTMLElement;
    const HTMLButton = northDirection.getElementsByTagName(
      'button'
    )[0] as HTMLElement;
    if (!HTMLButton) {
      return null;
    }
    // in case legend position is topright
    // we change rotate btn to topleft
    if (position === 'topright') {
      northDirection.style.width = 'inherit';
      northDirection.style.left = '10px';
    }
    HTMLButton.parentElement.style.background = 'transparent';
    HTMLButton.style.color = '#000';
    mapOverlayHTML.appendChild(northDirection);
  }

  private async addAttribution(mapOverlayHTML: HTMLElement): Promise<void> {
    const HTMLattribution =
      mapOverlayHTML.getElementsByClassName('ol-attribution')[0];
    const HTMLButton = HTMLattribution.getElementsByTagName('button')[0];
    if (!HTMLButton) {
      return null;
    }
    HTMLButton.setAttribute('data-html2canvas-ignore', 'true');
    const olCollapsed: boolean =
      HTMLattribution.classList.contains('ol-collapsed');
    if (olCollapsed) {
      HTMLattribution.classList.remove('ol-collapsed');
    }
  }

  /**
   * Download an image of the map with addition of informations
   * @param  map - Map of the app
   * @param  format - Image format. default value to "png"
   * @param  projection - Indicate if projection need to be add. Default to false
   * @param  scale - Indicate if scale need to be add. Default to false
   * @param  legend - Indicate if the legend of layers need to be download. Default to false
   * @param  title - Title to add for the map - Default to blank
   * @param  subtitle - Subtitle to add for the map - Default to blank
   * @param  comment - Comment to add for the map - Default to blank
   * @param  doZipFile - Indicate if we do a zip with the file
   * @return Image file of the map with extension format given as parameter
   */
  downloadMapImage(
    map: IgoMap,
    printResolution: PrintResolution,
    format = 'png',
    projection = false,
    scale = false,
    title = '',
    subtitle = '',
    comment = '',
    doZipFile = true,
    legendPosition: PrintLegendPosition
  ) {
    const status$ = new Subject();
    this.activityId = this.activityService.register();
    const translate = this.languageService.translate;
    format = format.toLowerCase();
    const resolution = +printResolution;
    const initialMapSize = map.ol.getSize() as [number, number];
    const viewResolution = map.ol.getView().getResolution();

    map.ol.once('rendercomplete', async (event: any) => {
      const size = map.ol.getSize();
      const mapCanvas = event.target
        .getViewport()
        .getElementsByTagName('canvas') as HTMLCollectionOf<HTMLCanvasElement>;
      const mapResultCanvas = await this.drawMap(size, mapCanvas);

      this.resetOriginalMapSize(map, initialMapSize, viewResolution);

      await this.drawMapControls(map, mapResultCanvas, legendPosition);
      // Check the legendPosition
      if (legendPosition !== 'none') {
        if (
          ['topleft', 'topright', 'bottomleft', 'bottomright'].indexOf(
            legendPosition
          ) > -1
        ) {
          await this.addLegendToImage(
            mapResultCanvas,
            map,
            resolution,
            legendPosition,
            format
          );
        } else if (legendPosition === 'newpage') {
          await this.getLayersLegendImage(map, format, doZipFile, resolution);
        }
      }
      // add other information to final canvas before exporting
      const newCanvas = document.createElement('canvas');
      const newContext = newCanvas.getContext('2d');
      // Postion in height to set the canvas in new canvas
      let positionHCanvas = 0;
      // Get height/width of map canvas
      const width = mapResultCanvas.width;
      let height = mapResultCanvas.height;
      // Set Font to calculate comment width
      newContext.font = '20px Calibri';
      const commentWidth = newContext.measureText(comment).width;
      // Add height for title if defined
      height = title !== '' ? height + 30 : height;
      // Add height for title if defined
      height = subtitle !== '' ? height + 30 : height;
      // Add height for projection or scale (same line) if defined
      height = projection !== false || scale !== false ? height + 30 : height;
      const positionHProjScale = height - 10;
      // Define number of line depending of the comment length
      const commentNbLine = Math.ceil(commentWidth / width);
      // Add height for multiline comment if defined
      height = comment !== '' ? height + commentNbLine * 30 : height;
      let positionHComment = height - commentNbLine * 20 + 5;
      // Set the new canvas with the new calculated size
      newCanvas.width = width;
      newCanvas.height = height;

      if (['bmp', 'gif', 'jpeg', 'png', 'tiff'].indexOf(format) > -1) {
        // Patch Jpeg default black background to white
        if (
          format === 'jpeg' ||
          title !== '' ||
          subtitle !== '' ||
          comment !== '' ||
          projection !== false ||
          scale !== false
        ) {
          newContext.fillStyle = '#ffffff';
          newContext.fillRect(0, 0, width, height);
          newContext.fillStyle = '#000000';
        }
      }
      // If a title need to be added to canvas
      if (title !== '') {
        // Set font for title
        // Adjust according to title length
        newContext.font = '26px Calibri';
        positionHCanvas = 30;
        newContext.textAlign = 'center';
        newContext.fillText(title, width / 2, 20, width * 0.9);
      }

      if (subtitle !== '') {
        // Set font for subtitle
        // Adjust according to title length
        newContext.font = '26px Calibri';
        positionHCanvas = 60;
        newContext.textAlign = 'center';
        newContext.fillText(subtitle, width / 2, 50, width * 0.9);
      }

      // Set font for next section
      newContext.font = '20px Calibri';
      // If projection or/end scale need to be added to canvas
      if (projection !== false || scale !== false) {
        let projectionScaleText = '';
        if (projection !== false) {
          const projText = translate.instant('igo.geo.printForm.projection');
          projectionScaleText = projText + ': ' + map.projection + '         ';
        }

        if (scale !== false) {
          const scaleText = translate.instant('igo.geo.printForm.scale');
          const mapScale = map.viewController.getScale(resolution);
          projectionScaleText += scaleText + ': ~ 1 / ' + formatScale(mapScale);
        }
        newContext.textAlign = 'center';
        newContext.fillText(
          projectionScaleText,
          width / 2,
          positionHProjScale,
          width * 0.9
        );
      }

      // If a comment need to be added to canvas
      if (comment !== '') {
        newContext.textAlign = 'center';
        // If only one line, no need to multiline the comment
        if (commentNbLine === 1) {
          newContext.fillText(comment, width / 2, positionHComment);
        } else {
          // Separate the setenses to be approx. the same length
          const nbCommentChar = comment.length;
          const CommentLengthToCut = Math.floor(nbCommentChar / commentNbLine);
          let commentCurrentLine = '';
          let positionFirstCutChar = 0;
          let positionLastBlank;
          // Loop for the number of line calculated
          for (let i = 0; i < commentNbLine; i++) {
            // For all line except last
            if (commentNbLine - 1 > i) {
              // Get comment current line to find the right place tu cut comment
              commentCurrentLine = comment.substr(
                positionFirstCutChar,
                CommentLengthToCut
              );
              // Cut the setence at blank
              positionLastBlank = commentCurrentLine.lastIndexOf(' ');
              newContext.fillText(
                commentCurrentLine.substr(0, positionLastBlank),
                width / 2,
                positionHComment
              );
              positionFirstCutChar += positionLastBlank;
              // Go to next line for insertion
              positionHComment += 20;
            } else {
              // Don't cut last part
              newContext.fillText(
                comment.substr(positionFirstCutChar),
                width / 2,
                positionHComment
              );
            }
          }
        }
      }

      newContext.drawImage(mapResultCanvas, 0, positionHCanvas);

      let status = SubjectStatus.Done;
      let fileNameWithExt = 'map.' + format;
      if (format.toLowerCase() === 'tiff') {
        fileNameWithExt =
          'map' + map.projection.replace(':', '_') + '.' + format;
      }

      try {
        // Save the canvas as file
        if (!doZipFile) {
          this.saveCanvasImageAsFile(newCanvas, fileNameWithExt, format);
        } else if (format.toLowerCase() === 'tiff') {
          // Add the canvas to zip
          this.generateCanvaFileToZip(newCanvas, fileNameWithExt);
        } else {
          // Add the canvas to zip
          this.generateCanvaFileToZip(newCanvas, fileNameWithExt);
        }
      } catch (err) {
        status = SubjectStatus.Error;
      }
      status$.next(status);

      if (format.toLowerCase() === 'tiff') {
        const tfwFileNameWithExt =
          fileNameWithExt.substring(
            0,
            fileNameWithExt.toLowerCase().indexOf('.tiff')
          ) + '.tfw';
        const tiwContent = this.getWorldFileInformation(map);
        const blob = new Blob([tiwContent], {
          type: 'text/plain;charset=utf-8'
        });
        if (!doZipFile) {
          // saveAs automaticly replace ':' for '_'
          saveAs(blob, tfwFileNameWithExt);
          this.saveFileProcessing();
        } else {
          // Add the canvas to zip
          this.addFileToZip(tfwFileNameWithExt, blob);
        }
      }
    });

    this.setMapImageResolution(map, initialMapSize, resolution, viewResolution);

    return status$;
  }

  private setMapImageResolution(
    map: IgoMap,
    initialMapSize: [number, number],
    resolution: number,
    viewResolution: number
  ): void {
    const scaleFactor = resolution / 96;
    const newMapSize = [
      Math.round(initialMapSize[0] * scaleFactor), // width
      Math.round(initialMapSize[1] * scaleFactor) // height
    ];
    map.ol.setSize(newMapSize);
    const scaling = Math.min(
      newMapSize[0] / initialMapSize[0],
      newMapSize[1] / initialMapSize[1]
    );
    const view = map.ol.getView();
    view.setResolution(viewResolution / scaling);
    map.ol.renderSync();
  }

  /**
   * Create and Add Legend to the map canvas
   * @param  canvas Canvas of the map
   * @param  map Map of the app
   * @param  resolution Resolution of map
   * @param  legendPosition Legend position
   * @param  format Image format
   */
  private async addLegendToImage(
    canvas: HTMLCanvasElement,
    map: IgoMap,
    resolution: number,
    legendPosition: string,
    format: string
  ) {
    const fileNameWithExt = 'map.' + format;
    const context = canvas.getContext('2d');

    // Get html code for the legend
    const html = await this.getLayersLegendHtml(
      map,
      canvas.width,
      resolution
    ).toPromise();
    // If no legend, save the map directly
    if (html === '') {
      await this.saveCanvasImageAsFile(canvas, fileNameWithExt, format);
      return true;
    }
    // Create div to contain html code for legend
    const div = window.document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.zIndex = '-1';
    // Add html code to convert in the new window
    window.document.body.appendChild(div);
    div.innerHTML = html;
    await this.timeout(1);
    const canvasLegend = await html2canvas(div, { useCORS: true }).catch(
      (e) => {
        console.log(e);
      }
    );

    if (canvasLegend) {
      const canvasHeight = canvas.height;
      const canvasWidth = canvas.width;
      const legendHeight = canvasLegend.height;
      const legendWidth = canvasLegend.width;
      // Move the legend to the correct position on the page
      const offset = canvasHeight * 0.01;
      let legendX: number;
      let legendY: number;

      if (legendPosition === 'bottomright') {
        legendX = canvasWidth - legendWidth - offset;
        legendY = canvasHeight - legendHeight - offset;
      } else if (legendPosition === 'topright') {
        legendX = canvasWidth - legendWidth - offset;
        legendY = offset;
      } else if (legendPosition === 'bottomleft') {
        legendX = offset;
        legendY = canvasHeight - legendHeight - offset - 15;
      } else if (legendPosition === 'topleft') {
        legendX = offset;
        legendY = offset;
      }

      context.drawImage(
        canvasLegend,
        legendX,
        legendY,
        legendWidth,
        legendHeight
      );
      context.strokeRect(legendX, legendY, legendWidth, legendHeight);
      this.removeHtmlElement(div);
      return true;
    }
  }

  private renderMap(map, size, extent) {
    map.ol.updateSize();
    map.ol.renderSync();
  }

  /**
   * Save document
   * @param  doc - Document to save
   */
  protected async saveDoc(doc: jsPDF) {
    await doc.save('map_georef.pdf', { returnPromise: true });
  }

  /**
   * Calculate the best Image size to fit in pdf
   * @param doc - Pdf Document
   * @param canvas - Canvas of image
   * @param margins - Page margins
   */
  getImageSizeToFitPdf(doc, canvas, margins) {
    // Define variable to calculate best size to fit in one page
    const pageHeight =
      doc.internal.pageSize.getHeight() - (margins[0] + margins[2]);
    const pageWidth =
      doc.internal.pageSize.getWidth() - (margins[1] + margins[3]);
    const canHeight = this.pdf_units2points(canvas.height, 'mm');
    const canWidth = this.pdf_units2points(canvas.width, 'mm');

    const heightRatio = canHeight / pageHeight;
    const widthRatio = canWidth / pageWidth;
    const maxRatio = heightRatio > widthRatio ? heightRatio : widthRatio;
    const imgHeigh = maxRatio > 1 ? canHeight / maxRatio : canHeight;
    const imgWidth = maxRatio > 1 ? canWidth / maxRatio : canWidth;
    return [imgWidth, imgHeigh];
  }

  /**
   * Get a world file information for tiff
   * @param  map - Map of the app
   */
  private getWorldFileInformation(map) {
    const currentResolution = map.viewController.getResolution();
    const currentExtent = map.viewController.getExtent(); // Return [minx, miny, maxx, maxy]
    return [
      currentResolution,
      0,
      0,
      -currentResolution,
      currentExtent[0] + currentResolution / 0.5,
      currentExtent[3] - currentResolution / 0.5
    ].join('\n');
  }

  /**
   * Save canvas image as file
   * @param canvas - Canvas to save
   * @param name - Name of the file
   * @param format - file format
   */
  private saveCanvasImageAsFile(canvas, nameWithExt, format) {
    const blobFormat = 'image/' + format;
    const that = this;

    try {
      canvas.toDataURL(); // Just to make the catch trigger wihtout toBlob Error throw not catched
      canvas.toBlob((blob) => {
        // download image
        saveAs(blob, nameWithExt);
        that.saveFileProcessing();
      }, blobFormat);
    } catch (err) {
      this.messageService.error(
        'igo.geo.printForm.corsErrorMessageBody',
        'igo.geo.printForm.corsErrorMessageHeader'
      );
    }
  }

  /**
   * Add file to a zip
   * @param canvas - File to add to the zip
   * @param  name -Name of the fileoverview
   */
  private generateCanvaFileToZip(canvas, name) {
    const blobFormat = 'image/' + 'jpeg';
    const that = this;
    if (
      !this.hasOwnProperty('zipFile') ||
      typeof this.zipFile === 'undefined'
    ) {
      this.zipFile = new JSZip();
    }

    try {
      canvas.toDataURL(); // Just to make the catch trigger wihtout toBlob Error throw not catched
      if (navigator.msSaveBlob) {
        this.addFileToZip(name, canvas.msToBlob());
      } else {
        canvas.toBlob((blob) => {
          that.addFileToZip(name, blob);
        }, blobFormat);
      }
    } catch (err) {
      this.messageService.error(
        'igo.geo.printForm.corsErrorMessageBody',
        'igo.geo.printForm.corsErrorMessageHeader'
      );
    }
  }

  /**
   * Add file to zip, if all file are zipped, download
   * @param name - Name of the files
   * @param blob - Contain of file
   */
  private addFileToZip(name, blob) {
    // add file to zip
    this.zipFile.file(name, blob);
    this.nbFileToProcess--;

    // If all files are proccessed
    if (this.nbFileToProcess === 0) {
      // Download zip file
      this.getZipFile();
      // Stop loading
      this.activityService.unregister(this.activityId);
    }
  }

  private saveFileProcessing() {
    this.nbFileToProcess--;

    // If all files are proccessed
    if (this.nbFileToProcess === 0) {
      // Stop loading
      this.activityService.unregister(this.activityId);
    }
  }

  /**
   * Get the zipped file
   * @return Retun a zip file
   */
  private getZipFile() {
    const that = this;
    this.zipFile.generateAsync({ type: 'blob' }).then((blob) => {
      // 1) generate the zip file
      saveAs(blob, 'map.zip');
      delete that.zipFile;
    });
  }

  private pdf_units2points(n, unit): number {
    let k = 1;

    // this code is borrowed from jsPDF
    //  as it does not expose a public API
    //  for converting units to points.
    switch (unit) {
      case 'pt':
        k = 1;
        break;
      case 'mm':
        k = 72 / 25.4;
        break;
      case 'cm':
        k = 72 / 2.54;
        break;
      case 'in':
        k = 72;
        break;
      case 'px':
        k = 96 / 72;
        break;
      case 'pc':
        k = 12;
        break;
      case 'em':
        k = 12;
        break;
      case 'ex':
        k = 6;
        break;
      default:
        throw new Error('Invalid unit: ' + unit);
    }

    return n * k;
  }
}
