import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { saveAs } from 'file-saver';
import * as jsPDF from 'jspdf';
import * as _html2canvas from 'html2canvas';
import * as JSZip from 'jszip';

import { SubjectStatus } from '@igo2/utils';
import { MessageService, ActivityService, LanguageService } from '@igo2/core';

import { IgoMap } from '../../map/shared/map';
import { formatScale } from '../../map/shared/map.utils';
import { OutputLayerLegend } from '../../layer/shared/layers/layer.interface';
import { getLayersLegends } from '../../layer/utils/outputLegend';

import { PrintOptions } from './print.interface';

const html2canvas = _html2canvas;

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  zipFile: JSZip;
  nbFileToProcess: number;
  activityId: string;
  constructor(
    private messageService: MessageService,
    private activityService: ActivityService,
    private languageService: LanguageService
  ) {}

  print(map: IgoMap, options: PrintOptions): Subject<any> {
    const status$ = new Subject();

    const paperFormat: string = options.paperFormat;
    const resolution = +options.resolution; // Default is 96
    const orientation = options.orientation;

    this.activityId = this.activityService.register();
    const doc = new jsPDF({
      orientation,
      format: paperFormat.toLowerCase()
    });

    const dimensions = [
      doc.internal.pageSize.width,
      doc.internal.pageSize.height
    ];

    const margins = [20, 10, 20, 10];
    const width = dimensions[0] - margins[3] - margins[1];
    const height = dimensions[1] - margins[0] - margins[2];
    const size = [width, height];

    if (options.title !== undefined) {
      this.addTitle(doc, options.title, dimensions[0]);
    }

    if (options.showProjection === true || options.showScale === true) {
      this.addProjScale(
        doc,
        map,
        resolution,
        options.showProjection,
        options.showScale
      );
    }
    if (options.comment !== '') {
      this.addComment(doc, options.comment);
    }

    this.addMap(doc, map, resolution, size, margins).subscribe(
      (status: SubjectStatus) => {
        if (status === SubjectStatus.Done) {
          if (options.showLegend === true) {
            this.addLegend(doc, map, margins, resolution);
          } else {
            this.saveDoc(doc);
          }
        }

        if (status === SubjectStatus.Done || status === SubjectStatus.Error) {
          this.activityService.unregister(this.activityId);
          status$.next(SubjectStatus.Done);
        }
      }
    );

    return status$;
  }

  /**
   * Get html code for all layers legend
   * @param  map IgoMap
   * @param  width The width that the legend need to be
   * @return Html code for the legend
   */
  getLayersLegendHtml(map: IgoMap, width: number, resolution: number): string {
    let html = '';
    const legends = getLayersLegends(
      map.layers,
      map.viewController.getScale(resolution)
    );
    if (legends.length === 0) {
      return html;
    }

    // Define important style to be sure that all container is convert
    // to image not just visible part
    html += '<style media="screen" type="text/css">';
    html += '.html2canvas-container { width: ' + width;
    html += 'mm !important; height: 2000px !important; }';
    html += '</style>';
    html += '<font size="2" face="Courier New" >';
    html += '<div style="display:inline-block;max-width:' + width + 'mm">';
    // For each legend, define an html table cell
    legends.forEach((legend: OutputLayerLegend) => {
      html +=
        '<table border=1 style="display:inline-block;vertical-align:top">';
      html += '<tr><th width="170px">' + legend.title + '</th>';
      html += '<td><img class="printImageLegend" src="' + legend.url + '">';
      html += '</td></tr></table>';
    });
    html += '</div>';

    return html;
  }

  /**
   * Get all the legend in a single image
   * * @param  format - Image format. default value to "png"
   * @return The image of the legend
   */
  getLayersLegendImage(
    map,
    format: string = 'png',
    doZipFile: boolean,
    resolution: number
  ) {
    const status$ = new Subject();
    // Get html code for the legend
    const width = 200; // milimeters unit, originally define for document pdf
    let html = this.getLayersLegendHtml(map, width, resolution);
    const that = this;
    format = format.toLowerCase();

    // If no legend show No LEGEND in an image
    if (html.length === 0) {
      html = '<font size="12" face="Courier New" >';
      html += '<div align="center"><b>NO LEGEND</b></div>';
    }
    // Create div to contain html code for legend
    const div = window.document.createElement('div');

    // Add html code to convert in the new window
    window.document.body.appendChild(div);
    div.innerHTML = html;
    // Define event to execute after all images are loaded to create the canvas
    setTimeout(() => {
      html2canvas(div, { useCORS: true })
        .then(canvas => {
          let status = SubjectStatus.Done;
          try {
            if (!doZipFile) {
              // Save the canvas as file
              that.saveCanvasImageAsFile(canvas, 'legendImage', format);
            } else {
              // Add the canvas to zip
              that.generateCanvaFileToZip(canvas, 'legendImage' + '.' + format);
            }
            div.parentNode.removeChild(div); // remove temp div (IE)
          } catch (err) {
            status = SubjectStatus.Error;
          }
          status$.next(status);
        })
        .catch(e => {
          console.log(e);
        });
    }, 500);
  }

  private addTitle(doc: jsPDF, title: string, pageWidth: number) {
    const pdfResolution = 96;
    const titleSize = 32;
    const titleWidth = ((titleSize * 25.4) / pdfResolution) * title.length;

    let titleMarginLeft;
    if (titleWidth > pageWidth) {
      titleMarginLeft = 0;
    } else {
      titleMarginLeft = (pageWidth - titleWidth) / 2;
    }

    doc.setFont('courier');
    doc.setFontSize(32);
    doc.text(title, titleMarginLeft, 15);
  }

  /**
   * Add comment to the document
   * * @param  doc - pdf document
   * * @param  comment - Comment to add in the document
   * * @param  size - Size of the document
   */
  private addComment(doc: jsPDF, comment: string) {
    const commentSize = 16;
    const commentMarginLeft = 20;
    const marginBottom = 5;
    const heightPixels = doc.internal.pageSize.height - marginBottom;

    doc.setFont('courier');
    doc.setFontSize(commentSize);
    doc.text(comment, commentMarginLeft, heightPixels);
  }
  /**
   * Add projection and/or scale to the document
   * @param  doc - pdf document
   * @param  map - Map of the app
   * @param  dpi - DPI resolution of the document
   * @param  projection - Bool to indicate if projection need to be added
   * @param  scale - Bool to indicate if scale need to be added
   */
  private addProjScale(
    doc: jsPDF,
    map: IgoMap,
    dpi: number,
    projection: boolean,
    scale: boolean
  ) {
    const translate = this.languageService.translate;
    const projScaleSize = 16;
    const projScaleMarginLeft = 20;
    const marginBottom = 15;
    const heightPixels = doc.internal.pageSize.height - marginBottom;

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
    doc.setFont('courier');
    doc.setFontSize(projScaleSize);
    doc.text(textProjScale, projScaleMarginLeft, heightPixels);
  }

  /**
   * Add the legend to the document
   * @param  doc - Pdf document where legend will be added
   * @param  map - Map of the app
   * @param  margins - Page margins
   */
  private addLegend(
    doc: jsPDF,
    map: IgoMap,
    margins: Array<number>,
    resolution: number
  ) {
    const that = this;
    // Get html code for the legend
    const width = doc.internal.pageSize.width;
    const html = this.getLayersLegendHtml(map, width, resolution);
    // If no legend, save the map directly
    if (html === '') {
      this.saveDoc(doc);
      return true;
    }

    // Create div to contain html code for legend
    const div = window.document.createElement('div');
    html2canvas(div, { useCORS: true })
      .then(canvas => {
        let imgData;
        const position = 10;

        imgData = canvas.toDataURL('image/png');
        doc.addPage();
        const imageSize = this.getImageSizeToFitPdf(doc, canvas, margins);
        doc.addImage(imgData, 'PNG', 10, position, imageSize[0], imageSize[1]);
        that.saveDoc(doc);
        div.parentNode.removeChild(div); // remove temp div (IE style)
      })
      .catch(e => {
        console.log(e);
      });

    // Add html code to convert in the new window
    window.document.body.appendChild(div);
    div.innerHTML = html;
  }

  private addCanvas(
    doc: jsPDF,
    canvas: HTMLCanvasElement,
    margins: Array<number>
  ) {
    let image;

    image = canvas.toDataURL('image/jpeg');

    if (image !== undefined) {
      const imageSize = this.getImageSizeToFitPdf(doc, canvas, margins);
      doc.addImage(
        image,
        'JPEG',
        margins[3],
        margins[0],
        imageSize[0],
        imageSize[1]
      );
      doc.rect(margins[3], margins[0], imageSize[0], imageSize[1]);
    }
  }

  // TODO fix printing with image resolution
  private addMap(
    doc: jsPDF,
    map: IgoMap,
    resolution: number,
    size: Array<number>,
    margins: Array<number>
  ) {
    const status$ = new Subject();

    const mapSize = map.ol.getSize();
    const extent = map.ol.getView().calculateExtent(mapSize);

    const widthPixels = Math.round((size[0] * resolution) / 25.4);
    const heightPixels = Math.round((size[1] * resolution) / 25.4);

    let timeout;

    map.ol.once('postcompose', (event: any) => {
      const canvas = event.context.canvas;
      const mapStatus$$ = map.status$.subscribe((mapStatus: SubjectStatus) => {
        clearTimeout(timeout);

        if (mapStatus !== SubjectStatus.Done) {
          return;
        }

        mapStatus$$.unsubscribe();

        let status = SubjectStatus.Done;
        try {
          this.addCanvas(doc, canvas, margins);
        } catch (err) {
          status = SubjectStatus.Error;
          this.messageService.error(
            this.languageService.translate.instant(
              'igo.geo.printForm.corsErrorMessageBody'
            ),
            this.languageService.translate.instant(
              'igo.geo.printForm.corsErrorMessageHeader'
            ),
            'print'
          );
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
          this.addCanvas(doc, canvas, margins);
        } catch (err) {
          status = SubjectStatus.Error;
          this.messageService.error(
            this.languageService.translate.instant(
              'igo.geo.printForm.corsErrorMessageBody'
            ),
            this.languageService.translate.instant(
              'igo.geo.printForm.corsErrorMessageHeader'
            ),
            'print'
          );
        }

        this.renderMap(map, mapSize, extent);
        status$.next(status);
      }, 200);
    });

    this.renderMap(map, [widthPixels, heightPixels], extent);

    return status$;
  }

  defineNbFileToProcess(nbFileToProcess) {
    this.nbFileToProcess = nbFileToProcess;
  }

  /**
   * Download an image of the map with addition of informations
   * @param  map - Map of the app
   * @param  format - Image format. default value to "png"
   * @param  projection - Indicate if projection need to be add. Default to false
   * @param  scale - Indicate if scale need to be add. Default to false
   * @param  legend - Indicate if the legend of layers need to be download. Default to false
   * @param  title - Title to add for the map - Default to blank
   * @param  comment - Comment to add for the map - Default to blank
   * @param  doZipFile - Indicate if we do a zip with the file
   * @return Image file of the map with extension format given as parameter
   */
  downloadMapImage(
    map: IgoMap,
    resolution: number,
    format = 'png',
    projection = false,
    scale = false,
    legend = false,
    title = '',
    comment = '',
    doZipFile = true
  ) {
    const status$ = new Subject();
    // const resolution = map.ol.getView().getResolution();
    this.activityId = this.activityService.register();
    const translate = this.languageService.translate;
    map.ol.once('postcompose', (event: any) => {
      format = format.toLowerCase();
      const context = event.context;
      const newCanvas = document.createElement('canvas');
      const newContext = newCanvas.getContext('2d');
      // Postion in height to set the canvas in new canvas
      let positionHCanvas = 0;
      // Position in width to set the Proj/Scale in new canvas
      let positionWProjScale = 10;
      // Get height/width of map canvas
      const width = context.canvas.width;
      let height = context.canvas.height;
      // Set Font to calculate comment width
      newContext.font = '20px Calibri';
      const commentWidth = newContext.measureText(comment).width;
      // Add height for title if defined
      height = title !== '' ? height + 30 : height;
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
      // Patch Jpeg default black background to white
      if (format === 'jpeg') {
        newContext.fillStyle = '#ffffff';
        newContext.fillRect(0, 0, width, height);
        newContext.fillStyle = '#000000';
      }
      // If a title need to be added to canvas
      if (title !== '') {
        // Set font for title
        newContext.font = '26px Calibri';
        positionHCanvas = 30;
        newContext.textAlign = 'center';
        newContext.fillText(title, width / 2, 20);
      }
      // Set font for next section
      newContext.font = '20px Calibri';
      // If projection need to be added to canvas
      if (projection !== false) {
        const projText = translate.instant('igo.geo.printForm.projection');
        newContext.textAlign = 'start';
        newContext.fillText(
          projText + ': ' + map.projection,
          positionWProjScale,
          positionHProjScale
        );
        positionWProjScale += 200; // Width position change for scale position
      }
      // If scale need to be added to canvas
      if (scale !== false) {
        const scaleText = translate.instant('igo.geo.printForm.scale');
        const mapScale = map.viewController.getScale(resolution);
        newContext.textAlign = 'start';
        newContext.fillText(
          scaleText + ': ~ 1 / ' + formatScale(mapScale),
          positionWProjScale,
          positionHProjScale
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
      // Add map to new canvas
      newContext.drawImage(context.canvas, 0, positionHCanvas);

      let status = SubjectStatus.Done;
      try {
        // Save the canvas as file
        if (!doZipFile) {
          this.saveCanvasImageAsFile(newCanvas, 'map', format);
        } else if (format.toLowerCase() === 'tiff') {
          // Add the canvas to zip
          this.generateCanvaFileToZip(
            newCanvas,
            'map' + map.projection.replace(':', '_') + '.' + format
          );
        } else {
          // Add the canvas to zip
          this.generateCanvaFileToZip(newCanvas, 'map' + '.' + format);
        }
      } catch (err) {
        status = SubjectStatus.Error;
      }

      status$.next(status);

      if (format.toLowerCase() === 'tiff') {
        const tiwContent = this.getWorldFileInformation(map);
        const blob = new Blob([tiwContent], {
          type: 'text/plain;charset=utf-8'
        });
        if (!doZipFile) {
          // saveAs automaticly replace ':' for '_'
          saveAs(blob, 'map' + map.projection + '.tfw');
          this.saveFileProcessing();
        } else {
          // Add the canvas to zip
          this.addFileToZip(
            'map' + map.projection.replace(':', '_') + '.tfw',
            blob
          );
        }
      }
    });
    map.ol.renderSync();
  }

  private renderMap(map, size, extent) {
    map.ol.renderSync();
  }

  /**
   * Save document
   * @param  doc - Document to save
   */
  protected saveDoc(doc: jsPDF) {
    doc.save('map.pdf');
  }

  /**
   * Calculate the best Image size to fit in pdf
   * @param doc - Pdf Document
   * @param canvas - Canvas of image
   * @param margins - Page margins
   */
  private getImageSizeToFitPdf(doc, canvas, margins) {
    // Define variable to calculate best size to fit in one page
    const pageHeight =
      doc.internal.pageSize.getHeight() - (margins[0] + margins[2]);
    const pageWidth =
      doc.internal.pageSize.getWidth() - (margins[1] + margins[3]);
    const canHeight = canvas.height;
    const canWidth = canvas.width;
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
  private saveCanvasImageAsFile(canvas, name, format) {
    const blobFormat = 'image/' + format;
    const that = this;

    try {
      canvas.toDataURL(); // Just to make the catch trigger wihtout toBlob Error throw not catched
      // If navigator is Internet Explorer
      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(canvas.msToBlob(), name + '.' + format);
        this.saveFileProcessing();
      } else {
        canvas.toBlob(blob => {
          // download image
          saveAs(blob, name + '.' + format);
          that.saveFileProcessing();
        }, blobFormat);
      }
    } catch (err) {
      this.messageService.error(
        this.languageService.translate.instant(
          'igo.geo.printForm.corsErrorMessageBody'
        ),
        this.languageService.translate.instant(
          'igo.geo.printForm.corsErrorMessageHeader'
        ),
        'print'
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
        canvas.toBlob(blob => {
          that.addFileToZip(name, blob);
        }, blobFormat);
      }
    } catch (err) {
      this.messageService.error(
        this.languageService.translate.instant(
          'igo.geo.printForm.corsErrorMessageBody'
        ),
        this.languageService.translate.instant(
          'igo.geo.printForm.corsErrorMessageHeader'
        ),
        'print'
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
    this.zipFile.generateAsync({ type: 'blob' }).then(blob => {
      // 1) generate the zip file
      saveAs(blob, 'map.zip');
      delete that.zipFile;
    });
  }
}
