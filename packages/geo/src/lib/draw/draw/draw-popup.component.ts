import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { LanguageService } from '@igo2/core';

@Component({
    selector: 'igo-draw-popup-component',
    templateUrl: './draw-popup.component.html',
    styleUrls: ['./draw-popup.component.scss'],
  })
  export class DrawPopupComponent {
    public title: string;
    public message: string;
    onOk$: BehaviorSubject<string> = new BehaviorSubject('');
    constructor(
      private languageService: LanguageService,
      public dialog: MatDialogRef<DrawPopupComponent>
      ) {
        this.title = this.languageService.translate.instant('igo.geo.draw.labels');
        this.message = this.languageService.translate.instant('igo.geo.draw.dialogInstruction');
     }
  }
