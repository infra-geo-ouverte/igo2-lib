import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'drawer-popup-component',
    templateUrl: './drawer-popup.component.html',
    styleUrls: ['./drawer-popup.component.scss'],
  })
  export class DrawerPopupComponent {
  
    public title: string;
    public message: string;
    onOk$: BehaviorSubject<string> = new BehaviorSubject('');
    constructor(public dialog: MatDialogRef<DrawerPopupComponent>) {
        this.title = 'Label';
        this.message = 'Veuillez entrer le label';
     }
  }