import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

import { ActivityService } from '@igo2/core/activity';
import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';
import { SubjectStatus } from '@igo2/utils';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';
import moment from 'moment';
import { Observable, Subject } from 'rxjs';

import { IgoMap } from '../../map/shared/map';
import { PrintService } from '../../print/shared/print.service';
import { PrintLegendPosition } from '../../print/shared/print.type';
import { DirectionsSource } from '../directions-sources/directions-source';
import { Direction, DirectionOptions } from '../shared/directions.interface';
import { DirectionsSourceService } from './directions-source.service';
import {
  formatDistance,
  formatDuration,
  formatInstruction
} from './directions.utils';

@Injectable({
  providedIn: 'root'
})
export class DirectionsService {
  constructor(
    private directionsSourceService: DirectionsSourceService,
    private configService: ConfigService,
    private languageService: LanguageService,
    private printService: PrintService,
    @Inject(DOCUMENT) private document: Document,
    private activityService: ActivityService
  ) {}

  route(
    coordinates: [number, number][],
    directionsOptions: DirectionOptions = {}
  ): Observable<Direction[]>[] {
    if (coordinates.length === 0) {
      return;
    }
    return this.directionsSourceService.sources
      .filter((source: DirectionsSource) => source.enabled)
      .map((source: DirectionsSource) =>
        this.routeSource(source, coordinates, directionsOptions)
      );
  }

  routeSource(
    source: DirectionsSource,
    coordinates: [number, number][],
    directionsOptions: DirectionOptions = {}
  ): Observable<Direction[]> {
    const request = source.route(coordinates, directionsOptions);
    return request;
  }

  downloadDirection(
    map: IgoMap,
    direction: Direction
  ): Observable<SubjectStatus> {
    const activityId = this.activityService.register();
    const status$ = new Subject<SubjectStatus>();

    const doc: jsPDF = new jsPDF({
      orientation: 'p',
      format: 'Letter',
      unit: 'mm' // default
    });
    const dimensions = [
      doc.internal.pageSize.width,
      doc.internal.pageSize.height
    ];
    const margins = [10, 10, 10, 10];
    const width = dimensions[0];
    const height = dimensions[1] - margins[0] - margins[2];
    const size: [number, number] = [width, height];

    const title = `${direction.title} (${formatDistance(
      direction.distance
    )}, ${formatDuration(direction.duration)})`;
    const titlePosition = 25;

    doc.text(title, doc.internal.pageSize.width / 2, titlePosition, {
      align: 'center'
    });

    margins[0] += 20;
    const resolution = 96; // Default is 96
    this.printService
      .addMap(doc, map, resolution, size, margins, PrintLegendPosition.none)
      .subscribe(async (status: SubjectStatus) => {
        if (status === SubjectStatus.Done) {
          await this.addInstructions(doc, direction, title);
          this.setPageHeaderFooter(doc);
          await doc.save(`${title}.pdf`, { returnPromise: true });
        }

        this.activityService.unregister(activityId);
        status$.next(status);
      });

    return status$;
  }

  private async setHTMLTableContent(
    direction: Direction
  ): Promise<HTMLTableElement> {
    const data = await this.directionsInstruction(direction);
    const table = document.createElement('table');
    const tblBody = document.createElement('tbody');
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      var row = document.createElement('tr');
      var cellImage = document.createElement('td');
      var cellText = document.createElement('td');
      // icon
      const img = document.createElement('img') as HTMLImageElement;
      img.src = element.icon;
      // instruction text
      const span = document.createElement('span') as HTMLElement;
      span.innerHTML = element.instruction;
      cellImage.appendChild(img);
      cellText.appendChild(span);
      if (element.distance) {
        const spanDistance = document.createElement('span') as HTMLElement;
        spanDistance.style.verticalAlign = 'middle';
        spanDistance.innerHTML =
          '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + element.distance;
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
  ): Promise<Array<{ instruction: string; icon: string; distance: string }>> {
    const matListItems = this.document
      .getElementsByTagName('igo-directions-results')[0]
      .getElementsByTagName('mat-list')[0];
    const matListItem = matListItems.getElementsByTagName('mat-list-item');
    // convert icon list to base64
    let iconsArray: Array<{ name: string; icon: string }> = [];
    for (let index = 0; index < matListItem.length; index++) {
      const element = matListItem[index];
      const icon = element.getElementsByTagName('mat-icon')[0] as HTMLElement;
      const iconName = icon.getAttribute('data-mat-icon-name') as string;
      const found = iconsArray.some((el) => el.name === iconName);
      if (!found) {
        const iconCanvas = await html2canvas(icon, { scale: 3 });
        iconsArray.push({ name: iconName, icon: iconCanvas.toDataURL() });
      }
    }

    let formattedDirection: Array<{
      instruction: string;
      icon: string;
      distance: string;
    }> = [];
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
        instruction: i + 1 + '. ' + instruction.instruction,
        icon: iconsArray.find((icon) => icon.name === instruction.image).icon,
        distance: distance ? '(' + distance + ')' : undefined
      });
    }
    return formattedDirection;
  }

  private async addInstructions(
    doc: jsPDF,
    direction: Direction,
    title: string
  ) {
    doc.addPage();
    const titlePosition = 25;
    doc.text(title, doc.internal.pageSize.width / 2, titlePosition, {
      align: 'center'
    });
    const HTMLtable = await this.setHTMLTableContent(direction);
    const tablePos = titlePosition + 5;
    (doc as any).autoTable({
      html: HTMLtable,
      startY: tablePos,
      margin: { top: 20, bottom: 20 },
      columnStyles: {
        0: { cellWidth: 10 }
      },
      theme: 'plain',
      styles: {
        fontSize: 12
      },
      didDrawCell: function (data) {
        if (data.column.index === 0 && data.cell.section === 'body') {
          data.row.height = 10;
          const td = data.cell.raw as HTMLElement;
          const img = td.getElementsByTagName('img')[0];
          doc.addImage(img.src, data.cell.x, data.cell.y, 8, 8);
        }
      }
    } satisfies UserOptions);
  }

  private setPageHeaderFooter(doc: jsPDF) {
    const pageCount = doc.getNumberOfPages();
    const date = moment(Date.now()).format('DD/MM/YYYY hh:mm').toString();

    const logoConfig = this.configService.getConfig('directionsSources.logo');
    const logo = logoConfig ? logoConfig : 'assets/logo.png';

    for (let index = 0; index < pageCount; index++) {
      doc.setPage(index);
      doc.setFontSize(8);
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height
        ? pageSize.height
        : pageSize.getHeight();
      const width = pageSize.width ? pageSize.width : pageSize.getWidth();
      doc.text(date, 10, 10, { baseline: 'top' });
      doc.addImage(logo, 'PNG', width - 20, 5, 10, 10);
      doc.text(date, 10, pageHeight - 10);
      doc.text(
        'Page ' + doc.getCurrentPageInfo().pageNumber + ' / ' + pageCount,
        width - 20,
        pageHeight - 10
      );
    }
  }
}
