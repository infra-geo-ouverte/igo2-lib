import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'igo-draw-popup-component',
    templateUrl: './draw-popup.component.html',
    styleUrls: ['./draw-popup.component.scss'],
  })
  export class DrawPopupComponent {
    public title: string;
    public message: string;
    onOk$: BehaviorSubject<string> = new BehaviorSubject('');
    constructor(public dialog: MatDialogRef<DrawPopupComponent>) {
        this.title = 'Label';
        this.message = 'Veuillez entrer le label';
     }
  }
