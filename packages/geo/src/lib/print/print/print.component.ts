import { Component, inject, input } from '@angular/core';

import { SecureImagePipe } from '@igo2/common/image';

import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

import { IgoMap } from '../../map/shared/map';
import { PrintFormComponent } from '../print-form/print-form.component';
import { PrintOptions } from '../shared/print.interface';
import { PrintService } from '../shared/print.service';
import {
  PrintLegendPosition,
  PrintOrientation,
  PrintOutputFormat,
  PrintPaperFormat,
  PrintResolution,
  PrintSaveImageFormat
} from '../shared/print.type';

@Component({
  selector: 'igo-print',
  templateUrl: './print.component.html',
  imports: [PrintFormComponent],
  providers: [SecureImagePipe]
})
export class PrintComponent {
  private printService = inject(PrintService);

  public disabled$ = new BehaviorSubject(false);

  readonly map = input<IgoMap>(undefined);
  readonly outputFormat = input<PrintOutputFormat>(undefined);
  readonly paperFormat = input<PrintPaperFormat>(undefined);
  readonly orientation = input<PrintOrientation>(undefined);
  readonly imageFormat = input<PrintSaveImageFormat>(undefined);
  readonly legendPosition = input<PrintLegendPosition>(undefined);
  readonly resolution = input<PrintResolution>(undefined);

  handleFormSubmit(data: PrintOptions) {
    this.disabled$.next(true);

    if (data.isPrintService === true) {
      this.printService
        .print(this.map(), data)
        .pipe(take(1))
        .subscribe(() => {
          this.disabled$.next(false);
        });
    } else {
      let nbFileToProcess = 1;

      if (data.showLegend) {
        nbFileToProcess++;
      }
      if (data.imageFormat.toLowerCase() === 'tiff') {
        nbFileToProcess++;
      }

      if (data.legendPosition === 'newpage') {
        nbFileToProcess++;
      }

      this.printService.defineNbFileToProcess(nbFileToProcess);

      this.printService
        .downloadMapImage(
          this.map(),
          data.resolution,
          data.imageFormat,
          data.showProjection,
          data.showScale,
          data.title,
          data.subtitle,
          data.comment,
          data.doZipFile,
          data.legendPosition,
          data.showNorthArrow
        )
        .pipe(take(1))
        .subscribe(() => {
          this.disabled$.next(false);
        });
    }
  }
}
