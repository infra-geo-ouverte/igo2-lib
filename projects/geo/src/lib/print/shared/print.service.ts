import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { saveAs } from 'file-saver';
import * as jsPDF from 'jspdf';
import * as _html2canvas from 'html2canvas';

import { SubjectStatus } from '@igo2/utils';
import { MessageService, ActivityService, LanguageService } from '@igo2/core';

import { IgoMap } from '../../map/shared/map';

import { PrintOptions } from './print.interface';
import { PrintDimension, PrintOrientation } from './print.type';

const html2canvas = _html2canvas;

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  constructor(
    private messageService: MessageService,
    private activityService: ActivityService,
    private languageService: LanguageService
  ) {}

  print(map: IgoMap, options: PrintOptions): Subject<any> {
    const status$ = new Subject();

    const format = options.format;
    const resolution = +options.resolution;
    const orientation = options.orientation;
    const dimensions =
      orientation === PrintOrientation.portrait
        ? PrintDimension[format]
        : PrintDimension[format].slice().reverse();

    const margins = [20, 10, 20, 10];
    const width = dimensions[0] - margins[3] - margins[1];
    const height = dimensions[1] - margins[0] - margins[2];
    const size = [width, height];

    const activityId = this.activityService.register();
    const doc = new jsPDF(options.orientation, undefined, format);

    if (options.title !== undefined) {
      this.addTitle(doc, options.title, dimensions[0]);
    }

    if (options.showProjection === true || options.showScale === true) {
      this.addProjScale(
        doc,
        map,
        resolution,
        size,
        options.showProjection,
        options.showScale
      );
    }
    if (options.comment !== '') {
      this.addComment(doc, options.comment, size);
    }

    this.addMap(doc, map, resolution, size, margins).subscribe(
      (status: SubjectStatus) => {
        if (status === SubjectStatus.Done) {
          if (options.showLegend === true) {
            this.addLegend(doc, map);
          } else {
            this.saveDoc(doc);
          }
        }

        if (status === SubjectStatus.Done || status === SubjectStatus.Error) {
          this.activityService.unregister(activityId);
          status$.next(SubjectStatus.Done);
        }
      }
    );

    return status$;
  }

  /**
  Get html code for all layers legend
  @param  width - The width that the legend need to be
  @return Html code for the legend
  */
  getLayersLegendHtml(map, width) {
    // Get html code for the legend
    const listLegend = map.getLayersLegend();
    let html = '';
    if (listLegend.length > 0) {
      // Define important style to be sure that all container is convert
      // to image not just visible part
      html += '<style media="screen" type="text/css">';
      html += '.html2canvas-container { width: ' + width;
      html += 'mm !important; height: 2000px !important; }';
      html += '</style>';
      html += '<font size="2" face="Courier New" >';
      html += '<div style="display:inline-block;max-width:' + width + 'mm">';
      // For each legend, define an html table cell
      listLegend.forEach(function(legend) {
        html +=
          '<table border=1 style="display:inline-block;vertical-align:top">';
        html += '<tr><th width="170px">' + legend.title + '</th>';
        html += '<td><img class="printImageLegend" src="' + legend.url + '">';
        html += '</td></tr></table>';
      });
      html += '</div>';
    }
    return html;
  }

  /**
  Get all the legend in a single image
  @param  format - Image format. default value to "png"
  @return The image of the legend
  */
  getLayersLegendImage(map, format = 'png') {
    // Get html code for the legend
    const width = 200; // milimeters unit, originally define for document pdf
    let html = this.getLayersLegendHtml(map, width);
    format = format.toLowerCase();
    const blobFormat = 'image/' + format;
    // If no legend show No LEGEND in an image
    if (html.length === 0) {
      html = '<font size="12" face="Courier New" >';
      html += '<div align="center"><b>NO LEGEND</b></div>';
    }
    // Create new temporary window to define html code to generate canvas image
    const winTempCanva = window.open('', 'legend', 'width=10, height=10');
    // Create div to contain html code for legend
    const div = winTempCanva.document.createElement('div');
    // Define event to execute after all images are loaded to create the canvas
    html2canvas(div, { useCORS: true }).then(canvas => {
      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(canvas.msToBlob(), 'legendImage.' + format);
      } else {
        canvas.toBlob(function(blob) {
          // download image
          saveAs(blob, 'legendImage.' + format);
        }, blobFormat);
      }
      winTempCanva.close(); // close temp window
    });
    // Add html code to convert in the new window
    winTempCanva.document.body.appendChild(div);
    div.innerHTML = html;
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
    doc.text(titleMarginLeft, 15, title);
  }

  /**
    Add comment to the document
    @param  doc - pdf document
    @param  comment - Comment to add in the document
    @param  size - Size of the document
    */
  private addComment(doc: jsPDF, comment: string, size: Array<number>) {
    const commentSize = 16;
    const commentMarginLeft = 20;
    const heightPixels = size[1] + 35;
    doc.setFont('courier');
    doc.setFontSize(commentSize);
    doc.text(commentMarginLeft, heightPixels, comment);
  }
  /**
    Add projection and/or scale to the document
    @param  doc - pdf document
    @param  map - Map of the app
    @param  resolution - DPI resolution of the document
    @param  size - Size of the document
    @param  projection - Bool to indicate if projection need to be added
    @param  scale - Bool to indicate if scale need to be added
    */
  private addProjScale(
    doc: jsPDF,
    map: IgoMap,
    resolution: number,
    size: Array<number>,
    projection: boolean,
    scale: boolean
  ) {
    const translate = this.languageService.translate;
    const projScaleSize = 16;
    let textProjScale;
    const projScaleMarginLeft = 20;
    const heightPixels = size[1] + 25;
    if (projection === true) {
      const projText = translate.instant('igo.geo.printForm.projection');
      textProjScale = projText + ': ' + map.projection;
    }
    if (scale === true) {
      if (projection === true) {
        textProjScale += '   ';
      }
      const scaleText = translate.instant('igo.geo.printForm.scale');
      textProjScale += scaleText + ' ~ 1 ' + map.getMapScale(true, resolution);
    }
    doc.setFont('courier');
    doc.setFontSize(projScaleSize);
    doc.text(projScaleMarginLeft, heightPixels, textProjScale);
  }

  /**
  Add the legend to the document
  @param  doc - Pdf document where legend will be added
  */
  private addLegend(doc: jsPDF, map: IgoMap) {
    const that = this;
    // Get html code for the legend
    const width = doc.internal.pageSize.width;
    const html = this.getLayersLegendHtml(map, width);
    // If no legend, save the map directly
    if (html === '') {
      this.saveDoc(doc);
      return true;
    }
    // Create new temporary window to define html code to generate canvas image
    const winTempCanva = window.open('', 'legend', 'width=10, height=10');
    // Create div to contain html code for legend
    const div = winTempCanva.document.createElement('div');
    html2canvas(div, { useCORS: true }).then(canvas => {
      let imgData;
      const position = 10;
      // Define variable to calculate best legend size to fit in one page
      const pageHeight = doc.internal.pageSize.height - 20; // -20 to let margin work great
      const pageWidth = doc.internal.pageSize.width - 20; // -20 to let margin work great
      const canHeight = canvas.height;
      const canWidth = canvas.width;
      const heightRatio = canHeight / pageHeight;
      const widthRatio = canWidth / pageWidth;
      const maxRatio = heightRatio > widthRatio ? heightRatio : widthRatio;
      const imgHeigh = maxRatio > 1 ? canHeight / maxRatio : canHeight;
      const imgWidth = maxRatio > 1 ? canWidth / maxRatio : canWidth;
      try {
        imgData = canvas.toDataURL('image/png');
        doc.addPage();
        doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeigh);
        winTempCanva.close(); // close temp window
      } catch (err) {
        winTempCanva.close(); // close temp window
        this.messageService.error(
          'Security error: The legend cannot be printed.',
          'Print',
          'print'
        );
        throw new Error(err);
      }
    });
    // Save canvas on window close
    winTempCanva.addEventListener('unload', function() {
      that.saveDoc(doc);
    });
    // Add html code to convert in the new window
    winTempCanva.document.body.appendChild(div);
    div.innerHTML = html;
  }

  private addCanvas(
    doc: jsPDF,
    canvas: HTMLCanvasElement,
    size: Array<number>,
    margins: Array<number>
  ) {
    let image;
    try {
      image = canvas.toDataURL('image/jpeg');
    } catch (err) {
      this.messageService.error(
        'Security error: This map cannot be printed.',
        'Print',
        'print'
      );

      throw new Error(err);
    }

    if (image !== undefined) {
      doc.addImage(image, 'JPEG', margins[3], margins[0], size[0], size[1]);
      doc.rect(margins[3], margins[0], size[0], size[1]);
    }
  }

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

  /**
  Download an image of the map with addition of informations
  @param  map - Map of the app
  @param  format - Image format. default value to "png"
  @param  projection - Indicate if projection need to be add. Default to false
  @param  scale - Indicate if scale need to be add. Default to false
  @param  legend - Indicate if the legend of layers need to be download. Default to false
  @param  title - Title to add for the map - Default to blank
  @param  comment - Comment to add for the map - Default to blank
  @param  resolution - Resolution detail of the map - Default to 96 ppi
  @return Image file of the map with extension format given as parameter
  */
  downloadMapImage(
    map: IgoMap,
    format = 'png',
    projection = false,
    scale = false,
    legend = false,
    title = '',
    comment = '',
    resolution = 96
  ) {
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
      height = comment !== '' ? height + commentNbLine * 20 : height;
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
        newContext.textAlign = 'start';
        newContext.fillText(
          scaleText + ' ~ 1 : ' + map.getMapScale(true, resolution),
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
      // Define output format
      const blobFormat = 'image/' + format;
      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(newCanvas.msToBlob(), 'map.' + format);
      } else {
        newCanvas.toBlob(function(blob) {
          saveAs(blob, 'map.' + format);
        }, blobFormat);
      }
    });
    map.ol.renderSync();
  }

  private renderMap(map, size, extent) {
    // setTimeout(() => {
    map.ol.setSize(size);
    map.ol.getView().fit(extent);
    map.ol.renderSync();
    // }, 1);
  }

  /**
  Save document
  @param  doc - Document to save
  */
  private saveDoc(doc: jsPDF) {
    doc.save('map.pdf');
  }
}
