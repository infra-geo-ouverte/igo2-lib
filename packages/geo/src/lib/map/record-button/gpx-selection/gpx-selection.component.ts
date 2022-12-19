import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { LanguageService } from '@igo2/core';

@Component({
  selector: 'igo-gpx-selection',
  templateUrl: './gpx-selection.component.html',
  styleUrls: ['./gpx-selection.component.scss']
})
export class GpxSelectionComponent {

  gpxType: string = 'track';

  constructor(private dialogRef: MatDialogRef<GpxSelectionComponent>,
              private languageService: LanguageService) { }

  onNoClick(): void {
    if(confirm(this.languageService.translate.instant(
      'igo.geo.record-prompts.confirmNotDownloadGpx'
    ))){
      this.dialogRef.close();
    }
  }

}
