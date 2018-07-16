import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { IgoMap } from '../../map';
import { SubjectStatus } from '../../utils';
import { MessageService, ActivityService, LanguageService } from '../../core';

import { PrintOptions } from './print.interface';
import { PrintDimension, PrintOrientation} from './print.type';

import { saveAs } from 'file-saver';

declare var jsPDF: any;

@Injectable()
export class PrintService {

  constructor(private messageService: MessageService,
              private activityService: ActivityService, private languageService: LanguageService) {}

  print(map: IgoMap, options: PrintOptions): Subject<any> {
    const status$ = new Subject();

    const format = options.format;
    const resolution = +options.resolution;
    const orientation = options.orientation;
    //const imageFormat = options.imageFormat;
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

    if(options.showProjection === true || options.showScale === true) {
      this.addProjScale(doc, map, resolution, size, options.showProjection, options.showScale)
    }

    if(options.comment !== "") {
      this.addComment(doc, options.comment, size);
    }

    this.addMap(doc, map, resolution, size, margins)
      .subscribe((status: SubjectStatus) => {
        if (status === SubjectStatus.Done) {
          if(options.showLegend === true) {
            //this.addLegend(doc, map); TODO!
            map.addLegend(doc);
            //map.getAllLayersLegendImage();
          }
          else {
            doc.save('map.pdf');
          }
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

  /**
  Add comment to the document
  @param {jsPDF} doc - pdf document
  @param {string} comment - Comment to add in the document
  @param {array} size - Size of the document
  */
  private addComment(doc: typeof jsPDF, comment: string, size: Array<number>) {
    const commentSize = 16;
    const commentMarginLeft = 20;

    const heightPixels = size[1] + 35;

    doc.setFont('courier');
    doc.setFontSize(commentSize);
    doc.text(commentMarginLeft, heightPixels, comment);
  }

  /**
  Add projection and/or scale to the document
  @param {jsPDF} doc - pdf document
  @param {IgoMap} map - Map of the app
  @param {number} resolution - DPI resolution of the document
  @param {array} size - Size of the document
  @param {boolean} projection - Bool to indicate if projection need to be added
  @param {boolean} scale - Bool to indicate if scale need to be added
  */
  private addProjScale(doc: typeof jsPDF, map: IgoMap, resolution: number, size: Array<number>, projection: boolean, scale: boolean) {
    const translate = this.languageService.translate;
    const projScaleSize = 16;

    let textProjScale;
    let projScaleMarginLeft = 20;

    const heightPixels = size[1] + 25;

    if(projection === true) {
    const projText = translate.instant('igo.printForm.projection');
     textProjScale = projText + ": " + map.getProjection();
    }

    if(scale === true) {
      if(projection === true) {
        textProjScale+= "   ";
      }
      const scaleText = translate.instant('igo.printForm.scale');
      textProjScale+= scaleText + " ~ 1 " + map.getMapScale(true, resolution);
    }

    doc.setFont('courier');
    doc.setFontSize(projScaleSize);
    doc.text(projScaleMarginLeft, heightPixels, textProjScale);
  }
/*
  private addLegend(doc: typeof jsPDF, map: IgoMap) {
    //TODO use map.ts/addLegend function
    For now, the code of this function doesn't work here
  }*/

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

  /**
  Download an image of the map with addition of informations
  @param {IgoMap} map - Map of the app
  @param {string} format - Image format. default value to "png"
  @param {boolean} projection - Bool to indicate if projection need to be shown for the map. Default to false
  @param {boolean} scale - Bool to indicate if scale need to be shown for the map. Default to false
  @param {boolean} legend - Bool to indicate if the legend of layers need to be download. Default to false TODO include?
  @param {string} title - Title to add for the map - Default to blank
  @param {string} comment - Comment to add for the map - Default to blank
  @param {string} resolution - Resolution detail of the map - Default to 96 ppi
  @return {file} Image file of the map with extension format given as parameter
  */
  downloadMapImage(map: IgoMap, format = "png", projection = false, scale = false, legend = false, title = "", comment = "", resolution=96) {
    const translate = this.languageService.translate;
    map.ol.once('postcompose', (event: any) => {

      format = format.toLowerCase();
      let context = event.context;
      let newCanvas = document.createElement('canvas');
      let newContext = newCanvas.getContext('2d');
      //Postion in height to set the canvas in new canvas
      let positionHCanvas = 0;
      //Position in width to set the Proj/Scale in new canvas
      let positionWProjScale = 10;
      //Get height/width of map canvas
      let width = context.canvas.width;
      let height = context.canvas.height;

      //Set Font to calculate comment width
      newContext.font = "20px Calibri";
      let commentWidth = newContext.measureText(comment).width;

      //Add height for title if defined
      height = (title !== "") ? height + 30 : height;
      //Add height for projection or scale (same line) if defined
      height = (projection !== false || scale !== false) ? height + 30 : height;
      let positionHProjScale = height - 10;

      //Define number of line depending of the comment length
      let commentNbLine = Math.ceil(commentWidth / width);
      //Add height for multiline comment if defined
      height = (comment !== "") ? height + (commentNbLine * 20) : height;
      let positionHComment = height - (commentNbLine * 20) + 5;

      //Set the new canvas with the new calculated size
      newCanvas.width = width;
      newCanvas.height = height;

      //Patch Jpeg default black background to white
      if(format === "jpeg") {
        newContext.fillStyle = "#ffffff";
        newContext.fillRect(0,0, width,height);
        newContext.fillStyle = "#000000";
      }

      //If a title need to be added to canvas
      if (title !== "") {
        //Set font for title
        newContext.font = "26px Calibri";
        positionHCanvas = 30;
        newContext.textAlign = "center";
        newContext.fillText(title, width / 2, 20);
      }

      //Set font for next section
      newContext.font = "20px Calibri";

      //If projection need to be added to canvas
      if (projection !== false) {
        const projText = translate.instant('igo.printForm.projection');
        newContext.textAlign = "start";
        newContext.fillText(projText + ": " + map.getProjection(), positionWProjScale, positionHProjScale);
        positionWProjScale += 200; //Width position change for scale position
      }

      //If scale need to be added to canvas
      if (scale !== false) {
        const scaleText = translate.instant('igo.printForm.scale');
        newContext.textAlign = "start";
        newContext.fillText(scaleText + " ~ 1 : " + map.getMapScale(true, resolution), positionWProjScale, positionHProjScale);
      }

      //If a comment need to be added to canvas
      if (comment !== "") {
        newContext.textAlign = "center";
        //If only one line, no need to multiline the comment
        if (commentNbLine == 1) {
          newContext.fillText(comment, width / 2, positionHComment);
        }
        else {
          //Separate the setenses to be approx. the same length
          let nbCommentChar = comment.length;
          let CommentLengthToCut = Math.floor(nbCommentChar / commentNbLine);
          let commentCurrentLine = "";
          let positionFirstCutChar = 0;
          let positionLastBlank;
          //Loop for the number of line calculated
          for (let i = 0; i < commentNbLine; i++) {
            //For all line except last
            if (commentNbLine - 1 > i) {
              //Get comment current line to find the right place tu cut comment
              commentCurrentLine = comment.substr(positionFirstCutChar, CommentLengthToCut);
              //Cut the setence at blank
              positionLastBlank = commentCurrentLine.lastIndexOf(" ");
              newContext.fillText(commentCurrentLine.substr(0, positionLastBlank), width / 2, positionHComment);
              positionFirstCutChar += positionLastBlank;

              //Go to next line for insertion
              positionHComment += 20;
            }
            else { //Don't cut last part
              newContext.fillText(comment.substr(positionFirstCutChar), width / 2, positionHComment);
            }
          }
        }
      }

      //Add map to new canvas
      newContext.drawImage(context.canvas, 0, positionHCanvas);
      //Define output format
      let blobFormat = "image/" + format;

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
    map.ol.setSize(size);
    map.ol.getView().fit(extent);
    map.ol.renderSync();
  }

}
