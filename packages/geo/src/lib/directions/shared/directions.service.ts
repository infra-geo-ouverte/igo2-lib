import { Injectable, Inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Direction, DirectionOptions } from '../shared/directions.interface';
import { DirectionsSource } from '../directions-sources/directions-source';
import { DirectionsSourceService } from './directions-source.service';
import { SubjectStatus } from '@igo2/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CellHookData } from 'jspdf-autotable';
import { IgoMap } from '../../map';
import { PrintLegendPosition, PrintService } from '../../print';
import { formatDistance, formatDuration, formatInstruction } from './directions.utils';
import moment from 'moment';
import { ConfigService, LanguageService } from '@igo2/core';
import html2canvas from 'html2canvas';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DirectionsService {
  constructor(private directionsSourceService: DirectionsSourceService,
    private configService: ConfigService,
    private languageService: LanguageService,
    private printService: PrintService,
    @Inject(DOCUMENT) private document: Document) {}

  route(coordinates: [number, number][], directionsOptions: DirectionOptions = {}): Observable<Direction[]>[] {
    if (coordinates.length === 0) {
      return;
    }
    return this.directionsSourceService.sources
      .filter((source: DirectionsSource) => source.enabled)
      .map((source: DirectionsSource) => this.routeSource(source, coordinates, directionsOptions));
  }

  routeSource(
    source: DirectionsSource,
    coordinates: [number, number][],
    directionsOptions: DirectionOptions = {}
  ): Observable<Direction[]> {
    const request = source.route(coordinates, directionsOptions );
    return request;
  }

  downloadDirection(
    map: IgoMap,
    direction: Direction
  ): Observable<SubjectStatus> {

    const status$ = new Subject<SubjectStatus>();

    const doc = new jsPDF({
      orientation: 'p',
      format: 'Letter',
      unit: 'mm' // default
    });

    const size = map.ol.getSize();
    map.ol.once('rendercomplete', async (event: any) => {
      const mapCanvas = event.target.getViewport().getElementsByTagName('canvas') as HTMLCollectionOf<HTMLCanvasElement>;
      const mapResultCanvas = await this.printService.drawMap(size, mapCanvas);
      map.ol.updateSize();
      map.ol.renderSync();
      await this.printService.drawMapControls(map, mapResultCanvas, PrintLegendPosition.none);

      const imgSize = this.printService.getImageSizeToFitPdf(doc, mapResultCanvas, [10, 10, 10, 10]);

      doc.addImage(mapResultCanvas, 10, 20, imgSize[0], imgSize[1]);
      doc.rect(10, 20, imgSize[0], imgSize[1]);
      doc.setFontSize(14);

      const title = `${direction.title} (${formatDistance(direction.distance)}, ${formatDuration(direction.duration)})`;
      const titlePosition = (imgSize[1] + 10 + 20);
      doc.text(title, (doc.internal.pageSize.width/2), titlePosition, {align: 'center'});

      const HTMLtable = await this.setHTMLTableContent(direction);
      const tablePos = titlePosition + 5;
      const totalPagesExp = '{total_pages_count_string}';
      const date = moment(Date.now()).format("DD/MM/YYYY hh:mm").toString();
      // TODO customize App logo
      const appName = (this.configService.getConfig('title')) ?
      this.configService.getConfig('title') : 'IGO Lib';

      autoTable(doc, {
        html: HTMLtable,
        startY: tablePos,
        margin: {top: 20, bottom: 20},
        columnStyles: {
          0: {cellWidth: 10},
        },
        theme:'plain',
        styles: {
          fontSize: 12
        },
        didDrawCell: function(data) {
          if (data.column.index === 0 && data.cell.section === 'body') {
            data.row.height = 10;
            var td = data.cell.raw as HTMLElement;
            var img = td.getElementsByTagName('img')[0];
            doc.addImage(img.src, data.cell.x, data.cell.y, 8, 8);
          }
        },
        didDrawPage: (data: CellHookData) => {
          this.setPageHeaderFooter(doc, data, [date, totalPagesExp, appName]);
        }
      });

      if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
      }

      await doc.save('map_georef.pdf', { returnPromise: true });

      status$.next(SubjectStatus.Done);
    });

    return status$;
  }

  private async setHTMLTableContent (
    direction: Direction
  ): Promise<HTMLTableElement> {
    const data = await this.directionsInstruction(direction);
    const table = document.createElement("table");
    const tblBody = document.createElement("tbody");
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      var row = document.createElement("tr");
      var cellImage = document.createElement("td");
      var cellText = document.createElement("td");
      // icon
      const img = document.createElement("img") as HTMLImageElement;
      img.src = element.icon;
      // instruction text
      const span = document.createElement("span") as HTMLElement;
      span.innerHTML = element.instruction;
      cellImage.appendChild(img);
      cellText.appendChild(span);
      if(element.distance) {
        const spanDistance = document.createElement("span") as HTMLElement;
        spanDistance.style.verticalAlign = 'middle';
        spanDistance.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + element.distance;
        cellText.appendChild(spanDistance);
      }
      row.append(cellImage);
      row.append(cellText);
      tblBody.appendChild(row);
    }
    table.appendChild(tblBody);
    return table;
  }

  private async directionsInstruction(
    direction: Direction
  ): Promise<Array<{ instruction: string, icon: string, distance: string }>> {

    const matListItems = this.document.getElementsByTagName('igo-directions-results')[0].getElementsByTagName('mat-list')[0];
    const matListItem = matListItems.getElementsByTagName('mat-list-item');
    // convert icon list to base64
    let iconsArray: Array<{name: string, icon: string}> = [];
    for (let index = 0; index < matListItem.length; index++) {
      const element = matListItem[index];
      const icon = element.getElementsByTagName('mat-icon')[0] as HTMLElement;
      const iconName = icon.getAttribute('data-mat-icon-name') as string;
      const found = iconsArray.some(el => el.name === iconName);
      if(!found) {
        const iconCanvas = await html2canvas(icon, { scale: 3});
        iconsArray.push({name: iconName, icon: iconCanvas.toDataURL()});
      }
    }

    let formattedDirection: Array<{ instruction: string, icon: string, distance: string }> = [];
    for (let i = 0; i < direction.steps.length; i++) {
      const step = direction.steps[i];
      const instruction = formatInstruction(
        step.maneuver.type,
        step.maneuver.modifier,
        step.name,
        step.maneuver.bearing_after,
        i,
        (step.maneuver as any).exit,
        this.languageService,
        i === direction.steps.length - 1
      );

      const distance = formatDistance(step.distance);
      formattedDirection.push({
        instruction: (i+1)+'. '+instruction.instruction,
        icon: iconsArray.find((icon) => icon.name === instruction.image).icon,
        distance:  (distance) ? '('+ distance +')' : undefined
      });
    }
    return formattedDirection;
  }

  /**
   * @param doc - PDF
   * @param data - CellHookData
   * @param text - [date: string, totalPageExp: string]
   */
  private setPageHeaderFooter(
    doc: jsPDF,
    data: CellHookData,
    text: [date: string, totalPageExp: string, appName: string]
  ): void {
    let str = 'Page ' + doc.getNumberOfPages();
    if (typeof doc.putTotalPages === 'function') {
      str = str + ' / ' + text[1];
    }
    doc.setFontSize(8);
    const pageSize = doc.internal.pageSize;
    const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
    const width = pageSize.width ? pageSize.width : pageSize.getWidth();
    doc.text(text[0], 10, 10, { baseline: 'top' });
    doc.text(text[2], width - 20, 10);
    doc.text(str, width - 20, pageHeight - 10);
    doc.text(text[0], data.settings.margin.left, pageHeight - 10);
  }
}
