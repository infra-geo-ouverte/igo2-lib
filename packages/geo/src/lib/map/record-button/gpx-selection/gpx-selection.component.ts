import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogService } from '@igo2/common';
import { LanguageService } from '@igo2/core';

@Component({
  selector: 'igo-gpx-selection',
  templateUrl: './gpx-selection.component.html',
  styleUrls: ['./gpx-selection.component.scss']
})
export class GpxSelectionComponent {

  gpxType: string = 'track';

  constructor(private dialogRef: MatDialogRef<GpxSelectionComponent>,
              private languageService: LanguageService,
              private confirmDialogService: ConfirmDialogService) { }

  onNoClick(): void {
    this.confirmDialogService.open(this.languageService.translate.instant(
      'igo.geo.record-prompts.confirmNotDownloadGpx'
    )).subscribe((res) => {
      if(res === true) {
        this.dialogRef.close('noDownload');
      }
    });
  }

}
