import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

import { ActivityService } from '@igo2/core/activity';
import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';
import { SubjectStatus } from '@igo2/utils';

import { Position } from 'geojson';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { UserOptions, autoTable } from 'jspdf-autotable';
import moment from 'moment';
import { Observable, Subject } from 'rxjs';

import { IgoMap } from '../../map/shared/map';
import { PrintService } from '../../print/shared/print.service';
import { DirectionsSource } from '../directions-sources/directions-source';
import { DirectionOptions, Directions } from '../shared/directions.interface';
import { DirectionsSourceService } from './directions-source.service';
import { FormattedStep, IgoStep } from './directions.interface';
import { formatDistance, formatDuration, formatStep } from './directions.utils';

@Injectable()
export class DirectionsService {
  constructor(
    private directionsSourceService: DirectionsSourceService,
    private configService: ConfigService,
    private languageService: LanguageService,
    private printService: PrintService,
    @Inject(DOCUMENT) private document: Document,
    private activityService: ActivityService
  ) {}

  /**
   * Routes the given coordinates using the specified directions source and options.
   *
   * @param {DirectionsSource} source - The directions source to use for routing.
   * @param {Position[]} coordinates - The array of coordinates to route.
   * @param {DirectionOptions} [directionsOptions={}] - The optional direction options.
   * @return {Observable<Directions[]>} An observable that emits an array of directions.
   */
  route(
    coordinates: Position[],
    directionsOptions: DirectionOptions = {}
  ): Observable<Directions[]> {
    if (coordinates.length === 0) {
      return;
    }
    const source: DirectionsSource = this.directionsSourceService.sources[0];
    const request = source.route(coordinates, directionsOptions);
    return request;
  }

  /**
   * Downloads directions for a given map and directions object.
   *
   * @param {IgoMap} map - The map object to download directions for.
   * @param {Directions} directions - The directions object containing the route information.
   * @return {Observable<SubjectStatus>} An observable that emits the status of the download process.
   */
  downloadDirections(
    map: IgoMap,
    directions: Directions
  ): Observable<SubjectStatus> {
    const activityId: string = this.activityService.register();
    const status$: Subject<SubjectStatus> = new Subject<SubjectStatus>();

    const doc: jsPDF = new jsPDF({
      orientation: 'p',
      format: 'letter',
      unit: 'mm' // default
    });

    const pageSize = doc.internal.pageSize;

    const margins: [number, number, number, number] = [30, 10, 20, 10];

    const zoneWidth: number = pageSize.getWidth() - margins[3] - margins[1];
    const zoneHeight: number = pageSize.getHeight() - margins[0] - margins[2];
    const imageDimensions: [number, number] = [zoneWidth, zoneHeight];

    const distance: string = formatDistance(directions.distance);
    const duration: string = formatDuration(directions.duration);

    const title: string =
      distance && duration
        ? `${directions.title} (${distance} - ${duration})`
        : directions.title;

    doc.text(title, pageSize.getWidth() / 2, 25, {
      align: 'center'
    });

    const resolution = 96; // Default is 96
    this.printService
      .addMap(doc, map, resolution, imageDimensions, margins)
      .subscribe(async (status: SubjectStatus) => {
        if (status === SubjectStatus.Done) {
          await this.addInstructions(doc, directions, title);
          this.setPageHeaderFooter(doc);
          await doc.save(`${title}.pdf`, { returnPromise: true });
        }

        this.activityService.unregister(activityId);
        status$.next(status);
      });

    return status$;
  }

  /**
   * Generates an HTML table element with directions steps.
   *
   * @param {Directions} directions - The directions object containing the steps.
   * @return {Promise<HTMLTableElement>} - A promise that resolves to the generated HTML table element.
   */
  private async setHTMLTableDirections(
    directions: Directions
  ): Promise<HTMLTableElement> {
    const steps = await this.directionsSteps(directions);
    const table: HTMLTableElement = document.createElement('table');
    const tblBody: HTMLTableSectionElement = document.createElement('tbody');

    for (const step of steps) {
      const row: HTMLTableRowElement = document.createElement('tr');

      // icon
      const cellIcon: HTMLTableCellElement = document.createElement('td');
      const iconElement: HTMLImageElement = document.createElement('img');
      iconElement.style.verticalAlign = 'middle';
      iconElement.src = step.icon;
      cellIcon.appendChild(iconElement);
      row.append(cellIcon);

      // instruction
      const cellText: HTMLTableCellElement = document.createElement('td');
      const spanInstructionElement: HTMLSpanElement =
        document.createElement('span');
      spanInstructionElement.style.verticalAlign = 'middle';
      spanInstructionElement.innerHTML = step.instruction;
      cellText.appendChild(spanInstructionElement);

      // distance/duration
      if (step.distanceDuration) {
        const spanDistanceElement: HTMLSpanElement =
          document.createElement('span');
        spanDistanceElement.style.verticalAlign = 'middle';
        spanDistanceElement.innerHTML = ' ' + step.distanceDuration;
        cellText.appendChild(spanDistanceElement);
      }

      row.append(cellText);
      tblBody.appendChild(row);
    }
    table.appendChild(tblBody);
    return table;
  }

  /**
   * Generates formatted steps for the given directions.
   *
   * @param {Directions} directions - The directions object containing the steps.
   * @return {Promise<{ instruction: string; icon: string; distanceDuration: string }[]>}
   * A promise that resolves to an array of formatted steps.
   */
  private async directionsSteps(
    directions: Directions
  ): Promise<
    { instruction: string; icon: string; distanceDuration: string }[]
  > {
    const matListElement: Element = this.document
      .getElementsByTagName('igo-directions-results')[0]
      .getElementsByTagName('mat-list')[0];
    const matListItemElements: HTMLCollectionOf<Element> =
      matListElement.getElementsByTagName('mat-list-item');
    // convert icons list to base64
    const icons: { name: string; icon: string }[] = [];
    for (const element of Array.from(matListItemElements)) {
      const iconElement: HTMLElement = element.getElementsByTagName(
        'mat-icon'
      )[0] as HTMLElement;
      const iconName: string = iconElement.innerText;
      const found: boolean = icons.some((icon) => icon.name === iconName);
      if (!found) {
        const iconCanvas: HTMLCanvasElement = await html2canvas(iconElement);
        icons.push({ name: iconName, icon: iconCanvas.toDataURL() });
      }
    }

    const formattedSteps: {
      instruction: string;
      icon: string;
      distanceDuration: string;
    }[] = [];
    for (let stepIndex = 0; stepIndex < directions.steps.length; stepIndex++) {
      const step: IgoStep = directions.steps[stepIndex];
      const formattedStep: FormattedStep = formatStep(
        step,
        this.languageService,
        stepIndex === directions.steps.length - 1
      );

      const formattedDistance: string = formatDistance(step.distance);
      const formattedDuration: string = formatDuration(step.duration);

      if (
        (formattedDistance && formattedDuration) ||
        stepIndex === directions.steps.length - 1
      ) {
        formattedSteps.push({
          instruction: `${formattedStep.instruction}`,
          icon: icons.find((icon) => icon.name === formattedStep.iconName).icon,
          distanceDuration:
            formattedDistance && formattedDuration
              ? `(${formattedDistance} - ${formattedDuration})`
              : ''
        });
      }
    }
    return formattedSteps;
  }

  /**
   * Adds instructions to the given jsPDF document.
   *
   * @param {jsPDF} doc - The jsPDF document to add instructions to.
   * @param {Directions} directions - The directions object containing the instructions.
   * @param {string} title - The title of the instructions.
   * @return {Promise<void>} A promise that resolves when the instructions are added to the document.
   */
  private async addInstructions(
    doc: jsPDF,
    directions: Directions,
    title: string
  ): Promise<void> {
    doc.addPage();
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 25, {
      align: 'center'
    });
    const HTMLtable: HTMLTableElement =
      await this.setHTMLTableDirections(directions);
    autoTable(doc, {
      html: HTMLtable,
      startY: 30,
      margin: { top: 20, bottom: 20 },
      columnStyles: {
        0: { cellWidth: 10 }
      },
      theme: 'plain',
      styles: {
        fontSize: 10
      },
      didDrawCell: function (data) {
        if (data.column.index === 0 && data.cell.section === 'body') {
          data.row.height = 10;
          const td: HTMLElement = data.cell.raw as HTMLElement;
          const img: HTMLImageElement = td.getElementsByTagName('img')[0];
          doc.addImage(img.src, data.cell.x, data.cell.y, 8, 8);
        }
      }
    } satisfies UserOptions);
  }

  /**
   * Sets the header and footer of each page in the given jsPDF document.
   *
   * @param {jsPDF} doc - The jsPDF document to modify.
   */
  private setPageHeaderFooter(doc: jsPDF): void {
    const pageCount: number = doc.getNumberOfPages();
    const dateTime: string = moment(Date.now()).format('YYYY-MM-DD HH:mm');

    const logo: string = this.configService.getConfig('directionsSources.logo')
      ? this.configService.getConfig('directionsSources.logo')
      : 'assets/logo.png';

    for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
      doc.setPage(pageIndex);
      doc.setFontSize(8);
      const pageSize = doc.internal.pageSize;
      doc.text(dateTime, 10, 10, { baseline: 'top' });
      doc.addImage(logo, 'PNG', pageSize.getWidth() - 20, 5, 10, 10);
      doc.text(dateTime, 10, pageSize.getHeight() - 10);
      doc.text(
        'Page ' + doc.getCurrentPageInfo().pageNumber + ' / ' + pageCount,
        pageSize.getWidth() - 20,
        pageSize.getHeight() - 10
      );
    }
  }
}
